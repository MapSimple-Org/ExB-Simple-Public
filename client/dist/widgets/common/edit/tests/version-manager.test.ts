import { Immutable, DataSourceManager } from 'jimu-core'
import { versionManager } from '../src/version-manager'
import { LayerHonorModeType } from '../src/config'

let upgrader = null

jest.mock('jimu-core', () => {
  return {
    ...jest.requireActual('jimu-core')
  }
})

describe('Test Edit version-manager for version 1.7.0', () => {
  let mockFn = null
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.7.0'
    })[0]?.upgrader
    mockFn = jest.fn().mockImplementation(async useDataSource => {
      return await Promise.resolve({
        getLayerDefinition: () => ({
          fields: {
            field1: {
              name: 'field1',
              alias: 'Field1',
              editable: false
            },
            field2: {
              name: 'field2',
              alias: 'Field2',
              editable: true
            }
          }
        })
      })
    })
    DataSourceManager.getInstance().createDataSourceByUseDataSource = mockFn
  })

  it('should return new config', async () => {
    const oldConfig = Immutable({
      description: '',
      editMode: 'ATTRIBUTE',
      layersConfig: [{
        id: 'dataSource_1-allFields_5838',
        name: 'allFields',
        addRecords: false,
        deleteRecords: false,
        featureSnapping: false,
        updateGeometries: true,
        groupedFields: [],
        showFields: [],
        useDataSource: {
          dataSourceId: 'dataSource_1-allFields_5838',
          mainDataSourceId: 'dataSource_1-allFields_5838',
          rootDataSourceId: 'dataSource_1'
        }
      }],
      noDataMessage: ''
    })
    const newConfig = await upgrader(oldConfig)
    expect(newConfig.layersConfig[0].layerHonorMode).toBe(LayerHonorModeType.Custom)
  })
})
