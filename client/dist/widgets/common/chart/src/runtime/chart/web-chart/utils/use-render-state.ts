import {
  React,
  appConfigUtils,
  CONSTANTS,
  DataSourceManager,
  DataSourceStatus,
  defaultMessages as jimuCoreDefaultMessages,
  ReactRedux,
  getAppStore,
  hooks,
  type DataSource,
  type ImmutableObject,
  type IMState,
  type UseDataSource
} from 'jimu-core'
import { defaultMessages as jimuDefaultMessages } from 'jimu-ui'
import { type ChartTypes, getSeriesType, type SupportedLayer } from 'jimu-ui/advanced/chart'
import type { ChartDataSource, IWebChart } from '../../../../config'
import { isValidQuery } from '../../../../utils/common'
import defaultMessages from '../../../translations/default'
import type { RenderStatus } from '../../../state'

/**
 * Check whether the current data source is selected features view has no selection
 */
const useEmptySelectionDataSource = (dataSource?: DataSource) => {
  const isSelectionDataSource = dataSource?.isDataView && dataSource?.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID
  const selectionRecordsEmpty = isSelectionDataSource && !dataSource.getSourceRecords().length
  return selectionRecordsEmpty
}

/**
 * Get the warning message translation of not-ready data source.
 * @param useDataSource
 * @returns
 */
const getNotReadyTranslation = (
  useDataSource: ImmutableObject<UseDataSource>,
  dataSource: DataSource
): [string, { [key: string]: any }] => {
  if (!useDataSource || !dataSource) return null
  const labels = getDataSourceLabels(useDataSource, dataSource)
  const translation = [
    'outputDataIsNotGenerated',
    {
      outputDsLabel: labels.dataSourceLabel,
      sourceWidgetName: labels.widgetLabel
    }
  ] as [string, { [key: string]: any }]
  return translation
}

/**
 * Get the label of the data source and the label of the widget that outputs the data source
 * @param useDataSource
 * @param dataSource
 * @returns
 */
const getDataSourceLabels = (
  useDataSource: ImmutableObject<UseDataSource>,
  dataSource: DataSource
): { dataSourceLabel: string, widgetLabel: string } => {
  const dataSourceLabel = dataSource?.getLabel()
  const widgetId = appConfigUtils.getWidgetIdByOutputDataSource(useDataSource)
  const widgetLabel = getAppStore().getState()?.appConfig.widgets?.[widgetId]?.label
  return { dataSourceLabel, widgetLabel }
}

/**
 * Check whether the chart data source is valid.
 * @param dataSource
 */
const isValidIWebChartDataSource = (
  type: ChartTypes,
  dataSource: ImmutableObject<ChartDataSource>
): boolean => {
  return isValidQuery(type, dataSource?.query)
}

/**
 * Check whether the web chart config is valid.
 * @param webChart
 * @returns
 */
const isWebChartValid = (
  webChart: ImmutableObject<IWebChart>
): boolean => {
  const type = getSeriesType(webChart?.series as any)
  const sourceValid = isValidIWebChartDataSource(type, webChart?.dataSource)
  return sourceValid
}

interface WarningMessage {
  noDataMessage?: string
}

const useWarningMessage = (
  webChartValid: boolean,
  useDataSource: ImmutableObject<UseDataSource>,
  isSelectionEmpty: boolean,
  renderStatus: RenderStatus,
  messages: WarningMessage
): string => {
  let message = ''
  const originSourceStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[useDataSource?.dataSourceId]?.status)
  const instanceStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[useDataSource?.dataSourceId]?.instanceStatus)
  const translate = hooks.useTranslation(jimuCoreDefaultMessages, jimuDefaultMessages, defaultMessages)

  if (instanceStatus === DataSourceStatus.CreateError) {
    message = translate('dataSourceCreateError')
  } else {
    if (originSourceStatus === DataSourceStatus.NotReady && instanceStatus === DataSourceStatus.Created) {
      const dataSource = DataSourceManager.getInstance().getDataSource(useDataSource.dataSourceId)
      const translation = getNotReadyTranslation(useDataSource, dataSource)
      if (translation) {
        message = messages.noDataMessage || translate(...translation)
      }
    } else if (webChartValid) {
      if (isSelectionEmpty) {
        message = messages.noDataMessage || translate('dataEmptyTip')
      } else if (renderStatus === 'warning') {
        message = messages.noDataMessage || translate('dataEmptyTip')
      } else if (renderStatus === 'error') {
        message = translate('widgetLoadError')
      }
    }
  }

  return message
}

export const useChartRenderState = (
  useDataSource: ImmutableObject<UseDataSource>,
  dataSource: DataSource,
  outputDataSource: DataSource,
  layer: SupportedLayer,
  webChart: ImmutableObject<IWebChart>,
  renderStatus: RenderStatus,
  messages: WarningMessage = {}
  // eslint-disable-next-line max-params
): [boolean, boolean, boolean, string] => {

  const dataSourceId = useDataSource?.dataSourceId
  const dsStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.status)
  const rootDataSourceId = useDataSource?.rootDataSourceId
  const instanceStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.instanceStatus ?? state.dataSourcesInfo?.[rootDataSourceId]?.instanceStatus)
  const dsReady = (dsStatus && dsStatus !== DataSourceStatus.NotReady) && ((instanceStatus && instanceStatus !== DataSourceStatus.CreateError))

  const isSelectionDataSourceEmpty = useEmptySelectionDataSource(dataSource)
  const valid = React.useMemo(() => dataSourceId && isWebChartValid(webChart), [webChart, dataSourceId])
  // Render the chart (component) when the data source is ready and the chart config is valid
  const render = !!dataSourceId && !!outputDataSource && layer && dsReady && valid && !isSelectionDataSourceEmpty
  // Show placeholder only when the data source is not ready, the chart config is invalid or chart component throws an error
  const showPlaceholder = !valid || isSelectionDataSourceEmpty || dsStatus === DataSourceStatus.NotReady || instanceStatus === DataSourceStatus.CreateError || renderStatus === 'error' || renderStatus === 'warning'
  // Show loading after the data source is ready and the chart config is valid, until the chart component is loaded
  const loading = valid && !isSelectionDataSourceEmpty && dsStatus !== DataSourceStatus.NotReady && (!layer && instanceStatus !== DataSourceStatus.CreateError)
  const message = useWarningMessage(valid, useDataSource, isSelectionDataSourceEmpty, renderStatus, messages)
  return [render, showPlaceholder, loading, message]
}
