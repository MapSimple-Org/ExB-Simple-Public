/** @jsx jsx */
import { React, jsx, type ImmutableObject, type AppMode, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, Label, Loading, LoadingType, FOCUSABLE_CONTAINER_CLASS, useTrapFocusByBoundaryNodes, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import type { JimuMapView } from 'jimu-arcgis'
import defaultMessages from '../../translations/default'
import {
  type Tool3D, ToolsID, ArrangementStyle,
  type DaylightConfig, type WeatherConfig, type ShadowCastConfig, type LineOfSightConfig, type SliceConfig
} from '../../../constraints'
import { getStyle } from './style'

import { useDaylight } from './daylight'
import { useWeather } from './weather'
import { useShadowCast } from './shadowcast'
import { useLineOfSight } from './lineofsight'
import { useSlice } from './slice'

import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

export interface Props {
  mode: ToolsID // mode for this panel
  toolConfig: ImmutableObject<Tool3D>
  useMapWidgetId: string
  jimuMapView: JimuMapView

  shownModeState: ImmutableObject<Tool3D> // show state
  isShowBackBtn?: boolean
  onBackBtnClick: () => void
  // for clear fun, driven by state
  //clearVersion4KeepApiWidgetState?: number
  //onBackAndClearClick?: () => void
  appMode: AppMode
  // for popuper UI ,#13159
  onPopperVersionUpdate?: () => void
  // 508
  arrangementStyle?: ArrangementStyle
}

export const ToolPanel = React.memo((props: Props) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const domContainerRef = React.useRef<HTMLDivElement>(null)
  const widgetRef = React.useRef<__esri.Daylight | __esri.Weather | __esri.ShadowCast | __esri.LineOfSight | __esri.Slice>(null)

  const keepApiWidgetFlagRef = React.useRef<boolean>(props.toolConfig.activedOnLoad)
  React.useEffect(() => {
    keepApiWidgetFlagRef.current = props.toolConfig.activedOnLoad
  }, [props.toolConfig]) // update flag when config changed

  const [isLoadingState, setIsLoadingState] = React.useState<boolean>(true) // API loading flag
  const { onPopperVersionUpdate } = props
  const handleWidgetUpdate = React.useCallback(() => {
    setIsLoadingState(false) // hide Api loading

    if (typeof onPopperVersionUpdate === 'function') {
      onPopperVersionUpdate() // refresh popper UI ,#13159
    }
  }, [onPopperVersionUpdate])

  // UI for slice
  const [isShowCancelSlicingState, setIsShowCancelSlicingState] = React.useState<boolean>(false)
  const [isShowResetSliceState, setIsShowResetSliceState] = React.useState<boolean>(false) // support 'Reset slice plane' ,#12482

  // widgets
  const { updateDaylightWidget, destroyDaylightWidget } = useDaylight({
    jimuMapView: props.jimuMapView,
    daylightConfig: props.toolConfig.config as DaylightConfig,
    onUpdated: handleWidgetUpdate,
    appMode: props.appMode
  })
  const { updateWeatherWidget, destroyWeatherWidget } = useWeather({
    jimuMapView: props.jimuMapView,
    weatherConfig: props.toolConfig.config as WeatherConfig,
    onUpdated: handleWidgetUpdate
  })
  const { updateShadowCastWidget, destroyShadowCastWidget } = useShadowCast({
    jimuMapView: props.jimuMapView,
    shadowCastConfig: props.toolConfig.config as ShadowCastConfig,
    onUpdated: handleWidgetUpdate
  })
  const { updateLineOfSightWidget, destroyLineOfSightWidget } = useLineOfSight({
    jimuMapView: props.jimuMapView,
    lineOfSightConfig: props.toolConfig.config as LineOfSightConfig,
    onUpdated: handleWidgetUpdate
  })
  const { updateSliceWidget, destroySliceWidget } = useSlice({
    jimuMapView: props.jimuMapView,
    sliceConfig: props.toolConfig.config as SliceConfig,
    onUpdated: handleWidgetUpdate,
    onShowCancelSlicingBtn: setIsShowCancelSlicingState,
    onShowResetSliceBtn: setIsShowResetSliceState
  })

  function createContainerDom (id: ToolsID) {
    const c = document.createElement('div')
    c.className = id + '-container w-100 '
    // The content of Weather is not responsive, so it needs to be centered ,#12738
    if (id === ToolsID.Weather) {
      c.className += 'd-flex justify-content-center'
    }
    domContainerRef.current.innerHTML = ''
    domContainerRef.current.appendChild(c)

    return c
  }

  const destroyWidget = React.useCallback(() => {
    //console.log('==> destroyWidget ' + props.mode)
    if (widgetRef.current?.view?.map) {
      // subclass destruction implementation
      switch (props.mode) {
        case ToolsID.Daylight: {
          destroyDaylightWidget()
          break
        }
        case ToolsID.Weather: {
          destroyWeatherWidget()
          break
        }
        case ToolsID.ShadowCast: {
          destroyShadowCastWidget()
          break
        }
        case ToolsID.LineOfSight: {
          destroyLineOfSightWidget()
          break
        }
        case ToolsID.Slice: {
          destroySliceWidget()
          break
        }

        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default: {
          break
        }
      }
    }

    widgetRef?.current?.destroy()
    widgetRef.current = null

    if (domContainerRef?.current) {
      domContainerRef.current.innerHTML = ''
    }
  }, [props.mode,
    destroyDaylightWidget, destroyWeatherWidget,
    destroyShadowCastWidget, destroyLineOfSightWidget, destroySliceWidget])

  const initWidget = React.useCallback(() => {
    destroyWidget()
    //console.log('==> initWidget ' + props.mode)

    const isEnable = props.toolConfig.enable
    if (isEnable) {
      switch (props.mode) {
        case ToolsID.Daylight: {
          widgetRef.current = updateDaylightWidget(createContainerDom(props.mode))
          break
        }
        case ToolsID.Weather: {
          widgetRef.current = updateWeatherWidget(createContainerDom(props.mode))
          break
        }
        case ToolsID.ShadowCast: {
          widgetRef.current = updateShadowCastWidget(createContainerDom(props.mode))
          break
        }
        case ToolsID.LineOfSight: {
          widgetRef.current = updateLineOfSightWidget(createContainerDom(props.mode))
          break
        }
        case ToolsID.Slice: {
          widgetRef.current = updateSliceWidget(createContainerDom(props.mode))
          break
        }
      }
    }
  }, [props.mode, props.toolConfig, //props.jimuMapView,
    destroyWidget,
    updateDaylightWidget, updateWeatherWidget, updateShadowCastWidget, updateLineOfSightWidget, updateSliceWidget
  ])

  // on map changed
  React.useEffect(() => {
    if (!props.useMapWidgetId) {
      destroyWidget()
    }

    return () => {
      destroyWidget()
    }
  }, [props.jimuMapView?.view, props.useMapWidgetId,
    props.toolConfig,
    destroyWidget, initWidget])

  // on shownModeState changed
  const { onBackBtnClick } = props
  React.useEffect(() => {
    if (props.shownModeState?.id === props.mode) {
      keepApiWidgetFlagRef.current = true // reset to true
    }// else : 1.init by 'toolConfig.activedOnLoad'; 2. destroy by click 'Back&Clear'

    if (keepApiWidgetFlagRef?.current) {
      if (!widgetRef.current && props.useMapWidgetId && props.jimuMapView?.view) {
        initWidget()
      }
    } else {
      if (widgetRef.current) {
        destroyWidget()
      }
    }
  }, [props.mode,
    props.useMapWidgetId, props.jimuMapView?.view, // map changed
    props.shownModeState, //show state
    props.toolConfig, // config changed
    //keepApiWidgetState,
    destroyWidget, initWidget
  ])

  // 508
  const backBtnRefFor508 = React.useRef(null)
  const clearBtnRefFor508 = React.useRef(null)
  React.useEffect(() => {
    if (props.isShowBackBtn && (props.shownModeState?.id === props.mode)) {
      focusElementInKeyboardMode(backBtnRefFor508?.current) // 508
    }
  }, [props.shownModeState, props.isShowBackBtn, props.mode])
  // 508, focus loop
  const [focusLoopVersionState, setfocusLoopVersionState] = React.useState<number>(0)
  const firstNodeRefFor508 = React.useRef(null)
  const lastNodeRefFor508 = React.useRef(null)
  React.useEffect(() => {
    if (props.arrangementStyle === ArrangementStyle.List) {
      firstNodeRefFor508.current = backBtnRefFor508.current
      lastNodeRefFor508.current = clearBtnRefFor508.current
    }

    setfocusLoopVersionState((_currentVersion) => _currentVersion + 1)
  }, [props.shownModeState, props.arrangementStyle, props.mode])
  // 508 lastNode -> tab key -> firstNode
  useTrapFocusByBoundaryNodes(firstNodeRefFor508, lastNodeRefFor508, focusLoopVersionState)

  const _isShow = (props.shownModeState?.id === props.mode)
  const clearTips = (props.mode === ToolsID.Daylight || props.mode === ToolsID.Weather) ? translate('clearEffect') : translate('clearAnalysis')
  return (
    <div className={'p-2 w-100 ' + (_isShow ? 'd-block ' + FOCUSABLE_CONTAINER_CLASS : 'd-none')} css={getStyle(theme)}>
      {/* back btn */}
      {((props.isShowBackBtn) && (typeof onBackBtnClick === 'function')) &&
        <div className="tool-header d-flex align-items-center my-1">
          <Button className="" variant='text' color='inherit' icon size='sm'
            ref={ref => { backBtnRefFor508.current = ref }} onClick={onBackBtnClick}>
            <ArrowLeftOutlined size={16} autoFlip={true} />
          </Button>

          <Label className="label ml-1 my-0">{translate(props.mode)}</Label>
        </div>
      }

      <div className="tool-content">
        {isLoadingState && <div className="api-loader m-2">
          <Loading type={LoadingType.Secondary}></Loading>
        </div>}

        {/* API UI plane */}
        <div ref={domContainerRef}></div>

        <div className="tool-footer w-100 px-4 mt-1 mb-2">
          {/* cancel slicing btn */}
          {isShowCancelSlicingState &&
            <Button type="secondary" className={'w-100 mb-2'} onClick={() => {
              (widgetRef.current as __esri.Slice).viewModel.clear() // cancel & clear
            }}>{translate('commonModalCancel')}</Button>
          }

          {/* reset slice btn */}
          {isShowResetSliceState &&
            <Button type="secondary" className={'w-100 mb-2'} onClick={() => {
              initWidget() // reset to default slice analysis (#12482)
            }}>{translate('resetSlice')}</Button>
          }

          {/* back&clear btn */}
          <Button type="secondary" className={'w-100'} ref={ref => { clearBtnRefFor508.current = ref }}
            onClick={() => {
              keepApiWidgetFlagRef.current = false
              //setKeepApiWidgetState(false)
              onBackBtnClick()
            }}>{clearTips}</Button>
        </div>
      </div>
    </div>
  )
})
