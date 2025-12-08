import { React, classNames, hooks } from 'jimu-core'
import { Select, Switch, defaultMessages as jimuMessages } from 'jimu-ui'
import type { ChartTypes, WebChartNullPolicyTypes, WebChartTimeAggregationTypes, WebChartTemporalBinningUnits } from 'jimu-ui/advanced/chart'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { TimeInterval } from '../../../components'
import defaultMessages from '../../../../../../translations/default'

interface Props {
  className?: string
  seriesType?: ChartTypes
  size: number
  unit: WebChartTemporalBinningUnits
  onTimeIntervalChange: (size: number, unit: WebChartTemporalBinningUnits) => void
  nullPolicy: WebChartNullPolicyTypes
  onNullPolicyChange: (nullPolicy: WebChartNullPolicyTypes) => void
  timeAggregationType: WebChartTimeAggregationTypes
  onTimeAggregationTypeChange: (aggregationType: WebChartTimeAggregationTypes) => void
  trimIncompleteTimeInterval: boolean
  onTrimIncompleteTimeIntervalChange: (trimIncompleteTimeInterval: boolean) => void
}

const WebChartTimeAggregations = {
  Start: "equalIntervalsFromStartTime",
  End: "equalIntervalsFromEndTime"
}
const WebChartNullPolicies = {
  Null: "null",
  Zero: "zero",
  Interpolate: "interpolate"
}

const WebChartNullPolicyTypesTranslation = {
  'null': 'breakLine',
  'interpolate': 'connectLine',
  'zero': 'treatAsZero'
}

const WebChartTimeAggregationTypesTranslation = {
  'equalIntervalsFromStartTime': 'snapToTheFirstDataPoint',
  'equalIntervalsFromEndTime': 'snapToTheLastDataPoint'
}

export const TimeBinning = (props: Props): React.ReactElement => {
  const {
    className,
    seriesType = 'lineSeries',
    unit,
    size,
    nullPolicy = 'null',
    timeAggregationType,
    trimIncompleteTimeInterval = true,
    onTimeIntervalChange,
    onNullPolicyChange,
    onTimeAggregationTypeChange,
    onTrimIncompleteTimeIntervalChange
  } = props

  const translate = hooks.useTranslation(defaultMessages, jimuMessages)

  const timeBinningMode = !timeAggregationType ? 'calendarBased' : 'rollingWindow'
  const binningOnCalendarBase = timeBinningMode === 'calendarBased'

  const handleTimeBinningModeChange = (_, timeBinningMode: 'calendarBased' | 'rollingWindow') => {
    const value = timeBinningMode === 'calendarBased' ? undefined : 'equalIntervalsFromStartTime'
    onTimeAggregationTypeChange?.(value)
  }

  const handleNullPolicyChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const value = evt.currentTarget.value as WebChartNullPolicyTypes
    onNullPolicyChange?.(value)
  }

  const handleTimeAggregationTypeChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const value = evt.currentTarget.value as WebChartTimeAggregationTypes
    onTimeAggregationTypeChange?.(value)
  }

  const handleTrimIncompleteTimeIntervalChange = (_, checked: boolean) => {
    onTrimIncompleteTimeIntervalChange?.(checked)
  }

  return (<div className={classNames('time-binning', className)}>
    <SettingRow label={translate('interval')} flow='wrap' className='mt-2'>
      <TimeInterval aria-label={translate('interval')} size={size} unit={unit} onChange={onTimeIntervalChange} />
    </SettingRow>
    <SettingRow label={translate('timeBinningMode')} flow='wrap' className='mt-2'>
      <Select value={timeBinningMode} onChange={handleTimeBinningModeChange}>
        <option value='rollingWindow'>{translate('rollingWindow')}</option>
        <option value='calendarBased'>{translate('calendarBased')}</option>
      </Select>
    </SettingRow>
    {!binningOnCalendarBase && <SettingRow label={translate('intervalAlignment')} flow='wrap' className='mt-2'>
      <Select
        size='sm'
        aria-label={translate('intervalAlignment')}
        value={timeAggregationType ?? 'equalIntervalsFromStartTime'}
        onChange={handleTimeAggregationTypeChange}
      >
        {Object.keys(WebChartTimeAggregations).map((key, i) => (
          <option value={WebChartTimeAggregations[key]} key={i} className='text-truncate'>
            {translate(WebChartTimeAggregationTypesTranslation[WebChartTimeAggregations[key]])}
          </option>
        ))}
      </Select>
    </SettingRow>}
    {seriesType === 'lineSeries' && <SettingRow label={translate('emptyBins')} flow='no-wrap' className='mt-4'>
      <Select
        size='sm'
        aria-label={translate('emptyBins')}
        className='w-50'
        value={nullPolicy}
        onChange={handleNullPolicyChange}
      >
        {Object.keys(WebChartNullPolicies).map((nullPolicy, i) => (
          <option value={WebChartNullPolicies[nullPolicy]} key={i} className='text-truncate'>
            {translate(WebChartNullPolicyTypesTranslation[WebChartNullPolicies[nullPolicy]])}
          </option>
        ))}
      </Select>
    </SettingRow>}
    <SettingRow tag='label' label={translate('trimIncompleteInterval')} flow='no-wrap' className='mt-4'>
      <Switch checked={trimIncompleteTimeInterval} onChange={handleTrimIncompleteTimeIntervalChange} />
    </SettingRow>
  </div>)
}
