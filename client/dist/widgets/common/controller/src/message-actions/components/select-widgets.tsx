import { React, ReactRedux, hooks, type ImmutableArray, type IMState } from 'jimu-core'
import { Select, Option, MultiSelect, defaultMessages as jimuUIDefaultMessages, MultiSelectItem } from 'jimu-ui'
import { useControlledWidgets } from '../../setting/setting'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import type { IMConfig } from '../../config'

interface SelectWidgetsProps {
  widgetId: string
  selectedWidgetIds: ImmutableArray<string>
  onChange: (widgets: Array<string | number>) => void
}

export default function SelectWidgets (props: SelectWidgetsProps) {
  const { widgetId, selectedWidgetIds, onChange } = props

  const isSingle = ReactRedux.useSelector((state: IMState) => {
    const widgetConfig = state.appStateInBuilder.appConfig.widgets[widgetId]?.config as IMConfig
    return widgetConfig?.behavior?.onlyOpenOne
  })
  const controlledWidgets = useControlledWidgets(widgetId, BASE_LAYOUT_NAME)

  const handleSelect = React.useCallback((_e: any, value: string) => {
    onChange([value])
  }, [onChange])
  const handleMultiSelect = React.useCallback((value: string | number, selectedValues: Array<string | number>) => {
    onChange(selectedValues)
  }, [onChange])

  const translate = hooks.useTranslation(jimuUIDefaultMessages)

  const displayByValues = React.useCallback((value: string[]): string => {
    return translate('numSelected', { number: value.length })
  }, [translate])

  React.useEffect(() => {
    if (isSingle && selectedWidgetIds.length > 1) {
      onChange([selectedWidgetIds[0]])
    }
    if (isSingle && selectedWidgetIds.length === 0 && controlledWidgets.length > 0) {
      onChange([controlledWidgets[0].value])
    }
  }, [controlledWidgets, isSingle, onChange, selectedWidgetIds])

  return <React.Fragment>
    {isSingle && <Select value={selectedWidgetIds[0] || ''} onChange={handleSelect}>
      {controlledWidgets.map(w =>
        <Option value={w.value} key={w.value}>
          {w.label}
        </Option>
      )}
    </Select>}
    {!isSingle && (
        <MultiSelect
          values={selectedWidgetIds || []}
          className='pt-1 custom-multiselect'
          displayByValues={displayByValues}
          onChange={handleMultiSelect}
        >
          {controlledWidgets.map((widget) => {
            return (<MultiSelectItem key={widget.value} value={widget.value} label={widget.label}/>)
          })}
        </MultiSelect>
      )}
  </React.Fragment>
}
