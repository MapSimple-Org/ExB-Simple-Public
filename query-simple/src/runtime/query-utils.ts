import {
  type FeatureLayerDataSource,
  type ImmutableObject,
  type IMSqlExpression,
  type FeatureLayerQueryParams,
  MessageManager,
  type QueryParams,
  type DataRecord,
  DataRecordSetChangeMessage,
  RecordSetChangeType,
  type ImmutableArray,
  dataSourceUtils
} from 'jimu-core'
import type { IFieldInfo } from '@esri/arcgis-rest-feature-service'
import { type QueryItemType, SpatialRelation, type SpatialFilterObj, FieldsType, mapJSAPIUnitToDsUnit, mapJSAPISpatialRelToDsSpatialRel } from '../config'
import { getFieldInfosInPopupContent, createQuerySimpleDebugLogger, substituteTokens, convertTemplateToHtml } from '../../../shared-code/mapsimple-common'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { extractFieldTokens } from './markdown-template-utils'

const debugLogger = createQuerySimpleDebugLogger()

export function combineFields (resultDisplayFields: ImmutableArray<string>, resultTitleExpression: string, idField?: string, resultContentExpression?: string): string[] {
  const fields = new Set<string>()
  resultDisplayFields?.forEach(item => fields.add(item))
  // r026.002: Support both {{field}} (new) and {field} (legacy) title syntax
  if (resultTitleExpression) {
    // Match {{FIELD}} or {{FIELD | filter}} (new syntax)
    const newTokens = resultTitleExpression.match(/\{\{([\w.@[\]]+)(?:\|[^}]*)?\}\}/g)
    if (newTokens?.length > 0) {
      newTokens.forEach(item => {
        const fieldName = item.replace(/^\{\{|\}\}$/g, '').replace(/\|.*$/, '').trim()
        fields.add(fieldName)
      })
    }
    // Match {FIELD} (legacy syntax, for un-migrated configs)
    const legacyTokens = resultTitleExpression.match(/(?<!\{)\{(\w+)\}(?!\})/g)
    if (legacyTokens?.length > 0) {
      legacyTokens.forEach(item => fields.add(item.substring(1, item.length - 1)))
    }
  }
  // r023.18: Extract fields from Custom Template content expression
  if (resultContentExpression) {
    extractFieldTokens(resultContentExpression).forEach(f => fields.add(f))
  }
  if (idField) {
    fields.add(idField)
  }
  return Array.from(fields)
}

/**
 * r025.065: Walk up the parentDataSource chain to find popupInfo.
 * Group Layers in AGO often store popup config at the GL level, not on
 * child layers.  ExB mirrors this: the child DataSource's getPopupInfo()
 * returns null while the parent (group) DataSource holds the configured popup.
 * This utility checks the DataSource itself first, then walks upward.
 */
export function resolvePopupInfoWithInheritance (ds: FeatureLayerDataSource): any | null {
  // 1. Check the DataSource itself
  const popupInfo = (ds as any).getPopupInfo?.()
  if (popupInfo?.fieldInfos?.length > 0) return popupInfo

  // 2. Walk up parentDataSource chain
  let parent = (ds as any).parentDataSource
  while (parent) {
    const parentPopup = parent.getPopupInfo?.()
    if (parentPopup?.fieldInfos?.length > 0) return parentPopup
    parent = parent.parentDataSource
  }

  return null
}

/**
 * Resolve outFields from a DataSource's popup info.
 * Returns visible popup fields when available, otherwise all layer field names.
 * Always includes the objectIdField. Never returns ['*'].
 *
 * Used by both direct-query.ts (PopupSetting fallback) and execute-spatial-query.ts
 * (target layers without a queryItem config).
 */
