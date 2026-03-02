/**
 * Export utilities for QuerySimple widget.
 * 
 * r024.107: Refactored from results-menu.tsx to eliminate code duplication.
 * Provides shared utilities for CSV, GeoJSON, and JSON export formats.
 */

import {
  type DataRecordSet,
  type DataSource,
  type DataRecord,
  type FeatureDataRecord,
  type QueriableDataSource,
  type FeatureLayerDataSource
} from 'jimu-core'
import JSZip from 'jszip'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// ============================================================================
// Types
// ============================================================================

export interface FieldMapping {
  fieldNames: string[]
  fieldToAlias: Record<string, string>
}

export interface FetchFullRecordsResult {
  records: DataRecord[]
  fieldSchema: Record<string, { alias?: string }>
}

export type ExportConverter = (
  records: DataRecord[],
  fieldMapping: FieldMapping
) => Blob

export interface ExportFormatConfig {
  extension: string
  zipName: string
  returnGeometry: boolean
  converter: ExportConverter
}

// ============================================================================
// Helper Functions
// ============================================================================

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50) || 'results'
}

export function getQueryExportName(ds: DataRecordSet): string {
  const searchAlias = (ds as any).searchAlias
  const queryName = (ds as any).queryName
  const layerLabel = ds.label || ds.name || 'Results'
  const nameLabel = searchAlias || queryName || layerLabel
  return `Query-${sanitizeFilename(nameLabel)}`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// r024.108: Trim whitespace from string values
function trimValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim()
  }
  return value
}

// ============================================================================
// Shared Field Processing
// ============================================================================

export function getOrderedFieldsWithAliases(
  records: DataRecord[],
  priorityFields?: string[],
  fieldSchema?: Record<string, { alias?: string }>
): FieldMapping {
  if (!records || records.length === 0) {
    return { fieldNames: [], fieldToAlias: {} }
  }

  const firstRecord = records[0] as FeatureDataRecord
  const attributes = firstRecord.feature?.attributes || firstRecord.getData?.() || {}

  // Get all field names from record (excluding internal fields)
  const allFields = Object.keys(attributes).filter(key => !key.startsWith('__'))

  // Order fields - priority fields first (in order), then remaining fields
  let fieldNames: string[]
  if (priorityFields?.length) {
    const validPriorityFields = priorityFields.filter(f => allFields.includes(f))
    const remainingFields = allFields.filter(f => !priorityFields.includes(f))
    fieldNames = [...validPriorityFields, ...remainingFields]
  } else {
    fieldNames = allFields
  }

  // Build field name to alias mapping
  const fieldToAlias: Record<string, string> = {}
  fieldNames.forEach(fieldName => {
    const alias = fieldSchema?.[fieldName]?.alias
    fieldToAlias[fieldName] = alias || fieldName
  })

  return { fieldNames, fieldToAlias }
}

// ============================================================================
// Shared Data Fetching
// ============================================================================

export async function fetchFullRecords(
  dataSource: DataSource,
  records: DataRecord[],
  returnGeometry: boolean,
  formatName: string
): Promise<FetchFullRecordsResult> {
  const emptyResult: FetchFullRecordsResult = {
    records: [],
    fieldSchema: {}
  }

  if (!records || records.length === 0) {
    return emptyResult
  }

  let fullRecords = records

  debugLogger.log('DATA-ACTION', {
    action: `export${formatName}-fetchFullRecords-start`,
    dataSourceId: dataSource?.id,
    recordsCount: records.length,
    returnGeometry
  })

  try {
    const objectIdField = (dataSource as FeatureLayerDataSource)
      ?.getLayerDefinition?.()?.objectIdField ||
      (dataSource as any)?.layer?.objectIdField ||
      'OBJECTID'

    const recordIds = records.map(r => {
      const featureRecord = r as FeatureDataRecord
      return featureRecord.feature?.attributes?.[objectIdField]
    }).filter(id => id != null)

    if (recordIds.length > 0) {
      const whereClause = `${objectIdField} IN (${recordIds.join(',')})`

      const result = await (dataSource as QueriableDataSource).query({
        where: whereClause,
        returnGeometry,
        notAddFieldsToClient: true,
        outFields: ['*']
      } as any)

      if (result?.records?.length > 0) {
        fullRecords = result.records
        debugLogger.log('DATA-ACTION', {
          action: `export${formatName}-fetchFullRecords-success`,
          originalCount: records.length,
          fullCount: fullRecords.length
        })
      }
    }
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: `export${formatName}-fetchFullRecords-fallback`,
      error: error instanceof Error ? error.message : String(error)
    })
  }

  const schema = dataSource.getSchema()
  const fieldSchema = schema?.fields || {}

  return { records: fullRecords, fieldSchema }
}

