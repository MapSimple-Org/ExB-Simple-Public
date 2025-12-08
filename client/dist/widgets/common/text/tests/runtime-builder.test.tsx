import * as builderUtils from '../src/runtime/builder/utils'
import { Immutable } from 'jimu-core'

jest.mock('jimu-core', () => {
  return {
    ...jest.requireActual('jimu-core'),
    DataSourceManager: {
      getInstance: jest.fn().mockReturnValue({
        getDataSource: (dsid) => {
          return {
            id: dsid
          }
        }
      })
    }
  }
})

describe('utils test', function () {
  it('test:getUseDataSourceIds', () => {
    const html = `<p> ddd<exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp>
    * <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>`
    expect(builderUtils.getUseDataSourceIds(html)).toEqual(['ds_1', 'ds_2'])
  })

  it('test:getInvalidDataSourceIds', () => {
    const html = `<p> ddd<exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp>
    * <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>`

    const useDataSources: any = Immutable([{
      dataSourceId: 'ds_1',
      mainDataSourceId: 'ds_1',
      fields: ['a']
    }])
    expect(builderUtils.getInvalidDataSourceIds(html, useDataSources)).toEqual(['ds_2'])
  })

  it('test:getExpressionParts', () => {
    const expressions = Immutable({
      exp1: {
        parts: [1]
      },
      exp2: {
        parts: [2]
      }
    }) as any
    expect(builderUtils.getExpressionParts(expressions)).toEqual([1, 2] as any)
  })

  it('usePlaceholder', () => {
    expect(builderUtils.shouldShowPlaceholder('', 'foo')).toBeTruthy()
    expect(builderUtils.shouldShowPlaceholder('foo', 'bar')).toBeFalsy()
    expect(builderUtils.shouldShowPlaceholder('', 'foo', false)).toBeTruthy()
    expect(builderUtils.shouldShowPlaceholder('', 'foo', true)).toBeFalsy()
  })

  it('useDefaultValue', () => {
    expect(builderUtils.getDefaultValue(true, '', '<strong>foo</strong>')).toBe('<strong>\uFEFF</strong>')
    expect(builderUtils.getDefaultValue(false, '', '<strong>foo</strong>')).toBe('<strong>foo</strong>')

    expect(builderUtils.getDefaultValue(true, 'foo', '<strong>foo</strong>')).toBe('foo')
    expect(builderUtils.getDefaultValue(false, 'foo', '<strong>foo</strong>')).toBe('foo')
  })
})
