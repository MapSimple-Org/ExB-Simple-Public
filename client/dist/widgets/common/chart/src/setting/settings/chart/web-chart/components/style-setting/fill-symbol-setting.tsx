/** @jsx jsx */
import {
  jsx,
  type ImmutableObject,
  Immutable,
  css,
  hooks,
  classNames
} from 'jimu-core'
import { type ColorItem, ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { getFillSymbol } from '../../../../../../utils/default'
import { LineSymbolSetting } from './line-symbol-setting'
import { useTheme2 } from 'jimu-theme'
import { defaultMessages } from 'jimu-ui'
import type { ISimpleFillSymbol } from 'jimu-ui/advanced/chart'

export interface FillSymbolSettingProps {
  className?: string
  'aria-label'?: string
  presetFillColors?: ColorItem[]
  value: ImmutableObject<ISimpleFillSymbol>
  defaultFillColor: string
  defaultLineColor: string
  onChange: (value: ImmutableObject<ISimpleFillSymbol>) => void
}

const cssStyle = css`
  display: flex;
  width: 100%;
  > .divide-line {
    height: 25px;
    width: 2px;
  }
  > .line-symbol-setting {
    width: 80%;
    > .item.style-setting--line-style-selector {
    width: 42%;
    }
    > .item.style-setting--input-unit {
      width: 33%;
    }
  }
`
const defaultFillSymbol = Immutable(getFillSymbol())

export const FillSymbolSetting = (props: FillSymbolSettingProps): React.ReactElement => {
  const {
    className,
    'aria-label': propAriaLabel,
    presetFillColors,
    value: propValue = defaultFillSymbol,
    defaultFillColor,
    defaultLineColor,
    onChange
  } = props
  const appTheme = useTheme2()
  const color = (propValue?.color as unknown) as string
  const outline = propValue?.outline
  const translate = hooks.useTranslation(defaultMessages)
  const ariaLabel = propAriaLabel || translate('fill')

  const handleChange = (key: string, value: any): void => {
    onChange?.(propValue.set(key, value))
  }

  const handleFillColorChange = (value: string): void => {
    value = value || defaultFillColor
    handleChange('color', value)
  }

  return (
    <div className={classNames('fill-symbol-setting', className)} css={cssStyle} role='group' aria-label={ariaLabel}>
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
        outlineColorPicker={true}
        defaultColor={defaultLineColor}
        value={outline}
        onChange={value => { handleChange('outline', value) }}
      />
    </div>
  )
}
