import { getAppStore, SessionManager, portalUrlUtils, esri, DataSourceManager } from 'jimu-core'
import type { HTTPMethods } from '@esri/arcgis-rest-request'
/**
 * survey123 common params
 */
export interface Survey123CommonParams {
  username?: string
  token?: string
  f?: string
  portalUrl?: string
}
export interface SearchParam {
  /**
   * The query string to search the groups against.
   */
  q?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  start?: number
  /**
   * The maximum number of results to be included in the result set response.
   * The default value is 10, and the maximum allowed value is 100.
   */
  num?: number
}

/**
 * survey123 iframe message
 */
export interface Survey123Message {
  event: string
  data: any
}

/**
 * survey123 service
 */
export class Survey123Service {
  private queryObj: any
  private surveyUrlFromPortal: string

  // cache to store the survey related feature service
  private surveyFeatureServices = {}
  private _commonParams: Survey123CommonParams = {}

  public setQueryObject (obj) {
    const objStr = obj ? obj.survey123 : ''
    const urlString = objStr ? decodeURIComponent(objStr + '') : ''
    const val = this._urlParamToJson(urlString)
    this.queryObj = val
  }

  constructor() {
    this.setCommonParams()
  }
  /**
   * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/4659
   * get survey host url from portal's config.js file
   * @param portalUrl
   */
  public getSurveyHostUrlFromPortal (portalUrl: string) {
    portalUrl = portalUrl || 'https://www.arcgis.com'
    // read cache from this.surveyUrlFromPortal
    if (this.surveyUrlFromPortal || this.surveyUrlFromPortal === null) {
      return Promise.resolve(this.surveyUrlFromPortal)
    }

    if (!(portalUrl.endsWith('/'))) {
      portalUrl += '/'
    }
    const configJSUrl = portalUrl + 'home/js/arcgisonline/config.js'
    const settingsUrl = portalUrl + 'sharing/rest/portals/self/settings?f=json'

    /**
     * read surveyUrl from portal/self/settings(#25220)
     */
    return Promise.resolve(true).then(() => {
      return fetch(settingsUrl, {
        mode: 'cors',
        method: 'GET'
      })
        .then((res: any) => {
          if (res.ok) {
            return res.json()
          }
          throw new Error(res)
        })
        .then((res) => {
          if (res.portalConfigProperties?.surveyUrl) {
            this.surveyUrlFromPortal = res.portalConfigProperties.surveyUrl
          }
        }).catch(() => {
          // ignore
        })
    }).then(() => {
      if (this.surveyUrlFromPortal) {
        return this.surveyUrlFromPortal
      }

      /**
       * read surveyUrl from config.js
       * create a script tag to avoid cross domain error
       */
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = configJSUrl

      const htmlNode = document.documentElement
      const htmlDir = htmlNode.getAttribute('dir')
      return new Promise((resolve, reject) => {
        script.onload = () => {
          // reset the html direction, see https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder/issues/11310#issuecomment-3061509
          if (htmlNode.getAttribute('dir') !== htmlDir) {
            htmlNode.setAttribute('dir', htmlDir)
          }

          const cfg = (window as any).esriGeowConfig
          if (cfg && cfg.surveyUrl) {
            this.surveyUrlFromPortal = cfg.surveyUrl
            resolve(cfg.surveyUrl)
          } else {
            this.surveyUrlFromPortal = null
            resolve(null)
          }
        }
        script.onerror = () => {
          if (htmlNode.getAttribute('dir') !== htmlDir) {
            htmlNode.setAttribute('dir', htmlDir)
          }
          console.log('Failed to get survey url from portal\'s config.js, will fallback to use the default survey123 url.')
          this.surveyUrlFromPortal = null
          resolve(null)
        }
        document.getElementsByTagName('head')[0].appendChild(script)
      })
    })

  }

