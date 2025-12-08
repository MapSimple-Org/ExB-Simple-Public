import { React, type ImmutableObject, classNames, type ImmutableArray, hooks } from 'jimu-core'
import {
  Label,
  Switch,
  Checkbox,
  TextInput,
  NumericInput,
  CollapsableToggle,
  defaultMessages as jimuUiDefaultMessage,
  type LinearUnit
} from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { CategoryFormatOptions, NumberFormatOptions, WebChartAxis, WebChartGuide, WebChartLabelBehavior } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../../translations/default'
import { NumericFormatSetting, SimpleNumericFormatSetting } from '../../components'
import Guides from './guide'
import { parseNumber } from './guide/utils'
import { LabelBehavior } from './components'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'

export interface NumericAxisProps {
  className?: string
  isHorizontal: boolean
  showLogarithmicScale?: boolean
  showTickSpacing?: boolean
  showValueRange?: boolean
  showIntegerOnly?: boolean
  showGuide?: boolean
  singleNumericFormatSetting?: boolean
  labelBehavior: WebChartLabelBehavior
  axis: ImmutableObject<WebChartAxis>
  onChange?: (axis: ImmutableObject<WebChartAxis>) => void
  onLabelBehaviorChange?: (value: WebChartLabelBehavior, isHorizontal: boolean) => void
}

const ShowLabelBehavior = false

