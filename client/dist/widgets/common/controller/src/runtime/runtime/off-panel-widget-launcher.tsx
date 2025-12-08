import { React, WidgetState, type IMRuntimeInfos, Immutable, css } from 'jimu-core'
import { Popper, type Placement } from 'jimu-ui'
import { WidgetRenderer } from './widget-renderer'
import { FlipVariationsOptions, OffsetYOptions, ShiftBodyOptions } from '../../common/consts'
import { getWidgetCardNode } from './utils'
import { getLayoutItemId } from '../common/layout-utils'
import type { CommonLauncherProps } from './widgets-launcher'

export interface OffPanelWidgetsLuncherProps extends CommonLauncherProps {
  root: HTMLDivElement
  placement: Placement
}

const getPopperStyle = () => {
  return css`
    border-radius: 0;
    max-width: 100vw;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, .15));
    .widget-content {
      padding: 0 !important;
    }
  `
}

const DefaultWidgets = Immutable({}) as IMRuntimeInfos
export const OffPanelWidgetsLuncher = (props: OffPanelWidgetsLuncherProps) => {
  const { widgets = DefaultWidgets, root, placement, layout, onClick, onClose } = props

  return <React.Fragment>
    {Object.entries(widgets).map(([id, runtimeInfo]) => {
      const opened = runtimeInfo.state !== undefined
      if (!opened) return null
      const opening = runtimeInfo.state !== WidgetState.Closed
      let reference = getWidgetCardNode(id)
      // no `offsetParent` means dom is hidden by style
      if (!reference || !reference.offsetParent) {
        reference = root?.querySelector('.popup-more-card') || root?.querySelector('.avatar-card')
      }
      const layoutId = layout?.id
      const layoutItemId = getLayoutItemId(layout, id)

      return <Popper
        key={id}
        autoUpdate
        css={getPopperStyle()}
        flipOptions={FlipVariationsOptions}
        shiftOptions={ShiftBodyOptions}
        offsetOptions={OffsetYOptions}
        className='off-panel-widget-launcher'
        open={opening}
        keepMount={true}
        autoFocus={opening}
        reference={reference}
        toggle={(evt, type) => { if (type === 'escape') onClose(evt, id) }}
        onClick={(evt) => { onClick(evt, id) }}
        placement={placement}>
        <WidgetRenderer widgetId={id} layoutId={layoutId} layoutItemId={layoutItemId} offPanel></WidgetRenderer>
      </Popper>
    })}
  </React.Fragment>
}
