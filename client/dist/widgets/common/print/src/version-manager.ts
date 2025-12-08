import { BaseVersionManager, Immutable } from 'jimu-core'
import { getNewTemplateInfo, getDefaultLayoutOptions, getDefaultReportOptions, initReportTemplateChoiceList } from './utils/service-util'
import { type IMConfig, type PrintTemplateProperties, type LayoutInfo, DEFAULT_MAP_HEIGHT, DEFAULT_MAP_WIDTH, PREVIEW_BACKGROUND, DEFAULT_OUTLINE, ItemInfoType, PrintTemplateType, ReportTypes, LayoutTypes } from './config'
import { checkIsMapOnly, getUrlOfUseUtility, getPrintTaskInfo, getTemplateOrReportInfo } from './utils/utils'

function initLayoutChoiceList (templates: PrintTemplateProperties[], layoutChoiceList: LayoutInfo[]): LayoutInfo[] {
  return layoutChoiceList.map(layout => {
    // eslint-disable-next-line @typescript-eslint/prefer-find
    const temp = templates?.filter(t => t.layout === layout.layout)[0] || {}
    layout.customTextElementEnableList = temp.customTextElementEnableList || []
    layout.enableNorthArrow = temp.enableNorthArrow
    layout.enableLegend = temp.hasLegend
    layout.enableAuthor = temp.hasAuthorText
    layout.enableCopyright = temp.hasCopyrightText
    layout.enableScalebarUnit = true
    return layout
  })
}

const checkAndUpdatePrintTemplate = async (config: IMConfig): Promise<IMConfig> => {
  let newConfig = config
  return getUrlOfUseUtility(newConfig.useUtility).then(serviceUrl => {
    return getPrintTaskInfo(serviceUrl).then(async printTask => {
      const { supportCustomLayout, defaultCustomLayoutItem, supportCustomReport, supportReport } = printTask

      let defaultLayoutOptions = {
        layoutTypes: LayoutTypes.ServiceLayout
      } as any

      let defaultReportOptions = {
        reportTypes: ReportTypes.ServiceReport
      } as any

      if (supportCustomLayout && defaultCustomLayoutItem) {
        defaultLayoutOptions = await getDefaultLayoutOptions(printTask, newConfig.useUtility)
      }

      if (supportReport || supportCustomReport) {
        const reportTemplateChoiceList = await getTemplateOrReportInfo(serviceUrl, ItemInfoType.ReportTemplate) || []
        const newReportTemplateChoiceList = initReportTemplateChoiceList(reportTemplateChoiceList)
        newConfig = newConfig.set('reportTemplateChoiceList', newReportTemplateChoiceList).set('defaultReportTemplate', printTask?.defaultReportTemplate).set('defaultCustomReportItem', printTask?.defaultCustomReportItem)
        defaultReportOptions = await getDefaultReportOptions(reportTemplateChoiceList, printTask, newConfig.useUtility)
      }

      const printTemplateList = newConfig?.printTemplateType === PrintTemplateType.Customize ? newConfig.printCustomTemplate?.asMutable({ deep: true }) : newConfig.printOrgTemplate?.asMutable({ deep: true })
      const newPrintTemplateList = printTemplateList.map(temp => {
        if (supportReport || supportCustomReport) {
          //Use default report template, if there has default report value
          temp.reportTypes = defaultLayoutOptions.reportTypes
          defaultReportOptions?.customReportItem && (temp.customReportItem = defaultReportOptions.customReportItem)
          defaultReportOptions?.report && (temp.report = defaultReportOptions.report)
          defaultReportOptions?.reportOptions && (temp.reportOptions = defaultReportOptions.reportOptions)
        }

        temp.layoutTypes = defaultLayoutOptions.layoutTypes
        if (supportCustomLayout && defaultCustomLayoutItem) {
          //Use default custom layout template, if there has defaultCustomLayoutItem
          defaultLayoutOptions?.customLayoutItem && (temp.customLayoutItem = defaultLayoutOptions.customLayoutItem)
          const templateInfo = defaultLayoutOptions?.templateInfo
          if (templateInfo) {
            templateInfo?.layoutOptions && (temp.layoutOptions = templateInfo.layoutOptions)
            templateInfo?.pageUnits && (temp.mapFrameUnit = templateInfo.pageUnits)
            templateInfo?.webMapFrameSize && (temp.mapFrameSize = templateInfo.webMapFrameSize)
          }
        }
        return temp
      })

      newConfig = config?.printTemplateType === PrintTemplateType.Customize ? newConfig.set('printCustomTemplate', newPrintTemplateList) : newConfig.set('printOrgTemplate', newPrintTemplateList)
      return Promise.resolve(newConfig)
    }, err => {
      return Promise.resolve(newConfig)
    })
  })
}

