import { React, type IMFeatureLayerQueryParams, Immutable, getAppStore, type DataSourceJson, type ImmutableObject, utils } from 'jimu-core'

const DefaultQuery = Immutable({}) as IMFeatureLayerQueryParams
export const useMemoizedQuery = (inputQuery: IMFeatureLayerQueryParams = DefaultQuery) => {
  const { groupByFieldsForStatistics, outFields, outStatistics, where } = inputQuery
  const query = React.useMemo(() => {
    let query: IMFeatureLayerQueryParams = Immutable({})
    if (where) {
      query = query.set('where', where)
    }
    if (groupByFieldsForStatistics) {
      query = query.set('groupByFieldsForStatistics', groupByFieldsForStatistics)
    }
    if (outFields) {
      query = query.set('outFields', outFields)
    }
    if (outStatistics) {
      query = query.set('outStatistics', outStatistics)
    }
    return Object.keys(query).length > 0 ? query : null
  }, [groupByFieldsForStatistics, outFields, outStatistics, where])
  return query
}

export const updateDataSourceJson = (dsId: string, dsJson: ImmutableObject<DataSourceJson>) => {
  const oldAppConfig = getAppStore().getState().appConfig
  const appConfig = oldAppConfig.setIn(['dataSources', dsId], dsJson)
  utils.changeAppConfig(appConfig)
}
