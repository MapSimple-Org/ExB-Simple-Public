import { MutableStoreManager, type extensionSpec, type IMAppConfig } from 'jimu-core'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'basemap-gallery-app-config-operation'
  widgetId: string
  /**
   * Do some cleanup operations before current widget is removed.
   * @returns The updated appConfig
   */
  widgetWillRemove (appConfig: IMAppConfig): IMAppConfig {
    const arcgisBasemapGalleryElement: HTMLArcgisBasemapGalleryElement = MutableStoreManager.getInstance().readStateValue(this.widgetId, 'cachedArcgisBasemapGalleryElement')
    if (arcgisBasemapGalleryElement) {
      arcgisBasemapGalleryElement.destroy()
    }
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'cachedOrgBasemaps', null)
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'cachedOriginalBasemaps', null)
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'cachedArcgisBasemapGalleryElement', null)
    return appConfig
  }
}
