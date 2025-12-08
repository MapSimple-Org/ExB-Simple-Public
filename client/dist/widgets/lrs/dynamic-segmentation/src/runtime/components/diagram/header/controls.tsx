/** @jsx jsx */
import { hooks, jsx } from 'jimu-core'
import { CalciteIcon } from 'calcite-components'
import defaultMessages from '../../../translations/default'
import { Tooltip } from 'jimu-ui'
import type { MeasureRange } from 'widgets/lrs/dynamic-segmentation/src/config'

export interface ControlsProps {
  sidebarWidth: number
  bodyWidth: number
  contentWidth: number
  zoom: number
  measureRange: MeasureRange
  scrollPosition: number
  onZoomChange: (zoom: number) => void
  onNavForwardOrBack: (forward: boolean) => void
  onNavStartOrEnd: (end: boolean) => void
}

export function Controls (props: ControlsProps) {
  const { sidebarWidth, zoom, measureRange, scrollPosition, onZoomChange, onNavForwardOrBack, onNavStartOrEnd } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  const handleZoomOut = () => {
    if (zoom / 2 < 1) {
      onZoomChange(1)
    } else {
      onZoomChange(zoom / 2)
    }
  }

  const handleZoomIn = () => {
    // Keep in sync with ruler.tsx
    const scale = measureRange.to - measureRange.from
    const zoomUnit = zoom * (sidebarWidth / scale)
    const scrollPos = scrollPosition / zoom
    const minRange = scrollPos * zoom / zoomUnit
    const maxRange = (scrollPos * zoom + sidebarWidth) / zoomUnit
    const length = maxRange - minRange
    if (length < 1) {
      onZoomChange(zoom)
    } else {
      onZoomChange(zoom * 2)
    }
  }

  const handleNavBack = () => {
    onNavForwardOrBack(false)
  }

  const handleNavForward = () => {
    onNavForwardOrBack(true)
  }

  const handleNavStart = () => {
    onNavStartOrEnd(false)
  }

  const handleNavEnd = () => {
    onNavStartOrEnd(true)
  }

  return (
  <div className="sidebar-header d-flex" style={{ width: sidebarWidth }}>
    <Tooltip
      placement='auto'
      title={getI18nMessage('navStart')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <div className="sidebar-icon">
        <CalciteIcon
          icon="chevron-start"
          scale="m"
          textLabel={getI18nMessage('navStart')}
          onClick={handleNavStart}/>
      </div>
    </Tooltip>
    <Tooltip
      placement='auto'
      title={getI18nMessage('navBack')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <div className="sidebar-icon">
        <CalciteIcon
          icon="chevron-left"
          scale="m"
          textLabel={getI18nMessage('navBack')}
          onClick={handleNavBack}/>
      </div>
    </Tooltip>
    <Tooltip
      placement='auto'
      title={getI18nMessage('zoomOut')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <div className="sidebar-icon">
        <CalciteIcon
          icon="minus-circle"
          scale="m"
          textLabel={getI18nMessage('zoomOut')}
          onClick={handleZoomOut} />
      </div>
    </Tooltip>
    <Tooltip
      placement='auto'
      title={getI18nMessage('zoomIn')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <div className="sidebar-icon">
        <CalciteIcon
        icon="plus-circle"
        scale="m"
        textLabel={getI18nMessage('zoomIn')}
        onClick={handleZoomIn} />
      </div>
    </Tooltip>
    <Tooltip
      placement='auto'
      title={getI18nMessage('navForward')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <div className="sidebar-icon">
        <CalciteIcon
        icon="chevron-right"
        scale="m"
        textLabel={getI18nMessage('navForward')}
        onClick={handleNavForward}/>
      </div>
    </Tooltip>
    <Tooltip
      placement='auto'
      title={getI18nMessage('navEnd')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <div className="sidebar-icon">
        <CalciteIcon
        icon="chevron-end"
        scale="m"
        textLabel={getI18nMessage('navEnd')}
        onClick={handleNavEnd}/>
      </div>
    </Tooltip>
  </div>
  )
}
