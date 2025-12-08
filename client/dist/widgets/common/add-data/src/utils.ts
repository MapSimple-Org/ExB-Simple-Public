import { ItemCategory } from 'jimu-ui/basic/item-selector'
import type { IMConfig, ItemCategoryInfo } from './config'
import { Immutable, type ImmutableArray, React, type hooks, utils as JimuCoreUtils } from 'jimu-core'

export const getDefaultItemCategoriesInfo = () => {
  return [
    {
      type: ItemCategory.MyContent,
      customLabel: '',
      enabled: true,
      id: ItemCategory.MyContent
    },
    {
      type: ItemCategory.MyGroup,
      customLabel: '',
      enabled: true,
      id: ItemCategory.MyGroup
    },
    {
      type: ItemCategory.MyOrganization,
      customLabel: '',
      enabled: true,
      id: ItemCategory.MyOrganization
    },
    {
      type: ItemCategory.Public,
      customLabel: '',
      enabled: true,
      id: ItemCategory.Public
    },
    {
      type: ItemCategory.LivingAtlas,
      customLabel: '',
      enabled: true,
      id: ItemCategory.LivingAtlas
    }
  ] as ItemCategoryInfo[]
}

export const useItemCategoriesInfo = (config: IMConfig) => {
  return React.useMemo(() => {
    return !config.disableAddBySearch && !config.itemCategoriesInfo ? Immutable(getDefaultItemCategoriesInfo()) : config.itemCategoriesInfo
  }, [config.disableAddBySearch, config.itemCategoriesInfo])
}

export const useNeedHideItemCategories = () => {
  const [needHideTypes, setNeedHideTypes] = React.useState<ItemCategory[]>([])
  React.useEffect(() => {
    const restrictEnterpriseOnly = JimuCoreUtils.readLocalStorage('restrictEnterpriseOnly')
    if (restrictEnterpriseOnly === 'true') {
      setNeedHideTypes([ItemCategory.Public, ItemCategory.LivingAtlas])
    }
  }, [])
  return needHideTypes
}

export const useCuratedIndex = (itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>) => {
  return React.useMemo(() => {
    if (!itemCategoriesInfo) {
      return 1
    }
    const curatedIds = itemCategoriesInfo
      .filter((item) => item.type === ItemCategory.Curated)
      .map((item) => item.id)
    if (!curatedIds.length) {
      return 1
    }
    const currentId = Math.max(...curatedIds.map((id) => Number(id.split('_')[1])))
    return currentId + 1
  }, [itemCategoriesInfo])
}

export const getItemCategoryI18nKey = (itemCategory: ItemCategory) => {
  switch (itemCategory) {
    case ItemCategory.MyContent:
      return 'myContent'
    case ItemCategory.MyGroup:
      return 'myGroup'
    case ItemCategory.MyOrganization:
      return 'myOrganization'
    case ItemCategory.Public:
      return 'public'
    case ItemCategory.LivingAtlas:
      return 'livingAtlas'
    case ItemCategory.Curated:
      return 'curated'
  }
}

export const getDefaultLabelForCuratedItem = (itemCategoryInfo: ItemCategoryInfo, defaultLabel: string) => {
  if (itemCategoryInfo.type !== ItemCategory.Curated) {
    return defaultLabel
  }
  const index = Number(itemCategoryInfo.id.split('_')?.pop())
  if (!index || index < 2) {
    return defaultLabel
  }
  return `${defaultLabel} ${index}`
}

// Get default label for curated item category, if type is curated, add index as suffix.
export const getDefaultLabel = (translate: ReturnType<typeof hooks.useTranslation>, itemCategoryInfo: ItemCategoryInfo) => {
  const defaultLabel = translate(getItemCategoryI18nKey(itemCategoryInfo.type))
  return getDefaultLabelForCuratedItem(itemCategoryInfo, defaultLabel)
}
