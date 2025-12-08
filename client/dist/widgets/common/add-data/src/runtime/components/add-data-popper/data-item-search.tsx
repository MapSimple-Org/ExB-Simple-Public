/** @jsx jsx */
import { React, jsx, css, SupportedItemTypes as JimuSupportedItemTypes, Immutable, type DataSourceJson, dataSourceUtils, ReactRedux, type IMState, DataSourceStatus, ServiceManager, type ImmutableArray, hooks, type ServiceDefinition } from 'jimu-core'
import { type IItemWithPortalUrl, ItemSelector, ItemSelectorMode, type ItemTypeCategory } from 'jimu-ui/basic/item-selector'

import type { ItemCategoryInfo } from '../../../config'
import type { DataOptions } from '../../types'
import { getLayerInfoFromSingleLayerFeatureService, getNextAddedDataId } from '../../utils'
import { getDefaultLabel, useNeedHideItemCategories } from '../../../utils'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'

const dataSourceJsonCreator = dataSourceUtils.dataSourceJsonCreator

export interface DataItemSearchProps {
  className?: string
  widgetId: string
  portalUrl: string
  multiDataOptions: DataOptions[]
  nextOrder: number
  itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>
  displayedItemTypeCategories?: ImmutableArray<ItemTypeCategory>
  onChange: (multiDataOptions: DataOptions[]) => void
}

const { useMemo, useState } = React
const { useSelector } = ReactRedux
const SupportedItemTypes = Immutable([JimuSupportedItemTypes.FeatureService, JimuSupportedItemTypes.MapService, JimuSupportedItemTypes.SceneService, JimuSupportedItemTypes.FeatureCollection, JimuSupportedItemTypes.ImageService, JimuSupportedItemTypes.VectorTileService, JimuSupportedItemTypes.CSV, JimuSupportedItemTypes.GeoJSON, JimuSupportedItemTypes.KML, JimuSupportedItemTypes.WFS, JimuSupportedItemTypes.WMS, JimuSupportedItemTypes.WMTS, JimuSupportedItemTypes.GroupLayer])

export const DataItemSearch = (props: DataItemSearchProps) => {
  const { className = '', widgetId, multiDataOptions, portalUrl, nextOrder, onChange, itemCategoriesInfo, displayedItemTypeCategories } = props
  const dataSourcesInfo = useSelector((state: IMState) => state.dataSourcesInfo)
  const [gettingDataSourceJsonItems, setGettingDataSourceJsonItems] = useState<string[]>([])
  // Loading items are 1. items which are selected and wait for getting data source json of them, and, 2. items which have data source json and wait for creating data source instances for them.
  const loadingItems = useMemo(() => {
    return Immutable(multiDataOptions.filter(d => {
      const dsStatus = dataSourcesInfo?.[d.dataSourceJson.id]?.instanceStatus
      return d.dataSourceJson.itemId && (!dsStatus || dsStatus === DataSourceStatus.NotCreated)
    }).map(d => d.dataSourceJson.itemId).concat(gettingDataSourceJsonItems))
  }, [multiDataOptions, dataSourcesInfo, gettingDataSourceJsonItems])

  const selectedItems = useMemo(() => Immutable(multiDataOptions.map(l => l.dataSourceJson.itemId).filter(itemId => !loadingItems.some(loadingItemId => loadingItemId === itemId))), [multiDataOptions, loadingItems])

  const onSelect = async (allSelectedItems: IItemWithPortalUrl[], latestSelectedItem: IItemWithPortalUrl) => {
    if (multiDataOptions.some((item) => item.dataSourceJson?.itemId === latestSelectedItem.id)) {
      return
    }
    setGettingDataSourceJsonItems(gettingDataSourceJsonItems.concat(latestSelectedItem?.id))
    const dataSourceJson = await getDsJsonFromItem(getNextAddedDataId(widgetId, nextOrder), latestSelectedItem)
    setGettingDataSourceJsonItems(gettingDataSourceJsonItems.filter(itemId => itemId !== latestSelectedItem?.id))
    onChange(multiDataOptions.concat({ dataSourceJson, order: nextOrder }).filter(o => !!o.dataSourceJson))
  }

  const onRemove = (allSelectedItems: IItemWithPortalUrl[], latestRemovedItem: IItemWithPortalUrl) => {
    onChange(multiDataOptions.filter(d => d.dataSourceJson.itemId !== latestRemovedItem.id))
  }

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const needHideItemCategories = useNeedHideItemCategories()

  const shouldBeDisplayedItemCategoriesInfo = useMemo(() => {
    return itemCategoriesInfo ? itemCategoriesInfo.filter((item) => item.enabled && !needHideItemCategories.includes(item.type)).map((item) => ({ id: item.id, type: item.type, customLabel: item.customLabel || getDefaultLabel(translate, item), curatedFilter: item.curatedFilter })).asMutable() : undefined
  }, [itemCategoriesInfo, needHideItemCategories, translate])

  return <div className={`data-item-search w-100 h-100 ${className}`} css={style}>
    <ItemSelector
      mode={ItemSelectorMode.Simple} itemType={SupportedItemTypes} itemTypeCategory={displayedItemTypeCategories} portalUrl={portalUrl} isMultiple={true}
      onSelect={onSelect} onRemove={onRemove}
      selectedItems={selectedItems} loadingItems={loadingItems}
      itemCategoriesInfo={shouldBeDisplayedItemCategoriesInfo}
      disableDetailPopper allowAllSceneService showItemTypeCategoryFilter enableContentSortInSimpleMode disableDefaultSortSetting />
  </div>
}

async function getDsJsonFromItem (dsId: string, item: IItemWithPortalUrl): Promise<DataSourceJson> {
  try {
    if (!item) {
      return Promise.resolve(null)
    }

    /**
     * For feature service item, if it is single layer but the url is not end up with layer id, we need to find the single layer and create a feature layer data source, not feature service data source.
     * This is to make single layer feature service item to support 'set filter' action and 'view in table' action.
     */
    if (item.type === JimuSupportedItemTypes.FeatureService && item.url && /^(http(s)?:)?\/\//.test(item.url)) {
      const serviceUrl = item.url.split('?')[0].replace(/^http:/, 'https:').replace(/\/$/, '')
      const serviceDefinition = await ServiceManager.getInstance().fetchServiceInfo(serviceUrl).then(res => res.definition)

      let url: string
      let layerDefinition: ServiceDefinition
      const dsJsonPartial: Partial<DataSourceJson> = {
        itemId: item.id,
        portalUrl: item.portalUrl
      }

      if (dataSourceUtils.isSupportedSingleArcGISLayerService(item.url)) {
        url = item.url
        layerDefinition = serviceDefinition
      } else {
        const layers = (serviceDefinition?.layers || []).concat(serviceDefinition?.tables || [])
        const layerInfo = await getLayerInfoFromSingleLayerFeatureService(serviceUrl, serviceDefinition)
        if (layerInfo) {
          url = layerInfo.url
          layerDefinition = layerInfo.layerDefinition
          dsJsonPartial.sourceLabel = item.title || layers[0]?.name
        }
      }
      if (url && layerDefinition) {
        return dataSourceJsonCreator.createDataSourceJsonByLayerDefinition(dsId, layerDefinition, url)?.merge(dsJsonPartial)?.asMutable({ deep: true })
      }
    }

    return Promise.resolve(dataSourceJsonCreator.createDataSourceJsonByItemInfo(dsId, item, item.portalUrl).asMutable({ deep: true }))
  } catch (err) {
    console.error('Failed to create data source', err)
    return Promise.resolve(null)
  }
}

const style = css`
  position: relative;
`
