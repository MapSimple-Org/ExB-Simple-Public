/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  css,
  type DataSource,
  type FeatureLayerDataSource,
  utils as coreUtils,
  RecordSetChangeType,
  DataRecordSetChangeMessage,
  type FeatureLayerQueryParams,
  MessageManager,
  type ImmutableArray,
  DataSourceManager,
  Immutable,
  type ImmutableObject,
  type IntlShape
} from 'jimu-core'
import defaultMessages from '../translations/default'
import { Alert, Button, Checkbox, Label } from 'jimu-ui'
import { round, cloneDeep } from 'lodash-es'
import type Polyline from 'esri/geometry/Polyline'
import type { IFieldInfo } from '@esri/arcgis-rest-feature-service'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import {
  type FieldInfo,
  type LrsLayer,
  type RouteInfo,
  type EventInfo,
  type NetworkInfo,
  type AddEventRequest,
  type LrsRecord,
  type LrsApplyEditsEditsParam,
  type CopiedAttributes,
  type AttributeSet,
  LrsApplyEdits,
  AttributeTable,
  CopyAttributeTool,
  QueryPolylineOnRoute,
  QueryRouteMeasures,
  isDefined,
  getDateToUTC,
  isDate,
  isNumber,
  validateField,
  validateRangeDomain,
  queryAllRoutesByLineId,
  getRouteFromEndMeasures,
  getDateWithoutTZOffset,
  LockAction,
  type LrsLocksInfo,
  tryReleaseLockOnDefault,
  LockManagerComponent,
  type AcquireLockResponse,
  getIntialLocksInfo,
  getUUID,
  useVmsManager,
  useEditSession,
  type ConcurrenciesResponse,
  type LrsAttributesInfo,
  getDateWithRouteTime
} from 'widgets/shared-code/lrs'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import type { JimuMapView } from 'jimu-arcgis'
import { validateContingencyConstraints } from '../../../../../shared-code/lib/lrs/utilities/contingent-values-utils'

export interface AddMultipleLineEventsAttributesProps {
  intl: IntlShape
  widgetId: string
  networkDS: DataSource
  network: ImmutableObject<NetworkInfo>
  eventLayers: ImmutableArray<LrsLayer>
  routeInfo: RouteInfo
  eventInfo: EventInfo
  attributeSet: AttributeSet
  reset: boolean
  isReady: boolean
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  conflictPreventionEnabled: boolean
  onNavBack: (reset: boolean, concurrenciesFound: boolean, addToDominantRouteIsChecked: boolean) => void
  hasConcurrencies: boolean
  addToDominantRoute: boolean
  concurrenciesResponse?: ConcurrenciesResponse
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .add-multiple-line-events-edit-attributes__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .add-multiple-line-event-edit-attributes__toast-container {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      height: 100%;
    }
    .add-multiple-line-event-edit-attributes__toast {
      position: relative;
      top: 4%;
    }
    .add-multiple-line-events-edit-attributes__action {
      height: auto;
    }
    .add-multiline-attributes-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

let fieldGroups: any = []

export function AddMultipleLineEventsAttributes (props: AddMultipleLineEventsAttributesProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    widgetId,
    networkDS,
    network,
    eventLayers,
    routeInfo,
    eventInfo,
    attributeSet,
    reset,
    isReady,
    jimuMapView,
    hoverGraphic,
    conflictPreventionEnabled,
    onNavBack,
    hasConcurrencies,
    addToDominantRoute,
    concurrenciesResponse
  } = props
  const [attributeSetDataSources, setAttributeSetDataSources] = React.useState<DataSource[]>([])
  const [attributeSetFieldInfos, setAttributeSetFieldInfos] = React.useState<FieldInfo[][]>([])
  const [attributeSetLayers, setAttributeSetLayers] = React.useState<LrsLayer[]>([])
  const [attributeSetChecked, setAttributeSetChecked] = React.useState<boolean[]>([])
  const [toastOpen, setToastOpen] = React.useState<boolean>(false)
  const [toastMsgType, setToastMsgType] = React.useState<AlertType>()
  const [toastMsg, setToastMsg] = React.useState<string>('')
  const [hasErrors, setHasErrors] = React.useState<boolean>(false)
  const [hasContingentErrors, setHasContingentErrors] = React.useState<boolean>(false)
  const [hasNoEventChecked, setHasNoEventChecked] = React.useState<boolean>(false)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>(getIntialLocksInfo())
  const [isSelectAllChecked, setIsSelectAllChecked] = React.useState<boolean>(true)
  const [navBackWithReset, setNavBackWithReset] = React.useState<boolean>(false)
  const { sessionId, startEditSession, addEdit } = useVmsManager()
  const { supportsEditSession } = useEditSession()

