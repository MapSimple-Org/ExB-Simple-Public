import {
  React, type DataSource, type FeatureLayerQueryParams, DataSourceComponent, type IMUseDataSource, type QueriableDataSource, type IMDataSourceInfo, DataSourceStatus, type DataRecord,
  type QueryParams, lodash, CONSTANTS, ClauseLogic, ClauseOperator, dataSourceUtils, type ArcGISQueryParams
} from 'jimu-core'

type OnDataSourceStatusChangedFunc = (status: DataSourceStatus, dataSourceLabel?: string) => void

type OnDataChangedFunc = (dsConfigId: string, dataSource: DataSource, currentData: CurrentData, isFirstLoad?: boolean) => void

type OnSelectedRecordIdChanged = (dsConfigId: string, index: number, objectId?: string) => void
type OnUnselectedRecordIdChanged = (dataSourceId: string) => void

interface Props {
  dsConfigId: string
  widgetId: string
  useDataSource: IMUseDataSource
  index: number
  objectId?: string
  isBaseOnObjectId: boolean
  limitGraphics: boolean
  maxGraphics: number
  active: boolean
  onDataSourceStatusChanged: OnDataSourceStatusChangedFunc
  onDataChanged: OnDataChangedFunc
  onSelectedRecordIdChanged: OnSelectedRecordIdChanged
  onUnselectedRecordIdChanged: OnUnselectedRecordIdChanged
  needCountInfo: boolean
}

interface State {
  dataSourceId: string
  dataSourceStatus: DataSourceStatus
  dataSourceWidgetQueries: any
  dataSourceQueriesWhere: string
  dataSourceVersion: number
  dataSourceSourceVersion: number
}

export interface CurrentData {
  id: string
  count: number
  index: number
  graphic: __esri.Graphic
  record: DataRecord
  dataSourceId: string
  dataSourceVersion: number
  defaultPopupTemplate: any
}

interface DataBuffer {
  count: number
  dataMapByIndex: { [key: number]: CurrentData }
  dataMapByObjectId: { [key: number]: CurrentData }
  pagingNum: number
  // dataObjectIds: string[];
}

export class DataLoader extends React.PureComponent<Props, State> {
  private previousIndex: number
  private dataSource: QueriableDataSource
  private dataBuffer: DataBuffer
  private previousData: CurrentData
  private isFirstLoad: boolean
  private previousSelectedId: string
  private prevProps: Props
  // use count to avoid the update of old query result, only the latest query result need to be updated to the dataMap
  private countOfQueryGraphics: number = 0

  constructor (props) {
    super(props)
    this.state = {
      dataSourceId: null,
      dataSourceStatus: DataSourceStatus.Loaded,
      dataSourceVersion: undefined,
      dataSourceSourceVersion: undefined,
      dataSourceWidgetQueries: undefined,
      dataSourceQueriesWhere: ''
    }
    this.initDataLoader()
  }

  initDataLoader = () => {
    this.previousIndex = 0
    this.previousData = {
      id: null,
      count: -1,
      index: null,
      graphic: null,
      record: null,
      defaultPopupTemplate: null,
      dataSourceVersion: undefined,
      dataSourceId: null
    }
    this.dataBuffer = {
      count: -1,
      dataMapByIndex: {},
      dataMapByObjectId: {},
      pagingNum: 30
    }
    this.isFirstLoad = false
    this.previousSelectedId = null
  }

  componentDidUpdate (prevProps, prevState) {
    this.prevProps = prevProps
    // data source query where change
    const dataSourceQueryWhereChanged = this.state.dataSourceQueriesWhere !== prevState.dataSourceQueriesWhere
    // data loader from object-id mode to index mode
    const fromObjectIdModeToIndexMode = prevProps.isBaseOnObjectId && !this.props.isBaseOnObjectId
    // data loader from no count info mode to need count info
    const fromNoCountInfoModeToNeedCountInfoMode = !prevProps.needCountInfo && this.props.needCountInfo
    // data source is changed on the client
    const dataSourceIsChanged = this.state.dataSourceSourceVersion !== prevState.dataSourceSourceVersion

    if (dataSourceQueryWhereChanged || fromObjectIdModeToIndexMode || fromNoCountInfoModeToNeedCountInfoMode || dataSourceIsChanged) {
      this.clearDataBuffer()
    }
    if (this.props.useDataSource &&
        this.props.active &&
        this.state.dataSourceId === this.props.useDataSource.dataSourceId &&
        !(this.state.dataSourceStatus === DataSourceStatus.NotReady || this.state.dataSourceStatus === DataSourceStatus.Loading)) {
      this.getCurrentData()
    }
  }

