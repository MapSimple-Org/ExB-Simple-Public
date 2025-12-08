/** @jsx jsx */
/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/

import { React, jsx } from 'jimu-core'
import { Alert, Button, ButtonGroup, Select } from 'jimu-ui'
import { SelectPolygonOutlined } from 'jimu-icons/outlined/gis/select-polygon'
import { SelectLassoOutlined } from 'jimu-icons/outlined/gis/select-lasso'
import { LayerOutlined } from 'jimu-icons/outlined/gis/layer'
import { MoveOutlined } from 'jimu-icons/outlined/editor/move'

import type { WroModel, WroStatus, ModelController } from './wro-model'
import { WroChart } from './chart'
import type { WroContext } from './wro-context'
import * as chartUtil from './wro-chart-util'
import * as wroUtil from './wro-util'

import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'

interface State {
  activeTool: string
  histogramDataDraw: any
  histogramDataSelect: any
  isWorking: boolean
  selectedMapLayerId: string
  showWarning: boolean
  showError: boolean
  warning: string
  zoomPanActive: boolean
}

export class ChartPanel extends React.PureComponent<any, State> {
  activeSketchViewModel: SketchViewModel
  drawGfxLayerId: string
  highlightHandle: any
  imageLayerHandle: any
  selGfxLayerId: string
  selGeometry: any
  watchHandles = []
  workingId: number

  constructor (props: any) {
    super(props)
    const id = this.props.wroContext.getId() as string
    this.drawGfxLayerId = `${id}_drawGfxLayerId`
    this.selGfxLayerId = `${id}_selGfxLayerId`
    this.state = {
      activeTool: null,
      histogramDataDraw: null,
      histogramDataSelect: null,
      isWorking: false,
      selectedMapLayerId: null,
      showWarning: false,
      showError: false,
      warning: null,
      zoomPanActive: true
    }
  }

  componentDidUpdate (prevProps: any, prevState: State): void {
    const wroModel: WroModel = this.props.wroModel
    const prevWroModel: WroModel = prevProps.wroModel

    const isChartPanel = wroModel && (wroModel.activePanel === 'chart-panel')
    const wasChartPanel = prevWroModel && (prevWroModel.activePanel === 'chart-panel')
    if (!isChartPanel && this.activeSketchViewModel) {
      this.cancelSketch()
    }

    const imgid = wroModel?.mapLayerId
    const prevImgid = prevWroModel?.mapLayerId
    if (prevImgid && imgid !== prevImgid) {
      this.unwatchImageLayer()
    }
    if (imgid && imgid !== prevImgid) {
      this.watchImageLayer()
    }

    if (prevProps.wroStatus.viewId !== this.props.wroStatus.viewId) {
      this.resetState()
      this.watchView()
    } else {
      const canComputeHistograms = this.canComputeHistograms()
      if (!canComputeHistograms) {
        this.resetState()
        this.watchImageLayer()
      } else {
        if (isChartPanel && !wasChartPanel && !this.state.zoomPanActive) {
          const activeTool = this.state.activeTool
          if (activeTool === 'drawPolygon') {
            // @todo check if ok
            this.activateSketch('drawPolygon', 'polygon')
          } else if (activeTool === 'drawFreehandPolygon') {
            // @todo check if ok
            this.activateSketch('drawFreehandPolygon', 'polygon', { mode: 'freehand' })
          } else if (activeTool === 'selectLayer') {
            // @todo check if ok
            this.activateSketch('selectLayer', 'rectangle')
          }
          this.setState({ showWarning: false, showError: false })
        }
      }
    }
  }

  componentWillUnmount (): void {
    this.cancelSketch()
    this.unwatchView()
  }

  activateSketch = (activeTool, type, createOptions?): void => {
    this.cancelSketch()
    const isSel = (activeTool === 'selectLayer')
    const view = this.props.wroContext.getView()
    if (view?.map) {
      this.setGraphicsLayerVisibility(this.drawGfxLayerId, !isSel)
      const gfxLayerId = isSel ? this.selGfxLayerId : this.drawGfxLayerId
      const graphicsLayer = this.ensureGraphicsLayer(view, gfxLayerId)
      // let color = "#e6e6e6";
      const svm = this.activeSketchViewModel = new SketchViewModel({
        view: view,
        layer: graphicsLayer
      })
      svm.on('create', event => {
        if (event.state === 'complete') {
          if (isSel) {
            this.clearHighlightHandle()
            const geometry = event.graphic.geometry
            const task = this.newTask(view, geometry)
            this.computeHistograms(task)
            graphicsLayer.remove(event.graphic)
            // this.cancelSketch();
            // this.activateSketch(activeTool,type,createOptions) ;
          } else {
            if (event.graphic) {
              event.graphic.symbol = chartUtil.makeSelectionSymbol()
            }
            const task = this.newTask(view, null)
            this.computeHistograms(task)
          }
          svm.create(type, createOptions)
        }
      })
      svm.create(type, createOptions)
    }
  }