class VersionManager extends BaseVersionManager {
  versions = [
    {
      version: '1.10.0',
      description: 'update layoutChoiceList of old print widget',
      upgrader: async (oldConfig: IMConfig) => {
        const useUtility = oldConfig?.useUtility

        const updateDpiAndMapSize = (template) => {
          let temp = Immutable(template)
          if (template?.exportOptions?.dpi) {
            const dpi = Number(template?.exportOptions?.dpi)
            if (dpi < 0) {
              temp = temp.setIn(['exportOptions', 'dpi'], 1)
            } else if (parseInt(dpi as any) !== dpi) {
              temp = temp.setIn(['exportOptions', 'dpi'], parseInt(dpi as any))
            }
          }

          if (template?.exportOptions?.width) {
            const width = Number(template?.exportOptions?.width)
            if (width < 1) {
              temp = temp.setIn(['exportOptions', 'width'], DEFAULT_MAP_WIDTH)
            }
          } else if (template?.layout && checkIsMapOnly(template?.layout)) {
            temp = temp.setIn(['exportOptions', 'width'], DEFAULT_MAP_WIDTH)
          }

          if (template?.exportOptions?.height) {
            const height = Number(template?.exportOptions?.height)
            if (height < 1) {
              temp = temp.setIn(['exportOptions', 'height'], DEFAULT_MAP_HEIGHT)
            }
          } else if (template?.layout && checkIsMapOnly(template?.layout)) {
            temp = temp.setIn(['exportOptions', 'height'], DEFAULT_MAP_HEIGHT)
          }

          return temp?.asMutable({ deep: true })
        }

        const updateCommonSetting = (oldConfig) => {
          if (oldConfig?.commonSetting?.exportOptions?.dpi) {
            return oldConfig.setIn(['commonSetting'], updateDpiAndMapSize(oldConfig.commonSetting))
          } else {
            return oldConfig
          }
        }

        oldConfig = updateCommonSetting(oldConfig)

        //update printCustomTemplate in config
        const updatePrintCustomTemplate = (oldConfig, newLayoutChoiceList) => {
          const printCustomTemplate = oldConfig?.printCustomTemplate?.asMutable({ deep: true }) || []
          if (printCustomTemplate) {
            return printCustomTemplate?.map(temp => {
              if (!temp?.mapFrameSize) {
                const currentLayout = newLayoutChoiceList?.filter(item => item?.layout === temp?.layout)?.[0]
                const newLayoutInfo = {
                  mapFrameSize: currentLayout?.mapFrameSize,
                  mapFrameUnit: currentLayout?.mapFrameUnit,
                  hasAuthorText: currentLayout?.hasAuthorText,
                  hasCopyrightText: currentLayout?.hasCopyrightText,
                  hasLegend: currentLayout?.hasLegend,
                  hasTitleText: currentLayout?.hasTitleText
                }
                return {
                  ...updateDpiAndMapSize(temp),
                  ...newLayoutInfo
                }
              } else {
                return updateDpiAndMapSize(temp)
              }
            })
          } else {
            return printCustomTemplate
          }
        }

        if (useUtility) {
          const newConfig = await getNewTemplateInfo(useUtility, oldConfig)
          if (newConfig?.layoutChoiceList) {
            const printCustomTemplate = updatePrintCustomTemplate(oldConfig, newConfig?.layoutChoiceList)
            return oldConfig.setIn(['layoutChoiceList'], newConfig?.layoutChoiceList).set('printCustomTemplate', printCustomTemplate)
          } else {
            return oldConfig
          }
        } else {
          return oldConfig
        }
      }
    },
    {
      version: '1.13.0',
      description: 'Add default print preview style for old print widget',
      upgrader: (oldConfig: IMConfig) => {
        let newConfig = oldConfig
        if (typeof oldConfig?.enablePreview !== 'boolean') {
          newConfig = newConfig.set('enablePreview', true)
            .set('previewBackgroundColor', PREVIEW_BACKGROUND)
            .set('previewOutLine', DEFAULT_OUTLINE)
        }
        return newConfig
      }
    },
    {
      version: '1.14.0',
      description: 'Add default layout template or report template for old print widget',
      upgrader: async (oldConfig: IMConfig) => {
        let newConfig = oldConfig
        if (newConfig.useUtility) {
          newConfig = await checkAndUpdatePrintTemplate(newConfig) || newConfig

          const printTemplateList = newConfig?.printTemplateType === PrintTemplateType.Customize ? newConfig.printCustomTemplate?.asMutable({ deep: true }) : newConfig.printOrgTemplate?.asMutable({ deep: true })
          if (printTemplateList && newConfig.layoutChoiceList) {
            const newLayoutChoiceList = initLayoutChoiceList(printTemplateList, newConfig.layoutChoiceList?.asMutable({ deep: true }))
            newConfig = newConfig.set('layoutChoiceList', newLayoutChoiceList)
          }
        }
        return newConfig
      }
    }
  ]
}

export const versionManager: BaseVersionManager = new VersionManager()
