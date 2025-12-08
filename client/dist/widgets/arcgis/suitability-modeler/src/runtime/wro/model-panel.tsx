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

import { React, css, jsx } from 'jimu-core'
import { Alert, AlertPopup, Button, ButtonGroup, Icon, NumericInput } from 'jimu-ui'
import moreHorizontalIcon from 'jimu-ui/lib/icons/property-setting-selected.svg'

import { ColormapSelector } from './colormap'
import { Export } from './export'
import { RemapRanges } from './remap'
import type { ModelController, ModelLayer, WroModel, WroStatus } from './wro-model'
import type { WroContext } from './wro-context'
import * as layerUtil from './wro-layer-util'
import * as wroUtil from './wro-util'

import * as reactiveUtils from 'esri/core/reactiveUtils'

interface State {
  alertMessage: string
  isExporting: boolean
  isLayerRefreshing: boolean
  isRunning: boolean
  showExport: boolean
  showExportSuccessMsg: boolean
  showExportFailedMsg: boolean
}

export class ModelPanel extends React.PureComponent<any, State> {
  constructor (props: any) {
    super(props)
    this.state = {
      alertMessage: null,
      isExporting: false,
      isLayerRefreshing: false,
      isRunning: false,
      showExport: false,
      showExportSuccessMsg: false,
      showExportFailedMsg: false
    }
  }

  handleClearClicked = (): void => {
    const wroContext: WroContext = this.props.wroContext
    const modelController: ModelController = this.props.wroContext.modelController
    const wroModel: WroModel = this.props.wroModel
    if (wroModel) {
      layerUtil.resetRenderingRule(wroContext, wroModel)
      modelController.clear(wroModel)
    }
  }

  closeAlert = (): void => {
    this.setState({ alertMessage: null })
  }

  closeExport = (): void => {
    this.setState({ showExport: false })
  }

  exportModel = async (task: any): Promise<any> => {
    if (this.state.isExporting) return
    this.setState({ isExporting: true, showExportSuccessMsg: false, showExportFailedMsg: false })
    const nls = this.props.wroContext.nls
    try {
      await wroUtil.exportModel(task)
      this.setState({ isExporting: false, showExportSuccessMsg: true })
    } catch (ex) {
      console.error(ex)
      // @todo need to inform user
      console.error('Error exporting WRO model', ex)
      // @todo: maybe the alert message can be removed as a result of the new alert UI
      const msg = (ex?.message) || nls('wro_saveModel_failed')
      this.setState({ isExporting: false, alertMessage: msg, showExportFailedMsg: true })
    }
  }

  handleExportClicked = (): void => {
    if (this.state.isRunning || this.state.isExporting) return
    this.runModel(true)
  }

  handleLayersPanelClicked = (): void => {
    const modelController: ModelController = this.props.wroContext.modelController
    const wroModel: WroModel = this.props.wroModel
    if (wroModel) {
      modelController.setActivePanel(wroModel, 'layers-panel')
    }
  }

  handleChartPanelClicked = (): void => {
    const modelController: ModelController = this.props.wroContext.modelController
    const wroModel: WroModel = this.props.wroModel
    if (wroModel) {
      modelController.setActivePanel(wroModel, 'chart-panel')
    }
  }

  handleRunClicked = (): void => {
    if (this.state.isRunning) return
    this.runModel(false)
  }

  runModel = async (forExport: boolean): Promise<void> => {
    if (this.state.isRunning) return
    const nls = this.props.wroContext.nls
    const wroContext: WroContext = this.props.wroContext
    const wroModel: WroModel = this.props.wroModel
    if (wroModel) {
      this.setState({ isRunning: true, isLayerRefreshing: true })
      try {
        const params: any = {
          isRunning: false,
          isLayerRefreshing: false
        }
        const layer = await layerUtil.runWroModel(wroContext, wroModel)
        if (layer) {
          const view = wroContext.getView()
          if (view) {
            params.isLayerRefreshing = true
            view.whenLayerView(layer).then(layerView => {
              reactiveUtils.whenOnce(() => !layerView.updating).then(() => {
                this.setState({ isLayerRefreshing: false })
              })
            })
          }
        }
        if (forExport) {
          params.showExport = true
        }
        this.setState(params)
      } catch (ex) {
        console.error('Error running WRO model', ex)
        const msg = (ex?.message) || nls('wro_main_runError')
        this.setState({ isRunning: false, isLayerRefreshing: false, alertMessage: msg })
      }
    }
  }