  cancelSketch = (): void => {
    const svm = this.activeSketchViewModel
    if (svm) {
      try {
        svm.cancel()
        svm.destroy()
      } catch (ex) {
        console.error('Error canceling SketchViewModel', ex)
      }
      this.activeSketchViewModel = null
    }
  }

  canComputeHistograms = (): boolean => {
    return wroUtil.canComputeHistograms(this.props)
  }

  clearHandles = (handles): void => {
    if (Array.isArray(handles)) {
      handles.forEach((h) => {
        try {
          if (h) h.remove()
        } catch (ex) {
          console.error(ex)
        }
      })
    }
  }

  clearHighlightHandle = (): void => {
    this.clearHandles([this.highlightHandle])
    this.highlightHandle = null
  }

  computeHistograms = async (task): Promise<any> => {
    this.clearHighlightHandle()
    const nls = this.props.wroContext.nls
    const workingId = this.workingId = Date.now()
    const isSel = !!task.featureSelectionGeometry
    this.setState({ isWorking: true, showWarning: false, showError: false })
    try {
      const histogramData = await chartUtil.computeHistograms(task)
      if (workingId !== this.workingId) {
        if (task.highlightHandle) this.clearHandles([task.highlightHandle])
      }
      if (workingId === this.workingId) {
        let warning = null
        const showNoData = (histogramData?.colorCounts && histogramData.colorCounts.length === 0)
        if (showNoData) {
          warning = nls('wro_chart_noData')
        }
        if (task.highlightHandle) {
          this.highlightHandle = task.highlightHandle
        }
        if (isSel) {
          this.selGeometry = task.featureSelectionGeometry
          this.setState({
            histogramDataSelect: histogramData,
            isWorking: false,
            showWarning: !!warning,
            warning: warning
          })
        } else {
          this.selGeometry = null
          this.setState({
            histogramDataDraw: histogramData,
            isWorking: false,
            showWarning: !!warning,
            warning: warning
          })
        }
      }
    } catch (ex) {
      console.error('Error computing histograms', ex)
      if (workingId === this.workingId) {
        this.setState({
          isWorking: false,
          showError: true,
          warning: ex?.message ? nls('wro_validation_errorLoadingItemWithMsg', { message: String(ex.message) }) : nls('wro_validation_errorLoadingItem')
        })
      }
    }
  }

  ensureGraphicsLayer = (view, layerId): GraphicsLayer => {
    return chartUtil.ensureGraphicsLayer(view, layerId)
  }

  getGraphicsLayer = (layerId): any => {
    const view = this.props.wroContext.getView()
    if (view?.map) {
      return view.map.findLayerById(layerId)
    }
  }

  getImageLayer = (): any => {
    return wroUtil.getImageLayer(this.props)
  }

  getLayers = (): any => {
    return wroUtil.getPolygonLayers(this.props)
  }

  handleClearClicked = (): void => {
    this.workingId = null
    const layer = this.getGraphicsLayer(this.drawGfxLayerId)
    if (layer) layer.removeAll()
    this.clearHighlightHandle()
    this.setState({
      histogramDataDraw: null,
      histogramDataSelect: null,
      showWarning: false,
      showError: false,
      isWorking: false
    })
  }

  handleDrawPolygonClicked = (): void => {
    this.clearHighlightHandle()
    this.activateSketch('drawPolygon', 'polygon')
    this.setState({
      activeTool: 'drawPolygon',
      histogramDataSelect: null,
      showWarning: false,
      showError: false,
      zoomPanActive: false
    })
  }

  handleDrawFreehandPolygonClicked = (): void => {
    this.clearHighlightHandle()
    this.activateSketch('drawFreehandPolygon', 'polygon', { mode: 'freehand' })
    this.setState({
      activeTool: 'drawFreehandPolygon',
      histogramDataSelect: null,
      showWarning: false,
      showError: false,
      zoomPanActive: false
    })
  }

