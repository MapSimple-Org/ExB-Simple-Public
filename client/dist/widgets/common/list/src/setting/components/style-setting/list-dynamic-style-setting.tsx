/** @jsx jsx */
import { jsx, React, DynamicStyleType, Immutable } from 'jimu-core'
import type { ImmutableArray, UseDataSource, IMDynamicStyleTypes, ImmutableObject, IMDynamicStyleConfig } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { IMConfig, Status, CardConfig } from '../../../config'
import { useEffect, useState, useRef } from 'react'
import { DynamicStyleBuilderSwitch } from 'jimu-ui/advanced/dynamic-style-builder'

interface Props {
  id: string
  config: IMConfig
  status: Status
  useDataSources: ImmutableArray<UseDataSource>
  onSettingChange: SettingChangeFunction
  onSettingChangeAndUpdateUsedFieldsOfDs: (config?: IMConfig) => void
}

const LIST_CONDITION_DYNAMIC_STYLE_OPTIONS: IMDynamicStyleTypes = Immutable([
  DynamicStyleType.Background,
  DynamicStyleType.Border
])

const LIST_ARCADE_DYNAMIC_STYLE_OPTIONS: IMDynamicStyleTypes = Immutable([
  DynamicStyleType.Background,
  DynamicStyleType.Border,
  DynamicStyleType.BorderRadius
])

const DynamicStyleSetting = (props: Props) => {
  const cardConfigRef = useRef(null as ImmutableObject<CardConfig>)
  const { id, useDataSources, config, status, onSettingChange, onSettingChangeAndUpdateUsedFieldsOfDs } = props

  const [cardConfig, setCardConfig] = useState(null as ImmutableObject<CardConfig>)

  useEffect(() => {
    const cardConfig = config.cardConfigs?.[status]
    setCardConfig(cardConfig)
    cardConfigRef.current = cardConfig
  }, [config, status])

  const onDynamicStyleSwitchChange = (_event, isChecked: boolean) => {
    if (!isChecked) {
      clearDynamicStyleConfigWhenUnchecked()
    } else {
      const newCardConfig = cardConfigRef.current.set('enableDynamicStyle', isChecked)
      const newConfig = config.setIn(['cardConfigs', status], newCardConfig)
      onSettingChange({
        id: id,
        config: newConfig
      })
    }
  }

  const clearDynamicStyleConfigWhenUnchecked = () => {
    let newCardConfig = cardConfigRef.current
    const hasDynamicStyleConfig = newCardConfig?.dynamicStyleConfig && Object.keys(newCardConfig?.dynamicStyleConfig).length > 0
    if (hasDynamicStyleConfig) {
      newCardConfig = newCardConfig.set('dynamicStyleConfig', Immutable({})).set('enableDynamicStyle', false)
    } else {
      newCardConfig = newCardConfig.set('enableDynamicStyle', false)
    }
    confirmChangeDynamicStyleConfig(newCardConfig)
  }

  const onDynamicStyleBuilderConfigChange = (dynamicStyleConfig: IMDynamicStyleConfig) => {
    const newCardConfig = cardConfigRef.current.set('dynamicStyleConfig', dynamicStyleConfig)
    confirmChangeDynamicStyleConfig(newCardConfig)
  }

  const confirmChangeDynamicStyleConfig = (newCardConfig: ImmutableObject<CardConfig>) => {
    const newConfig = config.setIn(['cardConfigs', status], newCardConfig)
    onSettingChangeAndUpdateUsedFieldsOfDs(newConfig)
  }

  return (
    <div className='dynamic-style-setting w-100'>
      <DynamicStyleBuilderSwitch
        widgetId={id}
        useDataSources={useDataSources}
        expressions={[]}
        widgetDynamicContentCapability='none'
        hideConditionIndicatorCustomAttributeDsViewSelector={true}
        hideConditionIndicatorCustomStatistics={true}
        useIconsForArcade={false}
        config={cardConfigRef.current?.dynamicStyleConfig}
        conditionStyleTypes={LIST_CONDITION_DYNAMIC_STYLE_OPTIONS}
        arcacdeStyleTypes={LIST_ARCADE_DYNAMIC_STYLE_OPTIONS}
        switchChecked={!!cardConfig?.enableDynamicStyle}
        onChange={onDynamicStyleBuilderConfigChange}
        onSwitchChange={onDynamicStyleSwitchChange}
      />
    </div>
  )
}
export default DynamicStyleSetting