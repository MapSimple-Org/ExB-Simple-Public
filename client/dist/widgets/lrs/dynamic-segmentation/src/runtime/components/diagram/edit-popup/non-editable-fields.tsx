/** @jsx jsx */
import { hooks, jsx } from 'jimu-core'
import defaultMessages from '../../../translations/default'
import { Label } from 'jimu-ui'
import type { SubtypeLayers } from 'widgets/lrs/dynamic-segmentation/src/config'
import { CalciteTable, CalciteTableCell, CalciteTableHeader, CalciteTableRow } from 'calcite-components'
import { getCalciteBasicTheme, getExistingFieldNames, isDefined, type EventInfo } from 'widgets/shared-code/lrs'
import { convertFieldValueToType } from '../../../utils/diagram-utils'
import { getTheme } from 'jimu-theme'
import { useDynSegRuntimeState } from '../../../state'

export interface NonEditableFieldsProps {
  eventInfo: EventInfo
  allowEditing?: boolean
  eventFields: __esri.Field[]
  subtypeLayers: SubtypeLayers[]
  featureLayer: __esri.FeatureLayer
  currentRecord: __esri.Graphic
}

export function NonEditableFields (props: NonEditableFieldsProps) {
  const { eventInfo, allowEditing, eventFields, subtypeLayers, featureLayer, currentRecord } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { networkDS } = useDynSegRuntimeState()
  const theme = getTheme()

  const getLrsFields = (): __esri.Field[] => {
    if (!isDefined(currentRecord)) {
      return []
    }

    let fieldsToFilter = getExistingFieldNames().map(f => f.toUpperCase())
    // filter editor tracking fields, object id, global id and shape length fields
    fieldsToFilter = fieldsToFilter.concat([
      featureLayer?.editFieldsInfo?.creationDateField,
      featureLayer?.editFieldsInfo?.creatorField,
      featureLayer?.editFieldsInfo?.editorField,
      featureLayer?.editFieldsInfo?.editDateField,
      featureLayer?.objectIdField,
      featureLayer?.globalIdField
    ].filter(Boolean).map(f => f.toUpperCase()))

    const fields = eventFields.filter(
    (field) =>
      !(
        fieldsToFilter.includes(field.name.toUpperCase()) ||
        fieldsToFilter.includes(field.alias.toUpperCase())
      )
    )

    if (allowEditing) {
      // editable fields are already shown so show only non editable fields
      const nonEditableFields = fields.filter((field) => !field.editable)
      const lrsFieldNames = eventInfo.lrsFields.map((lrsField) => lrsField.alias)
      let lrsFields = eventFields.filter((field) => lrsFieldNames.includes(field.alias))
      lrsFields = lrsFields.concat(nonEditableFields)
      return lrsFields
    } else {
      // show all filtered fields
      return fields
    }
  }

  const getFieldValue = (field: __esri.Field): string => {
    if (isDefined(currentRecord)) {
      const value = currentRecord.attributes[field.name]
      return convertFieldValueToType(field, featureLayer, value, subtypeLayers, networkDS)
    }
  }

  return (
  <div
    className="non-editable-fields d-flex w-100 h-100"
    style={{
      flexDirection: 'column',
      paddingTop: '15px'
    }}>
    <div
      style={{
        background: theme.sys.color.surface.paper,
        padding: '0px 15px 15px 15px'
      }}
      css={getCalciteBasicTheme()}>
      <Label
        size='lg'
        centric
        className='title3'
        style={{
          margin: '0px'
        }}>
        {allowEditing ? getI18nMessage('nonEditableFields') : getI18nMessage('fieldsLabel')}
      </Label>
      <CalciteTable
        caption={getI18nMessage('nonEditableFields')}
        bordered className='table-container'
        scale='m'
        layout='fixed'>
        <CalciteTableRow slot='table-header'>
          <CalciteTableHeader heading={getI18nMessage('attribute')}/>
          <CalciteTableHeader heading={getI18nMessage('value')}/>
        </CalciteTableRow>
        {getLrsFields().map((field, index) => {
          return (
            <CalciteTableRow key={index}>
              <CalciteTableCell alignment='center'>
                <div className='w-100 d-flex'>
                  <Label
                    title={field.alias}
                    className='text-truncate label2'
                    style={{
                      textOverflow: 'ellipsis',
                      marginBottom: 0,
                      alignItems: 'center',
                      textAlign: 'left'
                    }} >
                    {field.alias}
                  </Label>
                </div>
              </CalciteTableCell>
              <CalciteTableCell alignment='center'>
                <div className='w-100 d-flex'>
                  <Label
                    title={getFieldValue(field)}
                    className='text-truncate label2'
                    style={{
                      textOverflow: 'ellipsis',
                      marginBottom: 0,
                      alignItems: 'center',
                      textAlign: 'left'
                    }} >
                    {getFieldValue(field)}
                  </Label>
                </div>
              </CalciteTableCell>
            </CalciteTableRow>
          )
        })}
      </CalciteTable>
    </div>
  </div>
  )
}
