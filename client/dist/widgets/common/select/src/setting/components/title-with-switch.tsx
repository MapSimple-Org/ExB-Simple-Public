/** @jsx jsx */
import { React, jsx, hooks, classNames } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Switch } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'

interface Props {
  disabled?: boolean
  checked: boolean // switch on or switch off
  titleKey: string
  className?: string
  onSwitchChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

export default function TitleWithSwitch (props: Props) {
  const { checked, titleKey, onSwitchChange } = props
  const disabled = !!props.disabled
  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  return (
    <SettingRow
      className={classNames('w-100', props.className)}
      tag='label'
      label={translate(titleKey)}
    >
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={onSwitchChange}
      />
    </SettingRow>
  )
}
