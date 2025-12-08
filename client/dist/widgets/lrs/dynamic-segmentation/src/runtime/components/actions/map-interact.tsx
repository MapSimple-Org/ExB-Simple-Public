/** @jsx jsx */
import {
  jsx,
  hooks,
  css
} from 'jimu-core'
import type {
  DataSource,
  ImmutableObject
} from 'jimu-core'
import { CalciteAction } from 'calcite-components'
import { getTheme } from 'jimu-theme'
import defaultMessages from '../../translations/default'
import { Tooltip } from 'jimu-ui'
import type { RouteInfoFromDataAction } from '../../../config'
import type { NetworkInfo } from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'
import React from 'react'

export interface MapInteractProps {
  routeInfo: RouteInfoFromDataAction,
  networkDS: DataSource,
  networkInfo: ImmutableObject<NetworkInfo>,
  jimuMapView: JimuMapView
}

export function MapInteract (props: MapInteractProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const theme = getTheme()
  const [ toggleSyncToMap, setSyncToMapToggle] = React.useState<boolean>(true)
  const dispatch = useDynSegRuntimeDispatch()
  const { syncToMap } = useDynSegRuntimeState()

  const zoomToRange = () => {
    const isToggleOn = !toggleSyncToMap
    setSyncToMapToggle(isToggleOn)
    dispatch({ type: 'SET_SYNC_TO_MAP', value: isToggleOn })
  }

  return (
    <Tooltip
      placement='auto'
      title={getI18nMessage('mapInteractLabel')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <CalciteAction
        indicator={syncToMap}
        css={css`--calcite-action-indicator-color: ${theme.sys.color.primary.main};`}
        text={getI18nMessage('mapInteractLabel')}
        icon='browser-map'
        scale='m'
        onClick={() => { zoomToRange() }}
      />
    </Tooltip>
  )
}
