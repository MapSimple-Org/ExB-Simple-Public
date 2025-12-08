/** @jsx jsx */
import {
  jsx, css, type WidgetInitResizeCallback, type WidgetInitDragCallback,
  type IMState, type MobileSidePanelContentOptions, ReactRedux,
  hooks,
  type IMThemeVariables
} from 'jimu-core'
import { Button, Tooltip, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { getAppConfigAction } from 'jimu-for-builder'
import { type NavTemplate, useNavigationViews, useViewsWithLabel } from '../utils'
import type { IMViewNavigationDisplay } from '../components/view-navigation'
import { type IMConfig, ViewType } from '../../config'
import { type _TreeItem, List, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { useTheme } from 'jimu-theme'

export interface NavQuickStyleProps {
  templates: NavTemplate[]
  display: IMViewNavigationDisplay
  usePopper?: boolean
  onChange: (template: NavTemplate) => void
  onInitResizeHandler?: WidgetInitResizeCallback
  onInitDragHandler?: WidgetInitDragCallback
}

const getStyles = (theme: IMThemeVariables) => css`
  width: 300px;
  height: 350px;
  overflow-y: auto;
  .jimu-tree-main {
    padding: 4px;
  }
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

const ManageViews = (props: ToolSettingPanelProps | MobileSidePanelContentOptions) => {
  const { widgetId } = props

  const translate = hooks.useTranslation(jimuUIDefaultMessages)
  const theme = useTheme()

  const config = ReactRedux.useSelector((state: IMState) => {
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState.appConfig.widgets[widgetId]?.config as IMConfig
  })
  const data = config?.data
  const views = useNavigationViews(data?.section, data?.views, data?.type)
  const viewsWithLabel = useViewsWithLabel(views)

  const isAuto = data?.type === ViewType.Auto

  const onRemove = (item: TreeItemType) => {
    getAppConfigAction().removeView(item.itemKey, data?.section).exec()
  }

  const onSort = (viewIds: string[]) => {
    getAppConfigAction().editSectionProperty(data?.section, 'views', viewIds).exec()
  }

  return <div className='p-3' css={getStyles(theme)}>
    <List
      size='default'
      itemsJson={viewsWithLabel.map((item) => {
        return {
          itemKey: item.id,
          itemStateTitle: item.label,
          itemStateDisabled: viewsWithLabel?.length === 1
        }
      })}
      dndEnabled={isAuto}
      isMultiSelection={false}
      renderOverrideItemCommands={(actionData, refComponent: _TreeItem) => {
        const item = refComponent.props.itemJsons[0]
        const canDelete = !item?.itemStateDisabled
        return canDelete
          ? <Tooltip title={translate('deleteOption')}>
              <Button className='p-0' onClick={() => { onRemove(item) }} type='tertiary' icon>
                <CloseOutlined size='s' />
              </Button>
            </Tooltip>
          : null
      }}
      onDidDrop={(actionData, refComponent) => {
        const { itemJsons } = refComponent.props
        const [, listItemJsons] = itemJsons as [TreeItemType, TreeItemsType]

        const sortedViews = listItemJsons.map(item => item.itemKey)
        const orderChanged = sortedViews.join(',') !== views.join(',')
        if (orderChanged) {
          onSort(sortedViews)
        }
      }}
    />
  </div>
}

export default ManageViews
