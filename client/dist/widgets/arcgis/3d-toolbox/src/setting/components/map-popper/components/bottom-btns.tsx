/** @jsx jsx */
import { React, jsx, type ImmutableArray, hooks } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import defaultMessages from '../../../translations/default'
import type { sliceAnalysisInfo } from '../../../../constraints'

interface Props {
  jimuMapViewState: JimuMapView
  apiLoadedState: boolean
  getSliceViewModel: () => __esri.SliceViewModel
  //
  isSavedFlagState: boolean
  setIsSavedFlagState: (isCheckConfigFlag: boolean) => void
  resetSliceWidget: (isCheckConfigFlag: boolean) => void
  //
  setPresetAnalysisInConfig: (analysisInfo: sliceAnalysisInfo) => { analyses: ImmutableArray<sliceAnalysisInfo> }
  clearPresetAnalysisInConfig: () => { analyses: ImmutableArray<sliceAnalysisInfo> }
  onPresetAnalysisChange: (config: any) => void
}

export const BottomBtns = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  // right btns
  const {
    jimuMapViewState, apiLoadedState, getSliceViewModel,
    isSavedFlagState, setIsSavedFlagState, resetSliceWidget,
    onPresetAnalysisChange, setPresetAnalysisInConfig, clearPresetAnalysisInConfig
  } = props

  // save btn
  const handleSaveAnalysis = React.useCallback(() => {
    let analysisJson = null

    const sliceViewModel = getSliceViewModel()
    if (sliceViewModel.state === 'sliced' && sliceViewModel.shape) {
      analysisJson = sliceViewModel.shape.toJSON()
    }
    let analysisConfig = ''
    if (analysisJson) {
      analysisConfig = JSON.stringify(analysisJson)
    }
    //console.log(analysisConfig)
    const viewpoint = jimuMapViewState.view.viewpoint.toJSON()
    const analysisInfo: sliceAnalysisInfo = { analysis: analysisConfig, mapViewId: jimuMapViewState.dataSourceId, viewpoint: viewpoint }

    //states
    setIsSavedFlagState(true)

    let presetAnalysis
    if (analysisJson) {
      presetAnalysis = setPresetAnalysisInConfig(analysisInfo)
    } else {
      presetAnalysis = clearPresetAnalysisInConfig()
    }

    onPresetAnalysisChange(presetAnalysis)
  }, [jimuMapViewState, getSliceViewModel,
    setIsSavedFlagState,
    onPresetAnalysisChange, setPresetAnalysisInConfig, clearPresetAnalysisInConfig])

  const isDisableSaveBtn = (): boolean => {
    if (!apiLoadedState) {
      return true
    }

    if (isSavedFlagState) {
      return true // has new sliced plane
    }

    return false
  }

  // clear btn
  const handleClearAnalysis = React.useCallback(() => {
    setIsSavedFlagState(false)
    resetSliceWidget(false)
  }, [setIsSavedFlagState, resetSliceWidget])

  return (
    <div className='right-tools'>
      <Button type='primary' className='mx-1' onClick={handleSaveAnalysis} disabled={isDisableSaveBtn()}>
        {isSavedFlagState ? translate('savedState') : translate('savePopper')}
      </Button>
      <Button type='secondary' className='mx-1' onClick={handleClearAnalysis} disabled={!apiLoadedState}>{translate('clear')}</Button>
    </div>
  )
})
