import { React, classNames, type UseDataSource, type ImmutableObject, hooks, getAppStore } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage, CollapsablePanel } from 'jimu-ui'
import { Card } from '../../components'
import type { IWebChart } from '../../../../config'
import defaultMessages from '../../../translations/default'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getTemplateIcon, getTemplateThumbnail, getTemplateTranslation, translatePercentageInRTL } from './utils'
import { useSupportHistogram } from '../../utils'
import { getSeriesType } from 'jimu-ui/advanced/chart'

const CardStyle = {
  width: '68px',
  height: '56px',
  marginRight: '11px'
}

const Templates = [
  {
    id: 'column',
    templates: [require('../../../template/column.json'), require('../../../template/stacked-column.json'), require('../../../template/stacked100-column.json')]
  },
  {
    id: 'bar',
    templates: [require('../../../template/bar.json'), require('../../../template/stacked-bar.json'), require('../../../template/stacked100-bar.json')]
  },
  {
    id: 'line',
    templates: [require('../../../template/line.json'), require('../../../template/smooth-line.json')]
  },
  {
    id: 'area',
    templates: [require('../../../template/area.json'), require('../../../template/smooth-area.json')]
  },
  {
    id: 'pie',
    templates: [require('../../../template/pie.json'), require('../../../template/donut.json')]
  },
  {
    id: 'scatter',
    templates: [require('../../../template/scatter.json')]
  },
  {
    id: 'histogram',
    templates: [require('../../../template/histogram.json')]
  },
  {
    id: 'gauge',
    templates: [require('../../../template/gauge.json')]
  }
]

export const isBuildInTemplate = (templateId: string) => {
  if (!templateId) return true
  const templates = Templates.reduce((acc, cur) => acc.concat(cur.templates), [])
  return !!templates.find(t => t.id === templateId)
}

interface BuildInTemplatesProps {
  className?: string
  templateId: string
  useDataSource: ImmutableObject<UseDataSource>
  onChange: (config: IWebChart) => void
}

const BuildInTemplates = (
  props: BuildInTemplatesProps
): React.ReactElement => {
  const { className, templateId, useDataSource, onChange } = props
  const { current: isRTL } = React.useRef(getAppStore().getState().appContext.isRTL)

  const dataSourceId = useDataSource?.dataSourceId
  const supportHistogram = useSupportHistogram(dataSourceId)
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  return (
    <div className={classNames('chart-templates', className)}>
       <div className='my-4'>{translate('buildInTemplateTip')}</div>
      <SettingRow flow='wrap'>
        {Templates.map((value) => {
          const { id, templates } = value
          const icon = getTemplateIcon(templates[0])
          const type = getSeriesType(templates[0].series)
          // Histogram requires data source to support percentile statistics.
          const disabledHistogram = type === 'histogramSeries' && !supportHistogram
          const tooltip = disabledHistogram ? translate('histogramSupportTip') : ''
          const translation = getTemplateTranslation(templates[0])
          const label = translate(translation)
          return (
            <CollapsablePanel
              className='mb-2'
              key={id}
              leftIcon={icon}
              label={label}
              defaultIsOpen={true}
            >
              <div className='d-flex mt-2'>
                {templates.map((template) => {
                  const icon = getTemplateThumbnail(template)
                  const translation = getTemplateTranslation(template)
                  const percentageRTL = isRTL && translation.includes('stacked100')
                  return (
                    <Card
                      key={template.id}
                      vertical={true}
                      disabled={disabledHistogram}
                      title={!percentageRTL ? translate(translation) : translatePercentageInRTL(translation, translate)}
                      tooltip={tooltip}
                      aria-label={translate(translation)}
                      style={CardStyle}
                      icon={icon}
                      active={template.id === templateId}
                      onClick={() => { onChange(template) }}
                    />
                  )
                })}
              </div>
            </CollapsablePanel>
          )
        })}
      </SettingRow>
    </div>
  )
}

export default BuildInTemplates
