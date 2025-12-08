import { esri, portalUrlUtils, SessionManager, Immutable, UtilityManager, DataSourceManager, DataSourceTypes, getAppStore, loadArcGISJSAPIModules } from 'jimu-core'
import type { ImmutableObject, UseDataSource, UseUtility, AppRuntimeInfo, FeatureLayerDataSource } from 'jimu-core'
import type { ImmutableArray } from 'seamless-immutable'
import { getPortalUrlByServiceUrl } from './service-util'
import {
  PrintServiceType, PrintTemplateType, ItemInfoType, type PrintTemplateProperties, type IMPrintTemplateProperties, type LayoutType, type ScalebarUnitType, CIMMarkerNorthArrow, ReportTemplateTypes, type IMConfig,
  ReportTypes, LayoutTypes, DEFAULT_COMMON_SETTING, type ActiveItem, type ElementOverrideOptions, type ElementOverrides, PrintServiceTaskType, type MapSurroundInfo
} from '../config'

interface ScaleBarList {
  value: ScalebarUnitType
  label: string
}

enum ExecutionType {
  AsynchronousSubmit = 'esriExecutionTypeAsynchronous',
  SynchronousExecute = 'esriExecutionTypeSynchronous'
}

interface TemplateInfoUrlInfo {
  url: string
  layoutTemplatesInfoTaskUrl: string
  layoutTemplatesInfoRequestUrl: string
  reportTemplatesInfoTaskUrl: string
  reportTemplatesInfoRequestUrl: string
  executionType: ExecutionType
  layoutTemplateTaskExecutionType: ExecutionType
}

export interface PrintServiceTaskInfo {
  templates: PrintTemplateProperties[]
  formatList: string[]
  defaultFormat: string
  defaultReportTemplate: string
  defaultCustomReportItem: ActiveItem
  defaultLayout: string
  defaultCustomLayoutItem: ActiveItem
  hasWebmapParam: boolean
  hasOutputParam: boolean
  supportCustomLayout: boolean
  supportReport: boolean
  supportCustomReport: boolean
}

interface CheckReportsTemplateAvailableOptionTypes {
  supportReport?: boolean
  supportCustomReport?: boolean
  defaultReportTemplate?: string
  defaultCustomReportItem?: ActiveItem
  reportOptions?: any
  reportTypes?: ReportTypes
}

// for tslint
export function isDefined (value): boolean {
  if (typeof value !== 'undefined' && !(value === null)) {
    return true
  } else {
    return false
  }
}

export const getOrganizationPrintTask = (portalUrl: string) => {
  const request = esri.restRequest.request
  const sm = SessionManager.getInstance()
  return request(`${portalUrlUtils.getPortalRestUrl(portalUrl)}/portals/self`, {
    authentication: sm.getMainSession(),
    httpMethod: 'GET'
  }).then(portalSelf => {
    return Promise.resolve(portalSelf?.helperServices?.printTask || null)
  }).catch(err => {
    return Promise.resolve(null)
  })
}

export const getTemplateType = (printServiceType: PrintServiceType, printTemplateType: PrintTemplateType) => {
  return printServiceType === PrintServiceType.Customize || printTemplateType === PrintTemplateType.Customize ? 'custom' : 'org'
}

//Merge template setting
export const mergeTemplateSetting = (orgTemplateSetting: IMPrintTemplateProperties, overwriteTemplateSetting: IMPrintTemplateProperties): IMPrintTemplateProperties => {
  let newOverwriteTemplateSetting = overwriteTemplateSetting
  //Init template exportOptions
  if (orgTemplateSetting?.exportOptions) {
    newOverwriteTemplateSetting = newOverwriteTemplateSetting.set('exportOptions', {
      ...(orgTemplateSetting.exportOptions || {}),
      ...(overwriteTemplateSetting?.exportOptions || {})
    })
  }

  //Init template layoutOptions
  if (orgTemplateSetting?.layoutOptions && overwriteTemplateSetting?.layoutOptions) {
    newOverwriteTemplateSetting = newOverwriteTemplateSetting.set('layoutOptions', {
      ...(orgTemplateSetting?.layoutOptions || {}),
      ...(overwriteTemplateSetting?.layoutOptions || {})
    })
  }

  return Immutable({
    ...orgTemplateSetting,
    ...newOverwriteTemplateSetting
  })
}

