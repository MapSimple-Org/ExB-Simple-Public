import { React, type DataActionSettingProps, injectIntl, type ImmutableObject, Immutable, FormattedMessage } from 'jimu-core'
import { Radio, Label, Checkbox } from 'jimu-ui'
import { SymbolSelector, JimuSymbolType, type JimuSymbol } from 'jimu-ui/advanced/map'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../setting/translations/default'
import { type SymbolOption, loadArcGISJSAPIModules, featureUtils } from 'jimu-arcgis'
import type { IMShowOnMapConfig } from '../common/show-on-map-common'

interface States {
  isModulesLoaded?: boolean
}

class _ShowOnMapSetting extends React.PureComponent<DataActionSettingProps<IMShowOnMapConfig>, States> {
  jsonUtils: typeof __esri.symbolsSupportJsonUtils
  defaultSymbolOption: ImmutableObject<SymbolOption>

  static defaultProps = {
    config: Immutable({
      isUseCustomSymbol: true,
      isOperationalLayer: true
    })
  }

  constructor (props) {
    super(props)
    this.jsonUtils = null
    this.defaultSymbolOption = Immutable({})
    this.state = {
      isModulesLoaded: false
    }
  }

  componentDidMount () {
    loadArcGISJSAPIModules([
      'esri/symbols/support/jsonUtils'
    ]).then(modules => {
      [this.jsonUtils] = modules

      this.setState({
        isModulesLoaded: true
      })
    })

    // TODO:
    // In the componentDidMount method of ShowOnMap message action setting, it calls this.props.onSettingChange() to update this.props.config,
    // why we don't do it here ?
  }

  onOperationalLayerCheckboxChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const checked = !!(evt?.target?.checked)
    const newConfig = this.props.config.set('isOperationalLayer', checked)
    this.props.onSettingChange(newConfig)
  }

  handleIsUseCustomSymbolOption = (isUseCustomSymbol: boolean) => {
    this.props.onSettingChange({ ...this.props.config.set('isUseCustomSymbol', isUseCustomSymbol).set('symbolOption', null) })
  }

  onSymbolCreated = (symbol: JimuSymbol, type: string) => {
    this.defaultSymbolOption = this.defaultSymbolOption.set(type, symbol?.toJSON())
    if (!this.props.config.symbolOption &&
        this.defaultSymbolOption.pointSymbol &&
        this.defaultSymbolOption.polylineSymbol &&
        this.defaultSymbolOption.polygonSymbol) {
      this.props.onSettingChange({ ...this.props.config.set('symbolOption', this.defaultSymbolOption) })
    }
  }

  onSymbolChanged = (symbol: JimuSymbol, type: string) => {
    this.props.onSettingChange({
      ...this.props.config.setIn(['symbolOption', type], symbol.toJSON())
    })
  }

  getInitSymbolFromConfig = (jimuSymbolType: JimuSymbolType): JimuSymbol => {
    let symbol
    const symbolOption = this.props.config.symbolOption
    if (this.jsonUtils) {
      if (jimuSymbolType === JimuSymbolType.Point) {
        symbol = symbolOption?.pointSymbol ? symbolOption.pointSymbol : featureUtils.getDefaultSymbol('point')
      } else if (jimuSymbolType === JimuSymbolType.Polyline) {
        symbol = symbolOption?.polylineSymbol ? symbolOption.polylineSymbol : featureUtils.getDefaultSymbol('polyline')
      } else if (jimuSymbolType === JimuSymbolType.Polygon) {
        symbol = symbolOption?.polygonSymbol ? symbolOption.polygonSymbol : featureUtils.getDefaultSymbol('polygon')
      }
    }
    // @ts-expect-error
    return symbol ? this.jsonUtils.fromJSON(symbol) : null
  }

  render () {
    const isOperationalLayer = !!(this.props.config?.isOperationalLayer)
    const pointLabel = this.props.intl.formatMessage({ id: 'mapAction_Point', defaultMessage: defaultMessages.mapAction_Point })
    const polylineLabel = this.props.intl.formatMessage({ id: 'mapAction_Polyline', defaultMessage: defaultMessages.mapAction_Polyline })
    const polygonLabel = this.props.intl.formatMessage({ id: 'mapAction_Polygon', defaultMessage: defaultMessages.mapAction_Polygon })

    return (
      <div className='w-100'>
        <SettingSection title={this.props.intl.formatMessage({ id: 'symbol', defaultMessage: 'symbol' })} className='pt-0'>
          {/* Use layer-defined symbols */}
          <SettingRow className='mt-0'>
            <div className='d-flex justify-content-between w-100 align-items-center'>
              <div className='align-items-center d-flex'>
                <Radio
                  style={{ cursor: 'pointer' }} checked={!this.props.config.isUseCustomSymbol}
                  onChange={() => { this.handleIsUseCustomSymbolOption(false) }}
                  aria-labelledby='useLayerDefinedLabel'
                />
                <label id='useLayerDefinedLabel' className='m-0 ml-2' style={{ cursor: 'pointer' }}>
                  {this.props.intl.formatMessage({ id: 'mapAction_UseLayerDefinedSymbols', defaultMessage: defaultMessages.mapAction_UseLayerDefinedSymbols })}
                </label>
              </div>
            </div>
          </SettingRow>

          {/* Use custom symbols */}
          <SettingRow>
            <div className='d-flex justify-content-between w-100 align-items-center'>
              <div className='align-items-center d-flex'>
                <Radio
                  style={{ cursor: 'pointer' }} checked={this.props.config.isUseCustomSymbol}
                  onChange={() => { this.handleIsUseCustomSymbolOption(true) }}
                  aria-labelledby='useCustomLabel'
                />
                <label id='useCustomLabel' className='m-0 ml-2' style={{ cursor: 'pointer' }}>
                  {this.props.intl.formatMessage({ id: 'mapAction_UseCustomSymbols', defaultMessage: defaultMessages.mapAction_UseCustomSymbols })}
                </label>
              </div>
            </div>
          </SettingRow>

          {/* symbol selectors */}
          {
            this.props.config.isUseCustomSymbol && this.jsonUtils &&
            <SettingSection className='pb-0'>
              <SettingRow className='d-flex justify-content-around'>
                <div className='symbol-selector d-flex flex-column align-items-center w-25' title ={pointLabel}>
                  <SymbolSelector jimuSymbolType={JimuSymbolType.Point} symbol={this.getInitSymbolFromConfig(JimuSymbolType.Point)}
                                                                        onCreated={ (symbolParam) => { this.onSymbolCreated(symbolParam.symbol, 'pointSymbol') } }
                                                                        onPointSymbolChanged={ (symbol) => { this.onSymbolChanged(symbol, 'pointSymbol') } }/>
                  <label className='m-0 ml-0 w-100 d-block text-center' style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pointLabel}
                  </label>
                </div>
                <div className='symbol-selector d-flex flex-column align-items-center w-25' title={polylineLabel}>
                  <SymbolSelector jimuSymbolType={JimuSymbolType.Polyline} symbol={this.getInitSymbolFromConfig(JimuSymbolType.Polyline)}
                                                                          onCreated={ (symbolParam) => { this.onSymbolCreated(symbolParam.symbol, 'polylineSymbol') } }
                                                                          onPolylineSymbolChanged={ (symbol) => { this.onSymbolChanged(symbol, 'polylineSymbol') } }/>
                  <label className='m-0 ml-0 w-100 d-block text-center' style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {polylineLabel}
                  </label>
                </div>
                <div className='symbol-selector d-flex flex-column align-items-center w-25' title={polygonLabel}>
                  <SymbolSelector jimuSymbolType={JimuSymbolType.Polygon} symbol={this.getInitSymbolFromConfig(JimuSymbolType.Polygon)}
                                                                          onCreated={ (symbolParam) => { this.onSymbolCreated(symbolParam.symbol, 'polygonSymbol') } }
                                                                          onPolygonSymbolChanged={ (symbol) => { this.onSymbolChanged(symbol, 'polygonSymbol') } }/>
                  <label className='m-0 ml-0 w-100 d-block text-center' style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {polygonLabel}
                  </label>
                </div>
              </SettingRow>
            </SettingSection>
          }
        </SettingSection>

        <SettingSection>
          {/* operation layer */}
          <SettingRow>
            <Label>
              <Checkbox
                checked={isOperationalLayer}
                className='mr-1'
                onChange={this.onOperationalLayerCheckboxChange}
              />
              <FormattedMessage id='mapAction_OperationalLayer' defaultMessage={defaultMessages.mapAction_OperationalLayer} />
            </Label>
          </SettingRow>
        </SettingSection>
      </div>
    )
  }
}

export default injectIntl(_ShowOnMapSetting)
