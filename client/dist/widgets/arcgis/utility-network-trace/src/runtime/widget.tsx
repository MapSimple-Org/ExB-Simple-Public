/** @jsx jsx */
import { React, type AllWidgetProps, jsx, lodash, type IMState, type ImmutableObject, type DataSourceJson, BaseWidget } from 'jimu-core'
import {
  JimuMapViewComponent,
  type JimuMapView
} from 'jimu-arcgis'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import type { IMConfig } from '../config'
import WidgetModel from './widget-model'
import defaultMessages from './translations/default'
import { getStyle, getFullHeight } from './lib/style'
import traceIcon from 'jimu-icons/svg/outlined/brand/widget-utility-network-trace.svg'

interface ExtraProps {
  dataSources: ImmutableObject<{ [dsId: string]: DataSourceJson }>
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig> & ExtraProps, any> {
  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      dataSources: state?.appConfig?.dataSources
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      jmv: null,
      unt: null,
      hasMapWidget: this.props.useMapWidgetIds?.length > 0,
      activeDataSource: ''
    }
  }

  containerRef = React.createRef<HTMLDivElement>()
  viewModel = WidgetModel.getInstance()

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    this.viewModel.loadPropsFromView(this.props)
    if (jimuMapView !== null) {
      if (this.state.unt) {
        if (this.state.unt !== null) {
          if (this.state.unt.viewModel.utilityNetwork !== null) {
            this.viewModel.clearAll()
            this.state.unt.destroy()
          } else {
            this.state.unt.destroy()
          }
        }
      }
      this.setState({}, async () => {
        const c = document.createElement('div')
        c.className = 'trace-container'
        this.containerRef.current.innerHTML = ''
        this.containerRef.current.appendChild(c)

        const un = await this.viewModel.loadTraceWidgetFromAPI(jimuMapView, c, this.props.dataSources)
        this.setState({ unt: un, jmv: jimuMapView, activeDataSource: jimuMapView.dataSourceId }, () => {
          this.viewModel.loadAllChildDS()
          this.viewModel.getURLVersion()
        })
      })
    } else {
      if (this.state.unt) {
        if (this.state.unt !== null) {
          if (this.state.unt.viewModel.utilityNetwork !== null) {
            this.viewModel.callResetOnJSWidget()
            this.viewModel.clearAll()
            this.state.unt.destroy()
          } else {
            this.state.unt.destroy()
          }
        } else {
          this.state.unt.destroy()
        }
      }
      this.setState({ unt: null, jmv: null })
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl?.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidUpdate = (preProps) => {
    if (window.jimuConfig.isInBuilder) {
      if (this.state.jmv !== null) {
        if (this.state.unt !== null) {
          if (this.props.config && Object.prototype.hasOwnProperty.call(this.props.config, 'configInfo')) {
            if (this.props.useMapWidgetIds?.length > 0) {
              this.setState({ unt: this.state.unt, hasMapWidget: true })
            } else {
              this.onActiveViewChange(null)
            }
          }
        }
      } else {
        this.setState({ hasMapWidget: false }, () => {
          this.viewModel.callResetOnJSWidget()
          this.viewModel.clearAll()
        })
      }
    }

    //check the trace result area settings in live and update the widget
    if (this.props.config && Object.prototype.hasOwnProperty.call(this.props.config, 'configInfo')) {
      const prevConfig = preProps.config?.configInfo?.[this.state.activeDataSource]?.traceResultAreaSettings
      const currentConfig = this.props.config?.configInfo?.[this.state.activeDataSource]?.traceResultAreaSettings
      if (prevConfig?.enableResultArea !== currentConfig?.enableResultArea ||
        !lodash.isDeepEqual(prevConfig?.resultAreaProperties, currentConfig?.resultAreaProperties)) {
        this.viewModel.updateUntProps(currentConfig?.enableResultArea, currentConfig?.resultAreaProperties, this.props.config, this.props.dataSources)
      }
    }
  }

  componentWillUnmount = () => {
    //clear flags and graphics
    this.viewModel.clearAll()
  }

  render () {
    return (
      <Paper
        shape="none"
        css={getStyle(this.props.theme, this.props.config)}
        className="jimu-widget"
      >
        <div ref={this.containerRef} css={this.state.hasMapWidget ? getFullHeight() : ''}></div>
        {this.state.hasMapWidget
          ? ''
          : <WidgetPlaceholder icon={traceIcon} message={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} />
        }
        {this.props.useMapWidgetIds?.length > 0 &&
          <JimuMapViewComponent
            useMapWidgetId={this.props.useMapWidgetIds?.[0]}
            onActiveViewChange={this.onActiveViewChange}
          />
        }
      </Paper>
    )
  }
}
