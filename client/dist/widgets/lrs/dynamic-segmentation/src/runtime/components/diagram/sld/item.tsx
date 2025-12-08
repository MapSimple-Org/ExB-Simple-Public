/** @jsx jsx */
import {
  classNames,
  css,
  type DataSource,
  type FeatureLayerDataSource,
  jsx,
  loadArcGISJSAPIModule,
  React
} from 'jimu-core'
import type { SubtypeLayers, DynSegFieldInfo, MeasureRange, TrackRecord } from '../../../../config'
import { rgba } from 'polished'
import { isDefined } from 'widgets/shared-code/lrs'
import { Label } from 'jimu-ui'
import { getTheme } from 'jimu-theme'
import { CalciteIcon } from 'calcite-components'
import { SLD_ICON_WIDTH, SLD_ITEM_HEIGHT } from '../../../../constants'
import { getXFromM, getDisplayFieldInfo, getDisplayFieldValue, getEventIdField, getGraphic, trimPNG } from '../../../utils/diagram-utils'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../../state'

export interface ItemProps {
  eventDS: DataSource
  record: TrackRecord
  isActive: boolean
  fieldInfos: DynSegFieldInfo[]
  fields: __esri.Field[]
  contentWidth: number
  measureRange: MeasureRange
  trackIndex: number
  featureLayer: __esri.FeatureLayer
  subtypeLayers: SubtypeLayers[]
  onItemClick: (trackRecord: TrackRecord, fieldInfos: DynSegFieldInfo[], id: string, doubleClick: boolean) => void
  onItemHover: (trackRecord: TrackRecord, id: string) => void
  onItemHoverExit: () => void
}

