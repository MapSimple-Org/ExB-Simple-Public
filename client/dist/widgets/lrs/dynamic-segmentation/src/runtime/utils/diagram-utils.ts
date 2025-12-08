import { isCodedDomain, isDate, isDefined, isNumber, isRangeDomain, type NetworkInfo, type LrsLayer, getDateWithTZOffset } from 'widgets/shared-code/lrs'
import { EventType, type FieldType, type DynSegFieldInfo, type Track, type TrackRecord, type SubtypeLayers, type AttributeSetParam, type MeasureRange } from '../../config'
import { DynSegFields } from '../../constants'
import { getAttributesByTable } from './table-utils'
import type { ImmutableArray } from 'seamless-immutable'
import { type FeatureLayerDataSource, loadArcGISJSAPIModules, type CodedValue, loadArcGISJSAPIModule, type ImmutableObject, type DataSource } from 'jimu-core'

export async function getRecordsAsTracks (
  records: __esri.Graphic[],
  fieldInfos: DynSegFieldInfo[],
  lrsLayers: ImmutableArray<LrsLayer>,
  attributeSet: AttributeSetParam[],
  measureRange: MeasureRange,
  networkInfo: ImmutableObject<NetworkInfo>
): Promise<Map<string, Track>> {
  const tracksMap = new Map<string, Track>()

  // Build track for each event first.
  let trackIndex: number = 0
  fieldInfos.forEach((fieldInfo) => {
    if (fieldInfo.eventName !== '') {
      const track: Track = {
        index: trackIndex++,
        layerId: fieldInfo.eventLayerId,
        layerName: fieldInfo.eventName,
        eventType: fieldInfo.EventType,
        records: [],
        visible: true,
        isActive: true
      }
      tracksMap.set(fieldInfo.eventName, track)
    }
  })

  let trackRecordIndex: number = 0
  // For each record, get attributes for each table and add trackRecord to track.
  records.forEach((record) => {
    tracksMap.forEach((track) => {
      if (shouldSkipTrack(fieldInfos, record, track.layerName, networkInfo.mTolerance)) {
        return
      }
      const lrsLayer = lrsLayers.find(layer => isDefined(layer.eventInfo) && layer.eventInfo.datasetName === track.layerName)
      const fieldInfo = fieldInfos.filter(fieldInfos => fieldInfos.eventName === track.layerName)
      const fromM = record.attributes[DynSegFields.fromMeasureName] < measureRange.from ? measureRange.from : record.attributes[DynSegFields.fromMeasureName]
      const toM = record.attributes[DynSegFields.toMeasureName] > measureRange.to ? measureRange.to : record.attributes[DynSegFields.toMeasureName]
      const trackRecord: TrackRecord = {
        index: trackRecordIndex++,
        objectId: record.attributes[DynSegFields.objectIdName],
        attributes: getAttributesByTable(fieldInfos, record, track.layerName, true),
        fromMeasure: fromM,
        toMeasure: toM,
        geometry: record.geometry,
        selected: false,
        hasValue: getHasValue(fieldInfos, record, track.layerName),
        isPoint: getIsPoint(fieldInfos, record, track.layerName),
        displayField: getAttributeSetDisplayField(lrsLayer.displayField, track.layerId, attributeSet),
        fieldInfos: fieldInfo
      }
      track.records.push(trackRecord)
    })
  })

  return await mergeTracks(tracksMap)
}

export function getObjectIdFieldName (trackRecord: TrackRecord): string {
  const oidField = trackRecord.fieldInfos.find((fieldInfo) => fieldInfo.isOidField)
  return isDefined(oidField) ? oidField.featureFieldName : ''
}

export function getObjectIdValue (trackRecord: TrackRecord): number {
    return trackRecord.attributes.get(getObjectIdFieldName(trackRecord)) as number ?? NaN
}

async function mergeTracks (trackMap: Map<string, Track>): Promise<Map<string, Track>> {
  const unionOperator = await loadArcGISJSAPIModule('esri/geometry/operators/unionOperator')
  const mergedTracks = new Map(trackMap)
  mergedTracks.forEach((track) => {
    const mergedTracksRecords: TrackRecord[] = []
    let currentTrackRecord = null
    track.records.sort((a, b) => a.fromMeasure - b.fromMeasure)
    track.records.forEach((record) => {
      if (!currentTrackRecord) {
        currentTrackRecord = record
      } else {
        if (canMerge(currentTrackRecord, record)) {
          currentTrackRecord.attributes.set(DynSegFields.toMeasureName, record.toMeasure)
          currentTrackRecord.toMeasure = record.toMeasure
          currentTrackRecord.geometry = mergeGeometry(unionOperator, currentTrackRecord.geometry, record.geometry)
        } else {
          mergedTracksRecords.push(currentTrackRecord)
          currentTrackRecord = record
        }
      }
    })
    if (currentTrackRecord) {
      mergedTracksRecords.push(currentTrackRecord)
    }
    track.records = mergedTracksRecords
  })

  return mergedTracks
}

