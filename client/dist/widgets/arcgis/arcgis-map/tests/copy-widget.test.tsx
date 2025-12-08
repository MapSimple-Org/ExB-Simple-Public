import { Immutable } from 'jimu-core'
import MapAppConfigOperation from '../src/tools/app-config-operations'

describe('copy widget with map message actions', () => {

  describe('copy widget with map zoom-to/pan-to message actions', () => {
    function createAppConfig(messageActionType: 'zoomToFeature' | 'panTo') {
      const appConfig = Immutable({
        widgets: {
          widget_1: {
            uri: 'widgets/arcgis/arcgis-map/',
            label: 'Map',
            id: 'widget_1'
          },
          widget_2: {
            uri: 'widgets/arcgis/query/',
            label: 'Query',
            id: 'widget_2',
            outputDataSources: [
              'widget_2_output_8341658269725258'
            ],
            useDataSources: [
              {
                dataSourceId: 'dataSource_1-187938b7328-layer-2',
                mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
                rootDataSourceId: 'dataSource_1',
                fields: [ ],
                useFieldsInPopupInfo: true
              }
            ],
          },
          widget_3: {
            id: 'widget_3'
          },
          widget_4: {
            id: 'widget_4'
          }
        },
        messageConfigs: {
          messageConfig_1: {
            id: 'messageConfig_1',
            widgetId: 'widget_2',
            messageType: 'DATA_RECORDS_SELECTION_CHANGE',
            actions: [
              {
                actionId: `widget_1-${messageActionType}-1734076380494`,
                widgetId: 'widget_1',
                messageWidgetId: 'widget_2',
                actionName: messageActionType,
                description: null,
                config: {
                  useDataSource: {
                    dataSourceId: 'widget_2_output_8341658269725258',
                    mainDataSourceId: 'widget_2_output_8341658269725258',
                    rootDataSourceId: null
                  },
                  useDataSources: [
                    {
                      dataSourceId: 'widget_2_output_8341658269725258',
                      mainDataSourceId: 'widget_2_output_8341658269725258',
                      rootDataSourceId: null
                    }
                  ],
                  goToInitialMapExtentWhenSelectionCleared: false,
                  useAnyTriggerData: false
                },
                useDataSources: [
                  {
                    dataSourceId: 'widget_2_output_8341658269725258',
                    mainDataSourceId: 'widget_2_output_8341658269725258',
                    rootDataSourceId: null
                  }
                ]
              }
            ],
          },
          // messageConfig_2 is the copied message action
          messageConfig_2: {
            id: 'messageConfig_2',
            widgetId: 'widget_4',
            messageType: 'DATA_RECORDS_SELECTION_CHANGE',
            actions: [
              {
                actionId: `widget_3-${messageActionType}-1734076380494`,
                widgetId: 'widget_3',
                messageWidgetId: 'widget_4',
                actionName: messageActionType,
                description: null,
                config: {
                  useDataSource: {
                    dataSourceId: 'widget_2_output_8341658269725258',
                    mainDataSourceId: 'widget_2_output_8341658269725258',
                    rootDataSourceId: null
                  },
                  useDataSources: [
                    {
                      dataSourceId: 'widget_2_output_8341658269725258',
                      mainDataSourceId: 'widget_2_output_8341658269725258',
                      rootDataSourceId: null
                    }
                  ],
                  goToInitialMapExtentWhenSelectionCleared: false,
                  useAnyTriggerData: false
                },
                useDataSources: [
                  {
                    dataSourceId: 'widget_4_output_8341658269725258',
                    mainDataSourceId: 'widget_4_output_8341658269725258',
                    rootDataSourceId: null
                  }
                ]
              }
            ],
          },
        }
      }) as any

      return appConfig
    }

    ['zoomToFeature', 'panTo'].forEach((messageActionType) => {
      it(`should replace useDataSources for ${messageActionType} message action config`, () => {
        const appConfig = createAppConfig(messageActionType as any)
        const mapAppConfigOperation = new MapAppConfigOperation()
        const updatedAppConfig = mapAppConfigOperation.afterWidgetCopied('widget_1', appConfig, 'widget_3', appConfig, {
          'widget_1': 'widget_3',
          'widget_2': 'widget_4',
          'widget_2_output_8341658269725258': 'widget_4_output_8341658269725258'
        })

        const messageConfig = updatedAppConfig.messageConfigs.messageConfig_2
        expect(messageConfig.actions[0].config.useDataSource).toEqual({
          dataSourceId: 'widget_4_output_8341658269725258',
          mainDataSourceId: 'widget_4_output_8341658269725258',
          rootDataSourceId: null
        })

        expect(messageConfig.actions[0].config.useDataSources[0]).toEqual({
          dataSourceId: 'widget_4_output_8341658269725258',
          mainDataSourceId: 'widget_4_output_8341658269725258',
          rootDataSourceId: null
        })
      })
    })
  })

  describe('copy widget with map filter/flash message actions', () => {
    function createAppConfig(messageActionType: 'filter' | 'flash') {
      const appConfig = Immutable({
        widgets: {
          widget_1: {
            uri: 'widgets/arcgis/arcgis-map/',
            label: 'Map',
            id: 'widget_1'
          },
          widget_2: {
            uri: 'widgets/arcgis/query/',
            label: 'Query',
            id: 'widget_2',
            outputDataSources: [
              'widget_2_output_8341658269725258'
            ],
            useDataSources: [
              {
                dataSourceId: 'dataSource_1-187938b7328-layer-2',
                mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
                rootDataSourceId: 'dataSource_1',
                fields: [ ],
                useFieldsInPopupInfo: true
              }
            ],
          },
          widget_3: {
            id: 'widget_3'
          },
          widget_4: {
            id: 'widget_4'
          }
        },
        messageConfigs: {
          messageConfig_1: {
            id: 'messageConfig_1',
            widgetId: 'widget_2',
            messageType: 'DATA_RECORDS_SELECTION_CHANGE',
            actions: [
              {
                actionId: `widget_1-${messageActionType}-1734319229806`,
                widgetId: 'widget_1',
                messageWidgetId: 'widget_2',
                actionName: messageActionType,
                description: null,
                config: {
                  useAnyTriggerData: false,
                  messageUseDataSource: {
                    dataSourceId: 'widget_2_output_8341658269725258',
                    mainDataSourceId: 'widget_2_output_8341658269725258',
                    rootDataSourceId: null,
                    fields: [
                      'OBJECTID'
                    ]
                  },
                  actionUseDataSource: {
                    dataSourceId: 'dataSource_1-187938b7328-layer-2',
                    mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
                    rootDataSourceId: 'dataSource_1',
                    fields: [
                      'OBJECTID'
                    ]
                  },
                  sqlExprObj: null,
                  enabledDataRelationShip: true,
                  connectionType: 'SET_CUSTOM_FIELDS'
                },
                useDataSources: [
                  {
                    dataSourceId: 'widget_2_output_8341658269725258',
                    mainDataSourceId: 'widget_2_output_8341658269725258',
                    rootDataSourceId: null,
                    fields: [
                      'OBJECTID'
                    ]
                  },
                  {
                    dataSourceId: 'dataSource_1-187938b7328-layer-2',
                    mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
                    rootDataSourceId: 'dataSource_1',
                    fields: [
                      'OBJECTID'
                    ]
                  }
                ]
              }
            ],
          },
          // messageConfig_2 is the copied message action
          messageConfig_2: {
            id: 'messageConfig_2',
            widgetId: 'widget_4',
            messageType: 'DATA_RECORDS_SELECTION_CHANGE',
            actions: [
              {
                actionId: `widget_3-${messageActionType}-1734319229806`,
                widgetId: 'widget_3',
                messageWidgetId: 'widget_4',
                actionName: messageActionType,
                description: null,
                config: {
                  useAnyTriggerData: false,
                  messageUseDataSource: {
                    dataSourceId: 'widget_2_output_8341658269725258',
                    mainDataSourceId: 'widget_2_output_8341658269725258',
                    rootDataSourceId: null,
                    fields: [
                      'OBJECTID'
                    ]
                  },
                  actionUseDataSource: {
                    dataSourceId: 'dataSource_1-187938b7328-layer-2',
                    mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
                    rootDataSourceId: 'dataSource_1',
                    fields: [
                      'OBJECTID'
                    ]
                  },
                  sqlExprObj: null,
                  enabledDataRelationShip: true,
                  connectionType: 'SET_CUSTOM_FIELDS'
                },
                useDataSources: [
                  {
                    dataSourceId: 'widget_4_output_8341658269725258',
                    mainDataSourceId: 'widget_4_output_8341658269725258',
                    rootDataSourceId: null,
                    fields: [
                      'OBJECTID'
                    ]
                  },
                  {
                    dataSourceId: 'dataSource_1-187938b7328-layer-2',
                    mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
                    rootDataSourceId: 'dataSource_1',
                    fields: [
                      'OBJECTID'
                    ]
                  }
                ]
              }
            ],
          },
        }
      }) as any

      return appConfig
    }

    ['filter', 'flash'].forEach((messageActionType) => {
      it(`should replace useDataSources for ${messageActionType} message action config`, () => {
        const appConfig = createAppConfig(messageActionType as any)
        const mapAppConfigOperation = new MapAppConfigOperation()
        const updatedAppConfig = mapAppConfigOperation.afterWidgetCopied('widget_1', appConfig, 'widget_3', appConfig, {
          'widget_1': 'widget_3',
          'widget_2': 'widget_4',
          'widget_2_output_8341658269725258': 'widget_4_output_8341658269725258'
        })

        const messageConfig = updatedAppConfig.messageConfigs.messageConfig_2
        expect(messageConfig.actions[0].config.messageUseDataSource).toEqual({
          dataSourceId: 'widget_4_output_8341658269725258',
          mainDataSourceId: 'widget_4_output_8341658269725258',
          rootDataSourceId: null,
          fields: [
            'OBJECTID'
          ]
        })

        expect(messageConfig.actions[0].config.actionUseDataSource).toEqual({
          dataSourceId: 'dataSource_1-187938b7328-layer-2',
          mainDataSourceId: 'dataSource_1-187938b7328-layer-2',
          rootDataSourceId: 'dataSource_1',
          fields: [
            'OBJECTID'
          ]
        })
      })
    })
  })
})