// ============================================================================
// Format Converters
// ============================================================================

export function convertToCSV(records: DataRecord[], fieldMapping: FieldMapping): Blob {
  if (!records || records.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8' })
  }

  const { fieldNames, fieldToAlias } = fieldMapping

  // Build CSV header using aliases
  const header = fieldNames.map(fieldName => 
    escapeCSVValue(fieldToAlias[fieldName])
  ).join(',')

  // Build CSV rows
  const rows = records.map(record => {
    const featureRecord = record as FeatureDataRecord
    const data = featureRecord.feature?.attributes || featureRecord.getData?.() || {}
    return fieldNames.map(field => escapeCSVValue(trimValue(data[field]))).join(',')
  })

  const csvContent = [header, ...rows].join('\r\n')
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
}

function esriGeometryToGeoJSON(esriGeom: any): any {
  if (!esriGeom) return null

  // Handle Point
  if (esriGeom.x !== undefined && esriGeom.y !== undefined) {
    return { type: 'Point', coordinates: [esriGeom.x, esriGeom.y] }
  }

  // Handle Polyline (paths)
  if (esriGeom.paths) {
    if (esriGeom.paths.length === 1) {
      return { type: 'LineString', coordinates: esriGeom.paths[0] }
    }
    return { type: 'MultiLineString', coordinates: esriGeom.paths }
  }

  // Handle Polygon (rings)
  if (esriGeom.rings) {
    return { type: 'Polygon', coordinates: esriGeom.rings }
  }

  // Handle MultiPoint
  if (esriGeom.points) {
    return { type: 'MultiPoint', coordinates: esriGeom.points }
  }

  return null
}

export function convertToGeoJSON(records: DataRecord[], fieldMapping: FieldMapping): Blob {
  if (!records || records.length === 0) {
    const emptyCollection = { type: 'FeatureCollection', features: [] }
    return new Blob([JSON.stringify(emptyCollection, null, 2)], { type: 'application/geo+json' })
  }

  const { fieldNames, fieldToAlias } = fieldMapping

  const features = records.map(record => {
    const featureRecord = record as FeatureDataRecord
    const data = featureRecord.feature?.attributes || featureRecord.getData?.() || {}

    // Build properties with alias keys
    const properties: Record<string, any> = {}
    fieldNames.forEach(fieldName => {
      properties[fieldToAlias[fieldName]] = trimValue(data[fieldName])
    })

    // Get geometry and convert to GeoJSON
    let geometry = null
    try {
      const esriGeom = featureRecord.getGeometry?.()
      if (esriGeom) {
        const geomJson = typeof esriGeom.toJSON === 'function' ? esriGeom.toJSON() : esriGeom
        geometry = esriGeometryToGeoJSON(geomJson)
      }
    } catch (e) {
      // Geometry conversion failed, leave as null
    }

    return { type: 'Feature', geometry, properties }
  })

  const featureCollection = { type: 'FeatureCollection', features }
  return new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json' })
}

