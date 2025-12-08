/** @jsx jsx */
import { React, jsx, type IMThemeVariables } from 'jimu-core'
import { Nav } from 'jimu-ui'
import { getStyle, getPlayPanelWrapperClass, getSettingBtnsClass } from './style'

interface LayoutProps {
  flyStyleContent: React.ReactElement
  graphicInteractionManager: React.ReactElement

  liveViewSettingContent: React.ReactElement
  playStateContent: React.ReactElement
  progressBar: React.ReactElement
  speedController: React.ReactElement

  theme: IMThemeVariables
  isPlaying: boolean
  isRouteMode: boolean
  routeListContent: React.ReactElement

  isOnly1FlyModeInUse: boolean
  isAroundMapCenterMode: boolean
}

export default class BarLayout extends React.PureComponent<LayoutProps> {
  renderSeparator (): React.ReactElement {
    return <div className='separator-line' />
  }

  render (): React.ReactElement {
    return (
      <div css={getStyle(this.props.theme)} className='fly-wrapper  d-flex'>
        <Nav navbar className='bar'>
          {/* AroundMapCenterMode */}
          {this.props.isAroundMapCenterMode &&
            <div className='items d-flex flex-row justify-content-around'>
              {/* 1.flyModes selector */}
              {!this.props.isOnly1FlyModeInUse &&
                <div className={'setting-btns-wrapper items '}>
                  <div className='item'>
                    {this.props.flyStyleContent}
                    {this.renderSeparator()}
                  </div>
                </div>
              }
              {/* 2.play btn */}
              <div className='d-flex'>
                <div className='item'>
                  {this.props.playStateContent}
                </div>
              </div>
            </div>
          }

          {/* non-AroundMapCenterMode */}
          {!this.props.isAroundMapCenterMode &&
            <div className='items d-flex flex-row justify-content-around'>
              {/* 1 */}
              <div className='d-flex'>
                {/* 1.1 */}
                <div className={'setting-btns-wrapper items ' + getSettingBtnsClass(this.props.isPlaying)}>
                  {/* flyModes selector */}
                  {!this.props.isOnly1FlyModeInUse &&
                    <div className='item'>
                      {this.props.flyStyleContent}
                      {this.renderSeparator()}
                    </div>
                  }
                  {
                    !this.props.isRouteMode &&
                    <React.Fragment>
                      <div className='item'>
                        <div className='d-flex'>
                          {this.props.graphicInteractionManager}
                        </div>
                      </div>
                      <div className='item'>
                        {this.props.liveViewSettingContent}
                      </div>
                    </React.Fragment>
                  }
                  {
                    this.props.isRouteMode &&
                    <React.Fragment>
                      {this.props.graphicInteractionManager}{/* hidden but useful tools */}
                      {this.props.routeListContent}
                    </React.Fragment>
                  }
                </div>
                {/* 1.2 */}
                <div className={getPlayPanelWrapperClass(this.props.isPlaying, this.props.isOnly1FlyModeInUse)}>
                  <div className='speed-wrapper h-100'>
                    {this.props.speedController}
                  </div>
                </div>
              </div>

              {/* 2 */}
              <div className='d-flex'>
                <div className='item'>
                  {this.renderSeparator()}
                  {this.props.playStateContent}
                </div>
                {/* <div className="item">
                <Button onClick={this.highlightHelper.getPopupAndHighlightState} >
                test
                </Button>
                </div> */}
              </div>
              {/* 3 */}
              <div className={'progress-bar-wrapper ' + getPlayPanelWrapperClass(this.props.isPlaying, this.props.isOnly1FlyModeInUse)}>
                {this.props.progressBar}
              </div>
            </div>
          }
        </Nav>
      </div>
    )
  }
}
