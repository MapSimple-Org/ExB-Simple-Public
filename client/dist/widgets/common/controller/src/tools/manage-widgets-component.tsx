import { type IMState, React, ReactRedux, css } from 'jimu-core'
import { SortTree } from 'jimu-ui/advanced/setting-components'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import type { TreeDropItemActionDataType, TreeItemType, UpdateTreeActionDataType } from 'jimu-ui/basic/list-tree'
import { getWidgetTreeJson, isWidgetDroppable, removeWidgetInTree, sortWidgetInTree } from './utils'
import { BASE_LAYOUT_NAME } from '../common/consts'
import { getWidgetChildLayoutJson } from '../runtime/common/layout-utils'

const style = css`
width: 300px;
height: 400px;
overflow-y: auto;
padding: var(--sys-spacing-4);
.jimu-tree-item__main-line {
  height: 32px;
  background-color: var(--ref-palette-neutral-500);
  &:hover {
    background-color: var(--ref-palette-neutral-600);
  }
  color: var(--ref-palette-neutral-1100);
}
.jimu-tree-item__body {
  border: none !important;
}
`

export const ManageWidgetsComponent = (props: ToolSettingPanelProps) => {
  const { widgetId: controllerId } = props

  const layouts = ReactRedux.useSelector((state: IMState) => {
      const appState = state.appStateInBuilder || state
      if (!appState) return
      const layouts = appState.appConfig.layouts
      return layouts
    })

  const widgetTreeJson = React.useMemo(() => {
    const controllerLayout = getWidgetChildLayoutJson(controllerId, BASE_LAYOUT_NAME)
    return getWidgetTreeJson(controllerId, controllerLayout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controllerId, layouts])

  const onSort = React.useCallback((actionData: UpdateTreeActionDataType & TreeDropItemActionDataType) => {
    sortWidgetInTree(controllerId, actionData)
  }, [controllerId])

  const onRemove = React.useCallback((item: TreeItemType) => {
    removeWidgetInTree(controllerId, item)
  }, [controllerId])

  return (<div css={style}>
    <SortTree
      rootItemJson={widgetTreeJson}
      isItemDroppable={isWidgetDroppable}
      onSort={onSort}
      onRemove={onRemove}
    />
  </div>)
}
