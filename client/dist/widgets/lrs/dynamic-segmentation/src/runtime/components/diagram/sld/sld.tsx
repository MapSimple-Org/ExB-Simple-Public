/** @jsx jsx */
import {
  React, jsx
} from 'jimu-core'
import type { SubtypeLayers, MeasureRange, Track, TrackRecord, DynSegFieldInfo } from '../../../../config'
import { Body } from './body'
import { getAllDatasourceFromMapWidgetId } from 'widgets/shared-code/lrs'
import { useDynSegRuntimeState } from '../../../state'

export interface SldProps {
  trackMap: Map<string, Track>
  height: number
  containerWidth: number
  contentWidth: number
  measureRange: MeasureRange
  featureLayer: __esri.FeatureLayer
  subtypeLayers: SubtypeLayers[]
  onItemClick: (trackRecord: TrackRecord, track: Track, fieldInfos: DynSegFieldInfo[]) => void
}

export function Sld (props: SldProps) {
  const { trackMap, height, containerWidth, contentWidth, measureRange, featureLayer, subtypeLayers, onItemClick } = props
  const { jimuMapView } = useDynSegRuntimeState()

  const allLayersDS = React.useMemo(() => {
    if (jimuMapView) {
      return getAllDatasourceFromMapWidgetId(jimuMapView.mapWidgetId)
    }
  }, [jimuMapView])

  return (
  <div
    className="sld"
    style={{ width: containerWidth, height: height }}>
    <Body
      allLayersDS={allLayersDS}
      trackMap={trackMap}
      contentWidth={contentWidth}
      measureRange={measureRange}
      featureLayer={featureLayer}
      subtypeLayers={subtypeLayers}
      onItemClick={onItemClick}/>
  </div>

  )
}
