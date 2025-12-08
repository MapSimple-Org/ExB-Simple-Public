/** @jsx jsx */
import { React, jsx, getAppStore, type ImmutableArray, type UseUtility } from 'jimu-core'
import { defaultMessages as jimuUIDefaultMessages, CollapsablePanel } from 'jimu-ui'
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { BaseWidgetSetting, type AllWidgetSettingProps } from 'jimu-for-builder'
import type { IMConfig, OutputSettings, InputSettings } from '../config'
import defaultMessages from './translations/default'
import { getStyle } from './lib/style'
import InputSetting from './components/input-settings'
import OutputSetting from './components/output-settings'
import AddressSettings from './components/address-settings'
import GeneralSettings from './components/general-settings'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

interface State {
  supportedFormats: OutputSettings[]
  isInputSettingsOpen: boolean
  isOutputSettingsOpen: boolean
  isAddressSettingsOpen: boolean
  isGeneralSettingsOpen: boolean
  apiLoaded: boolean
  coordinateVM: typeof __esri.CoordinateConversionViewModel
}

export default class Setting extends BaseWidgetSetting<AllWidgetSettingProps<IMConfig>, State> {
  CoordinateConversionViewModel: typeof __esri.CoordinateConversionViewModel = null
  Format: typeof __esri.Format = null
  reactiveUtils: typeof __esri.reactiveUtils = null
  private readonly outputSettingsObj = React.createRef<OutputSetting>()
  private readonly isRTL: boolean

  constructor (props) {
    super(props)
    this.state = {
      supportedFormats: [],
      apiLoaded: false,
      isInputSettingsOpen: false,
      isOutputSettingsOpen: false,
      isAddressSettingsOpen: true,
      isGeneralSettingsOpen: false,
      coordinateVM: null
    }

    this.isRTL = false

    const appState = getAppStore().getState()
    this.isRTL = appState?.appContext?.isRTL
  }

