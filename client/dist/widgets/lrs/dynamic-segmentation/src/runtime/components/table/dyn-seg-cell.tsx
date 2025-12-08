/** @jsx jsx */
import {
  type IntlShape,
  React,
  jsx,
  type CodedValue,
  type DataSource
} from 'jimu-core'
import {
  isDefined,
  isCodedDomain,
  isRangeDomain,
  isDate,
  validateField,
  validateRangeDomain,
  isNumber,
  formatMessage,
  getContingentOptions,
  setContingentValues,
  validateContingencyConstraints,
  getDateWithTZOffset,
  getDateWithoutTZOffset
} from 'widgets/shared-code/lrs'
import defaultMessages from '../../translations/default'
import { CalciteInputDatePicker, CalciteTableCell } from 'calcite-components'
import { Icon, Label, NumericInput, Select, TextInput, type ValidityResult } from 'jimu-ui'
import { EventType, type SubtypeLayers, type DynSegFieldInfo, type FieldType } from '../../../config'
import { DynSegFields } from '../../../constants'
import iconWarning from 'jimu-icons/svg/outlined/suggested/warning.svg'
import { getPendingEditsKey, getSubtypeFieldsToUpdate, getValidValues } from '../../utils/table-utils'
import classNames from 'classnames'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'

export interface CellProps {
  intl: IntlShape
  allowEditing?: boolean
  rowIndex: number
  fieldInfo: DynSegFieldInfo
  featureLayer: __esri.FeatureLayer
  record: __esri.Graphic
  subTypeInfo: SubtypeLayers[]
  layerMap: Map<string, __esri.Layer>
  fieldGroups: Map<string, any>
  contingentValues: Map<string, any>
  networkDS: DataSource
  updateRecord: (record: __esri.Graphic, fieldInfo: DynSegFieldInfo) => void
}

