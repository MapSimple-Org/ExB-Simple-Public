/** @jsx jsx */
import { React, jsx, type AllWidgetProps, ReactResizeDetector, type IMState, classNames, utils, SessionManager } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Button, Loading, LoadingType, WidgetPlaceholder } from 'jimu-ui'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import esriRequest from 'esri/request'
import Point from 'esri/geometry/Point'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import Graphic from 'esri/Graphic'
import Polygon from 'esri/geometry/Polygon'
import Extent from 'esri/geometry/Extent'
import Multipoint from 'esri/geometry/Multipoint'
import SpatialReference from 'esri/geometry/SpatialReference'
import Polyline from 'esri/geometry/Polyline'
import Layer from 'esri/layers/Layer'
import WMTSLayer from 'esri/layers/WMTSLayer'
import VectorTileLayer from 'esri/layers/VectorTileLayer'
import WMSLayer from 'esri/layers/WMSLayer'
import KMLLayer from 'esri/layers/KMLLayer'
import Query from 'esri/rest/support/Query'
import * as execute from 'esri/rest/query'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import ProjectParameters from 'esri/rest/support/ProjectParameters'
import * as geometryEngine from 'esri/geometry/geometryEngine'
import FeatureForm from 'esri/widgets/FeatureForm'
import Camera from 'esri/Camera'
import Mesh from 'esri/geometry/Mesh'
import * as geometryService from 'esri/rest/geometryService'
import FieldElement from 'esri/form/elements/FieldElement'
import FormTemplate from 'esri/form/FormTemplate'
import IdentityManager from 'esri/identity/IdentityManager'
import * as Projection from 'esri/geometry/projection'

import { getStyle } from './assets/style'
import oiIcon from 'jimu-icons/svg/outlined/brand/oriented-imagery.svg'

interface State {
  selectedOIC: string
  config: any
  OICname: string
  showLoading: boolean
  mapLoaded: boolean
  defaultImage: string //#9678 issue fix
  defaultPoint: __esri.Geometry //#9678 issue fix
}

interface Props {
  pointBool: boolean
  oiApiLoaded: boolean
}

