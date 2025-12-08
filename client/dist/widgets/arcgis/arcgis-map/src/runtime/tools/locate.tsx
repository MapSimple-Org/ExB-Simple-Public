/** @jsx jsx */
import { React, css, jsx, LocationChangeMessage, MessageManager } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import type { ArcgisLocateCustomEvent } from '@arcgis/map-components'
import type { IPoint } from '@esri/arcgis-rest-request'

export default class Locate extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Locate'

  getTitle () {
    return 'Locate'
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return <LocateInner mapWidgetId={this.props.mapWidgetId} jimuMapView={this.props.jimuMapView} mapComponentsLoaded={this.props.mapComponentsLoaded} />
  }
}

interface LocateInnerProps {
  mapWidgetId: string
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
}

class LocateInner extends React.PureComponent<LocateInnerProps, any> {
  locateElement: HTMLArcgisLocateElement & { view: __esri.View }
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
    this.tryUpdateLocateElement()
  }

  componentDidUpdate () {
    this.tryUpdateLocateElement()
  }

  tryUpdateLocateElement() {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current locateElement when view changed or container changed
    if (this.locateElement) {
      if (this.locateElement.view !== currView || this.locateElement.parentNode !== this.container) {
        this.destroyLocateElement()
      }
    }

    // create new locateElement if this.locateElement is empty and this.container & currView are not empty
    if (!this.locateElement && this.props.mapComponentsLoaded && this.container && currView) {
      this.locateElement = document.createElement('arcgis-locate') as HTMLArcgisLocateElement & { view: __esri.View }
      this.locateElement.view = currView
      this.locateElement.addEventListener('arcgisSuccess', this.onLocateArcgisSuccess)
      this.container.appendChild(this.locateElement)

      jimuMapView.deleteJimuMapTool('Locate')
      jimuMapView.addJimuMapTool({
        name: 'Locate',
        instance: this.locateElement
      })
    }
  }

  onLocateArcgisSuccess = (evt: ArcgisLocateCustomEvent<{position: GeolocationPosition;}>) => {
    const coords = evt?.detail?.position?.coords

    if (coords) {
      const { longitude, latitude } = coords
      const point: IPoint = {
        x: longitude,
        y: latitude,
        spatialReference: { wkid: 4326 }
      }
      const message = new LocationChangeMessage(this.props.mapWidgetId, point)
      MessageManager.getInstance().publishMessage(message)
    }
  }

  destroyLocateElement() {
    if (this.locateElement) {
      this.locateElement.removeEventListener('arcgisSuccess', this.onLocateArcgisSuccess)
      this.locateElement.destroy()
      this.locateElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Locate')
      }
    }
  }

  componentWillUnmount () {
    this.destroyLocateElement()
  }

  getStyle () {
    return css`
      .esri-widget--button {
        appearance: none !important;
      }
    `
  }

  render () {
    return <div className='locate-map-tool' css={this.getStyle()} ref={ref => { this.onRef(ref) }} />
  }
}
