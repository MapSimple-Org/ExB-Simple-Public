/** @jsx jsx */
import {
  React,
  Immutable,
  type ImmutableObject,
  type DataSourceJson,
  type IMState,
  FormattedMessage,
  jsx,
  getAppStore,
  type UseDataSource,
  AllDataSourceTypes,
  type WidgetJson
} from 'jimu-core'
import { Switch, Radio, Label, Alert, Checkbox, defaultMessages as jimuDefaultMessages } from 'jimu-ui'
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow,
  LayerSetting,
  getAllItemsInMapView
} from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { Config, IMConfig } from '../config'
import defaultMessages from './translations/default'
import MapThumb from './components/map-thumb'
import { getStyle } from './lib/style'
import { type JimuMapView, JimuMapViewComponent, MapViewManager } from 'jimu-arcgis'
import { createRef } from 'react'

const allDefaultMessages = Object.assign({}, defaultMessages, jimuDefaultMessages)

interface ExtraProps {
  dsJsons: ImmutableObject<{ [dsId: string]: DataSourceJson }>
}

export interface WidgetSettingState {
  useMapWidget: boolean
  viewIdsFromMapWidget: string[]
  mapViews: { [viewId: string]: JimuMapView }
  activeCustomizeJmvId: string
}

export type WidgetSettingProps = AllWidgetSettingProps<IMConfig> & ExtraProps

