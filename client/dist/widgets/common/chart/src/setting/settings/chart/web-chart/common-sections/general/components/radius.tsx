import { React, hooks } from 'jimu-core'
import { NumericInput } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../../translations/default'

interface InnerRadiusProps {
  value: number
  onChange?: (value: number) => void
}

export const InnerRadius = (props: InnerRadiusProps): React.ReactElement => {
  const { value: propValue = 0, onChange } = props

  const [value, setValue] = React.useState(propValue)
  const translate = hooks.useTranslation(defaultMessages)

  const handleAccept = (val: number, evt?: React.KeyboardEvent<HTMLInputElement>): void => {
    if (val == null && evt.currentTarget.value) return
    const radius = Math.floor(+val)
    setValue(radius)
    onChange?.(radius)
  }

  return (
    <SettingRow level={2} label={translate('innerRadius')} flow='no-wrap'>
      <NumericInput
        className='w-50'
        aria-label={translate('innerRadius')}
        size='sm'
        min={0}
        step={1}
        max={100}
        value={value}
        onChange={setValue}
        onAcceptValue={handleAccept}
      />
    </SettingRow>
  )
}
