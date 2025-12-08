import { React } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { FlyItemMode } from '../../../config'
import * as utils from '../../utils/utils'

export interface HighlightCache {
  hover: {
    graphic: __esri.Graphic
    handler: __esri.Handle
  }
  selected: {
    graphics: __esri.Graphic[]
    handler: __esri.Handle
  }
}

interface Props {
  jimuMapView: JimuMapView
  flyStyle: FlyItemMode

  hoverPickingGraphics: __esri.Graphic[]
  selectedPickingGraphics: __esri.Graphic[]
}

export default class HighlightHelper extends React.PureComponent<Props> {
  highlightCache: HighlightCache

  constructor (props) {
    super(props)
    this._resetHighlightCache()
  }

  _resetHighlightCache = (): void => {
    this.highlightCache = {
      hover: {
        graphic: null,
        handler: null
      },
      selected: {
        graphics: null,
        handler: null
      }
    }
  }

  // hover select
  removeHoverHighlightCache = (): void => {
    if (utils.isDefined(this.highlightCache.hover.handler)) {
      this.highlightCache.hover.handler.remove()
    }
    this.highlightCache.hover.graphic = null
    this.highlightCache.hover.handler = null
  }

  cacheHoverHighlight = (handler: __esri.Handle, graphic: __esri.Graphic): void => {
    this.highlightCache.hover.graphic = graphic
    this.highlightCache.hover.handler = handler
  }

  // click select
  removeSelectedHighlightCache = (): void => {
    if (utils.isDefined(this.highlightCache.selected.handler)) {
      this.highlightCache.selected.handler.remove()
    }
    this.highlightCache.selected.graphics = null
    this.highlightCache.selected.handler = null
  }

  cacheSelectedHighlight = (handler: __esri.Handle, graphics: __esri.Graphic[]): void => {
    this.highlightCache.selected.graphics = graphics
    this.highlightCache.selected.handler = handler
  }

  componentDidUpdate (prevProps: Props): void {
    if (this.props.hoverPickingGraphics !== prevProps.hoverPickingGraphics) {
      this.removeHoverHighlightCache()
      this.highlightGraphicsByHover(this.props.hoverPickingGraphics)
    }

    if (this.props.selectedPickingGraphics !== prevProps.selectedPickingGraphics) {
      this.removeSelectedHighlightCache()
      this.highlightGraphicsBySelect(this.props.selectedPickingGraphics)
    }
  }

  componentWillUnmount (): void {
    this.clear()
    this._resetHighlightCache()
  }

  render (): React.ReactElement {
    return null
  }

  highlightGraphicsByHover = (graphics: __esri.Graphic[]): void => {
    const graphic = utils.isDefined(graphics) ? graphics[0] : null
    if (graphic === null) {
      return
    }

    const type = graphic?.geometry?.type
    if ((type === 'polyline' && (this.props.flyStyle === FlyItemMode.Path)) ||
      (type === 'point' && (this.props.flyStyle === FlyItemMode.Rotate))) {
      this.props.jimuMapView?.view.whenLayerView(graphic.layer as __esri.Layer).then((layerView) => {
        const _layerView = layerView as __esri.FeatureLayerView
        this.cacheHoverHighlight(_layerView.highlight(graphic), graphic)
      })
    }
  }

  highlightGraphicsBySelect = (graphics: __esri.Graphic[]): void => {
    const graphic = utils.isDefined(graphics) ? graphics[0] : null
    if (graphic === null) {
      return
    }

    this.props.jimuMapView?.view.whenLayerView(graphic.layer as __esri.Layer).then((layerView) => {
      const _layerView = layerView as __esri.FeatureLayerView
      const handler = _layerView.highlight(graphic)
      this.cacheSelectedHighlight(handler, graphics)
    })
  }

  clear = (): void => {
    this.removeHoverHighlightCache()
    this.removeSelectedHighlightCache()
  }
}
