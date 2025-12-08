/** @jsx jsx */
import { React, hooks, type ImmutableArray, jsx, classNames, css, type ImmutableObject, appConfigUtils } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent, MapViewManager, basemapUtils } from 'jimu-arcgis'
import { Loading, LoadingType, Paper, WidgetPlaceholder } from 'jimu-ui'
import BasemapGalleryViewModel from 'esri/widgets/BasemapGallery/BasemapGalleryViewModel'
import LocalBasemapsSource from 'esri/widgets/BasemapGallery/support/LocalBasemapsSource'
import { type BasemapFromUrl, type BasemapInfo, BasemapsType } from '../config'
import defaultMessages from './translations/default'
import { useCustomBasemapsChange, type BaseMapProps, useCache, getLoadedBasemapList, getLoadedBasemap, getDefaultThumbnail, basemapInfoEqualBasemap } from './basemap-utils'
import { findDraggedItemPosition } from './utils'
import { type BasemapFromUrlLayerType, isBasemapFromUrl, urlIsImageServer, useFullConfig } from '../utils'
const BaseMapGalleryIcon = require('../../icon.svg')

const style = css`
  &.widget-basemap-gallery {
    .gallery-container-parent{
      overflow: auto;
      arcgis-basemap-gallery {
        --calcite-color-brand: transparent;
      }
    }
  }
`

