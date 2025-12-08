import { UtilityManager, ServiceManager, Immutable, SessionManager } from 'jimu-core'
import type { IMUseUtility, UseUtility } from 'jimu-core'
import { PrintServiceType, CIMMarkerNorthArrow, DEFAULT_TEMPLATE_INFO, PrintTemplateType, ItemInfoType, ReportTemplateTypes, ReportTypes, LayoutTypes, DEFAULT_COMMON_SETTING } from '../config'
import type { IMConfig, PrintTemplateProperties, ActiveItem } from '../config'
import { initTemplateLayout, getUrlOfUseUtility, getTemplateOrReportInfo, getKeyOfNorthArrow, getReportTemplateTypes, getNewConfigWidthNewTemplateItem, getPrintTaskInfo, initDefaultTemplates, mergeTemplateSetting, checkIsMapOnly } from './utils'

interface DefaultReportOptions {
  reportTypes?: ReportTypes
  customReportItem?: ActiveItem
  reportOptions?: any
  report?: string
}

interface DefaultLayoutOptions {
  layoutTypes?: LayoutTypes
  customLayoutItem?: ActiveItem
  templateInfo?: any
}

interface DefaultReportParams {
  defaultReportTemplate: string
  supportCustomReport: boolean
  defaultCustomReportItem: ActiveItem
  supportReport: boolean
}

interface DefaultLayoutParams {
  defaultCustomLayoutItem: ActiveItem
  defaultLayout: string
  supportCustomLayout: boolean
}

interface InitPrintTemplateListOption {
  templateTaskInfo: any
  templatesInTask: PrintTemplateProperties[]
  reportOption: DefaultReportOptions
  defaultLayoutOptionInfo: DefaultLayoutOptions
  printServiceType: PrintServiceType
  printTemplateType: PrintTemplateType
}

/**
 * Get service portal url by utility
*/
export const getPortalUrlByUtility = async (utility: IMUseUtility): Promise<string> => {
  return getUrlOfUseUtility(utility).then(url => {
    return ServiceManager.getInstance().fetchArcGISServerInfo(url).then(serverInfo => {
      return Promise.resolve(serverInfo?.owningSystemUrl)
    }, err => {
      return Promise.reject(new Error(err))
    })
  })
}

/**
 * Get service portal url by serviceUrl
*/
export const getPortalUrlByServiceUrl = async (serviceUrl: string): Promise<string> => {
  return ServiceManager.getInstance().fetchArcGISServerInfo(serviceUrl).then(serverInfo => {
    return Promise.resolve(serverInfo?.owningSystemUrl)
  }, err => {
    return Promise.reject(new Error(err))
  })
}

export const getSessionByUtility = async (utility: IMUseUtility): Promise<any> => {
  const portalUrl = await getPortalUrlByUtility(utility)
  return portalUrl ? SessionManager.getInstance().getSessionByUrl(portalUrl) : null
}

export const getNewTemplateInfo = async (utility: IMUseUtility, config: IMConfig) => {
  return getUrlOfUseUtility(utility).then(url => {
    return getPrintTemplate(url, utility, config)
  })
}

/**
 * When custom layout id change, we should get new layout template info, and update it in new config
*/
export const getNewConfigByCustomLayoutItem = async (config: IMConfig, activeItem: ActiveItem, index: number): Promise<IMConfig> => {
  const customItemId = activeItem?.id
  if (!customItemId) return Promise.reject(new Error('No custom layout item id'))
  return getCustomItemInfo(customItemId, config?.useUtility, ItemInfoType.LayoutTemplate).then(res => {
    const customLayoutInfo = res?.[0]

    const printTemplate = config?.printTemplateType === PrintTemplateType.Customize ? config.printCustomTemplate?.asMutable({ deep: true }) : config.printOrgTemplate?.asMutable({ deep: true })
    let layoutTemplateItem = printTemplate[index]

    layoutTemplateItem.customLayoutItem = activeItem
    layoutTemplateItem = initTemplateByTemplateInfo(customLayoutInfo, layoutTemplateItem)

    const newConfig = getNewConfigWidthNewTemplateItem(config, index, layoutTemplateItem)
    return Promise.resolve(newConfig)
  }, err => {
    return Promise.reject(new Error(err))
  }).catch(err => {
    return Promise.reject(new Error(err))
  })
}