function canMerge (currentTrackRecord: TrackRecord, record: TrackRecord): boolean {
  if (currentTrackRecord.isPoint) return false
  let canMerge = true
  currentTrackRecord.attributes.forEach((value, key) => {
    if (key !== DynSegFields.fromMeasureName && key !== DynSegFields.toMeasureName) {
      if (record.attributes.has(key)) {
        const isCurrentValueDefined = isDefined(value)
        const isRecordValueDefined = isDefined(record.attributes.get(key))

        if ((!isCurrentValueDefined && isRecordValueDefined) ||
            ((isCurrentValueDefined && !isRecordValueDefined)) ||
            (value !== record.attributes.get(key))) {
          canMerge = false
        }
      }
    }
  })
  return canMerge
}

function mergeGeometry (unionOperator: __esri.unionOperator, geometry1: __esri.Geometry, geometry2: __esri.Geometry): __esri.Geometry {
  if (!isDefined(geometry1) && isDefined(geometry2)) return geometry2
  if (isDefined(geometry1) && !isDefined(geometry2)) return geometry1
  if (!isDefined(geometry1) && !isDefined(geometry2)) return null
  return unionOperator.execute(geometry1 as __esri.geometryGeometry, geometry2 as __esri.geometryGeometry)
}

function getAttributeSetDisplayField (defaultDisplay: string, layerId: string, attributeSet: AttributeSetParam[]): string {
  const layerAttributes = attributeSet.find(set => set.layerId === layerId)
  if (isDefined(layerAttributes)) {
    const displayField = layerAttributes.fields.find(field => field === defaultDisplay)
    if (isDefined(displayField)) {
      return displayField
    }
    return layerAttributes.fields[0]
  }
  return ''
}

export function getIsPoint (fieldInfos: DynSegFieldInfo[], record: __esri.Graphic, tableName: string): boolean {
  let isPoint = false
  fieldInfos.forEach((field) => {
    if (field.eventName === tableName) {
      if (field.EventType === EventType.Point) {
        isPoint = true
      }
    }
  })

  return isPoint
}

export function shouldSkipTrack (fieldInfos: DynSegFieldInfo[], record: __esri.Graphic, tableName: string, mTolerance: number): boolean {
  let shouldSkip = false
  const isPoint = getIsPoint(fieldInfos, record, tableName)
  const type = record.attributes[DynSegFields.typeName]

  if (isPoint && type === 'Line') {
    shouldSkip = true
  }
  if (!isPoint && type === 'Point') {
    shouldSkip = true
  }

  return shouldSkip
}

export function getHasValue (fieldInfos: DynSegFieldInfo[], record: __esri.Graphic, tableName: string): boolean {
  let hasValue = false
  fieldInfos.forEach((field) => {
    if (field.eventName === tableName) {
      if (field.isOidField) {
        const eventOidValue = record.attributes[field.featureFieldName]
        if (isDefined(eventOidValue) && eventOidValue !== '' && !isNaN(eventOidValue)) {
          hasValue = true
        }
      }
    }
  })

  return hasValue
}

export function getXFromM (m: number, measureRange: MeasureRange, sldWidth: number): number {
  if (isNaN(m)) return NaN
  const mRange = measureRange.to - measureRange.from
  const dRange = sldWidth
  const mRatio = (m - measureRange.from) / mRange
  const x = mRatio * dRange
  return Math.floor(x)
}

export function getZoomFromExtent (fromM: number, toM: number, defaultRange): number {
    const rangeDiff = toM - fromM
    const displayRatio = rangeDiff / defaultRange
    if (displayRatio < 1) {
      return 1
    } else {
      return displayRatio
    }
}

export function getMFromX (x: number, measureRange: MeasureRange, sldWidth: number): number {
  if (isNaN(x)) return NaN
  const mRange = measureRange.to - measureRange.from
  const dRange = sldWidth
  const xRatio = x / dRange
  const m = xRatio * mRange + measureRange.from
  return m
}

