import {
  type FieldSchema, type ImmutableObject, dataSourceUtils, MessageActionConnectionType, type DataSource, messageActionUtils, JimuFieldType, type Message,
  type DataRecordsSelectionChangeMessage, type FeatureDataRecord, Immutable, type DataRecord, type ArcGISQueriableDataSource, type FeatureLayerDataSource,
  type SceneLayerDataSource, type BuildingComponentSubLayerDataSource, DataSourceManager, type UseDataSource
} from 'jimu-core'
import type { IMConfig as FlashMessageActionIMConfig } from '../message-actions/flash-action-setting'
import type { IMConfig as FilterMessageActionIMConfig } from '../message-actions/filter-action-setting'
import { isExpressMode } from './action-utils'

type FlashFilterMessageActionConfig = FlashMessageActionIMConfig | FilterMessageActionIMConfig

export interface MessageFieldAndActionField {
  messageField: ImmutableObject<FieldSchema>
  actionField: ImmutableObject<FieldSchema>
}

export interface FlashFilterActionValue {
  layerDataSourceId: string
  querySQL: string
}

/**
 * Calculate messageAction.useDataSources by messageAction.config for map flash/filter message actions.
 * @param messageActionConfig
 * @returns
 */
export function getMessageActionUseDataSourcesByConfig (messageActionConfig: FlashFilterMessageActionConfig): UseDataSource[] {
  const useDataSources: UseDataSource[] = []

  if (messageActionConfig) {
    if (messageActionConfig.messageUseDataSource) {
      const clonedUseDataSource = Immutable(messageActionConfig.messageUseDataSource).asMutable({ deep: true })
      useDataSources.push(clonedUseDataSource)
    }

    if (messageActionConfig.actionUseDataSource) {
      // If auto bound, actionUseDataSource is same with messageUseDataSource. We need to check it here to avoid adding duplicate useDataSource into useDataSources.
      if (useDataSources.length === 0 || (useDataSources.length > 0 && messageActionConfig.actionUseDataSource.dataSourceId !== useDataSources[0].dataSourceId)) {
        const clonedUseDataSource = Immutable(messageActionConfig.actionUseDataSource).asMutable({ deep: true })
        useDataSources.push(clonedUseDataSource)
      }
    }
  }

  return useDataSources
}

export function isUseAnyTriggerData (messageActionConfig?: FlashMessageActionIMConfig): boolean {
  const _isExpressMode = isExpressMode()
  const _useAnyTriggerData = messageActionConfig?.useAnyTriggerData
  const result = _isExpressMode || _useAnyTriggerData
  return result
}

export function getFlashFilterActionValueForUseAnyTriggerData (records: DataRecord[]): FlashFilterActionValue {
  let layerDataSourceId: string = ''
  let querySQL = ''

  if (records.length > 0) {
    const recordMainDs = records[0]?.dataSource?.getMainDataSource() as ArcGISQueriableDataSource

    if (recordMainDs) {
      layerDataSourceId = recordMainDs.id
      const jimuObjectIdFieldName = recordMainDs.getIdField()
      const objectIdFieldSchema = jimuObjectIdFieldName && recordMainDs.getSchema()?.fields?.[jimuObjectIdFieldName]

      if (objectIdFieldSchema) {
        const objectIds: string[] = []
        records.forEach(record => {
          const objectId = record.getId()

          if (objectId !== null && objectId !== undefined && objectId !== '') {
            objectIds.push(objectId)
          }
        })

        const uniqueObjectIds = getUniqueFormattedMessageFieldValues(objectIds, JimuFieldType.Number)

        if (uniqueObjectIds.length > 0) {
          const useCaseSensitive = true
          const sqlExpressionByMessageFieldValues = messageActionUtils.getSqlExpressionWidthMessageFieldValues(uniqueObjectIds, objectIdFieldSchema, recordMainDs, useCaseSensitive)

          if (sqlExpressionByMessageFieldValues) {
            const imSqlExpressionByMessageFieldValues = Immutable(sqlExpressionByMessageFieldValues)
            const sqlResult = dataSourceUtils.getArcGISSQL(imSqlExpressionByMessageFieldValues, recordMainDs)

            if (sqlResult?.sql) {
              querySQL = sqlResult?.sql
            }
          }
        }
      }
    }
  }

  let actionValue: FlashFilterActionValue = null

  if (layerDataSourceId && querySQL) {
    actionValue = {
      layerDataSourceId,
      querySQL
    }
  }

  return actionValue
}

