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
import { Checkbox, Label } from 'jimu-ui'

import type { Issue, ModelController, RasterLayer, WroModel } from './wro-model'

export class LayersPanel extends React.PureComponent<any, any> {
  constructor (props: any) {
    super(props)
    this.state = {
      selectAllChecked: false
    }
  }

  allSelected = (): boolean => {
    const wroModel: WroModel = this.props.wroModel
    const rasterLayers = wroModel?.rasterLayers
    const modelController: ModelController = this.props.wroContext.modelController
    if (rasterLayers && rasterLayers.length > 0) {
      let n = 0
      for (let i = 0; i < rasterLayers.length; i++) {
        const checked = modelController.isLayerSelected(wroModel, rasterLayers[i].rasterLayerId)
        if (checked) {
          n++
        }
      }
      return (n === rasterLayers.length)
    }
    return false
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
    const loadErrors = wroModel?.loadErrors
    const rasterLayers = wroModel?.rasterLayers
    const hasMap = !!this.props.wroStatus.viewId

    let items = []
    if (this.props.wroStatus.isModelLoading) {
      items = [
        <li key='loading' className='widget-wro-loading-msg'>
          {nls('wro_general_loading')}
        </li>
      ]
    } else if (loadErrors && loadErrors.length > 0) {
      loadErrors.forEach((v: Issue) => {
        items.push(
          <li key={v.message} className='widget-wro-loading-error-msg'>
            {v.message}
          </li>
        )
      })
    } else if (!wroModel) {
      let prop = 'wro_validation_noModel'
      if (!hasMap) prop = 'wro_validation_noMap'
      items = [
        <li key='noMap' className='widget-wro-loading-error-msg widget-wro-fadein'>
          {nls(prop)}
        </li>
      ]
    } else if (!rasterLayers || rasterLayers.length === 0) {
      items = [
        <li key='noLayers' className='widget-wro-loading-error-msg'>
          {nls('wro_validation_noLayers')}
        </li>
      ]
    } else if (rasterLayers && rasterLayers.length > 0) {
      const selectAllNone = this.renderSelectAllNone(rasterLayers, wroModel)
      items.push(selectAllNone)

      rasterLayers.forEach((rl: RasterLayer) => {
        const item = this.renderLayer(rl, wroModel)
        items.push(item)
      })
    }

    return (
      <div className='widget-wro-layers-panel'>
        <div className='widget-wro-layers-body'>
          <ul className='widget-wro-layers-list'>
            {items}
          </ul>
          <div className='widget-wro-layers-footer'>
          </div>
        </div>
      </div>
    )
  }

  renderSelectAllNone (rasterLayers: RasterLayer[], wroModel: WroModel): any {
    const modelController: ModelController = this.props.wroContext.modelController

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
      if (e) {
        //Change state
        this.setState({ selectAllChecked: checked })

        //Check or uncheck all Checkboxes
        modelController.selectAllNoneLayer(wroModel, rasterLayers, !!checked)
      }
    }
    const nls = this.props.wroContext.nls
    const checked = this.allSelected()

    const title = nls('wro_layers_selectAll')
    return (
      <li key={'selectAll'}>
        <Label className='widget-wro-layer-select-all-label'>
          <Checkbox checked={checked} onChange={handleChange} />
          <span className='widget-wro-layer-select-all'>{title}</span>
        </Label>
        <hr></hr>
      </li>
    )
  }

  renderLayer (rasterLayer: RasterLayer, wroModel: WroModel): any {
    const modelController: ModelController = this.props.wroContext.modelController

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
      if (e) {
        modelController.selectLayer(wroModel, rasterLayer.rasterLayerId, !!checked)
      }
    }

    const title = rasterLayer.title
    const checked = modelController.isLayerSelected(wroModel, rasterLayer.rasterLayerId)
    return (
      <li key={rasterLayer.name}>
        <Label>
          <Checkbox checked={checked} onChange={handleChange} />
          <span className='widget-wro-layer-title'>{title}</span>
        </Label>
      </li>
    )
  }
}