export function resolvePopupOutFields (
  ds: FeatureLayerDataSource,
  featureLayer: __esri.FeatureLayer
): string[] {
  const objectIdField = featureLayer.objectIdField

  // r025.065: Use DIRECT popupInfo only for outFields resolution — not inherited.
  // Inherited GL popup may restrict fields for popup display; outFields needs
  // all available fields so table view and exports have full data.
  const popupInfo = ds.getPopupInfo?.() ||
    (ds.getOriginDataSources?.()?.[0] as FeatureLayerDataSource)?.getPopupInfo?.()

  if (popupInfo?.fieldInfos) {
    const layerFieldNames = featureLayer.fields.map(f => f.name)
    const visibleFields = popupInfo.fieldInfos
      .filter(fi => fi.visible !== false && layerFieldNames.includes(fi.fieldName))
      .map(fi => fi.fieldName)

    if (visibleFields.length > 0) {
      if (objectIdField && !visibleFields.includes(objectIdField)) {
        visibleFields.push(objectIdField)
      }
      return visibleFields
    }
  }

  // Fallback: all layer fields (explicit names, not '*')
  const allFields = featureLayer.fields.map(f => f.name)
  if (objectIdField && !allFields.includes(objectIdField)) {
    allFields.push(objectIdField)
  }
  return allFields
}

/**
 * Validates user input before query execution.
 * @param input - The raw user input (string, number, etc.)
 * @param isList - Optional flag indicating if the input is from a list/selector (lenient validation)
 * @returns boolean - true if input is valid, false otherwise
 */
export function isQueryInputValid (input: any, isList: boolean = false): boolean {
  // If it's a list-based selection (Unique Values, Field Values), 
  // we allow empty/null as it might represent "no filter" or the user 
  // intends to interact with the list.
  if (isList) {
    return true
  }

  if (input === null || input === undefined) {
    return false
  }
  
  // If it's a string, ensure it's not empty or just whitespace
  if (typeof input === 'string') {
    return input.trim() !== ''
  }

  // If it's an array (often used in unique values or multiple selection)
  if (Array.isArray(input)) {
    if (input.length === 0) return false
    // Check if the first item is valid (usually {value: '...', label: '...'})
    const firstItem = input[0]
    if (firstItem && typeof firstItem === 'object' && 'value' in firstItem) {
      return isQueryInputValid(firstItem.value)
    }
    return true
  }

  // If it's a jimu-core Immutable array
  if (input.asMutable && typeof input.toArray === 'function') {
    const arr = input.toArray()
    if (arr.length === 0) return false
    const firstItem = arr[0]
    if (firstItem && typeof firstItem === 'object' && 'value' in firstItem) {
      return isQueryInputValid(firstItem.value)
    }
    return true
  }
  
  // For other types (numbers, dates), if it exists, we count it as valid
  return true
}

/**
 * Sanitizes user input for query tasks.
 * 1. Strips leading and trailing whitespace.
 * 2. Prevents basic SQL injection by escaping single quotes.
 * 3. Handles empty or whitespace-only strings.
 * 
 * @param input - The raw user input string
 * @returns Sanitized string or null if input is empty
 */
export function sanitizeQueryInput (input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }
  
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }
  
  // Basic SQL escaping: replace single quotes with double single quotes
  return trimmed.replace(/'/g, "''")
}

/**
 * Sanitizes all values within an IMSqlExpression object.
 * 
 * @param sqlExpr - The raw SQL expression object
 * @returns A new sanitized IMSqlExpression object
 */
export function sanitizeSqlExpression (sqlExpr: IMSqlExpression): IMSqlExpression {
  if (!sqlExpr || !sqlExpr.parts) {
    return sqlExpr
  }

  let sanitizedExpr = sqlExpr
  sqlExpr.parts.forEach((part, index) => {
    if (part.type === 'SINGLE' && part.valueOptions?.value !== undefined) {
      const rawValue = part.valueOptions.value
      
      // CASE 1: Simple String
      if (typeof rawValue === 'string') {
        const sanitizedValue = sanitizeQueryInput(rawValue)
        if (sanitizedValue !== rawValue) {
          sanitizedExpr = sanitizedExpr.setIn(['parts', index, 'valueOptions', 'value'], sanitizedValue)
        }
      } 
      // CASE 2: Array of objects (Unique Values / Dropdowns)
      // We must preserve the Immutable structure to avoid "asMutable" errors
      else if (Array.isArray(rawValue) || (rawValue && typeof (rawValue as any).toArray === 'function')) {
        const isImmutable = typeof (rawValue as any).toArray === 'function'
        const arr = isImmutable ? (rawValue as any).toArray() : (rawValue as any[])
        
        let changed = false
        const sanitizedArr = arr.map(item => {
          if (item && typeof item === 'object' && 'value' in item && typeof item.value === 'string') {
            const sanitizedVal = sanitizeQueryInput(item.value)
            if (sanitizedVal !== item.value) {
              changed = true
              return { ...item, value: sanitizedVal }
            }
          }
          return item
        })
        
        if (changed) {
          // If it was Immutable, we should ideally use Immutable methods to update,
          // but setIn on the top-level expression with a plain array/object 
          // usually triggers the framework's auto-conversion.
          sanitizedExpr = sanitizedExpr.setIn(['parts', index, 'valueOptions', 'value'], sanitizedArr)
        }
      }
    }
  })

  return sanitizedExpr
}

