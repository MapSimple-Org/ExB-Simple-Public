/** @jsx jsx */
import { React, jsx, Immutable, type ImmutableObject, type IMState, ReactRedux } from 'jimu-core'
import { useTheme } from 'jimu-theme'
import type { JimuMapView } from 'jimu-arcgis'
import { type Tool3D, type ToolsID, ArrangementStyle } from '../../../constraints'

import { ListMode } from './list-mode'
import { IconMode } from './icon-mode'
import { getStyle } from './style'
import type { IMConfig } from '../../../config'

export interface ArrangeStylesRef {
  updateWidgets
  destroyWidgets
}

export interface Props {
  config: IMConfig
  useMapWidgetId: string
  jimuMapView: JimuMapView
}

export const ArrangeStyles = React.memo((props: Props) => {
  const theme = useTheme()
  const appModeState = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode)

  function findToolConfigById (toolID: ToolsID): ImmutableObject<Tool3D> {
    return Immutable(props.config.tools.find((tool) =>
      (tool.id === toolID)
    ))
  }

  return (
    <div className='h-100' css={getStyle(theme)}>
      {(props.config.arrangement.style === ArrangementStyle.List) &&
        <ListMode
          toolsConfig={props.config.tools}
          findToolConfigById={findToolConfigById}
          useMapWidgetId={props.useMapWidgetId}
          jimuMapView={props.jimuMapView}
          appMode={appModeState}

          arrangementStyle={props.config.arrangement.style }
        ></ListMode>
      }

      {(props.config.arrangement.style === ArrangementStyle.Icon) &&
        <IconMode
          direction={props.config.arrangement.direction}
          toolsConfig={props.config.tools}
          findToolConfigById={findToolConfigById}
          useMapWidgetId={props.useMapWidgetId}
          jimuMapView={props.jimuMapView}
          appMode={appModeState}
        ></IconMode>
      }
    </div>
  )
})
