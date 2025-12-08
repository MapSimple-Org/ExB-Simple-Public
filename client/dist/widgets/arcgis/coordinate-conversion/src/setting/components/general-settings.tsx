/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { NumericInput, Label } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { getGeneralSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import { SymbolSelector, JimuSymbolType } from 'jimu-ui/advanced/map'
import type { IMGeneralSettings } from '../../config'

const defaultSymbol = {
  type: 'esriPMS',
  angle: 0,
  xoffset: 2,
  yoffset: 8,
  contentType: 'image/png',
  // eslint-disable-next-line no-multi-str
  imageData: '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\
			 v+Tf38HMj5k7OWK5X8AAAAASUVORK5CYII=',
  url: 'https://static.arcgis.com/images/Symbols/Basic/BlueShinyPin.png',
  height: 24,
  width: 24
}

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  config: IMGeneralSettings
  onGeneralSettingsUpdated: (prop: string, value: number | __esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol | __esri.PointSymbol3D) => void
}

interface State {
  apiLoaded: boolean
  isPanelOpened: boolean
}

export default class GeneralSettings extends React.PureComponent<Props, State> {
  private jsonUtils: typeof __esri.jsonUtils = null
  private updatedSymbol: __esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol | __esri.PointSymbol3D
  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false,
      isPanelOpened: false
    }
    this.updatedSymbol = null
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
        'esri/symbols/support/jsonUtils'
      ]).then(modules => {
        [this.jsonUtils] = modules
        this.setState({
          apiLoaded: true
        })
      })
    }
  }

  onZoomScaleInputChange = (value: number) => {
    this.props.onGeneralSettingsUpdated('zoomScale', value)
  }

  showSymbolChooser = () => {
    this.setState({
      isPanelOpened: true
    })
  }

  onPointSymbolChanged = (currentSymbol) => {
    let symbol = currentSymbol
    if(currentSymbol === null) {
      symbol = this.jsonUtils.fromJSON(defaultSymbol)
    }

    this.onSymbolChange(symbol)
    this.onSymbolClick()
  }

  onSymbolChange = (currentSymbol) => {
    this.updatedSymbol = currentSymbol
  }

  onSymbolClick = () => {
    this.props.onGeneralSettingsUpdated('defaultPointSymbol', this.updatedSymbol?.toJSON())
    this.closeSymbolChooser()
  }

  closeSymbolChooser = () => {
    this.setState({
      isPanelOpened: false
    })
  }

  render () {
    const symbol = this.props.config && this.props.config.defaultPointSymbol
      ? this.jsonUtils?.fromJSON(this.props.config.defaultPointSymbol) as any
      : this.jsonUtils?.fromJSON(defaultSymbol) as any
    return <div style={{ height: '100%', marginTop: '5px' }}>
      <div css={getGeneralSettingsStyle(this.props.theme)}>
        {this.state.apiLoaded &&
          <SettingRow label={this.nls('locationSymbol')} flow={'wrap'}>
            {symbol &&
              <SymbolSelector
                jimuSymbolType={JimuSymbolType.Point}
                symbol={symbol}
                onPointSymbolChanged={this.onPointSymbolChanged.bind(this)}
              ></SymbolSelector>
            }
          </SettingRow>
        }

        <SettingRow className={'hint'} label={this.nls('symbolLocationHint')}>
        </SettingRow>

        <SettingRow label={this.nls('zoomScale')}>
          <Label>1 :</Label>
          <NumericInput aria-label={this.nls('zoomScale')} size={'sm'} className={'mx-1 zoomScaleInput'}
            value={this.props.config?.zoomScale ? this.props.config.zoomScale : 50000} showHandlers={false} onChange={this.onZoomScaleInputChange} />
        </SettingRow>
      </div>
    </div>
  }
}
