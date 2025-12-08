import { React, type ActionSettingProps, Immutable, hooks, defaultMessages as jimuCoreMessages, MessageType, type UseDataSource, DataSourceTypes } from 'jimu-core'
import { Label, Radio, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingSection, SettingRow, MessageActionDataSelector } from 'jimu-ui/advanced/setting-components'
import type { IMActionConfig } from '../config'
import defaultMessages from '../setting/translations/default'
import SelectWidgets from './components/select-widgets'

const dsTypes = Immutable([
  DataSourceTypes.FeatureLayer,
  DataSourceTypes.SceneLayer,
  DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.ImageryLayer,
  DataSourceTypes.OrientedImageryLayer,
  DataSourceTypes.SubtypeGroupLayer,
  DataSourceTypes.SubtypeSublayer
])

export default function OpenWidgetsActionSetting (props: ActionSettingProps<IMActionConfig>) {
  const { actionId, widgetId, messageWidgetId, messageType, onSettingChange } = props
  const config = props.config

  const showTriggerData = [MessageType.DataRecordsSelectionChange].includes(messageType)

  const translate = hooks.useTranslation(defaultMessages, jimuCoreMessages, jimuUIMessages)

  const [useCustomData, setUseCustomData] = React.useState(config.useDataSources?.length > 0)
  const handleUseCustomData = React.useCallback((isUseCustomData: boolean) => {
    setUseCustomData(isUseCustomData)
    if (!isUseCustomData) {
      onSettingChange({
        actionId,
        config: config.set('useDataSources', [])
      })
    }
  }, [actionId, config, onSettingChange])

  const handleChangeData = React.useCallback((useDataSources: UseDataSource[]) => {
    onSettingChange({
      actionId,
      config: config.set('useDataSources', useDataSources)
    })
  }, [actionId, config, onSettingChange])

  const handleChangeWidgets = React.useCallback((widgetIds: string[]) => {
    onSettingChange({
      actionId,
      config: config.set('widgetIds', widgetIds)
    })
  }, [actionId, config, onSettingChange])

  return <div>
    {showTriggerData && <SettingSection title={translate('messageAction_TriggerData')}>
      <SettingRow>
        <Label>
          <Radio className='mr-2' checked={!useCustomData} onChange={() => { handleUseCustomData(false) }} />
          { translate('allDataWithoutCount') }
        </Label>
      </SettingRow>
      <SettingRow>
        <Label className='d-flex align-items-center label-line-height'>
          <Radio className='mr-2' checked={useCustomData} onChange={() => { handleUseCustomData(true) }} />
          { translate('custom') }
        </Label>
      </SettingRow>
      {useCustomData && <SettingRow flow='wrap'>
        <MessageActionDataSelector
          messageWidgetId={messageWidgetId}
          messageType={messageType}
          types={dsTypes}
          useDataSources={config.useDataSources}
          onChange={handleChangeData}
        />
      </SettingRow>}
    </SettingSection>}
    <SettingSection>
      <SettingRow label={translate('messageAction_openWidget')} flow='wrap'>
        <SelectWidgets
          widgetId={widgetId}
          selectedWidgetIds={config.widgetIds}
          onChange={handleChangeWidgets}
        />
      </SettingRow>
    </SettingSection>
  </div>
}
