/** @jsx jsx */
import {
  React, jsx, css, polished, ReactRedux, Immutable, hooks, AppMode, classNames,
  type AllWidgetProps, type IMState, type ImmutableArray, type IMThemeVariables, lodash
} from 'jimu-core'
import {
  type JimuMapView, type JimuLayerView,
  JimuMapViewComponent,
  MapViewManager,
  type JimuMapViewGroup
} from 'jimu-arcgis'
import {
  defaultMessages as jimuUIMessages,
  Icon,
  WidgetPlaceholder,
  Switch,
  Alert,
  Label,
  Paper
} from 'jimu-ui'
import defaultMessages from './translations/default'
import iconSrc from '../../icon.svg'
import {
  type IMConfig,
  SwipeMode,
  SwipeStyle
} from '../config'
import { SwipeBetweenLayers } from './components/swipe-between-layers'
import { SwipeBetweenLayersPanel } from './panels/swipe-between-layers-panel'
import { SwipeBetweenMaps } from './components/swipe-between-maps'
import { SwipeBetweenMapsPanel } from './panels/swipe-between-maps-panel'
import { ScrollLayers } from './components/scroll-layers'
import { ScrollLayersPanel } from './panels/scroll-layers-panel'
import { WebScenePanel } from './panels/web-scene-panel'
import { DEFAULT_SLIDER_POSITION } from '../constants'
import { getJimuMapViewId, getDataSourceLabel, arraysEqual } from '../utils/utils'
import { Global } from 'jimu-theme'

const getStyle = (theme: IMThemeVariables) => css`
  &{
    .widget-container {
      overflow: auto;
    }
    .swipe-panel {
      padding: ${polished.rem(16)};
    }
    .swipe-title {
      .swipe-label {
        font-size: ${polished.rem(14)};
        color: ${theme.sys.color.surface.paperText};
        svg {
          min-width: 16px;
        }
        .swipe-text {
          margin-left: 0.5rem;
          margin-right: ${theme.sys.spacing(6)};
        }
      }
    }
    .error-alert {
      position: absolute;
      bottom: 4px;
      left: 4px;
      z-index: 1;
    }
  }
`

