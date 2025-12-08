/** @jsx jsx */ // <-- make sure to include the jsx pragma
import {
  React, jsx, type IntlShape, type IMThemeVariables, getAppStore, Immutable,
  urlUtils, DataSourceManager, type UseDataSource,
  DataSourceTypes,
  type FeatureLayerDataSource,
  lodash
} from 'jimu-core'
import { type JimuMapView, loadArcGISJSAPIModules, MapViewManager } from 'jimu-arcgis'
import { List, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { SidePopper, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Button, Icon, Label, Select, Option, Tooltip, AlertPopup, NumericInput, defaultMessages as jimuUIDefaultMessages, Checkbox } from 'jimu-ui'
import { DataSourceSelector, AllDataSourceTypes } from 'jimu-ui/advanced/data-source-selector'
import { unitOptions, getConfigIcon, defaultAssetSettings } from '../constants'
import type { AssetSettings, AssetLayersSettings } from '../../config'
import { getSidePanelStyle, getAdvanceSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import AssetSettingPopper from './asset-settings-popper'
import SidepopperBackArrow from './sidepopper-back-arrow'
import { defaultSelectedUnits, getAllLayersFromDataSource, getMaxBufferLimit, getPortalSelfElevationUnits, getRandomHexColor, validateMaxBufferDistance } from '../../common/utils'
import { JimuSymbolType, SymbolSelector } from 'jimu-ui/advanced/map'

const { epConfigIcon } = getConfigIcon()
const portalSelf = getAppStore().getState().portalSelf

const defaultBufferSymbol = {
  tags: ['semi-opaque'],
  title: 'Orange',
  style: 'esriSFSSolid',
  color: [239, 132, 38, 128],
  name: 'Orange 1',
  type: 'esriSFS',
  outline:
  {
    style: 'esriSLSSolid',
    color: [184, 115, 59, 255],
    width: 1.5,
    type: 'esriSLS'
  }
}

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
  config: AssetSettings
  activeDsConfig: any
  mapWidgetId: string
  onAssetSettingsUpdated: (configKey: string, dataSource: string, layerIndex: number,
    dataObj: TraversalObj, data: any, isLayerAddOrRemove: boolean) => void
  onAssetBufferSettingsUpdated: (props: string, value: string | number | boolean) => void
}

interface IState {
  selectedLayers: any[]
  showLayerDataItemPanel: boolean
  layerName: string
  isAlertMsgPopupOpen: boolean
  apiLoaded: boolean
  popperFocusNode: HTMLElement
  assetLayerIndex: number
}

export default class AssetSetting extends React.PureComponent<Props, IState> {
  supportedDsTypes = Immutable([AllDataSourceTypes.FeatureLayer, AllDataSourceTypes.SubtypeSublayer, AllDataSourceTypes.SceneLayer])
  readonly mvManager: MapViewManager = MapViewManager.getInstance()
  mapView: JimuMapView
  public selectedLayerConfig: AssetLayersSettings
  public selectedLayerDataSource: any = null
  public hasSupportForZValue: boolean
  private _hasVerticalUnitParam: boolean
  index: number
  updateLayersConfig: AssetLayersSettings[]
  layerSidePopperTrigger = React.createRef<HTMLDivElement>()
  backRef = React.createRef<SidepopperBackArrow>()
  allSelectedLayers = []
  private _jsonUtils: typeof __esri.jsonUtils = null
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
      apiLoaded: false,
      popperFocusNode: null,
      assetLayerIndex: null
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
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/symbols/support/jsonUtils'
      ]).then(modules => {
        [this._jsonUtils] = modules
        this.setState({
          apiLoaded: true,
        })
      })
    }
    if (this.props.config?.layers?.length === 0) {
      //empty the layer list
      this.setState({
        selectedLayers: []
      })
    } else {
      this.props.config?.layers?.forEach((layer) => {
        this.getLayerListProperty(layer.layerId)
        //display updated layers list in config
        this.setState({
          selectedLayers: this.allSelectedLayers
        })
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

    //display updated layers list in config
    if (!isLayerAlreadySelected) {
      useDataSources.forEach((data, index) => {
        this.getLayerListProperty(data.dataSourceId)
      })

      this.setState({
        selectedLayers: this.allSelectedLayers,
        assetLayerIndex: this.allSelectedLayers.length
      })

      //update the layers config of newly added layers with its default config
      this.updateLayersConfig = this.getLayersDefaultSettings(this.allSelectedLayers)
      let finalLayerUpdate
      if (this.props.config?.layers) {
        finalLayerUpdate = [...this.props.config.layers, this.updateLayersConfig[0]]
      } else {
        finalLayerUpdate = [this.updateLayersConfig[0]]
      }
      this.props.onAssetSettingsUpdated('assetSettings', this.props.activeDataSource, null,
        null, finalLayerUpdate, true)
    }
  }

  getLayersDefaultSettings = (selectedData) => {
    let newLayerDefaultConfig = []
    //if no layer is configured then configure the default settings to the selected Ds
    if (this.props.config?.layers?.length === 0) {
      selectedData.forEach((layerdata, index) => {
        newLayerDefaultConfig = this.getAssetDefaultConfigOnAdd(layerdata.layer)
      })
    } else {
      //configure newly added Ds settings and append to the existing configured settings
      selectedData.forEach((newData) => {
        if (!this.isLayerAlreadyConfigured(newData.layer.id)) {
          newLayerDefaultConfig = this.getAssetDefaultConfigOnAdd(newData.layer)
        }
      })
    }
    return newLayerDefaultConfig
  }

  isLayerAlreadyConfigured = (layerId) => {
    let isConfigured = false
    this.props.config?.layers?.forEach((configData) => {
      if (layerId === configData.layerId) {
        isConfigured = true
        return true
      }
    })
    return isConfigured
  }

  getAssetDefaultConfigOnAdd (layerObj): any {
    //get dataSource object using the layer id
    const layer: any = DataSourceManager.getInstance().getDataSource(layerObj.id)
    const defaultUnit = defaultSelectedUnits(this.props.activeDsConfig, portalSelf)
    const defaultConfig = []
    //get config of only newly added profile or asset layers
    if (layer && layer.layerDefinition && layer.layerDefinition.geometryType &&
      (layer.layerDefinition.geometryType === 'esriGeometryPolyline' || layer.layerDefinition.geometryType === 'esriGeometryPoint')) {
      let defaultElevationType = 'no elevation'
      //if layer having elevation info then set default elevation type as z
      if (layer.layerDefinition.hasZ) {
        defaultElevationType = 'z'
      }
      const defaultAssetSettingsObj = Object.assign({}, defaultAssetSettings)
      defaultAssetSettingsObj.style.intersectingAssetColor = getRandomHexColor()
      defaultAssetSettingsObj.elevationSettings.unit = defaultUnit[0]
      defaultAssetSettingsObj.layerId = layer.id
      defaultAssetSettingsObj.elevationSettings.type = defaultElevationType
      defaultConfig.push(Immutable(defaultAssetSettingsObj))
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
      assetLayerIndex: index
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
    this.props.config.layers.forEach((layerDetails) => {
      if (layerId === layerDetails.layerId) {
        layerConfig = layerDetails
      }
    })
    return layerConfig
  }

  /**
  *@param index Remove layer data individual item
  */
  removeLayerDataItem = (evt, index: number, layerid: string) => {
    evt.stopPropagation()

    //display updated layers list in config
    const layersList = this.state.selectedLayers
    layersList.splice(index, 1)
    this.allSelectedLayers = layersList

    this.setState({
      selectedLayers: this.allSelectedLayers,
      assetLayerIndex: index
    }, () => {
      this.setSidePopperAnchor(index)
      this.setState({
        assetLayerIndex: null
      })
    })

    //update the layers config after removing the layers
    this.props.config?.layers?.forEach((layer, index: number) => {
      if (layer.layerId === layerid) {
        const layersArr: any = this.props.config.layers
        const configLayers = layersArr.asMutable({ deep: true })
        configLayers.splice(index, 1)
        this.updateLayersConfig = configLayers
        this.props.onAssetSettingsUpdated('assetSettings', this.props.activeDataSource, null,
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
          }}
        >
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

  updateConfig = (objectKey, subProperty, value) => {
    const traversalObj: TraversalObj = {
      parentKey: objectKey,
      childKey: subProperty,
      value: value
    }

    const layerIndex = this.getLayerIndex(this.selectedLayerConfig.layerId)
    this.setState({
      assetLayerIndex: layerIndex
    })
    this.props.onAssetSettingsUpdated('assetSettings', this.props.activeDataSource, layerIndex,
      traversalObj, null, false)
  }

  /**
  *On click of back and close button close the layer settings panel and come back to the datasource settings panel
  */

  closePanel = (): void => {
    this.setSidePopperAnchor(this.state.assetLayerIndex)
    this.setState({
      showLayerDataItemPanel: false,
      assetLayerIndex: null
    })
  }

  onIntersectingBufferChange = (evt: React.FormEvent<HTMLInputElement>) => {
    this.props.onAssetBufferSettingsUpdated('enabled', evt.currentTarget.checked)
  }

  onBufferDistanceChange = (value: number) => {
    this.props.onAssetBufferSettingsUpdated('bufferDistance', value ?? 0)
  }

  //Update the buffer unit and buffer distance parameter
  onBufferUnitsChange = (evt: any) => {
    const bufferDistanceMaxLimit = validateMaxBufferDistance(this.props.config.assetIntersectingBuffer.bufferDistance, evt.target.value)
    this.props.onAssetBufferSettingsUpdated('bufferDistance', bufferDistanceMaxLimit)

    setTimeout(() => {
      this.props.onAssetBufferSettingsUpdated('bufferUnits', evt.target.value)
    }, 50)
  }

  onBufferSymbolChanged = (currentSymbol) => {
    let symbol = currentSymbol
    if (currentSymbol === null) {
      symbol = this._jsonUtils.fromJSON(defaultBufferSymbol)
    }
    this.props.onAssetBufferSettingsUpdated('bufferSymbol', symbol?.toJSON())
  }

  disableSelection = (useDataSources: UseDataSource[]): boolean => {
    return false
  }

  /**
  *Hide the Alert message popup
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
    const symbol = this.props.config?.assetIntersectingBuffer?.bufferSymbol
      ? this._jsonUtils?.fromJSON(this.props.config.assetIntersectingBuffer?.bufferSymbol) as any
      : this._jsonUtils?.fromJSON(defaultBufferSymbol) as any
    const dsRootIdsArr = []
    const allDataSources = getAllLayersFromDataSource(this.props.activeDataSource)
    allDataSources?.forEach((layer: FeatureLayerDataSource) => {
      //display only the point and polyline layers in data source selector depending on its geometry type
      if (layer.getLayerDefinition()?.geometryType === 'esriGeometryPolyline' ||
        layer.getLayerDefinition()?.geometryType === 'esriGeometryPoint') {
        dsRootIdsArr.push(layer.id)
      }
    })

    const dsRootIds = this.getDsRootIdsByWidgetId()

    //dsObject parameters used to pass to the ds selector
    const dsSelectorSource = {
      fromRootDsIds: dsRootIds,
      fromDsIds: Immutable(dsRootIdsArr)
    }

    //check for backward compatibility
    let configuredBufferDistanceUnit: string
    // eslint-disable-next-line no-prototype-builtins
    if (this.props.config.assetIntersectingBuffer?.hasOwnProperty('bufferUnits')) {
      configuredBufferDistanceUnit = this.props.config.assetIntersectingBuffer?.bufferUnits
      if (this.props.config.assetIntersectingBuffer?.bufferUnits === '') {
        configuredBufferDistanceUnit = getPortalSelfElevationUnits(portalSelf)
      }
    } else {
      configuredBufferDistanceUnit = getPortalSelfElevationUnits(portalSelf)
    }

    return <div css={getAdvanceSettingsStyle(this.props.theme)} style={{ height: '100%', width: '100%', marginTop: 5 }}>
      <SettingRow>
        <Label tabIndex={0} aria-label={this.nls('intersectingLayersLabel')} className='w-100 d-flex'>
          <div className='flex-grow-1 text-break color-label'>
            {this.nls('intersectingLayersLabel')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('intersectingLayersTooltip')}
         title={this.nls('intersectingLayersTooltip')} showArrow placement='top'>
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
          hideAddDataButton={true}
          disableRemove={() => true}
          disableSelection={this.disableSelection}
          widgetId={this.props.widgetId}
          hideDataView={true}
        />
      </SettingRow>

      {this.state.selectedLayers.length === 0 &&
        <SettingRow>
          <Label tabIndex={0} aria-label={this.nls('intersectingLayersWarning')} className='hint w-100 d-flex'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('intersectingLayersWarning')}
            </div>
          </Label>
        </SettingRow>
      }

      {this.state.selectedLayers.length > 0 &&
        <div ref={this.layerSidePopperTrigger} tabIndex={-1} className={'w-100 mb-4 mt-4'}>
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

      <SettingRow>
        <Label className='w-100 d-flex cursor-pointer'>
          <Checkbox className={'mr-2 font-13'} checked={this.props.config.assetIntersectingBuffer?.enabled}
            onChange={this.onIntersectingBufferChange} role={'checkbox'} aria-label={this.nls('intersectingBufferSettingsLabel')}/>
          <div className='flex-grow-1 text-break'>
            {this.nls('intersectingBufferSettingsLabel')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('intersectingBufferSettingsTooltip')}
          title={this.nls('intersectingBufferSettingsTooltip')} showArrow placement='top'>
          <div className='ml-2 d-inline'>
            <Icon size={14} icon={epConfigIcon.infoIcon} />
          </div>
        </Tooltip>
      </SettingRow>

      {this.props.config.assetIntersectingBuffer?.enabled &&
        <div className={'pt-2 pb-2'} aria-expanded={this.props.config.assetIntersectingBuffer?.enabled}>
          <SettingRow>
            <NumericInput style={{ width: 55 }} aria-label={configuredBufferDistanceUnit} title={this.props.config.assetIntersectingBuffer?.bufferDistance + ''}
              size={'sm'} min={0} max={getMaxBufferLimit(configuredBufferDistanceUnit)}
              value={this.props.config.assetIntersectingBuffer?.bufferDistance ? this.props.config.assetIntersectingBuffer?.bufferDistance : 10}
              showHandlers={false} onChange={this.onBufferDistanceChange} />

            <Select aria-label={configuredBufferDistanceUnit} style={{ width: 141 }} className={'pl-2 pr-2'}
              size={'sm'} name={'bufferUnits'}
              value={configuredBufferDistanceUnit}
              onChange={this.onBufferUnitsChange}>
              {unitOptions.map((option, index) => {
                return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>
                  {this.nls(option.value)}</Option>
              })}
            </Select>

            {symbol &&
              <SymbolSelector
                jimuSymbolType={JimuSymbolType.Polygon}
                symbol={symbol}
                onPolygonSymbolChanged={this.onBufferSymbolChanged.bind(this)}
              ></SymbolSelector>
            }
          </SettingRow>
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
              <AssetSettingPopper
                intl={this.props.intl}
                theme={this.props.theme}
                config={this.getSelectedLayerConfig(this.dsId)}
                hasSupportForZValue={this.hasSupportForZValue}
                selectedLayerDataSource={this.selectedLayerDataSource}
                hasVerticalUnit={this._hasVerticalUnitParam}
                updateAssetSettings={this.updateConfig.bind(this)}
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
