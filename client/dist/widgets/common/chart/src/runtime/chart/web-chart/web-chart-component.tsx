import { React, hooks, appActions, getAppStore, dataSourceUtils, type ImmutableObject, type QueriableDataSource, type WidgetInitDragCallback, type FeatureLayerDataSource, type FeatureLayerQueryParams } from 'jimu-core'
import { type HTMLArcgisChartElement, type WebChart, getSeriesType, type WebChartDataFilters, type SupportedLayer, Chart, type ArcgisChartCustomEvent, type DataProcessCompletePayload, type AxesMinMaxChangePayload } from 'jimu-ui/advanced/chart'
import { useSelection, normalizeSeries, getMinSafeValue, getDataItemsWithMixedValue, getDataItemsFromChartPayloadData, createRecordsFromChartData, normalizeAxes, getChartLimits, isSplitByNoAggregationChart } from './utils'
import { ChartLimits, GaugeMaxValueField, GaugeMinValueField, WebChartCurrentVersion } from '../../../constants'
import { useChartRuntimeDispatch, useChartRuntimeState } from '../../state'
import type { ChartComponentOptions, IWebChart } from '../../../config'
interface WebChartComponentProps {
  className?: string
  widgetId: string
  layer: SupportedLayer
  webChart: ImmutableObject<IWebChart>
  options?: ChartComponentOptions
  onInitDragHandler: WidgetInitDragCallback
}

const background = [0, 0, 0, 0] as any

