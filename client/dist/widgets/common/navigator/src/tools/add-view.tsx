import { type extensionSpec, type React, appActions, getAppStore, type LayoutContextToolProps, i18n, lodash, jimuHistory, type LayoutInfo, type LayoutItemConstructorProps, LayoutItemType, type IMAppConfig, AppMode, type IMPlaceholderInfo } from 'jimu-core'
import { ViewType, type IMConfig } from '../config'
import { defaultMessages } from 'jimu-ui'
import { builderAppSync, getAppConfigAction, placeholderService } from 'jimu-for-builder'
import { addItemToLayout } from 'jimu-layouts/layout-builder'
import placeholderIcon from 'jimu-icons/svg/outlined/brand/widget-place-holder.svg'
import plusOutlined from 'jimu-icons/svg/outlined/editor/plus.svg'
import plusFilled from 'jimu-icons/svg/filled/editor/plus.svg'

export default class AddViewTool implements extensionSpec.ContextToolExtension {
  index = 3
  id = 'navigator-add-view'
  widgetId: string

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  visible (props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId

    const isAuto = (this.getAppState().appConfig.widgets[widgetId]?.config as IMConfig)?.data?.type === ViewType.Auto
    const isExpressMode = this.getAppState()?.appRuntimeInfo?.appMode === AppMode.Express
    return isAuto && isExpressMode
  }

  getGroupId () {
    return null
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'addView', defaultMessage: defaultMessages.addAView }) : 'Add view'
  }

  checked () {
    return null
  }

  getIcon () {
    return window.jimuConfig.isBuilder ? plusFilled : plusOutlined
  }

  getPlaceholderItem (appConfig: IMAppConfig, layoutInfo: LayoutInfo): LayoutItemConstructorProps {
    const intl = i18n.getIntl('_jimu')
    const placeholderLabel = intl ? intl.formatMessage({ id: 'placeholder' }) : 'Placeholder'
    const placeholderItem: LayoutItemConstructorProps = {
      itemType: LayoutItemType.Widget,
      label: `${placeholderLabel} ${placeholderService.getNextPlaceholderId(appConfig)}`,
      layoutInfo,
      manifest: {
        defaultSize: {
          width: 300,
          height: 300
        }
      },
      icon: placeholderIcon,
      name: 'placeholder'
    }
    return placeholderItem
  }

  async onClick (props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId

    // eslint-disable-next-line no-unsafe-optional-chaining
    const { section } = (this.getAppState().appConfig.widgets[widgetId]?.config as IMConfig)?.data
    if (!section) {
      return
    }
    let appConfigAction = getAppConfigAction()

    const viewId = appConfigAction.addView(section)

    const layoutIds = Object.entries(appConfigAction.appConfig.views?.[viewId]?.layout || {})
    let mainLayoutInfo: LayoutInfo
    let placeholderInfoInMainLayout: IMPlaceholderInfo
    for (const [sizeMode, layoutId] of layoutIds) {
      // add placeholder to layout
      let { updatedAppConfig, layoutInfo } = await addItemToLayout(appConfigAction.appConfig, {} as LayoutItemConstructorProps, layoutId)

      // sync placeholders in all size mode so that when add widget in one placeholder, other size modes can sync the widgetId
      if (!mainLayoutInfo) {
        mainLayoutInfo = layoutInfo
        // placeholderInfo was added by addItemToLayout above, get detail here
        placeholderInfoInMainLayout = placeholderService.getPlaceholderInfo(updatedAppConfig, mainLayoutInfo)
      } else {
        updatedAppConfig = updatedAppConfig.setIn(['placeholderInfos', placeholderInfoInMainLayout.id, 'syncs', sizeMode], layoutInfo)
      }
      appConfigAction = getAppConfigAction(updatedAppConfig)
      appConfigAction
        .editLayoutItemProperty(layoutInfo, 'type', LayoutItemType.Widget, true)
        .adjustOrderOfItem(layoutInfo, 0, true)
        .editLayoutItemProperty(layoutInfo, 'bbox', {
          top: '0%',
          bottom: '0%',
          left: '0%',
          right: '0%',
          width: '100%',
          height: '100%'
        }, true)
    }

    appConfigAction.exec()

    lodash.defer(() => {
      const currentActiveViewId = this.getAppState()?.appRuntimeInfo?.sectionNavInfos?.[section]?.currentViewId
      if (currentActiveViewId !== viewId) {
        // select the new view
        const navInfo = {
          previousViewId: currentActiveViewId,
          currentViewId: viewId,
          useProgress: false
        }
        if (window.jimuConfig.isBuilder) {
          builderAppSync.publishSectionNavInfoToApp(section, navInfo)
        } else {
          getAppStore().dispatch(appActions.sectionNavInfoChanged(section, navInfo))
          jimuHistory.changeViewBySectionNavInfo(section, navInfo)
        }
      }
    })
  }

  getSettingPanel (): React.ComponentClass<unknown> {
    return null
  }
}
