/** @jsx jsx */
import { React, jsx, type AllWidgetProps, ReactResizeDetector, ExBAddedJSAPIProperties, SupportedJSAPILayerTypes } from 'jimu-core'
import { loadArcGISJSAPIModules, JimuMapViewComponent, type JimuMapView, type JimuLayerView } from 'jimu-arcgis'
import { WidgetPlaceholder, FillType, Paper } from 'jimu-ui'
import { ELegendMode, type IMConfig, type Style } from '../config'
import { getStyle } from './lib/style'
import defaultMessages from './translations/default'
import legendIcon from '../../icon.svg'
import { versionManager } from '../version-manager'
import * as reactiveUtils from 'esri/core/reactiveUtils'

export enum LoadStatus {
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Rejected = 'Rejected'
}

export interface WidgetProps extends AllWidgetProps<IMConfig> {
}

export interface WidgetState {
  loadStatus: LoadStatus
  activeJmv: JimuMapView
}

export default class Widget extends React.PureComponent<WidgetProps, WidgetState> {
  private readonly mapView: __esri.MapView
  private readonly sceneView: __esri.SceneView
  private legend: __esri.Legend
  private Legend: typeof __esri.Legend
  private currentWidth: number
  legendWrapperRef = React.createRef<HTMLDivElement>()
  legendContainerRef = React.createRef<HTMLDivElement>()
  mapContainerRef = React.createRef<HTMLDivElement>()

  static versionManager = versionManager

  constructor (props) {
    super(props)
    this.state = {
      loadStatus: LoadStatus.Pending,
      activeJmv: null
    }
  }

  componentDidUpdate (prevProps: Readonly<WidgetProps>, prevState: Readonly<WidgetState>, snapshot?: any): void {
    // Refresh legend widget when the config changes
    if (this.state.activeJmv) {
      this.createLegend(this.state.activeJmv.view)
    }
  }

  destroyView () {
    this.mapView && !this.mapView.destroyed && this.mapView.destroy()
    this.sceneView && !this.sceneView.destroyed && this.sceneView.destroy()
  }

  destroyLegend = () => {
    this.legend && !this.legend.destroyed && this.legend.destroy()
  }

  createLegend = async (view: __esri.MapView | __esri.SceneView) => {
    if (!this.Legend) {
      [this.Legend] = await loadArcGISJSAPIModules(['esri/widgets/Legend'])
    }

    const container = document && document.createElement('div')
    this.legendContainerRef.current && this.legendContainerRef.current.appendChild(container)

    await view.when()

    // Destroy the old legend before create the new one
    this.destroyLegend()
    const legendOption: __esri.LegendProperties = {
        view: view,
        container: container,
    }

    this.legend = new this.Legend(legendOption)
    this.customizeLegends()
    this.configLegend()
  }

  customizeLegends = () => {
    if (this.props.config.customizeLayerOptions?.[this.state.activeJmv?.id]?.isEnabled) {
      reactiveUtils.on(() => this.legend.activeLayerInfos, 'change', (event) => {
        if (!this.state.activeJmv) {
          return
        }
        const showRuntimeAddedLayer = this.props.config.customizeLayerOptions[this.state.activeJmv?.id]?.showRuntimeAddedLayers
        const showSet = new Set(this.props.config.customizeLayerOptions?.[this.state.activeJmv?.id]?.showJimuLayerViewIds)
        for (const item of this.legend.activeLayerInfos) {
          const layer = item.layer
          const isRuntimeAdded = layer[ExBAddedJSAPIProperties.EXB_LAYER_FROM_RUNTIME]
          if (isRuntimeAdded) {
            !showRuntimeAddedLayer && this.legend.activeLayerInfos.remove(item)
          } else {
            const jlvId = this.state.activeJmv.getJimuLayerViewIdByAPILayer(layer)
            const childInfos = this.getAllChildActiveInfos(item)
            if (!showSet.has(jlvId)) {
              this.legend.activeLayerInfos.remove(item)
            }
            for (const childInfo of childInfos) {
              const childJlvId = this.state.activeJmv.getJimuLayerViewIdByAPILayer(childInfo.layer)
              if (!showSet.has(childJlvId)) {
                childInfo.parent.children.remove(childInfo)
              }
            }
          }
        }
      })
    }

  }

  getAllChildActiveInfos = (activeInfo: __esri.ActiveLayerInfo, result: __esri.ActiveLayerInfo[] = []) => {
    if (activeInfo.children) {
      for (const childInfo of activeInfo.children) {
        result.push(childInfo)
        this.getAllChildActiveInfos(childInfo, result)
      }
    }
    return result
  }

  isRuntimeLayer = (layer: __esri.Layer | __esri.Sublayer): boolean => {
    const isRuntimeAdded = this.props.config.customizeLayerOptions?.[this.state.activeJmv.id].showRuntimeAddedLayers && layer[ExBAddedJSAPIProperties.EXB_LAYER_FROM_RUNTIME]
    return isRuntimeAdded
  }

  isSpecialLayer = (layer: __esri.Layer | __esri.Sublayer): boolean => {
    let parentLayer = layer.parent
    const layerTypes: string[] = [
      'esri.layers.WMTSLayer',
    ]

    while (parentLayer) {
      if (layerTypes.includes(parentLayer.declaredClass)) {
        return true
      }
      parentLayer = (parentLayer as any).parent
    }

    return false
  }