function WebChartComponent(props: WebChartComponentProps): React.ReactElement {
  const {
    className,
    widgetId,
    webChart: propWebChart,
    layer,
    options,
    onInitDragHandler,
  } = props

  const chartRef = React.useRef<HTMLArcgisChartElement>(null)
  const type = getSeriesType(propWebChart?.series as any)
  const isSplitByNoAggregation = isSplitByNoAggregationChart(propWebChart?.dataSource?.query)
  const colorMatchAllowed = propWebChart.colorMatch && (propWebChart?.series?.length === 1 || !!propWebChart?.series?.[0]?.query?.where)

  const id = widgetId + '-' + (propWebChart?.id ?? 'chart')
  const dispatch = useChartRuntimeDispatch()
  const { outputDataSource, dataSource, queryVersion, records } = useChartRuntimeState()
  const recordsRef = hooks.useLatest(records)

  const minimumRef = React.useRef<number>(null)
  const maximumRef = React.useRef<number>(null)

  const queryParams: FeatureLayerQueryParams = React.useMemo(() => {
    const queryParams = (dataSource as QueriableDataSource)?.getCurrentQueryParams() ?? {}
    const pageSize = (dataSource as QueriableDataSource)?.getMaxRecordCount()
    queryParams.pageSize = pageSize
    return queryParams
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, queryVersion])

  const timeZone = React.useMemo(() => {
    let timeZone = (dataSource as FeatureLayerDataSource)?.getTimezone()
    if (timeZone) {
      timeZone = dataSourceUtils.getTimezoneAPIFromRuntime(timeZone)
    }
    return timeZone
  }, [dataSource])

  const { where, geometry, gdbVersion, time, distance, units, pageSize } = queryParams

  const num = getMinSafeValue(pageSize, propWebChart.dataSource?.query?.pageSize)
  const chartLimits = React.useMemo(() => getChartLimits(propWebChart?.series, ChartLimits, num), [num, propWebChart?.series])

  const webMapWebChart = React.useMemo(() => {
    let query = propWebChart.dataSource?.query
    if (query) {
      query = query.set('pageSize', num)
    }
    const series = normalizeSeries(propWebChart.series, query)
    const axes = normalizeAxes(propWebChart.series, propWebChart.axes, query)
    return propWebChart
      .set('version', WebChartCurrentVersion)
      .without('dataSource')
      .set('series', series)
      .set('axes', axes)
      .set('id', id)
      .set('background', background) as unknown as ImmutableObject<WebChart>
  }, [id, propWebChart, num])

  const runtimeDataFilters = React.useMemo(() => {
    const runtimeDataFilters: WebChartDataFilters = {}
    if (where) {
      runtimeDataFilters.where = where
    }
    if (geometry) {
      runtimeDataFilters.geometry = geometry as any
      if (distance && units) {
        runtimeDataFilters.distance = distance
        runtimeDataFilters.units = units as any
      }
    }
    if (time) {
      runtimeDataFilters.timeExtent = time as [number, number]
    }
    if (gdbVersion) {
      runtimeDataFilters.gdbVersion = gdbVersion
    }
    return Object.keys(runtimeDataFilters).length ? runtimeDataFilters : undefined
  }, [where, geometry, distance, units, time, gdbVersion])

  hooks.useEffectOnce(() => {
    onInitDragHandler?.(null, null, () => {
      if (!chartRef.current) return
      chartRef.current.refresh({ updateData: false, resetAxesBounds: false })
    })
  })

  const handleCreated = React.useCallback(
    (chart: HTMLArcgisChartElement) => {
      chartRef.current = chart
      dispatch({ type: 'SET_CHART', value: chart })
    },
    [dispatch]
  )

  const handleDataProcessComplete = hooks.useEventCallback((e: ArcgisChartCustomEvent<DataProcessCompletePayload>) => {
    const dataItems = getDataItemsFromChartPayloadData(type, e.detail.chartData)
    const records = createRecordsFromChartData(dataItems, outputDataSource, isSplitByNoAggregation)
    minimumRef.current = undefined
    maximumRef.current = undefined
    dispatch({ type: 'SET_RECORDS', value: records })
    dispatch({ type: 'SET_RENDER_STATE', value: 'success' })
  })

  const handleAxesMinMaxChange = hooks.useEventCallback((e: ArcgisChartCustomEvent<AxesMinMaxChangePayload>) => {
    if (type !== 'gaugeSeries' || !recordsRef.current || !e.detail.bounds[0]) return

    const { minimum, maximum } = e.detail.bounds[0]
    if (minimum === minimumRef.current && maximum === maximumRef.current) return
    minimumRef.current = minimum
    maximumRef.current = maximum

    const mixedValue = { [GaugeMinValueField]: minimum, [GaugeMaxValueField]: maximum }
    let dataItems = recordsRef.current.map(record => record.getData())
    dataItems = getDataItemsWithMixedValue(dataItems, mixedValue)
    const records = createRecordsFromChartData(dataItems, outputDataSource, false)
    dispatch({ type: 'SET_RECORDS', value: records })
  })

  const handleDataProcessError = hooks.useEventCallback((e) => {
    dispatch({ type: 'SET_RECORDS', value: undefined })
    dispatch({ type: 'SET_RENDER_STATE', value: 'error' })
  })

  hooks.useUpdateEffect(() => {
    if (!chartRef.current || !layer) return
    chartRef.current.refresh({ updateData: true, resetAxesBounds: false })
  }, [layer, gdbVersion])

  const [selectionData, handleSelectionChange] = useSelection(
    widgetId,
    outputDataSource,
    propWebChart.series
  )

  const handleChartsSeriesColorChange = React.useCallback((evt) => {
    // Pass "whether color match is applied" result to the settings page in order to display a warning
    if (window.jimuConfig.isInBuilder) {
      if (colorMatchAllowed) {
        const colorMatchApplied = evt.detail.colorMatchApplied
        getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'colorMatchingApplied', colorMatchApplied))
      } else {
        getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'colorMatchingApplied', undefined))
      }
    }
  }, [widgetId, colorMatchAllowed])

  const handleArcgisBadDataWarningRaise = React.useCallback((evt) => {
    if (evt.detail?.keyword === 'emptyDataSet') {
      dispatch({ type: 'SET_RECORDS', value: undefined })
      dispatch({ type: 'SET_RENDER_STATE', value: 'warning' })
    }
  }, [dispatch])

  return (<Chart
    {...options}
    ref={handleCreated}
    timeZone={timeZone}
    allowUsingObjectIdStat={true}
    className={className}
    config={webMapWebChart}
    runtimeDataFilters={runtimeDataFilters}
    layer={layer}
    chartLimits={chartLimits}
    selectionData={selectionData}
    onarcgisSelectionComplete={handleSelectionChange}
    onarcgisDataProcessComplete={handleDataProcessComplete}
    onarcgisDataProcessError={handleDataProcessError}
    onarcgisAxesMinMaxChange={handleAxesMinMaxChange}
    onarcgisSeriesColorChange={handleChartsSeriesColorChange}
    onarcgisBadDataWarningRaise={handleArcgisBadDataWarningRaise}
  />)
}

export default WebChartComponent
