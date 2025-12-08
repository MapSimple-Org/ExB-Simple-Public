/** @jsx jsx */
import {
  React, jsx, css, type Immutable, lodash, type SerializedStyles, polished,
  type IMThemeVariables, type IntlShape, uuidv1, defaultMessages as jimuCoreNls
} from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { Button, defaultMessages as jimuUiNls } from 'jimu-ui'
import type { RouteItemConfig } from '../../../config'
import type { RouteConfig } from '../../../common/fly-facade/plan-routes/routes'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { FlyIds } from '../../../common/fly-facade/fly-manager'
import nls from '../../translations/default'
import { List, type ListItemsType, type TreeItemsType, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import SkeletonList from '../../../common/components/loadings/skeleton-list'
import * as utils from '../../../common/utils/utils'
// resources
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import editOutlined from 'jimu-icons/svg/outlined/editor/edit.svg'
import trashOutlined from 'jimu-icons/svg/outlined/editor/trash.svg'
import visibleOutlined from 'jimu-icons/svg/outlined/application/visible.svg'
import invisibleOutlined from 'jimu-icons/svg/outlined/application/invisible.svg'

interface Props {
  useMapWidgetIds: Immutable.ImmutableArray<string>
  jimuMapView: JimuMapView
  theme: IMThemeVariables
  intl: IntlShape

  flyModeIdx: number
  routeConfig: RouteItemConfig

  onRouteEdit: (ids: FlyIds) => void
  onRouteAdd: (routeInfo: RouteConfig, flyModeIdx: number) => void
  onRouteDelete: (ids: FlyIds) => void
  onRouteToggleVisibilityChange: (ids: FlyIds, visible: boolean) => void
  onRoutesOrderUpdate: (treeItems: TreeItemsType) => void
}
interface States {
  listItems: ListItemsType
}

export class RouteList extends React.PureComponent<Props, States> {
  constructor (props) {
    super(props)

    this.state = {
      listItems: null
    }
  }

  componentDidMount (): void {
    this.setState({ listItems: this.mapRoutesToListItems(this.props.routeConfig?.routes) })
  }

  componentDidUpdate (prevProps: Props, prevState: States): void {
    if (!lodash.isDeepEqual(this.props.routeConfig, prevProps.routeConfig)) {
      this.setState({ listItems: this.mapRoutesToListItems(this.props.routeConfig?.routes) })
    }
  }

  handleEdit = (idx: string): void => {
    this.props.onRouteEdit({ routeUuid: idx })
  }

  // handleKeydown = (e: any, ref) => {
  //   if (e.key === 'Enter') {
  //     ref.current.blur();
  //   } else {
  //     return
  //   }
  // }

  handleAddRoute = (): void => {
    const autoNamingTmpl = this.props.intl.formatMessage({ id: 'plannedRoute', defaultMessage: nls.plannedRoute })
    const name = utils.getIncreasedNameByConfig(this.props.routeConfig.routes, autoNamingTmpl)

    const newRoute = {
      idx: uuidv1(),
      isInUse: true,
      type: null,
      records: [],
      displayName: name
    }

    this.props.onRouteAdd(newRoute, this.props.flyModeIdx)
  }

  handleRouteDelete = (idx: string): void => {
    this.props.onRouteDelete({ routeUuid: idx })
  }

  handleToggleVisibility = (idx: string, visible: boolean): void => {
    this.props.onRouteToggleVisibilityChange({ routeUuid: idx }, visible)
  }

  getStyle = (theme: IMThemeVariables): SerializedStyles => {
    return css`
      .records-list {
        border: 1px solid #888;
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-bottom: ${polished.rem(4)};
        .record-name-input {
          padding: 3px 0;
          width: 110px;
        }
      }
      .records-list:hover {
        cursor: pointer;
        background: ${theme.sys.color.secondary.main};
        border-left: 2px solid ${theme.sys.color.primary.main};
      }
      `
  }

  render (): React.ReactElement {
    const { useMapWidgetIds, jimuMapView, theme, routeConfig } = this.props
    const { listItems } = this.state

    const newRouteLabel = this.props.intl.formatMessage({ id: 'newRoute', defaultMessage: nls.newRoute })

    const isShowList = utils.isDefined(useMapWidgetIds?.length) && useMapWidgetIds?.length > 0
    const isListLoading = utils.isDefined(jimuMapView) && utils.isDefined(routeConfig) && utils.isDefined(listItems)

    return (
      <React.Fragment>
        {/* level-1 */}
        <SettingRow>
          <Button
            className='w-100 d-flex align-items-center justify-content-center'
            title={newRouteLabel} aria-label={newRouteLabel}
            disabled={!isListLoading} onClick={this.handleAddRoute}
          >
            <PlusOutlined size={'s'} />{newRouteLabel}
          </Button>
        </SettingRow>

        <SettingRow>
          <div className='w-100' css={this.getStyle(theme)}>
            {(isShowList && !isListLoading) &&
              <SkeletonList placeholderNums={3} theme={this.props.theme} />}

            {(isShowList && isListLoading) &&
              <List
                className='w-100'
                itemsJson={listItems}
                dndEnabled
                onUpdateItem={(actionData, refComponent) => {
                  if (actionData.updateType === TreeItemActionType.HandleDidDrop) {
                    const [, nextItemsJson] = actionData.itemJsons
                    this.props.onRoutesOrderUpdate([...nextItemsJson])
                  }
                }}
                overrideItemBlockInfo={(/* { itemBlockInfo } */) => {
                  return {
                    name: TreeItemActionType.RenderOverrideItem,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemDroppableContainer,
                      children: [{
                        name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                        children: [{
                          name: TreeItemActionType.RenderOverrideItemBody,
                          children: [{
                            name: TreeItemActionType.RenderOverrideItemDragHandle
                          }, {
                            name: TreeItemActionType.RenderOverrideItemMainLine,
                            children: [{
                              name: TreeItemActionType.RenderOverrideItemTitle
                            }, {
                              name: TreeItemActionType.RenderOverrideItemCommands
                            }]
                          }]
                        }]
                      }]
                    }]
                  }
                }}
              />}
          </div>
        </SettingRow>
      </React.Fragment>
    )
  }

  mapRoutesToListItems = (routes: RouteConfig[]): TreeItemsType => {
    const editLabel = this.props.intl.formatMessage({ id: 'editRoute', defaultMessage: nls.editRoute })
    const deleteLabel = this.props.intl.formatMessage({ id: 'delete', defaultMessage: jimuCoreNls.delete })
    const clickToHideLabel = this.props.intl.formatMessage({ id: 'clickToHide', defaultMessage: jimuUiNls.clickToHide })
    const clickToShowLabel = this.props.intl.formatMessage({ id: 'clickToShow', defaultMessage: jimuUiNls.clickToShow })

    const listItems = routes?.map((route: RouteConfig/*, keyIdx */) => {
      const isVisible = route.isInUse
      return {
        itemKey: route.idx,
        itemStateTitle: route.displayName ?? '',
        itemStateCommands: [
          { // [0]
            label: editLabel,
            iconProps: () => ({ icon: editOutlined }),
            action: (data) => {
              this.handleEdit(data.data.itemJsons[0].itemKey)
            }
          }, { // [1]
            label: deleteLabel,
            iconProps: () => ({ icon: trashOutlined }),
            action: (data) => {
              this.handleRouteDelete(data.data.itemJsons[0].itemKey)
            }
          }, { // [2]
            label: clickToHideLabel,
            collapsed: !isVisible,
            iconProps: () => ({ icon: visibleOutlined }),
            action: (data) => {
              this.handleToggleVisibility(data.data.itemJsons[0].itemKey, false)
            }
          }, { // [3]
            label: clickToShowLabel,
            collapsed: isVisible,
            iconProps: () => ({ icon: invisibleOutlined }),
            action: (data) => {
              this.handleToggleVisibility(data.data.itemJsons[0].itemKey, true)
            }
          }
        ]
      }
    })

    return listItems
  }
}
