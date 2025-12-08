import { React, classNames, type UseDataSource, DataSourceManager, type FeatureLayerDataSource, type ImmutableObject, hooks } from 'jimu-core'
import { Card, Message } from '../../components'
import { getChartTitle, getTemplateThumbnail } from './utils'
import type { WebChart } from 'jimu-ui/advanced/chart'
import checkChartSpec from '../utils/check-chart-spec'
import normalizeChart from '../utils/normalize-chart'
import type { IWebChart } from '../../../../config'
import defaultMessages from '../../../translations/default'
import { styled } from 'jimu-theme'

interface ExistingTemplatesProps {
  className?: string
  templateId: string
  useDataSource: ImmutableObject<UseDataSource>
  onChange: (config: IWebChart) => void
}

const Root = styled.div`
  height: 100%;
  .templates-cont {
    height: calc(100% - 47px);
    .templates {
      display: grid;
      grid-gap: 10px;
      grid-template-columns: 100%;
      grid-auto-rows: 60px;
      height: 100%;
    }
  }
`

const ExistingTemplates = (
  props: ExistingTemplatesProps
): React.ReactElement => {
  const { className, useDataSource, templateId, onChange } = props
  const translate = hooks.useTranslation(defaultMessages)
  const dataSourceId = useDataSource?.dataSourceId
  const [showMessage, setShowMessage] = React.useState(false)

  const charts = React.useMemo(() => {
    const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId) as FeatureLayerDataSource
    return dataSource?.getCharts() ?? []
  }, [dataSourceId])

  const handleChange = (template: WebChart) => {
    const { valid } = checkChartSpec(template, dataSourceId)
    if (valid) {
      const webChart = normalizeChart(template)
      onChange?.(webChart)
    } else {
      setShowMessage(true)
    }
  }

  return (
    <Root className={classNames('existing-templates', className)}>
      <div className='my-4'>{translate('existingTemplateTip')}</div>
      <div className='templates-cont mw-100'>
        {!!charts.length && <div className='templates mt-2'>
          {
            charts.map((template) => {
              const icon = getTemplateThumbnail(template)
              const title = getChartTitle(template)
              return (
                <Card
                  key={template.id}
                  vertical={false}
                  title={title}
                  label={title}
                  aria-label={title}
                  icon={icon}
                  active={template.id === templateId}
                  onClick={() => { handleChange(template) }}
                />
              )
            })
          }
        </div>}
      </div>
      {
        !charts.length && <div className='mt-2'>$No charts here.</div>
      }
      {showMessage && <Message type='error' text={translate('unsupportedTemplateTip')} onClose={() => { setShowMessage(false) }}></Message>}
    </Root>
  )
}

export default ExistingTemplates