// This method is only called when actionConfig.enabledDataRelationShip is true.
function getMessageFieldAndActionField (actionConfig: FlashFilterMessageActionConfig, messageDataSource: DataSource, actionDataSource: DataSource): MessageFieldAndActionField {
  let messageField: ImmutableObject<FieldSchema> = null
  let actionField: ImmutableObject<FieldSchema> = null

  if (actionConfig.messageUseDataSource.mainDataSourceId === actionConfig.actionUseDataSource.mainDataSourceId &&
      actionConfig.messageUseDataSource.rootDataSourceId === actionConfig.actionUseDataSource.rootDataSourceId) {
    // if trigger ds is same to action ds, the "Auto bound" case
    const messageDsSchema = messageDataSource.getSchema()
    const objectIdJimuFieldName = messageDsSchema && messageDsSchema.fields && Object.keys(messageDsSchema.fields).find(jimuFieldName => messageDsSchema.fields[jimuFieldName].esriType === 'esriFieldTypeOID')
    messageField = messageDsSchema && messageDsSchema.fields && messageDsSchema.fields[objectIdJimuFieldName]
    actionField = messageField
  } else {
    // if trigger ds isn't same to action ds, not the "Auto bound" case
    let messageJimuFieldName: string
    let actionJimuFieldName: string

    if (actionConfig.connectionType === MessageActionConnectionType.UseLayersRelationship) {
      // "Use layer's relationship" radio checked
      // get key fields in relationships and whether it has a relationship table
      const relationshipInfo = dataSourceUtils.getJimuDataSourceRelationship(messageDataSource as FeatureLayerDataSource, actionDataSource as FeatureLayerDataSource)

      // In fact, relationshipInfo should not be null unless it is deleted from service.
      if (relationshipInfo) {
        messageJimuFieldName = relationshipInfo.keyField
        actionJimuFieldName = relationshipInfo.relatedKeyField
      }
    } else {
      // "Set custom connection fields" radio checked
      messageJimuFieldName = actionConfig.messageUseDataSource.fields?.[0]
      actionJimuFieldName = actionConfig.actionUseDataSource.fields?.[0]
    }

    if (messageJimuFieldName) {
      messageField = messageDataSource.getSchema().fields?.[messageJimuFieldName]
    }

    if (actionJimuFieldName) {
      actionField = actionDataSource.getSchema().fields?.[actionJimuFieldName]
    }
  }

  const result: MessageFieldAndActionField = {
    messageField,
    actionField
  }

  return result
}

function getUniqueFormattedMessageFieldValues (originalFieldValues: any[], messageFieldType: JimuFieldType): any[] {
  const uniqueFormattedValues = []

  for (let i = 0; i < originalFieldValues.length; i++) {
    const originalFieldValue = originalFieldValues[i] // not formatted value
    const formattedFieldValue = messageActionUtils.formatValue(originalFieldValue, messageFieldType) // formatted value, maybe number, string or null

    if (uniqueFormattedValues.includes(formattedFieldValue)) {
      continue
    } else {
      uniqueFormattedValues.push(formattedFieldValue)
    }
  }

  return uniqueFormattedValues
}

async function getWhereSqlByTriggerActionConnection (message: Message, actionConfig: FlashFilterMessageActionConfig, messageDataSource: DataSource, actionDataSource: DataSource): Promise<string> {
  let whereSql = ''

  if (actionConfig.enabledDataRelationShip) {
    // The "Trigger / action connection" option is checked.
    let {
      messageField,
      actionField
    } = getMessageFieldAndActionField(actionConfig, messageDataSource, actionDataSource)

    // make sure both messageField and actionField not empty
    if (messageField && actionField) {
      const messageFieldName = messageField.name
      const messageFieldType = messageField.type

      const tempMessage: DataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage
      let uniqueFormattedMessageFieldValues: any[] = [] // unique formatted values

      if (actionConfig.connectionType === MessageActionConnectionType.UseLayersRelationship) {
        // "Use layer's relationship" radio checked
        const originalFieldValues = await (messageDataSource as FeatureLayerDataSource)?.queryRelatedFieldValues(
          (tempMessage.records || []) as FeatureDataRecord[],
          actionDataSource as FeatureLayerDataSource,
          actionField.name) || []

        uniqueFormattedMessageFieldValues = getUniqueFormattedMessageFieldValues(originalFieldValues, messageFieldType)

        if (uniqueFormattedMessageFieldValues.length === 0) {
          uniqueFormattedMessageFieldValues = ['-1']
          actionField = actionDataSource.getSchema().fields[actionDataSource.getIdField()]
        }
      } else {
        // "Set custom connection fields" radio checked
        const originalFieldValues = tempMessage.records.map(record => {
          const originalFieldValue = record.getData()[messageFieldName]
          return originalFieldValue
        })

        uniqueFormattedMessageFieldValues = getUniqueFormattedMessageFieldValues(originalFieldValues, messageFieldType)
      }

      whereSql = ''

      if (uniqueFormattedMessageFieldValues.length > 0) {
        const useCaseSensitive = true
        const sqlExpressionByMessageFieldValues = messageActionUtils.getSqlExpressionWidthMessageFieldValues(uniqueFormattedMessageFieldValues, actionField, actionDataSource, useCaseSensitive)

        if (sqlExpressionByMessageFieldValues) {
          const imSqlExpressionByMessageFieldValues = Immutable(sqlExpressionByMessageFieldValues)
          const sqlResult = dataSourceUtils.getArcGISSQL(imSqlExpressionByMessageFieldValues, actionDataSource)

          if (sqlResult?.sql) {
            whereSql = sqlResult?.sql
          }
        }
      }

      if (!whereSql) {
        whereSql = ''
      }
    }
  }

  if (!whereSql) {
    whereSql = ''
  }

  return whereSql
}

