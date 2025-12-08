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
  queryEventsByRouteIdOrEventObjectId,
  queryEventsByEventObjectIds,
  getGeometryGraphic,
  getSimpleLineGraphic,
  isWithinTolerance,
  flash,
  formatMessage,
  getDateWithoutTZOffset,
  LockManagerComponent,
  LockAction,
  queryLineId,
  type LrsLocksInfo,
  type AcquireLockResponse,
  tryReleaseLockOnDefault,
  type SplitEventRequest,
  LrsApplyEdits,
  useVmsManager,
  getDateWithTZOffset,
  useEditSession,
  getDateWithRouteTime
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import { cloneDeep } from 'lodash-es'
import type { IFieldInfo } from '@esri/arcgis-rest-feature-service'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { colorCyan } from '../constants'
import type Polyline from 'esri/geometry/Polyline'
import { Alert } from 'jimu-ui'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import { useImperativeHandle } from 'react'
import { validateContingencyConstraints } from '../../../../../shared-code/lib/lrs/utilities/contingent-values-utils'

export interface SplitEventAttributesProps {
  widgetId: string
  networkDS: DataSource
  network: ImmutableObject<LrsLayer>
  eventDS: DataSource
  eventLayer: ImmutableObject<LrsLayer>
  routeInfo: RouteInfo
  table1Label: string
  table2Label: string
  onUpdateEventOid: (newEventOid: string) => void
  networkLayer: ImmutableObject<LrsLayer>
  onSubmit: () => void
  flashGraphic: GraphicsLayer
  onUpdateToastMsgType: (type: AlertType) => void
  onUpdateToastMsg: (msg: string) => void
  onUpdateToastOpen: (open: boolean) => void
  intl: IntlShape
  selectedEventObjectId: number
  lockAquired: boolean
  conflictPreventionEnabled: boolean
  onValidationChanged: (isValid: boolean) => void
  revalidateRouteFromDataAction: boolean
  routeInfoFromDataAction?: RouteInfo
  resetEventOid: () => void
  currentEventOid: string
  resetClick?: boolean
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .split-event-edit-attributes__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .split-event-edit-attributes__action {
      height: 100%;
    }
  `
}

let fieldGroups1 = []
let fieldGroups2 = []
export const SplitEventAttributes = React.forwardRef((props: SplitEventAttributesProps, ref) => {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    widgetId,
    resetClick,
    networkDS,
    network,
    eventDS,
    eventLayer,
    routeInfo,
    table1Label,
    table2Label,
    onUpdateEventOid,
    networkLayer,
    onSubmit,
    flashGraphic,
    onUpdateToastMsgType,
    onUpdateToastMsg,
    onUpdateToastOpen,
    intl,
    selectedEventObjectId,
    lockAquired,
    conflictPreventionEnabled,
    onValidationChanged,
    revalidateRouteFromDataAction,
    routeInfoFromDataAction,
    resetEventOid,
    currentEventOid
  } = props
  const [fieldInfos1, setFieldInfos1] = React.useState<FieldInfo[]>()
  const [fieldInfos2, setFieldInfos2] = React.useState<FieldInfo[]>()
  const [hasErrors, setHasErrors] = React.useState<boolean>(false)
  const [eventOid, setEventOid] = React.useState<string>('')
  const [noEventFound, setNoEventFound] = React.useState<boolean>(true)
  const [multipleEventsFound, setMultipleEventsFound] = React.useState<boolean>(false)
  const [unableToSplitAtStartOrEnd, setUnableToSplitAtStartOrEnd] = React.useState<boolean>(false)
  const [eventFromDate, setEventFromDate] = React.useState<number>(null)
  const [eventToDate, setEventToDate] = React.useState<number>(null)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>()
  const [hasContingentErrors1, setHasContingentErrors1] = React.useState<boolean>(false)
  const [hasContingentErrors2, setHasContingentErrors2] = React.useState<boolean>(false)
  const [toastMsgContingentVal, setToastMsgContingentVal] = React.useState<string>(null)
  const { sessionId, startEditSession, addEdit} = useVmsManager()
  const { supportsEditSession } = useEditSession()

  useImperativeHandle(ref, () => ({
    onSubmitClicked
  }))

  React.useEffect(() => {
    if (revalidateRouteFromDataAction) {
      setFieldInfosWithEventAttributeValues()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidateRouteFromDataAction])

  React.useEffect(() => {
    onValidationChanged(!hasErrors && !hasContingentErrors1 && !hasContingentErrors2 && lockAquired)
  }, [hasErrors, lockAquired, hasContingentErrors1, hasContingentErrors2, onValidationChanged])

  React.useEffect(() => {
    if (isDefined(routeInfo) && (isDefined(routeInfo.selectedPoint) || selectedEventObjectId)) {
      setFieldInfosWithEventAttributeValues()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo])

  React.useEffect(() => {
    resetAttributes()
    setHasContingentErrors1(false)
    setHasContingentErrors2(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDS, eventLayer])

  React.useEffect(() => {
    if (resetClick) {
      resetAttributes()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetClick])

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

  const resetAttributes = () => {
    const fieldInfos: FieldInfo[] = getInitialAttributeValues()
    setFieldInfos(fieldInfos, true)
    setFieldInfos(fieldInfos, false)
  }

  const setFieldInfos = (fieldInfos: FieldInfo[], isFirst: boolean) => {
    if (isFirst) {
      setFieldInfos1(fieldInfos)
    } else {
      setFieldInfos2(fieldInfos)
    }
    /*if (isDefined(fieldInfos1) && isDefined(fieldInfos2)) {
      const isError: boolean = errorsPresent(fieldInfos1, fieldInfos2)
      setHasErrors(isError)
    }*/
  }

  const setFieldInfosWithEventAttributeValues = async () => {
    let fieldInfos: FieldInfo[] = []
    if (isDefined(eventLayer) && isDefined(eventDS) && isDefined(eventLayer.eventInfo) && isDefined(eventLayer.eventInfo.attributeFields) &&
      (isDefined(routeInfo) || isDefined(routeInfoFromDataAction))) {
      // Get basic field info for non lrs fields and set default values.
      const featureLayerDS = eventDS as FeatureLayerDataSource
      const rteInfo = revalidateRouteFromDataAction ? routeInfoFromDataAction : routeInfo

      // Perform query on route identifier.
      const networkFeatureLayerDS = networkDS as FeatureLayerDataSource
      const routeIds = []
      if (eventLayer.eventInfo.canSpanRoutes) {
        await queryLineId(networkFeatureLayerDS, networkLayer.networkInfo, rteInfo.lineId)
          .then((routeRecords) => {
            routeRecords.forEach((record) => {
              const routeId = record.getFieldValue(networkLayer.networkInfo.routeIdFieldSchema.name)
              routeIds.push(routeId)
            })
          })
      }

      queryEventsByRouteIdOrEventObjectId(networkLayer.networkInfo.xyTolerance, featureLayerDS, eventLayer, rteInfo, routeIds, selectedEventObjectId).then((eventRecords) => {
        const featureLayerDS = eventDS as FeatureLayerDataSource
        const layerDefinition = featureLayerDS?.getLayerDefinition()
        const objectIdFieldName = layerDefinition.fields.find((element) => element.type === 'esriFieldTypeOID').name
        let matchCurrentEventOid = false
        let multipleEventsFound = false
        let unableToSplitAtStartOrEnd = false
        if (eventRecords.length === 1) {
          const newEventOid = eventRecords[0].attributes[objectIdFieldName]
          setEventOid(newEventOid)
          onUpdateEventOid(newEventOid)

          // Get basic field info for non lrs fields and set default values.
          const layer = featureLayerDS?.layer
          const fields = layer.fields
          eventLayer.eventInfo.attributeFields.forEach((fieldInfo) => {
            if (fieldInfo.enabled) {
              const field = fields.find(l => l.name === fieldInfo.field.name)
              if (field && field.editable) {
                let defaultValue
                let value = eventRecords[0].attributes[field.name]
                if (isDate(field.type) && isDefined(value)) {
                  value = getDateWithTZOffset(value, eventDS)
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

                const fromMeasure = eventRecords[0].attributes[eventLayer.eventInfo.fromMeasureFieldName]
                const toMeasure = eventRecords[0].attributes[eventLayer.eventInfo.toMeasureFieldName]
                if (eventLayer.eventInfo.canSpanRoutes) {
                  const fromRouteID = eventRecords[0].attributes[eventLayer.eventInfo.routeIdFieldName]
                  const toRouteID = eventRecords[0].attributes[eventLayer.eventInfo.toRouteIdFieldName]
                  if ((rteInfo.routeId === fromRouteID && isWithinTolerance(rteInfo.selectedMeasure, fromMeasure, networkLayer.networkInfo.mTolerance)) ||
                    (rteInfo.routeId === toRouteID && isWithinTolerance(rteInfo.selectedMeasure, toMeasure, networkLayer.networkInfo.mTolerance))) {
                    unableToSplitAtStartOrEnd = true
                    setUnableToSplitAtStartOrEnd(true)
                  } else {
                    unableToSplitAtStartOrEnd = false
                    setUnableToSplitAtStartOrEnd(false)
                  }
                } else {
                  if (isWithinTolerance(rteInfo.selectedMeasure, fromMeasure, networkLayer.networkInfo.mTolerance) ||
                      isWithinTolerance(rteInfo.selectedMeasure, toMeasure, networkLayer.networkInfo.mTolerance)) {
                    unableToSplitAtStartOrEnd = true
                    setUnableToSplitAtStartOrEnd(true)
                  } else {
                    unableToSplitAtStartOrEnd = false
                    setUnableToSplitAtStartOrEnd(false)
                  }
                }

                setEventFromDate(eventRecords[0].attributes[eventLayer.eventInfo.fromDateFieldName])
                setEventToDate(eventRecords[0].attributes[eventLayer.eventInfo.toDateFieldName])
              }
            }
          })
          setNoEventFound(false)
          multipleEventsFound = false
          setMultipleEventsFound(false)
        } else if (eventRecords.length > 1) {
          for (let i = 0; i < eventRecords.length; i++) {
            const newEventOid = eventRecords[i].attributes[objectIdFieldName]
            if (currentEventOid === newEventOid) {
              matchCurrentEventOid = true
              break
            }
          }
          if (!matchCurrentEventOid) {
            fieldInfos = getInitialAttributeValues()
            setNoEventFound(false)
            multipleEventsFound = true
            setMultipleEventsFound(true)
            setEventOid(null)
            resetEventOid()
          }
        } else if (!rteInfo.isNearestCoordinate) {
          fieldInfos = getInitialAttributeValues()
          setNoEventFound(true)
          multipleEventsFound = false
          setMultipleEventsFound(false)
          matchCurrentEventOid = false
          setEventOid(null)
          resetEventOid()
        }

        // Only reset field infos if previous selected event is not included in the current multiple selected events nor
        // the selected point in the route info is not set by the nearest coordinate because the nearest coordinate is not exactly on the route.
        if (!matchCurrentEventOid && !rteInfo.isNearestCoordinate) {
          setTimeout(() => {
            setFieldInfos(fieldInfos, true)
          }, 500)

          setTimeout(() => {
            setFieldInfos(fieldInfos, false)
          }, 500)
        }

        if (multipleEventsFound || unableToSplitAtStartOrEnd) {
          const toastMsg = (multipleEventsFound ? getI18nMessage('multipleEventsFound') : getI18nMessage('unableToSplitAtStartOrEnd'))
          onUpdateToastMsgType('error')
          onUpdateToastMsg(toastMsg)
          onUpdateToastOpen(true)
          setTimeout(() => {
            onUpdateToastOpen(false)
          }, 5000)
        }
      })
    }
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
          const field = fields.find(l => l.name === fieldInfo.field.name)
          if (field) {
            let defaultValue
            if (isDate(field.type)) {
              defaultValue = isDefined(field.defaultValue) ? new Date(field.defaultValue) : null
            } else {
              defaultValue = field.defaultValue
            }
            const info: FieldInfo = {
              index: fieldInfos.length,
              name: field.name,
              alias: field.alias,
              type: field.type,
              hasDomain: isDefined(field.domain),
              value: defaultValue,
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
    return fieldInfos
  }

  const errorsPresent = (values1: FieldInfo[], values2: FieldInfo[]): boolean => {
    return values1.findIndex(value => value.error.length > 0) > -1 || values2.findIndex(value => value.error.length > 0) > -1
  }

  const handleUpdateItem = (value: any, error: string, index: number) => {
    const newFieldInfos = cloneDeep(fieldInfos1)
    newFieldInfos[index].value = value
    newFieldInfos[index].error = error
    setFieldInfos(newFieldInfos, true)
    setHasErrors(errorsPresent(newFieldInfos, fieldInfos1))
  }

  const handleUpdateItem2 = (value: any, error: string, index: number) => {
    const newFieldInfos = cloneDeep(fieldInfos2)
    newFieldInfos[index].value = value
    newFieldInfos[index].error = error
    setFieldInfos(newFieldInfos, false)
    setHasErrors(errorsPresent(newFieldInfos, fieldInfos1))
  }

  const handleUpdateAll = (values: FieldInfo[]) => {
    const newFieldInfos = cloneDeep(values)
    setFieldInfos(newFieldInfos, true)
    setHasErrors(errorsPresent(newFieldInfos, fieldInfos2))
  }

  const handleUpdateAll2 = (values: FieldInfo[]) => {
    const newFieldInfos = cloneDeep(values)
    setFieldInfos(newFieldInfos, false)
    setHasErrors(errorsPresent(newFieldInfos, fieldInfos1))
  }

  const handleFieldGrp1Updated = (values: any, tableIndex: number) => {
    fieldGroups1 = values
    if (!fieldGroups1 || (fieldGroups1?.length === 0)) {
      setHasContingentErrors1(false)
    }
  }

  const handleFieldGrp2Updated = (values: any, tableIndex: number) => {
    fieldGroups2 = values
    if (!fieldGroups2 || (fieldGroups2?.length === 0)) {
      setHasContingentErrors2(false)
    }
  }

  const areNonLrsFieldsInvalid = (infos: FieldInfo[], hasAttributeError: boolean, isEvent1Attributes: boolean, fieldGroups): boolean => {
    const fieldInfoCopy = cloneDeep(infos)
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
        let fieldGroupFields: any[] = []
        const invalidFieldGroups = validateContingencyConstraints(field.value, '', fieldIndex, fieldInfoCopy, fieldGroups)
        if (invalidFieldGroups?.length > 0) {
          invalidFieldGroups.forEach((group: any) => {
            const fields = group?.fieldGroup?.fields
            fieldGroupFields.push(fields)
          })
          fieldGroupFields = fieldGroupFields.flat()
          if (fieldGroupFields.includes(field.name)) {
            if (isEvent1Attributes) setHasContingentErrors1(true)
            else setHasContingentErrors2(true)
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
          const fieldGroupNames: string[] = []
          fieldGroups.forEach((group) => {
            if (group?.name) fieldGroupNames.push(group.name)
          })
          let alertMsg = getI18nMessage('invalidContingentValues')
          alertMsg = alertMsg.replace('{groupNames}', fieldGroupNames.join(','))
          toastErrorMsg = alertMsg
          field.error = getI18nMessage(result.message)
          setToastMsgContingentVal(toastErrorMsg)
        } else {
          const fieldName = eventLayer.useFieldAlias ? field.alias : field.name
          toastErrorMsg = formatMessage(intl, 'attributeError', {
            fieldValue: fieldName,
            message: formatMessage(intl, result.message),
            event1or2: isEvent1Attributes ? getI18nMessage('event1Label') : getI18nMessage('event2Label')
          })
          field.error = formatMessage(intl, result.message)
        }
        onUpdateToastMsgType('error')
        onUpdateToastMsg(toastErrorMsg)
        onUpdateToastOpen(true)
        setTimeout(() => {
          onUpdateToastOpen(false)
        }, 5000)
        hasErrors = true
      }
    })

    // Update state so we can show all errors
    if (hasErrors) {
      if (isEvent1Attributes) handleUpdateAll(fieldInfoCopy)
      else handleUpdateAll2(fieldInfoCopy)
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

  // Event must be active today ---- if any of the event is retired or it starts in the future, split is not allowed
  // Event must have null in To Date ---- if any of the event is retired or is set to retire in the future, split is not allowed
  const areEventDatesValid = (): boolean => {
    let message = ''
    if (isDefined(eventToDate)) {
      message = 'Event must have null To Date.'
    } else if (isDefined(eventFromDate) &&
    eventFromDate > getDateToUTC(new Date(Date.now()))) {
      message = 'Event must be active today.'
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

  const submitForm = async (locks?: LrsLocksInfo) => {
    const request: SplitEventRequest = {}

    // Validate attributes before submitting
    const isInvalid1 = areNonLrsFieldsInvalid(fieldInfos1, false, true, fieldGroups1)
    const isInvalid2 = areNonLrsFieldsInvalid(fieldInfos2, isInvalid1, false, fieldGroups2)
    if (isInvalid1 || isInvalid2) {
      return
    }

    // Check if events have valid dates
    if (!areEventDatesValid()) {
      return
    }

    let unableToSplitOnDate = false
    const selectedFromDateWithRouteTime: Date = getDateWithRouteTime(routeInfo.selectedFromDate, routeInfo.fromDate)
    const splitDate = selectedFromDateWithRouteTime.getTime()
    if ((isDefined(eventFromDate) && splitDate < eventFromDate) ||
      (isDefined(eventToDate) && splitDate > eventToDate)) {
      unableToSplitOnDate = true
    } else {
      unableToSplitOnDate = false
    }

    if (noEventFound || multipleEventsFound || unableToSplitAtStartOrEnd || unableToSplitOnDate) {
      const toastMsg = (noEventFound || unableToSplitOnDate) ? getI18nMessage('noEventFound') : (multipleEventsFound ? getI18nMessage('multipleEventsFound') : getI18nMessage('unableToSplitAtStartOrEnd'))
      onUpdateToastMsgType('error')
      onUpdateToastMsg(toastMsg)
      onUpdateToastOpen(true)
      setTimeout(() => {
        onUpdateToastOpen(false)
      }, 5000)
      return
    }

    if (isDefined(eventLayer)) {
      const indexedLrsAttrs: { [key: string]: string | number | Date } = {}

      // Non lrs attributes
      fieldInfos1.forEach((item) => {
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

      const indexedLrsAttrs2: { [key: string]: string | number | Date } = {}

      // Non lrs attributes
      fieldInfos2.forEach((item) => {
        const key = item.name
        if (isDefined(item.value) && isDate(item.type)) {
          // Remove timezone offset from date values, then get time in UTC.
          const date = getDateWithoutTZOffset(item.value.valueOf(), eventDS)
          indexedLrsAttrs2[key] = getDateToUTC(date)
        } else if (isNumber(item.type)) {
          // Convert any string values to number.
          if (!isDefined(item.value) || isNaN(Number(item.value))) {
            indexedLrsAttrs2[key] = null
          } else {
            indexedLrsAttrs2[key] = Number(item.value)
          }
        } else {
          // Everything else: strings and null values.
          indexedLrsAttrs2[key] = item.value
        }
      })

      request.attributes = indexedLrsAttrs
      request.attributes2 = indexedLrsAttrs2
      request.eventOid = eventOid
      request.routeId = routeInfo.routeId
      request.measure = routeInfo.selectedMeasure
      if (isDefined(routeInfo.selectedFromDate)) {
        const routeInfoSelecteFromDateWithRouteTime: Date = getDateWithRouteTime(routeInfo.selectedFromDate, routeInfo.fromDate)
        // Remove timezone offset from date values, we will get time in UTC in apply edits function.
        const date = getDateWithoutTZOffset(routeInfoSelecteFromDateWithRouteTime.valueOf(), eventDS)
        request.fromDate = date
      } else {
        request.fromDate = routeInfo.selectedFromDate
      }
      request.measure = routeInfo.selectedMeasure
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

    await LrsApplyEdits(eventFeatureLayer, eventLayer, sessionId, null, request, null)

      .then((result) => {
        if (result.success) {
          if (supportsEditSession) {
            addEdit(result, getI18nMessage('_widgetLabel'))
          }
          if (isDefined(eventLayer) && isDefined(eventDS)) {
            // Get basic field info for non lrs fields and set default values.
            const featureLayerDS = eventDS as FeatureLayerDataSource
            // Perform query on route identifier.
            queryEventsByEventObjectIds(featureLayerDS, result.editResults[0].splitEventResult.objectIds).then((features) => {
              features.forEach(async (feature, index) => {
                const polyline = feature.geometry as Polyline
                if (isDefined(polyline)) {
                  if (index === 0) {
                    flash(flashGraphic, await getGeometryGraphic(await getSimpleLineGraphic(polyline), colorCyan))
                  } else {
                    setTimeout(async () => {
                      flash(flashGraphic, await getGeometryGraphic(await getSimpleLineGraphic(polyline), colorCyan))
                    }, 5000)
                  }
                }
              })
            })
          }
          // Edit went through, show message and publish results to other widgets.
          onUpdateToastMsgType('success')
          onUpdateToastMsg(getI18nMessage('eventSplit'))
          onUpdateToastOpen(true)
          publishMessage()
          setTimeout(async () => {
            onUpdateToastOpen(false)
            if (conflictPreventionEnabled && isDefined(locks)) {
              await tryReleaseLockOnDefault(networkDS as FeatureLayerDataSource, locks)
              const updateLockInfo = { ...lockInfo, lockAction: LockAction.Clear }
              setLockInfo(updateLockInfo)
            } else {
              resetAttributes()
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

  return (
    <div className='split-event-edit-attributes__content' css={getFormStyle()}>
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
          {(hasContingentErrors1 || hasContingentErrors2) &&
            <div style={{ marginTop: '1.2rem' }}>
              <Alert tabIndex={0} className={'w-100 userInfo'}
                onClose={function noRefCheck () { if (hasContingentErrors1) setHasContingentErrors1(false); if (hasContingentErrors2) setHasContingentErrors2(false) }}
                open={hasContingentErrors1 || hasContingentErrors2}
                text={toastMsgContingentVal}
                type={'warning'}
                closable
                withIcon
              />
            </div>
          }
        <AttributeTable
          tableIndex={0}
          collapable={false}
          eventDS={eventDS}
          eventLayer={eventLayer}
          fieldInfos={fieldInfos1}
          useAlias={isDefined(eventLayer) ? eventLayer.useFieldAlias : true}
          onUpdateItem={handleUpdateItem}
          onUpdateAll={handleUpdateAll}
          tableLabel={table1Label}
          onFieldGrpUpdated={handleFieldGrp1Updated}/>
        <AttributeTable
          tableIndex={1}
          collapable={false}
          eventDS={eventDS}
          eventLayer={eventLayer}
          fieldInfos={fieldInfos2}
          useAlias={isDefined(eventLayer) ? eventLayer.useFieldAlias : true}
          onUpdateItem={handleUpdateItem2}
          onUpdateAll={handleUpdateAll2}
          tableLabel={table2Label}
          onFieldGrpUpdated={handleFieldGrp2Updated}/>
      </div>
    </div>
  )
})
