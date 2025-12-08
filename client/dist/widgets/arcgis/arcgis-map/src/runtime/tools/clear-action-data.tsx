/** @jsx jsx */
import { css, jsx, MutableStoreManager, getAppStore, type ImmutableObject, type JimuMapViewInfo, CONSTANTS } from 'jimu-core'
import { type ShowOnMapDatas, type AddToMapDatas, type MapMutableState, ActionType, DataChangeType, type JimuMapView, type JimuLayerView } from 'jimu-arcgis'
import { Icon, Dropdown, DropdownMenu, DropdownButton, DropdownItem, defaultMessages } from 'jimu-ui'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import { MultiSourceMapContext } from '../components/multisourcemap-context'

interface State {
  isOpen: boolean
}

interface ListItem {
  layerId: string
  title: string
  isAction: boolean // true means this item comes from ShowOnMap/AddToMap actions, false means it comes from JimuLayerView
}


const exbRootLayerKey = '__exb_root_layer'

export default class ClearActionData extends BaseTool<BaseToolProps, State> {
  toolName = 'ClearActionData'
  jimuMapViewForListener: JimuMapView
  handle: __esri.Handle

  constructor (props) {
    super(props)
    this.state = { isOpen: false }
  }

  componentDidMount(): void {
    this.removeLayerListener()
    this.addLayerListener()
  }

  componentDidUpdate(prevProps: Readonly<BaseToolProps>): void {
    const preJimuMapView = prevProps?.jimuMapView || null
    const currJimuMapView = this.props?.jimuMapView || null

    if (preJimuMapView !== currJimuMapView) {
      // jimuMapView prop changed
      this.removeLayerListener()
      this.addLayerListener()
    }
  }

  componentWillUnmount(): void {
    this.removeLayerListener()
  }

  addLayerListener() {
    this.removeLayerListener()

    this.jimuMapViewForListener = this.props.jimuMapView

    if (this.jimuMapViewForListener) {
      const layerCollection = this.jimuMapViewForListener?.view?.map?.layers

      if (layerCollection) {
        // This tool only handles root layers, so we need to update layer[exbRootLayerKey] before remove layer.
        this.handle = layerCollection.on('before-remove', (evt) => {
          const layer = evt?.item

          if (layer) {
            layer[exbRootLayerKey] = false
            const parent = layer.parent

            if (parent && (parent.declaredClass === 'esri.WebMap' || parent.declaredClass === 'esri.WebScene')) {
              layer[exbRootLayerKey] = true
            }

            // marker layer is a GraphicsLayer, it doesn't have JimuLayerView, so it doesn't trigger onJimuLayerViewRemoved,
            // we need to call this.forceUpdate() here for marker layer
            if (layer.id === CONSTANTS.ADD_MARKER_LAYER_ID) {
              this.forceUpdate()
            }
          }
        })
      }

      this.jimuMapViewForListener.addJimuLayerViewRemovedListener(this.onJimuLayerViewRemoved)
    }
  }

  removeLayerListener() {
    if (this.handle) {
      this.handle.remove()
      this.handle = null
    }

    if (this.jimuMapViewForListener) {
      this.jimuMapViewForListener.removeJimuLayerViewRemovedListener(this.onJimuLayerViewRemoved)
      this.jimuMapViewForListener = null
    }
  }

  onJimuLayerViewRemoved = (jimuLayerView: JimuLayerView) => {
    const layer = jimuLayerView?.layer
    const mapWidgetId = this.props.mapWidgetId

    // This tool only handles root layers, so check it here to avoid remove unexpected sublayer.
    if (mapWidgetId && layer && layer[exbRootLayerKey]) {
      const layerId = layer.id

      if (layerId) {
        const listItems = this.getListItems(mapWidgetId)
        const listItem = listItems.find(item => item.layerId === layerId)

        if (listItem) {
          this.onItemClick(listItem, mapWidgetId)
        }

        // When the layer is added through Analysis, listItem has been deleted here.
        // If we don’t call forceUpdate, the trash icon will still be displayed.
        // So, even if listItem is empty, we should still call forceUpdate.
        this.forceUpdate()
      }
    }
  }

  static getIsNeedSetting () {
    return false
  }