export const getIndexByTemplateId = (templates: PrintTemplateProperties[], templateId): number => {
  let index
  templates?.forEach((item, idx) => {
    if (item?.templateId === templateId) {
      index = idx
    }
  })
  return index
}

export const checkIsCustomTemplate = (printServiceType: PrintServiceType, printTemplateType: PrintTemplateType): boolean => {
  return printServiceType === PrintServiceType.Customize || printTemplateType === PrintTemplateType.Customize
}

export const initTemplateLayout = (layout: string): LayoutType => {
  // return layout?.replace(/\_/ig, '-')?.replace(/\s+/ig, '-')?.toLowerCase() as LayoutType
  return layout
}

export const initMapOnlyLayout = (layout: string): LayoutType => {
  return layout?.replace(/\_/ig, '-')?.replace(/\s+/ig, '-')?.toLowerCase()
}

export const checkIsMapOnly = (layout: string): boolean => {
  return initMapOnlyLayout(layout) === 'map-only'
}

export const checkIsTemplateExist = (templateList: ImmutableArray<PrintTemplateProperties>, templateId): boolean => {
  let isExist = false
  templateList?.forEach(tmp => {
    if (tmp?.templateId === templateId) {
      isExist = true
    }
  })
  return isExist
}

export const checkNumber = (value, minimum: number = 1): boolean => {
  if (value?.length === 0) return true
  if (isNaN(Number(value))) {
    return false
  } else {
    const numberVal = Number(value)
    return Number.isInteger(numberVal) && numberVal >= minimum
  }
}

export const getUrlOfUseUtility = async (useUtility: UseUtility) => {
  return UtilityManager.getInstance().getUrlOfUseUtility(useUtility)
    .then((url) => {
      return Promise.resolve(url)
    })
}

export async function getTemplateOrReportInfo (printServiceUrl: string, itemInfoType?: ItemInfoType, itemId?: string): Promise<any[]> {
  const options = {
    query: {
      'env:outSR': '',
      'env:processSR': '',
      returnZ: false,
      returnM: false,
      returnTrueCurves: false,
      returnFeatureCollection: false,
      context: '',
      f: 'json'
    },
    responseType: 'json'
  } as any
  const portalUrl = await getPortalUrlByServiceUrl(printServiceUrl)
  const session = portalUrl ? SessionManager.getInstance().getSessionByUrl(portalUrl) : null
  if (itemId) {
    const itemIdOption = { id: itemId } as any
    session && (itemIdOption.token = session.token)
    if (itemInfoType === ItemInfoType.LayoutTemplate) {
      session && (options.query.token = session.token)
      options.query.Layout_Item_ID = JSON.stringify(itemIdOption)
    }
    if (itemInfoType === ItemInfoType.ReportTemplate) {
      options.query.Report_Item_ID = JSON.stringify(itemIdOption)
    }
  }

  return getPrintServiceTaskUrl(printServiceUrl).then(urlInfo => {
    const { layoutTemplatesInfoRequestUrl, reportTemplatesInfoRequestUrl, reportTemplatesInfoTaskUrl, executionType, layoutTemplatesInfoTaskUrl, layoutTemplateTaskExecutionType } = urlInfo
    const requestUrl = itemInfoType === ItemInfoType.ReportTemplate ? reportTemplatesInfoRequestUrl : layoutTemplatesInfoRequestUrl
    const currentExecutionType = itemInfoType === ItemInfoType.LayoutTemplate ? layoutTemplateTaskExecutionType : executionType
    if (!requestUrl) {
      return Promise.resolve(null)
    }
    return loadArcGISJSAPIModules(['esri/request']).then(modules => {
      const [esriRequest] = modules
      return esriRequest(requestUrl, options).then(async res => {
        if (currentExecutionType === ExecutionType.AsynchronousSubmit) {
          const jobId = res?.data?.jobId
          const infoTaskUrl = itemInfoType === ItemInfoType.ReportTemplate ? reportTemplatesInfoTaskUrl : layoutTemplatesInfoTaskUrl
          return getResultByJobId(infoTaskUrl, jobId, options, esriRequest)
        } else {
          return Promise.resolve(res?.data?.results[0]?.value || [])
        }
      }, err => {
        return Promise.reject(new Error(err))
      }).catch(err => {
        return Promise.reject(new Error(err))
      })
    })
  })
}

