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
  DataSourceTypes,
  SupportedJSAPILayerTypes
} from 'jimu-core'
import {
  Switch,
  type BackgroundStyle,
  FillType,
  defaultMessages as jimuDefaultMessage,
  Label,
  Alert
} from 'jimu-ui'
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow,
  // TODO: Change the path
  getAllItemsInMapView,
  LayerSetting
} from 'jimu-ui/advanced/setting-components'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { ELegendMode, type IMConfig, type Style } from '../config'
import defaultMessages from './translations/default'
import { getStyle } from './lib/style'
import GroupRadios from './components/group-radios'
import { type JimuLayerView, MapViewManager } from 'jimu-arcgis'
const textIcon = require('jimu-ui/lib/icons/uppercase.svg')
const allDefaultMessages = Object.assign({}, defaultMessages, jimuDefaultMessage)

export enum CardLayout {
  Auto = 'auto',
  SideBySide = 'side-by-side',
  Stack = 'stack',
}

interface ExtraProps {
  dsJsons: ImmutableObject<{ [dsId: string]: DataSourceJson }>
}

export interface WidgetSettingState {
  cardStyle: boolean
  cardLayoutValue: string
  legendMode: ELegendMode
  activeCustomizeJmvId: string
}

export default class Setting extends React.PureComponent<
AllWidgetSettingProps<IMConfig> & ExtraProps,
WidgetSettingState
> {
  supportedDsTypes = Immutable([
    DataSourceTypes.WebMap,
    DataSourceTypes.WebScene
  ])

  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      dsJsons: state.appStateInBuilder.appConfig.dataSources
    }
  }

  constructor (props) {
    super(props)
    const { cardLayout = CardLayout.Auto, cardStyle = false, legendMode = ELegendMode.ShowVisible } = this.props.config
    this.state = {
      cardStyle: cardStyle,
      cardLayoutValue: cardLayout,
      legendMode: legendMode,
      activeCustomizeJmvId: null
    }
    // Save respectLayerDefinitionExp option in the config to 'true' if it's not defined
    // if (this.props.config.respectLayerDefinitionExp === undefined) {
    //   this.props.onSettingChange({
    //     id: this.props.id,
    //     config: this.props.config.set('respectLayerDefinitionExp', true)
    //   })
    // }
  }

  translate (stringId: string) {
    return this.props.intl.formatMessage({
      id: stringId,
      defaultMessage: allDefaultMessages[stringId]
    })
  }

  getFormattedMessage (stringId: string) {
    return <FormattedMessage id={stringId} defaultMessage={allDefaultMessages[stringId]} />
  }

  getPortUrl = (): string => {
    const portUrl = getAppStore().getState().portalUrl
    return portUrl
  }

  getDefaultStyleConfig (): Style {
    return {
      useCustom: false,
      background: {
        color: '',
        fillType: FillType.FILL
      },
      fontColor: ''
    }
  }

  getStyleConfig (): Style {
    if (this.props.config.style && this.props.config.style.useCustom) {
      return this.props.config.style
    } else {
      return this.getDefaultStyleConfig()
    }
  }

  onOptionsChanged = (checked, name): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(name, checked)
    })
    if (name === 'cardStyle') {
      this.setState({
        cardStyle: checked
      })
    }
  }

  onCardLayoutChange = (cardLayout: CardLayout) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('cardLayout', cardLayout)
    })

    this.setState({
      cardLayoutValue: cardLayout
    })
  }

  onLegendModeChange = (legendMode: ELegendMode) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('legendMode', legendMode)
    })

    this.setState({
      legendMode: legendMode
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
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  onUseCustomStyleChanged = (checked) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['style', 'useCustom'], checked)
    })
  }

  onFontStyleChanged = (color) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['style', 'fontColor'], color)
    })
  }

  onBackgroundStyleChange = (backgroundColor) => {
    const bg = {
      color: backgroundColor,
      fillType: FillType.FILL
    }
    let background = Immutable(
      this.props.config?.style?.background ?? ({} as BackgroundStyle)
    )
    for (const key in bg) {
      switch (key) {
        case 'fillType':
          if (background.fillType !== bg[key]) {
            background = background.set('fillType', bg[key])
          }
          break
        case 'color':
          background = background.set('color', bg[key])
          break
        case 'image':
          background = background.set('image', bg[key])
          break
      }
    }

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['style', 'background'], background)
    })
  }


  onListItemBodyClick = (dataSourceId: string) => {
    const jmvId = `${this.props.useMapWidgetIds?.[0]}-${dataSourceId}`
    this.setState({
      activeCustomizeJmvId: jmvId
    })
  }

  onCustomizeLayerChange = (enable: boolean, jlvIds: string[]) => {
    // No matter it's on/off, clean up the ids array
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['customizeLayerOptions', this.state.activeCustomizeJmvId], {
        isEnabled: enable,
        hiddenJimuLayerViewIds: [],
        // Store all layer ids when enabling customization
        showJimuLayerViewIds: enable ? [...jlvIds] : [],
        showRuntimeAddedLayers: enable ? true : undefined
      })
    })
  }

  onShowRuntimeAddedLayersChange = (enable) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['customizeLayerOptions', this.state.activeCustomizeJmvId, 'showRuntimeAddedLayers'], enable)
    })
  }

  onLayerIdChange = (showJimuLayerViewIds: string[]) => {
    const newConfig = this.props.config.setIn(['customizeLayerOptions', this.state.activeCustomizeJmvId, 'showJimuLayerViewIds'], showJimuLayerViewIds)

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  hideLayers = (jimuLayerView: JimuLayerView) => {
    const parentJlv = jimuLayerView.getParentJimuLayerView()
    const hideParentTypes: string[] = [SupportedJSAPILayerTypes.MapImageLayer, SupportedJSAPILayerTypes.WMSLayer, SupportedJSAPILayerTypes.SubtypeGroupLayer]
    if (parentJlv && hideParentTypes.includes(parentJlv.type)) {
      return true
    }
    // Hide layers that set legendEnabled to `false`
    if (jimuLayerView.layer.legendEnabled !== undefined && !jimuLayerView.layer.legendEnabled) {
      return true
    }
    const hideLayerTypes: string[] = [SupportedJSAPILayerTypes.BuildingComponentSubLayer, SupportedJSAPILayerTypes.BuildingGroupSubLayer]
    return hideLayerTypes.includes(jimuLayerView.type)
  }

  getActiveCustomizeStatus = () => {
    return this.props.config?.customizeLayerOptions?.[this.state.activeCustomizeJmvId]?.isEnabled ?? false
  }

  getShowRuntimeAddedLayerStatus = () => {
    return this.props.config?.customizeLayerOptions?.[this.state.activeCustomizeJmvId]?.showRuntimeAddedLayers ?? true
  }

  getSelectedValues = () => {
    // For the app that has `showJimuLayerViewIds`, uses it directly
    const ret = {}
    if (this.props.config?.customizeLayerOptions) {
      for (const mapId of Object.keys(this.props.config?.customizeLayerOptions)) {
        if(this.props.config.customizeLayerOptions[mapId].isEnabled) {
          ret[mapId] = this.props.config.customizeLayerOptions[mapId].showJimuLayerViewIds
        }
      }
      return ret
    }
    return getAllItemsInMapView(this.state.activeCustomizeJmvId, false)
  }

  isMapWidgetEmpty = (): boolean => {
    const mapViews = MapViewManager.getInstance().getJimuMapViewGroup(this.props.useMapWidgetIds?.[0])?.jimuMapViews || {}
    // The connected widget only have ONE map view & have no data source
    if (Object.keys(mapViews).length <= 1 && !Object.values(mapViews)?.[0]?.dataSourceId) {
      return true
    } else {
      return false
    }
  }

  render () {
    let cardLayoutContent = null
    const label = <Label id='multiple-jimu-map-desc'>{this.translate('customizeDescription')}</Label>

    if (this.state.cardStyle) {
      cardLayoutContent = (
        <SettingRow flow="wrap">
          <GroupRadios value={this.state.cardLayoutValue}
            name={this.translate('cardStyle')}
            onChange={this.onCardLayoutChange}
            itemsIds={['auto', 'sideBySide', 'stack']}
            itemsOptions={Object.values(CardLayout)} >
          </GroupRadios>
        </SettingRow>
      )
    }

    const legendModeContent = (
      // The itemsIds and itemsOptions should stay the same order
      <SettingRow flow="wrap">
        <div style={{ marginLeft: '-0.5rem' }}>
          <GroupRadios
            name={this.translate('legendMode')}
            value={this.state.legendMode}
            onChange={this.onLegendModeChange}
            itemsIds={['showVisible', 'showWithinExtent']}
            itemsOptions={Object.values(ELegendMode)}
          />
        </div>
      </SettingRow>
    )

    let displayStyleContent
    if (this.props.config.style?.useCustom) {
      displayStyleContent = 'block'
    } else {
      displayStyleContent = 'none'
    }

    return (
      <div css={getStyle(this.props.theme)}>
        <div className="widget-setting-legend">
          <SettingSection
            className="map-selector-section"
            role="group"
          >
            <SettingRow label={this.getFormattedMessage('selectMapWidget')} />
            <SettingRow>
              <MapWidgetSelector
                onSelect={this.onMapWidgetSelected}
                useMapWidgetIds={this.props.useMapWidgetIds}
              />
            </SettingRow>

            {
              this.props.useMapWidgetIds?.[0] &&
              <SettingRow
                label={label}
                flow='wrap'
                aria-label={this.translate('customizeDescription')}
                className='customize-layer-list'
              >
                {
                  this.isMapWidgetEmpty() ?
                    <Alert
                      tabIndex={0}
                      className={'warningMsg'}
                      open
                      text={this.translate('customizeLayerWarnings')}
                      type={'warning'}
                    />
                    :
                    <LayerSetting
                      mapWidgetId={this.props.useMapWidgetIds?.[0]}
                      onMapItemClick={this.onListItemBodyClick}
                      mapViewId={this.state.activeCustomizeJmvId}
                      isCustomizeEnabled={this.getActiveCustomizeStatus()}
                      isShowRuntimeAddedLayerEnabled={this.getShowRuntimeAddedLayerStatus()}
                      showTable={false}
                      onToggleCustomize={this.onCustomizeLayerChange}
                      onShowRuntimeAddedLayersChange={this.onShowRuntimeAddedLayersChange}
                      onSelectedLayerIdChange={this.onLayerIdChange}
                      selectedValues={this.getSelectedValues()}
                      hideLayers={this.hideLayers}
                    />
                }
              </SettingRow>
            }
          </SettingSection>

          <SettingSection
            title={this.translate('legendMode')}
            role="group"
            aria-label={this.translate('legendMode')}
          >
            {legendModeContent}
          </SettingSection>

          <SettingSection
            title={this.translate('options')}
            role="group"
            aria-label={this.translate('options')}
          >
            <SettingRow tag='label' label={this.getFormattedMessage('showBaseMap')} >
              <Switch
                className="can-x-switch"
                checked={
                  (this.props.config && this.props.config.showBaseMap) || false
                }
                data-key="showBaseMap"
                onChange={(evt) => {
                  this.onOptionsChanged(evt.target.checked, 'showBaseMap')
                }}
              />
            </SettingRow>

            {/* <SettingRow tag='label' label={this.getFormattedMessage('respectLayerDefinitionExp')} >
              <Switch
                className="can-x-switch"
                checked={
                  (this.props.config && this.props.config.respectLayerDefinitionExp) || false
                }
                data-key="respectLayerDefinitionExp"
                onChange={(evt) => {
                  this.onOptionsChanged(evt.target.checked, 'respectLayerDefinitionExp')
                }}
              />
            </SettingRow> */}

            <SettingRow tag='label' label={this.getFormattedMessage('cardStyle')} >
              <Switch
                className="can-x-switch"
                checked={
                  (this.props.config && this.props.config.cardStyle) || false
                }
                data-key="cardStyle"
                onChange={(evt) => {
                  this.onOptionsChanged(evt.target.checked, 'cardStyle')
                }}
              />
            </SettingRow>
            {cardLayoutContent}

          </SettingSection>

          <SettingSection>
            <SettingRow
              className="advanced-setting-row"
              tag='label'
              label={
                <FormattedMessage id="advance" defaultMessage="Advanced" />
              }
            >
              <Switch
                className="can-x-switch"
                checked={this.getStyleConfig().useCustom || false}
                data-key="showBaseMap"
                onChange={(evt) => {
                  this.onUseCustomStyleChanged(evt.target.checked)
                }}
              />
            </SettingRow>
            <div className="mt-4" style={{ display: displayStyleContent }}>
              <SettingRow
                label={<FormattedMessage id="font" defaultMessage="Font" />}
              >
                <ThemeColorPicker
                  icon={textIcon}
                  type="with-icon"
                  specificTheme={this.props.theme2}
                  value={
                    this.getStyleConfig().fontColor || ''
                  }
                  onChange={this.onFontStyleChanged}
                  aria-label={this.translate('fontColor')}
                />
              </SettingRow>
              <SettingRow
                label={
                  <FormattedMessage
                    id="background"
                    defaultMessage="Background"
                  />
                }
              >
                <ThemeColorPicker
                  specificTheme={this.props.theme2}
                  value={
                    this.getStyleConfig().background?.color ||
                    this.props.theme2.sys.color.surface.paper ||
                    ''
                  }
                  onChange={this.onBackgroundStyleChange}
                  aria-label={this.translate('backgroundColor')}
                />
              </SettingRow>
            </div>
          </SettingSection>
        </div>
      </div>
    )
  }
}
