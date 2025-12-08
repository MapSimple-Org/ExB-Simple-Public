/** @jsx jsx */
import {
  React, jsx
} from 'jimu-core'
import type { Track } from '../../../../config'
import { Body } from './body'

export interface SidebarProps {
  width: number
  height: number
  trackMap: Map<string, Track>
  onTrackChanged: (trackMap: Map<string, Track>) => void
}

export function Sidebar (props: SidebarProps) {
  const { width, height, trackMap, onTrackChanged } = props

  return (
  <div
    className="sidebar d-flex"
    style={{ width: width, height: height }}>
    <Body
      trackMap={trackMap}
      width={width}
      onTrackChanged={onTrackChanged}/>
  </div>
  )
}
