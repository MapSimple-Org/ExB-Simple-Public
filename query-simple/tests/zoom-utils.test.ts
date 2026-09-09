// Mock shared-code/mapsimple-common — use a shared object so we can spy on log()
const mockDebugLogger = { log: jest.fn() }
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger
}))

import { calculateRecordsExtent, expandExtentByFactor } from '../src/runtime/zoom-utils'

// Mock Extent — factory must be self-contained because jest.mock is hoisted
jest.mock('esri/geometry/Extent', () => {
  class MockExtent {
    xmin: number
    xmax: number
    ymin: number
    ymax: number
    spatialReference: { wkid: number } | null

    constructor (props: any) {
      this.xmin = props.xmin ?? 0
      this.xmax = props.xmax ?? 0
      this.ymin = props.ymin ?? 0
      this.ymax = props.ymax ?? 0
      this.spatialReference = props.spatialReference ?? null
    }

    get width () { return Math.abs(this.xmax - this.xmin) }
    get height () { return Math.abs(this.ymax - this.ymin) }

    clone () {
      const Ctor = this.constructor as any
      return new Ctor({
        xmin: this.xmin, xmax: this.xmax,
        ymin: this.ymin, ymax: this.ymax,
        spatialReference: this.spatialReference
      })
    }

    set (props: any) {
      if (props.xmin !== undefined) this.xmin = props.xmin
      if (props.xmax !== undefined) this.xmax = props.xmax
      if (props.ymin !== undefined) this.ymin = props.ymin
      if (props.ymax !== undefined) this.ymax = props.ymax
      return this
    }

    union (other: any) {
      const Ctor = this.constructor as any
      return new Ctor({
        xmin: Math.min(this.xmin, other.xmin),
        xmax: Math.max(this.xmax, other.xmax),
        ymin: Math.min(this.ymin, other.ymin),
        ymax: Math.max(this.ymax, other.ymax),
        spatialReference: this.spatialReference
      })
    }
  }
  return { __esModule: true, default: MockExtent }
})

// Get reference for use in test helpers
const MockExtent = require('esri/geometry/Extent').default

// --- Helpers ---

function createMockRecord (geom: any): any {
  return {
    getJSAPIGeometry: jest.fn().mockReturnValue(geom)
  }
}

function createPointRecord (x: number, y: number, wkid: number = 3857): any {
  return createMockRecord({
    type: 'point',
    x,
    y,
    extent: null,
    spatialReference: { wkid }
  })
}

function createPolygonRecord (xmin: number, ymin: number, xmax: number, ymax: number, wkid: number = 3857): any {
  return createMockRecord({
    type: 'polygon',
    extent: new MockExtent({ xmin, ymin, xmax, ymax, spatialReference: { wkid } })
  })
}

// --- Tests ---