export function DynSegCell (props: CellProps) {
  const { intl, featureLayer, allowEditing, record, fieldInfo, subTypeInfo, layerMap, fieldGroups, contingentValues, networkDS, updateRecord } = props
  const [currentValue, setCurrentValue] = React.useState<string | number>(record.attributes[fieldInfo.featureFieldName])
  const [modifiedValue, setModifiedValue] = React.useState<string | number>(record.attributes[fieldInfo.featureFieldName])
  const [originalValue, setOriginalValue] = React.useState<string | number>(record.attributes[fieldInfo.featureFieldName])
  const [contingentValError, setContingentValError] = React.useState<boolean>(false)
  const [errorMsg, setErrorMsg] = React.useState<string>('')
  const [isVisible, setIsVisible] = React.useState(false)
  const [isSelected, setIsSelected] = React.useState<boolean>(false)
  const focusRef = React.useRef<HTMLDivElement>(null)
  const [layerContingentValues, setLayerContingentValues] = React.useState<any[]>([])
  const [validValues, setValidValues] = React.useState<any[]>([])
  const { errorCount, pendingEdits } = useDynSegRuntimeState()
  const dispatch = useDynSegRuntimeDispatch()

  React.useEffect(() => {
    if (errorCount === 0) {
      setErrorMessage('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCount])

  //#region Memorized values
  const field: __esri.Field = React.useMemo(() => {
    const field = featureLayer.fields.find(f => f.name === fieldInfo.featureFieldName)
    if (field) {
      return field
    }
    return null
  }, [featureLayer, fieldInfo])

  const eventFields: __esri.Field[] = React.useMemo(() => {
    return featureLayer.fields.filter(f => f.alias.includes('.') && f.alias.split('.')[0] === fieldInfo.eventName)
  }, [featureLayer, fieldInfo])

  const subtypeCode: number = React.useMemo(() => {
    const subtype = subTypeInfo.find(s => s.id === fieldInfo.eventLayerId)
    if (isDefined(subtype)) {
      return record.attributes[subtype.subtypeField]
    }
    return NaN
  }, [subTypeInfo, fieldInfo, record])

  const fieldGroup: any = React.useMemo(() => {
    // Get specific field group for layer and selected subtype (if any).
    const layer = layerMap.get(fieldInfo.eventLayerId)
    const layerFieldGroups = fieldGroups.get(fieldInfo.eventLayerId)
    const layerContingencies = contingentValues.get(fieldInfo.eventLayerId)
    return setContingentValues(layerContingencies, layerFieldGroups, layer, subtypeCode)
  }, [layerMap, fieldGroups, contingentValues, fieldInfo, subtypeCode])

  const codedValueDomains: __esri.CodedValueDomain = React.useMemo(() => {
    if (isDefined(field) && isDefined(field.domain) && field.domain.type === 'coded-value') {
      const containsNull = field.domain.codedValues.some(cv => cv.code === null && cv.name === 'null')
      if (field.nullable && !containsNull) {
        field.domain.codedValues.unshift({ code: null, name: 'null' })
      }
      return field.domain
    }
    return null
  }, [field])

  const subtypeCodedValue: CodedValue[] = React.useMemo(() => {
    const subtype = subTypeInfo.find(s => s.id === fieldInfo.eventLayerId)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTypeInfo])

  const fieldType: FieldType = React.useMemo(() => {
    if (fieldInfo.isSubtypeField) {
      return 'subtype'
    }
    if (isDefined(field.domain) && isCodedDomain(field.domain.type)) {
      return 'domain'
    }
    if (isDefined(field.domain) && isRangeDomain(field.domain.type)) {
      return 'range'
    }
    if (isDate(field.type)) {
      return 'date'
    }
    if (isNumber(field.type)) {
      return 'number'
    }
    return 'text'
  }, [fieldInfo, field])

  const isCellEditable = React.useMemo((): boolean => {
    if (field.editable && fieldInfo.editable && isDefined(record)) {
      if (!allowEditing) {
        return false
      }
      const recordType = record.attributes[DynSegFields.typeName]
      if (recordType === 'Point' && fieldInfo.EventType === EventType.Line) {
        return false
      }
      if (recordType === 'Line' && fieldInfo.EventType === EventType.Point) {
        return false
      }
      return true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, fieldInfo])

  const hasError = React.useMemo((): boolean => {
    return errorMsg.length > 0
  }, [errorMsg])

  const isCellEdited = React.useMemo((): boolean => {
    if (!isDefined(originalValue) && currentValue === '') {
      return false
    }
    return currentValue !== originalValue && errorMsg.length === 0
  }, [originalValue, currentValue, errorMsg])

  //#endregion

  //#region UseEffects
  React.useEffect(() => {
    if (isDefined(record) && isDefined(fieldInfo)) {
      if (isDate(field.type)) {
        const dateValue = getDateWithTZOffset(record.attributes[fieldInfo.featureFieldName], networkDS)
        setOriginalValue(dateValue ? dateValue.valueOf() : null)
      } else {
        setOriginalValue(record.attributes[fieldInfo.featureFieldName])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    // Render cell content when cell is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '0px', // no margin
        threshold: 0 // visible when single pixel is visible
      }
    )

    if (focusRef.current) {
      observer.observe(focusRef.current)
    }

    // Clean up the observer
    return () => {
      if (focusRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(focusRef.current)
      }
    }
  })

  React.useEffect(() => {
    function handleLostFocus (event: MouseEvent) {
      if (focusRef.current && !focusRef.current.contains(event.target as Node)) {
        setIsSelected(false)
      }
    }

    if (isSelected) {
      // Add event listener to handle lost focus
      document.addEventListener('click', handleLostFocus)
      return () => {
        // Clean up to remove listener
        document.removeEventListener('click', handleLostFocus)
      }
    }
  }, [isSelected, focusRef])

  React.useEffect(() => {
    if (isDefined(record) && isDefined(fieldInfo)) {
      if (isDate(field.type)) {
        const dateValue = getDateWithTZOffset(record.attributes[fieldInfo.featureFieldName], networkDS)
        setCurrentValue(dateValue ? dateValue.valueOf() : null)
      } else {
        setCurrentValue(record.attributes[fieldInfo.featureFieldName])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, fieldInfo])

  React.useEffect(() => {
    const contingentValues = getContingentOptions(fieldInfo.originalFieldName, fieldGroup)
    const validValues = getValidValues(fieldGroup, eventFields, record, fieldInfo.originalFieldName)
    setLayerContingentValues(contingentValues)
    setValidValues(validValues)
  }, [eventFields, fieldGroup, fieldInfo, record])

  React.useEffect(() => {
    if (fieldGroup.length > 0) {
      const key = getPendingEditsKey(record, fieldInfo.eventName)
      const existingEdits = pendingEdits.get(key)
      if (isDefined(existingEdits)) {
        const invalidFieldGroups = validateContingencyConstraints(-1, '', -1, null, fieldGroup, record, eventFields)
        if (invalidFieldGroups.length > 0) {
          const invalidResult = []
          for (let i = 0; i < invalidFieldGroups?.length; i++) {
            const group = invalidFieldGroups[i]
            invalidResult.push(group?.fieldGroup)
          }
          invalidResult?.forEach((invalidGrp) => {
            const fields = invalidGrp?.fields
            const match = fields?.find((element) => element === fieldInfo?.originalFieldName)
            if (match) {
              setErrorMessage(formatMessage(intl, 'contingentValueError', defaultMessages))
              setContingentValError(true)
            }
          })
        } else if (contingentValError) {
          setErrorMessage('')
          setContingentValError(false)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEdits, record])
  //#endregion

  //#region Validation
  const validateDateChanged = (evt) => {
    const value = evt.target?.valueAsDate
    const utcValue = getDateWithoutTZOffset(value.valueOf(), networkDS).valueOf()

    if (originalValue === utcValue) {
      if (errorMsg.length > 0) {
        setErrorMessage('')
      }
      return { valid: true }
    }

    const existingError = errorMsg.length > 0
    const result = validateField(value, fieldInfo.featureFieldName, undefined, field)
    if (result.hasError) {
      if (existingError) {
        return { valid: false, msg: result.message }
      }
      setErrorMessage(formatMessage(intl, result.message, defaultMessages))
      updateAndApplyEdit(utcValue, formatMessage(intl, result.message, defaultMessages))
      return { valid: false, msg: formatMessage(intl, result.message, defaultMessages) }
    }

    setErrorMessage('')
    updateAndApplyEdit(utcValue, '')
    return { valid: true }
  }

  const validateRangeChanged = (value: string | number): ValidityResult => {
    if (isNumber(field.type)) {
      // Convert value to number if the field type is number
      value = parseFloat(value as string)
    }

    if (originalValue === value || modifiedValue === currentValue) {
      if (errorMsg.length > 0) {
        setErrorMessage('')
      }
      return { valid: true }
    }

    const existingError = errorMsg.length > 0
    const result = validateRangeDomain(value, fieldInfo.featureFieldName, undefined, field)
    if (result.hasError) {
      if (existingError) {
        return { valid: false, msg: result.message }
      }
      setErrorMessage(formatMessage(intl, result.message, defaultMessages))
      updateAndApplyEdit(value, formatMessage(intl, result.message, defaultMessages))
      return { valid: false, msg: formatMessage(intl, result.message, defaultMessages) }
    }

    setErrorMessage('')
    updateAndApplyEdit(value, '')
    return { valid: true }
  }


  const validateValueChanged = (value: string): Promise<ValidityResult> => {
    let incomingValue: string | number = value
    if (fieldType === 'number') {
      incomingValue = parseFloat(value)
    }

    if (originalValue === incomingValue || modifiedValue === currentValue) {
      if (errorMsg.length > 0) {
        setErrorMessage('')
      }
      return Promise.resolve({ valid: true })
    }

    const existingError = errorMsg.length > 0
    const result = validateField(value, fieldInfo.featureFieldName, undefined, field)
    if (result.hasError) {
      if (existingError) {
        return Promise.resolve({ valid: false, msg: result.message })
      }
      setErrorMessage(formatMessage(intl, result.message, defaultMessages))
      updateAndApplyEdit(incomingValue, formatMessage(intl, result.message, defaultMessages))
      return Promise.resolve({ valid: false, msg: formatMessage(intl, result.message, defaultMessages) })
    }

    setErrorMessage('')
    updateAndApplyEdit(incomingValue, '')
    return Promise.resolve({ valid: true })
  }
  //#endregion

  //#region Helper functions
  const getDropDownLabel = (label: string, value?: string | number): string => {
    if (isDefined(value)) {
      return `${value} - ${label}`
    } else {
      return label
    }
  }

  const getFieldLabel = (): string => {
    switch (fieldType) {
      case 'subtype':
        return getSubtypeLabel()
      case 'domain':
        return getCodedValueLabel()
      case 'date':
        return isDefined(currentValue) ? new Date(currentValue).toLocaleDateString() : ''
      case 'range':
      case 'number':
      case 'text':
        return isDefined(currentValue) ? currentValue.toString() : ''
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default:
        return ''
    }
  }

  const getSubtypeLabel = (): string => {
    if (isDefined(currentValue)) {
      const value = subtypeCodedValue.find(s => {
        if (typeof s.value === 'string' && typeof currentValue === 'string') {
          return s.value.toLowerCase() === currentValue.toLowerCase()
        } else {
          return s.value === currentValue
        }
      })
      if (isDefined(value)) {
        return getDropDownLabel(value.label)
      } else {
        return ''
      }
    }
    return ''
  }

  const getCodedValueLabel = (): string => {
    if (isDefined(currentValue)) {
      const value = codedValueDomains.codedValues.find(c => {
        if (typeof c.code === 'string' && typeof currentValue === 'string') {
          return c.code.toLowerCase() === currentValue.toLowerCase()
        } else {
          return c.code === currentValue
        }
      })
      if (isDefined(value)) {
        return getDropDownLabel(value.name)
      } else {
        return ''
      }
    }
    return ''
  }

  const getWidth = (): string => {
    if (field.name === DynSegFields.typeName) {
      return '75px'
    }
    return '125px'
  }

  const isValidValue = (value) => {
    if (validValues && validValues.includes(value)) return true
    return false
  }

  const showAllOptions = isSelected && isDefined(field.domain) && fieldType === 'domain'

  const options = () => {
    if (showAllOptions) {
    // if contingent value field; show contingent value options
      if (layerContingentValues?.length > 0) {
        return layerContingentValues.map((element, i) => {
          const isValid = isValidValue(element.code)
          const style = !isValid ? { color: '#a0a0a0', background: '#d5d5d5' } : { }
          return (
          <option key={i} value={element.code} style={style}>
            {getDropDownLabel(element.name, element.code)}
          </option>
          )
        })
      } else {
        return codedValueDomains?.codedValues?.map((element, i) => {
          return (
          <option key={i} value={element.code}>
            {getDropDownLabel(element.name, element.code)}
          </option>
          )
        })
      }
    }
  }
  //#endregion

  //#region Event handlers
  const onSelectChange = (e) => {
    const incomingValue = e.target.value
    if (incomingValue !== currentValue) {
      setCurrentValue(e.target.value)
      updateAndApplyEdit(e.target.value, '')
    }
  }

  const onNumericChange = (value: string | number) => {
    if (value !== currentValue) {
      setCurrentValue(value)
      updateAndApplyEdit(value, '')
    }
  }

  const handleDoubleClick = () => {
    if (isCellEditable) {
      setIsSelected(true)
    }
  }
  //#endregion

  //#region Apply edit
  const applyEdit = async (value: string | number, errorMsg: string) => {
    const clonedRecord = record.clone()
    const fieldsToUpdate = getSubtypeFieldsToUpdate(value, fieldInfo, clonedRecord, subTypeInfo)
    if (fieldsToUpdate.size > 0) {
      fieldsToUpdate.forEach((value, key) => {
        clonedRecord.attributes[key] = value
      })
    } else {
      clonedRecord.attributes[fieldInfo.featureFieldName] = value
    }

    const edits = {
      updateFeatures: [clonedRecord]
    }

    await featureLayer.applyEdits(edits).then((editResult) => {
      if (editResult.updateFeatureResults.length > 0) {
        if (editResult.updateFeatureResults[0].error) {
          setErrorMessage(editResult.updateFeatureResults[0].error.message)
        } else {
          updateRecord(clonedRecord, fieldInfo)
        }
      }
    }).catch((error) => {
      setErrorMessage(error.message)
    })
  }

  const setErrorMessage = (message: string) => {
    const hasExistingError = errorMsg.length > 0
    let newErrorCount = errorCount
    if (hasExistingError && message.length === 0) {
      newErrorCount--
    }
    if (!hasExistingError && message.length > 0) {
      newErrorCount++
    }
    dispatch({ type: 'SET_ERROR_COUNT', value: newErrorCount })
    setErrorMsg(message)
  }

  const updateCurrentValue = (value: string | number) => {
    setCurrentValue(value)
  }

  const updateAndApplyEdit = (value: string | number, errorMsg: string) => {
    applyEdit(value, errorMsg)
    setModifiedValue(value)
    setIsSelected(false)
  }
  //#endregion

  //#region Render
  return (
    <CalciteTableCell className={classNames('dyn-seg-cell', isCellEdited ? 'edited' : '', isCellEditable ? '' : 'non-editable', hasError ? 'error' : '')}>
      <div ref={focusRef} style={{ minWidth: getWidth(), maxWidth: '224px' }}>
        {isVisible && (
          <div className='dyn-seg-cell-content h-100 d-flex' tabIndex={-1}>

            {!isSelected && (
              <div onDoubleClick={handleDoubleClick} className='d-flex'>
                <Label size="sm" className='text-truncate w-100 label2' style={{ textOverflow: 'ellipse', minWidth: getWidth(), maxWidth: '200px', textWrap: 'nowrap', marginBottom: 0, alignItems: 'center', textAlign: 'left' }} >
                  {getFieldLabel()}
                </Label>
                {errorMsg.length > 0 &&
                  <Icon icon={iconWarning} size={16} title={errorMsg} color='red' style={{ alignSelf: 'center', marginLeft: '4px', marginRight: '4px' }} />}
              </div>
            )}
            {/* 1. Text fields */}
            {isSelected && fieldType === 'text' && (
              <TextInput
                size='sm'
                style={{ minWidth: getWidth() }}
                className='w-100'
                autoFocus
                required={!field.nullable}
                value={currentValue}
                type={'text'}
                onChange={(e) => { updateCurrentValue(e.currentTarget.value) }}
                checkValidityOnAccept={validateValueChanged}
              />
            )}
            {/* 2. Numeric fields */}
            {isSelected && fieldType === 'number' && (
              <NumericInput
                size='sm'
                style={{ minWidth: getWidth() }}
                className='w-100'
                autoFocus
                showHandlers={false}
                required={!field.nullable}
                value={currentValue}
                onAcceptValue={onNumericChange}
              />
            )}
            {/* 2. Date fields */}
            {isSelected && fieldType === 'date' && (
              <CalciteInputDatePicker
                scale="s"
                style={{ minWidth: getWidth() }}
                valueAsDate={isDefined(currentValue) ? new Date(currentValue) : null}
                onCalciteInputDatePickerChange={validateDateChanged}
                placement='top'
                overlayPositioning='fixed'
                focusTrapDisabled
              />
            )}
            {/* 3. Coded value domains */}
            {isSelected && fieldType === 'domain' && (
              <Select
                size='sm'
                className='w-100'
                style={{ minWidth: getWidth() }}
                value={currentValue}
                onChange={(value) => { onSelectChange(value) }}>
                {options()}
              </Select>
            )}
            {/* 4. Subtypes */}
            {isSelected && fieldType === 'subtype' && (
              <Select
                size='sm'
                style={{ minWidth: getWidth() }}
                className='w-100'
                value={currentValue}
                onChange={(value) => { onSelectChange(value) }}>
                {subtypeCodedValue.map((element, i) => {
                  return (
                    <option key={i} value={element.value}>{getDropDownLabel(element.label, element.value)}</option>
                  )
                })
                }
                </Select>
            )}
            {/* 5. Ranges */}
            {isSelected && fieldType === 'range' && (
              <TextInput
                size='sm'
                className='w-100'
                style={{ minWidth: getWidth() }}
                autoFocus
                required={!field.nullable}
                value={currentValue as string}
                onChange={(e) => { updateCurrentValue(e.currentTarget.value) }}
                checkValidityOnAccept={validateRangeChanged}
              />
            )}
          </div>
        )}
      </div>
    </CalciteTableCell>
  )
  //#endregion
}
