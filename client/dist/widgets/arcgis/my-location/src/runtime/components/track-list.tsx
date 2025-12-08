/** @jsx jsx */
import { css, injectIntl, jsx, type IMThemeVariables, type IntlShape } from 'jimu-core'
import type { TracksWithLine, TrackLinePoint, TrackPoint } from '../../config'
import TrackListItem from './track-list-item'
import defaultMessages from '../translations/default'
interface ExtraProps {
  intl: IntlShape
}

type ResultType = TrackLinePoint[][] | TrackPoint[]

interface Props {
  selectedFields: string[]
  isLine: boolean
  tracks: ResultType
  theme: IMThemeVariables
  selectedIds: string []
  notFilterPointIds: number []
  tempTracksWithLine?: TracksWithLine
  onHandleSelect: (track: TrackPoint | TrackLinePoint, handle: boolean) => void
  onHandleDelete: (track: TrackPoint | TrackLinePoint) => void
}

const _TrackList = (props: Props & ExtraProps) => {
  const { selectedFields, isLine, tracks, theme, selectedIds, notFilterPointIds, tempTracksWithLine, onHandleSelect, onHandleDelete, intl } = props
  const widgetStyle = css`
    width: 100%;
    height: 100%;
    overflow: auto;
    display:flex;
    flex-direction:column;
    margin:5px auto;
    .horizontal-line{
      position: relative;
      text-align: center;
      margin: var(--sys-spacing-2) 0;
    }
    .horizontal-line::before,
    .horizontal-line::after {
      content: "";
      display: block;
      width: 30%;
      border-top: 1px solid ${theme.sys.color.divider.tertiary};
      position: absolute;
      top: 50%;
    }
    .horizontal-line::before {
      left: 0;
    }
    .horizontal-line::after {
      right: 0;
    }
    .text {
      color: var(--sys-color-surface-paper-text);
      display: inline-block;
      padding: 0 10px;
      position: relative;
      z-index: 1;
    }
    .active{
      border: 1px solid var(--sys-color-primary-main);
    }
  `

  const childTracks = (tracks: TrackLinePoint[]) => {
    return tracks.map(t => {
      if (!notFilterPointIds.includes(t.OBJECTID)) {
        return null
      }
      return (<TrackListItem key={t.OBJECTID} theme={theme} track={t} isLine={true} selectedFields={selectedFields} active={selectedIds?.includes(t.OBJECTID.toString())} onHandleSelect={onHandleSelect} onHandleDelete={onHandleDelete} ></TrackListItem>)
    })
  }

  const divideLabel = intl.formatMessage({ id: 'trackLineDivide', defaultMessage: defaultMessages.trackLineDivide })
  const trackContent = (tracks.map((t, index) => {
    if (isLine) {
      return (<div key={index} >{tracks.length > 1 && notFilterPointIds.length > 1 && !(tempTracksWithLine && index === 0) && <div className='horizontal-line'><span className='text'>{divideLabel} {tracks.length - index}</span></div>}{childTracks(t)}</div>)
    }
    if (!notFilterPointIds.includes(t.OBJECTID)) {
      return null
    }
    return (< TrackListItem key={t.OBJECTID} theme={theme} track={t} isLine={false} selectedFields={selectedFields} active={selectedIds?.includes(t.OBJECTID.toString())} onHandleSelect={onHandleSelect} onHandleDelete={onHandleDelete} ></TrackListItem >)
  }))

  return (
    <div className='track-list-items' css={widgetStyle} >
        {trackContent}
    </div >
  )
}

export default injectIntl(_TrackList)
