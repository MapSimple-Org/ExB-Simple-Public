/** @jsx jsx */
import { React } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import Slice from 'esri/widgets/Slice'
import SliceViewModel from 'esri/widgets/Slice/SliceViewModel'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import type { SliceConfig } from '../../../constraints'
import { useSliceAnalysis } from '../../../common/use-slice-analysis'
import { isSliceExcludeLayerUI, isInNewSlicingUI } from './utils/ui-utils'

export interface SliceProps {
  jimuMapView: JimuMapView
  sliceConfig?: SliceConfig
  onUpdated: () => void
  onShowCancelSlicingBtn: (isShow: boolean) => void
  onShowResetSliceBtn: (isShow: boolean) => void
}
export const useSlice = (props: SliceProps) => {
  const { onUpdated, onShowResetSliceBtn, onShowCancelSlicingBtn } = props
  const widgetRef = React.useRef<__esri.Slice>(null)
  const currentSliceAnalysisRef = React.useRef<__esri.SliceAnalysis>(null)

  // handlers
  const resetSliceBtnHandlerRef = React.useRef<__esri.WatchHandle>(null)
  const cancelSlicingBtnHandlerRef = React.useRef<__esri.WatchHandle>(null)

  // hooks for slice analysis
  const { hasPresetAnalysisForThisMap, getAnalysisFromConfig, addAnalysesToView, removeAnalysesFromView } = useSliceAnalysis({
    jimuMapView: props.jimuMapView,
    sliceConfig: props.sliceConfig
  })

  // ResetSliceBtn
  const setResetBtnUI = React.useCallback((layersMode) => {
    const isExcludeLayerUI = isSliceExcludeLayerUI(layersMode)
    if (isExcludeLayerUI) {
      onShowResetSliceBtn(false) // hidden rest btn, when in exclude layer UI
    } else {
      onShowResetSliceBtn(true)
    }
  }, [onShowResetSliceBtn])

  //1
  const _updateWidget = React.useCallback((domRef: HTMLDivElement) => {
    const view = props.jimuMapView?.view as __esri.SceneView
    const hasPresetAnalysisForThisMapFlag = hasPresetAnalysisForThisMap(props.jimuMapView?.dataSourceId) // analysisConfig can only be used for a specific map ,#12673

    //vm
    const vmOptions: __esri.SliceViewModelProperties = {
      view: view,
      tiltEnabled: props.sliceConfig.tiltEnabled,
      excludeGroundSurface: props.sliceConfig.excludeGroundSurface
    }

    // preset analysis
    if (hasPresetAnalysisForThisMapFlag) {
      currentSliceAnalysisRef.current = getAnalysisFromConfig()
      vmOptions.analysis = currentSliceAnalysisRef.current
    }

    widgetRef.current = new Slice({
      //id: props.id,
      container: domRef,
      view: view,
      viewModel: new SliceViewModel(vmOptions)
    })

    widgetRef.current.when(() => {
      onUpdated()

      // reset Slice Btn
      if (hasPresetAnalysisForThisMapFlag) {
        onShowResetSliceBtn(true) // show btn
        resetSliceBtnHandlerRef.current = reactiveUtils.watch(() => ((widgetRef?.current.viewModel as any).layersMode),
          (layersMode) => {
            //console.log(layersMode)
            setResetBtnUI(layersMode)
          }
        )
      } else {
        onShowResetSliceBtn(false) // hidden, when analysis have been cleared (#12596)
      }

      // cancel Slicing Btn
      cancelSlicingBtnHandlerRef.current = reactiveUtils.watch(() => ((widgetRef?.current.viewModel as any).active),
        (isActive) => {
          //console.log(isActive)
          const isInSlicingUIFlag = isInNewSlicingUI(widgetRef?.current.viewModel.state, isActive)
          if (isInSlicingUIFlag) {
            onShowCancelSlicingBtn(true) // drawing UI
            onShowResetSliceBtn(false)
          } else {
            onShowCancelSlicingBtn(false)

            // restore btn
            if (hasPresetAnalysisForThisMapFlag) {
              setResetBtnUI((widgetRef?.current.viewModel as any).layersMode)
            }
          }
        }
      )

      //widgetRef.current.viewModel.shape.toJSON
      addAnalysesToView(hasPresetAnalysisForThisMapFlag, currentSliceAnalysisRef.current, props.jimuMapView.dataSourceId)
    })

    return widgetRef.current
  }, [props.jimuMapView, props.sliceConfig,
    hasPresetAnalysisForThisMap, getAnalysisFromConfig, addAnalysesToView,
    onUpdated, onShowResetSliceBtn, onShowCancelSlicingBtn, setResetBtnUI])

  const _destroyWidget = React.useCallback(() => {
    removeAnalysesFromView(currentSliceAnalysisRef.current)

    // reset btns
    onShowResetSliceBtn(false)
    onShowCancelSlicingBtn(false)

    currentSliceAnalysisRef.current = null
    resetSliceBtnHandlerRef?.current?.remove()
    cancelSlicingBtnHandlerRef?.current?.remove()
  }, [removeAnalysesFromView, onShowResetSliceBtn, onShowCancelSlicingBtn])

  // export interfaces
  return {
    // ref
    sliceRef: widgetRef.current,
    // update
    updateSliceWidget: _updateWidget,
    // remove
    destroySliceWidget: _destroyWidget
  }
}
