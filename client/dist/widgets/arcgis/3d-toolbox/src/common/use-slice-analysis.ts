/** @jsx jsx */
import { React, type ImmutableArray } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import SlicePlane from 'esri/analysis/SlicePlane'
import SliceAnalysis from 'esri/analysis/SliceAnalysis'
import Viewpoint from 'esri/Viewpoint'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import type { SliceConfig, sliceAnalysisInfo } from '../constraints'

export interface SliceAnalysisProps {
  jimuMapView: JimuMapView
  sliceConfig?: SliceConfig
}
export const useSliceAnalysis = (props: SliceAnalysisProps) => {
  //1 preset analysis
  const getPresetAnalysisInConfig = React.useCallback(() => {
    let analyse = props.sliceConfig.analyses?.find((analyse) => {
      return (analyse.mapViewId === props.jimuMapView?.dataSourceId) // key is dataSourceId
    })

    if (!analyse) {
      analyse = null // for JSON.parse()
    }

    return analyse
  }, [props.sliceConfig, props.jimuMapView])

  const hasPresetAnalysisInConfig = React.useCallback(() => {
    let hasAnalysis = false
    hasAnalysis = !!(props.sliceConfig.analyses && getPresetAnalysisInConfig())
    return hasAnalysis
  }, [props.sliceConfig, getPresetAnalysisInConfig])

  const getPresetMapViewIdInConfig = React.useCallback((): string => {
    const id = getPresetAnalysisInConfig()?.mapViewId // only [0] for 1st version
    if (id?.startsWith('3d-toolbox-map-popper-'/* this.MAP_ID_PREFIX */)) {
      return id.replace('3d-toolbox-map-popper-'/* this.MAP_ID_PREFIX */, '')
    } else {
      return id
    }
  }, [getPresetAnalysisInConfig])

  // view point
  const getPresetViewpointInConfig = React.useCallback((): __esri.Viewpoint => {
    const viewpoint = getPresetAnalysisInConfig()?.viewpoint
    return Viewpoint.fromJSON(viewpoint)
  }, [getPresetAnalysisInConfig])

  const setPresetAnalysisInConfig = React.useCallback((analysisInfo: sliceAnalysisInfo): { analyses: ImmutableArray<sliceAnalysisInfo> } => {
    let analysisArray = props.sliceConfig.analyses.filter((item) => item.mapViewId !== props.jimuMapView.dataSourceId)
    analysisArray = analysisArray.concat(analysisInfo)

    return { analyses: analysisArray } // SliceConfig.analyses
  }, [props.jimuMapView?.dataSourceId, props.sliceConfig.analyses])

  const clearPresetAnalysisInConfig = React.useCallback((): { analyses: ImmutableArray<sliceAnalysisInfo> } => {
    const analysisArray = props.sliceConfig.analyses.filter((item) => item.mapViewId !== props.jimuMapView.dataSourceId)
    return { analyses: analysisArray } // SliceConfig.analyses
  }, [props.jimuMapView?.dataSourceId, props.sliceConfig.analyses])

  const isSameMapViewForPresetAnalysis = React.useCallback((mapId: string) => {
    let isSameFlag = false
    isSameFlag = (mapId === getPresetMapViewIdInConfig())
    return isSameFlag
  }, [getPresetMapViewIdInConfig])

  const hasPresetAnalysisForThisMap = React.useCallback((mapId: string) => {
    return (hasPresetAnalysisInConfig() && isSameMapViewForPresetAnalysis(mapId))
  }, [hasPresetAnalysisInConfig, isSameMapViewForPresetAnalysis])

  //2
  const getAnalysisFromConfig = React.useCallback(() => {
    let hasPresetAnalysis = hasPresetAnalysisInConfig()
    let analysisJson = {}
    let _sliceAnalysis = null
    // const _testPlaneString = '{"type":"plane","position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-13045139.43464337,"y":4036853.366572132,"z":407.09662980400026},"heading":349.1285337657075,"tilt":33.52597316023139,"width":58.83605810207322,"height":63.03070295905479}'

    if (hasPresetAnalysis) {
      try {
        analysisJson = JSON.parse(getPresetAnalysisInConfig()?.analysis)
      } catch (err) {
        hasPresetAnalysis = false
        console.error(analysisJson)
      }

      const slicePlane = SlicePlane.fromJSON(analysisJson)
      _sliceAnalysis = new SliceAnalysis({
        shape: slicePlane
      })
    }

    return _sliceAnalysis
  }, [hasPresetAnalysisInConfig, getPresetAnalysisInConfig])

  //3 add Analyses to map
  const addAnalysesToView = React.useCallback(async (hasPresetAnalysis: boolean, sliceAnalysis: SliceAnalysis, currentMapViewId: string) => {
    const view = props.jimuMapView?.view as __esri.SceneView

    // Wait for the view to load before adding analysis objects
    await reactiveUtils.whenOnce(() => !view.updating)

    const isSameMapViewId = (currentMapViewId === getPresetMapViewIdInConfig())
    if (view && view?.type === '3d' && isSameMapViewId && hasPresetAnalysis) {
      view.analyses.add(sliceAnalysis)
    } else {
      //TODO can't slice, alert something ?
    }

    if (isSameMapViewId && hasPresetAnalysis) {
      const viewpoint = getPresetViewpointInConfig()
      if (viewpoint) {
        props.jimuMapView?.view.goTo(viewpoint)
      }
    }
  }, [props.jimuMapView?.view,
    getPresetMapViewIdInConfig, getPresetViewpointInConfig])

  //4
  const removeAnalysesFromView = React.useCallback((sliceAnalysisRef: __esri.SliceAnalysis) => {
    const view = props.jimuMapView?.view as __esri.SceneView
    if (view && sliceAnalysisRef) {
      view.analyses?.remove(sliceAnalysisRef)
      sliceAnalysisRef.destroy()
      sliceAnalysisRef = null
    }
  }, [props.jimuMapView?.view])

  // export interfaces
  return {
    //1 preset analysis
    hasPresetAnalysisForThisMap,
    getPresetMapViewIdInConfig,
    getPresetViewpointInConfig,
    setPresetAnalysisInConfig,
    clearPresetAnalysisInConfig,
    //2 config
    getAnalysisFromConfig,
    //3 analyses in mapView
    addAnalysesToView,
    removeAnalysesFromView
  }
}
