/** @jsx jsx */
import { React, classNames, css, injectIntl, jsx, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { DownFilled } from 'jimu-icons/filled/directional/down'
import { RightFilled } from 'jimu-icons/filled/directional/right'
import { CloseCircleOutlined } from 'jimu-icons/outlined/editor/close-circle'
import { Button, Tooltip } from 'jimu-ui'
import type { TrackLine } from '../../config'
import { SELECTED_LINE_FIELDS } from '../../constants'
import defaultMessages from '../translations/default'
import { formatContent } from '../utils/common/util'
import { getInitSchema } from '../data-source/utils'
interface ExtraProps {
  intl: IntlShape
}

interface Props {
  track: TrackLine
  theme: IMThemeVariables
  active: boolean
  onHandleSelect: (track: TrackLine, handle: boolean) => void
  onHandleDelete: (track: TrackLine) => void
}

interface State {
  open: boolean
}

class TrackListItem extends React.PureComponent<Props & ExtraProps, State> {
  public refs: {
    featureContainer: HTMLInputElement
  }

  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
  }

  getStyle () {
    return css`
    border: 1px solid ${this.props.theme.sys.color.divider.tertiary};
    padding: 3px;
    width: 100%;
    display:flex;
    justify-content: space-between;
    flex-direction: column;
    cursor: pointer ;
    .head{
        width: 100%;
        font-weight: var(--ref-typeface-font-weight-medium);
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
    .active{
      border: 1px solid ${this.props.theme.sys.color.action.default};
    }
    .props{
      display:flex;
      flex-direction:column;
      .prop{
          margin-top:2px;
          display:flex;
          justify-content: flex-start;
          vertical-align:middle
          .attr{
              line-height:18px;
              font-weight: var(--ref-typeface-font-weight-regular);
          }
          .val{
              margin-left: 5px;
          }
      }
    }
`
  }

  handleSel (t: TrackLine) {
    this.props.onHandleSelect(t, !this.props.active)
  }

  render () {
    const allFieldsSchema = getInitSchema(this.props.intl, '', 'trackline')
    const fields = allFieldsSchema?.fields
    const t = this.props.track
    const open = this.state.open
    return (
            <div className={'track-item' + (this.props.active ? ' active' : '')} key={t.EndTime} css={this.getStyle()} onClick={() => { this.handleSel(t) }} >
                <div className='head' >
                    <div className='title' >
                        <Button
                            aria-label={this.props.intl.formatMessage({ id: open ? 'collapse' : 'expand' })}
                            className={classNames('p-0 jimu-outline-inside', { expanded: open })}
                            color='inherit'
                            variant='text'
                            icon
                            size='sm'
                            onClick={(e) => { e.stopPropagation(); this.setState({ open: !open }) }}
                        >
                            {open ? <DownFilled size='s' /> : <RightFilled size='s' autoFlip />}
                        </Button>
                        <div className='time'>{formatContent(this.props.intl, 'EndTime', t.EndTime)}</div>
                    </div>

                    <Tooltip title={this.props.intl.formatMessage({ id: 'delTrack', defaultMessage: defaultMessages.delTrack })} placement='right'>
                        <Button className='ml-auto' icon size='sm' color='inherit' variant='text' onClick={(e) => { e.stopPropagation(); this.props.onHandleDelete(t) }} aria-label={this.props.intl.formatMessage({ id: 'delTrack', defaultMessage: defaultMessages.delTrack })}>
                            <CloseCircleOutlined size={16} />
                        </Button>
                    </Tooltip>
                </div>
                {open && <div className='props'>
                    {SELECTED_LINE_FIELDS.map(pro => {
                      return <div className='prop' key={pro}>
                            <div className='attr'>{fields[pro]?.alias}:</div>
                            <div className='val'>{formatContent(this.props.intl, pro, t[pro])}</div>
                        </div>
                    })
                    }
                </div>}
            </div>
    )
  }
}
export default injectIntl(TrackListItem)
