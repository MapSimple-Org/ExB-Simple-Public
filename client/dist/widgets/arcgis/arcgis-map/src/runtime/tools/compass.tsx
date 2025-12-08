import { React } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import { defaultMessages } from 'jimu-ui'

export default class Compass extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Compass'

  getTitle () {
    return this.props.intl.formatMessage({ id: 'CompassLabel', defaultMessage: defaultMessages.CompassLabel })
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return <CompassInner jimuMapView={this.props.jimuMapView} mapComponentsLoaded={this.props.mapComponentsLoaded} />
  }
}

interface CompassInnerProps {
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
}

class CompassInner extends React.PureComponent<CompassInnerProps, any> {
  compassElement: HTMLArcgisCompassElement & { view: __esri.View }
  container: HTMLElement

  constructor (props) {
    super(props)
    this.state = {}
  }

  onRef(ref) {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateCompassElement()
  }

  componentDidUpdate () {
    this.tryUpdateCompassElement()
  }

  tryUpdateCompassElement() {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current compassElement when view changed or container changed
    if (this.compassElement) {
      if (this.compassElement.view !== currView || this.compassElement.parentNode !== this.container) {
        this.destroyCompassElement()
      }
    }

    // create new compassElement if this.compassElement is empty and this.container & currView are not empty
    if (!this.compassElement && this.props.mapComponentsLoaded && this.container && currView) {
      this.compassElement = document.createElement('arcgis-compass') as HTMLArcgisCompassElement & { view: __esri.View }
      this.compassElement.view = currView
      this.container.appendChild(this.compassElement)

      jimuMapView.deleteJimuMapTool('Compass')
      jimuMapView.addJimuMapTool({
        name: 'Compass',
        instance: this.compassElement
      })
    }
  }

  destroyCompassElement() {
    if (this.compassElement) {
      const view = this.compassElement.view

      if (view && !view.destroyed) {
        this.compassElement.destroy()
      } else {
        // If view is destroyed, calling this.compassElement.destroy() will throw error. In this case, use parentNode.removeChild(this.compassElement) as workaround.
        if (this.compassElement.parentNode) {
          this.compassElement.parentNode.removeChild(this.compassElement)
        }
      }

      this.compassElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Compass')
      }
    }
  }

  componentWillUnmount () {
    this.destroyCompassElement()
  }

  render () {
    return <div className='compass-map-tool' ref={ref => { this.onRef(ref) }} />
  }
}
