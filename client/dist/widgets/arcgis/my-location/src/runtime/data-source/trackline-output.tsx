import type Graphic from 'esri/Graphic'
import type { JimuMapView } from 'jimu-arcgis'
import { type DataSource, DataSourceComponent, type DataSourceJson, DataSourceStatus, type FeatureLayerDataSource, hooks, type IMDataSourceInfo, Immutable, type ImmutableArray, type ImmutableObject, type QueryParams, QueryScope, React, type UseDataSource } from 'jimu-core'
import { useRef } from 'react'
import type { TrackLine, TrackLinePoint, TracksWithLine } from '../../config'
import { createDataSourceLayer, createJimuLayerView, getLineGraphic, Operations, syncDataToLayer } from './utils'
import * as reactiveUtils from 'esri/core/reactiveUtils'

interface OutputSourceManagerProps {
  widgetId: string
  widgetLabel: string
  dataSourceId: string
  jimuMapView: JimuMapView
  highlightLocation: boolean
  symbolColor: string
  trackLines: TrackLine[]
  trackLinePoints: TrackLinePoint[][]
  tracksWithLine: TracksWithLine
  tempTracksWithLine: TracksWithLine
  operation: Operations
  layerVisible: boolean
  showRuntimeLayers: boolean
  onCreate?: (dataSourceJson: DataSourceJson) => void
  onFieldsChange?: (fields: string[]) => void
  onLinesChanges?: (lines: TrackLine[], count: number) => void
  onHandleSelection: (ids: string[], type: string) => void
  onHandleFilter?: (ids: number[], type: string) => void
  handleLayerVisibleChange: (ids: string[], visible: boolean, type: number) => void
}

