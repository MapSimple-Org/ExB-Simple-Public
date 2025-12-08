import { React, type ImmutableObject, Immutable, hooks } from 'jimu-core'
import type { WebChartLegend, WebChartLegendPositions, WebChartPieChartLegend } from 'jimu-ui/advanced/chart'
import { TextInput, Select, CollapsableToggle, NumericInput } from 'jimu-ui'
import { getDefaultLegend } from '../../../../../../../utils/default'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../../translations/default'
import { LabelDisplaySetting } from '../../../components'

interface LegendProps {
  disabled?: boolean
  value: ImmutableObject<WebChartLegend> | ImmutableObject<WebChartPieChartLegend>
  isPieChart?: boolean
  onChange?: (value: ImmutableObject<WebChartLegend> | ImmutableObject<WebChartPieChartLegend>) => void
}

const defaultValue = Immutable(getDefaultLegend())

export const Legend = (props: LegendProps): React.ReactElement => {
  const { disabled = false, isPieChart = false, value: propValue = defaultValue, onChange } = props

  const displayCategory = (propValue as ImmutableObject<WebChartPieChartLegend>)?.displayCategory ?? true
  const displayNumericValue = (propValue as ImmutableObject<WebChartPieChartLegend>)?.displayNumericValue ?? false
  const displayPercentage = (propValue as ImmutableObject<WebChartPieChartLegend>)?.displayPercentage ?? false

  const translate = hooks.useTranslation(defaultMessages)

  const handleTitleTextChange = (text: string): void => {
    onChange?.(propValue.setIn(['title', 'content', 'text'], text))
  }

  const handleVisibleChange = (visible: boolean): void => {
    let value = propValue.set('visible', visible)
    if (visible && isPieChart) {
      value = (value as ImmutableObject<WebChartPieChartLegend>).set('displayCategory', true)
    }
    onChange?.(value)
  }

  const handlePositionChange = (
    evt: React.MouseEvent<HTMLSelectElement>
  ): void => {
    const position = evt.currentTarget.value as WebChartLegendPositions
    onChange?.(propValue.set('position', position))
  }

  const handleMaxWidthChange = (val: number): void => {
    const maxWidth = Math.floor(+val)
    onChange?.(propValue.set('labelMaxWidth', maxWidth))
  }

  const handleDisplayLabelChange = (name: string, checked: boolean): void => {
    let value = propValue.set(name, checked) as ImmutableObject<WebChartPieChartLegend>
    if ((!value.displayCategory && typeof value.displayCategory !== 'undefined') && !value.displayNumericValue && !value.displayPercentage) {
      value = value.set('visible', false)
    }
    onChange?.(value)
  }

  return (
    <CollapsableToggle
      role='group'
      className='mt-4'
      level={2}
      disabled={disabled}
      label={translate('LegendLabel')}
      aria-label={translate('LegendLabel')}
      isOpen={!disabled && propValue?.visible}
      onRequestOpen={() => { handleVisibleChange(true) }}
      onRequestClose={() => { handleVisibleChange(false) }}
    >
      <div className='mt-2' role='group' aria-label={translate('LegendLabel')}>
        {isPieChart && <LabelDisplaySetting
          className='mt-2'
          displayCategory={displayCategory}
          displayNumericValue={displayNumericValue}
          displayPercentage={displayPercentage}
          onDisplayCategoryChange={(checked: boolean) => { handleDisplayLabelChange('displayCategory', checked) }}
          onDisplayNumericValueChange={(checked: boolean) => { handleDisplayLabelChange('displayNumericValue', checked) }}
          onDisplayPercentageChange={(checked: boolean) => { handleDisplayLabelChange('displayPercentage', checked) }}
        />}
        <SettingRow className='mt-2' label={translate('legendTitle')} flow='wrap'>
          <TextInput
            size='sm'
            className='w-100'
            aria-label={translate('legendTitle')}
            defaultValue={propValue.title?.content.text}
            onAcceptValue={handleTitleTextChange}
          />
        </SettingRow>
        <SettingRow label={translate('legendPosition')} flow='no-wrap'>
          <Select
            size='sm'
            aria-label={translate('legendPosition')}
            value={propValue?.position}
            style={{ width: '88px' }}
            onChange={handlePositionChange}
          >
            <option value='left'>
              {translate('left')}
            </option>
            <option value='right'>
              {translate('right')}
            </option>
            <option value='top'>
              {translate('top')}
            </option>
            <option value='bottom'>
              {translate('bottom')}
            </option>
          </Select>
        </SettingRow>
        {isPieChart && <SettingRow label={translate('maxWidth')} flow='no-wrap'>
          <NumericInput
            aria-label={translate('maxWidth')}
            size='sm'
            min={0}
            step={1}
            max={1000}
            style={{ width: '88px' }}
            defaultValue={(propValue as ImmutableObject<WebChartPieChartLegend>).labelMaxWidth ?? ''}
            onAcceptValue={handleMaxWidthChange}
          />
        </SettingRow>}
      </div>
    </CollapsableToggle>
  )
}
