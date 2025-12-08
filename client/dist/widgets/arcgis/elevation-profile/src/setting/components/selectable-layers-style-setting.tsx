/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Checkbox, Icon, defaultMessages as jimuUIDefaultMessages, Label, Select, Tooltip, Option } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import type { ProfileStyle, ProfileSettings } from '../../config'
import { getSelectableLayersSettingsStyle } from '../lib/style'
import { getConfigIcon, SelectionMode, selectionModeOptions } from '../constants'
import LineStylePicker from './line-style-picker'

const { epConfigIcon } = getConfigIcon()

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  currentDs: string
  config: ProfileSettings
  onSelectableLayersStyleUpdated: (prop: string, value: string | boolean | ProfileStyle, isNextSelectable: boolean) => void
}

interface IState {
  color: string
}

export default class SelectableLayersStyleSetting extends React.PureComponent<Props, IState> {
  constructor (props) {
    super(props)

    this.state = {
      color: ''
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

  updateNextSelectableLineStyle = (object: string, property: string, value: any) => {
    const style: ProfileStyle = {
      lineType: property === 'lineType' ? value : this.props.config.selectionModeOptions?.style?.lineType,
      lineColor: property === 'lineColor' ? value : this.props.config.selectionModeOptions?.style?.lineColor,
      lineThickness: property === 'lineThickness' ? value : this.props.config.selectionModeOptions?.style?.lineThickness
    }
    this.props.onSelectableLayersStyleUpdated('style', style, true)
  }

  onAddedLayersOptionChange = (evt: React.FormEvent<HTMLInputElement>) => {
    this.props.onSelectableLayersStyleUpdated('supportAddedLayers', evt.currentTarget.checked, false)
  }

  onActiveToolChange = (evt) => {
    this.props.onSelectableLayersStyleUpdated('selectionMode', evt.target.value, true)
  }

  render () {
    const selectionMode = this.props.config.selectionModeOptions.selectionMode
    return <div style={{ height: '100%', width: '100%', marginTop: 5 }} css={getSelectableLayersSettingsStyle(this.props.theme)}>
      <div>
        <SettingRow className='pt-4 ep-divider-top' label={this.nls('selectionModeLabel')}>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('nextSelectableTooltip')}
            title={this.nls('nextSelectableTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline color-label'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>

        <SettingRow>
          <Select aria-label={this.nls('selectionModeLabel')} className={'selectOption'}
            size={'sm'} name={'selectionMode'}
            value={selectionMode}
            onChange={this.onActiveToolChange}>
            {selectionModeOptions.map((option, index) => {
              return <Option role={'option'} aria-label={this.nls(option.name)} key={index} value={option.value}>
                {this.nls(option.name)}</Option>
            })}
          </Select>
        </SettingRow>

        {this.props.config.selectionModeOptions?.selectionMode === SelectionMode.Multiple &&
          <SettingRow flow='wrap'>
            <Label tabIndex={0} aria-label={this.nls('nextSelectableOptionLabel')} className='w-100 d-flex' >
              <div className='flex-grow-1 text-break'>
                {this.nls('nextSelectableOptionLabel')}
              </div>
            </Label>
            <LineStylePicker
              intl={this.props.intl}
              lineItem={'style'}
              isNextSelectable={true}
              onLineStyleChange={this.updateNextSelectableLineStyle}
              config={this.props.config.selectionModeOptions?.style}
            />
          </SettingRow>
        }

        <SettingRow>
          <Label className='w-100 d-flex cursor-pointer'>
            <Checkbox className={'mr-2 font-13'} checked={this.props.config.supportAddedLayers}
              onChange={this.onAddedLayersOptionChange} role={'checkbox'} aria-label={this.nls('supportAddedLayers')} data-testid='supportAddedLayersOption'/>
            <div className='flex-grow-1 text-break'>
              {this.nls('supportAddedLayers')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('supportAddedLayersTooltip')}
            title={this.nls('supportAddedLayersTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>
      </div>
    </div>
  }
}