function trimCanvas (canvas: HTMLCanvasElement, size: number): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  const width = isDefined(size) ? size : canvas.width
  const height = isDefined(size) ? size : canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  let top = 0
  let bottom = imageData.height
  let left = 0
  let right = imageData.width

  while (top < bottom && isRowBlank(imageData, width, top)) ++top
  while (bottom - 1 > top && isRowBlank(imageData, width, bottom - 1)) --bottom
  while (left < right && isColumnBlank(imageData, width, left, top, bottom)) { ++left }
  while (right - 1 > left && isColumnBlank(imageData, width, right - 1, top, bottom)) { --right }

  const sw = right - left === 0 ? 1 : right - left
  const sh = bottom - top === 0 ? 1 : bottom - top
  const trimmed = ctx.getImageData(left, top, sw, sh)
  const copy = canvas.ownerDocument.createElement('canvas')
  const copyCtx = copy.getContext('2d')
  copy.width = trimmed.width
  copy.height = trimmed.height
  copyCtx.putImageData(trimmed, 0, 0)

  return copy
}

function isRowBlank (imageData: ImageData, width: number, y: number) {
  for (let x = 0; x < width; ++x) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false
  }
  return true
}

function isColumnBlank (imageData: ImageData, width: number, x: number, top: number, bottom: number) {
  for (let y = top; y < bottom; ++y) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false
  }
  return true
}

function convertImageToCanvas (image: HTMLImageElement, size?: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const canvasContext = canvas.getContext('2d')
  if (!isDefined(size)) {
    canvasContext.drawImage(image, 0, 0)
  } else {
    canvasContext.drawImage(image, 0, 0, size, size)
  }
  return canvas
}

export function trimPNG (image: HTMLImageElement, size?: number): string {
  const canvas = convertImageToCanvas(image, size)
  const trimmedCanvas = trimCanvas(canvas, size)
  return trimmedCanvas.toDataURL('image/png')
}

function getSubtypeCodedValue (field: __esri.Field, fieldInfo: DynSegFieldInfo, subtypeLayers: SubtypeLayers[], featureLayer?: __esri.FeatureLayer): CodedValue[] {
  if (isDefined(field) && isDefined(subtypeLayers)) {
    if (isDefined(fieldInfo)) {
      const subtype = subtypeLayers.find(s => s.id === fieldInfo.eventLayerId)
      if (isDefined(subtype) && isDefined(subtype.subtypes)) {
        const codedValues: CodedValue[] = subtype.subtypes.map((subtype) => {
          return {
            value: subtype.code,
            label: subtype.name
          }
        })
        if (codedValues) {
          return codedValues
        }
      }
      return []
    } else {
      const codedValues: CodedValue[] = featureLayer.subtypes.map((subtype) => {
        return {
          value: subtype.code,
          label: subtype.name
        }
      })
      if (codedValues) {
        return codedValues
      }
      return []
    }
  }
  return []
}

function getCodedValueDomains (field: __esri.Field): __esri.CodedValueDomain {
  if (isDefined(field) && isDefined(field.domain) && field.domain.type === 'coded-value') {
    return field.domain
  }
  return null
}

function getSubtypeLabel (value: string | number | Date, displayField: __esri.Field, displayFieldInfo: DynSegFieldInfo, subtypeLayers: SubtypeLayers[], featureLayer?: __esri.FeatureLayer): string {
  if (isDefined(value)) {
    const subtypeCodedValue = getSubtypeCodedValue(displayField, displayFieldInfo, subtypeLayers)
    const codeValue = subtypeCodedValue.find(s => {
      if (typeof s.value === 'string' && typeof value === 'string') {
        return s.value.toLowerCase() === value.toLowerCase()
      } else {
        return s.value === value
      }
    })
    if (isDefined(codeValue)) {
      return codeValue.label
    } else {
      return ''
    }
  }
  return ''
}

function getCodedValueLabel (value: string | number | Date, displayField: __esri.Field): string {
  if (isDefined(value)) {
    const codedValueDomains = getCodedValueDomains(displayField)
    const codeValue = codedValueDomains.codedValues.find(c => {
      if (typeof c.code === 'string' && typeof value === 'string') {
        return c.code.toLowerCase() === value.toLowerCase()
      } else {
        return c.code === value
      }
    })
    if (isDefined(codeValue)) {
      return codeValue.name
    } else {
      return ''
    }
  }
  return ''
}

export function getDisplayFieldValue (fields: __esri.Field[], fieldInfos: DynSegFieldInfo[], record: TrackRecord, subtypeLayers: SubtypeLayers[]): string {
  const field = getDisplayField(fields, record)
  const fieldInfo = getDisplayFieldInfo(fieldInfos, record)
  if (isDefined(field) && isDefined(fieldInfo)) {
    const fieldType = getDisplayFieldType(field, fieldInfo)
    const value = record.attributes.get(record.displayField)
    return getValue(fieldType, field, fieldInfo, value, subtypeLayers)
  }
  return ''
}

