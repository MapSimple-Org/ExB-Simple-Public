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
import { getFieldInfosInPopupContent } from 'widgets/shared-code/common'

export function combineFields (resultDisplayFields: ImmutableArray<string>, resultTitleExpression: string, idField?: string): string[] {
  const fields = new Set<string>()
  resultDisplayFields?.forEach(item => fields.add(item))
  if (resultTitleExpression) {
    const templates = resultTitleExpression.match(/\{\w*\}/g)
    if (templates?.length > 0) {
      templates.forEach(item => fields.add(item.substring(1, item.length - 1)))
    }
  }
  if (idField) {
    fields.add(idField)
  }
  return Array.from(fields)
}

export async function getPopupTemplate (
  outputDS: FeatureLayerDataSource,
  queryItem: ImmutableObject<QueryItemType>
): Promise<{ popupTemplate?: __esri.PopupTemplate, defaultPopupTemplate?: __esri.PopupTemplate }> {
  const { resultFieldsType, resultDisplayFields, resultTitleExpression = '' } = queryItem
  const currentOriginDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const popupInfo = currentOriginDs.getPopupInfo()

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
  return { defaultPopupTemplate: layerObject?.associatedLayer?.defaultPopupTemplate || layerObject?.defaultPopupTemplate }
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
  if (resultFieldsType === FieldsType.SelectAttributes && resultDisplayFields) {
    outputFields = combineFields(resultDisplayFields as any, resultTitleExpression || '', outputDS.getIdField())
  } else {
    // Popup mode: Get only visible fields from popup info
    const popupInfo = currentOriginDs.getPopupInfo()
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
      console.log(`[QUERYSIMPLE-PERF] Universal SQL Optimization: ${mergedQueryParams.where} -> ${optimizedWhere}`)
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
  console.log(`[QUERYSIMPLE-PERF] Requesting data: 
    - Fields Count: ${queryParams.outFields?.length} 
    - Fields: ${queryParams.outFields?.join(', ')}
    - PageSize: ${queryParams.pageSize}
    - Offset: ${queryParams.maxAllowableOffset}`)

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

  console.log(`[QUERYSIMPLE-PERF] executeQuery complete. Fetch: ${Math.round(fetchTime)}ms, Layer: ${Math.round(layerTime)}ms, Total: ${Math.round(performance.now() - startTime)}ms, Count: ${records.length}`)
  
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


