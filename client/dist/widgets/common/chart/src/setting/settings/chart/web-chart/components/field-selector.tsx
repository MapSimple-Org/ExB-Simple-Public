/** @jsx jsx */
import {
  React,
  jsx,
  css,
  Immutable,
  JimuFieldType,
  type ImmutableArray,
  type UseDataSource,
  type IMFieldSchema,
  DataSourceManager,
  EsriFieldType,
  hooks
} from 'jimu-core'
import type { AdvancedSelectProps } from 'jimu-ui'
import { FieldSelector as JimuFieldSelector } from 'jimu-ui/advanced/data-source-selector'
import { useDebouncedCallback } from '../../../utils'

export type FieldSelectorType = 'numeric' | 'data' | 'category'

const getFieldSelectorType = (type: FieldSelectorType, hideDateField?: boolean): ImmutableArray<JimuFieldType> => {
  switch (type) {
    case 'numeric':
      return Immutable([JimuFieldType.Number])
    case 'data':
      return Immutable([JimuFieldType.Date])
    case 'category':
      if (hideDateField) {
        return Immutable([JimuFieldType.String, JimuFieldType.Number])
      } else {
        return Immutable([JimuFieldType.String, JimuFieldType.Date, JimuFieldType.Number])
      }
  }
}

interface FieldSelectorProps {
  'aria-label'?: string
  className?: string
  style?: any
  type: FieldSelectorType
  useDataSources: ImmutableArray<UseDataSource>
  defaultFields?: ImmutableArray<string>
  fields?: ImmutableArray<string>
  isMultiple: boolean
  showEmptyItem?: boolean
  emptyItemLabel?: string
  disabled?: boolean
  hideIdField?: boolean
  hideDateField?: boolean
  hideNonIntNumberField?: boolean
  /**
   * Whether to delay triggering on change, usually used when selecting multiple options.
   * Note: It is only valid when `defaultFields` are set instead of `fields`.
   */
  debounce?: boolean
  /**
   * Fired when fields changes.
   * @param fields
   * @param types Only return types when debounce is false.
   */
  onChange?: (fields: string[], types?: JimuFieldType[]) => void
}

const serializedStyle = css`
  .component-field-selector {
    .jimu-advanced-select {
      > .dropdown{
        > .dropdown-button {
          justify-content: flex-end;
        }
      }
    }
  }
`

export const FieldSelector = (props: FieldSelectorProps): React.ReactElement => {
  const {
    className,
    style,
    type,
    useDataSources,
    showEmptyItem,
    emptyItemLabel = '',
    disabled,
    hideIdField = false,
    hideNonIntNumberField = false,
    hideDateField = false,
    isMultiple,
    fields: propFields,
    defaultFields,
    debounce = false,
    'aria-label': ariaLabel,
    onChange
  } = props

  const [fields, setFields] = hooks.useControlled({ controlled: propFields, default: defaultFields })

  const dataSourceId = useDataSources?.[0]?.dataSourceId

  const hiddenFields = React.useMemo(() => {
    if (!dataSourceId || (!hideIdField && !hideNonIntNumberField)) return
    const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
    if (!ds) return

    let fields = Immutable([])
    if (hideIdField) {
      const idField = ds.getIdField()
      fields = fields.concat(idField)
    }
    if (hideNonIntNumberField) {
      const hideFields = Object.entries(ds.getSchema().fields).filter(([_, schema]) => {
        return schema.esriType === EsriFieldType.Single || schema.esriType === EsriFieldType.Double
      }).map(([name, _]) => name)
      fields = fields.concat(hideFields)
    }
    return fields
  }, [hideIdField, hideNonIntNumberField, dataSourceId])

  const sportedType = React.useMemo(() => getFieldSelectorType(type, hideDateField), [hideDateField, type])

  const noSelectionItem = React.useMemo(() => showEmptyItem ? { name: emptyItemLabel } : undefined, [emptyItemLabel, showEmptyItem])
  const dropdownProps: AdvancedSelectProps = React.useMemo(() => ({ disabled, size: 'sm' }), [disabled])

  const debouncedCallback = useDebouncedCallback(onChange, 500)

  const handleChange = (fieldSchemas: IMFieldSchema[]) => {
    const fields = fieldSchemas.map(e => e.jimuName)
    const types = fieldSchemas.map(e => e.type)
    setFields(Immutable(fields))
    if (debounce) {
      debouncedCallback(fields)
    } else {
      onChange(fields, types)
    }
  }

  return (
    <JimuFieldSelector
      aria-label={ariaLabel}
      css={serializedStyle}
      className={className}
      style={style}
      types={sportedType}
      hiddenFields={hiddenFields}
      noSelectionItem={noSelectionItem}
      dropdownProps={dropdownProps}
      isMultiple={isMultiple}
      isDataSourceDropDownHidden
      useMultiDropdownBottomTools={true}
      useDropdown={true}
      useDataSources={useDataSources}
      selectedFields={fields}
      onChange={handleChange}
    />
  )
}