/**
 * When obtaining the Task result, after the request is completed and the jobId is obtained, when the Task result is obtained through this jobId in a short period of time,
 * the result may not be obtained. Therefore, when the result is not obtained, it needs to be requested every 3 seconds. If the result is still not obtained after 30s, return []
*/
async function getResultByJobId (infoTaskUrl: string, jobId: string, requestOptions, esriRequest): Promise<any[]> {
  const infoResultUrl = `${infoTaskUrl}/jobs/${jobId}/results/Output_JSON`
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 10
    const delay = 3000

    const makeRequest = () => {
      esriRequest(infoResultUrl, requestOptions).then(res => {
        if (res?.data?.value) {
          resolve(res.data.value)
        } else {
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(makeRequest, delay)
          } else {
            resolve([])
          }
        }
      }).catch(error => {
        reject(new Error(error))
      })
    }

    makeRequest()
  })
}

export function checkIsArraysSameContent (arr1, arr2) {
  if (arr1?.length !== arr2?.length || !arr1 || !arr2) {
    return false
  }

  const sortedArr1 = arr1.sort()
  const sortedArr2 = arr2.sort()

  let isSameContent = true
  sortedArr1?.forEach((item, i) => {
    if (sortedArr1[i] !== sortedArr2[i]) {
      isSameContent = false
    }
  })

  return isSameContent
}

async function getPrintServiceTaskUrl (printServiceUrl: string): Promise<TemplateInfoUrlInfo> {
  if (!printServiceUrl) return Promise.resolve(null)
  const serverUrl = `${printServiceUrl.split('/GPServer')?.[0]}/GPServer`

  const asyncPrintTaskUrl = getAsyncPrintTaskUrl()
  const taskInfo = await getTasksInfo(serverUrl) || {}
  const { tasks, supportedOperations, executionType } = taskInfo
  let layoutTemplateTaskExecutionType = executionType

  let layoutTemplatesInfoTaskUrl = null
  let layoutTemplatesInfoRequestUrl = null

  let reportTemplatesInfoTaskUrl = null
  let reportTemplatesInfoRequestUrl = null
  const getTemplatesInfoRequestUrlPromise = tasks?.map(taskName => {
    return getTaskType(taskName, serverUrl).then(taskType => {
      if (taskType === PrintServiceTaskType.GetLayoutTemplatesInfo) {
        layoutTemplatesInfoTaskUrl = `${serverUrl}/${taskName}`
        layoutTemplatesInfoRequestUrl = `${layoutTemplatesInfoTaskUrl}/${supportedOperations}`
      }
      if (taskType === PrintServiceTaskType.GetReportTemplatesInfo) {
        reportTemplatesInfoTaskUrl = `${serverUrl}/${taskName}`
        reportTemplatesInfoRequestUrl = `${serverUrl}/${taskName}/${supportedOperations}`
      }
    })
  })
  await Promise.all(getTemplatesInfoRequestUrlPromise)

  if (asyncPrintTaskUrl === printServiceUrl) {
    //In the premium print service, export web map task and get layout info task are stored in two different print services
    const templateTaskInfo = await getLayoutTempInfoTaskUrlOfPremiumService(serverUrl)
    layoutTemplatesInfoTaskUrl = templateTaskInfo.layoutTemplatesInfoTaskUrl
    layoutTemplatesInfoRequestUrl = templateTaskInfo.layoutTemplatesInfoRequestUrl
    layoutTemplateTaskExecutionType = templateTaskInfo.executionType
  }

  return Promise.resolve({
    url: serverUrl,
    layoutTemplatesInfoTaskUrl: layoutTemplatesInfoTaskUrl,
    layoutTemplatesInfoRequestUrl: layoutTemplatesInfoRequestUrl,
    reportTemplatesInfoTaskUrl: reportTemplatesInfoTaskUrl,
    reportTemplatesInfoRequestUrl: reportTemplatesInfoRequestUrl,
    executionType: executionType,
    layoutTemplateTaskExecutionType: layoutTemplateTaskExecutionType
  })
}

