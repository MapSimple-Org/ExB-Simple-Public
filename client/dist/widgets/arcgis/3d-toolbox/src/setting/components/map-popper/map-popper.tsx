/** @jsx jsx */
import { type UseDataSource, React, jsx, type ImmutableArray, Immutable, getAppStore, hooks } from 'jimu-core'
import { FloatingPanel, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { type JimuMapView, loadArcGISJSAPIModules, type JimuMapViewGroup } from 'jimu-arcgis'
import { JimuMap } from 'jimu-ui/advanced/map'
import { useTheme } from 'jimu-theme'
import type { Tool3D, SliceConfig } from '../../../constraints'
import defaultMessages from '../../translations/default'
import { getPanelHeaderStyles, getPoperStyle } from './style'
import { useSliceAnalysis } from '../../../common/use-slice-analysis'
import { ConfirmPopper } from './components/confirm-popper'
import { BottomBtns } from './components/bottom-btns'
import { getDefalutSize, getWidgetPosition } from './components/ui-utils'

interface Props {
  useMapWidgetIds: ImmutableArray<string>
  useDataSources?: ImmutableArray<UseDataSource>
  specifiedJimuMapId: string
  //
  isShowMapPopper?: boolean
  onShowMapPopperChange: (isShow: boolean) => void
  //
  toolConfig: Tool3D
  onPresetAnalysisChange: (config: any) => void
}

export interface SizeObj {
  width: number
  height: number
}

export const MapPopper = React.memo((props: Props) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  // API constructors
  const reactiveUtilsRef = React.useRef<__esri.reactiveUtils>(null)
  const SliceRef = React.useRef<typeof __esri.Slice>(null) //__esri.Slice
  const SliceViewModelRef = React.useRef<typeof __esri.SliceViewModel>(null) //__esri.SliceViewModel
  const SlicePlaneRef = React.useRef<__esri.SlicePlane>(null)
  const SliceAnalysisRef = React.useRef<__esri.SliceAnalysis>(null)
  // refs
  const sliceWidgetRef = React.useRef<__esri.Slice>(null)
  const currentSliceAnalysisRef = React.useRef<__esri.SliceAnalysis>(null)

  // States
  const [jimuMapViewState, setJimuMapViewState] = React.useState<JimuMapView>(null)
  //const [jimuMapViewsState, setJimuMapViewsState] = React.useState<{ [id: string]: JimuMapView }>(null)
  const [apiLoadedState, setApiLoadedState] = React.useState<boolean>(false)
  const [is3DViewState, setIs3DViewState] = React.useState<boolean>(false)
  const [isShowConfirmWinState, setIsShowConfirmWinState] = React.useState<boolean>(false)

  // save btns
  const [isSavedFlagState, setIsSavedFlagState] = React.useState<boolean>(true)

  // hooks for slice analysis
  const {
    getAnalysisFromConfig, setPresetAnalysisInConfig, clearPresetAnalysisInConfig, hasPresetAnalysisForThisMap,
    addAnalysesToView, removeAnalysesFromView
  } = useSliceAnalysis({
    jimuMapView: jimuMapViewState,
    sliceConfig: props.toolConfig.config as SliceConfig
  })

  React.useEffect(() => {
    if (!apiLoadedState) {
      loadArcGISJSAPIModules([
        'esri/core/reactiveUtils',
        'esri/widgets/Slice',
        'esri/widgets/Slice/SliceViewModel',
        'esri/analysis/SlicePlane',
        'esri/analysis/SliceAnalysis'
      ]).then(modules => {
        [reactiveUtilsRef.current, SliceRef.current, SliceViewModelRef.current, SlicePlaneRef.current, SliceAnalysisRef.current] = modules
        setApiLoadedState(true)
      })
    }
  }, [apiLoadedState, setApiLoadedState])

  // states observer for Save/Saved btn
  const slicingStateHandler = React.useRef<__esri.WatchHandle>(null)
  const slicedStateHandler = React.useRef<__esri.WatchHandle>(null)
  const removeSlicedStateHandler = React.useCallback(() => {
    if (slicingStateHandler?.current) {
      slicingStateHandler?.current.remove()
    }

    if (slicedStateHandler?.current) {
      slicedStateHandler?.current.remove()
    }
  }, [])
  const watchSlicedState = React.useCallback((hasPresetAnalysisForThisMapFlag: boolean) => {
    //viewModel.state ==> "ready" | "disabled" | "slicing" | "sliced"
    slicingStateHandler.current = reactiveUtilsRef?.current.watch(
      () => (sliceWidgetRef?.current.viewModel.state === 'slicing'),
      () => {
        setIsSavedFlagState(false)
      }
    )

    let firstSlicedFlag = true // for skip slice when first loaded
    slicedStateHandler.current = reactiveUtilsRef?.current.watch(
      () => (sliceWidgetRef?.current.viewModel.state === 'sliced'),
      () => {
        let isSkip = false
        if (hasPresetAnalysisForThisMapFlag && firstSlicedFlag) {
          isSkip = true
        }

        firstSlicedFlag = false // not the first time any more

        if (!isSkip) {
          //console.log('sliced callback')
          setIsSavedFlagState(false)
        }
      }
    )
  }, [])

  // slice widget
  const resetSliceWidget = React.useCallback((isCheckConfigFlag: boolean) => {
    removeSlicedStateHandler()

    // remove current analyses
    removeAnalysesFromView(currentSliceAnalysisRef.current)
    currentSliceAnalysisRef.current = null
    // remove widget
    if (sliceWidgetRef.current) {
      sliceWidgetRef.current.destroy()
    }

    // params for vm
    const view = jimuMapViewState?.view as __esri.SceneView
    const tiltEnabled = (props.toolConfig.config as SliceConfig).tiltEnabled
    const excludeGroundSurface = (props.toolConfig.config as SliceConfig).excludeGroundSurface
    const vmOptions: __esri.SliceViewModelProperties = {
      view: view,
      tiltEnabled: tiltEnabled,
      excludeGroundSurface: excludeGroundSurface
    }

    const hasPresetAnalysisForThisMapFlag = isCheckConfigFlag && hasPresetAnalysisForThisMap(jimuMapViewState?.dataSourceId)
    if (hasPresetAnalysisForThisMapFlag) {
      // analysisConfig can only be used for a specific map ,#12673
      currentSliceAnalysisRef.current = getAnalysisFromConfig()
      vmOptions.analysis = currentSliceAnalysisRef.current
    }

    // new widget
    // eslint-disable-next-line new-cap
    sliceWidgetRef.current = new SliceRef.current({
      //container: domRef,
      view: view,
      // eslint-disable-next-line new-cap
      viewModel: new SliceViewModelRef.current(vmOptions)
    })

    // after loaded
    sliceWidgetRef.current.when(() => {
      if (hasPresetAnalysisForThisMapFlag) { // analysisConfig can only be used for a specific map ,#12673
        // 1.set preset analysis to mapView
        addAnalysesToView(hasPresetAnalysisForThisMapFlag, currentSliceAnalysisRef.current, jimuMapViewState?.dataSourceId)
      } else {
        // 2.on preset analysis in config
        sliceWidgetRef.current.viewModel.start()
      }

      watchSlicedState(hasPresetAnalysisForThisMapFlag)
    })

    // drawing flag
    //setIsDrawingSliceFlagState(true)
  }, [jimuMapViewState?.dataSourceId, jimuMapViewState?.view,
    props.toolConfig.config,
    removeSlicedStateHandler, watchSlicedState,
    hasPresetAnalysisForThisMap, getAnalysisFromConfig, addAnalysesToView, removeAnalysesFromView])

  const getSliceViewModel = (): __esri.SliceViewModel => {
    return sliceWidgetRef.current.viewModel
  }

  // related to map
  React.useEffect(() => {
    if (jimuMapViewState && apiLoadedState && is3DViewState) {
      resetSliceWidget(true) // start slice
    }
  }, [jimuMapViewState, apiLoadedState, is3DViewState,
    resetSliceWidget])

  // map
  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    if (jimuMapView !== jimuMapViewState) {
      if (jimuMapView.view?.type === '3d') {
        setIs3DViewState(true)
      } else {
        setIs3DViewState(false)
      }
    }

    setJimuMapViewState(jimuMapView)
  }

  const handleViewGroupCreate = (viewGroup: JimuMapViewGroup): void => {
    //props.onMapPopperViewGroupUpdate(viewGroup)
  }

  // popper
  const { onShowMapPopperChange } = props
  const handleClickClose = React.useCallback((): void => {
    if (!isSavedFlagState) {
      setIsShowConfirmWinState(true) // show confirm popper
    } else {
      onShowMapPopperChange(false)
    }
  }, [onShowMapPopperChange, isSavedFlagState])
  // confirm
  const handleConfirmWinYes = (): void => {
    onShowMapPopperChange(false)
  }
  const handleConfirmWinCancel = (): void => {
    setIsShowConfirmWinState(false)
  }

  // unmount
  hooks.useUnmount(() => {
    removeSlicedStateHandler()

    if (sliceWidgetRef.current) {
      sliceWidgetRef.current.destroy()
    }
  })

  const useMapWidget = props.useMapWidgetIds && props.useMapWidgetIds[0]
  const config = getAppStore().getState().appStateInBuilder.appConfig
  // const isRTL = getAppStore().getState().appStateInBuilder.appContext.isRTL;
  if (!config.widgets[useMapWidget]) {
    return null
  }

  const useDataSource = config.widgets[useMapWidget].useDataSources
  const toolConfig = {
    canZoom: true,
    canHome: true,
    // canSearch: true,
    canCompass: true,
    canLayers: true
  }
  // if (props.jimuMapView?.dataSourceId) {
  //   const initialMapDataSourceID = props.jimuMapView?.dataSourceId

  const jimuMapConfig = Immutable({} as any)/*.set('initialMapDataSourceID', initialMapDataSourceID)*/.set('toolConfig', toolConfig)
  return (
    <div className='w-100'>
      {props.isShowMapPopper && <FloatingPanel
        onHeaderClose={handleClickClose}
        defaultPosition={getWidgetPosition(props.useMapWidgetIds[0])}
        headerTitle={translate('setDefaultSlice')}
        size={getDefalutSize(props.useMapWidgetIds[0]).innerSize}
        minSize={{ width: 770, height: 850 }}
        disableResize
        css={getPanelHeaderStyles(theme)}
        className='surface-2'
        disableActivateOverlay
        dragBounds='body'
        autoFocus={false}// 508
      >
        <div className='rounded-1 w-100 h-100' css={getPoperStyle}>
          <div className='popper-content'>
            <div className='map-container' style={{ height: '600px', width: '700px' }}>
              <JimuMap
                id={props.specifiedJimuMapId}// `fly__${props.useMapWidgetIds[0]}`
                useDataSources={useDataSource}
                jimuMapConfig={jimuMapConfig}
                onActiveViewChange={handleActiveViewChange}
                onViewGroupCreate={handleViewGroupCreate}
              />
            </div>

            {/* ConfirmWindow */}
            {isShowConfirmWinState && <ConfirmPopper
              innerSize={getDefalutSize(props.useMapWidgetIds[0]).innerSize}
              onConfirmWinYes={handleConfirmWinYes}
              onConfirmWinCancel={handleConfirmWinCancel}
            ></ConfirmPopper>}

            <div className='popper-footer d-flex'>
              {/* right-tools */}
              <BottomBtns
                jimuMapViewState={jimuMapViewState}
                apiLoadedState={apiLoadedState}
                getSliceViewModel={getSliceViewModel}
                //
                isSavedFlagState={isSavedFlagState}
                setIsSavedFlagState={setIsSavedFlagState}
                resetSliceWidget={resetSliceWidget}
                //
                setPresetAnalysisInConfig={setPresetAnalysisInConfig}
                clearPresetAnalysisInConfig={clearPresetAnalysisInConfig}
                onPresetAnalysisChange={props.onPresetAnalysisChange}
              ></BottomBtns>
            </div>
          </div>
        </div>
      </FloatingPanel>}
    </div>
  )
})
