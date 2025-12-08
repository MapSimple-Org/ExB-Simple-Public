/** @jsx jsx */
import { CalcitePopover } from 'calcite-components'
import {
  type DataSource,
  type FeatureLayerDataSource,
  type ImmutableObject,
  React, jsx,
  loadArcGISJSAPIModule,
} from 'jimu-core'
import type { MeasureRange, DynSegFieldInfo, SubtypeLayers, Track, TrackRecord } from 'widgets/lrs/dynamic-segmentation/src/config'
import { atOrBetween, getAllDatasourceFromMapWidgetId, isDefined, isWithinTolerance, QueryMeasureOnRoute, type NetworkInfo } from 'widgets/shared-code/lrs'
import { useDynSegRuntimeState } from '../../../state'
import { getDisplayFieldInfo, getDisplayFieldValue, getGraphic, getXFromM } from '../../../utils/diagram-utils'
import { rgba } from 'polished'
import { Label } from 'jimu-ui'
import { getTheme, colorUtils } from 'jimu-theme'
import Graphic from 'esri/Graphic'
import type { CIMSymbol } from 'esri/symbols'
import GraphicsLayer from 'esri/layers/GraphicsLayer'

export interface MarkerProps {
  x: number
  m: number
  snapTolerance: number
  isPopupActive: boolean
  isHoverActive: boolean
  trackMap: Map<string, Track>
  featureLayer: __esri.FeatureLayer
  subtypeLayers: SubtypeLayers[]
  maxHeight: number
  networkInfo: ImmutableObject<NetworkInfo>
  measureRange: MeasureRange
  contentWidth: number
  sidebarWidth: number
  scrollPos: number
  networkDS: DataSource
  routeId: string
  temporalViewDate: Date
}

export interface RecordAttributes {
  displayField: string
  displayValue: string
  background: string
  order: number
}