export function convertFieldValueToType (field: __esri.Field, featureLayer: __esri.FeatureLayer, value: any, subtypeLayers: SubtypeLayers[], datasource: DataSource): string {
  const fieldType = getDisplayFieldType(field, null, featureLayer)
  return getValue(fieldType, field, null, value, subtypeLayers, featureLayer, datasource)
}

// eslint-disable-next-line max-params
function getValue (fieldType: FieldType, field: __esri.Field, fieldInfo: DynSegFieldInfo, value: any, subtypeLayers: SubtypeLayers[], featureLayer?: __esri.FeatureLayer, datasource?: DataSource): string {
  switch (fieldType) {
    case 'subtype':
      return getSubtypeLabel(value, field, fieldInfo, subtypeLayers, featureLayer)
    case 'domain':
      return getCodedValueLabel(value, field)
    case 'date':
      if (!isDefined(value)) return ''
      if (datasource) return getDateWithTZOffset(value.valueOf(), datasource).toLocaleDateString()
      return new Date(value).toLocaleDateString()
    case 'range':
    case 'number':
    case 'text':
      return isDefined(value) ? value.toString() : ''
  }
}

function getDisplayFieldType (field: __esri.Field, fieldInfo: DynSegFieldInfo, featureLayer?: __esri.FeatureLayer): FieldType {
  if (isDefined(fieldInfo)) {
    if (fieldInfo.isSubtypeField) {
      return 'subtype'
    }
  } else {
    if (featureLayer.subtypeField === field.name) {
      return 'subtype'
    }
  }
  if (isDefined(field.domain) && isCodedDomain(field.domain.type)) {
    return 'domain'
  }
  if (isDefined(field.domain) && isRangeDomain(field.domain.type)) {
    return 'range'
  }
  if (isDate(field.type)) {
    return 'date'
  }
  if (isNumber(field.type)) {
    return 'number'
  }
  return 'text'
}

export function getDisplayFieldInfo (fieldInfos: DynSegFieldInfo[], record: TrackRecord): DynSegFieldInfo {
  return fieldInfos.find(f => f.originalFieldName === record.displayField)
}

export function getDisplayField (fields: __esri.Field[], record: TrackRecord): __esri.Field {
  return fields.find(f => f.alias.split('.')[1] === record.displayField)
}

export function getEventIdField (fieldInfos: DynSegFieldInfo[], record: TrackRecord): DynSegFieldInfo {
  return fieldInfos.find(f => f.isEventIdField)
}

export function getGraphic (record: TrackRecord, layer?: FeatureLayerDataSource, forSymbols: boolean = false): Promise<__esri.Graphic> {
  return loadArcGISJSAPIModules(['esri/Graphic']).then(modules => {
    let Graphic: typeof __esri.Graphic = null;
    [Graphic] = modules

    // Convert from Map to key/value pairs
    const attributeKeys = [...record.attributes.keys()]
    const attributes: { [key: string]: string | number | Date } = {}
    attributeKeys.forEach(key => {
      attributes[key] = record.attributes.get(key)
      // getDisplayedSymbol expects '<Null>' for null values
      if (forSymbols && (!isDefined(attributes[key]) || attributes[key] === 'null')) {
        attributes[key] = '<Null>'
      }
    })

    if (isDefined(layer)) {
      return new Graphic({
        geometry: record.geometry,
        attributes: attributes,
        layer: layer.layer
      })
    }
    return new Graphic({
      geometry: record.geometry,
      attributes: attributes
    })
  })
}

export function getAttributesByDiagram (fieldInfos: DynSegFieldInfo[], trackRecord: TrackRecord, tableName: string, getOiDField: boolean): Map<string, string | number | Date> {
  const attributes = new Map<string, string | number | Date>()
  fieldInfos.forEach((field) => {
    if (field.eventName === tableName) {
      if (field.isOidField) {
        if (getOiDField) {
          attributes.set(field.featureFieldName, trackRecord.attributes.get(field.featureFieldName))
        }
      } else {
        // SLD uses original field name for the track record
        attributes.set(field.originalFieldName, trackRecord.attributes.get(field.originalFieldName))
      }
    }
  })
  attributes.set(DynSegFields.routeIdName, trackRecord.attributes.get(DynSegFields.routeIdName))
  attributes.set(DynSegFields.fromDateName, trackRecord.attributes.get(DynSegFields.fromDateName))
  attributes.set(DynSegFields.toDateName, trackRecord.attributes.get(DynSegFields.toDateName))
  attributes.set(DynSegFields.fromMeasureName, trackRecord.attributes.get(DynSegFields.fromMeasureName))
  attributes.set(DynSegFields.toMeasureName, trackRecord.attributes.get(DynSegFields.toMeasureName))

  return attributes
}