export default class Setting extends React.PureComponent<
AllWidgetSettingProps<IMConfig> & ExtraProps,
WidgetSettingState
> {
  supportedDsTypes = Immutable([
    AllDataSourceTypes.WebMap,
    AllDataSourceTypes.WebScene
  ])

  customizeLayersTrigger = createRef<HTMLDivElement>()

  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      dsJsons: state.appStateInBuilder.appConfig.dataSources
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      mapViews: null,
      useMapWidget: this.props.config.useMapWidget || false,
      viewIdsFromMapWidget: null,
      activeCustomizeJmvId: ''
    }
    // this.setDefaultConfig()
  }

  setDefaultConfig() {
    if (this.props.config?.showTables === undefined) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('showTables', true)
      })
    }
  }

  getTranslatedString (stringId: string) {
    return this.props.intl.formatMessage({
      id: stringId,
      defaultMessage: allDefaultMessages[stringId]
    })
  }

  getFormattedMessage (stringId: string) {
    return <FormattedMessage id={stringId} defaultMessage={allDefaultMessages[stringId]} />
  }

  getSwitchOption(optionKeys: keyof Omit<Config, 'customizeLayerOptions' | 'symbolOption'>, stringKey?: string) {
    return (
      <React.Fragment>
        <SettingRow tag='label' label={this.getFormattedMessage(stringKey || optionKeys)} >
        <Switch
          className="can-x-switch"
          checked={(this.props.config && this.props.config[optionKeys]) || false}
          data-key={optionKeys}
          onChange={(evt) => {
            this.onOptionsChanged(evt.target.checked, optionKeys)
          }}
        />
        </SettingRow>
      </React.Fragment>
    )
  }

  getPortUrl = (): string => {
    const portUrl = getAppStore().getState().portalUrl
    return portUrl
  }

  shouldShowCustomizeLayerOptions = () => {
    return this.props.useMapWidgetIds?.length > 0
  }

  shouldShowLayerList = () => {
    return !this.isDataSourceEmpty()
  }

  isCustomizeOptionEmpty = () => {
    return this.isDataSourceEmpty() && !this.shouldShowCustomizeWarning()
  }

  onMapModeChange = (useMapWidget) => {
    const setting: Partial<WidgetJson> = {
      id: this.props.id,
      config: this.props.config.set('useMapWidget', useMapWidget)
    }

    // Clean up map id when switching to the ds mode
    if (!useMapWidget) {
      setting.useMapWidgetIds = []
    }

    this.props.onSettingChange(setting)

    this.setState({
      useMapWidget: useMapWidget
    })
  }

  onOptionsChanged = (checked, name): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(name, checked)
    })
  }

  onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSourcesEnabled
    })
  }

  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    if (!useDataSources) {
      return
    }

    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    })
  }

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    // Update mapViews when connect to another widget
    const mapViews = MapViewManager.getInstance().getJimuMapViewGroup(useMapWidgetIds[0])?.jimuMapViews || {}
    this.setState({
      mapViews: mapViews
    })

    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  onViewsCreate = (views: { [viewId: string]: JimuMapView }) => {
    const viewIdsFromMapWidget = Object.keys(views)
    this.setState({
      mapViews: views,
      viewIdsFromMapWidget
    })
  }

  onListItemBodyClick = (dataSourceId: string) => {
    const jmvId = `${this.props.useMapWidgetIds?.[0]}-${dataSourceId}`
    this.setState({
      activeCustomizeJmvId: jmvId
    })
  }

  getActiveCustomizeStatus = () => {
    return this.props.config?.customizeLayerOptions?.[this.state.activeCustomizeJmvId]?.isEnabled || false
  }

  getShowRuntimeAddedLayerStatus = () => {
    return this.props.config?.customizeLayerOptions?.[this.state.activeCustomizeJmvId]?.showRuntimeAddedLayers ?? true
  }

  getSelectedValues = () => {
    // For the app that has `showJimuLayerViewIds`, uses it directly
    const ret = {}
    const jmvId = this.state.activeCustomizeJmvId
    if (jmvId && this.props.config?.customizeLayerOptions?.[jmvId]) {
      if (this.props.config.customizeLayerOptions[jmvId].isEnabled && this.props.config.customizeLayerOptions[jmvId].showJimuLayerViewIds) {
        ret[jmvId] = this.props.config.customizeLayerOptions[jmvId].showJimuLayerViewIds
        return ret
      }
    }
    return { [this.state.activeCustomizeJmvId]: Immutable(getAllItemsInMapView(this.state.activeCustomizeJmvId, true)) }
  }

  onCustomizeLayerChange = (enable: boolean, jlvIds: string[]) => {
    // No matter it's on/off, clean up the ids array
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['customizeLayerOptions', this.state.activeCustomizeJmvId], {
        isEnabled: enable,
        hiddenJimuLayerViewIds: [],
        // Store all layer ids when enabling customization
        showJimuLayerViewIds: enable ? [...jlvIds] : []
      })
    })
  }

  onShowRuntimeAddedLayersChange = (enable) => {
    const newConfig = this.props.config.setIn(['customizeLayerOptions', this.state.activeCustomizeJmvId, 'showRuntimeAddedLayers'], enable)
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onLayerIdChange = (showJimuLayerViewIds: string[]) => {
    const newConfig = this.props.config.setIn(['customizeLayerOptions', this.state.activeCustomizeJmvId, 'showJimuLayerViewIds'], showJimuLayerViewIds)

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  getCustomizeLayerList = () => {
    return (
      <div ref={this.customizeLayersTrigger} className='w-100'>
        <LayerSetting
          mapWidgetId={this.props.useMapWidgetIds?.[0]}
          onMapItemClick={this.onListItemBodyClick}
          mapViewId={this.state.activeCustomizeJmvId}
          isCustomizeEnabled={this.getActiveCustomizeStatus()}
          isShowRuntimeAddedLayerEnabled={this.getShowRuntimeAddedLayerStatus()}
          showTable={true}
          onToggleCustomize={this.onCustomizeLayerChange}
          onShowRuntimeAddedLayersChange={this.onShowRuntimeAddedLayersChange}
          onSelectedLayerIdChange={this.onLayerIdChange}
          selectedValues={this.getSelectedValues()}
        />
      </div>
    )
  }

  getCustomizeSettingContent = () => {
    const label = <Label id='multiple-jimu-map-desc'>{this.getTranslatedString('customizeDescription')}</Label>
    return (
      this.shouldShowCustomizeLayerOptions() && (
        <React.Fragment>
          <SettingRow
            label={label}
            flow='wrap'
            aria-label={this.getTranslatedString('customizeDescription')}
            className={this.isCustomizeOptionEmpty() ? 'empty-customize-layer-list' : 'customize-layer-list'}
          >
            {this.shouldShowCustomizeWarning() &&
              <Alert
                tabIndex={0}
                className={'warningMsg'}
                open
                text={this.getTranslatedString('customizeLayerWarnings')}
                type={'warning'}
              />
            }
            {
              this.shouldShowLayerList() && this.getCustomizeLayerList()
            }
          </SettingRow>
        </React.Fragment>
      )
    )
  }

  shouldShowCustomizeWarning = (): boolean => {
    // Not connecting to a map widget
    if (!this.state.useMapWidget) {
      return true
    } else {
      return this.isDataSourceEmpty()
    }
  }

  isDataSourceEmpty = (): boolean => {
    const mapViews = MapViewManager.getInstance().getJimuMapViewGroup(this.props.useMapWidgetIds[0])?.jimuMapViews || {}
    // The connected widget only have ONE map view & have no data source
    if (Object.keys(mapViews).length === 1 && !Object.values(mapViews)?.[0]?.dataSourceId) {
      return true
    } else {
      return false
    }
  }

  render () {
    const portalUrl = this.getPortUrl()

    let setDataContent = null
    let dataSourceSelectorContent = null
    let mapSelectorContent = null
    let actionsContent = null
    let optionsContent = null

    dataSourceSelectorContent = (
      <div className="data-selector-section">
        <SettingRow>
          <DataSourceSelector
            types={this.supportedDsTypes}
            useDataSources={this.props.useDataSources}
            useDataSourcesEnabled
            mustUseDataSource
            onChange={this.onDataSourceChange}
            widgetId={this.props.id}
          />
        </SettingRow>
        {portalUrl &&
          this.props.dsJsons &&
          this.props.useDataSources &&
          this.props.useDataSources.length === 1 && (
            <SettingRow>
              <div className="w-100">
                <div
                  className="webmap-thumbnail"
                  title={
                    this.props.dsJsons[
                      this.props.useDataSources[0].dataSourceId
                    ]?.label
                  }
                >
                  <MapThumb
                    mapItemId={
                      this.props.dsJsons[
                        this.props.useDataSources[0].dataSourceId
                      ]
                        ? this.props.dsJsons[
                          this.props.useDataSources[0].dataSourceId
                        ].itemId
                        : null
                    }
                    portUrl={
                      this.props.dsJsons[
                        this.props.useDataSources[0].dataSourceId
                      ]
                        ? this.props.dsJsons[
                          this.props.useDataSources[0].dataSourceId
                        ].portalUrl
                        : null
                    }
                  />
                </div>
              </div>
            </SettingRow>
        )}
      </div>
    )

    mapSelectorContent = (
      <div className="map-selector-section">
        <SettingRow>
          <MapWidgetSelector
            onSelect={this.onMapWidgetSelected}
            useMapWidgetIds={this.props.useMapWidgetIds}
          />
        </SettingRow>
        <JimuMapViewComponent
          useMapWidgetId={this.props.useMapWidgetIds?.[0]}
          onViewsCreate={this.onViewsCreate}
        />
        {this.getCustomizeSettingContent()}
      </div>
    )

    if (this.state.useMapWidget) {
      setDataContent = mapSelectorContent

      actionsContent = (
        <React.Fragment>
          {this.getSwitchOption('goto')}
          {this.getSwitchOption('label', 'showOrHideLabels')}
          {this.getSwitchOption('popup')}
          {this.getSwitchOption('opacity', 'transparency')}
          {this.getSwitchOption('visibilityRange')}
          {this.getSwitchOption('information')}
          {this.getSwitchOption('changeSymbolForRuntimeLayers')}
        </React.Fragment>
      )

      optionsContent = (
        <React.Fragment>
          {this.getSwitchOption('useTickBoxes')}
          {this.getSwitchOption('enableLegend')}
          {
            (this.props.config && this.props.config.enableLegend) &&
            <SettingRow>
              <Label aria-label={this.getTranslatedString('showAllLegend')} className='cursor-pointer'>
                <Checkbox
                  className='mr-2'
                  checked={this.props.config && this.props.config.showAllLegend}
                  onChange={(evt) => {
                    this.onOptionsChanged(evt.target.checked, 'showAllLegend')
                  }}
                />
                <span className='check-box-label'>
                  {` ${this.getTranslatedString('showAllLegend')}`}
                </span>
              </Label>
            </SettingRow>
          }

          {this.getSwitchOption('reorderLayers')}
          {this.getSwitchOption('searchLayers')}
          {this.getSwitchOption('expandAllLayers', 'expandAllLayersByDefault')}
          {this.getSwitchOption('layerBatchOptions')}

          {this.getSwitchOption('showTables')}
        </React.Fragment>
      )
    } else {
      setDataContent = dataSourceSelectorContent
      actionsContent = (
        <React.Fragment>
          {this.getSwitchOption('information')}
        </React.Fragment>
      )
      optionsContent = (
        <React.Fragment>
          {this.getSwitchOption('expandAllLayers', 'expandAllLayersByDefault')}
          {this.getSwitchOption('layerBatchOptions')}
          {this.getSwitchOption('showTables')}
        </React.Fragment>
      )
    }

    return (
      <div css={getStyle(this.props.theme)}>
        <div className="widget-setting-layerlist">
          <SettingSection
            title={this.getTranslatedString('sourceLabel')}
            role="group"
            aria-label={this.getTranslatedString('sourceLabel')}
          >
            <SettingRow>
              <div className="layerlist-tools w-100">
                <div className="w-100">
                  <div className="layerlist-tools-item radio">
                    <Radio
                      id="map-data"
                      style={{ cursor: 'pointer' }}
                      name="source-option"
                      onChange={(e) => { this.onMapModeChange(false) }}
                      checked={!this.state.useMapWidget}
                    />
                    <Label
                      style={{ cursor: 'pointer' }}
                      for="map-data"
                      className="ml-1"
                    >
                      {this.getTranslatedString('showLayerForMap')}
                    </Label>
                  </div>
                </div>
                <div className="w-100">
                  <div className="layerlist-tools-item radio">
                    <Radio
                      id="map-view"
                      style={{ cursor: 'pointer' }}
                      name="source-option"
                      onChange={(e) => { this.onMapModeChange(true) }}
                      checked={this.state.useMapWidget}
                    />
                    <Label
                      style={{ cursor: 'pointer' }}
                      for="map-view"
                      className="ml-1"
                    >
                      {this.getTranslatedString('interactWithMap')}
                    </Label>
                  </div>
                </div>
              </div>
            </SettingRow>
            {setDataContent}
          </SettingSection>

          <SettingSection
            title={this.getTranslatedString('options')}
            role="group"
            aria-label={this.getTranslatedString('options')}
          >
            {actionsContent}
            {optionsContent}
          </SettingSection>
        </div>
      </div>
    )
  }
}
