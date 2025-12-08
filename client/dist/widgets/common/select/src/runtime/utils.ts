import {
  dataSourceUtils, Immutable, uuidv1, type DataSourceSelectionMode, type AllWidgetProps,
  type DataSource, type UseDataSource, type IMSqlExpression, type ImmutableArray
} from 'jimu-core'
import type { JimuLayerView } from 'jimu-arcgis'
import type { IGeometry, GeometryType, SpatialRelationship } from '@esri/arcgis-rest-feature-service'
import { getShownClauseNumberByExpression } from 'jimu-ui/basic/sql-expression-runtime'
import type { IMConfig, DataSourceItem, IMDataSourceItem } from '../config'

export type WidgetDomRef = React.MutableRefObject<HTMLDivElement>

export interface ExtraSelectWidgetProps {
  isRTL: boolean
  /**
   * dataSourceCount should only record the created data source count
   */
  dataSourceCount: number
  mapWidgetId: string
  autoControlWidgetId: string
  config: IMConfig
}

export interface SelectWidgetProps extends AllWidgetProps<IMConfig>, ExtraSelectWidgetProps {

}

export enum WidgetDisplayMode {
  Placeholder = 'Placeholder',
  Loading = 'Loading',
  NoLayersTip = 'NoLayersTip',
  Normal = 'Normal'
}

export type UpdateWidgetDisplayMode = (displayMode: WidgetDisplayMode) => void

export interface GeometryInfo {
  geometry: IGeometry
  geometryType: GeometryType
  spatialRel: SpatialRelationship
}

/**
 * Information for one selecting task.
 */
export interface SelectTaskInfo {
  /**
   * The version of the selecting task, <= 0 means no selecting task, initial value should be 0.
   */
  version: number

  /**
   * If selectionMode is DataSourceSelectionMode.New, both appliedSql and geometryInfo are used.
   * If selectionMode is DataSourceSelectionMode.AddToCurrent, DataSourceSelectionMode.RemoveFromCurrent or DataSourceSelectionMode.SelectFromCurrent,
   * only geometryInfo is used, and appliedSql will be ignored.
   */
  selectionMode: DataSourceSelectionMode

  /**
   * GeometryInfo used for the selecting task, the latest selecting maybe done or maybe not done.
   * Need to convert undefined to null by getFinalGeometryInfo() method.
   */
  appliedGeometryInfo?: GeometryInfo

  /**
   * SQL used for the selecting task, the latest selecting maybe done or maybe not done.
   * Need to convert null/undefined/'1=1' to '' by getFinalAppliedSql() method.
   */
  appliedSql?: string
}

/**
 * UI state of DataSourceListItem.
 */
export interface DataSourceItemRuntimeInfo {
  uid: string

  // the display title on the UI, maybe layer title or data source label
  displayTitle: string

  dataSource: DataSource

  // jimuLayerView is only available when useMap is true (means jimuLayerViewId is not null)
  jimuLayerView: JimuLayerView

  // true means it supports custom sql builder
  supportCustomSQLBuilder: boolean

  // true means user configures SqlExpression and we should show the filter icon, otherwise false.
  shouldRenderFilterIcon: boolean

  // the display SqlExpression state of SqlExpressionRuntime
  imDisplaySqlExpression: IMSqlExpression

  // the data source/layer is checked or not
  checked: boolean

  // true means the data source is in progress of selecting features
  isSelecting: boolean

  // the latest select task info
  latestSelectTaskInfo: SelectTaskInfo

  // true means attribute filter switch is checked, false means not checked
  isAttributeFilterOn: boolean

  // execute a new selecting task if necessary
  // this method is called when geometryInfo changes or SQL UI changes, it always get sql from SQL UI
  // this method determines geometryInfo or sql changes or not, if both not changes, we don't execute a new selecting task
  tryExecuteSelectingByGeometryInfoAndSqlUI: (selectionMode: DataSourceSelectionMode, geometryInfo: GeometryInfo) => void

  // this method is called when click attribute filter switch to turn it on/off or click the batch-on/batch-off button
  enableAttributeFilter: (enable: boolean) => void

  // clear data source selection
  // this method is called when click ds item clear button or click the clear all button
  clearSelection: () => void
}

export interface DataSourceItemRuntimeInfoMap {
  [uid: string]: DataSourceItemRuntimeInfo
}

export type MixinDataSourceItemRuntimeInfoMap = (updatedDataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap) => void

export type UpdateDataSourceItemRuntimeInfoForUid = (uid: string, itemRuntimeInfoMixin: Partial<DataSourceItemRuntimeInfo>) => void

export type ClearAllDataSourceItemRuntimeInfoMap = () => void

export type RemoveNotUsedDataSourceItemRuntimeInfoMap = (allUsedUids: string[]) => void

export type RemoveGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap = () => void

export type RemovePartialDataSourceItemRuntimeInfoMapByUids = (uids: string[]) => void

/**
 * Get initialDataSourceItemRuntimeInfoMap to mixin only for imDataSourceItems which doesn't have runtimeInfo.
 * @param useMap
 * @param supportCustomSQLBuilder
 * @param imDataSourceItems
 * @param currDataSourceItemRuntimeInfoMap
 * @returns
 */
