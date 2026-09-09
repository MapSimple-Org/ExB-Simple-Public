/**
 * Unit tests for popup-render-utils.renderPopupContent / resolvePopupTitle.
 *
 * These run against the REAL shared-code markdown engine and the REAL
 * value-formatter (only @arcgis/core/intl is mocked, deterministically), because
 * the result card (r028.111) now renders SelectAttributes through this exact
 * function with the real engine. So this file is both:
 *   1. direct coverage for the shared renderer, and
 *   2. the card == popup parity guarantee (same fn, same inputs → same output).
 *
 * r028.111
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Deterministic Esri intl stand-ins (echo inputs so assertions can see them).
jest.mock('@arcgis/core/intl', () => ({
  formatDate: jest.fn((ms: number) => `D:${ms}`),
  formatNumber: jest.fn((n: number) => `N:${n}`),
  convertDateFormatToIntlOptions: jest.fn((fmt: string) => ({ fmt }))
}))

import { renderPopupContent, resolvePopupTitle } from '../src/runtime/popup-render-utils'
import type { FieldMeta } from '../src/runtime/value-formatter'

const META: Record<string, FieldMeta> = {
  ActivityID: { name: 'ActivityID', alias: 'Work order', type: 'string' },
  DateReceived: { name: 'DateReceived', alias: 'Date received', type: 'date' },
  STATUS: {
    name: 'STATUS', alias: 'Status', type: 'small-integer',
    codedValues: [{ code: 1, name: 'Open' }, { code: 2, name: 'Closed' }]
  },
  PIN: { name: 'PIN', alias: 'Parcel', type: 'string' }
}

describe('renderPopupContent — SelectAttributes (card + popup shared path)', () => {
  const attributes = { ActivityID: 'WO-5823', DateReceived: 1505162400000, STATUS: 2, PIN: '8691501040' }

  function render (titleExpr: string, fields: string[]) {
    return renderPopupContent(
      attributes,
      { resultFieldsType: 'SelectAttributes', resultDisplayFields: fields, resultTitleExpression: titleExpr },
      undefined,
      META
    )
  }

  it('resolves a DOUBLE-brace {{token}} title (the Drainage card bug)', () => {
    // FeatureInfo rendered "{{ActivityID}}" as "}" — our renderer resolves it.
    const r = render('Drainage complaints:  {{ActivityID}}', ['ActivityID'])
    expect(r.title).toBe('Drainage complaints:  WO-5823')
    expect(r.title).not.toContain('}')
  })

  it('resolves a SINGLE-brace {token} title too', () => {
    expect(render('Drainage Complaints: {ActivityID}', ['ActivityID']).title)
      .toBe('Drainage Complaints: WO-5823')
  })

  it('uses field aliases as labels and formats values', () => {
    const r = render('{{ActivityID}}', ['DateReceived', 'STATUS', 'PIN'])
    expect(r.mode).toBe('SelectAttributes')
    // alias labels present
    expect(r.contentHtml).toContain('Date received')
    expect(r.contentHtml).toContain('Status')
    expect(r.contentHtml).toContain('Parcel')
    // date formatted via intl (formatDate applied — 'D:' prefix is the mock's marker)
    expect(r.contentHtml).toContain('D:1505162400000')
    // coded domain decoded
    expect(r.contentHtml).toContain('Closed')
    // string passes through
    expect(r.contentHtml).toContain('8691501040')
  })

  it('produces a real <table> via the shared markdown engine', () => {
    const r = render('{{ActivityID}}', ['PIN'])
    expect(r.contentHtml).toContain('<table')
    expect(r.contentHtml).toContain('<td')
  })

  // r028.117 (Phase 2.1): admin-configured per-field alias overrides the schema alias.
  it('applies resultFieldAliases over the schema alias', () => {
    const r = renderPopupContent(
      attributes,
      {
        resultFieldsType: 'SelectAttributes',
        resultDisplayFields: ['PIN', 'STATUS'],
        resultFieldAliases: { PIN: 'Tax Parcel #' } // overrides schema alias 'Parcel'
      },
      undefined,
      META
    )
    expect(r.contentHtml).toContain('Tax Parcel #')   // override wins
    expect(r.contentHtml).not.toContain('Parcel<')    // schema alias 'Parcel' label gone
    expect(r.contentHtml).toContain('Status')         // un-overridden field keeps schema alias
  })

  it('falls back to the schema alias when the override is blank/whitespace', () => {
    const r = renderPopupContent(
      attributes,
      {
        resultFieldsType: 'SelectAttributes',
        resultDisplayFields: ['PIN'],
        resultFieldAliases: { PIN: '   ' } // whitespace-only → no override
      },
      undefined,
      META
    )
    expect(r.contentHtml).toContain('Parcel')         // schema alias retained
  })

  // r028.117: the card-click path can arrive with empty/undefined fieldMeta
  // (layer.fields not populated) but the config still carries aliases — the override
  // must still apply. Regression guard for the "card-click popup ignored alias" bug.
  it('applies alias override even when fieldMeta is undefined', () => {
    const r = renderPopupContent(
      { PIN: '8691501040' },
      {
        resultFieldsType: 'SelectAttributes',
        resultDisplayFields: ['PIN'],
        resultFieldAliases: { PIN: 'Tax Parcel #' }
      },
      undefined,
      undefined // no fieldMeta — alias must still win
    )
    expect(r.contentHtml).toContain('Tax Parcel #')
    expect(r.contentHtml).toContain('8691501040')
  })

  it('escapes a value so it cannot break the table or inject markup', () => {
    const r = renderPopupContent(
      { NOTE: 'a|b <script> *x*' },
      { resultFieldsType: 'SelectAttributes', resultDisplayFields: ['NOTE'] },
      undefined,
      { NOTE: { name: 'NOTE', alias: 'Note', type: 'string' } }
    )
    expect(r.contentHtml).not.toContain('<script>')
    expect(r.contentHtml).toContain('&lt;script&gt;')
    // exactly one data row survived (pipe didn't split the cell)
    expect(r.contentHtml.match(/<tr/g)?.length).toBe(1)
  })

  it('falls back to field name + raw value when no fieldMeta is supplied', () => {
    const r = renderPopupContent(
      { ACRES: 42 },
      { resultFieldsType: 'SelectAttributes', resultDisplayFields: ['ACRES'] },
      undefined,
      undefined
    )
    expect(r.contentHtml).toContain('ACRES') // field name as label
    expect(r.contentHtml).toContain('42')
  })
})

describe('resolvePopupTitle — brace handling', () => {
  it('handles double-brace, single-brace, and plain titles', () => {
    const attrs = { ID: 'X1' }
    expect(resolvePopupTitle(attrs, { resultTitleExpression: '{{ID}}' })).toBe('X1')
    expect(resolvePopupTitle(attrs, { resultTitleExpression: '{ID}' })).toBe('X1')
    expect(resolvePopupTitle(attrs, { resultTitleExpression: 'Static' })).toBe('Static')
  })

  it('falls back to query name when no title expression', () => {
    expect(resolvePopupTitle({}, { name: 'My Query' })).toBe('My Query')
  })
})
