/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape } from 'jimu-core'
import { Button, TextInput, Icon, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import type { OutputSettings } from '../../config'

const IconReset = require('jimu-ui/lib/icons/reset-outlined-16.svg')
const IconClose = require('jimu-ui/lib/icons/close-12.svg')

interface Props {
  intl: IntlShape
  index: number
  key: number
  config: OutputSettings
  onDelete: (index: number) => void
  onPatternUpdate: (formatIndex: number, formatName: string, currentPattern: string) => void
}

interface State {
  currentPattern: string
}

export default class EditCurrentPattern extends React.PureComponent<Props, State> {
  items = []
  constructor (props) {
    super(props)
    this.state = {
      currentPattern: this.props.config.currentPattern
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

  componentDidUpdate = (prevProps) => {
    if (prevProps.config.currentPattern !== this.props.config.currentPattern) {
      this.setState({
        currentPattern: this.props.config.currentPattern
      })
    }
  }

  onCurrentPatternChange = (e) => {
    const value = e.target.value
    //since this will trigger config change, only process if value is changed.
    if (this.state.currentPattern === value) {
      return
    }
    this.setState({
      currentPattern: value
    })
    this.props.onPatternUpdate(this.props.index, this.props.config.name, e.target.value)
  }

  onResetButtonClick = (evt) => {
    this.setState({
      currentPattern: this.props.config.defaultPattern
    }, () => {
      this.props.onPatternUpdate(this.props.index, this.props.config.name, this.state.currentPattern)
    })
  }

  onDeleteButtonClick = (evt) => {
    this.props.onDelete(this.props.index)
  }

  render () {
    //don't render Address options in output settings popper
    if (this.props?.config?.name === 'address') {
      return null
    }
    return <SettingRow flow={'wrap'} label={this.props.config.label}>
      <div className={'d-flex justify-content-between w-100 align-items-center'}>
        <TextInput role={'textbox'} aria-label={this.props.config.label} size={'sm'} value={this.state.currentPattern} onChange={this.onCurrentPatternChange} />
        {/* Show reset button for default options and for custom options show delete button */}
        {!this.props.config?.isCustom &&
          <Button aria-label={this.nls('resetFormat')} title={this.nls('resetFormat')} className={'ml-2'} icon type={'tertiary'} size={'sm'} onClick={this.onResetButtonClick.bind(this)}>
            <Icon icon={IconReset} size={14} />
          </Button>
        }
        {this.props.config.isCustom &&
          <Button aria-label={this.nls('deleteLabel')} title={this.nls('deleteLabel')} className={'ml-2'} icon type={'tertiary'} size={'sm'} onClick={this.onDeleteButtonClick.bind(this)}>
            <Icon icon={IconClose} size={14} />
          </Button>
        }
      </div>
    </SettingRow>
  }
}