  getStyle () {
    return css`
      .jimu-dropdown {
        display: flex;
        .icon-btn {
          padding: 7px;
          border-radius: 0;
        }

        > button {
          border: 0;
          width: 32px;
          height: 32px;
        }
      }
    `
  }

  getTitle () {
    return this.props.intl.formatMessage({ id: 'clearResults', defaultMessage: defaultMessages.clearResults })
  }

  getIcon (): IconType {
    return {
      icon: require('jimu-icons/svg/outlined/editor/trash.svg'),
      onIconClick: () => {
        this.onIconClick()
      }
    }
  }

  getListItems (mapWidgetId: string): ListItem[] {
    const mapMutableState: MapMutableState = MutableStoreManager.getInstance().getStateValue([mapWidgetId]) || {}
    const listItems1 = this.getListItemsByAddOrShowOnMapDatas(mapWidgetId, mapMutableState)
    const layerIds1 = listItems1.map(listItem => listItem.layerId)
    let listItems2 = this.getListItemsByRemoveableLayerIdsInfo(mapMutableState)
    // one layerId maybe both in showOnMapDatas/addToMapDatas and removeableLayerIdsInfo, so need to remove repeat items
    listItems2 = listItems2.filter(listItem => !layerIds1.includes(listItem.layerId))
    const markerListItem = this.getListItemForMarkerLayer()
    const result = listItems1.concat(listItems2)

    if (markerListItem) {
      result.push(markerListItem)
    }

    return result
  }

  /**
   * Only show layers that crated by data actions. The layers maybe crated by showOnMap data action or addToMap data action.
   * @param mapWidgetId
   * @returns
   */
  getListItemsByAddOrShowOnMapDatas (mapWidgetId: string, mapMutableState: MapMutableState): ListItem[] {
    const showOnMapDatas: ShowOnMapDatas = mapMutableState?.showOnMapDatas || {}
    const addToMapDatas: AddToMapDatas = mapMutableState?.addToMapDatas || {}

    const showOnMapDataInfos = Object.entries(showOnMapDatas).map(entry => {
      return {
        id: entry[0],
        title: entry[1].title,
        jimuMapViewId: entry[1].jimuMapViewId,
        mapWidgetId: entry[1].mapWidgetId,
        needToRemove: true,
        type: entry[1].type
      }
    })

    const addToMapDataInfos = Object.entries(addToMapDatas).map(entry => {
      return {
        id: entry[0],
        title: entry[1].title,
        jimuMapViewId: entry[1].jimuMapViewId,
        mapWidgetId: entry[1].mapWidgetId,
        needToRemove: entry[1].dataChangeType === DataChangeType.Created,
        type: entry[1].type
      }
    })

    const dataActionInfos = showOnMapDataInfos.concat(addToMapDataInfos).filter(dataInfo => {
      // There is no jimuMapViewId while generating the action data if the map widget hasn't been loaded in the another page/view,
      // use a default jimuMapViewId to show data.
      let jimuMapViewId = dataInfo.jimuMapViewId
      if (!jimuMapViewId && dataInfo.mapWidgetId === mapWidgetId) {
        const jimuMapViewsInfo: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }> = getAppStore().getState().jimuMapViewsInfo
        jimuMapViewId = Object.keys(jimuMapViewsInfo || {}).find(viewId => jimuMapViewsInfo[viewId].mapWidgetId === mapWidgetId)
      }

      return (jimuMapViewId === this.props.jimuMapView.id && dataInfo.type === ActionType.DataAction && dataInfo.needToRemove)
    })

    const dataActionListItems: ListItem[] = dataActionInfos.map((item) => {
      const listItem: ListItem = {
        layerId: item.id,
        title: item.title,
        isAction: true
      }

      return listItem
    })

