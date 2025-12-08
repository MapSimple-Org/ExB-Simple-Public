/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { Switch, Label, Radio, defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type Tool3D, type ShadowCastConfig, ShadowCastVisType } from '../../../constraints'
import { AcitvedOnLoad } from './sub-comp/actived-on-load'

export interface Props {
  toolConfig: Tool3D
  hanldeToolSettingChanged: (toolConfig: Tool3D, config: any, activedOnLoadFlag?: boolean) => Tool3D
  // cb
  onSettingChanged: (toolConfig: Tool3D) => void
}

export const ShadowCast = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const { onSettingChanged, hanldeToolSettingChanged } = props
  const _onSettingChanged = React.useCallback((config: any, activedOnLoadFlag?: boolean) => {
    onSettingChanged(hanldeToolSettingChanged(props.toolConfig, config, activedOnLoadFlag))
  }, [props.toolConfig,
    onSettingChanged, hanldeToolSettingChanged])

  const _onDefaultAnalysisTypeChanged = React.useCallback((type: ShadowCastVisType, checked: boolean) => {
    if (checked) {
      _onSettingChanged({
        ...props.toolConfig.config,
        ...{ visType: type }
      })
    }
  }, [_onSettingChanged, props.toolConfig])

  const shadowCastConfig = props.toolConfig.config as ShadowCastConfig
  return (
  <React.Fragment>
    <SettingSection className='first-setting-section'>
      <div role='group' aria-label={translate('defaultAnalysisType')} className='mb-4'>
        <SettingRow label={translate('defaultAnalysisType')}></SettingRow>
        <SettingRow>
          <div className='d-block shadow-cast-radios'>
            <div className='d-flex align-items-center mb-2'>
              <Label className='d-flex align-items-center'>
                <Radio
                  name='defaultAnalysisType'
                  className='mr-2'
                  checked={shadowCastConfig.visType === ShadowCastVisType.Threshold}
                  onChange={(evt, checked) => { _onDefaultAnalysisTypeChanged(ShadowCastVisType.Threshold, checked) }}
                />
                {translate(ShadowCastVisType.Threshold)}
              </Label>
            </div>
            <div className='d-flex align-items-center mb-2'>
              <Label className='d-flex align-items-center'>
                <Radio
                  name='defaultAnalysisType'
                  className='mr-2'
                  checked={shadowCastConfig.visType === ShadowCastVisType.Duration}
                  onChange={(evt, checked) => { _onDefaultAnalysisTypeChanged(ShadowCastVisType.Duration, checked) }}
                />
                {translate(ShadowCastVisType.Duration)}
              </Label>
            </div>
            <div className='d-flex align-items-center'>
              <Label check className='d-flex align-items-center'>
                <Radio
                  name='defaultAnalysisType'
                  className='mr-2'
                  checked={shadowCastConfig.visType === ShadowCastVisType.Discrete}
                  onChange={(evt, checked) => { _onDefaultAnalysisTypeChanged(ShadowCastVisType.Discrete, checked) }}
                />
                {translate('discreteShadow')}
              </Label>
            </div>
          </div>
        </SettingRow>
      </div>

      <SettingRow tag='label' label={translate('timezoneSelector')}>
        <Switch
          checked={shadowCastConfig.timezone}
          onChange={evt => { _onSettingChanged({ timezone: evt.target.checked }) }}/>
      </SettingRow>

      <SettingRow tag='label' label={translate('dateSelector')}>
        <Switch
          checked={shadowCastConfig.datePicker}
          onChange={evt => { _onSettingChanged({ datePicker: evt.target.checked }) }}/>
      </SettingRow>
    </SettingSection>

    {/* acitvedOnLoad */}
    <AcitvedOnLoad
      toolConfig={props.toolConfig}
      onAcitvedChanged={checkedFlag => { _onSettingChanged(null, checkedFlag) }}
    ></AcitvedOnLoad>
  </React.Fragment>
  )
})
