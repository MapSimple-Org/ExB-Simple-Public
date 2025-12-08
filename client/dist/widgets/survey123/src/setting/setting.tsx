/** @jsx jsx */
import {
  React, Immutable, DataSourceManager, jsx, SessionManager, css, moduleLoader, portalUrlUtils,
  DataSourceTypes, getAppStore, type ClauseValuePair, semver, type UseDataSource,
  dateUtils
} from 'jimu-core'
import { type AllWidgetSettingProps, builderAppSync } from 'jimu-for-builder'
import { appServices } from 'jimu-for-builder/service'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Button, TextInput, TextArea, Select, Radio, Switch, Label, Modal, AlertPopup, TagInput, AdvancedSelect } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import type { IMConfig } from '../config'
import { survey123Service } from '../service/survey123.service'
import defaultMessages from './translations/default'
import { getStyle, getModalStyle } from './css/style'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { LinkHorizontalOutlined } from 'jimu-icons/outlined/application/link-horizontal'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, any> {
  /**
   * state variable
   */
  supportedMapTypes = Immutable([DataSourceTypes.WebMap])
  supportedLayerTypes = Immutable([
    DataSourceTypes.FeatureLayer,
    DataSourceTypes.SceneLayer,
    DataSourceTypes.SubtypeGroupLayer,
    DataSourceTypes.SubtypeSublayer
  ])

  dsManager = DataSourceManager.getInstance()
  public state: any = {
    userTags: [],
    canCreateSurvey: true,
    loadApiFailed: false,
    /**
     * survey123
     */
    newSurveyTitle: null,
    newSurveyTags: [],
    newSurveyTitleDirty: false,
    newSurveyTagsDirty: false,
    newSurveySnippet: null,
    newSurveyItemId: null,
    newSurveyThumbnailUrls: [
      'https://survey123.arcgis.com/assets/img/default-thumbnails/Image01.png',
      'https://survey123.arcgis.com/assets/img/default-thumbnails/Image02.png',
      'https://survey123.arcgis.com/assets/img/default-thumbnails/Image03.png'
    ],
    newSurveyMsg: null,
    newSurveyLoading: false,
    existSurveyMsg: null,
    existSharedSurveyMsg: null,
    existSurveys: [],
    existSharedSurveys: [],
    selectedSurvey: null,
    selectedMyOwnSurvey: null,
    selectedSharedSurvey: null,
    currentActiveSurvey: null,
    modalIsOpen: false,
    mode: 'none',
    isCheckedSurveyItemId: false,
    isShowSurveyQuestionField: false,
    surveyQuestionFields: [],
    selectedQuestionField: null,
    createSurveyErrorMsg: null,
    surveyStatusCode: 0,
    isShowCloseDesignerAlert: false,
    surveyChanged: false,
    /**
     * data source
     */
    dsMapView: null,
    dsFeatureLayer: null,
    dsFeatureLayerFields: [],

    /**
     * field-question mapping
     */
    addMapping: null,
    editMapping: null,

    /**
     * selected layer info for view/edit mode
     */
    layerViewInfoInNewMode: null,
    layerViewInfoInEditMode: null,
    layerViewInfoInViewMode: null
  }

  public newDefaultValue: {
    key: string
    value: string
  } = {
      key: '',
      value: ''
    }

  public API: any = {
    survey123: null,
    Survey123WebForm: null
  }

  public isPortal: boolean = false
  public isOrgAdmin: boolean = false
  public isTagRequired: boolean = false

  /**
   * constructor
   * @param props
   */
  constructor (props: any) {
    super(props)

    /**
     * query existing survey
     */
    survey123Service.setQueryObject(this.props.queryObject)
    this.isPortal = !(portalUrlUtils.isAGOLDomain(this.props.config.portalUrl || this.props.portalUrl))
    this.checkTagRequired()
    const user = this.props.user
    this.isOrgAdmin = !!((user && user.role === 'org_admin'))
    this.prepare().then(() => {
      this.setDefaultVal()
      this.querySurvey()
      this.addDesigerHandler()
    })
      .catch((e) => {
        setTimeout(() => {
          if (this.state.loadApiFailed) {
            this.setState({
              existSurveyMsg: `<p class="error-message">${e.message || ''}</p>`,
              existSharedSurveyMsg: `<p class="error-message">${e.message || ''}</p>`,
              mode: 'survey-createSurvey',
              newSurveyMsg: e.message || '',
              loadApiFailed: true
            })
          }
        }, 0)
      })
  }

  /**
   * for old app created before 9.3, set the default mode as 'new'
   * set state from saved config
   */
  setDefaultVal = () => {
    /**
     * donot execute setState() in the loading process
     * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/11259
     * todo: but there is still an extra history state chagne when loading an existing survey widget
     */

    if (this.props.config.surveyItemId && !this.props.config.mode) {
      this.setMode('new')
    }

    const mode = this.props.config.mode || 'new'
    let layerViewInfo = this.props.config.layerViewInfo || null
    if (layerViewInfo) {
      const layerDataSourceDetail = this.dsManager.getDataSource(layerViewInfo.dataSourceId)
      layerViewInfo = {
        dataSourceId: layerViewInfo.dataSourceId,
        mainDataSourceId: layerViewInfo.mainDataSourceId ? layerViewInfo.mainDataSourceId : layerDataSourceDetail.getMainDataSource()?.id,
        rootDataSourceId: layerViewInfo.rootDataSourceId ? layerViewInfo.rootDataSourceId : layerDataSourceDetail.getRootDataSource()?.id
        // dataViewId: layerViewInfo.dataViewId
      }
    }

    // const useMapWidgetIds = this.props.useMapWidgetIds || null

    if (mode === 'new') {
      this.setState({
        layerViewInfoInNewMode: layerViewInfo
      })
    } else if (mode === 'edit') {
      this.setState({
        layerViewInfoInEditMode: layerViewInfo
      })
    } else if (mode === 'view') {
      this.setState({
        layerViewInfoInViewMode: layerViewInfo
      })
    }
  }

  /**
   * prepare:
   * get survey123 host url from portal's config.js
   * load survey123 js api
   */
  prepare = () => {
    return Promise.resolve(true)
      .then(() => {
        if (this.isPortal) {
          const portalUrl = this.props.config.portalUrl || this.props.portalUrl
          return survey123Service.getSurveyHostUrlFromPortal(portalUrl)
        }
        return true
      })
      .then(() => {
        return this.loadSurveyAPI()
      })
  }

  // set state: dsFeatureLayer after loaded if the dataSourceId exist
  componentDidMount = () => {
    this.checkPrivilige()
    const useDataSources = this.props.useDataSources
    const dataSourceId = (useDataSources && useDataSources.length) ? useDataSources[0].dataSourceId : null
    if (dataSourceId) {
      const dataSource: any = this.dsManager.getDataSource(dataSourceId)
      const layer = dataSource ? dataSource.getLayerDefinition() : null
      this.setState({
        dsFeatureLayer: layer,
        dsFeatureLayerFields: this.getLayerFields(layer)
      })
    }
    const user = this.props.user
    this.isOrgAdmin = !!((user && user.role === 'org_admin'))
    this.isPortal = !(portalUrlUtils.isAGOLDomain(this.props.config.portalUrl || this.props.portalUrl))
    this.checkTagRequired()
    this.getUserTags()
  }

  // load survey api
  loadSurveyAPI = () => {
    const apiUrl = survey123Service.getSurvey123HostAPIUrl()
    if (!this.API.survey123) {
      return moduleLoader.loadModule(apiUrl)
        .then((survey123) => {
          this.API = survey123
          // this.API.Survey123WebForm = Survey123WebForm;
          if (!survey123) {
            const apiErrMsg = this.props.intl.formatMessage({ id: 'errLoadS123JSAPI', defaultMessage: defaultMessages.errLoadS123JSAPI }, { S123JSAPIURL: apiUrl })
            this.setState({
              loadApiFailed: true
            })
            throw new Error(apiErrMsg)
          } else {
            this.setState({
              loadApiFailed: false,
              existSurveyMsg: '',
              existSharedSurveyMsg: '',
              newSurveyMsg: ''
            })
          }
          return survey123
        })
    } else {
      return Promise.resolve(this.API.survey123)
    }
  }

  /**
   * check the user privilige of creating featureservice and creating portal item
   */
  checkPrivilige = () => {
    const user = getAppStore().getState().user
    const privileges = user.privileges || []
    const canCreateSurvey = privileges.includes('portal:user:createItem') && privileges.includes('portal:publisher:publishFeatures')
    this.setState({
      canCreateSurvey: canCreateSurvey
    })
  }

  /**
   * tags for an item become optional since portal 10.9.1(the rest api version of portal 10.9.2 is 9.2)
   */
  checkTagRequired = () => {
    let portalVersion = this.props.portalSelf ? this.props.portalSelf.currentVersion : null
    this.isTagRequired = false
    if (portalVersion && this.isPortal) {
      if ((portalVersion + '').split('.').length < 3) {
        portalVersion += '.0'
      }
      try {
        this.isTagRequired = semver.lt(portalVersion, '9.2.0')
      } catch (e) {
        // ignore
      }
    }
    return this.isTagRequired
  }

  /**
   * get user tags
   * @returns
   */
  getUserTags = () => {
    if (window.jimuConfig.isDevEdition) {
      return false
    }
    const username = getAppStore().getState().user.username
    appServices.getUserTags(username).then(res => {
      const userTags = res?.tags?.map(el => {
        return el.tag
      })
      this.setState({
        userTags: userTags || []
      })
    })
  }

  getLayerFields = (layer) => {
    if (!layer) {
      return []
    }
    // clone the layer.fields
    const fields = [].concat(layer.fields || [])
    if (layer.type !== 'feature' && layer.type !== 'Feature Layer') {
      // table or other type (has no geometry)
      return fields
    }
    const existGeoField = (fields || []).find((item) => {
      return item.name === 'geometry'
    })
    if (existGeoField) {
      return fields
    }
    let type = layer.geometryType || ''
    if (type.startsWith('esriGeometry')) {
      type = type.replace('esriGeometry', '').toLowerCase()
    }
    const geometryTypeStr = this.nls('geometryType' + type.substr(0, 1).toUpperCase() + type.substr(1))

    fields.push({
      alias: `${this.nls('geometryLabel')}(${geometryTypeStr})`,
      name: 'geometry'
    })
    return fields
  }

  /**
   * on setting value changed
   */
  onValueChanged = (evt: React.FormEvent<HTMLInputElement>) => {
    const target = evt.currentTarget

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(target.name, target.value)
    })
  }

  /**
   *  translate string
   * @param id
   * @param params
   * @returns
   */
  nls = (id: string, params?: any) => {
    return this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }, params)
  }

  /**
   * add default value
   */
  addDefaultValue = (evt: any) => {
    if (this.newDefaultValue.key && this.newDefaultValue.value) {
      /**
       * clear newDefaultValue key / value
       */
      this.newDefaultValue = {
        key: '',
        value: ''
      }
    }
  }

  /**
   * listen to the desinger iframe
   */
  addDesigerHandler = () => {
    window.addEventListener('message', (evt) => {
      if (evt.data) {
        let data = evt.data
        // if the window get the message from other iframe, maybe it cannot be converted to object
        // We can only sure the message from webform can be converted to object
        try {
          if (typeof evt.data === 'string') {
            data = JSON.parse(evt.data) || {}
          }
        } catch (e) {
          // don't show the error
        }
        if (data.event === 'survey123:design:onFormPublished' && data.data) {
          let surveyStatusCode = this.state.surveyStatusCode || 0
          surveyStatusCode++
          builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'surveyStatusCode', value: surveyStatusCode })
          this.setState({
            surveyStatusCode: surveyStatusCode
          })
          this.handleCloseModal()
        } else if (data.event === 'survey123:design:onFormUnsaved' && data.data) {
          this.setState({
            surveyChanged: true
          })
        } else if (data.event === 'survey123:design:onFormSaved' && data.data) {
          this.setState({
            surveyChanged: false
          })
        }
      }
    })
  }

  /**
   * get field alias by fild name
   */
  getFielAlias = (field) => {
    const fields = this.state.dsFeatureLayerFields || []
    const target = fields.find((item) => {
      return item.name === field
    })
    if (target) {
      return target.alias || target.name
    }
    return field
  }

  /**
   * get question label by question name
   */
  getQuestionLabel = (questionName) => {
    const questions = this.state.surveyQuestionFields || []
    const target = questions.find((item) => {
      return item.name === questionName
    })
    if (target) {
      return target.label || target.name
    }
    return questionName
  }

  /**
   * on new survey value changed
   */
  onNewSurveyValueChanged = (e: React.FormEvent<HTMLInputElement>, type: string) => {
    const target = e.currentTarget

    if (type) {
      this.setState({
        [type]: target.value
      })
    }
    if (type === 'newSurveyTags') {
      this.setState({
        newSurveyTagsDirty: true
      })
    } if (type === 'newSurveyTitle') {
      this.setState({
        newSurveyTitleDirty: true
      })
    }
  }

  /**
   * switch the survey source type(from myown surveys or others‘ surveys)
   * @param type
   */
  onSurveySourceTypeChange = (type: string) => {
    this.setState({
      mode: type,
      currentActiveSurvey: type === 'survey-selectExistingSharedSurvey' ? this.state.selectedSharedSurvey : this.state.selectedMyOwnSurvey,
      selectedSurvey: type === 'survey-selectExistingSharedSurvey' ? this.state.selectedSharedSurvey : this.state.selectedMyOwnSurvey
    })
  }

  /**
   * onExistSurveyChanged
   */
  onExistSurveyChanged = (valuePairs: ClauseValuePair[]) => {
    if (valuePairs && valuePairs.length) {
      // this.updateMapWidgetList()
      this.setState({
        selectedSurvey: valuePairs[0],
        currentActiveSurvey: valuePairs[0]
      })
      if (this.state.mode === 'survey-selectExistingSharedSurvey') {
        this.setState({
          selectedSharedSurvey: valuePairs[0]
        })
      } else {
        this.setState({
          selectedMyOwnSurvey: valuePairs[0]
        })
      }
    } else {
      this.setState({
        selectedSurvey: null,
        currentActiveSurvey: null
      })
      if (this.state.mode === 'survey-selectExistingSharedSurvey') {
        this.setState({
          selectedSharedSurvey: null
        })
      } else {
        this.setState({
          selectedMyOwnSurvey: null
        })
      }
    }
  }

  /**
   * create survey
   */
  createSurvey = () => {
    if (!this.state.canCreateSurvey) {
      return
    }
    /**
     * handle title, tags, description
     */
    const title = this.state.newSurveyTitle ? this.state.newSurveyTitle.trim() : ''
    let tags = null
    if (this.state.newSurveyTags && this.state.newSurveyTags.length) {
      tags = this.state.newSurveyTags.map((tag) => tag.trim())
    }
    const snippet = this.state.newSurveySnippet
    if (!title) {
      this.setState({
        newSurveyTitleDirty: true
      })
    }
    if (this.isTagRequired) {
      if (!this.state.newSurveyTags || !this.state.newSurveyTags.length) {
        this.setState({
          newSurveyTagsDirty: true
        })
      }
    }

    if (!title) {
      return
    }
    if (this.isTagRequired && (!tags || !tags.length)) {
      return
    }

    return Promise.resolve(true)
      .then(() => {
        /**
         * update msg
         */
        this.setState({
          newSurveyMsg: '',
          newSurveyLoading: true
        })
        const randomIdx = parseInt(Math.random() * 10 + '') % 3
        const thumbnail = this.state.newSurveyThumbnailUrls[randomIdx]
        const options = {
          title: title,
          tags: tags,
          token: SessionManager.getInstance().getMainSession()?.token,
          thumbnailUrl: thumbnail,
          snippet: snippet, // but survey api doesn't support snippet yet!
          portalUrl: this.props.config.portalUrl || this.props.portalUrl
        }
        return this.API.survey123.createSurvey(options)
      })
      .then((res: any) => {
        if (res && res.id) {
          // this.updateMapWidgetList()
          /**
           * set item id
           */
          this.setState({
            createSurveyErrorMsg: null,
            newSurveyItemId: res.id,
            selectedSurvey: res,
            newSurveyLoading: false
          })

          return res.id
        }
        throw new Error(res)
      })
      .then((itemId: string) => {
        if (!itemId) {
          return
        }
        /**
         * we should set hides in config
         */
        this.props.onSettingChange({
          id: this.props.id,
          config: this.props.config.set('hides', ['navbar', 'header', 'description', 'footer', 'theme'])
        })

        /**
         * show survey123 designer modal
         */
        this.showSurvey123DesignerModal(itemId)
      })
      .catch((err) => {
        if (err) {
          /**
           * In fact, if the error code is 400, the reason can be multiple, maybe it's not because the survey name is duplicated.
           * update msg
           */
          // if (err.error && err.error.code + '' === '400') {
          //   this.setState({
          //     createSurveyErrorMsg: this.props.intl.formatMessage({ id: 'surveyTitleDuplicateMsg', defaultMessage: defaultMessages.surveyTitleDuplicateMsg }),
          //     newSurveyLoading: false,
          //     newSurveyTitleDirty: false
          //   })
          //   return null
          // } else {
          const error = err.error ? err.error : err
          let errorMsg = error.message ? error.message : (typeof error === 'string') ? err : ''
          if (error.details && error.details.length) {
            error.details.forEach((detail) => {
              errorMsg += ' ' + detail
            })
          }
          /**
           *  #11565, use build-in string when the survey name is already existing.
           */
          if (error.messageCode === 'survey123_create14') {
            errorMsg = this.nls('createSurveyErrDuplicateTitle', {
              folderName: `'${title}'`
            }) || errorMsg
          }
          this.setState({
            newSurveyMsg: errorMsg || 'Create survey failed.',
            newSurveyLoading: false
          })
          // }
        }
        console.error(err)
      })
  }

  /**
   * query survey
   */
  querySurvey = (options?: {
    isPublished?: boolean
  }) => {
    options = options || {}
    return Promise.resolve(true)
      .then(() => {
        // todo: remove the belowing codes?
        if (this.props.config.surveyItemId && this.props.config.selectedSurvey) {
          const selectedSurvey = this.props.config.selectedSurvey
          // this.state.mode = 'settings';
          setTimeout(() => {
            this.props.onSettingChange({
              id: this.props.id,
              config: this.props.config.set('surveyItemId', selectedSurvey.id)
            })
            /**
             * switch to settings page
             */
            // this.updateMapWidgetList()
            this.setState({
              existSurveyMsg: null,
              mode: 'settings',
              selectedSurvey: selectedSurvey
            })
          }, 0)
          // options
          const queryMySurveyOption = Object.assign({
            isPublished: false
          }, options || {})
          const queryOption: any = {
            isPublished: queryMySurveyOption.isPublished,
            surveyClientAPI: this.API
          }

          // if (this.isOrgAdmin) {
          //   queryOption.searchSurveyType = 'all-admin'
          // }
          return survey123Service.querySurvey({
            username: this.props.user?.username,
            token: SessionManager.getInstance().getMainSession()?.token,
            portalUrl: this.props.config.portalUrl || this.props.portalUrl
          }, queryOption)
            .then((surveys: any[]) => {
              const surveyItems = this.getSurveyItems(surveys)
              this.setState({
                existSurveys: surveyItems
              })
            })
        }
      })
      .then(() => {
        if (this.state.mode === 'none') {
          this.setState({
            mode: 'survey-createSurvey'
          })
        }

        /**
         * update msg
         */
        this.setState({
          existSurveyMsg: '<div class="survey-list-loading-outter"><div class="jimu-secondary-loading"></div></div>'
        })
        // query my surveys
        // options
        const queryMySurveyOption = Object.assign({
          isPublished: false
        }, options || {})
        const queryOption: any = {
          isPublished: queryMySurveyOption.isPublished,
          surveyClientAPI: this.API
        }
        /**
         * According to https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/7026#issuecomment-3735803
         * event the current user is org admin, should still only show my owned surveys here
         * other's survey will be shown in the third radio item(Select others' survey)
         */
        // if (this.isOrgAdmin) {
        //   queryOption.searchSurveyType = 'all-admin'
        // }
        return survey123Service.querySurvey({
          username: this.props.user.username,
          token: SessionManager.getInstance().getMainSession()?.token,
          portalUrl: this.props.config.portalUrl || this.props.portalUrl
        }, queryOption)
      })
      .then((surveys) => {
        /**
         * update msg(for my existing surveys)
         */
        const surveyItems = this.getSurveyItems(surveys)
        this.setState({
          existSurveyMsg: null,
          existSurveys: surveyItems
        })
        if (!surveys || !surveys.length) {
          this.setState({
            existSurveyMsg: `<p class="no-survey-message">${this.props.intl.formatMessage({ id: 'noExistingSurvey', defaultMessage: defaultMessages.noExistingSurvey })}</p>`
          })
        }
      })
      /**
       * query shared surveys
       */
      .then(() => {
        this.setState({
          existSharedSurveyMsg: '<div class="survey-list-loading-outter"><div class="jimu-secondary-loading"></div></div>'
        })
        /**
         * According to https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/7026#issuecomment-3735803
         * we are searching others' survey here by sending reqeuests to AGO rest api in exb side, because survey api cannot do this currently,
         * will use survey api when this feature is supported in the future.
         */
        return survey123Service.queryOthersSurvey({
          username: this.props.user.username,
          token: SessionManager.getInstance().getMainSession()?.token,
          portalUrl: this.props.config.portalUrl || this.props.portalUrl
        }, {
          orgId: this.props.portalSelf ? this.props.portalSelf.id : null
        })
      })
      .then((sharedSurveys) => {
        /**
         * update msg(for shared surveys)
         */
        const surveyItems = this.getSurveyItems(sharedSurveys)
        this.setState({
          existSharedSurveyMsg: null,
          existSharedSurveys: surveyItems
        })
        if (!sharedSurveys || !sharedSurveys.length) {
          this.setState({
            existSharedSurveyMsg: `<p class="no-survey-message">${this.props.intl.formatMessage({ id: 'noExistingSurvey', defaultMessage: defaultMessages.noExistingSurvey })}</p>`
          })
        }
      })
      .then(() => {
        /**
         * update selected survey
         */
        const usedSurveyItemId = this.props.config.surveyItemId
        if (usedSurveyItemId) {
          const selectedSurvey = this.state.existSurveys.find((survey) => survey.id === usedSurveyItemId)
          const selectedSharedSurvey = this.state.existSharedSurveys.find((survey) => survey.id === usedSurveyItemId)
          const targetSurvey = selectedSurvey || selectedSharedSurvey
          if (targetSurvey) {
            // this.updateMapWidgetList()
            this.setState({
              selectedSurvey: targetSurvey
            })
            this.props.onSettingChange({
              id: this.props.id,
              config: this.props.config.set('selectedSurvey', targetSurvey)
            })
          }
        }
      })
      .catch((err) => {
        this.setState({
          mode: 'survey-createSurvey',
          existSurveyMsg: `<p class="error-message">${this.props.intl.formatMessage({ id: 'errmsgGeneralLoading', defaultMessage: defaultMessages.errmsgGeneralLoading })}</p>`
        })
        console.log(err)
      })
  }

  /**
   * convert survey to AdvancedSelectItem type
   * @param surveys
   */
  getSurveyItems = (surveys) => {
    // const surveyItems = [];
    (surveys || []).forEach((survey) => {
      survey.value = survey.id
      survey.label = survey.title
      survey.render = () => {
        return (
          <div css={css`width: 178px;text-overflow: ellipsis; white-space: nowrap;overflow: hidden;`} title={survey.title}><span>{survey.title}</span></div>
        )
      }
    })
    return surveys
  }

  /**
   * get survey question fields
   */
  getSurveyQuestionFields = (): Promise<any[]> => {
    const surveyItemId = this.props.config.surveyItemId
    return Promise.resolve(true)
      .then(() => {
        if (surveyItemId && SessionManager.getInstance().getMainSession()?.token && this.API.getForm) {
          const params = {
            itemId: surveyItemId,
            token: SessionManager.getInstance().getMainSession()?.token,
            portalUrl: this.props.config.portalUrl || this.props.portalUrl || 'https://www.arcgis.com'
          }
          return this.API.getForm(params)
        }
        return null
      })
      .then((res: any) => {
        const fields = []
        const locale = getAppStore().getState().appContext.locale || 'en'
        if (res && res.questions && res.questions.length > 0) {
          // flat the questions tree, move the questions out if they are in the group.
          const questions = survey123Service.flatQuestions(res.questions)

          questions.forEach((q: any) => {
            const shortType = (q.type + '').replace('esriQuestionType', '')
            if (q.fieldName || ['geopoint', 'polyline', 'polygon'].includes(shortType.toLowerCase())) {
              fields.push({
                name: q.fieldName || q.name,
                label: survey123Service.getQuesLabelString(q, { locales: res.locales, currentLocale: locale })
              })
            }
          })
        }

        if (res.error && res.error.message) {
          console.warn('Cannot get survey question fields for survey: ' + surveyItemId, res.error.message)
        }

        this.setState({
          surveyQuestionFields: fields
        })
        return fields
      })
  }

  /**
   * show survey123 designer modal
   */
  showSurvey123DesignerModal (surveyItemId?: string) {
    surveyItemId = surveyItemId || this.props.config.surveyItemId
    const sessionManager = SessionManager.getInstance()
    const portalUrl = this.props.config.portalUrl || this.props.portalUrl

    if (!surveyItemId) {
      throw new Error('cannot get survey item id to open survey123 designer')
    }

    /**
     * popup window and embed survey123 designer
     */
    let url = survey123Service.getSurvey123DesignerUrl(surveyItemId, {
      portalUrl: portalUrl
    })

    /**
     * we need to add access_token / username / expires_in in hash
     * to tell survey123 website to parse the hash to use the token
     */
    const session = sessionManager.getMainSession()
    if (session && session.token && session.username && session.tokenDuration) {
      url += `#access_token=${session.token}&username=${session.username}&expires_in=${session.tokenDuration}`
    }

    /**
     * show modal
     */
    this.setState({
      modalIsOpen: true,
      newSurveyMsg: null
    })

    /**
     * cannot use window.open because address bar will be shown.
     * try to use modal and iframe to show survey123 designer webpage
     */

    let index = 0
    const checkTimer = setInterval(() => {
      if (!this.state.modalIsOpen) {
        this.setState({
          modalIsOpen: true
        })
      }
      index++
      const target: any = document.getElementById('survey123-designer')
      if (target || index > 100) {
        clearInterval(checkTimer)
        target.src = url
      }
    }, 50)
  }

  /**
   * show setting page
   */
  showSettingPage = () => {
    this.setState({
      mode: 'settings'
    })
    /**
     * get survey question fields
     */
    this.getSurveyQuestionFields()
  }

  /**
   * handle close modal
   */
  handleCloseModal = () => {
    if (this.state.surveyChanged) {
      this.setState({
        isShowCloseDesignerAlert: true
      })
      return
    }
    this.setState({
      modalIsOpen: false
    })
    this.setState({
      surveyChanged: false
    })

    this.showSettingPage()

    /**
     * update survey itemid in props config
     */
    const surveyItemId = this.state.newSurveyItemId || this.props.config.surveyItemId
    if (surveyItemId) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('surveyItemId', surveyItemId).set('timestamp', Date.now()).set('mode', 'new')
      })
    }

    /**
     * update the survey list
     */
    this.querySurvey()
  }

  /**
   * handler close desinger alert popup
   */
  handleCloseDesignerAlert = (isOk) => {
    this.setState({
      isShowCloseDesignerAlert: false
    })
    if (isOk) {
      this.setState({
        surveyChanged: false
      })
      setTimeout(() => {
        this.handleCloseModal()
      }, 0)
    }
  }

  onTagInputChange = (data: string[]) => {
    this.setState({
      newSurveyTags: data
    })
  }

  /**
   * get thumbnail url from portal
   */
  getThumbnailUrl = () => {
    const portalUrl = this.props.config.portalUrl || this.props.portalUrl || 'https://www.arcgis.com'
    const surveyItemId = this.state.selectedSurvey.id
    const thumbnail = this.state.selectedSurvey.thumbnail
    if ((thumbnail + '').startsWith('http://') || (thumbnail + '').startsWith('https://')) {
      return thumbnail
    }
    return `${portalUrl}/sharing/rest/content/items/${surveyItemId}/info/${thumbnail}?token=${SessionManager.getInstance().getMainSession()?.token}`
  }

  /**
   * set survey item id
   * update this.props.config
   */
  setSurveyItemId = () => {
    const selectedSurvey = this.state.selectedSurvey
    if (selectedSurvey && selectedSurvey.id) {
      /**
       * update props to have the same setting in runtime
       * and ensure the hides are all switched on
       */
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('surveyItemId', selectedSurvey.id).set('hides', ['navbar', 'header', 'description', 'footer', 'theme']).set('mode', 'new')
      })

      /**
       * switch to settings page
       */
      this.setState({
        mode: 'settings'
      })
    }
  }

  /**
   * edit survey
   */
  editSurvey = () => {
    this.showSurvey123DesignerModal()
  }

  /**
   * set appearance
   */
  setAppearance = (isChecked: boolean, value: string) => {
    const hides: any = [].concat(this.props.config.hides || [])
    // let isChecked = target.checked;

    if (isChecked && hides.indexOf(value) >= 0) {
      const pos = hides.indexOf(value)
      hides.splice(pos, 1)
      // hides = hides.concat([value])
    } else {
      hides.push(value)
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('hides', hides)
    })
  }

  /**
   * set survey mode: new/view/edit
   * @param mode
   * @returns
   */
  setMode = (mode) => {
    if (this.props.config.mode === mode) {
      return
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('mode', mode)
    })
  }

  /**
   * set the
   * @param mode
   * @returns
   */
  selectionChangeBehavior = (behavior: 'refresh' | 'preserve') => {
    if (this.props.config.selectionChangeBehavior === behavior) {
      return
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('selectionChangeBehavior', behavior)
    })
  }
  /**
   * handler data source change
   */
  handleUseDataSourceChange = (useDataSources: UseDataSource[]): void => {
    let dataSourceId
    // data souce cleared
    if (!useDataSources || !useDataSources.length) {
      dataSourceId = null
    } else {
      dataSourceId = useDataSources[0].dataSourceId
    }
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: dataSourceId ? [{
        dataSourceId: dataSourceId,
        mainDataSourceId: useDataSources[0].mainDataSourceId,
        // dataViewId: useDataSources[0].dataViewId,
        rootDataSourceId: useDataSources[0].rootDataSourceId
      }] : null,
      config: this.props.config.set('layerViewInfo', useDataSources[0]).set('fieldQuestionMapping', null)
    })
    // const dataSourceId = useDataSources[0].dataSourceId

    const dataSource: any = this.dsManager.getDataSource(dataSourceId)
    const layer = dataSource ? dataSource.getLayerDefinition() : null
    // const layer = dataSource ? (dataSource.layer ? dataSource.layer : dataSource) : null
    const mode = this.props.config.mode || 'new'
    if (mode === 'new') {
      if (!dataSourceId || !dataSource || !layer) {
        this.clearMapping()
      }
      this.setState({
        layerViewInfoInNewMode: useDataSources[0],
        dsFeatureLayer: layer,
        dsFeatureLayerFields: this.getLayerFields(layer)
      })
    } else if (mode === 'edit') {
      this.setState({
        layerViewInfoInEditMode: useDataSources[0]
      })
    } else if (mode === 'view') {
      this.setState({
        layerViewInfoInViewMode: useDataSources[0]
      })
    }
  }

  activeLinkDataChange = (e) => {
    const target = e.currentTarget
    const isActive = target.checked
    // if (isActive) {
    //   this.updateMapWidgetList()
    // }

    /**
     * update activeLinkData in data source
     */
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('activeLinkData', isActive)
    })
  }

  /**
   * change the layer field in field-question mapping panel
   */
  addMapppingChange = (type: string, e: any) => {
    const target = e.currentTarget
    const value = target.value
    let field = this.state.addMapping ? this.state.addMapping.field : null
    let question = this.state.addMapping ? this.state.addMapping.question : null
    if (type === 'field') {
      field = value
    } else {
      question = value
    }
    this.setState({
      addMapping: {
        field: field,
        question: question
      }
    })
  }

  /**
   * clear the setting of field-question mapping
   */
  clearMapping = () => {
    // todo:
  }

  /**
   * show edit mapping panel
   */
  showEditMappingPanel = (index, e?) => {
    const curEditMapping = this.state.editMapping || {}
    if (curEditMapping.index === index) {
      return
    }
    let mappings = this.props.config.fieldQuestionMapping || []
    mappings = (index >= 0 && index < mappings.length) ? mappings[index] : null
    const newMapping = Object.assign({}, mappings) as any
    newMapping.index = index
    this.setState({
      editMapping: newMapping,
      addMapping: null
    })
  }

  /**
   * change the edit mapping
   */
  changeEditMapping = (type: string, e: any) => {
    const target = e.currentTarget
    const value = target.value
    const curSetting = Object.assign({}, this.state.editMapping || {})
    if (type === 'field') {
      curSetting.field = value
    } else {
      curSetting.question = value
    }
    this.setState({
      editMapping: curSetting
    })
  }

  /**
   * change an field/question mapping
   */
  editMapping = (index) => {
    const mapping = [].concat(this.props.config.fieldQuestionMapping || [])
    const curEditMapping = this.state.editMapping || {}
    if (index >= 0 && index < mapping.length) {
      mapping[index] = {
        field: curEditMapping.field,
        question: curEditMapping.question
      }
    }
    // delete mapping[field];
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('fieldQuestionMapping', mapping)
    })
  }

  /**
   * add connection for field and question
   */
  activeAddFieldQuestionConnPanel = () => {
    this.setState({
      addMapping: {
        field: null,
        question: null
      },
      editMapping: null
    })
  }

  /**
   * hide the field-question panel
   */
  deactiveAddFieldQuestionConnPanel = () => {
    this.setState({
      addMapping: null
    })
  }

  deleteConnection = (index, e?) => {
    if (e) {
      e.stopPropagation()
    }
    const mapping = [].concat(this.props.config.fieldQuestionMapping || [])
    if (index >= 0 && index < mapping.length) {
      mapping.splice(index, 1)
    }
    // delete mapping[field];
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('fieldQuestionMapping', mapping)
    })
  }

  /**
   * add a field-question mapping
   */
  addFieldQuestionConn = (e) => {
    const field = this.state.addMapping.field
    const question = this.state.addMapping.question
    if (!field || !question) {
      console.log('Please ensure field/question is not null.')
      return
    }

    const mapping = [].concat(this.props.config.fieldQuestionMapping || [])
    mapping.push({
      field: field,
      question: question
    })
    // mapping[field] = question;

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('fieldQuestionMapping', mapping)
    })
    this.deactiveAddFieldQuestionConnPanel()
  }

  /**
   * on survey question field changed
   */
  onSurveyQuestionFieldChanged = (e: any) => {
    const target = e.currentTarget
    const value = target.value

    /**
     * update fields in data source
     */
    if (value && value !== 'null') {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('selectedSurveyQuestionFields', [value])
      })
    }
  }

  /**
   * isDsConfigured
   */
  isDsConfigured = () => {
    if (this.props.useDataSources &&
      this.props.useDataSources.length === 1) {
      return true
    }
    return false
  }

  /**
   * reset survey
   */
  resetSurvey = () => {
    /**
     * reset survey item id
     */
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('surveyItemId', null).set('hides', [])
        .set('embeds', ['fullScreen', 'onSubmitted'])
        .set('selectedSurveyQuestionFields', [])
        .set('fieldQuestionMapping', [])
        .set('activeLinkData', false)
        .set('dsType', null).set('selectedSurvey', null)
        .set('mode', 'new')
        .set('selectionChangeBehavior', '')
        .set('layerViewInfo', '')
    })

    this.setState({
      mode: 'survey-createSurvey',
      selectedSurvey: null,
      selectedMyOwnSurvey: null,
      selectedSharedSurvey: null,
      currentActiveSurvey: null,
      isCheckedSurveyItemId: false,
      surveyQuestionFields: [],
      dsMapView: null,
      dsFeatureLayer: null,
      dsFeatureLayerFields: [],
      layerViewInfoInNewMode: null,
      layerViewInfoInEditMode: null,
      layerViewInfoInViewMode: null
    })
  }

  /**
   * render
   */
  render () {
    /**
     * show setting page
     */
    if (this.state.selectedSurvey && this.props.config.surveyItemId && this.state.isCheckedSurveyItemId === false) {
      this.setState({
        isCheckedSurveyItemId: true
      })
      this.showSettingPage()
    }

    /**
     * render
     */
    return <div css={getStyle(this.props.theme)} className="jimu-widget-setting survey123">
      <div className="survey123__section" style={
        (this.state.mode.indexOf('survey-') !== -1)
          ? { display: 'block' }
          : { display: 'none' }
      } >
        <SettingSection role='radiogroup' aria-label={this.nls('chooseSurvey')}>
          <SettingRow>
            <p className="choose-survey-label">{this.props.intl.formatMessage({ id: 'chooseSurvey', defaultMessage: defaultMessages.chooseSurvey })}</p>
          </SettingRow>
          <SettingRow>
            <Radio name="survey-survey" className="cursor-pointer" id="survey-survey-createNewSurvey"
              checked={this.state.mode === 'survey-createSurvey'}
              onChange={() => { this.setState({ mode: 'survey-createSurvey' }) }} />
            <Label for="survey-survey-createNewSurvey" className="cursor-pointer select-survey-label">
              {this.props.intl.formatMessage({ id: 'createNewSurveyLabel', defaultMessage: defaultMessages.createNewSurveyLabel })}
            </Label>
          </SettingRow>
          <SettingRow>
            <Radio name="survey-survey" className="cursor-pointer" id="survey-survey-chooseExistingSurvey"
              checked={this.state.mode === 'survey-selectExistingSurvey'}
              onChange={() => { this.onSurveySourceTypeChange('survey-selectExistingSurvey') } } />
            <Label for="survey-survey-chooseExistingSurvey" className="cursor-pointer select-survey-label">
              {this.props.intl.formatMessage({ id: 'chooseSurveyLabel1', defaultMessage: defaultMessages.chooseSurveyLabel1 })}
            </Label>
          </SettingRow>
          <SettingRow>
            <Radio name="survey-survey" className="cursor-pointer" id="survey-survey-chooseExistingSharedSurvey"
              checked={this.state.mode === 'survey-selectExistingSharedSurvey'}
              onChange={() => { this.onSurveySourceTypeChange('survey-selectExistingSharedSurvey') } } />
            <Label for="survey-survey-chooseExistingSharedSurvey" className="cursor-pointer select-survey-label">
              {this.props.intl.formatMessage({ id: 'chooseSurveyLabel2', defaultMessage: defaultMessages.chooseSurveyLabel2 })}
            </Label>
          </SettingRow>
        </SettingSection>

        {/* select existing survey */}
        <div className="survey123__section-selectExistingSurvey" role="group"
          aria-label={this.nls('chooseSurveyLabel1')}
          style={(this.state.mode === 'survey-selectExistingSurvey' || this.state.mode === 'survey-selectExistingSharedSurvey')
            ? { display: 'block' }
            : { display: 'none' }
        }>
          {this.state.mode === 'survey-selectExistingSurvey'
            ? <SettingSection className="select-survey-section">
              <SettingRow>
                <AdvancedSelect
                  size='sm'
                  className="survey-dropdown"
                  staticValues={this.state.existSurveys}
                  selectedValues={this.state.selectedMyOwnSurvey ? [this.state.selectedMyOwnSurvey] : []}
                  allTag={this.props.intl.formatMessage({ id: 'selectSurveyTip', defaultMessage: defaultMessages.selectSurveyTip })}
                  onChange={this.onExistSurveyChanged}
                  placeholder={this.props.intl.formatMessage({ id: 'selectSurveyTip', defaultMessage: defaultMessages.selectSurveyTip })} />
              </SettingRow>
              <div className="survey-list-msg" dangerouslySetInnerHTML={{ __html: this.state.existSurveyMsg }}></div>
            </SettingSection>
            : <SettingSection className="select-survey-section">
            <SettingRow>
              <AdvancedSelect size='sm' className="survey-dropdown" staticValues={this.state.existSharedSurveys}
                selectedValues={this.state.selectedSharedSurvey ? [this.state.selectedSharedSurvey] : []}
                allTag={this.props.intl.formatMessage({ id: 'selectSurveyTip', defaultMessage: defaultMessages.selectSurveyTip })}
                onChange={this.onExistSurveyChanged}
                placeholder={this.props.intl.formatMessage({ id: 'selectSurveyTip', defaultMessage: defaultMessages.selectSurveyTip })} />
            </SettingRow>
            <div className="survey-list-msg" dangerouslySetInnerHTML={{ __html: this.state.existSharedSurveyMsg }}></div>
          </SettingSection>
          }

          {/* survey details */}
          <div style={{
            display: (this.state.currentActiveSurvey) ? 'block' : 'none'
          }}>
            <SettingSection title={this.nls('surveyDetailLabel')} className="create-survey-container">
              {
                (this.state.currentActiveSurvey)
                  ? [
                    <SettingRow key="surveyThumnail"><img alt={this.nls('thumbnail')} src={this.state.currentActiveSurvey.thumbnail} style={{ width: '100%', height: 'auto' }}></img></SettingRow>,
                    <SettingRow key="surveyTitle">
                      <span style={{ wordBreak: 'break-word', fontSize: '0.8125rem', color: '#FFFFFF' }}>{this.state.currentActiveSurvey.title}</span>
                    </SettingRow>,
                    // <SettingRow label="Tags"><p className="w-100">{this.state.selectedSurvey.tags}</p></SettingRow>,
                    // <SettingRow>{this.state.selectedSurvey.owner}</SettingRow>,

                    // author
                    <SettingRow className="items" key="surveyAuthor">
                      <div className="w-100">{this.nls('ownerIs', { ownerName: this.state.currentActiveSurvey.owner || '' })}</div>
                    </SettingRow>,

                    // last update
                    <SettingRow className="items" key="surveyCreationDate">
                      <div className="w-100">{this.nls('updatedOn', { updatedDate: dateUtils.formatDateValue(this.state.currentActiveSurvey.formItemInfo.modified, this.props.intl) })}</div>
                    </SettingRow>,

                    // snippet
                    this.state.currentActiveSurvey.snippet
                      ? <SettingRow className="items" key="surveySnippet">
                        <h6>{ this.nls('summaryLabel') }</h6>
                        <div className="w-100">{this.state.currentActiveSurvey.snippet}</div>
                      </SettingRow>
                      : null,
                    // insert survey button
                    <SettingRow key="surveyInsertBtn">
                      <Button type="primary" className="w-100" onClick={this.setSurveyItemId}>
                        {this.props.intl.formatMessage({ id: 'insertLabel', defaultMessage: defaultMessages.insertLabel })}
                      </Button>
                    </SettingRow>
                    ]
                  : null
              }
            </SettingSection>
          </div>
        </div>

        {/* create survey */}
        <div className="survey123__section-createSurvey" role="group" aria-label={this.nls('createNewSurveyLabel')} style={
          (this.state.mode === 'survey-createSurvey')
            ? { display: 'block' }
            : { display: 'none' }
        }>
          <SettingSection>
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between setting-header setting-title pb-2">
              <div>{this.nls('surveyTitleLabel')}
                <span className="isRequired">*</span>
              </div>
              <TextInput aria-label={this.nls('surveyTitleLabel')} aria-required="true" required className="w-100" value={this.state.newSurveyTitle || ''} onChange={(evt) => { this.onNewSurveyValueChanged(evt, 'newSurveyTitle') }} />
              {(!this.state.newSurveyTitle || !(this.state.newSurveyTitle.trim())) && this.state.newSurveyTitleDirty
                ? <div className="error-message">
                  {this.props.intl.formatMessage({ id: 'surveyTitleRequiredMsg', defaultMessage: defaultMessages.surveyTitleRequiredMsg })}
                </div>
                : ''}
              {this.state.createSurveyErrorMsg && !this.state.newSurveyTitleDirty
                ? <div className="error-message">
                  {this.props.intl.formatMessage({ id: 'surveyTitleDuplicateMsg', defaultMessage: defaultMessages.surveyTitleDuplicateMsg })}
                </div>
                : ''}
            </div>

            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between setting-header setting-title pb-2">
              <div>{this.nls('surveyTagLabel')}
              {this.isTagRequired
                ? <span className="isRequired">*</span>
                : ''}
              </div>
                <TagInput
                  aria-label={this.nls('surveyTagLabel')}
                  values={this.state.newSurveyTags}
                  suggestions={this.state.userTags}
                  onChange={this.onTagInputChange}
                  name={this.nls('surveyTagLabel')}
                  maxListHeight={80}
                />

              {/* <TextInput className="w-100" value={this.state.newSurveyTags || ''} onChange={(evt) => this.onNewSurveyValueChanged(evt, 'newSurveyTags')} /> */}
              {!(this.state.newSurveyTags && this.state.newSurveyTags.length) && this.state.newSurveyTagsDirty && this.isTagRequired
                ? <div className="error-message">
                  {this.props.intl.formatMessage({ id: 'surveyTagsRequiredMsg', defaultMessage: defaultMessages.surveyTagsRequiredMsg })}
                </div>
                : ''}
            </div>

            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between setting-header setting-title pb-2">
              <div>{this.nls('surveySummaryLabel')}</div>
              <TextArea aria-label={this.nls('surveySummaryLabel')} className="w-100 summary" height={80} value={this.state.newSurveySnippet || ''} onChange={(evt) => { this.onNewSurveyValueChanged(evt, 'newSurveySnippet') }} />
            </div>

            {/* <SettingRow label="Thumbnail">
            <img src={this.state.newSurveyThumbnailUrl} style={{
              width: '50px',
              height: '50px'
            }}></img>

            <TextInput className="w-100" value={this.state.newSurveyThumbnailUrl} name="newSurveyThumbnailUrl" onChange={this.onNewSurveyValueChanged} />

          </SettingRow> */}
            <SettingRow flow="wrap">
              <Button type="primary" className="w-100" disabled={this.state.newSurveyLoading === true || !this.state.canCreateSurvey || this.state.loadApiFailed} onClick={this.createSurvey}>
                {this.props.intl.formatMessage({ id: 'createSurveyBtn', defaultMessage: defaultMessages.createSurveyBtn })}
              </Button>
              <span className="newSurvey-msg">{!this.state.canCreateSurvey ? this.nls('createSurveyDisabled1') : this.state.newSurveyMsg}</span>
              <div className="w-100" style={
                {
                  position: 'relative',
                  display: 'block',
                  marginTop: '50px'
                }
              }>
                <div className="jimu-secondary-loading" style={
                  (this.state.newSurveyLoading === true) ? { display: 'block' } : { display: 'none' }
                }></div>
              </div>
            </SettingRow>
          </SettingSection>
        </div>

      </div>

      {/* setting section */}
      <div className="survey123__section" style={
        (this.state.mode.indexOf('settings') !== -1)
          ? { display: 'block' }
          : { display: 'none' }
      }>
        <SettingSection>

          <SettingRow>
            <div className="section-title">
              <h6>{(this.state.selectedSurvey) ? this.state.selectedSurvey.title : ''}</h6>
              <Button aria-label={this.nls('remove')} aria-description={(this.state.selectedSurvey) ? this.state.selectedSurvey.title : ''} className="survey123__section-resetSurvey" onClick={() => { this.setState({ mode: 'confirmResetSurvey' }) }}>
                <CloseOutlined size={8}/>
                </Button>
            </div>
          </SettingRow>

          <SettingRow>
            <Button aria-description={(this.state.selectedSurvey) ? this.state.selectedSurvey.title : ''} className="w-100" color="primary" type="primary" onClick={this.editSurvey}>
              {this.props.intl.formatMessage({ id: 'editSurveyBtn', defaultMessage: defaultMessages.editSurveyBtn })}
            </Button>
          </SettingRow>
        </SettingSection>

        <SettingSection role="group" aria-label={this.nls('appearanceTitle')} title={this.nls('appearanceTitle')}>
          <SettingRow tag='label'>
            <div className="appearance">
              <span>{this.props.intl.formatMessage({ id: 'showOptionsBarLabel', defaultMessage: defaultMessages.showOptionsBarLabel })}</span>
              <Switch className="can-x-switch" checked={!this.props.config.hides.includes('navbar')}
                onChange={evt => { this.setAppearance(evt.target.checked, 'navbar') }} />
            </div>
            {/* <input value='navbar' type="checkbox" onClick={this.setAppearance} checked={this.props.config.hides.indexOf('navbar') !== -1} /> */}
          </SettingRow>
          <SettingRow tag='label'>
            {/* <input value='header' type="checkbox" onClick={this.setAppearance} checked={this.props.config.hides.indexOf('header') !== -1} /> */}
            <div className="appearance">
              <span>{this.props.intl.formatMessage({ id: 'showOptionsHeaderLabel', defaultMessage: defaultMessages.showOptionsHeaderLabel })}</span>
              <Switch className="can-x-switch" checked={!this.props.config.hides.includes('header')}
                onChange={evt => { this.setAppearance(evt.target.checked, 'header') }} />
            </div>
          </SettingRow>
          <SettingRow tag='label'>
            {/* <input value='description' type="checkbox" onClick={this.setAppearance} checked={this.props.config.hides.indexOf('description') !== -1} /> */}
            <div className="appearance">
              <span>{this.props.intl.formatMessage({ id: 'showOptionsDesLabel', defaultMessage: defaultMessages.showOptionsDesLabel })}</span>
              <Switch className="can-x-switch" checked={!this.props.config.hides.includes('description')}
                onChange={evt => { this.setAppearance(evt.target.checked, 'description') }} />
            </div>
          </SettingRow>
          <SettingRow tag='label'>
            {/* <input value='footer' type="checkbox" onClick={this.setAppearance} checked={this.props.config.hides.indexOf('footer') !== -1} /> */}
            <div className="appearance">
              <span>{this.props.intl.formatMessage({ id: 'showOptionsFooterLabel', defaultMessage: defaultMessages.showOptionsFooterLabel })}</span>
              <Switch className="can-x-switch" checked={!this.props.config.hides.includes('footer')}
                onChange={evt => { this.setAppearance(evt.target.checked, 'footer') }} />
            </div>
          </SettingRow>
          <SettingRow tag='label'>
            {/* <input value='theme' type="checkbox" onClick={this.setAppearance} checked={this.props.config.hides.indexOf('theme') !== -1} /> */}
            <div className="appearance">
              <span>{this.props.intl.formatMessage({ id: 'useSurveyTheme', defaultMessage: defaultMessages.useSurveyTheme })}</span>
              <Switch className="can-x-switch" checked={!this.props.config.hides.includes('theme')}
                onChange={evt => { this.setAppearance(evt.target.checked, 'theme') }} />
            </div>
          </SettingRow>
        </SettingSection>

        {/* Survey mode */}
        <SettingSection role="radiogroup" aria-label={this.nls('surveyModeTitle')} title={this.nls('surveyModeTitle')}>
          {/* survey mode: new record */}
          <SettingRow>
            <div className='d-flex justify-content-between w-100 align-items-center'>
              <div className='align-items-center d-flex'>
                <Radio
                  style={{ cursor: 'pointer' }} onChange={() => { this.setMode('new') }}
                  checked={this.props.config.mode === 'new'}
                  title={this.props.intl.formatMessage({ id: 'surveyModeNew', defaultMessage: defaultMessages.surveyModeNew })}
                />
                <label
                  className='m-0 ml-2' style={{ cursor: 'pointer' }} onClick={() => { this.setMode('new') }}
                  title={this.props.intl.formatMessage({ id: 'surveyModeNew', defaultMessage: defaultMessages.surveyModeNew })}
                >
                  {this.props.intl.formatMessage({ id: 'surveyModeNew', defaultMessage: defaultMessages.surveyModeNew })}
                </label>
              </div>
            </div>
          </SettingRow>

          {/* survey mode: edit record */}
          <SettingRow>
            <div className='d-flex justify-content-between w-100 align-items-center'>
              <div className='align-items-center d-flex'>
                <Radio
                  // aria-describedby={(this.state.mapWidgetList && this.state.mapWidgetList.length > 0) ? '' : `survey_${this.props.id}_sendDataDisabled2ForEdit`}
                  style={{ cursor: 'pointer' }} onChange={() => { this.setMode('edit') }}
                  checked={this.props.config.mode === 'edit'}
                  title={this.props.intl.formatMessage({ id: 'surveyModeEdit', defaultMessage: defaultMessages.surveyModeEdit })}
                />
                <label
                  className='m-0 ml-2' style={{ cursor: 'pointer' }} onClick={() => { this.setMode('edit') }}
                  title={this.props.intl.formatMessage({ id: 'surveyModeEdit', defaultMessage: defaultMessages.surveyModeEdit })}
                >
                  {this.props.intl.formatMessage({ id: 'surveyModeEdit', defaultMessage: defaultMessages.surveyModeEdit })}
                </label>
              </div>
            </div>
          </SettingRow>

          {/* survey mode: view record */}
          <SettingRow>
            <div className='d-flex justify-content-between w-100 align-items-center'>
              <div className='align-items-center d-flex'>
                <Radio
                  // aria-describedby={(this.state.mapWidgetList && this.state.mapWidgetList.length > 0) ? '' : `survey_${this.props.id}_sendDataDisabled2ForView`}
                  style={{ cursor: 'pointer' }} onChange={() => { this.setMode('view') }}
                  checked={this.props.config.mode === 'view'}
                  title={this.props.intl.formatMessage({ id: 'surveyModeView', defaultMessage: defaultMessages.surveyModeView })}
                />
                <label
                  className='m-0 ml-2' style={{ cursor: 'pointer' }} onClick={() => { this.setMode('view') }}
                  title={this.props.intl.formatMessage({ id: 'surveyModeView', defaultMessage: defaultMessages.surveyModeView })}
                >
                  {this.props.intl.formatMessage({ id: 'surveyModeView', defaultMessage: defaultMessages.surveyModeView })}
                </label>
              </div>
            </div>
          </SettingRow>

          {/* Setting for 'new' mode: Send data to survey */}
          {this.props.config.mode === 'new' && <React.Fragment>
            <SettingRow tag='label'>
              <div className="section-title">
                <h6>{this.nls('sendDataToSurveyTitle')}</h6>
                <Switch aria-describedby={this.props.config.activeLinkData ? `survey_${this.props.id}_sendDataToSurveyDesc` : ''} className="can-x-switch" checked={this.props.config.activeLinkData}
                  onChange={this.activeLinkDataChange} />
              </div>
            </SettingRow>

            {this.props.config.activeLinkData &&
              <React.Fragment>
                <SettingRow>
                  <span id={`survey_${this.props.id}_sendDataToSurveyDesc`} className="w-100">{this.nls('sendDataToSurveyDesc')}</span>
                </SettingRow>

                {/* setting for selectionChange behavior(refresh or preserve the webapp) */}
                <SettingRow>
                  <span id={`survey_${this.props.id}_selectionChangeBehaviorTitle`} className="w-100">{this.nls('selectionChangeBehaviorTitle')}</span>
                </SettingRow>
                <SettingRow className='selection-behavior-item'>
                  <div className='align-items-center d-flex'>
                    <Radio
                      style={{ cursor: 'pointer' }} onChange={() => { this.selectionChangeBehavior('refresh') }}
                      checked={!this.props.config.selectionChangeBehavior || this.props.config.selectionChangeBehavior === 'refresh'}
                      title={this.nls('selectionChangeBehaviorTypeRefresh')}/>
                    <label
                      className='m-0 ml-2' style={{ cursor: 'pointer' }} onClick={() => { this.selectionChangeBehavior('refresh') }}
                      title={this.nls('selectionChangeBehaviorTypeRefresh')}>
                      {this.nls('selectionChangeBehaviorTypeRefresh')}
                    </label>
                  </div>
                </SettingRow>
                <SettingRow className='selection-behavior-item'>
                  <div className='align-items-center d-flex'>
                    <Radio
                      style={{ cursor: 'pointer' }} onChange={() => { this.selectionChangeBehavior('preserve') }}
                      checked={this.props.config.selectionChangeBehavior === 'preserve'}
                      title={this.nls('selectionChangeBehaviorTypePreserve')}/>
                    <label
                      className='m-0 ml-2' style={{ cursor: 'pointer' }} onClick={() => { this.selectionChangeBehavior('preserve') }}
                      title={this.nls('selectionChangeBehaviorTypePreserve')}>
                      {this.nls('selectionChangeBehaviorTypePreserve')}
                    </label>
                  </div>
                </SettingRow>

                <SettingRow className="fea-layer-outter">
                  <SettingRow className="use-feature-layer-setting">
                    <span>{this.nls('sourceLayer')}</span>
                  </SettingRow>
                  <div className="feature-layer-dropdown">
                  <DataSourceSelector
                    isMultiple={false}
                    hideDataView
                    aria-label={this.nls('sourceLayer')}
                    aria-describedby=''
                    mustUseDataSource
                    closeDataSourceListOnChange
                    hideTypeDropdown
                    types={this.supportedLayerTypes}
                    useDataSources={this.state?.layerViewInfoInNewMode ? Immutable([this.state?.layerViewInfoInNewMode]) : null}
                    onChange={this.handleUseDataSourceChange}
                    widgetId={this.props?.id}
                  />
                  </div>
                </SettingRow>

                {/* saved field-question mapping */}
                <SettingRow>
                  <div role="group" aria-owns={`survey_${this.props.id}_addNewMapping survey_${this.props.id}_addMappingBtn`} aria-label={this.nls('addConnTitle')}>
                    <span>{this.nls('addConnTitle')}</span>
                  </div>
                </SettingRow>

                {(this.state?.layerViewInfoInNewMode && this.state?.layerViewInfoInNewMode.dataSourceId)
                  ? <React.Fragment>
                    {(this.props.config.fieldQuestionMapping && this.props.config.fieldQuestionMapping.length > 0)
                      ? <div>{
                        this.props.config.fieldQuestionMapping.asMutable().map((mapping, index) => {
                          const field = mapping.field
                          const question = mapping.question
                          return <div key={field + '_' + question + '_' + index} className="mapping-container">
                            {this.state.editMapping && this.state.editMapping.index === index
                              ? <React.Fragment>
                                <Select value={this.state.editMapping.field || ''} style={{ marginBottom: '8px' }} onChange={(e) => { this.changeEditMapping('field', e) }} >
                                  {this.state.dsFeatureLayerFields.map((field) => {
                                    return <option key={'edit_' + field.name + '_' + index} value={field.name}>{field.alias || field.name}</option>
                                  })}
                                </Select>
                                <Select value={this.state.editMapping.question || ''} onChange={(e) => { this.changeEditMapping('question', e) }}>
                                  {this.state.surveyQuestionFields.length > 0 &&
                                this.state.surveyQuestionFields.map((question) => {
                                  return <option key={'edit_' + question.name + '_' + index} value={question.name}>{question.label}</option>
                                })
                                  }
                                </Select>

                                {/* buttons  */}
                                <div className="btn-group">
                                  <Button className="float-left icon-remove-mapping" type="primary" color="primary"
                                    onClick={() => { this.deleteConnection(index); this.setState({ editMapping: null }) }}>
                                      <TrashOutlined className='remove-mapping'/>
                                  </Button>
                                  <Button className="float-right" type="secondary"
                                    onClick={() => { this.setState({ editMapping: null }) }}>
                                    {this.nls('cancel')}
                                  </Button>
                                  <Button className="float-right" type="primary" color="primary"
                                    onClick={() => { this.editMapping(index); this.setState({ editMapping: null }) }}>
                                    {this.nls('ok')}
                                  </Button>
                                </div>
                              </React.Fragment>
                              : <React.Fragment>
                                <div className="link-info" onClick={(e) => { this.showEditMappingPanel(index, e) }}>
                                  <p>{this.getFielAlias(field)}</p>
                                  <div className="center-line">
                                    <div className="connect">
                                      <LinkHorizontalOutlined />
                                    </div>
                                  </div>
                                  <p>{this.getQuestionLabel(question)}</p>
                                  <div className="delete-connect" onClick={(e) => { this.deleteConnection(index, e) }}>
                                    <TrashOutlined size='s'/>
                                  </div>
                                </div>
                              </React.Fragment>}
                          </div>
                        })
                      }</div> : ''}

                    {/* add new field question mapping */}
                    {this.state.addMapping && this.state.dsFeatureLayer && this.state.dsFeatureLayerFields && this.state.dsFeatureLayerFields.length > 0 &&
                  <div className="mapping-container" id={`survey_${this.props.id}_addNewMapping`}>
                    <Select aria-label={this.nls('addConnSelectField')} value={this.state.addMapping.field || 'null'} style={{ marginBottom: '8px' }} onChange={(e) => { this.addMapppingChange('field', e) }} >
                      <option key={'add_field_default' } value="null">{this.nls('addConnSelectField')}</option>
                      {this.state.dsFeatureLayerFields.map((field) => {
                        return <option key={'add_' + field.name} value={field.name}>{field.alias || field.name}</option>
                      })}
                    </Select>
                    <Select aria-label={this.nls('addConnSelectQuestion')} value={this.state.addMapping.question || 'null'} onChange={(e) => { this.addMapppingChange('question', e) }}>
                      <option key={'add_question_default' } value="null">{this.nls('addConnSelectQuestion')}</option>
                      {this.state.surveyQuestionFields.length > 0 &&
                        this.state.surveyQuestionFields.map((question) => {
                          return <option key={'add_' + question.name} value={question.name}>{question.label}</option>
                        })
                      }
                    </Select>

                    {/* buttons  */}
                    <div className="btn-group">
                      <Button className="float-right" type="secondary" onClick={this.deactiveAddFieldQuestionConnPanel}>{this.nls('cancel')}</Button>
                      <Button className="float-right" type="primary"
                        disabled={!this.state.addMapping.field || this.state.addMapping.field === 'null' || !this.state.addMapping.question || this.state.addMapping.question === 'null'}
                        onClick={this.addFieldQuestionConn}>
                        {this.nls('ok')}
                      </Button>
                    </div>
                  </div>}
                  </React.Fragment> : ''
                }
                <SettingRow>
                  <Button className="w-100" type="primary" id={`survey_${this.props.id}_addMappingBtn`}
                    disabled={this.state.addMapping !== null || this.state.editMapping !== null || !(this.state?.layerViewInfoInNewMode && this.state?.layerViewInfoInNewMode.dataSourceId)}
                    onClick={this.activeAddFieldQuestionConnPanel}>
                    {this.nls('addConnBtn')}
                  </Button>
                </SettingRow>
              </React.Fragment>}

            </React.Fragment>}

          {/* Settng for 'edit' mode:  */}
          {this.props.config.mode === 'edit' && <React.Fragment>
            <SettingRow className="section-title">
              <div role="group" aria-describedby={`survey_${this.props.id}_chooseExistDataEditDesc`}
                aria-label={this.nls('chooseExistDataTitle')}
                aria-owns={`survey_${this.props.id}_selectSurveyLayerForEditMode`}>
                <h6>{this.nls('chooseExistDataTitle')}</h6>
              </div>
            </SettingRow>
            <SettingRow>
              <span id={`survey_${this.props.id}_chooseExistDataEditDesc`} className="w-100">{this.nls('chooseExistDataEditDesc')}</span>
            </SettingRow>
            {/* Select feature layer from webmap */}
            <SettingRow className="fea-layer-outter">
              <div id={`survey_${this.props.id}_selectSurveyLayerForEditMode`}>
                <SettingRow className="use-feature-layer-setting" >
                  <span title={this.nls('selectSurveyLayerTip')}>{this.nls('sourceLayer')}</span>
                </SettingRow>
                <div className="feature-layer-dropdown" title={this.nls('selectSurveyLayerTip')}>
                  <DataSourceSelector
                    isMultiple={false}
                    hideDataView
                    aria-label={this.nls('sourceLayer')}
                    aria-describedby=''
                    mustUseDataSource
                    closeDataSourceListOnChange
                    hideTypeDropdown
                    types={this.supportedLayerTypes}
                    useDataSources={this.state?.layerViewInfoInEditMode ? Immutable([this.state?.layerViewInfoInEditMode]) : null}
                    onChange={this.handleUseDataSourceChange}
                    widgetId={this.props?.id}
                  />
                </div>
              </div>
            </SettingRow>
            </React.Fragment>
          }

          {/* Settng for 'view' mode:  */}
          {this.props.config.mode === 'view' && <React.Fragment>
            <SettingRow>
              <div role="group" className="section-title" aria-describedby={`survey_${this.props.id}_chooseExistDataViewDesc`}
                aria-label={this.nls('chooseExistDataTitle')}
                aria-owns={`survey_${this.props.id}_selectMapForVIewMode`}>
                <h6>{this.nls('chooseExistDataTitle')}</h6>
              </div>
            </SettingRow>
            <SettingRow>
                <span id={`survey_${this.props.id}_chooseExistDataViewDesc`} className="w-100">{this.nls('chooseExistDataViewDesc')}</span>
            </SettingRow>
            {/* Select feature layer from webmap */}
            <SettingRow className="fea-layer-outter">
              <div id={`survey_${this.props.id}_selectMapForVIewMode`}>
                <SettingRow className="use-feature-layer-setting">
                  <span title={this.nls('selectSurveyLayerTip')}>{this.nls('sourceLayer')}</span>
                </SettingRow>
                <div className="feature-layer-dropdown" title={this.nls('selectSurveyLayerTip')}>
                  <DataSourceSelector
                    isMultiple={false}
                    hideDataView
                    aria-label={this.nls('sourceLayer')}
                    aria-describedby=''
                    mustUseDataSource
                    closeDataSourceListOnChange
                    hideTypeDropdown
                    types={this.supportedLayerTypes}
                    useDataSources={this.state?.layerViewInfoInViewMode ? Immutable([this.state?.layerViewInfoInViewMode]) : null}
                    onChange={this.handleUseDataSourceChange}
                    widgetId={this.props?.id}
                  />
                </div>
              </div>
            </SettingRow>
            </React.Fragment>
          }
        </SettingSection>
      </div>

      {/* confirm reset survey section */}
      <div className="survey123__section"
        role="group" aria-label={this.nls('resetSurveyLabel')}
        style={
        (this.state.mode.indexOf('confirmResetSurvey') !== -1)
          ? { display: 'block' }
          : { display: 'none' }
      }>
        <SettingSection title={this.nls('resetSurveyLabel')}>
          <SettingRow>
            {this.props.intl.formatMessage({ id: 'resetSurveyTip', defaultMessage: defaultMessages.resetSurveyTip })}
          </SettingRow>
          {this.props.intl.formatMessage({ id: 'confirmResetSurveyTip', defaultMessage: defaultMessages.confirmResetSurveyTip })}

          <SettingRow>
            <Button aria-description={this.props.intl.formatMessage({ id: 'resetSurveyTip', defaultMessage: defaultMessages.resetSurveyTip })} type="primary" onClick={() => { this.resetSurvey() }}>{this.nls('yes')}</Button>
            <Button onClick={() => { this.showSettingPage() }}>{this.nls('no')}</Button>
          </SettingRow>
        </SettingSection>
      </div>

      <Modal
        isOpen={this.state.modalIsOpen}
        className="w-100 h-100 p-0 m-0 survey123__desinger_modal"
        css={getModalStyle(this.props.theme)}>
        <div className="survey123__desinger">
          <p>{this.props.intl.formatMessage({ id: 'editSurveyBtn', defaultMessage: defaultMessages.editSurveyBtn })}</p>
          <button color="primary" onClick={this.handleCloseModal}>
            <CloseOutlined size={24}/>
          </button>
        </div>

        <iframe id="survey123-designer" title={this.nls('editSurveyBtn')} width="100%"></iframe>

        <AlertPopup isOpen={this.state.isShowCloseDesignerAlert}
          okLabel={this.nls('ok')}
          title={this.props.label}
          toggle={this.handleCloseDesignerAlert}>
          <div style={{ fontSize: '1rem' }}>
            {this.nls('msgUnsavedBeforeLeaving')}
          </div>
        </AlertPopup>
      </Modal>
    </div>
  }
}
