import type Graphic from 'esri/Graphic'
import type { JimuLayerView, JimuMapView } from 'jimu-arcgis'
import { type DataSource, DataSourceComponent, type DataSourceJson, DataSourceStatus, type FeatureLayerDataSource, hooks, type IMDataSourceInfo, Immutable, type ImmutableArray, type ImmutableObject, type QueryParams, QueryScope, React, type UseDataSource } from 'jimu-core'
import { useRef } from 'react'
import type { TrackLinePoint } from '../../config'
import { getPointGraphic, Operations, createJimuLayerView, createDataSourceLayer, syncDataToLayer } from './utils'
import * as reactiveUtils from 'esri/core/reactiveUtils'

interface OutputSourceManagerProps {
  widgetId: string
  dataSourceId: string
  jimuMapView: JimuMapView
  highlightLocation: boolean
  symbolColor: string
  operationRecords: TrackLinePoint[]
  tracks: TrackLinePoint[]
  operation: Operations
  layerVisible: boolean
  showRuntimeLayers: boolean
  selectedFields: string[]
  onCreate?: (dataSourceJson: DataSourceJson) => void
  onHandleSelection?: (ids: string[], type: string) => void
  onHandleFilter?: (ids: number[], type: string) => void
  handleLayerVisibleChange: (ids: string[], visible: boolean, type: number) => void
  onLinePointsRecordsChanges?: (tracks: TrackLinePoint[], count: number) => void

}

