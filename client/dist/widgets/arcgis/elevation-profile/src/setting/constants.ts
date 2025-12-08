import { getUniqueElevationLayersId } from '../common/utils'
import defaultMessages from './translations/default'

const infoIcon = require('jimu-icons/svg/outlined/suggested/info.svg')
const iconClose = require('jimu-icons/svg/outlined/editor/close.svg')
const iconBack = require('jimu-icons/svg/outlined/directional/left.svg')

export const getConfigIcon = () => ({
  epConfigIcon: {
    infoIcon,
    iconClose,
    iconBack
  }
})

export const enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple'
}

export const defaultElevationLayer = 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'

export const unitOptions = [
  {
    value: 'meters'
  },
  {
    value: 'feet'
  },
  {
    value: 'kilometers'
  },
  {
    value: 'miles'
  },
  {
    value: 'yards'
  }
]

export const selectableLayersElevationType = [
  {
    value: 'no elevation', name: 'noElevation'
  },
  {
    value: 'z', name: 'zValue'
  },
  {
    value: 'one', name: 'oneField'
  },
  {
    value: 'two', name: 'twoField'
  }
]

export const selectableLayersElevationTypeWithoutZ = [
  {
    value: 'no elevation', name: 'noElevation'
  },
  {
    value: 'one', name: 'oneField'
  },
  {
    value: 'two', name: 'twoField'
  }
]

export const intersectingLayersElevationType = [
  {
    value: 'no elevation', name: 'noElevation'
  },
  {
    value: 'z', name: 'zValue'
  },
  {
    value: 'one', name: 'oneField'
  },
  {
    value: 'two', name: 'twoField'
  },
  {
    value: 'match profile', name: 'matchProfile'
  }
]

export const intersectingLayersElevationTypeWithoutZ = [
  {
    value: 'no elevation', name: 'noElevation'
  },
  {
    value: 'one', name: 'oneField'
  },
  {
    value: 'two', name: 'twoField'
  },
  {
    value: 'match profile', name: 'matchProfile'
  }
]

export const projectionOptions = [
  {
    value: 'map', name: 'mapProjection'
  },
  {
    value: 'field', name: 'sourceField'
  }
]

export const chartSymbolOptions = [
  {
    value: 'map', name: 'mapLabel'
  },
  {
    value: 'custom', name: 'customLabel'
  }
]

export const epStatistics = [
  {
    value: 'maxDistance', label: defaultMessages.maxDistance
  },
  {
    value: 'minElevation', label: defaultMessages.minElevation
  },
  {
    value: 'maxElevation', label: defaultMessages.maxElevation
  },
  {
    value: 'avgElevation', label: defaultMessages.avgElevation
  },
  {
    value: 'elevationGain', label: defaultMessages.elevationGain
  },
  {
    value: 'elevationLoss', label: defaultMessages.elevationLoss
  },
  {
    value: 'maxPositiveSlope', label: defaultMessages.maxPositiveSlope
  },
  {
    value: 'maxNegativeSlope', label: defaultMessages.maxNegativeSlope
  },
  {
    value: 'avgPositiveSlope', label: defaultMessages.avgPositiveSlope
  },
  {
    value: 'avgNegativeSlope', label: defaultMessages.avgNegativeSlope
  }
]

export const onWidgetLoadOptions = [
  {
    value: 'none', name: 'none'
  },
  {
    value: 'select line', name: 'selectTool'
  },
  {
    value: 'draw profile', name: 'drawTool'
  }
]

export const selectionModeOptions = [
  {
    value: 'single', name: 'singleSelectionMode'
  },
  {
    value: 'multiple', name: 'multipleSelectionMode'
  }
]

export const presetColors = [
  { label: '#00FFFF', value: '#00FFFF', color: '#00FFFF' },
  { label: '#FF9F0A', value: '#FF9F0A', color: '#FF9F0A' },
  { label: '#089BDC', value: '#089BDC', color: '#089BDC' },
  { label: '#FFD159', value: '#FFD159', color: '#FFD159' },
  { label: '#74B566', value: '#74B566', color: '#74B566' },
  { label: '#FF453A', value: '#FF453A', color: '#FF453A' },
  { label: '#9868ED', value: '#9868ED', color: '#9868ED' },
  { label: '#43ABEB', value: '#43ABEB', color: '#43ABEB' }
]

export const defaultConfiguration = {
  elevationLayersSettings: {
    addedElevationLayers: [],
    groundLayerId: '',
    linearUnit: '',
    elevationUnit: '',
    showVolumetricObjLineInGraph: true,
    volumetricObjSettingsOptions: {
      id: getUniqueElevationLayersId(),
      style: {
        lineType: 'solid-line',
        lineColor: '#cf4ccf',
        lineThickness: 2
      },
      volumetricObjLabel: defaultMessages.volumetricObjectsLabel,
      displayStatistics: true,
      selectedStatistics: []
    }
  },
  profileSettings: {
    isProfileSettingsEnabled: false,
    isCustomizeOptionEnabled: false,
    layers: [],
    selectionModeOptions: {
      selectionMode: 'multiple',
      style: {
        lineType: 'dotted-line',
        lineColor: '#fcfc03',
        lineThickness: 3
      }
    },
    supportAddedLayers: false
  },
  assetSettings: {
    isAssetSettingsEnabled: false,
    layers: [],
    assetIntersectingBuffer: {
      enabled: false,
      bufferDistance: 10,
      bufferUnits: '',
      bufferSymbol: {
        type: 'esriSFS',
        color: [239, 132, 38, 128],
        outline: {
          type: 'esriSLS',
          color: [184, 115, 59, 255],
          width: 1.5,
          style: 'esriSLSSolid'
        },
        style: 'esriSFSSolid'
      }
    }
  }
}

export const defaultElevationLayersStyle = {
  lineType: 'solid-line',
  lineColor: '#b54900',
  lineThickness: 2
}

export const defaultElevationLayerSettings = {
  id: '',
  useDataSource: null,
  label: '',
  elevationLayerUrl: '',
  style: defaultElevationLayersStyle,
  displayStatistics: false,
  selectedStatistics: []
}

export const defaultProfileSettings = {
  layerId: '',
  elevationSettings: {
    type: '',
    unit: '',
    field1: '',
    field2: ''
  },
  distanceSettings: {
    type: 'map',
    field: '',
    unit: ''
  },
  style: {
    lineType: 'solid-line',
    lineColor: '',
    lineThickness: 3
  }
}

export const defaultAssetSettings = {
  layerId: '',
  elevationSettings: {
    type: '',
    unit: '',
    field1: '',
    field2: ''
  },
  displayField: '',
  style: {
    type: 'custom',
    intersectingAssetShape: '',
    intersectingAssetSize: 0,
    intersectingAssetColor: ''
  }
}

export const lineTypeList = [
  { value: 'solid-line', label: 'solid' },
  { value: 'dotted-line', label: 'dotted' },
  { value: 'dashed-line', label: 'dashed' }
]

export const intersectingAssetShapeList = [
  { value: 'triangle', label: 'assetTriangle' },
  { value: 'rectangle', label: 'assetRectangle' },
  { value: 'circle', label: 'assetCircle' },
  { value: 'square', label: 'assetSquare' }
]
