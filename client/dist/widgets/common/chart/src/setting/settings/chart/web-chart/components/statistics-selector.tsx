import { React, hooks } from 'jimu-core'
import { Select, defaultMessages } from 'jimu-ui'
import type { ChartStatisticType } from '../../../../../config'

interface StatisticsSelectorProps {
  disabled?: boolean
  value: ChartStatisticType
  'aria-label'?: string
  hideCount?: boolean
  hidePercentileCount?: boolean
  hideNoAggregation?: boolean
  onChange: (value: ChartStatisticType) => void
}

const ChartStatistics = {
  count: 'count',
  avg: 'mean',
  sum: 'sum',
  max: 'max',
  min: 'min',
  'percentile-continuous': 'median',
  no_aggregation: 'noAggregation'
}

const StatisticsSelector = (props: StatisticsSelectorProps) => {
  const { disabled = false, hideCount = false, hidePercentileCount = false, hideNoAggregation = false, value, 'aria-label': ariaLabel, onChange } = props

  const translate = hooks.useTranslation(defaultMessages)
  const statistics = React.useMemo(() => {
    return Object.keys(ChartStatistics).filter((statistic) => {
      if (hideCount && statistic === 'count') return false
      if (hidePercentileCount && statistic === 'percentile-continuous') return false
      if (hideNoAggregation && statistic === 'no_aggregation') return false
      return true
    })
  }, [hideCount, hideNoAggregation, hidePercentileCount])

  const handleChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const value = evt?.currentTarget.value as ChartStatisticType
    onChange?.(value)
  }

  return (<Select
    size='sm'
    disabled={disabled}
    value={value as string}
    aria-label={ariaLabel}
    onChange={handleChange}
  >
    {statistics.map((st, i) => (
      <option
        value={st}
        key={i}
        className='text-truncate'
      >
        {translate(ChartStatistics[st])}
      </option>
    ))}
  </Select>)
}

export default StatisticsSelector