  getCurrentData = () => {
    const objectId = this.props.objectId
    const currentData = this.getDataFromBuffer(this.props.index, objectId)
    if (currentData) {
      this.onDataChanged(this.dataSource, currentData)
    } else if (objectId) {
      this.getCurrentDataByObjectId(objectId)
    } else {
      this.getCurrentDataByIndex()
    }
  }

  getCurrentDataByObjectId = (objectId) => {
    let currentData = null
    this.queryGraphicByObjectId(objectId).then(result => {
      if (result.graphics.length !== 0) {
        this.addObjectIdDataToBuffer(result, this.dataSource.id)
        currentData = this.getDataFromBuffer(-1, objectId)
      }
      this.onDataChanged(this.dataSource, currentData)
    })
  }

  getCurrentDataByIndex = async () => {
    let index = this.props.index
    if (this.props.index === this.previousIndex) {
      this.clearDataBuffer()
    } else {
      this.previousIndex = this.props.index
    }
    this.countOfQueryGraphics++
    const currentCountOfQueryGraphics = this.countOfQueryGraphics

    const countResultPromise = this.props.needCountInfo ? this.dataSource.queryCount({}) : Promise.resolve({ count: -1 })
    await countResultPromise.then(result => {
      if (currentCountOfQueryGraphics < this.countOfQueryGraphics) {
        return
      }
      const realCount = result.count
      if (this.dataBuffer.count < 0) {
        this.setDataBufferCount(realCount)
      }
      if (index < 0) {
        index = 0
      }
      this.queryGraphicByIndex(index).then((result) => {
        if (currentCountOfQueryGraphics < this.countOfQueryGraphics) {
          return
        }
        let currentData = null
        if (result.graphics.length !== 0) {
          this.addIndexDataToBuffer(result, this.dataSource.id)
          currentData = this.getDataFromBuffer(result.index)
        }
        this.onDataChanged(this.dataSource, currentData)
        this.isFirstLoad = false
      })
    })
  }

  onDataChanged (dataSource, currentData) {
    if (!this.props.active) return
    if (!currentData) {
      this.props.onDataChanged(this.props.dsConfigId, this.dataSource, currentData)
    } else if (this.props.active !== this.prevProps.active) {
      // data source selector change
      this.props.onDataChanged(this.props.dsConfigId, this.dataSource, currentData, this.isFirstLoad)
    } else if (this.previousData?.dataSourceId !== currentData?.dataSourceId ||
              this.previousData?.id !== currentData?.id ||
              this.previousData?.count !== currentData?.count ||
              this.previousData?.index !== currentData?.index ||
              this.previousData?.dataSourceVersion !== currentData?.dataSourceVersion ||
              !lodash.isDeepEqual(this.previousData?.graphic?.attributes, currentData?.graphic?.attributes)) { // this will only be executed when the auto refresh open, and each refresh is executed only once
      // previousData is null.
      // previousData is not null.
      // currentData is not null.
      // previousData !== currentData
      this.props.onDataChanged(this.props.dsConfigId, this.dataSource, currentData, this.isFirstLoad)
    }
    // else
    // previousData is not null.
    // currentData is not null.
    // previousData === currentData
    this.previousData = currentData
  }

  onDataSourceStatusChanged = (status: DataSourceStatus, dataSourceLabel?: string) => {
    if (!this.props.active) return
    this.props.onDataSourceStatusChanged(status, dataSourceLabel)
  }

  addObjectIdDataToBuffer (queryResult, dataSourceId) {
    queryResult.records.forEach((record, i) => {
      const objectId = record.getId()
      this.dataBuffer.dataMapByObjectId[objectId] = {
        id: objectId,
        count: -1,
        index: -1,
        graphic: queryResult.graphics[i],
        defaultPopupTemplate: queryResult.defaultPopupTemplate,
        record: record,
        dataSourceId: dataSourceId,
        dataSourceVersion: this.state.dataSourceVersion
      }
    })
  }

  addIndexDataToBuffer (queryResult, dataSourceId) {
    queryResult.records.forEach((record, i) => {
      const index = queryResult.start + i
      this.dataBuffer.dataMapByIndex[index] = {
        id: record.getId(),
        count: this.dataBuffer.count,
        index: index,
        graphic: queryResult.graphics[i],
        defaultPopupTemplate: queryResult.defaultPopupTemplate,
        record: record,
        dataSourceId: dataSourceId,
        dataSourceVersion: this.state.dataSourceVersion
      }
    })
  }