  handleMapLayerSelected = (e): void => {
    let v = e.target.value
    if (typeof v !== 'string' || v.length === 0) {
      v = null
    }
    if (v !== this.state.selectedMapLayerId) {
      this.clearHighlightHandle()
    }
    this.setState({
      selectedMapLayerId: v,
      showWarning: false,
      showError: false,
      histogramDataSelect: null
    })
  }

  handleSelectLayerClicked = (): void => {
    this.activateSketch('selectLayer', 'rectangle')
    this.setState({
      activeTool: 'selectLayer',
      showWarning: false,
      showError: false,
      zoomPanActive: false
    })
  }

  handleZoomPanClicked = (): void => {
    this.watchImageLayer()
    this.cancelSketch()
    this.setState({
      showWarning: false,
      showError: false,
      zoomPanActive: true
    })
  }

  newTask = (view, featureSelectionGeometry?): any => {
    const task = chartUtil.newTask(
      this.props.wroContext,
      view,
      this.getImageLayer(),
      this.state.selectedMapLayerId,
      featureSelectionGeometry,
      this.drawGfxLayerId
    )
    return task
  }

  resetState = (): void => {
    this.cancelSketch()
    this.clearHighlightHandle()
    this.setState({
      activeTool: null,
      histogramDataDraw: null,
      histogramDataSelect: null,
      isWorking: false,
      selectedMapLayerId: null,
      showWarning: false,
      showError: false,
      warning: null,
      zoomPanActive: true
    })
  }

  setGraphicsLayerVisibility = (layerId, visible): void => {
    const layer = this.getGraphicsLayer(layerId)
    if (layer) layer.visible = visible
  }

  unwatchImageLayer (): void {
    if (this.imageLayerHandle) {
      // console.log('Unwatching image layer...')
      this.clearHandles([this.imageLayerHandle])
      this.imageLayerHandle = null
    }
  }

  unwatchView (): void {
    this.unwatchImageLayer()
    this.clearHighlightHandle()
    this.clearHandles(this.watchHandles)
    this.watchHandles = []
  }

  watchImageLayer (): void {
    this.unwatchImageLayer()
    const imageLayer = this.getImageLayer()
    if (imageLayer) {
      // console.log('Watching image layer...')
      this.imageLayerHandle = reactiveUtils.watch(() => imageLayer.rasterFunction, (): any => {
        const refreshDraw = (): void => {
          const view = this.props.wroContext.getView()
          if (this.state.histogramDataDraw) {
            const task = this.newTask(view, null)
            this.computeHistograms(task)
          }
        }

        const view = this.props.wroContext.getView()
        if (this.state.histogramDataSelect && this.selGeometry) {
          const task = this.newTask(view, this.selGeometry)
          this.computeHistograms(task).then(() => {
            refreshDraw()
          })
        } else {
          refreshDraw()
        }
      })
    }
  }

  watchView (): void {
    this.unwatchView()
    this.watchImageLayer()
    const view = this.props.wroContext.getView()
    if (view?.map) {
      const h = view.map.allLayers.on('change', (event) => {
        const layerId = this.state.selectedMapLayerId
        if (layerId) {
          const layer = view.map.findLayerById(layerId)
          if (!layer) {
            this.setState({ selectedMapLayerId: null })
          }
        }
      })
      this.watchHandles.push(h)
    }
  }

  handlePanelClicked = (): any => {
    const modelController: ModelController = this.props.wroContext.modelController
    const wroModel: WroModel = this.props.wroModel
    if (wroModel) {
      modelController.setActivePanel(wroModel, 'model-panel')
    }
  }

