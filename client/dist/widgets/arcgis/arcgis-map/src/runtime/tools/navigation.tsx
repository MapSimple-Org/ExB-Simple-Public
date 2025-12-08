import { React } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import type { ToolShellProps } from '../layout/base/base-tool-shell'

export default class Navigation extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Navigation'

  getTitle () {
    return 'Navigation'
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return <NavigationInner jimuMapView={this.props.jimuMapView} mapComponentsLoaded={this.props.mapComponentsLoaded} />
  }

  /**
   * Navigation only supports scene view, so ScaleBarTool.isAvailable() will return false if the map is map view.
   */
  static isAvailable (toolShellProps: ToolShellProps): boolean {
    return toolShellProps.jimuMapView?.view?.type === '3d'
  }
}

interface NavigationInnerProps {
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
}

interface NavigationInnerState {
  apiLoaded: boolean
}

class NavigationInner extends React.PureComponent<NavigationInnerProps, NavigationInnerState> {
  navigationToggleElement: HTMLArcgisNavigationToggleElement & { view: __esri.SceneView }
  container: HTMLElement

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false
    }
  }

  onRef (ref) {
    // ref is set to null when switch active view then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateNavigationToggleElement()
  }

  componentDidUpdate () {
    this.tryUpdateNavigationToggleElement()
  }

  tryUpdateNavigationToggleElement () {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current navigationToggleElement when view changed or container changed
    if (this.navigationToggleElement) {
      if (this.navigationToggleElement.view !== currView || this.navigationToggleElement.parentNode !== this.container) {
        this.destroyNavigationToggleElement()
      }
    }

    // create new navigationToggleElement if this.navigationToggleElement is empty and this.container & currView are not empty
    if (!this.navigationToggleElement && this.props.mapComponentsLoaded && this.container && currView && currView.type === '3d') {
      this.navigationToggleElement = document.createElement('arcgis-navigation-toggle') as HTMLArcgisNavigationToggleElement & { view: __esri.SceneView }
      this.navigationToggleElement.view = currView
      this.container.appendChild(this.navigationToggleElement)

      jimuMapView.deleteJimuMapTool('Navigation')
      jimuMapView.addJimuMapTool({
        name: 'Navigation',
        instance: this.navigationToggleElement
      })
    }
  }

  destroyNavigationToggleElement() {
    if (this.navigationToggleElement) {
      // TODO: navigationToggleElement doesn't support destroy method yet
      if (typeof (this.navigationToggleElement as any).destroy === 'function') {
        (this.navigationToggleElement as any).destroy?.()
      } else {
        const parentNode = this.navigationToggleElement.parentNode

        if (parentNode) {
          parentNode.removeChild(this.navigationToggleElement)
        }
      }

      this.navigationToggleElement = null

      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Navigation')
      }
    }
  }

  componentWillUnmount () {
    this.destroyNavigationToggleElement()
  }

  render () {
    return <div className='navigation-map-tool' ref={ref => { this.onRef(ref) }} />
  }
}
