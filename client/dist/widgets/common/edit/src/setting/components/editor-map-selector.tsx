import type { ImmutableArray } from 'jimu-core'
import { SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { IMConfig } from '../../config'

interface EditorSettingProps {
  widgetId: string
  config: IMConfig
  useMapWidgetIds: ImmutableArray<string>
  onSettingChange: SettingChangeFunction
}

const EditorSetting = (props: EditorSettingProps) => {
  const { widgetId, config, useMapWidgetIds, onSettingChange } = props

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    const newConfig = config.set('mapViewsConfig', {}).set('defaultSnapLayers', [])
    onSettingChange({
      id: widgetId,
      config: newConfig,
      useMapWidgetIds
    })
  }

  return <SettingRow>
    <MapWidgetSelector
      useMapWidgetIds={useMapWidgetIds}
      onSelect={onMapWidgetSelected}
    />
  </SettingRow>
}

export default EditorSetting
