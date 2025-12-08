import { type ImmutableObject, React } from 'jimu-core'
import { LineSymbolSetting } from '../../components'
import type { ISimpleLineSymbol, WebChartOverlay } from 'jimu-ui/advanced/chart'

interface HistogramOverlaysSettingProps {
  'aria-label'?: string
  defaultColor: string
  value: ImmutableObject<WebChartOverlay>
  onChange: (value: ImmutableObject<WebChartOverlay>) => void
}

export const HistogramOverlaySetting = (
  props: HistogramOverlaysSettingProps
) => {
  const { defaultColor, value: propValue, onChange, 'aria-label': ariaLabel } = props

  const handleSymbolChange = (symbol: ImmutableObject<ISimpleLineSymbol>) => {
    const value = propValue.set('symbol', symbol)
    onChange(value)
  }

  return (
    <LineSymbolSetting
      value={propValue.symbol}
      aria-label={ariaLabel}
      onChange={handleSymbolChange}
      defaultColor={defaultColor}
    />
  )
}
