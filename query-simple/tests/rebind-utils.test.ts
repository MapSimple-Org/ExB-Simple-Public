import {
  extractFieldReferences,
  analyzeRebinding,
  applyRebinding,
  replaceFieldTokensInTemplate,
  remapSqlExpression,
  buildIdentityFieldMap
} from '../src/setting/rebind-utils'
import type { QueryItemType } from '../src/config'
import type { SqlClause, SqlClauseSet } from 'jimu-core'

// ── Test fixtures ────────────────────────────────────────────────

function makeQueryItem (overrides: Partial<QueryItemType> = {}): QueryItemType {
  return {
    configId: 'test-001',
    useDataSource: {
      dataSourceId: 'ds-old-123',
      mainDataSourceId: 'ds-old-123',
      rootDataSourceId: 'ds-root-1',
      fields: ['PIN', 'ADDR']
    },
    outputDataSourceId: 'widget_1_output_test-001',
    resultTitleExpression: 'Parcel: {{PIN}}',
    resultContentExpression: '**Address:** {{ADDR}}\n**Parcel:** {{PIN | upper}}',
    resultDisplayFields: ['PIN', 'ADDR', 'PROP_NAME'],
    sortOptions: [{ jimuFieldName: 'PIN', order: 'ASC' }],
    resultTitleFields: ['PIN'],
    sqlExprObj: {
      sql: "PIN = 'test'",
      logicalOperator: 'AND',
      parts: [
        { type: 'SINGLE', jimuFieldName: 'PIN', operator: 'STRING_OPERATOR_IS', valueOptions: { sourceType: 'USER_INPUT', inputEditor: 'TEXT_INPUT', value: [] }, displayType: 'USE_ASK_FOR_VALUE' }
      ]
    },
    ...overrides
  } as any
}

const newUseDataSource = {
  dataSourceId: 'ds-new-456',
  mainDataSourceId: 'ds-new-456',
  rootDataSourceId: 'ds-root-2'
}

// ── extractFieldReferences ───────────────────────────────────────

