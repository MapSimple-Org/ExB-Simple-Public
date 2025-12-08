import { React, classNames, type IMRuntimeInfos, Immutable, getAppStore } from 'jimu-core'
import { MobilePanel } from 'jimu-ui'
import { WidgetRenderer } from './widget-renderer'
import { getLayoutItemId, isWidgetOpening } from '../common/layout-utils'
import type { CommonLauncherProps } from './widgets-launcher'

export interface MobileWidgetLuncherProps extends CommonLauncherProps {
  rootVisible: boolean
  containerMapId: string
}

const DefaultWidgets = Immutable({}) as IMRuntimeInfos
export const MobileWidgetLuncher = (props: MobileWidgetLuncherProps) => {
  const { rootVisible, containerMapId, onClose, widgets = DefaultWidgets, layout, onClick } = props

  const openingWidget = Object.keys(widgets).find((widgetId) => isWidgetOpening(widgets[widgetId])) ?? ''
  const title = getAppStore().getState().appConfig.widgets?.[openingWidget]?.label

  return (
    <MobilePanel
      className={classNames('mobile-widget-launcher', { 'd-none': !openingWidget })}
      mapWidgetId={containerMapId}
      title={title}
      open={!!openingWidget && rootVisible}
      keepMount={true}
      onClick={evt => { onClick(evt, openingWidget) }}
      onClose={evt => { onClose(evt, openingWidget) }}
    >
      {Object.entries(widgets).map(([id, runtimeInfo]) => {
        const opened = runtimeInfo.state !== undefined
        if (!opened) return null
        const opening = isWidgetOpening(runtimeInfo)
        const layoutId = layout?.id
        const layoutItemId = getLayoutItemId(layout, id)

        return (
          <WidgetRenderer
            key={id}
            widgetId={id}
            layoutId={layoutId}
            layoutItemId={layoutItemId}
            onClick={(evt) => { onClick(evt, id) }}
            className={classNames({ 'd-none': !opening })}
          ></WidgetRenderer>
        )
      })}
    </MobilePanel>
  )
}
