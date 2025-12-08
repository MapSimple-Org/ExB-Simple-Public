/** @jsx jsx */
import {
  type DataSource,
  React,
  jsx,
} from 'jimu-core'
import type { MeasureRange, Track, SubtypeLayers, TrackRecord, DynSegFieldInfo } from '../../../../config'
import { Row } from './row'
import { CalcitePopover } from 'calcite-components'
import { getGeometryGraphic, isDefined } from 'widgets/shared-code/lrs'
import { getGraphic } from '../../../utils/diagram-utils'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../../state'
import { debounce } from 'lodash-es'
import { getTheme, colorUtils } from 'jimu-theme'
import { Label } from 'jimu-ui'
import { reorderGraphicsLayer } from '../../../utils/feature-layer-utils'

export interface BodyProps {
  allLayersDS: DataSource[]
  trackMap: Map<string, Track>
  contentWidth: number
  measureRange: MeasureRange
  featureLayer: __esri.FeatureLayer
  subtypeLayers: SubtypeLayers[]
  onItemClick: (trackRecord: TrackRecord, track: Track, fieldInfos: DynSegFieldInfo[]) => void
}

const useDebounce = (callback: () => void) => {
  const ref = React.useRef<any>(null)

  React.useEffect(() => {
    ref.current = callback
  }, [callback])

  const debouncedCallback = React.useMemo(() => {
    const func = () => {
      ref.current?.()
    }

    return debounce(func, 1000)
  }, [])

  return debouncedCallback
}