async function getTaskType(taskName: string, serverUrl: string): Promise<PrintServiceTaskType> {
  if (!taskName || !serverUrl) return Promise.resolve(null)
  const taskInfoUrl = `${serverUrl}/${taskName}`
  const options = {
    query: {
      f: 'json'
    },
    responseType: 'json'
  } as any
  return loadArcGISJSAPIModules(['esri/request']).then(modules => {
    const [esriRequest] = modules
    return esriRequest(taskInfoUrl, options).then(res => {
      const taskType = res?.data?.name as PrintServiceTaskType
      return Promise.resolve(taskType)
    })
  })
}

async function getLayoutTempInfoTaskUrlOfPremiumService (premiumServiceUrl: string) {
  const urlOrigin = premiumServiceUrl?.split('/arcgis/')[0]
  const templateTaskServiceUrl = `${urlOrigin}/arcgis/rest/services/Utilities/PrintingTools/GPServer`
  const taskInfo = await getTasksInfo(templateTaskServiceUrl) || {}
  const { tasks, supportedOperations, executionType } = taskInfo

  let layoutTemplatesInfoTaskUrl = null
  let layoutTemplatesInfoRequestUrl = null
  let layoutTemplateTaskName = null

  tasks?.forEach(taskName => {
    if (taskName?.includes('Layout') || taskName?.includes('Layout')) {
      layoutTemplateTaskName = taskName
    }
  })

  layoutTemplatesInfoTaskUrl = `${templateTaskServiceUrl}/${layoutTemplateTaskName}`
  layoutTemplatesInfoRequestUrl = `${layoutTemplatesInfoTaskUrl}/${supportedOperations}`
  return {
    layoutTemplatesInfoTaskUrl: layoutTemplatesInfoTaskUrl,
    layoutTemplatesInfoRequestUrl: layoutTemplatesInfoRequestUrl,
    executionType: executionType
  }
}

function getAsyncPrintTaskUrl () {
  const helperServices = getAppStore().getState().portalSelf?.helperServices || {}
  return helperServices?.asyncPrintTask?.url || null
}

async function getTasksInfo (serviceUrl: string) {
  if (!serviceUrl) return Promise.resolve(null)
  const serverUrl = `${serviceUrl.split('/GPServer')?.[0]}/GPServer`
  const options = {
    query: {
      f: 'json'
    },
    responseType: 'json'
  } as any
  return loadArcGISJSAPIModules(['esri/request']).then(modules => {
    const [esriRequest] = modules
    return esriRequest(serverUrl, options).then(res => {
      const tasks = res?.data?.tasks as string[]
      const executionType = res?.data?.executionType
      const supportedOperations = executionType === ExecutionType.SynchronousExecute ? 'execute' : 'submitJob'

      return Promise.resolve({
        tasks,
        supportedOperations,
        executionType
      })
    })
  })
}

export function getScaleBarList (nls): ScaleBarList[] {
  return [
    {
      value: 'Miles',
      label: nls('unitsLabelMiles')
    },
    {
      value: 'Kilometers',
      label: nls('unitsLabelKilometers')
    },
    {
      value: 'Meters',
      label: nls('unitsLabelMeters')
    },
    {
      value: 'Feet',
      label: nls('unitsLabelFeet')
    }
  ]
}

export function getKeyOfNorthArrow (elementOverrides = {}): string {
  let northArrowKey = null
  for (const key in elementOverrides) {
    if (elementOverrides?.[key]?.type === CIMMarkerNorthArrow) {
      northArrowKey = key
    }
  }
  return northArrowKey
}

