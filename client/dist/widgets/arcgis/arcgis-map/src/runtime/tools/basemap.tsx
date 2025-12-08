import { React, css, classNames } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
import { defaultMessages } from 'jimu-ui'
import { basemapUtils } from 'jimu-arcgis'

export default class BaseMap extends BaseTool<BaseToolProps, unknown> {
  toolName = 'BaseMap'

  getTitle () {
    return this.props.intl.formatMessage({ id: 'BaseMapLabel', defaultMessage: defaultMessages.BaseMapLabel })
  }

  getIcon (): IconType {
    return {
      icon: require('../assets/icons/basemap.svg')
    }
  }

  getExpandPanel (): React.JSX.Element {
    return <BaseMapInner jimuMapView={this.props.jimuMapView} isMobile={this.props.isMobile} mapComponentsLoaded={this.props.mapComponentsLoaded} />
  }
}

interface BaseMapInnerProps {
  jimuMapView: JimuMapView
  isMobile: boolean
  mapComponentsLoaded: boolean
}

interface BaseMapInnerState {
  apiLoaded: boolean
  sourceLoaded: boolean
}

class BaseMapInner extends React.PureComponent<BaseMapInnerProps, BaseMapInnerState> {
  BasemapGalleryViewModel: typeof __esri.BasemapGalleryViewModel
  LocalBasemapsSource: typeof __esri.LocalBasemapsSource
  basemapGalleryElement: HTMLArcgisBasemapGalleryElement & { view: __esri.View }
  orgBasemaps: __esri.Basemap[] // includes both 2D basemaps and 3D basemaps
  container: HTMLElement
  __unmount = false

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false,
      sourceLoaded: false
    }
  }

  componentDidMount () {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/widgets/BasemapGallery/support/LocalBasemapsSource', 'esri/widgets/BasemapGallery/BasemapGalleryViewModel']).then(modules => {
        if (this.__unmount) {
          return
        }

        [this.LocalBasemapsSource, this.BasemapGalleryViewModel] = modules
        this.setState({
          apiLoaded: true
        })
      })
    }

    if (!this.state.sourceLoaded) {
      basemapUtils.getOrgBasemaps().then((basemaps: __esri.Basemap[]) => {
        if (this.__unmount) {
          return
        }

        this.orgBasemaps = basemaps
        this.setState({
          sourceLoaded: true
        })
      }).catch(err => {
        console.error(`load basemap gallery source error: ${err}`)
      })
    }
  }

  onRef(ref) {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateBasemapGalleryElement()
  }

  componentDidUpdate () {
    this.tryUpdateBasemapGalleryElement()
  }

  tryUpdateBasemapGalleryElement() {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    if (this.props.mapComponentsLoaded && this.state.apiLoaded && this.state.sourceLoaded && this.container && currView) {
      // ready to create/update basemapGalleryElement

      // destroy current basemapGalleryElement when container changed
      if (this.basemapGalleryElement) {
        if (this.basemapGalleryElement.parentNode !== this.container) {
          this.destroyBasemapGalleryElement()
        }
      }

      if (this.basemapGalleryElement) {
        if (this.basemapGalleryElement.view !== currView) {
          // update basemapGalleryElement if view changed
          this.basemapGalleryElement.view = currView
          this.basemapGalleryElement.source = this.getFinalBasemapGallerySource(this.orgBasemaps, currView)
        }
      } else {
        // create new basemapGalleryElement
        this.basemapGalleryElement = document.createElement('arcgis-basemap-gallery') as HTMLArcgisBasemapGalleryElement & { view: __esri.View }
        this.basemapGalleryElement.view = currView
        this.container.appendChild(this.basemapGalleryElement)

        this.basemapGalleryElement.source = this.getFinalBasemapGallerySource(this.orgBasemaps, currView)
        jimuMapView.deleteJimuMapTool('BaseMap')
        jimuMapView.addJimuMapTool({
          name: 'BaseMap',
          instance: this.basemapGalleryElement
        })
      }
    } else {
      // not ready to create/update basemapGalleryElement element
      this.destroyBasemapGalleryElement()
    }
  }

  getFinalBasemapGallerySource (orgBasemaps: __esri.Basemap[], view: __esri.MapView | __esri.SceneView): __esri.LocalBasemapsSource {
    let finalBasemaps: __esri.Basemap[] = []

    if (view) {
      // orgBasemaps includes both 2D basemaps and 3D basemaps.
      if (view.type === '2d') {
        // MapView only supports 2D basemaps, doesn't support 3D basemaps.
        finalBasemaps = orgBasemaps.filter(basemap => !basemapUtils.isBasemap3D(basemap))
      } else {
        // SceneView supports 2D basemaps and 3D basemaps.
        finalBasemaps = orgBasemaps.slice()
      }

      // insert originalBasemap into finalBasemaps
      const originalBasemap: __esri.Basemap = (view.map as any).originalBasemap || view.map.basemap
      const basemapGalleryViewModel = new this.BasemapGalleryViewModel({ view: view })

      if (originalBasemap && basemapGalleryViewModel) {
        const isOriginalBasemapIncluded = finalBasemaps.some(item => basemapGalleryViewModel.basemapEquals(originalBasemap, item))

        if (!isOriginalBasemapIncluded) {
          // If originalBasemap.thumbnailUrl is null, use map.thumbnailUrl as originalBasemap.thumbnailUrl.
          if (!originalBasemap.thumbnailUrl) {
            const thumbnailUrl = (view.map as any)?.thumbnailUrl

            if (thumbnailUrl) {
              originalBasemap.thumbnailUrl = thumbnailUrl
            }
          }

          finalBasemaps.unshift(originalBasemap)
        }
      }
    }

    const source = new this.LocalBasemapsSource({
      basemaps: finalBasemaps
    })

    return source
  }

  destroyBasemapGalleryElement() {
    if (this.basemapGalleryElement) {
      this.basemapGalleryElement.destroy()
      this.basemapGalleryElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('BaseMap')
      }
    }
  }

  componentWillUnmount () {
    this.__unmount = true
    this.destroyBasemapGalleryElement()
  }

  getStyle () {
    const style = this.props.isMobile ? 'width: 100%; max-width: none; max-height: none; overflow-y: auto;' : 'width: 250px;'

    return css`
      min-height: 32px;
      position: relative;
      ${style}

      arcgis-basemap-gallery {
        width: 100%;
      }
    `
  }

  render () {
    const apiLoaded = this.props.mapComponentsLoaded && this.state.apiLoaded
    const style = this.getStyle()

    return (
      <div
        ref={ref => { this.onRef(ref) }}
        className={classNames('basemap-map-tool', { 'exbmap-ui-pc-expand-maxheight': !this.props.isMobile })}
        css={style}
      >
        {!apiLoaded && <div className='exbmap-basetool-loader' />}
      </div>
    )
  }
}
