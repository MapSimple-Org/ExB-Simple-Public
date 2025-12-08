import {
  AppMode, type BrowserSizeMode, getAppStore, lodash, type extensionSpec, type IMAppConfig,
  type ImmutableArray, type IMIconResult, type LayoutInfo, type DuplicateContext,
  dataSourceUtils
} from 'jimu-core'
import type { IMActionConfig, IMConfig } from '../config'
import { BASE_LAYOUT_NAME } from '../common/consts'
import { getAppConfigAction } from 'jimu-for-builder'
import { applyChangeToOtherSizeModes } from '../runtime/builder/utils'

interface AccordionStructure {
  config: IMConfig
  label: string
  icon: string | IMIconResult
  children: string[]
}

type ControllerStructure = Array<string | AccordionStructure>

interface SizeModeStructure {
  [sizeMode: string]: ControllerStructure
}

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'controller-app-config-operation'
  widgetId: string

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    const widgetJson = sourceAppConfig.widgets[sourceWidgetId] // widgetJson being copied
    const copiedWidgetJson = destAppConfig.widgets[destWidgetId]
    const config: IMConfig = widgetJson?.config

    // process the controller panels
    const panelConfig = sourceAppConfig.controllerPanels?.[sourceWidgetId]
    if (panelConfig) {
      destAppConfig = destAppConfig.setIn(['controllerPanels', destWidgetId], panelConfig)
    }

    let newMessageConfigs = destAppConfig.messageConfigs
    let messageConfigsChanged = false
    for (const [messageId, messageConfig] of Object.entries(newMessageConfigs || {})) {
      for (let i = 0; i < messageConfig.actions.length; i++) {
        const action = messageConfig.actions[i]
        if (['openWidget', 'toggleWidget'].includes(action.actionName) && action.widgetId === destWidgetId) {
          const actionConfig = action.config as IMActionConfig
          newMessageConfigs = newMessageConfigs.setIn([messageId, 'actions', i, 'config', 'controllerId'], destWidgetId)
          const newWidgetIds = actionConfig.widgetIds.map(widgetId => contentMap?.[widgetId] || widgetId)
          newMessageConfigs = newMessageConfigs.setIn([messageId, 'actions', i, 'config', 'widgetIds'], newWidgetIds)
          if (actionConfig.useDataSources) {
            const newUseDataSources = actionConfig.useDataSources.map(useDataSource => dataSourceUtils.mapUseDataSource(contentMap, useDataSource).useDataSource)
            newMessageConfigs = newMessageConfigs.setIn([messageId, 'actions', i, 'config', 'useDataSources'], newUseDataSources)
          }
          messageConfigsChanged = true
        }
      }
    }

    if ((!config?.behavior?.openStarts || config?.behavior?.openStarts?.length <= 0) && !messageConfigsChanged) {
      return destAppConfig
    }

    const useWidgetIds: ImmutableArray<string> = config.behavior.openStarts
    const newUseWidgetIds: string[] = []

    if (contentMap) {
      useWidgetIds.forEach(wId => {
        // widgetMap[wId] is the linked widget id after copying
        newUseWidgetIds.push(contentMap[wId])
      })
    } else {
      useWidgetIds.forEach(wId => {
        // use large mode only here. all size mode should keep sync
        const sourceLayoutJson = sourceAppConfig.layouts[widgetJson.layouts.controller.LARGE]
        const destLayoutJson = destAppConfig.layouts[copiedWidgetJson.layouts.controller.LARGE]

        sourceLayoutJson?.order.forEach((itemId, i) => {
          if (sourceLayoutJson.content[itemId].widgetId === wId) {
            const newWId = destLayoutJson.content[destLayoutJson.order[i]].widgetId
            newUseWidgetIds.push(newWId)
          }
        })
      })
    }

    return destAppConfig.setIn(['widgets', destWidgetId, 'config', 'behavior', 'openStarts'], newUseWidgetIds)
      .set('messageConfigs', newMessageConfigs)
  }

  /**
   * Do some cleanup operations before current widget is removed.
   * @returns The updated appConfig
   */
  widgetWillRemove (appConfig: IMAppConfig): IMAppConfig {
    // process the controller panels
    if (appConfig.controllerPanels?.[this.widgetId]) {
      return appConfig.set('controllerPanels', appConfig.controllerPanels.without(this.widgetId))
    }
    return appConfig
  }

  appConfigWillChange (appConfig: IMAppConfig): IMAppConfig {
    const controllerId = this.widgetId
    const { widgets, layouts, mainSizeMode } = appConfig
    const sizeModeLayoutJson = widgets[controllerId]?.layouts?.[BASE_LAYOUT_NAME]
    if (!sizeModeLayoutJson) return appConfig
    const emptyLayoutInfos: LayoutInfo[] = []
    const sizeModeStructure: SizeModeStructure = {}
    // Find empty layout items and build controller structure of all size modes
    for (const [sizeMode, controllerLayoutId] of Object.entries(sizeModeLayoutJson)) {
      const conotrollerLayout = layouts[controllerLayoutId]
      const { order, content } = conotrollerLayout
      const structure: ControllerStructure = []
      for (const layoutItemId of (order || [])) {
        const layoutItem = content[layoutItemId]
        const widget = widgets[layoutItem.widgetId]
        if (widget?.manifest?.name === 'accordion') {
          const accordionSizeModeLayoutJson = widget?.layouts?.DEFAULT
          const accordionLayoutId = accordionSizeModeLayoutJson[sizeMode]
          const accordionLayout = layouts[accordionLayoutId]
          const innerStructure: AccordionStructure = {
            config: widget.config,
            label: widget.label,
            icon: widget.icon,
            children: []
          }
          if (accordionLayout?.content && accordionLayout?.order) {
            for (const innerLayoutItemId of accordionLayout.order) {
              const innerLayoutItem = accordionLayout.content[innerLayoutItemId]
              const innerWidgetId = innerLayoutItem.widgetId
              if (!innerWidgetId) {
                const innerLayoutInfo = { layoutId: accordionLayout.id, layoutItemId: innerLayoutItemId }
                emptyLayoutInfos.push(innerLayoutInfo)
              } else {
                innerStructure.children.push(innerWidgetId)
              }
            }
          }
          structure.push(innerStructure)
        } else {
          const widgetId = layoutItem.widgetId
          if (!widgetId) {
            const layoutInfo = { layoutId: controllerLayoutId, layoutItemId: layoutItemId }
            emptyLayoutInfos.push(layoutInfo)
          } else {
            structure.push(widgetId)
          }
        }
      }
      sizeModeStructure[sizeMode] = structure
    }
    let updatedAppConfig = appConfig
    // After removing or moving an layout item in "Express mode" or "Lock layout",
    // there will be an empty item in the controller layout's content like:
    // { id: "14", type: "WIDGET", bbox: {} }
    // This item will be rendered as a placeholder in other layouts.
    // But for a controller layout, it's useless and should be cleaned.
    if (emptyLayoutInfos.length > 0) {
      for (const emptyLayoutInfo of emptyLayoutInfos) {
        const { layoutId, layoutItemId } = emptyLayoutInfo
        const { content, order } = updatedAppConfig.layouts[layoutId] || {}
        updatedAppConfig = updatedAppConfig.setIn(['layouts', layoutId, 'content'], content.without(layoutItemId))
        updatedAppConfig = updatedAppConfig.setIn(['layouts', layoutId, 'order'], (order || []).filter(id => id !== layoutItemId))
      }
    }
    // In express mode, changes in mainSizeMode should be applied to other size modes.
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    const isExpressMode = appState.appRuntimeInfo.appMode === AppMode.Express
    const isMainSizeMode = appState.browserSizeMode === appState.appConfig.mainSizeMode
    if (isExpressMode && isMainSizeMode) {
      const appConfigAction = getAppConfigAction(updatedAppConfig)
      for (const [sizeMode, structure] of Object.entries(sizeModeStructure)) {
        const otherSizeMode = sizeMode as BrowserSizeMode
        if (otherSizeMode === mainSizeMode || lodash.isDeepEqual(structure, sizeModeStructure[mainSizeMode])) continue
        applyChangeToOtherSizeModes(appConfigAction, controllerId, otherSizeMode)
      }
      updatedAppConfig = appConfigAction.appConfig
    }
    return updatedAppConfig
  }
}
