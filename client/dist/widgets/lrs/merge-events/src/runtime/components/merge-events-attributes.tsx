/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  css,
  type ImmutableObject,
  type DataSource,
  type FeatureLayerDataSource,
  RecordSetChangeType,
  DataRecordSetChangeMessage,
  type FeatureLayerQueryParams,
  MessageManager,
  type IntlShape
} from 'jimu-core'
import {
  AttributeTable,
  type FieldInfo,
  type LrsLayer,
  type RouteInfo,
  getDateToUTC,
  isDate,
  isDefined,
  isNumber,
  validateField,
  validateRangeDomain,
  queryEventsByEventObjectIds,
  getGeometryGraphic,
  getSimpleLineGraphic,
  flash,
  formatMessage,
  getDateWithoutTZOffset,
  LockManagerComponent,
  tryReleaseLockOnDefault,
  type LrsLocksInfo,
  LockAction,
  type AcquireLockResponse,
  type MergeEventsRequest,
  LrsApplyEdits,
  useVmsManager,
  useEditSession,
  getDateWithoutTime,
  getDateWithRouteTime,
  queryAllRoutesByLineIdAndFromDate,
  IsRouteReversed
} from 'widgets/shared-code/lrs'
import { loadArcGISJSAPIModules, type JimuMapView, type JimuFeatureLayerView, type JimuSceneLayerView } from 'jimu-arcgis'
import defaultMessages from '../translations/default'
import { areEventsOnSameLineOrRoute } from '../utils'
import { cloneDeep, round } from 'lodash-es'
import type { IFieldInfo } from '@esri/arcgis-rest-feature-service'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { colorCyan } from '../constants'
import type Polyline from 'esri/geometry/Polyline'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import { useImperativeHandle } from 'react'
import { validateContingencyConstraints } from '../../../../../shared-code/lib/lrs/utilities/contingent-values-utils'
import { Alert } from 'jimu-ui'