export function Marker (props: MarkerProps) {
  const {
    x,
    m,
    snapTolerance,
    isPopupActive,
    isHoverActive,
    trackMap,
    featureLayer,
    subtypeLayers,
    maxHeight,
    networkInfo,
    measureRange,
    contentWidth,
    sidebarWidth,
    scrollPos,
    networkDS,
    routeId,
    temporalViewDate
  } = props

  const [attributesToDisplay, setAttributesToDisplay] = React.useState<Map<string, RecordAttributes>>(new Map())
  const { fieldInfo } = useDynSegRuntimeState()
  const [symbolUtils, setSymbolUtils] = React.useState<typeof __esri.symbolUtils>(null)
  const { jimuMapView, syncToMap } = useDynSegRuntimeState()
  const [snapX, setSnapX] = React.useState<number>(x)
  const [snapM, setSnapM] = React.useState<number>(m)
  const ref = React.useRef(null)
  const theme = getTheme()

  React.useEffect(() => {
    const loadDisplay = async () => {
      const attributeMap = new Map<string, RecordAttributes>()
      if (!isNaN(m)) {
        const snapping = snapToPoint()
        setSnapX(snapping[0])
        setSnapM(snapping[1])
        await Promise.all([...trackMap.keys()].map(async (trackKey) => {
          if (trackMap.get(trackKey).isActive) {
            await Promise.all(trackMap.get(trackKey).records.map(async (record) => {
              if (record.hasValue && isWithinRange(record, snapping[1])) {
                const fields = getFields(trackMap.get(trackKey).layerName)
                const fieldInfos = getFieldInfos(trackMap.get(trackKey).layerName)
                const key = trackMap.get(trackKey).index.toString() + '-' + record.index.toString()
                const background = await getDisplayBackground(trackMap.get(trackKey), record)
                const RecordAttributes: RecordAttributes = {
                  displayField: getDisplayFieldInfo(fieldInfos, record).originalFieldAlias,
                  displayValue: getDisplayFieldValue(fields, fieldInfo, record, subtypeLayers),
                  background: background,
                  order: trackMap.get(trackKey).index
                }
                attributeMap.set(key, RecordAttributes)
              }
            }))
          }
          return trackKey
        })).then(() => {
          setAttributesToDisplay(attributeMap)
        })
      }
    }

    if (!isNaN(m)) {
      loadDisplay()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m])

  const allLayersDS = React.useMemo(() => {
    if (jimuMapView) {
      return getAllDatasourceFromMapWidgetId(jimuMapView.mapWidgetId)
    }
  }, [jimuMapView])

  const getSymbolUtils = async (): Promise<typeof __esri.symbolUtils> => {
    if (symbolUtils) {
      return symbolUtils
    } else {
      const symbolUtil = await loadArcGISJSAPIModule('esri/symbols/support/symbolUtils')
      setSymbolUtils(symbolUtil)
      return symbolUtil
    }
  }

  const getFieldInfos = (layerName: string): DynSegFieldInfo[] => {
    return fieldInfo.filter((field) => field.eventName === layerName)
  }

  const getFields = (layerName: string): __esri.Field[] => {
    if (isDefined(featureLayer)) {
      return featureLayer.fields.filter(f => f.alias.includes('.') && f.alias.split('.')[0] === layerName)
    }
    return null
  }

  const getDisplayBackground = async (track: Track, record: TrackRecord): Promise<string> => {
    const [symbolUtils, graphic] = await Promise.all([getSymbolUtils(), getGraphic(record, null, true)])
    const featureDS = getLayer(track) as FeatureLayerDataSource
    const displayColor = await symbolUtils.getDisplayedColor(graphic, { renderer: featureDS.layer.renderer as __esri.renderersRenderer})
    if (!isDefined(displayColor)) {
      return rgba(255, 255, 255, 0)
    }
    return rgba(displayColor.r, displayColor.g, displayColor.b, 0.5)
  }

  const getLayer = (track: Track): DataSource => {
    if (isDefined(allLayersDS) && allLayersDS.length) {
      const layer = allLayersDS.find((ds) => {
        const fs = ds as FeatureLayerDataSource
        return fs.layer.layerId.toString() === track.layerId
      })
      if (isDefined(layer)) {
        return layer
      }
    }
    return null
  }

  const snapToPoint = (): [number, number] => {
    const mTolerance = networkInfo?.mTolerance
    const keys = [...trackMap.keys()]
    for (let i = 0; i < keys.length; i++) {
      const track = trackMap.get(keys[i])
      if (track.isActive) {
        for (let j = 0; j < track.records.length; j++) {
          const record = track.records[j]
          if (record.isPoint && record.hasValue) {
            if (atOrBetween([m - snapTolerance, m + snapTolerance], record.fromMeasure, mTolerance)) {
              return [getMAtX(record.fromMeasure), record.fromMeasure]
            }
          }
        }
      }
    }
    return [x, m]
  }

  const getMAtX = (m: number): number => {
    if (isNaN(m)) return NaN
    const x = getXFromM(m, measureRange, contentWidth) + sidebarWidth - scrollPos
    return Math.floor(x)
  }

  const isWithinRange = (record: TrackRecord, snappedM: number): boolean => {
    const mTolerance = networkInfo?.mTolerance
    if (isWithinTolerance(snappedM, record.fromMeasure, mTolerance) || isWithinTolerance(snappedM, record.toMeasure, mTolerance)) {
      return true
    }
    if (!record.isPoint && snappedM > record.fromMeasure && snappedM < record.toMeasure) {
      return true
    }
    return false
  }

  const getPrecision = () => {
    if (isDefined(networkInfo)) {
      return networkInfo.measurePrecision
    }
    return 0
  }

  const showPopup = (): boolean => {
    return isPopupActive || isHoverActive
  }

  const getSortedKeys = (): string[] => {
    const sortedMap = new Map([...attributesToDisplay.entries()].sort((a, b) => a[1].order - b[1].order))
    return [...sortedMap.keys()]
  }

  const getMeasureCount = (): number => {
    if (isNaN(snapM)) {
      return 0
    }
    const value = snapM.toFixed(getPrecision())
    return value.toString().length
  }

  const getMinWidth = (): number => {
    const count = getMeasureCount()
    return count * 14
  }

  const removeGraphicLayer = React.useCallback(() => {
    const layer = jimuMapView.view.map.findLayerById('marker-layer') as GraphicsLayer
    if (layer) {
      layer.removeAll()
      jimuMapView.view.map.remove(layer)
    }
  }, [jimuMapView.view.map])

  const createGraphicLayer = React.useCallback(() => {
    removeGraphicLayer()
    const newGraphicLayer = new GraphicsLayer({ id: 'marker-layer', listMode: 'hide' })
    jimuMapView.view.map.add(newGraphicLayer)
    return newGraphicLayer
  }, [jimuMapView.view.map, removeGraphicLayer])

  React.useEffect(() => {
    if (syncToMap && isPopupActive) {
      let graphicsLayer = createGraphicLayer()
      QueryMeasureOnRoute(networkDS, networkInfo, routeId, temporalViewDate, snapM.toString())
      .then((response) => {
        if (response) {
          const pinSymbol = {
            type: "cim",
            data: {
              type: "CIMSymbolReference",
              symbol: {
                "type": "CIMPointSymbol",
                "symbolLayers": [
                  {
                    "type": "CIMVectorMarker",
                    "enable": true,
                    "anchorPoint": { x: 0, y: 0 },
                    "offsetX": 0,
                    "offsetY": 10,
                    "size": 25,
                    "anchorPointUnits": "Relative",
                    "dominantSizeAxis3D": "Y",
                    "billboardMode3D": "FaceNearPlane",
                    "frame": {
                      "xmin": 0,
                      "ymin": 0,
                      "xmax": 21,
                      "ymax": 21
                    },
                    "markerGraphics": [
                      {
                        "type": "CIMMarkerGraphic",
                        "geometry": {
                          "rings": [
                            [
                              [ 17.17, 14.33 ],
                              [ 16.97, 12.96 ],
                              [ 16.38, 11.37 ],
                              [ 12.16, 3.98 ],
                              [ 11.2, 1.94 ],
                              [ 10.5, 0 ],
                              [ 9.8, 1.96 ],
                              [ 8.84,4.02 ],
                              [ 4.61, 11.41 ],
                              [ 4.02, 12.98 ],
                              [ 3.83, 14.33 ],
                              [ 3.96, 15.63 ],
                              [ 4.34, 16.88 ],
                              [ 4.95, 18.03 ],
                              [ 5.78, 19.04 ],
                              [ 6.8, 19.88 ],
                              [ 7.95, 20.49 ],
                              [ 9.2, 20.87 ],
                              [ 10.5, 21 ],
                              [ 11.8, 20.87 ],
                              [ 13.05,20.5 ],
                              [ 14.2, 19.88 ],
                              [ 15.22,19.05 ],
                              [ 16.05,18.03 ],
                              [ 16.66,16.88 ],
                              [ 17.04,15.63 ],
                              [ 17.17,14.33 ]
                            ]
                          ]
                        },
                        "symbol": {
                          "type": "CIMPolygonSymbol",
                          "symbolLayers": [
                            {
                              "type": "CIMSolidStroke",
                              "enable": true,
                              "capStyle": "Round",
                              "joinStyle": "Round",
                              "lineStyle3D": "Strip",
                              "miterLimit": 10,
                              "width": 0,
                              "color": [
                                110,
                                110,
                                110,
                                255
                              ]
                            },
                            {
                              "type": "CIMSolidFill",
                              "enable": true,
                              "color": [
                                47,
                                87,
                                167,
                                255
                              ]
                            }
                          ]
                        }
                      }
                    ],
                    "scaleSymbolsProportionally": true,
                    "respectFrame": true
                  }
                ],
                "animations": []
              }
            }
          }

          const graphic = new Graphic({
            geometry: response,
            symbol: pinSymbol as unknown as CIMSymbol
          })
          if (isDefined(graphicsLayer)) {
            graphicsLayer.add(graphic)
          } else {
            graphicsLayer = createGraphicLayer()
            graphicsLayer.add(graphic)
          }
        }
      })
      .catch((error)=> {
        console.log('error', error)
      })
    } else {
      const layer = jimuMapView.view.map.findLayerById('marker-layer') as GraphicsLayer
      if (isDefined(layer)) {
        removeGraphicLayer()
      }
    }
  }, [snapM, isPopupActive, syncToMap, networkDS, networkInfo, routeId, temporalViewDate, jimuMapView.view.map, createGraphicLayer, removeGraphicLayer])

  React.useEffect(() => {
    return () => {
      removeGraphicLayer()
    }
  }, [removeGraphicLayer])

  React.useEffect(()=> {
    if (!syncToMap) {
      removeGraphicLayer()
    }
  }, [removeGraphicLayer, syncToMap])

  return (
  <div
    ref={ref}
    id='sld-marker'
    className={`sld-marker sld-marker--pointer ${showPopup() ? 'sld-is-visible' : ''} `}
    style={{ left: !isNaN(snapX) ? snapX : 0 }}>
    <CalcitePopover
      id='sld-marker-popover'
      style={{
        minWidth: getMinWidth() + 'px',
        borderRadius: '5px',
        boxShadow: '4px 4px 8px 2px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${colorUtils.colorMixOpacity(theme.sys.color.surface.overlayHint, 0.5)}`
      }}
          autoClose={undefined}
          closable={undefined}
          open={showPopup() ? true : undefined}
          overlayPositioning='absolute'
          placement='auto-start'
          offsetDistance={15}
          offsetSkidding={10}
          scale='s'
          label={snapM.toFixed(getPrecision())}
          heading={snapM.toFixed(getPrecision())}
          referenceElement={'sld-marker'}>
          {isPopupActive && attributesToDisplay.size > 0 &&
             <div style={{
               padding: '10px',
               textWrap: 'nowrap',
               maxHeight: maxHeight,
               overflow: 'auto'
             }}>
              {getSortedKeys().map((key) => {
                return (
                  <span key={key}>
                    <div
                      style={{
                        background: attributesToDisplay.get(key).background,
                        marginBottom: '3px'
                      }}>
                      <Label
                        className='label2'
                        centric={true}
                        style={{ margin: '2px 5px' }}>
                        {`${attributesToDisplay.get(key).displayField}: ${attributesToDisplay.get(key).displayValue}`}
                      </Label>
                    </div>
                  </span>
                )
              })}
            </div>
          }
      </CalcitePopover>
  </div>

  )
}
