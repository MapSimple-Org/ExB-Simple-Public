/** @jsx jsx */
import { React, jsx, type ImmutableObject, type ImmutableArray, classNames, type AppMode, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import defaultMessages from '../../translations/default'

import { type Tool3D, ToolsID, type ArrangementStyle } from '../../../constraints'

import { ToolPanel } from '../tool-panel/index'

import { DaylightOutlined } from 'jimu-icons/outlined/gis/daylight'
import { WeatherOutlined } from 'jimu-icons/outlined/gis/weather'
import { ShadowCastOutlined } from 'jimu-icons/outlined/gis/shadow-cast'
import { LineOfSightOutlined } from 'jimu-icons/outlined/gis/line-of-sight'
import { SliceOutlined } from 'jimu-icons/outlined/application/slice'

export interface Props {
  toolsConfig: ImmutableArray<Tool3D>
  findToolConfigById: (toolID: ToolsID) => ImmutableObject<Tool3D>
  useMapWidgetId: string
  jimuMapView: JimuMapView
  appMode: AppMode
  // 508
  arrangementStyle: ArrangementStyle
}

export const ListMode = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const [shownModeState, setShownModeState] = React.useState<ImmutableObject<Tool3D>>(null)
  // a11y
  const btnRefFor508 = React.useRef<HTMLElement>(null)

  const onItemClick = React.useCallback((tool: ImmutableObject<Tool3D>, evt) => {
    setShownModeState(tool)

    const target = (evt.currentTarget as HTMLElement) // 508 for back to main-list
    const btn = target.dataset.id ? target : target.parentElement
    btnRefFor508.current = btn
  }, [])

  // change ui by appMode ,#11482
  hooks.useUpdateEffect(() => {
    onBackBtnClick()
  }, [props.appMode])

  const onBackBtnClick = React.useCallback(() => {
    setShownModeState(null)
  }, [])
  React.useEffect(() => {
    if (shownModeState === null) {
      focusElementInKeyboardMode(btnRefFor508?.current) // 508 for back to main-list
    }
  }, [shownModeState])

  const _getListItem = React.useCallback((tool: ImmutableObject<Tool3D>) => {
    if (!tool.enable) {
      return null //disable
    }

    const name = translate('' + tool.id)
    let icon = null
    switch (tool.id) {
      case ToolsID.Daylight: {
        icon = <DaylightOutlined />
        break
      }
      case ToolsID.Weather: {
        icon = <WeatherOutlined />
        break
      }
      case ToolsID.ShadowCast: {
        icon = <ShadowCastOutlined />
        break
      }
      case ToolsID.LineOfSight: {
        icon = <LineOfSightOutlined />
        break
      }
      case ToolsID.Slice: {
        icon = <SliceOutlined />
        break
      }
    }

    return (
      <Button className='list-item d-flex align-items-center pl-2 py-1 my-4 w-100 jimu-outline-inside justify-content-start' type='tertiary' title={name} role='listitem'
        key={tool.id} data-id={tool.id} onClick={(evt) => { onItemClick(tool, evt) }}>
          <div className='d-flex list-item-icon mx-2'>{icon}</div>
          <div className='d-flex list-item-name'>{name}</div>
      </Button>
    )
  }, [translate, onItemClick])

  return (
    <React.Fragment>
      <div className='list-item-container border-0 d-flex h-100' role='list'>
        {<div className={classNames('main-list w-100 ', { hide: (shownModeState !== null) })}>
          {
            props.toolsConfig.map((tool) => {
              return _getListItem(tool)
            })
          }
        </div>}

        {/* Daylight */}
        {//(shownModeState?.id === ToolsID.Daylight) &&
          <ToolPanel
            mode={ToolsID.Daylight}
            toolConfig={props.findToolConfigById(ToolsID.Daylight)}
            useMapWidgetId={props.useMapWidgetId}
            jimuMapView={props.jimuMapView}

            shownModeState={shownModeState}
            isShowBackBtn={true}
            onBackBtnClick={onBackBtnClick}
            appMode={props.appMode}

            arrangementStyle={props.arrangementStyle}
          ></ToolPanel>
        }

        {/* Weather */}
        {//(shownModeState?.id === ToolsID.Weather) &&
          <ToolPanel
            mode={ToolsID.Weather}
            toolConfig={props.findToolConfigById(ToolsID.Weather)}
            useMapWidgetId={props.useMapWidgetId}
            jimuMapView={props.jimuMapView}

            shownModeState={shownModeState}
            isShowBackBtn={true}
            onBackBtnClick={onBackBtnClick}
            appMode={props.appMode}

            arrangementStyle={props.arrangementStyle}
          ></ToolPanel>
        }

        {/* ShadowCast */}
        {//(shownModeState?.id === ToolsID.ShadowCast) &&
          <ToolPanel
            mode={ToolsID.ShadowCast}
            toolConfig={props.findToolConfigById(ToolsID.ShadowCast)}
            useMapWidgetId={props.useMapWidgetId}
            jimuMapView={props.jimuMapView}

            shownModeState={shownModeState}
            isShowBackBtn={true}
            onBackBtnClick={onBackBtnClick}
            appMode={props.appMode}

            arrangementStyle={props.arrangementStyle}
          ></ToolPanel>
        }

        {/* LineOfSight */}
        {//(shownModeState?.id === ToolsID.LineOfSight) &&
          <ToolPanel
            mode={ToolsID.LineOfSight}
            toolConfig={props.findToolConfigById(ToolsID.LineOfSight)}
            useMapWidgetId={props.useMapWidgetId}
            jimuMapView={props.jimuMapView}

            shownModeState={shownModeState}
            isShowBackBtn={true}
            onBackBtnClick={onBackBtnClick}
            appMode={props.appMode}

            arrangementStyle={props.arrangementStyle}
          ></ToolPanel>
        }

        {/* Slice */}
        <ToolPanel
          mode={ToolsID.Slice}
          toolConfig={props.findToolConfigById(ToolsID.Slice)}
          useMapWidgetId={props.useMapWidgetId}
          jimuMapView={props.jimuMapView}

          shownModeState={shownModeState}
          isShowBackBtn={true}
          onBackBtnClick={onBackBtnClick}
          appMode={props.appMode}

          arrangementStyle={props.arrangementStyle}
        ></ToolPanel>
      </div>
    </React.Fragment>
  )
})