export function getElementOverridesOptions(elementOverrides: ElementOverrides): ElementOverrideOptions {
  if (!elementOverrides) {
    return null
  }

  const options: ElementOverrideOptions = {
    northArrow: [],
    scaleBar: [],
    legend: [],
    dynamicText: [],
    table: [],
    chart: []
  }

  for (const key in elementOverrides) {
    const info = elementOverrides[key]
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (info.type) {
      case 'CIMMarkerNorthArrow': {
        options.northArrow.push(info)
        break
      }
      // case 'CIMScaleLine': {
      //   options.scaleBar.push(info);
      //   break;
      // }
      // case 'CIMGroupElement': {
      //   if (info.elements?.some((element) => element.type === 'CIMScaleLine')) {
      //     options.scaleBar.push(info);
      //   }
      //   break;
      // }
      case 'CIMGraphicElement': {
        if (info.dynamicTextElements?.some((element) => (element as any).type === 'table')) {
          options.dynamicText.push(info)
        }
        break
      }
      // case 'CIMLegend': {
      //   options.legend.push(info);
      //   break;
      // }
      case 'CIMTableFrame': {
        options.table.push(info)
        break
      }
      // case 'CIMChartFrame': {
      //   options.chart.push(info);
      //   break;
      // }
    }
  }

  return options
}

export function getReportTemplateTypes (reportOption): ReportTemplateTypes {
  if (!reportOption) return null
  let types = ReportTemplateTypes.RPTX
  const reportSectionOverrides = reportOption?.reportSectionOverrides || {}
  Object.keys(reportSectionOverrides).forEach(key => {
    const reportItem = reportSectionOverrides[key]
    if (reportItem?.fieldElements || reportItem?.fieldLabelElements) {
      types = ReportTemplateTypes.RPTT
    }
  })
  return types
}

export function getNewConfigWidthNewTemplateItem (config: IMConfig, index: number, newTemplateItem: PrintTemplateProperties) {
  const printTemplate = config?.printTemplateType === PrintTemplateType.Customize ? config.printCustomTemplate?.asMutable({ deep: true }) : config.printOrgTemplate?.asMutable({ deep: true })
  printTemplate[index] = newTemplateItem
  const newConfig = config?.printTemplateType === PrintTemplateType.Customize ? config.set('printCustomTemplate', printTemplate) : config.set('printOrgTemplate', printTemplate)
  return newConfig
}

export function checkIsTemplateAvailable (template: PrintTemplateProperties, config: IMConfig): boolean {
  const templateAvailableStatus = getTemplateAvailableStatus(template, config)
  const { reportsAvailable, elementOverridesAvailable} = templateAvailableStatus
  return reportsAvailable && elementOverridesAvailable
}

export function getTemplateAvailableStatus (template: PrintTemplateProperties, config: IMConfig) {
  const { defaultCustomReportItem, defaultReportTemplate, supportCustomReport, supportReport } = config
  const option = {
    defaultCustomReportItem,
    defaultReportTemplate,
    supportCustomReport,
    supportReport,
    reportOptions: template?.reportOptions,
    reportTypes: template?.reportTypes
  }
  const reportsAvailable = checkIsReportsTemplateAvailable(option)
  const elementOverridesAvailable = checkIsElementOverridesAvailable(template?.layoutOptions?.elementOverrides)
  return {
    reportsAvailable,
    elementOverridesAvailable
  }
}

export const getErrorRemindText = (template: PrintTemplateProperties, config: IMConfig, nls) => {
  const templateAvailableStatus = getTemplateAvailableStatus(template, config)
  const { reportsAvailable, elementOverridesAvailable } = templateAvailableStatus
  let text
  if (!reportsAvailable) {
    text = nls('reportTemplateRemind')
  }
  if (!elementOverridesAvailable) {
    text = text ? `${text} ${nls('dynamicElementTemplateRemind')}` : nls('dynamicElementTemplateRemind')
  }
  return text
}

