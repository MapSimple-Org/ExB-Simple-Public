import {
  type LayoutInfo,
  getAppStore,
  React,
  BrowserSizeMode
} from 'jimu-core'
import { interact } from 'jimu-core/dnd'
import { ButtonGroup, Button, Popper } from 'jimu-ui'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import { getAppConfigAction, ContentServiceWrapper, LayoutServiceProvider, widgetService } from 'jimu-for-builder'
import {
  GLOBAL_DRAGGING_CLASS_NAME,
  GLOBAL_RESIZING_CLASS_NAME,
  GLOBAL_H5_DRAGGING_CLASS_NAME
} from 'jimu-layouts/layout-builder'
import MyDropDown, { type MyDropdownProps } from './components/my-dropdown'
import { withBuilderTheme } from 'jimu-theme'

const widgetModules = {
  ButtonGroup: ButtonGroup,
  interact: interact,
  searchUtils: searchUtils,
  getAppConfigAction: getAppConfigAction,
  ContentServiceWrapper: ContentServiceWrapper,
  LayoutServiceProvider: LayoutServiceProvider,
  widgetService: widgetService,
  GLOBAL_DRAGGING_CLASS_NAME: GLOBAL_DRAGGING_CLASS_NAME,
  GLOBAL_RESIZING_CLASS_NAME: GLOBAL_RESIZING_CLASS_NAME,
  GLOBAL_H5_DRAGGING_CLASS_NAME: GLOBAL_H5_DRAGGING_CLASS_NAME,
  withBuilderTheme: withBuilderTheme,
  BuilderDropDown: withBuilderTheme((props: MyDropdownProps) => {
    return <MyDropDown {...props} withBuilderTheme={withBuilderTheme} />
  }),
  BuilderPopper: withBuilderTheme(Popper),
  BuilderButton: withBuilderTheme(Button),

  selectionIsSelf: (layoutInfo: LayoutInfo, id: string, appConfig: any) => {
    if (!layoutInfo || !layoutInfo.layoutItemId || !layoutInfo.layoutId) {
      return false
    }
    const layoutItem = searchUtils.findLayoutItem(appConfig, layoutInfo)
    if (layoutItem && layoutItem.widgetId && layoutItem.widgetId === id) {
      return true
    }
    return false
  },

  selectionInCard: (
    layoutInfo: LayoutInfo,
    id: string,
    appConfig: any,
    useCurrentSizeMode: boolean = true
  ) => {
    if (!layoutInfo || !layoutInfo.layoutItemId || !layoutInfo.layoutId) {
      return false
    }
    let layoutItems
    if (useCurrentSizeMode) {
      layoutItems = searchUtils.getRelatedLayoutItemsInWidgetByLayoutInfo(
        appConfig,
        layoutInfo,
        id,
        getAppStore().getState().browserSizeMode
      )
    } else {
      layoutItems = []
      const relatedLayoutInfosInWidgetByLayoutInfoInLarge = searchUtils.getRelatedLayoutInfosInWidgetByLayoutInfo(
        appConfig,
        layoutInfo,
        id,
        BrowserSizeMode.Large
      ) || []
      const relatedLayoutInfosInWidgetByLayoutInfoInMedium = searchUtils.getRelatedLayoutInfosInWidgetByLayoutInfo(
        appConfig,
        layoutInfo,
        id,
        BrowserSizeMode.Medium
      ) || []
      const relatedLayoutInfosInWidgetByLayoutInfoInSmall = searchUtils.getRelatedLayoutInfosInWidgetByLayoutInfo(
        appConfig,
        layoutInfo,
        id,
        BrowserSizeMode.Small
      ) || []
      layoutItems = layoutItems.concat(relatedLayoutInfosInWidgetByLayoutInfoInLarge)
      layoutItems = layoutItems.concat(relatedLayoutInfosInWidgetByLayoutInfoInMedium)
      layoutItems = layoutItems.concat(relatedLayoutInfosInWidgetByLayoutInfoInSmall)
    }
    return layoutItems.length > 0 && !!layoutItems?.[0]
  }
}

export default widgetModules