  componentDidUpdate (): void {
    const wroContext: WroContext = this.props.wroContext
    if (!wroContext.getConfig().allowExport && this.state.showExport) this.closeExport()
  }

  render (): any {
    const nls = this.props.wroContext.nls
    const wroContext: WroContext = this.props.wroContext
    const wroModel: WroModel = this.props.wroModel
    const wroStatus: WroStatus = this.props.wroStatus

    const modelLayers = wroModel?.modelLayers
    const items = []
    if (modelLayers) {
      modelLayers.forEach((ml: ModelLayer) => {
        if (ml.selected) {
          const item = this.renderLayer(ml, wroModel)
          items.push(item)
        }
      })
    }

    let alertNode: any
    const alertMessage = this.state.alertMessage
    if (alertMessage) {
      alertNode = (
        <AlertPopup
          isOpen
          hideOK
          cancelLabel={nls('wro_general_close')}
          title={nls('wro_main_modelIssue')}
          toggle={this.closeAlert}
        >
          <div style={{ fontSize: 'small', minWidth: '300px' }}>
            {alertMessage}
          </div>
        </AlertPopup>
      )
    }

    let exportNode: any
    if (this.state.showExport) {
      exportNode = (
        <Export
          wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
          close={this.closeExport} exportModel={this.exportModel}
        />
      )
    }

    return (
      <div className='widget-wro-model-panel'>
        <div className='widget-wro-panel-header widget-wro-flex-between'>
          <div>
            <span>{nls('wro_main_designModelCaption')}</span>
            {alertNode}
            {exportNode}
          </div>
          <ColormapSelector
            wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
          />
        </div>
        <div className='widget-wro-model-panel-body'>
          <ul className='widget-wro-model-layers-list'>
            {items}
          </ul>
          <div className='widget-wro-model-footer'>
            {this.renderAlerts()}
            {this.renderTotal()}
            {this.renderButtons()}
          </div>
        </div>
      </div>
    )
  }

  renderButtons (): any {
    const nls = this.props.wroContext.nls
    const modelController: ModelController = this.props.wroContext.modelController
    const wroModel: WroModel = this.props.wroModel
    const view = this.props.wroContext.getView()
    const { isExporting, isRunning } = this.state
    const hasMap = !!this.props.wroStatus.viewId
    const hasModel = !!wroModel
    const buttons = []

    let isValid = false
    if (wroModel) {
      isValid = modelController.isValid(wroModel)
    }

    let requiresRun = true
    if (wroModel && wroModel.lastRun && wroModel.mapLayerId) {
      if (modelController.stringifyCriteria(wroModel) === wroModel.lastRun) {
        const lyr = layerUtil.findMapLayer(view, wroModel.mapLayerId)
        if (lyr && lyr.visible) {
          requiresRun = false
        }
      }
    }

    let showExport = false
    const allowExport = !!this.props.wroContext.getConfig().allowExport
    const user = this.props.wroContext.getUser()
    if (allowExport && user && user.privileges) {
      if (user.privileges.indexOf('portal:user:createItem') !== -1) {
        showExport = true
      }
    }

    buttons.push(
      <Button
        key='clear' disabled={!hasModel}
        onClick={this.handleClearClicked}
      >
        {nls('wro_general_clear')}
      </Button>
    )

    if (showExport) {
      buttons.push(
        <Button
          key='export' disabled={!isValid || !hasMap || isRunning || isExporting || requiresRun}
          onClick={this.handleExportClicked}
        >
          {nls('wro_general_export')}
        </Button>
      )
    }

    buttons.push(
      <Button
        key='run' type='primary' disabled={!isValid || !hasMap || isRunning || !requiresRun}
        onClick={this.handleRunClicked}
      >
        {nls('wro_general_run')}
      </Button>
    )

    return (
      <div>
        <div className='widget-wro-model-buttons'>
          <div className='widget-wro-flex-between widget-wro-flex-column'>
            <ButtonGroup>
              {buttons}
            </ButtonGroup>
          </div>
        </div>
      </div>
    )
  }

