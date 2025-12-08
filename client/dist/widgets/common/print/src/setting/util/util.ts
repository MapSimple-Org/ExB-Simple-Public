import { Immutable, DataSourceManager, type IMDataSourceJson, type FeatureLayerDataSource, getAppStore, SupportedUtilityType, UtilityManager, type DataSource, type UseDataSource, type ImmutableArray } from 'jimu-core'
import { type PrintTemplateProperties, type PrintServiceType, type PrintTemplateType, DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT, LayoutTypes, type LayoutInfo, type IMConfig } from '../../config'
import { getAppConfigAction } from 'jimu-for-builder'
import { getTemplateType, checkIsMapOnly } from '../../utils/utils'
import { extractService, addNewUtility } from 'jimu-ui/advanced/utility-selector'

/**
 * Get new template id
*/
export const getNewTemplateId = (printTemplate: PrintTemplateProperties[], printServiceType: PrintServiceType, printTemplateType: PrintTemplateType): string => {
  const templateIdList = printTemplate.map(template => template.templateId)
  const configType = getTemplateType(printServiceType, printTemplateType)
  if (!templateIdList || templateIdList?.length === 0) return `config_${configType}_0`
  const maxIndex = getTemplateIndexMaxNumber(templateIdList)
  return `config_${configType}_${maxIndex + 1}`
}

const getTemplateIndexMaxNumber = (configIdList: string[]) => {
  const idIndexData = configIdList?.map(id => {
    const currentIndex = id?.split('_')?.pop()
    return currentIndex ? Number(currentIndex) : 0
  })
  return idIndexData?.sort((a, b) => b - a)?.[0]
}

export function checkIsOutlineSizeAvailable (value: string): boolean {
  const size = value?.split('px')[0]
  if (!value || !size) return false
  return Number(size) >= 0
}

export const getNewLayoutTemplateByLayoutName = (preTemplate: PrintTemplateProperties, layoutTemplate: string, layoutChoiceList: LayoutInfo[]): PrintTemplateProperties => {
  const layout = layoutChoiceList?.filter(item => item?.layout === layoutTemplate)?.[0]

  let newTemplate = {
    ...preTemplate,
    ...layout,
    layoutTypes: LayoutTypes.ServiceLayout
  } as PrintTemplateProperties

  const isMapOnly = checkIsMapOnly(layout?.layout)
  if (isMapOnly) {
    newTemplate = Immutable(newTemplate).setIn(['exportOptions', 'width'], DEFAULT_MAP_WIDTH).setIn(['exportOptions', 'height'], DEFAULT_MAP_HEIGHT)?.asMutable({ deep: true })
  }

  return newTemplate
}

export function initTemplateChoiceList (templateChoiceList: any[], isAddNoneItem: boolean): any[] {
  if (isAddNoneItem) {
    const noneItemOption = {
      reportTemplate: 'None'
    }
    templateChoiceList.unshift(noneItemOption)
  }
  return templateChoiceList
}

export function getWhetherIsTable (dsJson: IMDataSourceJson): boolean {
  if (!dsJson) {
    return false
  }
  const ds = DataSourceManager.getInstance().getDataSource(dsJson.id)
  const isTable = ds && (ds as FeatureLayerDataSource).supportSpatialInfo && !(ds as FeatureLayerDataSource).supportSpatialInfo()

  return isTable
}

export function getAllGeocodeUtility (nls) {
  const helperServices = getAppStore().getState().portalSelf?.helperServices
  return extractService(helperServices, SupportedUtilityType.Printing, null, null, nls)
}

export function getDefaultUtility (nls) {
  const allUtilities = getAllGeocodeUtility(nls) || []
  const utility = allUtilities[0]
  if (!utility) return null
  let uid = UtilityManager.getInstance().getIdOfOrgUtility(utility.name, utility.url, utility.index, utility.label)
  if (!uid) {
    uid = addNewUtility(utility)
  }
  return {
    utilityId: uid
  }
}

export const shouldHideDataSource = (dsJson: IMDataSourceJson): boolean => {
  const dsManager = DataSourceManager.getInstance()
  let isLayerInMapService = false
  const checkIsMapService = (ds: DataSource) => {
    if (!isLayerInMapService) {
      if (ds?.parentDataSource?.type === 'MAP_SERVICE') {
        isLayerInMapService = true
      } else if (ds?.parentDataSource?.parentDataSource) {
        checkIsMapService(ds?.parentDataSource?.parentDataSource)
      }
    }
  }
  const dataSource = dsManager.getDataSource(dsJson.id)
  checkIsMapService(dataSource)
  return isLayerInMapService
}

export const checkWhetherDsInUseDataSources = (ds: UseDataSource, useDataSources: ImmutableArray<UseDataSource>): boolean => {
  if (!ds || !useDataSources) return false
  return useDataSources?.some(u => u.dataSourceId === ds.dataSourceId)
}

export const handleDsChange = (id: string, newConfig: IMConfig) => {
  const updateWidgetJson = { id: id } as any
  const appConfigAction = getAppConfigAction()
  const newUseDataSources = getAllDsAndOutputDsFromWidgetConfig(newConfig, id)
  updateWidgetJson.config = newConfig
  updateWidgetJson.useDataSources = newUseDataSources
  appConfigAction.editWidget(updateWidgetJson).exec()
}

function getAllDsAndOutputDsFromWidgetConfig (config: IMConfig, id: string) {
  const newUseDataSources = []
  const templates = config.printCustomTemplate
  templates.forEach(temp => {
    const reportOptions = temp?.reportOptions || {}
    for (const key in reportOptions) {
      const reportSectionOverrides = reportOptions[key]?.reportSectionOverrides
      for (const optionKey in reportSectionOverrides) {
        const exbDataSource = reportOptions[optionKey]?.exbDatasource
        if (exbDataSource?.[0] && !checkWhetherDsInUseDataSources(exbDataSource[0], newUseDataSources as any)) {
          newUseDataSources.push(exbDataSource[0])
        }
      }
    }

    const elementOverrides = temp?.layoutOptions?.elementOverrides || {}
    for (const key in elementOverrides) {
      const elementOverridesOptionDS = elementOverrides[key]?.exbDataSource
      if (elementOverridesOptionDS?.[0] && !checkWhetherDsInUseDataSources(elementOverridesOptionDS[0], newUseDataSources as any)) {
        newUseDataSources.push(elementOverridesOptionDS[0])
      }
    }
  })
  return newUseDataSources
}
