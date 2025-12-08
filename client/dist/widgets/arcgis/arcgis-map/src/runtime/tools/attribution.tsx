import { React } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'

export default class Attribution extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Attribution'

  static getIsNeedSetting () {
    return false
  }

  getTitle () {
    return 'Attribution'
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return <AttributionInner jimuMapView={this.props.jimuMapView} />
  }
}

interface AttributionInnerProps {
  jimuMapView: JimuMapView
}

interface AttributionInnerState {
  apiLoaded: boolean
}

class AttributionInner extends React.PureComponent<AttributionInnerProps, AttributionInnerState> {
  Attribution: typeof __esri.Attribution = null
  AttributionBtn: __esri.Attribution
  container: HTMLElement

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false
    }
  }

  componentDidMount () {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/widgets/Attribution']).then(modules => {
        [this.Attribution] = modules
        this.setState({
          apiLoaded: true
        })
      })
    }
  }

  componentDidUpdate (prevProps: AttributionInnerProps) {
    if (this.state.apiLoaded && this.container) {
      if (prevProps.jimuMapView && this.props.jimuMapView && (prevProps.jimuMapView.id !== this.props.jimuMapView.id)) {
        if (this.AttributionBtn && !this.AttributionBtn.destroy) {
          this.AttributionBtn.view = this.props.jimuMapView.view
          this.AttributionBtn.renderNow()

          this.props.jimuMapView.addJimuMapTool({
            name: 'Attribution',
            instance: this.AttributionBtn
          })
        }
      } else {
        this.AttributionBtn = new this.Attribution({
          container: this.container,
          view: this.props.jimuMapView.view
        })

        this.props.jimuMapView.deleteJimuMapTool('Attribution')
        this.props.jimuMapView.addJimuMapTool({
          name: 'Attribution',
          instance: this.AttributionBtn
        })
      }
    }
  }

  componentWillUnmount () {
    if (this.AttributionBtn) {
      this.AttributionBtn.destroy()
      this.AttributionBtn = null
      this.props.jimuMapView.deleteJimuMapTool('Attribution')
    }
  }

  render () {
    return <div className='attribution-map-tool' style={{ position: 'relative' }} ref={ref => { this.container = ref }} />
  }
}
