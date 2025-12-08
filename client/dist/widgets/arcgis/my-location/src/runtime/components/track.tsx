/** @jsx jsx */
import { MapViewManager, zoomToUtils, type JimuMapView } from 'jimu-arcgis'
import { React, css, injectIntl, jsx, type DataSource, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { InvisibleOutlined } from 'jimu-icons/outlined/application/invisible'
import { VisibleOutlined } from 'jimu-icons/outlined/application/visible'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { Button, Tooltip } from 'jimu-ui'
import type { TrackLinePoint, TrackPoint } from '../../config'
import { getPointGraphic } from '../data-source/utils'
import defaultMessages from '../translations/default'
import TrackList from './track-list'
interface ExtraProps {
  intl: IntlShape
}
interface Props {
  dataSourceId: string
  dataSource: DataSource
  selectedFields: string []
  scale: number
  theme: IMThemeVariables
  tracks: TrackPoint []
  loading: boolean
  layerVisible: boolean
  jimuMapView: JimuMapView
  selectedIds: string[]
  notFilterPointIds: number[]
  onHandleDelete: (track: TrackPoint) => void
  handleLayerVisibleChange: (dataSourceIds: string[], visible: boolean, type: number) => void
}

class TrackTab extends React.PureComponent<Props & ExtraProps> {
  trackLabel = this.props.intl.formatMessage({ id: 'trackLabel', defaultMessage: defaultMessages.trackLabel })
  mvManager: MapViewManager = MapViewManager.getInstance()

  public refs: {
    featureContainer: HTMLInputElement
  }

  widgetStyle = css`
  flex: 1 1 auto;
  width:100%;
  display:flex;
  flex-direction:column;
  align-items: flex-start;
  overflow: auto;
  .track-head{
    padding: var(--sys-spacing-1) 0;
    display:flex;
    align-items:center;
    justify-content: flex-start;
    .track-name{
      margin-right: var(--sys-spacing-2);
      font-size: var(--sys-typography-font-size);
      font-weight:  var(--ref-typeface-font-weight-regular);
    }
    .visible-icon{
      height:16px;
      width:16px;
      margin-left: 5px;
      cursor: pointer;
    }
  }
`

  handleSelect = (track: TrackPoint | TrackLinePoint, handle: boolean) => {
    let selIds = []
    if (handle) {
      selIds = this.props.selectedIds.concat([track.OBJECTID.toString()])
      let graphic = null
      graphic = getPointGraphic(track)
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
      selIds = this.props.selectedIds.filter(m => m !== track.OBJECTID.toString())
    }

    if (this.props.dataSource) {
      this.props.dataSource.selectRecordsByIds(selIds.map(m => m.toString()))
    }
  }

  render () {
    const visibleTitle = this.props.layerVisible ? this.props.intl.formatMessage({ id: 'hideOnMap', defaultMessage: defaultMessages.hideOnMap }) : this.props.intl.formatMessage({ id: 'showOnMap', defaultMessage: defaultMessages.showOnMap })
    return (
      <div className={'track-content'} css={this.widgetStyle} >
        <div className='track-head'>
          <div className='track-name'>{this.trackLabel}</div>
          <Tooltip title={visibleTitle} placement='bottom'>
            <Button className='ml-auto' icon size='sm' color='inherit' variant='text' onClick={() => { this.props.handleLayerVisibleChange([this.props.dataSourceId], !this.props.layerVisible, 1) }} aria-label={visibleTitle}>
              {this.props.layerVisible && <VisibleOutlined />}
              {!this.props.layerVisible && <InvisibleOutlined />}
            </Button>
          </Tooltip>
        </div>

        {this.props.tracks.length > 0 && <TrackList theme={this.props.theme} tracks={this.props.tracks} isLine={false} selectedFields={this.props.selectedFields} onHandleSelect={this.handleSelect} onHandleDelete={this.props.onHandleDelete} selectedIds={this.props.selectedIds} notFilterPointIds={this.props.notFilterPointIds} />}
        {this.props.tracks.length === 0 && !this.props.loading && <div className='empty-content'>
          <InfoOutlined className='info-icon' size={24} color={this.props.theme.sys.color.surface.paperHint} />
          <div className='info-txt'>{this.props.intl.formatMessage({ id: 'emptyStateText', defaultMessage: defaultMessages.emptyStateText })}</div>
        </div>
        }

      </div >
    )
  }
}
export default injectIntl(TrackTab)
