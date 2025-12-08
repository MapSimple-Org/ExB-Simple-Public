/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Label, Switch, Tooltip, Icon, CollapsablePanel, defaultMessages as jimuUIDefaultMessages, Select, Option } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getGeneralSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type { GeneralSetting } from '../../config'
import { getConfigIcon, onWidgetLoadOptions } from '../constants'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

const { epConfigIcon } = getConfigIcon()

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  config: GeneralSetting
  onGeneralSettingsUpdated: (prop: string, value: string | boolean | GeneralSetting, isAllGeneralSettingsUpdate?: boolean) => void
}

interface IState {
  activeTool: string
  isAppearanceSettingsOpen: boolean
}

export default class GeneralSettings extends React.PureComponent<Props, IState> {
  constructor (props) {
    super(props)
    let currentActiveTool = onWidgetLoadOptions[0].value
    //for backward compatibility
    if (this.props.config.isSelectToolActive) {
      currentActiveTool = onWidgetLoadOptions[1].value
    } else if (this.props.config.isDrawToolActive) {
      currentActiveTool = onWidgetLoadOptions[2].value
    }
    this.state = {
      activeTool: currentActiveTool,
      isAppearanceSettingsOpen: false
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
    // For backward compatibility, export option is toggled OFF for existing widget configurations
    // and toggled ON by default for newly added widgets
    this.props.onGeneralSettingsUpdated('allowExport', this.props.config.allowExport ? this.props.config.allowExport : false)
  }

  allowExportOptionChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onGeneralSettingsUpdated('allowExport', evt.target.checked)
  }

  onKeepResultOptionChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onGeneralSettingsUpdated('keepResultsWhenClosed', evt.target.checked)
  }

  onActiveToolChange = (evt) => {
    this.setState({
      activeTool: evt.target.value
    })
    this.generalSettingsUpdate(evt.target.value)
  }

  generalSettingsUpdate = (value) => {
    const generalSettings = {
      allowExport:this.props.config.allowExport,
      keepResultsWhenClosed: this.props.config.keepResultsWhenClosed,
      isSelectToolActive: value === onWidgetLoadOptions[1].value,
      isDrawToolActive: value === onWidgetLoadOptions[2].value,
      showGridAxis: this.props.config.showGridAxis,
      showAxisTitles: this.props.config.showAxisTitles,
      showLegend: this.props.config.showLegend,
      buttonStyle: this.props.config.buttonStyle
    }
    this.props.onGeneralSettingsUpdated('generalSettings', generalSettings, true)
  }

  onToggleAppearance = () => {
    this.setState({
      isAppearanceSettingsOpen: !this.state.isAppearanceSettingsOpen
    })
  }

  onShowGridChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onGeneralSettingsUpdated('showGridAxis', evt.target.checked)
  }

  onShowAxisTitlesChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onGeneralSettingsUpdated('showAxisTitles', evt.target.checked)
  }

  legendStateChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onGeneralSettingsUpdated('showLegend', evt.target.checked)
  }

  render () {
    const activeTool = this.props.config.isSelectToolActive ? onWidgetLoadOptions[1].value : this.props.config.isDrawToolActive ?
    onWidgetLoadOptions[2].value : onWidgetLoadOptions[0].value
    return <div style={{ height: '100%', width: '100%', marginTop: 5 }} css={getGeneralSettingsStyle(this.props.theme)}>
      <SettingRow tag='label' label={this.nls('allowExportLabel')}>
        <Switch role={'switch'}
          title={this.nls('allowExportLabel')}
          checked={this.props.config.allowExport ? this.props.config.allowExport : false}
          onChange={this.allowExportOptionChange} />
      </SettingRow>
      <SettingRow>
        <Label className='w-100 d-flex'>
          <div className='flex-grow-1 text-break title3 hint-default'>
            {this.nls('keepResultsWhenClosed')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('keepResultsWhenClosedTooltip')}
          title={this.nls('keepResultsWhenClosedTooltip')} showArrow placement='top'>
          <div className='title3 text-default mr-3 d-inline'>
            <InfoOutlined />
          </div>
        </Tooltip>
        <Switch role={'switch'} title={this.nls('keepResultsWhenClosed')}
          checked={this.props.config.keepResultsWhenClosed} onChange={this.onKeepResultOptionChange.bind(this)} />
      </SettingRow>
      <SettingRow>
        <Label tabIndex={0} aria-label={this.nls('activateToolOnLoadLabel')} className='w-100 d-flex' >
          <div className='flex-grow-1 text-break'>
            {this.nls('activateToolOnLoadLabel')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('activateToolOnLoadTooltip')}
          title={this.nls('activateToolOnLoadTooltip')} showArrow placement='top'>
          <div className='ml-2 d-inline'>
            <Icon size={14} icon={epConfigIcon.infoIcon} />
          </div>
        </Tooltip>
      </SettingRow>

      <SettingRow>
        <Select aria-label={this.nls('activateToolOnLoadLabel')} className={'selectOption'}
          size={'sm'} name={'activateToolOnLoad'}
          value={activeTool}
          onChange={this.onActiveToolChange}
          >
          {onWidgetLoadOptions.map((option, index) => {
            return <Option role={'option'} aria-label={this.nls(option.name)} key={index} value={option.value}>
              {this.nls(option.name)}</Option>
          })}
        </Select>
      </SettingRow>

      <SettingRow>
        <CollapsablePanel
          label={this.nls('appearanceCollapsible')}
          isOpen={this.state.isAppearanceSettingsOpen}
          onRequestOpen={() => { this.onToggleAppearance() }}
          onRequestClose={() => { this.onToggleAppearance() }}>
          <div style={{ height: '100%', marginTop: 10 }}>

            <SettingRow tag='label' label={this.nls('showChartGridsLabel')}>
              <Switch role={'switch'}
                title={this.nls('showChartGridsLabel')}
                checked={this.props.config.showGridAxis}
                onChange={this.onShowGridChange} />
            </SettingRow>

            <SettingRow tag='label' label={this.nls('showChartAxisTitlesLabel')}>
              <Switch role={'switch'}
                title={this.nls('showChartAxisTitlesLabel')}
                checked={this.props.config.showAxisTitles}
                onChange={this.onShowAxisTitlesChange} />
            </SettingRow>

            <SettingRow tag='label' label={this.nls('showLegend')}>
              <Switch role={'switch'}
                title={this.nls('showLegend')}
                checked={this.props.config.showLegend}
                onChange={this.legendStateChange} />
            </SettingRow>
          </div>
        </CollapsablePanel>
      </SettingRow>
    </div>
  }
}
