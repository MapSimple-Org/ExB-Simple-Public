/** @jsx jsx */
import {
  React, hooks, jsx, css, classNames, observeStore, DataSourceManager, DataSourceStatus, getAppStore, DataSourceSelectionMode, JSAPILayerTypes, type ArcGISQueriableDataSource,
  type IMDataSourceInfo, type DataRecord, type DataRecordSet, type IMSqlExpression, type FeatureLayerQueryParams, type DataSource, type SqlExpression, focusElementInKeyboardMode,
  defaultMessages as jimuCoreDefaultMessages
} from 'jimu-core'
import type { JimuMapView, JimuLayerView } from 'jimu-arcgis'
import type { Unsubscribe } from 'redux'
import { defaultMessages as jimuUIMessages, Checkbox, Label, Button, Switch, DataActionList, DataActionListStyle } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { PropertySettingOutlined } from 'jimu-icons/outlined/application/property-setting'
import { ClearSelectionGeneralOutlined } from 'jimu-icons/outlined/editor/clear-selection-general'
import { AttributeSelectionOutlined } from 'jimu-icons/outlined/application/attribute-selection'
import { SqlExpressionRuntime } from 'jimu-ui/basic/sql-expression-runtime'
import DataSourceExtension from '../data-source-extension'
import {
  shouldShowAttributeFilterIcon, shouldShowSqlExpressionRuntime, isSelectTaskVersionValid, getFinalAppliedSql, getFinalGeometryInfo,
  getFinalAppliedSqlByUI, type DataSourceItemRuntimeInfo, type GeometryInfo, type UpdateDataSourceItemRuntimeInfoForUid,
  type SelectTaskInfo, type WidgetDomRef
} from '../utils'
import type { IMDataSourceItem } from '../../config'
import CustomSqlBuilder from './custom-sql-builder'
import SelectProgress from './select-progress'

export interface DataSourceListItemProps {
  isRTL: boolean
  widgetId: string
  widgetDomRef: WidgetDomRef
  enableDataAction: boolean
  imDataSourceItem: IMDataSourceItem
  itemRuntimeInfo: DataSourceItemRuntimeInfo
  jimuMapView: JimuMapView
  updateDataSourceItemRuntimeInfoForUid: UpdateDataSourceItemRuntimeInfoForUid
  onDataRecordSetChange: (uid: string, dataRecordSet: DataRecordSet) => void
}

interface AbortControllerExt extends AbortController {
  selectVersion: number
  // if true, means we should discard the partial queried records if the selecting task is aborted, default is false
  ignoreAbortedSelection: boolean
}

/**
 * Component for showing one data source item. Most select query operations are performed in this component.
 * This component provides the following methods to update selection:
 *  1. tryExecuteSelectingByGeometryInfoAndSqlUI: this method is called when geometryInfo changes or SQL UI changes, it always get sql from SQL UI
 *  2. enableAttributeFilter: this method is called when click attribute filter switch to turn it on/off or click the batch-on/batch-off button
 *  3. clearSelection: this method is called when click ds item clear button or click the clear all button
 *
 * This item maybe related to a jimuLayerViewId or maybe not. We only create data source when necessary for performance reason.
 *  1. If not related to a jimuLayerViewId, then we need to create data source immediately because we need to get the label from data source.
 *  2. If related to a jimuLayerViewId, then we need to wait jimuLayerView loaded immediately because we need to get the label from jimuLayerView.
 *     And we don't need to create data source for it immediately, we only create data source for it when necessary.
 *
 * Here are some cases when we need to create data source.
 *   1. If the item doesn't have a jimuLayerViewId, means it doesn't connect to a layer, we need to create a data source to get its label to display.
 *   2. Need to execute a new selecting task.
 *   3. Need to clear selection(actually it belongs to case2).
 *   4. Need to show SqlExpressionRuntime or show CustomSqlBuilder.
 */
