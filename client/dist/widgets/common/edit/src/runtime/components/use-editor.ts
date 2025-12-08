import { Immutable, React, hooks, type JSAPILayerTypes } from 'jimu-core'
import { type JimuLayerView, type JimuMapView, SnappingUtils } from 'jimu-arcgis'
import Editor from 'esri/widgets/Editor'
import { type IMConfig, type LayersConfig, SnapSettingMode } from '../../config'
import { getDataSourceById, getEditDataSource, SUPPORTED_JIMU_LAYER_TYPES, type SupportedDataSource, type SupportedLayer } from '../../utils'
import { constructUneditableInfo, getEditorLayerInfo, isEditableLayerView, updateDataSourceAfterEdit } from './utils'

interface UseEditorOptions {
  config: IMConfig
  jimuMapView: JimuMapView
  editContainer: React.RefObject<HTMLDivElement>
  canEditFeature: boolean
}

const useEditor = (options: UseEditorOptions) => {
  const { config, jimuMapView, editContainer, canEditFeature } = options
  const { mapViewsConfig, relatedRecords, liveDataEditing } = config
  const editorRef = React.useRef<Editor>(null)
  const destroyEditor = React.useCallback(() => {
    if (editorRef.current && !editorRef.current.destroyed) {
      editorRef.current.destroy()
    }
  }, [])
  React.useEffect(() => {
    return () => {
      destroyEditor()
    }
  }, [destroyEditor])

  const [editorLayerInfos, setEditorLayerInfos] = React.useState<__esri.EditorLayerInfo[]>([])
  const [showUpdateBtn, setShowUpdateBtn] = React.useState(false)
  const updateEditorLayerInfos = React.useCallback(() => {
    if (!jimuMapView || typeof canEditFeature !== 'boolean') return
    let allLayerViews = jimuMapView.getAllJimuLayerViews()
    const mapViewConfig = mapViewsConfig?.[jimuMapView.id]
    const customizeLayers = mapViewConfig?.customizeLayers
    const customJimuLayerViewIds = mapViewConfig?.customJimuLayerViewIds
    const layersConfig = mapViewConfig?.layersConfig || Immutable<LayersConfig[]>([])
    if (customizeLayers) {
      allLayerViews = allLayerViews.sort((a, b) => {
        const aIndex = layersConfig.findIndex(layerConfig => layerConfig.id === a.layerDataSourceId)
        const bIndex = layersConfig.findIndex(layerConfig => layerConfig.id === b.layerDataSourceId)
        return aIndex - bIndex
      })
    }
    const allLayers = jimuMapView.view?.map?.allLayers?.toArray?.() || []
    const uneditableLayers = allLayers.filter(layer => {
      const isSupported = SUPPORTED_JIMU_LAYER_TYPES.includes(layer.type as JSAPILayerTypes)
      const notInJimuLayerView = !allLayerViews.find(layerView => layerView.layer === layer)
      return isSupported && notInJimuLayerView
    }) as SupportedLayer[]
    const supportedLayerViews = allLayerViews.filter(layerView => {
      const layer = layerView.layer
      const isSupported = SUPPORTED_JIMU_LAYER_TYPES.includes(layer.type)
      return isSupported
    })
    const editableLayerViews: JimuLayerView[] = []
    supportedLayerViews.forEach(layerView => {
      const isEditable = isEditableLayerView(layerView, customizeLayers, customJimuLayerViewIds, liveDataEditing)
      if (isEditable) {
        editableLayerViews.push(layerView)
      } else {
        uneditableLayers.push(layerView.layer)
      }
    })
    const uneditableLayerInfos = uneditableLayers.map(layer => constructUneditableInfo(layer))
    const editablePromise = editableLayerViews.map(async (layerView) => {
      const ds = await layerView.getOrCreateLayerDataSource() as SupportedDataSource
      if (!ds) return null
      const layerConfig = layersConfig.filter(l => l.id === ds?.id)?.[0]?.asMutable?.({ deep: true })
      const dataSource = getEditDataSource(ds)
      return getEditorLayerInfo(dataSource, layerConfig, layerView, relatedRecords, canEditFeature)
    })
    Promise.all(editablePromise).then((results) => {
      const validResults = results.filter(v => !!v)
      setShowUpdateBtn(validResults.some(r => r.showUpdateBtn))
      const layerInfos = validResults.map(r => r.editorLayerInfo).concat(uneditableLayerInfos)
      const relatedTableInfos = []
      const allTables = (jimuMapView.view.map.allTables.toArray() || []) as __esri.FeatureLayer[]
      for (const layerInfo of layerInfos) {
        const elements = layerInfo.formTemplate?.elements || []
        const hasRelationships = elements.some(e => e.type === 'relationship')
        if (!hasRelationships) continue
        const relationships = (layerInfo.layer as __esri.FeatureLayer | __esri.SubtypeSublayer | __esri.SceneLayer).relationships
        for (const relationship of relationships) {
          const relatedTableId = relationship.relatedTableId
          const relatedTable = allTables.find(t => t.layerId === relatedTableId)
          if (!relatedTable) continue
          const relatedTableInfo = relatedTableInfos.find(tableInfo => tableInfo.layer === relatedTable)
          if (relatedTableInfo) continue
          relatedTableInfos.push({
            layer: relatedTable,
            enabled: true,
            addEnabled: layerInfo.addEnabled,
            updateEnabled: layerInfo.updateEnabled,
            deleteEnabled: layerInfo.deleteEnabled,
          })
        }
      }
      setEditorLayerInfos(layerInfos.concat(relatedTableInfos))
    })
  }, [canEditFeature, jimuMapView, liveDataEditing, mapViewsConfig, relatedRecords])

  React.useEffect(() => {
    updateEditorLayerInfos()
  }, [updateEditorLayerInfos])

  const updateEditorLayerInfosRef = hooks.useLatest(updateEditorLayerInfos)
  React.useEffect(() => {
    if (!jimuMapView?.view?.map?.layers) return
    const visibleChangedListener = () => {
      updateEditorLayerInfosRef.current()
    }
    let timer: number = null
    let lastLayerCount = jimuMapView.getAllJimuLayerViews().length
    const layersChangedListener = (jimuLayerView: JimuLayerView) => {
      // if the layer is from runtime, update layerInfos immediately
      if (jimuLayerView.fromRuntime) {
        updateEditorLayerInfosRef.current()
        return
      }
      // if the layer is created while map loading, debounce the update for 5 seconds
      // to avoid too many updates
      if (timer) {
        window.clearTimeout(timer)
      }
      timer = window.setTimeout(() => {
        const currentLayerCount = jimuMapView.getAllJimuLayerViews().length
        if (currentLayerCount === lastLayerCount) return
        updateEditorLayerInfosRef.current()
        lastLayerCount = currentLayerCount
      }, 5000)
    }
    jimuMapView.addJimuLayerViewsVisibleChangeListener(visibleChangedListener)
    jimuMapView.addJimuLayerViewCreatedListener(layersChangedListener)
    jimuMapView.addJimuLayerViewRemovedListener(layersChangedListener)
    return () => {
      jimuMapView?.removeJimuLayerViewsVisibleChangeListener?.(visibleChangedListener)
      jimuMapView?.removeJimuLayerViewCreatedListener?.(layersChangedListener)
      jimuMapView?.removeJimuLayerViewRemovedListener?.(layersChangedListener)
    }
  }, [jimuMapView, updateEditorLayerInfosRef])

  const updateEditorByConfig = React.useCallback(async () => {
    const editorWidget = editorRef.current
    const {
      selfSnapping, featureSnapping, gridSnapping = false, defaultSelfEnabled, defaultFeatureEnabled, defaultGridEnabled = false,
      snapSettingMode, defaultSnapLayers, tooltip, defaultTooltipEnabled = false, segmentLabel = true, defaultSegmentLabelEnabled = false,
      templateFilter, initialReshapeMode, batchEditing= false
    } = config
    editorWidget.tooltipOptions.enabled = defaultTooltipEnabled
    editorWidget.labelOptions.enabled = defaultSegmentLabelEnabled
    editorWidget.snappingOptions.enabled = defaultSelfEnabled || defaultFeatureEnabled || defaultGridEnabled
    editorWidget.snappingOptions.selfEnabled = defaultSelfEnabled
    editorWidget.snappingOptions.featureEnabled = defaultFeatureEnabled
    editorWidget.snappingOptions.gridEnabled = defaultGridEnabled && gridSnapping
    editorWidget.snappingOptions.featureSources = await SnappingUtils.getSnappingFeatureSourcesCollection(jimuMapView, defaultSnapLayers)
    const flexibleMode = snapSettingMode === SnapSettingMode.Flexible
    const snapOn = selfSnapping || featureSnapping || gridSnapping
    const snappingControlsOpen = flexibleMode && snapOn;
    (editorWidget.visibleElements as any).selectionToolbar = batchEditing
    editorWidget.visibleElements.snappingControls = snappingControlsOpen
    editorWidget.visibleElements.snappingControlsElements = {
      enabledToggle: selfSnapping || featureSnapping || gridSnapping,
      selfEnabledToggle: selfSnapping,
      featureEnabledToggle: featureSnapping,
      layerList: featureSnapping,
      layerListToggleLayersButton: featureSnapping,
      gridEnabledToggle: gridSnapping,
      gridControls: gridSnapping
    }
    editorWidget.visibleElements.tooltipsToggle = tooltip
    editorWidget.visibleElements.labelsToggle = segmentLabel
    const settingsOpen = snappingControlsOpen || tooltip || (segmentLabel && jimuMapView.view?.type === '3d')
    editorWidget.visibleElements.settingsMenu = settingsOpen
    editorWidget.supportingWidgetDefaults = {
      featureTemplates: {
        visibleElements: {
          filter: templateFilter
        }
      },
      sketch: {
        defaultUpdateOptions: {
          tool: initialReshapeMode ? 'reshape' : 'transform'
        }
      }
    }
  }, [config, jimuMapView])

  const previousJimuMapView = hooks.usePrevious(jimuMapView)
  const previousConfig = hooks.usePrevious(config)
  const updateDataSource = React.useCallback(async (
    layer: __esri.SubtypeGroupLayer | __esri.FeatureLayer,
    event: __esri.SubtypeGroupLayerEditsEvent | __esri.FeatureLayerEditsEvent
  ) => {
    // Only update data source when editing or adding
    if (!editorRef.current?.viewModel.syncing) return
    const dsId = jimuMapView.getDataSourceIdByAPILayer(layer)
    const ds = getDataSourceById(dsId)
    if (!ds) return
    const objectIdField = layer.objectIdField
    const addIds = event.addedFeatures.map(f => f.objectId)
    let addFeatures = []
    if (addIds.length > 0) {
      const addFeatureSet = await layer.queryFeatures({
        where: `${objectIdField} IN (${addIds.join(',')})`,
        outFields: ['*'],
        returnGeometry: false
      })
      addFeatures = addFeatureSet?.features || []
    }

    const updateIds = event.updatedFeatures.map(f => f.objectId)
    let updateFeatures = []
    if (updateIds.length > 0) {
      const updateFeatureSet = await layer.queryFeatures({
        where: `${objectIdField} IN (${updateIds.join(',')})`,
        outFields: ['*'],
        returnGeometry: false
      })
      updateFeatures = updateFeatureSet?.features || []
    }
    const deleteFeatures = event.deletedFeatures.map(f => ({objectId: f.objectId}))
    updateDataSourceAfterEdit(ds, { addFeatures, updateFeatures, deleteFeatures})
  }, [jimuMapView])
  React.useEffect(() => {
    if (!jimuMapView || !editContainer.current) return

    if (!editorRef.current || jimuMapView !== previousJimuMapView) {
      destroyEditor()
      const container = document.createElement('div')
      container.className = 'h-100'
      editContainer.current.appendChild(container)
      editorRef.current = new Editor({
        container,
        view: jimuMapView.view
      })
      updateEditorByConfig()
    } else if (config !== previousConfig) {
      updateEditorByConfig()
    }
  }, [config, destroyEditor, editContainer, jimuMapView, previousConfig, previousJimuMapView, updateEditorByConfig])
  React.useEffect(() => {
    const editorWidget = editorRef.current
    if (!editorWidget) return
    const handles: __esri.Handle[] = []
    for (const layerInfo of editorLayerInfos) {
      if (!layerInfo.enabled) continue
      const editorLayer = layerInfo.layer
      if (editorLayer.type === 'subtype-sublayer') {
        const subtypeGrouplayer = editorLayer.parent
        const handle = subtypeGrouplayer?.on('edits', (event) => {
          updateDataSource(subtypeGrouplayer, event)
        })
        handles.push(handle)
      } else {
        const featureLayer = editorLayer as unknown as __esri.FeatureLayer
        const handle = featureLayer.on('edits', (event) => {
          updateDataSource(featureLayer, event)
        })
        handles.push(handle)
      }

    }
    editorWidget.layerInfos = editorLayerInfos
    editorWidget.visibleElements.editFeaturesSection = showUpdateBtn
    return () => {
      for (const handle of handles) {
        handle.remove()
      }
    }
  }, [editorLayerInfos, showUpdateBtn, updateDataSource])

  return editorRef.current
}

export default useEditor