/**
 * When custom report item change, we should get new report template info, and update it in new config
*/
export const getNewConfigByCustomReportItem = async (config: IMConfig, activeItem: ActiveItem, index: number): Promise<IMConfig> => {
  const customItemId = activeItem?.id
  if (!customItemId) return Promise.reject(new Error('No custom report item id'))
  return getCustomItemInfo(customItemId, config?.useUtility, ItemInfoType.ReportTemplate).then(res => {
    const customReportInfo = res?.[0]

    const printTemplate = config?.printTemplateType === PrintTemplateType.Customize ? config.printCustomTemplate?.asMutable({ deep: true }) : config.printOrgTemplate?.asMutable({ deep: true })
    const layoutTemplateItem = printTemplate[index]

    layoutTemplateItem.customReportItem = activeItem
    layoutTemplateItem.reportOptions = customReportInfo?.reportOptions || {}

    const newConfig = getNewConfigWidthNewTemplateItem(config, index, layoutTemplateItem)
    return Promise.resolve(newConfig)
  }, err => {
    return Promise.reject(new Error(err))
  }).catch(err => {
    return Promise.reject(new Error(err))
  })
}

/**
 * Get custom report/layout template info by custom item id
*/
export const getCustomItemInfo = async (customItemId: string, useUtility: UseUtility, customItemInfoType: ItemInfoType) => {
  return getUrlOfUseUtility(useUtility).then(url => {
    return getTemplateOrReportInfo(url, customItemInfoType, customItemId)
  })
}

/**
 * Init print template item when add new custom template
*/
export async function initNewTemplateItem (config: IMConfig, template: PrintTemplateProperties, newTemplateId: string, defaultLabel: string): Promise<PrintTemplateProperties> {
  let newTemplate = mergeTemplateSetting(Immutable(template), Immutable(DEFAULT_COMMON_SETTING as any))?.asMutable({ deep: true })
  newTemplate = await initLayoutTemplateOfNewTemplate(config, template)
  newTemplate = await initReportTemplateOfNewTemplate(config, newTemplate)
  const newLabel = getNewTemplateName(config, defaultLabel)
  newTemplate.format = config.defaultFormat
  newTemplate.selectedFormatList = [config.defaultFormat]
  newTemplate.templateId = newTemplateId
  newTemplate.label = newLabel
  newTemplate.overrideCommonSetting = false
  return Promise.resolve(newTemplate)
}

function getNewTemplateName (config: IMConfig, defaultLabel: string) {
  let index = 1
  let newLabel = defaultLabel
  const printTemplate = config?.printTemplateType === PrintTemplateType.Customize ? config.printCustomTemplate?.asMutable({ deep: true }) : config.printOrgTemplate?.asMutable({ deep: true })
  printTemplate?.forEach(item => {
    if (item.label === newLabel) {
      index += 1
      newLabel = `${defaultLabel} ${index}`
    }
  })
  return newLabel
}

async function initLayoutTemplateOfNewTemplate (config: IMConfig, temp: PrintTemplateProperties): Promise<PrintTemplateProperties> {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { layoutChoiceList, defaultCustomLayoutItem, defaultLayout, supportCustomLayout } = config?.asMutable({ deep: true })
  let layoutTypes = LayoutTypes.ServiceLayout
  if (!config.layoutChoiceList || config.layoutChoiceList?.length === 0) {
    layoutTypes = LayoutTypes.CustomLayout
  }
  let defaultLayoutOptionInfo = {
    layoutTypes: layoutTypes
  } as DefaultLayoutOptions

  if (supportCustomLayout && defaultCustomLayoutItem) {
    //Has default custom layout template
    const params = {
      defaultCustomLayoutItem: defaultCustomLayoutItem,
      defaultLayout: defaultLayout,
      supportCustomLayout: supportCustomLayout
    }
    defaultLayoutOptionInfo = await getDefaultLayoutOptions(params, config.useUtility)
    temp.customLayoutItem = defaultLayoutOptionInfo?.customLayoutItem || null
    const templateInfo = defaultLayoutOptionInfo?.templateInfo
    if (templateInfo) {
      temp.layoutOptions = templateInfo?.layoutOptions
      temp.mapFrameUnit = templateInfo?.pageUnits
      temp.mapFrameSize = templateInfo?.webMapFrameSize
    }
  } else {
    layoutChoiceList?.forEach((layoutTemplateItem, index) => {
      let isUseThisLayout = false
      if (defaultLayout) {
        if (defaultLayout === layoutTemplateItem?.layoutTemplate) {
          //Has default layout template
          isUseThisLayout = true
        }
      } else {
        if (index === 0) {
          isUseThisLayout = true
        }
      }

      const templateInfo = {} as any
      if (isUseThisLayout) {
        temp = {
          ...temp,
          ...layoutTemplateItem as any
        }
      }
      defaultLayoutOptionInfo.templateInfo = templateInfo
    })
  }

  temp.layoutTypes = defaultLayoutOptionInfo?.layoutTypes
  return Promise.resolve(temp)
}