// Apply the specific style to swipe on the global map dom.
const getWidgetGlobalStyle = (dividerColor: string, handleColor: string, widgetId: string) => css`
  .exb-swipe-${widgetId} {
    pointer-events: none !important;
  }
  .exb-swipe-${widgetId} {
    --arcgis-internal-swipe-handle-color-background: ${handleColor};
    --arcgis-internal-swipe-divider-color-background: ${dividerColor};
  }
  .exb-swipe-scroll-${widgetId} {
    --arcgis-internal-swipe-divider-color-background: ${dividerColor};
  }
`
const { useState, useEffect, useCallback, useRef } = React

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { id, label, config, theme } = props
  const { styleConfig, scrollMapViewList, swipeMapViewList, mapUseDataSourcesOrderList, swipeStyle, swipeMode } = config
  const {
    defaultActivation = false, detailsVisibility = true, isAllowDeactivateLayers = true, toggleLayerVisibility = false, sliderPosition = DEFAULT_SLIDER_POSITION,
    dividerColor = 'var(--sys-color-surface-footer)', handleColor = 'var(--sys-color-surface-footer)'
  } = styleConfig || {}
  const useMapWidgetId = props.useMapWidgetIds?.[0]
  const [activeMapView, setActiveMapView] = useState<JimuMapView>(null)
  const [inactiveMapView, setInactiveMapView] = useState<JimuMapView>(null)
  const [jimuMapViewGroup, setJimuMapViewGroup] = useState<JimuMapViewGroup>(null)
  const [showSwipeOnMap, setShowSwipeOnMap] = useState(defaultActivation)
  const [scrollingLayerOfFirstMapView, setScrollingLayerOfFirstMapView] = useState<JimuLayerView>(null)
  const [scrollingLayerOfSecondMapView, setScrollingLayerOfSecondMapView] = useState<JimuLayerView>(null)
  const [scrollFirstMapView, setScrollFirstMapView] = useState(true)
  const [selectedFirstScrollLayerList, setSelectedFirstScrollLayerList] = useState(Immutable([]))
  const [selectedSecondScrollLayerList, setSelectedSecondScrollLayerList] = useState(Immutable([]))
  const [runtimeSelectedFirstScrollLayerList, setRuntimeSelectedFirstScrollLayerList] = useState(Immutable([]))
  const [scrollFirstMapViewAllSelectedLayer, setScrollFirstMapViewAllSelectedLayer] = useState(Immutable([]))
  const [runtimeSelectedSecondScrollLayerList, setRuntimeSelectedSecondScrollLayerList] = useState<ImmutableArray<string>>(Immutable([]))
  const [scrollSecondMapViewAllSelectedLayer, setScrollSecondMapViewAllSelectedLayer] = useState<ImmutableArray<string>>(Immutable([]))
  const [selectedLeadingLayerList, setSelectedLeadingLayerList] = useState(Immutable([]))
  const [selectedTrailingLayerList, setSelectedTrailingLayerList] = useState(Immutable([]))
  const [runtimeSelectedLeadingLayerList, setRuntimeSelectedLeadingLayerList] = useState(Immutable([]))
  const [runtimeSelectedTrailingLayerList, setRuntimeSelectedTrailingLayerList] = useState(Immutable([]))
  const [mapUseDataSources, setMapUseDataSources] = useState<ImmutableArray<string>>(Immutable([]))
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false)
  const [isLayerUpdated, setIsLayerUpdated] = useState<boolean>(true)
  const [isScrollLayerUpdated, setIsScrollLayerUpdated] = useState<boolean>(true)
  const [isRuntimeSwipeLayerUpdated, setIsRuntimeSwipeLayerUpdated] = useState<boolean>(true)
  const [isRuntimeScrollLayerUpdated, setIsRuntimeScrollLayerUpdated] = useState<boolean>(true)
  const [runtimeAddedActiveMapViewJimuLayerViews, setRuntimeAddedActiveMapViewJimuLayerViews] = useState<ImmutableArray<string>>(Immutable([]))
  const [runtimeAddedInactiveMapViewJimuLayerViews, setRuntimeAddedInactiveMapViewJimuLayerViews] = useState<ImmutableArray<string>>(Immutable([]))
  const [usedLeadingLayersId, setUsedLeadingLayersId] = useState<ImmutableArray<string>>(Immutable([]))
  const [usedTrailingLayersId, setUsedTrailingLayersId] = useState<ImmutableArray<string>>(Immutable([]))
  const hideErrorMsgTimer = useRef<NodeJS.Timeout>(null)
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const simpleSwipeStyle = swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical

  const useDataSources = ReactRedux.useSelector((state: IMState) => {
    const s = state.appStateInBuilder ?? state
    return s.appConfig.widgets[useMapWidgetId]?.useDataSources
  })

  const isDesignMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode === AppMode.Design)

  useEffect(() => {
    const newLeadingLayersId = selectedLeadingLayerList.concat(runtimeSelectedLeadingLayerList)
    if (!lodash.isDeepEqual(usedLeadingLayersId, newLeadingLayersId)) {
      setUsedLeadingLayersId(newLeadingLayersId)
    }
  }, [runtimeSelectedLeadingLayerList, selectedLeadingLayerList, usedLeadingLayersId])

  useEffect(() => {
    const newTrailingLayersId = selectedTrailingLayerList.concat(runtimeSelectedTrailingLayerList)
    if (!lodash.isDeepEqual(usedTrailingLayersId, newTrailingLayersId)) {
      setUsedTrailingLayersId(newTrailingLayersId)
    }
  }, [runtimeSelectedTrailingLayerList, selectedTrailingLayerList, usedTrailingLayersId])

  useEffect(() => {
    if (showErrorMsg && !hideErrorMsgTimer.current) {
      hideErrorMsgTimer.current = setTimeout(() => {
        setShowErrorMsg(false)
        hideErrorMsgTimer.current = null
      }, 3000)
    }
  }, [showErrorMsg])

  useEffect(() => {
    const newDsIds = useDataSources?.map(ds => ds.dataSourceId)
    setMapUseDataSources(newDsIds)
  }, [useDataSources])

  useEffect(() => {
    setShowSwipeOnMap(false)
  }, [swipeStyle, useMapWidgetId])

  useEffect(() => {
    setShowSwipeOnMap(defaultActivation)
  }, [defaultActivation])

  const onViewsCreate = (views: { [viewId: string]: JimuMapView }) => {
    const jimuMapViewGroup = MapViewManager.getInstance().getJimuMapViewGroup(useMapWidgetId)
    setJimuMapViewGroup(jimuMapViewGroup)

    Object.keys(views).forEach(viewId => {
      const jimuMapView = views[viewId]
      if (!jimuMapView.isActive) {
        setInactiveMapView(jimuMapView)
      }
    })
  }

  const onActiveMapViewChange = (activeView: JimuMapView) => {
    if (activeView?.view) {
      setActiveMapView(activeView)
      setIsLayerUpdated(false)
      setIsScrollLayerUpdated(false)
      setIsRuntimeSwipeLayerUpdated(false)
      setIsRuntimeScrollLayerUpdated(false)
    } else {
      setActiveMapView(null)
    }
  }

  const getRuntimeAddedJimuLayerViews = (jimuMapView: JimuMapView) => {
    const runtimeLayerList = []
    const mapLayers = jimuMapView?.view?.map?.layers?.toArray()
    mapLayers?.forEach(layer => {
      const jimuLayerView = jimuMapView.getJimuLayerViewByAPILayer(layer)
      if (jimuLayerView?.fromRuntime) {
        runtimeLayerList.push(jimuLayerView.id)
      }
    })
    return runtimeLayerList
  }

  useEffect(() => {
    if (selectedFirstScrollLayerList) {
      setScrollFirstMapViewAllSelectedLayer(selectedFirstScrollLayerList.concat(runtimeSelectedFirstScrollLayerList))
    } else {
      setScrollFirstMapViewAllSelectedLayer(runtimeSelectedFirstScrollLayerList)
    }
  }, [selectedFirstScrollLayerList, runtimeSelectedFirstScrollLayerList])

  useEffect(() => {
    if (selectedSecondScrollLayerList) {
      setScrollSecondMapViewAllSelectedLayer(selectedSecondScrollLayerList?.concat(runtimeSelectedSecondScrollLayerList))
    } else {
      setScrollSecondMapViewAllSelectedLayer(runtimeSelectedSecondScrollLayerList)
    }
  }, [selectedSecondScrollLayerList, runtimeSelectedSecondScrollLayerList])

  useEffect(() => {
    const inactiveDs = useDataSources?.filter(ds => {
      return ds.dataSourceId !== activeMapView?.dataSourceId
    })
    const inactiveJimuMapViewId = getJimuMapViewId(useMapWidgetId, inactiveDs?.[0]?.dataSourceId)
    const inactiveMapView = MapViewManager.getInstance().getJimuMapViewById(inactiveJimuMapViewId)
    setInactiveMapView(inactiveMapView)

    //Init runtime layer list.
    const runtimeActiveMapViewLayerList = getRuntimeAddedJimuLayerViews(activeMapView)
    setRuntimeAddedActiveMapViewJimuLayerViews(Immutable(runtimeActiveMapViewLayerList))
    setIsRuntimeSwipeLayerUpdated(true)
    setIsRuntimeScrollLayerUpdated(true)

    const runtimeInactiveMapViewLayerList = getRuntimeAddedJimuLayerViews(inactiveMapView)
    setRuntimeAddedInactiveMapViewJimuLayerViews(Immutable(runtimeInactiveMapViewLayerList))

    //Listen to layer created event, after layer added, get the runtime added layer.
    const jimuLayerViewCreatedListener = () => {
      const runtimeLayerList = getRuntimeAddedJimuLayerViews(activeMapView)
      setRuntimeAddedActiveMapViewJimuLayerViews(Immutable(runtimeLayerList))
    }

    //Listen to remove layer event, reset the runtime added layer.
    const jimuLayerViewRemovedListener = () => {
      const runtimeLayerList = getRuntimeAddedJimuLayerViews(activeMapView)
      setRuntimeAddedActiveMapViewJimuLayerViews(Immutable(runtimeLayerList))
      setIsRuntimeSwipeLayerUpdated(true)
      setIsRuntimeScrollLayerUpdated(true)
    }

    if (activeMapView) {
      activeMapView?.addJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
      activeMapView?.addJimuLayerViewRemovedListener(jimuLayerViewRemovedListener)
    }

    return () => {
      activeMapView?.removeJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
      activeMapView?.removeJimuLayerViewRemovedListener(jimuLayerViewRemovedListener)
    }
  }, [activeMapView, useDataSources, useMapWidgetId])

  const handleShowSwipeOnMap = () => {
    if (!showSwipeOnMap) {
      const switchButton = document.querySelector(`.jimu-widget-swipe .useMapWidgetId-${useMapWidgetId} .swipe-title .checked:not(.${id})`)
      if (switchButton) {
        setShowErrorMsg(true)
        switchButton.getElementsByTagName('input')[0].click()
      }
    }
    setShowSwipeOnMap(!showSwipeOnMap)
  }

  const handleScrollingLayerOfFirstMapView = useCallback((layer: JimuLayerView) => {
    setScrollingLayerOfFirstMapView(layer)
  }, [])
  const handleScrollingLayerOfSecondMapView = useCallback((layer: JimuLayerView) => {
    setScrollingLayerOfSecondMapView(layer)
  }, [])
  const handleScrollFirstMapView = useCallback((isFirstMap: boolean) => {
    setScrollFirstMapView(isFirstMap)
  }, [])

  const handleSelectedFirstScrollLayer = useCallback((list: ImmutableArray<string>) => {
    setSelectedFirstScrollLayerList(list)
    setIsScrollLayerUpdated(true)
  }, [])
  const handleSelectedSecondScrollLayer = useCallback((list: ImmutableArray<string>) => {
    setSelectedSecondScrollLayerList(list)
    setIsScrollLayerUpdated(true)
  }, [])
  const handleRuntimeSelectedFirstMapViewLayers = useCallback((list: ImmutableArray<string>) => {
    setRuntimeSelectedFirstScrollLayerList(list)
    setIsRuntimeScrollLayerUpdated(true)
  }, [])
  const handleRuntimeSelectedSecondMapViewLayers = useCallback((list: ImmutableArray<string>) => {
    setRuntimeSelectedSecondScrollLayerList(list)
    setIsRuntimeScrollLayerUpdated(true)
  }, [])

  const handleSelectedLeadingLayers = useCallback((list: ImmutableArray<string>) => {
    setSelectedLeadingLayerList(list)
    setIsLayerUpdated(true)
  }, [])
  const handleSelectedTrailingLayers = useCallback((list: ImmutableArray<string>) => {
    setSelectedTrailingLayerList(list)
    setIsLayerUpdated(true)
  }, [])

  const handleRuntimeSelectedLeadingLayers = useCallback((list: ImmutableArray<string>) => {
    setRuntimeSelectedLeadingLayerList(list)
    setIsRuntimeSwipeLayerUpdated(true)
  }, [])

  const handleRuntimeSelectedTrailingLayers = useCallback((list: ImmutableArray<string>) => {
    setRuntimeSelectedTrailingLayerList(list)
    setIsRuntimeSwipeLayerUpdated(true)
  }, [])

  const showScrollLayersPanel = !simpleSwipeStyle && !!activeMapView && mapUseDataSources?.length > 0 && activeMapView?.view?.type === '2d' && jimuMapViewGroup?.jimuMapViews && Object.keys(jimuMapViewGroup?.jimuMapViews).length > 0

  const showSwipeBetweenLayersPanel = simpleSwipeStyle && !!activeMapView && activeMapView.status === 'LOADED' && activeMapView?.view?.type === '2d' && swipeMode === SwipeMode.SwipeBetweenLayers

  const showSwipeBetweenMapsPanel = simpleSwipeStyle && swipeMode === SwipeMode.SwipeBetweenMaps && jimuMapViewGroup?.jimuMapViews && Object.keys(jimuMapViewGroup?.jimuMapViews).length === 2 && mapUseDataSources.length === 2

  const showScrollLayers = showSwipeOnMap && swipeStyle && !simpleSwipeStyle && (activeMapView?.view?.type === '2d') && mapUseDataSources?.length > 0 && jimuMapViewGroup?.jimuMapViews && Object.keys(jimuMapViewGroup?.jimuMapViews).length > 0

  const showSwipeBetweenMaps = jimuMapViewGroup?.jimuMapViews && Object.keys(jimuMapViewGroup?.jimuMapViews).length === 2 && activeMapView?.view && inactiveMapView?.view

  const showSwipeBetweenLayers = activeMapView?.view?.type === '2d' && (usedLeadingLayersId?.length > 0 || usedTrailingLayersId?.length > 0)

  const getLabel = () => {
    if (showSwipeBetweenMapsPanel) {
      const mapViewList = arraysEqual(mapUseDataSources, mapUseDataSourcesOrderList) ? mapUseDataSourcesOrderList : mapUseDataSources
      return (label + ':' + getDataSourceLabel(mapViewList[0]) + ',' + getDataSourceLabel(mapViewList[1]))
    } else {
      return label
    }
  }

  const SwipePanel = () => {
    return (
      <div className={classNames(`swipe-panel useMapWidgetId-${useMapWidgetId}`)}>
        <div className='swipe-title'>
          <Label check className='swipe-label d-flex justify-content-between align-items-center'>
            <span className='d-flex align-items-center'>
              <Icon icon={iconSrc} />
              <div className='swipe-text'>{label}</div>
            </span>
            <Switch
              aria-label={getLabel()}
              title={label}
              className={id}
              checked={showSwipeOnMap}
              onChange={handleShowSwipeOnMap}
            />
          </Label>
        </div>
        <div className={classNames({ 'd-none': !detailsVisibility })}>
        {showScrollLayersPanel && isRuntimeScrollLayerUpdated &&
          <ScrollLayersPanel
            scrollMapViewList={scrollMapViewList}
            activeMapView={activeMapView}
            inactiveMapView={inactiveMapView}
            handlePanelSelectedFirstScrollLayer={handleSelectedFirstScrollLayer}
            handlePanelSelectedSecondScrollLayer={handleSelectedSecondScrollLayer}
            isAllowDeactivateLayers={isAllowDeactivateLayers}
            toggleLayerVisibility={toggleLayerVisibility}
            scrollingLayerOfFirstMapView={scrollingLayerOfFirstMapView}
            scrollingLayerOfSecondMapView={scrollingLayerOfSecondMapView}
            scrollFirstMapView={scrollFirstMapView}
            showSwipeOnMap={showSwipeOnMap}
            runtimeActiveMapViewAddedLayers={runtimeAddedActiveMapViewJimuLayerViews}
            runtimeInactiveMapViewAddedLayers={runtimeAddedInactiveMapViewJimuLayerViews}
            handleRuntimePanelSelectedFirstScrollLayer={handleRuntimeSelectedFirstMapViewLayers}
            handleRuntimePanelSelectedSecondScrollLayer={handleRuntimeSelectedSecondMapViewLayers}
          />
        }
        {!simpleSwipeStyle && activeMapView?.view?.type === '3d' &&
          <WebScenePanel />
        }
        { simpleSwipeStyle && activeMapView?.view?.type === '3d' && swipeMode === SwipeMode.SwipeBetweenLayers &&
          <WebScenePanel />
        }
        { showSwipeBetweenLayersPanel && isRuntimeSwipeLayerUpdated &&
           <SwipeBetweenLayersPanel
            swipeMapViewList={swipeMapViewList}
            activeMapView={activeMapView}
            isAllowDeactivateLayers={isAllowDeactivateLayers}
            toggleLayerVisibility={toggleLayerVisibility}
            handlePanelSelectedLeadingLayers={handleSelectedLeadingLayers}
            handlePanelSelectedTrailingLayers={handleSelectedTrailingLayers}
            runtimeAddedLayers={runtimeAddedActiveMapViewJimuLayerViews}
            handleRuntimePanelSelectedLeadingLayers={handleRuntimeSelectedLeadingLayers}
            handleRuntimePanelSelectedTrailingLayers={handleRuntimeSelectedTrailingLayers}
           />}
         { showSwipeBetweenMapsPanel &&
         <SwipeBetweenMapsPanel
          mapUseDataSourcesOrderList={mapUseDataSourcesOrderList}
          mapUseDataSources={mapUseDataSources}
         />}
          {showErrorMsg && <Alert
          className='w-100 error-alert'
          form='basic'
          open
          withIcon
          type='warning'
          text={translate('mapOccupiedMsg')}
        />}
        </div>
      </div>
    )
  }

  return (
    <Paper shape='none' className='jimu-widget jimu-widget-swipe' css={getStyle(theme)}>
      <Global styles={getWidgetGlobalStyle(dividerColor, handleColor, id)} />
      {useMapWidgetId && <JimuMapViewComponent useMapWidgetId={useMapWidgetId} onActiveViewChange={onActiveMapViewChange} onViewsCreate={onViewsCreate}/>}
      {
        useMapWidgetId && swipeStyle
          ? <div className='widget-container surface-1 border-0 w-100 h-100'>
              {SwipePanel()}
            </div>
          : <WidgetPlaceholder icon={iconSrc} name={translate('_widgetLabel')} />
      }
      {showSwipeOnMap && swipeStyle && simpleSwipeStyle && activeMapView?.view &&
        (swipeMode === SwipeMode.SwipeBetweenLayers
          ? (showSwipeBetweenLayers && isLayerUpdated && <SwipeBetweenLayers
            widgetId={id}
            activeMapView={activeMapView}
            leadingLayersId={usedLeadingLayersId}
            trailingLayersId={usedTrailingLayersId}
            swipeStyle={swipeStyle}
            sliderPosition={sliderPosition}
            isDesignMode={isDesignMode}
          />)
          : (showSwipeBetweenMaps && <SwipeBetweenMaps
            swipeMode={swipeMode}
            widgetId={id}
            activeMapView={activeMapView}
            inactiveMapView={inactiveMapView}
            jimuMapViewGroup={jimuMapViewGroup}
            sliderPosition={sliderPosition}
            swipeStyle={swipeStyle}
            mapUseDataSourcesOrderList={mapUseDataSourcesOrderList}
            mapUseDataSources={mapUseDataSources}
            dividerColor={dividerColor}
            handlerColor={handleColor}
            isDesignMode={isDesignMode}
          />)
        )
      }
      {showScrollLayers && isScrollLayerUpdated && activeMapView?.view &&
        <ScrollLayers
              widgetId={id}
              activeMapView={activeMapView}
              inactiveMapView={inactiveMapView}
              jimuMapViewGroup={jimuMapViewGroup}
              firstTrailingLayersId={scrollFirstMapViewAllSelectedLayer}
              secondTrailingLayersId={scrollSecondMapViewAllSelectedLayer}
              swipeStyle={swipeStyle}
              handleScrollingLayerOfFirstMapView={handleScrollingLayerOfFirstMapView}
              handleScrollingLayerOfSecondMapView={handleScrollingLayerOfSecondMapView}
              handleScrollFirstMapView={handleScrollFirstMapView}
              dividerColor={dividerColor}
              isDesignMode={isDesignMode}
            />
      }
    </Paper>
  )
}

export default Widget