    return dataActionListItems
  }

  /**
   * Get list items by JimuLayerView.removeableByMapTool.
   * @param mutableState
   */
  getListItemsByRemoveableLayerIdsInfo (mutableState: MapMutableState): ListItem[] {
    const listItems: ListItem[] = []
    const removeableLayerIdsInfo = mutableState?.removeableLayerIdsInfo || {}
    const jimuMapView = this.props.jimuMapView

    if (jimuMapView) {
      const map = jimuMapView.view?.map

      if (map) {
        const removeableLayerIds = removeableLayerIdsInfo[jimuMapView.id] || []

        removeableLayerIds.forEach(layerId => {
          const layer = map.findLayerById(layerId)

          if (layer) {
            const title = layer.title || layerId
            const listItem: ListItem = {
              layerId,
              title,
              isAction: false
            }

            listItems.push(listItem)
          }
        })
      }
    }

    return listItems
  }

  getListItemForMarkerLayer(): ListItem {
    let result: ListItem = null

    const map = this.props.jimuMapView?.view?.map

    if (map) {
      const markerLayer = map.findLayerById(CONSTANTS.ADD_MARKER_LAYER_ID)

      if (markerLayer) {
        result = {
          layerId: markerLayer.id,
          title: markerLayer.title,
          isAction: false
        }
      }
    }

    return result
  }

  onIconClick = () => null

  onDropDownToggle = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  createDropdownItem (listItem: ListItem, mapWidgetId: string, index: number) {
    const key = `${listItem.layerId}-index-${index}`

    return (
      <DropdownItem
        key={key}
        header={false}
        onClick={() => { this.onItemClick(listItem, mapWidgetId) }}
      >
        {listItem.title}
      </DropdownItem>
    )
  }

  onItemClick = (listItem: ListItem, mapWidgetId: string) => {
    this.setState({ isOpen: false })

    const layerId = listItem.layerId

    const mutableState = MutableStoreManager.getInstance().getStateValue([mapWidgetId]) || {}

    if (listItem.isAction) {
      // this item comes from ShowOnMap/AddToMap actions, remove it by mutableStoreManager.updateStateValue().
      const actionDataId = layerId
      const showOnMapDatas = mutableState.showOnMapDatas
      const addToMapDatas = mutableState.addToMapDatas

      if (showOnMapDatas) {
        delete showOnMapDatas[actionDataId]
        MutableStoreManager.getInstance().updateStateValue(mapWidgetId, 'showOnMapDatas', showOnMapDatas)
      }

      if (addToMapDatas && addToMapDatas[actionDataId]?.dataChangeType === DataChangeType.Created) {
        MutableStoreManager.getInstance().updateStateValue(mapWidgetId, `addToMapDatas.${actionDataId}.dataChangeType`, DataChangeType.Remove)
      }
    } else {
      // this item comes from JimuLayerView.removeableByMapTool

      // just remove the layer from map, don't need to update removeableLayerIdsInfo (only update removeableLayerIdsInfo when calling JimuLayerView.setRemoveableByMapTool())
      const jimuMapView = this.props.jimuMapView
      const map = jimuMapView?.view?.map

      if (map) {
        if (layerId === CONSTANTS.ADD_MARKER_LAYER_ID) {
          // special case for marker layer
          jimuMapView.removeMarkerLayer()
          jimuMapView.updateMarkerUrlParamIfActive()
        } else {
          const layer = map.findLayerById(layerId)

          if (layer) {
            map.remove(layer)
          }
        }
      }
    }
  }

  getExpandPanel (): React.JSX.Element {
    return (
      <MultiSourceMapContext.Consumer>
        {({ mapWidgetId }) => (
          this.getContent(mapWidgetId)
        )}
      </MultiSourceMapContext.Consumer>
    )
  }

  getContent = (mapWidgetId: string) => {
    const listItems = this.getListItems(mapWidgetId)
    const dropdownItems = listItems.map((listItem, index) => this.createDropdownItem(listItem, mapWidgetId, index))

    if (dropdownItems.length > 0) {
      return (
        <div css={this.getStyle()} title={this.getTitle()}>
          <Dropdown
            direction='down'
            size='sm'
            toggle={this.onDropDownToggle}
            isOpen={this.state.isOpen}
          >
            <DropdownButton icon arrow={false} size='sm' type='default'>
              <Icon size={16} className='exbmap-ui-tool-icon' icon={this.getIcon().icon} />
            </DropdownButton>
            <DropdownMenu>
              {dropdownItems}
            </DropdownMenu>
          </Dropdown>
        </div>
      )
    }

    return null
  }
}
