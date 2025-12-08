/** @jsx jsx */
import { React, css, injectIntl, jsx, type IMThemeVariables, type IntlShape } from 'jimu-core'
import type { TracksWithLine, TrackLine } from '../../config'
import TrackLineListItem from './trackline-list-item'
interface ExtraProps {
  intl: IntlShape
}

interface Props {
  trackLines: TrackLine []
  tempTracksWithLine: TracksWithLine
  theme: IMThemeVariables
  selectedIds: string []
  notFilterLineIds: number []
  onHandleSelect: (track: TrackLine, handle: boolean) => void
  onHandleDelete: (track: TrackLine) => void
}

class TrackLineList extends React.PureComponent<Props & ExtraProps> {
  public refs: {
    featureContainer: HTMLInputElement
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  widgetStyle = css`
      width: 100%;
      height: 100%;
      overflow: auto;
      display:flex;
      flex-direction:column;
      margin:5px auto;
      .track-item{
          border: 1px solid ${this.props.theme.sys.color.divider.tertiary};
          padding: 3px;
          margin: 5px auto;
          width: 100%;
          display:flex;
          justify-content: space-between;
          flex-direction: column;
          .head{
              width: 100%;
              font-weight: var(--ref-typeface-font-weight-medium);
              color: var(--ref-palette-black);
              display:flex;
              justify-content: space-between;
              .title{
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  .arrow-icon{
                      height: 8px;
                      width: 8px;
                      cursor: pointer;
                  }
                  .time{
                      font-size: var(--sys-typography-title2-font-size);
                      font-weight: var(--ref-typeface-font-weight-medium);
                      margin-left:5px;
                  }
              }
              .del-icon{
                  height: 16px;
                  width: 16px;
                  cursor: pointer;
              }
          }
          .props{
              display:flex;
              flex-direction:column;
              margin-left: 22px;
              .prop{
                  margin-top:2px;
                  display:flex;
                  justify-content: flex-start;
                  vertical-align:middle;
                  .attr{
                      line-height:18px;
                  }
                  .val{
                      margin-left: 5px;
                  }
              }
          }
      }
      .active{
        border: 1px solid ${this.props.theme.sys.color.action.default};
      }
  `

  render () {
    const trackContent = (this.props.trackLines.map((t, index) => {
      if (this.props.tempTracksWithLine) {
        if (t.OBJECTID === this.props.tempTracksWithLine.line.OBJECTID) {
          return null
        }
      }
      if (!this.props.notFilterLineIds.includes(t.OBJECTID)) {
        return null
      }
      return (< TrackLineListItem key={index} theme={this.props.theme} track={t} active={this.props.selectedIds?.includes(t.OBJECTID.toString())} onHandleSelect={this.props.onHandleSelect} onHandleDelete={this.props.onHandleDelete} ></TrackLineListItem >)
    }))

    return (
        <div className='track-list-items' css={this.widgetStyle} >
            {trackContent}
        </div >
    )
  }
}
export default injectIntl(TrackLineList)
