import { buildQueryCopyPayload } from '../src/setting/query-copy-utils'

const makeSourceQuery = (overrides: any = {}) => ({
  configId: 'src-config-1',
  outputDataSourceId: 'widget_63_output_src-config-1',
  name: 'Streams',
  useDataSource: { dataSourceId: 'ds_streams', mainDataSourceId: 'ds_streams', rootDataSourceId: 'dataSource_1' },
  resultFieldsType: 'SelectAttributes',
  ...overrides
})

const baseParams = (overrides: any = {}) => ({
  sourceQuery: makeSourceQuery(),
  sourceIndex: 0,
  targetWidgetId: 'widget_66',
  targetQueryItems: [],
  targetUseDataSources: [],
  sourceOutputDs: null,
  newConfigId: 'new-123',
  ...overrides
})

describe('buildQueryCopyPayload', () => {
  it('regenerates configId and outputDataSourceId on the target prefix', () => {
    const { copiedQuery } = buildQueryCopyPayload(baseParams())
    expect(copiedQuery.configId).toBe('new-123')
    expect(copiedQuery.outputDataSourceId).toBe('widget_66_output_new-123')
  })

  it('carries over the rest of the query verbatim', () => {
    const { copiedQuery } = buildQueryCopyPayload(baseParams())
    expect(copiedQuery.name).toBe('Streams')
    expect(copiedQuery.resultFieldsType).toBe('SelectAttributes')
    expect(copiedQuery.useDataSource.dataSourceId).toBe('ds_streams')
  })

  it('appends _copy to searchAlias and shortId when present', () => {
    const { copiedQuery } = buildQueryCopyPayload(baseParams({
      sourceQuery: makeSourceQuery({ searchAlias: 'By name', shortId: 'STREAMS' })
    }))
    expect(copiedQuery.searchAlias).toBe('By name_copy')
    expect(copiedQuery.shortId).toBe('STREAMS_copy')
  })

  it('leaves searchAlias and shortId undefined when the source has none', () => {
    const { copiedQuery } = buildQueryCopyPayload(baseParams())
    expect(copiedQuery.searchAlias).toBeUndefined()
    expect(copiedQuery.shortId).toBeUndefined()
  })

  it('inserts the copied query at the same index in the target', () => {
    const targetQueryItems = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
    const { newQueryItems } = buildQueryCopyPayload(baseParams({ sourceIndex: 1, targetQueryItems }))
    expect(newQueryItems.map((q: any) => q.name)).toEqual(['A', 'Streams', 'B', 'C'])
    expect(newQueryItems).toHaveLength(4)
  })

  it('clamps the insert index to the target length', () => {
    const targetQueryItems = [{ name: 'A' }]
    const { newQueryItems } = buildQueryCopyPayload(baseParams({ sourceIndex: 5, targetQueryItems }))
    expect(newQueryItems.map((q: any) => q.name)).toEqual(['A', 'Streams'])
  })

  it('does not mutate the caller-supplied target arrays', () => {
    const targetQueryItems = [{ name: 'A' }]
    const targetUseDataSources = [{ dataSourceId: 'other' }]
    buildQueryCopyPayload(baseParams({ targetQueryItems, targetUseDataSources }))
    expect(targetQueryItems).toHaveLength(1)
    expect(targetUseDataSources).toHaveLength(1)
  })

  it('clones the output DS with the new id, preserving other fields', () => {
    const sourceOutputDs = { id: 'widget_63_output_src-config-1', label: 'Streams result', type: 'FEATURE_LAYER', url: 'https://x/0' }
    const { clonedOutputDs } = buildQueryCopyPayload(baseParams({ sourceOutputDs }))
    expect(clonedOutputDs.id).toBe('widget_66_output_new-123')
    expect(clonedOutputDs.label).toBe('Streams result')
    expect(clonedOutputDs.type).toBe('FEATURE_LAYER')
    expect(clonedOutputDs.url).toBe('https://x/0')
  })

  it('returns null clonedOutputDs when the source output DS is absent', () => {
    const { clonedOutputDs } = buildQueryCopyPayload(baseParams({ sourceOutputDs: null }))
    expect(clonedOutputDs).toBeNull()
  })

  it('adds the source layer to the target useDataSources when missing', () => {
    const { newUseDataSources } = buildQueryCopyPayload(baseParams({
      targetUseDataSources: [{ dataSourceId: 'other_layer' }]
    }))
    expect(newUseDataSources.map((u: any) => u.dataSourceId)).toEqual(['other_layer', 'ds_streams'])
  })

  it('does not duplicate the source layer when the target already uses it', () => {
    const { newUseDataSources } = buildQueryCopyPayload(baseParams({
      targetUseDataSources: [{ dataSourceId: 'ds_streams' }]
    }))
    expect(newUseDataSources).toHaveLength(1)
    expect(newUseDataSources[0].dataSourceId).toBe('ds_streams')
  })
})
