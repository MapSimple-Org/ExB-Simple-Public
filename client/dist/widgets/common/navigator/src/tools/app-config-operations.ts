import { appConfigUtils, AppMode, getAppStore, i18n, type extensionSpec, type IMAppConfig, defaultMessages, type DuplicateContext } from 'jimu-core'
import type { IMConfig } from '../config'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'query-app-config-operation'

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    if (!contentMap) { // no need to change widget linkage if it is not performed during a page copying
      return destAppConfig
    }

    const widgetJson = sourceAppConfig.widgets[sourceWidgetId]
    const config: IMConfig = widgetJson?.config
    // if duplicate whole page, will get the copied linkage section id by using: contentMap?.[config?.data?.section]
    // if only duplicate a widget, will use the section id in of source widget directly
    const currentSectionId = contentMap?.[config?.data?.section] || config?.data?.section
    const sourceWidgetSectionView = sourceAppConfig?.sections?.[config?.data?.section]?.views
    const currentWidgetSectionView = destAppConfig?.sections?.[currentSectionId]?.views

    const displayViews = []
    sourceWidgetSectionView?.forEach((view, index) => {
      if (config?.data?.views?.includes(view)) {
        if (currentWidgetSectionView?.[index]) {
          displayViews.push(currentWidgetSectionView[index])
        }
      }
    })
    const newAppConfig = destAppConfig.setIn(['widgets', destWidgetId, 'config', 'data', 'section'], currentSectionId)
      .setIn(['widgets', destWidgetId, 'config', 'data', 'views'], displayViews)

    return newAppConfig
  }

  /**
   * Do some cleanup operations before current widget is removed.
   * @returns The updated appConfig
   */
  widgetWillRemove (appConfig: IMAppConfig): IMAppConfig {
    return appConfig
  }

  anyWidgetWillRemove (appConfig: IMAppConfig, widgetId: string): IMAppConfig {
    if (!(window.jimuConfig.isInBuilder && getAppStore().getState().appRuntimeInfo.appMode === AppMode.Express)) {
      return appConfig
    }
    let widgetInViewId
    Object.keys(appConfig.views || {}).forEach((viewId) => {
      const viewLayoutsIds = Object.values(appConfig.views[viewId]?.layout || {})
      viewLayoutsIds.forEach((layoutId) => {
        const layoutItems = Object.values(appConfig.layouts[layoutId]?.content || {})
        layoutItems.forEach((layoutItem) => {
          if (layoutItem.widgetId === widgetId) {
            widgetInViewId = viewId
          }
        })
      })
    })
    // if the deleted widget is in view, delete the widget label and icon, use view's default label and icon
    if (widgetInViewId) {
      const viewJson = appConfig.views[widgetInViewId]
      if (viewJson.icon) {
        const intl = i18n.getIntl()
        return appConfig.setIn(['views', widgetInViewId], appConfig.views[widgetInViewId].set('icon', null).set('label', appConfigUtils.getUniqueLabel(appConfig, 'view', intl.formatMessage({ id: 'view', defaultMessage: defaultMessages.view }))))
      }
    }
    return appConfig
  }
}
