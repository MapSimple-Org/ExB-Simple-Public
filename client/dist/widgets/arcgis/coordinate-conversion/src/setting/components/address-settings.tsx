/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, Immutable, type UseUtility, SupportedUtilityType, type ImmutableArray } from 'jimu-core'
import { NumericInput, Label, Icon, Tooltip, defaultMessages as jimuUIDefaultMessages, Checkbox } from 'jimu-ui'
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getAddressSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type Portal from 'esri/portal/Portal'
import type { IMAddressSettings } from '../../config'

const infoIcon = require('jimu-icons/svg/outlined/suggested/info.svg')

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  portalSelf: Portal
  config: IMAddressSettings
  isRTL: boolean
  onAddressSettingsUpdated: (prop: string | any[], value: string | number | ImmutableArray<UseUtility> | [] | boolean) => void
}

interface State {
  geocodeLocatorUrl: string
  updateGeocodeLocatorUrl: string
  isAlertPopupOpen: boolean
  isInvalidValue: boolean
}

const supportedUtilityTypes = [SupportedUtilityType.GeoCoding]

export default class AddressSettings extends React.PureComponent<Props, State> {
  constructor (props) {
    super(props)

    let geocodeServiceUrl = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'

    if (this.props.config && this.props.config.geocodeServiceUrl) {
      geocodeServiceUrl = this.props.config.geocodeServiceUrl
    } else if (this.props.portalSelf && this.props.portalSelf.helperServices &&
      this.props.portalSelf.helperServices.geocode &&
      this.props.portalSelf.helperServices.geocode.length > 0 &&
      this.props.portalSelf.helperServices.geocode[0].url) { //Use org's first geocode service if available
      geocodeServiceUrl = this.props.portalSelf.helperServices.geocode[0].url
    }

    this.state = {
      geocodeLocatorUrl: geocodeServiceUrl,
      updateGeocodeLocatorUrl: geocodeServiceUrl,
      isAlertPopupOpen: false,
      isInvalidValue: false
    }
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
    //When using geocode service URL from helper services it was not getting updated in config
    //as we were updating service URL only on OK button click
    // so set geocodeServiceUrl from here it will be updated in config
    this.props.onAddressSettingsUpdated('geocodeServiceUrl', this.state.geocodeLocatorUrl)
  }

  onCandidateScoreChange = (value: number | undefined) => {
    this.props.onAddressSettingsUpdated('minCandidateScore', value)
  }

  onMaxSuggestionsChange = (value: number | undefined) => {
    this.props.onAddressSettingsUpdated('maxSuggestions', value)
  }

  onUtilityChange = (utilities: ImmutableArray<UseUtility>) => {
    this.props.onAddressSettingsUpdated('useUtilitiesGeocodeService', utilities)
  }

  onDisplayFullAddressOptionChanged = (evt) => {
    this.props.onAddressSettingsUpdated('displayFullAddress', evt.target.checked)
  }

  render () {
    return <div style={{ height: '100%', width: '100%', marginTop: '5px' }}>
      <div css={getAddressSettingsStyle(this.props.theme)}>
        <SettingRow flow='wrap'>
          <UtilitySelector
            useUtilities={Immutable(this.props.config?.useUtilitiesGeocodeService ? this.props.config.useUtilitiesGeocodeService : [])}
            onChange={this.onUtilityChange}
            showRemove={true}
            closePopupOnSelect
            types={supportedUtilityTypes}
          />
        </SettingRow>

        {this.props.config?.useUtilitiesGeocodeService?.length < 1 &&
          <SettingRow className={'locator-url'}>
            <Label tabIndex={0} aria-label={this.state.geocodeLocatorUrl}>{this.state.geocodeLocatorUrl}</Label>
            <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('defaultGeocodeUrlTooltip')}
              title={this.nls('defaultGeocodeUrlTooltip')} showArrow placement='top'>
              <div className='ml-2 d-inline defGeocode-tooltip'>
                <Icon size={14} icon={infoIcon} />
              </div>
            </Tooltip>
          </SettingRow>
        }

        <SettingRow label={this.nls('minCandidateScore')}>
          <NumericInput aria-label={this.nls('minCandidateScore')} className={'addrSettingNumericInput'}
            size={'sm'} min={0} max={100} value={this.props.config?.minCandidateScore || 100}
            onChange={this.onCandidateScoreChange} />
        </SettingRow>

        <SettingRow label={this.nls('maxSuggestions')}>
          <NumericInput aria-label={this.nls('maxSuggestions')} className={'addrSettingNumericInput'}
            size={'sm'} min={0} max={100} value={this.props.config?.maxSuggestions || this.props.config?.maxSuggestions === 0
              ? this.props.config.maxSuggestions
              : 6
            }
            onChange={this.onMaxSuggestionsChange} />
        </SettingRow>

        <SettingRow>
          <Label check centric style={{ cursor: 'pointer' }} className='title3 hint-default'>
            <Checkbox role={'checkbox'} aria-label={this.nls('showFullAddress')}
              style={{ cursor: 'pointer' }} className='mr-2' checked={this.props.config?.displayFullAddress || false}
              onChange={this.onDisplayFullAddressOptionChanged.bind(this)}
            />
            {this.nls('showFullAddress')}
          </Label>
        </SettingRow>

        <SettingRow className='ml-2 title3 hint-default'>
          <Label style={{ fontStyle: 'italic' }}>
            {this.nls('showFullAddressHint')}
          </Label>
        </SettingRow>
      </div>
    </div>
  }
}