export async function getPopupTemplate (
  outputDS: FeatureLayerDataSource,
  queryItem: ImmutableObject<QueryItemType>,
  originDSOverride?: FeatureLayerDataSource // r023.17: Allow caller to specify correct origin DS for cross-query records
): Promise<{ popupTemplate?: __esri.PopupTemplate, defaultPopupTemplate?: __esri.PopupTemplate }> {
  const { resultFieldsType, resultDisplayFields, resultTitleExpression = '' } = queryItem
  // r023.17: Use override origin DS when provided (cross-query accumulation mode)
  // Without this, switching queries in Add mode causes the CURRENT query's origin DS
  // to be used for ALL records, producing wrong popup templates for prior-query records.
  const currentOriginDs: FeatureLayerDataSource = originDSOverride || (outputDS.getOriginDataSources()[0] as FeatureLayerDataSource)
  // r025.065: Use inheritance-aware resolution for group layer popup support
  const popupInfo = resolvePopupInfoWithInheritance(currentOriginDs)

  if (resultFieldsType === FieldsType.SelectAttributes) {
    let fields: string[]
    if (resultDisplayFields == null) {
      const fieldsInContent = getFieldInfosInPopupContent(popupInfo)
      if (fieldsInContent.length > 0) {
        const uniqueFields = new Set(fieldsInContent.map(ele => ele.fieldName))
        fields = Array.from(uniqueFields)
      } else {
        // return all fields by default
        const allFieldsSchema = outputDS.getSchema()
        fields = allFieldsSchema?.fields ? Object.values(allFieldsSchema.fields).map(field => field.jimuName) : []
      }
    } else {
      fields = resultDisplayFields.asMutable({ deep: true })
    }
    if (popupInfo) {
      const fieldInfos = []
      fields.forEach(field => {
        const fieldInfo = popupInfo.fieldInfos.find(fieldInfo => fieldInfo.fieldName === field)
        if (fieldInfo) {
          fieldInfo.visible = true
          fieldInfos.push(fieldInfo)
        } else {
          fieldInfos.push({
            fieldName: field,
            label: field
          })
        }
      })
      return {
        popupTemplate: {
          fieldInfos,
          content: [{
            type: 'fields'
          }],
          title: resultTitleExpression
        }
      } as any
    }
    return {
      popupTemplate: {
        fieldInfos: fields.map(field => ({
          fieldName: field,
          label: field
        })),
        content: [{
          type: 'fields'
        }],
        title: resultTitleExpression
      } as any
    }
  }
  // r026.005: Custom Template mode — use CustomContent (same pattern as FeedSimple).
  // Esri calls our creator() per feature; we run substituteTokens → convertTemplateToHtml
  // and return a DOM element with fully resolved HTML. Esri renders it as-is.
  // This gives us full control: markdown formatting, pipe filters, links — everything works.
  if (resultFieldsType === FieldsType.CustomTemplate) {
    const resultContentExpression = (queryItem as any).resultContentExpression || ''
    const [CustomContent] = await loadArcGISJSAPIModules(['esri/popup/content/CustomContent'])
    const customContent = new CustomContent({
      outFields: ['*'],
      creator: (event: any) => {
        try {
          const graphic = event?.graphic
          if (!graphic?.attributes) {
            return document.createElement('div')
          }
          const attributes = graphic.attributes
          // Substitute {{field | filter}} tokens, with legacy {field} fallback
          let substituted = substituteTokens(resultContentExpression, attributes)
          substituted = substituted.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
            const val = attributes[field]
            return val != null ? String(val) : ''
          })
          const html = convertTemplateToHtml(substituted)

          const div = document.createElement('div')
          div.style.fontSize = '0.875rem'
          div.style.lineHeight = '1.4'
          div.style.fontStyle = 'italic'
          div.style.color = 'var(--sys-color-surface-paper-text, #333)'

          const style = document.createElement('style')
          style.textContent = 'p{margin:0 0 4px}a{color:var(--sys-color-primary-main, #0079c1);text-decoration:none}a:hover{text-decoration:underline}hr{margin:6px 0;border:none;border-top:1px solid #ddd}strong{font-weight:700}em{font-style:italic}h3,h4,h5,h6{font-style:normal;font-weight:600;margin:0 0 4px}'
          div.appendChild(style)
          div.innerHTML += html
          return div
        } catch (err) {
          debugLogger.log('QUERY', { action: 'custom-template-popup-error', error: err instanceof Error ? err.message : 'Unknown' })
          return document.createElement('div')
        }
      }
    })

    return {
      popupTemplate: {
        title: resultTitleExpression, // {field} title — Esri handles this natively
        content: [customContent]
      },
      isCustomTemplate: true,
      rawTemplate: resultContentExpression // r026.005: Top-level for cache (Esri strips non-standard props)
    } as any
  }

  // the source layer will provide popup info
  let layerObject
  if (currentOriginDs.layer) {
    layerObject = currentOriginDs.layer
  } else {
    layerObject = await currentOriginDs.createJSAPILayerByDataSource()
  }
  if (layerObject) {
    await layerObject.load()
  }

  // r025.065: Return the CONFIGURED popupTemplate first (web map popup), not just
  // the auto-generated defaultPopupTemplate.  Previous code only returned
  // defaultPopupTemplate, which is a generic all-fields list.  The configured
  // popup was only found by accident downstream in feature-info.tsx when
  // layer.popupTemplate happened to be populated — which fails for group layer
  // children whose popup is defined at the GL level.
  const configuredPopup = layerObject?.associatedLayer?.popupTemplate || layerObject?.popupTemplate
  const defaultPopup = layerObject?.associatedLayer?.defaultPopupTemplate || layerObject?.defaultPopupTemplate

  if (configuredPopup) {
    return { popupTemplate: configuredPopup, defaultPopupTemplate: defaultPopup }
  }

  // r025.065: If no configured popup on the layer, try the parent DataSource
  // (group layer may hold the popupInfo that ExB didn't push to the child)
  const inheritedPopupInfo = resolvePopupInfoWithInheritance(currentOriginDs)
  if (inheritedPopupInfo) {
    debugLogger.log('QUERY', 'getPopupTemplate: inherited popupInfo from parent DataSource', { fields: inheritedPopupInfo.fieldInfos?.length })
    // Build a PopupTemplate from the inherited popupInfo
    return {
      popupTemplate: {
        title: inheritedPopupInfo.title || '',
        content: inheritedPopupInfo.popupElements?.length > 0
          ? inheritedPopupInfo.popupElements
          : [{ type: 'fields' }],
        fieldInfos: inheritedPopupInfo.fieldInfos
      } as any,
      defaultPopupTemplate: defaultPopup
    }
  }

  return { defaultPopupTemplate: defaultPopup }
}