  nls = (id: string) => {
    //for unit testing no need to mock intl we can directly use default en msg
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/widgets/CoordinateConversion/CoordinateConversionViewModel',
        'esri/widgets/CoordinateConversion/support/Format',
        'esri/core/reactiveUtils'
      ]).then(modules => {
        [this.CoordinateConversionViewModel, this.Format, this.reactiveUtils] = modules
        this.setState({
          apiLoaded: true
        })
        this.createCoordinateConversionViewModel()
      })
    }
  }

  createCoordinateConversionViewModel () {
    if (!this.state.coordinateVM) {
      const cVM = new this.CoordinateConversionViewModel()
      this.reactiveUtils.watch(() => cVM.messages, () => {
        setTimeout(() => {
          const allSupportedFormats: OutputSettings[] = []
          const addressFormat: OutputSettings = {
            name: 'address',
            label: this.nls('address'),
            defaultPattern: '',
            currentPattern: '',
            enabled: true,
            isCustom: false
          }
          allSupportedFormats.push(addressFormat)

          cVM.formats.forEach((format) => {
            if (format.name !== 'basemap') {
              const newSupportedFormat: OutputSettings = {
                name: format.name,
                label: this.nls(format.name),
                defaultPattern: format.defaultPattern,
                currentPattern: format.defaultPattern,
                enabled: true,
                isCustom: false
              }
              allSupportedFormats.push(newSupportedFormat)
            }
          })

          allSupportedFormats.sort((a, b) => a.label.localeCompare(b.label))

          this.setState({
            supportedFormats: allSupportedFormats
          })
        }, 100)
      })
    }
  }

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  onToggleInputSettings = () => {
    this.setState({
      isInputSettingsOpen: !this.state.isInputSettingsOpen
    })
  }

  onToggleOutputSettings = () => {
    this.setState({
      isOutputSettingsOpen: !this.state.isOutputSettingsOpen
    }, () => {
      //Close the output settings popper once the output settings are closed
      if (this.outputSettingsObj && this.outputSettingsObj.current && !this.state.isOutputSettingsOpen) {
        this.outputSettingsObj.current.closeOutputSettingPopper()
      }
    })
  }

  onToggleAddressSettings = () => {
    this.setState({
      isAddressSettingsOpen: !this.state.isAddressSettingsOpen
    })
  }

  onToggleGeneralSettings = () => {
    this.setState({
      isGeneralSettingsOpen: !this.state.isGeneralSettingsOpen
    })
  }

  updateInputSettings = (property: string, value: InputSettings) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn([property], value)
    })
  }

  updateOutputSettings = (property: string, value: OutputSettings[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn([property], value)
    })
  }

  updateAddressSettings = (property: string, value: string | number | ImmutableArray<UseUtility> | [] | boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['addressSettings', property], value)
    })
  }

  updateGeneralSettings = (property: string, value: number | __esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol | __esri.PointSymbol3D) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['generalSettings', property], value)
    })
  }

  render () {
    return (
      <div css={getStyle(this.props.theme)}>
        <div className={'widget-setting-coordinate-conversion'}>
          <SettingSection className={'map-selector-section'}>
            <SettingRow>
              <div className='text-truncate flex-grow-1 title3 hint-default' title={this.nls('selectMapWidget')}>
                {this.nls('selectMapWidget')}
              </div>
            </SettingRow>
            <SettingRow>
              <MapWidgetSelector onSelect={this.onMapWidgetSelected.bind(this)} useMapWidgetIds={this.props.useMapWidgetIds} />
            </SettingRow>
          </SettingSection>

          <SettingSection>
            <CollapsablePanel
              label={this.nls('addressSettingsLabel')}
              isOpen={this.state.isAddressSettingsOpen}
              onRequestOpen={() => { this.onToggleAddressSettings() }}
              onRequestClose={() => { this.onToggleAddressSettings() }}>
              <SettingRow flow='wrap'>
                <AddressSettings
                  intl={this.props.intl}
                  theme={this.props.theme}
                  portalSelf={this.props.portalSelf}
                  config={this.props.config.addressSettings}
                  isRTL={this.isRTL}
                  onAddressSettingsUpdated={this.updateAddressSettings}
                />
              </SettingRow>
            </CollapsablePanel>
          </SettingSection>

          <SettingSection>
            <CollapsablePanel
              label={this.nls('inputSettingsLabel')}
              isOpen={this.state.isInputSettingsOpen}
              onRequestOpen={() => { this.onToggleInputSettings() }}
              onRequestClose={() => { this.onToggleInputSettings() }}>
              <SettingRow flow='wrap'>
                <InputSetting
                  allSupportedFormats={this.state.supportedFormats}
                  intl={this.props.intl}
                  theme={this.props.theme}
                  config={this.props.config.inputSettings}
                  onInputSettingsUpdated={this.updateInputSettings}
                />
              </SettingRow>
            </CollapsablePanel>
          </SettingSection>

          <SettingSection>
            <CollapsablePanel
              label={this.nls('outputSettingsLabel')}
              isOpen={this.state.isOutputSettingsOpen}
              onRequestOpen={() => { this.onToggleOutputSettings() }}
              onRequestClose={() => { this.onToggleOutputSettings() }}>
              <SettingRow flow='wrap'>
                {this.state.supportedFormats && this.state.supportedFormats.length > 0 &&
                  <OutputSetting
                    allSupportedFormats={this.state.supportedFormats}
                    intl={this.props.intl}
                    theme={this.props.theme}
                    config={this.props.config.outputSettings.asMutable()}
                    onOutputSettingsUpdated={this.updateOutputSettings}
                    ref={this.outputSettingsObj}
                  />
                }
              </SettingRow>
            </CollapsablePanel>
          </SettingSection>

          {this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0 &&
            <SettingSection>
              <CollapsablePanel
                label={this.nls('generalSettingsLabel')}
                isOpen={this.state.isGeneralSettingsOpen}
                onRequestOpen={() => { this.onToggleGeneralSettings() }}
                onRequestClose={() => { this.onToggleGeneralSettings() }}>
                <SettingRow flow='wrap'>
                  <GeneralSettings
                    intl={this.props.intl}
                    theme={this.props.theme}
                    config={this.props.config.generalSettings}
                    onGeneralSettingsUpdated={this.updateGeneralSettings}
                  />
                </SettingRow>
              </CollapsablePanel>
            </SettingSection>
          }
        </div>
      </div>
    )
  }
}
