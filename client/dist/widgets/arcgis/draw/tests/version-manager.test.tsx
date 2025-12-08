import { Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'
import { LayerListMode } from '../src/config'

let upgrader = null

describe('Test for version manager', () => {
  it('1. config update for decimalPlaces ,#13051', () => {
    const oldConfig = Immutable({
      isDisplayCanvasLayer: false,
      arrangement: 'Panel',
      drawMode: 'continuous',
      drawingTools: [
        'point',
        'polyline',
        'polygon',
        'rectangle',
        'circle'
      ],
      measurementsInfo: {
        enableMeasurements: false,
        fontsColor: [0, 0, 0, 1],
        fontsSize: 12,
        haloColor: [255, 255, 255, 1],
        haloSize: 2/*,
        decimalPlaces: {
          point: 5,
          line: 3,
          area: 3
        }*/
      },
      measurementsUnitsInfos: [],
      drawingElevationMode3D: 'on-the-ground'
    })

    upgrader = null
    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.12.0'
    })[0]?.upgrader
    const newConfig = upgrader(oldConfig)

    expect(newConfig.measurementsInfo.decimalPlaces).toStrictEqual({
      point: 5,
      line: 3,
      area: 3
    })
  })

  it('2. for old widget, only support point by default ,#14881', () => {
    const oldConfig = Immutable({
      isDisplayCanvasLayer: false,
      arrangement: 'Panel',
      drawMode: 'continuous',
      drawingTools: [
        'point',
        'polyline',
        'polygon',
        'rectangle',
        'circle'
      ],
      measurementsInfo: {
        enableMeasurements: false,
        fontsColor: [0, 0, 0, 1],
        fontsSize: 12,
        haloColor: [255, 255, 255, 1],
        haloSize: 2,
        decimalPlaces: {
          point: 5,
          line: 3,
          area: 3
        }
      },
      measurementsUnitsInfos: [],
      drawingElevationMode3D: 'on-the-ground'
    })

    upgrader = null
    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.16.0'
    })[0]?.upgrader
    const newConfig = upgrader(oldConfig)

    // 2 layer list mode, main-repo#21204
    expect(newConfig.layerListMode).toStrictEqual(LayerListMode.Hide)
  })
})
