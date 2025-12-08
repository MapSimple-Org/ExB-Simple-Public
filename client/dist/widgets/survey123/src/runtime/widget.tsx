/** @jsx jsx */
import {
  React, DataSourceManager, SessionManager, DataSourceStatus, Immutable, getAppStore, type IMUrlParameters, type IMState, portalUrlUtils,
  type AllWidgetProps, jsx, moduleLoader, semver, DataSourceComponent, AllDataSourceTypes
} from 'jimu-core'

import { WidgetPlaceholder } from 'jimu-ui'
import type { IMConfig } from '../config'
// import { ArcGISDataSourceTypes, type JimuMapView } from 'jimu-arcgis'
import { survey123Service } from '../service/survey123.service'
import { getStyle } from './css/style'
import defaultMessages from './translations/default'
import WidgetIcon from 'jimu-icons/svg/outlined/brand/widget-survey.svg'

import type Extent from 'esri/geometry/Extent'
import * as query from 'esri/rest/query'
import Query from 'esri/rest/support/Query'

import SpatialReference from 'esri/geometry/SpatialReference'
interface ExtraProps {
  queryObject: IMUrlParameters
}
/**
 * survey123 widget
 */
export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, any> {
  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      queryObject: state.queryObject
    }
  }

  /**
   * survey123webform iframe
   */
  public survey123webform: any
  public webform: any // the instance of survey123 webform from jsapi
  public iframeContainer: any
  public API: any = {
    Survey123WebForm: null
  }

  public domId: string
  // the web app status
  // todo: need to change the default webappStatus to: 'loading'
  public webappStatus: 'normal' | 'thankyouScreen' | 'error' | 'loading' = 'normal'
  // showDiffLog = true;

  public state = {
    featureLayerViewDS: null
  }

  private readonly _dsManager = DataSourceManager.getInstance()
  // private _mapView: __esri.MapView
  private _formOption: any
  private _clientId: any
  private _cachedUniqueId: string // cached unique id to help to determin when to refresh the webform
  private _currentGlobalId: string
  // private _extentWatch: __esri.WatchHandle;
  // private _cachedTimeStamp: number = this.props.config.timestamp;
  private _isClearSelectionFreezing: boolean

  constructor (props) {
    super(props)
    this.getClientId()

    /**
     * listen survey123 webform event
     */
    this.listenSurvey123WebformEvent()
  }

  componentDidMount () {
    survey123Service.setQueryObject(this.props.queryObject)
    this.prepare() //this.loadSurveyAPI();
  }

  /**
   * prepare:
   * get survey123 host url from portal's config.js
   * load survey123 js api
   */
  prepare = () => {
    const portalUrl = this.props.config.portalUrl || this.props.portalUrl || 'https://www.arcgis.com'
    const isPortal = !(portalUrlUtils.isAGOLDomain(portalUrl))
    return Promise.resolve(true)
      .then(() => {
        if (isPortal) {
          return survey123Service.getSurveyHostUrlFromPortal(portalUrl)
        }
        return true
      })
    /**
     * load survey client api
     */
      .then(() => {
        return this.loadSurveyAPI()
      })
  }

  // load survey api
  loadSurveyAPI = () => {
    const apiUrl = survey123Service.getSurvey123HostAPIUrl()
    if (!this.API.Survey123WebForm) {
      return moduleLoader.loadModule(apiUrl)
        .then((data) => {
          if (data && data.Survey123WebForm) {
            this.API = data
          } else {
            this.API.Survey123WebForm = data
          }
          return this.API.Survey123WebForm
        })
    } else {
      return Promise.resolve(this.API.Survey123WebForm)
    }
  }

  updateDomId = () => {
    const randomId = ((Math.random() * 1000000) | 0).toString()
    this.domId = 'survey_container_' + this.props.id + '_' + randomId
    return this.domId
  }

  /**
   * get used data source
   */
  getUsedDataSource () {
    const dataSources = this.props.useDataSources
    let ds = null

    if (dataSources && dataSources.length > 0) {
      const dataSourceId = dataSources[0].dataSourceId
      ds = this._dsManager.getDataSource(dataSourceId)
    }
    return ds
  }

  /**
   * get globalId field name from the data source layer
   * if no globalId field, fallback to the object id field
   */
  getUniqueFieldName (fallbackToObjectId?) {
    const ds = this.getUsedDataSource()
    const layer = ds ? ds.getLayerDefinition() : null
    if (!layer) {
      return ''
    }

    let globalIdField = layer.globalIdField
    const objectIdField = layer.objectIdField
    if (globalIdField) {
      return globalIdField
    } else if (fallbackToObjectId && objectIdField) {
      return objectIdField
    }

    // no globalIdField or objectIdField in the layer definition, but it exits in fact, try to find it.
    // sample layer: https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/MapServer/0
    globalIdField = layer.fields.find((field) => {
      return field.type === 'esriFieldTypeGlobalID'
    })?.name

    if (globalIdField) {
      return globalIdField
    } else if (fallbackToObjectId) {
      return layer.fields.find((field) => {
        return field.type === 'esriFieldTypeOID'
      })?.name
    }
  }

  /**
   * isDsConfigured
   */
  isDsConfigured = () => {
    const mode = this.props.config.mode || 'new'
    if (this.props.useDataSources &&
      this.props.useDataSources.length === 1 && (this.props.config.activeLinkData || mode === 'edit' || mode === 'view')) {
      return true
    }
    return false
  }

  /**
   * do feature layer query to get layer's features in the map extent
   */
  doQuery = (extent: Extent) => {
    const q = {
      geometry: extent,
      spatialRelationship: 'intersects',
      returnGeometry: true
    }
    if (this.getUsedDataSource().getStatus() !== DataSourceStatus.Loading) {
      this.getUsedDataSource().load(q)
    }
  }

  /**
   * feature layer view handler
   */
  featureLayerViewHandler (graphic: any, ds?: any) {
    return Promise.resolve(true)
      .then(() => {
        if (graphic) {
          return graphic
        }
        if (ds && ds.getSelectedRecords()) {
          return this.getSelectedDsRecord(ds)
        }
      })
      .then((feature) => {
        if (!feature) {
          return
        }

        const mode = this.props.config.mode || 'new'

        /**
         * 'new' mode
         */
        // let feature = (selectedRecords[0] as FeatureDataRecord).feature;
        if (mode === 'new' && this.props.config.activeLinkData && this.props.config.fieldQuestionMapping) {
          const attr = feature.attributes || {} // the attribute of the selected record
          const dataParams = {}
          this.props.config.fieldQuestionMapping.forEach((item) => {
            const field = item.field
            const questionName = item.question
            if (field === 'geometry') {
              const geometry: any = feature.geometry
              // GeoPoint
              if (geometry && (geometry.y || geometry.y === 0) && (geometry.x || geometry.x === 0)) {
                dataParams[questionName] = geometry
                if ((geometry.longitude || geometry.longitude === 0) && (geometry.latitude || geometry.latitude === 0)) {
                  dataParams[questionName] = {
                    x: geometry.longitude,
                    y: geometry.latitude
                  }
                }
                /**
                 * note: we shouldn't check "geometry.type" here,
                 * because sometimes the selected feature from dataSource is not an JSAPI-type geometry,
                 * and the geometry has no type property(https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm)
                 */
              } else if (geometry && geometry.paths && geometry.paths.length) {
                // Polyline
                dataParams[questionName] = geometry
              } else if (geometry && geometry.rings && geometry.rings.length) {
                // Polygon
                dataParams[questionName] = geometry
              }
              if (dataParams[questionName]?.toJSON) {
                dataParams[questionName] = dataParams[questionName].toJSON()
              }
            } else {
              const val = attr[field]
              dataParams[questionName] = field in attr ? val : ''
            }
          })
          this.sendValueFromMapToSurvey(dataParams)
          // this._cachedUniqueId = this._currentGlobalId
          const uniqueId = this.getFeatureUniqueId(feature, true)
          if (uniqueId) {
            this._cachedUniqueId = uniqueId
          }
        } else if (mode === 'view' || mode === 'edit') {
          this._currentGlobalId = ''
          const globalId = this.getFeatureUniqueId(feature)
          if (globalId) {
            this._currentGlobalId = globalId
          } else {
            console.log('The global id field is not existing in the source layer')
            return
          }
          this.renderDS() // refresh the webapp
          this._cachedUniqueId = this._currentGlobalId
        }
      })
  }

  sendValueFromMapToSurvey (dataParams) {
    if (this.webappStatus === 'loading') {
      // skip
    } else if (this.webappStatus === 'normal') {
      if (!this.webform) {
        return
      }
      if (dataParams) {
        // call survey jsapi to change value on-fly
        this.webform.setQuestionValue(dataParams)
      }
    } else if (this.webappStatus === 'thankyouScreen') {
      const options = this.buildWebFormConfig({
        setQuestionValue: dataParams
      })
      this.createWebForm(options)
    }
  }

  /**
   * listen survey123 webform event by iframe message
   */
  listenSurvey123WebformEvent () {
    const eventHandler = (evt: any) => {
      if (evt && evt.data) {
        let payload
        try {
          if (typeof evt.data === 'string') {
            payload = JSON.parse(evt.data)
          } else if (evt.data && evt.data.payload) {
            if (typeof evt.data.payload === 'string') {
              payload = JSON.parse(evt.data.payload)
            } else {
              payload = evt.data.payload
            }
          } else {
            payload = evt.data
          }
        } catch (err) {
          console.error(err)
        }
        // console.log(payload)
        const event = payload.event
        const data = payload.data

        if (event === 'survey123:onFormLoaded') {
          if (event === 'survey123:onFormLoaded' && payload.contentHeight) {
            /**
             * set iframe height
             */
            // this.iframeContainer.style.height = `${payload.contentHeight - 50}px`;
            // this.iframeContainer.style['padding-bottom'] = 'auto';
          }
        }

        if (event === 'survey123:onSubmitted') {
          console.log('survey123:onSubmitted!', data)
        }
      }
    }

    if (window.addEventListener) {
      window.addEventListener('message', eventHandler, false)
    } else {
      (window as any).attachEvent('onmessage', eventHandler)
    }
  }

  /**
   * get client id (for webform js api)
   */
  getClientId () {
    const session = SessionManager.getInstance().getMainSession()
    this._clientId = ''
    // should we send client id to webform id when the clientId is 'experienceBuilder'?
    if (session && session.clientId) {
    // if (session && session.clientId && session.clientId !== 'experienceBuilder') {
      this._clientId = session.clientId
    } else if (getAppStore().getState().appConfig?.attributes?.clientId) {
      this._clientId = getAppStore().getState().appConfig.attributes.clientId
    }
  }

  getFeatureUniqueId (feature, fallbackToObjectId?) {
    if (!feature) {
      return null
    }
    const attr = feature.attributes || {} // the attribute of the selected record
    const fieldName = this.getUniqueFieldName(fallbackToObjectId)
    if (fieldName) {
      return attr[fieldName]
    } else {
      return null
    }
  }

  /**
   * create/update webform
   * @param options
   */
  createWebForm (options) {
    const formNode = document.querySelector('#' + this.domId)
    if (formNode) {
      document.querySelector('#' + this.domId).innerHTML = '' // clear the webform and reload
      this.webform = null
    }

    this.webappStatus = 'loading'
    this.webform = new this.API.Survey123WebForm(options)
  }

  /**
   * build config for survey jsapi
   */
  buildWebFormConfig (postProcess?: any) {
    const config = this.props.config

    const option: any = {
      clientId: this._clientId || 'survey123hub',
      container: this.domId || this.updateDomId(),
      itemId: config.surveyItemId,
      // portalUrl: 'https://devext.arcgis.com',
      // token: '',
      // hideElements: ['navbar'],
      // autoRefresh: 3,
      // eslint-disable-next-line no-self-compare
      isDebugMode: 'production' !== 'production',
      stringKeyMapping: {
        'hubOpen.viewGIDCannotWorkErrMsg':{
          value: 'hubOpen.viewGIDCannotWorkErrMsg2',
          type: 'key'
        },
        'hubOpen.editGIDCannotWorkErrMsg':{
          value: 'hubOpen.editGIDCannotWorkErrMsg2',
          type: 'key'
        }
      }
      // defaultValue: {
      //   'field_1': 'werewrwewer'
      // },
    }

    // portal url
    const portalUrl = config.portalUrl || this.props.portalUrl || 'https://www.arcgis.com'
    option.portalUrl = portalUrl

    // token
    const token = SessionManager.getInstance().getMainSession()?.token
    if (token) {
      option.portalUrl = portalUrl
      option.token = token
    }

    // autoRefresh
    const originExbVersion = getAppStore().getState().appConfig.originExbVersion
    const isOldVersion = semver.lt(originExbVersion, window.jimuConfig.isInPortal ? '1.8.0' : '1.9.0')
    if (isOldVersion) {
      option.autoRefresh = 3
    }

    /**
     * hide url params
     */
    const hides = config.hides || Immutable(['navbar', 'header', 'description', 'footer', 'theme'])
    if (hides.length > 0) {
      option.hideElements = hides
    }

    /**
     * default value
     */
    const defaultValue = config.defaultValue
    if (defaultValue && typeof defaultValue === 'object' && defaultValue !== null && defaultValue !== undefined) {
      option.defaultValue = defaultValue
    }

    /**
     * mode: edit/view
     */
    if (config.mode === 'edit' || config.mode === 'view') {
      option.mode = config.mode
      option.globalId = this._currentGlobalId || ''
    }


    // surveyStatusCode will change after survey republished
    const code = this.props.stateProps ? this.props.stateProps.surveyStatusCode : 0
    if (code) {
      option.surveyStatusCode = code
    }

    /**
     * add event listener, all the event listener is to detect the current webapp status
     * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/4092
     */
    option.onFormLoaded = (data) => {
      this.updateIframeTitle()
      this.webappStatus = 'normal'
      if (postProcess) {
        this.sendValueFromMapToSurvey(postProcess.setQuestionValue)
      } else if (this.webappStatus === 'normal') {
        /**
         * After webapp loaded, if the current linked data source has selection, send the selection records from map to survey
         * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/10494
         */
        const linkedDataSource = this.getUsedDataSource()
        if (linkedDataSource) {
          this.featureLayerViewHandler(null, linkedDataSource)
        }
      }
    }
    option.onFormSubmitted = (data) => {
      this.webappStatus = 'thankyouScreen'
      /**
       * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/13375
       */
      if (data.error) {
        return
      }
      survey123Service.updateRelatedDataSources(config.surveyItemId, config.mode)
    }
    option.onFormFailed = (err) => {
      this.webappStatus = 'error'
      this.updateIframeTitle()
    }

    return option
  }

  /**
   * get webform url
   */
  getWebformUrl (): string {
    const config = this.props.config

    /**
     * params
     */
    const surveyItemId = config.surveyItemId
    const portalUrl = config.portalUrl || this.props.portalUrl || 'https://www.arcgis.com'
    let webformUrl: string = null

    if (surveyItemId) {
      /**
     * url params
     */
      const urlParams: string[] = []

      /**
       * portalUrl
       */
      if (portalUrl !== 'https://www.arcgis.com') {
        urlParams.push(`portalUrl=${portalUrl}`)
      }
      if (survey123Service.getSurvey123HostUrl() === 'https://survey123dev.arcgis.com' && portalUrl === 'https://www.arcgis.com') {
        urlParams.push(`portalUrl=${portalUrl}`)
      }

      /**
       * embed url params
       */
      let embeds = config.embeds || [] // || ['fullScreen', 'onSubmitted', 'associatedMap'];
      if (!embeds.includes('jsapi')) {
        embeds = embeds.concat(['jsapi']) // from 3.7, we must to add embed=jsapi to let postMessage: setParams work
      }
      if (!embeds.includes('onSubmitted')) {
        embeds = embeds.concat(['onSubmitted'])
      }
      if (embeds.length > 0) {
        urlParams.push(`embed=${embeds.join(',')}`)
      }

      /**
       * hide url params
       */
      const hides = config.hides || ['navbar', 'header', 'description', 'footer', 'theme']
      if (hides.length > 0) {
        urlParams.push(`hide=${hides.join(',')}`)
      }

      /**
       * default value
       */
      const defaultValue = config.defaultValue
      if (defaultValue && typeof defaultValue === 'object' && defaultValue !== null && defaultValue !== undefined) {
        Object.keys(defaultValue).forEach((key) => {
          urlParams.push(`field:${key}=${defaultValue[key]}`)
        })
      }

      /**
       * open mode
       */
      const open = config.open || 'web'
      const openWhiteLists = ['web', 'menu', 'native']
      if (open && open !== 'web' && openWhiteLists.includes(open)) {
        urlParams.push(`open=${open}`)
      }

      /**
       * token
       * we can add token in url params to avoid login in survey123 webform
       * TODO:
       * need to ask Junshan how to get user token in the widget
       */
      const token = SessionManager.getInstance().getMainSession()?.token
      if (token) {
        urlParams.push(`token=${token}`)
      }


      /**
       * need to set version >=3.2 to use hide and embed params
       */
      // urlParams.push('version=latest');

      /**
       * add autoRefresh=3
       * to auto refresh in 3s after submit
       */
      urlParams.push('autoRefresh=3')

      /**
       * add timestamp randon params to ensure the iframe can refresh correctly
       * only when timestamp is different
       */
      // let configTimestamp = config.timestamp;
      // if (configTimestamp && this._cachedTimeStamp !== configTimestamp) {
      //   this._cachedTimeStamp = configTimestamp;
      // }
      // urlParams.push(`timestamp=${this._cachedTimeStamp}`);

      /**
       * webform url
       */
      webformUrl = survey123Service.getSurvey123WebformUrl(surveyItemId, {
        queryParams: urlParams
      })
    }

    return webformUrl
  }

  /**
   * data source renderer
   */
  // dataRender = (ds: DataSource) => {
  //   /**
  //    * if mapView datasource
  //    */
  //   if (ds.type === ArcGISDataSourceTypes.WebMap) {
  //     this.mapViewHandler(ds)
  //   }

  //   /**
  //    * if featurelayerView datasource
  //    */
  //   if (ds.type === DataSourceTypes.FeatureLayer) {
  //     this.featureLayerViewHandler(null, ds)
  //   }

  //   return <div></div>
  // }

  /**
   * check the webform option change
   */
  checkWebformOptionChanged = (newOption) => {
    const cachedOption = this._formOption
    if (Object.is(cachedOption, newOption)) {
      return false
    }
    if (!cachedOption && newOption) {
      return true
    }
    if (cachedOption.itemId !== newOption.itemId ||
      cachedOption.surveyItemId !== newOption.surveyItemId ||
      cachedOption.portalUrl !== newOption.portalUrl ||
      cachedOption.token !== newOption.token ||
      cachedOption.surveyStatusCode !== newOption.surveyStatusCode ||
      (cachedOption.mode || 'new') !== (newOption.mode || 'new') ||
      ((newOption.mode === 'edit' || newOption.mode === 'view') && this._cachedUniqueId !== this._currentGlobalId) ||
      (cachedOption.hideElements ? cachedOption.hideElements.asMutable() : []).sort().join(',') !== (newOption.hideElements ? newOption.hideElements.asMutable() : []).sort().join(',')) {
      return true
    }
    return false
  }

  /**
   * update style
   */
  updateStyle = () => {
    // only for safari
    const ua = window.jimuUA.browser ? (window.jimuUA.browser.name + '').toLowerCase() : ''
    if (ua === 'safari') {
      const formNode: any = document.querySelector('#' + this.domId)
      formNode.style.cssText = 'overflow-y: auto;'
      const rootNode = formNode.closest('.widget-content')
      rootNode.style.cssText = 'position: absolute;'
    }
  }

  /**
   * get selected record from the data source
   * if the geometry spatial reference is not web mercator or WGS84,
   * send a request to get a new geometry by specifiy the returned wkid as 4326
   */
  getSelectedDsRecord = (ds) => {
    if (!ds) {
      return Promise.resolve(null)
    }
    const record = ds.getSelectedRecords()
    if (!record || !record.length || !(record[0].feature)) {
      return Promise.resolve(null)
    }

    const feature = record[0].feature
    /**
     * #18266, if there are fields missing, need to query for all fields
     */
    let hasMissingFields: boolean = false
    const mode = this.props.config.mode || 'new'
    let requiredFields: any = []
    if (mode === 'new' && this.props.config.activeLinkData && this.props.config.fieldQuestionMapping) {
      this.props.config.fieldQuestionMapping.forEach((item: any) => {
        requiredFields.push(item.field)
      })
    } else if (mode === 'view' || mode === 'edit') {
      const globalIdField = this.getUniqueFieldName()
      requiredFields = globalIdField ? [globalIdField] : []
    }

    if (feature.attributes) {
      const currentFields = Object.keys(feature.attributes)
      hasMissingFields = requiredFields.find((field) => {
        return !(currentFields.includes(field))
      })
    }

    if (!hasMissingFields) {
      let sr = feature.geometry?.spatialReference
      if (!sr) {
        return Promise.resolve(feature)
      }

      sr = new SpatialReference(typeof sr.toJSON === 'function' ? sr.toJSON() : sr)
      // #14676, for polygon/polyline, if the geometry is web mercator, we still need to send request
      if (sr.isWGS84) {
        return Promise.resolve(feature)
      }

      // point type and the gemetry is AGSJSAPI-type and the longitude/latitude is existing
      if ((feature.geometry.longitude || feature.geometry.longitude === 0) && (feature.geometry.latitude || feature.geometry.latitude === 0)) {
        return Promise.resolve(feature)
      }
    }

    // the spatial reference is not web mercator or WGS84, send a request to get a converted WGS84 geoemtry
    if (!ds.url) {
      return Promise.resolve(feature)
    }
    const idField = ds.getIdField() || 'objectid'
    const queryOption = new Query({
      where: `${idField} = ${feature.attributes[idField]}`,
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: new SpatialReference({ wkid: 4326 })
    })

    return query.executeQueryJSON(ds.url, queryOption).then((results) => {
      if (results.features && results.features[0]) {
        return results.features[0]
      }
      return feature
    })
  }

  onDataSourceCreated = () => null

  onDataSourceInfoChange = () => {
    const dataSource = this._dsManager.getDataSource(this.props.useDataSources[0].dataSourceId)
    if (dataSource) {
      const isPreserveMode = this.props.config.selectionChangeBehavior === 'preserve'
      const mode = this.props.config.mode || 'new'
      const dataLinkEnabled = mode === 'new' && this.props.config.activeLinkData && this.props.config.fieldQuestionMapping
      const isViewOrEdit = mode === 'view' || mode === 'edit'

      // call the sync function getSelectedRecordshere to detect whether need to send feature to survey
      const record = dataSource.getSelectedRecords()
      if (record && record.length) {
        const feature = (record[0] as any).feature
        const mode = this.props.config.mode || 'new'

        const uniqueId = this.getFeatureUniqueId(feature, mode === 'new')
        if (!uniqueId || uniqueId !== this._cachedUniqueId) {
          // #5699, if the source layer is scene layer, it's not necessary to send request to get geometry with specified wkid
          const isSceneLayer = dataSource.type === AllDataSourceTypes.SceneLayer
          Promise.resolve(true).then(() => {
            // call the async function getSelectedDsRecord here because maybe a new request is needed
            return isSceneLayer ? feature : this.getSelectedDsRecord(dataSource)
          }).then((feature) => {
            // The this._isClearSelectionFreezing value being true only happens after switching selection from map widget
            if (!isPreserveMode && dataLinkEnabled && !this._isClearSelectionFreezing && this._cachedUniqueId) {
              this.refreshWebapp()
            }
            this.featureLayerViewHandler(feature)
          })
        }
      } else {
        // after data selection cleared
        if (isPreserveMode) {
          // clear data source, because every re-select event is combined by "clear" and "select", so we have to set a freeze status here, otherwise the webapp will refresh after changing selection.
          this._isClearSelectionFreezing = true
          setTimeout(() => {
            this._isClearSelectionFreezing = false
          }, 1700)

          if (dataLinkEnabled || isViewOrEdit) {
            if (this._cachedUniqueId) {
              setTimeout(() => {
                if (!(dataSource.getSelectedRecords()?.length) && !this._isClearSelectionFreezing) {
                  if (isViewOrEdit) {
                    this._currentGlobalId = ''
                  }
                  // clear values
                  this.clearQuestionValue()
                  this._cachedUniqueId = ''
                }
              }, 1800)
            }
          }
          return
        }
        // refresh mode
        // clear data source, because every re-select event is combined by "clear" and "select", so we have to set a freeze status here, otherwise the webapp will refresh after changing selection.
        if (dataLinkEnabled || isViewOrEdit) {
            if (isViewOrEdit) {
              this._currentGlobalId = ''
            }
            this.refreshWebapp()
            this._cachedUniqueId = ''
          }
      }
    }
  }

  /**
   * refresh webapp
   */
  refreshWebapp() {
    this.renderDS(true)
  }

  // clear question value
  clearQuestionValue () {
    const dataParams: any = {}
    this.props.config.fieldQuestionMapping.forEach((item) => {
      const questionName = item.question
      dataParams[questionName] = ''
    })
    this.sendValueFromMapToSurvey(dataParams)
  }

  // update iframe title
  updateIframeTitle() {
    const title = this.props.a11yLabel || this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })
    const webappIframe = this.iframeContainer?.querySelector('iframe')
    if (webappIframe) {
      webappIframe.title = title
    }
  }

  /**
   * render ds
   */
  renderDS (refreshWebform?: boolean) {
    const { id } = this.props
    let useDataSource = null
    /**
     * because we're now calling the survey jsapi to create/updat the survey webform
     * we need to detect webform option change
     * if the the surveyId/hideElements/token/portalUrl is changed, we should recreate the webform
     * if the default value changed, or the entire option is not changed at all, do not recreate the webform
     */
    let dsId = null
    let rootDsId = null
    const options = this.buildWebFormConfig()
    if (this.isDsConfigured()) {
      /**
       * get used data source
       */
      dsId = this.props.useDataSources[0].dataSourceId
      rootDsId = this.props.useDataSources[0].rootDataSourceId
      useDataSource = this.props.useDataSources[0]
    }
    const needRecreateWebform = refreshWebform ? true : this.checkWebformOptionChanged(options)
    this._formOption = options
    const webformUrl = this.getWebformUrl()

    this.prepare().then(() => {
      if (webformUrl && (!this.webform || needRecreateWebform)) {
        this.createWebForm(options)
        this.updateStyle()
        return true
      }
    })

    if (dsId && rootDsId && this.isDsConfigured()) {
      return <DataSourceComponent
      widgetId={id}
      useDataSource={Immutable(useDataSource)}
      onDataSourceCreated={this.onDataSourceCreated}
      onDataSourceInfoChange={this.onDataSourceInfoChange}
      // onQueryRequired={this.onQueryRequired}
    />

      // return <DataSourceComponent useDataSource={this.props.useDataSources[0]}>
      //   {
      //     this.dataRender
      //   }
      // </DataSourceComponent>
      // return <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange} ></JimuMapViewComponent>
    }

    return <div></div>
  }

  /**
   * render
   */
  render () {
    survey123Service.setQueryObject(this.props.queryObject)
    const webformUrl = this.getWebformUrl()
    // let options = this.buildWebFormConfig();
    let result

    /**
     * if no webformUrl
     */
    if (!webformUrl) {
      result = <div className="survey123__noSurvey">
        <WidgetPlaceholder
          icon={WidgetIcon}
          name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })}
          widgetId={this.props.id}/>
      </div>
    } else {
      if (!this.domId) {
        this.updateDomId()
      }
      result = <div className="survey123__webform">
                  <div className="embed-container" ref={(f) => { this.iframeContainer = f } } id={this.domId}></div>
                </div>
      // update iframe title after the acessible label changed
      this.updateIframeTitle()
    }

    /**
     * html
     */
    return <div css={getStyle(this.props.theme)} className="survey123">
      {
        result
      }
      {
        /*
         * render ds
         */
        this.renderDS()
      }
    </div>
  }
}