function getWhereSqlByMoreConditions (records: DataRecord[], actionConfig: FlashFilterMessageActionConfig, actionDataSource: DataSource): string {
  let whereSql = ''

  if (records.length > 0) {
    // If user sets "More conditions", then actionConfig.sqlExprObj is not empty.
    // actionConfig.sqlExprObj is the SQL info for actionUseDataSource.
    const moreConditionSQL = actionConfig.sqlExprObj ? dataSourceUtils.getArcGISSQL(actionConfig.sqlExprObj, actionDataSource).sql : null

    if (moreConditionSQL) {
      whereSql = moreConditionSQL
    }
  } else {
    // don't remove the following line
    whereSql = ''
  }

  if (!whereSql) {
    whereSql = ''
  }

  return whereSql
}

export async function getWhereSqlByTriggerActionConnectionAndMoreConditions (
  message: Message,
  records: DataRecord[],
  actionConfig: FlashFilterMessageActionConfig,
  messageDataSource: DataSource,
  actionDataSource: DataSource
): Promise<string> {
  // whereSql = (the where of 'Trigger / action connection') && (the where of 'More conditions')
  let whereSql = ''

  const whereSQLs: string[] = []

  // calculate the where of 'Trigger / action connection'
  const whereSqlByTriggerActionConnection = await getWhereSqlByTriggerActionConnection(message, actionConfig, messageDataSource, actionDataSource)

  if (whereSqlByTriggerActionConnection) {
    whereSQLs.push(whereSqlByTriggerActionConnection)
  }

  // calculate the where of 'More conditions'
  const moreConditionSQL = getWhereSqlByMoreConditions(records, actionConfig, actionDataSource)

  if (moreConditionSQL) {
    whereSQLs.push(moreConditionSQL)
  }

  if (whereSQLs.length === 0) {
    whereSql = ''
  } else if (whereSQLs.length === 1) {
    whereSql = whereSQLs[0]
  } else if (whereSQLs.length === 2) {
    whereSql = `(${whereSQLs[0]}) AND (${whereSQLs[1]})`
  }

  if (!whereSql) {
    whereSql = ''
  }

  return whereSql
}

export function getMainDataSourceIdsBySelectionChangeMessage (message: DataRecordsSelectionChangeMessage): string[] {
  const mainDataSourceIds: string[] = []
  const records = message.records || []
  const messageDataSourceIds = (message.dataSourceIds || []).filter(dataSourceId => !!dataSourceId)

  if (records.length > 0 && records[0]) {
    const recordMainDs = records[0]?.dataSource?.getMainDataSource() as ArcGISQueriableDataSource

    if (recordMainDs) {
      mainDataSourceIds.push(recordMainDs.id)

      // case1: 3D features, associated data source
      // When clicking/selecting the 3D features on the SceneLayer/BuildingComponentSublayer, recordMainDs is FeatureLayerDataSource, recordAssociatedDs is SceneLayerDataSource,
      // but actionConfig.messageUseDataSource.mainDataSourceId is the id of SceneLayerDataSource, so we also need to check recordAssociatedDs.id.
      type HasAssociatedDataSource = SceneLayerDataSource | FeatureLayerDataSource | BuildingComponentSubLayerDataSource
      const recordAssociatedDs = (recordMainDs as HasAssociatedDataSource).getAssociatedDataSource && (recordMainDs as HasAssociatedDataSource).getAssociatedDataSource()

      if (recordAssociatedDs) {
        mainDataSourceIds.push(recordAssociatedDs.id)
      }
    }
  }

  if (messageDataSourceIds?.length > 0) {
    const dsm = DataSourceManager.getInstance()
    messageDataSourceIds.forEach(dataSourceId => {
      const ds = dsm.getDataSource(dataSourceId)

      if (ds) {
        const mainDs = ds.getMainDataSource()

        if (mainDs) {
          mainDataSourceIds.push(mainDs.id)
        }
      }
    })
  }

  const uniqueMainDataSourceIds: string[] = Array.from(new Set(mainDataSourceIds))

  return uniqueMainDataSourceIds
}