  renderAlerts (): any {
    const alerts = []
    const nls = this.props.wroContext.nls
    const { showExportSuccessMsg, showExportFailedMsg } = this.state
    alerts.push(
      <Alert
        key="success"
        closable
        form="basic"
        onClose={() => { this.setState({ showExportSuccessMsg: false }) }}
        open={showExportSuccessMsg}
        text={nls('wro_saveModel_success_msg')}
        type="success"
        withIcon
      />,
      <Alert
        key="failed"
        closable
        form="basic"
        onClose={() => { this.setState({ showExportFailedMsg: false }) }}
        open={showExportFailedMsg}
        text={nls('wro_saveModel_failed_msg')}
        type="error"
        withIcon
      />
    )
    return (
      <div className={`widget-wro-alert-container ${showExportSuccessMsg || showExportFailedMsg ? '' : 'u-hidden'}`}>
        {alerts}
      </div>
    )
  }

  renderLayer (modelLayer: ModelLayer, wroModel: WroModel): any {
    const nls = this.props.wroContext.nls
    const modelController: ModelController = this.props.wroContext.modelController
    const wroContext: WroContext = this.props.wroContext
    const wroStatus: WroStatus = this.props.wroStatus
    const key = 'layer_' + modelLayer.rasterLayerId.toString()
    let defaultWeight = modelLayer.weight
    if (typeof defaultWeight !== 'number') defaultWeight = 0

    const handleRemapClick = (): void => {
      modelController.setRemapOpen(wroModel, modelLayer.rasterLayerId, !modelLayer.remapOpen)
    }

    const handleWeightChange = (v): void => {
      if (typeof v !== 'number') v = null
      modelController.setWeight(wroModel, modelLayer.rasterLayerId, v)
    }

    let ranges
    if (modelLayer.remapOpen) {
      ranges = (
        <RemapRanges
          modelLayer={modelLayer}
          wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
        />
      )
    }

    return (
      <li key={key + '_li'}>
        <div key={key + '_item'} className='widget-wro-model-item'>
          <div className='widget-wro-model-item-label'>{modelLayer.title}</div>
          <div key={key + '_section'} className='widget-wro-model-item-input-section'>
            <Button
              size='sm' icon
              active={modelLayer.remapOpen}
              className='widget-wro-model-item-remap-btn'
              onClick={handleRemapClick}
              title={nls('wro_main_setScores')}
            >
              <Icon icon={moreHorizontalIcon} />
            </Button>
            <NumericInput
              key={key + '_input'}
              className='widget-wro-input-weight'
              size='sm'
              min={0}
              max={100}
              precision={0}
              showHandlers={false}
              defaultValue={defaultWeight}
              onChange={handleWeightChange}
            />
            <span className='widget-wro-model-item-percent'>&#37;</span>
          </div>
        </div>
        {ranges}
      </li>
    )
  }

  renderTotal (): any {
    const nls = this.props.wroContext.nls
    const wroModel: WroModel = this.props.wroModel
    const hasMap = !!this.props.wroStatus.viewId
    const { isRunning, isLayerRefreshing } = this.state
    const locale = document?.documentElement?.lang

    let total = 0
    const modelLayers = wroModel?.modelLayers
    if (modelLayers) {
      modelLayers.forEach((ml: ModelLayer) => {
        if (ml.selected) {
          if (typeof ml.weight === 'number') {
            total += ml.weight
          }
        }
      })
    }
    let sTotal = total.toString() + '%'
    if (locale === 'ar' || locale === 'tr') sTotal = '%' + total.toString()

    const theme = this.props.wroContext.getTheme()
    let style
    if (total === 100) {
      style = css`
        color: ${theme.sys.color.success.text};
        background-color: ${theme.sys.color.success.light};
      `
    } else {
      style = css`
        color: ${theme.sys.color.error.text};
        background-color: ${theme.sys.color.error.light};
      `
    }

    // const cssSpin = css`
    //   display: inline-block;
    //   position: absolute;
    //   width: 1rem;
    //   height: 1rem;
    //   margin: 0 0.5rem;
    //   border-radius: 50%;
    //   border-top: 2px solid ${theme?.colors?.white};
    //   animation: widget-wro-kf-spinner 2s infinite linear;
    // `
    // let spinner;
    // if (isRunning || isLayerRefreshing) {
    //   spinner = <span css={cssSpin}></span>
    // }

    let msg
    if (!hasMap) {
      msg = <span className='widget-wro-chart-note'>{nls('wro_validation_noMap')}</span>
    } else if (isRunning || isLayerRefreshing) {
      msg = <span className={'widget-wro-model-working'}>{nls('wro_chart_working')}</span>
    }

    return (
      <div className='widget-wro-model-total' css={style}>
        <span>{nls('wro_main_total')}</span>
        {msg}
        <span>{sTotal}</span>
      </div>
    )
  }
}
