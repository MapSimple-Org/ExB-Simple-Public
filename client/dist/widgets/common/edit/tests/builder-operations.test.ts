import { Immutable } from 'jimu-core'
import { LayerHonorModeType } from '../src/config'
import { getKeysInLayersConfig } from '../src/tools/builder-operations'

describe('getKeysInLayersConfig', () => {
  it('returns empty array when layersConfig is empty', () => {
    const result = getKeysInLayersConfig(Immutable([]), 'widgets.test.config')
    expect(result).toEqual([])
  })

  it('returns empty array when layerHonorMode is not Custom', () => {
    const layersConfig = Immutable([
      {
        layerHonorMode: LayerHonorModeType.Webmap,
        groupedFields: [],
        name: 'Layer1'
      }
    ] as any)
    const result = getKeysInLayersConfig(layersConfig, 'widgets.test.config')
    expect(result).toEqual([])
  })

  it('returns empty array when groupedFields is empty', () => {
    const layersConfig = Immutable([
      {
        layerHonorMode: LayerHonorModeType.Custom,
        groupedFields: [],
        name: 'Layer1'
      }
    ] as any)
    const result = getKeysInLayersConfig(layersConfig, 'widgets.test.config')
    expect(result).toEqual([])
  })

  it('returns keys for layer name and groupedFields with groupKey and subDescription', () => {
    const layersConfig = Immutable([
      {
        layerHonorMode: LayerHonorModeType.Custom,
        groupedFields: [
          {
            groupKey: 'group1',
            alias: 'GroupAlias',
            name: 'GroupName',
            children: [
              {
                subDescription: 'Child description',
                alias: 'ChildAlias',
                name: 'ChildName',
                groupKey: undefined,
                children: []
              }
            ],
            subDescription: 'Group description'
          }
        ],
        name: 'Layer1'
      }
    ] as any)
    const result = getKeysInLayersConfig(layersConfig, 'widgets.test.config', true)
    expect(result.length).toBe(4)
    expect(result[0].key).toBe('widgets.test.config.layersConfig[0].name')
    expect(result[1].key).toBe('widgets.test.config.layersConfig[0].groupedFields[0].alias')
    expect(result[2].key).toBe('widgets.test.config.layersConfig[0].groupedFields[0].children[0].subDescription')
    expect(result[3].key).toBe('widgets.test.config.layersConfig[0].groupedFields[0].subDescription')
  })

  it('returns key for groupedFields with only subDescription', () => {
    const layersConfig = Immutable([
      {
        layerHonorMode: LayerHonorModeType.Custom,
        groupedFields: [
          {
            groupKey: undefined,
            alias: 'FieldAlias',
            name: 'FieldName',
            children: [],
            subDescription: 'Field description'
          }
        ],
        name: 'Layer2'
      }
    ] as any)
    const result = getKeysInLayersConfig(layersConfig, 'widgets.test.config', true)
    expect(result.length).toBe(2)
    expect(result[0].key).toBe('widgets.test.config.layersConfig[0].name')
    expect(result[1].key).toBe('widgets.test.config.layersConfig[0].groupedFields[0].subDescription')
  })
})