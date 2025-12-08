import { type DataSourceJson, type DataSourceSchema, type UseDataSource, DataSourceTypes, type IMDataSourceSchema, JimuFieldType, type FieldSchema, EsriFieldType } from 'jimu-core'
import { ObjectIdField } from '../../constants'

const ObjectIdSchema: FieldSchema = {
  jimuName: ObjectIdField,
  alias: 'OBJECTID',
  type: JimuFieldType.Number,
  esriType: EsriFieldType.OID,
  name: ObjectIdField
}

/**
 * Get the initial data source schema.
 * @param label
 */
const getInitSchema = (label: string = ''): DataSourceSchema => {
  return {
    label,
    idField: ObjectIdSchema.jimuName,
    fields: {
      [ObjectIdSchema.jimuName]: ObjectIdSchema
    }
  } as DataSourceSchema
}

/**
 * Get original fields from output ds schema (without objectid field)
 * @param schema
 */
export const getSchemaOriginFields = (schema: IMDataSourceSchema): string[] => {
  if (!schema?.fields) return
  const fields = []
  Object.entries(schema.fields)?.forEach(([fieldName, fieldSchema]) => {
    //The objectid field is required in the schema, but it may not be used.
    if (fieldName === ObjectIdSchema.jimuName && fieldSchema.jimuName === ObjectIdSchema.jimuName) {
      return null
    }
    const originFields = fieldSchema.originFields ?? []
    originFields.forEach((field) => {
      if (field) {
        fields.push(field)
      }
    })
  })
  return Array.from(new Set(fields))
}

/**
 * Create the initial output data source.
 * @param originalId
 * @param label
 * @param useDataSource
 */
export const createInitOutputDataSource = (id: string, label: string, useDataSource: UseDataSource) => {
  const schema = getInitSchema(label)

  const outputDsJson: DataSourceJson = {
    id,
    type: DataSourceTypes.FeatureLayer,
    label,
    originDataSources: [useDataSource],
    isOutputFromWidget: true,
    isDataInDataSourceInstance: true,
    schema
  }

  return outputDsJson
}