export function checkIsReportsTemplateAvailable (option: CheckReportsTemplateAvailableOptionTypes): boolean {
  const { reportOptions, defaultCustomReportItem, defaultReportTemplate, supportCustomReport, supportReport, reportTypes } = option
  if (!supportCustomReport && !supportReport) return true

  switch (reportTypes) {
    case ReportTypes.CustomReport:
      if (!reportOptions) {
        if (!defaultCustomReportItem) {
          return !defaultReportTemplate
        } else {
          return false
        }
      } else {
        return checkReportOption(reportOptions)
      }
    case ReportTypes.ServiceReport:
      if (!reportOptions) {
        return !defaultReportTemplate
      } else {
        return checkReportOption(reportOptions)
      }
  }
}

function checkIsElementOverridesAvailable(elementOverrides: ElementOverrides) {
  if (!elementOverrides) return true
  let available = true
  for (const key in elementOverrides) {
    const elementOverridesItem = elementOverrides[key]
    if (!checkIsElementOverrideItemAvailable(elementOverridesItem)) {
      available = false
    }
  }
  return available
}

export function checkIsElementOverrideItemAvailable (elementOverridesItem: MapSurroundInfo) {
  let available = true
  if (elementOverridesItem.visible && (elementOverridesItem.type === 'CIMTableFrame' || elementOverridesItem.type === 'CIMGraphicElement')) {
    const elementOverridesOptionDS = elementOverridesItem?.exbDataSource
    if (!elementOverridesOptionDS || elementOverridesOptionDS?.length === 0) {
      available = false
    }
  }
  return available
}

function checkReportOption (reportOptions): boolean {
  if (!reportOptions?.reportSectionOverrides) return false
  const reportSectionOverrides = reportOptions?.reportSectionOverrides || {}
  let available = true
  Object.keys(reportSectionOverrides).forEach((key, index) => {
    const reportItem = reportSectionOverrides[key]
    if (!reportItem?.exbDatasource || reportItem?.exbDatasource?.length === 0) {
      available = false
    } else {
      const rootDsIds = getDsRootIdsInConfig() || []
      const ds = reportItem?.exbDatasource?.[0]
      const rootDataSourceId = ds?.rootDataSourceId || ds?.mainDataSourceId
      if (!rootDsIds?.includes(rootDataSourceId)) {
        available = false
      }
    }
  })
  return available
}

export const getDsRootIdsInConfig = (): ImmutableArray<string> => {
  const state = getAppStore().getState()
  const appConfig = state?.appStateInBuilder ? state?.appStateInBuilder?.appConfig : state?.appConfig
  const dataSources = appConfig?.dataSources
  const rootIds = []
  Object.keys(dataSources).forEach(key => {
    const ds = dataSources[key]
    if (ds?.type !== DataSourceTypes.WebScene) {
      // is root ds
      rootIds.push(ds.id)
    }
  })
  return rootIds.length > 0 ? Immutable(rootIds) : undefined
}

export const checkIsDsInUseMap = (exbDataSource: UseDataSource[], useMapWidgetIds?: ImmutableArray<string>): boolean => {
  // const map = mapView.map
  // const layers = map.layers.toArray()
  if (!exbDataSource || exbDataSource?.length === 0 || !useMapWidgetIds) {
    return true
  } else {
    let isInMap = true
    const rootDsIds = getDsRootIdsByWidgetId(useMapWidgetIds?.[0]) || []
    const ds = exbDataSource?.[0]
    if (ds?.dataViewId) {
      return false
    }
    const rootDataSourceId = ds?.rootDataSourceId || ds?.mainDataSourceId
    if (!rootDsIds?.includes(rootDataSourceId)) {
      isInMap = false
    }
    return isInMap
  }
}


export const getDsRootIdsByWidgetId = (useMapWidgetId: string): ImmutableArray<string> => {
  const state = getAppStore().getState()
  const appConfig = state?.appStateInBuilder ? state?.appStateInBuilder?.appConfig : state?.appConfig
  const widgetJson = appConfig?.widgets?.[useMapWidgetId]
  const rootIds = []
  const dsM = DataSourceManager.getInstance()
  widgetJson?.useDataSources?.forEach((useDS: ImmutableObject<UseDataSource>) => {
    const ds = dsM.getDataSource(useDS.dataSourceId)
    if (ds?.type === DataSourceTypes.WebMap) {
      // is root ds
      rootIds.push(useDS.dataSourceId)
    }
  })
  return rootIds.length > 0 ? Immutable(rootIds) : undefined
}