  setDataBufferCount (count) {
    this.dataBuffer.count = count
  }

  getDataFromBuffer (index, objectId?) {
    let currentData = null
    if (objectId) {
      currentData = this.dataBuffer.dataMapByObjectId[objectId]
      if (!currentData) {
        currentData = Object.values(this.dataBuffer.dataMapByIndex).find(data => data.id === objectId)
      }
    } else if (index >= 0) {
      currentData = this.dataBuffer.dataMapByIndex[index]
    }
    return currentData
  }

  // Date type format:
  //   TIMESTAMP 'YYYY-MM-DD HH:MI:SS'
  getWherePhraseForField = (feature: __esri.Graphic, fieldName: string): string => {
    let wherePhrase = ''
    const dsFields = this.dataSource.getFetchedSchema().fields || {}
    const fieldType = dsFields[fieldName].esriType
    if (fieldType === 'esriFieldTypeDate') {
      const clause = dataSourceUtils.createSQLClause(fieldName, ClauseOperator.DateOperatorIsBefore, [{ value: feature.attributes[fieldName], label: '' }])
      // sql format is "date < timestamp 'yyyy-mm-dd hh:mi:ss'"
      const sql = dataSourceUtils.createSQLExpression(ClauseLogic.Or, [clause], this.dataSource)?.sql || ''
      // where phrase format is "timestamp 'yyyy-mm-dd hh:mi:ss'"
      wherePhrase = sql.slice(sql.indexOf('timestamp'))
    } else {
      wherePhrase = fieldType === 'esriFieldTypeString' ? `'${feature.attributes[fieldName]}'` : `${feature.attributes[fieldName]}`
    }
    return wherePhrase
  }

  async getDataIndexByObjectId (objectId): Promise<number> {
    let index = -1
    const dataEntries = Object.entries(this.dataBuffer.dataMapByIndex)
    dataEntries.some(entry => {
      if (objectId === entry[1]?.id) {
        index = Number(entry[0])
        return true
      } else {
        return false
      }
    })

    if (index < 0 && this.dataSource) {
      const idField = this.dataSource.getIdField()
      const orderByFieldInfos = this.getQueryParamsFromDataSource()?.orderByFields

      if (orderByFieldInfos && orderByFieldInfos?.length > 0) {
        // get index for current data if the order by field was provided
        let count = 0
        const record: any = await this.dataSource.queryById(objectId)
        let cumulateWhere = ' '
        if (record?.feature) {
          for (let i = 0; i < orderByFieldInfos.length; i++) {
            const orderByFieldInfo = orderByFieldInfos[i]
            const orderBy = orderByFieldInfo?.split(' ')
            const orderByField = orderBy[0]
            const isOrderByDESC = orderBy[1] && orderBy[1].indexOf('DESC') === 0
            const orderByFieldWherePhrase = this.getWherePhraseForField(record.feature, orderByField)

            // append object id field if it isn't in the order by fields list.
            const nextOrderByFieldInfo = orderByFieldInfos[i + 1] || idField
            const nextOrderBy = nextOrderByFieldInfo?.split(' ')
            const nextOrderByField = nextOrderBy[0]
            const nextIsOrderByDESC = nextOrderBy[1] && nextOrderBy[1].indexOf('DESC') === 0
            const nextOrderByFieldWherePhrase = this.getWherePhraseForField(record.feature, nextOrderByField)
            if (i === 0) {
              // base count where: 1stOrderByField < value
              const baseCountWhere = isOrderByDESC ? `${orderByField} > ${orderByFieldWherePhrase}` : `${orderByField} < ${orderByFieldWherePhrase} or ${orderByField} is NULL`
              count += await this.dataSource.queryCount({ where: baseCountWhere } as QueryParams).then(result => result.count).catch(error => -1)
            }

            let operator
            if (nextIsOrderByDESC) {
              operator = nextOrderByField === idField ? '>=' : '>'
            } else {
              operator = nextOrderByField === idField ? '<=' : '<'
            }
            cumulateWhere += `${orderByField} = ${orderByFieldWherePhrase} and `
            // second count where: 1stOrderByField = value and 2ndOrderField = value and .... and lastOrderByFiled < value
            const secondPartCountWhere = nextIsOrderByDESC ? `${cumulateWhere} ${nextOrderByField} ${operator} ${nextOrderByFieldWherePhrase}` : `${cumulateWhere} ${nextOrderByField} ${operator} ${nextOrderByFieldWherePhrase} or ${nextOrderByField} is NULL`
            count += await this.dataSource.queryCount({ where: secondPartCountWhere } as QueryParams).then(result => result.count).catch(error => -1)
            // data source make sure there is idField in the order by
            if (nextOrderByField === idField) {
              index = count - 1
              break
            }
          }
        }
      } else {
        index = await this.dataSource.queryCount({ where: `${idField}<=${objectId}` } as QueryParams).then(result => {
          index = result.count - 1
          return index
        })
      }
    }
    return Promise.resolve(index)
  }

