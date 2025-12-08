import { type DataSource, type FeatureLayerDataSource, type ImmutableObject, SessionManager } from 'jimu-core'
import { requestService, type MeasureToGeometryResponse, type NetworkInfo, isDefined } from 'widgets/shared-code/lrs'
import { geometryUtils, type JimuMapView } from 'jimu-arcgis'
import { Polyline } from 'esri/geometry'
import Graphic from 'esri/Graphic'
import type { CIMSymbol } from 'esri/symbols'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { round } from 'lodash-es'

export async function getGeometryToMeasure (startRange:number, endRange: number, networkDS: DataSource,
    networkInfo: ImmutableObject<NetworkInfo>, routeId: string, temporalViewDate: Date): Promise<MeasureToGeometryResponse> {
  let gdbVersion = ''
  const originDs: FeatureLayerDataSource = networkDS as FeatureLayerDataSource
  gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  // Get LRS server endpoint.
  const url = networkInfo.networkUrl
  const REST = `${url}/measureToGeometry`
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  const location = [
    {
      routeId: routeId,
      fromMeasure: startRange,
      toMeasure: endRange
    }
  ]

  const params = {
    f: 'json',
    token: token,
    locations: location,
    temporalViewDate: !isDefined(temporalViewDate) || temporalViewDate.valueOf() === 0 ? '' : temporalViewDate,
    gdbVersion: gdbVersion
  }

  // Perform measure to geometry REST request.
  const response = await requestService({ method: 'POST', url: REST, params: params })
  .then((results: MeasureToGeometryResponse) => {
    return results
  })
  .catch((error) => {
    console.error('Error in getGeometryToMeasure:', error)
    throw new Error(error)
  })

  return response
}

export async function getGeometryToMeasureSingle (measure:number, networkDS: DataSource,
    networkInfo: ImmutableObject<NetworkInfo>, routeId: string, temporalViewDate: Date): Promise<MeasureToGeometryResponse> {
  let gdbVersion = ''
  const originDs: FeatureLayerDataSource = networkDS as FeatureLayerDataSource
  gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  // Get LRS server endpoint.
  const url = networkInfo.networkUrl
  const REST = `${url}/measureToGeometry`
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  const location = [
    {
      routeId: routeId,
      measure: measure
    }
  ]

  const params = {
    f: 'json',
    token: token,
    locations: location,
    temporalViewDate: !isDefined(temporalViewDate) || temporalViewDate.valueOf() === 0 ? '' : temporalViewDate,
    gdbVersion: gdbVersion
  }

  // Perform measure to geometry REST request.
  const response = await requestService({ method: 'POST', url: REST, params: params })
  .then((results: MeasureToGeometryResponse) => {
    return results
  })
  .catch((error) => {
    console.error('Error in getGeometryToMeasure:', error)
    throw new Error(error)
  })

  return response
}

