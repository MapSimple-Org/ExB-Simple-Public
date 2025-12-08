import { React, classNames, type ImmutableObject, hooks, defaultMessages as coreMessages } from 'jimu-core'
import { Select, defaultMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { DateTimeFormatOptions } from 'jimu-ui/advanced/chart'
import { styled } from 'jimu-theme'

export interface DateFormatSettingProps {
  className?: string
  value: ImmutableObject<DateTimeFormatOptions>
  onChange: (value: ImmutableObject<DateTimeFormatOptions>) => void
}

const Root = styled.div`
  width: 100%;
  .jimu-widget-setting--row-label {
    color: var(--ref-palette-neutral-900);
  }
`

// More info about intl option: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
export const DateFormatSetting = (props: DateFormatSettingProps): React.ReactElement => {
  const { className, value, onChange } = props

  const translate = hooks.useTranslation(defaultMessages, coreMessages)
  const intlOptions = (value as DateTimeFormatOptions)?.intlOptions
  const dateStyle = intlOptions?.dateStyle ?? 'default'
  const timeStyle = intlOptions?.timeStyle ?? 'default'

  const handleDateStyleChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    let dateStyle = evt.currentTarget.value
    dateStyle = dateStyle === 'default' ? undefined : dateStyle
    onChange(value.setIn(['intlOptions', 'dateStyle'], dateStyle))
  }

  const handleTimeStyleChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    let timeStyle = evt.currentTarget.value
    timeStyle = timeStyle === 'default' ? undefined : timeStyle
    onChange(value.setIn(['intlOptions', 'timeStyle'], timeStyle))
  }

  return (
    <Root className={classNames('date-format-setting', className)}>
      <SettingRow label={translate('dateStyle')} flow='no-wrap' className='mt-2' truncateLabel={true}>
        <Select
          size='sm'
          aria-label={translate('dateStyle')}
          value={dateStyle}
          className='w-50'
          onChange={handleDateStyleChange}
        >
          <option value='default'>{translate('default')}</option>
          <option value='short'>{translate('short')}</option>
          <option value='medium'>{translate('medium')}</option>
          <option value='long'>{translate('long')}</option>
        </Select>
      </SettingRow>
      <SettingRow label={translate('timeStyle')} flow='no-wrap' className='mt-2' truncateLabel={true}>
        <Select
          size='sm'
          aria-label={translate('timeStyle')}
          value={timeStyle}
          className='w-50'
          onChange={handleTimeStyleChange}
        >
          <option value='default'>{translate('default')}</option>
          <option value='short'>{translate('short')}</option>
          <option value='medium'>{translate('medium')}</option>
          <option value='long'>{translate('long')}</option>
        </Select>
      </SettingRow>
    </Root>
  )
}
