/** @jsx jsx */
import { React, jsx, type AllWidgetProps, useIntl, classNames } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView, SnappingUtils } from 'jimu-arcgis'
import { WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig, DrawingTool, Arrangement } from '../config'
import { JimuDraw, type JimuDrawCreationMode, type JimuDrawVisibleElements, SnappingMode } from 'jimu-ui/advanced/map'
import { getStyles } from './style'
import { versionManager } from '../version-manager'

import defaultMessages from './translations/default'
import DrawIcon from '../../icon.svg'

function Widget (props: AllWidgetProps<IMConfig>): React.ReactElement {
  const [currentJimuMapView, setCurrentJimuMapView] = React.useState<JimuMapView>(null)
  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    setCurrentJimuMapView(jimuMapView)
  }

  // visibleElements
  const visibleElements = {} as JimuDrawVisibleElements
  visibleElements.createTools = {
    point: props.config.drawingTools.includes(DrawingTool.Point),
    polyline: props.config.drawingTools.includes(DrawingTool.Polyline),
    polygon: props.config.drawingTools.includes(DrawingTool.Polygon),
    rectangle: props.config.drawingTools.includes(DrawingTool.Rectangle),
    circle: props.config.drawingTools.includes(DrawingTool.Circle),
    customText: props.config.drawingTools.includes(DrawingTool.Text),
    freehandPolyline: props.config.drawingTools.includes(DrawingTool.FreehandPolyline),
    freehandPolygon: props.config.drawingTools.includes(DrawingTool.FreehandPolygon)
  }

  // determine whether to display settingMenu according to config
  const setVisibleElementsSettingsMenu = (visibleElements: JimuDrawVisibleElements): void => {
    let isShowFlag = false // hide API setting icon for 10.1

    // hide settingMenu when only turn on "Segment label" in 2D map ,#26269
    let _segmentLabelFlag = props.config.drawOptions?.segmentLabelEnabled
    if (currentJimuMapView?.view?.type === '2d') {
      _segmentLabelFlag = false
    }

    if (!props.config.drawOptions || (props.config.drawOptions?.snappingMode === SnappingMode.Prescriptive)) {
      // only depends on whether Tooltips is turned on
      isShowFlag = (props.config.drawOptions?.tooltipEnabled || _segmentLabelFlag)
    } else if (props.config.drawOptions?.snappingMode === SnappingMode.Flexible) {
      // displayed when at least one item is Enabled
      isShowFlag = (props.config.drawOptions?.tooltipEnabled || _segmentLabelFlag
        || props.config.drawOptions?.geometryGuidesEnabled || props.config.drawOptions?.featureToFeatureEnabled || props.config.drawOptions?.gridEnabled)
    }

    visibleElements.settingsMenu = isShowFlag
  }

  const setSnappingControlsElements = (visibleElements: JimuDrawVisibleElements): void => {
    const _isPrescriptiveMode = (props.config.drawOptions?.snappingMode === SnappingMode.Prescriptive)

    const geometryGuides = _isPrescriptiveMode? false : props.config.drawOptions?.geometryGuidesEnabled
    const featureEnabled = _isPrescriptiveMode ? false : props.config.drawOptions?.featureToFeatureEnabled
    const gridControlFlag = _isPrescriptiveMode ? false : props.config.drawOptions?.gridEnabled

    const enabledToggle = _isPrescriptiveMode ? false : (props.config.drawOptions?.geometryGuidesEnabled ||
    props.config.drawOptions?.featureToFeatureEnabled || props.config.drawOptions?.gridEnabled)
    const layerList = enabledToggle

    visibleElements.snappingControlsElements = {
      enabledToggle: enabledToggle,
      selfEnabledToggle: geometryGuides,
      featureEnabledToggle: featureEnabled,
      gridEnabledToggle: gridControlFlag,
      gridControls: gridControlFlag,
      layerList: layerList
    }
  }

  ////////////////////////////////////////////////////////////////////////
  // draw options
  const isSnappingEnableFlag = !!(props.config.drawOptions?.defaultGeometryGuidesEnabled) ||
    !!(props.config.drawOptions?.defaultFeatureToFeatureEnabled) ||
    !!(props.config.drawOptions?.defaultGridEnabled)
  // visible
  setVisibleElementsSettingsMenu(visibleElements)
  // tooltips
  visibleElements.tooltipsToggle = props.config.drawOptions?.tooltipEnabled
  // segment label
  visibleElements.labelsToggle = props.config.drawOptions?.segmentLabelEnabled
  // snapping
  setSnappingControlsElements(visibleElements)

  // FeatureSourcesCollection for snapping
  const [snappingFeatureSourcesCollectionState, setSnappingFeatureSourcesCollectionState] = React.useState<__esri.Collection>(null)
  React.useEffect(() => {
    const _updateSnappingFeatureSourcesState = async () => {
      const snappingFeatureSourcesCollection = await SnappingUtils.getSnappingFeatureSourcesCollection(currentJimuMapView, props.config.drawOptions?.defaultSnappingLayers)
      setSnappingFeatureSourcesCollectionState(snappingFeatureSourcesCollection)
    }

    _updateSnappingFeatureSourcesState()
  }, [currentJimuMapView, props.config.drawOptions?.defaultSnappingLayers])

  // grid for snapping
  const [snappingGridEnabledState, setSnappingGridEnabledState] = React.useState<boolean>(false)
  React.useEffect(() => {
    const gridEnabled = (props.config.drawOptions?.snappingMode === SnappingMode.Prescriptive) ? false : (props.config.drawOptions?.gridEnabled && props.config.drawOptions?.defaultGridEnabled)
    setSnappingGridEnabledState(gridEnabled)
  }, [props.config.drawOptions])
  ////////////////////////////////////////////////////////////////////////

  // ShowMode in the widgetController, #ExperienceBuilder-Web-Extensions/issues/27877
  const [isAutoWidthState, setIsAutoWidthState] = React.useState<boolean>(false)
  React.useEffect(() => {
    let isAutoWidth = props.autoWidth
    // in widgetController
    if (props.controllerWidgetId) {
      //1. Toolbar mode -> show all Draw tools
      //2. Panel mode -> show a part of Draw tools
      isAutoWidth = (props.config.arrangement === Arrangement.Toolbar)
    }

    setIsAutoWidthState(isAutoWidth)
  }, [props.controllerWidgetId, props.autoWidth, props.config.arrangement])

  const isShowPlaceHolderFlag = (!currentJimuMapView)
  const placeHolderTips = useIntl().formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })
  // Renderer
  return <div className='draw-widget-container h-100' css={getStyles()}>
    { /* 1.placeholder */ }
    {isShowPlaceHolderFlag &&
      <div className='w-100 h-100'>
        <WidgetPlaceholder
          className={classNames('w-100 placeholder-wrapper', { 'in-controller': (!!props.controllerWidgetId) })}
          icon={DrawIcon} widgetId={props.id} name={placeHolderTips}
        />
      </div>
    }
    { /* 2.jimu-draw */ }
    {!isShowPlaceHolderFlag &&
      <JimuDraw
        jimuMapView={currentJimuMapView}
        operatorWidgetId={props.id}
        isDisplayCanvasLayer={props.config.isDisplayCanvasLayer}
        // api options
        drawingOptions={{
          creationMode: props.config.drawMode as unknown as JimuDrawCreationMode,
          visibleElements: visibleElements,
          // layer list mode
          layerListMode: props.config.layerListMode,
          // defaults
          updateOnGraphicClick: true,
          // drawingEffect3D
          drawingElevationMode3D: props.config.drawingElevationMode3D,
          // Setting menu
          // snappingOptions
          snappingOptions: {
            enabled: isSnappingEnableFlag,
            selfEnabled:  (props.config.drawOptions?.geometryGuidesEnabled && props.config.drawOptions?.defaultGeometryGuidesEnabled),
            featureEnabled: (props.config.drawOptions?.featureToFeatureEnabled && props.config.drawOptions?.defaultFeatureToFeatureEnabled),
            gridEnabled: snappingGridEnabledState,
            featureSources: snappingFeatureSourcesCollectionState
          } as __esri.SnappingOptions,
          tooltipOptions: {
            enabled: (props.config.drawOptions?.tooltipEnabled && props.config.drawOptions?.defaultTooltipEnabled)
          },
          // segment label
          labelOptions: {
            enabled: (props.config.drawOptions?.segmentLabelEnabled && props.config.drawOptions?.defaultSegmentLabelEnabled)
          }
        }}
        // ui
        uiOptions={{
          arrangement: props.config.arrangement,
          isAutoWidth: isAutoWidthState,
          isAutoHeight: props.autoHeight,
          isShape: false // border for new theme
        }}
        // measurements
        measurementsInfo={props.config.measurementsInfo.asMutable() as any}
        measurementsUnitsInfos={props.config.measurementsUnitsInfos.asMutable()}
        // other options
      ></JimuDraw>
    }
    { /* 3.map view comp */ }
    <JimuMapViewComponent
      useMapWidgetId={props.useMapWidgetIds?.[0]}
      onActiveViewChange={handleActiveViewChange}
    />
  </div>
}

Widget.versionManager = versionManager
export default Widget
