/** @jsx jsx */
import {
  type DataSource,
  type FeatureLayerDataSource,
  React,
  classNames,
  jsx
} from 'jimu-core'
import type { MeasureRange, Track, DynSegFieldInfo, SubtypeLayers, TrackRecord } from '../../../../config'
import { Item } from './item'
import { useDynSegRuntimeState } from '../../../state'
import { isDefined } from 'widgets/shared-code/lrs'

export interface RowProps {
  rowIndex: number
  allLayersDS: DataSource[]
  trackMap: Track
  contentWidth: number
  measureRange: MeasureRange
  isActive: boolean
  featureLayer: __esri.FeatureLayer
  subtypeLayers: SubtypeLayers[]
  onItemClick: (trackRecord: TrackRecord, track: Track, fieldInfos: DynSegFieldInfo[], id: string, doubleClick: boolean) => void
  onItemHover: (trackRecord: TrackRecord, track: Track, id: string) => void
  onItemHoverExit: () => void

}

export function Row (props: RowProps) {
  const { rowIndex, allLayersDS, trackMap, contentWidth, measureRange, isActive, featureLayer, subtypeLayers, onItemClick, onItemHover, onItemHoverExit } = props
  const { fieldInfo } = useDynSegRuntimeState()

  const getLayerRenderer = (): DataSource => {
    if (isDefined(allLayersDS) && allLayersDS.length) {
      const layer = allLayersDS.find((ds) => {
        const fs = ds as FeatureLayerDataSource
        return fs.layer.layerId.toString() === trackMap.layerId
      })
      if (isDefined(layer)) {
        return layer
      }
    }
    return null
  }

  const handleOnClick = (trackRecord: TrackRecord, fieldInfos: DynSegFieldInfo[], id: string, doubleClick: boolean) => {
    onItemClick(trackRecord, trackMap, fieldInfos, id, doubleClick)
  }

  const handleOnHover = (trackRecord: TrackRecord, id: string) => {
    onItemHover(trackRecord, trackMap, id)
  }

  const layerFieldInfos: DynSegFieldInfo[] = React.useMemo(() => {
    return fieldInfo.filter((field) => field.eventName === trackMap.layerName || field.eventName === '')
  }, [fieldInfo, trackMap.layerName])

  const layerFields: __esri.Field[] = React.useMemo(() => {
    if (isDefined(featureLayer)) {
      return featureLayer.fields.filter(f => f.alias.includes('.') && (f.alias.split('.')[0] === trackMap.layerName || f.alias.split('.')[0] === ''))
    }
    return null
  }, [featureLayer, trackMap.layerName])

  return (
  <div data-row-id={'sld-row-'+ rowIndex} key={'sld-row-'+ rowIndex} className={classNames('sld-row d-flex', isActive ? 'active' : 'inactive')} style={{ width: contentWidth, flexDirection: 'row', position: 'relative' }}>
    {trackMap.records.map((record) => {
      return (
        <Item
        key={record.index}
        eventDS={getLayerRenderer()}
        record={record}
        fieldInfos={layerFieldInfos}
        fields={layerFields}
        featureLayer={featureLayer}
        isActive={isActive}
        contentWidth={contentWidth}
        measureRange={measureRange}
        trackIndex={trackMap.index}
        subtypeLayers={subtypeLayers}
        onItemClick={handleOnClick}
        onItemHover={handleOnHover}
        onItemHoverExit={onItemHoverExit}/>
      )
    })}
  </div>
  )
}
