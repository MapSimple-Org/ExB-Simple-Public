/** @jsx jsx */
import {
  React, DataSourceManager, type IMDataSourceInfo, type IMUrlParameters, type IMState, getAppStore,
  type AllWidgetProps, jsx, moduleLoader, DataSourceComponent, type QueriableDataSource, urlUtils,
  type FeatureLayerDataSource,
  SessionManager
} from 'jimu-core'

import { WidgetPlaceholder } from 'jimu-ui'
import type { IMConfig } from '../config'
// import { ArcGISDataSourceTypes, type JimuMapView } from 'jimu-arcgis'
import { getStyle } from './css/style'

import defaultMessages from './translations/default'
import featureReportInfo from '../../icon.svg'
import { extractParamFromDataSource } from '../utils'

import { defineCustomElements } from '@arcgis-survey123/feature-report-components/loader'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { CalciteInputTimeZone } from 'calcite-components'

defineCustomElements(window, { resourcesUrl: `${urlUtils.getFixedRootPath()}widgets/common/feature-report/dist/runtime/report-component/` })

interface ExtraProps {
  queryObject: IMUrlParameters
}

export interface State {
  featureLayerUrl: string
  queryParameters: string
}

/**
 * Feature report widget
 */
export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      queryObject: state.queryObject
    }
  }

  private readonly _dsManager = DataSourceManager.getInstance()
  public paramStore: any = null
  private calciteLoaded: boolean = false
  private templateTitleChangedTickCache: number
  private _clientId: any

  constructor (props) {
    super(props)
    this.state = {
      featureLayerUrl: '',
      queryParameters: ''
    }
    this.getClientId()
  }

  componentDidMount () {
    this.prepare() //this.loadSurveyAPI();
  }

  /**
   * prepare:
   * load calcite
   */
  prepare = () => {
    return this.loadCalcite()
  }

  // load calcite
  loadCalcite = () => {
    if (!this.calciteLoaded) {
      return moduleLoader.loadModule('../calcite-components/index.js')
        .then((data) => {
          this.calciteLoaded = true
          return true
        })
    } else {
      return Promise.resolve(true)
    }
  }

  onDataSourceCreated = (dataSource: QueriableDataSource) => {
    //
  }

  /**
   * when data souce changed, update the query parameter
   * @param info
   * @returns
   */
  onDataSourceInfoChange = (info: IMDataSourceInfo) => {
    if (!info || info.status !== 'LOADED') {
      return
    }
    const queryParms: any = {}
    const dataSource = this._dsManager.getDataSource(this.props.useDataSources[0].dataSourceId) as FeatureLayerDataSource
    if (dataSource) {
      const dsParam = extractParamFromDataSource(dataSource)
      if ('where' in dsParam) {
        queryParms.where = dsParam.where
      }
      if ('objectIds' in dsParam) {
        queryParms.objectIds = dsParam.objectIds
      }
      if (dsParam.orderByFields?.length) {
        queryParms.orderByFields = dsParam.orderByFields.join(',')
      }
      this.setState({
        featureLayerUrl: dsParam.url,
        queryParameters: JSON.stringify(queryParms)
      })
      this.updateReportParams()
    }
  }

  /**
   * get client id (for webform js api)
   */
  getClientId () {
    const session = SessionManager.getInstance().getMainSession()
    this._clientId = ''
    if (session && session.clientId) {
      this._clientId = session.clientId
    } else if (getAppStore().getState().appConfig?.attributes?.clientId) {
      this._clientId = getAppStore().getState().appConfig.attributes.clientId
    }
  }

  // todo: test the case when there are two report widgets in app.
  updateReportParams = () => {
    const config = this.props.config
    // const useDataSource = this.props.useDataSources && this.props.useDataSources[0]
    // const dataSource = this._dsManager.getDataSource(this.props.useDataSources[0].dataSourceId) as QueriableDataSource
    const hides: any[] = [].concat(config.hides) || []
    this.paramStore = {
      'survey-item-id': config.surveyItemId,
      'feature-layer-url': this.state?.featureLayerUrl,
      hide: hides.join(','),
      'merge-files': config.mergeFiles,
      'output-format': config.outputFormat,
      'output-report-name': config.reportName,
      locale: this.props.locale,
      'report-template-ids': (config.reportTemplateIds || []).join(','),
      'query-parameters': this.state?.queryParameters,
      'input-feature-template': config.inputFeatureTemplate,
      'portal-url': this.props.portalUrl || 'https://www.arcgis.com'
    }

    const env = window.jimuConfig.hostEnv as any
    if (['dev', 'qa', 'beta'].includes(env)) {
      this.paramStore['api-url'] = `https://survey123${env}.arcgis.com/api/featureReport`
    }
    // if config.hides contains reportSetting, hide fileOptions, reportName, saveToAGSAccount and outputFormat.
    if (hides.includes('reportSetting')) {
      ['fileOptions', 'reportName', 'saveToAGSAccount', 'outputFormat'].forEach((item) => {
        if (!hides.includes(item)) {
          hides.push(item)
        }
      })
      this.paramStore.hide = hides.join(',')
    } else {
      // if config.hides does not contain reportSetting, need to check the individual setting
    }

    // build the label property
    const labelObj = {}
    const labelTypes = ['inputFeatures', 'selectTemplate', 'fileOptions', 'reportName', 'saveToAGSAccount', 'generateReport', 'showCredits', 'recentReports', 'outputFormat', 'reportSetting']
    labelTypes.forEach((type) => {
      const key = type + 'Label'
      if (config[key] && config[key].trim()) {
        labelObj[type] = config[key]
      }
    })
    this.paramStore.label = JSON.stringify(labelObj)

    // remove empty/default parameters
    if (!this.paramStore.hide) {
      delete this.paramStore.hide
    }
    if (!this.paramStore.label || this.paramStore.label === '{}') {
      delete this.paramStore.label
    }
    if (this.paramStore['portal-url'] === 'https://www.arcgis.com') {
      delete this.paramStore['portal-url']
    }
    return this.paramStore
  }

  /**
   * render ds
   */
  renderDS () {
    return <div></div>
  }

  /**
   * render
   */
  render () {
    // token
    const token = SessionManager.getInstance().getMainSession()?.token
    const useDataSource = this.props.useDataSources && this.props.useDataSources[0]
    /**
     * html
     * todo: not to re-render the component when the parameter changed
     */

    let content = null
    /**
     * if no data source or survey item id
     */
    if (!useDataSource || !this.state?.featureLayerUrl) {
      content = <div className='widget-featureReport'>
        <WidgetPlaceholder
          icon={featureReportInfo}
          name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })}
          widgetId={this.props.id} />
      </div>
    } else {
      this.updateReportParams()
      /**
       * #26642, call the reportComponent.updateTemplateList() when only template title changed.
       */
      const templateTitleChangedTick = this.props.stateProps?.templateTitleChanged
      if (templateTitleChangedTick && this.templateTitleChangedTickCache !== templateTitleChangedTick) {
        const node = document.querySelector(`#${this.props.id}_report`)
        if (node) {
          (node as any).updateTemplateList()
        }
        this.templateTitleChangedTickCache = templateTitleChangedTick
      }
      const clientId = this._clientId || 'experienceBuilder'
      content = (
        <div className='widget-featureReport'>
          <feature-report
            {...this.paramStore}
            token={token}
            id={this.props.id + '_report'}
            client-id={clientId}
            request-source="ExB/FeatureReportWidget"
            >
          </feature-report>
        </div>
      )
    }

    return (
    <div css={getStyle(this.props.theme)} className='jimu-widget'>
      {content}

      <div style={{ position: 'absolute', display: 'none' }}>
        <DataSourceComponent
            useDataSource={useDataSource}
            query={{}}
            widgetId={this.props.widgetId}
            onDataSourceCreated={this.onDataSourceCreated}
            // onQueryStatusChange={this.onQueryStatusChange}
            onDataSourceInfoChange={this.onDataSourceInfoChange}
            // onCreateDataSourceFailed={this.onCreateDataSourceFailed}
          />
      </div>

    </div>
    )
  }
}
