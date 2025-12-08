/** @jsx jsx */
import { React, jsx } from 'jimu-core'
//import {  defaultMessages as jimuUIMessages } from 'jimu-ui'
//import defaultMessages from '../../translations/default'
//import { SymbolSelector, JimuSymbolType, SymbolSelectorCreatedDescriptor } from 'jimu-ui/advanced/map'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { Tool3D } from '../../../constraints'
import { AcitvedOnLoad } from './sub-comp/actived-on-load'

export interface Props {
  toolConfig: Tool3D
  hanldeToolSettingChanged: (toolConfig: Tool3D, config: any, activedOnLoadFlag?: boolean) => Tool3D
  // cb
  onSettingChanged: (toolConfig: Tool3D) => void
}

export const LineOfSight = React.memo((props: Props) => {
  //const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const { onSettingChanged, hanldeToolSettingChanged } = props
  const _onSettingChanged = React.useCallback((config: any, activedOnLoadFlag?: boolean) => {
    onSettingChanged(hanldeToolSettingChanged(props.toolConfig, config, activedOnLoadFlag))
  }, [props.toolConfig,
    onSettingChanged, hanldeToolSettingChanged])

  return (
  <React.Fragment>
    <SettingSection className='first-setting-section'>
      <SettingRow>
        {/* <SymbolSelector
          jimuSymbolType={JimuSymbolType.Point}
          symbol={pointSymbolState}
          //btnSize={btnSize}
          //isShowPreviewBtn={isShowPreviewBtn}
          onPointSymbolChanged={handlePointSymbolChanged}
        ></SymbolSelector> */}
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
