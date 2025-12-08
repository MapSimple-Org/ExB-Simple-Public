/** @jsx jsx */
import { React, jsx, css, type ImmutableObject, hooks, UtilityManager } from 'jimu-core'
import { SettingSection } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, defaultMessages as jimuiDefaultMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'
import type { CustomToolOutput, CustomToolConfig, ToolConfig, CustomToolOption } from '../../config'
import CustomToolInputConfig from './custom-tool-input-config'
import CustomToolOutputConfig from './custom-tool-output-config'
import type { AnalysisServiceInfo, AnalysisToolParam } from '@arcgis/analysis-ui-schema'
import { parameterUseFileUploadComponent } from '../../utils/util'
import CustomToolOptionConfig from './custom-tool-option-config'

const style = css`
  >.jimu-widget-setting--section {
    padding: 0.375rem 1rem;
  }
  .config-section {
    >.collapse >.config-section-detail {
      padding-bottom: 0.375rem;
    }
  }
  .parameter-setting-collapse {
    margin-bottom: 0.5rem;
    &:first-of-type {
      margin-top: 0.5rem
    }
    &:last-child {
      margin-bottom: 0;
      .collapse {
        padding-bottom: 0;
      }
    }
  }
  .config-section-detail {
    .collapse-header {
      height: 1.625rem;
      padding: 0 0.5rem 0 0.375rem;
      background-color: var(--sys-color-secondary-main);
      .title {
        font-size: 0.8125rem !important;
      }
    }

    .last-setting-row {
      padding-bottom: 0.25rem;
    }
    .dark-600 {
      color: var(--ref-palette-neutral-1000) !important;
    }
    .label-dark-400 .jimu-widget-setting--row-label {
      color: var(--ref-palette-neutral-900) !important;
    }
  }
  .label-dark-800 .jimu-widget-setting--row-label {
    color: var(--ref-palette-neutral-1100) !important;
  }
  .first-option {
    padding-top: 0.75rem;
    padding-bottom: 0.5rem;
  }
`

interface Props {
  toolConfig: ImmutableObject<ToolConfig>
  onConfigChange: (setInArray: string[], value: any) => void
}

const CustomToolConfigPopperContent = (props: Props) => {
  const { toolConfig, onConfigChange } = props
  const { toolInfo, output, option, toolUrl } = toolConfig.config as ImmutableObject<CustomToolConfig>

  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  const handleParameterChange = (parameters: AnalysisToolParam[]) => {
    onConfigChange(['config', 'toolInfo', 'parameters'], parameters)
  }

  const handleOutputChange = (output: CustomToolOutput) => {
    onConfigChange(['config', 'output'], output)
  }

  const handleOptionChange = (output: ImmutableObject<CustomToolOption>) => {
    onConfigChange(['config', 'option'], output)
  }

  const webToolServerUrl = React.useMemo(() => toolUrl.slice(0, toolUrl.lastIndexOf('/')), [toolUrl])
  const [serviceInfo, setServiceInfo] = React.useState<AnalysisServiceInfo>()
  React.useEffect(() => {
    if (toolInfo.parameters.find((p) => parameterUseFileUploadComponent(p))) {
      UtilityManager.getServiceInfo(webToolServerUrl).then(setServiceInfo)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div css={style} onKeyDown={(e) => { e.stopPropagation() }}>
      <SettingSection>
        <CollapsablePanel className='config-section' label={translate('input')} type="default" defaultIsOpen={false} aria-label={translate('input')}>
          <CustomToolInputConfig className='config-section-detail' serviceInfo={serviceInfo} parameters={toolInfo.parameters} onChange={handleParameterChange} />
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel className='config-section' label={translate('output')} type="default" defaultIsOpen={false} aria-label={translate('output')}>
          <CustomToolOutputConfig className='config-section-detail' parameters={toolInfo.parameters} output={output} toolUrl={toolUrl} onParameterChange={handleParameterChange} onOutputChange={handleOutputChange} />
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel className='config-section' label={translate('option')} type="default" defaultIsOpen={false} aria-label={translate('option')}>
          <CustomToolOptionConfig option={option} onChange={handleOptionChange} />
        </CollapsablePanel>
      </SettingSection>
    </div>
  )
}

export default CustomToolConfigPopperContent