export const NumericAxis = (props: NumericAxisProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)
  const {
    className,
    axis: propAxis,
    isHorizontal,
    showLogarithmicScale,
    showValueRange = true,
    showTickSpacing = true,
    showIntegerOnly = true,
    showGuide = true,
    labelBehavior: propLabelBehavior,
    singleNumericFormatSetting = false,
    onChange,
    onLabelBehaviorChange
  } = props
  const visible = propAxis.visible ?? true
  const titleText = propAxis.title.content?.text ?? ''
  const valueFormat = propAxis.valueFormat
  const showGrid = propAxis.grid?.width > 0
  const minimum = propAxis.minimum ?? ''
  const maximum = propAxis.maximum ?? ''
  const isLogarithmic = propAxis.isLogarithmic ?? false
  const integerOnlyValues = propAxis.integerOnlyValues ?? false
  const tickSpacing = propAxis.tickSpacing ? `${ propAxis.tickSpacing}px` : ''
  const guides = propAxis?.guides
  const labelBehavior = propLabelBehavior || (isHorizontal ? 'rotate' : 'wrap')

  const handleVisibleChange = (visible: boolean): void => {
    let axis = propAxis.set('visible', visible).setIn(['labels', 'visible'], visible)
    if (!visible) {
      axis = axis.setIn(['grid', 'width'], 0)
    }
    onChange?.(axis)
  }

  const handleTitleTextChange = (value: string): void => {
    onChange?.(
      propAxis.set(
        'title',
        propAxis.title.set('visible', value !== '').setIn(['content', 'text'], value)
      )
    )
  }

  const handleValueFormatChange = (value: ImmutableObject<CategoryFormatOptions> | ImmutableObject<NumberFormatOptions>): void => {
    onChange?.(propAxis.set('valueFormat', value))
  }

  const handleShowGridChange = (): void => {
    onChange?.(propAxis.setIn(['grid', 'width'], showGrid ? 0 : 1))
  }

  const handleMinimumChange = (value: string): void => {
    const minimum = parseNumber(value)
    onChange?.(propAxis.set('minimum', minimum))
  }

  const handleMaximumChange = (value: string): void => {
    const maximum = parseNumber(value)
    onChange?.(propAxis.set('maximum', maximum))
  }

  const handleLogarithmicChange = (): void => {
    onChange?.(propAxis.set('isLogarithmic', !isLogarithmic))
  }

  const handleIntegerOnlyValuesChange = (_, checked: boolean): void => {
    onChange?.(propAxis.set('integerOnlyValues', checked))
  }

  const handleGuidesChange = (value: ImmutableArray<WebChartGuide>) => {
    onChange?.(propAxis.set('guides', value))
  }

  const handleTickSpacingChange = (value: LinearUnit) => {
    let axis = propAxis
    if(!value?.distance) {
      axis = propAxis.without('tickSpacing')
    } else {
      const spacing = value.distance
      axis = propAxis.set('tickSpacing', spacing)
    }
    onChange?.(axis)
  }

  return (
    <div className={classNames('numeric-axis w-100', className)}>
      {showValueRange && <SettingRow label={translate('valueRange')} flow='wrap' level={2}>
        <div className='d-flex align-items-center justify-content-between' aria-label={translate('valueRange')} role='group'>
          <NumericInput
            placeholder={translate('min')}
            size='sm'
            aria-label={translate('min')}
            showHandlers={false}
            value={minimum}
            style={{ width: '40%' }}
            onAcceptValue={handleMinimumChange}
          />
          <span className='text-truncate'>{translate('to')}</span>
          <NumericInput
            size='sm'
            showHandlers={false}
            placeholder={translate('max')}
            aria-label={translate('max')}
            value={maximum}
            style={{ width: '40%' }}
            onAcceptValue={handleMaximumChange}
          />
        </div>
      </SettingRow>}
      {
        showLogarithmicScale && (
          <SettingRow tag='label' label={translate('logarithmicScale')} level={2}>
            <Switch checked={isLogarithmic} onChange={handleLogarithmicChange} />
          </SettingRow>
        )
      }
      <SettingRow label={translate('axisTitle')} flow='wrap' level={2}>
        <TextInput
          size='sm'
          aria-label={translate('axisTitle')}
          defaultValue={titleText}
          className='w-100'
          onAcceptValue={handleTitleTextChange}
        />
      </SettingRow>
      <CollapsableToggle
        role='group'
        level={2}
        className='mt-4'
        isOpen={visible}
        label={translate('axisLabel')}
        aria-label={translate('axisLabel')}
        onRequestOpen={() => { handleVisibleChange(true) }}
        onRequestClose={() => { handleVisibleChange(false) }}>
        {!singleNumericFormatSetting && <>
          <NumericFormatSetting
            className='mt-2'
            value={valueFormat as ImmutableObject<NumberFormatOptions>}
            onChange={handleValueFormatChange}
          />
          {showIntegerOnly && <Label check centric className='justify-content-start align-items-start mt-2 title3 hint-default'>
            <Checkbox
              aria-label={translate('displayIntegersOnly')}
              checked={integerOnlyValues}
              onChange={handleIntegerOnlyValuesChange}
            />
            <span className='ml-2'>{translate('displayIntegersOnly')}</span>
          </Label>}
        </>}
        {
          singleNumericFormatSetting && <SimpleNumericFormatSetting
            className='mt-2'
            isUnifiedFractionDigits={true}
            showNotation={true}
            value={valueFormat as ImmutableObject<NumberFormatOptions>}
            onChange={handleValueFormatChange} />
        }
        {ShowLabelBehavior && <SettingRow label={translate('behavior')} className='mt-2'>
          <LabelBehavior className='w-50' horizontal={isHorizontal} value={labelBehavior} onChange={onLabelBehaviorChange} />
        </SettingRow>}
      </CollapsableToggle>
      {showTickSpacing && <SettingRow label={translate('tickSpacing')} level={2} className='mt-4'>
        <InputUnit className='w-50' min={0} precision={0} step={1} applyDefaultValue={false} value={tickSpacing} onChange={handleTickSpacingChange} />
      </SettingRow>}
      <SettingRow tag='label' label={translate('axisGrid')} level={2} className='mt-3'>
        <Switch checked={showGrid} onChange={handleShowGridChange} />
      </SettingRow>
      {showGuide && <Guides isHorizontal={!isHorizontal} value={guides} onChange={handleGuidesChange} />}
    </div>
  )
}
