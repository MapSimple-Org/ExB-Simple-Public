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
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'

import type { ColorInfo, ColormapInfo, ModelController, WroModel } from './wro-model'
import * as wroColormaps from './wro-colormaps'

export class Colormap extends React.PureComponent<any, any> {
  render (): any {
    const lowLabel = this.props.lowLabel
    const highLabel = this.props.highLabel

    const colors = []
    const def = wroColormaps.findColormapInfo(this.props.defName)
    if (def) {
      def.colors.forEach(colorInfo => {
        colors.push(this.renderColor(colorInfo))
      })
    }

    const labelStyle = css`
      margin: 0 6px;
    `

    return (
      <div className='widget-wro-color-ramp'>
        <span css={labelStyle}>{lowLabel}</span>
        <span className="widget-wro-color-ramp-container">{colors}</span>
        <span css={labelStyle}>{highLabel}</span>
      </div>
    )
  }

  renderColor (colorInfo: ColorInfo): any {
    let tip = null
    let s1 = colorInfo.label
    const s2 = colorInfo.value.toString()
    if (s1) {
      s1 = s1.trim()
    }
    if (s1 && (s1.length > 0) && s2 && (s2.length > 0)) {
      const s = this.props.nls('wro_colorRamp_tipPattern', {
        label: s1,
        value: s2
      })
      tip = s
    } else if (s1 && (s1.length > 0)) {
      tip = s1
    } else if (s2 && (s2.length > 0)) {
      tip = s2
    }

    const rgb = colorInfo.rgb
    const style = {
      backgroundColor: 'rgb(' + rgb[0].toString() + ',' + rgb[1].toString() + ',' + rgb[2].toString() + ')'
    }

    return (
      <span key={colorInfo.value.toString()} className='widget-wro-color-ramp-color'
        style={style} title={tip} />
    )
  }
}

export class ColormapSelector extends React.PureComponent<any, any> {
  render (): any {
    const nls = this.props.wroContext.nls
    const wroModel: WroModel = this.props.wroModel
    const modelController: ModelController = this.props.wroContext.modelController
    const lowLabel = nls('wro_colorRamp_low')
    const highLabel = nls('wro_colorRamp_high')

    let cm
    const colormapName = wroModel?.colormapName
    if (colormapName) {
      const def = wroColormaps.findColormapInfo(colormapName)
      if (def) {
        cm = (
          <Colormap
            defName={def.name}
            lowLabel={lowLabel}
            highLabel={highLabel}
            nls={this.props.wroContext.nls}
          />
        )
      }
    }

    const items = []
    const colormapDefinitions: ColormapInfo[] = wroColormaps.getDefinitions()
    if (wroModel && colormapDefinitions) {
      colormapDefinitions.forEach(def => {
        items.push(
          <DropdownItem
            key={def.name}
            onClick={() => {
              modelController.setColormapName(wroModel, def.name)
            }}
          >
            <Colormap
              defName={def.name}
              lowLabel={lowLabel}
              highLabel={highLabel}
              nls={this.props.wroContext.nls}
            />
          </DropdownItem>
        )
      })
    }

    return (
      <div className='widget-wro-colormap-selector'>
        <Dropdown title={nls('wro_main_setSymbology')}>
          <DropdownButton>{cm}</DropdownButton>
          <DropdownMenu className='widget-wro-color-dropdown-menu'>
            {items}
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
}
