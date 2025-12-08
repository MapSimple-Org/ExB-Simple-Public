/** @jsx jsx */
import { React, jsx, type IMThemeVariables } from 'jimu-core'
import { getStyle, getPlayPanelWrapperClass, getFunctionalBtnsClass } from './style'

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

  isInController: boolean
}

export default class PaletteLayout extends React.PureComponent<LayoutProps> {
  render (): React.ReactElement {
    return (
      <div css={getStyle(this.props.theme)} className='fly-wrapper  d-flex'>
        <div className={'palette-wrapper ' + (this.props.isInController ? 'm-2 ' : ' ') + (this.props.isAroundMapCenterMode ? 'around-map-center' : '')}>
          {/* AroundMapCenterMode */}
          {this.props.isAroundMapCenterMode &&
            <React.Fragment>
              {/* 1.flyModes selector */}
              {!this.props.isOnly1FlyModeInUse &&
                <div>
                  {this.props.flyStyleContent}
                </div>
              }
              {/* 2.play btn */}
              {this.props.playStateContent}
            </React.Fragment>
          }

          {/* non-AroundMapCenterMode */}
          {!this.props.isAroundMapCenterMode &&
             <div className={'palette-wrapper ' + (this.props.isOnly1FlyModeInUse ? 'only-1-fly-item' : '')}>
              <div className={'progress-bar-wrapper' + getPlayPanelWrapperClass(this.props.isPlaying)}>
                {this.props.progressBar}
              </div>

              <div className={getFunctionalBtnsClass(this.props.isPlaying)}>
                {this.props.flyStyleContent}

                {!this.props.isRouteMode &&
                  <React.Fragment>
                    {this.props.graphicInteractionManager}
                    {this.props.liveViewSettingContent}
                  </React.Fragment>
                }
                {this.props.isRouteMode &&
                  <React.Fragment>
                    {this.props.graphicInteractionManager}
                    {this.props.routeListContent}
                  </React.Fragment>
                }
              </div>

              {this.props.playStateContent}

              <div className={getPlayPanelWrapperClass(this.props.isPlaying)}>
                {this.props.speedController}
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}