async function initReportTemplateOfNewTemplate (config: IMConfig, temp: PrintTemplateProperties): Promise<PrintTemplateProperties> {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { reportTemplateChoiceList, defaultCustomReportItem, defaultReportTemplate, supportReport, supportCustomReport } = config?.asMutable({ deep: true })
  const params = {
    defaultReportTemplate: defaultReportTemplate,
    supportCustomReport: supportCustomReport,
    defaultCustomReportItem: defaultCustomReportItem,
    supportReport: supportReport
  }
  const defaultReportOption = await getDefaultReportOptions(reportTemplateChoiceList, params, config.useUtility)
  if (defaultReportOption) {
    temp.reportTypes = defaultReportOption?.reportTypes
    temp.customReportItem = defaultReportOption?.customReportItem || null
    temp.report = defaultReportOption?.report as any || null
    temp.reportOptions = defaultReportOption?.reportOptions || null
  }
  return Promise.resolve(temp)
}

function initTemplateByTemplateInfo (tempTaskInfo, temp: PrintTemplateProperties): PrintTemplateProperties {
  if (!tempTaskInfo || !temp) {
    return temp
  }

  tempTaskInfo?.webMapFrameSize && (temp.mapFrameSize = tempTaskInfo?.webMapFrameSize)
  tempTaskInfo?.pageUnits && (temp.mapFrameUnit = tempTaskInfo?.pageUnits)

  const newLayoutOptions = tempTaskInfo?.layoutOptions
  const layoutOptions = Immutable(newLayoutOptions).without('hasAuthorText', 'hasCopyrightText', 'hasLegend', 'hasTitleText')
  temp.layoutOptions = layoutOptions?.asMutable({ deep: true })
  temp = initTemplateByLayoutOptionsInfo(temp, newLayoutOptions)

  if (newLayoutOptions) {
    temp.layout = '' as any
  }
  return temp
}

const getPrintTemplate = async (serviceUrl: string, utility: IMUseUtility, config: IMConfig) => {
  const printServiceType = getPrintServiceType(utility?.utilityId)
  return getPrintTaskInfo(serviceUrl).then(printTask => {
    let newConfig = config

    return getTemplateOrReportInfo(serviceUrl, ItemInfoType.LayoutTemplate).then(async templateTaskInfo => {
      let defaultReportOption: DefaultReportOptions
      if (printTask.supportCustomReport || printTask.supportReport) {
        //Init report template
        const reportTemplateChoiceList = await getTemplateOrReportInfo(serviceUrl, ItemInfoType.ReportTemplate) || []
        const newReportTemplateChoiceList = initReportTemplateChoiceList(reportTemplateChoiceList)
        newConfig = newConfig.set('reportTemplateChoiceList', newReportTemplateChoiceList).set('defaultReportTemplate', printTask?.defaultReportTemplate).set('defaultCustomReportItem', printTask?.defaultCustomReportItem)
        defaultReportOption = await getDefaultReportOptions(reportTemplateChoiceList, printTask, utility)
      }

      //Init print template list
      const defaultLayoutOptionInfo = await getDefaultLayoutOptions(printTask, utility)
      const options = {
        templateTaskInfo: templateTaskInfo,
        templatesInTask: printTask?.templates,
        reportOption: defaultReportOption,
        defaultLayoutOptionInfo: defaultLayoutOptionInfo,
        printTemplateType: config?.printTemplateType,
        printServiceType: printServiceType
      }
      const template = initPrintTemplateList(options)

      //Get layout choice list
      const layoutChoiceList = getLayoutChoiceList(printTask?.templates, template)

      newConfig = newConfig.set('printCustomTemplate', template)
        .set('useUtility', utility)
        .set('formatList', printTask?.formatList)
        .set('defaultFormat', printTask?.defaultFormat)
        .set('layoutChoiceList', layoutChoiceList)
        .set('supportCustomLayout', printTask.supportCustomLayout || false)
        .set('supportReport', printTask.supportReport || false)
        .set('supportCustomReport', printTask.supportCustomReport || false)
        .setIn(['commonSetting', 'forceFeatureAttributes'], printTask.supportReport || printTask.supportCustomReport || false)
      return Promise.resolve(newConfig)
    })
  })
}