  isParentVisible(layer: __esri.Layer | __esri.Sublayer, showSet: Set<string>) {
    const allParentLayers = getParents(layer)
    // No parent
    if (allParentLayers.length === 0) {
      return true
    }
    for (const parentLayer of allParentLayers) {
      const parentJlvId = this.state.activeJmv.getJimuLayerViewIdByAPILayer(parentLayer)
      if (!showSet.has(parentJlvId)) {
        return false
      }
    }
    return true

    function getParents(layer: __esri.Layer | __esri.Sublayer) {
      const ret = []
      let currLayer: any = layer
      // Skip ground
      while (currLayer.parent && currLayer.parent.parent) {
        ret.push(currLayer.parent)
        currLayer = currLayer.parent
      }
      return ret
    }
  }

  handleLayerWithSublayer(jimuLayerView: JimuLayerView, showSet: Set<string>, sublayersMap: Map<__esri.Layer, string[]>) {
    const supportedTypes: string[] = [SupportedJSAPILayerTypes.MapImageLayer, SupportedJSAPILayerTypes.SubtypeGroupLayer, SupportedJSAPILayerTypes.WMSLayer]
    const parentJlv = jimuLayerView.getParentJimuLayerView()
    if (!supportedTypes.includes(parentJlv.type)) {
      return
    }
    // Only construct layerInfo when all the parents are selected
    if (!this.isParentVisible(jimuLayerView.layer, showSet)) {
      return
    }

    const sublayerId = jimuLayerView.type === SupportedJSAPILayerTypes.SubtypeSublayer ? (jimuLayerView.layer as __esri.SubtypeSublayer).subtypeCode : jimuLayerView.layer.id

    if (sublayersMap.has(parentJlv.layer)) {
      sublayersMap.get(parentJlv.layer).push(sublayerId)
    } else {
      sublayersMap.set(parentJlv.layer, [sublayerId])
    }
  }

  configLegend = () => {
    if (this.legend) {
      const basemapLegendVisible = this.props.config.showBaseMap
      this.legend.style = this.calculateStyle()
      this.legend.basemapLegendVisible = basemapLegendVisible
      const legendMode = this.props.config.legendMode

      if (legendMode === ELegendMode.ShowAll) {
        this.legend.respectLayerVisibility = false
      } else if (legendMode === ELegendMode.ShowWithinExtent) {
        this.legend.hideLayersNotInCurrentView = true
      }
    }
  }

  calculateStyle = () => {
    let style
    const currentWidth = this.currentWidth || 100000// window.innerWidth;
    if (this.legend) {
      if (this.props.config.cardStyle) {
        let layout
        if (!this.props.config.cardLayout || this.props.config.cardLayout === 'auto') {
          if (currentWidth <= 600) {
            layout = 'stack'
          } else {
            layout = 'side-by-side'
          }
        } else {
          layout = this.props.config.cardLayout
        }
        style = {
          type: 'card' as const,
          layout: layout
        }
      } else {
        style = 'classic'
      }
    } else {
      style = 'classic'
    }
    return style
  }

  getDefaultStyleConfig (): Style {
    return {
      useCustom: false,
      background: {
        color: '',
        fillType: FillType.FILL
      },
      fontColor: ''
    }
  }

  getStyleConfig () {
    if (this.props.config.style && this.props.config.style.useCustom) {
      return this.props.config.style
    } else {
      return this.getDefaultStyleConfig()
    }
  }

  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    if (jimuMapView && jimuMapView.view) {
      await this.createLegend(jimuMapView.view)

      this.setState({
        loadStatus: LoadStatus.Fulfilled,
        activeJmv: jimuMapView
      })
    } else {
      this.destroyLegend()
    }
  }

  onResize = ({ width, height }) => {
    this.currentWidth = width
    if (this.legend && this.props.config.cardLayout === 'auto') {
      const style = this.calculateStyle()
      this.legend.style = style
    }
  }

  render () {
    const useMapWidget = this.props.useMapWidgetIds && this.props.useMapWidgetIds[0]

    let content = null

    if (!useMapWidget) {
      this.destroyLegend()
      content = (
        <div className='widget-legend'>
          <WidgetPlaceholder icon={legendIcon} autoFlip name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} />
        </div>
      )
    } else {
      let loadingContent = null
      const dataSourceContent = <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange} />
      if (this.state.loadStatus === LoadStatus.Pending) {
        loadingContent = (
          <div className='jimu-secondary-loading' />
        )
      }

      if (window.jimuConfig.isInBuilder) {
        this.configLegend()
      }
      content = (
        <div className='widget-legend' ref={this.legendWrapperRef}>
          {loadingContent}
          <div ref={this.legendContainerRef} style={{ height: '100%' }} />
          <div style={{ position: 'absolute', display: 'none' }} ref={this.mapContainerRef}>mapContainer</div>
          <div style={{ position: 'absolute', display: 'none' }}>
            {dataSourceContent}
          </div>
          <ReactResizeDetector targetRef={this.legendWrapperRef} handleHeight handleWidth onResize={this.onResize} />
        </div>
      )
    }
    return (
      <Paper variant='flat' css={getStyle(this.props.theme, this.getStyleConfig())} className='jimu-widget' shape='none'>
        {content}
      </Paper>
    )
  }
}
