/** @jsx jsx */
import { CalciteSelect, CalciteButton, CalciteOption, CalciteInputDatePicker } from 'calcite-components'
import defaultMessages from '../../translations/default'
import {
  React,
  jsx,
  hooks,
  type IntlShape,
  type CodedValue,
  type ImmutableArray,
  type FeatureLayerDataSource,
  type DataSource,
  type ImmutableObject
} from 'jimu-core'
import { Label, Select, TextInput, type ValidityResult } from 'jimu-ui'
import { formatMessage, isCodedDomain, isConflictPreventionEnabled, isDate, isDefined, isNumber, isRangeDomain, LockAcquireStatus, LockAction, type LrsLocksInfo, type NetworkInfo, validateField, validateRangeDomain, type LrsLayer, useLrsDate } from 'widgets/shared-code/lrs'
import type { TableEdits, AttributeSetParam, MessageProp, SubtypeLayers, DynSegFieldInfo, RouteInfoFromDataAction } from '../../../config'
import { useDynSegRuntimeState, useDynSegRuntimeDispatch } from '../../state'
import { getLineId, getWhereClause, handleCellEdit, preventConflict } from '../../utils/edit-utils'
import { getSubtypeFieldsToUpdate } from '../../utils/table-utils'
import { getSubtypeLayers } from '../../utils/feature-layer-utils'
import { DynSegFields } from '../../../constants'

export interface FieldCalculatorProps {
  dynSegFeatureLayer: __esri.FeatureLayer
  lrsLayers: ImmutableArray<LrsLayer>
  attributeSet: AttributeSetParam[]
  intl: IntlShape
  networkDS: any
  routeId: string
  currentRouteInfo: RouteInfoFromDataAction
  networkInfo: ImmutableObject<NetworkInfo>
  handleLockToast: (messageProp: MessageProp, reloadOnClose: boolean) => void
}

