import { React, type ImmutableObject, hooks } from 'jimu-core'
import type { ISimpleFillSymbol, ISimpleLineSymbol, WebChartGuide, WebChartTextSymbol } from 'jimu-ui/advanced/chart'
import { defaultMessages as jimuUiDefaultMessage, NumericInput, TextInput, AdvancedButtonGroup, Button } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import GuideCollapse from './collapse'
import { FillSymbolSetting, LineSymbolSetting, TextAlignment, TextAlignments, TextSymbolSetting } from '../../../components'
import defaultMessages from '../../../../../../translations/default'
import { DefaultGuideFillColor, DefaultGuideLineColor, DefaultLineColor, DefaultTextColor, getFillSymbol, getLineSymbol } from '../../../../../../../utils/default'
import { parseNumber } from './utils'
import { ArrowDownOutlined } from 'jimu-icons/outlined/directional/arrow-down'
import { ArrowUpOutlined } from 'jimu-icons/outlined/directional/arrow-up'

interface GuideProps {
  className?: string
  renderVisible?: boolean
  labelVisible?: boolean
  labelAlignmentVisible?: boolean
  value: ImmutableObject<WebChartGuide>
  onChange: (value: ImmutableObject<WebChartGuide>) => void
  onDelete: () => void
  bottomLine?: boolean
  defaultIsOpen?: boolean
  isHorizontal?: boolean
}