const OutputSourceManager = (props: OutputSourceManagerProps) => {
  const {
    widgetId,
    dataSourceId,
    operationRecords,
    operation,
    symbolColor,
    jimuMapView,
    layerVisible,
    highlightLocation,
    showRuntimeLayers,
    tracks,
    onCreate: propOnCreate,
    onHandleSelection,
    onHandleFilter,
    onLinePointsRecordsChanges
  } = props
  const isFirstRender = useRef(true)
  const jimuMapViewRef = useRef<JimuMapView>(null)
  const jimuLayerViewRef = useRef<JimuLayerView>(null)
  const [rendererObject, setRendererObject] = React.useState({
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      size: 10,
      color: symbolColor || '#007AC2',
      outline: null
    }
  })

  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [watchLayerVisibleChangeHandle, setWatchLayerVisibleChangeHandle] = React.useState<__esri.Handle>(null)

  const onCreate = hooks.useLatest(propOnCreate)

  const removeJimuLayerViews = (jmMapView: JimuMapView) => {
    if (watchLayerVisibleChangeHandle) {
      watchLayerVisibleChangeHandle.remove()
      setWatchLayerVisibleChangeHandle(null)
    }
    jmMapView.removeJimuLayerView(jimuLayerViewRef.current)
    jimuLayerViewRef.current = null
  }

  const setSourceRecordsToOutputDs = async (dataSource: FeatureLayerDataSource, operation: Operations, operateGraphics: Graphic[]) => {
    if (!dataSource) return
    if (operation === Operations.REFRESH || !dataSource?.layer) {
      await createDataSourceLayer(dataSource, operateGraphics, 'point')
    } else {
      // sync to dataSource
      await syncDataToLayer(dataSource, dataSource.layer, operation, operateGraphics)
    }

    if (jimuLayerViewRef.current) {
      await syncDataToLayer(dataSource, jimuLayerViewRef.current.layer, operation, operateGraphics.map(g => g.clone()), false)
    } else {
      if (operateGraphics.length > 0) {
        await initJimuLayerView()
      }
    }
  }

  React.useEffect(() => {
    if (!isFirstRender.current) {
      const graphics = operationRecords && operationRecords.length > 0
        ? operationRecords.map(t => {
          return getPointGraphic(t)
        })
        : []
      if (operation === Operations.ADD) {
        setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.ADD, graphics)
      } else if (operation === Operations.DELETE) {
        setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.DELETE, graphics)
      } else if (operation === Operations.CLEAR) {
        setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.CLEAR, graphics)
      }
    } else {
      isFirstRender.current = false
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationRecords, operation])

  React.useEffect(() => {
    if (jimuLayerViewRef.current?.layer) {
      jimuLayerViewRef.current.layer.listMode = !showRuntimeLayers ? 'hide' : 'show'
    }
  }, [showRuntimeLayers])

  React.useEffect(() => {
    if (jimuLayerViewRef.current) {
      jimuLayerViewRef.current.layer.visible = layerVisible
    }
  }, [layerVisible])

  React.useEffect(() => {
    if (!highlightLocation && jimuLayerViewRef.current) {
      jimuLayerViewRef.current.layer.renderer = {
        type: 'simple'
      }
    }
    if (tracks.length > 0 && highlightLocation && dataSource) {
      if (!jimuLayerViewRef.current) {
        initJimuLayerView()
      } else {
        jimuLayerViewRef.current.layer.renderer = rendererObject
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightLocation])
  React.useEffect(() => {
    // remove layer from pre jimuMapView
    if (jimuMapViewRef.current && jimuLayerViewRef.current) {
      removeJimuLayerViews(jimuMapViewRef.current)
    }
    if (jimuMapView) {
      // add layer to jimuMapView
      if (tracks.length > 0 && highlightLocation && dataSource) {
        if (!jimuLayerViewRef.current) {
          setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.REFRESH, tracks.map(t => getPointGraphic(t)))
        }
      }
    }
    jimuMapViewRef.current = jimuMapView

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView])

  React.useEffect(() => {
    const newRendererObject = {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        size: 10,
        color: symbolColor,
        outline: null
      }
    }
    setRendererObject(newRendererObject)
    if (jimuLayerViewRef.current) {
      if (highlightLocation) {
        jimuLayerViewRef.current.layer.renderer = newRendererObject
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolColor])

  const useDataSource: ImmutableObject<UseDataSource> = React.useMemo(() => {
    if (dataSourceId) {
      return Immutable({
        dataSourceId: dataSourceId,
        mainDataSourceId: dataSourceId
      })
    }
  }, [dataSourceId])

  const initJimuLayerView = async (): Promise<void> => {
    const renderer = highlightLocation ? rendererObject : { type: 'simple' }
    jimuLayerViewRef.current = await createJimuLayerView(dataSourceId, jimuMapView, renderer, layerVisible, showRuntimeLayers)
    if (jimuLayerViewRef.current && !watchLayerVisibleChangeHandle) {
      const watchLayerVisibleChangeHandle = reactiveUtils.watch(() => jimuLayerViewRef.current.layer.visible, (visible) => {
        props.handleLayerVisibleChange([dataSourceId], visible, 1)
      })
      setWatchLayerVisibleChangeHandle(watchLayerVisibleChangeHandle)
    }
  }

  const handleCreated = (dataSource) => {
    setDataSource(dataSource)
    onCreate.current?.(dataSource)
    if (dataSource && dataSource.layer) {
      setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.REFRESH, tracks.map(t => getPointGraphic(t)))
    }
  }

  const handleSelectionChange = (selection: ImmutableArray<string>) => {
    if (selection) {
      onHandleSelection(Array.from(selection), 'point')
    }
  }

  const syncToList = async () => {
      const notFilterIds = dataSource.getRecords().map(record => record.getData().OBJECTID)
      onHandleFilter(notFilterIds, 'point')
      const features = dataSource.getRecords().map(record => record.getData()).sort((a, b) => b.location_timestamp - a.location_timestamp)
      const queryResult = await (dataSource as FeatureLayerDataSource).queryCount({ where: '1=1', returnGeometry: false }, { scope: QueryScope.InRemoteConfigView })
      onLinePointsRecordsChanges?.(features, queryResult.count)
  }

  const handleDataSourceInfoChange = (info: IMDataSourceInfo, preInfo?: IMDataSourceInfo) => {
    if (info?.sourceVersion > preInfo?.sourceVersion || (info?.status === DataSourceStatus.Loaded && preInfo?.status !== DataSourceStatus.Loaded)) {
      if (info?.status === DataSourceStatus.Loaded) {
        syncToList()
      }
    }
  }

  return (
    <DataSourceComponent
      query={{
        where: '1=1',
        outFields: props.selectedFields,
        returnGeometry: true
      } as QueryParams}
      queryCount
      widgetId={widgetId}
      useDataSource={useDataSource}
      onDataSourceCreated={handleCreated}
      onSelectionChange={handleSelectionChange}
      onDataSourceInfoChange={handleDataSourceInfoChange}
    >
    </DataSourceComponent>
  )
}

export default OutputSourceManager
