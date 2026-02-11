import {
  getMapViewFromDataSource,
  createOrGetGraphicsLayer,
  addHighlightGraphics,
  removeHighlightGraphics,
  clearGraphicsLayer,
  cleanupGraphicsLayer
} from '../src/runtime/graphics-layer-utils'
import type { FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { DataSourceManager } from 'jimu-core'

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({
    log: jest.fn()
  }),
  highlightConfigManager: {
    getFillColor: jest.fn().mockReturnValue([128, 0, 128]),
    getFillOpacity: jest.fn().mockReturnValue(0.4),
    getOutlineColor: jest.fn().mockReturnValue([255, 255, 255]),
    getOutlineOpacity: jest.fn().mockReturnValue(1.0),
    getOutlineWidth: jest.fn().mockReturnValue(2),
    getPointSize: jest.fn().mockReturnValue(8),
    getPointOutlineWidth: jest.fn().mockReturnValue(2),
    getPointStyle: jest.fn().mockReturnValue('circle')
  }
}))

// Mock jimu-arcgis
jest.mock('jimu-arcgis', () => ({
  loadArcGISJSAPIModules: jest.fn((modules) => {
    if (modules.includes('esri/layers/GraphicsLayer')) {
      return Promise.resolve([
        class MockGraphicsLayer {
          id: string
          title: string
          listMode: string
          visible: boolean
          constructor(props: any) {
            this.id = props.id
            this.title = props.title
            this.listMode = props.listMode
            this.visible = props.visible
          }
        }
      ])
    }
    if (modules.includes('esri/Graphic')) {
      return Promise.resolve([
        class MockGraphic {
          geometry: any
          symbol: any
          attributes: any
          constructor(props: any) {
            this.geometry = props.geometry
            this.symbol = props.symbol
            this.attributes = props.attributes
          }
        }
      ])
    }
    return Promise.resolve([])
  })
}))

