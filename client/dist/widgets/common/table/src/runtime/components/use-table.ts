import {
  type DataRecord, React, hooks, lodash, type ClauseValuePair, DataSourceStatus,
  dataSourceUtils, Immutable, type FeatureDataRecord, CONSTANTS, ReactRedux, type IMState
} from 'jimu-core'
import FeatureTable from 'esri/widgets/FeatureTable'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import { LayerHonorModeType, type LayersConfig, PagingType, ResponsiveType, SelectionModeType, TableDataActionType } from '../../config'
import { getDataSourceById, getTableDataSource } from '../../utils'
import { constructTableTemplate, getDsAccessibleInfo, getIsAdvancedPermission, getTimezone } from './utils'
import type { JimuMapView } from 'jimu-arcgis'

interface UseTableOptions {
  dataInvalid: boolean
  layerConfig: LayersConfig
  activeView: JimuMapView
  tableContainer: React.RefObject<HTMLDivElement>
  canEditFeature: boolean
  selectQueryFlag: boolean
  tableShowColumns: ClauseValuePair[]
  dataActionRecords: DataRecord[]
  selectionViewIds?: string
  maxCount?: number
  sourceVersion? : string | number
  isMapMode: boolean
  tableSelectAsyncDs: (selectedIds: Array<string | number>) => void
  isSelfEditing: React.RefObject<boolean>
  activeTabId: string
  respectMapRange: boolean
  pagingStyle: PagingType
  pageSize: number
  // options can be override
  usedConfig: any
}