  /**
   * get survey123 host url
   */
  public getSurvey123HostUrl (): string {
    /**
     * Beijing-R-D-Center/ExperienceBuilder/issues/88
     * we need to check url host to see which survey123 host url we will use
     * wabbuild.esri.com > survey123dec.arcgis.com
     * experiencedev.arcgis.com > survey123dev.arcgis.com
     * experienceqa.arcgis.com > survey123qa.arcgis.com
     * experience.arcgis.com > survey123.arcgis.com
     * default > survey123.arcgis.com
     *
     */
    let url = 'https://survey123.arcgis.com'
    // url from portal config.js or portal/self/settings
    if (this.surveyUrlFromPortal) {
      url = this.surveyUrlFromPortal
    }
    let env = window.jimuConfig.hostEnv as any
    if (this.queryObj && this.queryObj.env) {
      env = this.queryObj.env + ''
      // when the env is a url: refer to: https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/5975#issuecomment-2866368
      if (env.startsWith('http://') || env.startsWith('https://')) {
        return env
      }
    }

    // if the url mode is like https://survey123${subName}.arcgis.com, will let the env from url work,
    // otherwise, ignore the env from url.
    let isNormalSurveyUrl = true
    if (url !== 'https://survey123.arcgis.com') {
      const matchRst = url.match(/https:\/\/survey123(\.[^\.]*)\.arcgis\.com/)
      isNormalSurveyUrl = !!((matchRst && matchRst.length))
    }
    if (env && env !== 'prd' && env !== 'prod' && isNormalSurveyUrl) {
      url = `https://survey123${env}.arcgis.com`
    }

    return url
  }

  /**
  * get the api url
  */
  public getSurvey123HostAPIUrl () {
    let url = this.getSurvey123HostUrl() + '/api/jsapi/3.24/' //  '/share/survey123webform-jsapi.js';
    if (this.queryObj && this.queryObj.jsapi) {
      url = this.getSurvey123HostUrl() + '/api/jsapi/' + this.queryObj.jsapi
    }
    // only for debugger locally
    // const isDebug: boolean = false;
    // if (isDebug) {
    //   url = `https://nanzhang.arcgis.com:8443/webclient/survey123webform-jsapi.js`;
    // }

    return url
  }

  /**
   * create survey by survey123 rest api
   * @param title
   * @param tags
   * @param options
   */
  public createSurvey (title: string, tags: string[], commonParams: Survey123CommonParams, options?: {
    snippet?: string
    thumbnailUrl?: string
  }): Promise<any> {
    // options
    options = Object.assign({
      snippet: ''
    }, options || {})

    return Promise.resolve(true)
      .then(() => {
        if (!title || !commonParams || !commonParams.token || !commonParams.username) {
          throw new Error('missing title, tags, username or token')
        }
      })
      .then(() => {
        const url = `${this.getSurvey123HostUrl()}/api/survey/create`
        const params: any = {
          title: title,
          tags: tags && Array.isArray(tags) ? tags.join(',') : (tags || null),
          snippet: options.snippet,
          thumbnailUrl: options.thumbnailUrl,
          token: commonParams.token,
          username: commonParams.username,
          portalUrl: commonParams.portalUrl || 'https://www.arcgis.com'
        }

        return fetch(url, {
          mode: 'cors',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(params)
        })
          .then((res: any) => {
            if (res.ok) {
              return res.json()
            }
            throw new Error(res)
          })
      })
  }

  /**
   * isPortal is to check if the current portalUrl (from config or from url params) is arcgis online portals or not
   */
  public isPortal (portalUrl: string): boolean {
    const arcgisOnlinePortalUrls = ['www.arcgis.com', 'devext.arcgis.com', 'qaext.arcgis.com']

    // check if the portalUrl is arcgis online url
    const isArcgisOnline = arcgisOnlinePortalUrls.find((url, i) => {
      return portalUrl.includes(url)
    })
    return !isArcgisOnline
  }

  /**
   * query survey
   * @param commonParams
   * @param options
   * Reminder: if searchSurveyType is 'all-admin', even the isSearchAll is true, the result count still has a limitation: 1000. this is the api's behaviour
   */
  public querySurvey (commonParams: Survey123CommonParams, options?: {
    isPublished?: boolean
    isSearchAll?: boolean
    searchSurveyType?: string
    surveyClientAPI?: any
  }): Promise<any> {
    // options
    options = Object.assign({
      isPublished: false,
      isSearchAll: true,
      surveyClientAPI: null
    }, options || {})

    return Promise.resolve(true)
      .then(() => {
        if (!commonParams || !commonParams.token || !commonParams.username) {
          throw new Error('missing token or username')
        }
      })
      .then(() => {
        const params: any = {
          isPublished: options.isPublished,
          isSearchAll: options.isSearchAll,
          token: commonParams.token,
          username: commonParams.username,
          portalUrl: commonParams.portalUrl || 'https://www.arcgis.com'
        }
        if (options.searchSurveyType) {
          params.searchSurveyType = options.searchSurveyType
        }
        if (!options.surveyClientAPI) {
          console.log('Survey client api is not provided.')
          // todo: do we need to request rest api if the js api failed to work?
          return null
        }
        return options.surveyClientAPI.survey123.searchSurvey(params)
          .then((res) => {
            if (res && res.results) {
              return res.results
            }
            throw new Error(res)
          })
      })
  }