export function getInitialDataSourceItemRuntimeInfoMap (
  useMap: boolean,
  supportCustomSQLBuilder: boolean,
  imDataSourceItems: (ImmutableArray<DataSourceItem> | IMDataSourceItem[]),
  currDataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
): DataSourceItemRuntimeInfoMap {
  const result: DataSourceItemRuntimeInfoMap = {}

  imDataSourceItems.forEach((imDataSourceItem) => {
    const uid = imDataSourceItem.uid

    if (currDataSourceItemRuntimeInfoMap[uid]) {
      // imDataSourceItem already has runtimeInfo, should not create a new one for it, otherwise it will overrides the existing runtime state
      return
    }

    const imSqlExpression = imDataSourceItem.sqlExpression
    const isFilterIconVisible = shouldShowAttributeFilterIcon(supportCustomSQLBuilder, imSqlExpression)
    const latestSelectVersion = 0
    const latestAppliedGeometryInfo = getFinalGeometryInfo(null)
    const latestAppliedSql = getFinalAppliedSql('')
    const latestSelectTaskInfo: SelectTaskInfo = {
      version: latestSelectVersion,
      selectionMode: null,
      appliedGeometryInfo: latestAppliedGeometryInfo,
      appliedSql: latestAppliedSql
    }

    // If useMap is true, set runtimeInfo.checked to false by default. DataSourceListItem component will update runtimeInfo.checked by jimuLayerView.isLayerVisible() once jimuLayerView loaded.
    // If useMap is false, always set runtimeInfo.checked to true by default.
    const checked = !useMap
    const runtimeInfo: DataSourceItemRuntimeInfo = {
      uid,
      displayTitle: '',
      dataSource: null,
      jimuLayerView: null,
      supportCustomSQLBuilder,
      shouldRenderFilterIcon: isFilterIconVisible,
      imDisplaySqlExpression: imSqlExpression,
      checked,
      isSelecting: false,
      latestSelectTaskInfo,
      isAttributeFilterOn: false,
      tryExecuteSelectingByGeometryInfoAndSqlUI: null,
      enableAttributeFilter: null,
      clearSelection: null
    }

    result[uid] = runtimeInfo
  })

  return result
}

export function getImDataSourceItemForGeneratedDataSource (ds: DataSource, jimuLayerViewId?: string): IMDataSourceItem {
  const uid = uuidv1()
  const dsId = ds.id
  let mainDsId = dsId

  const mainDs = ds.getMainDataSource()

  if (mainDs) {
    mainDsId = mainDs.id
  }

  const useDataSource: UseDataSource = {
    dataSourceId: dsId,
    mainDataSourceId: mainDsId
  }

  const dataSourceItem: DataSourceItem = {
    uid,
    sqlHint: '',
    sqlExpression: null,
    useDataSource,
    jimuLayerViewId
  }

  const imDataSourceItem: IMDataSourceItem = Immutable(dataSourceItem)

  return imDataSourceItem
}

export function getRuntimeInfos (
  dataSourceItems: ImmutableArray<DataSourceItem>,
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
): DataSourceItemRuntimeInfo[] {
  const resultRuntimeInfos: DataSourceItemRuntimeInfo[] = []

  dataSourceItems.forEach(dataSourceItem => {
    const uid = dataSourceItem.uid
    const runtimeInfo = dataSourceItemRuntimeInfoMap[uid]

    if (runtimeInfo) {
      resultRuntimeInfos.push(runtimeInfo)
    }
  })

  return resultRuntimeInfos
}

export interface DataSourceItemAndRuntimeInfo {
  dataSourceItem: IMDataSourceItem
  runtimeInfo: DataSourceItemRuntimeInfo
}

export function getDataSourceItemAndRuntimeInfos (
  dataSourceItems: ImmutableArray<DataSourceItem>,
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
): DataSourceItemAndRuntimeInfo[] {
  const result: DataSourceItemAndRuntimeInfo[] = []

  dataSourceItems.forEach(dataSourceItem => {
    const uid = dataSourceItem.uid
    const runtimeInfo = dataSourceItemRuntimeInfoMap[uid]

    if (runtimeInfo) {
      result.push({
        dataSourceItem,
        runtimeInfo
      })
    }
  })

  return result
}

/**
 * Get DataSourceItemRuntimeInfo array that are ready to display on the UI.
 * When it is ready to display on the UI, means it is also ready to run a select task (maybe need to create data source on-the-fly internally).
 * @param dataSourceItems
 * @param dataSourceItemRuntimeInfoMap
 * @returns
 */