  clearDataBuffer () {
    this.dataBuffer.count = -1
    this.dataBuffer.dataMapByIndex = {}
    this.dataBuffer.dataMapByObjectId = {}
  }

  getLayerObject (dataSourceParam) {
    // if the data source is a selection view, get layer object from it's main data source to get full capabilities, such as 'supportsAttachment'
    const dataSource = this.dataSource.isDataView && this.dataSource.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID ? dataSourceParam.getMainDataSource() : dataSourceParam
    if (dataSource.layer) {
      return dataSource.layer.load().then(() => {
        return Promise.resolve(dataSource.layer)
      })
    } else {
      return dataSource.createJSAPILayerByDataSource().then((layerObject) => {
        return layerObject.load().then(() => {
          return Promise.resolve(layerObject)
        })
      })
    }
  }

  queryGraphicByObjectId (objectId) {
    this.onDataSourceStatusChanged(DataSourceStatus.Loading, this.dataSource?.getLabel())
    return this.getLayerObject(this.dataSource).then(layerObject => {
      return this.dataSource.queryById(objectId).then((record: any) => {
        record.feature.sourceLayer = layerObject.associatedLayer || layerObject
        record.feature.layer = layerObject.associatedLayer || layerObject
        const defaultPopupTemplate = layerObject.associatedLayer?.defaultPopupTemplate || layerObject.defaultPopupTemplate
        this.onDataSourceStatusChanged(DataSourceStatus.Loaded, this.dataSource?.getLabel())
        return {
          graphics: [record.feature],
          records: [record],
          defaultPopupTemplate: defaultPopupTemplate?.clone() || { content: '' }
        }
      })
    }).catch((e) => {
      console.warn(e)
      this.onDataSourceStatusChanged(DataSourceStatus.Loaded, this.dataSource?.getLabel())
      return {
        graphics: [],
        records: []
      }
    })
  }

  queryGraphicByIndex (indexParam) {
    let index = indexParam
    let start
    this.onDataSourceStatusChanged(DataSourceStatus.Loading, this.dataSource?.getLabel())
    let layerObject
    return this.getLayerObject(this.dataSource).then(async layer => {
      layerObject = layer
      const isSelectionView = this.dataSource && this.dataSource.isDataView && this.dataSource.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID
      // doesn't need to locate the selected record for selection view, because it's all records are selected
      if (this.isFirstLoad && !isSelectionView) {
        const selectedRecordId = this.dataSource.getSelectedRecordIds()[0]
        if (selectedRecordId !== undefined) {
          await this.getDataIndexByObjectId(selectedRecordId).then((_index) => {
            index = (_index === -1) ? 0 : _index
          })
        }
      }
    }).then(() => {
      start = Math.floor(index / this.dataBuffer.pagingNum) * this.dataBuffer.pagingNum
      const query = {
        // where: where,
        outFields: ['*'],
        notAddFieldsToClient: true,
        returnGeometry: true,
        page: Math.floor(start / this.dataBuffer.pagingNum) + 1,
        pageSize: this.dataBuffer.pagingNum
      }

      return this.dataSource.query(query)
    }).then((queryResults) => {
      const records = queryResults.records
      // because the selection data source always use 'used fields', re-query records from it's main data
      // source to get full fields.
      if (this.dataSource.isDataView && this.dataSource.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID && records.length > 0) {
        const objectIds = records.map(record => record.feature.attributes[layerObject.objectIdField])
        const query: ArcGISQueryParams = {
          objectIds,
          outFields: ['*'],
          notAddFieldsToClient: true,
          returnGeometry: true
        }
        return this.dataSource.getMainDataSource().query(query)
      } else {
        return queryResults
      }
    }).then((queryResults) => {
      const records = queryResults.records
      const queryWhere = this.getQueryParamsFromDataSource().where
      layerObject.definitionExpression = queryWhere
      const graphics = records.map(record => {
        record.feature.sourceLayer = layerObject.associatedLayer || layerObject
        record.feature.layer = layerObject.associatedLayer || layerObject
        return record.feature
      })
      const defaultPopupTemplate = layerObject.associatedLayer?.defaultPopupTemplate || layerObject.defaultPopupTemplate
      this.onDataSourceStatusChanged(DataSourceStatus.Loaded, this.dataSource?.getLabel())
      return {
        index: index,
        start: start,
        num: this.dataBuffer.pagingNum,
        graphics: graphics,
        records: records,
        defaultPopupTemplate: defaultPopupTemplate?.clone() || { content: '' }
      }
    }).catch((e) => {
      console.warn(e)
      this.onDataSourceStatusChanged(DataSourceStatus.Loaded, this.dataSource?.getLabel())
      return {
        graphics: [],
        records: []
      }
    })
  }