const Widget = (props: BaseMapProps) => {
  const { useMapWidgetIds, config, theme } = props
  const fullConfig = useFullConfig(config)
  const { basemapsType, customBasemaps } = fullConfig

  const translate = hooks.useTranslation(defaultMessages)

  const [loading, setLoading] = React.useState(true)

  const [currentJimuMapView, setCurrentJimuMapView] = React.useState<JimuMapView>(null)

  const basemapGalleryElementRef = React.useRef<HTMLArcgisBasemapGalleryElement>(null)
  const [arcgisBasemapGalleryElement, setArcgisBasemapGalleryElement] = React.useState<HTMLArcgisBasemapGalleryElement>(null)
  const updateBasemapGalleryElement = (basemapGalleryEle: HTMLArcgisBasemapGalleryElement) => {
    basemapGalleryElementRef.current = basemapGalleryEle
    setArcgisBasemapGalleryElement(basemapGalleryEle)
  }

  const [bgViewModel] = React.useState<__esri.BasemapGalleryViewModel>(new BasemapGalleryViewModel())

  const basemapTypeUsedWhenGetSource = React.useRef<BasemapsType>(basemapsType)
  const themeModeWhenGetSource = React.useRef<string>(theme?.sys?.color?.mode)

  const { getOrgBasemaps, hasGalleryCache, applyCache, originalBasemaps } = useCache(props, currentJimuMapView, arcgisBasemapGalleryElement)

  const isMapView3D = (targetMapview: __esri.MapView | __esri.SceneView) => {
    return targetMapview?.type === '3d'
  }

  const getBasemapsForGallerySource = async (targetMapView: __esri.MapView | __esri.SceneView) => {
    let basemaps: __esri.Basemap[] = []

    basemapTypeUsedWhenGetSource.current = basemapsType
    themeModeWhenGetSource.current = themeMode

    if (basemapsType === BasemapsType.Organization) {
      basemaps = await getOrgBasemaps()
    } else {
      basemaps = await getLoadedBasemapList(customBasemaps.asMutable({ deep: true }), theme)
    }
    if (!isMapView3D(targetMapView)) {
      return basemaps.filter((basemap) => !basemapUtils.isBasemap3D(basemap))
    }
    return basemaps
  }

  const getBasemapsSource = (basemaps: __esri.Basemap[]) => {
    return new LocalBasemapsSource({ basemaps })
  }

  const createBasemapGallery = async (mapView: __esri.MapView | __esri.SceneView) => {
    setLoading(true)

    const basemaps = await getBasemapsForGallerySource(mapView)

    // in express mode template selector, if switch templates very fast, the map in last selected template may has been destroyed,
    // but the code below has already in the stack, so in this case, we will return directly.
    if (!mapView?.map) {
      return
    }
    const originalBasemap = mapView.map.basemap

    const originalBasemapIncluded = !!basemaps.find((item) => bgViewModel.basemapEquals(originalBasemap, item))

    const abg = document.createElement('arcgis-basemap-gallery')
    abg.classList.add('jimu-outline-inside')
    abg.view = mapView
    abg.source = getBasemapsSource((originalBasemapIncluded || !originalBasemap) ? basemaps : [originalBasemap, ...basemaps])
    abg.autoDestroyDisabled = true

    updateBasemapGalleryElement(abg)
    if (widgetContainerParent.current.childElementCount === 0) {
      widgetContainerParent.current.appendChild(abg)
    } else {
      widgetContainerParent.current.replaceChildren(abg)
    }

    setLoading(false)
  }

  /**
   * if original basemap is not included in galleryItems, add it to the top
   * @param activeView
   * @returns
   */
  const handleWithOriginalBasemapAfterBasemapsChanged = (activeView: JimuMapView) => {
    const originalBasemap = originalBasemaps.get(activeView?.id) || activeView?.view?.map?.basemap
    const basemapsFromSource = arcgisBasemapGalleryElement?.source?.basemaps
    if (!originalBasemap || !basemapsFromSource) {
      return
    }
    const isOriginalBasemapInSource = basemapsFromSource.find((item) => bgViewModel.basemapEquals(item, originalBasemap))

    if (isOriginalBasemapInSource) {
      return
    }
    basemapsFromSource.unshift(originalBasemap)
  }

  hooks.useUpdateEffect(() => {
    // if map changed to none, reset the basemap of previous map view
    if (!useMapWidgetIds?.[0] && currentJimuMapView?.view) {
      currentJimuMapView.view.map.basemap = originalBasemaps.get(currentJimuMapView.id)
    }
  }, [useMapWidgetIds?.[0]])

  const onActiveViewChange = async (activeView: JimuMapView, previousActiveViewId: string) => {
    setCurrentJimuMapView(activeView)
    // if no cache and basemapGallery has not been initialed, should create BasemapGallery instance
    if (!arcgisBasemapGalleryElement && !hasGalleryCache) {
      createBasemapGallery(activeView?.view)
    } else if (arcgisBasemapGalleryElement && activeView) { // for the map view change case after the basemap gallery initialed correctly
      const prevMapWidgetIsNone = !previousActiveViewId
      if (prevMapWidgetIsNone) {
        widgetContainerParent.current.appendChild(arcgisBasemapGalleryElement)
      }

      // if map changed, like map1 -> map2, not include map1 -> none, reset the basemap of previous map view
      const mapChanged = activeView.id.split('-')[0] !== previousActiveViewId.split('-')[0]
      if (mapChanged) {
        const previousJimuMapView = MapViewManager.getInstance().getJimuMapViewById(previousActiveViewId)
        if (previousJimuMapView?.view) {
          previousJimuMapView.view.map.basemap = originalBasemaps.get(previousActiveViewId)
        }
      }

      arcgisBasemapGalleryElement.view = activeView.view
      // need to create a new source according to the new map view
      const basemaps = await getBasemapsForGallerySource(activeView.view)
      arcgisBasemapGalleryElement.source = getBasemapsSource(basemaps)
      // since map view changed, need to check if need to add the original basemap of the new map view to top
      handleWithOriginalBasemapAfterBasemapsChanged(activeView)
    } else if (!arcgisBasemapGalleryElement && basemapGalleryElementRef.current && hasGalleryCache) {
      // when change map view(none -> map or map -> none, not include map when there is already a map view exist), the basemap gallery inner map will be destroyed and recreated
      // recreated will use cache, but the cached basemap gallery instance still stored the old map view, and if only update the map view for bg instance, the original basemap may not match either
      // so need to recreate the basemap gallery instance here
      if (basemapGalleryElementRef.current.view !== activeView?.view) {
        createBasemapGallery(activeView?.view)
      }
    }
  }

  const onCustomBasemapAdd = async (prev: ImmutableArray<BasemapInfo>, current: ImmutableArray<BasemapInfo>) => {
    const basemapsFromSource = arcgisBasemapGalleryElement.source.basemaps
    if (!basemapsFromSource) {
      return
    }
    const index = current.findIndex((item => !prev.find(i => i.id === item.id)))
    const addedItem = current[index]
    const newBasemap = await getLoadedBasemap(addedItem.asMutable({ deep: true }), theme)

    if (!currentJimuMapView?.view) {
      return
    }

    if (!isMapView3D(currentJimuMapView?.view) && basemapUtils.isBasemap3D(newBasemap)) {
      return
    }

    basemapsFromSource.add(newBasemap, basemapsFromSource.length - prev.length + index)
    // if the new basemap equal with the original basemap, delete the original basemap
    const isOriginalBasemap = bgViewModel.basemapEquals(originalBasemaps.get(currentJimuMapView.id), newBasemap)
    if (isOriginalBasemap) {
      basemapsFromSource.shift()
    }
  }

  const onCustomBasemapRemove = (prev: ImmutableArray<BasemapInfo>, current: ImmutableArray<BasemapInfo>) => {
    const basemapsFromSource = arcgisBasemapGalleryElement.source.basemaps
    if (!basemapsFromSource) {
      return
    }
    const index = prev.findIndex((item, index) => item.id !== current[index]?.id)

    const removedBasemapItem = prev[index]

    const shouldBeRemovedBasemapIndex = basemapsFromSource.findIndex((item) => basemapInfoEqualBasemap(removedBasemapItem, item))
    // if cannot find gallery, means the web map is 2D, and the deleted basemap is 3D
    if (shouldBeRemovedBasemapIndex < 0) {
      return
    }

    const deletedBasemap = basemapsFromSource.getItemAt(shouldBeRemovedBasemapIndex)
    basemapsFromSource.splice(shouldBeRemovedBasemapIndex, 1)

    const activeBasemap = arcgisBasemapGalleryElement.activeBasemap as __esri.Basemap
    if (!activeBasemap) {
      return
    }
    const activeBasemapIsDeleted = bgViewModel.basemapEquals(deletedBasemap, activeBasemap)
    if (activeBasemapIsDeleted) {
      // if active basemap is deleted, select original basemap
      const originalBasemap = originalBasemaps.get(currentJimuMapView.id)
      handleWithOriginalBasemapAfterBasemapsChanged(currentJimuMapView)
      arcgisBasemapGalleryElement.activeBasemap = originalBasemap
    }
  }

  const onCustomBasemapSortOrUpdate = (prev: ImmutableArray<BasemapInfo>, current: ImmutableArray<BasemapInfo>) => {
    const basemapsFromSource = arcgisBasemapGalleryElement.source.basemaps
    if (!basemapsFromSource) {
      return
    }
    const prevInUse = prev.filter((item) => !!basemapsFromSource.find((i) => basemapInfoEqualBasemap(item, i)))
    const currentInUse = current.filter((item) => !!basemapsFromSource.find((i) => basemapInfoEqualBasemap(item, i)))
    const positionInfo = findDraggedItemPosition<string>(prevInUse.asMutable().map((item => item.id)), currentInUse.asMutable().map((item => item.id)))
    if (!positionInfo) {
      // basemaps from url updated. basemaps imported from portal item will never update.
      current.forEach((cur, index) => {
        if (isBasemapFromUrl(cur)) {
          const pre = prev[index] as ImmutableObject<BasemapFromUrl>
          const basemapIndex = basemapsFromSource.findIndex((i) => basemapInfoEqualBasemap(cur, i))
          // if layer url change, update the basemap instance directly
          if (cur.layerUrls.length !== pre.layerUrls.length || cur.layerUrls.some((url, urlIndex) => url !== pre.layerUrls?.[urlIndex])) {
            getLoadedBasemap(cur.asMutable({ deep: true }), theme).then((newBasemap) => {
              basemapsFromSource.splice(basemapIndex, 1, newBasemap)
              // if current basemap is in use, update the basemap for map
              if (currentJimuMapView?.view?.map?.basemap?.id === newBasemap.id) {
                currentJimuMapView.view.map.basemap = newBasemap
              }
            })
            return
          }
          const basemap = basemapsFromSource.getItemAt(basemapIndex)
          if (cur.title !== pre.title) {
            basemap.title = cur.title
          }
          if (cur.thumbnail?.url !== pre.thumbnail?.url) {
            basemap.thumbnailUrl = appConfigUtils.processResourceUrl(cur.thumbnail?.url) || getDefaultThumbnail(theme)
          }
          if (cur.disablePopup !== pre.disablePopup) {
            basemap.baseLayers.forEach((layer: BasemapFromUrlLayerType) => {
              if (urlIsImageServer(layer.url)) {
                (layer as __esri.ImageryLayer | __esri.ImageryTileLayer).popupEnabled = !cur.disablePopup
              }
            })
          }
        }
      })
      return
    }

    let { from, to } = positionInfo

    // if count of prev custom basemap < count of gallery items, it means the first gallery item is from original basemap
    if (prevInUse.length < basemapsFromSource.length) {
      from += 1
      to += 1
    }

    const item = basemapsFromSource.removeAt(from)
    basemapsFromSource.splice(to, 0, item)
  }

  useCustomBasemapsChange(customBasemaps, arcgisBasemapGalleryElement, onCustomBasemapAdd, onCustomBasemapRemove, onCustomBasemapSortOrUpdate)

  const themeMode = React.useMemo(() => theme?.sys?.color?.mode, [theme?.sys?.color?.mode])
  const updateBasemapGalleryItems = () => {
    setLoading(true)
    getBasemapsForGallerySource(currentJimuMapView?.view).then((basemaps) => {
      // when promise resolved, the currentJimuMapView?.view may has been destroyed in express mode template selector
      if (!currentJimuMapView?.view) {
        return
      }
      const basemapsFromSource = arcgisBasemapGalleryElement.source.basemaps
      basemapsFromSource.removeAll()
      basemapsFromSource.addMany(basemaps)

      handleWithOriginalBasemapAfterBasemapsChanged(currentJimuMapView)

      const originalBasemap = originalBasemaps.get(currentJimuMapView.id)
      const activeBasemap = arcgisBasemapGalleryElement.activeBasemap as __esri.Basemap
      const originalBasemapIsActive = bgViewModel.basemapEquals(originalBasemap, activeBasemap)
      if (!originalBasemapIsActive) {
        if (!basemaps.find((basemap) => bgViewModel.basemapEquals(basemap, activeBasemap))) {
          arcgisBasemapGalleryElement.activeBasemap = originalBasemap
        }
      }
      setLoading(false)
    })
  }
  hooks.useUpdateEffect(() => {
    if (!arcgisBasemapGalleryElement) {
      return
    }
    updateBasemapGalleryItems()

  }, [basemapsType, themeMode])

  hooks.useUpdateEffect(() => {
    // if theme mode and basemap type are not changed, no need to update
    if (!arcgisBasemapGalleryElement || (basemapTypeUsedWhenGetSource.current === basemapsType && themeModeWhenGetSource.current === themeMode)) {
      return
    }
    updateBasemapGalleryItems()
  }, [arcgisBasemapGalleryElement])

  const widgetContainerParent = React.useRef<HTMLDivElement>(null)

  const updateWidgetContainerParent = (element: HTMLDivElement) => {
    if (!element) {
      return
    }
    widgetContainerParent.current = element
    if (!arcgisBasemapGalleryElement) {
      const cachedGalleryInstance = applyCache(element)
      if (cachedGalleryInstance) {
        updateBasemapGalleryElement(cachedGalleryInstance)
        setLoading(false)
      }
    }
  }

  if (!useMapWidgetIds?.length) {
    return <WidgetPlaceholder icon={BaseMapGalleryIcon} name={translate('_widgetLabel')} />
  } else {
    return (
      <Paper className='jimu-widget widget-basemap-gallery' variant='flat' css={style} shape='none'>

        <div
          ref={updateWidgetContainerParent} role='listbox' aria-label={translate('_widgetLabel')}
          className={classNames('gallery-container-parent', 'h-100', {
            'd-none': loading
          })}></div>

        {loading && <Loading type={LoadingType.Secondary} />}

        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={onActiveViewChange}
        />
      </Paper>
    )
  }
}

export default Widget