//Get default layout template info
export const getDefaultLayoutOptions = async (params: DefaultLayoutParams, useUtility: UseUtility): Promise<DefaultLayoutOptions> => {
  const reportOption = {
    layoutTypes: LayoutTypes.ServiceLayout
  } as DefaultLayoutOptions

  //Has default custom layout item
  if (params?.supportCustomLayout && params?.defaultCustomLayoutItem) {
    const customLayoutTemplateInfoRes = await getCustomItemInfo(params?.defaultCustomLayoutItem?.id, useUtility, ItemInfoType.ReportTemplate)
    const customLayoutTemplateInfo = customLayoutTemplateInfoRes?.[0]
    reportOption.customLayoutItem = params?.defaultCustomLayoutItem
    reportOption.templateInfo = customLayoutTemplateInfo
  }
  return Promise.resolve(reportOption)
}

//Get default report template info
export const getDefaultReportOptions = async (reportTemplateChoiceList: any[], params: DefaultReportParams, useUtility: UseUtility): Promise<DefaultReportOptions> => {
  if (!params?.supportCustomReport || !params?.supportReport) return null
  const reportOption = {
    reportTypes: ReportTypes.ServiceReport
  } as DefaultReportOptions
  //Has default report template
  if (params?.supportReport && params?.defaultReportTemplate) {
    let reportOptions
    reportTemplateChoiceList?.forEach(item => {
      if (item?.reportTemplate === params?.defaultReportTemplate) {
        reportOptions = item?.reportOptions
      }
    })
    reportOption.report = params?.defaultReportTemplate
    reportOption.reportOptions = reportOptions
  }

  //Has default custom report item
  if (params?.supportCustomReport && params?.defaultCustomReportItem) {
    const defaultCustomReportInfoRes = await getCustomItemInfo(params?.defaultCustomReportItem?.id, useUtility, ItemInfoType.ReportTemplate)
    const reportOptions = defaultCustomReportInfoRes?.[0]?.reportOptions
    reportOption.customReportItem = {
      id: params?.defaultCustomReportItem?.id,
      title: defaultCustomReportInfoRes?.[0]?.reportTemplate || params?.defaultCustomReportItem?.id
    }
    reportOption.reportOptions = reportOptions
    reportOption.reportTypes = ReportTypes.CustomReport
  }
  return Promise.resolve(reportOption)
}

export const initReportTemplateChoiceList = (reportTemplateChoiceList: any[]): any[] => {
  if (!reportTemplateChoiceList) return []
  const newReportTemplateChoiceList = reportTemplateChoiceList.filter(item => {
    const types = getReportTemplateTypes(item?.reportOptions)
    return types === ReportTemplateTypes.RPTX
  })
  return newReportTemplateChoiceList
}

const initTemplateByLayoutOptionsInfo = (temp, layoutOptions) => {
  if (!layoutOptions) return temp
  const customTextElementEnableList = layoutOptions?.customTextElements?.map(item => {
    const customTextElementsEnable = {}
    for (const key in item) {
      customTextElementsEnable[key] = true
    }
    return customTextElementsEnable
  })

  const elementOverrides = getElementOverrides(layoutOptions)

  temp.hasAuthorText = layoutOptions?.hasAuthorText
  temp.hasCopyrightText = layoutOptions?.hasCopyrightText
  temp.hasLegend = layoutOptions?.hasLegend
  temp.hasTitleText = layoutOptions?.hasTitleText
  temp.layoutOptions.customTextElements = layoutOptions?.customTextElements || []
  temp.layoutOptions.elementOverrides = elementOverrides

  temp.customTextElementEnableList = customTextElementEnableList || []
  temp.enableNorthArrow = !!getKeyOfNorthArrow(elementOverrides)
  temp.enableLegend = temp.hasLegend
  temp.enableAuthor = temp.hasAuthorText
  temp.enableCopyright = temp.hasCopyrightText
  temp.enableScalebarUnit = true

  if (temp.hasLegend && temp?.layoutOptions) {
    temp.layoutOptions.legendLayers = []
  }

  if (!temp.layoutOptions?.scalebarUnit) {
    temp.layoutOptions.scalebarUnit = 'Miles'
  }
  return temp
}

