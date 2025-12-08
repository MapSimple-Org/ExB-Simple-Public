/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { Switch, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import type { IMConfig, GeneralConfig } from '../../config'

export interface Props {
  config: IMConfig
  onGeneralSettingChanged: (generalConfig: GeneralConfig) => void
}

export const GeneralSetting = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const handGeneralSettingChanged = (type: 'zoomToLayer' | 'applyFilterOnDs', evt: React.ChangeEvent<HTMLInputElement>) => {
    const _config = props.config.setIn(['general', type], evt.target.checked)
    props.onGeneralSettingChanged(_config.general)
  }

  return (
    <SettingSection title={translate('generalSetting')} aria-label={translate('generalSetting')} >
      {/* 1 Zoom to layer on selection */}
      <SettingRow tag='label' label={translate('zoomToLayer')}>
        <Switch checked={props.config.general.zoomToLayer}
          onChange={(evt) => { handGeneralSettingChanged('zoomToLayer', evt) }}
        />
      </SettingRow>
      {/* 2 Apply filter on data sources */}
      <SettingRow tag='label' label={translate('applyFilterOnDs')}>
        <Switch checked={props.config.general.applyFilterOnDs}
          onChange={(evt) => { handGeneralSettingChanged('applyFilterOnDs', evt) }}
        />
      </SettingRow>
    </SettingSection>
  )
})
