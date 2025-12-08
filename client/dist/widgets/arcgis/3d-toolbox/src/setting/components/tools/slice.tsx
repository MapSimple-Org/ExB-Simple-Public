/** @jsx jsx */
import { React, jsx, type UseDataSource, type ImmutableArray, hooks } from 'jimu-core'
import { Switch, Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { Tool3D, SliceConfig } from '../../../constraints'
import { AcitvedOnLoad } from './sub-comp/actived-on-load'
import { MapPopper } from '../map-popper/map-popper'

import { EditOutlined } from 'jimu-icons/outlined/editor/edit'

export interface Props {
  toolConfig: Tool3D
  hanldeToolSettingChanged: (toolConfig: Tool3D, config: any, activedOnLoadFlag?: boolean) => Tool3D
  // cb
  onSettingChanged: (toolConfig: Tool3D) => void
  //
  useMapWidgetIds: ImmutableArray<string>
  useDataSources: ImmutableArray<UseDataSource>
}

export const Slice = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const { onSettingChanged, hanldeToolSettingChanged } = props
  const sliceConfig = props.toolConfig.config as SliceConfig

  const _onSettingChanged = React.useCallback((config: any, activedOnLoadFlag?: boolean) => {
    onSettingChanged(hanldeToolSettingChanged(props.toolConfig, config, activedOnLoadFlag))
  }, [props.toolConfig,
    onSettingChanged, hanldeToolSettingChanged])

  // map-popper
  const [shownMapPopperState, setShownMapPopperState] = React.useState<boolean>(false)
  hooks.useUnmount(() => {
    setShownMapPopperState(false)
  })
  const onShowMapPopperChange = React.useCallback((isShow: boolean) => {
    setShownMapPopperState(isShow)
  }, [])

  return (
  <React.Fragment>
    <SettingSection className='first-setting-section'>
      {/* tiltEnabled */}
      <SettingRow tag='label' label={translate('tiltEnabled')} role='group' aria-label={translate('tiltEnabled')}>
        <Switch
          checked={sliceConfig.tiltEnabled}
          onChange={evt => { _onSettingChanged({ tiltEnabled: evt.target.checked }) }}/>
      </SettingRow>

      {/* excludeGroundSurface */}
      <SettingRow tag='label' label={translate('excludeGroundSurface')} role='group' aria-label={translate('excludeGroundSurface')}>
        <Switch
          checked={sliceConfig.excludeGroundSurface}
          onChange={evt => { _onSettingChanged({ excludeGroundSurface: evt.target.checked }) }}/>
      </SettingRow>

      {/* default slice */}
      <SettingRow label={translate('defaultSlice')} role='group' aria-label={translate('defaultSlice')}>
        <Button type='tertiary' icon={true}
          onClick={() => { setShownMapPopperState(true) }}
          aria-label={translate('defaultSlice')}
          >{<EditOutlined />}
        </Button>
      </SettingRow>
      {shownMapPopperState && <MapPopper
        isShowMapPopper={shownMapPopperState}
        onShowMapPopperChange={onShowMapPopperChange}

        useDataSources={props.useDataSources}
        useMapWidgetIds={props.useMapWidgetIds}
        specifiedJimuMapId={'3d-toolbox-map-popper'}
        //pageMode={this.state.pageMode}
        //
        toolConfig={props.toolConfig}
        onPresetAnalysisChange={config => { _onSettingChanged(config) }}
      />
      }
    </SettingSection>

    {/* acitvedOnLoad */}
    <AcitvedOnLoad
      toolConfig={props.toolConfig}
      onAcitvedChanged={checkedFlag => { _onSettingChanged(null, checkedFlag) }}
    ></AcitvedOnLoad>
  </React.Fragment>
  )
})