const Guide = (props: GuideProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const { className, labelAlignmentVisible = true, renderVisible = true, labelVisible = true, value: propValue, onChange, onDelete, bottomLine, defaultIsOpen, isHorizontal } = props

  const name = propValue.name

  const start = propValue.start as number
  const end = propValue.end as number
  const label = propValue.label
  const labelText = label.text ?? ''
  const horizontalAlignment = label.horizontalAlignment ?? TextAlignments.horizontalAlignment[2] as any
  const verticalAlignment = label.verticalAlignment ?? TextAlignments.verticalAlignment[2] as any
  const valid = start != null
  const isLineType = end == null
  const style = propValue.style
  const above = propValue.above ?? false

  const handleNameChange = (name: string) => {
    const value = propValue.set('name', name)
    onChange(value)
  }

  const handleStartChange = (val: string, evt): void => {
    // means it a invalid value
    if (val === null && evt.target.value !== '') {
      return
    }
    const value = propValue.set('start', parseNumber(val))
    onChange?.(value)
  }

  const handleEndChange = (val: string, evt): void => {
    // means it a invalid value
    if (val === null && evt.target.value !== '') {
      return
    }
    let value = propValue.set('end', parseNumber(val))

    const isFillType = val != null && val !== ''
    const typeChanged = isLineType === isFillType
    if (typeChanged) {
      const color = (style as any)?.color
      if (isFillType) {
        const style = getFillSymbol(color || DefaultGuideFillColor, 0, DefaultLineColor)
        value = value.set('style', style)
        value = value.setIn(['label', 'horizontalAlignment'], 'center')
          .setIn(['label', 'verticalAlignment'], 'middle')
      } else {
        const style = getLineSymbol(1, color || DefaultGuideLineColor)
        value = value.set('style', style)
        const horizontalAlignment = isHorizontal ? 'center' : 'right'
        const verticalAlignment = isHorizontal ? 'top' : 'middle'
        value = value.setIn(['label', 'horizontalAlignment'], horizontalAlignment)
          .setIn(['label', 'verticalAlignment'], verticalAlignment)
      }
    }
    onChange?.(value)
  }

  const handleStyleChange = (style: ImmutableObject<ISimpleLineSymbol> | ImmutableObject<ISimpleFillSymbol>) => {
    onChange?.(propValue.set('style', style))
  }

  const handleLabelChange = (label: ImmutableObject<WebChartTextSymbol>): void => {
    onChange?.(propValue.set('label', label))
  }

  const handleLabelTextChange = (value: string): void => {
    onChange?.(propValue.setIn(['label', 'text'], value))
  }

  const handleLabelHorizontalAlignChange = (value): void => {
    onChange?.(propValue.setIn(['label', 'horizontalAlignment'], value))
  }

  const handleLabelVerticalAlignChange = (value): void => {
    onChange?.(propValue.setIn(['label', 'verticalAlignment'], value))
  }

  const handleAboveChange = (above: boolean): void => {
    onChange?.(propValue.set('above', above))
  }

  return (<GuideCollapse
    className={className}
    name={name}
    onChange={handleNameChange}
    onDelete={onDelete}
    bottomLine={bottomLine}
    role='group'
    aria-label={name}
    defaultIsOpen={defaultIsOpen}>
    <div className='d-flex align-items-center justify-content-between mt-2 px-1' role='group' aria-label={translate('valueRange')}>
      <NumericInput
        size='sm'
        showHandlers={false}
        defaultValue={start}
        required={true}
        style={{ width: '40%' }}
        title={translate('start')}
        placeholder={translate('start')}
        onAcceptValue={handleStartChange}
      />
      <span className='text-truncate'>{translate('to')}</span>
      <NumericInput
        disabled={!valid}
        size='sm'
        showHandlers={false}
        defaultValue={end}
        style={{ width: '40%' }}
        title={translate('end')}
        placeholder={translate('end')}
        onAcceptValue={handleEndChange}
      />
    </div>
    <div className='symbol-setting my-4'>
      {!isLineType && <FillSymbolSetting
        defaultFillColor={DefaultGuideFillColor}
        defaultLineColor={DefaultLineColor}
        value={style as ImmutableObject<ISimpleFillSymbol>}
        onChange={handleStyleChange}
      />
      }
      {
        isLineType && <LineSymbolSetting
          type='line'
          defaultColor={DefaultGuideLineColor}
          value={style as ImmutableObject<ISimpleLineSymbol>}
          onChange={handleStyleChange}
        />
      }
    </div>
    {labelVisible && <SettingRow level={2} label={translate('label')} flow='no-wrap' truncateLabel={true}>
      <TextInput
        size='sm'
        aria-label={translate('label')}
        defaultValue={labelText}
        className='w-50'
        onAcceptValue={handleLabelTextChange}
      />
    </SettingRow>}
    {labelVisible && <SettingRow className='mt-2' level={2} flow='wrap'>
      <TextSymbolSetting defaultColor={DefaultTextColor} value={label} onChange={handleLabelChange} />
    </SettingRow>}
    {labelAlignmentVisible && <SettingRow truncateLabel={true} level={2} label={translate('labelAlign')} aria-label={translate('labelAlign')} role='group' flow='wrap'>
      <SettingRow
        truncateLabel={true}
        level={3}
        className='horizontal-alignment w-100 mt-2'
        label={translate('horizontal')}
        flow='no-wrap'
      >
        <TextAlignment
          vertical={false}
          className='w-50'
          aria-label={translate('horizontal')}
          value={horizontalAlignment}
          onChange={handleLabelHorizontalAlignChange}
        />
      </SettingRow>
      <SettingRow
        truncateLabel={true}
        level={3}
        className='vertical-alignment w-100 mt-2'
        label={translate('vertical')}
        flow='no-wrap'
      >
        <TextAlignment
          vertical={true}
          className='w-50'
          aria-label={translate('vertical')}
          value={verticalAlignment}
          onChange={handleLabelVerticalAlignChange}
        />
      </SettingRow>
    </SettingRow>}
    {renderVisible && <SettingRow level={2} label={translate('render')} flow='no-wrap' truncateLabel={true}>
      <AdvancedButtonGroup size='sm'>
        <Button icon active={!above} aria-label={translate('behindChart')} title={translate('behindChart')} onClick={() => { handleAboveChange(false) }}><ArrowDownOutlined></ArrowDownOutlined></Button>
        <Button icon active={above} aria-label={translate('aboveChart')} title={translate('aboveChart')} onClick={() => { handleAboveChange(true) }}><ArrowUpOutlined></ArrowUpOutlined></Button>
      </AdvancedButtonGroup>
    </SettingRow>}
  </GuideCollapse>)
}

export default Guide
