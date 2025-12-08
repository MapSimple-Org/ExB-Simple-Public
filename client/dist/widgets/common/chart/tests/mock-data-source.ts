import {
  mockFeatureLayer,
  type MockFeatureLayerData,
  initGlobal,
  mockSystemJs,
  getInitState
} from 'jimu-for-test'
import {
  ExtensionManager,
  DataSourceTypes,
  getAppStore,
  appActions,
  extensionSpec
} from 'jimu-core'
import { JimuCoreDataSourceFactoryUriExtension } from 'jimu-core/lib/extensions/data-source-extension'
import { SimpleFeatureService as DefaultFeatureService } from './simple-feature-service'

export const mockDataSource = (
  SimpleFeatureService = DefaultFeatureService,
  dataSourceId: string = 'ds1'
): void => {
  mockFeatureLayer(SimpleFeatureService as MockFeatureLayerData)

  ExtensionManager.getInstance().registerExtension({
    epName: extensionSpec.ExtensionPoints.DataSourceFactoryUri,
    extension: new JimuCoreDataSourceFactoryUriExtension()
  })

  initGlobal()

  mockSystemJs()

  const state = getInitState().merge(
    {
      appConfig: {
        dataSources: {
          [dataSourceId]: {
            id: dataSourceId,
            type: DataSourceTypes.FeatureLayer,
            url: SimpleFeatureService.url
          } as any
        }
      }
    },
    { deep: true }
  )

  getAppStore().dispatch(appActions.updateStoreState(state))
}
