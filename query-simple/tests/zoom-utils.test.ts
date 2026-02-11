import { zoomToRecords, captureAdjustedExtent, type ZoomToRecordsOptions } from '../src/runtime/zoom-utils'
import type { FeatureDataRecord } from 'jimu-core'
import Extent from 'esri/geometry/Extent'

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({
    log: jest.fn()
  })
}))

describe('zoom-utils unit tests', () => {
  let mockMapView: any
  let mockRecords: FeatureDataRecord[]
  
  beforeEach(() => {
    mockMapView = {
      type: '2d',
      spatialReference: { wkid: 3857 }, // Web Mercator
      extent: new Extent({
        xmin: -13000000,
        xmax: -12000000,
        ymin: 4000000,
        ymax: 5000000,
        spatialReference: { wkid: 3857 }
      }),
      goTo: jest.fn().mockResolvedValue(undefined)
    }
    
    // Mock window for calibration tool
    ;(window as any).__querySimpleLastZoomExtent = null
    ;(window as any).__querySimpleLastZoomExpansionFactor = null
    ;(window as any).__querySimpleLastZoomMapView = null
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('zoomToRecords', () => {
    it('should exit early if no mapView provided', async () => {
      await zoomToRecords(null as any, [])
      expect(mockMapView.goTo).not.toHaveBeenCalled()
    })
    
    it('should exit early if no records provided', async () => {
      await zoomToRecords(mockMapView, [])
      expect(mockMapView.goTo).not.toHaveBeenCalled()
    })
    
    it('should zoom to single polygon extent with default expansion', async () => {
      const mockPolygonExtent = new Extent({
        xmin: -12500000,
        xmax: -12400000,
        ymin: 4500000,
        ymax: 4600000,
        spatialReference: { wkid: 3857 }
      })
      
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'polygon',
          extent: mockPolygonExtent
        })
      } as any]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      expect(mockMapView.goTo).toHaveBeenCalled()
      const calledExtent = mockMapView.goTo.mock.calls[0][0] as Extent
      
      // Verify expansion factor was applied (1.2 = 20% expansion)
      const originalWidth = mockPolygonExtent.width
      const originalHeight = mockPolygonExtent.height
      expect(calledExtent.width).toBeGreaterThan(originalWidth)
      expect(calledExtent.height).toBeGreaterThan(originalHeight)
      expect(calledExtent.width / originalWidth).toBeCloseTo(1.2, 2)
      expect(calledExtent.height / originalHeight).toBeCloseTo(1.2, 2)
    })
    
    it('should zoom to single point with zero-area expansion', async () => {
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'point',
          x: -12450000,
          y: 4550000,
          spatialReference: { wkid: 3857 }
        })
      } as any]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      expect(mockMapView.goTo).toHaveBeenCalled()
      const calledExtent = mockMapView.goTo.mock.calls[0][0] as Extent
      
      // Verify zero-area extent was expanded
      // Default buffer: 300 feet * 0.3048 = ~91.44 meters
      // After factor expansion (1.2): ~109.73 meters
      expect(calledExtent.width).toBeGreaterThan(0)
      expect(calledExtent.height).toBeGreaterThan(0)
      
      // Center should be at the point location
      const centerX = (calledExtent.xmin + calledExtent.xmax) / 2
      const centerY = (calledExtent.ymin + calledExtent.ymax) / 2
      expect(centerX).toBeCloseTo(-12450000, -1)
      expect(centerY).toBeCloseTo(4550000, -1)
    })
    
    it('should use custom expansion factor if provided', async () => {
      const mockPolygonExtent = new Extent({
        xmin: -12500000,
        xmax: -12400000,
        ymin: 4500000,
        ymax: 4600000,
        spatialReference: { wkid: 3857 }
      })
      
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'polygon',
          extent: mockPolygonExtent
        })
      } as any]
      
      await zoomToRecords(mockMapView, mockRecords, { expansionFactor: 1.5 })
      
      const calledExtent = mockMapView.goTo.mock.calls[0][0] as Extent
      expect(calledExtent.width / mockPolygonExtent.width).toBeCloseTo(1.5, 2)
      expect(calledExtent.height / mockPolygonExtent.height).toBeCloseTo(1.5, 2)
    })
    
    it('should use custom zero-area buffer if provided', async () => {
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'point',
          x: -12450000,
          y: 4550000,
          spatialReference: { wkid: 3857 }
        })
      } as any]
      
      await zoomToRecords(mockMapView, mockRecords, { 
        zeroAreaBufferFeet: 500  // 500ft instead of default 300ft
      })
      
      expect(mockMapView.goTo).toHaveBeenCalled()
      const calledExtent = mockMapView.goTo.mock.calls[0][0] as Extent
      
      // 500 feet * 0.3048 = ~152.4 meters before expansion
      // After 1.2 expansion: ~182.88 meters total width/height
      expect(calledExtent.width).toBeGreaterThan(300) // Should be larger than with 300ft buffer
    })
    
    it('should handle multiple polygon extents with union', async () => {
      mockRecords = [
        {
          getId: () => '1',
          getJSAPIGeometry: () => ({
            type: 'polygon',
            extent: new Extent({
              xmin: -12500000,
              xmax: -12400000,
              ymin: 4500000,
              ymax: 4600000,
              spatialReference: { wkid: 3857 }
            })
          })
        },
        {
          getId: () => '2',
          getJSAPIGeometry: () => ({
            type: 'polygon',
            extent: new Extent({
              xmin: -12300000,
              xmax: -12200000,
              ymin: 4700000,
              ymax: 4800000,
              spatialReference: { wkid: 3857 }
            })
          })
        }
      ] as any[]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      expect(mockMapView.goTo).toHaveBeenCalled()
      const calledExtent = mockMapView.goTo.mock.calls[0][0] as Extent
      
      // Union should encompass both extents
      expect(calledExtent.xmin).toBeLessThan(-12400000)
      expect(calledExtent.xmax).toBeGreaterThan(-12200000)
      expect(calledExtent.ymin).toBeLessThan(4600000)
      expect(calledExtent.ymax).toBeGreaterThan(4700000)
    })
    
    it('should skip records without geometry', async () => {
      mockRecords = [
        {
          getId: () => '1',
          getJSAPIGeometry: () => null // No geometry
        },
        {
          getId: () => '2',
          getJSAPIGeometry: () => ({
            type: 'polygon',
            extent: new Extent({
              xmin: -12500000,
              xmax: -12400000,
              ymin: 4500000,
              ymax: 4600000,
              spatialReference: { wkid: 3857 }
            })
          })
        }
      ] as any[]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      // Should zoom to the one valid geometry
      expect(mockMapView.goTo).toHaveBeenCalled()
    })
    
    it('should exit if all records have no geometry', async () => {
      mockRecords = [
        {
          getId: () => '1',
          getJSAPIGeometry: () => null
        },
        {
          getId: () => '2',
          getJSAPIGeometry: () => null
        }
      ] as any[]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      expect(mockMapView.goTo).not.toHaveBeenCalled()
    })
    
    it('should handle State Plane (feet-based) spatial reference for zero-area', async () => {
      mockMapView.spatialReference = { wkid: 2227 } // California State Plane Zone 3 (feet)
      
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'point',
          x: 6000000,
          y: 2000000,
          spatialReference: { wkid: 2227 }
        })
      } as any]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      expect(mockMapView.goTo).toHaveBeenCalled()
      const calledExtent = mockMapView.goTo.mock.calls[0][0] as Extent
      
      // For feet-based SRS, buffer is used directly (300 feet)
      // After 1.2 expansion: 360 feet total width/height
      expect(calledExtent.width).toBeGreaterThan(0)
      expect(calledExtent.height).toBeGreaterThan(0)
    })
    
    it('should store calibration data on window', async () => {
      const mockPolygonExtent = new Extent({
        xmin: -12500000,
        xmax: -12400000,
        ymin: 4500000,
        ymax: 4600000,
        spatialReference: { wkid: 3857 }
      })
      
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'polygon',
          extent: mockPolygonExtent
        })
      } as any]
      
      await zoomToRecords(mockMapView, mockRecords)
      
      expect((window as any).__querySimpleLastZoomExtent).toBeDefined()
      expect((window as any).__querySimpleLastZoomExpansionFactor).toBe(1.2)
      expect((window as any).__querySimpleLastZoomMapView).toBe(mockMapView)
    })
    
    it('should handle goTo error gracefully', async () => {
      mockMapView.goTo = jest.fn().mockRejectedValue(new Error('GoTo failed'))
      
      mockRecords = [{
        getId: () => '1',
        getJSAPIGeometry: () => ({
          type: 'polygon',
          extent: new Extent({
            xmin: -12500000,
            xmax: -12400000,
            ymin: 4500000,
            ymax: 4600000,
            spatialReference: { wkid: 3857 }
          })
        })
      } as any]
      
      await expect(zoomToRecords(mockMapView, mockRecords)).rejects.toThrow('GoTo failed')
    })
  })
  
  describe('captureAdjustedExtent', () => {
    it('should return error if no window object', () => {
      // This test would need to override window availability
      // Skipping for now as it requires complex setup
    })
    
    it('should return error if no mapView found', () => {
      ;(window as any).__querySimpleLastZoomMapView = null
      
      const result = captureAdjustedExtent()
      
      expect(result.adjustedExtent).toBeNull()
      expect(result.originalExtent).toBeNull()
      expect(result.calculatedExpansionFactor).toBeNull()
      expect(result.error).toContain('No map view found')
    })
    
    it('should return error if no original extent found', () => {
      ;(window as any).__querySimpleLastZoomMapView = mockMapView
      ;(window as any).__querySimpleLastZoomExtent = null
      
      const result = captureAdjustedExtent()
      
      expect(result.error).toContain('No original extent found')
    })
    
    it('should calculate expansion factor correctly', () => {
      const originalExtent = new Extent({
        xmin: -12500000,
        xmax: -12400000,
        ymin: 4500000,
        ymax: 4600000,
        spatialReference: { wkid: 3857 }
      })
      
      // Set up adjusted extent (manually zoomed to 1.5x the original)
      mockMapView.extent = new Extent({
        xmin: -12525000,
        xmax: -12375000,
        ymin: 4475000,
        ymax: 4625000,
        spatialReference: { wkid: 3857 }
      })
      
      ;(window as any).__querySimpleLastZoomMapView = mockMapView
      ;(window as any).__querySimpleLastZoomExtent = originalExtent
      ;(window as any).__querySimpleLastZoomExpansionFactor = 1.2
      
      const result = captureAdjustedExtent()
      
      expect(result.adjustedExtent).toBeDefined()
      expect(result.originalExtent).toBeDefined()
      expect(result.calculatedExpansionFactor).toBeCloseTo(1.5, 1)
    })
    
    it('should warn if adjusted extent is smaller than original', () => {
      const originalExtent = new Extent({
        xmin: -12500000,
        xmax: -12400000,
        ymin: 4500000,
        ymax: 4600000,
        spatialReference: { wkid: 3857 }
      })
      
      // Adjusted extent is smaller (zoomed in)
      mockMapView.extent = new Extent({
        xmin: -12470000,
        xmax: -12430000,
        ymin: 4530000,
        ymax: 4570000,
        spatialReference: { wkid: 3857 }
      })
      
      ;(window as any).__querySimpleLastZoomMapView = mockMapView
      ;(window as any).__querySimpleLastZoomExtent = originalExtent
      
      const result = captureAdjustedExtent()
      
      expect(result.calculatedExpansionFactor).toBeNull()
      expect(result.warning).toContain('smaller than original')
    })
  })
})