describe('zoom-utils unit tests', () => {
  beforeEach(() => {
    mockDebugLogger.log.mockClear()
  })

  describe('calculateRecordsExtent', () => {
    it('should return null for empty records array', () => {
      const result = calculateRecordsExtent([])
      expect(result).toBeNull()
    })

    it('should return null for null/undefined records', () => {
      const result = calculateRecordsExtent(null as any)
      expect(result).toBeNull()
    })

    it('should return null when all records have no geometry', () => {
      const record = createMockRecord(null)
      const result = calculateRecordsExtent([record])
      expect(result).toBeNull()
    })

    it('should create zero-area extent for a single point record', () => {
      const record = createPointRecord(100, 200, 3857)
      const result = calculateRecordsExtent([record])

      expect(result).not.toBeNull()
      expect(result!.xmin).toBe(100)
      expect(result!.xmax).toBe(100)
      expect(result!.ymin).toBe(200)
      expect(result!.ymax).toBe(200)
      expect(result!.width).toBe(0)
      expect(result!.height).toBe(0)
    })

    it('should union multiple point records into a bounding extent', () => {
      const record1 = createPointRecord(100, 200, 3857)
      const record2 = createPointRecord(300, 400, 3857)
      const result = calculateRecordsExtent([record1, record2])

      expect(result).not.toBeNull()
      expect(result!.xmin).toBe(100)
      expect(result!.xmax).toBe(300)
      expect(result!.ymin).toBe(200)
      expect(result!.ymax).toBe(400)
    })

    it('should handle polygon records with existing extents', () => {
      const record = createPolygonRecord(10, 20, 30, 40)
      const result = calculateRecordsExtent([record])

      expect(result).not.toBeNull()
      expect(result!.xmin).toBe(10)
      expect(result!.xmax).toBe(30)
      expect(result!.ymin).toBe(20)
      expect(result!.ymax).toBe(40)
    })

    it('should union point and polygon records together', () => {
      const point = createPointRecord(5, 5, 3857)
      const polygon = createPolygonRecord(10, 10, 50, 50)
      const result = calculateRecordsExtent([point, polygon])

      expect(result).not.toBeNull()
      expect(result!.xmin).toBe(5)
      expect(result!.xmax).toBe(50)
      expect(result!.ymin).toBe(5)
      expect(result!.ymax).toBe(50)
    })

    it('should filter out records with null geometry', () => {
      const goodRecord = createPointRecord(100, 200)
      const nullRecord = createMockRecord(null)
      const result = calculateRecordsExtent([nullRecord, goodRecord, nullRecord])

      expect(result).not.toBeNull()
      expect(result!.xmin).toBe(100)
      expect(result!.xmax).toBe(100)
    })

    it('should log start and complete events', () => {
      const record = createPointRecord(100, 200)
      calculateRecordsExtent([record])

      expect(mockDebugLogger.log).toHaveBeenCalledWith('ZOOM', expect.objectContaining({
        event: 'calculateRecordsExtent-start'
      }))
      expect(mockDebugLogger.log).toHaveBeenCalledWith('ZOOM', expect.objectContaining({
        event: 'calculateRecordsExtent-complete'
      }))
    })
  })

  describe('expandExtentByFactor', () => {
    it('should expand extent by default factor (1.2)', () => {
      const extent = new MockExtent({
        xmin: 0, xmax: 100, ymin: 0, ymax: 100,
        spatialReference: { wkid: 3857 }
      }) as any

      const result = expandExtentByFactor(extent)

      // Center is (50,50), halfWidth=50, halfHeight=50
      // Expanded: 50 * 1.2 = 60
      // xmin = 50 - 60 = -10, xmax = 50 + 60 = 110
      expect(result.xmin).toBe(-10)
      expect(result.xmax).toBe(110)
      expect(result.ymin).toBe(-10)
      expect(result.ymax).toBe(110)
    })

    it('should expand extent by custom factor', () => {
      const extent = new MockExtent({
        xmin: 0, xmax: 100, ymin: 0, ymax: 100,
        spatialReference: { wkid: 3857 }
      }) as any

      const result = expandExtentByFactor(extent, 2.0)

      // Center is (50,50), halfWidth=50, halfHeight=50
      // Expanded: 50 * 2.0 = 100
      // xmin = 50 - 100 = -50, xmax = 50 + 100 = 150
      expect(result.xmin).toBe(-50)
      expect(result.xmax).toBe(150)
    })

    it('should handle zero-area extent with metric SR (Web Mercator)', () => {
      const extent = new MockExtent({
        xmin: 100, xmax: 100, ymin: 200, ymax: 200,
        spatialReference: { wkid: 3857 }
      }) as any
      const sr = { wkid: 3857 } as any

      const result = expandExtentByFactor(extent, 1.0, sr, 300)

      // Zero-area → buffer by 300ft * 0.3048 = 91.44m
      // Then expansion factor 1.0 = no additional expansion
      // xmin = 100 - 91.44, xmax = 100 + 91.44
      expect(result.xmin).toBeCloseTo(100 - 91.44, 1)
      expect(result.xmax).toBeCloseTo(100 + 91.44, 1)
    })

    it('should handle zero-area extent with feet SR (State Plane)', () => {
      const extent = new MockExtent({
        xmin: 100, xmax: 100, ymin: 200, ymax: 200,
        spatialReference: { wkid: 2227 }
      }) as any
      const sr = { wkid: 2227 } as any

      const result = expandExtentByFactor(extent, 1.0, sr, 300)

      // Zero-area → buffer by 300ft directly (feet-based SR)
      // Then expansion factor 1.0 = no additional expansion
      expect(result.xmin).toBe(100 - 300)
      expect(result.xmax).toBe(100 + 300)
    })

    it('should not apply zero-area buffer when no spatialReference provided', () => {
      const extent = new MockExtent({
        xmin: 100, xmax: 100, ymin: 200, ymax: 200,
        spatialReference: { wkid: 3857 }
      }) as any

      // No spatialReference param → skip zero-area expansion, only apply factor
      const result = expandExtentByFactor(extent, 1.2)

      // Zero-area: width=0, height=0. Factor applied to zero = still zero.
      // Center (100, 200), halfWidth * 1.2 = 0, halfHeight * 1.2 = 0
      expect(result.xmin).toBe(100)
      expect(result.xmax).toBe(100)
    })

    it('should apply factor after zero-area buffer', () => {
      const extent = new MockExtent({
        xmin: 0, xmax: 0, ymin: 0, ymax: 0,
        spatialReference: { wkid: 2227 }
      }) as any
      const sr = { wkid: 2227 } as any

      const result = expandExtentByFactor(extent, 1.2, sr, 100)

      // Step 1: Zero-area buffer → xmin=-100, xmax=100, ymin=-100, ymax=100 (width=200)
      // Step 2: Factor 1.2 → halfWidth = 100, expanded = 120
      //   xmin = 0 - 120 = -120, xmax = 0 + 120 = 120
      expect(result.xmin).toBe(-120)
      expect(result.xmax).toBe(120)
      expect(result.ymin).toBe(-120)
      expect(result.ymax).toBe(120)
    })
  })

  describe('spatial reference validation', () => {
    it('should log warning when extents have mixed spatial references', () => {
      const record1 = createPointRecord(100, 200, 3857)
      const record2 = createPointRecord(300, 400, 2227)

      calculateRecordsExtent([record1, record2])

      expect(mockDebugLogger.log).toHaveBeenCalledWith('ZOOM', expect.objectContaining({
        event: 'calculateRecordsExtent-SR-MISMATCH-WARNING'
      }))
    })

    it('should not warn when all extents have the same spatial reference', () => {
      const record1 = createPointRecord(100, 200, 3857)
      const record2 = createPointRecord(300, 400, 3857)

      calculateRecordsExtent([record1, record2])

      const srWarningCalls = mockDebugLogger.log.mock.calls.filter(
        (call: any[]) => call[1]?.event === 'calculateRecordsExtent-SR-MISMATCH-WARNING'
      )
      expect(srWarningCalls.length).toBe(0)
    })

    it('should not warn for a single record (no union needed)', () => {
      const record = createPointRecord(100, 200, 3857)

      calculateRecordsExtent([record])

      const srWarningCalls = mockDebugLogger.log.mock.calls.filter(
        (call: any[]) => call[1]?.event === 'calculateRecordsExtent-SR-MISMATCH-WARNING'
      )
      expect(srWarningCalls.length).toBe(0)
    })
  })
})