const useTable = (props: UseTableOptions): [__esri.FeatureTable, boolean, string] => {
  const {
    dataInvalid, layerConfig, activeView, tableContainer, canEditFeature, selectQueryFlag,
    tableShowColumns, dataActionRecords, selectionViewIds, maxCount, sourceVersion,
    isMapMode, tableSelectAsyncDs, isSelfEditing, activeTabId, respectMapRange, pagingStyle, pageSize, usedConfig
  } = props
  const [tableUsedLayer, setTableUsedLayer] = React.useState<__esri.FeatureLayer | __esri.SubtypeSublayer>()
  const [layerEditable, setLayerEditable] = React.useState<boolean>(false)
  const [isTableEditing, setIsTableEditing] = React.useState<boolean>(false)
  const [tableLoaded, setTableLoaded] = React.useState<boolean>(false)
  const [tableQueryingOrSyncing, setTableQueryingOrSyncing] = React.useState<boolean>(false)
  const [initGeometry, setInitGeometry] = React.useState(null)

  const tableRef = React.useRef<FeatureTable>(null)
  const tableClickRef = React.useRef<any>(null)
  const tableDblClickRef = React.useRef<any>(null)
  const tableKeyDownRef = React.useRef<any>(null)
  const tableHoverRef = React.useRef<any>(null)
  const tableHoverOutRef = React.useRef<any>(null)
  const timerFn = React.useRef(null)
  const usedDsIdRef = React.useRef<string>('')
  const ds = getDataSourceById(layerConfig?.useDataSource?.dataSourceId || layerConfig?.dataActionDataSource?.id)
  const dataSource = getTableDataSource(ds)
  // In some cases, such as chart output ds, need to get the jsapiLayer when the status is unloaded, so need this variable as a dependency
  const dsInfoStatus = ReactRedux.useSelector((state: IMState) => {
    return state.dataSourcesInfo?.[dataSource?.id]?.status
  })
  const previousDsInfoStatus = hooks.usePrevious(dsInfoStatus)
  const statusReady = (previousDsInfoStatus !== DataSourceStatus.Unloaded) && (dsInfoStatus === DataSourceStatus.Unloaded)
  const isOutputDsStatusReady = (dataSource?.dataViewId === CONSTANTS.OUTPUT_DATA_VIEW_ID) && statusReady

  const destroyTable = React.useCallback(() => {
    if (tableHoverRef.current?.remove) tableHoverRef.current.remove()
    if (tableHoverOutRef.current?.remove) tableHoverOutRef.current.remove()
    if (tableClickRef.current?.remove) tableClickRef.current.remove()
    if (tableDblClickRef.current?.remove) tableDblClickRef.current.remove()
    if (tableKeyDownRef.current?.remove) tableKeyDownRef.current.remove()
    if (tableRef.current && !tableRef.current.destroyed) {
      tableRef.current.destroy()
      tableRef.current = null
    }
    if (tableContainer.current) {
      tableContainer.current.innerHTML = ''
    }
  }, [tableContainer])

  React.useEffect(() => {
    return () => {
      destroyTable()
    }
  }, [destroyTable])

  React.useEffect(() => {
    if (usedDsIdRef.current !== dataSource?.id) {
      setTableUsedLayer(undefined)
      if(tableRef.current) destroyTable()
    }
  }, [dataSource?.id, activeTabId, destroyTable])

  React.useEffect(() => {
    if (!dataSource) return
    async function fetchDsGeometry() {
      let geometry = null
      try {
        const dsParam: any = dataSource?.getCurrentQueryParams()
        geometry = await dataSourceUtils.changeJimuArcGISQueryToJSAPIQuery(dataSource, Immutable(dsParam)).then(res => {
          if (res && res.geometry) {
            return res.geometry
          } else {
            return null
          }
        })
      } catch (err) {
        console.log(err)
      }
      return geometry
    }

    async function fetchLayer() {
      let response
      try {
        if (dataActionRecords?.length > 0) {
          const result = await dataSourceUtils.createJSAPIFeatureLayerByRecords(dataSource, dataActionRecords as FeatureDataRecord[])
          response = result.layer
        } else {
          response = await dataSource?.createJSAPILayerByDataSource() as __esri.FeatureLayer | __esri.SubtypeSublayer
        }
      } catch (err) {
        console.log(err)
      }
      return response
    }

    const dsGeometry = fetchDsGeometry()
    Promise.resolve(dsGeometry).then(geoRes => {
      setInitGeometry(geoRes)
      // get layer after geometry is ready
      if (isMapMode && !layerConfig?.dataActionObject) {
        const jimuLayerViews = activeView?.getAllJimuLayerViews()
        const currentLayerView = jimuLayerViews?.find(layerView => {
          // layerViewId: 'widget_1-dataSource_4-187938b7328-layer-2'
          // dsId: 'dataSource_4-187938b7328-layer-2'
          // layerDataSourceId: 'dataSource_4-187938b7328-layer-2'
          return layerView.layerDataSourceId === layerConfig?.useDataSource?.dataSourceId
        })
        // currentLayerView not exist: table layer or other special situation
        const layerType = currentLayerView?.layer?.type
        if (!currentLayerView || !layerType || (layerType !== 'feature' && layerType !== 'subtype-sublayer')) {
          const usedLayer = fetchLayer()
          Promise.resolve(usedLayer).then(res => {
            setTableUsedLayer(res)
          })
        } else {
          const mapLayer = currentLayerView?.layer as __esri.FeatureLayer | __esri.SubtypeSublayer
          setTableUsedLayer(mapLayer)
        }
      } else {
        const usedLayer = fetchLayer()
        Promise.resolve(usedLayer).then(res => {
          setTableUsedLayer(res)
        })
      }
    })
    usedDsIdRef.current = dataSource?.id
  }, [dataSource, sourceVersion, activeView, isMapMode, layerConfig?.useDataSource?.dataSourceId,
    layerConfig?.dataActionObject, isOutputDsStatusReady, dataActionRecords, selectionViewIds
  ])

  React.useEffect(() => {
    const tableWidget = tableRef.current
    if (tableWidget) tableWidget.maxSize = maxCount
  }, [maxCount])

  React.useEffect(() => {
    if (typeof canEditFeature !== 'boolean') return
    async function checkLayerEditable() {
      // view in table: edit is meaningless
      if (layerConfig?.dataActionType === TableDataActionType.View) {
        setLayerEditable(false)
        return
      }
      // fetch to confirm whether it's a public source
      const accessible = await getDsAccessibleInfo(tableUsedLayer?.url)
      const isAdvancedPermission = await getIsAdvancedPermission(dataSource)
      // full editing privileges
      const fullEditingPrivileges = (tableUsedLayer as any)?.userHasFullEditingPrivileges
      // check layer capabilities for delete operation
      const layerEditingEnabled = tableUsedLayer?.editingEnabled ?? true
      const isHonorWebmap = layerConfig?.layerHonorMode === LayerHonorModeType.Webmap
      const canEdit = accessible || canEditFeature
      const normalEditPermission = isHonorWebmap ? canEdit : layerConfig?.enableEdit && canEdit
      let editable = false
      if (isAdvancedPermission || (fullEditingPrivileges && layerEditingEnabled)) {
        editable = true
      } else if (fullEditingPrivileges && !layerEditingEnabled) {
        editable = false
      } else {
        editable = normalEditPermission
      }
      setLayerEditable(editable)
    }
    checkLayerEditable()
  }, [tableUsedLayer, canEditFeature, dataSource, layerConfig])

  const resetTableExpression = React.useCallback(() => {
    const tableWidget = tableRef.current
    if (tableWidget?.layer) {
      const curQuery: any = dataSource && dataSource.getCurrentQueryParams()
      const sqlExpression = curQuery.where
      const tableInstance = tableWidget as any
      tableInstance.definitionExpression = sqlExpression
    }
  }, [dataSource])

  const bindTableClickEvent = React.useCallback(() => {
    const tableWidget = tableRef.current
    const selectMode = usedConfig?.selectMode
    if (!selectMode || !tableWidget) return
    const rowClickFn = ({ feature, objectId: thisId }) => {
      // click none-content cell (ed. title)
      if (!feature) return
      // edit mode cancel cell-click
      if (isTableEditing) return
      const originalSelected = tableWidget.highlightIds
      // Delay click function
      clearTimeout(timerFn.current)
      timerFn.current = setTimeout(() => {
        const objectId = thisId || feature.getObjectId()
        const thisSelected = originalSelected.includes(objectId)
        // attachment also has a row-click event, cause sth unexpected
        const isAttachmentEditing = (tableWidget as any).attachmentsViewOptions.objectId
        const isRelatedTable = tableWidget.relatedTable
        if (!isAttachmentEditing && !isRelatedTable) {
          if (selectMode === SelectionModeType.Single) {
            tableWidget.highlightIds.removeAll()
          }
          thisSelected
            ? tableWidget.highlightIds.remove(objectId)
            : tableWidget.highlightIds.add(objectId)
          const selectedIds = tableWidget.highlightIds?.toArray()
          if (selectedIds?.length === 0) {
            if (selectQueryFlag) tableWidget.filterBySelectionEnabled = false
            resetTableExpression()
          }
          tableSelectAsyncDs(selectedIds)
        } else {
          tableSelectAsyncDs([thisId || feature.getObjectId()])
        }
      }, 200)
    }
    if (tableClickRef.current?.remove) tableClickRef.current.remove()
    if (!isTableEditing) tableClickRef.current = tableWidget.on('cell-click', rowClickFn as any)
    // dblclick cancel click event
    if (tableDblClickRef.current?.remove) tableDblClickRef.current.remove()
    tableDblClickRef.current = tableWidget.on('cell-dblclick', ({ feature, objectId: thisId }) => {
      clearTimeout(timerFn.current)
      // revert dblclick emit select
      // if an edit widget is in the page, it will also emit edit process, and the focus will be on the edit widget
    })
  }, [isTableEditing, usedConfig?.selectMode, resetTableExpression, selectQueryFlag, tableSelectAsyncDs])

  const bindTableKeyDownEvent = React.useCallback(() => {
    const tableWidget = tableRef.current
    const selectMode = usedConfig?.selectMode
    if (!selectMode || !tableWidget) return
    const keyDownFn = ({ feature, native, objectId: thisId }) => {
      // click none-content cell (ed. title)
      if (!feature) return
      // edit mode cancel cell-click
      if (isTableEditing) return
      const keyCode = native.keyCode
      // use shift+space key to select, enter key is used for enter edit mode(api)
      if (native.shiftKey && keyCode === 32) {
        const originalSelected = tableWidget.highlightIds
        const objectId = thisId || feature.getObjectId()
        const thisSelected = originalSelected.includes(objectId)
        // attachment also has a row-click event, cause sth unexpected
        const notAttachmentEditing = !(tableWidget as any).attachmentsViewOptions.objectId
        if (notAttachmentEditing) {
          if (selectMode === SelectionModeType.Single) {
            tableWidget.highlightIds.removeAll()
          }
          thisSelected
            ? tableWidget.highlightIds.remove(objectId)
            : tableWidget.highlightIds.add(objectId)
          const selectedIds = tableWidget.highlightIds?.toArray()
          if (selectedIds?.length === 0) {
            if (selectQueryFlag) tableWidget.filterBySelectionEnabled = false
            resetTableExpression()
          }
          tableSelectAsyncDs(selectedIds)
        } else {
          tableSelectAsyncDs([thisId || feature.getObjectId()])
        }
      }
    }
    if (tableKeyDownRef.current?.remove) tableKeyDownRef.current.remove()
    if (!isTableEditing) tableKeyDownRef.current = tableWidget.on('cell-keydown', keyDownFn as any)
  }, [isTableEditing, usedConfig?.selectMode, resetTableExpression, selectQueryFlag, tableSelectAsyncDs])

  React.useEffect(() => {
    if (usedConfig?.enableSelect) {
      bindTableClickEvent()
      bindTableKeyDownEvent()
    } else {
      if (tableClickRef.current?.remove) tableClickRef.current.remove()
      if (tableDblClickRef.current?.remove) tableDblClickRef.current.remove()
      if (tableKeyDownRef.current?.remove) tableKeyDownRef.current.remove()
    }
  }, [usedConfig?.enableSelect, isTableEditing, bindTableClickEvent, bindTableKeyDownEvent])

  const updateTableByConfig = React.useCallback((configChange?: boolean) => {
    const tableWidget = tableRef.current
    if (!layerConfig || !tableWidget) return
    const tableTemplate = constructTableTemplate(dataSource, layerConfig, usedConfig, tableShowColumns, configChange)
    const templateChange = !lodash.isDeepEqual(tableWidget.tableTemplate?.columnTemplates, tableTemplate?.columnTemplates)
    if (configChange || templateChange) tableWidget.tableTemplate = tableTemplate
    // Table is not displayed if the fields is empty
    if (tableTemplate.columnTemplates?.length === 0) {
      tableWidget.visible = false
    } else {
      tableWidget.visible = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, layerConfig, usedConfig])

  const updateTableColumns = React.useCallback(() => {
    const tableWidget = tableRef.current
    if (!layerConfig?.columnSetting || !tableWidget) return
    // Related data/attachment width
    const columnSetting = layerConfig.columnSetting
    const isFixed = columnSetting?.responsiveType === ResponsiveType.Fixed
    if (isFixed) {
      const fixedWidth = columnSetting.columnWidth || 200
      const tableColumns = tableWidget.columns?.toArray() || []
      tableColumns.forEach((column, index) => {
        const useColumn = column as any
        const isAttachments = useColumn.fieldName === 'EsriFeatureTableAttachmentsColumn'
        const isRelationShip = useColumn.fieldName.indexOf('EsriFeatureTableRelationshipColumn') >= 0
        if (isAttachments || isRelationShip) {
          setTimeout(() => {
            (tableRef.current.columns.toArray()[index] as any).width = fixedWidth
          }, 200)
        }
      })
    }
  }, [layerConfig?.columnSetting])

  React.useEffect(() => {
    if (tableLoaded) updateTableByConfig()
  }, [tableLoaded, updateTableByConfig])

  React.useEffect(() => {
    if (tableLoaded && !tableQueryingOrSyncing) updateTableColumns()
  }, [tableLoaded, tableQueryingOrSyncing, updateTableColumns])

  const { enableRelatedRecords, enableAttachments, enableSelect } = usedConfig
  const previousLayerConfig = hooks.usePrevious(layerConfig)
  const previousUsedConfig = hooks.usePrevious(usedConfig)
  const prevEnableRelatedRecords = hooks.usePrevious(enableRelatedRecords)
  const prevEnableAttachments = hooks.usePrevious(enableAttachments)
  const previousTableUsedLayer = hooks.usePrevious(tableUsedLayer)
  const prevPagingStyle = hooks.usePrevious(pagingStyle)
  const prevPageSize = hooks.usePrevious(pageSize)
  const preViousLayerEditable = hooks.usePrevious(layerEditable)

  const updateDataSourceEvent = React.useCallback((event) => {
    // only update data source when editing
    if (!tableRef.current?.isQueryingOrSyncing) return
    // editing comes from self
    isSelfEditing.current = true
    const { updatedFeatures, deletedFeatures } = event
    // There is no 'add' in api for now
    const updates = updatedFeatures && updatedFeatures.length > 0
    const deletes = deletedFeatures && deletedFeatures.length > 0
    if (updates) {
      const updateFeature = event?.edits?.updateFeatures?.[0]
      if (updateFeature) {
        const record = dataSource.buildRecord(updateFeature)
        dataSource.afterUpdateRecord(record)
      }
    }
    if (deletes) {
      const deleteFeatures = event?.edits?.deleteFeatures
      if (deleteFeatures?.length > 0) {
        const deleteIds = []
        deleteFeatures.forEach(deleteFeature => {
          const record = dataSource.buildRecord(deleteFeature)
          deleteIds.push(record.getId())
        })
        dataSource.afterDeleteRecordsByIds(deleteIds)
      }
    }
  }, [dataSource, isSelfEditing])

  if (dataInvalid) {
    if(tableRef.current) destroyTable()
  } else {
    if (tableContainer.current && dataSource && tableUsedLayer) {
      // for same ds different tab
      const activeChange = (layerConfig.id !== previousLayerConfig?.id)
        && (layerConfig?.useDataSource?.dataSourceId === previousLayerConfig?.useDataSource?.dataSourceId)
      const configChange = !lodash.isDeepEqual(layerConfig, previousLayerConfig) || !lodash.isDeepEqual(usedConfig, previousUsedConfig)
      const layerChange = !lodash.isDeepEqual(tableUsedLayer, previousTableUsedLayer)
      if (!tableRef.current || layerChange || activeChange) {
        destroyTable()
        const container = document.createElement('div')
        container.className = 'h-100'
        tableContainer.current.appendChild(container)
        tableRef.current = new FeatureTable({
          container,
          layer: tableUsedLayer as any,
          ...(activeView?.view ? { view: activeView.view } : {}),
          ...(maxCount ? { maxSize: maxCount } : {}),
          paginationEnabled: pagingStyle === PagingType.Multiple,
          pageSize: pageSize || 50,
          attachmentsEnabled: enableAttachments,
          relatedRecordsEnabled: enableRelatedRecords,
          visibleElements: {
            columnDescriptions: false,
            header: false,
            menu: false,
            menuItems: {
              clearSelection: false,
              refreshData: false,
              toggleColumns: false
            },
            selectionColumn: false
          },
          menuConfig: { items: [] },
          multiSortEnabled: true,
          editingEnabled: layerEditable,
          timeZone: getTimezone(dataSource),
          // init extent filter
          filterGeometry: initGeometry
        })
        // click event
        if (enableSelect) {
          bindTableClickEvent()
          bindTableKeyDownEvent()
        } else {
          if (tableClickRef.current?.remove) tableClickRef.current.remove()
          if (tableDblClickRef.current?.remove) tableDblClickRef.current.remove()
          if (tableKeyDownRef.current?.remove) tableKeyDownRef.current.remove()
        }
      }
      const tableWidget = tableRef.current
      if (layerEditable !== preViousLayerEditable) {
        tableWidget.editingEnabled = layerEditable
      }
      if (prevEnableAttachments !== enableAttachments) {
        tableWidget.attachmentsEnabled = enableAttachments
        updateTableByConfig(true)
      }
      if (prevEnableRelatedRecords !== enableRelatedRecords) {
        tableWidget.relatedRecordsEnabled = enableRelatedRecords
        updateTableByConfig(true)
      }
      if (prevPagingStyle !== pagingStyle) {
        tableWidget.paginationEnabled = pagingStyle === PagingType.Multiple
      }
      if (prevPageSize !== pageSize) {
        tableWidget.pageSize = pageSize || 50
      }
      if (layerConfig && (layerConfig.id === previousLayerConfig?.id) && configChange) {
        updateTableByConfig(true)
      }
    }
  }

  // bind update ds event when tableUsedLayer changed
  React.useEffect(() => {
    let handle: __esri.Handle
    if (!tableUsedLayer) return
    if (tableUsedLayer.type === 'subtype-sublayer') {
      const subtypeGrouplayer = tableUsedLayer.parent
      if (subtypeGrouplayer.on) {
        handle = subtypeGrouplayer.on('edits', updateDataSourceEvent)
      }
    } else {
      if (tableUsedLayer.on) {
        handle = tableUsedLayer.on('edits', updateDataSourceEvent)
      }
    }
    // unbind the previous layer's event when tableUsedLayer changed
    return () => {
      handle?.remove()
    }
  },[tableUsedLayer, updateDataSourceEvent])

  const table = tableRef.current
  React.useEffect(() => {
    const watchState = reactiveUtils.watch(() => table?.state, (tableState) => {
      setTableLoaded(tableState === 'loaded')
    }, { initial: true, sync: true })
    const watchTableEditing = reactiveUtils.watch(() => table?.columns?.toArray().some(column => (column as any).editInfo), editInfo => {
      setIsTableEditing(!!editInfo)
    }, { initial: true, sync: true })
    const watchRelatedTable = reactiveUtils.watch(() => table?.relatedTable, (relatedTable) => {
      if (relatedTable) {
        relatedTable.visibleElements.selectionColumn = false
      }
    }, { sync: true })
    const watchTableQueryingOrSyncing = reactiveUtils.watch(() => table?.isQueryingOrSyncing, (tableQueryingOrSyncing) => {
      setTableQueryingOrSyncing(tableQueryingOrSyncing)
    }, { initial: true, sync: true })

    return () => {
      watchState?.remove()
      watchTableEditing?.remove()
      watchRelatedTable?.remove()
      watchTableQueryingOrSyncing?.remove()
    }
  }, [table])

  // scale range listener
  React.useEffect(() => {
    let watchRendered: __esri.WatchHandle
    if (respectMapRange) {
      const jimuLayerViews = activeView?.getAllJimuLayerViews()
      const currentLayerView = jimuLayerViews?.find(layerView => {
        return layerView.layerDataSourceId === layerConfig?.useDataSource?.dataSourceId
      })
      if (!currentLayerView) {
        if (table) table.maxSize = null
        return
      }
      watchRendered = reactiveUtils.watch(() => currentLayerView?.isLayerVisibleForRendering(), (rendered) => {
        if (rendered) {
          if (table) table.maxSize = null
        } else {
          if (table) table.maxSize = 0
        }
      }, { initial: true, sync: true })
    } else {
      if (table) table.maxSize = null
    }

    return () => {
      watchRendered?.remove()
    }
  }, [table, respectMapRange, activeView, layerConfig?.useDataSource?.dataSourceId])

  return [tableRef.current, tableLoaded, usedDsIdRef.current]
}

export default useTable