//Init template properties
export const initDefaultTemplates = (orgTemplate: PrintTemplateProperties[], printServiceType: PrintServiceType, printTemplateType: PrintTemplateType) => {
  const newTemplates = orgTemplate.map(template => {
    let newTemplate = Immutable(template)
    //Init template layout
    newTemplate = newTemplate.set('layout', initTemplateLayout(template?.layout))

    //Init scalebar unit and legendLayers of template
    newTemplate = newTemplate.setIn(['layoutOptions', 'scalebarUnit'], 'Miles').setIn(['layoutOptions', 'legendLayers'], null)

    //Init default service types and default layout types
    newTemplate = newTemplate.set('reportTypes', ReportTypes.ServiceReport).set('layoutTypes', LayoutTypes.ServiceLayout)

    //Init template exportOptions
    if (checkIsMapOnly(newTemplate?.layout)) {
      newTemplate = newTemplate.set('exportOptions', {
        ...{
          width: 800,
          height: 1100
        },
        ...template?.exportOptions
      })
    }

    return mergeTemplateSetting(Immutable(DEFAULT_COMMON_SETTING as any), Immutable(newTemplate))?.asMutable({ deep: true })
  })
  return addTemplateIdForPrintTemplate(newTemplates, printServiceType, printTemplateType)
}

export const addTemplateIdForPrintTemplate = (printTemplate: PrintTemplateProperties[], printServiceType: PrintServiceType, printTemplateType: PrintTemplateType): PrintTemplateProperties[] => {
  const type = getTemplateType(printServiceType, printTemplateType)
  return printTemplate.map((template, index) => {
    template.templateId = `config_${type}_${index}`
    return template
  })
}

// Get default print template by Print service url
export function getPrintTaskInfo (taskUrl: string): Promise<PrintServiceTaskInfo> {
  // portal own print url: portalname/arcgis/sharing/tools/newPrint
  const options = {
    query: {
      f: 'json'
    },
    responseType: 'json'
  } as any
  return loadArcGISJSAPIModules(['esri/request']).then(modules => {
    const [esriRequest] = modules
    return esriRequest(taskUrl, options).then(res => {
      return handlePrintInfo(res?.data)
    })
  })
}

export function checkIsUtilityAvailable (utilityId: string, appRuntimeInfo: ImmutableObject<AppRuntimeInfo>): boolean {
  if (!utilityId) return false
  const utilityJson = UtilityManager.getInstance().getUtilityJson(utilityId)
  const defaultValid = utilityJson?.source === 'org'
  const isValid = appRuntimeInfo?.utilityStates?.[utilityId]?.success ?? defaultValid
  return isValid
}

export function checkDsIsOutputDs (dataSourceId: string): boolean {
  const dsM = DataSourceManager.getInstance()
  return dsM.getDataSource(dataSourceId)?.getDataSourceJson()?.isOutputFromWidget ?? false
}

export function reportUtilityState (utilityId: string, toggleUtilityRemind, err?: any) {
  const isSignInError = UtilityManager.getInstance().utilityHasSignInError(utilityId)
  let isNoService = err?.details?.httpStatus === 404
  if (err?.details?.httpStatus === 400 && err?.details?.message?.includes('Item does not exist')) {
    isNoService = true
  }
  if (isSignInError || isNoService) {
    toggleUtilityRemind && toggleUtilityRemind(true)
    UtilityManager.getInstance().reportUtilityState(utilityId, false, isSignInError)
  } else {
    toggleUtilityRemind && toggleUtilityRemind(false)
    UtilityManager.getInstance().reportUtilityState(utilityId, true)
  }
}

export function checkIsTableDs (dataSourceId: string): boolean {
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const isTable = ds && (ds as FeatureLayerDataSource).supportSpatialInfo && !(ds as FeatureLayerDataSource).supportSpatialInfo()

  return isTable
}

