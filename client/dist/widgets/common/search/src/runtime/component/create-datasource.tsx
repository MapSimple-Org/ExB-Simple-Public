/** @jsx jsx */
import { jsx, React, DataSourceComponent, Immutable, type ImmutableArray, DataSourceStatus } from 'jimu-core'
import { type IMConfig, type IMServiceList, type IMServiceListItem, SearchServiceType, SourceType, type IMDatasourceCreatedStatus } from '../../config'
import { getLocalId, getDatasource } from '../utils/utils'
import { getQueryByServiceListItem, loadDsRecords } from '../utils/search-service'
import { loadGeocodeOutputRecords } from '../utils/locator-service'
import type { JimuMapView } from 'jimu-arcgis'
const { useEffect, useRef, useState } = React
interface CreateDatasourceProps {
  id: string
  config: IMConfig
  serviceList: IMServiceList
  dsStatus: IMDatasourceCreatedStatus
  synchronizeSettings: boolean
  jimuMapView: JimuMapView
  searchTextForConfirmSearch: string
  handleSearchResultChange: (configId: string, newRecords: string[]) => void
  handleSelectionListChange: (selection: ImmutableArray<string>, configId: string) => void
  handleDsStatusChange: (configId: string, status: DataSourceStatus) => void
  clearSearchResult: () => void
}