  /**
   * query others' survey
   * @param commonParams
   * @param options
   * todo: will use survey api instead when the api emplements this feature
   */
  public queryOthersSurvey (commonParams: Survey123CommonParams, options: { orgId: string }): Promise<any> {
    return Promise.resolve(true)
      .then(() => {
        if (!commonParams || !commonParams.token || !commonParams.username) {
          throw new Error('missing token or username')
        }
      })
      .then(() => {
        const params: any = {
          token: commonParams.token,
          username: commonParams.username,
          portalUrl: commonParams.portalUrl || 'https://www.arcgis.com',
          orgId: options.orgId
        }
        let response: any = null

        // build query parameter: q
        const q = `((type:Form AND (typekeywords:xForm OR typekeywords:Form)) OR (type:'Code Sample' AND typekeywords:XForms AND tags:'xform')) AND (NOT owner:${params.username}) AND (access:shared OR access:org OR (access:public AND orgid:${params.orgId}) OR access:private)`
        // get search url
        const searchUrl = `${params.portalUrl}/sharing/rest/search`
        // search params
        const searchParams: SearchParam = {
          q: q
        }
        return this.searchAGO(searchUrl, searchParams, commonParams)
          .then((res) => {
            response = res
            // the first 100 surveys
            res.results = (res.results || []).map((item) => {
              return this.convertItemToSurveyInfo(item, commonParams)
            })
            /**
             * there is not more searched items
             * return results
             */
            if (res.nextStart === -1) {
              return response
            }
            /**
             * recusively search remaing items
             */
            const promises: any[] = []
            let count = Math.floor(res.total / res.num)
            const remainder = res.total % res.num
            if (remainder > 0) {
              count += 1
            }
            for (let i = 1; i < count; i++) {
              const params = Object.assign({}, searchParams, {
                start: (i * res.num) + 1
              })
              if (params.start <= res.total) {
                promises.push(this.searchAGO(searchUrl, params, commonParams))
              }
            }
            return Promise.all(promises)
              .then((results: any[]) => {
                if (!results) {
                  throw new Error('something wrong when searchAll')
                }
                // the first 100 surveys
                let items = res.results || []
                let nextStart = -1
                // the 101st - last surveys
                results.forEach((result, i) => {
                  // conver the item to survey info(to let it be identical with the data structure returned from survey search api)
                  const surveys = result.results.map((item) => {
                    return this.convertItemToSurveyInfo(item, commonParams)
                  })
                  items = items.concat(surveys)
                  /**
                  * get nextStart in the last result
                  */
                  if (i === results.length - 1) {
                    nextStart = result.nextStart
                  }
                })
                response.nextStart = nextStart
                response.results = items
                return response
              })
          })
      })
      .then((response) => {
        return response ? (response.results || []) : []
      })
  }

