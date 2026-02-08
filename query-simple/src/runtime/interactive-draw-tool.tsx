/** @jsx jsx */
import { React, jsx, type ImmutableArray, moduleLoader, hooks } from 'jimu-core'
import { Checkbox } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import type * as jimuMap from 'jimu-ui/advanced/map'
import { CreateToolType } from '../config'
import { EntityStatusType, StatusIndicator } from 'widgets/shared-code/mapsimple-common'
import defaultMessage from './translations/default'
export interface InteractiveDrawProps {
  jimuMapView: JimuMapView
  widgetId: string
  toolTypes: ImmutableArray<CreateToolType>
  onDrawEnd: (graphic: __esri.Graphic, getLayerFun?, clearAfterApply?: boolean) => void
}

const sketchToolInfoMap = {
  [CreateToolType.Point]: { drawToolName: 'point', esriClassName: 'esri-icon-point', toolIndex: 0 },
  [CreateToolType.Polyline]: { drawToolName: 'polyline', esriClassName: 'esri-icon-polyline', toolIndex: 4 },
  [CreateToolType.Polygon]: { drawToolName: 'polygon', esriClassName: 'esri-icon-polygon', toolIndex: 2 },
  [CreateToolType.Rectangle]: {
    drawToolName: 'rectangle',
    esriClassName: 'esri-icon-checkbox-unchecked',
    toolIndex: 1
  },
  [CreateToolType.Circle]: { drawToolName: 'circle', esriClassName: 'esri-icon-radio-unchecked', toolIndex: 3 }
}

export function InteractiveDraw (props: InteractiveDrawProps) {
  const { toolTypes = [], jimuMapView, onDrawEnd, widgetId } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const [mapModule, setMapModule] = React.useState<typeof jimuMap>(null)
  const getLayerFunRef = React.useRef<() => __esri.GraphicsLayer | __esri.MapNotesLayer>(null)
  const graphicRef = React.useRef(null)
  const [clearAfterApply, setClearAfterApply] = React.useState(false)

  const visibleElements = React.useMemo(() => {
    return {
      createTools: Object.entries(sketchToolInfoMap).reduce(
        (result, [key, value]) => ({ ...result, [value.drawToolName]: toolTypes.includes(key as CreateToolType) }),
        { point: false }
      ) as any,
      selectionTools: {
        'lasso-selection': false,
        'rectangle-selection': false
      },
      settingsMenu: false,
      undoRedoMenu: false,
      deleteButton: true
    }
  }, [toolTypes])

  hooks.useEffectOnce(() => {
    moduleLoader.loadModule<typeof jimuMap>('jimu-ui/advanced/map').then((result) => {
      setMapModule(result)
    })
  })

  const handleDrawToolCreated = React.useCallback((jimuDrawToolsRef: jimuMap.JimuDrawCreatedDescriptor) => {
    getLayerFunRef.current = jimuDrawToolsRef.getGraphicsLayer
  }, [])

  const handleDrawStart = React.useCallback(() => {
    getLayerFunRef.current && ((getLayerFunRef.current)() as __esri.GraphicsLayer).removeAll()
  }, [])

  const handleDrawEnd = React.useCallback(
    (graphic) => {
      graphicRef.current = graphic
      onDrawEnd(graphic, getLayerFunRef.current, clearAfterApply)
    },
    [onDrawEnd, clearAfterApply]
  )

  const handleCleared = React.useCallback(() => {
    graphicRef.current = null
    onDrawEnd(null)
  }, [onDrawEnd])

  const handleClearSettingChange = React.useCallback((e) => {
    if (graphicRef.current) {
      onDrawEnd(graphicRef.current, getLayerFunRef.current, e.target.checked)
    }
    setClearAfterApply(e.target.checked)
  }, [onDrawEnd])

  const JimuDraw = mapModule?.JimuDraw
  if (!JimuDraw) {
    return <StatusIndicator statusType={EntityStatusType.Loading} />
  }
  const isAvailable = Object.keys(visibleElements.createTools).some(toolName => visibleElements.createTools[toolName])
  if (!isAvailable) {
    return null
  }
  return (
    <div>
      <JimuDraw
        jimuMapView={jimuMapView}
        operatorWidgetId={widgetId}
        disableSymbolSelector
        drawingOptions={{
          creationMode: mapModule.JimuDrawCreationMode.Single,
          updateOnGraphicClick: false,
          visibleElements: visibleElements
        }}
        uiOptions={{
          isHideBorder: true
        }}
        onJimuDrawCreated={handleDrawToolCreated}
        onDrawingStarted={handleDrawStart}
        onDrawingFinished={handleDrawEnd}
        onDrawingCleared={handleCleared}
      />
      <label className='d-flex align-items-center'>
        <Checkbox checked={clearAfterApply} onChange={handleClearSettingChange} className='mr-2' />
        {getI18nMessage('clearDrawing')}
      </label>
    </div>
  )
}
