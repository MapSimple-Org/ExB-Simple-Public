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
import type { WroModel } from './wro-model'
import {
  ResponsiveThemeAm5, DarkThemeAm5,
  percentAm5,
  PieChartAm5, LegendAm5, createRoot, PieSeriesAm5, colorAm5, TooltipAm5, ScrollbarAm5
} from 'jimu-ui/advanced/chart-engine'

interface State {
  needsRefresh: boolean
}

export class WroChart extends React.PureComponent<any, State> {
  chartRef: any
  pieChart: any
  series: any
  chart: any
  legend: any
  root: any
  rootNode: any

  constructor (props: any) {
    super(props)
    this.chartRef = React.createRef()
    this.state = {
      needsRefresh: false
    }
  }

  componentDidMount (): void {
    this.initChart5()
  }

  async initChart5 (data?: any): Promise<void> {
    this.dispose()

    const node = document.createElement('div')
    node.style.width = '100%'
    node.style.height = '100%'
    this.rootNode = node
    this.chartRef.current.appendChild(node)

    const theme = this.props.wroContext.getTheme()
    const isRTL = !!(document?.documentElement?.dir === 'rtl')
    const locale = document?.documentElement?.lang

    const toolTipText = '{category} {valuePercentTotal.formatNumber(\'0.00p\')}'
    let labelText = '{category}'
    let valueText = '{valuePercentTotal.formatNumber(\'0.00p\')}'

    // amcharts do not add (%) correctly
    if (locale === 'ar') {
      valueText = '%{valuePercentTotal.formatNumber(\'#.00\')}'
      labelText = '  {category}' //add an extra space manually
    }
    if (locale === 'tr') {
      valueText = '%{valuePercentTotal.formatNumber(\'#.00\')}'
    }
    const dark = (theme?.sys.color.mode === 'dark')

    const root = await createRoot(node, locale)

    root.setThemes(dark ? [ResponsiveThemeAm5.new(root), DarkThemeAm5.new(root)] : [ResponsiveThemeAm5.new(root)])

    const chart = root.container.children.push(
      PieChartAm5.new(root, {
        layout: root.verticalLayout,
        radius: percentAm5(90)
      })
    )
    this.chart = chart

    // Create series
    const series = chart.series.push(
      PieSeriesAm5.new(root, {
        name: 'Series',
        categoryField: 'label',
        valueField: 'value',
        legendLabelText: labelText,
        legendValueText: valueText
      })
    )
    series.labels.template.set('forceHidden', true)
    series.ticks.template.set('visible', false)
    series.slices.template.set('toggleKey', 'none')

    //Default tooltip text is not contrasting properly with fill color. hence manually background white and text as Black
    const tooltip = TooltipAm5.new(root, {
      getFillFromSprite: false,
      labelText: toolTipText,
      autoTextColor: false,
      reverseChildren: true
    })
    tooltip.label.setAll({
      direction: 'rtl'
    })
    tooltip.get('background').setAll({
      fill: colorAm5(0xffffff),
      fillOpacity: 1.0,
      stroke: colorAm5(0x000000),
      strokeOpacity: 0.8
    })
    tooltip.label.setAll({
      fill: colorAm5(0x000000)
    })
    series.slices.template.set('tooltip', tooltip)

    if (data) {
      series.data.setAll(data)
    }
    this.series = series

    // Add legend
    const legend = chart.children.push(LegendAm5.new(root, {
      centerX: percentAm5(50),
      x: percentAm5(50),
      layout: root.verticalLayout,
      height: percentAm5(100),
      //This stops hovering and click effect too
      clickTarget: 'none',
      verticalScrollbar: ScrollbarAm5.new(root, {
        orientation: 'vertical'
      }),
      maxHeight: 130,
      maxWidth: 540
    }))

    legend.labels.template.setAll({
      textAlign: (isRTL ? 'right' : 'left'),
      width: 100,
      maxWidth: 250,
      oversizedBehavior: 'wrap'
    })

    legend.valueLabels.template.setAll({
      textAlign: (isRTL ? 'left' : 'right'),
      width: 50,
      maxWidth: 90
    })
    if (isRTL) {
      legend.set('reverseChildren', true)
      legend.itemContainers.template.setAll({
        reverseChildren: true
      })
    }
    if (this.series && data) {
      legend.data.setAll(this.series.dataItems)
    }
    this.legend = legend
    this.root = root
  }

  dispose (): void {
    if (this.root) {
      this.root.dispose()

      this.series = null
      this.chart = null
      this.legend = null
      this.root = null
    }
    if (this.rootNode) {
      this.rootNode.style.display = 'none'
      this.rootNode = null
    }
  }