export function convertToJSON(records: DataRecord[], fieldMapping: FieldMapping): Blob {
  if (!records || records.length === 0) {
    return new Blob(['[]'], { type: 'application/json' })
  }

  const { fieldNames, fieldToAlias } = fieldMapping

  const jsonArray = records.map(record => {
    const featureRecord = record as FeatureDataRecord
    const data = featureRecord.feature?.attributes || featureRecord.getData?.() || {}

    const obj: Record<string, any> = {}
    fieldNames.forEach(fieldName => {
      obj[fieldToAlias[fieldName]] = trimValue(data[fieldName])
    })

    return obj
  })

  return new Blob([JSON.stringify(jsonArray, null, 2)], { type: 'application/json' })
}

// ============================================================================
// Export Format Configurations
// ============================================================================

export const EXPORT_FORMATS: Record<string, ExportFormatConfig> = {
  csv: {
    extension: 'csv',
    zipName: 'Query-Results-CSV.zip',
    returnGeometry: false,
    converter: convertToCSV
  },
  geojson: {
    extension: 'geojson',
    zipName: 'Query-Results-GeoJSON.zip',
    returnGeometry: true,
    converter: convertToGeoJSON
  },
  json: {
    extension: 'json',
    zipName: 'Query-Results-JSON.zip',
    returnGeometry: false,
    converter: convertToJSON
  }
}

// ============================================================================
// Generic Export Handler
// ============================================================================

export async function handleExportFormat(
  dataSets: DataRecordSet[],
  formatKey: string,
  onComplete: () => void
): Promise<void> {
  const format = EXPORT_FORMATS[formatKey]
  if (!format) {
    debugLogger.log('DATA-ACTION', {
      action: 'export-unknownFormat',
      formatKey
    })
    return
  }

  debugLogger.log('DATA-ACTION', { 
    action: `resultsMenu-export${formatKey.toUpperCase()}-clicked` 
  })
  onComplete()

  const validDataSets = dataSets.filter(ds => ds.records?.length > 0 && ds.dataSource)

  if (validDataSets.length === 0) {
    debugLogger.log('DATA-ACTION', {
      action: `resultsMenu-export${formatKey.toUpperCase()}-skipped`,
      reason: 'no-valid-datasets'
    })
    return
  }

  try {
    if (validDataSets.length === 1) {
      // Single source - direct download
      const ds = validDataSets[0]
      const { records, fieldSchema } = await fetchFullRecords(
        ds.dataSource,
        ds.records,
        format.returnGeometry,
        formatKey.toUpperCase()
      )
      const fieldMapping = getOrderedFieldsWithAliases(records, ds.fields as string[], fieldSchema)
      const blob = format.converter(records, fieldMapping)
      const filename = `${getQueryExportName(ds)}.${format.extension}`
      downloadBlob(blob, filename)

      debugLogger.log('DATA-ACTION', {
        action: `resultsMenu-export${formatKey.toUpperCase()}-complete`,
        type: 'single',
        filename,
        recordsCount: ds.records.length
      })
    } else {
      // Multiple sources - zip file
      const zip = new JSZip()

      for (const ds of validDataSets) {
        const { records, fieldSchema } = await fetchFullRecords(
          ds.dataSource,
          ds.records,
          format.returnGeometry,
          formatKey.toUpperCase()
        )
        const fieldMapping = getOrderedFieldsWithAliases(records, ds.fields as string[], fieldSchema)
        const blob = format.converter(records, fieldMapping)
        const text = await blob.text()
        const filename = `${getQueryExportName(ds)}.${format.extension}`
        zip.file(filename, text)

        debugLogger.log('DATA-ACTION', {
          action: `resultsMenu-export${formatKey.toUpperCase()}-addedToZip`,
          filename,
          recordsCount: ds.records.length
        })
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, format.zipName)

      debugLogger.log('DATA-ACTION', {
        action: `resultsMenu-export${formatKey.toUpperCase()}-complete`,
        type: 'zip',
        sourcesCount: validDataSets.length,
        totalRecords: validDataSets.reduce((sum, ds) => sum + ds.records.length, 0)
      })
    }
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: `resultsMenu-export${formatKey.toUpperCase()}-error`,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
