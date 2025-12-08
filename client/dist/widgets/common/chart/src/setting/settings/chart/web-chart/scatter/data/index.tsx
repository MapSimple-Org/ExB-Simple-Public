import type { ChartDataSource, WebChartSeries } from '../../../../../../config'
import { React, Immutable, type ImmutableArray, type ImmutableObject, type UseDataSource, hooks } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage, Slider, Switch } from 'jimu-ui'
import defaultMessages from '../../../../../translations/default'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { ColorModeSelector, FieldSelector, LineSymbolSetting, MarkSymbolSetting } from '../../components'
import { DefaultScatterPlotTrendLineColor, getDefaultSeriesFillColor, getDefaultSeriesOutlineColor, SeriesColors } from '../../../../../../utils/default'
import type { ISimpleLineSymbol, ISimpleMarkerSymbol, WebChartScatterplotSeries } from 'jimu-ui/advanced/chart'
import { createScatterPlotSeries, createScatterPlotQuery } from '../../../../../../utils/common'

export interface ScatterPlotDataProps {
  colorMatch?: boolean
  colorMatchingApplied?: boolean
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  onColorMatchChange?: (colorMatch) => void
  onChange?: (series: ImmutableArray<WebChartSeries>, chartDataSource: ImmutableObject<ChartDataSource>, trendLineVisible?: boolean) => void
}

const presetColors = SeriesColors.map((color) => ({
  label: color,
  value: color,
  color: color
}))

const defaultFillColor = getDefaultSeriesFillColor()
const defaultLineColor = getDefaultSeriesOutlineColor('scatterSeries')

const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>

export const ScatterPlotData = (props: ScatterPlotDataProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const {
    chartDataSource: propChartDataSource = defaultChartDataSource,
    useDataSources,
    series: propSeries,
    colorMatch = false,
    colorMatchingApplied,
    onColorMatchChange,
    onChange
  } = props

  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const query = propChartDataSource.query
  const pageSize = query?.pageSize

  const xNumericField = query?.outFields?.[0]
  const yNumericField = query?.outFields?.[1]
  const propSerie = propSeries?.[0] as ImmutableObject<WebChartScatterplotSeries>
  const dataTooltipVisible = propSerie?.dataTooltipVisible ?? true
  const showLinearTrend = propSerie.overlays?.trendLine.visible
  const trendLine = propSerie.overlays?.trendLine.symbol
  const markerSize = propSerie?.markerSymbol?.size

  const handleXAxisNumberFieldChange = (numericFields: string[]) => {
    const x = numericFields?.[0]
    const series = createScatterPlotSeries({ x, y: yNumericField, propSeries }, dataSourceId)
    const query = createScatterPlotQuery({ x, y: yNumericField }, pageSize)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), chartDataSource)
  }
  const handleYAxisNumberFieldChange = (numericFields: string[]) => {
    const y = numericFields?.[0]
    const series = createScatterPlotSeries({ x: xNumericField, y, propSeries }, dataSourceId)
    const query = createScatterPlotQuery({ x: xNumericField, y }, pageSize)
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), chartDataSource)
  }

  const handleDataTooltipVisibleChange = (evt): void => {
    const visible = evt.target.checked
    const series = Immutable.setIn(
      propSeries,
      ['0', 'dataTooltipVisible'],
      visible
    )
    onChange?.(series, propChartDataSource)
  }

  const handleShowLinearTrendChange = (_, checked: boolean) => {
    const overlays = propSerie?.overlays.setIn(['trendLine', 'visible'], checked)
    const series = Immutable.setIn(propSeries, ['0', 'overlays'], overlays)
    onChange?.(series, propChartDataSource, checked)
  }

  const handleTrendLineSymbolChange = (value: ImmutableObject<ISimpleLineSymbol>) => {
    const overlays = propSerie?.overlays.setIn(['trendLine', 'symbol'], value)
    const series = Immutable.setIn(propSeries, ['0', 'overlays'], overlays)
    onChange?.(series, propChartDataSource)
  }

  const handleMarkerSymbolChange = (value: ImmutableObject<ISimpleMarkerSymbol>) => {
    const series = Immutable.setIn(propSeries, ['0', 'markerSymbol'], value)
    onChange?.(series, propChartDataSource)
  }

  const handleMarkerSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value) || 0
    const series = Immutable.setIn(propSeries, ['0', 'markerSymbol', 'size'], value)
    onChange?.(series, propChartDataSource)
  }

  return (<>
    <SettingRow level={2} label={translate('variables')} flow='wrap'>
      <SettingRow className='w-100' level={3} label={translate('xAxisNumber')} flow='wrap'>
        <FieldSelector
          className='x-numeric-field-selector'
          type='numeric'
          aria-label={translate('xAxisNumber')}
          useDataSources={useDataSources}
          isMultiple={false}
          fields={xNumericField ? Immutable([xNumericField]) : undefined}
          onChange={handleXAxisNumberFieldChange}
        />
      </SettingRow>
      <SettingRow className='w-100' level={3} label={translate('yAxisNumber')} flow='wrap'>
        <FieldSelector
          className='y-numeric-field-selector'
          type='numeric'
          aria-label={translate('yAxisNumber')}
          useDataSources={useDataSources}
          isMultiple={false}
          fields={yNumericField ? Immutable([yNumericField]) : undefined}
          onChange={handleYAxisNumberFieldChange}
        />
      </SettingRow>
    </SettingRow>
    <SettingRow level={2} label={translate('statistics')} flow='wrap' role='group' aria-label={translate('statistics')}>
      <SettingRow className='w-100' level={3} tag='label' label={translate('showLinearTrend')} flow='no-wrap'>
        <Switch checked={showLinearTrend} onChange={handleShowLinearTrendChange} />
      </SettingRow>
      {showLinearTrend && <SettingRow className='w-100' level={3} flow='no-wrap'>
        <LineSymbolSetting
          type='line'
          aria-label={translate('trendLine')}
          defaultColor={DefaultScatterPlotTrendLineColor}
          presetColors={presetColors}
          value={trendLine}
          onChange={handleTrendLineSymbolChange}
        />
      </SettingRow>
      }
    </SettingRow>
    <SettingRow level={2} tag='label'label={translate('hoverLabel')}>
      <Switch
        checked={dataTooltipVisible}
        onChange={handleDataTooltipVisibleChange}
      />
    </SettingRow>
    <SettingRow level={2} label={translate('symbol')}></SettingRow>
    <SettingRow label={translate('size')} className='mt-2' level={3} flow='no-wrap' >
      <Slider
        aria-label={translate('size')}
        min={0}
        step={1}
        max={25}
        style={{ width: '60%' }}
        value={markerSize}
        onChange={handleMarkerSizeChange}
      />
    </SettingRow>
    <SettingRow label={translate('color')} className='mt-2' level={3} flow='wrap' >
      <ColorModeSelector className='w-100' allowed={colorMatchingApplied} value={colorMatch} onChange={onColorMatchChange} />
      {
        !colorMatch && <MarkSymbolSetting
          markSizeVisible={false}
          className='mt-3'
          aria-label={translate('symbol')}
          value={propSerie?.markerSymbol}
          defaultFillColor={defaultFillColor}
          defaultLineColor={defaultLineColor}
          presetFillColors={presetColors}
          presetLineColors={presetColors}
          onChange={handleMarkerSymbolChange} />
      }
    </SettingRow>
  </>)
}
