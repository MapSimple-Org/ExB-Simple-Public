import { React, type ActionSettingProps, hooks } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { IMActionConfig } from '../config'
import defaultMessages from '../setting/translations/default'
import SelectWidgets from './components/select-widgets'

export default function ToggleWidgetsActionSetting (props: ActionSettingProps<IMActionConfig>) {
  const { actionId, widgetId, onSettingChange } = props
  const config = props.config

  const translate = hooks.useTranslation(defaultMessages)

  const handleChangeWidgets = React.useCallback((widgetIds: string[]) => {
    onSettingChange({
      actionId,
      config: config.set('widgetIds', widgetIds)
    })
  }, [actionId, config, onSettingChange])

  return <div>
    <SettingSection>
      <SettingRow label={translate('messageAction_toggleWidget')} flow='wrap'>
        <SelectWidgets
          widgetId={widgetId}
          selectedWidgetIds={config.widgetIds}
          onChange={handleChangeWidgets}
        />
      </SettingRow>
    </SettingSection>
  </div>
}