  /**
   * search from ago
   * @param searchUrl
   * @param searchParams
   * @param commonParams
   * @returns
   */
  public searchAGO (searchUrl: string, searchParams: SearchParam, commonParams: Survey123CommonParams): Promise<any> {
    searchParams = Object.assign({
      num: 100,
      start: 1,
      sortField: 'title',
      sortOrder: 'asc'
    }, searchParams)
    const reuqestParams = Object.assign({}, {
      f: 'json',
      token: commonParams.token
    }, searchParams)

    const requestUrl = `${searchUrl}?${Object.keys(reuqestParams).map((k) => k + '=' + reuqestParams[k]).join('&')}`
    return fetch(requestUrl, {
      mode: 'cors',
      method: 'GET'
    })
      .then((res: any) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error(res)
      })
  }

  public convertItemToSurveyInfo (item: any, params: Survey123CommonParams) {
    return {
      created: item.created,
      featureService: null,
      form: null,
      formItemInfo: item,
      id: item.id,
      owner: item.owner,
      report: null,
      snippet: item.snippet,
      tags: item.tags,
      thumbnail: `${params.portalUrl}/sharing/rest/content/items/${item.id}/info/${item.thumbnail}?token=${params.token}`,
      title: item.title
    }
  }

  /**
   * get survey123 designer url
   */
  public getSurvey123DesignerUrl (surveyItemId: string, options?: {
    portalUrl?: string
  }): string {
    // options
    options = Object.assign({

    }, options || {})

    let url = `${this.getSurvey123HostUrl()}/surveys/${surveyItemId}/design?embed=exb`
    if (options.portalUrl && options.portalUrl !== 'https://www.arcgis.com') {
      url += `&portalUrl=${options.portalUrl}`
    }
    if (this.getSurvey123HostUrl() === 'https://survey123dev.arcgis.com' && (!options.portalUrl || options.portalUrl === 'https://www.arcgis.com')) {
      url += `&portalUrl=${options.portalUrl}`
    }

    return url
  }

  /**
   *
   * @param surveyItemId
   * @param options
   */
  public getSurvey123WebformUrl (surveyItemId: string, options?: {
    queryParams?: string[]
  }): string {
    // options
    options = Object.assign({
      queryParams: []
    }, options || {})

    const isDebug: boolean = false

    let url = `${this.getSurvey123HostUrl()}/share/${surveyItemId}`

    /**
     * debugg only
     */
    if (isDebug) {
      url = `https://nanzhang.arcgis.com:8443/webclient/?appid=${surveyItemId}`
    }

    if (options.queryParams.length > 0) {
      url += `${(isDebug) ? '&' : '?'}${options.queryParams.join('&')}`
    }

    return url
  }

  /**
   * flat questions, move the questions out if they are in the group.
   * ignore repeat questions until we plan to support it.
   */
  public flatQuestions (questions) {
    let result = []
    questions.forEach((ques) => {
      // single question
      if (!ques.questions) {
        result.push(ques)
      } else if (ques.type !== 'esriQuestionTypeRepeat') {
        if (ques.type === 'esriQuestionTypeAddress') {
          result.push(ques)
        }
        result = result.concat(this.flatQuestions(ques.questions))
      }
    })
    return result
  }

  /**
   * Deprecated
   * get survey question fields
   * @param surveyItemId
   * @param commonParams
   */
  public getSurveyQuestionFields (surveyItemId: string, commonParams: Survey123CommonParams): Promise<Array<{
    name?: string
    label?: string
  }>> {
    return Promise.resolve(true)
      .then(() => {
        if (!surveyItemId || !commonParams || !commonParams.token) {
          throw new Error('missing surveyItemId or token')
        }
      })
      .then(() => {
        let url = `${this.getSurvey123HostUrl()}/api/survey/${surveyItemId}/form`
        const params: any = {
          token: commonParams.token,
          portalUrl: commonParams.portalUrl
        }

        url = `${url}?${Object.keys(params).map((k) => k + '=' + params[k]).join('&')}`

        return fetch(url, {
          mode: 'cors',
          method: 'GET'
        })
          .then((res: any) => {
            if (res.ok) {
              return res.json()
            }
            throw new Error(res)
          })
      })
  }

  /**
   * get common pararmeters
   * @param obj
   */
  public setCommonParams () {
    const portalUrl = getAppStore().getState().portalUrl
    this._commonParams = {
      token: SessionManager.getInstance().getMainSession()?.token,
      username: getAppStore().getState().user?.username,
      portalUrl: portalUrl
    }
  }

  /**
   * get common pararmeters
   * @param obj
   */
  public getCommonParams (): Survey123CommonParams {
    if (!this._commonParams) {
      this.setCommonParams()
    }
    return this._commonParams
  }

  /**
   * getBaseRequestOptions
   * @returns
   */
  public getBaseRequestOptions (): any {
    const sessionManager = SessionManager.getInstance()
    const portalUrl = getAppStore().getState().portalUrl
    const portal = portalUrlUtils.getPortalRestUrl(portalUrl)

    return {
      authentication: sessionManager.getSessionByUrl(portalUrl),
      portal: portal
    }
  }

  /**
  * update related data source
  * find current survey's source layer/edit viewer/result viewer from all the data sources in the app, and refresh them.
  */
  public updateRelatedDataSources (surveyItemId: string, mode: string) {
    const dataSourceList = DataSourceManager.getInstance().getDataSourcesAsArray()
    if (!dataSourceList.length) {
      return
    }

    return Promise.resolve(true)
      .then(() => {
        // get the survey related feature service
        return this.getSurveyFeatureServices(surveyItemId)
      })
      .then((services: any[]) => {
        // filter the survey related data source and update the version.
        dataSourceList.filter((dataSource: any) => {
          const itemId = dataSource.itemId
          const url = dataSource.url || ''
          const isSurveyRelatedDataSouce = services.find((serviceInfo) => {
            // serviceInfo.url is a feature service url, but the dataSource.url maybe a feature layer url
            if (serviceInfo.itemId === itemId || url.startsWith(serviceInfo.url)) {
              return true
            }
            return false
          })

          /**
           * refresh related widgets
           */
          if (isSurveyRelatedDataSouce) {
            // dataSource.addSourceVersion()

            // if (mode === 'edit') {
            //   dataSource.afterUpdateRecord(null)
            // } else {
            dataSource.afterAddRecord(null)
            // }
          }
          return isSurveyRelatedDataSouce
        })
      })
  }

  /**
   * get survey feature services
   * todo: test the survey created from existing feature service
   * @param surveyItemId
   */
  public getSurveyFeatureServices (surveyItemId: string): Promise<any[]> {
    /**
     * read from cache if it exisits
     */
    const cache = this.surveyFeatureServices[surveyItemId]
    if (cache) {
      return Promise.resolve(cache)
    }

    const session = SessionManager.getInstance().getMainSession()
    const serviceInfos = []
    /**
     * step 1: get stakeholder view feature service
     * for hosted feature service > looking for stakeholder view typekeyword
     */
    let queryString = `type:Feature Service AND typekeywords:${surveyItemId} AND typekeywords:StakeholderView`
    queryString += ` AND ((typekeywords:Hosted Service AND typekeywords:View Service) OR (NOT typekeywords:Hosted Service))`

    const searchUrl = `${this._commonParams.portalUrl}/sharing/rest/search`
    // search params
    const searchParams: SearchParam = {
      q: queryString
    }
    return this.searchAGO(searchUrl, searchParams, this._commonParams)
      .then((res) => {
        if (!res || res.error) { throw new Error(JSON.stringify(res)) }
        if (res.results && res.results.length === 0) { return null }
        const stakholderInfo = res.results[0]
        serviceInfos.push({
          type: 'stakeholder',
          url: stakholderInfo.url,
          temId: stakholderInfo.id
        })
      })
      .then(() => {
        /**
         * step 2: get survey related items
         * related items may be source fs or fieldworker fs
         */
        // get survey2service related services
        const params: any = Object.assign({ id: surveyItemId, relationshipType: 'Survey2Service' }, this.getBaseRequestOptions())
        return esri.restPortal.getRelatedItems(params).then((resp: any) => {
          if (!resp || resp.error) {
            console.warn('Failed to get related templates')
          }
          const relatedItem = resp.relatedItems[0]
          if (!relatedItem) {
            return serviceInfos
          }

          const typeKeywords = relatedItem.typeKeywords
          if (typeKeywords.indexOf(surveyItemId) !== -1 && (typeKeywords.indexOf('FieldworkerView') !== -1 || typeKeywords.indexOf('View Service') !== -1)) {
            // fieldworker view
            serviceInfos.push({
              type: 'fieldworker',
              url: relatedItem.url,
              temId: relatedItem.id
            })
            // get source fs from fs view
            const url = `${relatedItem.url}/sources`
            const reqParam = {
              httpMethod: 'GET' as HTTPMethods,
              authentication: session
            }
            return esri.restRequest.request(url, reqParam).then((res) => {
              const obj = res.services[0]
              if (!obj) {
                return serviceInfos
              }
              return this.getItemInfo(obj.serviceItemId).then((sourceInfo) => {
                if (sourceInfo) {
                  serviceInfos.push({
                    type: 'source',
                    url: sourceInfo.url,
                    temId: sourceInfo.id
                  })
                }
                return serviceInfos
              })
            })
          } else {
            // this is source fs(survey is created from Survey123 Connect)
            serviceInfos.push({
              type: 'source',
              url: relatedItem.url,
              temId: relatedItem.id
            })
            return serviceInfos
          }
        })
      }).catch((e) => {
        console.log('Error occurs when get related feature services with survey,', e)
        return serviceInfos
      }).finally(() => {
        // build cache
        this.surveyFeatureServices[surveyItemId] = serviceInfos
      })
  }

  /**
   * get item info
   * @param id
   * @returns
   */
  public getItemInfo (id) {
    return esri.restPortal.getItem(id, this.getBaseRequestOptions())
  }
  /**
   * for multilingual survey, the label is an object like:
   * {
   *    en: 'English label',
   *    'zh-cn': 'Chinese label'
   * }
   * @param question
   * @returns
   */
  public getQuesLabelString (question: any, options?: {
    locales?: any[]
    currentLocale?: string
  }): string {
    options = Object.assign({
      locales: [],
      currentLocale: 'en'
    }, options || {})

    if (!question || !question.label) {
      return ''
    }

    let label = question.label
    if (typeof label === 'object') {
      /**
       * get default locale
       */
      let defaultLocale: any = Object.keys(options.locales || []).find((localConfig: any) => {
        return (localConfig.isDefault + '') === 'true'
      })
      if (defaultLocale) {
        defaultLocale = defaultLocale.code || 'en'
      }

      /**
       * get the matched locale
       */
      const localesCodes = options.locales?.map((locale) => {
        return (locale.code + '').trim()
      })
      const matchedLocale = this._findMatchedLocale(options.currentLocale, localesCodes) || defaultLocale
      if (matchedLocale && matchedLocale in question.label) {
        label = question.label[matchedLocale]
      } else {
        const firstLocale = Object.keys(question.label)[0]
        label = firstLocale ? question.label[firstLocale] : ''
      }
    }
    return label
  }

  /**
   * parse a url parameter to json, if the parameter string is simple, keep it as string
   * @param str  eg: 0.q2:pie;1.q3:{"type":"map","basemapItemId":"{itemId}"};2.q11:{"type":"wordCloud","show":"response"}
   * @param urlKey
   */
  private _urlParamToJson (str: string): any {
    if (!str) {
      return null
    }
    str = str + ''
    const subObjs = str.split(';')
    if (subObjs.length < 2 && str.split(':').length < 2) {
      // this url parameter has no sub parameters
      if (str.split(',').length > 1) {
        // consider it as an array
        return str.split(',')
      } else {
        return str
      }
    } else {
      const obj = {}
      subObjs.forEach((subStr) => {
        const keyVals = (subStr + '').split(':')
        if (keyVals.length > 1) {
          const key = keyVals[0]
          let val = (Array.isArray(keyVals.slice(1)) ? keyVals.slice(1) : []).join(':') as any
          if (val.length && val[0] === '{') {
            // try to parse it to a json
            val = this._stringToJson(val)
          }
          if (typeof val === 'string') {
            if (val.split(',').length > 1) {
              // consider it as an array
              val = val.split(',')
            }
          }
          obj[key] = val
        }
      })
      return obj
    }
  }

  /**
   * find the matched locale from locales array by the given localeCode
   * @param localCode
   * @param locals
   */
  private _findMatchedLocale (localeCode, locales) {
    if (!locales || !locales.length || !localeCode) {
      return null
    }

    /**
     * find the code which equals to localeCode
     */
    if (locales.indexOf(localeCode) >= 0) {
      return localeCode
    }

    /**
     * find the code that matchs partially
     * ie: if localeCode is zh-tw, will match 'zh' if the 'zh' is in locales array
     * if localeCode is zh, will match 'zh-tw' if the 'zh-tw' is in locales array
     * if localeCode is zh-tw, will match 'zh-cn' if the 'zh-ch' is in locales array and 'zh-tw' is not in the locales array
     */
    const mainLocale = localeCode.split('-')[0]
    if (locales.indexOf(mainLocale) >= 0) {
      return mainLocale
    } else {
      return locales.find((code) => {
        return code.startsWith(`${mainLocale}-`)
      })
    }
  }

  private _stringToJson (str: string): any {
    let result = str
    try {
      result = JSON.parse(str)
    } catch (e) {
      result = str
    }
    return result
  }
}

export const survey123Service = new Survey123Service()
