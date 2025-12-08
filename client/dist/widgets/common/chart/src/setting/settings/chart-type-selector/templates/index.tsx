import { React, classNames, type ImmutableArray, type UseDataSource } from 'jimu-core'
import { Tabs, Tab } from 'jimu-ui'
import type { WebChart } from 'jimu-ui/advanced/chart'
import type { IWebChart } from '../../../../config'
import BuildInTemplates, { isBuildInTemplate } from './buildin-templates'
import ExistingTemplates from './existing-templates'

const SHOW_EXISTING_TEMPLATE = false

export interface ChartTemplatesProps {
  className?: string
  templateId: string
  useDataSources: ImmutableArray<UseDataSource>
  onChange: (config: IWebChart | WebChart) => void
}

const ChartTemplates = (
  props: ChartTemplatesProps
): React.ReactElement => {
  const { className, useDataSources, onChange } = props
  // Compatible with the modification of scatter chart id
  const templateId = props.templateId === 'scatter-plot' ? 'scatter' : props.templateId
  const [activeTab, setActiveTab] = React.useState(() => isBuildInTemplate(templateId) ? 'buildin' : 'existing')

  return (
    <div className={classNames('chart-templates', className)}>
      {SHOW_EXISTING_TEMPLATE && <Tabs fill type='pills' value={activeTab} onChange={setActiveTab}>
        <Tab id='buildin' title='Template'>
          <BuildInTemplates useDataSource={useDataSources?.[0]} templateId={templateId} onChange={onChange} />
        </Tab>
        <Tab id='existing' title='Existing'>
          <ExistingTemplates useDataSource={useDataSources?.[0]} templateId={templateId} onChange={onChange} />
        </Tab>
      </Tabs>}
      {
        !SHOW_EXISTING_TEMPLATE && <BuildInTemplates useDataSource={useDataSources?.[0]} templateId={templateId} onChange={onChange} />
      }
    </div>
  )
}

export { getMainTypeTranslation, getTemplateIcon } from './utils'

export default ChartTemplates
