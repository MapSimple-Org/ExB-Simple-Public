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
import { NumericInput, Slider } from 'jimu-ui'

import type { ModelController, ModelLayer, RemapRange, WroModel } from './wro-model'

export class RemapRanges extends React.PureComponent<any, any> {
  render (): any {
    const wroModel: WroModel = this.props.wroModel
    const modelLayer: ModelLayer = this.props.modelLayer
    const items = []
    const ranges = modelLayer?.remapRanges
    if (ranges) {
      ranges.forEach((range, i) => {
        items.push(this.renderRange(range, i, modelLayer, wroModel))
      })
    }
    return (
      <div className='widget-wro-remap-panel'>
        {items}
      </div>
    )
  }

  renderRange (remapRange: RemapRange, index: number, modelLayer: ModelLayer, wroModel: WroModel): any {
    const nls = this.props.wroContext.nls
    const modelController: ModelController = this.props.wroContext.modelController
    const hideRanges: boolean = !!this.props.wroContext.getConfig().hideRanges
    const lockSlider: boolean = !!this.props.wroContext.getConfig().lockSlider
    const key = 'remap_' + modelLayer.rasterLayerId.toString() + '_' + index.toString()

    let minmax: string
    if (remapRange.inputMin === remapRange.inputMax) {
      minmax = `${remapRange.inputMin}`
    } else {
      minmax = `${remapRange.inputMin} - ${remapRange.inputMax}`
    }
    const rangeLabel = nls(
      hideRanges ? 'wro_remap_label_noRange' : 'wro_remap_label',
      { name: remapRange.label, minmax: minmax }
    )

    const onInputChange = (v): any => {
      if (typeof v === 'number') {
        modelController.setRemapOutputValue(wroModel, modelLayer.rasterLayerId, index, v)
      }
    }

    const onSliderChange = (e): any => {
      const v = parseInt(e.target.value)
      modelController.setRemapOutputValue(wroModel, modelLayer.rasterLayerId, index, v)
    }

    const inputSectionStyle = css`
      white-space: nowrap;
    `
    const disabledProps = { disabled: lockSlider }

    return (
      <div key={key + '_item'} className='widget-wro-remap-range'>
        <div className='widget-wro-remap-range-label' title={rangeLabel}>
          {rangeLabel}
        </div>
        <div key={key + '_inputSection'} css={inputSectionStyle}>
          <Slider
            key={key + '_slider'}
            className='widget-wro-remap-slider'
            min={0}
            max={9}
            step={1}
            value={remapRange.outputValue}
            onChange={onSliderChange}
            {...disabledProps}
          />
          <NumericInput
            key={key + '_input'}
            className='widget-wro-remap-numeric-input'
            size='sm'
            min={0}
            max={9}
            precision={0}
            showHandlers={false}
            value={remapRange.outputValue}
            onChange={onInputChange}
            disabled={lockSlider}
          />
        </div>
      </div>
    )
  }
}