describe('extractFieldReferences', () => {
  it('should extract fields from useDataSource.fields', () => {
    const item = makeQueryItem({ resultTitleExpression: '', resultContentExpression: '', resultDisplayFields: [], sortOptions: [], resultTitleFields: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('PIN')
    expect(fields).toContain('ADDR')
  })

  it('should extract {{FIELD}} tokens from resultTitleExpression', () => {
    const item = makeQueryItem({ useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultContentExpression: '', resultDisplayFields: [], sortOptions: [], resultTitleFields: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('PIN')
  })

  it('should extract {{FIELD | filter}} tokens from resultContentExpression', () => {
    const item = makeQueryItem({ useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultTitleExpression: '', resultDisplayFields: [], sortOptions: [], resultTitleFields: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('ADDR')
    expect(fields).toContain('PIN')
  })

  it('should extract legacy {FIELD} tokens', () => {
    const item = makeQueryItem({ resultTitleExpression: 'Title: {LEGACY_FIELD}', useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultContentExpression: '', resultDisplayFields: [], sortOptions: [], resultTitleFields: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('LEGACY_FIELD')
  })

  it('should extract from resultDisplayFields', () => {
    const item = makeQueryItem({ useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultTitleExpression: '', resultContentExpression: '', sortOptions: [], resultTitleFields: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('PROP_NAME')
  })

  it('should extract from sortOptions', () => {
    const item = makeQueryItem({ useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultTitleExpression: '', resultContentExpression: '', resultDisplayFields: [], resultTitleFields: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('PIN')
  })

  it('should extract from resultTitleFields (legacy)', () => {
    const item = makeQueryItem({ useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultTitleExpression: '', resultContentExpression: '', resultDisplayFields: [], sortOptions: [], sqlExprObj: undefined })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('PIN')
  })

  it('should extract jimuFieldName from sqlExprObj parts', () => {
    const item = makeQueryItem({ useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] }, resultTitleExpression: '', resultContentExpression: '', resultDisplayFields: [], sortOptions: [], resultTitleFields: [] })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('PIN')
  })

  it('should extract from nested sqlExprObj parts (clauseSet)', () => {
    const item = makeQueryItem({
      useDataSource: { dataSourceId: 'ds', mainDataSourceId: 'ds', rootDataSourceId: 'ds', fields: [] },
      resultTitleExpression: '', resultContentExpression: '', resultDisplayFields: [], sortOptions: [], resultTitleFields: [],
      sqlExprObj: {
        sql: '', logicalOperator: 'AND',
        parts: [{
          type: 'SET', logicalOperator: 'OR',
          parts: [
            { type: 'SINGLE', jimuFieldName: 'NESTED_A', operator: 'STRING_OPERATOR_IS', valueOptions: { sourceType: 'USER_INPUT', inputEditor: 'TEXT_INPUT', value: [] }, displayType: 'NONE' },
            { type: 'SINGLE', jimuFieldName: 'NESTED_B', operator: 'STRING_OPERATOR_IS', valueOptions: { sourceType: 'USER_INPUT', inputEditor: 'TEXT_INPUT', value: [] }, displayType: 'NONE' }
          ]
        }]
      } as any
    })
    const fields = extractFieldReferences(item)
    expect(fields).toContain('NESTED_A')
    expect(fields).toContain('NESTED_B')
  })

  it('should return unique field names (no duplicates)', () => {
    const item = makeQueryItem() // PIN appears in multiple places
    const fields = extractFieldReferences(item)
    const pinCount = fields.filter(f => f === 'PIN').length
    expect(pinCount).toBe(1)
  })

  it('should handle null/undefined/empty inputs gracefully', () => {
    const item: QueryItemType = { configId: 'empty' } as any
    const fields = extractFieldReferences(item)
    expect(fields).toEqual([])
  })
})

// ── analyzeRebinding ─────────────────────────────────────────────

describe('analyzeRebinding', () => {
  it('should identify affected query items by dataSourceId', () => {
    const items = [
      makeQueryItem(),
      makeQueryItem({ useDataSource: { dataSourceId: 'ds-other', mainDataSourceId: 'ds-other', rootDataSourceId: 'ds-root-1', fields: [] } }),
      makeQueryItem()
    ]
    const result = analyzeRebinding('ds-old-123', new Set(['PIN', 'ADDR', 'PROP_NAME']), items)
    expect(result.affectedIndices).toEqual([0, 2])
  })

  it('should detect auto-heal eligible (all fields match)', () => {
    const items = [makeQueryItem()]
    const result = analyzeRebinding('ds-old-123', new Set(['PIN', 'ADDR', 'PROP_NAME']), items)
    expect(result.autoHealEligible).toBe(true)
    expect(result.unmatchedFields).toEqual([])
  })

  it('should detect partial match (some fields missing)', () => {
    const items = [makeQueryItem()]
    // New DS has PIN but not ADDR or PROP_NAME
    const result = analyzeRebinding('ds-old-123', new Set(['PIN']), items)
    expect(result.autoHealEligible).toBe(false)
    expect(result.unmatchedFields).toContain('ADDR')
    expect(result.unmatchedFields).toContain('PROP_NAME')
    expect(result.matchedFields).toContain('PIN')
  })

  it('should handle multiple queries sharing the same DS', () => {
    const items = [
      makeQueryItem({ resultDisplayFields: ['PIN', 'MAJOR'] }),
      makeQueryItem({ resultDisplayFields: ['PIN', 'PLAT'] })
    ]
    const result = analyzeRebinding('ds-old-123', new Set(['PIN']), items)
    expect(result.affectedIndices).toEqual([0, 1])
    expect(result.oldFieldNames).toContain('MAJOR')
    expect(result.oldFieldNames).toContain('PLAT')
  })

  it('should return empty results when no items match oldDsId', () => {
    const items = [makeQueryItem({ useDataSource: { dataSourceId: 'ds-other', mainDataSourceId: 'ds-other', rootDataSourceId: 'ds', fields: [] } })]
    const result = analyzeRebinding('ds-old-123', new Set(['PIN']), items)
    expect(result.affectedIndices).toEqual([])
    expect(result.oldFieldNames).toEqual([])
    expect(result.autoHealEligible).toBe(true) // No unmatched = eligible
  })
})

// ── replaceFieldTokensInTemplate ─────────────────────────────────

describe('replaceFieldTokensInTemplate', () => {
  it('should replace {{PIN}} with {{PARCEL_NUM}}', () => {
    const result = replaceFieldTokensInTemplate('Parcel: {{PIN}}', { PIN: 'PARCEL_NUM' })
    expect(result).toBe('Parcel: {{PARCEL_NUM}}')
  })

  it('should preserve filter chains: {{PIN | upper}} → {{PARCEL_NUM | upper}}', () => {
    const result = replaceFieldTokensInTemplate('{{PIN | upper}}', { PIN: 'PARCEL_NUM' })
    expect(result).toBe('{{PARCEL_NUM | upper}}')
  })

  it('should preserve complex filter chains', () => {
    const result = replaceFieldTokensInTemplate('{{DEPTH | /1000 | round:1 | suffix: km}}', { DEPTH: 'DEPTH_M' })
    expect(result).toBe('{{DEPTH_M | /1000 | round:1 | suffix: km}}')
  })

  it('should handle multiple different fields in one template', () => {
    const result = replaceFieldTokensInTemplate(
      '**{{ADDR}}** — Parcel {{PIN}}',
      { ADDR: 'ADDRESS', PIN: 'PARCEL_NUM' }
    )
    expect(result).toBe('**{{ADDRESS}}** — Parcel {{PARCEL_NUM}}')
  })

  it('should handle multiple occurrences of the same field', () => {
    const result = replaceFieldTokensInTemplate(
      '{{PIN}} is the parcel number ({{PIN}})',
      { PIN: 'PARCEL_NUM' }
    )
    expect(result).toBe('{{PARCEL_NUM}} is the parcel number ({{PARCEL_NUM}})')
  })

  it('should not replace fields not in the map', () => {
    const result = replaceFieldTokensInTemplate('{{PIN}} and {{OTHER}}', { PIN: 'PARCEL_NUM' })
    expect(result).toBe('{{PARCEL_NUM}} and {{OTHER}}')
  })

  it('should handle legacy {FIELD} syntax', () => {
    const result = replaceFieldTokensInTemplate('Parcel: {PIN}', { PIN: 'PARCEL_NUM' })
    expect(result).toBe('Parcel: {PARCEL_NUM}')
  })

  it('should not replace {{FIELD}} when targeting legacy {FIELD} — they are independent', () => {
    const result = replaceFieldTokensInTemplate('{{PIN}} and {ADDR}', { PIN: 'P', ADDR: 'A' })
    expect(result).toBe('{{P}} and {A}')
  })

  it('should return undefined for undefined input', () => {
    expect(replaceFieldTokensInTemplate(undefined, { PIN: 'X' })).toBeUndefined()
  })

  it('should return empty string for empty input', () => {
    expect(replaceFieldTokensInTemplate('', { PIN: 'X' })).toBe('')
  })

  it('should be case-sensitive', () => {
    const result = replaceFieldTokensInTemplate('{{pin}} and {{PIN}}', { PIN: 'PARCEL_NUM' })
    // Only PIN (uppercase) should be replaced, not pin
    expect(result).toBe('{{pin}} and {{PARCEL_NUM}}')
  })
})

// ── remapSqlExpression ───────────────────────────────────────────

describe('remapSqlExpression', () => {
  it('should remap jimuFieldName in simple parts', () => {
    const sqlExpr: any = {
      sql: "PIN = 'test'",
      logicalOperator: 'AND',
      parts: [
        { type: 'SINGLE', jimuFieldName: 'PIN', operator: 'STRING_OPERATOR_IS' }
      ]
    }
    const result = remapSqlExpression(sqlExpr, { PIN: 'PARCEL_NUM' })
    expect((result.parts[0] as SqlClause).jimuFieldName).toBe('PARCEL_NUM')
  })

  it('should remap in nested clauseSet parts', () => {
    const sqlExpr: any = {
      sql: '', logicalOperator: 'AND',
      parts: [{
        type: 'SET', logicalOperator: 'OR',
        parts: [
          { type: 'SINGLE', jimuFieldName: 'FIELD_A' },
          { type: 'SINGLE', jimuFieldName: 'FIELD_B' }
        ]
      }]
    }
    const result = remapSqlExpression(sqlExpr, { FIELD_A: 'NEW_A', FIELD_B: 'NEW_B' })
    expect(((result.parts[0] as SqlClauseSet).parts[0] as SqlClause).jimuFieldName).toBe('NEW_A')
    expect(((result.parts[0] as SqlClauseSet).parts[1] as SqlClause).jimuFieldName).toBe('NEW_B')
  })

  it('should clear sql and displaySQL strings', () => {
    const sqlExpr: any = {
      sql: "PIN = 'old'",
      displaySQL: 'PIN is old',
      logicalOperator: 'AND',
      parts: [{ type: 'SINGLE', jimuFieldName: 'PIN' }]
    }
    const result = remapSqlExpression(sqlExpr, { PIN: 'NEW' })
    expect(result.sql).toBe('')
    expect(result.displaySQL).toBe('')
  })

  it('should not mutate the original expression', () => {
    const sqlExpr: any = {
      sql: 'original', logicalOperator: 'AND',
      parts: [{ type: 'SINGLE', jimuFieldName: 'PIN' }]
    }
    remapSqlExpression(sqlExpr, { PIN: 'NEW' })
    expect(sqlExpr.parts[0].jimuFieldName).toBe('PIN') // Original unchanged
    expect(sqlExpr.sql).toBe('original')
  })

  it('should return undefined for undefined input', () => {
    expect(remapSqlExpression(undefined, { PIN: 'X' })).toBeUndefined()
  })

  it('should leave unmapped fields unchanged', () => {
    const sqlExpr: any = {
      sql: '', logicalOperator: 'AND',
      parts: [{ type: 'SINGLE', jimuFieldName: 'UNMAPPED' }]
    }
    const result = remapSqlExpression(sqlExpr, { PIN: 'NEW' })
    expect((result.parts[0] as SqlClause).jimuFieldName).toBe('UNMAPPED')
  })
})

// ── applyRebinding ───────────────────────────────────────────────

describe('applyRebinding — auto-heal', () => {
  it('should swap useDataSource on affected items', () => {
    const items = [makeQueryItem()]
    const fieldMap = buildIdentityFieldMap(['PIN', 'ADDR', 'PROP_NAME'])
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)

    expect(result[0].useDataSource.dataSourceId).toBe('ds-new-456')
    expect(result[0].useDataSource.mainDataSourceId).toBe('ds-new-456')
    expect(result[0].useDataSource.rootDataSourceId).toBe('ds-root-2')
  })

  it('should preserve outputDataSourceId unchanged', () => {
    const items = [makeQueryItem()]
    const fieldMap = buildIdentityFieldMap(['PIN', 'ADDR', 'PROP_NAME'])
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)

    expect(result[0].outputDataSourceId).toBe('widget_1_output_test-001')
  })

  it('should leave template expressions unchanged when field names identical', () => {
    const items = [makeQueryItem()]
    const fieldMap = buildIdentityFieldMap(['PIN', 'ADDR', 'PROP_NAME'])
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)

    expect(result[0].resultTitleExpression).toBe('Parcel: {{PIN}}')
    expect(result[0].resultContentExpression).toBe('**Address:** {{ADDR}}\n**Parcel:** {{PIN | upper}}')
  })

  it('should not touch unaffected query items', () => {
    const unaffected = makeQueryItem({ configId: 'other', useDataSource: { dataSourceId: 'ds-other', mainDataSourceId: 'ds-other', rootDataSourceId: 'ds-root-1', fields: ['X'] } })
    const items = [makeQueryItem(), unaffected]
    const fieldMap = buildIdentityFieldMap(['PIN', 'ADDR', 'PROP_NAME'])
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)

    expect(result[1].useDataSource.dataSourceId).toBe('ds-other') // Unchanged
    expect(result[1]).toBe(unaffected) // Same reference — not cloned
  })
})

describe('applyRebinding — field mapping', () => {
  const fieldMap = {
    PIN: 'PARCEL_NUM',
    ADDR: 'ADDRESS',
    PROP_NAME: 'PROPERTY_NAME'
  }

  it('should replace {{PIN}} → {{PARCEL_NUM}} in resultTitleExpression', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(result[0].resultTitleExpression).toBe('Parcel: {{PARCEL_NUM}}')
  })

  it('should replace {{PIN | upper}} → {{PARCEL_NUM | upper}} in resultContentExpression', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(result[0].resultContentExpression).toBe('**Address:** {{ADDRESS}}\n**Parcel:** {{PARCEL_NUM | upper}}')
  })

  it('should replace jimuFieldName in sqlExprObj.parts', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect((result[0].sqlExprObj as any).parts[0].jimuFieldName).toBe('PARCEL_NUM')
  })

  it('should map entries in resultDisplayFields', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(result[0].resultDisplayFields).toEqual(['PARCEL_NUM', 'ADDRESS', 'PROPERTY_NAME'])
  })

  // r028.117 (Phase 2.1): alias map is keyed by field name, so a rebind must remap
  // the keys too or per-field labels would point at stale field names.
  it('should remap resultFieldAliases keys (field-name keyed)', () => {
    const items = [makeQueryItem({ resultFieldAliases: { PIN: 'Tax Parcel #', UNKNOWN: 'Keep' } })]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, { PIN: 'PARCEL_NUM' })
    expect(result[0].resultFieldAliases).toEqual({ PARCEL_NUM: 'Tax Parcel #', UNKNOWN: 'Keep' })
  })

  it('should map jimuFieldName in sortOptions', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(result[0].sortOptions[0].jimuFieldName).toBe('PARCEL_NUM')
  })

  it('should map entries in resultTitleFields', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(result[0].resultTitleFields).toEqual(['PARCEL_NUM'])
  })

  it('should map useDataSource.fields', () => {
    const items = [makeQueryItem()]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(result[0].useDataSource.fields).toContain('PARCEL_NUM')
    expect(result[0].useDataSource.fields).toContain('ADDRESS')
  })

  it('should leave unmapped fields as-is', () => {
    const items = [makeQueryItem({ resultDisplayFields: ['PIN', 'UNKNOWN_FIELD'] })]
    const result = applyRebinding('ds-old-123', newUseDataSource, items, { PIN: 'PARCEL_NUM' })
    expect(result[0].resultDisplayFields).toEqual(['PARCEL_NUM', 'UNKNOWN_FIELD'])
  })

  it('should not mutate the original query items', () => {
    const original = makeQueryItem()
    const items = [original]
    applyRebinding('ds-old-123', newUseDataSource, items, fieldMap)
    expect(original.useDataSource.dataSourceId).toBe('ds-old-123') // Original unchanged
    expect(original.resultTitleExpression).toBe('Parcel: {{PIN}}')
  })
})

// ── buildIdentityFieldMap ────────────────────────────────────────

describe('buildIdentityFieldMap', () => {
  it('should map each field to itself', () => {
    const map = buildIdentityFieldMap(['A', 'B', 'C'])
    expect(map).toEqual({ A: 'A', B: 'B', C: 'C' })
  })

  it('should return empty map for empty array', () => {
    expect(buildIdentityFieldMap([])).toEqual({})
  })
})
