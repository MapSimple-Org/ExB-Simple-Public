/** @jsx jsx */
import { React, jsx, Immutable, polished, css, hooks, lodash, ReactRedux, loadArcGISJSAPIModule, WidgetState, type IMState } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { Checkbox, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import defaultMessage from '../../translations/default'
import { PrintExtentType, type IMPrintTemplateProperties, type MapFrameUnit as Unit, type IMConfig, type PreviewOutLine } from '../../../config'
import { convertColorToRgbaArray } from './utils'
import { checkIsMapOnly } from '../../../utils/utils'
const { useState, useEffect, useRef, useCallback } = React

interface Props {
  id: string
  scale: number
  printExtentType: PrintExtentType
  jimuMapView: JimuMapView
  selectedTemplate: IMPrintTemplateProperties
  className?: string
  config: IMConfig
  updatePreviewOverlayItem: (overlayItem: any) => void
}

const defaultDPI = 96

const PrintPreview = (props: Props) => {
  const { id, scale, printExtentType, jimuMapView, selectedTemplate, className, config, updatePreviewOverlayItem } = props
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage)
  const widgetsRuntimeInfo = ReactRedux.useSelector((state: IMState) => state.widgetsRuntimeInfo?.[id])

  const [showPrintArea, setShowPrintArea] = useState(false)
  const [curExtent, setCurExtent] = useState(jimuMapView?.view?.extent)
  const [curScale, setCurScale] = useState(jimuMapView?.view?.scale)
  const [isAllEsriModulesLoaded, setIsAllEsriModulesLoaded] = useState(false)

  const overlayItemRef = useRef(null)
  const widgetsRuntimeInfoRef = useRef(null)
  const selectedTemplateRef = useRef(null as IMPrintTemplateProperties)
  const debounceUpdateOverlayItemRef = useRef(null)
  const curExtentRef = useRef(jimuMapView?.view?.extent)
  const curScaleRef = useRef(jimuMapView?.view?.scale)
  const showPrintAreaRef = useRef(false)

  const watchExtentChangeHandleRef = useRef(null)
  const watchScaleChangeHandleRef = useRef(null)
  const jsonMapRef = useRef(null)
  const unitUtilsRef = useRef(null)
  const boxOverlayItemRef = useRef(null)
  const reactiveUtilsRef = useRef(null)

  const updateStyleOfPreviewAreaFnRef = useRef(null)
  const removePrintPreviewAreaFnRef = useRef(null)
  const showPrintPreviewAreaFnRef = useRef(null)
  const isPrintPreviewAreaInMap = useRef(false)

  const isAllEsriModulesLoadedRef = useRef(false)

  const getReactiveUtils = async () => {
    if (!reactiveUtilsRef.current) {
      reactiveUtilsRef.current = await loadArcGISJSAPIModule('esri/core/reactiveUtils')
    }

    return reactiveUtilsRef.current
  }

  const loadEsriModules = useCallback(async () => {
    if (!unitUtilsRef.current) {
      unitUtilsRef.current = await loadArcGISJSAPIModule('esri/core/unitUtils')
    }

    if (!jsonMapRef.current) {
      jsonMapRef.current = await loadArcGISJSAPIModule('esri/core/jsonMap')
    }

    if (!boxOverlayItemRef.current) {
      boxOverlayItemRef.current = await loadArcGISJSAPIModule('esri/views/overlay/BoxOverlayItem')
    }
    isAllEsriModulesLoadedRef.current = true
    setIsAllEsriModulesLoaded(true)
  }, [])

  const valueUnitKebabDict = () => {
    const { JSONMap } = jsonMapRef.current
    const valueUnitKebabDict = new JSONMap({
      "inch": "inches",
      "foot": "feet",
      "yard": "yards",
      "mile": "miles",
      "nautical-mile": "nautical-miles",
      "millimeter": "millimeters",
      "centimeter": "centimeters",
      "decimeter": "decimeters",
      "meter": "meters",
      "kilometer": "kilometers",
    })
    return valueUnitKebabDict
  }

  const getAndUpdateOverlayItem = useCallback((updateOverlayItem = false) => {
    const BoxOverlayItems = boxOverlayItemRef.current
    if (!BoxOverlayItems) {
      return
    }

    if (!overlayItemRef.current || updateOverlayItem) {
      const strokeWidth = getStrokeWidth(config?.previewOutLine)
      overlayItemRef.current = new BoxOverlayItems({
        strokeDash: [5],
        strokeWidth: strokeWidth,
        backgroundFillColor: [0, 0, 0, 0],
        strokeColor: config?.previewOutLine ? convertColorToRgbaArray(config.previewOutLine.color, 1) : [30, 144, 255, 255],
        fillColor: config.previewBackgroundColor ? convertColorToRgbaArray(config.previewBackgroundColor, 0.5) : [0, 0, 0, 0.5],
      })
    }

    return overlayItemRef.current
  }, [config.previewOutLine, config.previewBackgroundColor])

  const getStrokeWidth = (outline: PreviewOutLine) => {
    if (!outline || !outline.size) {
      return 2 // default size
    }
    const size = outline.size.toString().toLowerCase()
    if (size.endsWith('px')) {
      return parseFloat(size.replace('px', ''))
    } else if (size.endsWith('pt')) {
      return parseFloat(size.replace('pt', '')) * 0.75 // convert points to pixels
    }
    return parseFloat(size) // assume it's in pixels if no unit is specified
  }

  const getScale = useCallback(() => {
    const scaleForPrint = printExtentType === PrintExtentType.SetMapScale ? scale : curScale
    return scaleForPrint
  }, [curScale, scale, printExtentType])

  /**
   * When map_only using the current map extent,
   * we need to adjust the extent of the extent according to the aspect ratio to ensure that the preview frame is consistent with the print result.
  */
  const getOverLayItemSizeForMapOnlyWithCurrentExtent = (jimuMapView: JimuMapView, exportOptions) => {
    const mapAspectRatio = jimuMapView?.view?.width / jimuMapView?.view?.height
    const mapInPrintResultAspectRatio = exportOptions?.width / exportOptions?.height

    const extent = curExtentRef.current?.toJSON()
    const height = extent?.height || jimuMapView?.view?.height
    const width = extent?.width || jimuMapView?.view?.width

    let overLayItemHeight = height
    let overLayItemWidth = width
    if (mapAspectRatio < mapInPrintResultAspectRatio) {
      overLayItemHeight = width / mapInPrintResultAspectRatio
    } else if (mapAspectRatio > mapInPrintResultAspectRatio) {
      overLayItemWidth = height * mapInPrintResultAspectRatio
    }

    return {
      width: overLayItemWidth * 0.9, // 10% padding
      height: overLayItemHeight * 0.9 // 10% padding
    }
  }

  const getOverlayItemSizeForMapOnly = useCallback((jimuMapView: JimuMapView, templateOptions: IMPrintTemplateProperties, scaleEnabled: boolean) => {
    const { exportOptions } = templateOptions
    let width = jimuMapView?.view?.width
    let height = jimuMapView?.view?.height
    if (exportOptions.width != null && exportOptions.height != null) {
      if (scaleEnabled) {
        width = exportOptions.width
        height = exportOptions.height
      } else {
        const overLayItemSize = getOverLayItemSizeForMapOnlyWithCurrentExtent(jimuMapView, exportOptions)
        width = overLayItemSize.width
        height = overLayItemSize.height
      }
    }
    return { width, height }
  }, [])

  const getOverlayItemSizeForLayout = useCallback((jimuMapView: JimuMapView, templateOptions: IMPrintTemplateProperties, scaleEnabled: boolean) => {
    let width = 0
    let height = 0
    const { convertUnit, getMetersPerUnitForSR, inchesPerMeter, unitType } = unitUtilsRef.current
    const scale = getScale()
    const view = jimuMapView.view
    const spatialReference = view.spatialReference
    const [viewWidth, viewHeight] = (view as any).state.paddedViewState.size
    const dpi = templateOptions.exportOptions?.dpi

    const { mapFrameSize: size, mapFrameUnit: unit } = templateOptions ?? {}
    let hasIncompatibleUnits = false

    if (size && unit) {
      const srcUnit = valueUnitKebabDict().fromJSON(unit.toLowerCase())
      const dstUnit = spatialReference.unit as Unit

      if (unitType(srcUnit) === unitType(dstUnit)) {
        width = convertUnit(size[0], srcUnit, dstUnit)
        height = convertUnit(size[1], srcUnit, dstUnit)
      } else {
        hasIncompatibleUnits = true
        width = size[0]
        height = size[1]
      }
    }

    if (scaleEnabled && scale) {
      const scaleFactor = hasIncompatibleUnits
        ? Math.min(viewWidth / width, viewHeight / height)
        : getMetersPerUnitForSR(spatialReference) * inchesPerMeter * dpi

      width *= scaleFactor
      height *= scaleFactor
    } else {
      if (width === 0 || height === 0) {
        width = viewWidth
        height = viewHeight
      } else {
        const paddedViewWidth = viewWidth - viewWidth * 0.1 // 10% of padding
        const paddedViewHeight = viewHeight - viewHeight * 0.1 // 10% of padding

        // Find the ratio between the destination width and source width.
        const ratioX = paddedViewWidth / width

        // Find the ratio between the destination height and source height.
        const ratioY = paddedViewHeight / height

        // Use the smaller ratio between ratioX and ratioY to scale the width and height to fit
        const ratio = Math.min(ratioX, ratioY)
        width *= ratio
        height *= ratio
      }
    }
    return { width, height }
  }, [getScale])

  const updateOverlayItem = useCallback((updateOverlayItem?: boolean): void => {
    if (!jimuMapView?.view || !selectedTemplate) {
      return
    }
    const templateOptions = selectedTemplate
    const { layout } = templateOptions
    const overlayItem = getAndUpdateOverlayItem(updateOverlayItem)
    if (!overlayItem || !isAllEsriModulesLoadedRef.current) {
      return
    }

    const view = jimuMapView.view
    const [viewWidth, viewHeight] = (view as any).state.paddedViewState.size
    const padding = (view as any).state.padding
    const dpi = templateOptions.exportOptions?.dpi

    let width = 0
    let height = 0

    const isMapOnly = checkIsMapOnly(layout)
    const scaleEnabled = templateOptions?.printExtentType !== PrintExtentType.CurrentMapExtent
    const scale = getScale()

    let overlayItemSize
    if (isMapOnly) {
      overlayItemSize = getOverlayItemSizeForMapOnly(jimuMapView, templateOptions, scaleEnabled)
    } else if (layout) {
      overlayItemSize = getOverlayItemSizeForLayout(jimuMapView, templateOptions, scaleEnabled)
    }
    width = overlayItemSize?.width
    height = overlayItemSize?.height

    const scaleFactor = scaleEnabled && scale ? scale / jimuMapView.view.scale : 1
    const dpiFactor = scaleEnabled && scale ? defaultDPI / dpi : 1

    overlayItem.boxWidth = width * scaleFactor * dpiFactor || viewWidth
    overlayItem.boxHeight = height * scaleFactor * dpiFactor || viewHeight

    if (padding) {
      overlayItem.padding = padding
    }

    overlayItem.backgroundWidth = viewWidth ?? 0
    overlayItem.backgroundHeight = viewHeight ?? 0
    overlayItemRef.current = overlayItem

    updatePreviewOverlayItem(overlayItem)
  }, [jimuMapView, selectedTemplate, getAndUpdateOverlayItem, getScale, updatePreviewOverlayItem, getOverlayItemSizeForMapOnly, getOverlayItemSizeForLayout])

  const checkIsShowPreview = useCallback((): boolean => {
    if (!config?.enablePreview) return false
    const isMapOnly = checkIsMapOnly(selectedTemplate?.layout)
    if (isMapOnly) {
      return true
    } else {
      return !!selectedTemplate?.mapFrameSize
    }
  }, [selectedTemplate, config?.enablePreview])

  const showPrintPreviewArea = useCallback(() => {
    if (!jimuMapView?.view) {
      return
    }
    updateOverlayItem();
    (jimuMapView.view as any).overlay.addItem(overlayItemRef.current)
    isPrintPreviewAreaInMap.current = true
  }, [jimuMapView, updateOverlayItem])

  const removePrintPreviewArea = useCallback(() => {
    if (!jimuMapView?.view) {
      return
    }
    (jimuMapView.view as any)?.overlay?.removeItem(overlayItemRef.current)
    isPrintPreviewAreaInMap.current = false
  }, [jimuMapView])

  removePrintPreviewAreaFnRef.current = removePrintPreviewArea
  showPrintPreviewAreaFnRef.current = showPrintPreviewArea

  const checkIsMapSizeChange = useCallback(() => {
    const isMapOnly = checkIsMapOnly(selectedTemplate?.layout)
    if (!isMapOnly) {
      return false
    }
    const isWidthChange = selectedTemplate?.exportOptions?.width !== selectedTemplateRef.current?.exportOptions?.width
    const isHeightChange = selectedTemplate?.exportOptions?.height !== selectedTemplateRef.current?.exportOptions?.height
    return isWidthChange || isHeightChange
  }, [selectedTemplate])

  const handlePrintPreview = useCallback(() => {
    setShowPrintArea(!showPrintArea)
    showPrintAreaRef.current = !showPrintArea
    if (!showPrintArea) {
      showPrintPreviewArea()
    } else {
      removePrintPreviewArea()
    }
  }, [showPrintArea, showPrintPreviewArea, removePrintPreviewArea])

  const updateStyleOfPreviewArea = useCallback(() => {
    if (isAllEsriModulesLoadedRef.current) {
      removePrintPreviewArea()
      updateOverlayItem(true)
      if (showPrintAreaRef.current) {
        showPrintPreviewArea()
      }
    }
  }, [removePrintPreviewArea, showPrintPreviewArea, updateOverlayItem])

  updateStyleOfPreviewAreaFnRef.current = updateStyleOfPreviewArea

  useEffect(() => {
    debounceUpdateOverlayItemRef.current = lodash.debounce(updateOverlayItem, 400)
  }, [updateOverlayItem])

  useEffect(() => {
    if (isAllEsriModulesLoaded && jimuMapView && !overlayItemRef.current) {
      debounceUpdateOverlayItemRef.current()
    }
  }, [isAllEsriModulesLoaded, jimuMapView])

  useEffect(() => {
    const isTemplateChange = selectedTemplate?.templateId !== selectedTemplateRef.current?.templateId
    const isMapPrintExtentChange = selectedTemplate?.printExtentType !== selectedTemplateRef.current?.printExtentType
    const isOutScaleChange = selectedTemplate?.outScale !== selectedTemplateRef.current?.outScale
    const isDpiChange = selectedTemplate?.exportOptions?.dpi !== selectedTemplateRef.current?.exportOptions?.dpi
    const isMapSizeChange = checkIsMapSizeChange()
    selectedTemplateRef.current = selectedTemplate
    if (isTemplateChange || isMapPrintExtentChange || isOutScaleChange || isMapSizeChange || isDpiChange) {
      debounceUpdateOverlayItemRef.current()
    }
  }, [selectedTemplate, showPrintArea, checkIsMapSizeChange])

  useEffect(() => {
    if (curExtent) {
      debounceUpdateOverlayItemRef.current()
    }
  }, [curExtent, curScale, showPrintArea])

  useEffect(() => {
    if (isAllEsriModulesLoadedRef.current) {
      updateStyleOfPreviewAreaFnRef.current()
    }
  }, [config.previewBackgroundColor, config.previewOutLine])

  useEffect(() => {
    widgetsRuntimeInfoRef.current = widgetsRuntimeInfo
    if (showPrintAreaRef.current) {
      if (widgetsRuntimeInfo?.state === WidgetState.Hidden || widgetsRuntimeInfo?.state === WidgetState.Closed) {
        removePrintPreviewAreaFnRef.current()
      } else {
        !isPrintPreviewAreaInMap.current && showPrintPreviewAreaFnRef.current()
      }
    }
  }, [widgetsRuntimeInfo])

  useEffect(() => {
    loadEsriModules()
    return () => {
      removePrintPreviewArea()
    }
  }, [loadEsriModules, removePrintPreviewArea])

  useEffect(() => {
    if (jimuMapView) {
      getReactiveUtils().then(() => {
        watchExtentChangeHandleRef.current = reactiveUtilsRef.current?.watch(() => jimuMapView?.view?.extent, () => {
          let newCurExtent = null
          const extentJson = jimuMapView?.view?.extent?.toJSON()

          if (extentJson) {
            newCurExtent = JSON.parse(JSON.stringify(extentJson))
          }

          setCurExtent(Immutable(newCurExtent))
          curExtentRef.current = jimuMapView?.view?.extent
        }, { initial: true })
        watchScaleChangeHandleRef.current = reactiveUtilsRef.current?.watch(() => jimuMapView?.view?.scale, () => {
          const newScale = jimuMapView?.view?.scale
          setCurScale(newScale)
          curScaleRef.current = newScale
        }, { initial: true })
      })
    }
    return () => {
      watchExtentChangeHandleRef.current?.remove && (watchExtentChangeHandleRef.current?.remove?.())
      watchScaleChangeHandleRef.current?.remove && (watchScaleChangeHandleRef.current?.remove?.())
    }
  }, [jimuMapView])

  const STYLE = css`
    .checkbox-con {
      color: inherit;
      font-size: ${polished.rem(14)};
      line-height: ${polished.rem(22)};
      margin: ${polished.rem(4)} 0 ${polished.rem(8)} 0;
    }
  `
  return (
    <div className={className} css={STYLE}>
      {checkIsShowPreview() && <div
        title={nls('showPrintArea')}
        aria-label={nls('showPrintArea')}
        className='d-flex w-100 align-items-center checkbox-con'
        onClick={handlePrintPreview}
      >
        <Checkbox
          title={nls('showPrintArea')}
          className='lock-item-ratio'
          data-field='mapSize'
          checked={showPrintArea}
        />
        <div className='text-left ml-2 text-truncate'>
          {nls('showPrintArea')}
        </div>
      </div>}
    </div>
  )
}
export default PrintPreview