export interface MergeEventsAttributesProps {
  widgetId: string
  jimuMapView: JimuMapView
  network: ImmutableObject<LrsLayer>
  eventDS: DataSource
  networkDS: DataSource
  eventLayer: ImmutableObject<LrsLayer>
  networkLayer: ImmutableObject<LrsLayer>
  routeInfo: RouteInfo
  reset: boolean
  eventFeatures: any[]
  preservedEventIndex: number
  flashGraphic: GraphicsLayer
  onSubmit: () => void
  toastMsgType: AlertType
  onUpdateToastMsgType: (type: AlertType) => void
  onUpdateToastMsg: (msg: string) => void
  onUpdateToastOpen: (open: boolean) => void
  onUpdateStopQuery: (stopQuery: boolean) => void
  onValidationChanged: (isValid: boolean) => void
  intl: IntlShape
  lockAquired: boolean
  conflictPreventionEnabled: boolean
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .merge-events-edit-attributes__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .merge-events-edit-attributes__action {
      height: 100%;
    }
  `
}

let fieldGroups = []
export const MergeEventsAttributes = React.forwardRef((props: MergeEventsAttributesProps, ref) => {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    widgetId,
    jimuMapView,
    network,
    eventDS,
    networkDS,
    eventLayer,
    networkLayer,
    routeInfo,
    reset,
    eventFeatures,
    preservedEventIndex,
    flashGraphic,
    onSubmit,
    toastMsgType,
    onUpdateToastMsgType,
    onUpdateToastMsg,
    onUpdateToastOpen,
    onUpdateStopQuery,
    onValidationChanged,
    intl,
    lockAquired,
    conflictPreventionEnabled
  } = props
  const [fieldInfos, setFieldInfos] = React.useState<FieldInfo[]>()
  const [hasErrors, setHasErrors] = React.useState<boolean>(false)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>()
  const [toastMsgInvalidContingentVal, setToastMsgInvalidContingentVal] = React.useState<string>()
  const [hasContingentErrors, setHasContingentErrors] = React.useState<boolean>(false)
  const { sessionId, startEditSession, addEdit} = useVmsManager()
  const { supportsEditSession } = useEditSession()

  useImperativeHandle(ref, () => ({
    onSubmitClicked
  }))

  React.useEffect(() => {
    if (preservedEventIndex > -1 && eventFeatures.length > 0) {
      setFieldInfosWithEventAttributeValues()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preservedEventIndex])

  React.useEffect(() => {
    if (reset || eventFeatures.length === 0) {
      setFieldInfos(getInitialAttributeValues())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, eventFeatures])

  React.useEffect(() => {
    setFieldInfos(getInitialAttributeValues())
    setHasContingentErrors(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDS, eventLayer])

  // Set lock info
  React.useEffect(() => {
    if (conflictPreventionEnabled) {
      const updatedLockInfo = { ...lockInfo }
      if (isDefined(network)) {
        updatedLockInfo.networkId = [network.networkInfo.lrsNetworkId]
      }
      if (isDefined(eventLayer)) {
        updatedLockInfo.eventServiceLayerIds = [eventLayer.serviceId]
      }
      if (isDefined(routeInfo)) {
        updatedLockInfo.routeInfo = routeInfo
        updatedLockInfo.routeOrLineId = []
      }
      setLockInfo(updatedLockInfo)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, network, eventLayer, routeInfo])

  const setFieldInfosWithEventAttributeValues = () => {
    const fieldInfos: FieldInfo[] = []
    if (isDefined(eventLayer) && isDefined(eventDS) && isDefined(eventLayer.eventInfo) && isDefined(eventLayer.eventInfo.attributeFields)) {
      // Get basic field info for non lrs fields and set default values.
      const featureLayerDS = eventDS as FeatureLayerDataSource

      // Get basic field info for non lrs fields and set default values.
      const layer = featureLayerDS?.layer
      const fields = layer.fields
      eventLayer.eventInfo.attributeFields.forEach((fieldInfo) => {
        if (fieldInfo.enabled) {
          const field = fields.find(l => l.name === fieldInfo.field.name)
          if (field && field.editable) {
            let defaultValue
            let value = eventFeatures[preservedEventIndex].attributes[field.name]
            if (isDate(field.type) && isDefined(value)) {
              value = new Date(value)
            } else {
              if (isDate(field.type)) {
                defaultValue = isDefined(field.defaultValue) ? new Date(field.defaultValue) : null
              } else {
                defaultValue = field.defaultValue
              }
            }
            const info: FieldInfo = {
              index: fieldInfos.length,
              name: field.name,
              alias: field.alias,
              type: field.type,
              hasDomain: isDefined(field.domain),
              value: value,
              error: '',
              nullable: field.nullable,
              default: typeof defaultValue === 'number' ? Number(defaultValue).toString() : defaultValue,
              length: field.length,
              editable: fieldInfo.editable
            }
            fieldInfos.push(info)
          }
        }
      })
    }
    setTimeout(() => {
      setFieldInfos(fieldInfos)
    }, 500)
  }

  const getInitialAttributeValues = (): FieldInfo[] => {
    const fieldInfos: FieldInfo[] = []
    if (isDefined(eventLayer) && isDefined(eventDS) && isDefined(eventLayer.eventInfo) && isDefined(eventLayer.eventInfo.attributeFields)) {
      // Get basic field info for non lrs fields and set default values.
      const featureLayerDS = eventDS as FeatureLayerDataSource
      const layer = featureLayerDS?.layer
      const fields = layer.fields
      eventLayer.eventInfo.attributeFields.forEach((fieldInfo) => {
        if (fieldInfo.enabled) {
          const layer = fields.find(l => l.name === fieldInfo.field.name)
          if (layer) {
            let defaultValue
            if (isDate(layer.type)) {
              defaultValue = isDefined(layer.defaultValue) ? new Date(layer.defaultValue) : null
            } else {
              defaultValue = layer.defaultValue
            }
            const info: FieldInfo = {
              index: fieldInfos.length,
              name: layer.name,
              alias: layer.alias,
              type: layer.type,
              hasDomain: isDefined(layer.domain),
              value: defaultValue,
              error: '',
              nullable: layer.nullable,
              default: typeof defaultValue === 'number' ? Number(defaultValue).toString() : defaultValue,
              length: layer.length,
              editable: fieldInfo.editable
            }
            fieldInfos.push(info)
          }
        }
      })
    }
    return fieldInfos
  }

  const errorsPresent = (values: FieldInfo[]): boolean => {
    return values.findIndex(value => value.error.length > 0) > -1
  }

  const handleUpdateItem = (value: any, error: string, index: number) => {
    const newFieldInfos = cloneDeep(fieldInfos)
    newFieldInfos[index].value = value
    newFieldInfos[index].error = error
    setFieldInfos(newFieldInfos)
    setHasErrors(errorsPresent(newFieldInfos))
  }

  const handleUpdateAll = (values: FieldInfo[]) => {
    const newFieldInfos = cloneDeep(values)
    setFieldInfos(newFieldInfos)
    setHasErrors(errorsPresent(newFieldInfos))
  }

  const handleFieldGrpUpdated = (values: any, tableIndex: number) => {
    fieldGroups = values
    if (!fieldGroups || (fieldGroups?.length === 0)) {
      setHasContingentErrors(false)
    }
  }

  const areEventsCoincident = async (): Promise<boolean> => {
    let areCoincident = true
    return loadArcGISJSAPIModules(['esri/geometry/operators/disjointOperator']).then(modules => {
      let disjointOperator: typeof __esri.disjointOperator = null;
      [disjointOperator] = modules
      for (let i = 0; i < eventFeatures.length; i++) {
        for (let j = 0; j < eventFeatures.length; j++) {
          if (j === i) {
            continue
          } else {
            const isDisjoint = disjointOperator.execute(eventFeatures[i].geometry, eventFeatures[j].geometry)
            if (!isDisjoint ||
              // Events that have spatial gap but with coincident measures can be merged
              (eventFeatures[i].attributes[eventLayer.eventInfo.routeIdFieldName] === eventFeatures[j].attributes[eventLayer.eventInfo.routeIdFieldName] &&
                (eventFeatures[i].attributes[eventLayer.eventInfo.fromMeasureFieldName] === eventFeatures[j].attributes[eventLayer.eventInfo.toMeasureFieldName] ||
                  eventFeatures[i].attributes[eventLayer.eventInfo.toMeasureFieldName] === eventFeatures[j].attributes[eventLayer.eventInfo.fromMeasureFieldName]))) {
              break
            }
          }
          if (j === eventFeatures.length - 1) {
            areCoincident = false
          }
        }
        if (!areCoincident) {
          onUpdateToastMsgType('error')
          onUpdateToastMsg(getI18nMessage('eventsNotCoincident'))
          onUpdateToastOpen(true)
          setTimeout(() => {
            onUpdateToastOpen(false)
          }, 5000)
          break
        }
      }
      return areCoincident
    })
  }

  const isEventOverlapMergeDates = (feature): boolean => {
    let isValid: boolean = true
    const eventFromDate = feature.attributes[eventLayer.eventInfo.fromDateFieldName]
    const routeInfoSelectedFromDateWithRouteTime: Date = getDateWithRouteTime(routeInfo.selectedFromDate, routeInfo.fromDate)
    const routeInfoSelectedToDateWithRouteTime: Date = getDateWithRouteTime(routeInfo.selectedToDate, routeInfo.fromDate)
    const selectedFromDate = getDateToUTC(routeInfoSelectedFromDateWithRouteTime)
    const selectedToDate = getDateToUTC(routeInfoSelectedToDateWithRouteTime)
    if (isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
      // Only from date provided.
      if (isDefined(eventFromDate)) {
        isValid = isValid && selectedFromDate >= eventFromDate
      }
    }
    if (!isDefined(routeInfo.selectedFromDate) && isDefined(routeInfo.selectedToDate)) {
      // Only to date provided.
      if (isDefined(eventFromDate)) {
        isValid = isValid && selectedToDate > eventFromDate
      }
    }
    if (isDefined(routeInfo.selectedFromDate) && isDefined(routeInfo.selectedToDate)) {
      // Both from and to date provided.
      isValid = isValid && selectedFromDate < selectedToDate
      if (isDefined(eventFromDate)) {
        isValid = isValid && (selectedFromDate >= eventFromDate || selectedToDate > eventFromDate)
      }
    }

    return isValid
  }

  // Events must be active today ---- if any of the event is retired or it starts in the future, merge is not allowed
  // Events must have null in To Date ---- if any of the event is retired or is set to retire in the future, merge is not allowed
  // Events must overlap between Merge Dates ---- if events have different From date, and Merge Dates are in the past where any of events does not exist, merge is not allowed (e.g. EventA 2010-null B 2020-null. Merging From 2015 To 2018 when B does not exist is not allowed)
  const areEventDatesValid = (): boolean => {
    let message = ''
    const eventsToDateNotNullObjectIds = []
    const eventsNotActiveTodayObjectIds = []
    const eventNotOverlapMergeDatesObjectIds = []
    for (let i = 0; i < eventFeatures.length; i++) {
      const feature = eventFeatures[i]
      const objectId = feature.attributes[eventDS.getSchema().idField]
      if (feature.attributes[eventLayer.eventInfo.toDateFieldName] != null) {
        eventsToDateNotNullObjectIds.push(objectId)
      } else if (feature.attributes[eventLayer.eventInfo.fromDateFieldName] != null &&
        feature.attributes[eventLayer.eventInfo.fromDateFieldName] > getDateToUTC(new Date(Date.now()))) {
        eventsNotActiveTodayObjectIds.push(objectId)
      } else if (!isEventOverlapMergeDates(feature)) {
        eventNotOverlapMergeDatesObjectIds.push(objectId)
      }
    }
    if (eventsToDateNotNullObjectIds.length > 0) {
      message = getI18nMessage('eventsToDateNotNull', { objectIds: eventsToDateNotNullObjectIds.join(', ') })
    } else if (eventsNotActiveTodayObjectIds.length > 0) {
      message = getI18nMessage('eventsNotActiveToday', { objectIds: eventsNotActiveTodayObjectIds.join(', ') })
    } else if (eventNotOverlapMergeDatesObjectIds.length > 0) {
      message = getI18nMessage('eventNotOverlapMergeDates', { objectIds: eventNotOverlapMergeDatesObjectIds.join(', ') })
    }
    if (message.length > 0) {
      onUpdateToastMsgType('error')
      onUpdateToastMsg(message)
      onUpdateToastOpen(true)
      setTimeout(() => {
        onUpdateToastOpen(false)
      }, 5000)
      return false
    }
    return true
  }

  const areNonLrsFieldsInvalid = (): boolean => {
    const fieldInfoCopy = cloneDeep(fieldInfos)
    let hasErrors = false

    // Check all fields for errors. We will display the last error message we encounter.
    fieldInfoCopy.forEach((field, fieldIndex) => {
      let result
      if (field.hasDomain) {
        result = validateRangeDomain(field.value, field.name, eventDS)
      } else if (isDate(field.type)) {
        result = validateField(field.value, field.name, eventDS)
      } else {
        result = validateField(field.value, field.name, eventDS)
      }
      if (isDefined(fieldGroups)) {
        let fieldGroupFields = []
        const invalidFieldGroups = validateContingencyConstraints(field.value, '', fieldIndex, fieldInfoCopy, fieldGroups)
        if (invalidFieldGroups?.length > 0) {
          invalidFieldGroups.forEach((group) => {
            const fields = group?.fieldGroup?.fields
            fieldGroupFields.push(fields)
          })
          fieldGroupFields = fieldGroupFields.flat()
          if (fieldGroupFields.includes(field.name)) {
            setHasContingentErrors(true)
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
          fieldGroups.forEach((group) => {
            fieldGroupNames.push(group.name)
          })
          let alertMsg = getI18nMessage('invalidContingentValues')
          alertMsg = alertMsg.replace('{groupNames}', fieldGroupNames.join(','))
          toastErrorMsg = alertMsg
          setToastMsgInvalidContingentVal(toastErrorMsg)
        } else {
          const fieldName = eventLayer.useFieldAlias ? field.alias : field.name
          toastErrorMsg = formatMessage(intl, 'attributeError', { fieldValue: fieldName, message: formatMessage(intl, result.message) })
        }

        onUpdateToastMsgType('error')
        onUpdateToastMsg(toastErrorMsg)
        onUpdateToastOpen(true)
        setTimeout(() => {
          onUpdateToastOpen(false)
        }, 5000)
        hasErrors = true
        field.error = getI18nMessage(result.message)
      }
    })

    // Update state so we can show all errors
    if (hasErrors) {
      handleUpdateAll(fieldInfoCopy)
    }

    return hasErrors
  }

  const publishMessage = async () => {
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
  }

  const submitForm = async (locks?: LrsLocksInfo) => {
    // Check if events are on the same line or route
    if (!await areEventsOnSameLineOrRoute(
      false,
      eventFeatures,
      getI18nMessage,
      eventLayer,
      networkLayer,
      networkDS,
      toastMsgType,
      onUpdateToastMsgType,
      onUpdateToastMsg,
      onUpdateToastOpen)) {
      return
    }

    // Check if events are spatially/measure coincident
    if (!await areEventsCoincident()) {
      return
    }

    // Validate attributes before submitting
    if (areNonLrsFieldsInvalid()) {
      return
    }

    // Check if events have valid dates
    if (!areEventDatesValid()) {
      return
    }

    const request: MergeEventsRequest = {}
    if (isDefined(eventLayer) && preservedEventIndex > -1 && eventFeatures.length > 0) {
      const indexedLrsAttrs: { [key: string]: string | number | Date } = {}

      // EventId
      const eventIdKey = eventLayer.eventInfo.eventIdFieldName
      indexedLrsAttrs[eventIdKey] = eventFeatures[preservedEventIndex].attributes[eventLayer.eventInfo.eventIdFieldName]

      if (isDefined(eventFeatures) && isDefined(routeInfo) && isDefined(network) && isDefined(routeInfo.lineId) && routeInfo.lineId.length > 0) {
        // Handle reversed route within line
        const firstRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.routeIdFieldName]
        const lastRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.routeIdFieldName]
        if (firstRouteId !== lastRouteId) {
          const routeIdField = network.networkInfo.routeIdFieldSchema.jimuName
          const lineOrderField = network.networkInfo.lineOrderFieldSchema.jimuName

          // store all of the route features in a dictionary.  Key is routeId, value is RouteInfo object
          const results = await queryAllRoutesByLineIdAndFromDate(routeInfo.lineId, network.networkInfo, networkDS, routeInfo.selectedFromDate)
          if (isDefined(results)) {
            const sortedFeatures = results.features.sort((a, b) => a.attributes[lineOrderField] - b.attributes[lineOrderField])
            let firstRouteIdx: number = -1
            let lastRouteIdx: number = -1

            const routeShapes: __esri.Polyline[] = []
            sortedFeatures.forEach((feature, index) => {
              routeShapes.push(feature.geometry as __esri.Polyline)
              if (feature.attributes[routeIdField] === firstRouteId) {
                firstRouteIdx = index
              }
              if (feature.attributes[routeIdField] === lastRouteId) {
                lastRouteIdx = index
              }
            })

            const isFromReversed: boolean = IsRouteReversed(routeShapes, firstRouteIdx)
            const isToReversed: boolean = IsRouteReversed(routeShapes, lastRouteIdx)

            if (isDefined(network)) {
              let fromM = round(eventFeatures[0].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.networkInfo.measurePrecision)
              if (isFromReversed) {
                fromM = round(eventFeatures[0].attributes[eventLayer.eventInfo.toMeasureFieldName], network.networkInfo.measurePrecision)
              } else {
                const firstRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.routeIdFieldName]
                const lastRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.routeIdFieldName]
                const lastFromM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.networkInfo.measurePrecision)
                if (firstRouteId === lastRouteId && lastFromM < fromM) {
                  // Last event has smaller From measure than the first event
                  fromM = lastFromM
                }
              }

              let toM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toMeasureFieldName], network.networkInfo.measurePrecision)
              if (isToReversed) {
                toM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.networkInfo.measurePrecision)
              } else {
                const firstToRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.toRouteIdFieldName]
                const lastToRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toRouteIdFieldName]
                const firstToM = round(eventFeatures[0].attributes[eventLayer.eventInfo.toMeasureFieldName], network.networkInfo.measurePrecision)
                if (firstToRouteId === lastToRouteId && firstToM > toM) {
                  // First event has greater To measure than the last event
                  toM = firstToM
                }
              }

              const fromMeasureKey = eventLayer.eventInfo.fromMeasureFieldName
              indexedLrsAttrs[fromMeasureKey] = fromM

              const toMeasureKey = eventLayer.eventInfo.toMeasureFieldName
              indexedLrsAttrs[toMeasureKey] = toM

            }
          }
        }
      } else {
        // FromMeasure
        const firstRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.routeIdFieldName]
        const lastRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.routeIdFieldName]
        let fromM = round(eventFeatures[0].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.networkInfo.measurePrecision)
        const lastFromM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.networkInfo.measurePrecision)
        if (firstRouteId === lastRouteId && lastFromM < fromM) {
          // Last event has smaller From measure than the first event
          fromM = lastFromM
        }
        const fromMeasureKey = eventLayer.eventInfo.fromMeasureFieldName
        indexedLrsAttrs[fromMeasureKey] = fromM

        // ToMeasure
        const firstToRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.toRouteIdFieldName]
        const lastToRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toRouteIdFieldName]
        const firstToM = round(eventFeatures[0].attributes[eventLayer.eventInfo.toMeasureFieldName], network.networkInfo.measurePrecision)
        let toM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toMeasureFieldName], network.networkInfo.measurePrecision)
        if (firstToRouteId === lastToRouteId && firstToM > toM) {
          // First event has greater To measure than the last event
          toM = firstToM
        }
        const toMeasureKey = eventLayer.eventInfo.toMeasureFieldName
        indexedLrsAttrs[toMeasureKey] = toM
      }

      // Non lrs attributes
      fieldInfos.forEach((item) => {
        const key = item.name
        if (isDefined(item.value) && isDate(item.type)) {
          // Remove timezone offset from date values, then get time in UTC.
          const date = getDateWithoutTZOffset(item.value.valueOf(), eventDS)
          indexedLrsAttrs[key] = getDateToUTC(date)
        } else if (isNumber(item.type)) {
          // Convert any string values to number.
          if (!isDefined(item.value) || isNaN(Number(item.value))) {
            indexedLrsAttrs[key] = null
          } else {
            indexedLrsAttrs[key] = Number(item.value)
          }
        } else {
          // Everything else: strings and null values.
          indexedLrsAttrs[key] = item.value
        }
      })

      const objectIdFieldName = eventDS.getSchema()?.idField
      const objectIds: number[] = []
      eventFeatures.forEach((feature) => {
        objectIds.push(feature.attributes[objectIdFieldName])
      })
      request.attributes = indexedLrsAttrs
      request.objectIdToPreserve = eventFeatures[preservedEventIndex].attributes[objectIdFieldName]
      request.objectIds = objectIds
      if (isDefined(routeInfo.selectedFromDate)) {
        const routeInfoSelectedFromDateWithRouteTime: Date = getDateWithRouteTime(routeInfo.selectedFromDate, routeInfo.fromDate)
        // Remove timezone offset from date values, we will get time in UTC in apply edits function.
        const date = getDateWithoutTZOffset(routeInfoSelectedFromDateWithRouteTime.valueOf(), eventDS)
        request.fromDate = date
      } else {
        request.fromDate = routeInfo.selectedFromDate
      }
      if (isDefined(routeInfo.selectedToDate)) {
        const routeInfoSelectedToDateWithRouteTime: Date = getDateWithRouteTime(routeInfo.selectedToDate, routeInfo.fromDate)
        // Remove timezone offset from date values, we will get time in UTC in apply edits function.
        const date = getDateWithoutTZOffset(routeInfoSelectedToDateWithRouteTime.valueOf(), eventDS)
        request.toDate = date
      } else {
        request.toDate = routeInfo.selectedToDate
      }
    }
    const eventFeatureLayer = eventDS as FeatureLayerDataSource

    if (supportsEditSession) {
      const startEdit = await startEditSession()
      if (!startEdit.success) {
        onUpdateToastMsgType('error')
        onUpdateToastMsg(startEdit.error)
        onUpdateToastOpen(true)
        setTimeout(() => {
          onUpdateToastOpen(false)
        }, 5000)
        return
      }
    }

    await LrsApplyEdits(eventFeatureLayer, eventLayer, sessionId, null, null, request)

      .then((result) => {
        if (result.success) {
          if (supportsEditSession) {
            addEdit(result, getI18nMessage('_widgetLabel'))
          }
          if (isDefined(eventLayer) && isDefined(eventDS)) {
            // Get basic field info for non lrs fields and set default values.
            const featureLayerDS = eventDS as FeatureLayerDataSource
            // Perform query on route identifier.
            queryEventsByEventObjectIds(featureLayerDS, result.editResults[0].mergeEventsResult.objectIds).then((features) => {
              features.forEach(async (feature, index) => {
                const polyline = feature.geometry as Polyline
                if (isDefined(polyline)) {
                  flash(flashGraphic, await getGeometryGraphic(await getSimpleLineGraphic(polyline), colorCyan))
                }
              })
            })
          }
          // Edit went through, show message and publish results to other widgets.
          onUpdateToastMsgType('success')
          onUpdateToastMsg(getI18nMessage('eventMerged'))
          onUpdateToastOpen(true)
          publishMessage()
          setTimeout(async () => {
            onUpdateToastOpen(false)
            onUpdateToastMsgType('error')
            onUpdateStopQuery(false)
            const jimuLayerViews = jimuMapView.jimuLayerViews
            const jimuLayerViewKeys = Object.keys(jimuLayerViews)
            for (let i = 0; i < jimuLayerViewKeys.length; i++) {
              const tempJimuLayerView = jimuLayerViews[jimuLayerViewKeys[i]]
              if (tempJimuLayerView.layer.title === eventLayer.name) {
                (tempJimuLayerView as JimuFeatureLayerView | JimuSceneLayerView).selectFeaturesByIds([])
              }
            }
            if (conflictPreventionEnabled && isDefined(locks)) {
              await tryReleaseLockOnDefault(networkDS as FeatureLayerDataSource, locks)
              const updateLockInfo = { ...lockInfo, lockAction: LockAction.Clear }
              setLockInfo(updateLockInfo)
            } else {
              onSubmit()
            }
          }, 5000)
        } else {
          // Failed on server, show error message.
          onUpdateToastMsgType('error')
          onUpdateToastMsg(result.message)
          onUpdateToastOpen(true)
          setTimeout(() => {
            onUpdateToastOpen(false)
          }, 5000)
        }
      })
  }

  // Returns if the current input data is valid.
  const isValidInput = React.useCallback(() => {
    // Dates check.
    if (!isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
      // No date selected.
      return false
    }

    const routeInfoSelectedFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedFromDate)
    const routeInfoSelectedToDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedToDate)
    const routeInfoFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.fromDate)
    const routeInfoToDateWithoutTime: Date = getDateWithoutTime(routeInfo.toDate)

    if (isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
      // Only from date provided.
      if (isDefined(routeInfo.fromDate) && routeInfoSelectedFromDateWithoutTime < routeInfoFromDateWithoutTime) {
        // Selected from date less than routes from date.
        return false
      }
      if (isDefined(routeInfo.toDate) && routeInfoSelectedFromDateWithoutTime > routeInfoToDateWithoutTime) {
        // Selected from date greater than routes to date.
        return false
      }
    }
    if (!isDefined(routeInfo.selectedFromDate) && isDefined(routeInfo.selectedToDate)) {
      // Only to date provided.
      if (isDefined(routeInfo.fromDate) && routeInfoSelectedToDateWithoutTime < routeInfoFromDateWithoutTime) {
        // Selected to date less than routes from date.
        return false
      }
      if (isDefined(routeInfo.toDate) && routeInfoSelectedToDateWithoutTime > routeInfoToDateWithoutTime) {
        // Selected to date greater than routes to date.
        return false
      }
    }
    if (isDefined(routeInfo.selectedFromDate) && isDefined(routeInfo.selectedToDate)) {
      // Both from and to date provided.
      if (routeInfoSelectedFromDateWithoutTime > routeInfoSelectedToDateWithoutTime) {
        return false
      }
      if (isDefined(routeInfo.fromDate) && routeInfoSelectedFromDateWithoutTime < routeInfoFromDateWithoutTime) {
        return false
      }
      if (isDefined(routeInfo.toDate) && routeInfoSelectedToDateWithoutTime > routeInfoToDateWithoutTime) {
        return false
      }
    }

    if (hasErrors) {
      return false
    }

    if (eventFeatures.length === 0) {
      return false
    }

    if (preservedEventIndex === -1) {
      return false
    }

    if (!lockAquired) {
      return false
    }

    return true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo])

  const onSubmitClicked = () => {
    if (conflictPreventionEnabled) {
      const updatedLockInfos = { ...lockInfo, lockAction: LockAction.QueryAndAcquire }
      setLockInfo(updatedLockInfos)
    } else {
      submitForm()
    }
  }

  const handleQueryLocksCompleted = (lockInfo: LrsLocksInfo, acquiredInfo: AcquireLockResponse, success: boolean) => {
    const updatedLockInfos = { ...lockInfo, lockAction: LockAction.None }
    setLockInfo(updatedLockInfos)
    if (success) {
      submitForm(updatedLockInfos)
    }
  }

  const handleMessageClear = () => {
    const updatedLockInfos = { ...lockInfo, lockAction: LockAction.None }
    setLockInfo(updatedLockInfos)
    onSubmit()
  }

  React.useEffect(() => {
    onValidationChanged(isValidInput())
  }, [isValidInput, onValidationChanged])

  return (
    <div className='merge-events-edit-attributes__content' css={getFormStyle()}>
      <div className='h-100'>
        {conflictPreventionEnabled && (
          <LockManagerComponent
            intl={intl}
            featureDS={networkDS as FeatureLayerDataSource}
            lockInfo={lockInfo}
            showAlert={false}
            conflictPreventionEnabled={conflictPreventionEnabled}
            onQueryAndAcquireComplete={handleQueryLocksCompleted}
            onMessageClear={handleMessageClear}
          />
        )}
        {hasContingentErrors &&
          (<div style={{ marginTop: '1.2rem' }}>
            <Alert tabIndex={0} className={'w-100 userInfo'}
              onClose={function noRefCheck () { setHasContingentErrors(false) }}
              open={hasContingentErrors}
              text={toastMsgInvalidContingentVal}
              type={'warning'}
              closable
              withIcon
            />
          </div>
          )
        }
        <AttributeTable
          tableIndex={0}
          collapable={false}
          eventDS={eventDS}
          eventLayer={eventLayer}
          fieldInfos={fieldInfos}
          useAlias={isDefined(eventLayer) ? eventLayer.useFieldAlias : true}
          onUpdateItem={handleUpdateItem}
          onUpdateAll={handleUpdateAll}
          onFieldGrpUpdated={handleFieldGrpUpdated}
          tableLabel={getI18nMessage('mergedEventAttributesLabel')}/>
      </div>
    </div>
  )
})
