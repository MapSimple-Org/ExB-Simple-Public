/** @jsx jsx */
import {
  React,
  type IMState,
  classNames,
  css,
  jsx,
  type AllWidgetProps,
  type AppMode,
  Immutable,
  type BrowserSizeMode
} from 'jimu-core'
import { type IMConfig, Direction, PointStyle } from '../config'
import { getNewDividerLineStyle, getDividerLinePositionStyle, getNewPointStyle } from './utils/util'
interface Props {
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  active: boolean
  /**
   * Whether the widget has ever mounted.
   */
  hasEverMount: boolean
  uri: string
}

export class Widget extends React.PureComponent<
AllWidgetProps<IMConfig> & Props
> {
  domNode: HTMLDivElement

  static mapExtraStateProps = (
    state: IMState,
    props: AllWidgetProps<IMConfig>
  ): Props => {
    let selected = false
    const selection = state.appRuntimeInfo.selection
    if (selection && state.appConfig.layouts[selection.layoutId]) {
      const layoutItem =
        state.appConfig.layouts[selection.layoutId].content[
          selection.layoutItemId
        ]
      selected = layoutItem && layoutItem.widgetId === props.id
    }
    const isInBuilder = state.appContext.isInBuilder
    const active = isInBuilder && selected

    const widgetState = state.widgetsState[props.id] || Immutable({})
    return {
      appMode: selection ? state?.appRuntimeInfo?.appMode : null,
      browserSizeMode: state?.browserSizeMode,
      active,
      hasEverMount: widgetState.hasEverMount,
      uri: state.appConfig.widgets?.[props.id]?.uri
    }
  }

  editWidgetConfig = newConfig => {
    if (!window.jimuConfig.isInBuilder) return

    const appConfigAction = this.props.builderSupportModules.jimuForBuilderLib.getAppConfigAction()
    appConfigAction.editWidgetConfig(this.props.id, newConfig).exec()
  }

  getStyle = () => {
    return css`
      & {
        height: 100%;
        width: 100%;
        box-sizing: border-box;
      }
      .divider-con {
        height: 100%;
        width: 100%;
      }
    `
  }

  render () {
    const { config, id, theme } = this.props
    const { direction, pointEnd, pointStart } = config
    const classes = classNames(
      'jimu-widget',
      'widget-divider',
      'position-relative',
      'divider-widget-' + id
    )

    const dividerLineClassName =
      direction === Direction.Horizontal ? 'horizontal' : 'vertical'
    const dividerLineStyle = getNewDividerLineStyle(config, theme)
    const dividerLinePositionStyle = getDividerLinePositionStyle(config)

    const pointStartStyle = getNewPointStyle(config, theme, true)
    const pointEndStyle = getNewPointStyle(config, theme, false)
    const dividerLineClasses = classNames(
      'divider-line',
      'position-absolute',
      dividerLineClassName,
      `point-start-${pointStart.pointStyle}`,
      `point-end-${pointEnd.pointStyle}`
    )
    return (
      <div
        className={classes}
        css={this.getStyle()}
        ref={node => { this.domNode = node }}
      >
        <div className='position-relative divider-con'>
          <div className='point-con'>
            {pointStart.pointStyle !== PointStyle.None && (
              <span
                data-testid='divider-point-start'
                className='point-start position-absolute'
                css={pointStartStyle}
              />
            )}
            {pointEnd.pointStyle !== PointStyle.None && (
              <span
                data-testid='divider-point-end'
                className='point-end position-absolute'
                css={pointEndStyle}
              />
            )}
          </div>
          <div
            data-testid='divider-line'
            className={dividerLineClasses}
            css={[dividerLineStyle, dividerLinePositionStyle]}
          />
        </div>
      </div>
    )
  }
}

export default Widget