describe('graphics-layer-utils unit tests', () => {
  let mockOutputDS: any
  let mockOriginDS: any
  let mockMapView: any
  let mockGraphicsLayer: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockMapView = {
      type: '2d',
      map: {
        layers: {
          find: jest.fn(),
          toArray: jest.fn().mockReturnValue([]),
          length: 0
        },
        add: jest.fn(),
        remove: jest.fn(),
        reorder: jest.fn()
      },
      spatialReference: { wkid: 3857 }
    }
    
    mockGraphicsLayer = {
      id: 'querysimple-highlight-widget_1',
      graphics: [],
      add: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
      destroy: jest.fn()
    }
    
    const mockLayer = {
      id: 'layer_1',
      type: 'feature',
      parent: {
        type: 'map',
        view: mockMapView
      }
    }
    
    mockOriginDS = {
      id: 'origin_ds_1',
      layer: mockLayer,
      getLayer: jest.fn().mockReturnValue(mockLayer)
    } as any
    
    mockOutputDS = {
      id: 'widget_1_output_q1',
      getOriginDataSources: jest.fn().mockReturnValue([mockOriginDS])
    }
  })
  
  describe('getMapViewFromDataSource', () => {
    it('should return null if no outputDS provided', async () => {
      const result = await getMapViewFromDataSource(null)
      expect(result).toBeNull()
    })
    
    it('should return null if no origin data source', async () => {
      mockOutputDS.getOriginDataSources = jest.fn().mockReturnValue([])
      const result = await getMapViewFromDataSource(mockOutputDS)
      expect(result).toBeNull()
    })
    
    it('should return null if origin DS has no layer', async () => {
      mockOriginDS.layer = null
      mockOriginDS.getLayer = jest.fn().mockReturnValue(null)
      
      const result = await getMapViewFromDataSource(mockOutputDS)
      expect(result).toBeNull()
    })
    
    it('should get view from layer.parent.view', async () => {
      const result = await getMapViewFromDataSource(mockOutputDS)
      expect(result).toBe(mockMapView)
    })
    
    it('should get view from layer.view if available', async () => {
      mockOriginDS.layer.parent = null
      mockOriginDS.layer.view = mockMapView
      
      const result = await getMapViewFromDataSource(mockOutputDS)
      expect(result).toBe(mockMapView)
    })
    
    it('should get view from layer.parent.map if parent.view not available', async () => {
      const parentMap = {
        view: mockMapView
      }
      mockOriginDS.layer.parent = {
        type: 'group',
        view: null,
        map: parentMap
      }
      
      const result = await getMapViewFromDataSource(mockOutputDS)
      expect(result).toBe(mockMapView)
    })
    
    it('should handle error gracefully', async () => {
      mockOutputDS.getOriginDataSources = jest.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      
      const result = await getMapViewFromDataSource(mockOutputDS)
      expect(result).toBeNull()
    })
  })
  
  describe('createOrGetGraphicsLayer', () => {
    it('should return existing layer if found', async () => {
      mockMapView.map.layers.find = jest.fn().mockReturnValue(mockGraphicsLayer)
      
      const result = await createOrGetGraphicsLayer('widget_1', mockMapView)
      
      expect(result).toBe(mockGraphicsLayer)
      expect(mockMapView.map.add).not.toHaveBeenCalled()
    })
    
    it('should create new layer if not found', async () => {
      mockMapView.map.layers.find = jest.fn().mockReturnValue(null)
      
      const result = await createOrGetGraphicsLayer('widget_1', mockMapView)
      
      expect(result).toBeDefined()
      expect(result.id).toBe('querysimple-highlight-widget_1')
      expect(mockMapView.map.add).toHaveBeenCalled()
    })
    
    it('should add new layer at the end', async () => {
      mockMapView.map.layers.find = jest.fn().mockReturnValue(null)
      mockMapView.map.layers.length = 5
      
      await createOrGetGraphicsLayer('widget_1', mockMapView)
      
      expect(mockMapView.map.add).toHaveBeenCalledWith(expect.any(Object), 5)
    })
    
    it('should return null on error', async () => {
      mockMapView.map.add = jest.fn().mockImplementation(() => {
        throw new Error('Add failed')
      })
      mockMapView.map.layers.find = jest.fn().mockReturnValue(null)
      
      const result = await createOrGetGraphicsLayer('widget_1', mockMapView)
      
      expect(result).toBeNull()
    })
  })
  
  describe('addHighlightGraphics', () => {
    beforeEach(() => {
      mockGraphicsLayer.graphics = []
      mockGraphicsLayer.graphics.length = 0
      mockGraphicsLayer.graphics.forEach = jest.fn()
      mockMapView.map.layers.toArray = jest.fn().mockReturnValue([mockGraphicsLayer])
    })
    
    it('should exit early if no graphics layer', async () => {
      await addHighlightGraphics(null, [], mockMapView)
      
      expect(mockGraphicsLayer.add).not.toHaveBeenCalled()
    })
    
    it('should exit early if no records', async () => {
      await addHighlightGraphics(mockGraphicsLayer, [], mockMapView)
      
      expect(mockGraphicsLayer.add).not.toHaveBeenCalled()
    })
    
    it('should add graphics for each record', async () => {
      const mockRecords: FeatureDataRecord[] = [
        {
          getId: () => '1',
          feature: {
            geometry: { type: 'point', x: 100, y: 200 },
            attributes: { __queryConfigId: 'q1' }
          }
        } as any,
        {
          getId: () => '2',
          feature: {
            geometry: { type: 'polygon' },
            attributes: { __queryConfigId: 'q1' }
          }
        } as any
      ]
      
      await addHighlightGraphics(mockGraphicsLayer, mockRecords, mockMapView)
      
      expect(mockGraphicsLayer.add).toHaveBeenCalledTimes(2)
    })
    
    it('should skip records without geometry', async () => {
      const mockRecords: FeatureDataRecord[] = [
        {
          getId: () => '1',
          feature: {
            geometry: null,
            attributes: {}
          }
        } as any,
        {
          getId: () => '2',
          feature: {
            geometry: { type: 'point', x: 100, y: 200 },
            attributes: {}
          }
        } as any
      ]
      
      await addHighlightGraphics(mockGraphicsLayer, mockRecords, mockMapView)
      
      expect(mockGraphicsLayer.add).toHaveBeenCalledTimes(1)
    })
    
    it('should reorder graphics layer to top after adding', async () => {
      mockMapView.map.layers.toArray = jest.fn().mockReturnValue([
        { id: 'layer_1' },
        mockGraphicsLayer,
        { id: 'layer_2' }
      ])
      
      const mockRecords: FeatureDataRecord[] = [
        {
          getId: () => '1',
          feature: {
            geometry: { type: 'point', x: 100, y: 200 },
            attributes: {}
          }
        } as any
      ]
      
      await addHighlightGraphics(mockGraphicsLayer, mockRecords, mockMapView)
      
      expect(mockMapView.map.reorder).toHaveBeenCalledWith(mockGraphicsLayer, 2)
    })
  })
  
  describe('removeHighlightGraphics', () => {
    beforeEach(() => {
      mockGraphicsLayer.graphics = [
        {
          attributes: { recordId: '1', queryConfigId: 'q1' }
        },
        {
          attributes: { recordId: '2', queryConfigId: 'q1' }
        },
        {
          attributes: { recordId: '3', queryConfigId: 'q2' }
        }
      ]
      mockGraphicsLayer.graphics.forEach = jest.fn((callback: any) => {
        // Call the actual array forEach (not the mocked one)
        Array.prototype.forEach.call(mockGraphicsLayer.graphics, callback)
      })
    })
    
    it('should exit early if no graphics layer', () => {
      removeHighlightGraphics(null, ['1'])
      
      expect(mockGraphicsLayer.remove).not.toHaveBeenCalled()
    })
    
    it('should exit early if no record IDs', () => {
      removeHighlightGraphics(mockGraphicsLayer, [])
      
      expect(mockGraphicsLayer.remove).not.toHaveBeenCalled()
    })
    
    it('should remove graphics by recordId (simple matching)', () => {
      removeHighlightGraphics(mockGraphicsLayer, ['1', '2'])
      
      expect(mockGraphicsLayer.remove).toHaveBeenCalledTimes(2)
    })
    
    it('should remove graphics by composite key if records provided', () => {
      const mockRecords: FeatureDataRecord[] = [
        {
          getId: () => '1',
          feature: {
            attributes: { __queryConfigId: 'q1' }
          }
        } as any
      ]
      
      removeHighlightGraphics(mockGraphicsLayer, ['1'], mockRecords)
      
      // Should only remove the graphic with recordId='1' AND queryConfigId='q1'
      // Not the one with recordId='1' and queryConfigId='q2'
      expect(mockGraphicsLayer.remove).toHaveBeenCalledTimes(1)
    })
  })
  
  describe('clearGraphicsLayer', () => {
    it('should exit early if no graphics layer', () => {
      clearGraphicsLayer(null)
      
      expect(mockGraphicsLayer.removeAll).not.toHaveBeenCalled()
    })
    
    it('should remove all graphics', () => {
      clearGraphicsLayer(mockGraphicsLayer)
      
      expect(mockGraphicsLayer.removeAll).toHaveBeenCalled()
    })
  })
  
  describe('cleanupGraphicsLayer', () => {
    beforeEach(() => {
      mockMapView.map.layers.find = jest.fn().mockReturnValue(mockGraphicsLayer)
      mockGraphicsLayer.graphics.length = 5
    })
    
    it('should find and remove graphics layer', () => {
      cleanupGraphicsLayer('widget_1', mockMapView)
      
      expect(mockMapView.map.layers.find).toHaveBeenCalled()
      expect(mockGraphicsLayer.removeAll).toHaveBeenCalled()
      expect(mockMapView.map.remove).toHaveBeenCalledWith(mockGraphicsLayer)
      expect(mockGraphicsLayer.destroy).toHaveBeenCalled()
    })
    
    it('should do nothing if layer not found', () => {
      mockMapView.map.layers.find = jest.fn().mockReturnValue(null)
      
      cleanupGraphicsLayer('widget_1', mockMapView)
      
      expect(mockGraphicsLayer.removeAll).not.toHaveBeenCalled()
      expect(mockMapView.map.remove).not.toHaveBeenCalled()
    })
    
    it('should handle error gracefully', () => {
      mockMapView.map.remove = jest.fn().mockImplementation(() => {
        throw new Error('Remove failed')
      })
      
      cleanupGraphicsLayer('widget_1', mockMapView)
      
      // Should not throw
    })
  })
})
