import type { FeatureLayerDataSource, FeatureLayerQueryParams } from 'jimu-core'

export async function getDataRecord (objectIds: number[], objectIdFieldName: string, originDS: FeatureLayerDataSource) {
  if (!objectIds || (objectIds.length === 0) || !objectIdFieldName) return []
  const whereClause = objectIdFieldName + ' IN (' + objectIds.join(',') + ')'
  const featureQuery: FeatureLayerQueryParams = ({
    where: whereClause,
    outFields: ['*'],
    returnGeometry: true
  })
  const results = await originDS.query(featureQuery)
  if (results?.records?.length === 0) return []
  return results?.records
}
