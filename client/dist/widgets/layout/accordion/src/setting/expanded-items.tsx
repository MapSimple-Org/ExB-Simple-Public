/** @jsx jsx */
import { React, ReactRedux, getAppStore, jsx, css, hooks, LayoutItemType, type IMState } from 'jimu-core'
import { getAppConfigAction } from 'jimu-for-builder'
import { MultiSelect, MultiSelectItem, Select } from 'jimu-ui'

export function ExpandedItems (props: { widgetId: string, tooltip: string }) {
  const { widgetId, tooltip } = props

  const translate = hooks.useTranslation()

  const contentIds = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appStateInBuilder.appConfig.widgets[widgetId]
    const sizeMode = state.appStateInBuilder.browserSizeMode
    const layoutName = Object.keys(widgetJson.layouts)[0]
    const layoutId = widgetJson.layouts[layoutName][sizeMode]
    const layoutJson = state.appStateInBuilder.appConfig.layouts[layoutId]
    const list = Object.keys(layoutJson?.content || {}).map((itemId) => {
      const layoutItem = layoutJson.content[itemId]
      if (layoutItem.isPending) {
        return ''
      }
      if (layoutItem.type === LayoutItemType.Widget && layoutItem.widgetId) {
        return `widget:${layoutItem.widgetId}`
      }
      if (layoutItem.type === LayoutItemType.Section) {
        return `section:${layoutItem.sectionId}`
      }
      return ''
    }).filter((id) => id !== '')
    list.sort()
    return list.join(',')
  })

  const expandedByDefault = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appStateInBuilder.appConfig.widgets[widgetId]
    return widgetJson.config?.expandedItems
  })

  const isSingleMode = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appStateInBuilder.appConfig.widgets[widgetId]
    return widgetJson.config?.singleMode ?? false
  })

  const allOptions = React.useMemo(() => {
    if (contentIds.length > 0) {
      const appState = getAppStore().getState().appStateInBuilder

      return contentIds.split(',').map((item) => {
        const [type, id] = item.split(':')
        if (type === 'widget') {
          return { value: id, label: appState.appConfig.widgets[id].label }
        }
        return { value: id, label: appState.appConfig.sections[id].label }
      })
    }
    return []
  }, [contentIds])

  const values = React.useMemo(() => contentIds.split(',').map(item => item.split(':')[1]).filter((id) => {
    return expandedByDefault?.length > 0 ? expandedByDefault.includes(id) : false
  }), [contentIds, expandedByDefault])

  const handleValuesChange = React.useCallback((v, values) => {
    const appConfigAction = getAppConfigAction()
    appConfigAction.editWidgetProperty(widgetId, 'config.expandedItems', values).exec()
  }, [widgetId])

  const handleValueChange = React.useCallback((e) => {
    const appConfigAction = getAppConfigAction()
    appConfigAction.editWidgetProperty(widgetId, 'config.expandedItems', [e.target.value]).exec()
  }, [widgetId])

  return (
    isSingleMode
      ? <Select aria-label={tooltip} size='sm' css={css`.jimu-dropdown { width: 100%; }`} placeholder={translate('none')} value={values[0]} onChange={handleValueChange}>
        {allOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </Select>
      : <MultiSelect aria-label={tooltip} size='sm' css={css`.jimu-dropdown { width: 100%; }`} placeholder={translate('none')} values={values} onChange={handleValuesChange}>
        {
          allOptions.map((item) => <MultiSelectItem key={item.value} value={item.value} label={item.label} />)
        }
      </MultiSelect>
  )
}
