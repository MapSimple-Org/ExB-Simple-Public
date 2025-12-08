import { type extensionSpec, type React, getAppStore, appActions, type LayoutContextToolProps, i18n } from 'jimu-core'
import { ImageFillMode } from 'jimu-ui'
import type { Config } from '../config'
import defaultMessage from '../../src/runtime/translations/default'
import CutOutlined from 'jimu-icons/svg/outlined/editor/cut.svg'
import { builderAppSync } from 'jimu-for-builder'

export default class CropTool implements extensionSpec.ContextToolExtension {
  index = 1
  id = 'image-croptool'
  widgetId: string

  classes: { [widgetId: string]: React.ComponentClass<unknown> } = {}

  getGroupId () {
    return null
  }

  getTitle () {
    const widgetId = this.widgetId
    const intl = i18n.getIntl(widgetId)
    return intl ? intl.formatMessage({ id: 'imageCrop', defaultMessage: defaultMessage.imageCrop }) : 'Crop'
  }

  getIcon () {
    return CutOutlined
  }

  onClick (props: LayoutContextToolProps) {
    const appConfig = window.jimuConfig.isBuilder ? getAppStore().getState().appStateInBuilder?.appConfig : getAppStore().getState().appConfig
    const widgetId = props.layoutItem.widgetId
    const widgetInfo = appConfig.widgets[widgetId]

    if (widgetInfo) {
      const widgetConfig = widgetInfo.config as Config
      if (widgetConfig.functionConfig.imageParam && widgetConfig.functionConfig.imageParam.url) {
        if (window.jimuConfig.isBuilder) {
          builderAppSync.publishSetWidgetIsInlineEditingStateToApp(widgetId, true)
        } else {
          getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true))
        }
      }
    }
  }

  isEmptySource = (config: Config): boolean => {
    if ((!config?.functionConfig?.imageParam || !config.functionConfig?.imageParam?.url) && !config?.functionConfig?.srcExpression) {
      return true
    } else {
      return false
    }
  }

  visible (props: LayoutContextToolProps) {
    const appConfig = window.jimuConfig.isBuilder ? getAppStore().getState().appStateInBuilder?.appConfig : getAppStore().getState().appConfig
    const widgetInfo = appConfig.widgets[props.layoutItem.widgetId]
    if (widgetInfo) {
      const widgetConfig = widgetInfo.config as Config
      if (this.isEmptySource(widgetConfig)) {
        return false
      }

      if (widgetConfig.functionConfig.srcExpression) {
        // the dynamic src from expression can't support crop
        return false
      } else if (widgetConfig.functionConfig.imageParam && (widgetConfig.functionConfig.imageFillMode === ImageFillMode.Fit)) {
        return false
      } else {
        // the static src can support crop
        return true
      }
    } else {
      return false
    }
  }

  getSettingPanel (props: LayoutContextToolProps): React.ComponentClass<unknown> {
    return null
  }
}