export default function DataSourceListItem (props: DataSourceListItemProps): React.ReactElement {
  const {
    isRTL,
    widgetId,
    widgetDomRef,
    enableDataAction,
    imDataSourceItem,
    itemRuntimeInfo,
    jimuMapView,
    updateDataSourceItemRuntimeInfoForUid,
    onDataRecordSetChange
  } = props

  const uid = imDataSourceItem.uid
  const useDataSource = imDataSourceItem.useDataSource
  const configSqlHint = imDataSourceItem.sqlHint || ''
  const configSqlExpression = imDataSourceItem.sqlExpression
  const dataSourceId = useDataSource.dataSourceId
  const jimuLayerViewId = imDataSourceItem.jimuLayerViewId // null if useMap is false
  const displayTitle = itemRuntimeInfo.displayTitle
  const dataSource = itemRuntimeInfo.dataSource
  const jimuLayerView = itemRuntimeInfo.jimuLayerView
  const isVisibleChecked = itemRuntimeInfo.checked
  const imDisplaySqlExpression = itemRuntimeInfo.imDisplaySqlExpression
  const latestSelectVersion = itemRuntimeInfo.latestSelectTaskInfo?.version || 0
  const shouldRenderFilterIcon = itemRuntimeInfo.shouldRenderFilterIcon
  const isAttributeFilterOn = itemRuntimeInfo.isAttributeFilterOn
  const isSelecting = itemRuntimeInfo.isSelecting
  const supportCustomSQLBuilder = itemRuntimeInfo.supportCustomSQLBuilder
  const shouldRenderCustomSqlIcon = supportCustomSQLBuilder

  const translate = hooks.useTranslation(jimuCoreDefaultMessages, jimuUIMessages, defaultMessages)

  const switchId = React.useId()
  const [selectedRecords, setSelectedRecords] = React.useState<DataRecord[]>([])
  const selectedCount = selectedRecords.length
  const dataSourceUnsubscribeRef = React.useRef<Unsubscribe>(null)
  const [isFilterPanelOpened, setFilerPanelVisible] = React.useState<boolean>(false)
  const [isCustomSqlBuilderVisible, setCustomSqlBuilderVisible] = React.useState<boolean>(false)
  const currRuntimeInfoRef = React.useRef<DataSourceItemRuntimeInfo>(itemRuntimeInfo)
  currRuntimeInfoRef.current = itemRuntimeInfo
  // selecting progress of last selecting task , value range is [0, 1], 0 means starts selecting, 1 means selecting done
  const [selectingProgress, setSelectingProgress] = React.useState<number>(0)

  const customSqlBtnRef = React.useRef<HTMLButtonElement>(null)

  // If abortControllerRef.current is null, means no selecting task is currently executed.
  // If abortControllerRef.current is an AbortController instance, means there is currently a selecting task being executed.
  // We use abortControllerRef.current by calling abortController.abort('abort reason') to cancel current selecting task before we execute a new selecting task.
  const abortControllerRef = React.useRef<AbortControllerExt>(null)

  // preLatestSelectVersionRef is used to check if latestSelectVersion changes
  const preLatestSelectVersionRef = React.useRef<number>(0)

  // true if user needs to input for askForValues or needs to display hint
  const shouldRenderSqlExpressionRuntime = React.useMemo(() => {
    return shouldShowSqlExpressionRuntime(supportCustomSQLBuilder, configSqlExpression)
  }, [supportCustomSQLBuilder, configSqlExpression])

  const finalSqlHint = React.useMemo(() => {
    const hint = supportCustomSQLBuilder ? translate('customSQL') : configSqlHint
    return hint || ''
  }, [configSqlHint, supportCustomSQLBuilder, translate])

  // dataRecordSet is null if dataSource doesn't exist or none records are selected.
  const dataRecordSet = React.useMemo((): DataRecordSet => {
    let newDataRecordSet: DataRecordSet = null

    if (dataSource && selectedRecords.length > 0) {
      const sourceLabel = dataSource.getLabel() || ''
      const dataSetName = translate('selectWidgetSelection', { layerName: sourceLabel })
      newDataRecordSet = {
        dataSource: dataSource,
        name: dataSetName,
        label: dataSetName,
        type: 'selected',
        records: selectedRecords
      }

      // If isSelectionFromMapWidgetOrSelectWidget is true, means selection comes from Map widget or Select widget.
      let isSelectionFromMapWidgetOrSelectWidget = false
      const selectionSourceWidgetId = dataSource.getInfo && dataSource.getInfo()?.selectOptions?.widgetId

      if (selectionSourceWidgetId) {
        const appConfig = getAppStore()?.getState()?.appConfig

        if (appConfig && appConfig.widgets) {
          const widgetJson = appConfig.widgets[selectionSourceWidgetId]
          const widgetUri = widgetJson?.uri

          if (widgetUri === 'widgets/arcgis/arcgis-map/' || widgetUri === 'widgets/common/select/') {
            isSelectionFromMapWidgetOrSelectWidget = true
          }
        }
      }

      // get data source used fields
      // dsAllUsedFields maybe string array or string '*'
      const dsUsedFields = dataSource.getAllUsedFields() || []

      // get layer available fields if selection comes from Map widget or Select widget
      let layerFields: string[] = []

      if (jimuLayerView && isSelectionFromMapWidgetOrSelectWidget) {
        const layerView = jimuLayerView.view as __esri.FeatureLayerView | __esri.SceneLayerView

        if (layerView && layerView.availableFields?.length > 0) {
          layerFields = layerView.availableFields.slice()
        }
      }

      if (!layerFields) {
        layerFields = []
      }

      // get layer popup fields
      const queriableDataSource = dataSource as ArcGISQueriableDataSource
      const popupFields: string[] = queriableDataSource.getPopupInfoFields ? (queriableDataSource.getPopupInfoFields() || []) : []

      // dataRecordSet.fields = data source used fields + layer available fields + popup fields
      let finalFields: string[] = [].concat(dsUsedFields).concat(layerFields).concat(popupFields)

      // remove duplicated fields
      finalFields = Array.from(new Set(finalFields))

      // convert '*' to normal fields
      if (finalFields.includes('*')) {
        finalFields = finalFields.filter(field => field !== '*')

        const schema = dataSource.getSchema()

        if (schema?.fields) {
          const schemaFieldNames = Object.keys(schema?.fields)

          if (schemaFieldNames.length > 0) {
            finalFields = schemaFieldNames
          }
        }
      }

      if (finalFields && finalFields.length > 0) {
        newDataRecordSet.fields = finalFields
      }
    }

    return newDataRecordSet
  }, [dataSource, jimuLayerView, selectedRecords, translate])

  // dataRecordSets is empty array if dataSource doesn't exist or none records are selected.
  const dataRecordSets = React.useMemo((): DataRecordSet[] => {
    if (dataRecordSet) {
      return [dataRecordSet]
    }

    return []
  }, [dataRecordSet])

  const [isNeedDataSourceState, setIsNeedDataSourceState] = React.useState<boolean>(false)

  // If isFinalNeedDataSource is true, means we need to get data source as soon as possible.
  // Here are some cases when we need to create data source.
  //  1. isNeedDataSourceState is true.
  //  2. If the item doesn't have a jimuLayerViewId, means it doesn't connect to a layer, we need to create a data source to get its label to display.
  //  3. Need to execute a new selecting task.
  //  4. Need to clear selection(actually it belongs to case2).
  //  5. Need to show SqlExpressionRuntime or show CustomSqlBuilder.
  //  6. Current item connects to a SubtypeSublayer of map. See #21162 fore more details.
  const isFinalNeedDataSource = React.useMemo(() => {
    const isItemNotFromLayer = !jimuLayerViewId
    const isNeedToExecuteSelectTask = isSelectTaskVersionValid(latestSelectVersion)
    const isNeedToShowSqlExpressionRuntime = shouldRenderFilterIcon && isFilterPanelOpened && shouldRenderSqlExpressionRuntime
    const isNeedToShowCustomSqlBuilder = shouldRenderFilterIcon && isFilterPanelOpened && isCustomSqlBuilderVisible
    const isSubtypeSublayer = jimuLayerView?.type === JSAPILayerTypes.SubtypeSublayer

    const newIsNeedDataSource = isNeedDataSourceState || isItemNotFromLayer || isNeedToExecuteSelectTask || isNeedToShowSqlExpressionRuntime || isNeedToShowCustomSqlBuilder || isSubtypeSublayer
    return newIsNeedDataSource
  }, [isCustomSqlBuilderVisible, isFilterPanelOpened, isNeedDataSourceState, jimuLayerViewId, latestSelectVersion, shouldRenderFilterIcon, shouldRenderSqlExpressionRuntime, jimuLayerView])

  // Create data source if it is null. This method never rejects, but maybe resolve(null).
  const getOrCreateDataSource = React.useCallback(async () => {
    let ds = dataSource

    if (!ds) {
      const dsm = DataSourceManager.getInstance()
      ds = dsm.getDataSource(useDataSource.dataSourceId)

      if (!ds) {
        try {
          // console.log('Select widget create dataSource', useDataSource.dataSourceId)
          ds = await dsm.createDataSourceByUseDataSource(useDataSource)
        } catch (e) {
          ds = null
          console.error('create data source error', useDataSource.dataSourceId, e)
        }
      }

      if (ds) {
        updateDataSourceItemRuntimeInfoForUid(uid, {
          dataSource: ds
        })
      }
    }

    return ds
  }, [dataSource, uid, updateDataSourceItemRuntimeInfoForUid, useDataSource])

  // We firstly get title from data source. If data source is not created, we get the title from layer.
  const updateDisplayTitle = React.useCallback(() => {
    let newDisplayTitle = ''

    if (dataSource) {
      newDisplayTitle = dataSource.getLabel() || dataSource.getDataSourceJson()?.sourceLabel || ''
    }

    if (!newDisplayTitle) {
      if (jimuLayerView) {
        newDisplayTitle = jimuLayerView.layer?.title
      }
    }

    if (!newDisplayTitle) {
      newDisplayTitle = ''
    }

    if (newDisplayTitle && newDisplayTitle !== displayTitle) {
      updateDataSourceItemRuntimeInfoForUid(uid, {
        displayTitle: newDisplayTitle
      })
    }

    return newDisplayTitle
  }, [dataSource, displayTitle, jimuLayerView, uid, updateDataSourceItemRuntimeInfoForUid])

  React.useEffect(() => {
    updateDisplayTitle()
  }, [updateDisplayTitle])

  // If dataSource is null, we need to try to get dataSource from DataSourceManager.
  // Note, we just read it, don't create it. If we can get it, we can update runtimeInfo.dataSource.
  React.useEffect(() => {
    if (!dataSource) {
      const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)

      if (ds) {
        // console.log('Select widget get dataSource from DataSourceManager', dataSourceId)

        updateDataSourceItemRuntimeInfoForUid(uid, {
          dataSource: ds
        })
      }
    }
  }, [dataSource, dataSourceId, uid, updateDataSourceItemRuntimeInfoForUid])

  // Auto create data source if isFinalNeedDataSource is true and dataSource is null.
  React.useEffect(() => {
    if (isFinalNeedDataSource && !dataSource) {
      getOrCreateDataSource()
    }
  }, [dataSource, getOrCreateDataSource, isFinalNeedDataSource])

  // Auto create jimuLayerView if jimuLayerView is null and jimuLayerViewId is not null.
  React.useEffect(() => {
    if (jimuLayerViewId && !jimuLayerView) {
      if (jimuMapView && jimuLayerViewId.indexOf(jimuMapView.id) === 0) {
        async function loadJimuLayerView () {
          let newJimuLayerView: JimuLayerView = null

          try {
            newJimuLayerView = await jimuMapView.whenJimuLayerViewLoaded(jimuLayerViewId)
          } catch (e) {
            newJimuLayerView = null
            console.error('jimuLayerViewLoaded error', jimuLayerViewId, e)
          }

          if (newJimuLayerView) {
            // only check the item if the layer is visible
            const checked = newJimuLayerView.isLayerVisible()
            updateDataSourceItemRuntimeInfoForUid(uid, {
              checked,
              jimuLayerView: newJimuLayerView
            })
          }
        }

        loadJimuLayerView()
      }
    }
  }, [jimuLayerView, jimuLayerViewId, jimuMapView, uid, updateDataSourceItemRuntimeInfoForUid])

  // Call props.onDataRecordSetChange() if dataRecordSet changed.
  React.useEffect(() => {
    onDataRecordSetChange(uid, dataRecordSet)
  }, [dataRecordSet, onDataRecordSetChange, uid])

  // appConfig.dataSources[dataSourceId] changes, need to
  // 1. Update data source if dsInfo.instanceStatus changes.
  // 2. Update selectedRecords state by dataSource.
  // 3. Update title if it changes.
  const onDataSourceInfoChange = React.useCallback((preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo) => {
    // current latest data source
    let ds: DataSource = dataSource

    // Update data source if dsInfo.instanceStatus changes.
    if (dsInfo) {
      // When refresh app, selectedIds will changed from undefined to empty array [], we don't treat it as selection change,
      // so change empty array [] to null.
      const preSelectedIds = preDsInfo?.selectedIds?.length > 0 ? preDsInfo?.selectedIds : null
      const currSelectedIds = dsInfo.selectedIds?.length > 0 ? dsInfo.selectedIds : null
      const currSelectionWidgetId = dsInfo.selectOptions?.widgetId || ''

      if (preSelectedIds !== currSelectedIds && currSelectionWidgetId !== widgetId) {
        // selection changed by other widget, need to abort current on-the-fly selecting task
        const abortController = abortControllerRef.current

        if (abortController) {
          const abortReason = `Select widget: selection changed by other widget ${currSelectionWidgetId}, abort current on-the-fly selecting task`
          abortController.ignoreAbortedSelection = true
          abortController.abort(abortReason)
        }

        // turn off attribute filter switch on UI
        const itemRuntimeInfoMixin: Partial<DataSourceItemRuntimeInfo> = {
          isAttributeFilterOn: false
        }

        // reset selectionMode/appliedGeometryInfo/appliedSql of latestSelectTaskInfo, only keep latestSelectTaskInfo.version not changed
        if (currRuntimeInfoRef.current?.latestSelectTaskInfo) {
          const taskVersion = currRuntimeInfoRef.current.latestSelectTaskInfo.version
          const newSelectTaskInfo: SelectTaskInfo = {
            version: taskVersion,
            selectionMode: DataSourceSelectionMode.New,
            appliedGeometryInfo: getFinalGeometryInfo(null),
            // update isAttributeFilterOn will trigger the useEffect to run to check if sql changed, we don't want it run a new selecting task,
            // so must reset latestSelectTaskInfo.appliedSql to '', so the useEffect considers that the sql has not changed and will not create a new selecting task.
            appliedSql: getFinalAppliedSql('')
          }
          itemRuntimeInfoMixin.latestSelectTaskInfo = newSelectTaskInfo
        }

        updateDataSourceItemRuntimeInfoForUid(uid, itemRuntimeInfoMixin)
      }

      if (dsInfo.instanceStatus !== DataSourceStatus.Created && dataSource) {
        // dataSource destroyed
        updateDataSourceItemRuntimeInfoForUid(uid, {
          dataSource: null
        })
      } else if (dsInfo.instanceStatus === DataSourceStatus.Created) {
        const newDataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)

        if (newDataSource && newDataSource !== dataSource) {
          ds = newDataSource

          // dataSource created
          updateDataSourceItemRuntimeInfoForUid(uid, {
            dataSource: newDataSource
          })
        }
      }
    }

    // Update selectedRecords state by dataSource.
    let newSelectedRecords: DataRecord[] = []

    if (ds) {
      newSelectedRecords = ds.getSelectedRecords() || []
      setSelectedRecords(newSelectedRecords)
    }

    setSelectedRecords(newSelectedRecords)

    // Update title if it changes.
    updateDisplayTitle()
  }, [dataSource, dataSourceId, widgetId, uid, updateDataSourceItemRuntimeInfoForUid, updateDisplayTitle])
  const onDataSourceInfoChangeRef = React.useRef<typeof onDataSourceInfoChange>(null)
  onDataSourceInfoChangeRef.current = onDataSourceInfoChange

  // Sync info from appConfig.dataSources[dataSourceId] when mounted and watch appConfig.dataSources[dataSourceId] changes.
  React.useEffect(() => {
    let dsInfo: IMDataSourceInfo = null
    const appState = getAppStore().getState()

    if (appState && appState.dataSourcesInfo) {
      dsInfo = appState.dataSourcesInfo[dataSourceId]
    }

    if (onDataSourceInfoChangeRef.current) {
      onDataSourceInfoChangeRef.current(dsInfo, dsInfo)
    }

    dataSourceUnsubscribeRef.current = observeStore((preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo) => {
      if (onDataSourceInfoChangeRef.current) {
        onDataSourceInfoChangeRef.current(preDsInfo, dsInfo)
      }
    }, ['dataSourcesInfo', dataSourceId])

    return () => {
      // When the component is unmounted, it is necessary to cancel the monitoring of dataSourcesInfo changes.
      if (dataSourceUnsubscribeRef.current && typeof dataSourceUnsubscribeRef.current === 'function') {
        dataSourceUnsubscribeRef.current()
      }

      dataSourceUnsubscribeRef.current = null
    }
  }, [dataSourceId])

  // Auto run selecting task if latestSelectVersion changed or dataSource ready (latestSelectVersion changing means runtimeInfo.latestAppliedSql changes or runtimeInfo.latestAppliedGeometryInfo changes)
  // This effect should only be triggered by method tryExecuteSelectingByGeometryInfoAndSqlUI(changing latestSelectVersion) or clearSelection().
  // This effect doesn't determine geometryInfo or sql changes or not, it's the job of method tryExecuteSelectingByGeometryInfoAndSqlUI.
  React.useEffect(() => {
    const currItemRuntimeInfo = currRuntimeInfoRef.current

    if (!currItemRuntimeInfo) {
      return
    }

    if (!dataSource) {
      // We don't need to create data source here, because when data source is ready, this effect will run again.
      // tryExecuteSelectingByGeometryInfoAndSqlUI() and clearSelection() will make sure data source created.
      return
    }

    const latestSelectTaskInfo = currItemRuntimeInfo.latestSelectTaskInfo

    if (!latestSelectTaskInfo) {
      return
    }

    const latestSelectVersion = latestSelectTaskInfo.version

    if (!isSelectTaskVersionValid(latestSelectVersion)) {
      return
    }

    // note, only execute new selecting task when latestSelectVersion changes bigger
    if (latestSelectVersion <= preLatestSelectVersionRef.current) {
      // if run here, means latestSelectVersion not changes in most cases, maybe updateDataSourceItemRuntimeInfoForUid prop changes
      return
    }

    setSelectingProgress(0)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort(`cancel selecting task ${preLatestSelectVersionRef.current} because need to execute a new one`)
      abortControllerRef.current = null
    }

    const thisSelectTaskVersion = latestSelectVersion

    // update preLatestSelectVersionRef
    preLatestSelectVersionRef.current = thisSelectTaskVersion

    // use abortController to make the selecting task cancelable
    const abortController = new AbortController() as AbortControllerExt
    abortController.selectVersion = thisSelectTaskVersion
    abortControllerRef.current = abortController
    const signal = abortController.signal

    // console.log(`run new selecting task ${thisSelectTaskVersion}`)

    let sqlExpression: SqlExpression = null

    if (currItemRuntimeInfo.imDisplaySqlExpression) {
      sqlExpression = currItemRuntimeInfo.imDisplaySqlExpression.asMutable() as unknown as SqlExpression
    }

    const query: FeatureLayerQueryParams = {
      returnGeometry: true,
      sqlExpression
    }

    const latestAppliedSql = latestSelectTaskInfo.appliedSql
    if (latestAppliedSql) {
      query.where = latestAppliedSql
    }

    const latestAppliedGeometryInfo = latestSelectTaskInfo.appliedGeometryInfo
    if (latestAppliedGeometryInfo) {
      query.geometry = latestAppliedGeometryInfo.geometry
      query.geometryType = latestAppliedGeometryInfo.geometryType
      query.spatialRel = latestAppliedGeometryInfo.spatialRel
    }

    const queriableDataSource = dataSource as ArcGISQueriableDataSource

    if (queriableDataSource.getPopupInfoFields) {
      query.outFields = queriableDataSource.getPopupInfoFields()
    }

    const selectionMode = latestSelectTaskInfo.selectionMode

    // check if current selecting task is fresh or not
    const isThisSelectTaskFresh = () => (currRuntimeInfoRef.current && currRuntimeInfoRef.current.latestSelectTaskInfo.version === thisSelectTaskVersion)

    const progressCallback = (progress: number) => {
      // only update progress when current selecting task is fresh
      if (isThisSelectTaskFresh()) {
        setSelectingProgress(progress)
      }
    }

    const dsExt = new DataSourceExtension(queriableDataSource, widgetId)

    const updateSelectionIfAborted = () => {
      // only update selection if current selecting task is fresh and abortController.ignoreAbortedSelection is false
      const isFresh = isThisSelectTaskFresh()
      const ignoreAbortedSelection = abortControllerRef.current?.ignoreAbortedSelection
      const update = isFresh && !ignoreAbortedSelection
      return update
    }

    async function selectRecords () {
      try {
        await dsExt.selectRecords(query, selectionMode, signal, jimuLayerView, progressCallback, updateSelectionIfAborted)
      } catch (err) {
        console.error('Select widget select records error', err)
      }

      if (abortControllerRef.current && abortControllerRef.current.selectVersion === thisSelectTaskVersion) {
        abortControllerRef.current = null
      }

      if (isThisSelectTaskFresh()) {
        updateDataSourceItemRuntimeInfoForUid(uid, {
          isSelecting: false
        })

        setSelectingProgress(1)
      }
    }

    selectRecords()

  // the dependencies must include latestSelectVersion
  }, [latestSelectVersion, dataSource, jimuLayerView, uid, updateDataSourceItemRuntimeInfoForUid, widgetId])

  // If config filter changed, we need to update runtime filter because we always render by runtime filter.
  React.useEffect(() => {
    const tempIsFilterIconVisible = shouldShowAttributeFilterIcon(supportCustomSQLBuilder, configSqlExpression)

    updateDataSourceItemRuntimeInfoForUid(uid, {
      shouldRenderFilterIcon: tempIsFilterIconVisible,
      imDisplaySqlExpression: configSqlExpression
    })
  }, [supportCustomSQLBuilder, configSqlExpression, uid, updateDataSourceItemRuntimeInfoForUid])

  // Execute a new selecting task if necessary by updating runtimeInfo.latestSelectTaskInfo.version.
  // If this method updates runtimeInfo.latestSelectTaskInfo.version, it will trigger [runtimeInfo.latestSelectTaskInfo.version] watcher effect to run the new select task.
  // This method is called when selectionMode changes, or geometryInfo changes or SQL UI changes, it always get sql from SQL UI
  // This method determines geometryInfo or sql changes or not, if both not changes, we don't execute a new selecting task
  const tryExecuteSelectingByGeometryInfoAndSqlUI = React.useCallback(async (selectionMode: DataSourceSelectionMode, newGeometryInfo: GeometryInfo) => {
    const latestRuntimeInfo = currRuntimeInfoRef.current

    if (!latestRuntimeInfo) {
      return
    }

    let ds = latestRuntimeInfo.dataSource

    if (!ds) {
      ds = await getOrCreateDataSource()
    }

    if (!ds) {
      return
    }

    newGeometryInfo = getFinalGeometryInfo(newGeometryInfo)
    // getOrCreateDataSource() is an async method, during this period, isAttributeFilterOn and imDisplaySqlExpression maybe changes,
    // so we need to read latestRuntimeInfo.isAttributeFilterOn and latestRuntimeInfo.imDisplaySqlExpression instead of isAttributeFilterOn and imDisplaySqlExpression.
    const newSql: string = getFinalAppliedSqlByUI(latestRuntimeInfo.isAttributeFilterOn, latestRuntimeInfo.imDisplaySqlExpression, ds)
    const latestSelectTaskInfo = latestRuntimeInfo.latestSelectTaskInfo

    if (latestSelectTaskInfo.version > 0) {
      // Select task has been created before, we need to determine selectionMode, geometryInfo or appliedSql changes or not.
      const isSelectionModeNotChanged = (selectionMode === latestSelectTaskInfo.selectionMode)
      const isGeometryInfoNotChanged = (newGeometryInfo === latestSelectTaskInfo.appliedGeometryInfo)
      const isSqlNotChanged = (newSql === latestSelectTaskInfo.appliedSql)

      if (isSelectionModeNotChanged && isGeometryInfoNotChanged && isSqlNotChanged) {
        // all condition not changed, so don't need to execute a new selecting task
        return
      }
    }

    const newLatestSelectVersion = latestSelectTaskInfo.version + 1
    const newSelectTaskInfo: SelectTaskInfo = {
      version: newLatestSelectVersion,
      selectionMode,
      appliedGeometryInfo: newGeometryInfo,
      appliedSql: newSql
    }

    updateDataSourceItemRuntimeInfoForUid(uid, {
      latestSelectTaskInfo: newSelectTaskInfo,
      isSelecting: true
    })
  }, [getOrCreateDataSource, uid, updateDataSourceItemRuntimeInfoForUid])
  const tryExecuteSelectingByGeometryInfoAndSqlUIRef = React.useRef<typeof tryExecuteSelectingByGeometryInfoAndSqlUI>(null)
  tryExecuteSelectingByGeometryInfoAndSqlUIRef.current = tryExecuteSelectingByGeometryInfoAndSqlUI

  // This method is called when click attribute filter switch to turn it on/off or click the batch-on/batch-off button
  const enableAttributeFilter = React.useCallback((enable: boolean) => {
    enable = !!enable
    if (shouldRenderFilterIcon) {
      updateDataSourceItemRuntimeInfoForUid(uid, {
        isAttributeFilterOn: enable
      })
    }
  }, [shouldRenderFilterIcon, uid, updateDataSourceItemRuntimeInfoForUid])

  // Clear data source selection, reset geometryInfo to null and turn off attribute filter.
  const clearSelection = React.useCallback(async () => {
    let ds = dataSource

    if (!ds) {
      ds = await getOrCreateDataSource()
    }

    if (!ds) {
      return
    }

    const dsExt = new DataSourceExtension(ds as ArcGISQueriableDataSource, widgetId)
    dsExt.clearSelection()

    // We use tryExecuteSelectingByGeometryInfoAndSqlUI() to execute a new selecting task and update state.
    // tryExecuteSelectingByGeometryInfoAndSqlUI(selectionMode, null, '') will update selection with empty records
    // and tryExecuteSelectingByGeometryInfoAndSqlUI(selectionMode, null, '') doesn't send http request.

    // set latestAppliedGeometryInfo to null and set isAttributeFilterOn to false
    const latestRuntimeInfo = currRuntimeInfoRef.current
    const latestSelectTaskInfo = latestRuntimeInfo.latestSelectTaskInfo
    const newLatestSelectVersion = latestSelectTaskInfo.version + 1
    const newGeometryInfo = getFinalGeometryInfo(null)
    const newSql = getFinalAppliedSql('')
    const newSelectTaskInfo: SelectTaskInfo = {
      version: newLatestSelectVersion,
      selectionMode: DataSourceSelectionMode.New,
      appliedGeometryInfo: newGeometryInfo,
      appliedSql: newSql
    }

    updateDataSourceItemRuntimeInfoForUid(uid, {
      latestSelectTaskInfo: newSelectTaskInfo,
      isAttributeFilterOn: false,
      isSelecting: true
    })
  }, [dataSource, getOrCreateDataSource, uid, updateDataSourceItemRuntimeInfoForUid, widgetId])

  const firstTimeRef = React.useRef<boolean>(true)

  // Run new selecting task if isAttributeFilterOn changes (attribute filter switch toggle) or imDisplaySqlExpression changes (SqlExpressionRuntime changes).
  React.useEffect(() => {
    const latestRuntimeInfo = currRuntimeInfoRef.current

    if (!latestRuntimeInfo) {
      return
    }

    const isFirstTime = firstTimeRef.current
    firstTimeRef.current = false

    if (!dataSource && !isFirstTime) {
      // Set isNeedDataSourceState to true, it will trigger the relative effect to create data source.
      // When we get data source, this effect will run again.
      // console.log('Select widget setIsNeedDataSourceState')
      setIsNeedDataSourceState(true)
      return
    }

    const latestSelectTaskInfo = latestRuntimeInfo.latestSelectTaskInfo

    const newSql: string = getFinalAppliedSqlByUI(isAttributeFilterOn, imDisplaySqlExpression, dataSource)

    // only run new selecting task when UI sql changed
    if (newSql !== latestSelectTaskInfo.appliedSql) {
      // both isAttributeFilterOn changing (attribute filter switch toggle) and imDisplaySqlExpression changing (SqlExpressionRuntime changes) will leads to sql changing
      // only update sql, don't change appliedGeometryInfo, so uses the old geometryInfo
      // console.log('sql change and call tryExecuteSelectingByGeometryInfoAndSqlUI')
      // attribute filter only works with DataSourceSelectionMode.New, use DataSourceSelectionMode.New as selection mode instead of using latestSelectTaskInfo.selectionMode
      if (tryExecuteSelectingByGeometryInfoAndSqlUIRef.current) {
        // We use tryExecuteSelectingByGeometryInfoAndSqlUIRef instead of tryExecuteSelectingByGeometryInfoAndSqlUI,
        // because we don't want to run this effect when tryExecuteSelectingByGeometryInfoAndSqlUI changes.
        tryExecuteSelectingByGeometryInfoAndSqlUIRef.current(DataSourceSelectionMode.New, latestSelectTaskInfo.appliedGeometryInfo)
      }
    }
  }, [dataSource, imDisplaySqlExpression, isAttributeFilterOn])

  // Update runtimeInfo.tryExecuteSelectingByGeometryInfoAndSqlUI when mounted and tryExecuteSelectingByGeometryInfoAndSqlUI changes.
  React.useEffect(() => {
    updateDataSourceItemRuntimeInfoForUid(uid, {
      tryExecuteSelectingByGeometryInfoAndSqlUI
    })
  }, [tryExecuteSelectingByGeometryInfoAndSqlUI, uid, updateDataSourceItemRuntimeInfoForUid])

  // Update runtimeInfo.enableAttributeFilter when mounted and enableAttributeFilter method changes.
  React.useEffect(() => {
    updateDataSourceItemRuntimeInfoForUid(uid, {
      enableAttributeFilter
    })
  }, [enableAttributeFilter, uid, updateDataSourceItemRuntimeInfoForUid])

  // Update runtimeInfo.clearSelection when mounted and clearSelection method changes.
  React.useEffect(() => {
    updateDataSourceItemRuntimeInfoForUid(uid, {
      clearSelection
    })
  }, [clearSelection, uid, updateDataSourceItemRuntimeInfoForUid])

  const onCheckboxChanged = React.useCallback((evt, checked: boolean) => {
    updateDataSourceItemRuntimeInfoForUid(uid, {
      checked
    })
  }, [updateDataSourceItemRuntimeInfoForUid, uid])

  // toggle filter panel visibility
  const onFilterIconClicked = React.useCallback(() => {
    setFilerPanelVisible(!isFilterPanelOpened)
  }, [setFilerPanelVisible, isFilterPanelOpened])

  // clear the selection of the data source
  const onClearIconClicked = React.useCallback(() => {
    clearSelection()
  }, [clearSelection])

  // user wants to stop the on-the-fly selecting task
  const onProgressStopBtnClicked = React.useCallback(() => {
    const abortController = abortControllerRef.current

    if (abortController) {
      abortController.abort()
    }
  }, [abortControllerRef])

  // show custom sql builder for generated layer
  const onCustomSqlBtnClicked = React.useCallback((evt) => {
    customSqlBtnRef.current = evt?.target
    setCustomSqlBuilderVisible(true)
  }, [setCustomSqlBuilderVisible])

  // toggle filter switch
  const onFilterSwitchChange = React.useCallback((evt, checked: boolean) => {
    if (!isSelecting) {
      enableAttributeFilter(checked)
    }
  }, [enableAttributeFilter, isSelecting])

  const onSqlExpressionChanged = React.useCallback((newImSqlExpression: IMSqlExpression) => {
    const isFilterIconVisible = shouldShowAttributeFilterIcon(supportCustomSQLBuilder, newImSqlExpression)

    updateDataSourceItemRuntimeInfoForUid(uid, {
      shouldRenderFilterIcon: isFilterIconVisible,
      imDisplaySqlExpression: newImSqlExpression
    })
  }, [supportCustomSQLBuilder, updateDataSourceItemRuntimeInfoForUid, uid])

  const onCustomSqlBuilderBack = React.useCallback((newImSqlExpression: IMSqlExpression) => {
    onSqlExpressionChanged(newImSqlExpression)
    setCustomSqlBuilderVisible(false)

    setTimeout(() => {
      const customSqlBtn = customSqlBtnRef.current

      if (customSqlBtn) {
        focusElementInKeyboardMode(customSqlBtn)
      }
    }, 100)
  }, [onSqlExpressionChanged, setCustomSqlBuilderVisible])

  const style = React.useMemo(() => {
    let iconContainerWidth = 38

    if (shouldRenderFilterIcon) {
      iconContainerWidth += 26
    }

    if (enableDataAction) {
      iconContainerWidth += 26
    }

    const strIconContainerWidth = `${iconContainerWidth}px`

    let selectionCountContainerWidth = 4 // margin-left

    if (isSelecting) {
      // progress width is 20
      selectionCountContainerWidth += 20
    } else {
      // selection count width = left padding 4px + number width + right padding 4px
      selectionCountContainerWidth += 4 + selectedCount.toString().length * 10 + 4
    }

    const strSelectionCountContainerWidth = `${selectionCountContainerWidth}px`

    return css`
    .select-ds-list-item-top-row {
      position: relative;

      .ds-list-label-container {
        width: calc(100% - ${strIconContainerWidth});
        flex-basis: calc(100% - ${strIconContainerWidth});
        flex-shrink: 0;
        flex-grow: 0;

        .ds-list-label {
          max-width: calc(100% - ${strSelectionCountContainerWidth});
          flex-basis: auto;
          flex-shrink: 0;
          flex-grow: 0;

          .layer-name {
            width: calc(100% - 20px);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .selection-count-container {
          width: ${strSelectionCountContainerWidth};
          flex-basis: ${strSelectionCountContainerWidth};
          flex-shrink: 0;
          flex-grow: 0;

          .selection-count {
            display: inline;
            border-radius: 4px;
            background: var(--sys-color-action-disabled);
            padding: 1px 4px 0px 4px;
            line-height: 16px;
            font-size: 12px;
          }

          .aria-live-label {
            display: block;
            width: 0;
            height: 0;
            overflow: hidden;
          }
        }
      }

      .ds-list-icons {
        box-sizing: border-box;
        flex-direction: row;
        width: ${strIconContainerWidth};
        flex-basis: ${strIconContainerWidth};
        flex-shrink: 0;
        flex-grow: 0;
        padding-left: 12px;
      }
    }

    .select-sql-hint {
      word-break: break-all;
    }

    .sql-expr-runtime-disabled {
      touch-action: none;
      pointer-events: none;
    }
  `
  }, [enableDataAction, isSelecting, selectedCount, shouldRenderFilterIcon])

  const selectedCountAriaLabel = React.useMemo(() => {
    let result = ''

    if (selectedCount > 0) {
      const selectedFeaturesTip = translate('SelectionSelectedFeatures')
      result = `${selectedFeaturesTip}: ${selectedCount}`
    }

    return result
  }, [selectedCount, translate])

  const ariaLiveLabel = React.useMemo(() => {
    let result = ''

    if (isSelecting) {
      result = translate('loading')
    } else if (selectedCountAriaLabel) {
      result = selectedCountAriaLabel
    }

    return result
  }, [isSelecting, selectedCountAriaLabel, translate])

  const selectionCountDomId = React.useId()

  if (!displayTitle) {
    return null
  }

  return (
    <div className={classNames(['select-ds-list-item w-100 mt-2', { 'filer-panel-opened': isFilterPanelOpened }])} css={style}>
      <div className='select-ds-list-item-top-row w-100 d-flex align-items-center'>
        <div className='ds-list-label-container d-flex align-items-center'>
          <Label className='ds-list-label d-flex align-items-center mb-0'>
            <Checkbox
              checked={isVisibleChecked}
              className='mr-1'
              onChange={onCheckboxChanged}
              aria-describedby={selectionCountDomId}
            />
            <span className='layer-name' title={displayTitle}>{displayTitle}</span>
          </Label>

          <div className='selection-count-container d-flex align-items-center pl-1'>
            {
              !isSelecting && selectedCount > 0 &&
              <div id={selectionCountDomId} className='selection-count' aria-label={selectedCountAriaLabel}>{selectedCount}</div>
            }

            {
              isSelecting &&
              <SelectProgress
                progress={selectingProgress}
                onClick={onProgressStopBtnClicked}
              />
            }

            <label className='aria-live-label' aria-live='polite'>{ariaLiveLabel}</label>
          </div>
        </div>

        <div className='ds-list-icons d-flex align-items-center'>
          {
            shouldRenderFilterIcon &&
            <Button
              title={ translate('attributeSelection') }
              type={ isFilterPanelOpened ? 'primary' : 'tertiary' }
              color={ isFilterPanelOpened ? undefined : 'inherit' }
              aria-expanded={isFilterPanelOpened}
              size='sm'
              icon
              onClick={onFilterIconClicked}
            >
              <AttributeSelectionOutlined width={16} height={16} />
            </Button>
          }

          <Button
            title={translate('clearSelection')}
            type='tertiary'
            color='inherit'
            size='sm'
            icon
            disabled={isSelecting || selectedCount === 0}
            onClick={onClearIconClicked}
          >
            <ClearSelectionGeneralOutlined size={16} />
          </Button>

          {
            enableDataAction &&
            <DataActionList
              widgetId={widgetId}
              dataSets={dataRecordSets}
              disableDataSourceLevelActions={true}
              buttonType='tertiary'
              listStyle={DataActionListStyle.Dropdown}
              hideGroupTitle={true}
            />
          }
        </div>
      </div>

      {
        shouldRenderFilterIcon &&
        <div className={classNames(['filter-panel w-100', { 'd-none': !isFilterPanelOpened }])}>
          <div className='d-flex w-100 align-items-center mt-3'>
            <label htmlFor={switchId} className='w-100 pb-0 pr-1 select-sql-hint'>{finalSqlHint}</label>

            {
              shouldRenderCustomSqlIcon &&
              <Button
                title={translate('customSQL')}
                type='tertiary'
                color='inherit'
                size='sm'
                icon
                onClick={onCustomSqlBtnClicked}
              >
                <PropertySettingOutlined />
              </Button>
            }

            <Switch
              className='where-switch'
              id={switchId}
              // disabled={isSelecting}
              checked={isAttributeFilterOn}
              onChange={onFilterSwitchChange}
            />
          </div>

          {/* SqlExpressionRuntime is used for data sources in app config. */}
          {
            shouldRenderSqlExpressionRuntime && dataSource &&
            <SqlExpressionRuntime
              className={classNames([{ 'sql-expr-runtime-disabled': isSelecting }])}
              widgetId={widgetId}
              dataSource={dataSource}
              expression={imDisplaySqlExpression}
              onChange={onSqlExpressionChanged}
            />
          }

          {/* CustomSqlBuilder is used for generated data sources. */}
          {
            isCustomSqlBuilderVisible && dataSource &&
            <CustomSqlBuilder
              isRTL={isRTL}
              widgetId={widgetId}
              widgetDomRef={widgetDomRef}
              dataSource={dataSource}
              imSqlExpression={imDisplaySqlExpression}
              onBack={onCustomSqlBuilderBack}
            />
          }
        </div>
      }
    </div>
  )
}
