/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, urlUtils, type IMThemeVariables, defaultMessages as jimuCoreDefaultMessages } from 'jimu-core'
import { SidePopper, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Icon } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { getOutputSettingsStyle } from '../lib/style'
import CoordinateTable from './coordinate-table'
import OutputSettingPopper from './output-settings-popper'
import type { OutputSettings } from '../../config'
import AddPopper from '../components/add-popper'

const IconAdd = require('../assets/add.svg')

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  allSupportedFormats: OutputSettings[]
  config: OutputSettings[]
  onOutputSettingsUpdated: (prop: string, value: OutputSettings[]) => void
}

interface State {
  newAddedConversions: OutputSettings[]
  isAddConversionPopupOpen: boolean
  showOutputSettingsPopper: boolean
  popperFocusNode: HTMLElement
}

export default class OutputSetting extends React.PureComponent<Props, State> {
  sidePopperTrigger = React.createRef<HTMLDivElement>()
  constructor (props) {
    super(props)
    this.state = {
      newAddedConversions: this.props.config.length > 0 ? this.props.config : this.props.allSupportedFormats,
      isAddConversionPopupOpen: false,
      showOutputSettingsPopper: false,
      popperFocusNode: null
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuCoreDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  onEditButtonClicked = (): void => {
    this.setState({
      showOutputSettingsPopper: !this.state.showOutputSettingsPopper
    })
  }

  closeOutputSettingPopper = () => {
    this.setSidePopperAnchor()
    this.setState({
      showOutputSettingsPopper: false
    })
  }

  onSettingsUpdate = (outputSettings) => {
    this.setState({
      newAddedConversions: outputSettings
    })
    this.props.onOutputSettingsUpdated('outputSettings', outputSettings)
  }

  onAddClick = () => {
    this.setState({
      isAddConversionPopupOpen: true
    })
  }

  addNewConversion = (formatName: string, label: string, currentPattern: string, addAtTheTop: boolean) => {
    const newFormatParams: OutputSettings = {
      name: formatName,
      label: label,
      defaultPattern: currentPattern,
      currentPattern: currentPattern,
      enabled: true,
      isCustom: true
    }

    if (addAtTheTop) {
      this.setState({
        newAddedConversions: [newFormatParams, ...this.state.newAddedConversions]
      }, () => {
        this.props.onOutputSettingsUpdated('outputSettings', this.state.newAddedConversions)
      })
    } else {
      this.setState({
        newAddedConversions: [...this.state.newAddedConversions, newFormatParams]
      }, () => {
        this.props.onOutputSettingsUpdated('outputSettings', this.state.newAddedConversions)
      })
    }
  }

  onAddPopperClose = () => {
    this.setState({
      isAddConversionPopupOpen: false
    })
  }

  setSidePopperAnchor = () => {
    const node: any = this.sidePopperTrigger.current?.getElementsByClassName('jimu-btn')[0]
    this.setState({
      popperFocusNode: node
    })
  }

  render () {
    const newAddedConversions = this.props.config.length > 0 ? this.props.config : this.props.allSupportedFormats
    return <div css={getOutputSettingsStyle(this.props.theme)} style={{ height: '100%', width: '100%', marginTop: '5px' }}>
      <SettingRow>
        <div title={this.nls('addNewLabels')} className=" d-flex align-items-center add-conversion"
          onClick={this.onAddClick.bind(this)}>
          <div className="add-conversion-icon-container d-flex align-items-center justify-content-center mr-2">
            <Icon icon={IconAdd} size={12} />
          </div>
          <div className="text-truncate flex-grow-1">{this.nls('addNewLabels')}</div></div>
      </SettingRow>

      {newAddedConversions &&
        <div ref={this.sidePopperTrigger}>
          <CoordinateTable
            allSupportedFormats={newAddedConversions}
            intl={this.props.intl}
            theme={this.props.theme}
            onEditClick={this.onEditButtonClicked.bind(this)}
            onSettingsUpdate={this.onSettingsUpdate.bind(this)}
          />
        </div>
      }
      {
        <SidePopper backToFocusNode={this.state.popperFocusNode} title={this.nls('editOutputFormats')} isOpen={this.state.showOutputSettingsPopper &&
          !urlUtils.getAppIdPageIdFromUrl().pageId} position='right' toggle={this.closeOutputSettingPopper.bind(this)} trigger={this.sidePopperTrigger?.current}>
          <OutputSettingPopper
            intl={this.props.intl}
            theme={this.props.theme}
            config={newAddedConversions}
            onSettingsUpdate={this.onSettingsUpdate.bind(this)}
          />
        </SidePopper>
      }

      {/* Dialog for selecting new format to be added */}
      {this.state.isAddConversionPopupOpen && this.props.allSupportedFormats && this.props.allSupportedFormats.length > 0 &&
        <AddPopper
          supportedFormats={this.props.allSupportedFormats.filter((format) => { return format.name !== 'address' })}
          theme={this.props.theme}
          intl={this.props.intl}
          isOpen={this.state.isAddConversionPopupOpen}
          onOkClick={this.addNewConversion.bind(this)}
          onClose={this.onAddPopperClose.bind(this)}>
        </AddPopper>
      }
    </div>
  }
}
