import {
  type LayoutInfo,
  getAppStore,
  React,
  BrowserSizeMode
} from 'jimu-core'
import { interact } from 'jimu-core/dnd'
import { ButtonGroup, Button, Popper } from 'jimu-ui'
import { handleResizeCard as commonHandleResizeCard, selectSelf as commonSelectSelf, type HandleResizeCardOptions} from '../common-builder-support'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import { getAppConfigAction, LayoutServiceProvider, widgetService } from 'jimu-for-builder'
import {
  GLOBAL_DRAGGING_CLASS_NAME,
  GLOBAL_RESIZING_CLASS_NAME,
  GLOBAL_H5_DRAGGING_CLASS_NAME
} from 'jimu-layouts/layout-builder'
import MyDropDown, { type MyDropdownProps } from './components/tools/my-dropdown'
import ListCardEditor from './components/list/list-card-editor'
import { withBuilderTheme } from 'jimu-theme'

const widgetModules = {
  ButtonGroup: ButtonGroup,
  interact: interact,
  searchUtils: searchUtils,
  getAppConfigAction: getAppConfigAction,
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
  ListCardEditor: ListCardEditor,

  handleResizeCard: (resizeOptions: HandleResizeCardOptions, isReplace: boolean = false) => {
    const action = commonHandleResizeCard(resizeOptions)
    if (action) {
      action.exec(isReplace)
    }
  },

  selectSelf: (id: string) => {
    commonSelectSelf(id, true)
  },

  selectionInList: (
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
      layoutItems.push(
        ...searchUtils.getRelatedLayoutItemsInWidgetByLayoutInfo(
          appConfig,
          layoutInfo,
          id,
          BrowserSizeMode.Large
        )
      )
      layoutItems.push(
        ...searchUtils.getRelatedLayoutItemsInWidgetByLayoutInfo(
          appConfig,
          layoutInfo,
          id,
          BrowserSizeMode.Medium
        )
      )
      layoutItems.push(
        ...searchUtils.getRelatedLayoutItemsInWidgetByLayoutInfo(
          appConfig,
          layoutInfo,
          id,
          BrowserSizeMode.Small
        )
      )
    }
    return layoutItems.length > 0
  }
}

export default widgetModules