  componentDidUpdate (prevProps: any): void {
    const wroModel: WroModel = this.props.wroModel
    const prevWroModel: WroModel = prevProps.wroModel
    const isChartPanel = wroModel && (wroModel.activePanel === 'chart-panel')
    const wasChartPanel = prevWroModel && (prevWroModel.activePanel === 'chart-panel')

    let data

    if (prevProps.histogramData !== this.props.histogramData) {
      data = []
      const serisColor = []
      const histogramData = this.props.histogramData
      if (histogramData?.colorCounts &&
          histogramData.colorCounts.length > 0) {
        histogramData.colorCounts.forEach(cc => {
          const fillColor = 'rgb(' + cc.rgb[0].toString() + ',' + cc.rgb[1].toString() + ',' + cc.rgb[2].toString() + ')'
          const item = {
            label: cc.label,
            value: cc.count
          }
          serisColor.push(fillColor)
          data.push(item)
        })
      }
      if (this.series) {
        this.series.get('colors').set('colors', serisColor)
        this.series.data.setAll(data)
        if (this.legend) {
          this.legend.data.setAll(this.series.dataItems)
        }
      }
    }

    if (prevProps.wroStatus.themeId !== this.props.wroStatus.themeId) {
      if (!data) data = this.chart?.data
      this.initChart5(data)
    }

    if (isChartPanel && !wasChartPanel && this.state.needsRefresh) {
      if (this.chart) {
        //TODO anything to be done here?
        //this.chart.validateData()
        //this.pieChart.legend.deepInvalidate()
      }
      this.setState({ needsRefresh: false })
    }
    if (!isChartPanel && wasChartPanel && !this.state.needsRefresh) {
      this.setState({ needsRefresh: true })
    }
  }

  componentWillUnmount (): void {
    if (this.chart) {
      this.dispose()
    }
  }

  render (): any {
    return (
       <div ref={this.chartRef} className='widget-wro-chart-component'></div>
    )
  }

  /*
    Had trouble getting the jimu-ui/advanced/chart pie series to work,
    couldn't dynamically change the colors. Switched to am4charts, provided by the JSAPI.

    We'll keep this code as a starting point for future implementation
    import { Chart } from 'jimu-ui/advanced/chart'
  */
  // render (): any {
  //   const config: any =
  //   {
  //     version: '1.0.0',
  //     type: 'chart',
  //     id: 'WroChart',
  //     dataSource: null,
  //     background: [255, 255, 255, 0], // transparent
  //     series: [
  //       {
  //         type: 'pieSeries',
  //         id: 'WroSeries',
  //         name: 'WroSeries',
  //         innerRadius: 10,
  //         startAngle: 30,
  //         endAngle: 390,
  //         x: 'label',
  //         y: 'value',
  //         dataLabels: {
  //           type: 'chartText',
  //           visible: false,
  //           content: {
  //             type: 'esriTS',
  //             color: [0, 0, 0, 255],
  //             font: {
  //               family: 'Avenir Next W01, Avenir Next W00, Avenir Next, Avenir, sans-serif',
  //               size: 12,
  //               style: 'normal',
  //               weight: 'normal'
  //             },
  //             text: ''
  //           }
  //         },
  //         fillSymbol: {
  //           type: 'esriSFS',
  //           style: 'esriSFSSolid',
  //           color: 'red', // [116, 184, 223, 200]
  //           outline: {
  //             type: 'esriSLS',
  //             style: 'esriSLSSolid',
  //             color: [255, 255, 255, 200],
  //             width: 1
  //           }
  //         },
  //         colorType: 'colorMatch' // singleColor
  //       }
  //     ],
  //     legend: {
  //       type: 'chartLegend',
  //       visible: true,
  //       title: {
  //         type: 'chartText',
  //         visible: false,
  //         content: {
  //           type: 'esriTS',
  //           color: [0, 0, 0, 255],
  //           text: '',
  //           font: {
  //             family: 'Avenir Next W01, Avenir Next W00, Avenir Next, Avenir, sans-serif',
  //             size: 12,
  //             style: 'normal',
  //             weight: 'normal',
  //             decoration: 'none'
  //           },
  //           horizontalAlignment: 'center'
  //         }
  //       },
  //       body: {
  //         type: 'esriTS',
  //         color: [0, 0, 0, 255], // need a theme font color
  //         font: {
  //           family: 'Avenir Next W01, Avenir Next W00, Avenir Next, Avenir, sans-serif',
  //           size: 12,
  //           style: 'normal',
  //           weight: 'normal'
  //         },
  //         text: ''
  //       },
  //       position: 'bottom'
  //     }
  //   }
  //   const chartDataSource: any = {
  //     type: 'inline',
  //     data: [],
  //     processed: true
  //   }
  //   config.dataSource = chartDataSource
  //   const data = []
  //   const histogramData = this.props.histogramData
  //   if (histogramData?.colorCounts &&
  //       histogramData.colorCounts.length > 0) {
  //     chartDataSource.configFields = {
  //       fillColor: 'fillColor',
  //       displayLabel: 'displayLabel'
  //     }
  //     histogramData.colorCounts.forEach(cc => {
  //       const item = {
  //         label: cc.label,
  //         value: cc.count,
  //         fillColor: [99, 99, 99, 99],
  //         displayLabel: 'ddd'
  //       }
  //       data.push(item)
  //     })
  //   }
  //   config.dataSource.data = data
  //   // console.log('histogramData', histogramData)
  //   // console.log('config', config)
  //   return (
  //     <div className='widget-wro-chart-component'>
  //       <Chart config={config} data={data} />
  //     </div>
  //   )
  // }
}