  React.useEffect(() => {
    if (reset) {
      initalizeAttributeSet(eventLayers)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  React.useEffect(() => {
    if (isDefined(attributeSet) && isDefined(eventLayers) && isReady) {
      initalizeAttributeSet(eventLayers)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeSet, eventLayers, isReady])

  // Set lock info
  React.useEffect(() => {
    buildLockInfo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, network, eventLayers, routeInfo])

  const buildLockInfo = (action: LockAction = LockAction.None, routeInfo?: RouteInfo, checkedArray?: boolean[]) => {
    if (conflictPreventionEnabled) {
      const updatedLockInfo = { ...lockInfo }
      if (isDefined(network)) {
        updatedLockInfo.networkId = [network.lrsNetworkId]
      }
      if (isDefined(eventLayers)) {
        const checked = isDefined(checkedArray) ? checkedArray : attributeSetChecked

        if (isDefined(concurrenciesResponse)) {
          updatedLockInfo.isLine = []
          updatedLockInfo.routeOrLineId = []
          updatedLockInfo.eventServiceLayerIds = []

          attributeSetLayers.forEach((layer, index) => {
            if (checked[index]) {
              concurrenciesResponse?.locations?.forEach((location) => {
                location?.concurrencies?.forEach((concurrency) => {
                  if (concurrency.isChosen) {
                    updatedLockInfo.isLine.push(network.supportsLines)
                    updatedLockInfo.routeOrLineId.push(network.supportsLines ? concurrency.lineId : concurrency.routeId)
                    updatedLockInfo.eventServiceLayerIds.push(layer.serviceId)
                  }
                })
              })
            }
          })
        } else {
          const serviceLayerIds = []
          attributeSetLayers.forEach((layer, index) => {
            if (checked[index]) {
              serviceLayerIds.push(layer.serviceId)
            }
          })
          updatedLockInfo.eventServiceLayerIds = serviceLayerIds
        }
      }
      if (isDefined(routeInfo)) {
        updatedLockInfo.routeInfo = routeInfo
        if (!isDefined(concurrenciesResponse)) {
          updatedLockInfo.routeOrLineId = []
        }
      }
      updatedLockInfo.lockAction = action
      setLockInfo(updatedLockInfo)
    }
  }

  const initalizeAttributeSet = (lrsEvents: ImmutableArray<LrsLayer>) => {
    if (isDefined(lrsEvents)) {
      const dataSourceArray: DataSource[] = []
      const fieldInfoArray: FieldInfo[][] = []
      const eventLayersArray: LrsLayer[] = []
      const checkedArray: boolean[] = []
      lrsEvents.forEach((layer) => {
        const eventDS = getDataSource(layer)
        const fieldInfos = getInitialAttributeValues(layer, eventDS)
        dataSourceArray.push(eventDS)
        fieldInfoArray.push(fieldInfos)
        eventLayersArray.push(layer.asMutable({ deep: true }))
        checkedArray.push(true)
      })
      setAttributeSetDataSources(dataSourceArray)
      setAttributeSetFieldInfos(fieldInfoArray)
      setAttributeSetLayers(eventLayersArray)
      setHasNoEventChecked(eventLayersArray.length === 0)
      setAttributeSetChecked(checkedArray)
      buildLockInfo(LockAction.None, routeInfo, checkedArray)
      setIsSelectAllChecked(true)
    }
  }

  const getDataSource = (eventLayer: ImmutableObject<LrsLayer>): DataSource => {
    if (isDefined(eventLayer) && isDefined(eventLayer.useDataSource)) {
      const dsManager = DataSourceManager.getInstance()
      const eventDS = dsManager.getDataSource(eventLayer.useDataSource.dataSourceId)
      if (isDefined(eventDS)) {
        return eventDS
      }
    }
  }

  const getInitialAttributeValues = (eventLayer: ImmutableObject<LrsLayer>, eventDS: DataSource): FieldInfo[] => {
    const fieldInfos: FieldInfo[] = []
    if (isDefined(eventDS)) {
      const featureLayerDS = eventDS as FeatureLayerDataSource
      const layer = featureLayerDS?.layer
      const featureLayerFields = layer.fields
      const attributeSetConfig = attributeSet.layers.find(layer => layer.layerId === eventLayer.serviceId)
      if (isDefined(attributeSetConfig)) {
        attributeSetConfig.fields.forEach((field) => {
          const featureLayerField = featureLayerFields.find(item => item.name === field.name)
          if (featureLayerField) {
            let defaultValue
            if (field.value !== '') {
              if (isDate(featureLayerField.type)) {
                defaultValue = isDefined(field.value) ? new Date(field.value) : null
              } else if (isNumber(featureLayerField.type)) {
                defaultValue = Number(field.value)
              } else {
                defaultValue = field.value
              }
            }
            const info: FieldInfo = {
              index: fieldInfos.length,
              name: featureLayerField.name,
              alias: featureLayerField.alias,
              type: featureLayerField.type,
              hasDomain: isDefined(featureLayerField.domain),
              value: defaultValue,
              error: '',
              nullable: featureLayerField.nullable,
              default: typeof defaultValue === 'number' ? Number(defaultValue).toString() : defaultValue,
              length: featureLayerField.length,
              editable: featureLayerField.editable
            }
            fieldInfos.push(info)
          }
        })
      }
    }
    return fieldInfos
  }

  const errorsPresent = (values: FieldInfo[]): boolean => {
    return values.findIndex(value => value.error.length > 0) > -1
  }

  const handleUpdateItem = (value: any, error: string, index: number, tableIndex: number) => {
    const newAttributeSetInfos = cloneDeep(attributeSetFieldInfos)
    const newFieldInfos = cloneDeep(newAttributeSetInfos[tableIndex])
    newFieldInfos[index].value = value
    newFieldInfos[index].error = error
    newAttributeSetInfos[tableIndex] = newFieldInfos
    setAttributeSetFieldInfos(newAttributeSetInfos)
    setHasErrors(errorsPresent(newAttributeSetInfos[tableIndex]))
  }

  const handleUpdateAll = (values: FieldInfo[], tableIndex: number) => {
    const newAttributeSetInfos = cloneDeep(attributeSetFieldInfos)
    newAttributeSetInfos[tableIndex] = values
    setAttributeSetFieldInfos(newAttributeSetInfos)
    setHasErrors(errorsPresent(values))
  }

  const handleFieldGrpUpdated = (values: any, tableIndex: number) => {
    const newFieldGroups = cloneDeep(fieldGroups)
    newFieldGroups[tableIndex] = values
    fieldGroups = newFieldGroups
    if (!fieldGroups[tableIndex] || (fieldGroups[tableIndex]?.length === 0)) {
      setHasContingentErrors(false)
    }
  }

  const handleAttributesCopied = (copiedValues: CopiedAttributes[]) => {
    const newAttributeSetInfos = cloneDeep(attributeSetFieldInfos)
    copiedValues.forEach((layer) => {
      const eventLayerIndex = eventLayers.findIndex(eventLayer => eventLayer.serviceId.toString() === layer.layerId)
      if (eventLayerIndex > -1) {
        const newFieldInfos = cloneDeep(newAttributeSetInfos[eventLayerIndex])
        layer.fieldValuePair.forEach((field) => {
          const fieldInfoIndex = newFieldInfos.findIndex(info => info.name === field.name)
          if (fieldInfoIndex > -1) {
            let value = field.value
            if (isDate(newFieldInfos[fieldInfoIndex].type)) {
              value = isDefined(field.value) ? new Date(field.value) : null
            }
            newFieldInfos[fieldInfoIndex].value = value
          }
        })
        newAttributeSetInfos[eventLayerIndex] = newFieldInfos
      }
    })
    setAttributeSetFieldInfos(newAttributeSetInfos)
  }

  const handleAttributeTableChecked = (value: boolean, index: number) => {
    const updatedAttributeSetChecked = attributeSetChecked
    updatedAttributeSetChecked[index] = value
    setAttributeSetChecked(updatedAttributeSetChecked)
    buildLockInfo(LockAction.None, routeInfo, updatedAttributeSetChecked)

    if (updatedAttributeSetChecked.every(value => !value)) {
      setHasNoEventChecked(true)
    } else {
      setHasNoEventChecked(false)
    }
  }

  const navBack = (reset: boolean, concurrenciesFound: boolean, addToDominantRouteIsChecked: boolean) => {
    if (conflictPreventionEnabled) {
      setNavBackWithReset(false)
      buildLockInfo(LockAction.Clear)
    } else {
      onNavBack(reset, reset ? false : concurrenciesFound, addToDominantRouteIsChecked)
    }
  }

  const areNonLrsFieldsValid = (): boolean => {
    const attributeSetInfos = cloneDeep(attributeSetFieldInfos)
    let hasErrors = false

    // Check all fields for errors. We will display the last error message we encounter.
    attributeSetInfos.forEach((fieldInfo, index) => {
      if (attributeSetChecked[index]) {
        const fieldInfoCopy = cloneDeep(fieldInfo)
        fieldInfoCopy.forEach((field, fieldIndex) => {
          let result
          if (field.hasDomain) {
            result = validateRangeDomain(field.value, field.name, attributeSetDataSources[index])
          } else if (isDate(field.type)) {
            result = validateField(field.value, field.name, attributeSetDataSources[index])
          } else {
            result = validateField(field.value, field.name, attributeSetDataSources[index])
          }
          if (isDefined(fieldGroups[index])) {
            const errors = validateContingencyConstraints(field.value, '', fieldIndex, fieldInfo, fieldGroups[index])
            if (errors?.length > 0) {
              let fieldGroupFields = []
              errors.forEach((group) => {
                const fields = group?.fieldGroup?.fields
                fieldGroupFields.push(fields)
              })
              fieldGroupFields = fieldGroupFields.flat()
              if (fieldGroupFields.includes(field.name)) {
                setHasContingentErrors(true)
                setHasErrors(true)
                result = {
                  hasError: true,
                  message: 'contingentValueError'
                }
              }
            }
          }
          if (result.hasError) {
            let toastErrorMsg
            if (result.message === 'contingentValueError') {
              const fieldGroupNames = []
              fieldGroups[index].forEach((group) => {
                fieldGroupNames.push(group.name)
              })
              let alertMsg = getI18nMessage('invalidContingentValues')
              alertMsg = alertMsg.replace('{groupNames}', fieldGroupNames.join(','))
              toastErrorMsg = alertMsg
            } else {
              const fieldName = attributeSetLayers[index].useFieldAlias ? field.alias : field.name
              toastErrorMsg = getI18nMessage('attributeError', { fieldValue: fieldName, message: getI18nMessage(result.message) })
            }
            setToastMsgType('error')
            setToastMsg(toastErrorMsg)
            setToastOpen(true)
            setTimeout(() => {
              setToastOpen(false)
            }, 5000)
            hasErrors = true
            field.error = getI18nMessage(result.message)
            attributeSetInfos[index] = fieldInfoCopy
          }
        })
      }
    })

    if (hasErrors) {
      setAttributeSetFieldInfos(attributeSetInfos)
    }

    return hasErrors
  }


  const publishMessage = () => {
    attributeSetDataSources.forEach(async (eventDS) => {
      const featureDS = eventDS as FeatureLayerDataSource
      const popupInfo = featureDS.getPopupInfo()
      const layerDefinition = featureDS.getLayerDefinition()
      const getDefaultFieldInfos = () =>
        [
          { fieldName: layerDefinition?.objectIdField ?? 'objectid', label: 'OBJECTID', tooltip: '', visible: true }
        ] as IFieldInfo[]
      const fieldInfos = ((fieldInfos) => (fieldInfos.length ? fieldInfos : getDefaultFieldInfos()))(
        (popupInfo?.fieldInfos || []).filter((i) => i.visible)
      )
      const mergedQueryParams = featureDS.mergeQueryParams(featureDS.getCurrentQueryParams() ?? {}, {
        where: '1=1',
        sqlExpression: null
      } as any)

      // compose query params for query
      const queryParams: FeatureLayerQueryParams = {
        returnGeometry: true,
        ...mergedQueryParams
      }

      // load new edits
      await featureDS.load(queryParams, { widgetId })

      // publish new records to other widgets
      const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, RecordSetChangeType.CreateUpdate, [{
        records: featureDS.getRecords(),
        fields: fieldInfos.map((fieldInfo) => fieldInfo.fieldName),
        dataSource: featureDS,
        name: featureDS.id
      }])
      MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
    })
  }

  // eslint-disable-next-line max-params
  const AddLrsApplyEditsAddsParam = async (adds: LrsRecord[], eventLayer: LrsLayer, index: number, info: LrsAttributesInfo, isConcurrency: boolean, isFromDateUTC: boolean, isToDateUTC: boolean) => {
    const indexedLrsAttrs: { [key: string]: string | number | Date } = {}

    let reverseRoutes = false
    let reverseMeasures = false
    if (eventLayer.eventInfo.canSpanRoutes) {
      if (routeInfo.routeLineOrder > routeInfo.toRouteLineOrder) {
        reverseRoutes = true
      } else if (routeInfo.routeId === routeInfo.toRouteId && routeInfo.selectedMeasure > routeInfo.selectedToMeasure) {
        reverseMeasures = true
      }
    } else {
      if (routeInfo.selectedMeasure > routeInfo.selectedToMeasure) {
        reverseMeasures = true
      }
    }

    // EventId
    const eventIdKey = eventLayer.eventInfo.eventIdFieldName
    indexedLrsAttrs[eventIdKey] = '{' + getUUID() + '}'

    // RouteId
    const routeIdKey = eventLayer.eventInfo.routeIdFieldName
    indexedLrsAttrs[routeIdKey] = info.routeId

    // FromMeasure
    const fromMeasureKey = eventLayer.eventInfo.fromMeasureFieldName
    indexedLrsAttrs[fromMeasureKey] = info.fromMeasure

    // FromDate
    const fromDateKey = eventLayer.eventInfo.fromDateFieldName
    if (!isFromDateUTC && info.fromDate) {
      // Remove timezone offset from date values, then get time in UTC.
      const date = isDefined(info.fromDate) ? getDateWithoutTZOffset(info.fromDate.valueOf(), networkDS) : null
      indexedLrsAttrs[fromDateKey] = getDateToUTC(date)
    } else {
      indexedLrsAttrs[fromDateKey] = info.fromDate
    }

    // ToDate
    const toDateKey = eventLayer.eventInfo.toDateFieldName
    if (!isToDateUTC && info.toDate) {
      // Remove timezone offset from date values, then get time in UTC.
      const date = isDefined(info.toDate) ? getDateWithoutTZOffset(info.toDate.valueOf(), networkDS) : null
      indexedLrsAttrs[toDateKey] = getDateToUTC(date)
    } else {
      indexedLrsAttrs[toDateKey] = info.toDate
    }

    // ToRouteId
    if (eventLayer.eventInfo.toRouteIdFieldName && eventLayer.eventInfo.toRouteIdFieldName.length > 0) {
      const toRouteIdKey = eventLayer.eventInfo.toRouteIdFieldName
      indexedLrsAttrs[toRouteIdKey] = info.toRouteId
      // Reverse route Ids if necessary
      if (reverseRoutes) {
        indexedLrsAttrs[routeIdKey] = info.toRouteId
        indexedLrsAttrs[toRouteIdKey] = info.routeId
      }
    }

    // ToMeasure
    if (eventLayer.eventInfo.toMeasureFieldName && eventLayer.eventInfo.toMeasureFieldName.length > 0) {
      const toMeasureKey = eventLayer.eventInfo.toMeasureFieldName
      indexedLrsAttrs[toMeasureKey] = info.toMeasure
      // Reverse route measures if necessary
      if (reverseRoutes || reverseMeasures) {
        indexedLrsAttrs[fromMeasureKey] = info.toMeasure
        indexedLrsAttrs[toMeasureKey] = info.fromMeasure
      }
    }

    // Non lrs attributes
    attributeSetFieldInfos[index].forEach((item) => {
      const key = item.name
      if (isDefined(item.value) && isDate(item.type)) {
        // Remove timezone offset from date values, then get time in UTC.
        const date = getDateWithoutTZOffset(item.value.valueOf(), networkDS)
        indexedLrsAttrs[key] = getDateToUTC(date)
      } else if (isNumber(item.type)) {
        // Convert any string values to number.
        if (!isDefined(item.value) || item.value === '' || isNaN(Number(item.value))) {
          indexedLrsAttrs[key] = null
        } else {
          indexedLrsAttrs[key] = Number(item.value)
        }
      } else {
        // Everything else: strings and null values.
        indexedLrsAttrs[key] = item.value
      }
    })

    const foundRoutes = {}
    // EventLayer doesn't support spanning routes but user can choose to span routes, so we need to create a new event for each route.
    if (!isConcurrency && !eventLayer.eventInfo.canSpanRoutes && routeInfo.routeId !== routeInfo.toRouteId) {
      const routeIdField = network.routeIdFieldSchema.jimuName
      const routeNameField = network.routeNameFieldSchema.jimuName
      const lineOrderField = network.lineOrderFieldSchema.jimuName
      const fromDateField = network.fromDateFieldSchema.jimuName

      // store all of the route features in a dictionary.  Key is routeId, value is RouteInfo object
      const results = await queryAllRoutesByLineId(routeInfo.lineId, network, networkDS)
      if (isDefined(results)) {
        await Promise.all(results.features.map((feature) => {
          const routeIdValue = feature.attributes[routeIdField]
          const newRouteInfo: RouteInfo = {
            routeId: '',
            routeName: '',
            fromMeasure: 0,
            toMeasure: 0,
            fromDate: undefined,
            toDate: undefined,
            selectedMeasure: 0,
            selectedFromDate: undefined,
            selectedToDate: undefined,
            routeLineOrder: 0,
            selectedPolyline: null
          }

          newRouteInfo.routeId = routeIdValue
          newRouteInfo.routeName = feature.attributes[routeNameField]
          newRouteInfo.routeLineOrder = feature.attributes[lineOrderField]
          newRouteInfo.fromDate = feature.attributes[fromDateField]
          newRouteInfo.selectedPolyline = feature.geometry as Polyline
          foundRoutes[routeIdValue] = newRouteInfo
          return foundRoutes
        }))
      }
      if (Object.keys(foundRoutes).length) {
        const sortedRoutesArray = Object.keys(foundRoutes).sort((a, b) => foundRoutes[a].routeLineOrder - foundRoutes[b].routeLineOrder)
        const sortedRoutesDict = Object.fromEntries(sortedRoutesArray.map((key) => [key, foundRoutes[key]]))
        const toMeasureKey = eventLayer.eventInfo.toMeasureFieldName

        for (const [key, value] of Object.entries(sortedRoutesDict)) {
          const clonedIndexedLrsAttrs = structuredClone(indexedLrsAttrs)
          const lineOrder = (value as { routeLineOrder: number }).routeLineOrder
          if (lineOrder < routeInfo.routeLineOrder) {
            continue
          }

          let addEdits = false
          let queryPolylineResult = null
          let finishProcessing = false
          let fromMeasure = NaN
          let toMeasure = NaN
          let routeId = ''
          let routeName = ''

          // find from route
          if (key === routeInfo.routeId) {
            routeId = key
            routeName = routeInfo.routeName
            fromMeasure = routeInfo.selectedMeasure
            toMeasure = routeInfo.toMeasure
            queryPolylineResult = await QueryPolylineOnRoute(networkDS, network, routeId, key, routeInfo.fromDate, fromMeasure.toString(), toMeasure.toString())

            addEdits = true
          // find intermediate routes
          } else if (lineOrder > routeInfo.routeLineOrder && lineOrder < routeInfo.toRouteLineOrder) {
            queryPolylineResult = value.selectedPolyline
            const routeEndPoints = getRouteFromEndMeasures(queryPolylineResult)
            const routeMeasures = await QueryRouteMeasures(networkDS, network, routeEndPoints, value.fromDate, key)
            fromMeasure = round(Math.min(...routeMeasures), network.measurePrecision)
            toMeasure = round(Math.max(...routeMeasures), network.measurePrecision)
            routeId = key

            addEdits = true
          // find to route
          } else if (key === routeInfo.toRouteId) {
            routeId = key
            routeName = routeInfo.toRouteName
            fromMeasure = routeInfo.toRouteFromMeasure
            toMeasure = routeInfo.selectedToMeasure
            queryPolylineResult = await QueryPolylineOnRoute(networkDS, network, key, key, routeInfo.fromDate, fromMeasure.toString(), toMeasure.toString())

            addEdits = true
            finishProcessing = true
          }
          if (addEdits) {
            clonedIndexedLrsAttrs[eventIdKey] = '{' + coreUtils.getUUID() + '}'
            clonedIndexedLrsAttrs[routeIdKey] = routeId
            clonedIndexedLrsAttrs[fromMeasureKey] = fromMeasure
            clonedIndexedLrsAttrs[toMeasureKey] = toMeasure
            if (eventLayer.eventInfo.routeNameFieldName && eventLayer.eventInfo.routeNameFieldName.length > 0) {
              const routeNameKey = eventLayer.eventInfo.routeNameFieldName
              clonedIndexedLrsAttrs[routeNameKey] = routeName
            }

            const add: LrsRecord = {
              attributes: clonedIndexedLrsAttrs,
              geometry: queryPolylineResult
            }
            adds.push(add)

            if (finishProcessing) {
              break
            }
          }
        }
      }
    } else {
      const add: LrsRecord = {
        attributes: indexedLrsAttrs
      }
      adds.push(add)
    }
  }

  const submitForm = async (locks?: LrsLocksInfo) => {
    // Validate attributes before submitting
    if (areNonLrsFieldsValid()) {
      return
    }

    const eventDS = attributeSetDataSources[0] as FeatureLayerDataSource
    let gdbVersion = eventDS.getGDBVersion()
    if (!gdbVersion) {
      gdbVersion = ''
    }

    const addEventRequest: AddEventRequest = {
      edits: []
    }
    await Promise.all(attributeSetLayers.map(async (eventLayer, index) => {
      if (attributeSetChecked[index]) {
        if (isDefined(eventLayer)) {
          const adds: LrsRecord[] = []

          if (isDefined(concurrenciesResponse) && concurrenciesResponse.locations.length > 0) {
            for (const location of concurrenciesResponse.locations) {
              if (location.concurrencies.length === 0) {
                const info: LrsAttributesInfo = {
                  routeId: location.routeId,
                  fromMeasure: location.fromMeasure,
                  toMeasure: location.toMeasure,
                  fromDate: getDateWithRouteTime(routeInfo.selectedFromDate, routeInfo.fromDate),
                  toDate: getDateWithRouteTime(routeInfo.selectedToDate, routeInfo.toDate)
                }
                await AddLrsApplyEditsAddsParam(adds, eventLayer, index, info, true, false, false)
              } else {
                for (const concurrency of location.concurrencies) {
                  if (concurrency.isChosen) {
                    const info: LrsAttributesInfo = {
                      routeId: concurrency.routeId,
                      fromMeasure: concurrency.fromMeasure,
                      toMeasure: concurrency.toMeasure,
                      fromDate: concurrency.fromDate,
                      toDate: concurrency.toDate
                    }
                    const isFromDateUTC: boolean = !isDefined(routeInfo.selectedFromDate) || concurrency.fromDate.valueOf() !== routeInfo.selectedFromDate.valueOf()
                    const isToDateUTC: boolean = !isDefined(routeInfo.selectedToDate) || concurrency.toDate.valueOf() !== routeInfo.selectedToDate.valueOf()

                    await AddLrsApplyEditsAddsParam(adds, eventLayer, index, info, true, isFromDateUTC, isToDateUTC)
                  }
                }
              }
            }
          } else {
            const info: LrsAttributesInfo = {
              routeId: routeInfo.routeId,
              fromMeasure: routeInfo.selectedMeasure,
              toMeasure: routeInfo.selectedToMeasure,
              fromDate: getDateWithRouteTime(routeInfo.selectedFromDate, routeInfo.fromDate),
              toDate: getDateWithRouteTime(routeInfo.selectedToDate, routeInfo.toDate)
            }
            await AddLrsApplyEditsAddsParam(adds, eventLayer, index, info, false, false, false)
          }

          const edits: LrsApplyEditsEditsParam = {
            id: eventLayer.serviceId,
            adds: adds,
            allowMerge: eventInfo.mergeCoincident,
            retireMeasureOverlap: eventInfo.retireOverlapping,
            retireByEventId: false
          }
          addEventRequest.edits.push(edits)
        }
      }
      return addEventRequest
    }))

    if (supportsEditSession) {
      const startEdit = await startEditSession()
      if (!startEdit.success) {
        setToastMsgType('error')
        setToastMsg(startEdit.error)
        setToastOpen(true)
        setTimeout(() => {
          setToastOpen(false)
        }, 5000)
        return
      }
    }

    await LrsApplyEdits(eventDS, Immutable(attributeSetLayers[0]), sessionId, addEventRequest, null, null)

      .then(result => {
        if (result.success) {
          // Edit went through, show message and publish results to other widgets.
          if (supportsEditSession) {
            addEdit(result, getI18nMessage('addMultipleLineEvents'))
          }
          setToastMsgType('success')
          setToastMsg(getI18nMessage('eventCreated'))
          setToastOpen(true)
          publishMessage()
          setTimeout(async () => {
            setToastOpen(false)
            if (conflictPreventionEnabled) {
              setNavBackWithReset(true)
              await tryReleaseLockOnDefault(networkDS as FeatureLayerDataSource, locks)
              const updateLockInfo = { ...locks, lockAction: LockAction.Clear }
              setLockInfo(updateLockInfo)
            } else {
              navBack(true, false, addToDominantRoute)
            }
          }, 5000)
        } else {
          // Failed on server, show error message.
          setToastMsgType('error')
          setToastMsg(`${result.message} \n ${result.details}`)
          setToastOpen(true)
          setTimeout(() => {
            setToastOpen(false)
          }, 5000)
        }
      })
  }

  const onSubmitClicked = () => {
    if (conflictPreventionEnabled) {
      buildLockInfo(LockAction.QueryAndAcquire, routeInfo, attributeSetChecked)
    } else {
      submitForm()
    }
  }

  const handleQueryLocksCompleted = (lockInfo: LrsLocksInfo, acquiredInfo: AcquireLockResponse, success: boolean) => {
    setLockInfo(lockInfo)
    if (success) {
      submitForm(lockInfo)
    }
  }

  const handleMessageClear = () => {
    const updatedLockInfos = { ...lockInfo, lockAction: LockAction.None }
    setLockInfo(updatedLockInfos)
    onNavBack(navBackWithReset, navBackWithReset ? false : hasConcurrencies, addToDominantRoute)
    setNavBackWithReset(false)
  }

  const handleSelectAllChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    const updatedAttributeSetChecked = attributeSetChecked
    updatedAttributeSetChecked.forEach((value, index) => {
      updatedAttributeSetChecked[index] = checked
    })
    setAttributeSetChecked(updatedAttributeSetChecked)
    updateSelectAll(updatedAttributeSetChecked)
    if (updatedAttributeSetChecked.every(value => !value)) {
      setHasNoEventChecked(true)
    } else {
      setHasNoEventChecked(false)
    }
  }

  const updateSelectAll = (attributeSetCheckedStatus: boolean[]) => {
    if (attributeSetCheckedStatus.every(value => value)) {
      setIsSelectAllChecked(true)
    } else if (attributeSetCheckedStatus.every(value => !value)) {
      setIsSelectAllChecked(false)
    } else {
      setIsSelectAllChecked(false)
    }
  }

  return (
    <div className='h-100' css={getFormStyle()}>
      <div className='add-multiple-line-events-edit-attributes__content'>
        {conflictPreventionEnabled && (
          <LockManagerComponent
            intl={intl}
            featureDS={networkDS as FeatureLayerDataSource}
            lockInfo={lockInfo}
            showAlert={true}
            networkName={network?.datasetName}
            conflictPreventionEnabled={conflictPreventionEnabled}
            onQueryAndAcquireComplete={handleQueryLocksCompleted}
            onMessageClear={handleMessageClear}
          />
        )}
        <div className='attribute-picker d-flex w-100 px-3'>
          <div className='mr-auto'>
            <Label size="sm" className="text-truncate w-100 pt-2 title3" centric check style={{ textOverflow: 'ellipsis'}}>
              <Checkbox
                checked={isSelectAllChecked}
                className="mr-2"
                onChange={handleSelectAllChecked}/>
              {getI18nMessage('selectAllLabel')}
            </Label>
            </div>
          <div className='ml-auto'>
            <CopyAttributeTool
              disabled={false}
              networkDs={networkDS}
              eventDataSources={attributeSetDataSources}
              jimuMapView={jimuMapView}
              hoverGraphic={hoverGraphic}
              onAttributesCopied={handleAttributesCopied}
            />
          </div>
        </div>
        {hasContingentErrors &&
          <Alert tabIndex={0} className={'w-100 userInfo'}
          onClose={function noRefCheck () { setHasContingentErrors(false) }}
          open={hasContingentErrors}
          text={toastMsg}
          type={'warning'}
          closable
          withIcon
          />
        }
        {isDefined(attributeSetFieldInfos) && (
          attributeSetFieldInfos.map((fieldInfos, index) => {
            return (
              <AttributeTable
                key={index}
                tableIndex={index}
                eventDS={attributeSetDataSources[index]}
                eventLayer={Immutable(attributeSetLayers[index])}
                fieldInfos={fieldInfos}
                useAlias={true}
                collapable={true}
                isExpanded={attributeSetChecked[index]}
                onItemChecked={handleAttributeTableChecked}
                onUpdateItem={handleUpdateItem}
                onFieldGrpUpdated={handleFieldGrpUpdated}
                onUpdateAll={handleUpdateAll}/>
            )
          })
        )}
        {toastOpen && (
          <div className='add-multiple-line-event-edit-attributes__toast-container w-100 p-3'>
            <Alert
              className='add-multiple-line-event-edit-attributes__toast w-100'
              type={toastMsgType}
              text={toastMsg}
              closable={true}
              withIcon={true}
              open={toastOpen}
              onClose={() => { setToastOpen(false) }}
            />
          </div>
        )}
      </div>
      <div className='add-multiline-attributes-footer w-100'>
        <div className='add-multiple-line-events-edit-attributes__action w-100 d-flex'>
          <div className='mt-auto mr-auto'>
            <Button
              aria-label={getI18nMessage('backLabel')}
              size='sm'
              type='secondary'
              onClick={() => { navBack(false, hasConcurrencies, addToDominantRoute) }}
            >
                {getI18nMessage('backLabel')}
            </Button>
          </div>
          <div className='mt-auto ml-auto'>
            <Button
              type='primary'
              className='active'
              aria-label={getI18nMessage('saveLabel')}
              size='sm'
              disabled={hasErrors || hasNoEventChecked || hasContingentErrors}
              onClick={onSubmitClicked}
            >
                {getI18nMessage('saveLabel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}