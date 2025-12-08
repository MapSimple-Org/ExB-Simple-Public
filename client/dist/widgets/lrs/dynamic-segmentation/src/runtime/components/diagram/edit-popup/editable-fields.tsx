/** @jsx jsx */
import { type DataSource, React, hooks, jsx } from 'jimu-core'
import defaultMessages from '../../../translations/default'
import { Label } from 'jimu-ui'
import type { TrackRecord } from 'widgets/lrs/dynamic-segmentation/src/config'
import { getCalciteBasicTheme, getDateWithoutTZOffset, getDateWithTZOffset, isDefined, type EventInfo } from 'widgets/shared-code/lrs'
import FeatureForm from 'esri/widgets/FeatureForm'
import FormTemplate from 'esri/form/FormTemplate'
import FieldElement from 'esri/form/elements/FieldElement'
import DateTimePickerInput from 'esri/form/elements/inputs/DateTimePickerInput'
import { CalciteButton } from 'calcite-components'
import { getTheme } from 'jimu-theme'
import { useDynSegRuntimeState } from '../../../state'

export interface EditableFieldsProps {
  trackRecord: TrackRecord
  eventInfo: EventInfo
  eventRecords: __esri.Graphic[]
  featureLayer: __esri.FeatureLayer
  eventFields: __esri.Field[]
  currentRecord: __esri.Graphic
  onApply: (trackRecord: TrackRecord) => void
}

export const EditableFields = React.forwardRef((props: EditableFieldsProps, ref) => {
  const { trackRecord, eventInfo, eventRecords, featureLayer, eventFields, currentRecord, onApply } = props
  const [formChange, setFormChange] = React.useState(false)
  const [formSubmittable, setFormSubmittable] = React.useState(false)
  const [editRecord, setEditRecord] = React.useState<__esri.Graphic>(currentRecord)
  const form = React.useRef<FeatureForm>(null)
  const theme = getTheme()
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { networkDS } = useDynSegRuntimeState()

  React.useImperativeHandle(ref, () => ({
    isEditPending: () => { return !getIsDisabled() },
    applyEdit: () => { handleSubmit() }
  }))

  const adjustRecordWithDateOffset = React.useCallback((record: __esri.Graphic, eventFields: __esri.Field[], networkDS: DataSource): __esri.Graphic =>{
    if (isDefined(record) && isDefined(record.attributes)) {
      Object.keys(record.attributes).forEach((key) => {
        const field = eventFields.find(f => f.name === key)
        const value = record.attributes[key]
        if (field?.type === 'date' && isDefined(value)) {
          const dateValue = new Date(value)
          const dateWithOffset = getDateWithTZOffset(dateValue.valueOf(), networkDS).valueOf()
          record.attributes[key] = dateWithOffset
        }
      })
    }
    return record
  }, [])

  React.useEffect(() => {
    setEditRecord(adjustRecordWithDateOffset(currentRecord, eventFields, networkDS))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustRecordWithDateOffset, currentRecord])

  const getFormTemplate = (): FormTemplate => {
    const fieldInfos = []

    let attributeKeys = [...trackRecord.attributes.keys()]
    attributeKeys = attributeKeys.filter((key) => key !== eventInfo.eventIdFieldName)

    // Only show fields from attribute set
    for (let i = 0; i < eventFields.length; i++) {
      if (eventFields[i].editable) {
        if (attributeKeys.includes(eventFields[i].name)) {
          if (eventFields[i].type === 'date') {
            // Date fields should not include time
            const fieldElement = new FieldElement({
              fieldName: eventFields[i].name,
              label: eventFields[i].alias,
              input: new DateTimePickerInput({ includeTime: false })
            })
            fieldInfos.push(fieldElement)
          } else {
            const fieldElement = new FieldElement({
              fieldName: eventFields[i].name,
              label: eventFields[i].alias,
              editableExpression: 'true'
            })
            fieldInfos.push(fieldElement)
          }
        }
      }
    }

    // create form template with attribute set fields
    const formTemplate = new FormTemplate({
      elements: fieldInfos
    })

    return formTemplate
  }

  React.useEffect(() => {
    if (isDefined(featureLayer) && isDefined(editRecord)) {
      if (featureLayer && eventRecords.length > 0) {
        // Create FeatureForm
        const container = document.getElementById('formDiv')
        form.current = new FeatureForm({
          container: container,
          layer: featureLayer,
          feature: editRecord,
          formTemplate: getFormTemplate()
        })
        form.current.on('submit', (event: __esri.FeatureFormSubmitEvent) => {
          const { invalid, values } = event
          // If there are invalid values, do not apply the changes
          if (invalid.length) {
            return
          }

          // Update the track record with the new values
          const keys = Object.keys(values)
          keys.forEach((key) => {
            if (trackRecord.attributes.has(key)) {
              if (eventFields.find(f => f.name === key)?.type === 'date') {
                // Remove any date offset before applying the date value
                const adjustedDate = getDateWithoutTZOffset(values[key], networkDS).valueOf()
                trackRecord.attributes.set(key, adjustedDate)
              } else {
                trackRecord.attributes.set(key, values[key])
              }
            }
          })

          // Update form inputs and apply the change
          editRecord.attributes = values
          setFormChange(false)
          setEditRecord(editRecord)
          onApply(trackRecord)
        })
        form.current.on('value-change', (changedValue) => {
          const { feature, fieldName, value } = changedValue

          // Check if the form is submittable.
          const formSubmittable = (form.current.viewModel)?.submittable
          setFormSubmittable(formSubmittable)

          // If the value has changed, set the form change flag
          if (value !== feature?.attributes?.[fieldName]) {
            setFormChange(true)
          } else {
            setFormChange(false)
          }
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRecord])

  const getIsDisabled = (): boolean => {
    return !formChange || !formSubmittable
  }

  const handleSubmit = () => {
    form.current.viewModel?.submit()
  }

  return (
  <div
    className="editable-fields d-flex w-100 h-100"
    style={{ flexDirection: 'column' }}>
    <div
      style={{ background: theme.sys.color.surface.paper }}
      css={getCalciteBasicTheme()}>
      <Label
      size='lg'
      centric
      className='title3'
      style={{
        paddingLeft: '15px',
        margin: '0px'
      }}>
        {getI18nMessage('editableFields')}
      </Label>
      <div
        id='formDiv'
        style={{
          width: '100%',
          backgroundColor: theme.sys.color.surface.paper
        }}/>
      <CalciteButton
        style={{ padding: '0px 15px 15px 15px' }}
        appearance='solid'
        scale='m'
        width='full'
        alignment='center'
        kind='brand'
        disabled={getIsDisabled() ? true : undefined}
        label={getI18nMessage('apply')}
        onClick={handleSubmit}>
        {getI18nMessage('apply')}
      </CalciteButton>
    </div>
  </div>
  )
})