const initPrintTemplateList = (option: InitPrintTemplateListOption) => {
  const { templateTaskInfo, templatesInTask, reportOption, defaultLayoutOptionInfo, printServiceType, printTemplateType } = option

  const templates = templatesInTask ? initDefaultTemplates(templatesInTask, printServiceType, printTemplateType) : []

  const newTemplates = templates?.map(temp => {
    let info
    if (!templateTaskInfo || templateTaskInfo?.length === 0) {
      info = DEFAULT_TEMPLATE_INFO
    } else {
      templateTaskInfo.forEach(item => {
        if (temp.label === item.layoutTemplate) {
          info = item
        }
      })
    }

    //init layout name and format
    temp?.layout && (temp.layout = initTemplateLayout(temp?.layout) as any)
    temp?.format && (temp.format = temp?.format?.toLowerCase() as any)

    if (info?.webMapFrameSize) {
      temp.mapFrameSize = info?.webMapFrameSize
      temp.mapFrameUnit = info?.pageUnits
    }

    temp = initTemplateByLayoutOptionsInfo(temp, info?.layoutOptions)

    temp.mapFrameUnit = info?.pageUnits
    temp.selectedFormatList = [temp?.format]

    if (typeof temp.showLabels !== 'boolean') {
      temp.showLabels = true
    }

    if (reportOption) {
      //Use default report template, if there has default report value
      reportOption?.customReportItem && (temp.customReportItem = reportOption?.customReportItem)
      reportOption?.report && (temp.report = reportOption?.report as any)
      reportOption?.reportOptions && (temp.reportOptions = reportOption?.reportOptions)
      reportOption?.reportTypes && (temp.reportTypes = reportOption?.reportTypes)
    }

    if (defaultLayoutOptionInfo) {
      //Use default custom layout template, if there has defaultCustomLayoutItem
      defaultLayoutOptionInfo?.layoutTypes && (temp.layoutTypes = defaultLayoutOptionInfo?.layoutTypes)
      defaultLayoutOptionInfo?.customLayoutItem && (temp.customLayoutItem = defaultLayoutOptionInfo?.customLayoutItem)
      const templateInfo = defaultLayoutOptionInfo?.templateInfo
      if (templateInfo) {
        templateInfo?.layoutOptions && (temp.layoutOptions = templateInfo?.layoutOptions)
        templateInfo?.pageUnits && (temp.mapFrameUnit = templateInfo?.pageUnits)
        templateInfo?.webMapFrameSize && (temp.mapFrameSize = templateInfo?.webMapFrameSize)
      }
    }

    return temp
  })

  return newTemplates
}

const getElementOverrides = (layoutOptions) => {
  const mapSurroundInfos = layoutOptions?.mapSurroundInfos || []
  const elementOverrides = {}
  mapSurroundInfos?.forEach(item => {
    if (item.type === CIMMarkerNorthArrow) {
      item.visible = true
    }
    elementOverrides[item.name] = item
  })
  return elementOverrides
}

const getLayoutChoiceList = (templates, printCustomTemplate) => {
  const layoutChoiceList = templates?.map(info => {
    info.layoutTemplate = initTemplateLayout(info?.layout)
    const isMapOnly = checkIsMapOnly(info?.layout)
    printCustomTemplate?.forEach(temp => {
      if (info?.layout === temp?.layout) {
        info.mapFrameSize = temp?.mapFrameSize
        info.mapFrameUnit = temp?.mapFrameUnit
        info.hasAuthorText = temp?.hasAuthorText
        info.hasCopyrightText = temp?.hasCopyrightText
        info.hasLegend = temp?.hasLegend
        info.hasTitleText = temp?.hasTitleText
        !isMapOnly && (info.layoutOptions = temp?.layoutOptions)

        info.customTextElementEnableList = temp?.customTextElementEnableList
        info.enableNorthArrow = temp.enableNorthArrow
        info.enableLegend = temp.hasLegend
        info.enableAuthor = temp.hasAuthorText
        info.enableCopyright = temp.hasCopyrightText
        info.enableScalebarUnit = true
        info.enableNorthArrow = temp?.enableNorthArrow
      }
    })
    return info
  }) || []
  return layoutChoiceList
}

const getPrintServiceType = (utilityId: string): PrintServiceType => {
  const utilityJson = UtilityManager.getInstance().getUtilityJson(utilityId)
  const printServiceType = utilityJson?.source === 'org' ? PrintServiceType.OrganizationService : PrintServiceType.Customize
  return printServiceType
}