export function generateQueryParams (
  outputDS: FeatureLayerDataSource,
  sqlExpr: IMSqlExpression,
  spatialFilter: SpatialFilterObj,
  queryItem: ImmutableObject<QueryItemType>,
  page: number,
  pageSize: number
): QueryParams {
  const currentQueryDsJson = outputDS.getDataSourceJson()
  const currentOriginDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const isLocalDs = currentQueryDsJson?.isDataInDataSourceInstance
  if (isLocalDs) {
    outputDS.setSourceRecords(currentOriginDs.getSourceRecords())
  }

  const { useAttributeFilter, useSpatialFilter, sortOptions, resultFieldsType, resultDisplayFields, resultTitleExpression } = queryItem
  
  // DETERMINE MINIMAL FIELDS (The "Field Shredder" Optimization)
  // To achieve performance parity with Web AppBuilder, we must avoid fetching every 
  // column in the database (* or all). We surgically request only the fields 
  // needed for the Title, the Attribute List, and the ID field.
  let outputFields: string[] = []
  if (resultFieldsType === FieldsType.CustomTemplate) {
    // r023.18: Custom Template mode - extract fields from both title and content expressions
    const contentExpr = (queryItem as any).resultContentExpression || ''
    outputFields = combineFields(null, resultTitleExpression || '', outputDS.getIdField(), contentExpr)
  } else if (resultFieldsType === FieldsType.SelectAttributes && resultDisplayFields) {
    outputFields = combineFields(resultDisplayFields as any, resultTitleExpression || '', outputDS.getIdField())
  } else {
    // Popup mode: Get only visible fields from popup info
    // r025.065: Only use the DIRECT popupInfo for field shredding, not inherited.
    // Inherited GL popup may mark few fields visible (for popup display), but the
    // query needs all fields so the table view has full data.  Inherited popupInfo
    // is used for popup RENDERING (getPopupTemplate), not field FETCHING.
    const popupInfo = currentOriginDs.getPopupInfo?.()
    const fieldNames = Object.values(currentOriginDs.getSchema().fields ?? {}).map(f => f.name)
    const validFieldInfos = popupInfo?.fieldInfos?.filter(fieldInfo => fieldInfo.visible !== false && fieldNames.includes(fieldInfo.fieldName))
    outputFields = validFieldInfos?.map(fieldInfo => fieldInfo.fieldName) || []
    
    // Always ensure ID field is included
    const idField = outputDS.getIdField()
    if (idField && !outputFields.includes(idField)) {
      outputFields.push(idField)
    }
  }

  const mergedQueryParams = outputDS.mergeQueryParams(currentOriginDs.getCurrentQueryParams() ?? {}, {
    where: (useAttributeFilter && sqlExpr?.sql) ? dataSourceUtils.getArcGISSQL(sqlExpr, outputDS).sql : '1=1',
    sqlExpression: (useAttributeFilter && sqlExpr?.sql) ? sqlExpr : null,
    // FORCE minimal fields here to override any framework "*" or "all"
    outFields: outputFields
  } as any)

  // PERFORMANCE OPTIMIZATION: Universal SQL Optimizer
  // We normalize the user's input to UPPERCASE to ensure case-insensitivity while 
  // unwrapping any LOWER() function around the field name. This allows the database 
  // to use its attribute indexes (SARGable query).
  if (mergedQueryParams.where && mergedQueryParams.where.includes('LOWER(')) {
    const optimizedWhere = mergedQueryParams.where.replace(/LOWER\(([^)]+)\)\s*(=|LIKE)\s*'([^']*)'/gi, (match, field, operator, value) => {
      // Normalize both sides to UPPERCASE. This works for ANY field name.
      // We keep the field name "naked" so the index is used.
      return `${field} ${operator} '${value.toUpperCase()}'`
    })
    
    if (optimizedWhere !== mergedQueryParams.where) {
      debugLogger.log('TASK', {
        event: 'sql-optimized',
        original: mergedQueryParams.where,
        optimized: optimizedWhere
      })
      mergedQueryParams.where = optimizedWhere
    }
  }

  // compose query params for query
  const queryParams: FeatureLayerQueryParams = {
    // url: ds.url,
    returnGeometry: true,
    /** 
     * PERFORMANCE OPTIMIZATION: Force lower precision for all display queries.
     */
    maxAllowableOffset: 0.1, 
    page,
    // Limit pageSize to a sane default if not provided or too large
    pageSize: (pageSize && pageSize < 1000) ? pageSize : 1000,
    ...mergedQueryParams
  }

  // Final override to ensure no "*" leaks through from any merge operation
  if (!queryParams.outFields || queryParams.outFields.includes('*')) {
    queryParams.outFields = outputFields
  }

  // Diagnostic log: Show exactly WHICH fields are being sent
  debugLogger.log('TASK', {
    event: 'requesting-data',
    fieldsCount: queryParams.outFields?.length,
    fields: queryParams.outFields?.join(', '),
    pageSize: queryParams.pageSize,
    offset: queryParams.maxAllowableOffset
  })

  if (useSpatialFilter && spatialFilter?.geometry) {
    const { geometry, relation = SpatialRelation.Intersect, buffer } = spatialFilter

    const spatialQueryParams: FeatureLayerQueryParams = {
      geometryType: dataSourceUtils.changeJSAPIGeometryTypeToRestAPIGeometryType(geometry.type),
      geometry: geometry.toJSON(),
      spatialRel: mapJSAPISpatialRelToDsSpatialRel[relation],
      distance: buffer?.distance,
      units: buffer?.unit ? mapJSAPIUnitToDsUnit[buffer.unit] : undefined
    }
    Object.assign(queryParams, spatialQueryParams)
  }

  if (sortOptions?.length > 0) {
    Object.assign(queryParams, {
      orderByFields: sortOptions.map(item => `${item.jimuFieldName} ${item.order}`)
    })
  }

  return queryParams
}

