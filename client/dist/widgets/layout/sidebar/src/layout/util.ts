import { type IMAppConfig, LayoutItemType } from 'jimu-core'

// find the sidebar that has same content and used in other size mode
export function findSyncedSidebar (appConfig: IMAppConfig, widgetId: string): string[] {
  const mainSizeMode = appConfig.mainSizeMode
  const result = []

  // 1. collect all widgets in sidebar
  const widgetsInSidebar = collectWidgetsInSidebar(appConfig, widgetId)

  // 2. find sidebars in other size mode
  const otherSideBar: { [key: string]: string[] } = {}
  Object.keys(appConfig.widgets).forEach((id) => {
    const widgetJson = appConfig.widgets[id]
    if (widgetJson.manifest.name === 'sidebar' && id !== widgetId) {
      const layoutNames = Object.keys(widgetJson.layouts)
      const sizeMode = Object.keys(widgetJson.layouts[layoutNames[0]])[0]
      if (sizeMode !== mainSizeMode) {
        if (!otherSideBar[sizeMode]) {
          otherSideBar[sizeMode] = [id]
        } else {
          otherSideBar[sizeMode].push(id)
        }
      }
    }
  })

  // 3. find the sidebar that has same content
  Object.keys(otherSideBar).forEach((sizeMode) => {
    const sidebarIds = otherSideBar[sizeMode]
    // if there is only one sidebar in other size mode, choose it directly
    if (sidebarIds.length === 1) {
      result.push(sidebarIds[0])
      return
    }
    sidebarIds.forEach((id) => {
      const widgetsInOtherSidebar = collectWidgetsInSidebar(appConfig, id)
      const hasSameContent = widgetsInSidebar.some((wid) => widgetsInOtherSidebar.includes(wid))
      if (hasSameContent) {
        result.push(id)
      }
    })
  })
  return result
}

function collectWidgetsInSidebar (appConfig: IMAppConfig, widgetId: string): string[] {
  const widgetJson = appConfig.widgets[widgetId]
  const widgetsInSidebar = []
  const layoutNames = Object.keys(widgetJson.layouts)
  const sizeMode = Object.keys(widgetJson.layouts[layoutNames[0]])[0]
  const layoutsInSidebar = layoutNames.map(name => widgetJson.layouts[name][sizeMode])

  layoutsInSidebar.forEach((layoutId) => {
    const layout = appConfig.layouts[layoutId]
    Object.keys(layout?.content ?? {}).forEach((layoutItemId) => {
      const layoutItem = layout.content[layoutItemId]
      if (layoutItem.type === LayoutItemType.Widget) {
        widgetsInSidebar.push(layoutItem.widgetId)
      } else if (layoutItem.type === LayoutItemType.Section) {
        widgetsInSidebar.push(layoutItem.sectionId)
      }
    })
  })
  return widgetsInSidebar
}
