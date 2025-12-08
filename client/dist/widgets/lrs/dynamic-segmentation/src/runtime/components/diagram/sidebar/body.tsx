/** @jsx jsx */
import { jsx } from 'jimu-core'
import type { Track } from '../../../../config'
import { Item } from './item'

export interface BodyProps {
  width: number
  trackMap: Map<string, Track>
  onTrackChanged: (trackMap: Map<string, Track>) => void
}

export function Body (props: BodyProps) {
  const { trackMap, width, onTrackChanged } = props

  const handleTrackClicked = (track: Track, trackKey: string) => {
    const newTrackMap = new Map(trackMap)
    newTrackMap.set(trackKey, track)
    onTrackChanged(newTrackMap)
  }

  const getActiveTracks = (): string[] => {
    return [...trackMap.keys()].filter((key) => trackMap.get(key).isActive)
  }

  const getInactiveTracks = (): string[] => {
    return [...trackMap.keys()].filter((key) => !trackMap.get(key).isActive)
  }

  return (
  <div className="sidebar-body h-100" style={{ width: width }}>
    { getActiveTracks().map((trackKey) => {
      return (
        <Item
          key={trackKey}
          trackKey={trackKey}
          track={trackMap.get(trackKey)}
          onTrackClicked={handleTrackClicked}/>
      )
    })}
    { getInactiveTracks().map((trackKey) => {
      return (
        <Item
          key={trackKey}
          trackKey={trackKey}
          track={trackMap.get(trackKey)}
          onTrackClicked={handleTrackClicked}/>
      )
    })}
  </div>
  )
}
