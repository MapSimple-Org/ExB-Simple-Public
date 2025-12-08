/** @jsx jsx */
import { React, jsx, hooks, type Immutable } from 'jimu-core'
import { Link, Option, Select, Switch, TextInput, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { MessageLevel, type CustomToolOption } from '../../config'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { useWidgetHelpLink } from '../utils'

interface Props {
  option: Immutable.ImmutableObject<CustomToolOption>
  onChange: (option: Immutable.ImmutableObject<CustomToolOption>) => void
}

const CustomToolOptionConfig = (props: Props) => {
  const { option, onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)

  const messageLevelOptions = [
    { level: MessageLevel.None, label: translate('none'), definition: translate('noneMessageDefinition') },
    { level: MessageLevel.Error, label: translate('variableColorError'), definition: translate('errorMessageDefinition') },
    { level: MessageLevel.Warning, label: translate('variableColorWarning'), definition: translate('warningMessageDefinition') },
    { level: MessageLevel.Info, label: translate('variableColorInfo'), definition: translate('infoMessageDefinition') }
  ]

  const handleMessageLevelChange = (e) => {
    const value = e?.target?.value as MessageLevel
    onChange(value === MessageLevel.Warning ? option.without('messageLevel') : option.set('messageLevel', value))
  }

  const helpLink = useWidgetHelpLink()

  return (
    <React.Fragment>
      <SettingRow className='label-dark-800 first-option' tag='label' label={translate('showToolHelpLink')}>
        <Switch checked={option.showHelpLink} onChange={(e, checked) => { onChange(option.set('showHelpLink', checked)) }} />
      </SettingRow>
      {option.showHelpLink && <TextInput size='sm' className='w-100 mt-2' value={option.link} onChange={(e) => { onChange(option.set('link', e.target.value)) }} />}
      <SettingRow className='label-dark-800 mt-3' label={
        <React.Fragment>
          {translate('messageLevel')}
          <Link type='link' className='border-0' style={{ background: 'none' }} to={helpLink} target='_blank' aria-label={translate('help')}><InfoOutlined className='m-0' /></Link>
        </React.Fragment>}
        aria-label={translate('messageLevel')} flow='no-wrap'>
        <Select className='w-auto' value={option.messageLevel || MessageLevel.Warning} defaultValue={MessageLevel.Warning} onChange={handleMessageLevelChange}>
          {messageLevelOptions.map((item) => {
            return <Option key={item.level} value={item.level}>{item.label}</Option>
          })}
        </Select>
      </SettingRow>
    </React.Fragment>
  )
}

export default CustomToolOptionConfig