export function FieldCalcPopup (props: FieldCalculatorProps) {
  const { dynSegFeatureLayer, lrsLayers, attributeSet, intl, networkDS, routeId, currentRouteInfo, networkInfo, handleLockToast } = props
  const { fieldInfo, pendingEdits } = useDynSegRuntimeState()
  const [eventLayerId, setEventLayerId] = React.useState()
  const [field, setEventField] = React.useState()
  const [eventFieldInfo, setEventFieldInfos] = React.useState<DynSegFieldInfo[]>([])
  const [eventFieldsDict, setEventFieldsDict] = React.useState<any>()
  const [eventIds, setEventIds] = React.useState<string[]>([])
  const [subTypeInfo, setSubTypeInfo] = React.useState<SubtypeLayers[]>([])
  const [errorMsg, setErrorMsg] = React.useState<string>('')
  const [lineId, setLineId] = React.useState<string>()
  const [currentValue, setCurrentValue] = React.useState<string | number>()
  const { activeDate } = useLrsDate()

  const dispatch = useDynSegRuntimeDispatch()
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  React.useEffect(() => {
    createEventFields()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, networkInfo, fieldInfo, lrsLayers])

  React.useEffect(() => {
    getSubtypeLayers(lrsLayers, attributeSet)
      .then((subTypeLayers) => {
        setSubTypeInfo(subTypeLayers)
      })
  }, [attributeSet, lrsLayers])

  React.useEffect(() => {
    if (networkInfo?.supportsLines) {
      getLineId(networkInfo, routeId, networkDS)
        .then((lineId) => {
          if (lineId) setLineId(lineId)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [networkDS, networkInfo, routeId])

  const getField = (fieldName) => {
    if (!eventFieldInfo) return null
    const info = eventFieldInfo.find(f => f.eventLayerId === eventLayerId && f.originalFieldName === fieldName)
    const field = dynSegFeatureLayer.fields.find(f => f.name === info.featureFieldName)
    if (field) {
      return field
    }
    return null
  }

  const getFieldType = (field, info) => {
    if (info?.isSubtypeField) {
      return 'subtype'
    }
    if (isDefined(field?.domain) && isCodedDomain(field?.domain?.type)) {
      return 'domain'
    }
    if (isDefined(field?.domain) && isRangeDomain(field?.domain?.type)) {
      return 'range'
    }
    if (isDate(field?.type)) {
      return 'date'
    }
    if (isNumber(field?.type)) {
      return 'number'
    }
    return 'text'
  }

  const getSubtypeCodedValue = () => {
    const subtype = subTypeInfo.find(s => s.id === eventLayerId)
    if (isDefined(subtype) && isDefined(subtype.subtypes)) {
      const codedValues: CodedValue[] = subtype.subtypes.map((subtype) => {
        return {
          value: subtype.code,
          label: subtype.name
        }
      })
      if (codedValues) {
        return codedValues
      }
    }
    return []
  }

  const getDropDownLabel = (label: string, value?: string | number): string => {
    if (isDefined(value)) {
      return `${value} - ${label}`
    } else {
      return label
    }
  }

  const getDomainOptions = (domain) => {
    return domain?.codedValues?.map((element, i) => {
      let code = element.code
      if (code === null) code = '<null>'
      return (
      <option key={i} value={code}>
        {getDropDownLabel(element.name, element.code)}
      </option>
      )
    })
  }

  const updateCurrentValue = (value: string | number) => {
    setCurrentValue(value)
  }


  const validateValueChanged = (value: string): Promise<ValidityResult> => {
    if (!field || !eventFieldInfo) return Promise.resolve({ valid: true })
    const info = eventFieldInfo.find(f => f.eventLayerId === eventLayerId && f.originalFieldName === field)
    const fieldDetails = getField(field)

    let incomingValue: string | number = value

    const existingError = errorMsg.length > 0
    const result = validateField(value, info.featureFieldName, undefined, fieldDetails)
    if (result.hasError) {
      if (existingError) {
        return Promise.resolve({ valid: false, msg: result.message })
      }
      setErrorMsg(formatMessage(intl, result.message, defaultMessages))
      updateCurrentValue(incomingValue)
      return Promise.resolve({ valid: false, msg: formatMessage(intl, result.message, defaultMessages) })
    }

    // Convert to number if the field type is numeric
    if (fieldDetails && isNumber(fieldDetails.type)) {
      incomingValue = parseFloat(incomingValue)
    }
    setErrorMsg('')
    updateCurrentValue(incomingValue)
    return Promise.resolve({ valid: true })
  }

  const validateRangeChanged = (value: string | number): ValidityResult => {
    const fieldName = field
    const info = eventFieldInfo.find(f => f.eventLayerId === eventLayerId && f.originalFieldName === fieldName)
    const fieldDetails = getField(fieldName)

    const existingError = errorMsg.length > 0
    const result = validateRangeDomain(value, info.featureFieldName, undefined, fieldDetails)
    if (result.hasError) {
      if (existingError) {
        return { valid: false, msg: result.message }
      }
      setErrorMsg(formatMessage(intl, result.message, defaultMessages))
      updateCurrentValue(value)
      return { valid: false, msg: formatMessage(intl, result.message, defaultMessages) }
    }

    setErrorMsg('')
    updateCurrentValue(value)
    return { valid: true }
  }

  const validateDateChanged = (evt) => {
    const value = evt.target?.valueAsDate
    if (!value || isNaN(value.getTime())) {
      setCurrentValue(null)
      setErrorMsg('')
      return { valid: true }
    }

    const utcValue = value.valueOf()
    if (!utcValue) {
      setCurrentValue(null)
      setErrorMsg('')
      return { valid: true }
    }

    const fieldName = field
    const info = eventFieldInfo.find(f => f.eventLayerId === eventLayerId && f.originalFieldName === fieldName)
    const fieldDetails = getField(fieldName)

    const existingError = errorMsg.length > 0
    const result = validateField(value, info.featureFieldName, undefined, fieldDetails)
    if (result.hasError) {
      if (existingError) {
        return { valid: false, msg: result.message }
      }
      setErrorMsg(formatMessage(intl, result.message, defaultMessages))
      updateCurrentValue(utcValue)
      return { valid: false, msg: formatMessage(intl, result.message, defaultMessages) }
    }

    setErrorMsg('')
    updateCurrentValue(utcValue)
    return { valid: true }
  }

  const onSelectChange = (e) => {
    updateCurrentValue(e.target.value)
  }

  const getFieldTypeEle = (fieldType, field) => {
    const subtypeCodedValue = getSubtypeCodedValue()
    if (fieldType === 'text' || fieldType === 'number') {
      return (
      <TextInput
        style={{ height: '32px' }}
        autoFocus
        type={'text'}
        size='sm'
        value={currentValue}
        onChange={(e) => { updateCurrentValue(e.currentTarget.value) }}
        checkValidityOnAccept={validateValueChanged}
      />
      )
    } else if (fieldType === 'date') {
      return (
        <CalciteInputDatePicker
          scale="s"
          style={{ height: '32px' }}
          onCalciteInputDatePickerChange={validateDateChanged}
          placement='top'
          overlayPositioning='fixed'
          focusTrapDisabled
      />
      )
    } else if (fieldType === 'domain') {
      const options = getDomainOptions(field.domain)
      return (
        <Select
          value={currentValue}
          size='sm'
          onChange={(value) => { onSelectChange(value) }}
        >
          {options}
        </Select>
      )
    } else if (fieldType === 'subtype') {
      return (
        <Select
          value={currentValue}
          onChange={(value) => { onSelectChange(value) }}
          size='sm'
        >
          {subtypeCodedValue.map((element, i) => {
            return (
              <option key={i} value={element.value}>{getDropDownLabel(element.label, element.value)}</option>
            )
          })
          }
        </Select>
      )
    } else if (fieldType === 'range') {
      return (
        <TextInput
          style={{ height: '32px' }}
          autoFocus
          size='sm'
          value={currentValue}
          onChange={(e) => { updateCurrentValue(e.currentTarget.value) }}
          checkValidityOnAccept={validateRangeChanged}
      />
      )
    }
  }

  const renderEventLayers = () => {
    const options = []
    if (!eventIds || eventIds.length === 0) return []
    eventIds.forEach((eventId) => {
      const info = eventFieldsDict[eventId]
      const eventName = info[0].eventName
      const eventLayerId = info[0].eventLayerId
      options.push(<CalciteOption value={eventLayerId}> {eventName || eventLayerId} </CalciteOption>)
    })
    return options
  }

  const renderEventLayerFields = () => {
    const id = eventLayerId
    if (!id) return []
    const options = []
    const fields = eventFieldsDict[id]
    if (!fields || fields.length === 0) return []
    fields.forEach((field, index) => {
      options.push(<CalciteOption value={field.originalFieldName}> {field.originalFieldName} </CalciteOption>)
    })
    return options
  }

  const renderFieldType = () => {
    if (!field || !eventFieldInfo) return null
    const info = eventFieldInfo.find(f => f.eventLayerId === eventLayerId && f.originalFieldName === field)
    const fieldDetails = getField(field)
    const fieldType = getFieldType(fieldDetails, info)
    return getFieldTypeEle(fieldType, fieldDetails)
  }

  const createEventFields = () => {
    const eventFieldsDict = {}
    const eventIds = []
    if (!fieldInfo || fieldInfo.length === 0 || !eventFieldsDict) return {}
    fieldInfo.forEach((info) => {
      const isEventIdField = info.isEventIdField
      const exclude = info.exclude
      const layerId = info.eventLayerId
      if (!layerId || isEventIdField || exclude) { /* empty */ } else {
        if (eventFieldsDict[info.eventLayerId]) {
          eventFieldsDict[info.eventLayerId].push(info)
        } else {
          eventFieldsDict[info.eventLayerId] = [info]
          eventIds.push(info.eventLayerId)
        }
      }
    })
    if (eventFieldsDict) setEventFieldsDict(eventFieldsDict)
    const fields = eventFieldsDict[eventIds[0]]
    setEventFieldInfos(fields)
    setEventIds(eventIds)
    setEventLayerId(eventIds[0])
    setEventField(fields[0].originalFieldName)
    return eventFieldsDict
  }

  const handleEventLayerChange = (event) => {
    setEventLayerId(event.target.value)
    const fields = eventFieldsDict[event.target.value]
    // on event layer change initialize the field dropdown
    setEventFieldInfos(fields)
    setEventField(fields[0].originalFieldName)
    setCurrentValue(null)
  }

  const handleFieldChange = (event) => {
    setCurrentValue(null)
    setEventField(event.target.value)
  }

  const createLockInfoFromParams = () => {
    const networkId = networkInfo.lrsNetworkId
    const routeOrLineId = []
    const isLine = []
    const eventServiceLayerIds = []
    const routeInfo = currentRouteInfo
    eventIds.forEach((id) => {
      const eventInfo = lrsLayers.find(lyr => lyr.serviceId.toString() === id.toString())
      if (eventInfo) {
        const parentNetworkId = eventInfo.eventInfo.parentNetworkId
        if (parentNetworkId === networkId) {
          eventServiceLayerIds.push(id)
        }
      }
    })

    eventServiceLayerIds.forEach((eventId) => {
      if (networkInfo.supportsLines && lineId) {
        routeOrLineId.push(lineId)
      } else {
        routeOrLineId.push(routeId)
      }
      isLine.push(networkInfo.supportsLines)
    })

    const info: LrsLocksInfo = {
      networkId: [networkId],
      routeOrLineId: routeOrLineId,
      eventServiceLayerIds: eventServiceLayerIds,
      isLine: isLine,
      status: LockAcquireStatus.EsriSuccess,
      details: [],
      //@ts-expect-error
      routeInfo: routeInfo,
      lockAction: LockAction.Query
    }
    return info
  }

  const getRecords = async (featureLayer: __esri.FeatureLayer, networkDS: DataSource): Promise<__esri.Graphic[]> => {
    const query = featureLayer.createQuery()
    query.outFields = ['*']
    query.returnGeometry = true
    query.where = getWhereClause(networkDS, activeDate)


    return featureLayer.queryFeatures(query).then((results) => {
      return results.features
    }).catch((err) => {
      return []
    })
  }

  const handleUpdate = async () => {
    let val = currentValue
    if (val === '<null>') val = null
    const records = await getRecords(dynSegFeatureLayer, networkDS)
    const clonedRecords = []
    const info = eventFieldInfo.find(f => f.eventLayerId === eventLayerId && f.originalFieldName === field)
    records.forEach((record) => {
      const clonedRecord = record.clone()
      const type = clonedRecord.attributes[DynSegFields.typeName]
      const eventType = info.EventType
      if (type === eventType) {
        const fieldsToUpdate = getSubtypeFieldsToUpdate(val, info, clonedRecord, subTypeInfo)
        if (fieldsToUpdate.size > 0) {
          fieldsToUpdate.forEach((value, key) => {
            clonedRecord.attributes[key] = value
          })
        } else {
          clonedRecord.attributes[info.featureFieldName] = val
        }
        clonedRecords.push(clonedRecord)
      }
    })

    const edits = {
      updateFeatures: clonedRecords
    }

    await dynSegFeatureLayer.applyEdits(edits).then((editResult) => {
      if (editResult.updateFeatureResults.length > 0) {
        let updatedPendingEdit = new Map<string, TableEdits>(pendingEdits)
        clonedRecords.forEach((clonedRecord) => {
          const type = clonedRecord.attributes[DynSegFields.typeName]
          const eventType = info.EventType
          if (type === eventType) {
            updatedPendingEdit = handleCellEdit(info, clonedRecord, eventFieldInfo, updatedPendingEdit)
            dispatch({ type: 'SET_EDITS', value: updatedPendingEdit })
          }
        })
      }
    }).catch((error) => {
      setErrorMsg(error.message)
    })
  }

  const updateTable = async () => {
    const isConflictPrevEnabled = await isConflictPreventionEnabled(networkDS._url)
    let error
    if (isConflictPrevEnabled) {
      const params = createLockInfoFromParams()
      const featureDS = networkDS as FeatureLayerDataSource
      error = await preventConflict(params, featureDS, intl)
      if (error) {
        const messageProp: MessageProp = {
          title: error.toastMsg,
          body: '',
          type: error.toastMsgType
        }
        handleLockToast(messageProp, false)
        await handleUpdate()
      } else {
        const messageProp: MessageProp = {
          title: getI18nMessage('editFieldSuccess'),
          body: '',
          type: 'success'
        }
        handleLockToast(messageProp, false)
        await handleUpdate()
      }
    } else {
      await handleUpdate()
    }
  }

  return (
    <div style={{ margin: '1rem', display: 'flex', flexDirection: 'column', width: '300px' }} >
        <Label className='title3'>
            {getI18nMessage('eventLayer')}
            <CalciteSelect scale='s'label={getI18nMessage('eventLayer')} value={eventLayerId} onCalciteSelectChange={handleEventLayerChange}>
                {renderEventLayers()}
            </CalciteSelect>
        </Label>
        <Label className='title3' style={{ marginTop: '0.3rem' }}>
            {getI18nMessage('updateField')}
            <CalciteSelect scale='s' label={getI18nMessage('updateField')} value={field} onCalciteSelectChange={handleFieldChange}>
                {renderEventLayerFields()}
            </CalciteSelect>
        </Label>
        <Label className='title3' style={{ marginTop: '0.3rem' }}>
            {getI18nMessage('fieldValue')}
            {renderFieldType()}
        </Label>
        <CalciteButton
          onClick={updateTable}
          disabled={errorMsg?.length > 0 ? true : undefined}
          style={{ alignSelf: 'flex-end', width: '50%', marginTop: '0.5rem' }}>
          {getI18nMessage('update')}
        </CalciteButton>
    </div>
  )
}