  getQueryParamsFromDataSource (): FeatureLayerQueryParams {
    return this.dataSource?.getRealQueryParams({}, 'query')
  }

  serializeDSQueryCondition = (): string => {
    const queryParams = this.getQueryParamsFromDataSource()
    const where = queryParams?.where || ''
    const geometry: any = queryParams?.geometry
    const dsQueryCondition = `${where}_${geometry?.xmax?.toString() || ''}_${geometry?.xmin?.toString() || ''}_${geometry?.ymax?.toString() || ''}_${geometry?.ymin?.toString() || ''}`
    return dsQueryCondition
  }

  onDataSourceCreated = (dataSource: QueriableDataSource): void => {
    this.initDataLoader()
    this.dataSource = dataSource
    this.previousIndex = this.props.index
    this.isFirstLoad = true
    this.setState({
      dataSourceId: this.dataSource.id
    })
  }

  onCreateDataSourceFailed = (error): void => {
    this.onDataSourceStatusChanged(DataSourceStatus.CreateError)
  }

  onDataSourceInfoChange = (info: IMDataSourceInfo) => {
    if (!info) {
      return
    }

    const dataSourceStatus = info.status
    if (dataSourceStatus === DataSourceStatus.NotReady) {
      // for out-out data source, clear data buffer when not ready
      this.clearDataBuffer()
      this.onDataSourceStatusChanged(DataSourceStatus.NotReady, this.dataSource?.getLabel())
    }

    // handle filter change
    this.setState({
      dataSourceStatus,
      dataSourceWidgetQueries: info.widgetQueries,
      dataSourceQueriesWhere: this.serializeDSQueryCondition(),
      dataSourceVersion: info.version,
      dataSourceSourceVersion: info.sourceVersion
    })

    // handle selection change
    if (this.dataSource && this.dataSource.isDataView && this.dataSource.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID) {
      const mainDS = this.dataSource.getMainDataSource()
      const selectedIdInMainDS = mainDS?.getSelectedRecordIds()
      // for selection view, clear data buffer when selection change
      this.clearDataBuffer()
      if (selectedIdInMainDS && selectedIdInMainDS[0]) {
        this.props.onSelectedRecordIdChanged(this.props.dsConfigId, 0)
      }
    } else {
      const selectedId = info.selectedIds && info.selectedIds[0]
      if (selectedId) {
        if (this.previousSelectedId !== selectedId) {
          this.previousSelectedId = selectedId
          if (this.props.isBaseOnObjectId) {
            this.props.onSelectedRecordIdChanged(this.props.dsConfigId, -1, selectedId)
          } else {
            this.getDataIndexByObjectId(selectedId).then(index => {
              if (index > -1) {
                this.props.onSelectedRecordIdChanged(this.props.dsConfigId, index)
              }
            })
          }
        }
      } else if (this.previousSelectedId) {
        this.previousSelectedId = null
        //this.props.onUnselectedRecordIdChanged(this.dataSource.id)
      }
    }
  }

  render () {
    return (
      <DataSourceComponent
        useDataSource={this.props.useDataSource}
        //query={{}}
        widgetId={this.props.widgetId}
        onDataSourceCreated={this.onDataSourceCreated}
        // onQueryStatusChange={this.onQueryStatusChange}
        onDataSourceInfoChange={this.onDataSourceInfoChange}
        onCreateDataSourceFailed={this.onCreateDataSourceFailed}
      />
    )
  }
}
