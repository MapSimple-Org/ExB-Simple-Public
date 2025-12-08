/** @jsx jsx */ // <-- make sure to include the jsx pragma
import {
  React, jsx, type IntlShape, type IMThemeVariables, getAppStore,
  urlUtils, Immutable, DataSourceManager, type UseDataSource, type DataSource,
  DataSourceTypes,
  type FeatureLayerDataSource,
  lodash
} from 'jimu-core'
import { MapViewManager, type JimuMapView } from 'jimu-arcgis'
import { List, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { SidePopper, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Button, Icon, Tooltip, AlertPopup, Label, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import type { ProfileSettings, ProfileLayersSettings } from '../../config'
import { getSidePanelStyle, getAdvanceSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import ProfileSettingPopper from './profile-settings-popper'
import SidepopperBackArrow from './sidepopper-back-arrow'
import { defaultSelectedUnits, getAllLayersFromDataSource, getRandomHexColor } from '../../common/utils'
import { getConfigIcon, defaultProfileSettings } from '../constants'

const { epConfigIcon } = getConfigIcon()
const portalSelf = getAppStore().getState().portalSelf

interface TraversalObj {
  parentKey: string
  childKey: string
  value: any
}

interface Props {
  widgetId: string
  activeDataSource: string
  intl: IntlShape
  theme: IMThemeVariables
  activeDsConfig: any
  config: ProfileSettings
  mapWidgetId: string
  onProfileSettingsUpdated: (configKey: string, dataSource: string, layerIndex: number,
    dataObj: TraversalObj, data: any, isLayerAddOrRemove: boolean) => void
}

interface IState {
  selectedLayers: any[]
  showLayerDataItemPanel: boolean
  layerName: string
  isAlertMsgPopupOpen: boolean
  popperFocusNode: HTMLElement
  selectedLayerIndex: number
}

export default class ProfileSetting extends React.PureComponent<Props, IState> {
  supportedDsTypes = Immutable([DataSourceTypes.FeatureLayer, DataSourceTypes.SubtypeSublayer, DataSourceTypes.SceneLayer])
  readonly mvManager: MapViewManager = MapViewManager.getInstance()
  mapView: JimuMapView
  public selectedLayerConfig: ProfileLayersSettings
  public selectedLayerDataSource: any = null
  public hasSupportForZValue: boolean
  private _hasVerticalUnitParam: boolean
  index: number
  updateLayersConfig: ProfileLayersSettings[]
  layerSidePopperTrigger = React.createRef<HTMLDivElement>()
  backRef = React.createRef<SidepopperBackArrow>()
  allSelectedLayers = []
  dsId: string

  constructor (props) {
    super(props)
    this.updateLayersConfig = this.props.config.layers
    const mapViewGroup = (this.mvManager as any).jimuMapViewGroups[this.props.mapWidgetId]
    for (const id in mapViewGroup.jimuMapViews) {
      if (mapViewGroup.jimuMapViews[id].dataSourceId === this.props.activeDataSource) {
        this.mapView = mapViewGroup.jimuMapViews[id]
      }
    }
    this.state = {
      selectedLayers: [],
      showLayerDataItemPanel: false,
      layerName: null,
      isAlertMsgPopupOpen: false,
      popperFocusNode: null,
      selectedLayerIndex: null
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    if (this.props.config?.layers) {
      this.props.config.layers.forEach((layer, index) => {
        this.getLayerListProperty(layer.layerId)
      })

      //display updated layers list in config
      this.setState({
        selectedLayers: this.allSelectedLayers
      })
    }
  }

  componentDidUpdate = (prevProps) => {
    if (!lodash.isDeepEqual(this.props.config?.layers, prevProps.config?.layers)) {
      this.allSelectedLayers = []
      this.props.config.layers.forEach((layer, index) => {
        this.getLayerListProperty(layer.layerId)
      })

      //display updated layers list in config
      this.setState({
        selectedLayers: this.allSelectedLayers
      })
    }
  }

  getLayerListProperty = (layerId: string) => {
    const dsObj = DataSourceManager.getInstance().getDataSource(layerId)
    if (dsObj) {
      const label = dsObj.getLabel()
      const layerObj = {
        label: label,
        layer: { id: dsObj.id }
      }
      this.allSelectedLayers.push(layerObj)
    }
  }

  getDsRootIdsByWidgetId = () => {
    const appConfig = getAppStore().getState()?.appStateInBuilder?.appConfig
    const widgetJson = appConfig
    const rootIds = []
    const ds = widgetJson.dataSources[this.props.activeDataSource]
    if (ds?.type === DataSourceTypes.WebMap || ds?.type === DataSourceTypes.WebScene) { // is root ds
      rootIds.push(this.props.activeDataSource)
    }

    return rootIds.length > 0 ? Immutable(rootIds) : undefined
  }

  // save currentSelectedDs to array
  dataSourceChangeSave = (useDataSources: UseDataSource[]) => {
    if (!useDataSources) {
      return
    }

    //if layer is already selected then show the alert message and do not add the layer in the list again
    let isLayerAlreadySelected: boolean = false

    // eslint-disable-next-line array-callback-return
    this.allSelectedLayers.some((data) => {
      if (data.layer.id === useDataSources[0].dataSourceId) {
        isLayerAlreadySelected = true
        this.setState({
          isAlertMsgPopupOpen: true
        })
        return true
      }
    })

    //display updated layers list  in config
    if (!isLayerAlreadySelected) {
      useDataSources.forEach((data, index) => {
        this.getLayerListProperty(data.dataSourceId)
      })

      this.setState({
        selectedLayers: this.allSelectedLayers,
        selectedLayerIndex: this.allSelectedLayers.length
      })

      //update the layers config of newly added layers with its default config
      this.updateLayersConfig = this.getLayersDefaultSettings(this.allSelectedLayers)
      const finalLayerUpdate = [...this.props.config.layers, this.updateLayersConfig[0]]

      this.props.onProfileSettingsUpdated('profileSettings', this.props.activeDataSource, null,
        null, finalLayerUpdate, true)
    }
  }

  getLayersDefaultSettings = (selectedData) => {
    let newLayerDefaultConfig = []
    //if no layer is configured then configure the default settings to the selected Ds
    if (this.props.config.layers.length === 0) {
      selectedData.forEach((layerdata, index) => {
        newLayerDefaultConfig = this.getProfileDefaultConfigOnAdd(layerdata.layer)
      })
    } else {
      //configure newly added Ds settings and append to the existing configured settings
      selectedData.forEach((newData) => {
        if (!this.isLayerAlreadyConfigured(newData.layer.id)) {
          newLayerDefaultConfig = this.getProfileDefaultConfigOnAdd(newData.layer)
        }
      })
    }
    return newLayerDefaultConfig
  }

  isLayerAlreadyConfigured = (layerId) => {
    let isConfigured = false
    this.props.config.layers.forEach((configData) => {
      if (layerId === configData.layerId) {
        isConfigured = true
        return true
      }
    })
    return isConfigured
  }

  getProfileDefaultConfigOnAdd (layerObj) {
    //get dataSource object using the layer id
    const layer: DataSource = DataSourceManager.getInstance().getDataSource(layerObj.id)
    const dsLayer: any = layer
    const defaultUnit = defaultSelectedUnits(this.props.activeDsConfig, portalSelf)
    const geometryType = 'esriGeometryPolyline'
    const defaultConfig = []
    //get config of only newly added profile or asset layers
    if (dsLayer && dsLayer.layerDefinition && dsLayer.layerDefinition.geometryType &&
      dsLayer.layerDefinition.geometryType === geometryType) {
      let defaultElevationType = 'no elevation'
      //if layer having elevation info then set default elevation type as z
      if (dsLayer.layerDefinition.hasZ) {
        defaultElevationType = 'z'
      }
      const defaultProfileSettingsObj = Object.assign({}, defaultProfileSettings)
      //if shape length field available in the layer use it as default distance field
      if (dsLayer?.layerDefinition?.hasGeometryProperties &&
        dsLayer?.layerDefinition?.geometryProperties?.shapeLengthFieldName) {
        defaultProfileSettingsObj.distanceSettings.field = dsLayer.layerDefinition.geometryProperties.shapeLengthFieldName
      } else {
        defaultProfileSettingsObj.distanceSettings.field = ''
      }
      defaultProfileSettingsObj.style.lineColor = getRandomHexColor()
      defaultProfileSettingsObj.elevationSettings.unit = defaultUnit[0]
      defaultProfileSettingsObj.distanceSettings.unit = defaultUnit[1]
      defaultProfileSettingsObj.layerId = layer.id
      defaultProfileSettingsObj.elevationSettings.type = defaultElevationType
      defaultConfig.push(Immutable(defaultProfileSettingsObj))
    }
    return defaultConfig
  }

  /**
  *
  On click of layer in the list, opens the individual layer config in the same sidepopper
  */

  showLayerData = (item: any, index?: number) => {
    this.setSidePopperAnchor(index)
    this.setState({
      showLayerDataItemPanel: true,
      layerName: item.label,
      selectedLayerIndex: index
    }, () => {
      this.backRef.current?.backRefFocus()
    })
    //get dataSource object for the selected item
    const dsObj: any = DataSourceManager.getInstance().getDataSource(item.layer.id)

    this.selectedLayerDataSource = {
      dataSourceId: dsObj.id,
      rootDataSourceId: dsObj.parentDataSource.id,
      layer: dsObj
    }
    //get the saved config of selected layer
    this.dsId = dsObj.id
    this.selectedLayerConfig = this.getSelectedLayerConfig(dsObj.id)
    //check the availability of vertical unit parameter in case of z value
    this.hasSupportForZValue = dsObj?.layerDefinition?.hasZ
    this._hasVerticalUnitParam = dsObj?.layerDefinition?.sourceSpatialReference?.vcsWkid || dsObj?.layerDefinition?.sourceSpatialReference?.vcsWkt
  }

  getSelectedLayerConfig = (layerId: string) => {
    let layerConfig
    this.props.config?.layers?.forEach((layerDetails) => {
      if (layerId === layerDetails.layerId) {
        layerConfig = layerDetails
      }
    })
    return layerConfig
  }

  /**
  *@param index Remove individual layer item
  */
  removeLayerDataItem = (evt, index: number, layerid: string) => {
    evt.stopPropagation()

    //display updated layers list  in config
    const layersList = this.state.selectedLayers
    layersList.splice(index, 1)
    this.allSelectedLayers = layersList

    this.setState({
      selectedLayers: this.allSelectedLayers,
      selectedLayerIndex: index
    }, () => {
      this.setSidePopperAnchor(index)
      this.setState({
        selectedLayerIndex: null
      })
    })

    //update the layers config after removing of layers
    this.props.config?.layers?.forEach((layer, index: number) => {
      if (layer?.layerId === layerid) {
        const layersArr: any = this.props.config.layers
        const configLayers = layersArr.asMutable({ deep: true })
        configLayers.splice(index, 1)
        this.updateLayersConfig = configLayers
        this.props.onProfileSettingsUpdated('profileSettings', this.props.activeDataSource, null,
          null, this.updateLayersConfig, true)
      }
    })
  }

  /**
   *Create layers list with layers name and delete button to remove the layers
  */

  createLayerElement = (item, index: number) => {
    const _datasourceOptions = (
      <div aria-label={item.label} tabIndex={0}
        key={index + Date.now()}
        className='layer-data-item align-items-center'>

        <div className='layer-data-item-name flex-grow-1' title={item.label}>{item.label}</div>

        <Button role={'button'} title={this.nls('deleteLayer')}
          aria-label={this.nls('deleteLayer')}
          size='sm' type='tertiary' icon
          className='p-0'
          key={index + Date.now()}
          onClick={(e) => { this.removeLayerDataItem(e, index, item.layer.id) }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              this.removeLayerDataItem(e, index, item.layer.id)
            }
          }}>
          <Icon icon={epConfigIcon.iconClose} size={12} />
        </Button>
      </div>
    )

    return _datasourceOptions
  }

  getLayerIndex = (layerId: string) => {
    let layerIndex = -1
    this.props.config.layers.forEach((layerDetails, index) => {
      if (layerId === layerDetails.layerId) {
        layerIndex = index
      }
    })
    return layerIndex
  }

  /**
   Update the config of individual layer if there is any changes in settings
  */
  updateConfig = (objectKey: string, subProperty: string, value: string) => {
    const traversalObj: TraversalObj = {
      parentKey: objectKey,
      childKey: subProperty,
      value: value
    }

    const layerIndex = this.getLayerIndex(this.selectedLayerConfig.layerId)
    this.setState({
      selectedLayerIndex: layerIndex
    })
    this.props.onProfileSettingsUpdated('profileSettings', this.props.activeDataSource, layerIndex,
      traversalObj, null, false)
  }

  /**
  *On click of back and close button close the layer settings panel and come back to the datasource settings panel
  */
  closePanel = (): void => {
    this.setSidePopperAnchor(this.state.selectedLayerIndex)
    this.setState({
      showLayerDataItemPanel: false,
      selectedLayerIndex: null
    })
  }

  disableSelection = (useDataSources: UseDataSource[]): boolean => {
    return false
  }

  /**
   * Hide the Alert message popup
   */
  hideMessage = (): void => {
    this.setState({
      isAlertMsgPopupOpen: false
    })
  }

  /**
   * set side popper anchor
   * @param index index of the layers
   */
  setSidePopperAnchor = (index?: number) => {
    const node: any = this.layerSidePopperTrigger.current?.getElementsByClassName('jimu-tree-item__body')[index]
    this.setState({
      popperFocusNode: node
    })
  }

  render () {
    const dsRootIdsArr = []
    const allDataSources = getAllLayersFromDataSource(this.props.activeDataSource)
    allDataSources?.forEach((layer: FeatureLayerDataSource) => {
      //display only the line layers in data source selector depending on its geometry type
      if (layer.getLayerDefinition()?.geometryType === 'esriGeometryPolyline') {
        dsRootIdsArr.push(layer.id)
      }
    })
    const dsRootIds = this.getDsRootIdsByWidgetId()

    //dsObject parameters used to pass to the ds selector
    const dsSelectorSource = {
      fromRootDsIds: dsRootIds,
      fromDsIds: Immutable(dsRootIdsArr)
    }

    return <div css={getAdvanceSettingsStyle(this.props.theme)} style={{ height: '100%', width: '100%', marginTop: 5 }}>
      <SettingRow>
        <Label tabIndex={0} aria-label={this.nls('selectableLayersLabel')} className='w-100 d-flex'>
          <div className='flex-grow-1 text-break color-label'>
            {this.nls('selectableLayersLabel')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('selectableLayersTooltip')}
          title={this.nls('selectableLayersTooltip')} showArrow placement='top'>
          <div className='ml-2 d-inline color-label'>
            <Icon size={14} icon={epConfigIcon.infoIcon} />
          </div>
        </Tooltip>
      </SettingRow>

      <SettingRow>
        <DataSourceSelector className={'ep-data-source-selector'}
          types={this.supportedDsTypes}
          buttonLabel={this.nls('selectableButton')}
          fromRootDsIds={dsSelectorSource.fromRootDsIds}
          fromDsIds={dsSelectorSource.fromDsIds}
          mustUseDataSource={true}
          onChange={this.dataSourceChangeSave}
          disableDataView={true}
          enableToSelectOutputDsFromSelf={false}
          closeDataSourceListOnChange
          hideTypeDropdown={false}
          disableAddData={true}
          disableRemove={() => true}
          disableSelection={this.disableSelection}
          widgetId={this.props.widgetId}
          hideDataView={true}
        />
      </SettingRow>

      {this.state.selectedLayers.length === 0 &&
        <SettingRow>
          <Label tabIndex={0} aria-label={this.nls('selectableLayersWarning')} className='hint w-100 d-flex'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('selectableLayersWarning')}
            </div>
          </Label>
        </SettingRow>
      }

      {this.state.selectedLayers.length > 0 &&
        <div ref={this.layerSidePopperTrigger} tabIndex={-1} className={'w-100 mt-4'}>
          <div className={'ep-layers-list'}>
            <List
              itemsJson={Array.from(this.state.selectedLayers).map((options: any, index) => ({
                itemStateDetailContent: options,
                itemKey: `${index}`
              }))}
              dndEnabled={false}
              onClickItemBody={(actionData, refComponent) => {
                const { itemJsons } = refComponent.props
                const currentItemJson = itemJsons[0]
                const listItemJsons = itemJsons[1] as any
                this.showLayerData(currentItemJson.itemStateDetailContent, listItemJsons.indexOf(currentItemJson))
              }}
              overrideItemBlockInfo={() => {
                return {
                  name: TreeItemActionType.RenderOverrideItem,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemBody,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemMainLine
                    }]
                  }]
                }
              }}
              renderOverrideItemMainLine={(actionData, refComponent) => {
                const { itemJsons } = refComponent.props
                const currentItemJson = itemJsons[0]
                const listItemJsons = itemJsons[1] as any
                return this.createLayerElement(currentItemJson.itemStateDetailContent, listItemJsons.indexOf(currentItemJson))
              }}
            />
          </div>
        </div>
      }

      <SidePopper title={this.state.layerName} isOpen={this.state.showLayerDataItemPanel &&
        !urlUtils.getAppIdPageIdFromUrl().pageId} position='right' toggle={this.closePanel} trigger={this.layerSidePopperTrigger?.current}
        backToFocusNode={this.state.popperFocusNode}>
        <div className='bg-default border-color-gray-400' css={getSidePanelStyle(this.props.theme)}>
          <SidepopperBackArrow
            theme={this.props.theme}
            intl={this.props.intl}
            title={this.state.layerName}
            ref={this.backRef}
            onBack={this.closePanel}>
            <div className={'setting-container'}>
              <ProfileSettingPopper
                config={this.getSelectedLayerConfig(this.dsId)}
                hasVerticalUnit={this._hasVerticalUnitParam}
                hasSupportForZValue={this.hasSupportForZValue}
                selectedLayerDataSource={this.selectedLayerDataSource}
                intl={this.props.intl}
                theme={this.props.theme}
                updateProfileSettings={this.updateConfig.bind(this)}
              />
            </div>
          </SidepopperBackArrow>
        </div>
      </SidePopper>

      {/* Alert/Info message popup */}
      {this.state.isAlertMsgPopupOpen &&
        <AlertPopup
          aria-expanded={this.state.isAlertMsgPopupOpen}
          hideCancel={true}
          isOpen={this.state.isAlertMsgPopupOpen && !urlUtils.getAppIdPageIdFromUrl().pageId}
          onClickOk={this.hideMessage.bind(this)}
          onClickClose={this.hideMessage.bind(this)}
          title={this.nls('alert')}>
          <div className={'p-2'}>
            {this.nls('alreadySelectedLayerMsg')}
          </div>
        </AlertPopup>
      }
    </div>
  }
}
