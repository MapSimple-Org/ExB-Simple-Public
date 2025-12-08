import { React, DataSourceManager, type FeatureLayerDataSource, DataSourceTypes, type SceneLayerDataSource, type DataSource, hooks, lodash } from 'jimu-core'

const isDataSourceSupportPercentileStatistics = (dataSource: DataSource) => {
  if (dataSource.type === DataSourceTypes.SceneLayer) {
    dataSource = (dataSource as unknown as SceneLayerDataSource).getAssociatedDataSource()
  }
  const capabilities = (dataSource as FeatureLayerDataSource)?.getCapabilities?.()?.getQueryCapabilities()
  return (capabilities as any)?.supportsPercentileStatistics ?? false
}

export const useSupportHistogram = (dataSourceId: string) => {
  const supportHistogram = React.useMemo(() => {
    const dataSource = dataSourceId ? DataSourceManager.getInstance().getDataSource(dataSourceId) : null
    if (!dataSource) return false
    return isDataSourceSupportPercentileStatistics(dataSource)
  }, [dataSourceId])
  return supportHistogram
}

/**
 * Check if the data source supports `percentile` statistics.
 * @param dataSourceId
 */
export const usePercentileStatisticsSupport = (dataSourceId: string): boolean => {
  const supportPercentile = React.useMemo(() => {
    const dataSource = dataSourceId ? DataSourceManager.getInstance().getDataSource(dataSourceId) : null
    if (!dataSource) return false
    return isDataSourceSupportPercentileStatistics(dataSource)
  }, [dataSourceId])

  return supportPercentile
}

/**
 * Get the latest value of `defaultValue`.
 * @param defaultValue
 */
export const useLatestDefaultValue = <T>(defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = React.useState<T>(defaultValue)
  const valueRef = hooks.useLatest(value)

  React.useEffect(() => {
    if (defaultValue !== valueRef.current) {
      setValue(defaultValue)
    }
  }, [defaultValue, valueRef])

  return [value, setValue]
}

export const useDebouncedEvent = (fn, duration = 500) => {
  const fnRef = hooks.useLatest(fn)
  const durationRef = hooks.useLatest(duration)

  const debouncedFn = React.useMemo(() =>
    lodash.debounce((...args) => {
      fnRef.current(...args)
    }, durationRef.current), [durationRef, fnRef])

  React.useEffect(() => {
    return () => {
      debouncedFn.cancel()
    }
  }, [debouncedFn])

  return debouncedFn
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useDebouncedCallback = <T>(callback: (...args: any) => any, duration = 500) => {
  const valueRef = React.useRef<T>(null)
  const callbackRef = hooks.useLatest(callback)
  const flush = React.useMemo(() => lodash.debounce(() => {
    callbackRef.current?.(valueRef.current)
    valueRef.current = null
  }, duration), [callbackRef, duration])

  const setValue = (value: T) => {
    valueRef.current = value
    flush()
  }

  React.useEffect(() => {
    return () => {
      flush.cancel()
    }
  }, [flush])

  return setValue
}
