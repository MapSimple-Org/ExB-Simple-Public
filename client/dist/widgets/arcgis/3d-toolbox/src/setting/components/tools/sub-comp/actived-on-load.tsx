/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { Switch, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../translations/default'
import type { Tool3D } from '../../../../constraints'

export interface Props {
  toolConfig: Tool3D
  onAcitvedChanged: (acitvedOnLoadFlag: boolean) => void
}

export const AcitvedOnLoad = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const _onAcitvedChanged = props.onAcitvedChanged
  const onChanged = React.useCallback((checkedFlag: boolean) => {
    _onAcitvedChanged(checkedFlag)
  }, [_onAcitvedChanged])

  return (
    <React.Fragment>
      <SettingSection>
        <SettingRow tag='label' label={translate('activedOnLoad')}>
          <Switch
            checked={props.toolConfig.activedOnLoad}
            onChange={evt => { onChanged(evt.target.checked) }}/>
        </SettingRow>
      </SettingSection>
    </React.Fragment>
  )
})
