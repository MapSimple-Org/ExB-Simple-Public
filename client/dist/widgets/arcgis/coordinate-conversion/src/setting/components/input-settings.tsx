/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { Icon, TextInput, Button, Select, Option } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getInputSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type { InputSettings, OutputSettings } from '../../config'

const iconReset = require('jimu-ui/lib/icons/reset-outlined-16.svg')

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  allSupportedFormats: OutputSettings[]
  config: InputSettings
  onInputSettingsUpdated: (prop: string, value: InputSettings) => void
}

interface State {
  defaultCoords: string
  defFormat: string
}

export default class InputSetting extends React.PureComponent<Props, State> {
  constructor (props) {
    super(props)
    if (this.props.config) {
      this.state = {
        defaultCoords: this.props.config.defaultCoordinate,
        defFormat: this.props.config.format
      }
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

  onDefaultCoordsChange = (evt) => {
    this.setState({
      defaultCoords: evt.target.value
    }, () => {
      this.resetToDefaultPattern(this.state.defaultCoords)
    })
  }

  onFormatChange = (event) => {
    if (event && event.target) {
      const value = event.target.value
      this.setState({
        defFormat: value
      }, () => {
        this.updateInputSettingsInConfig()
      })
    }
  }

  onResetButtonClick = () => {
    const selectedValue = this.state.defaultCoords
    this.resetToDefaultPattern(selectedValue)
  }

  resetToDefaultPattern = (selectedValue: string) => {
    const selectedItem = this.props.allSupportedFormats.find(i => i.name === selectedValue)
    if (selectedItem) {
      this.setState({
        defFormat: selectedItem.defaultPattern
      }, () => {
        this.updateInputSettingsInConfig()
      })
    }
  }

  updateInputSettingsInConfig = () => {
    this.props.onInputSettingsUpdated('inputSettings', {
      defaultCoordinate: this.state.defaultCoords,
      format: this.state.defFormat
    })
  }

  render () {
    return <div style={{ height: '100%', width: '100%', marginTop: '5px' }}>
      <div css={getInputSettingsStyle(this.props.theme)}>
        <SettingRow label={this.nls('defaultCoordinate')} flow={'wrap'}>
          <Select aria-label={this.nls('defaultCoordinate')} name={'defaultCoords'}
            size={'sm'} value={this.props.config.defaultCoordinate}
            onChange={this.onDefaultCoordsChange} >
            {this.props.allSupportedFormats.map((option, index) => {
              return <Option role={'option'} tabIndex={0} aria-label={option.label} key={index} value={option.name}>{option.label}</Option>
            })}
          </Select>
        </SettingRow>

        <SettingRow label={this.nls('coordinateFormat')} flow={'wrap'}
          className={this.props.config.defaultCoordinate === 'address' ? 'hidden' : ''}>
          <div className={'d-flex justify-content-between w-100 align-items-center'}>
            <TextInput role={'textbox'} aria-label={this.nls('coordinateFormat')}
              className={'formatLabel'} size={'sm'} value={this.props.config.format} onChange={this.onFormatChange} />
            <Button title={this.nls('resetFormat')} className={'ml-2'} icon type={'tertiary'} size={'sm'}
              onClick={this.onResetButtonClick.bind(this)}>
              <Icon icon={iconReset} size={14} />
            </Button>
          </div>
        </SettingRow>
      </div>
    </div >
  }
}