export function Body (props: BodyProps) {
  const { allLayersDS, trackMap, contentWidth, measureRange, featureLayer, subtypeLayers, onItemClick } = props
  const [referenceElement, setReferenceElement] = React.useState('')
  const [attributes, setAttributes] = React.useState<Map<string, string | number | Date>>(new Map())
  const [showPopup, setShowPopup] = React.useState(false)
  const [attributesBackgrounds, setAttributesBackgrounds] = React.useState<Map<string, string>>(new Map())
  const { highlightColor, highlightLayer, selectedSldId, jimuMapView } = useDynSegRuntimeState()
  const [hoverTrackRecord, setHoverTrackRecord] = React.useState<TrackRecord>(null)
  const [hoverTrack, setHoverTrack] = React.useState<Track>(null)
  const [hoverId, setHoverId] = React.useState<string>(null)
  const theme = getTheme()
  const dispatch = useDynSegRuntimeDispatch()

  const handleOnHoverEnter = () => {
    if (isDefined(hoverTrackRecord) && isDefined(hoverTrack) && isDefined(hoverId)) {
      if (selectedSldId === '' || selectedSldId === hoverId) {
        setShowPopup(true)
        setReferenceElement(hoverId)
        setAttributes(hoverTrackRecord.attributes)
        setAttributesBackgrounds(hoverTrackRecord.attributeBackgrounds)
        setHoverTrack(hoverTrack)
      }
    }
  }

  const handleOnHoverExit = () => {
    if (selectedSldId === '' || selectedSldId === hoverId) {
      setHoverId(null)
      setAttributes(new Map())
      setAttributesBackgrounds(new Map())
      setHoverTrack(null)
      setShowPopup(false)
    }
  }

  const handleOnHover = (trackRecord: TrackRecord, track: Track, id: string) => {
    if (selectedSldId === '' || selectedSldId === id) {
      setHoverTrackRecord(trackRecord)
      setHoverTrack(track)
      setHoverId(id)
      debouncedOnChange()
    }
  }

  const handleItemClicked = async (trackRecord: TrackRecord, track: Track, fieldInfos: DynSegFieldInfo[], id: string, doubleClick: boolean) => {
    setShowPopup(false)
    if (!doubleClick && selectedSldId === id) {
      dispatch({ type: 'SET_SELECTED_SLD_ID', value: '' })
    } else if (doubleClick) {
      await setHoverGraphic(trackRecord)
      onItemClick(trackRecord, track, fieldInfos)
    } else {
      await setHoverGraphic(trackRecord)
      // clear any existing popups
      onItemClick(null, null, null)
    }
  }

  React.useEffect(()=> {
    if (selectedSldId === '') {
      highlightLayer.removeAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSldId])

  const debouncedOnChange = useDebounce(handleOnHoverEnter)

  const setHoverGraphic = async (trackRecord: TrackRecord) => {
    if (isDefined(trackRecord) && isDefined(highlightLayer)) {
      reorderGraphicsLayer(jimuMapView, highlightLayer)
      highlightLayer.removeAll()
      const graphic = await getGraphic(trackRecord)
      const mapGraphic = await getGeometryGraphic(graphic, highlightColor, 4, !trackRecord.isPoint)
      highlightLayer.add(mapGraphic)
    }
  }

  const getHoverDisplayLabel = (): string => {
    if (!isDefined(hoverTrack)) {
      return ''
    }
    return hoverTrack.layerName
  }

  const getHoverDisplayAlias = (key: string): string => {
    if (!isDefined(hoverTrackRecord)) {
      return ''
    }
    const fieldInfo = hoverTrackRecord.fieldInfos.find((info) => info.originalFieldName === key)
    if (isDefined(fieldInfo)) {
      return fieldInfo.originalFieldAlias
    }
    return key
  }

  const getActiveTracks = (): string[] => {
    return [...trackMap.keys()].filter((key) => trackMap.get(key).isActive)
  }

  const getInactiveTracks = (): string[] => {
    return [...trackMap.keys()].filter((key) => !trackMap.get(key).isActive)
  }

  return (
  <div className="sld-body h-100" style={{ width: contentWidth }}>
    { getActiveTracks().map((track, index) => {
      return (
        <Row
          key={trackMap.get(track).index}
          rowIndex={index}
          allLayersDS={allLayersDS}
          featureLayer={featureLayer}
          trackMap={trackMap.get(track)}
          contentWidth={contentWidth}
          measureRange={measureRange}
          isActive={true}
          subtypeLayers={subtypeLayers}
          onItemClick={handleItemClicked}
          onItemHover={handleOnHover}
          onItemHoverExit={handleOnHoverExit}/>
      )
    })}
    { getInactiveTracks().map((track, index) => {
      return (
        <Row
          key={trackMap.get(track).index}
          rowIndex={index}
          allLayersDS={allLayersDS}
          featureLayer={featureLayer}
          trackMap={trackMap.get(track)}
          contentWidth={contentWidth}
          measureRange={measureRange}
          isActive={false}
          subtypeLayers={subtypeLayers}
          onItemClick={onItemClick}
          onItemHover={handleOnHover}
          onItemHoverExit={handleOnHoverExit}/>
      )
    })}
    <CalcitePopover
      autoClose={undefined}
      closable={undefined}
      open={showPopup ? true : undefined}
      overlayPositioning='absolute'
      placement='auto'
      scale='s'
      label={getHoverDisplayLabel()}
      heading={getHoverDisplayLabel()}
      referenceElement={referenceElement}
      style={{
        borderRadius: '5px',
        boxShadow: '4px 4px 8px 2px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${colorUtils.colorMixOpacity(theme.sys.color.surface.overlayHint, 0.5)}`
      }}>
        <div style={{ margin: '10px' }}>
          {[...attributes.keys()].map((key) => {
            return (
              <span key={key}>
                <div
                  style={{
                    background: attributesBackgrounds.get(key),
                    marginBottom: '3px'
                  }}>
                  <Label
                    className='label2'
                    centric={true}
                    style={{ margin: '2px 5px' }}>
                      {`${getHoverDisplayAlias(key)}: ${attributes.get(key)}`}
                  </Label>
                </div>
              </span>
            )
          })}
        </div>
    </CalcitePopover>
  </div>
  )
}
