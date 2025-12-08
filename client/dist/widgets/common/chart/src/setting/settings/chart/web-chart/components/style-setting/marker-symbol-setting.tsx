/** @jsx jsx */
import {
  type ImmutableObject,
  Immutable,
  classNames,
  React,
  css,
  jsx,
  hooks
} from 'jimu-core'
import { type ColorItem, ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { getCircleMarkerSymbol } from '../../../../../../utils/default'
import { LineSymbolSetting } from './line-symbol-setting'
import { Slider, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { useTheme2 } from 'jimu-theme'
import defaultMessages from '../../../../../translations/default'
import type { ISimpleMarkerSymbol } from 'jimu-ui/advanced/chart'

export interface MarkSymbolSettingProps {
  'aria-label'?: string
  className?: string
  markSizeVisible?: boolean
  presetFillColors?: ColorItem[]
  presetLineColors?: ColorItem[]
  value: ImmutableObject<ISimpleMarkerSymbol>
  defaultFillColor: string
  defaultLineColor: string
  onChange: (value: ImmutableObject<ISimpleMarkerSymbol>) => void
}

const cssStyle = css`
  .divide-line {
    height: 25px;
    width: 2px;
  }
  .jimu-slider {
    flex-shrink: 1;
  }
`

export const MarkSymbolSetting = (props: MarkSymbolSettingProps): React.ReactElement => {
  const {
    className,
    'aria-label': propAriaLabel,
    presetFillColors,
    presetLineColors,
    value: propValue = Immutable(getCircleMarkerSymbol()),
    defaultFillColor,
    defaultLineColor,
    markSizeVisible = true,
    onChange
  } = props
  const appTheme = useTheme2()
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)
  const ariaLabel = propAriaLabel || translate('marker')
  const color = (propValue?.color as unknown) as string
  const size = propValue.size ?? 0
  const outline = propValue?.outline

  const handleChange = (key: string, value: any): void => {
    onChange?.(propValue.set(key, value))
  }

  const handleFillColorChange = (value: string): void => {
    value = value || defaultFillColor
    handleChange('color', value)
  }

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value) || 0
    handleChange('size', value)
  }

  return (
    <div className={classNames('marker-symbol-setting', className)} css={cssStyle} role='group' aria-label={ariaLabel}>
      {markSizeVisible && <div className='d-flex justify-content-between align-items-center'>
        <ThemeColorPicker
          aria-label={translate('fillColor')}
          presetColors={presetFillColors}
          specificTheme={appTheme}
          className='item flex-shrink-0'
          onChange={handleFillColorChange}
          value={color}
        />
        <div className='divide-line ml-2 mr-2' style={{ backgroundColor: 'var(--sys-color-secondary)' }} />
        <Slider
          aria-label={translate('size')}
          min={0}
          step={1}
          max={25}
          style={{ width: '80%' }}
          value={size}
          onChange={handleSizeChange}
        />
      </div>}
      {!markSizeVisible && <div className='d-flex justify-content-between align-items-center'>
        <ThemeColorPicker
          aria-label={translate('fillColor')}
          presetColors={presetFillColors}
          specificTheme={appTheme}
          className='item flex-shrink-0'
          onChange={handleFillColorChange}
          value={color}
        />
        <div className='divide-line ml-2 mr-2' style={{ backgroundColor: 'var(--sys-color-secondary)' }} />
        <LineSymbolSetting
          type='border'
          presetColors={presetLineColors}
          outlineColorPicker={true}
          defaultColor={defaultLineColor}
          value={outline}
          onChange={value => { handleChange('outline', value) }}
        />
      </div>}
      {markSizeVisible && <LineSymbolSetting
        className='mt-2'
        type='border'
        presetColors={presetLineColors}
        outlineColorPicker={true}
        defaultColor={defaultLineColor}
        value={outline}
        onChange={value => { handleChange('outline', value) }}
      />}
    </div>
  )
}