const CreateDatasource = (props: CreateDatasourceProps) => {
  const { config, id, serviceList, synchronizeSettings, jimuMapView, searchTextForConfirmSearch, handleSearchResultChange, handleSelectionListChange, handleDsStatusChange, clearSearchResult } = props
  const configRef = useRef(config)

  const [layerHadSendQuery, setLayerHadSendQuery] = useState(false)


  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    if (searchTextForConfirmSearch) {
      setLayerHadSendQuery(true)
    }
    clearSearchResult()
  }, [searchTextForConfirmSearch, clearSearchResult])

  const createDsByServiceList = (serviceList: IMServiceList, hadInputSearchText: boolean) => {
    const dataSourceComponents = []
    for (const configId in serviceList) {
      dataSourceComponents.push(renderDatasourceComponent(serviceList[configId], configId, hadInputSearchText))
    }
    return dataSourceComponents
  }

  const onSelectionChange = React.useCallback((selection: ImmutableArray<string>, configId: string) => {
    handleSelectionListChange(selection, configId)
  }, [handleSelectionListChange])

  const updateSelectionWhenRecordChange = React.useCallback((dsId: string, configId: string) => {
    const localId = getLocalId(configId, id)
    const dataSource = getDatasource(dsId, localId)
    const selectionRecords = dataSource?.getSelectedRecords() || []
    const selectionRecordIds = selectionRecords.map(record => record.getId())
    handleSelectionListChange(Immutable(selectionRecordIds), configId)
  }, [id, handleSelectionListChange])


  const handleRecordChange = React.useCallback((serviceListItem: IMServiceListItem, configId: string, status?: DataSourceStatus) => {
    const { searchServiceType } = serviceListItem
    switch (searchServiceType) {
      case SearchServiceType.GeocodeService:
        loadGeocodeOutputRecords(serviceListItem?.asMutable({ deep: true }), config.resultMaxNumber, id).then(res => {
          const { records } = res
          const recordId = records?.map(record => record.getId())
          handleSearchResultChange(configId, recordId)
        })
        break
      case SearchServiceType.FeatureService:
        loadDsRecords(serviceListItem?.asMutable({ deep: true }), config.resultMaxNumber, id, configRef.current?.enableFiltering).then(res => {
          const { records } = res
          const recordId = records?.map(record => record.getId())
          handleSearchResultChange(configId, recordId)

          updateSelectionWhenRecordChange(serviceListItem?.useDataSource?.dataSourceId, configId)
        })
        break
    }

    if (status) {
      handleDsStatusChange(configId, status)
    }
  }, [config.resultMaxNumber, id, handleDsStatusChange, handleSearchResultChange, updateSelectionWhenRecordChange])

  const renderDatasourceComponent = React.useCallback((serviceListItem: IMServiceListItem, configId: string, hadInputSearchText: boolean) => {
    if (serviceListItem.searchServiceType === SearchServiceType.GeocodeService) {
      const outputDataSourceId = serviceListItem?.outputDataSourceId
      const outputDatasource = {
        dataSourceId: outputDataSourceId,
        mainDataSourceId: outputDataSourceId
      }
      const defaultQuery = {
        //`Data filtering changes` use where === '1=1' to determine whether there is a filter, so we need to change where to '2=2' to make `Data filtering changes` execute correctly.
        //After the execution of `Data filtering changes`, the final map extent is the extent collection of all records in output ds
        where: '2=2',
        sqlExpression: null,
        pageSize: config.resultMaxNumber,
        outFields: ['*'],
        page: 1,
        returnGeometry: true
      }
      if ((synchronizeSettings as any) !== false && config?.sourceType === SourceType.MapCentric) {
        const dataSource = getDatasource(outputDataSourceId)
        return (<div key={`${configId}_con`}>
          {outputDataSourceId && <DataSourceComponent
            dataSource={dataSource}
            query={defaultQuery}
            key={`${configId}_outputDataSource`}
            onDataSourceInfoChange={info => { handleRecordChange(serviceListItem, configId) }}
            onDataSourceStatusChange={status => { handleRecordChange(serviceListItem, configId, status) }}
            onSelectionChange={selection => { onSelectionChange(selection, configId) }}
            widgetId={id}
          />}
        </div>)
      } else {
        return (<div key={`${configId}_con`}>
          {outputDataSourceId && <DataSourceComponent
            useDataSource={Immutable(outputDatasource)}
            query={defaultQuery}
            key={`${configId}_outputDataSource`}
            onDataSourceInfoChange={info => { handleRecordChange(serviceListItem, configId) }}
            onDataSourceStatusChange={status => { handleRecordChange(serviceListItem, configId, status) }}
            onSelectionChange={selection => { onSelectionChange(selection, configId) }}
            widgetId={id}
          />}
        </div>)
      }
    }

    if (serviceListItem.searchServiceType === SearchServiceType.FeatureService) {
      const useDataSource = serviceListItem?.useDataSource
      const getQueryOptions = {
        serviceListItem: serviceListItem?.asMutable({ deep: true }),
        searchTextForConfirmSearch,
        jimuMapView: jimuMapView,
        sourceType: config.sourceType,
        searchInCurrentMapExtent: serviceListItem.searchInCurrentMapExtent,
        enableFiltering: config?.enableFiltering
      }
      const query = getQueryByServiceListItem(getQueryOptions)
      const localId = getLocalId(configId, id)
      return (<div key={`${configId}_con`}>
        {useDataSource && <DataSourceComponent
          useDataSource={Immutable(useDataSource)}
          query={layerHadSendQuery ? query : null}
          key={`${configId}_useDataSource`}
          onDataSourceInfoChange={info => { handleRecordChange(serviceListItem, configId) }}
          onSelectionChange={selection => { onSelectionChange(selection, configId) }}
          //For localDs, we need to set `listenSelection` to `true` to listen to the selection changes of main datasource
          onDataSourceCreated={ds => { ds.setListenSelection(true) }}
          onDataSourceStatusChange={status => { handleDsStatusChange(configId, status) }}
          onCreateDataSourceFailed={err => { handleDsStatusChange(configId, DataSourceStatus.CreateError) }}
          localId={localId}
          // widgetId={config?.enableFiltering ? id : null}
        />}
      </div>)
    }
  }, [config?.enableFiltering, config.resultMaxNumber, config.sourceType, handleDsStatusChange, handleRecordChange, id, jimuMapView, layerHadSendQuery, onSelectionChange, searchTextForConfirmSearch, synchronizeSettings])

  return (
    <div>
      {
        createDsByServiceList(serviceList, !!searchTextForConfirmSearch)
      }
    </div>
  )
}

export default CreateDatasource
