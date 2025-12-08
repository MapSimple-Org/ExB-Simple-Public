import type { WebChart } from 'jimu-ui/advanced/chart'
import { capitalizeString, getTemplateType } from '../../../../utils/common'

const Icons = {
  bar: require('../../../assets/icons/bar.svg'),
  column: require('../../../assets/icons/column.svg'),
  line: require('../../../assets/icons/line.svg'),
  area: require('../../../assets/icons/area.svg'),
  pie: require('../../../assets/icons/pie.svg'),
  scatter: require('../../../assets/icons/scatter.svg'),
  histogram: require('../../../assets/icons/histogram.svg'),
  gauge: require('../../../assets/icons/gauge.svg')
}

const Thumbnails = {
  bar: require('../../../assets/thumbnail/bar.svg'),
  column: require('../../../assets/thumbnail/column.svg'),
  'stacked-bar': require('../../../assets/thumbnail/stacked-bar.svg'),
  'stacked100-bar': require('../../../assets/thumbnail/stacked100-bar.svg'),
  'stacked-column': require('../../../assets/thumbnail/stacked-column.svg'),
  'stacked100-column': require('../../../assets/thumbnail/stacked100-column.svg'),
  line: require('../../../assets/thumbnail/line.svg'),
  'smooth-line': require('../../../assets/thumbnail/smooth-line.svg'),
  area: require('../../../assets/thumbnail/area.svg'),
  'smooth-area': require('../../../assets/thumbnail/smooth-area.svg'),
  pie: require('../../../assets/thumbnail/pie.svg'),
  donut: require('../../../assets/thumbnail/donut.svg'),
  scatter: require('../../../assets/thumbnail/scatter.svg'),
  histogram: require('../../../assets/thumbnail/histogram.svg'),
  gauge: require('../../../assets/thumbnail/gauge.svg')
}

export const getTemplateThumbnail = (webChart) => {
  const type = getTemplateType(webChart)?.[1] ?? 'column'
  return Thumbnails[type]
}

export const getTemplateIcon = (webChart) => {
  const type = getTemplateType(webChart)?.[0] ?? 'column'
  return Icons[type]
}

export const getMainTypeTranslation = (webChart: any) => {
  const templateType = getTemplateType(webChart)?.[0] ?? 'column'
  if (templateType === 'scatter') {
    return 'scatterPlot'
  } else if (templateType === 'histogram') {
    return 'histogram'
  } else if (templateType === 'gauge') {
    return 'gauge'
  }
  return `${templateType}Chart`
}

export const getTemplateTranslation = (webChart: any) => {
  const templateType = getTemplateType(webChart)?.[1] ?? 'column'
  if (templateType === 'scatter') {
    return 'scatterPlot'
  } else if (templateType === 'histogram') {
    return 'histogram'
  } else if (templateType === 'gauge') {
    return 'gauge'
  }
  if (!templateType.includes('-')) {
    return `${templateType}Chart`
  } else {
    const [type, subType] = templateType.split('-')
    if (type.includes('100')) {
      return `${type}${subType}Chart`
    } else {
      return `${type}${capitalizeString(subType)}Chart`
    }
  }
}

export const translatePercentageInRTL = (key: string, translate: (id: string, values?: any) => string) => {
  if (key === 'stacked100barChart') {
    return `%100 ${translate('stackedBarChart')}`
  } else if (key === 'stacked100columnChart') {
    return `%100 ${translate('stackedColumnChart')}`
  }
}

/**
 * Get the title of the chart, or falls back to the chart id if no title is defined.
 * @param webChart
 */
export const getChartTitle = (webChart: WebChart): string => {
  return webChart.title?.content.text ?? webChart.id
}