const TrackLineOutputSourceManager = (props: OutputSourceManagerProps) => {
  const {
    widgetId,
    dataSourceId,
    jimuMapView,
    highlightLocation,
    trackLines,
    trackLinePoints,
    tracksWithLine,
    symbolColor,
    layerVisible,
    operation,
    showRuntimeLayers,
    onCreate: propOnCreate,
    onLinesChanges,
    onHandleSelection,
    onHandleFilter
  } = props

  const [rendererObject, setRendererObject] = React.useState({
    type: 'simple',
    symbol: {
      type: 'simple-line',
      color: symbolColor || '#007AC2',
      width: 2,
      style: 'solid'
    }
  })
  const jimuMapViewRef = useRef<JimuMapView>(null)
  const jimuLayerViewRef = useRef(null)

  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [watchLayerVisibleChangeHandle, setWatchLayerVisibleChangeHandle] = React.useState<__esri.Handle>(null)

  const onCreate = hooks.useLatest(propOnCreate)
  const isFirstRender = useRef(true)

  React.useEffect(() => {
    const addData = async (tracksWithLine: TracksWithLine) => {
      if (!tracksWithLine) return
      const gs = []
      const graphic = getLineGraphic(tracksWithLine.line, tracksWithLine.tracks)
      gs.push(graphic)
      await setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.ADD, gs)
    }
    const deleteData = async (tracksWithLine: TracksWithLine) => {
      if (!tracksWithLine) return
      // delete line
      const gs = []
      const graphic = getLineGraphic(tracksWithLine.line, tracksWithLine.tracks)
      gs.push(graphic)
      await setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.DELETE, gs)
    }
    // add point or delete point
    const updateData = async (tracksWithLine: TracksWithLine) => {
      if (!tracksWithLine) return
      const gs = []
      if (tracksWithLine.line) {
        const graphic = getLineGraphic(tracksWithLine.line, tracksWithLine.tracks)
        gs.push(graphic)
      }
      await setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.UPDATE, gs)
    }
    if (!isFirstRender.current) {
      if (operation === Operations.ADD) {
        addData(tracksWithLine)
      } else if (operation === Operations.DELETE) {
        deleteData(tracksWithLine)
      } else if (operation === Operations.UPDATE) {
        updateData(tracksWithLine)
      } else if (operation === Operations.CLEAR) {
        setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.CLEAR, [])
      }
    } else {
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracksWithLine, operation])

  React.useEffect(() => {
    const newRendererObject = {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: symbolColor,
        width: 2,
        style: 'solid'
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
    if (trackLines && trackLines.length > 0 && highlightLocation && dataSource) {
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
      if (trackLines && trackLines.length > 0 && highlightLocation && dataSource) {
        if (!jimuLayerViewRef.current) {
          setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.REFRESH, trackLines.map((t, index) => getLineGraphic(t, trackLinePoints[index])))
        }
      }
    }
    jimuMapViewRef.current = jimuMapView

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView])

  const useDataSource: ImmutableObject<UseDataSource> = React.useMemo(() => {
    if (dataSourceId) {
      return Immutable({
        dataSourceId: dataSourceId,
        mainDataSourceId: dataSourceId
      })
    }
  }, [dataSourceId])

  const handleCreated = (dataSource) => {
    setDataSource(dataSource)
    onCreate.current?.(dataSource)
    if (dataSource && dataSource.layer) {
      setSourceRecordsToOutputDs(dataSource as FeatureLayerDataSource, Operations.REFRESH, trackLines.map((t, index) => getLineGraphic(t, trackLinePoints[index])))
    }
  }

  const removeJimuLayerViews = (jmMapView: JimuMapView) => {
    if (watchLayerVisibleChangeHandle) {
      watchLayerVisibleChangeHandle.remove()
      setWatchLayerVisibleChangeHandle(null)
    }
    jmMapView.removeJimuLayerView(jimuLayerViewRef.current)
    jimuLayerViewRef.current = null
  }

  const initJimuLayerView = async (): Promise<void> => {
    const renderer = highlightLocation ? rendererObject : { type: 'simple' }
    jimuLayerViewRef.current = await createJimuLayerView(dataSourceId, jimuMapView, renderer, layerVisible, showRuntimeLayers)
    if (jimuLayerViewRef.current && !watchLayerVisibleChangeHandle) {
      const watchLayerVisibleChangeHandle = reactiveUtils.watch(() => jimuLayerViewRef.current.layer.visible, (visible) => {
        props.handleLayerVisibleChange([dataSourceId], visible, 2)
      })
      setWatchLayerVisibleChangeHandle(watchLayerVisibleChangeHandle)
    }
  }

  const setSourceRecordsToOutputDs = async (dataSource: FeatureLayerDataSource, operation: Operations, operateGraphics: Graphic[]): Promise<void> => {
    if (!dataSource) return
    // sync to dataSource
    if (operation === Operations.REFRESH || !dataSource?.layer) {
      await createDataSourceLayer(dataSource, operateGraphics, 'polyline')
    } else {
      await syncDataToLayer(dataSource, dataSource.layer, operation, operateGraphics)
    }
    if (jimuLayerViewRef.current) {
      await syncDataToLayer(dataSource, jimuLayerViewRef.current.layer, operation, operateGraphics, false)
    } else {
      if (operateGraphics.length > 0) {
        await initJimuLayerView()
      }
    }
  }

  const handleSelectionChange = (selection: ImmutableArray<string>) => {
    if (selection) {
      onHandleSelection(Array.from(selection), 'line')
    }
  }

  const syncToList = async () => {
      const notFilterIds = dataSource.getRecords().map(record => record.getData().OBJECTID)
      onHandleFilter(notFilterIds, 'line')
      const features = dataSource.getRecords().map(record => record.getData()).sort((a, b) => b.OBJECTID - a.OBJECTID)
      const queryResult = await (dataSource as FeatureLayerDataSource).queryCount({ where: '1=1', returnGeometry: false }, { scope: QueryScope.InRemoteConfigView })
      onLinesChanges?.(features, queryResult.count)
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
        outFields: ['*'],
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

export default TrackLineOutputSourceManager
