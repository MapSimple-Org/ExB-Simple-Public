/** @jsx jsx */
import { jsx, hooks } from 'jimu-core'
import defaultMessages from '../../translations/default'
import { CalciteTableHeader, CalciteTableRow } from 'calcite-components'
import type { DynSegFieldInfo } from '../../../config'

export interface DynSegHeaderProps {
  fieldInfo: DynSegFieldInfo[]
}

export function DynSegHeader (props: DynSegHeaderProps) {
  const { fieldInfo } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  return (
    <CalciteTableRow
      slot='table-header'
      className='dyn-seg-table-header'>
      <CalciteTableHeader
        heading={getI18nMessage('measureRange')}
        className='dyn-seg-column-header'
      />
      {fieldInfo.map((field, index) => {
        return field.visible && !field.exclude

          ? <CalciteTableHeader
            key={index}
            heading={field.originalFieldAlias}
            description={field.eventAlias}
            className='dyn-seg-column-header'
            />
          : null
      })}
    </CalciteTableRow>
  )
}
