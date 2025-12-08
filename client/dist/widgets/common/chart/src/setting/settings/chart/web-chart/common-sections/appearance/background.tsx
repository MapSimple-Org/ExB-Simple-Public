import { React, hooks } from 'jimu-core'
import { getTheme2 } from 'jimu-theme'
import { defaultMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'

interface BackgroundProps {
  value: string
  onChange?: (value: string) => void
}

export const Background = (props: BackgroundProps) => {
  const { value, onChange } = props

  const translate = hooks.useTranslation(defaultMessages)

  const appTheme = getTheme2()

  return (
    <SettingRow label={translate('background')} flow='no-wrap' className='mt-2'>
      <ThemeColorPicker
        aria-label={translate('background')}
        specificTheme={appTheme}
        value={value}
        onChange={onChange}
      />
    </SettingRow>
  )
}
