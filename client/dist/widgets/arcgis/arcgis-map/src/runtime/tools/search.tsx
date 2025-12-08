/** @jsx jsx */
import { React, css, jsx, getAppStore } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
import { defaultMessages } from 'jimu-ui'

export default class Search extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Search'

  getTitle () {
    return this.props.intl.formatMessage({ id: 'SearchLabel', defaultMessage: defaultMessages.SearchLabel })
  }

  getIcon (): IconType {
    return {
      icon: require('../assets/icons/search.svg')
    }
  }

  getExpandPanel (): React.JSX.Element {
    if (this.props.isMobile) {
      return (
        <div style={{ position: 'relative', width: '100%', minHeight: '32px' }}>
          <SearchInner jimuMapView={this.props.jimuMapView} mapWidgetId={this.props.mapWidgetId} mapComponentsLoaded={this.props.mapComponentsLoaded} isMobile={this.props.isMobile} />
        </div>
      )
    } else {
      return (
        // The natural length of Search is 283px.
        <div style={{ position: 'relative', width: '283px', minHeight: '32px' }}>
          <SearchInner jimuMapView={this.props.jimuMapView} mapWidgetId={this.props.mapWidgetId} mapComponentsLoaded={this.props.mapComponentsLoaded} isMobile={this.props.isMobile} />
        </div>
      )
    }
  }
}

interface SearchInnerProps {
  jimuMapView: JimuMapView
  mapWidgetId: string
  mapComponentsLoaded: boolean
  isMobile: boolean
}

interface SearchInnerState {
  apiLoaded: boolean
}

class SearchInner extends React.PureComponent<SearchInnerProps, SearchInnerState> {
  Portal: typeof __esri.Portal
  reactiveUtils: __esri.reactiveUtils
  searchElement: HTMLArcgisSearchElement & { view: __esri.MapView | __esri.SceneView }
  container: HTMLElement
  popupEnabledWatchHandle: __esri.Handle

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false
    }
  }

  getStyle () {
    const style = this.props.isMobile ? 'height: 32px;' : 'height: 48px; padding: 0px 16px 16px 16px;'

    return css`
      arcgis-search {
        /* Use height and overflow to avoid arcgis-search flickering during initialization */
        ${style}
        width: 100%;
      }
    `
  }

  componentDidMount () {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/portal/Portal', 'esri/core/reactiveUtils']).then(modules => {
        [this.Portal, this.reactiveUtils] = modules
        this.setState({
          apiLoaded: true
        })
      })
    }
  }

  onRef(ref) {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateSearchElement()
  }

  componentDidUpdate () {
    this.tryUpdateSearchElement()
  }

  tryUpdateSearchElement() {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current searchElement when view changed or container changed
    if (this.searchElement) {
      if (this.searchElement.view !== currView || this.searchElement.parentNode !== this.container) {
        this.destroySearchElement()
      }
    }

    // create new searchElement if this.searchElement is empty and this.container & currView are not empty
    if (!this.searchElement && this.props.mapComponentsLoaded && this.state.apiLoaded && this.container && currView) {
      this.searchElement = document.createElement('arcgis-search') as HTMLArcgisSearchElement & { view: __esri.MapView | __esri.SceneView }
      this.searchElement.view = currView
      this.searchElement.portal = new this.Portal({
        url: getAppStore().getState().portalUrl
      })
      this.searchElement.position = 'manual'
      this.container.appendChild(this.searchElement)

      this.updateSearchPopupEnabled()

      if (currView) {
        this.popupEnabledWatchHandle = this.reactiveUtils.watch(() => currView?.popupEnabled, () => {
          this.updateSearchPopupEnabled()
        })
      }

      jimuMapView.deleteJimuMapTool('Search')
      jimuMapView.addJimuMapTool({
        name: 'Search',
        instance: this.searchElement
      })
    }
  }

  updateSearchPopupEnabled() {
    if (this.searchElement) {
      const mapView = this.searchElement.view

      if (mapView) {
        this.searchElement.popupDisabled = !mapView.popupEnabled
      }
    }
  }

  destroySearchElement() {
    if (this.searchElement) {
      this.searchElement.destroy()
      this.searchElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Search')
      }
    }

    this.releasePopupEnabledWatchHandle()
  }

  releasePopupEnabledWatchHandle () {
    if (this.popupEnabledWatchHandle) {
      this.popupEnabledWatchHandle.remove()
      this.popupEnabledWatchHandle = null
    }
  }

  componentWillUnmount () {
    this.destroySearchElement()
  }

  render () {
    const apiLoaded = this.props.mapComponentsLoaded && this.state.apiLoaded

    return (
      <div css={this.getStyle()} className='w-100 search-map-tool' ref={ref => { this.onRef(ref) }}>
        {!apiLoaded && <div className='exbmap-basetool-loader' />}
      </div>
    )
  }
}
