import { React, classNames, type ImmutableObject, hooks } from 'jimu-core'
import {
  NumericInput,
  Checkbox,
  defaultMessages as jimuUiDefaultMessage,
  Label,
  Select,
  Radio
} from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../translations/default'
import type { NumberFormatOptions } from 'jimu-ui/advanced/chart'
import { styled } from 'jimu-theme'

export interface NumericFormatSettingProps {
  className?: string
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

// More info about intl option: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export const NumericFormatSetting = (props: NumericFormatSettingProps): React.ReactElement => {
  const { className, value, onChange } = props

  const intlOptions = (value as NumberFormatOptions)?.intlOptions
  const minimumFractionDigits = intlOptions?.minimumFractionDigits ?? 0
  const maximumFractionDigits = intlOptions?.maximumFractionDigits ?? 0
  const unifiedFractionDigits = minimumFractionDigits

  const [isUnifiedFractionDigits, setIsUnifiedFractionDigits] = React.useState<boolean>(minimumFractionDigits === maximumFractionDigits)

  const notation = (intlOptions as any)?.notation ?? 'standard'
  const useGrouping = intlOptions?.useGrouping ?? true
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const handleUnifiedChange = (unified: boolean) => {
    setIsUnifiedFractionDigits(unified)
    if (unified) {
      onChange(value.setIn(['intlOptions', 'minimumFractionDigits'], unifiedFractionDigits)
        .setIn(['intlOptions', 'maximumFractionDigits'], unifiedFractionDigits)
      )
    }
  }

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
      <SettingRow label={translate('decimal')} flow='wrap'>
        <div role='radiogroup' className='w-100' aria-label={translate('decimal')}>
          <div role='group' aria-label={translate('uniform')}>
            <Label
              title={translate('uniform')}
              className='title3 hint-default d-flex align-items-center text-truncate'
              style={{ width: '60%' }}
            >
              <Radio
                name='decimal'
                className='mr-2'
                checked={isUnifiedFractionDigits}
                onChange={() => { handleUnifiedChange(true) }}
              />
              {translate('uniform')}
            </Label>
            {isUnifiedFractionDigits && (
              <NumericInput
                size='sm'
                className='mb-2'
                aria-label={translate('uniform')}
                min={0}
                step={1}
                max={15}
                showHandlers={false}
                value={unifiedFractionDigits}
                onAcceptValue={handleUnifiedDecimalChange} />
            )}
          </div>
          <div role='group' aria-label={translate('mixed')}>
            <Label
              title={translate('mixed')}
              className='title3 hint-default d-flex align-items-center text-truncate'
              style={{ width: '60%' }}
            >
              <Radio
                name='decimal'
                className='mr-2'
                checked={!isUnifiedFractionDigits}
                onChange={() => { handleUnifiedChange(false) }}
              />
              {translate('mixed')}
            </Label>
            {!isUnifiedFractionDigits && <div className='pl-1 mb-1 d-flex align-items-center justify-content-between'>
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
          </div>
        </div>
      </SettingRow>
      <div role='group' aria-label={translate('notation')}>
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
        {notation === 'standard' && <Label check centric className='justify-content-start align-items-start mt-2 title3 hint-default'>
          <Checkbox
            aria-label={translate('show1000Separator')}
            checked={useGrouping}
            onChange={handleShow1000SeparatorChange}
          />
          <span className='ml-2'>{translate('show1000Separator')}</span>
        </Label>}
      </div>
    </Root>
  )
}
