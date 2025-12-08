import { type QueriableDataSource, utils, AppMode, type DataSource, dataSourceUtils, CONSTANTS, type IMSqlExpression, Immutable, type ImmutableArray, type UseDataSource } from 'jimu-core'
import type { IMConfig, Suggestion, SortSettingOption } from '../../config'
import { PageStyle } from '../../config'

export interface QueryOptions {
  returnGeometry?: boolean
  geometry?: any
  sortField?: string
  sortOrder?: string
  orderByFields?: string | string[]
  resultOffset?: number
  resultRecordCount?: number
  pageSize?: number
  page?: number
  where?: string
  sqlExpression?: IMSqlExpression
}

interface GetQueryOptionsParams {
  sortOptionName: string
  searchText: string
  currentFilter: IMSqlExpression
  filterApplied: boolean
  activeSort: boolean
  datasource: DataSource
  config: IMConfig
  pageSize: number
  page: number
  useDataSources: ImmutableArray<UseDataSource>
}

export function getQueryOptions (params: GetQueryOptionsParams): any {
  const options: QueryOptions = {
    returnGeometry: true
  }
  const {
    sortOptionName,
    searchText,
    currentFilter,
    filterApplied,
    datasource,
    config,
    useDataSources,
    pageSize,
    page,
    activeSort
  } = params

  const useDS = useDataSources && useDataSources[0]
  if (!datasource || !useDS) return options

  if (!(datasource as QueriableDataSource).query) {
    // not queryiable data source, return
    return options
  }

  // sort
  const orderBys = getOrderByFields(config.sorts, config.sortOpen, sortOptionName, activeSort)
  if (orderBys.length > 0) {
    options.orderByFields = orderBys
  }

  // filter
  if (
    config.filterOpen &&
    filterApplied &&
    config.filter &&
    currentFilter &&
    currentFilter.sql
  ) {
    options.where = currentFilter.sql
    options.sqlExpression = currentFilter
  }
  // search
  if (config.searchOpen && config.searchFields && searchText) {
    const sqlExpr = dataSourceUtils.getSQL(searchText, config.searchFields?.asMutable({ deep: true }), datasource, config?.searchExact)
    if (options.where) { // has filter
      const mergedExpr = dataSourceUtils.getMergedSQLExpressions([options.sqlExpression.asMutable({ deep: true }), sqlExpr], datasource)
      options.where = mergedExpr.sql
      options.sqlExpression = Immutable(mergedExpr)
    } else {
      options.where = sqlExpr.sql
      options.sqlExpression = Immutable(sqlExpr)
    }
  }
  // paging
  if (pageSize > 0) {
    options.page = page
    options.pageSize = pageSize
  }

  // Compare if query changed except paging
  const newQuery = options

  return newQuery
}

export function getOrderByFields (sorts: ImmutableArray<SortSettingOption>, sortOpen: boolean, sortOptionName: string, activeSort) {
  let orderByFields = []
  if (activeSort === false) {
    //When other List clicks Sort, the Sort of the operated list should be used, and the current Sort should not take effect
    return orderByFields
  }

  let sortOption: SortSettingOption
  if (sortOpen && sorts) {
    sortOption = sorts.find(
      (sort: SortSettingOption) => sort.ruleOptionName === sortOptionName
    )
    sortOption = sortOption || (sorts[0] as any)
    if (!sortOption?.rule?.[0]?.jimuFieldName) {
      sortOption = undefined
    }

    if (sortOption) {
      const orderBys = []
      sortOption.rule.forEach(sortData => {
        if (sortData.jimuFieldName) {
          orderBys.push(`${sortData.jimuFieldName} ${sortData.order}`)
        }
      })
      orderByFields = orderBys
    }
  }
  return orderByFields
}

export async function fetchSuggestionRecords (searchText: string, config: IMConfig, datasource: DataSource): Promise<Suggestion[]> {
  const option = {
    searchText,
    searchFields: config?.searchFields?.asMutable({ deep: true }) || [],
    dataSource: datasource,
    exact: config?.searchExact
  }

  return dataSourceUtils.querySuggestions(option)
}

export function compareQueryOptionsExceptPaging (
  query1: any,
  query2: any,
  datasource: QueriableDataSource
): boolean {
  // const isEqual = true;
  if (!datasource) return false
  query1 = datasource.getRealQueryParams(query1, 'query')
  query2 = datasource.getRealQueryParams(query2, 'query')
  if (!query1 || !query2) {
    return false
  }
  delete query1.page
  delete query1.pageSize
  delete query1.resultOffset
  delete query1.resultRecordCount

  delete query2.page
  delete query2.pageSize
  delete query2.resultOffset
  delete query2.resultRecordCount

  return utils.isDeepEqual(query1, query2)
}

interface GetDsRecordsOptions {
  ds: QueriableDataSource
  showLoading: boolean
  showSelectionOnly: boolean
  config: IMConfig
  appMode: AppMode
  recordSizePerPage: number
  page: number
}

export function getDsRecords(option: GetDsRecordsOptions) {
  const { SELECTION_DATA_VIEW_ID } = CONSTANTS
  const { config, appMode, showSelectionOnly, ds, showLoading, recordSizePerPage, page } = option
  const isDesignMode = appMode === AppMode.Design
  const defaultRecords = getDefaultRecords(recordSizePerPage)

  // get new records
  let records = defaultRecords
  const selectRecords = (ds && config?.isItemStyleConfirm) ? ds.getSelectedRecords() : null

  if (ds && config?.isItemStyleConfirm) {
    const isSelectionView = ds?.dataViewId === SELECTION_DATA_VIEW_ID
    if (isSelectionView) {
      records = config.pageStyle === PageStyle.Scroll
            ? ds.getRecordsByPage(1, recordSizePerPage * page)
            : ds.getRecordsByPage(page, recordSizePerPage)
    } else {
      records = config.pageStyle === PageStyle.Scroll
            ? ds.getRecordsByPageWithSelection(1, recordSizePerPage * page)
            : ds.getRecordsByPageWithSelection(page, recordSizePerPage)
    }

    records = records || []
    if (showSelectionOnly) {
      records = selectRecords
    }
  }

  if (window.jimuConfig.isInBuilder && isDesignMode && !showLoading && records.length < 1) {
    records = defaultRecords
  }

  return records
}

function getDefaultRecords(pageSize: number = 3): any[] {
  const defaultRecordsItem = { fake: true } as any
  pageSize = (pageSize && pageSize > 1) ? pageSize : 3
  const defaultRecords = []
  for (let i = 0; i < pageSize; i++) {
    defaultRecords.push(defaultRecordsItem)
  }
  return defaultRecords
}
