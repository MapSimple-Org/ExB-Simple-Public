/** @jsx jsx */
import { zoomToUtils, type JimuMapView } from 'jimu-arcgis'
import { React, css, injectIntl, jsx, type DataSource, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { InvisibleOutlined } from 'jimu-icons/outlined/application/invisible'
import { VisibleOutlined } from 'jimu-icons/outlined/application/visible'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { Button, Tab, Tabs, Tooltip } from 'jimu-ui'
import type { TrackLine, TrackLinePoint, TracksWithLine } from '../../config'
import { getLineGraphic, getPointGraphic } from '../data-source/utils'
import defaultMessages from '../translations/default'
import TrackList from './track-list'
import TrackLineList from './trackline-list'

interface ExtraProps {
  intl: IntlShape
}

interface Props {
  jimuMapView: JimuMapView
  dataSourceId: string
  dataSource: DataSource
  lineDataSourceId: string
  lineDataSource: DataSource
  selectedFields: string[]
  selectedPointIds: string[]
  selectedLineIds: string[]
  notFilterPointIds: number[]
  notFilterLineIds: number[]
  timeOut: number
  scale: number
  theme: IMThemeVariables
  loading: boolean
  tracks: TrackLinePoint[][]
  trackLines: TrackLine[]
  tempTracksWithLine: TracksWithLine
  locationLayerVisible: boolean
  pathLayerVisible: boolean
  onHandleLineDelete: (track: TrackLinePoint, line: TrackLine, type: string) => void
  handleCurrentDataSource: (dataSourceId: string) => void
  handleLayerVisibleChange: (dataSourceIds: string[], visible: boolean, type: number) => void
}

interface State {
  activeTab: string
  showFromMap: boolean
  lineShowFromMap: boolean
  points: TrackLinePoint[]
  startTime: number
}

const widgetStyle = css`
    flex: 1 1 auto;
    width: 100%;
    overflow: auto;
    height: calc(100% - 102px);
    display:flex;
    flex-direction:column;
    .track-tab {
      height: 100%;
      width: 100%;
      ul{
        align-items: center;
        li a{
          padding: 0;
        }
      }
    }
    .track-tab-title{
      padding: var(--sys-spacing-1) 0;
      .title{
        margin-right: var(--sys-spacing-2);
      }
    }
`
class TrackLineView extends React.PureComponent<Props & ExtraProps, State> {
  trackLabel = this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })

  public refs: {
    featureContainer: HTMLButtonElement
  }

  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'track_trackline_point_ouput',
      showFromMap: true,
      lineShowFromMap: true,
      points: [],
      startTime: null
    }
  }

  handleTabsChange = (id: string) => {
    this.setState({ activeTab: id })
    if (id === 'track_trackline_point_ouput') {
      this.props.handleCurrentDataSource(this.props.dataSourceId)
    } else {
      this.props.handleCurrentDataSource(this.props.lineDataSourceId)
    }
  }

  handleSelect = (model: TrackLinePoint | TrackLine, handle: boolean, dataSource: DataSource, selectedIdsKey: string, type: string) => {
    let selIds = []
    if (handle) {
      selIds = this.props[selectedIdsKey].concat([model.OBJECTID.toString()])
      let graphic = null
      if (type === 'point') {
        graphic = getPointGraphic(model as TrackLinePoint)
      } else if (type === 'line') {
        // eslint-disable-next-line @typescript-eslint/prefer-find
        const points: TrackLinePoint[] = this.props.tracks.filter(m => m.some(n => n.LineID === model.OBJECTID))[0]
        graphic = getLineGraphic(model as TrackLine, points)
      }
      if (graphic) {
        if (this.props.jimuMapView) {
          zoomToUtils.zoomTo(this.props.jimuMapView?.view, [graphic], {
            scale: this.props.scale ?? 50000,
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10
            }
          })
        }
      }
    } else {
      selIds = this.props[selectedIdsKey].filter(m => m !== model.OBJECTID.toString())
    }
    if (dataSource) {
      dataSource.selectRecordsByIds(selIds.map(m => m.toString()))
    }
  }

  handlePointSelect = (track: TrackLinePoint, handle: boolean) => {
    this.handleSelect(track, handle, this.props.dataSource, 'selectedPointIds', 'point')
  }

  handleLineSelect = (line: TrackLine, handle: boolean) => {
    this.handleSelect(line, handle, this.props.lineDataSource, 'selectedLineIds', 'line')
  }

  handleTrackViewClick = (e) => {
    e.stopPropagation()
    this.props.handleLayerVisibleChange([this.props.dataSourceId], !this.props.locationLayerVisible, 1)
  }
  handleTrackLineViewClick = (e) => {
    e.stopPropagation()
    this.props.handleLayerVisibleChange([this.props.lineDataSourceId], !this.props.pathLayerVisible, 2)
  }

  render() {
    const visibleTitle = this.props.locationLayerVisible ? this.props.intl.formatMessage({ id: 'hideOnMap', defaultMessage: defaultMessages.hideOnMap }) : this.props.intl.formatMessage({ id: 'showOnMap', defaultMessage: defaultMessages.showOnMap })
    const tracklineTitle = this.props.intl.formatMessage({ id: 'trackLine', defaultMessage: defaultMessages.trackLine })
    const trackTitle = this.props.intl.formatMessage({ id: 'track', defaultMessage: defaultMessages.track })
    const trackTabTitleContent = (
      <div className="track-tab-title">
        <span className="title">{trackTitle}</span>
        <Tooltip title={visibleTitle} placement="bottom">
          <Button
            className='ml-auto' tag='div' icon size='sm' color='inherit' variant='text' aria-label={visibleTitle}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                this.handleTrackViewClick(e)
              }
            }}
            onClick={this.handleTrackViewClick}
          >
            {this.props.locationLayerVisible && <VisibleOutlined />}
            {!this.props.locationLayerVisible && <InvisibleOutlined />}
          </Button>
        </Tooltip>
      </div>
    )
    const trackLineTabTitleContent = (
      <div className="track-tab-title">
        <span className="title">{tracklineTitle}</span>
        <Tooltip title={visibleTitle} placement="bottom">
          <Button
            className='ml-auto' tag='div' icon size='sm' color='inherit' variant='text' aria-label={visibleTitle}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                this.handleTrackLineViewClick(e)
              }
            }}
            onClick={this.handleTrackLineViewClick}
          >
            {this.props.pathLayerVisible && <VisibleOutlined />}
            {!this.props.pathLayerVisible && <InvisibleOutlined />}
          </Button>
        </Tooltip>
      </div>
    )
    return (
      <div css={widgetStyle} >
        <Tabs type='underline' fill className={'track-tab'} defaultValue='track' value={this.state.activeTab} onChange={this.handleTabsChange}>
          <Tab id='track_trackline_point_ouput' className='w-50' title={trackTabTitleContent}>
            {this.state.activeTab === 'track_trackline_point_ouput' && this.props.tracks.length > 0 && <TrackList theme={this.props.theme} isLine={true} tracks={this.props.tracks} tempTracksWithLine={this.props.tempTracksWithLine} selectedFields={this.props.selectedFields} selectedIds={this.props.selectedPointIds} notFilterPointIds={this.props.notFilterPointIds} onHandleSelect={this.handlePointSelect} onHandleDelete={(t: TrackLinePoint) => { this.props.onHandleLineDelete(t, null, 'point') }} />}
            {this.props.tracks.length === 0 && !this.props.loading && <div className='empty-content'>
              <InfoOutlined className='info-icon' size={24} color={this.props.theme.sys.color.surface.paperHint} />
              <div className='info-txt'>{this.props.intl.formatMessage({ id: 'emptyStateText', defaultMessage: defaultMessages.emptyStateText })}</div>
            </div>}
          </Tab>
          <Tab id='track_trackline_ouput' className='w-50' title={trackLineTabTitleContent}>
            {this.state.activeTab === 'track_trackline_ouput' && this.props.trackLines.length > 0 && <TrackLineList theme={this.props.theme} trackLines={this.props.trackLines} tempTracksWithLine={this.props.tempTracksWithLine} selectedIds={this.props.selectedLineIds} notFilterPointIds={this.props.notFilterPointIds} notFilterLineIds={this.props.notFilterLineIds} onHandleSelect={this.handleLineSelect} onHandleDelete={(t: TrackLine) => { this.props.onHandleLineDelete(null, t, 'line') }} />}
            {this.props.trackLines.length === 0 && !this.props.loading && <div className='empty-content'>
              <InfoOutlined className='info-icon' size={24} color={this.props.theme.sys.color.surface.paperHint} />
              <div className='info-txt'>{this.props.intl.formatMessage({ id: 'emptyStateText', defaultMessage: defaultMessages.emptyLineStateText })}</div>
            </div>}
          </Tab>
        </Tabs>
      </div>
    )
  }
}
export default injectIntl(TrackLineView)
