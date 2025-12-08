import { Immutable, TransitionDirection, TransitionType, AnimationType, AnimationDirection, AnimationEffectType } from 'jimu-core'
import { TemplateType, type IMConfig, DirectionType, PageStyle, type WidgetStyle, DisplayType, type LayersConfig, ItemSizeType } from './config'
import { FontFamilyValue } from 'jimu-ui'

/**
 * To get the default config of a bookmark widget, do not save default config in app config (config.json file).
 * Note: 1.galleryItemWidth, galleryItemWidth, galleryItemSpace is still need to save default in app config, to avoid regression issue after gallery template refactor(issue #20598).
 * 2.cardItemWidth is still need to save default in app config, to avoid regression issue after card template refactor(issue #21431).
 * 3. `displayFromWeb` is still need to save default in app config.json, to avoid regression issue: Before 2024R02 `displayFromWeb` doesn't exist in config for new apps, in 2024R02 `displayFromWeb` is false in config for new apps, in 2024R03 `displayFromWeb` is changed to true in config for new apps.
 */
export function getDefaultConfig (): IMConfig {
  return Immutable({
    templateType: TemplateType.Card,
    isTemplateConfirm: false,
    style: Immutable<WidgetStyle>({
      id: 'default'
    }),
    isInitialed: false,
    bookmarks: [],
    initBookmark: false,
    runtimeAddAllow: false,
    ignoreLayerVisibility: false,
    autoPlayAllow: false,
    autoInterval: 3,
    autoLoopAllow: true,
    direction: DirectionType.Horizon,
    pageStyle: PageStyle.Paging,
    space: 10,
    scrollBarOpen: true,
    navigatorOpen: false,
    transition: TransitionType.None,
    transitionDirection: TransitionDirection.Horizontal,
    displayType: DisplayType.Selected,
    itemHeight: 240,
    itemWidth: 240,
    transitionInfo: {
      transition: {
        type: TransitionType.None,
        direction: TransitionDirection.Horizontal
      },
      effect: {
        type: AnimationType.None,
        option: {
          direction: AnimationDirection.Top,
          configType: AnimationEffectType.Default
        }
      },
      oneByOneEffect: null,
      previewId: null
    },
    cardBackground: '',
    displayName: true,
    hideIcon: false,
    cardItemHeight: 157.5,
    keepAspectRatio: false,
    itemSizeType: ItemSizeType.Custom,
    cardNameStyle: {
      fontFamily: FontFamilyValue.AVENIRNEXT,
      fontStyles: {
        style: 'normal',
        weight: 'normal',
        strike: 'none',
        underline: 'none'
      },
      fontColor: 'var(--sys-color-surface-paper-text)',
      fontSize: '13'
    },
    slidesNameStyle: {
      fontFamily: FontFamilyValue.AVENIRNEXT,
      fontStyles: {
        style: 'normal',
        weight: 'bold',
        strike: 'none',
        underline: 'none'
      },
      fontColor: 'var(--sys-color-surface-paper-text)',
      fontSize: '16'
    },
    slidesDescriptionStyle: {
      fontFamily: FontFamilyValue.AVENIRNEXT,
      fontStyles: {
        style: 'normal',
        weight: 'normal',
        strike: 'none',
        underline: 'none'
      },
      fontColor: 'var(--sys-color-surface-paper-text)',
      fontSize: '13'
    }
  })
}

//Bookmark needs to check `layer.listMode`(how the layer should display in the LayerList widget) before changes layer's visibility. (refer to: https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder/issues/16419)
export const shouldChangeLayerVisibility = (layer) => {
  if (layer?.listMode === 'hide') {
    return false
  } else {
    return true
  }
}

/**
 * Check the layer visibility in config and apply to the layer.
 * @param layersArray: __esri.Layer[],
 * @param layersConfig: LayersConfig,
 * @param mapDsChange: This variable indicates whether the current map is the map for which the bookmark corresponds. If it is not, the variable is true, need to keep the layer attribute of the map itself.
 * @returns void
 */
export const showLayersConfig = (
  layersArray: __esri.Layer[],
  layersConfig: LayersConfig,
  mapDsChange: boolean = false
) => {
  if (mapDsChange) return
  const recursion = (array, config) => {
    array.forEach(layer => {
      if (shouldChangeLayerVisibility(layer)) {
        if (config[layer.id]?.visibility !== undefined) {
          layer.visible = config[layer.id]?.visibility
        }
      }
      const children = layer.layers || layer.sublayers || layer.allSublayers
      const subConfig = config?.[layer.id]?.layers
      if (
        children &&
        children.length > 0 &&
        subConfig &&
        Object.keys(subConfig).length > 0
      ) { recursion(children.toArray(), subConfig) }
    })
  }
  recursion(layersArray, layersConfig)
}

/**
 * Get layer's visible properties and stores in LayersConfig.
 * @param layersArray
 * @returns LayersConfig
 */
export const getLayersConfig = (layersArray: __esri.Layer[]) => {
  const layersConfig: LayersConfig = {}
  const recursion = (array, config: LayersConfig) => {
    array.forEach(layer => {
      if (typeof layer.id === 'string' && layer.id.includes('jimu-draw')) return
      config[layer.id] = { layers: {} }
      config[layer.id].visibility = layer?.visible
      const children = layer.layers || layer.sublayers || layer.allSublayers
      if (children && children.length > 0) { recursion(children, config[layer.id]?.layers) }
    })
    return config
  }
  return recursion(layersArray, layersConfig)
}
