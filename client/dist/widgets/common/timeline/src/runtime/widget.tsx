/** @jsx jsx */
import {
  React, type AllWidgetProps, jsx, type DataSource, ReactResizeDetector, DataSourceStatus, utils, defaultMessages as jimuCoreMessages, type MapDataSource,
  type MapServiceDataSource, DataSourceManager, Immutable, DataSourceTypes, css, hooks, getAppStore, type IMState, ReactRedux, TimezoneConfig,
  type FeatureLayerDataSource
} from 'jimu-core'
import { type JimuLayerView, type JimuLayerViews, type JimuMapView, JimuMapViewComponent, loadArcGISJSAPIModules, MapViewManager } from 'jimu-arcgis'
import { Alert, Paper, WidgetPlaceholder, defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { IMConfig } from '../config'
import TimeLine from './components/timeline'
import { getCalculatedTimeSettings, getDateTimePattern, getInsideLayersFromWebmapOrWebScene, getTimeExtentByTzOffset, getTimeSettingsFromHonoredWebMap, isSingleLayer, isWebMapOrWebScene } from '../utils/utils'
import defaultMessages from './translations/default'
import { versionManager } from '../version-manager'
import TimelineDataSource from './components/timeline-ds'

const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)

const widgetIcon = require('../../icon.svg')
const WIDGET_WIDTH = 480
const WIDGET_HEIGHT = '156px'
type TimelineProps = AllWidgetProps<IMConfig>
const Widget = (props: TimelineProps) => {
  const {
    useMapWidgetIds: _useMapWidgetIds, useDataSources, theme, id, config, intl, autoWidth, autoHeight, controllerWidgetId, offPanel
  } = props
  const {
    addSourceByData = true, enablePlayControl, applyFilteringByDefault = true, autoPlay, enableDisplayAccuracy = false, displayAccuracy,
    timeSettings, honorTimeSettings, dataSourceType,
    timeStyle, foregroundColor, backgroundColor, sliderColor
  } = config
  const useMapWidgetIds = addSourceByData ? null : _useMapWidgetIds
  const isOffPanel = controllerWidgetId && offPanel

  const { speed: _speed } = timeSettings || {}
  const [timeExtent, setTimeExtent] = React.useState(null)
  const [applied, setApplied] = React.useState(applyFilteringByDefault)
  const [speed, setSpeed] = React.useState(_speed)

  // active view from map widget
  const [layerViews, setLayerViews]: [JimuLayerViews, any] = React.useState(null)
  const mapViewDsIdRef = React.useRef(null) // use ref to get latest value of mapViewDsId
  const [noSupportedLayersInMapWidget, SetNoSupportedLayersInMapWidget] = React.useState(false) // check time-aware layers from map widget/webmap

  // Used to store all layer useDss from widget dataSources
  const [layerUseDss, setLayerUseDss] = React.useState(null)

  const [reactiveUtils, setReactiveUtils]: [typeof __esri.reactiveUtils, any] = React.useState(null)
  const [dataSources, setDataSources] = React.useState(null)
  const [notReadyOutputDs, setNotReadyOutputDs] = React.useState([]) // for all not-ready output ds ids
  const [isDsUpdating, setDsUpdating] = React.useState(true)
  const [width, setWidth] = React.useState(null)
  const [timeSettingsForRuntime, setDataSourcesForRuntime] = React.useState(null)
  const widgetRef = React.useRef<HTMLDivElement>(null)
  const isTimezoneData = ReactRedux.useSelector((state: IMState) => state.appConfig.attributes?.timezone?.type === TimezoneConfig.Data)

  const mvManager = React.useMemo(() => MapViewManager.getInstance(), [])
  const dsManager = React.useMemo(() => DataSourceManager.getInstance(), [])

  // whether the dataSources equal to useDss.
  const areDssReady = React.useMemo((): boolean => {
    if (notReadyOutputDs.length) {
      return false
    }
    const dsIds = Object.keys(dataSources || {}).sort()
    let isEqual
    if (useMapWidgetIds?.length) {
      isEqual = true
    } else {
      const useDsIds = (useDataSources || Immutable([])).map(ds => ds.dataSourceId).asMutable({ deep: true })
      isEqual = utils.diffArrays(true, dsIds, useDsIds).isEqual
    }
    return isEqual
  }, [useMapWidgetIds, dataSources, useDataSources, notReadyOutputDs])

  React.useEffect(() => {
    setWidth(isOffPanel ? WIDGET_WIDTH : widgetRef.current?.clientWidth)
    loadArcGISJSAPIModules([
      'esri/core/reactiveUtils'
    ]).then(modules => {
      setReactiveUtils(modules[0])
    })

    return () => {
      onTimeChanged(null, null, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    setDataSources(null)
    setLayerUseDss(null)
    setDataSourcesForRuntime(null)
  }, [dataSourceType])

  React.useEffect(() => {
    setApplied(applyFilteringByDefault)
  }, [applyFilteringByDefault])

  React.useEffect(() => {
    if (!isSingleLayer(dataSourceType)) {
      if (useMapWidgetIds?.length > 0) { // from map widget
        if (mapViewDsIdRef.current) {
          const _dataSources = {}
          const useDs = { dataSourceId: mapViewDsIdRef.current, mainDataSourceId: mapViewDsIdRef.current }
          dsManager.createDataSourceByUseDataSource(Immutable(useDs)).then(async webmapDs => {
            if (!mapViewDsIdRef.current) {
              return
            }
            if (layerViews) {
              const promises = [] // create all layers
              Object.keys(layerViews).forEach(layerViewId => {
                promises.push(layerViews[layerViewId].createLayerDataSource())
              })
              await Promise.all(promises)
              _dataSources[webmapDs.id] = webmapDs
              setDataSources(_dataSources)
              SetNoSupportedLayersInMapWidget(Object.keys(layerViews).length === 0)
            }
          })
        } else if (mapViewDsIdRef.current === '') { // no webmap ds from widget
          SetNoSupportedLayersInMapWidget(true)
          setDataSources(null)
        } else {
          SetNoSupportedLayersInMapWidget(false)
          setDataSources(null)
        }
      } else if (useDataSources?.length > 0) { // from webmap ds, map services
        SetNoSupportedLayersInMapWidget(false)
        const promises = []
        useDataSources.forEach(useDs => {
          // If it's a data source set, will wait until all child data sources are created.
          promises.push(dsManager.createDataSourceByUseDataSource(Immutable(useDs)).then(ds => ds.isDataSourceSet() && !ds.areChildDataSourcesCreated() ? ds.childDataSourcesReady().then(() => ds) : ds))
        })
        Promise.all(promises).then(dataSources => {
          const _dataSources = {}
          dataSources.forEach(ds => {
            _dataSources[ds.id] = ds
          })
          setDataSources(_dataSources)
        })
      }
    } else {
      SetNoSupportedLayersInMapWidget(false)
      setLayerUseDss(useDataSources)
    }
  }, [useMapWidgetIds, mapViewDsIdRef, layerViews, useDataSources, dsManager, dataSourceType, setLayerUseDss, setDataSources])

  React.useEffect(() => {
    // No need to update speed and settings when dss are not ready. For cases:
    // 1. all dataSources are not created from useDss when initializing.
    // 2. change ds from different type, like webMap map and feature layer. There are two states changed: honorTimeSettings is updated to false/true. dataSources are updated from new useDss.
    if (dataSources && reactiveUtils && areDssReady) {
      if (honorTimeSettings) {
        const settings = getTimeSettingsFromHonoredWebMap(dataSources, true)
        setSpeed(settings?.speed)
        setDataSourcesForRuntime(settings)
      } else {
        const _timeSettings = getCalculatedTimeSettings(timeSettings, dataSources, true)
        setSpeed(_speed)
        setDataSourcesForRuntime(_timeSettings)
      }
    }
  }, [dataSources, reactiveUtils, honorTimeSettings, _speed, timeSettings, areDssReady])

  /** Call it when timeline plays for each extent since mapViewIds could be updated.
   *  1. Map widgets are created or rendered after timeline is ready. (Runtime & Builder)
   *  2. Selected webMap, or WebMap including selected mapServices or layers are used/removed by map widgets. (Builder)
   */
  const watchDsUpdating = () => {
    let layerIds = []
    let mapDs = null
    const requests = []

    if (useMapWidgetIds?.length) { // from map widget
      layerViews && Object.keys(layerViews).forEach(id => {
        layerViews[id]?.view && requests.push(reactiveUtils.whenOnce(
          () => !layerViews[id].view.updating
        ))
      })
    } else { // from data
      const allMapViewIds = mvManager.getAllJimuMapViewIds()
      if (isWebMapOrWebScene(dataSourceType)) {
        mapDs = dataSources[Object.keys(dataSources)[0]] as MapDataSource
        layerIds = mapDs.getAllChildDataSources().map(layerDs => layerDs.id)
      } else { // MapService, Feature layers
        layerIds = Object.keys(dataSources)
      }

      layerIds.forEach(layerId => {
        const rootDs = mapDs || dataSources[layerId]?.getRootDataSource()
        if (isWebMapOrWebScene(rootDs?.type)) {
          const mapViewIds = allMapViewIds.filter(id => mvManager.getJimuMapViewById(id).dataSourceId === rootDs.id)
          mapViewIds.forEach(mapViewId => {
            const mapView = mvManager.getJimuMapViewById(mapViewId)
            const layerView = getLayerViewByLayerId(mapView, layerId)
            layerView?.view && requests.push(reactiveUtils.whenOnce(
              () => !layerView.view.updating
            ))
          })
        }
      })
    }

    Promise.all(requests).then((result) => {
      setDsUpdating(false)
    })
  }

  const getLayerViewByLayerId = (mapView: JimuMapView, layerId: string): JimuLayerView => {
    let layerView = null
    Object.keys(mapView.jimuLayerViews).forEach(vid => {
      if (mapView.jimuLayerViews[vid].layerDataSourceId === layerId) {
        layerView = mapView.jimuLayerViews[vid]
      }
    })
    return layerView
  }

  const onTimeChanged = hooks.useEventCallback((startTime: number, endTime: number, unmount = false) => {
    if (!dataSources) {
      return
    }

    const queryParams = { time: unmount ? null : [startTime, endTime] } as any
    if (!unmount) {
      // remove offset of ds.tz and local tz.
      const times = getTimeExtentByTzOffset(startTime, endTime)
      queryParams.time = [times.startTime, times.endTime]
    }

    if (!unmount) {
      watchDsUpdating()
    }
    if (isWebMapOrWebScene(dataSourceType)) {
      if (useMapWidgetIds?.length) { // map widget
        Object.keys(layerViews).forEach(id => {
          const layer = layerViews[id].getLayerDataSource()
          layer && updateLayerQueryParams(layer, queryParams, id)
        })
      } else { // webMap/webScene ds
        const layers = getInsideLayersFromWebmapOrWebScene(dataSources, config.timeSettings?.layerList)
        Object.keys(layers).forEach(lyId => {
          updateLayerQueryParams(layers[lyId], queryParams, id)
        })
      }
    } else {
      Object.keys(dataSources).forEach(dsId => {
        dataSources[dsId] && updateLayerQueryParams(dataSources[dsId], queryParams, id)
      })
    }
  })

  React.useEffect(() => {
    if (timeExtent) {
      onTimeChanged(timeExtent[0], timeExtent[1], !applied)
    }
  }, [timeExtent, applied, onTimeChanged])

  const updateLayerQueryParams = (layerDs, queryParams, id) => {
    if (layerDs.type === DataSourceTypes.MapService) {
      layerDs = layerDs as MapServiceDataSource
      if (layerDs.supportTime?.()) {
        queryParams = getTimeOffsetQueryParams(layerDs, queryParams)
        layerDs.changeTimeExtent?.(queryParams.time, id)
      }
    } else if (isSingleLayer(layerDs.type)) {
      if (layerDs.supportTime?.()) {
        queryParams = getTimeOffsetQueryParams(layerDs, queryParams)
        layerDs.updateQueryParams?.(queryParams, id)
      }
    }
  }

  const getTimeOffsetQueryParams = (layerDs, queryParams) => {
    // getTimeInfo() might return undefined:
    // 1. The associated ds of scene layer might be created failed.
    // 2. A time-aware layer might be changed to a non-time-aware layer.
    const exportOptions = layerDs.getTimeInfo()?.exportOptions || {}
    const { TimeOffset: offset = 0, timeOffsetUnits } = exportOptions
    if (queryParams?.time && offset !== 0) {
      let startTime = queryParams.time[0]
      let endTime = queryParams.time[1]
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)
      switch (timeOffsetUnits) {
        case 'esriTimeUnitsCenturies':
        case 'esriTimeUnitsDecades':
        case 'esriTimeUnitsYears':
          const offsetYear = timeOffsetUnits === 'esriTimeUnitsCenturies' ? 100 : timeOffsetUnits === 'esriTimeUnitsDecades' ? 10 : 1
          startTime = startDate.setFullYear(startDate.getFullYear() - offset * offsetYear)
          endTime = endDate.setFullYear(endDate.getFullYear() - offset * offsetYear)
          break
        case 'esriTimeUnitsMonths':
          startTime = startDate.setMonth(startDate.getMonth() - offset)
          endTime = endDate.setMonth(endDate.getMonth() - offset)
          break
        case 'esriTimeUnitsWeeks':
        case 'esriTimeUnitsDays':
          const offsetDay = timeOffsetUnits === 'esriTimeUnitsWeeks' ? 7 : 1
          startTime = startDate.setDate(startDate.getDate() - offset * offsetDay)
          endTime = endDate.setDate(endDate.getDate() - offset * offsetDay)
          break
        case 'esriTimeUnitsHours':
          startTime = startDate.setHours(startDate.getHours() - offset)
          endTime = endDate.setHours(endDate.getHours() - offset)
          break
        case 'esriTimeUnitsMinutes':
          startTime = startDate.setMinutes(startDate.getMinutes() - offset)
          endTime = endDate.setMinutes(endDate.getMinutes() - offset)
          break
        case 'esriTimeUnitsSeconds':
          startTime = startDate.setSeconds(startDate.getSeconds() - offset)
          endTime = endDate.setSeconds(endDate.getSeconds() - offset)
          break
        case 'esriTimeUnitsMilliseconds':
          startTime = startDate.setMilliseconds(startDate.getMilliseconds() - offset)
          endTime = endDate.setMilliseconds(endDate.getMilliseconds() - offset)
          break
        default:
          break
      }
      queryParams.time = [startTime, endTime]
    }
    return queryParams
  }

  const onResize = ({ width, height }) => {
    if (autoWidth) { // get bbox.width from layout for autoWidth
      const { layoutId, layoutItemId } = props
      const runtimeState = getAppStore().getState()
      const layoutItem = runtimeState?.appConfig?.layouts?.[layoutId]?.content?.[layoutItemId]
      if (!layoutItem) {
        return
      }
      const w = layoutItem.bbox.width
      if (w.includes('px')) {
        width = w
      } else {
        const selector = `div.layout[data-layoutid=${layoutId}]`
        const parentElement = document.querySelector(selector)
        const { clientWidth = 480 } = parentElement || {}
        width = clientWidth * parseInt(w.split('%')[0]) / 100
      }
    }
    setWidth(width)
  }

  // All dss are created with error.
  const areAllDataSourcesCreatedError = React.useMemo(() => {
    if (dataSources === null) {
      return false
    }
    return Object.keys(dataSources).filter(dsId => dataSources[dsId] === null).length === Object.keys(dataSources).length
  }, [dataSources])

  // Some output dss are not ready.
  const areSomeOutputDataSourcesNotReady = notReadyOutputDs.length > 0

  // handle output ds is ready or not.
  const onIsDataSourceNotReady = (dataSourceId: string, dataSourceStatus) => {
    if (
      !isSingleLayer(dataSourceType) ||
      !dataSources ||
      !dataSources[dataSourceId] ||
      !dataSources[dataSourceId].getDataSourceJson().isOutputFromWidget
    ) {
      return
    }
    updateNotReadyOutputDs(dataSourceId, dataSourceStatus)
  }

  // handle ds is created successful or failed.
  const onCreateDataSourceCreatedOrFailed = (dataSourceId: string, dataSource: DataSource, unMount = false) => {
    if (!isSingleLayer(dataSourceType)) { // todo: remove?
      return
    }
    setDataSources(dataSources => {
      // output ds specific
      const ds = dataSource || dataSources?.[dataSourceId]
      if (ds?.getDataSourceJson().isOutputFromWidget) {
        updateNotReadyOutputDs(dataSourceId, dataSource ? ds.getInfo().status : DataSourceStatus.Unloaded)
      }
      // current ds
      if (!dataSources && !dataSource && unMount) { // change to another single-layer with different type. It should keep current empty dss
        return dataSources
      }
      const newDataSources = Object.assign({}, dataSources)
      if (
        !dataSource && (
          dataSources?.[dataSourceId] || // current ds is removed by unselecting it.
          dataSources?.[dataSourceId] === null // current ds is removed because it does not support time anymore, such as arcade data layer.
        )
      ) {
        delete newDataSources[dataSourceId]
      } else {
        newDataSources[dataSourceId] = dataSource // dataSource is null when it's created failed.
      }

      // Case:
      // Update arcade data layer by script editor, from time-aware feature layer to normal feature layer.
      // And the current widget is not selected.
      if (dataSource && dataSource.getDataSourceJson().arcadeScript && !(dataSource as FeatureLayerDataSource).supportTime()) {
        newDataSources[dataSourceId] = null // remove current ds if it meets the condition.
      }
      return newDataSources
    })
  }

  const updateNotReadyOutputDs = (dataSourceId: string, dataSourceStatus) => {
    setNotReadyOutputDs(notReadyOutputDs => {
      let newOutputDss = []
      if (dataSourceStatus === DataSourceStatus.NotReady) {
        newOutputDss = notReadyOutputDs.includes(dataSourceId) ? notReadyOutputDs : notReadyOutputDs.concat(dataSourceId)
      } else {
        newOutputDss = notReadyOutputDs.includes(dataSourceId) ? notReadyOutputDs.filter(ds => ds !== dataSourceId) : notReadyOutputDs
      }
      return newOutputDss
    })
  }

  const onActiveViewChange = (jimuMapView: JimuMapView) => {
    if (jimuMapView?.view && jimuMapView.dataSourceId) {
      mapViewDsIdRef.current = jimuMapView.dataSourceId
      getAllJimuLayerViews(jimuMapView.id).then((jimuLayerViews) => {
        setLayerViews(jimuLayerViews)
      })
    } else {
      mapViewDsIdRef.current = ''
      setLayerViews(null)
    }
  }

  const getAllJimuLayerViews = async (jimuMapViewId: string) => {
    const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)
    const jimuLayerViews = await jimuMapView.whenAllJimuLayerViewLoaded()
    const supportedLayerViews = {} // only keep time-awared layers, except the featureLayer inside mapServices
    Object.keys(jimuLayerViews).forEach(id => {
      if (jimuLayerViews[id].layer.type !== 'sublayer' && jimuLayerViews[id].supportTime()) {
        supportedLayerViews[id] = jimuLayerViews[id]
      }
    })
    return supportedLayerViews
  }

  const getWarningPlaceholder = () => {
    let warningType = ''
    if (areAllDataSourcesCreatedError) { // all dss are created error
      warningType = 'dataSourceCreateError'
    } else if (areSomeOutputDataSourcesNotReady) { // some output dss are not ready
      warningType = 'outputDatasAreNotGenerated'
    } else if (noSupportedLayersInMapWidget) { // no time-aware layers in webmap ds
      warningType = 'noSupportedLayersInMapWidget'
    } else if (noTimelineFromHonoredMap) { // no timeline from honored map
      warningType = 'noTlFromHonoredMapWarning'
    } else if (isTimezoneData) { // timezone is set data
      warningType = 'timezoneWarning'
    } else { // invalid time span
      warningType = 'invalidTimeSpanWarning'
    }

    return <div className='placeholder-container w-100 h-100 position-relative'>
      {getWidgetPlaceHolder()}
      <Alert
        form='tooltip' size='small' type='warning' withIcon={true} className='position-absolute'
        style={{ bottom: 10, right: 10 }}
        text = {formatMessage(warningType)}
      />
    </div>
  }

  const formatMessage = (id) => {
    return intl.formatMessage({ id: id, defaultMessage: allDefaultMessages[id] })
  }

  // use default w/h from manifest when inside the controller widget.
  const getWidgetPlaceHolder = () => {
    return <WidgetPlaceholder
        className='timeline-placeholder'
        icon={widgetIcon}
        widgetId={id}
        css={css`
          width: ${isOffPanel ? WIDGET_WIDTH + 'px' : 'inherit'};
          height: ${autoHeight || isOffPanel ? WIDGET_HEIGHT : '100%'};
        `}
        name={formatMessage('_widgetLabel')}
      />
  }

  const dateTimePattern = React.useMemo(() => {
    const unit = enableDisplayAccuracy ? displayAccuracy : 'second'
    return getDateTimePattern(unit)
  }, [enableDisplayAccuracy, displayAccuracy])

  const noTimelineFromHonoredMap = dataSources && isWebMapOrWebScene(dataSourceType) && reactiveUtils && timeSettingsForRuntime === null
  const isDateExtentError = timeSettingsForRuntime?.startTime?.value > timeSettingsForRuntime?.endTime?.value
  const isDsLoading = () => {
    return dataSources ? Object.keys(dataSources).filter(dsId => dataSources[dsId]?.getInfo().status === DataSourceStatus.Loading).length > 0 : false
  }

  const showWarning = areAllDataSourcesCreatedError || areSomeOutputDataSourcesNotReady || noSupportedLayersInMapWidget || noTimelineFromHonoredMap || isDateExtentError || isTimezoneData

  if (
    (!addSourceByData && ((useMapWidgetIds || []).length === 0)) || // no map widget set
    (addSourceByData && (!useDataSources || useDataSources.length === 0)) || // no dss set
    (!areSomeOutputDataSourcesNotReady && timeSettingsForRuntime && timeSettingsForRuntime?.startTime?.value === timeSettingsForRuntime?.endTime?.value)
  ) {
    return getWidgetPlaceHolder()
  } else {
    return <React.Fragment>
      {
        useMapWidgetIds?.length > 0 &&
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={onActiveViewChange}
        />
      }
      {
        layerUseDss?.length > 0 && layerUseDss?.map((useDs) => {
          return (
            <TimelineDataSource
              key={useDs.dataSourceId}
              useDataSource={useDs}
              onIsDataSourceNotReady={onIsDataSourceNotReady}
              onCreateDataSourceCreatedOrFailed={onCreateDataSourceCreatedOrFailed}
            />
          )
        })
      }
      {
        showWarning
          ? getWarningPlaceholder()
          : !addSourceByData && dataSources === null // when set map without ds
              ? getWidgetPlaceHolder()
              : <Paper shape={isOffPanel ? 'shape2' : 'none'}
                  className='timeline-widget'
                  css={css`
                    width: ${(isOffPanel || autoWidth) ? width + 'px' : 'unset'};
                    height: ${(isOffPanel || (autoHeight && !dataSources)) ? WIDGET_HEIGHT : 'unset'};
                    background: ${backgroundColor || theme.sys.color.surface.paper};
                  `}
                  ref={el => { widgetRef.current = el }}
                >
                  {
                    !isOffPanel && <ReactResizeDetector targetRef={widgetRef} handleWidth onResize={onResize} />
                  }
                  {
                    dataSources === null || !areDssReady
                      ? <div className='jimu-secondary-loading' css={css`position: 'absolute';left: '50%';top: '50%';`} />
                      : timeSettingsForRuntime && width >= 0 && <TimeLine
                        theme={theme}
                        width={width}
                        updating={isDsLoading() || isDsUpdating}
                        startTime={timeSettingsForRuntime.startTime?.value}
                        endTime={timeSettingsForRuntime.endTime?.value}
                        accuracy={timeSettingsForRuntime.accuracy}
                        stepLength={timeSettingsForRuntime.stepLength}
                        dividedCount={timeSettingsForRuntime.dividedCount}
                        displayStrategy={timeSettingsForRuntime.timeDisplayStrategy}
                        timeStyle={timeStyle}
                        foregroundColor={foregroundColor}
                        backgroundColor={backgroundColor}
                        sliderColor={sliderColor}
                        enablePlayControl={enablePlayControl}
                        // applyFilteringByDefault={applyFilteringByDefault}
                        speed={speed}
                        autoPlay={autoPlay}
                        dateTimePattern={dateTimePattern}
                        applied={applied}
                        onTimeChanged={(sTime, eTime) => { setTimeExtent([sTime, eTime]) }}
                        onApplyStateChanged={applied => { setApplied(applied) }}
                      />
                  }
                </Paper>
      }
    </React.Fragment>
  }
}
Widget.versionManager = versionManager

export default Widget
