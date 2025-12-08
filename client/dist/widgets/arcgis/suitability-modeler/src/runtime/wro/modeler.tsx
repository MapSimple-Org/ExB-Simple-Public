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
import { Tabs, Tab } from 'jimu-ui'

import { ChartPanel } from './chart-panel'
import { LayersPanel } from './layers-panel'
import { ModelPanel } from './model-panel'
import type { WroContext } from './wro-context'
import type { ModelController, WroModel, WroStatus } from './wro-model'
import * as wroUtil from './wro-util'

export class Modeler extends React.PureComponent<any> {
  chartPanelRef

  constructor (props: any) {
    super(props)
    this.chartPanelRef = React.createRef()
  }

  canEnableChart = (): boolean => {
    return wroUtil.canComputeHistograms(this.props)
  }

  canEnableDesignModel = (): boolean => {
    const wroModel: WroModel = this.props.wroModel
    let hasSelectedlayers = false
    if (wroModel?.modelLayers) {
      hasSelectedlayers = wroModel.modelLayers.some(ml => !!ml.selected)
    }
    return hasSelectedlayers
  }

  componentDidUpdate (prevProps: any): void {
    const modelController: ModelController = this.props.wroContext.modelController
    const wroModel: WroModel = this.props.wroModel
    if (wroModel && prevProps.wroModel !== wroModel) {
      const activePanel = wroModel.activePanel
      if (activePanel === 'model-panel' && !this.canEnableDesignModel()) {
        modelController.setActivePanel(wroModel, 'layers-panel')
      } else if (activePanel === 'chart-panel' && !this.canEnableChart()) {
        modelController.setActivePanel(wroModel, 'layers-panel')
      }
    }
  }

  render (): any {
    const nls = this.props.wroContext.nls
    const modelController: ModelController = this.props.wroContext.modelController
    const wroContext: WroContext = this.props.wroContext
    const wroModel: WroModel = this.props.wroModel
    const wroStatus: WroStatus = this.props.wroStatus
    const hasModel = !!wroModel
    const activePanel = (wroModel?.activePanel) || 'layers-panel'

    // isModelLoading??? isModelRunning???

    const handleTabChanged = (v: string): any => {
      if (wroModel) {
        modelController.setActivePanel(wroModel, v)
      }
    }

    const disableDesignModel = !this.canEnableDesignModel()
    const disableChart = !this.canEnableChart()

    return (
      <div className='widget-wro-modeler'>
        <h6 className='widget-wro-header' style={{ display: this.props.wroContext.getLabel() ? 'block' : 'none' }}>
          {this.props.wroContext.getLabel()}
        </h6>
        <div className='widget-wro-body'>
          <Tabs
            className='widget-wro-tabs' value={activePanel}
            onChange={handleTabChanged} type='underline'
          >
            <Tab id='layers-panel' title={nls('wro_main_selectLayersCaption')}>
              <LayersPanel
                wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
              />
            </Tab>
            <Tab id='model-panel' title={nls('wro_main_designModelCaption')}
              disabled={!hasModel || disableDesignModel}
            >
              <ModelPanel
                wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
              />
            </Tab>
            <Tab
              id='chart-panel' title={nls('wro_chart_generate')}
              disabled={!hasModel || disableChart}
            >
              <ChartPanel ref={this.chartPanelRef}
                wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}