export function addGraphicsToMap (fromM: number, toM: number, startPoint: __esri.Point, endPoint: __esri.Point, highlightGraphicLayer: GraphicsLayer): void {
    const startPinSymbol = {
      type: "cim",
      data: {
        type: "CIMSymbolReference",
        symbol: {
          "type": "CIMPointSymbol",
          "symbolLayers": [
            {
              "type": "CIMVectorMarker",
              "enable": true,
              "size": 10,
              "colorLocked": true,
              "anchorPointUnits": "Relative",
              "frame": {
                "xmin": -5,
                "ymin": -5,
                "xmax": 5,
                "ymax": 5
              },
              "markerGraphics": [
                {
                  "type": "CIMMarkerGraphic",
                  "geometry": {
                    "x": 0,
                    "y": 0
                  },
                  "symbol": {
                    "type": "CIMTextSymbol",
                    "fontFamilyName": "Arial",
                    "fontStyleName": "Bold",
                    "height": 10,
                    "horizontalAlignment": "Center",
                    "offsetX": 0,
                    "offsetY": 23,
                    "symbol": {
                      "type": "CIMPolygonSymbol",
                      "symbolLayers": [
                        {
                          "type": "CIMSolidFill",
                          "enable": true,
                          "color": [
                            0,
                            0,
                            0,
                            255
                          ]
                        }
                      ]
                    },
                    "verticalAlignment": "Bottom",
                    "haloSize": 1.5,
                    "haloSymbol": {
                      "type": "CIMPolygonSymbol",
                      "symbolLayers": [
                        {
                          "type": "CIMSolidFill",
                          "enable": true,
                          "color": [255, 255, 255, 255] // White halo
                        }
                      ]
                    }
                  },
                  "textString": fromM.toString()
                }
              ],
              "scaleSymbolsProportionally": true,
              "respectFrame": true
            },
            {
              "type": "CIMVectorMarker",
              "enable": true,
              "anchorPoint": {
                "x": 0,
                "y": 0,
                "z": 0
              },
              "anchorPointUnits": "Relative",
              "dominantSizeAxis3D": "Y",
              "size": 25,
              "billboardMode3D": "FaceNearPlane",
              "frame": {
                "xmin": 0,
                "ymin": 0,
                "xmax": 66,
                "ymax": 133
              },
              "markerGraphics": [
                {
                  "type": "CIMMarkerGraphic",
                  "geometry": {
                    "rings": [
                      [
                        [
                          33,
                          132
                        ],
                        [
                          25.4,
                          131.6
                        ],
                        [
                          18.8,
                          130.3
                        ],
                        [
                          13.1,
                          128.2
                        ],
                        [
                          8.5,
                          125.3
                        ],
                        [
                          4.9,
                          121.5
                        ],
                        [
                          2.4,
                          117
                        ],
                        [
                          0.8,
                          111.6
                        ],
                        [
                          0.3,
                          105.4
                        ],
                        [
                          0.3,
                          35.8
                        ],
                        [
                          33,
                          1
                        ],
                        [
                          65.8,
                          35.8
                        ],
                        [
                          65.8,
                          105.4
                        ],
                        [
                          65.3,
                          111.6
                        ],
                        [
                          63.7,
                          117
                        ],
                        [
                          61.2,
                          121.5
                        ],
                        [
                          57.5,
                          125.3
                        ],
                        [
                          52.9,
                          128.2
                        ],
                        [
                          47.3,
                          130.3
                        ],
                        [
                          40.6,
                          131.6
                        ],
                        [
                          33,
                          132
                        ]
                      ],
                      [
                        [
                          33,
                          73
                        ],
                        [
                          29.9,
                          73.3
                        ],
                        [
                          26.8,
                          74.1
                        ],
                        [
                          24,
                          75.5
                        ],
                        [
                          21.4,
                          77.3
                        ],
                        [
                          19.2,
                          79.5
                        ],
                        [
                          17.4,
                          82.1
                        ],
                        [
                          16.1,
                          84.9
                        ],
                        [
                          15.3,
                          88
                        ],
                        [
                          15,
                          91.1
                        ],
                        [
                          16.3,
                          98.1
                        ],
                        [
                          20.2,
                          104.1
                        ],
                        [
                          26,
                          108.1
                        ],
                        [
                          33,
                          109.5
                        ],
                        [
                          35.9,
                          109.3
                        ],
                        [
                          38.6,
                          108.6
                        ],
                        [
                          41.3,
                          107.5
                        ],
                        [
                          43.7,
                          105.9
                        ],
                        [
                          45.8,
                          104.1
                        ],
                        [
                          47.7,
                          101.9
                        ],
                        [
                          49.1,
                          99.4
                        ],
                        [
                          50.2,
                          96.7
                        ],
                        [
                          50.8,
                          94
                        ],
                        [
                          51,
                          91.1
                        ],
                        [
                          50.7,
                          88
                        ],
                        [
                          49.9,
                          84.9
                        ],
                        [
                          48.6,
                          82.1
                        ],
                        [
                          46.8,
                          79.5
                        ],
                        [
                          44.6,
                          77.3
                        ],
                        [
                          42,
                          75.5
                        ],
                        [
                          39.2,
                          74.1
                        ],
                        [
                          36.1,
                          73.3
                        ],
                        [
                          33,
                          73
                        ]
                      ]
                    ]
                  },
                  "symbol": {
                    "type": "CIMPolygonSymbol",
                    "symbolLayers": [
                      {
                        "type": "CIMSolidFill",
                        "enable": true,
                        "color": [
                          0,
                          196,
                          255,
                          255
                        ]
                      }
                    ]
                  }
                }
              ],
              "scaleSymbolsProportionally": true,
              "respectFrame": true,
              "clippingPath": {
                "type": "CIMClippingPath",
                "clippingType": "Intersect",
                "path": {
                  "rings": [
                    [
                      [
                        0,
                        0
                      ],
                      [
                        66,
                        0
                      ],
                      [
                        66,
                        133
                      ],
                      [
                        0,
                        133
                      ],
                      [
                        0,
                        0
                      ]
                    ]
                  ]
                }
              },
              "offsetY": 10
            }
          ],
          "animations": []
        }
      }
    }

    const endPinSymbol = {
        type: "cim",
        data: {
          type: "CIMSymbolReference",
          symbol: {
            "type": "CIMPointSymbol",
            "symbolLayers": [
              {
                "type": "CIMVectorMarker",
                "enable": true,
                "anchorPoint": {
                  "x": 0,
                  "y": 0,
                  "z": 0
                },
                "anchorPointUnits": "Relative",
                "dominantSizeAxis3D": "Y",
                "size": 25,
                "billboardMode3D": "FaceNearPlane",
                "frame": {
                  "xmin": 0,
                  "ymin": 0,
                  "xmax": 66,
                  "ymax": 133
                },
                "markerGraphics": [
                  {
                    "type": "CIMMarkerGraphic",
                    "geometry": {
                      "rings": [
                        [
                          [
                            33,
                            132
                          ],
                          [
                            25.4,
                            131.6
                          ],
                          [
                            18.8,
                            130.3
                          ],
                          [
                            13.1,
                            128.2
                          ],
                          [
                            8.5,
                            125.3
                          ],
                          [
                            4.9,
                            121.5
                          ],
                          [
                            2.4,
                            117
                          ],
                          [
                            0.8,
                            111.6
                          ],
                          [
                            0.3,
                            105.4
                          ],
                          [
                            0.3,
                            35.8
                          ],
                          [
                            33,
                            1
                          ],
                          [
                            65.8,
                            35.8
                          ],
                          [
                            65.8,
                            105.4
                          ],
                          [
                            65.3,
                            111.6
                          ],
                          [
                            63.7,
                            117
                          ],
                          [
                            61.2,
                            121.5
                          ],
                          [
                            57.5,
                            125.3
                          ],
                          [
                            52.9,
                            128.2
                          ],
                          [
                            47.3,
                            130.3
                          ],
                          [
                            40.6,
                            131.6
                          ],
                          [
                            33,
                            132
                          ]
                        ],
                        [
                          [
                            33,
                            73
                          ],
                          [
                            29.9,
                            73.3
                          ],
                          [
                            26.8,
                            74.1
                          ],
                          [
                            24,
                            75.5
                          ],
                          [
                            21.4,
                            77.3
                          ],
                          [
                            19.2,
                            79.5
                          ],
                          [
                            17.4,
                            82.1
                          ],
                          [
                            16.1,
                            84.9
                          ],
                          [
                            15.3,
                            88
                          ],
                          [
                            15,
                            91.1
                          ],
                          [
                            16.3,
                            98.1
                          ],
                          [
                            20.2,
                            104.1
                          ],
                          [
                            26,
                            108.1
                          ],
                          [
                            33,
                            109.5
                          ],
                          [
                            35.9,
                            109.3
                          ],
                          [
                            38.6,
                            108.6
                          ],
                          [
                            41.3,
                            107.5
                          ],
                          [
                            43.7,
                            105.9
                          ],
                          [
                            45.8,
                            104.1
                          ],
                          [
                            47.7,
                            101.9
                          ],
                          [
                            49.1,
                            99.4
                          ],
                          [
                            50.2,
                            96.7
                          ],
                          [
                            50.8,
                            94
                          ],
                          [
                            51,
                            91.1
                          ],
                          [
                            50.7,
                            88
                          ],
                          [
                            49.9,
                            84.9
                          ],
                          [
                            48.6,
                            82.1
                          ],
                          [
                            46.8,
                            79.5
                          ],
                          [
                            44.6,
                            77.3
                          ],
                          [
                            42,
                            75.5
                          ],
                          [
                            39.2,
                            74.1
                          ],
                          [
                            36.1,
                            73.3
                          ],
                          [
                            33,
                            73
                          ]
                        ]
                      ]
                    },
                    "symbol": {
                      "type": "CIMPolygonSymbol",
                      "symbolLayers": [
                        {
                          "type": "CIMSolidFill",
                          "enable": true,
                          "color": [
                            255,
                            127,
                            0,
                            255
                          ]
                        }
                      ]
                    }
                  }
                ],
                "scaleSymbolsProportionally": true,
                "respectFrame": true,
                "offsetY": 10,
                "clippingPath": {
                  "type": "CIMClippingPath",
                  "clippingType": "Intersect",
                  "path": {
                    "rings": [
                      [
                        [
                          0,
                          0
                        ],
                        [
                          66,
                          0
                        ],
                        [
                          66,
                          133
                        ],
                        [
                          0,
                          133
                        ],
                        [
                          0,
                          0
                        ]
                      ]
                    ]
                  }
                }
              },
              {
                "type": "CIMVectorMarker",
                "enable": true,
                "size": 10,
                "colorLocked": true,
                "anchorPointUnits": "Relative",
                "frame": {
                  "xmin": -5,
                  "ymin": -5,
                  "xmax": 5,
                  "ymax": 5
                },
                "markerGraphics": [
                  {
                    "type": "CIMMarkerGraphic",
                    "geometry": {
                      "x": 0,
                      "y": 0
                    },
                    "symbol": {
                      "type": "CIMTextSymbol",
                      "fontFamilyName": "Arial",
                      "fontStyleName": "Bold",
                      "height": 10,
                      "horizontalAlignment": "Center",
                      "offsetX": 0,
                      "offsetY": 23,
                      "symbol": {
                        "type": "CIMPolygonSymbol",
                        "symbolLayers": [
                          {
                            "type": "CIMSolidFill",
                            "enable": true,
                            "color": [
                              0,
                              0,
                              0,
                              255
                            ]
                          }
                        ]
                      },
                      "verticalAlignment": "Bottom",
                      "haloSize": 1.5,
                      "haloSymbol": {
                        "type": "CIMPolygonSymbol",
                        "symbolLayers": [
                          {
                            "type": "CIMSolidFill",
                            "enable": true,
                            "color": [255, 255, 255, 255] // White halo
                          }
                        ]
                      },
                      "strikethrough": false,
                      "underline": false,
                      "angle": 0
                    },
                    "textString": toM.toString()
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
      geometry: startPoint,
      symbol: startPinSymbol as CIMSymbol
    })

    const graphicEnd = new Graphic({
      geometry: endPoint,
      symbol: endPinSymbol as CIMSymbol
    })

    highlightGraphicLayer.addMany([graphic, graphicEnd])

}

export function zoomToGeometry (results: MeasureToGeometryResponse, jimuMapView: JimuMapView, highlightGraphicLayer: GraphicsLayer,
  startRange: number, endRange: number
): Promise<boolean> {
  const { locations, spatialReference } = results
  const geometry = locations[0].geometry
  if (geometry) geometry.spatialReference = spatialReference
  const polyline = new Polyline(geometry)
  return geometryUtils.projectToSpatialReference([polyline], jimuMapView.view.spatialReference)
  .then((geometryInSR) => {
    const graphicInSR = new Graphic({
      geometry: geometryInSR[0]
    })
    const expandExtent = graphicInSR.geometry.extent.expand(1.25)
    // reduce extent when we move the map 0.75
    return jimuMapView?.view.goTo({ center: expandExtent })
    .then(()=> {
      const startPoint = polyline.getPoint(0, 0)
      const endPoint = polyline.getPoint(0, polyline.paths[0].length - 1)
      addGraphicsToMap(round(startRange, 3), round(endRange, 3) , startPoint, endPoint, highlightGraphicLayer)
      return true
    })
    .catch((error) => {
      console.error('Error in measureToGeometry:', error)
      return true
    })
    })
    .catch((error) => {
      console.error('Error in zoomToGeometry:', error)
      return true
    })
}