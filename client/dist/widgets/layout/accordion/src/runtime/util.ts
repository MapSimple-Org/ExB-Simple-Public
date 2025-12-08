import { type IMAppConfig, LayoutParentType } from 'jimu-core'

export function isInController (layoutId: string, appConfig: IMAppConfig): boolean {
  const layoutJson = appConfig.layouts[layoutId]
  if (layoutJson.parent?.type === LayoutParentType.Widget) {
    const parentWidgetId = layoutJson.parent.id
    const parentWidgetJson = appConfig.widgets[parentWidgetId]
    return parentWidgetJson.uri === 'widgets/common/controller/'
  }
  return false
}
