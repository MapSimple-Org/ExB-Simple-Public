/** @jsx jsx */
import { jsx, classNames } from 'jimu-core'
import type { Track } from '../../../../config'
import { Label } from 'jimu-ui'

export interface ItemProps {
  trackKey: string
  track: Track
  onTrackClicked: (track: Track, trackKey: string) => void
}

export function Item (props: ItemProps) {
  const { trackKey, track, onTrackClicked } = props

  const onItemClicked = () => {
    track.isActive = !track.isActive
    onTrackClicked(track, trackKey)
  }

  return (
  <div className={classNames('sidebar-item', track.isActive ? 'active' : 'inactive')} onClick={onItemClicked}>
    <Label
      className='label2'
      centric
      style={{ marginBottom: '0' }}>
        {track.layerName}
    </Label>
  </div>
  )
}
