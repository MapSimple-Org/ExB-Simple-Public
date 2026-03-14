// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({ log: jest.fn() })
}))

// Mock jszip (not needed for unit tests of pure functions)
jest.mock('jszip', () => jest.fn())

// Mock jimu-core
jest.mock('jimu-core', () => ({}))

import {
  sanitizeFilename,
  getQueryExportName,
  getOrderedFieldsWithAliases,
  convertToCSV,
  convertToGeoJSON,
  convertToJSON,
  EXPORT_FORMATS
} from '../src/utils/export-utils'

// Helper: jsdom Blob doesn't have .text(), use FileReader.readAsText
async function blobToText (blob: Blob): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(blob)
  })
}

describe('export-utils unit tests', () => {
  describe('sanitizeFilename', () => {
    it('should strip special characters', () => {
      expect(sanitizeFilename('Test@#$File!')).toBe('TestFile')
    })

    it('should replace spaces with underscores', () => {
      expect(sanitizeFilename('My File Name')).toBe('My_File_Name')
    })

    it('should truncate to 50 characters', () => {
      const longName = 'A'.repeat(60)
      expect(sanitizeFilename(longName).length).toBe(50)
    })

    it('should return "results" for empty string', () => {
      expect(sanitizeFilename('')).toBe('results')
    })

    it('should return "results" when all characters are stripped', () => {
      expect(sanitizeFilename('@#$%^&')).toBe('results')
    })

    it('should allow hyphens and underscores', () => {
      expect(sanitizeFilename('my-file_name')).toBe('my-file_name')
    })
  })

  describe('getQueryExportName', () => {
    it('should use searchAlias when available', () => {
      const ds: any = { searchAlias: 'My Search', label: 'Layer' }
      expect(getQueryExportName(ds)).toBe('Query-My_Search')
    })

    it('should use queryName when no searchAlias', () => {
      const ds: any = { queryName: 'Custom Query', label: 'Layer' }
      expect(getQueryExportName(ds)).toBe('Query-Custom_Query')
    })

    it('should fallback to label', () => {
      const ds: any = { label: 'My Layer' }
      expect(getQueryExportName(ds)).toBe('Query-My_Layer')
    })

    it('should fallback to name', () => {
      const ds: any = { name: 'LayerName' }
      expect(getQueryExportName(ds)).toBe('Query-LayerName')
    })

    it('should fallback to "Results" when nothing available', () => {
      const ds: any = {}
      expect(getQueryExportName(ds)).toBe('Query-Results')
    })
  })

  describe('getOrderedFieldsWithAliases', () => {
    it('should return empty mapping for empty records', () => {
      const result = getOrderedFieldsWithAliases([])
      expect(result.fieldNames).toEqual([])
      expect(result.fieldToAlias).toEqual({})
    })

    it('should extract fields from record attributes', () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test', AGE: 25, OBJECTID: 1 } }
      }]
      const result = getOrderedFieldsWithAliases(records)

      expect(result.fieldNames).toContain('NAME')
      expect(result.fieldNames).toContain('AGE')
      expect(result.fieldNames).toContain('OBJECTID')
    })

    it('should exclude internal fields (starting with __)', () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test', __queryConfigId: 'abc', __originDSId: 'xyz' } }
      }]
      const result = getOrderedFieldsWithAliases(records)

      expect(result.fieldNames).toContain('NAME')
      expect(result.fieldNames).not.toContain('__queryConfigId')
      expect(result.fieldNames).not.toContain('__originDSId')
    })

    it('should order priority fields first', () => {
      const records: any[] = [{
        feature: { attributes: { ZEBRA: 'z', ALPHA: 'a', MIDDLE: 'm' } }
      }]
      const result = getOrderedFieldsWithAliases(records, ['ALPHA', 'MIDDLE'])

      expect(result.fieldNames[0]).toBe('ALPHA')
      expect(result.fieldNames[1]).toBe('MIDDLE')
      expect(result.fieldNames[2]).toBe('ZEBRA')
    })

    it('should use aliases from fieldSchema', () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test', AGE: 25 } }
      }]
      const schema = {
        NAME: { alias: 'Full Name' },
        AGE: { alias: 'Years Old' }
      }
      const result = getOrderedFieldsWithAliases(records, undefined, schema)

      expect(result.fieldToAlias.NAME).toBe('Full Name')
      expect(result.fieldToAlias.AGE).toBe('Years Old')
    })

    it('should use field name when no alias available', () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test' } }
      }]
      const result = getOrderedFieldsWithAliases(records)

      expect(result.fieldToAlias.NAME).toBe('NAME')
    })
  })

  describe('convertToCSV', () => {
    const fieldMapping = {
      fieldNames: ['NAME', 'AGE'],
      fieldToAlias: { NAME: 'Full Name', AGE: 'Age' }
    }

    it('should return empty blob for empty records', () => {
      const blob = convertToCSV([], fieldMapping)
      expect(blob.size).toBe(0)
    })

    it('should create CSV with header using aliases', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Alice', AGE: 30 } }
      }]
      const blob = convertToCSV(records, fieldMapping)
      const text = await blobToText(blob)

      expect(text).toContain('Full Name,Age')
      expect(text).toContain('Alice,30')
    })

    it('should escape commas in values', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Last, First', AGE: 30 } }
      }]
      const blob = convertToCSV(records, fieldMapping)
      const text = await blobToText(blob)

      expect(text).toContain('"Last, First"')
    })

    it('should escape double quotes in values', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Say "Hello"', AGE: 30 } }
      }]
      const blob = convertToCSV(records, fieldMapping)
      const text = await blobToText(blob)

      expect(text).toContain('"Say ""Hello"""')
    })

    it('should trim whitespace from string values', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: '  Alice  ', AGE: 30 } }
      }]
      const blob = convertToCSV(records, fieldMapping)
      const text = await blobToText(blob)

      expect(text).toContain('Alice,30')
    })

    it('should handle null and undefined values', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: null, AGE: undefined } }
      }]
      const blob = convertToCSV(records, fieldMapping)
      const text = await blobToText(blob)

      // Both should be empty strings
      expect(text).toContain(',')
    })
  })

  describe('convertToGeoJSON', () => {
    const fieldMapping = {
      fieldNames: ['NAME'],
      fieldToAlias: { NAME: 'Full Name' }
    }

    it('should return empty FeatureCollection for no records', async () => {
      const blob = convertToGeoJSON([], fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json.type).toBe('FeatureCollection')
      expect(json.features).toEqual([])
    })

    it('should create features with aliased properties', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test' } },
        getGeometry: jest.fn().mockReturnValue(null)
      }]
      const blob = convertToGeoJSON(records, fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json.features.length).toBe(1)
      expect(json.features[0].properties['Full Name']).toBe('Test')
    })

    it('should handle point geometry', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test' } },
        getGeometry: jest.fn().mockReturnValue({
          toJSON: () => ({ x: -122.4, y: 37.8 })
        })
      }]
      const blob = convertToGeoJSON(records, fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json.features[0].geometry.type).toBe('Point')
      expect(json.features[0].geometry.coordinates).toEqual([-122.4, 37.8])
    })

    it('should handle polygon geometry', async () => {
      const rings = [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test' } },
        getGeometry: jest.fn().mockReturnValue({
          toJSON: () => ({ rings })
        })
      }]
      const blob = convertToGeoJSON(records, fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json.features[0].geometry.type).toBe('Polygon')
      expect(json.features[0].geometry.coordinates).toEqual(rings)
    })

    it('should handle null geometry gracefully', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: 'Test' } },
        getGeometry: jest.fn().mockReturnValue(null)
      }]
      const blob = convertToGeoJSON(records, fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json.features[0].geometry).toBeNull()
    })
  })

  describe('convertToJSON', () => {
    const fieldMapping = {
      fieldNames: ['NAME', 'AGE'],
      fieldToAlias: { NAME: 'Full Name', AGE: 'Age' }
    }

    it('should return empty array for no records', async () => {
      const blob = convertToJSON([], fieldMapping)
      const text = await blobToText(blob)
      expect(JSON.parse(text)).toEqual([])
    })

    it('should create array of objects with aliased keys', async () => {
      const records: any[] = [
        { feature: { attributes: { NAME: 'Alice', AGE: 30 } } },
        { feature: { attributes: { NAME: 'Bob', AGE: 25 } } }
      ]
      const blob = convertToJSON(records, fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json.length).toBe(2)
      expect(json[0]['Full Name']).toBe('Alice')
      expect(json[0]['Age']).toBe(30)
      expect(json[1]['Full Name']).toBe('Bob')
    })

    it('should trim whitespace from string values', async () => {
      const records: any[] = [{
        feature: { attributes: { NAME: '  Alice  ', AGE: 30 } }
      }]
      const blob = convertToJSON(records, fieldMapping)
      const text = await blobToText(blob)
      const json = JSON.parse(text)

      expect(json[0]['Full Name']).toBe('Alice')
    })
  })

  describe('EXPORT_FORMATS', () => {
    it('should have csv, geojson, and json formats', () => {
      expect(EXPORT_FORMATS.csv).toBeDefined()
      expect(EXPORT_FORMATS.geojson).toBeDefined()
      expect(EXPORT_FORMATS.json).toBeDefined()
    })

    it('should have correct extensions', () => {
      expect(EXPORT_FORMATS.csv.extension).toBe('csv')
      expect(EXPORT_FORMATS.geojson.extension).toBe('geojson')
      expect(EXPORT_FORMATS.json.extension).toBe('json')
    })

    it('should only return geometry for geojson', () => {
      expect(EXPORT_FORMATS.csv.returnGeometry).toBe(false)
      expect(EXPORT_FORMATS.geojson.returnGeometry).toBe(true)
      expect(EXPORT_FORMATS.json.returnGeometry).toBe(false)
    })
  })
})
