import { React, hooks } from 'jimu-core'
import { DirectionSelector, SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../../translations/default'

interface OrientationProps {
  value: boolean
  onChange?: (value: boolean) => void
}

export const Orientation = (props: OrientationProps): React.ReactElement => {
  const { value = false, onChange } = props

  const translate = hooks.useTranslation(defaultMessages)

  const handleChange = (vertical: boolean): void => {
    onChange?.(!vertical)
  }

  return (
    <SettingRow level={2} label={translate('chartOrientation')} aria-label={translate('chartOrientation')} role='group' flow='no-wrap'>
      <DirectionSelector
        size='sm'
        vertical={!value}
        onChange={handleChange}
      />
    </SettingRow>
  )
}
