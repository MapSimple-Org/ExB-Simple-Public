import { React } from 'jimu-core'
import type { WebChartTemporalBinningUnits } from 'jimu-ui/advanced/chart'
import { DateUnitInput, type DateUnitInputValue, UnitSelectorDateWeekUnits, UnitSelectorTimeUnits, type DateTimeUnits } from 'jimu-ui/advanced/style-setting-components'

interface TimeIntervalProps {
  className?: string
  'aria-label'?: string
  size: number
  unit: WebChartTemporalBinningUnits
  onChange: (size: number, unit: WebChartTemporalBinningUnits) => void
}

export const DateTimeUnitsMap = {
  [UnitSelectorDateWeekUnits[0]]: 'years',
  [UnitSelectorDateWeekUnits[1]]: 'months',
  [UnitSelectorDateWeekUnits[2]]: 'weeks',
  [UnitSelectorDateWeekUnits[3]]: 'days',
  [UnitSelectorTimeUnits[0]]: 'hours',
  [UnitSelectorTimeUnits[1]]: 'minutes',
  [UnitSelectorTimeUnits[2]]: 'seconds',
  seconds: UnitSelectorTimeUnits[2],
  minutes: UnitSelectorTimeUnits[1],
  hours: UnitSelectorTimeUnits[0],
  days: UnitSelectorDateWeekUnits[3],
  weeks: UnitSelectorDateWeekUnits[2],
  months: UnitSelectorDateWeekUnits[1],
  years: UnitSelectorDateWeekUnits[0]
}

const Units = [...UnitSelectorDateWeekUnits, ...UnitSelectorTimeUnits]

export const TimeInterval = (props: TimeIntervalProps): React.ReactElement => {
  const { className, 'aria-label': ariaLabel, size, unit, onChange } = props

  const value: DateUnitInputValue = React.useMemo(() => {
    return {
      val: size,
      unit: DateTimeUnitsMap[unit] as DateTimeUnits
    }
  }, [size, unit])

  const handleChange = (value: DateUnitInputValue) => {
    const size = value.val
    const unit = DateTimeUnitsMap[value.unit] as WebChartTemporalBinningUnits
    onChange(size, unit)
  }

  return (
    <DateUnitInput aria-label={ariaLabel} min={1} max={1000} className={className} units={Units} value={value} onChange={handleChange} />
  )
}