async function handlePrintInfo (printInfo): Promise<PrintServiceTaskInfo> {
  // domStyle.set(this.showAdvancedOptionChk.domNode.parentNode.parentNode, 'display', '');
  let hasWebmapParam = false
  let hasOutputParam = false
  const info = printInfo?.parameters || []

  const webmapParam = 'web_map_as_json'
  const outputParam = 'output_file'
  const layoutItemId = 'layout_item_id'
  const layoutTemplate = 'layout_template'
  const reportTemplate = 'report_template'
  const reportItemId = 'report_item_id'

  let orgPrintTemplate = []
  let formatList = []
  let defaultFormat = 'pdf'
  let supportCustomLayout = false
  let supportCustomReport = false
  let supportReport = false
  let defaultLayoutTemplate = ''
  let defaultCustomLayoutItem = ''
  let defaultReportTemplate = ''
  let defaultCustomReportItem = ''

  info?.forEach(param => {
    if (param.name === 'Format') {
      const choiceList = param?.choiceList?.map(format => format?.toLowerCase()) || []
      if (param.defaultValue) {
        defaultFormat = param.defaultValue?.toLowerCase()
      } else if (choiceList?.length > 0) {
        const defaultFormatList = []
        choiceList?.forEach(formatItem => {
          if (formatItem.includes('pdf') || formatItem.includes('png')) {
            defaultFormatList.push(formatItem)
          }
        })
        defaultFormat = defaultFormatList?.[0] || choiceList[0]
      }
      formatList = choiceList
    }
  })

  info?.forEach(param => {
    if (param.name === 'Layout_Template') {
      const choiceList = param.choiceList
      const defaultValue = param.defaultValue
      if (choiceList) {
        orgPrintTemplate = choiceList?.map(layout => {
          return getDefaultPrintTemplateItem(layout, formatList, defaultFormat)
        })
      } else {
        orgPrintTemplate.push(getDefaultPrintTemplateItem(defaultValue, formatList, defaultFormat))
      }
    }

    if (param.name.toLowerCase() === layoutTemplate) {
      defaultLayoutTemplate = param?.defaultValue || ''
    }

    if (param.name.toLowerCase() === layoutItemId) {
      supportCustomLayout = true
      defaultCustomLayoutItem = param?.defaultValue
    }

    if (param.name.toLowerCase() === reportTemplate) {
      supportReport = true
      defaultReportTemplate = param?.defaultValue || ''
    }

    if (param.name.toLowerCase() === reportItemId) {
      supportCustomReport = true
      defaultCustomReportItem = param?.defaultValue
    }

    if (typeof param.name === 'string' && param.name.toLowerCase() === webmapParam) {
      hasWebmapParam = true
    }
    if (typeof param.name === 'string' && param.name.toLowerCase() === outputParam) {
      hasOutputParam = true
    }

    if (!hasWebmapParam || !hasOutputParam) {
      // this.validUrl = false
      // this.serviceURL.validate()
    }
  })

  return Promise.resolve({
    templates: orgPrintTemplate,
    formatList: formatList,
    defaultFormat: defaultFormat,
    defaultReportTemplate: defaultReportTemplate,
    defaultCustomReportItem: defaultCustomReportItem as any,
    hasWebmapParam: hasWebmapParam,
    hasOutputParam: hasOutputParam,
    supportCustomLayout: supportCustomLayout,
    supportReport: supportReport,
    supportCustomReport: supportCustomReport,
    defaultLayout: defaultLayoutTemplate,
    defaultCustomLayoutItem: defaultCustomLayoutItem as any
  })
}

function getDefaultPrintTemplateItem (layout: string, formatChoiceList: string[], defaultFormat: string) {
  const isMapOnly = checkIsMapOnly(layout)
  const otherOption = isMapOnly ? { } : { layoutOptions: { legend: false } }
  const format = defaultFormat || formatChoiceList[0] || 'PNG32'
  return {
    label: layout,
    layout: layout,
    format: format,
    ...otherOption
  }
}
