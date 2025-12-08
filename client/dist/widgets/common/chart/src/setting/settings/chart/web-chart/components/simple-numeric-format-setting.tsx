import { React, type ImmutableObject, hooks, classNames } from 'jimu-core'
import { NumericInput, Checkbox, defaultMessages as jimuUiDefaultMessage, Label, Select } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../translations/default'
import type { NumberFormatOptions } from 'jimu-ui/advanced/chart'
import { styled } from 'jimu-theme'

export interface SimpleNumericFormatSettingProps {
  className?: string
  showNotation?: boolean
  isUnifiedFractionDigits?: boolean
  value: ImmutableObject<NumberFormatOptions>
  onChange: (value: ImmutableObject<NumberFormatOptions>) => void
}

const Root = styled.div`
  width: 100%;
  .jimu-widget-setting--row-label {
    color: var(--ref-palette-neutral-900);
  }
`

const InlineSettingRow = styled(SettingRow)`
  width: 47%;
  margin-top: 0 !important;
`

export const SimpleNumericFormatSetting = (props: SimpleNumericFormatSettingProps): React.ReactElement => {
  const { className, showNotation = false, isUnifiedFractionDigits = false, value, onChange } = props

  const intlOptions = (value as NumberFormatOptions)?.intlOptions
  const style = intlOptions?.style
  const minimumFractionDigits = intlOptions?.minimumFractionDigits ?? 0
  const maximumFractionDigits = intlOptions?.maximumFractionDigits ?? 0
  const unifiedFractionDigits = minimumFractionDigits

  const notation = (intlOptions as any)?.notation ?? 'standard'
  const useGrouping = intlOptions?.useGrouping ?? true
  const showThousandsSeparator = notation === 'standard' && style === 'decimal'
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const handleUnifiedDecimalChange = (number: number): void => {
    const decimal = Math.floor(+number)
    onChange(value.setIn(['intlOptions', 'minimumFractionDigits'], decimal)
      .setIn(['intlOptions', 'maximumFractionDigits'], decimal)
    )
  }

  const handleMinDecimalChange = (number: number): void => {
    const decimal = Math.floor(+number)
    let option = value.setIn(['intlOptions', 'minimumFractionDigits'], decimal)
    if (decimal > maximumFractionDigits) {
      option = option.setIn(['intlOptions', 'maximumFractionDigits'], decimal)
    }
    onChange(option)
  }

  const handleMaxDecimalChange = (number: number): void => {
    const decimal = Math.floor(+number)
    let option = value.setIn(['intlOptions', 'maximumFractionDigits'], decimal)
    if (decimal < minimumFractionDigits) {
      option = option.setIn(['intlOptions', 'minimumFractionDigits'], decimal)
    }
    onChange(option)
  }

  const handleShow1000SeparatorChange = (_, checked: boolean): void => {
    onChange(value.setIn(['intlOptions', 'useGrouping'], checked))
  }

  const handleNotationChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const notation = evt.currentTarget.value

    let option = value.setIn(['intlOptions', 'notation'], notation)
    if (notation !== 'standard') {
      option = option.set(
        'intlOptions',
        option.intlOptions.without('useGrouping')
      )
    }
    onChange(option)
  }

  return (
    <Root className={classNames('numeric-format-setting', className)}>
      {!isUnifiedFractionDigits && <div className={classNames('pl-1 d-flex align-items-center justify-content-between', { 'mb-1': showThousandsSeparator })}>
        <InlineSettingRow label={translate('min')} flow='no-wrap' truncateLabel={true}>
          <NumericInput
            size='sm'
            aria-label={translate('min')}
            min={0}
            step={1}
            max={15}
            showHandlers={false}
            value={minimumFractionDigits}
            className='w-50'
            onAcceptValue={handleMinDecimalChange}
          />
        </InlineSettingRow>
        <InlineSettingRow label={translate('max')} flow='no-wrap' truncateLabel={true}>
          <NumericInput
            size='sm'
            aria-label={translate('max')}
            min={0}
            step={1}
            max={15}
            showHandlers={false}
            value={maximumFractionDigits}
            className='w-50'
            onAcceptValue={handleMaxDecimalChange}
          />
        </InlineSettingRow>
      </div>}
      {isUnifiedFractionDigits && <SettingRow label={translate('decimal')} flow='no-wrap' className={classNames('pl-1 mt-2', { 'mb-1': showThousandsSeparator })} truncateLabel={true}>
        <NumericInput
          size='sm'
          className='w-input-sm'
          aria-label={translate('decimal')}
          min={0}
          step={1}
          max={15}
          showHandlers={false}
          value={unifiedFractionDigits}
          onAcceptValue={handleUnifiedDecimalChange} />
      </SettingRow>}
      {showNotation && <div role='group' aria-label={translate('notation')} className='pl-1'>
        <SettingRow label={translate('notation')} flow='no-wrap' className='mt-2' truncateLabel={true}>
          <Select
            size='sm'
            aria-label={translate('notation')}
            value={notation}
            className='w-50'
            onChange={handleNotationChange}
          >
            <option value='standard'>
              {translate('standard')}
            </option>
            <option value='compact'>
              {translate('compact')}
            </option>
            <option value='scientific'>
              {translate('scientific')}
            </option>
            <option value='engineering'>
              {translate('engineering')}
            </option>
          </Select>
        </SettingRow>
        {showThousandsSeparator && <Label check centric className='justify-content-start align-items-start mt-2 title3 hint-default pl-1'>
          <Checkbox
            aria-label={translate('show1000Separator')}
            checked={useGrouping}
            onChange={handleShow1000SeparatorChange}
          />
          <span className='ml-2'>{translate('show1000Separator')}</span>
        </Label>}
      </div>}
      {(!showNotation && showThousandsSeparator) && <Label check centric className='justify-content-start align-items-start mt-2 title3 hint-default pl-1'>
        <Checkbox
          aria-label={translate('show1000Separator')}
          checked={useGrouping}
          onChange={handleShow1000SeparatorChange}
        />
        <span className='ml-2'>{translate('show1000Separator')}</span>
      </Label>}
    </Root>
  )
}
