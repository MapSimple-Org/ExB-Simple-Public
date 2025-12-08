import AppConfigOperation from '../src/tools/app-config-operations'
import { type IMAppConfig, Immutable } from 'jimu-core'

describe('AppConfigOperation - useDataSourceWillChange', () => {
  let appConfigOperation: AppConfigOperation

  beforeEach(() => {
    appConfigOperation = new AppConfigOperation()
    appConfigOperation.widgetId = 'widget_1'
  })

  it('removes layersConfig items with matching useDataSource', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          config: {
            layersConfig: [
              { id: 'layer_1', useDataSource: { dataSourceId: 'ds_1', rootDataSourceId: 'root_1' } },
              { id: 'layer_2', useDataSource: { dataSourceId: 'ds_2', rootDataSourceId: 'root_2' } }
            ],
            mapViewsConfig: {}
          }
        }
      }
    }) as unknown as IMAppConfig

    const updated = appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')
    expect(updated.widgets.widget_1.config.layersConfig.length).toBe(1)
    expect(updated.widgets.widget_1.config.layersConfig[0].id).toBe('layer_2')
  })

  it('removes layersConfig from mapViewsConfig when useDataSource matches', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          config: {
            layersConfig: [],
            mapViewsConfig: {
              mapView_1: {
                layersConfig: [
                  { id: 'mv_layer_1', useDataSource: { dataSourceId: 'ds_1', rootDataSourceId: 'root_1' } },
                  { id: 'mv_layer_2', useDataSource: { dataSourceId: 'ds_2', rootDataSourceId: 'root_2' } }
                ],
                customJimuLayerViewIds: Immutable([])
              }
            }
          }
        }
      }
    }) as unknown as IMAppConfig

    const updated = appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')
    expect(updated.widgets.widget_1.config.mapViewsConfig.mapView_1.layersConfig.length).toBe(1)
    expect(updated.widgets.widget_1.config.mapViewsConfig.mapView_1.layersConfig[0].id).toBe('mv_layer_2')
  })

  it('does not change appConfig if no useDataSource matches', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          config: {
            layersConfig: [
              { id: 'layer_2', useDataSource: { dataSourceId: 'ds_2', rootDataSourceId: 'root_2' } }
            ],
            mapViewsConfig: {}
          }
        }
      }
    }) as unknown as IMAppConfig

    const updated = appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')
    expect(updated).toEqual(appConfig)
  })

  it('removes all useDataSources and layersConfig if all match', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          useDataSources: [
            { dataSourceId: 'ds_1', rootDataSourceId: 'root_1' }
          ],
          config: {
            layersConfig: [
              { id: 'layer_1', useDataSource: { dataSourceId: 'ds_1', rootDataSourceId: 'root_1' } }
            ],
            mapViewsConfig: {}
          }
        }
      }
    }) as unknown as IMAppConfig

    const updated = appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')
    expect(updated.widgets.widget_1.config.layersConfig.length).toBe(0)
  })

  it('handles empty useDataSources and layersConfig gracefully', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          useDataSources: [],
          config: {
            layersConfig: [],
            mapViewsConfig: {}
          }
        }
      }
    }) as unknown as IMAppConfig

    const updated = appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')
    expect(updated).toEqual(appConfig)
  })

  it('removes multiple layers from mapViewsConfig if multiple match', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          config: {
            layersConfig: [],
            mapViewsConfig: {
              mapView_1: {
                layersConfig: [
                  { id: 'mv_layer_1', useDataSource: { dataSourceId: 'ds_1', rootDataSourceId: 'root_1' } },
                  { id: 'mv_layer_2', useDataSource: { dataSourceId: 'ds_1', rootDataSourceId: 'root_1' } },
                  { id: 'mv_layer_3', useDataSource: { dataSourceId: 'ds_2', rootDataSourceId: 'root_2' } }
                ],
                customJimuLayerViewIds: Immutable([])
              }
            }
          }
        }
      }
    }) as unknown as IMAppConfig

    const updated = appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')
    expect(updated.widgets.widget_1.config.mapViewsConfig.mapView_1.layersConfig.length).toBe(1)
    expect(updated.widgets.widget_1.config.mapViewsConfig.mapView_1.layersConfig[0].id).toBe('mv_layer_3')
  })

  it('does not throw if mapViewsConfig is undefined', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          useDataSources: [],
          config: {
            layersConfig: []
            // mapViewsConfig is undefined
          }
        }
      }
    }) as unknown as IMAppConfig

    expect(() => appConfigOperation.useDataSourceWillChange(appConfig, 'ds_1')).not.toThrow()
  })
})