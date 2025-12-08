import { Immutable } from 'jimu-core'
import SelectAppConfigOperation from '../src/tools/app-config-operations'

describe('copy select widget', () => {
  it('should update jimuMapViewId and jimuLayerViewId after copy select widget', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          id: 'widget_1',
          uri: 'widgets/arcgis/arcgis-map/',
          label: 'Map'
        },
        widget_2: {
          id: 'widget_2',
          uri: 'widgets/common/select/',
          label: 'Select',
        },
        widget_3: {
          id: 'widget_3',
          uri: 'widgets/arcgis/arcgis-map/',
          label: 'Map'
        },
        widget_4: {
          id: 'widget_4',
          uri: 'widgets/common/select/',
          label: 'Select',
          config: {
            useMap: true,
            dataAttributeInfo: { allowGenerated: false, dataSourceItems: [] },
            mapInfo: {
              'widget_1-dataSource_2': {
                syncWithMap: false,
                allowGenerated: true,
                enableAttributeSelection: false,
                dataSourceItems: [
                  {
                    uid: '352f7682-bc60-11ef-bd0a-41f3eff0724c',
                    sqlHint: '',
                    useDataSource: {
                      dataSourceId: 'dataSource_2-187acf6a678-layer-3',
                      mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
                      rootDataSourceId: 'dataSource_2',
                    },
                    sqlExpression: null,
                    jimuLayerViewId: 'widget_1-dataSource_2-187acf6a678-layer-3',
                  },
                  {
                    uid: '352f7683-bc60-11ef-bd0a-41f3eff0724c',
                    sqlHint: '',
                    useDataSource: {
                      dataSourceId: 'dataSource_2-187acf60284-layer-2',
                      mainDataSourceId: 'dataSource_2-187acf60284-layer-2',
                      rootDataSourceId: 'dataSource_2',
                    },
                    sqlExpression: null,
                    jimuLayerViewId: 'widget_1-dataSource_2-187acf60284-layer-2',
                  },
                ],
              },
            },
            interactiveTools: { tools: ['rectangle'], partiallyWithin: true },
            spatialSelection: {
              enable: false,
              useDataSources: [],
              relationships: ['Intersects'],
              buffer: { enable: false, distance: 0, unit: 'Meters' },
            },
          },
          useMapWidgetIds: ['widget_3'],
          useDataSources: [
            {
              dataSourceId: 'dataSource_2-187acf6a678-layer-3',
              mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
              rootDataSourceId: 'dataSource_2',
            },
            {
              dataSourceId: 'dataSource_2-187acf60284-layer-2',
              mainDataSourceId: 'dataSource_2-187acf60284-layer-2',
              rootDataSourceId: 'dataSource_2',
            },
          ],
        },
      }
    }) as any

    const mapAppConfigOperation = new SelectAppConfigOperation()
    const updatedAppConfig = mapAppConfigOperation.afterWidgetCopied(
      'widget_2',
      appConfig,
      'widget_4',
      appConfig,
      {
        widget_1: 'widget_3',
        widget_2: 'widget_4'
      }
    )

    expect(updatedAppConfig.widgets.widget_4.config).toEqual({
      useMap: true,
      dataAttributeInfo: { allowGenerated: false, dataSourceItems: [] },
      mapInfo: {
        // widget_1-dataSource_2 -> widget_3-dataSource_2
        'widget_3-dataSource_2': {
          syncWithMap: false,
          allowGenerated: true,
          enableAttributeSelection: false,
          dataSourceItems: [
            {
              uid: '352f7682-bc60-11ef-bd0a-41f3eff0724c',
              sqlHint: '',
              useDataSource: {
                dataSourceId: 'dataSource_2-187acf6a678-layer-3',
                mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
                rootDataSourceId: 'dataSource_2',
              },
              sqlExpression: null,
              // widget_1-dataSource_2-187acf6a678-layer-3 -> widget_3-dataSource_2-187acf6a678-layer-3
              jimuLayerViewId: 'widget_3-dataSource_2-187acf6a678-layer-3',
            },
            {
              uid: '352f7683-bc60-11ef-bd0a-41f3eff0724c',
              sqlHint: '',
              useDataSource: {
                dataSourceId: 'dataSource_2-187acf60284-layer-2',
                mainDataSourceId: 'dataSource_2-187acf60284-layer-2',
                rootDataSourceId: 'dataSource_2',
              },
              sqlExpression: null,
              // widget_1-dataSource_2-187acf60284-layer-2 -> widget_3-dataSource_2-187acf60284-layer-2
              jimuLayerViewId: 'widget_3-dataSource_2-187acf60284-layer-2',
            },
          ],
        },
      },
      interactiveTools: { tools: ['rectangle'], partiallyWithin: true },
      spatialSelection: {
        enable: false,
        useDataSources: [],
        relationships: ['Intersects'],
        buffer: { enable: false, distance: 0, unit: 'Meters' },
      },
    })
  })

  it('should update useDataSources of select config after copy select widget', () => {
    const appConfig = Immutable({
      widgets: {
        widget_1: {
          id: 'widget_1',
          uri: 'widgets/common/select/',
          label: 'Select',
        },
        widget_2: {
          id: 'widget_2',
          uri: 'widgets/arcgis/query/',
          label: 'Query',
          outputDataSources: [
            'widget_2_output_39514246002149145'
          ],
        },
        widget_3: {
          id: 'widget_3',
          uri: 'widgets/common/select/',
          label: 'Select',
          config: {
            useMap: false,
            dataAttributeInfo: {
              allowGenerated: false,
              dataSourceItems: [
                {
                  uid: 'f0150b40-bcdd-11ef-8b34-0972d110b84c',
                  sqlHint: '',
                  useDataSource: {
                    dataSourceId: 'widget_2_output_39514246002149145-output',
                    mainDataSourceId: 'widget_2_output_39514246002149145',
                    dataViewId: 'output'
                  }
                },
                {
                  uid: '98e6aa30-bcde-11ef-8b34-0972d110b84c',
                  sqlHint: '',
                  useDataSource: {
                    dataSourceId: 'dataSource_2-187acf6a678-layer-3',
                    mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
                    rootDataSourceId: 'dataSource_2'
                  }
                }
              ]
            },
            mapInfo: {},
            interactiveTools: {
              tools: [
                'rectangle'
              ],
              partiallyWithin: true
            },
            spatialSelection: {
              enable: true,
              useDataSources: [
                {
                  dataSourceId: 'widget_2_output_39514246002149145-output',
                  mainDataSourceId: 'widget_2_output_39514246002149145',
                  dataViewId: 'output'
                },
                {
                  dataSourceId: 'dataSource_2-187acf6a678-layer-3-selection',
                  mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
                  rootDataSourceId: 'dataSource_2',
                  dataViewId: 'selection'
                }
              ],
              relationships: [
                'Intersects'
              ],
              buffer: {
                enable: false,
                distance: 0,
                unit: 'Meters'
              }
            }
          },
          useDataSources: [
            {
              dataSourceId: 'widget_4_output_39514246002149145-output',
              mainDataSourceId: 'widget_4_output_39514246002149145',
              dataViewId: 'output'
            },
            {
              dataSourceId: 'dataSource_2-187acf6a678-layer-3',
              mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
              rootDataSourceId: 'dataSource_2'
            },
            {
              dataSourceId: 'dataSource_2-187acf6a678-layer-3-selection',
              mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
              rootDataSourceId: 'dataSource_2',
              dataViewId: 'selection'
            }
          ]
        },
        widget_4: {
          id: 'widget_4',
          uri: 'widgets/arcgis/query/',
          label: 'Query',
          outputDataSources: [
            'widget_4_output_39514246002149145'
          ],
        },
      }
    }) as any

    const mapAppConfigOperation = new SelectAppConfigOperation()
    const updatedAppConfig = mapAppConfigOperation.afterWidgetCopied(
      'widget_1',
      appConfig,
      'widget_3',
      appConfig,
      {
        widget_1: 'widget_3',
        widget_2: 'widget_4',
        widget_2_output_39514246002149145: 'widget_4_output_39514246002149145'
      }
    )

    expect(updatedAppConfig.widgets.widget_3.config).toEqual({
      useMap: false,
      dataAttributeInfo: {
        allowGenerated: false,
        dataSourceItems: [
          {
            uid: 'f0150b40-bcdd-11ef-8b34-0972d110b84c',
            sqlHint: '',
            useDataSource: {
              // widget_2_output_39514246002149145-output -> widget_4_output_39514246002149145-output
              dataSourceId: 'widget_4_output_39514246002149145-output',
              // widget_2_output_39514246002149145 -> widget_4_output_39514246002149145
              mainDataSourceId: 'widget_4_output_39514246002149145',
              dataViewId: 'output'
            }
          },
          {
            uid: '98e6aa30-bcde-11ef-8b34-0972d110b84c',
            sqlHint: '',
            useDataSource: {
              dataSourceId: 'dataSource_2-187acf6a678-layer-3',
              mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
              rootDataSourceId: 'dataSource_2'
            }
          }
        ]
      },
      mapInfo: {},
      interactiveTools: {
        tools: [
          'rectangle'
        ],
        partiallyWithin: true
      },
      spatialSelection: {
        enable: true,
        useDataSources: [
          {
            // widget_2_output_39514246002149145-output -> widget_4_output_39514246002149145-output
            dataSourceId: 'widget_4_output_39514246002149145-output',
            // widget_2_output_39514246002149145 -> widget_4_output_39514246002149145
            mainDataSourceId: 'widget_4_output_39514246002149145',
            dataViewId: 'output'
          },
          {
            dataSourceId: 'dataSource_2-187acf6a678-layer-3-selection',
            mainDataSourceId: 'dataSource_2-187acf6a678-layer-3',
            rootDataSourceId: 'dataSource_2',
            dataViewId: 'selection'
          }
        ],
        relationships: [
          'Intersects'
        ],
        buffer: {
          enable: false,
          distance: 0,
          unit: 'Meters'
        }
      }
    })
  })
})