export function getReadyToDisplayRuntimeInfos (
  dataSourceItems: ImmutableArray<DataSourceItem>,
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
): DataSourceItemRuntimeInfo[] {
  const dataSourceItemAndRuntimeInfos = getDataSourceItemAndRuntimeInfos(dataSourceItems, dataSourceItemRuntimeInfoMap)
  const resultRuntimeInfos: DataSourceItemRuntimeInfo[] = []

  dataSourceItemAndRuntimeInfos.forEach(dataSourceItemAndRuntimeInfo => {
    const {
      dataSourceItem,
      runtimeInfo
    } = dataSourceItemAndRuntimeInfo

    if (dataSourceItem && runtimeInfo && runtimeInfo.displayTitle) {
      if (dataSourceItem.jimuLayerViewId) {
        // useMap is true
        // If jimuLayerView exists, DataSourceItemRuntimeInfo is ready to display on the UI.
        if (runtimeInfo.jimuLayerView) {
          resultRuntimeInfos.push(runtimeInfo)
        }
      } else {
        // useMap is false
        // If dataSource exists, DataSourceItemRuntimeInfo is ready to display on the UI.
        if (runtimeInfo.dataSource) {
          resultRuntimeInfos.push(runtimeInfo)
        }
      }
    }
  })

  return resultRuntimeInfos
}

/**
 * Get DataSourceItemRuntimeInfo array that are checked and ready to display on the UI.
 * @param dataSourceItems
 * @param dataSourceItemRuntimeInfoMap
 * @returns
 */
export function getCheckedReadyToDisplayRuntimeInfos (
  dataSourceItems: ImmutableArray<DataSourceItem>,
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
): DataSourceItemRuntimeInfo[] {
  const readyRuntimeInfos = getReadyToDisplayRuntimeInfos(dataSourceItems, dataSourceItemRuntimeInfoMap)
  return readyRuntimeInfos.filter(runtimeInfo => runtimeInfo.checked)
}

/**
 * Get DataSourceItemRuntimeInfo array that items are checked, ready to display on the UI and not in selecting status.
 * This method is mostly used to get the runtimeInfos for batch operation.
 * @param dataSourceItems
 * @param dataSourceItemRuntimeInfoMap
 * @returns
 */
export function getCheckedReadyToDisplayNotSelectingRuntimeInfos (
  dataSourceItems: ImmutableArray<DataSourceItem>,
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
) {
  const readyRuntimeInfos = getReadyToDisplayRuntimeInfos(dataSourceItems, dataSourceItemRuntimeInfoMap)
  return readyRuntimeInfos.filter(runtimeInfo => (runtimeInfo.checked && !runtimeInfo.isSelecting))
}

/**
 * Check should show attribute filter icon or not.
 * @param supportCustomSQLBuilder true means it supports custom sql builder
 * @param imConfigSqlExpression Note, imConfigSqlExpression must be the sqlExpression from config.
 * @returns
 */
export function shouldShowAttributeFilterIcon (supportCustomSQLBuilder: boolean, imConfigSqlExpression: IMSqlExpression): boolean {
  let show: boolean = false

  if (supportCustomSQLBuilder) {
    // support custom sql builder
    show = true
  } else {
    // data source is not generated at runtime
    if (imConfigSqlExpression) {
      // If imConfigSqlExpression.sql is empty string and getShownClauseNumberByExpression(imConfigSqlExpression) is 0,
      // means this is a '1=1' sqlExpression, and imConfigSqlExpression.parts should be an empty array.
      show = (!!getFinalAppliedSql(imConfigSqlExpression.sql)) || shouldShowSqlExpressionRuntime(supportCustomSQLBuilder, imConfigSqlExpression)
    }
  }

  return show
}

/**
 * Check should show SqlExpressionRuntime or not.
 * @param supportCustomSQLBuilder true means it supports custom sql builder
 * @param imConfigSqlExpression Note, imConfigSqlExpression must be the sqlExpression from config.
 * @returns
 */
export function shouldShowSqlExpressionRuntime (supportCustomSQLBuilder: boolean, imConfigSqlExpression: IMSqlExpression): boolean {
  let show: boolean = false

  // only show SqlExpressionRuntime when supportCustomSQLBuilder is false because we show SqlExpressionBuilder when supportCustomSQLBuilder is true
  if (!supportCustomSQLBuilder && imConfigSqlExpression) {
    show = getShownClauseNumberByExpression(imConfigSqlExpression) > 0
  }

  return show
}

export function getFinalAppliedSqlByUI (isAttributeFilterOn: boolean, imSqlExpression: IMSqlExpression, dataSource: DataSource): string {
  let rawSql: string = ''

  if (isAttributeFilterOn && imSqlExpression && dataSource) {
    const sqlResult = dataSourceUtils.getArcGISSQL(imSqlExpression, dataSource)

    if (sqlResult) {
      rawSql = sqlResult.sql
    }
  }

  const finalSql = getFinalAppliedSql(rawSql)

  return finalSql
}

export function isSelectTaskVersionValid (version: number): boolean {
  return typeof version === 'number' && version > 0
}

export function getFinalAppliedSql (rawAppliedSql: string): string {
  // convert null/undefined to ''
  let tempAppliedSql = rawAppliedSql || ''

  if (tempAppliedSql === '1=1') {
    tempAppliedSql = ''
  }

  return tempAppliedSql
}

export function getFinalGeometryInfo (geometryInfo: GeometryInfo): GeometryInfo {
  if (geometryInfo === undefined) {
    return null
  }

  return geometryInfo
}
