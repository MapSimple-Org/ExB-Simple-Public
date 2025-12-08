/** @jsx jsx */
import { React, jsx, Immutable, type ImmutableArray, type UseDataSource, hooks } from 'jimu-core'
import { useTheme } from 'jimu-theme'
import { SettingSection, SidePopper } from 'jimu-ui/advanced/setting-components'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { getStyle } from './style'
import { type Tool3D, ToolsID } from '../../constraints'

import { Daylight } from './tools/daylight'
import { Weather } from './tools/weather'
import { ShadowCast } from './tools/shadowcast'
import { LineOfSight } from './tools/lineofsight'
import { Slice } from './tools/slice'

export interface Props {
  toolsConfig: ImmutableArray<Tool3D>
  shownMode: ToolsID
  onSidePopperClose: () => void
  onSettingChanged: (toolsConfig: ImmutableArray<Tool3D>) => void
  //
  useMapWidgetIds: ImmutableArray<string>
  useDataSources: ImmutableArray<UseDataSource>
  // 508
  triggerFor508: any
}

export const SidePopperContainer = React.memo((props: Props) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const findConfigbyId = React.useCallback((toolsID: ToolsID): Tool3D => {
    const tool = props.toolsConfig.find((tool) =>
      (tool.id === toolsID)
    )

    if (tool && tool.config) {
      return tool
    } else {
      return null
    }
  }, [props.toolsConfig])

  const hanldeToolSettingChanged = React.useCallback((toolConfig: Tool3D, config: any, activedOnLoadFlag?: boolean): Tool3D => {
    const newToolsConfig = { ...toolConfig }

    if (config) {
      newToolsConfig.config = {
        ...newToolsConfig.config,
        ...config
      }
    }
    if (typeof activedOnLoadFlag !== 'undefined') {
      newToolsConfig.activedOnLoad = activedOnLoadFlag
    }

    return newToolsConfig
  }, [])

  // update AllConfig.tools
  const _onSettingChanged = props.onSettingChanged
  const onSettingChanged = React.useCallback((id, toolConfig: Tool3D) => {
    const foundIdx = props.toolsConfig.findIndex((tool) =>
      (tool.id === id)
    )

    if (foundIdx > -1) {
      //const newToolsConfig = Immutable.setIn(props.toolsConfig, [foundIdx, 'config'], config)
      const newToolsConfig = Immutable.setIn(props.toolsConfig, [foundIdx.toString()], toolConfig)
      _onSettingChanged(newToolsConfig)
    }
  }, [_onSettingChanged, props.toolsConfig])

  //const [isOpenState, setIsOpenState] = React.useState(false)
  const sidePopperTitle = translate(props.shownMode ? props.shownMode : 'tools') // Tool.id
  return (
    <React.Fragment>
      <SidePopper title={sidePopperTitle}
        css={getStyle(theme)}
        isOpen={(props.shownMode !== null)} toggle={() => { props.onSidePopperClose() }} trigger={props.triggerFor508.current}
        position="right">
        <SettingSection className='side-popper-container'>
          <div className='side-popper'>
            {props.shownMode === ToolsID.Daylight &&
              <React.Fragment>
                <Daylight
                  toolConfig={findConfigbyId(ToolsID.Daylight)}
                  hanldeToolSettingChanged={hanldeToolSettingChanged}
                  onSettingChanged={(toolConfig: Tool3D) => {
                    onSettingChanged(ToolsID.Daylight, toolConfig)
                  }}
                ></Daylight>
              </React.Fragment>
            }
            {props.shownMode === ToolsID.Weather &&
              <Weather
                toolConfig={findConfigbyId(ToolsID.Weather)}
                hanldeToolSettingChanged={hanldeToolSettingChanged}
                onSettingChanged={(toolConfig: Tool3D) => {
                  onSettingChanged(ToolsID.Weather, toolConfig)
                }}
              ></Weather>
            }
            {props.shownMode === ToolsID.ShadowCast &&
              <ShadowCast
                toolConfig={findConfigbyId(ToolsID.ShadowCast)}
                hanldeToolSettingChanged={hanldeToolSettingChanged}
                onSettingChanged={(toolConfig: Tool3D) => {
                  onSettingChanged(ToolsID.ShadowCast, toolConfig)
                }}
              ></ShadowCast>
            }
            {props.shownMode === ToolsID.LineOfSight &&
              <LineOfSight
                toolConfig={findConfigbyId(ToolsID.LineOfSight)}
                hanldeToolSettingChanged={hanldeToolSettingChanged}
                onSettingChanged={(toolConfig: Tool3D) => {
                  onSettingChanged(ToolsID.LineOfSight, toolConfig)
                }}
              ></LineOfSight>
            }
            {props.shownMode === ToolsID.Slice &&
              <Slice
                toolConfig={findConfigbyId(ToolsID.Slice)}
                hanldeToolSettingChanged={hanldeToolSettingChanged}
                onSettingChanged={(toolConfig: Tool3D) => {
                  onSettingChanged(ToolsID.Slice, toolConfig)
                }}
                //
                useMapWidgetIds={props.useMapWidgetIds}
                useDataSources={props.useDataSources}
              ></Slice>
            }
          </div>
        </SettingSection>
      </SidePopper>
    </React.Fragment>
  )
})
