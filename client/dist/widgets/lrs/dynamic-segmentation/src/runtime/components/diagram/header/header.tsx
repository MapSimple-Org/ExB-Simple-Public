/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import type { MeasureRange } from '../../../../config'
import { Controls } from './controls'
import { Ruler } from './ruler'

export interface HeaderProps {
  sidebarWidth: number
  bodyWidth: number
  contentWidth: number
  measureRange: MeasureRange
  zoom: number
  scrollPosition: number
  onZoomChange: (zoom: number) => void
  onNavForwardOrBack: (forward: boolean) => void
  onNavStartOrEnd: (end: boolean) => void
  onClickOrHover?: (e: any, clicked: boolean, hover: boolean) => void
  onDoubleClick?: (e: any) => void
}

export function Header (props: HeaderProps) {
  const {
    sidebarWidth,
    bodyWidth,
    contentWidth,
    measureRange,
    zoom,
    scrollPosition,
    onZoomChange,
    onNavForwardOrBack,
    onNavStartOrEnd,
    onClickOrHover,
    onDoubleClick
  } = props
  const [currentZoom, setCurrentZoom] = React.useState<number>(zoom)

  React.useEffect(() => {
    setCurrentZoom(zoom)
  }, [zoom])

  const handleZoomChange = React.useCallback((zoom: number) => {
    setCurrentZoom(zoom)
    onZoomChange(zoom)
  }, [onZoomChange])

  return (
  <div className="header w-100 d-flex">
    <Controls
      sidebarWidth={sidebarWidth}
      bodyWidth={bodyWidth}
      contentWidth={contentWidth}
      zoom={currentZoom}
      measureRange={measureRange}
      scrollPosition={scrollPosition}
      onZoomChange={handleZoomChange}
      onNavForwardOrBack={onNavForwardOrBack}
      onNavStartOrEnd={onNavStartOrEnd}/>
    <Ruler
      width={bodyWidth}
      range={[measureRange.from, measureRange.to]}
      zoom={currentZoom}
      scrollPosition={scrollPosition}
      onClickOrHover={onClickOrHover}
      onDoubleClick={onDoubleClick}/>
  </div>
  )
}