export async function executeCountQuery (
  widgetId: string,
  outputDS: FeatureLayerDataSource,
  queryParams: QueryParams
): Promise<number> {
  const result = await outputDS.loadCount(queryParams, { widgetId, refresh: true })
  return result != null ? result : 0
}

export async function executeQuery (
  widgetId: string,
  queryItem: ImmutableObject<QueryItemType>,
  outputDS: FeatureLayerDataSource,
  queryParams: QueryParams
): Promise<{ records?: DataRecord[], fields?: string[] }> {
  const popupInfo = outputDS.getPopupInfo()

  const layerDefinition = outputDS.getLayerDefinition()
  const getDefaultFieldInfos = () =>
    [
      { fieldName: layerDefinition?.objectIdField ?? 'objectid', label: 'OBJECTID', tooltip: '', visible: true }
    ] as IFieldInfo[]
  const fieldInfos = ((fieldInfos) => (fieldInfos.length ? fieldInfos : getDefaultFieldInfos()))(
    (popupInfo?.fieldInfos || []).filter((i) => i.visible)
  )
  // const fields = outputDS.getSchema()?.fields
  // let selectedFieldNames
  // if (queryItem.resultFieldsType === FieldsType.SelectAttributes) {
  //   selectedFieldNames = [].concat(queryItem.resultDisplayFields, queryItem.resultTitleFields)
  // } else {
  //   selectedFieldNames = fieldInfos.map((fieldInfo) => fieldInfo.fieldName)
  // }
  // const selectedFieldJimuNames = fields
  //   ? Object.keys(fields).filter((jimuName) => selectedFieldNames.includes(fields[jimuName].name))
  //   : []
  // outputDS.setSelectedFields(selectedFieldJimuNames)
  debugLogger.log('QUERY-PATH', {
    event: 'EXB-LEGACY-PATH',
    path: 'outputDS.load()',
    widgetId,
    note: 'If you see this, the old ExB query path is running. USE_DIRECT_QUERY may be false.',
    timestamp: Date.now()
  })
  const startTime = performance.now()
  let records = await outputDS.load(queryParams, { widgetId })
  const fetchTime = performance.now() - startTime
  
  if (records == null) {
    records = []
  }
  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  
  const layerStartTime = performance.now()
  const layerObject = await getLayerObject(originDs)
  const layerTime = performance.now() - layerStartTime

  debugLogger.log('TASK', {
    event: 'query-complete',
    fetchTime: Math.round(fetchTime),
    layerTime: Math.round(layerTime),
    totalTime: Math.round(performance.now() - startTime),
    recordCount: records.length
  })
  
  records.forEach((record) => {
    const feature = (record as any).feature
    if (layerObject) {
      feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
    }
    feature.layer = feature.sourceLayer
  })
  const queryResult = {
    records,
    fields: fieldInfos.map((fieldInfo) => fieldInfo.fieldName)
  }

  // publish message
  const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, RecordSetChangeType.CreateUpdate, [{
    records: outputDS.getAllLoadedRecords(),
    fields: queryResult.fields,
    dataSource: outputDS,
    name: outputDS.id,
    label: outputDS.getLabel()
  }])
  MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)

  return queryResult
}

async function getLayerObject (dataSource: FeatureLayerDataSource) {
  const layerObject = await dataSource.createJSAPILayerByDataSource() as __esri.Layer
  // layerObject may be undefined if the data source is added by URL
  if (layerObject) {
    await layerObject.load()
  }
  return layerObject
}