export function Item (props: ItemProps) {
  const { eventDS, record, fieldInfos, fields, isActive, contentWidth, measureRange, trackIndex, subtypeLayers, onItemClick, onItemHover, onItemHoverExit } = props
  const ref = React.useRef(null)
  const theme = getTheme()
  const [symbolUtils, setSymbolUtils] = React.useState<typeof __esri.symbolUtils>(null)
  const [jsonUtils, setJsonUtils] = React.useState<typeof __esri.symbolsSupportJsonUtils>(null)
  const [backgroundColor, setBackgroundColor] = React.useState<__esri.Color>(null)
  const [symbolLoaded, setSymbolLoaded] = React.useState<boolean>(false)
  const [hasImage, setHasImage] = React.useState<boolean>(false)
  const [hoverTrackRecord, setHoverTrackRecord] = React.useState<TrackRecord>(null)
  const pxToPointConversion = 0.75
  const [isEdited, setIsEdited] = React.useState<boolean>(false)
  const { selectedSldId, pendingEdits } = useDynSegRuntimeState()
  const dispatch = useDynSegRuntimeDispatch()

  const handleOnMouseClick = (e) => {
    e.stopPropagation()
    dispatch({ type: 'SET_SELECTED_SLD_ID', value: getId() })
    onItemClick(record, fieldInfos, getId(), false)
  }

  const handleOnDoublClick = (e) => {
    e.stopPropagation()
    dispatch({ type: 'SET_SELECTED_SLD_ID', value: getId() })
    onItemClick(record, fieldInfos, getId(), true)
  }

  const handleOnMouseEnter = (e) => {
    e.stopPropagation()
    const trackRecord = getHoverTrackRecord()
    onItemHover(trackRecord, getId())
  }

  const handleOnMouseLeave = (e) => {
    e.stopPropagation()
    onItemHoverExit()
  }

  const getHoverTrackRecord = (): TrackRecord => {
    if (isDefined(hoverTrackRecord) && !pendingEdits.has(getId())) {
      return hoverTrackRecord
    }
    const attributes = new Map<string, string | number | Date>()
    const displayField = getDisplayFieldInfo(fieldInfos, record)
    const eventIdField = getEventIdField(fieldInfos, record)
    attributes.set(displayField.originalFieldName, getDisplayFieldValue(fields, fieldInfos, record, subtypeLayers))
    attributes.set(eventIdField.originalFieldName, record.attributes.get(eventIdField.originalFieldName))
    // Track record with reduced attributes for hover and background
    const TrackRecord: TrackRecord = {
      attributes: attributes,
      fromMeasure: record.fromMeasure,
      toMeasure: record.toMeasure,
      index: record.index,
      isPoint: record.isPoint,
      hasValue: record.hasValue,
      selected: record.selected,
      displayField: record.displayField,
      geometry: record.geometry,
      objectId: record.objectId,
      fieldInfos: fieldInfos,
      attributeBackgrounds: getHoverBackgrounds()
    }
    setHoverTrackRecord(TrackRecord)
    return TrackRecord
  }

  const getHoverBackgrounds = (): Map<string, string> => {
    const backgrounds = new Map<string, string>()
    const displayField = getDisplayFieldInfo(fieldInfos, record)
    const eventIdField = getEventIdField(fieldInfos, record)
    backgrounds.set(displayField.originalFieldName, rgba(backgroundColor.r, backgroundColor.g, backgroundColor.b, 0.5))
    backgrounds.set(eventIdField.originalFieldName, 'transparent')
    return backgrounds
  }

  React.useEffect(() => {
    const loadSymbol = async () => {
      if (record.isPoint && !symbolLoaded) {
        await setPointSymbol()
        setSymbolLoaded(true)
      } else if (!record.isPoint) {
        await getLineSymbol()
        setSymbolLoaded(true)
      }
    }

    if (isActive) {
      loadSymbol()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, contentWidth])

  React.useEffect(() => {
    const loadSymbol = async () => {
      if (record.isPoint) {
        await setPointSymbol(true)
      } else if (!record.isPoint) {
        await getLineSymbol(true)
      }
    }

    if (pendingEdits.has(getId())) {
      loadSymbol()
      setIsEdited(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEdits])

  const setPointSymbol = async (forceUpdate?: boolean) => {
    if (!record.hasValue) { return }
    const [symbolUtils, jsonUtils, graphic] = await Promise.all([getSymbolUtils(), getJsonUtils(), getGraphic(record, null, true)])
    setSymbolUtils(symbolUtils)
    setJsonUtils(jsonUtils)
    const eventFS = eventDS as FeatureLayerDataSource
    await symbolUtils.getDisplayedSymbol(graphic, { renderer: eventFS.layer.renderer as __esri.renderersRenderer }).then(async (symbol) => {
      setPointBackground(graphic, eventFS, symbolUtils, forceUpdate)

      if (!isDefined(symbol)) { return }
      const symbolJson = symbol.toJSON()
      const symbolLayers = symbolJson?.symbol?.symbolLayers ?? null
      if (isDefined(symbolLayers)) {
        // multi layer symbol - scale and render
        symbolJson.symbolLayers = scaleSymbols(symbolLayers, false)
        symbol = jsonUtils.fromJSON(symbolJson) as __esri.symbolsSymbol

        // remove image from previous render
        const nodeHtml = document.getElementById(getId())
        const imgNodes = nodeHtml.getElementsByTagName('img')
        if (imgNodes.length > 0) {
          nodeHtml.removeChild(imgNodes[0])
        }

        const pointDiv = await symbolUtils.renderPreviewHTML(symbol, {
          node: nodeHtml,
          size: SLD_ICON_WIDTH * pxToPointConversion
        })
        pointDiv.style.width = `${SLD_ICON_WIDTH}px`
        pointDiv.style.height = `${SLD_ICON_WIDTH}px`
        const imageHtml = nodeHtml.getElementsByTagName('img')[0]
        const imageTrimmed = trimPNG(imageHtml, SLD_ICON_WIDTH)
        imageHtml.src = imageTrimmed
        nodeHtml.style.backgroundImage = `url(${imageTrimmed})`
        nodeHtml.style.backgroundRepeat = 'no-repeat'
        nodeHtml.style.backgroundPosition = 'center'
        nodeHtml.removeChild(imageHtml)
      } else if (symbol.type === 'picture-marker') {
        // picture marker - render image
        const nodeHtml = document.getElementById(getId())
        const imageHtml = document.createElement('img')
        imageHtml.src = (symbol as any)?.url
        nodeHtml.style.backgroundImage = `url(${imageHtml.src})`
        nodeHtml.style.backgroundRepeat = 'no-repeat'
        nodeHtml.style.backgroundPosition = 'center'
        nodeHtml.style.backgroundSize = 'contain'
      } else if (isDefined(symbolJson)) {
        // simple marker - change size and render
        symbolJson.size = SLD_ICON_WIDTH
        symbol = jsonUtils.fromJSON(symbolJson) as __esri.symbolsSymbol

        // remove image from previous render
        const nodeHtml = document.getElementById(getId())
        const imgNodes = nodeHtml.getElementsByTagName('img')
        if (imgNodes.length > 0) {
          nodeHtml.removeChild(imgNodes[0])
        }

        const pointDiv = await symbolUtils.renderPreviewHTML(symbol, {
          node: nodeHtml,
          size: SLD_ICON_WIDTH * pxToPointConversion
        })
        pointDiv.style.width = `${SLD_ICON_WIDTH}px`
        pointDiv.style.height = `${SLD_ICON_WIDTH}px`
        const imageHtml = nodeHtml.getElementsByTagName('img')[0]
        const imageTrimmed = trimPNG(imageHtml, SLD_ICON_WIDTH)
        imageHtml.src = imageTrimmed
        nodeHtml.style.backgroundImage = `url(${imageTrimmed})`
        nodeHtml.style.backgroundRepeat = 'no-repeat'
        nodeHtml.style.backgroundPosition = 'center'
        nodeHtml.removeChild(imageHtml)
      }
    })
  }

  const getLineSymbol = async (forceUpdate?: boolean) => {
    if (!record.hasValue) { return }
    const nodeHtml = document.getElementById(getId())
    if (isDefined(nodeHtml)) {
      const eventFS = eventDS as FeatureLayerDataSource
      const [symbolUtils, jsonUtils, graphic] = await Promise.all([getSymbolUtils(), getJsonUtils(), getGraphic(record, eventFS, true)])
      setSymbolUtils(symbolUtils)
      setJsonUtils(jsonUtils)
      await symbolUtils.getDisplayedSymbol(graphic, { renderer: eventFS.layer.renderer as __esri.renderersRenderer}).then(async (symbol) => {
        setLineBackgroundColor(nodeHtml, graphic, eventFS, symbolUtils, forceUpdate)

        if (!isDefined(symbol)) { return }
        const symbolJson = symbol.toJSON()
        const symbolLayers = symbolJson?.symbol?.symbolLayers ?? null
        if (!isDefined(symbolLayers)) { return }

        if (symbolLayers.length > 1) {
          symbolJson.symbolLayers = scaleSymbols(symbolLayers, false)
          symbol = jsonUtils.fromJSON(symbolJson) as __esri.symbolsSymbol

          // remove image from previous render
          const imgNodes = nodeHtml.getElementsByTagName('img')
          if (imgNodes.length > 0) {
            nodeHtml.removeChild(imgNodes[0])
          }

          await symbolUtils.renderPreviewHTML(symbol, {
            node: nodeHtml,
            size: { width: nodeHtml.getBoundingClientRect().width * pxToPointConversion, height: SLD_ITEM_HEIGHT * pxToPointConversion },
            symbolConfig: { isSquareFill: true }

          })
          const imageHtml = nodeHtml.getElementsByTagName('img')[0]
          if (imageHtml.src === '' || imageHtml.width === 0) {
            nodeHtml.removeChild(imageHtml)
            return
          }
          const imageTrimmed = trimPNG(imageHtml)
          imageHtml.src = imageTrimmed
          nodeHtml.style.backgroundImage = `url(${imageTrimmed})`
          nodeHtml.style.backgroundPosition = 'center'
          nodeHtml.removeChild(imageHtml)
          setHasImage(true)
        }
      })
    }
  }

  const setPointBackground = async (graphic: __esri.Graphic, featureDS: FeatureLayerDataSource, symbolUtils: __esri.symbolUtils, forceUpdate: boolean) => {
    if (!isDefined(backgroundColor) || forceUpdate) {
      const displayColor = await symbolUtils.getDisplayedColor(graphic, { renderer: featureDS.layer.renderer as __esri.renderersRenderer})
      if (!isDefined(displayColor)) {
        const color = { r: 255, g: 255, b: 255, a: 0 }
        setBackgroundColor(color as __esri.Color)
      } else {
        setBackgroundColor(displayColor)
      }
    }
  }
  const setLineBackgroundColor = async (div: HTMLElement, graphic: __esri.Graphic, featureDS: FeatureLayerDataSource, symbolUtils: __esri.symbolUtils, forceUpdate: boolean) => {
    if (!isDefined(backgroundColor) || forceUpdate) {
      const displayColor = await symbolUtils.getDisplayedColor(graphic, { renderer: featureDS.layer.renderer as __esri.renderersRenderer})
      if (!isDefined(displayColor)) {
        const color = { r: 255, g: 255, b: 255, a: 0 }
        div.style.background = rgba(color.a, color.g, color.b, color.a)
        setBackgroundColor(color as __esri.Color)
      } else {
        div.style.background = rgba(displayColor.r, displayColor.g, displayColor.b, displayColor.a)
        setBackgroundColor(displayColor)
      }
    } else {
      div.style.background = rgba(backgroundColor.r, backgroundColor.g, backgroundColor.b, backgroundColor.a)
    }
  }

  const scaleSymbols = (symbolLayers: any, isPoint: boolean): any => {
    if (isPoint) {
      symbolLayers.forEach(symbol => {
        symbol.width = SLD_ICON_WIDTH
      })
    } else {
      let maxWidth = 0
      symbolLayers.forEach(symbol => {
        if (symbol.width > maxWidth) {
          maxWidth = symbol.width
        }
      })
      symbolLayers.forEach(symbol => {
        symbol.width = SLD_ITEM_HEIGHT - (maxWidth - symbol.width)
        symbol.capStyle = 'Butt'
        symbol.joinStyle = 'Round'
      })
    }
    return symbolLayers
  }

  const getLineTextColor = (): string => {
    if (isDefined(backgroundColor)) {
      if (isColorLight(backgroundColor.r, backgroundColor.g, backgroundColor.b)) {
        return '#000'
      } else {
        return '#fff'
      }
    }
    return '#000'
  }

  const getBackgroundColor = (): string => {
    if (hasImage && isDefined(backgroundColor)) {
      return rgba(backgroundColor.r, backgroundColor.g, backgroundColor.b, backgroundColor.a)
    }
    return 'transparent'
  }

  const getShowLabel = (): boolean => {
    const displayValue = getDisplayFieldValue(fields, fieldInfos, record, subtypeLayers)
    return displayValue !== ''
  }

  const isColorLight = (r: number, g: number, b: number): boolean => {
    const a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return a < 0.5
  }

  const getSymbolUtils = async (): Promise<typeof __esri.symbolUtils> => {
    if (symbolUtils) {
      return symbolUtils
    } else {
      const symbolUtil = await loadArcGISJSAPIModule('esri/symbols/support/symbolUtils')
      setSymbolUtils(symbolUtil)
      return symbolUtil
    }
  }

  const getJsonUtils = async (): Promise<typeof __esri.symbolsSupportJsonUtils> => {
    if (jsonUtils) {
      return jsonUtils
    } else {
      const jsonUtils = await loadArcGISJSAPIModule('esri/symbols/support/jsonUtils')
      setJsonUtils(jsonUtils)
      return jsonUtils
    }
  }

  const getWidth = (): number => {
    const from = getLeft()
    const to = getRight()
    if (to - from > 0) {
      return to - from
    }
    return 1
  }

  const getLeft = (): number => {
    const fromM = record.fromMeasure
    if (!isNaN(fromM)) {
      const x = getXFromM(fromM, measureRange, contentWidth)
      if (record.isPoint) {
        // Center the point icon
        return x - (SLD_ICON_WIDTH / 2)
      }
      return x
    }

    return 0
  }

  const getRight = (): number => {
    const toM = record.toMeasure
    if (!isNaN(toM)) {
      return getXFromM(toM, measureRange, contentWidth)
    }

    return getLeft()
  }

  const getId = (): string => {
    return trackIndex + '-' + record.index
  }

  return (
  <div>
    {isActive && record.hasValue && record.isPoint && (
      <div
        id={getId()}
        className={classNames(
          'sld-item-point-active',
          selectedSldId === getId() ? 'sld-item-selected-point' : '',
          isEdited ? 'sld-item-edited-point' : '')}
        ref={ref}
        style={{ left: getLeft(), background: 'transparent' }}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={handleOnMouseClick}
        onDoubleClick={handleOnDoublClick}>
      </div>
    )}
    {isActive && record.hasValue && !record.isPoint && (
      <div
        id={getId()}
        ref={ref}
        className={classNames(
          'sld-item-line-active',
          selectedSldId === getId() ? 'sld-item-selected-line' : '',
          isEdited ? 'sld-item-edited-line' : '')}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={handleOnMouseClick}
        onDoubleClick={handleOnDoublClick}
        style={{ width: getWidth(), left: getLeft() }}>
          <div className="sld-item-label-wrapper">
            <Label
              className="sld-item-label title3"
              centric={true}
              style={{
                color: getLineTextColor(),
                background: getBackgroundColor(),
                visibility: getShowLabel() ? 'visible' : 'hidden'
              }}>
              {getDisplayFieldValue(fields, fieldInfos, record, subtypeLayers)}
            </Label>
          </div>
      </div>
    )}
    {!isActive && record.hasValue && record.isPoint && (
      <div
        id={getId()}
        className="sld-item-point-inactive"
        style={{ width: '24px', left: getLeft(), background: 'transparent' }}>
          <CalciteIcon
            icon='bullet-point-large'
            scale='m'
            css={css`--calcite-ui-icon-color: ${theme.sys.color.action.disabled.text};`}
          />
      </div>
    )}
    {!isActive && record.hasValue && !record.isPoint && (
      <div
        id={getId()}
        className="sld-item-line-inactive"
        style={{ width: getWidth(), left: getLeft() }}>
      </div>
    )}
  </div>
  )
}
