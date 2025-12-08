import type { extensionSpec, IMAppConfig, ImmutableObject } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import defaultMessage from '../setting/translations/default'
import { type CustomToolConfig, ToolType, type IMConfig } from '../config'
import { getDisplayedCustomToolName } from '../utils/shared-utils'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'analysis-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const toolList = (appConfig.widgets[this.widgetId].config as IMConfig).toolList
    const hasCustomWebTool = toolList.some((tool) => tool.type === ToolType.Custom)
    const keys: extensionSpec.TranslationKey[] = []
    if (hasCustomWebTool) {
      toolList.forEach((tool, index) => {
        if (tool.type === ToolType.Custom) {
          const toolDisplayName = getDisplayedCustomToolName(tool, appConfig.utilities)
          keys.push({
            defaultValue: toolDisplayName,
            keyType: 'value',
            key: `widgets.${this.widgetId}.config.toolList[${index}].config.option.toolDisplayName`,
            label: {
              key: 'toolLabel',
              enLabel: messages.toolLabel
            },
            valueType: 'text'
          })

          const params = (tool.config as ImmutableObject<CustomToolConfig>).toolInfo.parameters
          params.forEach((param, paramIndex) => {
            keys.push({
              keyType: 'value',
              key: `widgets.${this.widgetId}.config.toolList[${index}].config.toolInfo.parameters[${paramIndex}].displayName`,
              label: {
                key: 'label',
                enLabel: messages.label
              },
              nav:{
                key: param.direction === 'esriGPParameterDirectionInput' ? 'input' : 'output',
                values: { 'layerName': toolDisplayName },
                enLabel: `${toolDisplayName}/${param.direction === 'esriGPParameterDirectionInput' ? 'Input' : 'Output'}`
              },
              valueType: 'text'
            })
          })
        }
      })
    }

    return Promise.resolve(keys)
  }
}