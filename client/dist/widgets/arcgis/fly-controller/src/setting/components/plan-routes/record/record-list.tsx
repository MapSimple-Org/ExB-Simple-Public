/** @jsx jsx */
import {
  React, jsx, lodash, type SerializedStyles,
  type IMThemeVariables, css, type IntlShape, defaultMessages as jimuCoreNls
} from 'jimu-core'
import type { RecordConfig } from '../../../../common/fly-facade/plan-routes/record/record'
import { ControllerMode } from '../../../../common/fly-facade/controllers/base-fly-controller'
import type { JimuMapView } from 'jimu-arcgis'
import type { FlyIds } from '../../../../common/fly-facade/fly-manager'
import nls from '../../../translations/default'
import { List, type ListItemsType, type TreeItemsType, type TreeItemType, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { isDefined } from '../../../../common/utils/utils'
// resources
import editOutlined from 'jimu-icons/svg/outlined/editor/edit.svg'
import playCircleOutlined from 'jimu-icons/svg/outlined/editor/play-circle.svg'
import stopCircleOutlined from 'jimu-icons/svg/outlined/editor/stop-circle.svg'
import trashOutlined from 'jimu-icons/svg/outlined/editor/trash.svg'
import pinEsriOutlined from 'jimu-icons/svg/outlined/gis/pin-esri.svg'
import polylineOutlined from 'jimu-icons/svg/outlined/gis/polyline.svg'

interface Props {
  records: RecordConfig[]
  mapPopperJimuMapView: JimuMapView
  isTerrainLoaded: boolean

  theme: IMThemeVariables
  intl: IntlShape

  playingInfo: FlyIds

  onRecordEdit: (ids: FlyIds) => void
  onRecordPreview: (ids: FlyIds) => void
  onPauseRecordPreview: (ids: FlyIds, avoidTrigger?: boolean) => void
  onRecordDelete: (ids: FlyIds) => void
  onRecordsOrderUpdate: (treeItems: TreeItemsType) => void

  isRecordCanPlay: (record: RecordConfig) => boolean

  // high light for L2 record ,#6414
  onRecordHighlight: (ids: FlyIds) => void
  highlightL2RecordId: string
}
interface States {
  listItems: ListItemsType
}

export class RecordList extends React.PureComponent<Props, States> {
  constructor (props) {
    super(props)

    this.state = {
      listItems: null
    }
  }

  componentDidMount (): void {
    this.setState({ listItems: this.mapRoutesToListItems(this.props.records) }, () => {
      this.updateListItemsByPlayingInfo()
    })
  }

  componentDidUpdate (prevProps: Props, prevState: States): void {
    // update list
    if (!lodash.isDeepEqual(this.props.records, prevProps.records)) {
      this.setState({ listItems: this.mapRoutesToListItems(this.props.records) })
    }
    // update play/pause btn state
    if (this.props.playingInfo !== prevProps.playingInfo) {
      this.updateListItemsByPlayingInfo()
    }
    // isTerrainLoaded
    if (this.props.isTerrainLoaded !== prevProps.isTerrainLoaded) {
      this.updateListItemsByPlayingInfo()
    }
    // high light
    if (prevProps.highlightL2RecordId !== this.props.highlightL2RecordId) {
      this.setState({ listItems: this.mapRoutesToListItems(this.props.records) }, () => {
        // reset record highlight for "preview route" ,#6414
        this.updateListItemsByPlayingInfo()
      })
    }
  }

  getStyle = (): SerializedStyles => {
    return css`
      .record-list {
        .is-available{
        }
        .not-available{
          background-color: red;
        }
      }
      `
  }

  handleRecordEdit = (idx: string): void => {
    this.props.onRecordEdit({ routeUuid: null, recordUuid: idx })
  }

  handleRecordPreview = (idx: string): void => {
    this.props.onRecordPreview({ routeUuid: null, recordUuid: idx })
  }

  handlePauseRecordPreview = (idx: string): void => {
    // const avoidTrigger = false;
    this.props.onPauseRecordPreview({ routeUuid: null, recordUuid: idx })
  }

  handleRecordDelete = (idx: string): void => {
    this.props.onRecordDelete({ routeUuid: null, recordUuid: idx })
  }

  handleRecordHighlight = (idx: string): void => {
    this.props.onRecordHighlight({ routeUuid: null, recordUuid: idx })
  }

  render (): React.ReactElement {
    return (isDefined(this.state.listItems) &&
      <div css={this.getStyle()}>
        {(isDefined(this.props.records) &&
          <div className='record-list d-flex'>
            <List
              className='w-100'
              itemsJson={this.state.listItems}
              dndEnabled
              onUpdateItem={(actionData, refComponent) => {
                if (actionData.updateType === TreeItemActionType.HandleDidDrop) {
                  const [, nextItemsJson] = actionData.itemJsons
                  this.props.onRecordsOrderUpdate([...nextItemsJson])
                }
              }}
              overrideItemBlockInfo={({ itemBlockInfo }) => {
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
              onClickItemBody={(actionData, refComponent) => {
                const { itemJsons } = refComponent.props
                const itemKey = itemJsons[0].itemKey // target item

                this.handleRecordHighlight(itemKey)
              }}
            // onClickItemCommand={(actionData, refComponent) => {
            //   const { command, itemCommands } = actionData
            //   if ([1, 2].includes(itemCommands.indexOf(command))) {
            //     [itemCommands[1].collapsed, itemCommands[2].collapsed] = [itemCommands[2].collapsed, itemCommands[1].collapsed]//switch icons
            //   }
            //  tree edited state so update it
            //  this.setState({ listItems: this.state.listItems });
            // }}
            />
          </div>)}
      </div>)
  }

  mapRoutesToListItems = (records: RecordConfig[]): TreeItemsType => {
    // const pointStyleLabel = this.props.intl.formatMessage({ id: 'pointStyle', defaultMessage: nls.pointStyle });
    // const pathStyleLabel = this.props.intl.formatMessage({ id: 'pathStyle', defaultMessage: nls.pathStyle });
    const editLabel = this.props.intl.formatMessage({ id: 'editElement', defaultMessage: nls.editElement })
    const previewLabel = this.props.intl.formatMessage({ id: 'previewElement', defaultMessage: nls.previewElement })
    const stopLabel = this.props.intl.formatMessage({ id: 'stopPreview', defaultMessage: nls.stopPreview })
    const deleteLabel = this.props.intl.formatMessage({ id: 'delete', defaultMessage: jimuCoreNls.delete })

    const listItems = records?.map((record: RecordConfig/*, keyIdx */) => {
      let headIcon
      if (record.type === ControllerMode.Rotate) {
        headIcon = { icon: pinEsriOutlined } // title={pointStyleLabel}
      } else if (record.type === ControllerMode.Smoothed || record.type === ControllerMode.RealPath) {
        headIcon = { icon: polylineOutlined } // title={pathStyleLabel}
      }

      return {
        itemStateChecked: (record.idx === this.props.highlightL2RecordId),
        itemStateIcon: headIcon,
        itemKey: record.idx,
        itemStateTitle: record.displayName,
        itemStateDisabled: false,
        itemStateCommands: [
          { // [0]
            label: editLabel,
            iconProps: () => ({ icon: editOutlined }),
            action: (data) => {
              this.handleRecordEdit(data.data.itemJsons[0].itemKey)
            }
          }, { // [1]
            label: previewLabel,
            collapsed: false,
            iconProps: () => ({ icon: playCircleOutlined }),
            action: (data) => {
              this.handleRecordPreview(data.data.itemJsons[0].itemKey)
            }
          }, { // [2]
            label: stopLabel,
            collapsed: true,
            iconProps: () => ({ icon: stopCircleOutlined }),
            action: (data) => {
              this.handlePauseRecordPreview(data.data.itemJsons[0].itemKey)
            }
          }, { // [3]
            label: deleteLabel,
            iconProps: () => ({ icon: trashOutlined }),
            action: (data) => {
              this.handleRecordDelete(data.data.itemJsons[0].itemKey)
            }
          }
        ]
      }
    })

    return listItems
  }

  // switch play/pause btn state
  updateListItemsByPlayingInfo = (): void => {
    const listItems: ListItemsType = this.state.listItems?.map((item: TreeItemType/*, keyIdx */) => {
      const { itemKey, itemStateCommands } = item

      // isPlaying
      const isPlaying = (itemKey === this.props.playingInfo?.recordUuid)
      if (isPlaying) {
        itemStateCommands[1].collapsed = true// app-launch icon
        itemStateCommands[2].collapsed = false// record-stop icon
      } else {
        itemStateCommands[1].collapsed = false
        itemStateCommands[2].collapsed = true
      }

      // isTerrainLoaded
      item.itemStateDisabled = !this.props.isTerrainLoaded

      return item
    })

    this.setState({ listItems: listItems })
  }
}