const GEOMETRY_SERVICE_URL = utils.getGeometryService() //#9677 issue fix
const SYMBOLS = ['diamond', 'x', 'circle', 'simple-line'] //#9677 issue fix

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & Props, State> {
  mapView: any
  orientedViewer: any
  distanceSelector: any
  activeSourcePointSymbol: { type: string, size: number, style: string, color: number[], outline: any }
  sourcePointSymbol: { type: string, size: number, style: string, color: number[], outline: any }
  polygonSymbol: { type: string, style: string, outline: any, color: number[] }
  activePolygonSymbol: { type: string, style: string, outline: any, color: number[] }
  diamondSymbol: { type: string, size: number, style: string, color: number[], outline: any }
  crossSymbol: { type: string, size: number, style: string, color: number[], outline: { color: number[], width: number, style: string } }
  coverageMapSymbol: { type: string, style: string, outline: any, color: number[] }
  currentImagePoint: any
  // selectLocationFlag: boolean = true
  displayImageInViewFlag: boolean = true
  graphicsLayer: GraphicsLayer //#9677 issue fix
  graphicExists: boolean
  imageProperties: any
  activeImageID: any
  coveragePolygons: any[]
  config: any
  overviewLayer: any
  oicList: string[]
  vectorLayers: any[]
  featureSelected: any
  selectedGraphicProperties: any
  hidePopup: any
  preserveToken: any = { token: '', server: '' }
  selectedAsset: any
  WMSF: number
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  currentImageCameraLocation: any | __esri.Multipoint | __esri.Polyline
  layerVisibleStatus: { g: any[], b: any[], o: any[] }
  zoomHandlers: any[]
  activeFrustumSymbol: any
  frustumSymbol: any
  coverageFrustums: any
  mapViewState: any
  imagePointCheck: boolean = false
  currentCoverageCheck: boolean = true
  similarCoverageCheck: boolean = false
  allCoverageCheck: boolean = false
  coverageFlag = { imagePoints: false, similarCoverage: false, currentCoverage: true, allCoverage: true }
  sceneViewFlag: boolean = false
  imageInViewFlag: boolean
  selectedPoint: any
  selectedExposurePoint: { geometry: any, id: any }
  avgGroundElevation: any
  clickEvent: any
  mapClickEventHandler: any
  mapAddLayerHandler: any
  mapPopupHandler1: any
  mapPopupHandler2: any
  greenLineSymbol: { type: string, width: number, style: string, color: number[] }
  oiviewerRef: any
  selectBtnRef: any
  apiLocalState: boolean = false
  serviceUrl: string = ''
  pointAndPolygonGraphics: { points: any, polygons: any } //#9677 issue fix
  geometryService: __esri.geometryService //#9678 issue fix
  zoomToImageExtent: boolean = false //#9678 issue fix
  pointAndFrustumGraphics: { points: any, frustums: any } //#9677 issue fix

  constructor (props) {
    super(props)
    this.state = {
      selectedOIC: '',
      config: {},
      OICname: '',
      showLoading: true,
      mapLoaded: false
    } as State
    //#1000
    this.oiviewerRef = React.createRef()
    this.selectBtnRef = React.createRef()
  }

  nls = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id
  }

  isConfigured = () => {
    // console.log(this.props.useMapWidgetIds);
    return this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    if (jimuMapView) {
      this.mapView = jimuMapView.view
      this.setState({
        mapLoaded: true
      })
      if (!this.state.config) {
        this.setState({
          config: {
            oic: []
          }
        })
      }
      //this.loadOrientedImageryApi(); //#1000
      this.setupSymbols()

      if (this.graphicsLayer) {
        if (this.mapView.type === '2d') {
          // document.getElementById('3dmode').style.display = 'none';
          // this.graphicsLayer = new this.GraphicsLayer({
          //   id: "oi-graphicsLayer",
          //   title: "Oriented Imagery",
          //   elevationInfo: { mode: "on-the-ground", Offset: 0 }
          // } as any);
          this.graphicsLayer.elevationInfo = { mode: 'on-the-ground', offset: 0 }
          this.orientedViewer?.setEnvironment('2D') //#818
        } else {
          // document.getElementById('3dmode').style.display = 'inline-block';
          // this.graphicsLayer = new this.GraphicsLayer({
          //   id: "oi-graphicsLayer",
          //   title: "Oriented Imagery",
          //   elevationInfo: { mode: "absolute-height", Offset: 0 }
          // } as any);
          this.graphicsLayer.elevationInfo = { mode: 'absolute-height', offset: 0 }
          //#818
          this.orientedViewer?.setHeightModelInfo({ heightModel: this.mapView.heightModelInfo?.heightModel, heightUnit: this.mapView.heightModelInfo?.heightUnit }) // #670 issue
          this.orientedViewer?.setEnvironment('3D')
        }
      } else {
        if (this.mapView.type === '2d') {
          this.graphicsLayer = new GraphicsLayer({
            // id: "oi-graphicsLayer",
            title: this.nls('_widgetLabel'),
            elevationInfo: { mode: 'on-the-ground', offset: 0 }
          } as any)
          this.orientedViewer?.setEnvironment('2D') //#818
        } else {
          this.graphicsLayer = new GraphicsLayer({
            // id: "oi-graphicsLayer",
            title: this.nls('_widgetLabel'),
            elevationInfo: { mode: 'absolute-height', offset: 0 }
          } as any)
          //#818
          this.orientedViewer?.setHeightModelInfo({ heightModel: this.mapView.heightModelInfo?.heightModel, heightUnit: this.mapView.heightModelInfo?.heightUnit }) // #670 issue
          this.orientedViewer?.setEnvironment('3D')
        }
      }

      if (this.mapView.map.findLayerById(this.graphicsLayer.id)) {
        this.mapView.map.remove(this.graphicsLayer)
      }
      this.mapView.map.add(this.graphicsLayer)

      if (this.mapView) {
        this.mapView.cursor = this.props.pointBool ? 'crosshair' : 'default '//issue 249
      }

      this.mapClickEventHandler = this.mapView.on('click', this.mapClickEvent.bind(this))
      // #9677
      this.mapAddLayerHandler = this.mapView.map.layers.on('after-add', () => {
        this.mapView.map.reorder(this.graphicsLayer, this.mapView.map.layers.length - 1)
      })
      this.mapPopupHandler1 = reactiveUtils.watch(() => this.mapView.popup?.selectedFeature, this.graphicSelected.bind(this))
      this.mapPopupHandler2 = reactiveUtils.watch(() => this.mapView.popup?.visible, (visible) => {
        if (!visible && this.featureSelected) {
          this.orientedViewer.deselectFeaturesInImage(this.featureSelected)
          if (document.getElementById('viewGraphicBtn')) document.getElementById('viewGraphicBtn').style.display = 'none'
        }
      })

      if (this.overviewLayer) {
        if (!this.mapView.map.findLayerById(this.overviewLayer.id)) {
          this.mapView.map.add(this.overviewLayer)
          this.overviewLayer.visible = this.coverageFlag.allCoverage
        }
      }

      // //issue #610
      // this.mapView.map.layers.on("after-add", () => {
      //   this.mapView.map.reorder(this.graphicsLayer, this.mapView.map.layers.length - 1);
      // });
    }
  }

  componentDidMount () {
    this.selectBtnRef?.current?.classList.add('hide')
    this.setState({
      config: {
        oic: []
      }
    })
    this.oicList = []
    if (SessionManager.getInstance().getMainSession()?.token) {
      if (!this.preserveToken.token) this.preserveToken.token = SessionManager.getInstance().getMainSession().token
      if (!this.preserveToken.server) this.preserveToken.server = this.props.portalUrl
    }
    IdentityManager.on('credential-create', (user) => {
      // this.preserveToken = {};  //#1072 #1120
      if (!this.preserveToken.token) this.preserveToken.token = user.credential.token
      if (!this.preserveToken.server) this.preserveToken.server = user.credential.server
    })
  }

  componentDidUpdate (prevProps) {
    //#1000

    if (this.props.state !== 'CLOSED') {
      if (this.mapView && !this.apiLocalState) {
        this.loadOrientedImageryApi()
        this.loadOIC()
      }
      if (this.props.config.oicList?.length && !this.overviewLayer && this.mapView) this.loadOIC()
      else if (this.props.config.oicList?.length && this.overviewLayer && this.mapView) {
        if (this.props.pointBool === prevProps.pointBool) {
          if (this.overviewLayer.fullExtent.spatialReference.wkid === this.mapView.spatialReference.wkid &&
          (!geometryEngine.intersects(this.mapView.extent, this.overviewLayer.fullExtent) ||
            geometryEngine.within(this.overviewLayer.fullExtent, this.mapView.extent))) { this.mapView.goTo(this.overviewLayer.fullExtent) }
        }
      }

      //checking if the api is loaded by checking for link sheets
      //this code updates the viewer theme based on themes changing in build mode
      if (document.querySelectorAll('link[id="orientedImagery-web-dark"').length > 0) {
        if (this.props.theme.sys.color.mode === 'dark') (window as any).orientedImagery.setTheme('dark')
        else (window as any).orientedImagery.setTheme('light')
      }
    }
    //#9678 issue fix
    if (this.props.oiApiLoaded) {
      if (this.state.defaultImage || this.state.defaultPoint) {
        this.state.defaultPoint
          ? this.searchImages(this.selectedPoint, this.state.defaultImage)
          : this.showImage(this.mapView.extent.center.clone(), this.state.defaultImage)
      }
    }
  }

  componentWillUnmount () {
    this.mapClickEventHandler?.remove()
    this.mapAddLayerHandler?.remove()
    this.mapPopupHandler1?.remove()
    this.mapPopupHandler2?.remove()
    //#7151
    this.mapView?.map.remove(this.graphicsLayer)
    this.mapView?.map.remove(this.overviewLayer)
  }

  loadOIC = () => {
    //const oic = this.state.selectedOIC ? this.state.selectedOIC : this.props.config.oicList.length > 0 ? this.props.config.oicList[0].url : ''
    const oic = this.props.config.oicList.length > 0 ? this.props.config.oicList[0].url : ''
    if (oic) {
      this.oicList = []
      this.oicList.push(oic)
    }
    if (window.location.href.includes('oic=')) {
      let v = window.location.href.split('oic=')[1]
      v = v.split('&')[0]
      const p = v.split('/home/item.html?id=')[0]
      const id = v.split('/home/item.html?id=')[1]
      if (v && p && id) {
        //this.oicList[0] = (this.props.portalUrl + '/sharing/rest/content/items/' + v.split('&')[0])
        this.oicList[0] = (p + '/sharing/rest/content/items/' + id)
      }
    }

    this.addOICItem(this.oicList[0])
  }

  layerModuleSelector = (url) => {
    Layer.fromArcGISServerUrl({
      url: url,
      properties: {
        visible: false
      }
    }).then((layerObject) => {
      //layerObject.spatialReference = this.mapView.spatialReference;
      layerObject.load().then((loaded) => {
        //#776
        if (this.overviewLayer) {
          this.mapView.map.remove(this.overviewLayer)
          this.overviewLayer = null
        }
        this.overviewLayer = layerObject
        this.overviewLayer.minScale = Math.max(50000, 300 * Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance)) //issue 619
        this.mapView.map.add(this.overviewLayer)

        if (this.overviewLayer.fullExtent.spatialReference.wkid === this.mapView.spatialReference.wkid &&
          (!geometryEngine.intersects(this.mapView.extent, this.overviewLayer.fullExtent) ||
            geometryEngine.within(this.overviewLayer.fullExtent, this.mapView.extent))) {
          this.mapView.goTo(this.overviewLayer.fullExtent)
        }
        this.createCoverageArea(this.coverageFlag.allCoverage)
      })
    }).catch(() => {
      //#776
      if (this.overviewLayer) {
        this.mapView.map.remove(this.overviewLayer)
        this.overviewLayer = null
      }
      if (url.toLowerCase().indexOf('.wmts') !== -1) {
        this.overviewLayer = new WMTSLayer({
          url: url,
          visible: false,
          minScale: Math.max(50000, 300 * Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance)) //issue 619
        })
      } else if (url.toLowerCase().indexOf('.wms') !== -1) {
        this.overviewLayer = new WMSLayer({
          url: url,
          visible: false,
          minScale: Math.max(50000, 300 * Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance)) //issue 619
        })
      } else if (url.toLowerCase().indexOf('.kml') !== -1) {
        this.overviewLayer = new KMLLayer({
          url: url,
          visible: false,
          minScale: Math.max(50000, 300 * Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance)) //issue 619
        })
      }
      if (this.overviewLayer) {
        this.mapView.map.add(this.overviewLayer)
        if (this.overviewLayer.fullExtent.spatialReference.wkid === this.mapView.spatialReference.wkid &&
          (!geometryEngine.intersects(this.mapView.extent, this.overviewLayer.fullExtent) ||
            geometryEngine.within(this.overviewLayer.fullExtent, this.mapView.extent))) {
          this.mapView.goTo(this.overviewLayer.fullExtent)
        }
        this.createCoverageArea(this.coverageFlag.allCoverage) //issue #613
      }
    })
  }

  loadOrientedImageryApi = () => {
    //oiapi();
    if (!this.props.oiApiLoaded) { //#1000
      (window as any).orientedImagery.on('load', (loaded) => {
        if (loaded) {
          this.props.dispatch({
            type: 'API_Loaded',
            val: true
          })
          this.loadOIViewer()
        } else {
          this.props.dispatch({
            type: 'API_Loaded',
            val: false
          })
        }
      })
    } else { //#1000
      this.loadOIViewer()
    }
  }

  loadOIViewer = () => {
    this.setState({
      showLoading: false
    })
    this.apiLocalState = true
    if (this.orientedViewer) {
      this.removeVectorLayers()
      this.orientedViewer.destroyViewer()
      this.orientedViewer = null
    }
    this.selectBtnRef?.current?.classList.remove('hide')
    this.selectBtnRef?.current?.classList.add('show')
    this.orientedViewer = (window as any).orientedImagery.viewer(this.oiviewerRef.current)
    if (this.props.theme.sys.color.mode === 'dark') (window as any).orientedImagery.setTheme('dark')
    if (this.mapView.type === '3d') {
      this.orientedViewer.setHeightModelInfo({ heightModel: this.mapView.heightModelInfo?.heightModel, heightUnit: this.mapView.heightModelInfo?.heightUnit }) // #670 issue
      this.orientedViewer.setEnvironment('3D')
    }

    this.orientedViewer.showCoverageTools(true)

    this.orientedViewer.toggleTool({ name: 'CurrentCoverage', state: true })
    this.orientedViewer.toggleTool({ name: 'AllCoverage', state: true })//707 issue fix
    // this.coverageFlag.allCoverage = true;
    // this.createCoverageArea(true);  //#776
    this.orientedViewer.on('imagePointsCheckbox', (bool) => {
      this.coverageFlag.imagePoints = bool
      this.turningOnOffFeatures('imagePoints', bool)
    })
    this.orientedViewer.on('currentCoverageCheckbox', (bool) => {
      this.coverageFlag.currentCoverage = bool
      this.turningOnOffFeatures('currentCoverage', bool)
    })
    this.orientedViewer.on('similarCoverageCheckbox', (bool) => {
      this.coverageFlag.similarCoverage = bool
      this.turningOnOffFeatures('similarCoverage', bool)
    })
    this.orientedViewer.on('coverageMapCheckbox', (bool) => {
      this.coverageFlag.allCoverage = bool
      this.createCoverageArea(bool)
    })
    this.orientedViewer.on('sceneView', (bool) => {
      this.sceneViewFlag = bool
      this.setViewMode(bool)
    })
    this.orientedViewer.on('searchImages', this.drawPointAndPolygons)
    this.orientedViewer.on('showImage', this.drawPointAndPolygons)
    this.orientedViewer.on('updateImage', this.updateCoveragePolygon)
    this.orientedViewer.on('changeImage', this.updateGraphics)
    this.orientedViewer.on('imageToGroundPoint', (pointJson) => {
      this.showPointOnMap(new Point(pointJson))
    })
    this.orientedViewer.on('addFeature', this.addFeature)
    this.orientedViewer.on('deleteFeature', this.deleteFeature)
    this.orientedViewer.on('selectFeature', this.selectFeature)
    this.orientedViewer.on('toggleDistanceTool', (flag) => {
      this.distanceSelector = flag
    })
    this.orientedViewer.on('addImageInView', this.addImageInView)
    this.orientedViewer.on('updateImageInView', this.updateImageInView)
    this.orientedViewer.on('toggleImageInView', this.toggleImageInView)
    this.orientedViewer.on('updateViewCamera', this.updateViewCamera)
    this.orientedViewer.on('deleteImageInView', this.deleteImageInView)

    if (this.orientedViewer && this.props.config.editingEnabled && this.mapView) {
      //#17729
      const addVectorLayerInterval = setInterval(() => {
        let loaded = true
        for (let v = 0; v < this.props.config.vectorLayers.length; v++) {
          const layer = this.mapView.map.layers.find((l) => {
            return l.id === this.props.config.vectorLayers[v].featureLayer.id
          })
          if (!layer.loaded && layer.loadStatus !== 'failed' && layer.loadStatus !== 'loaded') {
            loaded = false
            break
          }
        }

        if (loaded) {
          clearInterval(addVectorLayerInterval)
          this.addAllVectorLayers()
        }
      }, 10)
    } else if (this.orientedViewer && !this.props.config.editingEnabled && this.mapView) {
      this.removeVectorLayers()
    }
  }

  destroyOIViewer = () => {
    if (this.orientedViewer) {
      this.orientedViewer.destroyViewer()
      this.orientedViewer = null
    }
    this.apiLocalState = false
    this.mapView = null
  }

  addOICItem = (url: string) => {
    //var url = url;
    esriRequest(url + '/data', {
      query: {
        f: 'json'
      },
      responseType: 'json'

    }).then(async (oicInfo: any) => {
      const url = oicInfo.url.substring(0, oicInfo.url.indexOf('/data'))
      oicInfo = oicInfo.data
      this.state.config.oic = []
      if (oicInfo && oicInfo.properties) {
        this.state.config.oic[url] = {
          title: oicInfo.properties.Name,
          serviceUrl: oicInfo.properties.ServiceURL,
          overviewUrl: oicInfo.properties.OverviewURL,
          itemUrl: oicInfo
        }
        //#7000
        this.setState({
          OICname: oicInfo.properties.Name
        })
        this.setState({
          selectedOIC: this.oicList[0]
        })
        // if (!this.state.selectedOIC) {
        //   this.setState({
        //     selectedOIC: this.oicList[0]
        //   })
        // }
        if (this.oicList[0]) {
          let url = this.state.config.oic[this.oicList[0]].serviceUrl

          //#705
          if (url.includes('item.html?')) {
            //#1154
            const itemurl = url.split('/home')[0] + '/sharing/rest/content/items/' + ((url.split('id=')[1]).split('&sublayer=')[0]).split('/')[0]
            const sublayer = url.split('&sublayer=')[1] && (url.split('&sublayer=')[1]).split('/')[0]
            await esriRequest(itemurl, {
              query: {
                f: 'json'
              },
              responseType: 'json'
            }).then(async (response) => {
              url = response.data.url
              if (sublayer) {
                url = url + '/' + sublayer
                this.serviceUrl = url
              } else {
                await esriRequest(url, {
                  query: {
                    f: 'json'
                  },
                  responseType: 'json'
                }).then((resp) => {
                  url = url + '/' + resp.data.layers[0].id
                  this.serviceUrl = url
                })
              }
            })
          }
          //#9678 issue fix
          if (this.config?.oic[0]?.itemUrl?.properties?.DefaultSearchLocation && this.config.oic[0].itemUrl.properties.DefaultSearchLocation?.x) {
            const point = new Point(this.config.oic[0].itemUrl.properties.DefaultSearchLocation)
            const params = new ProjectParameters()
            params.geometries = [point]
            params.outSpatialReference = this.mapView.extent ? this.mapView.extent.spatialReference : this.mapView.spatialReference
            this.geometryService.project(GEOMETRY_SERVICE_URL, params).then((geometry) => {
              this.mapView.goTo(geometry[0])
              this.selectedPoint = geometry[0]
              this.setState({
                defaultImage: this.config.oic[0].itemUrl.properties.DefaultImage,
                defaultPoint: geometry[0]
              })
            })
          } else if (this.config?.oic[0]?.itemUrl?.properties?.DefaultImage) {
            this.zoomToImageExtent = true
            this.setState({
              defaultImage: this.config.oic[0].itemUrl.properties.DefaultImage,
              defaultPoint: null
            })
          } else if (url === 'GeoJSONFeatures') { //#9681 issue fix
            const geoJSON = this.config?.oic[0]?.itemUrl?.properties?.GeoJSONFeatures
            if (geoJSON && geoJSON.type === 'FeatureCollection' && Object.hasOwnProperty.call(geoJSON, 'features') && geoJSON.features.length) {
              let multiPoint = new Multipoint({ spatialReference: { wkid: 4326 } })
              for (let c = 0; c < geoJSON.features.length; c++) {
                multiPoint.addPoint(geoJSON.features[c].geometry.coordinates)
              }
              multiPoint = Projection.project(multiPoint, this.mapView.extent ? this.mapView.extent.spatialReference : this.mapView.spatialReference) as any
              if (!geometryEngine.intersects(this.mapView.extent, multiPoint.extent) || geometryEngine.within(multiPoint.extent, this.mapView.extent)) {
                this.mapView.goTo(multiPoint.extent)
              }
            }
          } else if (url.indexOf('FeatureServer') !== -1) {
            const query = new Query()
            query.where = '1=1'
            query.returnGeometry = false
            query.outSpatialReference = this.mapView.extent.spatialReference
            // const queryTask = new QueryTask({ url: url })
            execute.executeForExtent(url, query).then((response) => {
              if (response.extent) {
                this.graphicsLayer.fullExtent = response.extent
                if ((!geometryEngine.intersects(this.mapView.extent, response.extent) || geometryEngine.within(response.extent, this.mapView.extent))) { this.mapView.goTo(response.extent) }
              }
            })
          } else if (url.indexOf('ImageServer') !== -1) {
            esriRequest(url, {
              query: {
                f: 'json'
              },
              responseType: 'json'
            }).then((response) => {
              if (response.data && response.data.extent) {
                if (response.data.extent.spatialReference.wkid === this.mapView.spatialReference.wkid &&
                  (!geometryEngine.intersects(this.mapView.extent, new Extent(response.data.extent)) ||
                    geometryEngine.within(new Extent(response.data.extent), this.mapView.extent))) {
                  this.mapView.goTo(new Extent(response.data.extent))
                  this.graphicsLayer.fullExtent = new Extent(response.data.extent)
                } else {
                  const params = new ProjectParameters()
                  params.geometries = [new Extent(response.data.extent)]
                  params.outSpatialReference = this.mapView.spatialReference
                  geometryService.project(this.props.portalSelf.helperServices.geometry.url, params).then((geometry) => {
                    this.graphicsLayer.fullExtent = geometry[0] as any //#9677 issue fix
                    if (!geometryEngine.intersects(this.mapView.extent, geometry[0] as __esri.geometryGeometry) ||
                      geometryEngine.within(geometry[0] as __esri.geometryGeometry, this.mapView.extent)) { this.mapView.goTo(geometry[0]) }
                  })
                }
              }
            })
          }

          if (this.state.config.oic[this.oicList[0]].overviewUrl) {
            let overview = this.state.config.oic[this.oicList[0]].overviewUrl
            overview = typeof overview !== 'string' ? JSON.stringify(overview) : overview
            try {
              overview = JSON.parse(overview)
              if (typeof overview === 'object' && overview) {
                overview.visible = false
                this.overviewLayer = new VectorTileLayer(overview)
                this.mapView.map.add(this.overviewLayer)
                this.createCoverageArea(this.coverageFlag.allCoverage)
              } else {
                this.layerModuleSelector(this.state.config.oic[this.oicList[0]].overviewUrl)
              }
            } catch (e) {
              this.layerModuleSelector(this.state.config.oic[this.oicList[0]].overviewUrl)
            }
          } else { //issue #607
            if (this.state.config.oic[this.oicList[0]].serviceUrl.indexOf('ImageServer') === -1) {
              //#705
              if (this.state.config.oic[this.oicList[0]].serviceUrl.includes('item.html?')) {
                this.layerModuleSelector(url)
              } else {
                this.layerModuleSelector(this.state.config.oic[this.oicList[0]].serviceUrl)
              }
            } else { //show coverage map for image service OICs - #7371
              this.createCoverageArea(this.coverageFlag.allCoverage)
            }
          }
        }
      } else {
        //this.errorNotification("Error! Invalid OIC.");
      }
    })
  }

  setupSymbols = () => {
    this.activeSourcePointSymbol = {
      type: 'simple-marker',
      size: 15,
      style: 'circle',
      color: [255, 102, 102, 0.5],
      outline: null
    }
    this.sourcePointSymbol = {
      type: 'simple-marker',
      size: 10,
      style: 'circle',
      color: [0, 128, 192, 0.5],
      outline: null
    }
    this.polygonSymbol = {
      type: 'simple-fill',
      style: 'solid',
      outline: null,
      color: [0, 128, 192, 0.5]
    }
    this.activePolygonSymbol = {
      type: 'simple-fill',
      style: 'solid',
      outline: null,
      color: [255, 102, 102, 0.5]
    }
    this.greenLineSymbol = {
      type: 'simple-line',
      width: 1,
      style: 'short-dash',
      color: [0, 255, 0]
    }
    this.diamondSymbol = {
      type: 'simple-marker',
      size: 10,
      style: 'diamond',
      color: [0, 255, 0],
      outline: null
    }
    this.crossSymbol = {
      type: 'simple-marker',
      size: 8,
      style: 'x',
      color: [255, 0, 0],
      outline: {
        color: [255, 0, 0],
        width: 2,
        style: 'solid'
      }
    }
    this.coverageMapSymbol = {
      type: 'simple-fill',
      style: 'solid',
      outline: null,
      color: [0, 200, 0, 0.5]
    }
    this.activeFrustumSymbol = {
      type: 'mesh-3d',
      symbolLayers: [{
        type: 'fill',
        material: {
          color: [255, 102, 102, 0.5]
        },
        edges: {
          type: 'solid',
          color: [255, 102, 102, 0]
        }
      }]
    }
    this.frustumSymbol = {
      type: 'mesh-3d',
      symbolLayers: [{
        type: 'fill',
        material: {
          color: [0, 128, 192, 0.5]
        },
        edges: {
          type: 'solid',
          color: [0, 128, 192, 0]
        }
      }]
    }
  }

  mapClickEvent = (evt) => {
    if (this.mapView.type === '2d') {
      if (this.distanceSelector && this.currentImagePoint) {
        const distance = evt.mapPoint.distance(this.currentImagePoint)
        let factor
        if (evt.mapPoint.spatialReference.wkid === 102100 || evt.mapPoint.spatialReference.wkid === 3857) {
          factor = 1 / Math.cos((Math.PI / 2) - (2 * Math.atan(Math.exp((-1 * evt.mapPoint.y) / 6378137))))
        } else {
          factor = 1
        }
        this.orientedViewer.setDistance(distance / factor)
      } else if (evt.native.altKey) {
        //this.hidePopup = true;
        this.showPointOnMap(evt.mapPoint)
        this.groundToImage(evt.mapPoint)
      } else if (this.props.pointBool) {
        //this.hidePopup = true;
        //document.getElementById("allCoverage").checked = false;
        this.graphicExists = false
        this.mapView.hitTest(evt.screenPoint).then((response) => {
          if (response.results.length > 0) {
            if (response.results[0].graphic.attributes &&
              !response.results[0].graphic.attributes.id &&
              response.results[0].graphic.attributes.imageID) {
              this.selectedExposurePoint = {
                geometry: response.results[0].graphic.geometry,
                id: response.results[0].graphic.attributes.imageID
              }
              // to streamlime the API searchImages function to use the this.searchImages of the widget
              this.searchImages(this.selectedPoint, parseInt(this.selectedExposurePoint.id))
            } else if (response.results[0].graphic.attributes && //#607 #614 #992
              response.results[0].graphic.attributes.OBJECTID &&
              response.results[0].graphic.layer.url.includes('FeatureServer')) {
              const layer = response.results[0].graphic.layer.url + '/' + response.results[0].graphic.layer.layerId
              if (layer === this.state.config.oic[this.state.selectedOIC].serviceUrl || layer === this.serviceUrl) {
                this.showImage(evt.mapPoint, response.results[0].graphic.attributes.OBJECTID)
              } else {
                this.selectedPoint = evt.mapPoint
                this.searchImages(evt.mapPoint, null)
              }
            } else {
              this.selectedPoint = evt.mapPoint
              this.searchImages(evt.mapPoint, null)
            }
          } else {
            //#596
            this.selectedPoint = evt.mapPoint
            this.searchImages(evt.mapPoint, null)
          }
        })
      }
    } else {
      if (this.sceneViewFlag) {
        if (this.props.pointBool && !this.imageInViewFlag) {
          //document.getElementById("allCoverage").checked = false;
          this.hidePopup = true
          this.searchImages(evt.mapPoint, null)
        }
      } else {
        this.mapView.hitTest(evt.screenPoint).then((response) => {
          let mapPoint
          if (response.results.length > 0) {
            mapPoint = response.results[0].mapPoint
          } else {
            mapPoint = evt.mapPoint
          }
          let factor
          if (this.distanceSelector && this.currentImageCameraLocation) {
            if (mapPoint.spatialReference.wkid === 102100 || mapPoint.spatialReference.wkid === 3857) {
              factor = 1 / Math.cos((Math.PI / 2) - (2 * Math.atan(Math.exp((-1 * mapPoint.y) / 6378137))))
            } else {
              factor = 1
            }
            const height = this.currentImageCameraLocation.z - mapPoint.z
            const base = Math.sqrt(Math.pow(this.currentImageCameraLocation.x - mapPoint.x, 2) +
              Math.pow(this.currentImageCameraLocation.y - mapPoint.y, 2)) / factor
            const distance = Math.sqrt(Math.pow(base, 2) + Math.pow(height, 2))

            //var distance = point.distance(this.currentImageCameraLocation);
            this.orientedViewer.setDistance(distance)
          } else if (evt.native.altKey) {
            this.hidePopup = true
            //this.showPointOnMap(evt.mapPoint);
            this.groundToImage(mapPoint)
          } else if (this.props.pointBool) {
            this.hidePopup = true
            //document.getElementById("allCoverage").checked = false;
            this.graphicExists = false
            this.searchImages(mapPoint, null)
          }
        })
      }
    }
  }

  searchImages = (point, objectId) => {
    const url = this.state.config.oic[this.state.selectedOIC]?.itemUrl
    this.setState({
      showLoading: true
    })
    if (this.props.oiApiLoaded && url) { //#1000
      if (this.mapView.type === '2d') {
        point.z = 0
        this.orientedViewer.searchImages(point.toJSON(), url, {
          // eslint-disable-next-line no-constant-binary-expression
          maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
          extent: this.mapView.extent.toJSON(),
          objectId: objectId || null,
          token: {
            token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
            server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
          }
        })
      } else {
        this.queryElevation(point).then((res) => {
          const pointJSON = point.toJSON()
          pointJSON.elevation = res.geometry.z
          this.avgGroundElevation = res.geometry.z //583 issue fix
          if (this.sceneViewFlag) {
            this.graphicsLayer.graphics.removeAll()
            this.graphicsLayer.add(new Graphic({ geometry: point, symbol: this.crossSymbol as unknown as __esri.SymbolUnion, attributes: { id: 'oi-focusPoint' } }))
            //this.showLoading();
            //html.set("notifyUser", "Please wait. Searching for image.");
            //document.getElementById('notifyUser').innerHTML = 'Please wait. Searching for image.';
            const location = this.mapView.camera.position.clone() //#980
            // this.mapView.map.ground.queryElevation(location).then((result) => {
            //   location.z -= result.geometry.z;
            this.orientedViewer.searchImages(pointJSON, url, {
              // eslint-disable-next-line no-constant-binary-expression
              maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
              extent: this.mapView.extent.toJSON(),
              mapSize: { w: this.mapView.width, h: this.mapView.height },
              camera: {
                heading: this.mapView.camera.heading,
                tilt: this.mapView.camera.tilt,
                fov: this.mapView.camera.fov,
                elevation: 0,
                position: location
              },
              token: {
                token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
                server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
              },
              objectId: objectId || null
            })
            // });
          } else {
            this.orientedViewer.searchImages(pointJSON, url, {
              // eslint-disable-next-line no-constant-binary-expression
              maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
              camera: this.mapView.camera,
              mapSize: {
                w: this.mapView.width,
                h: this.mapView.height
              },
              extent: this.mapView.extent.toJSON(),
              objectId: objectId || null,
              token: {
                token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
                server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
              }
            })
          }
        })
      }
    }
  }

  showImage = (point, objectId) => {
    const url = this.state.config.oic[this.state.selectedOIC]?.itemUrl
    if (this.props.oiApiLoaded && url) { //#1000
      if (this.mapView.type === '2d') {
        point.z = 0
        this.orientedViewer.showImage(point.toJSON(), url, {
          // eslint-disable-next-line no-constant-binary-expression
          maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
          extent: this.mapView.extent.toJSON(),
          objectId: objectId || null,
          token: {
            token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
            server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
          }
        })
      } else {
        this.queryElevation(point).then((res) => {
          const pointJSON = point.toJSON()
          pointJSON.elevation = res.geometry.z
          this.avgGroundElevation = res.geometry.z //583 issue fix
          if (this.sceneViewFlag) {
            this.graphicsLayer.graphics.removeAll()
            this.graphicsLayer.add(new Graphic({ geometry: point, symbol: this.crossSymbol as unknown as __esri.SymbolUnion, attributes: { id: 'oi-focusPoint' } }))
            const location = this.mapView.camera.position.clone() //#980
            // this.mapView.map.ground.queryElevation(location).then((result) => {
            //   location.z -= result.geometry.z;
            this.orientedViewer.showImage(pointJSON, url, {
              // eslint-disable-next-line no-constant-binary-expression
              maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
              extent: this.mapView.extent.toJSON(),
              mapSize: { w: this.mapView.width, h: this.mapView.height },
              camera: {
                heading: this.mapView.camera.heading,
                tilt: this.mapView.camera.tilt,
                fov: this.mapView.camera.fov,
                elevation: 0,
                position: location
              },
              objectId: objectId || null,
              token: {
                token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
                server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
              }
            })
            // });
          } else {
            this.orientedViewer.showImage(pointJSON, url, {
              // eslint-disable-next-line no-constant-binary-expression
              maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
              camera: this.mapView.camera,
              mapSize: { w: this.mapView.width, h: this.mapView.height },
              extent: this.mapView.extent.toJSON(),
              objectId: objectId || null,
              token: {
                token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
                server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
              }
            })
          }
        })
      }
    }
  }

  drawPointAndPolygons = async (response) => { //#9677 issue fix
    this.setState({
      showLoading: false
    })
    this.graphicsLayer.graphics.removeAll()
    if (!response.error) {
      this.graphicExists = false
      if (this.mapView.type === '2d') {
        response.point.z = 0
        this.pointAndPolygonGraphics = { points: response.imageSourcePoints, polygons: response.coveragePolygons } //#9677 issue fix
        this.graphicsLayer.addMany(this.drawCoveragePolygons(response.coveragePolygons, response.imageAttributes.imageID))
        this.graphicsLayer.addMany(this.drawImageSourcePoints(response.imageSourcePoints, response.imageAttributes.imageID))
        if (this.zoomToImageExtent) { //#9678 issue fix
          this.zoomToImageExtent = false
          this.mapView.goTo(new Point(response.imageSourcePoints[0]))
        } else { this.graphicsLayer.add(new Graphic({ geometry: new Point(response.point), symbol: this.crossSymbol as unknown as __esri.SymbolUnion })) }
        this.imageProperties = response.imageAttributes
        this.activeImageID = response.imageAttributes.imageID
        this.currentImagePoint = new Point({
          x: this.imageProperties.location.x,
          y: this.imageProperties.location.y,
          spatialReference: new SpatialReference(this.imageProperties.location.spatialReference)
        })
      } else {
        // if (!response.point.z) {
        //   response.point.z = 0;
        // }
        if (this.zoomToImageExtent) { //#9678 issue fix
          await this.queryElevation(new Point(response.imageSourcePoints[0])).then((res) => {
            this.avgGroundElevation = res.geometry.z
          })
        }
        let multiPoint: any = this.createMultiPoint({ geometries: response.imageSourcePoints.concat(response.point), type: 'point' })
        const multiPoint2: any = this.createMultiPoint({ geometries: response.coverageFrustums, type: 'frustum' })
        multiPoint = multiPoint.concat(multiPoint2)
        multiPoint = new Multipoint({ points: multiPoint, spatialReference: this.mapView.spatialReference })
        //this.queryElevation(multiPoint).then((res) => { //583 issue fixed
        for (let cv = 0; cv < multiPoint.points.length; cv++) { //583 issue fixed
          if (cv < response.imageSourcePoints.length) {
            response.imageSourcePoints[cv].z += (this.avgGroundElevation || 0)//res.geometry.points[cv][2]; //583 issue fix
            // } else if (cv === response.imageSourcePoints.length) {
            //   response.point.z += (res.geometry as any).points[cv][2];
          } else {
            for (let fm = 0; fm < response.coverageFrustums.length; fm++) {
              if (response.coverageFrustums[fm]) { //#625
                for (let dm = 2; dm < response.coverageFrustums[fm].vertexAttributes.position.length; dm = dm + 3) {
                  response.coverageFrustums[fm].vertexAttributes.position[dm] += (this.avgGroundElevation || 0)//res.geometry.points[cv][2]; //583 issue fix
                  cv++
                }
              }
            }
          }
        }
        this.pointAndFrustumGraphics = { points: response.imageSourcePoints, frustums: response.coverageFrustums } //#9677 issue fix
        this.graphicsLayer.addMany(this.drawFrustums(response.coverageFrustums, response.imageAttributes.imageID))
        this.graphicsLayer.addMany(this.drawImageSourcePoints(response.imageSourcePoints, response.imageAttributes.imageID))
        if (this.zoomToImageExtent) { //#9678 issue fix
          this.zoomToImageExtent = false
        } else { this.graphicsLayer.add(new Graphic({ geometry: new Point(response.point), symbol: this.crossSymbol as unknown as __esri.SymbolUnion })) }
        if (response.point.spatialReference.isWebMercator) {
          this.WMSF = 1 / Math.cos((Math.PI / 2) - (2 * Math.atan(Math.exp((-1 * response.point.y) / 6378137))))
        } else {
          this.WMSF = 1
        }

        this.imageProperties = response.imageAttributes
        this.selectedAsset = response.point
        this.setCameraView(this.imageProperties)
        this.activeImageID = response.imageAttributes.imageID
      }
    }
  }

  drawCoveragePolygons = (polygons, imageID) => {
    const coveragePolygons = [] //#9677 issue fix
    let currentCoverageGraphic: Graphic
    for (let a = 0; a < polygons.length; a++) {
      if (polygons[a]) { //#625
        if (imageID === polygons[a].imageID) {
          currentCoverageGraphic = (new Graphic({ //#9677 issue fix
            geometry: new Polygon(polygons[a]),
            symbol: this.activePolygonSymbol as unknown as __esri.SymbolUnion,
            visible: this.coverageFlag.currentCoverage,
            attributes: { imageID: polygons[a].imageID, id: 'oi-polygons' }
          }))
        } else { //#9677 issue fix
          coveragePolygons.push(new Graphic({ geometry: new Polygon(polygons[a]), symbol: this.polygonSymbol as unknown as __esri.SymbolUnion, visible: this.coverageFlag.similarCoverage, attributes: { imageID: polygons[a].imageID, id: 'oi-polygons' } }))
        }
      }
    }
    if (currentCoverageGraphic) { //#9677 issue fix
      coveragePolygons.push(currentCoverageGraphic)
    }
    //#9677 issue fix
    return coveragePolygons
  }

  drawImageSourcePoints = (points, imageID) => {
    const graphics = [] //#9677 issue fix
    let currentGraphic: Graphic
    for (let i = 0; i < points.length; i++) {
      if (imageID === points[i].imageID) {
        currentGraphic = new Graphic({ //#9677 issue fix
          geometry: new Point(points[i]),
          symbol: this.activeSourcePointSymbol as unknown as __esri.SymbolUnion,
          visible: this.coverageFlag.imagePoints,
          attributes: { imageID: points[i].imageID }
        })
      } else { //#9677 issue fix
        graphics.push(new Graphic({
          geometry: new Point(points[i]),
          symbol: this.sourcePointSymbol as unknown as __esri.SymbolUnion,
          visible: this.coverageFlag.imagePoints,
          attributes: { imageID: points[i].imageID }
        }))
      }
    }

    if (currentGraphic) {
      graphics.push(currentGraphic)
    }
    //#9677 issue fix
    return graphics
  }

  updateCoveragePolygon = (imageProperties) => {
    //this.setupResizeHandle(); //#853
    this.setState({
      showLoading: false
    })
    if (this.mapView.type === '2d') {
      if (imageProperties.coveragePolygon) {
        for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
          if (this.graphicsLayer.graphics.getItemAt(v).attributes &&
            this.graphicsLayer.graphics.getItemAt(v).attributes.id === 'oi-polygons' &&
            this.graphicsLayer.graphics.getItemAt(v).attributes.imageID === imageProperties.imageID) {
            this.graphicsLayer.graphics.getItemAt(v).geometry = new Polygon(imageProperties.coveragePolygon) //#9677 issue fix
          }
        }
      }
    } else {
      if (imageProperties.coverageFrustum.vertexAttributes) {
        for (let bm = 2; bm < imageProperties.coverageFrustum.vertexAttributes.position.length; bm = bm + 3) {
          imageProperties.coverageFrustum.vertexAttributes.position[bm] += (this.avgGroundElevation || 0)//result.geometry.points[cb][2]; //583 issue fix
          //cb++;
        }
        for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
          if (this.graphicsLayer.graphics.getItemAt(v).attributes &&
            this.graphicsLayer.graphics.getItemAt(v).attributes.id === 'oi-polygons' &&
            this.graphicsLayer.graphics.getItemAt(v).attributes.imageID === imageProperties.imageID) {
            this.graphicsLayer.graphics.getItemAt(v).geometry = Mesh.fromJSON(imageProperties.coverageFrustum) //#9677 issue fix
            break
          }
        }
        //});
      }
    }
  }

  updateGraphics = (image) => {
    this.imageProperties = image
    if (this.mapView.type === '3d') {
      setTimeout(() => {
        this.setCameraView(this.imageProperties)
      }, 2000)
      //#9677 issue fix
      let loopRunner = 0
      const graphics: { [k: string]: Graphic } = {}
      this.graphicsLayer.graphics.every((graphic) => {
        if (loopRunner < 4) {
          if (SYMBOLS.includes(graphic.symbol.style)) {
            if (graphic.symbol.style === 'circle') {
              if (graphic.attributes.imageID === image.imageID) { graphics[graphic.symbol.style] = graphic.clone() }
            } else {
              graphics[graphic.symbol.style] = graphic.clone()
            }
          }
          loopRunner += 1
          return true
        } else { return false }
      })
      //#9677 issue fix
      this.graphicsLayer.graphics.removeAll()
      this.graphicsLayer.addMany(this.drawFrustums(this.pointAndFrustumGraphics.frustums, image.imageID))
      this.graphicsLayer.addMany(this.drawImageSourcePoints(this.pointAndFrustumGraphics.points, image.imageID))
      if (graphics.x) { //#9677 issue fix
        this.graphicsLayer.add(graphics.x)
      }
      if (graphics.diamond) { //#9677 issue fix
        this.graphicsLayer.add(graphics.diamond)
      }
      if (graphics['simple-line']) { //#9677 issue fix
        const currentGeometry: Point = graphics.circle as any
        (graphics['simple-line'].geometry as Polyline).paths[0][1] = [currentGeometry.x, currentGeometry.y, currentGeometry.z]
        this.graphicsLayer.add(graphics['simple-line'])
      }
    } else { //#9677 issue fix
      let diamondGraphic: Graphic
      let crossGraphic: Graphic
      this.currentImagePoint = new Point({
        x: this.imageProperties.location.x,
        y: this.imageProperties.location.y,
        spatialReference: new SpatialReference(this.imageProperties.location.spatialReference)
      })
      for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
        if (this.graphicsLayer.graphics.getItemAt(v).symbol.style === 'diamond') {
          diamondGraphic = this.graphicsLayer.graphics.getItemAt(v).clone()//#9677 issue fix
          break
        }
      }
      for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
        if (this.graphicsLayer.graphics.getItemAt(v).symbol.style === 'x') {
          crossGraphic = this.graphicsLayer.graphics.getItemAt(v).clone()//#9677 issue fix
          break
        }
      }
      //#9677 issue fix
      this.graphicsLayer.graphics.removeAll()
      this.graphicsLayer.addMany(this.drawCoveragePolygons(this.pointAndPolygonGraphics.polygons, image.imageID))
      this.graphicsLayer.addMany(this.drawImageSourcePoints(this.pointAndPolygonGraphics.points, image.imageID))
      if (crossGraphic) { this.graphicsLayer.add(crossGraphic) }
      if (diamondGraphic) { this.graphicsLayer.add(diamondGraphic) }
    }

    this.activeImageID = image.imageID
  }

  createCoverageArea = (value: boolean) => {
    //this.allCoverageCheck = value;
    if (this.overviewLayer) {
      if (value) { this.overviewLayer.visible = true } else { this.overviewLayer.visible = false }
    }
    //#935
    if (!this.state.config.oic[this.state.selectedOIC].itemUrl.properties.OverviewURL) {
      for (let s = 0; s <= this.graphicsLayer.graphics.length - 1; s++) {
        if (this.graphicsLayer.graphics.getItemAt(s).symbol && this.graphicsLayer.graphics.getItemAt(s).symbol.style === 'solid' && this.graphicsLayer.graphics.getItemAt(s).attributes.coverageMap) {
          this.graphicsLayer.remove(this.graphicsLayer.graphics.getItemAt(s))
          break
        }
      }
      if (value && this.props.oiApiLoaded) { //#1000
        this.orientedViewer.getCoverageMap(this.mapView.extent.toJSON(), this.state.config.oic[this.state.selectedOIC].itemUrl).then((response) => {
          if (response.coverageMap) {
            for (let s = 0; s <= this.graphicsLayer.graphics.length - 1; s++) {
              if (this.graphicsLayer.graphics.getItemAt(s).symbol && this.graphicsLayer.graphics.getItemAt(s).symbol.style === 'solid' && this.graphicsLayer.graphics.getItemAt(s).attributes.coverageMap) {
                this.graphicsLayer.remove(this.graphicsLayer.graphics.getItemAt(s))
                break
              }
            }
            if (this.mapView.type === '2d') {
              const graphic = new Graphic({ geometry: new Polygon(response.coverageMap), symbol: this.coverageMapSymbol as unknown as __esri.SymbolUnion, attributes: { coverageMap: true } })
              this.graphicsLayer.add(graphic)
              //this.overviewLayer = graphic;
            } else {
              const multiPoint = new Multipoint({ spatialReference: this.mapView.spatialReference, points: this.createMultiPoint({ type: 'polygon', geometries: [response.coverageMap] }) })
              this.queryElevation(multiPoint).then((result) => {
                let cv = 0
                for (let gm = 0; gm < response.coverageMap.rings.length; gm++) {
                  for (let mb = 0; mb < response.coverageMap.rings[gm].length; mb++) { response.coverageMap.rings[gm][mb][2] = result.geometry.points[cv][2] }
                  cv++
                }

                const graphic = new Graphic({ geometry: new Polygon(response.coverageMap), symbol: this.coverageMapSymbol as unknown as __esri.SymbolUnion, attributes: { coverageMap: true } })
                this.graphicsLayer.add(graphic)
                //this.overviewLayer = graphic;
                this.graphicsLayer.graphics.reorder(graphic, 0) //#9677 issue fix
              })
            }
          }
        })
      }
    }
  }

  drawFrustums = (frustums, imageID) => {
    const coverageFrustums = [] //#9677 issue fix
    let currentCoverageFrustum: Graphic
    for (let a = 0; a < frustums.length; a++) {
      if (frustums[a]) { //#625
        if (imageID === frustums[a].imageID) {
          currentCoverageFrustum = new Graphic({ geometry: Mesh.fromJSON(frustums[a]), symbol: this.activeFrustumSymbol, visible: this.coverageFlag.currentCoverage, attributes: { imageID: frustums[a].imageID, id: 'oi-polygons' } }) // #10930
        } else {
          coverageFrustums.push(new Graphic({ geometry: Mesh.fromJSON(frustums[a]), symbol: this.frustumSymbol, visible: this.coverageFlag.similarCoverage, attributes: { imageID: frustums[a].imageID, id: 'oi-polygons' } }))
        }
      }
    }
    if (currentCoverageFrustum) {
      coverageFrustums.push(currentCoverageFrustum)
    }
    //#9677 issue fix
    return coverageFrustums
  }

  showPointOnMap = (geometry) => {
    if (this.mapView.type === '2d') {
      geometry.z = 0
      if (!this.graphicExists) {
        this.graphicsLayer.add(new Graphic({ geometry: geometry, symbol: this.diamondSymbol as unknown as __esri.SymbolUnion }))
        this.graphicExists = true
      } else {
        for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
          if (this.graphicsLayer.graphics.getItemAt(v).symbol.style === 'diamond') { //#9677 issue fix
            this.graphicsLayer.graphics.getItemAt(v).geometry = geometry
            break
          }
        }
      }
    } else {
      if (!geometry.z) {
        geometry.z = 0
      }
      if (!this.graphicExists) {
        this.graphicsLayer.add(new Graphic({ geometry: geometry, symbol: this.diamondSymbol as unknown as __esri.SymbolUnion }))
        for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
          if (this.graphicsLayer.graphics.getItemAt(v).symbol?.style === 'circle' && this.graphicsLayer.graphics.getItemAt(v).attributes.imageID === this.activeImageID) {
            const g = this.graphicsLayer.graphics.getItemAt(v).geometry.clone() as Point //#9677 issue fix
            this.graphicsLayer.add(new Graphic({
              geometry: new Polyline({
                paths: [[geometry.x, geometry.y, geometry.z], [g.x, g.y, g.z]],
                spatialReference: geometry.spatialReference.toJSON()
              }),
              symbol: this.greenLineSymbol as unknown as __esri.SymbolUnion
            }))
            break
          }
        }
        this.graphicExists = true
      } else {
        for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
          if (this.graphicsLayer.graphics.getItemAt(v).symbol?.style === 'diamond') {
            this.graphicsLayer.graphics.getItemAt(v).geometry = geometry //#9677 issue fix
            break
          }
        }
        for (let v = this.graphicsLayer.graphics.length - 1; v >= 0; v--) {
          if (this.graphicsLayer.graphics.getItemAt(v).symbol?.type === 'simple-line') { //#9677 issue fix
            const graphic = this.graphicsLayer.graphics.getItemAt(v).clone();
            (graphic.geometry as Polyline).paths[0][0] = [geometry.x, geometry.y, geometry.z]
            this.graphicsLayer.graphics.getItemAt(v).geometry = graphic.geometry
            break
          }
        }
      }
    }
  }

  groundToImage = (point) => {
    if (this.props.oiApiLoaded) { //#1000
      if (this.mapView.type === '2d') {
        point.z = 0
        this.orientedViewer.displayGroundPointInImage(point.toJSON())
      } else {
        //this.mapView.map.ground.queryElevation(point).then((result) => {
        const pJSON = point.toJSON()
        //pJSON.z -= result.geometry.z;
        this.showPointOnMap(point)
        this.orientedViewer.displayGroundPointInImage(pJSON)
        // });
      }
    }
  }

  static mapExtraStateProps (state: IMState) {
    return { pointBool: state.widget_orientedimagery.pointBool, oiApiLoaded: state.widget_orientedimagery.oiApiLoaded }
  }

  toggleIcon = (evt) => {
    //issue 252 and 249

    if (evt.currentTarget.classList.contains('oi-widget-selectBtnSelected')) {
      this.mapView.cursor = 'default'
      this.props.dispatch({
        type: 'Click_Btn_Active',
        val: false
      })
    } else {
      this.mapView.cursor = 'crosshair'
      this.props.dispatch({
        type: 'Click_Btn_Active',
        val: true
      })
    }
  }

  turningOnOffFeatures = (selectedFeatures: string, state: boolean) => {
    switch (selectedFeatures) {
      //#806
      case 'imagePoints':
      {
        for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) {
          if (this.graphicsLayer.graphics.getItemAt(s).symbol.style === 'circle') {
            this.graphicsLayer.graphics.getItemAt(s).visible = state
          }
        }
        break
      }
      case 'currentCoverage':
      {
        for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) {
          if (this.graphicsLayer.graphics.getItemAt(s).attributes &&
              this.graphicsLayer.graphics.getItemAt(s).attributes.id === 'oi-polygons' &&
              this.graphicsLayer.graphics.getItemAt(s).attributes.imageID === this.activeImageID) {
            this.graphicsLayer.graphics.getItemAt(s).visible = state
          }
        }
        break
      }
      case 'similarCoverage':
      {
        for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) {
          if (this.graphicsLayer.graphics.getItemAt(s).attributes &&
              this.graphicsLayer.graphics.getItemAt(s).attributes.id === 'oi-polygons' &&
              this.graphicsLayer.graphics.getItemAt(s).attributes.imageID !== this.activeImageID) {
            this.graphicsLayer.graphics.getItemAt(s).visible = state
          }
        }
        break
      }
    }
  }

  addAllVectorLayers = () => {
    const layers = this.mapView.map.layers.items
    this.vectorLayers = []
    for (let i = 0; i < this.props.config.vectorLayers.length; i++) {
      for (let a = 0; a < layers.length; a++) {
        //#17729
        if (layers[a].loaded && layers[a].id === this.props.config.vectorLayers[i].featureLayer.id && this.props.config.vectorLayers[i].addToViewer) {
          this.vectorLayers.push({ //#862
            id: layers[a].id,
            title: layers[a].title,
            url: layers[a].url + '/' + layers[a].layerId,
            editable: this.props.config.vectorLayers[i].editing &&
              layers[a].editingEnabled &&
              layers[a].capabilities &&
              layers[a].capabilities.operations.supportsEditing,
            renderer: layers[a].renderer,
            geometryType: layers[a].geometryType,
            fields: layers[a].fields
          })
        }
      }
    }

    for (let i = 0; i < this.vectorLayers.length; i++) {
      const vectorLayerProp = this.vectorLayers[i]
      const renderer = vectorLayerProp.renderer?.toJSON() //#17729
      let symbol: any
      switch (vectorLayerProp.geometryType) {
        case 'polygon':
        {
          if (renderer.type === 'simple') {
            symbol = {
              type: 'polygon',
              color: vectorLayerProp.renderer.symbol.color
                ? [vectorLayerProp.renderer.symbol.color.r,
                    vectorLayerProp.renderer.symbol.color.g,
                    vectorLayerProp.renderer.symbol.color.b,
                    vectorLayerProp.renderer.symbol.color.a]
                : [0, 0, 0, 0],
              outline: {
                width: vectorLayerProp.renderer.symbol.outline ? vectorLayerProp.renderer.symbol.outline.width : 2,
                color: vectorLayerProp.renderer.symbol.outline &&
                    vectorLayerProp.renderer.symbol.outline.color
                  ? [vectorLayerProp.renderer.symbol.outline.color.r,
                      vectorLayerProp.renderer.symbol.outline.color.g,
                      vectorLayerProp.renderer.symbol.outline.color.b,
                      vectorLayerProp.renderer.symbol.outline.color.a]
                  : [0, 92, 230, 255]
              }
            }
            renderer.symbol = symbol
          } else if (renderer.type === 'uniqueValue') {
            for (const b in vectorLayerProp.renderer.uniqueValueInfos) {
              symbol = {
                type: 'polygon',
                color: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color
                  ? [vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.r,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.g,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.b,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.a]
                  : [0, 0, 0, 0],
                outline: {
                  width: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline
                    ? vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.width
                    : 2,
                  color: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline &&
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color
                    ? [vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.r,
                        vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.g,
                        vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.b,
                        vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.a]
                    : [0, 92, 230, 255]
                }
              }
              renderer.uniqueValueInfos[b].symbol = symbol
            }
          }
          //var labelDrawingMode = false;
          break
        }
        case 'polyline':
        {
          if (renderer.type === 'simple') {
            symbol = {
              type: 'polyline',
              color: vectorLayerProp.renderer.symbol.color
                ? [vectorLayerProp.renderer.symbol.color.r,
                    vectorLayerProp.renderer.symbol.color.g,
                    vectorLayerProp.renderer.symbol.color.b,
                    vectorLayerProp.renderer.symbol.color.a]
                : [76, 230, 0, 255],
              width: vectorLayerProp.renderer.symbol.width || 2
            }
            renderer.symbol = symbol
          } else if (renderer.type === 'uniqueValue') {
            for (const b in vectorLayerProp.renderer.uniqueValueInfos) {
              symbol = {
                type: 'polyline',
                color: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color
                  ? [vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.r,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.g,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.b,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.a]
                  : [76, 230, 0, 255],
                width: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.width || 2
              }
              renderer.uniqueValueInfos[b].symbol = symbol
            }
          }
          //var labelDrawingMode = false;
          break
        }
        case 'point':
        {
          if (renderer.type === 'simple') {
            symbol = {
              type: 'point',
              style: vectorLayerProp.renderer.symbol.style || 'circle',
              color: vectorLayerProp.renderer.symbol.color
                ? [vectorLayerProp.renderer.symbol.color.r,
                    vectorLayerProp.renderer.symbol.color.g,
                    vectorLayerProp.renderer.symbol.color.b,
                    vectorLayerProp.renderer.symbol.color.a]
                : [255, 127, 127, 255],
              size: vectorLayerProp.renderer.symbol.size || 10,
              outline: {
                width: vectorLayerProp.renderer.symbol.outline ? vectorLayerProp.renderer.symbol.outline.width : 0,
                color: vectorLayerProp.renderer.symbol.outline &&
                    vectorLayerProp.renderer.symbol.outline.color
                  ? [vectorLayerProp.renderer.symbol.outline.color.r,
                      vectorLayerProp.renderer.symbol.outline.color.g,
                      vectorLayerProp.renderer.symbol.outline.color.b,
                      vectorLayerProp.renderer.symbol.outline.color.a]
                  : [0, 0, 0, 1]
              }
            }
            renderer.symbol = symbol
          } else if (renderer.type === 'uniqueValue') {
            for (const b in vectorLayerProp.renderer.uniqueValueInfos) {
              symbol = {
                type: 'point',
                style: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.style || 'circle',
                color: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color
                  ? [vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.r,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.g,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.b,
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.color.a]
                  : [255, 127, 127, 255],
                size: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.size || 10,
                outline: {
                  width: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline ? vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.width : 0,
                  color: vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline &&
                      vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color
                    ? [vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.r,
                        vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.g,
                        vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.b,
                        vectorLayerProp.renderer.uniqueValueInfos[b].symbol.outline.color.a]
                    : [0, 0, 0, 1]
                }
              }
              renderer.uniqueValueInfos[b].symbol = symbol
            }
          }
          //var labelDrawingMode = document.getElementById("labelLayer").checked;
          break
        }
      }
      this.orientedViewer.addVectorLayer(vectorLayerProp.title, vectorLayerProp.url, renderer, vectorLayerProp.editable)
      //this.vectorLayerAdded.push(vectorLayerProp.url);
    }
  }

  removeVectorLayers = () => {
    if (this.vectorLayers?.length > 0) {
      for (let a = 0; a < this.vectorLayers.length; a++) {
        this.orientedViewer.removeVectorLayer(this.vectorLayers[a].title)
      }
    }
  }

  addFeature = (json) => {
    let uniqueValueField, layer
    for (const b of this.vectorLayers) {
      if (b.title === json.layer) {
        if (b.renderer.type === 'unique-value' && b.renderer.field) {
          uniqueValueField = b.renderer.field
        } else { //#794
          uniqueValueField = null
        }
        layer = this.mapView.map.findLayerById(b.id)
        break
      }
    }
    const attributes = json.attributes ? json.attributes : {}
    attributes.ImgGeom = JSON.stringify(attributes.ImgGeom)
    if (!layer.hasZ) {
      if (layer.geometryType === 'point') { json.geometry.z = null } else if (layer.geometryType === 'polyline') {
        //#757 issue fixed
        for (let cv = 0; cv <= json.geometry.paths.length - 1; cv++) {
          for (let bn = 0; bn <= json.geometry.paths[cv].length - 1; bn++) {
            json.geometry.paths[cv][bn] = json.geometry.paths[cv][bn].splice(0, 2)
          }
        }
      } else if (layer.geometryType === 'polygon') {
        for (let cv = 0; cv <= json.geometry.rings.length - 1; cv++) {
          for (let bn = 0; bn <= json.geometry.rings[cv].length - 1; bn++) {
            json.geometry.rings[cv][bn] = json.geometry.rings[cv][bn].splice(0, 2)
          }
        }
      }
      //
    }
    const graphic = new Graphic({
      geometry: layer.geometryType === 'point'
        ? new Point(json.geometry)
        : layer.geometryType === 'polyline'
          ? new Polyline(json.geometry)
          : new Polygon(json.geometry),
      attributes: attributes
    })

    const param = { addFeatures: [graphic] }
    layer.applyEdits(param).then((result) => {
      if (result.addFeatureResults.length) {
        this.showAttributeWindow(layer, graphic, result.addFeatureResults[0].objectId, uniqueValueField)
        this.orientedViewer.applyEdits({ layer: json.layer, success: true, objectId: result.addFeatureResults[0].objectId, mode: 'add' })
      } else { this.orientedViewer.applyEdits({ layer: json.layer, success: false, error: 'Failed', mode: 'add' }) }
    }).catch((error) => { //#863
      this.orientedViewer.applyEdits({ layer: json.layer, success: false, error: error.message, mode: 'add' })
    })
  }

  deleteFeature = (json) => {
    let layer
    for (const b of this.vectorLayers) {
      if (b.title === json.layer) {
        layer = this.mapView.map.findLayerById(b.id)
        break
      }
    }
    layer.applyEdits({ deleteFeatures: [{ objectId: json.featureId }] }).then((result) => {
      if (result.deleteFeatureResults.length) { this.orientedViewer.applyEdits({ layer: json.layer, success: true, mode: 'delete' }) } else { this.orientedViewer.applyEdits({ layer: json.layer, success: false, error: 'Failed', mode: 'delete' }) }
    }).catch((error) => {
      this.orientedViewer.applyEdits({ layer: json.layer, success: false, error: error.message, mode: 'delete' })
    })
  }

  selectFeature = (featureJson) => {
    if (this.mapView.popup.visible) {
      this.mapView.closePopup()
    }

    const features = Object.keys(featureJson)
    const graphics = []
    let layer
    let count = features.length
    features.forEach((key) => {
      for (const b of this.vectorLayers) {
        if (b.title === key) {
          layer = this.mapView.map.findLayerById(b.id)
          break
        }
      }
      if (layer.popupEnabled && layer.visible) {
        layer.queryFeatures({
          objectIds: featureJson[key],
          outFields: ['*'],
          returnGeometry: true,
          returnZ: true,
          outSpatialReference: this.mapView.extent.spatialReference
        }).then((results) => {
          if (results.features.length) {
            for (const a in results.features) {
              results.features[a].geometry.spatialReference = this.mapView.extent.spatialReference
              graphics.push(new Graphic({
                attributes: results.features[a].attributes,
                layer: layer,
                geometry: layer.geometryType === 'point'
                  ? new Point(results.features[a].geometry)
                  : layer.geometryType === 'polyline'
                    ? new Polyline(results.features[a].geometry)
                    : new Polygon(results.features[a].geometry),
                popupTemplate: layer.popupTemplate
              }))
            }
            count--
            if (count === 0) {
              this.mapView.popup.location = graphics[0].geometry.type === 'polygon'
                ? graphics[0].geometry.centroid
                : graphics[0].geometry.type === 'polyline'
                  ? graphics[0].geometry.extent.center
                  : graphics[0].geometry
              this.mapView.openPopup({ features: graphics })
              this.featureSelected = featureJson
            }
          }
        }).bind(this).catch(() => {
          count--
          if (count === 0 && graphics.length) {
            this.mapView.popup.location = graphics[0].geometry.type === 'polygon'
              ? graphics[0].geometry.centroid
              : graphics[0].geometry.type === 'polyline'
                ? graphics[0].geometry.extent.center
                : graphics[0].geometry
            this.mapView.openPopup({ features: graphics })
            this.featureSelected = featureJson
          }
        }).bind(this)
      } else {
        count--
        if (count === 0 && graphics.length) {
          this.mapView.popup.location = graphics[0].geometry.type === 'polygon'
            ? graphics[0].geometry.centroid
            : graphics[0].geometry.type === 'polyline'
              ? graphics[0].geometry.extent.center
              : graphics[0].geometry
          this.mapView.openPopup({ features: graphics })
          this.featureSelected = featureJson
        }
      }
    })
  }

  showAttributeWindow = (layer, graphic, objectId, uniqueValueField) => {
    //var editingNode = domConstruct.toDom("<div id='formDiv'></div>");

    const editingNode = document.createElement('div')
    editingNode.setAttribute('id', 'formDiv')
    //editable field change
    const fieldInfos = []
    for (let i = 0; i < layer.fields.length; i++) {
      if (layer.fields[i].editable === true) {
        if (layer.fields[i].name !== 'ImgUrn' && layer.fields[i].name !== 'ImgGeom' && layer.fields[i].name !== uniqueValueField) {
          // fieldInfos.push({ name: layer.fields[i].name, label: layer.fields[i].name, editable: true })

          const fieldElement = new FieldElement({
            fieldName: layer.fields[i].name,
            label: layer.fields[i].name,
            editableExpression: 'true'
          })
          fieldInfos.push(fieldElement)
        }
      }
    }

    const formTemplate = new FormTemplate({
      elements: fieldInfos // Add all elements to the template
    })

    const featureForm = new FeatureForm({
      container: editingNode,
      layer: layer,
      feature: graphic,
      formTemplate: formTemplate
    })
    //editable field change

    setTimeout(() => { //#652
      const upbutton = document.createElement('button')
      upbutton.setAttribute('class', 'oi-btn-css oi-btn-css-clear')
      upbutton.innerHTML = this.nls('updateButton')
      upbutton.addEventListener('click', () => {
        if (featureForm) { featureForm.submit() }
      });
      (featureForm.container as any).appendChild(upbutton)
      const dlbutton = document.createElement('button')
      dlbutton.setAttribute('class', 'oi-btn-css oi-btn-css-clear')
      dlbutton.style.marginLeft = '10px'
      dlbutton.innerHTML = this.nls('deleteButton')
      dlbutton.addEventListener('click', () => {
        layer.applyEdits({ deleteFeatures: [{ objectId: objectId }] }).then((result) => {
          if (result.deleteFeatureResults.length) {
            this.orientedViewer.refreshVectorLayer(layer.title)
            this.mapView.popup.clear()
            this.mapView.closePopup()
          }
        })
      });
      (featureForm.container as any).appendChild(dlbutton)

      featureForm.on('submit', () => {
        const updated = featureForm.getValues()
        Object.keys(updated).forEach((name) => {
          graphic.attributes[name] = updated[name]
        })
        graphic.attributes[layer.objectIdField] = objectId
        const param = { updateFeatures: [graphic] }
        layer.applyEdits(param).then((result) => {
          if (result.updateFeatureResults.length) {
            this.mapView.popup.clear()
            this.mapView.closePopup()
          }
        })
      })
      if (fieldInfos.length > 0) {
        this.mapView.openPopup({ location: graphic.geometry, content: editingNode })
      }
    }, 500)
  }

  checkIfMapillary = (url: string) => {
    if (!url) return false
    const mapillaryUrl = 'https://graph.mapillary.com/images'
    try {
      const urlObj = new URL(url)
      return `${urlObj.origin}/images` === mapillaryUrl
    } catch {
      return false
    }
  }

  graphicSelected = (graphic) => {
    if (!this.hidePopup) {
      this.selectedGraphicProperties = null
      if (document.getElementById('viewGraphicBtn')) document.getElementById('viewGraphicBtn').style.display = 'none'
      if (graphic && graphic.layer && !this.checkIfMapillary(this.state.config.oic[this.oicList[0]].serviceUrl)) {
        if (this.featureSelected) { this.orientedViewer.deselectFeaturesInImage(this.featureSelected) }
        const temp = {}
        temp[graphic.layer.title] = [graphic.attributes[graphic.layer.objectIdField]]
        this.featureSelected = temp
        this.orientedViewer.selectFeaturesInImage(this.featureSelected)
        let imgUrnExists = false
        for (const b in graphic.layer.fields) {
          if (graphic.layer.fields[b].name === 'ImgUrn') {
            imgUrnExists = true
            break
          }
        }
        if (imgUrnExists) {
          for (const a of this.vectorLayers) {
            if (a.indexOf(graphic.layer.url) !== -1) {
              if (graphic.attributes.ImgUrn) {
                this.findImageInCatalog(graphic.attributes.ImgUrn, graphic, this.state.config.oic[this.state.selectedOIC].serviceUrl, temp)
              } else {
                const objectId = graphic.attributes[graphic.layer.objectIdField]
                const query = new Query()
                query.where = graphic.layer.objectIdField + '=' + objectId
                query.outFields = ['ImgUrn']
                query.returnGeometry = !graphic.geometry
                graphic.layer.queryFeatures(query).then((response) => {
                  if (response.features.length) {
                    if (response.features[0].geometry) {
                      graphic.geometry = response.features[0].geometry
                    }
                    this.findImageInCatalog(
                      response.features[0].attributes.ImgUrn,
                      graphic,
                      this.state.config.oic[this.state.selectedOIC].serviceUrl, temp
                    )
                  }
                })
              }
              break
            }
          }
        }
      }
    } else if (this.hidePopup) {
      this.hidePopup = false
      this.mapView.popup.clear()
      this.mapView.closePopup()
    }
  }

  findImageInCatalog = (imgUrn, graphic, serviceUrl, graphicId) => {
    const geometry = graphic.geometry
    if (imgUrn) {
      Layer.fromArcGISServerUrl({
        url: serviceUrl,
        properties: {
          visible: false
        }
      }).then((layerObject: any) => {
        layerObject.load().then((loaded) => {
          let globalId
          const fields = layerObject.fields
          let exposureId
          for (const a of fields) {
            if (a.type === 'global-id') {
              globalId = a.name
              break
            }
            if (a.name === 'ExposureID') { exposureId = 'ExposureID' }
          }
          if (globalId || exposureId) {
            const query = new Query()
            query.where = (globalId || exposureId) + ' = "' + imgUrn + '"'
            layerObject.queryObjectIds(query).then((response) => {
              if (response.length) {
                this.selectedGraphicProperties = { imgUrn: imgUrn, geometry: geometry, id: response[0], highlight: graphicId }
                if (document.getElementById('viewGraphicBtn')) document.getElementById('viewGraphicBtn').style.display = 'inline-block'
              }
            })
          } else {
            let serviceName
            if (serviceUrl.indexOf('/ImageServer') !== -1) {
              serviceName = (serviceUrl.split('/ImageServer')[0]).split('services/')[1]
            } else {
              serviceName = (serviceUrl.split('/FeatureServer')[0]).split('services/')[1]
            }
            const params = imgUrn.split('|')
            let serviceNameFlag, id
            if (params.length === 3) {
              serviceNameFlag = serviceName.indexOf(params[1]) !== -1
              id = params[2]
            } else if (params.length === 2) {
              serviceNameFlag = serviceName.indexOf(params[0]) !== -1
              id = params[1]
            } else {
              serviceNameFlag = false
              id = params[0]
            }

            if (serviceNameFlag) {
              this.selectedGraphicProperties = { imgUrn: imgUrn, geometry: geometry, id: id, highlight: graphicId }
              if (document.getElementById('viewGraphicBtn')) document.getElementById('viewGraphicBtn').style.display = 'inline-block'
            }
          }
        })
      })
    }
  }

  openImageInViewer = () => {
    if (this.selectedGraphicProperties && this.props.oiApiLoaded) { //#1000
      const url = this.state.config.oic[this.state.selectedOIC].itemUrl
      let point
      if (this.selectedGraphicProperties.geometry.type === 'point') { point = this.selectedGraphicProperties.geometry } else if (this.selectedGraphicProperties.geometry.type === 'polygon') { point = this.selectedGraphicProperties.geometry.centroid } else { point = this.selectedGraphicProperties.geometry.extent.center }

      point.z = 0
      this.selectedPoint = point.toJSON() //#596
      if (document.getElementById('viewGraphicBtn')) document.getElementById('viewGraphicBtn').style.display = 'none'

      if (this.mapView.type === '2d') {
        this.orientedViewer.searchImages(point.toJSON(), url, {
          token: {
            token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
            server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
          },
          // eslint-disable-next-line no-constant-binary-expression
          maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
          objectId: parseInt(this.selectedGraphicProperties.id),
          extent: this.mapView.extent.toJSON()
        })
      } else {
        this.orientedViewer.searchImages(point.toJSON(), url, {
          token: {
            token: this.preserveToken && this.preserveToken.token ? this.preserveToken.token : null,
            server: this.preserveToken && this.preserveToken.server ? this.preserveToken.server + '/sharing/rest' : null
          },
          // eslint-disable-next-line no-constant-binary-expression
          maxDistance: Number(this.state.config.oic[this.state.selectedOIC].itemUrl.properties.MaxDistance) ?? 1000,
          mapSize: { w: this.mapView.width, h: this.mapView.height },
          objectId: parseInt(this.selectedGraphicProperties.id),
          extent: this.mapView.extent.toJSON()
        })
      }
      this.orientedViewer.toggleEditTool({ layer: this.selectedGraphicProperties.graphicLayer, tool: 'display', state: true })
      this.orientedViewer.selectFeaturesInImage(this.selectedGraphicProperties.highlight)
    }
  }

  setCameraView = (att) => {
    //var def = new Deferred();
    return new Promise(function (resolve, reject) {
      if (att) {
        const point = new Point({
          x: att.location.x, y: att.location.y, spatialReference: new SpatialReference(att.location.spatialReference)
        })
        this.queryElevation(point).then((result) => {
          this.imageProperties.alt = result.geometry.z
          result.geometry.z += att.location.z

          let distAssetToSceneCamera = Math.sqrt(Math.pow(this.selectedAsset.z - this.mapView.camera.position.z, 2) +
            Math.pow(Math.sqrt(Math.pow(this.selectedAsset.x - this.mapView.camera.position.x, 2) +
              Math.pow(this.selectedAsset.y - this.mapView.camera.position.y, 2)) / this.WMSF, 2)) * this.WMSF

          const distAssetToExposurePoint = Math.sqrt(Math.pow(this.selectedAsset.z - result.geometry.z, 2) +
            Math.pow(Math.sqrt(Math.pow(this.selectedAsset.x - result.geometry.x, 2) +
              Math.pow(this.selectedAsset.y - result.geometry.y, 2)) / this.WMSF, 2)) * this.WMSF

          if (att.fov > this.mapView.camera.fov) { //828 issue fix
            distAssetToSceneCamera /= Math.pow(2, Math.abs(Math.round(Math.log(att.fov / this.mapView.camera.fov) / Math.log(2))))
          }
          let pt, fov
          if (distAssetToExposurePoint - distAssetToSceneCamera > 0) {
            pt = result.geometry
            fov = att.fov
            const fraction = distAssetToSceneCamera / distAssetToExposurePoint
            for (let b = 0; b < 15; b++) {
              const z1 = 1 / Math.pow(2, b)
              const z2 = 1 / Math.pow(2, b + 1)
              if (fraction <= z1 && fraction > z2) {
                if (Math.abs(fraction - z1) < Math.abs(fraction - z2)) {
                  fov *= z1
                } else {
                  fov *= z2
                }
                break
              }
            } //828 issue fix
          } else {
            pt = result.geometry
            fov = att.fov
          }
          const cam = new Camera({
            fov: fov,
            heading: att.yaw,
            tilt: att.pitch,
            position: pt
          })
          this.currentImageCameraLocation = result.geometry.clone()
          const camera = this.mapView.camera.clone()
          camera.fov = cam.fov
          //camera.heading = cam.heading; //camheading error fix //#969
          this.mapView.camera = camera
          this.mapView.goTo(cam, { easing: 'linear' }).then(() => { //#969
            resolve()
          })
        })
      }
    }.bind(this))
  }

  deleteImageInView = () => {
    this.imageInViewFlag = false
    this.graphicsLayer.graphics.removeAll()
    this.changeLayersVisibility(true)
    this.setViewConstraints({
      rotate: true
    })
  }

  toggleImageInView = (bool) => {
    this.displayImageInViewFlag = bool
    for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) { //#9677 issue fix
      if (this.graphicsLayer.graphics.getItemAt(s).attributes && this.graphicsLayer.graphics.getItemAt(s).attributes.id === 'oi-imageMesh') {
        this.graphicsLayer.graphics.getItemAt(s).visible = bool
        break
      }
    }
  }

  zoomImageInView = (scaleFactor, x, y) => {
    const camera = this.mapView.camera.clone()
    this.orientedViewer.zoomImageInView({
      width: this.mapView.width,
      height: this.mapView.height,
      x: x,
      y: y,
      fov: camera.fov,
      heading: camera.heading,
      tilt: camera.tilt,
      elevation: this.imageProperties.alt,
      position: camera.position,
      delta: scaleFactor
    })
  }

  panImageInView = (evt) => {
    const camera = this.mapView.camera.clone()
    this.orientedViewer.panImageInView({
      width: this.mapView.width,
      height: this.mapView.height,
      elevation: this.imageProperties.alt,
      heading: camera.heading,
      tilt: camera.tilt,
      action: evt.action,
      x: evt.x,
      y: evt.y,
      fov: camera.fov,
      position: camera.position
    })
  }

  updateViewCamera = (cameraProperties) => {
    const camera = this.mapView.camera.clone()
    camera.heading = cameraProperties.heading
    camera.tilt = cameraProperties.tilt
    camera.fov = cameraProperties.fov
    if (cameraProperties.elevation === 'relative-to-ground') {
      cameraProperties.location.z += this.imageProperties.alt
    }
    camera.position = cameraProperties.location
    this.mapView.camera = camera
  }

  updateImageInView = (response) => {
    const image = response.image.mesh.clone() //#771
    if (response.image.elevation === 'relative-to-ground') {
      const multipoint = this.createMultiPoint({ type: 'frustum', geometries: [response.image.mesh] })
      this.queryElevation(new Multipoint({ points: multipoint, spatialReference: this.mapView.spatialReference })).then((res) => {
        let cv = 0
        for (let dm = 2; dm < image.vertexAttributes.position.length; dm = dm + 3) {
          image.vertexAttributes.position[dm] += res.geometry.points[cv][2]
          cv++
        }

        for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) {
          if (this.graphicsLayer.graphics.getItemAt(s).attributes &&
            this.graphicsLayer.graphics.getItemAt(s).attributes.id === 'oi-imageMesh') {
            this.graphicsLayer.remove(this.graphicsLayer.graphics.getItemAt(s))
            break
          }
        }
        const graphic = new Graphic({
          geometry: image,
          symbol: { type: 'mesh-3d', symbolLayers: [{ type: 'fill' }] } as any,
          attributes: { id: 'oi-imageMesh' }
        })
        this.graphicsLayer.add(graphic)
      })
    } else {
      for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) {
        if (this.graphicsLayer.graphics.getItemAt(s).attributes &&
          this.graphicsLayer.graphics.getItemAt(s).attributes.id === 'oi-imageMesh') {
          this.graphicsLayer.remove(this.graphicsLayer.graphics.getItemAt(s))
          break
        }
      }
      const graphic = new Graphic({
        geometry: image,
        symbol: { type: 'mesh-3d', symbolLayers: [{ type: 'fill' }] } as any,
        attributes: { id: 'oi-imageMesh' }
      })
      this.graphicsLayer.add(graphic)
    }
  }

  createMultiPoint = (gJSON) => {
    const points = []
    if (gJSON.type === 'point') {
      for (const nm in gJSON.geometries) {
        points.push([gJSON.geometries[nm].x, gJSON.geometries[nm].y])
      }
      return points
    } else if (gJSON.type === 'frustum') {
      for (const nm in gJSON.geometries) {
        for (let gm = 0; gm < gJSON.geometries[nm].vertexAttributes.position.length; gm = gm + 3) {
          points.push([gJSON.geometries[nm].vertexAttributes.position[gm], gJSON.geometries[nm].vertexAttributes.position[gm + 1]])
        }
      }
      return points
    } else if (gJSON.type === 'polygon') {
      for (const nm in gJSON.geometries) {
        for (let gm = 0; gm < gJSON.geometries[nm].rings.length; gm++) {
          for (let mb = 0; mb < gJSON.geometries[nm].rings[gm].length; mb++) {
            points.push([gJSON.geometries[nm].rings[gm][mb][0], gJSON.geometries[nm].rings[gm][mb][1]])
          }
        }
      }
      return points
    }
  }

  addImageInView = (response) => {
    for (let s = this.graphicsLayer.graphics.length - 1; s >= 0; s--) {
      if (this.graphicsLayer.graphics.getItemAt(s).attributes &&
        this.graphicsLayer.graphics.getItemAt(s).attributes.id === 'oi-imageMesh') {
        this.graphicsLayer.remove(this.graphicsLayer.graphics.getItemAt(s))
        break
      }
    }
    if (response.image) {
      this.imageProperties = response.properties
      this.setViewConstraints({
        rotate: false
      })
      let multipoint = this.createMultiPoint({ type: 'point', geometries: response.imageSourcePoints })
      const multipoint2 = this.createMultiPoint({ type: 'frustum', geometries: response.coverageFrustums })
      multipoint = multipoint.concat(multipoint2)
      if (response.image.elevation === 'relative-to-ground') {
        const multipoint3 = this.createMultiPoint({ type: 'frustum', geometries: [response.image.mesh] })
        multipoint = multipoint.concat(multipoint3)
      }
      //multipoint = multipoint.concat(multipoint3);
      const image = response.image.mesh.clone() //#771
      //this.queryElevation(new Multipoint({ points: multipoint, spatialReference: this.mapView.spatialReference })).then((res) => { //#583 fix
      for (let cv = 0; cv < multipoint.length; cv++) { //583 issue fix
        if (cv < response.imageSourcePoints.length) {
          response.imageSourcePoints[cv].z += (this.avgGroundElevation || 0) //583 issue fix
        } else {
          for (let fm = 0; fm < response.coverageFrustums.length; fm++) {
            for (let dm = 2; dm < response.coverageFrustums[fm].vertexAttributes.position.length; dm = dm + 3) {
              response.coverageFrustums[fm].vertexAttributes.position[dm] += (this.avgGroundElevation || 0)//res.geometry.points[cv][2]; //583 issue fix
              cv++
            }
          }
          if (response.image.elevation === 'relative-to-ground') {
            for (let dm = 2; dm < image.vertexAttributes.position.length; dm = dm + 3) {
              image.vertexAttributes.position[dm] += (this.avgGroundElevation || 0)//res.geometry.points[cv][2]; //583 issue fix
              cv++
            }
          }
        }
      }
      this.imageInViewFlag = true
      const graphic = new Graphic({
        geometry: image,
        symbol: { type: 'mesh-3d', symbolLayers: [{ type: 'fill' }] } as any,
        attributes: { id: 'oi-imageMesh' }
      })
      graphic.visible = this.displayImageInViewFlag
      this.drawImageSourcePoints(response.imageSourcePoints, response.imageAttributes.imageID)
      //this.drawFrustums(response.coverageFrustums, response.imageAttributes.imageID);
      this.activeImageID = response.imageAttributes.imageID

      if (response.image.elevation === 'relative-to-ground') {
        const point = new Point({
          x: response.properties.location.x,
          y: response.properties.location.y,
          spatialReference: new SpatialReference(response.properties.location.spatialReference)
        })

        this.queryElevation(point).then((result) => {
          this.imageProperties.alt = result.geometry.z
          result.geometry.z += response.properties.location.z

          const cam = new Camera({
            fov: response.properties.fov,
            heading: response.properties.yaw,
            tilt: response.properties.pitch,
            position: result.geometry
          })
          const camera = this.mapView.camera.clone()
          camera.fov = cam.fov
          //camera.heading = cam.heading; //camheading error fix //#969
          this.mapView.camera = camera
          this.mapView.goTo(cam, { easing: 'linear' }).then(() => { //#969
            this.changeLayersVisibility(false)
            this.graphicsLayer.add(graphic)
          })
        })
      } else {
        const cam = new Camera({
          fov: response.properties.fov,
          heading: response.properties.yaw,
          tilt: response.properties.pitch,
          position: response.properties.location
        })
        const camera = this.mapView.camera.clone()
        camera.fov = cam.fov
        //camera.heading = cam.heading;//#969
        this.mapView.camera = camera
        this.mapView.goTo(cam, { easing: 'linear' }).then(() => { //#969
          this.changeLayersVisibility(false)
          this.graphicsLayer.add(graphic)
        })
      }
    }
  }

  queryElevation = (geometry): any => {
    return new Promise((resolve, reject) => {
      if (this.mapView.map.ground.layers.length) {
        this.mapView.map.ground.queryElevation(geometry).then((result) => {
          resolve(result)
        })
      } else {
        const geomClone = geometry.clone()
        if (geomClone.type === 'point') geomClone.z = 0
        else {
          for (let a = 0; a < geomClone.points.length; a++) {
            geomClone.points[a][2] = 0
          }
        }
        resolve({ geometry: geomClone })
      }
    })
  }

  setViewConstraints = (prop) => {
    if (!prop.rotate) {
      this.disableZoom()
    } else {
      this.enableZoom()
    }
  }

  changeLayersVisibility = (flag) => {
    // if (!flag) {
    //   this.layerVisibleStatus = { g: [], b: [], o: [] };
    // }
    // var gLayer = this.mapView.map.ground.layers.items;
    // var bLayer = this.mapView.map.basemap.baseLayers.items;
    // if (flag) {
    //   this.mapView.map.ground.opacity = 1;//this.layerVisibleStatus.g[0];
    //   if (this.layerVisibleStatus) {
    //     for (var a = 0; a < bLayer.length; a++) {
    //       bLayer[a].visible = this.layerVisibleStatus.b[a];
    //     }
    //   }

    // } else {
    //   this.mapView.map.ground.opacity = 0;
    //   for (var a = 0; a < bLayer.length; a++) {
    //     this.layerVisibleStatus.b.push(bLayer[a].visible);
    //     bLayer[a].visible = flag;
    //   }
    // }
    // var oLayer = this.mapView.map.layers.items;

    // for (var a = 0; a < oLayer.length; a++) {
    //   if (oLayer[a].id !== "oi-graphicsLayer" && oLayer[a].type !== "feature") {
    //     if (flag)
    //       oLayer[a].visible = this.layerVisibleStatus.o[a];
    //     else {
    //       this.layerVisibleStatus.o.push(oLayer[a].visible);
    //       oLayer[a].visible = flag;
    //     }
    //   }
    // }
  }

  disableZoom = () => {
    const zoomNode: any = document.getElementsByClassName('esri-component esri-zoom esri-widget')
    if (zoomNode.length) {
      zoomNode[0].style.display = 'none'
    }
    const stopEvtPropagation = function (evt) {
      evt.stopPropagation()
    }
    this.zoomHandlers = []
    this.zoomHandlers.push(this.mapView.on('mouse-wheel', (evt) => {
      evt.stopPropagation()
      if (evt.deltaY < 0) { this.zoomImageInView(-1, evt.x, evt.y) } else { this.zoomImageInView(1, evt.x, evt.y) }
    }))
    this.zoomHandlers.push(this.mapView.on('double-click', stopEvtPropagation))

    this.zoomHandlers.push(this.mapView.on('double-click', ['Control'], stopEvtPropagation))

    this.zoomHandlers.push(this.mapView.on('drag', (evt) => {
      evt.stopPropagation()
      this.panImageInView(evt)
    }))

    this.zoomHandlers.push(this.mapView.on('drag', ['Shift'], stopEvtPropagation))
    this.zoomHandlers.push(this.mapView.on('drag', ['Shift', 'Control'], stopEvtPropagation))
    this.zoomHandlers.push(this.mapView.on('key-down', (event) => {
      const prohibitedKeys = ['+', '-', 'Shift', '_', '=']
      const keyPressed = event.key
      if (prohibitedKeys.includes(keyPressed)) {
        event.stopPropagation()
        if (keyPressed === '+') { this.zoomImageInView(-1, this.mapView.width / 2, this.mapView.height / 2) } else if (keyPressed === '-') { this.zoomImageInView(1, this.mapView.width / 2, this.mapView.height / 2) }
      }
      if (keyPressed.slice(0, 5) === 'Arrow') {
        event.stopPropagation()
        this.panImageInView({ action: 'start', x: this.mapView.width / 2, y: this.mapView.height / 2 })
        if (keyPressed === 'ArrowLeft') { this.panImageInView({ action: 'end', x: this.mapView.width / 2 + 10, y: this.mapView.height / 2 }) } else if (keyPressed === 'ArrowRight') { this.panImageInView({ action: 'end', x: this.mapView.width / 2 - 10, y: this.mapView.height / 2 }) } else if (keyPressed === 'ArrowUp') { this.panImageInView({ action: 'end', x: this.mapView.width / 2, y: this.mapView.height / 2 + 10 }) } else if (keyPressed === 'ArrowDown') { this.panImageInView({ action: 'end', x: this.mapView.width / 2, y: this.mapView.height / 2 - 10 }) }
      }
    }))
  }

  enableZoom = () => {
    const zoomNode: any = document.getElementsByClassName('esri-component esri-zoom esri-widget')
    if (zoomNode.length) {
      zoomNode[0].style.display = 'block'
    }
    for (const a of this.zoomHandlers) {
      a.remove()
    }
    this.zoomHandlers = []
  }

  setViewMode = (value) => {
    this.graphicsLayer.graphics.removeAll()
    if (!value) {
      if (this.imageInViewFlag) {
        this.deleteImageInView()
      }
    }
  }

  setupResizeHandle = ({ width, height }) => {
    if (height && width) { //#840 #8283
      this.oiviewerRef.current.style.height = 'calc(100% - 1px)'
      this.oiviewerRef.current.style.width = 'calc(100% - 1px)'
      this.orientedViewer?.resize()
    }
  }

  render () {
    let content = null
    const classes = classNames(
      'oi-btn-css',
      'oi-btn-css-clear',
      'oi-btn-css-grouped',
      'oi-widget-selectBtn',
      this.props.pointBool ? 'oi-widget-selectBtnSelected' : ''
    )
    if (!this.isConfigured()) {
      //#7139
      // this.oiviewerRef.current.classList.add('hide');
      this.destroyOIViewer()
      content = <div className='widget-orientedimagery'>
      <WidgetPlaceholder icon={oiIcon} message={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} />
    </div>
    } else {
      content = <div className='widget-orientedimagery'>
      <Button ref={this.selectBtnRef} aria-label={this.props.pointBool ? this.nls('toggleButtonOn') : this.nls('toggleButtonOff')} title={this.props.pointBool ? this.nls('toggleButtonOn') : this.nls('toggleButtonOff')}
        className={classes}
        onClick={this.toggleIcon.bind(this)}>
        <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'
          viewBox='0 0 32 32' className='svg-icon'>
          <path d='M15.999 0C11.214 0 8 1.805 8 6.5v17l7.999 8.5L24 23.5v-17C24 1.805 20.786 0 15.999 0zM16 14.402A4.4 4.4 0 0 1 11.601 10a4.4 4.4 0 1 1 8.798 0A4.4 4.4 0 0 1 16 14.402z' />
        </svg>
      </Button>
      <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange}>
      </JimuMapViewComponent>
        <div ref={this.oiviewerRef}>

      {/* <div className='oic-click-btn'> */}

        {/* <label className='oi-label'>{this.state.OICname}</label> */}
      {/* </div> */}

      <button className='oi-btn-css oi-btn-css-transparent' style={{ display: 'none', marginTop: '5px' }} id='viewGraphicBtn'>
        {this.nls('viewImage')}
      </button>
    {/* Loading Indicator */}

      <ReactResizeDetector targetRef={this.oiviewerRef} handleWidth handleHeight onResize={this.setupResizeHandle}></ReactResizeDetector>
      </div>
      {this.state.showLoading && <Loading type={LoadingType.Donut} />}
      </div>
    }

    return <div css={getStyle(this.props.theme)} className='jimu-widget'>
      {content}
    </div>
  }
}
