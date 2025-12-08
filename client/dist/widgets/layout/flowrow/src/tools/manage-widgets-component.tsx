/** @jsx jsx */
import { ReactRedux, jsx, type IMThemeVariables, type IMState, LayoutItemType, css, lodash, hooks } from 'jimu-core'
import { SortTree } from 'jimu-ui/advanced/setting-components'
import type { UpdateTreeActionDataType, TreeItemType, TreeCheckDropItemActionDataType } from 'jimu-ui/basic/list-tree'
import { useTheme } from 'jimu-theme'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { removeLayoutItem, widgetToolbarStateChange } from './utils'
import { getAppConfigAction } from 'jimu-for-builder'

const getStyles = (theme: IMThemeVariables) => css`
width: 300px;
height: 400px;
overflow-y: auto;
padding: ${theme.sys.spacing[4]};
.jimu-tree-item__main-line {
  height: 32px;
  background-color: ${theme.ref.palette.neutral[500]};
  &:hover {
    background-color: ${theme.ref.palette.neutral[600]};
  }
  color: ${theme.ref.palette.neutral[1100]};
}
.jimu-tree-item__body {
  border: none !important;
}
`

const isItemDroppable = (actionData: TreeCheckDropItemActionDataType) => {
  const { dropType } = actionData
  return dropType !== 'to-inside'
}

export const ManageWidgetsComponent = (props: ToolSettingPanelProps) => {
  const { widgetId } = props

  const translate = hooks.useTranslation()

  const layoutId = ReactRedux.useSelector((state: IMState): string => {
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    const widgetJson = appState.appConfig.widgets[widgetId]
    return widgetJson.layouts.DEFAULT[appState.browserSizeMode]
  })

  const widgetTreeJson = ReactRedux.useSelector((state: IMState): TreeItemType => {
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    const layoutJson = appState.appConfig.layouts[layoutId]
    const content = [...layoutJson.order].map((itemId) => {
      const item = layoutJson.content[itemId]
      let label = ''
      if (item.type === 'WIDGET') {
        label = item.widgetId ? appState.appConfig.widgets[item.widgetId].label : translate('placeholder')
      } else if (item.type === LayoutItemType.Section) {
        label = appState.appConfig.sections[item.sectionId].label
      }
      return { itemKey: `${layoutId},${itemId}`, itemStateTitle: label }
    })
    return { itemKey: widgetId, itemChildren: content }
  }, ReactRedux.shallowEqual)

  const onTreeSort = (actionData: UpdateTreeActionDataType) => {
    const { targetDropItemIndex, dragItemJsons } = actionData
    // adjust order
    const appConfigActions = getAppConfigAction()
    const [layoutId, layoutItemId] = dragItemJsons[0].itemKey.split(',')
    appConfigActions.adjustOrderOfItem({ layoutId, layoutItemId }, targetDropItemIndex).exec()
  }

  const onTreeRemove = (item: TreeItemType) => {
    const [layoutId, layoutItemId] = item.itemKey.split(',')
    const layoutInfo = { layoutId, layoutItemId }
    removeLayoutItem(layoutInfo, widgetId)
    lodash.defer(() => {
      widgetToolbarStateChange(widgetId, ['flowrow-manage-widgets'])
    })
  }

  const theme = useTheme()

  return (<div css={getStyles(theme)}>
    <SortTree
      rootItemJson={widgetTreeJson}
      isItemDroppable={isItemDroppable}
      onSort={onTreeSort}
      onRemove={onTreeRemove}
    />
  </div>)
}