  render (): any {
    const nls = this.props.wroContext.nls
    const wroModel: WroModel = this.props.wroModel
    const { activeTool, isWorking, selectedMapLayerId, zoomPanActive } = this.state
    const canComputeHistograms = this.canComputeHistograms()
    // isWorking = true;

    let selectNode
    if (!canComputeHistograms) {
      selectNode = (
        <span className='widget-wro-chart-note'>{nls('wro_chart_noModelLayer')}</span>
      )
    } else if (canComputeHistograms && (wroModel?.mapLayerId)) {
      const layers = this.getLayers()
      if (activeTool === 'selectLayer') {
        if (layers && layers.length > 0) {
          const opts = []
          layers.forEach(lyr => {
            const opt = (
              <option key={lyr.id} value={lyr.id}>{lyr.title}</option>
            )
            opts.push(opt)
          })
          selectNode = (
            <Select
              placeholder={nls('wro_chart_selectLayerPlaceholder')}
              value={selectedMapLayerId}
              onChange={this.handleMapLayerSelected}
            >
              {opts}
            </Select>
          )
        } else {
          selectNode = (
            <span className='widget-wro-chart-note'>
              <Alert
                closable
                form="basic"
                text={nls('wro_chart_noSubjectLayers')}
                type="warning"
                withIcon
              />
            </span>
          )
        }
      } else {
        // selectNode = (
        //   <span className='widget-wro-chart-note'>{' '}</span>
        // )
      }
    }
    const showSelectNode = !!selectNode

    let msgNode = <div className='widget-wro-chart-working'>{' '}</div> // show it always, it has a fixed height
    if (isWorking) {
      msgNode = <div className='widget-wro-chart-working'><span>{nls('wro_chart_working')}</span></div>
    } else if (this.state.showWarning && this.state.warning) {
      msgNode = <div className='widget-wro-chart-warning'>
        <Alert
          closable
          form="basic"
          text={this.state.warning}
          type="warning"
          withIcon
        />
      </div>
    } else if (this.state.showError && this.state.warning) {
      msgNode = <div className='widget-wro-chart-warning'>
        <Alert
          closable
          form="basic"
          text={this.state.warning}
          type="error"
          withIcon
        />
      </div>
    }

    return (
      <div className='widget-wro-chart-panel'>
        <div className='widget-wro-chart-header'>
          <div className='widget-wro-flex-between'>
            <span className='widget-wro-chart-features-label'>
              {nls('wro_chart_prompt')}
            </span>
            <ButtonGroup className='widget-wro-chart-tools' gap='0.2rem'>
              <span className='working' data-dojo-attach-point='workingNode' />
              <Button
                className='widget-wro-chart-button'
                active={!zoomPanActive && (activeTool === 'drawPolygon')}
                variant={!zoomPanActive && (activeTool === 'drawPolygon') ? 'contained': 'outlined'}
                disabled={!canComputeHistograms}
                icon
                title={nls('wro_chart_polygonTool')}
                onClick={this.handleDrawPolygonClicked}
              ><SelectPolygonOutlined size='m' />
              </Button>
              <Button
                className='widget-wro-chart-button'
                active={!zoomPanActive && (activeTool === 'drawFreehandPolygon')}
                variant={!zoomPanActive && (activeTool === 'drawFreehandPolygon') ? 'contained': 'outlined'}
                disabled={!canComputeHistograms}
                icon
                title={nls('wro_chart_freehandPolygonTool')}
                onClick={this.handleDrawFreehandPolygonClicked}
              ><SelectLassoOutlined size='m' />
              </Button>
              <Button
                className='widget-wro-chart-button'
                active={!zoomPanActive && (activeTool === 'selectLayer')}
                variant={!zoomPanActive && (activeTool === 'selectLayer') ? 'contained': 'outlined'}
                disabled={!canComputeHistograms}
                icon
                title={nls('wro_chart_selectTool')}
                onClick={this.handleSelectLayerClicked}
              ><LayerOutlined size='m' />
              </Button>
              <Button
                className='widget-wro-chart-button'
                active={zoomPanActive}
                variant={zoomPanActive ? 'contained': 'outlined'}
                disabled={!canComputeHistograms}
                icon
                title={nls('wro_chart_zoomPanTool')}
                onClick={this.handleZoomPanClicked}
              ><MoveOutlined size='m' />
              </Button>
              <Button
                className='widget-wro-chart-button'
                disabled={!canComputeHistograms || !!isWorking}
                type='link'
                onClick={this.handleClearClicked}
              >{nls('wro_general_clear')}
              </Button>
            </ButtonGroup>
          </div>
          {showSelectNode &&
            <div className='widget-wro-chart-select-layer-section'>
              {selectNode}
            </div>
          }
          {msgNode}
        </div>
        <div className='widget-wro-chart-body'>
          {this.renderChart()}
        </div>
      </div>
    )
  }

  renderChart (): any {
    const wroContext: WroContext = this.props.wroContext
    const wroModel: WroModel = this.props.wroModel
    const wroStatus: WroStatus = this.props.wroStatus
    const isSel = (this.state.activeTool === 'selectLayer')
    let histogramData: any
    if (isSel) {
      histogramData = this.state.histogramDataSelect
    } else {
      histogramData = this.state.histogramDataDraw
    }
    return (
      <WroChart
        histogramData={histogramData}
        wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
      />
    )
  }
}
