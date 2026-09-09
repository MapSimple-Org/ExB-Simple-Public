/**
 * Unit tests for value-formatter.ts
 *
 * Verifies the branching/wiring of display formatting for result field tables:
 * coded-domain decode, date formatting (epoch-ms → Esri intl), number
 * formatting, oid exclusion, fallbacks, and field-meta mapping.
 *
 * `@arcgis/core/intl` is mocked: we test OUR resolution logic and that the
 * right Esri primitive is called with the right inputs. Real character-level
 * format parity (e.g. '8/8/2013, 5:00 PM') is verified by manual smoke, not here.
 *
 * r028.109
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Deterministic stand-ins for Esri's intl primitives.
jest.mock('@arcgis/core/intl', () => ({
  // Echo the epoch-ms tagged with the resolved options so tests can assert both.
  formatDate: jest.fn((ms: number, opts: any) => `DATE(${ms})[${opts?.fmt ?? '?'}]`),
  formatNumber: jest.fn((n: number) => `NUM(${n})`),
  // Pass the format name through so formatDate's mock can surface it.
  convertDateFormatToIntlOptions: jest.fn((fmt: string) => ({ fmt }))
}))

import { formatFieldValue, buildFieldMetaMap } from '../src/runtime/value-formatter'
import { formatDate, formatNumber, convertDateFormatToIntlOptions } from '@arcgis/core/intl'

describe('value-formatter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formatFieldValue — null/empty', () => {
    it('returns empty string for null', () => {
      expect(formatFieldValue(null, { name: 'X', type: 'string' })).toBe('')
    })
    it('returns empty string for undefined', () => {
      expect(formatFieldValue(undefined)).toBe('')
    })
    it('does NOT treat 0 as empty', () => {
      expect(formatFieldValue(0, { name: 'X', type: 'string' })).toBe('0')
    })
  })

  describe('formatFieldValue — coded domains', () => {
    const meta = {
      name: 'STATUS',
      type: 'small-integer',
      codedValues: [{ code: 1, name: 'Open' }, { code: 2, name: 'Closed' }]
    }
    it('decodes a matching numeric code to its label', () => {
      expect(formatFieldValue(2, meta)).toBe('Closed')
    })
    it('decodes via string-coerced match (string raw vs numeric code)', () => {
      expect(formatFieldValue('1', meta)).toBe('Open')
    })
    it('domain decode wins over numeric formatting (no NUM() call)', () => {
      expect(formatFieldValue(1, meta)).toBe('Open')
      expect(formatNumber).not.toHaveBeenCalled()
    })
    it('falls through to number format when the code is not in the domain', () => {
      expect(formatFieldValue(9, meta)).toBe('NUM(9)')
    })
  })

  describe('formatFieldValue — dates', () => {
    it('formats epoch-ms via formatDate with default format', () => {
      const out = formatFieldValue(1505162400000, { name: 'D', type: 'date' })
      expect(convertDateFormatToIntlOptions).toHaveBeenCalledWith('short-date-short-time')
      expect(formatDate).toHaveBeenCalledWith(1505162400000, { fmt: 'short-date-short-time' })
      expect(out).toBe('DATE(1505162400000)[short-date-short-time]')
    })
    it('honors a per-field dateFormat override', () => {
      formatFieldValue(1505162400000, { name: 'D', type: 'date', dateFormat: 'short-date-le' })
      expect(convertDateFormatToIntlOptions).toHaveBeenCalledWith('short-date-le')
    })
    it('parses a numeric date string defensively', () => {
      formatFieldValue('1505162400000', { name: 'D', type: 'date' })
      // Date.parse on a pure-number string is NaN, so it should fall back to raw.
      // (Guards against accidental misparse.)
      expect(formatDate).not.toHaveBeenCalled()
    })
    it('returns raw for an unparseable date value', () => {
      expect(formatFieldValue('not-a-date', { name: 'D', type: 'date' })).toBe('not-a-date')
      expect(formatDate).not.toHaveBeenCalled()
    })
    it('covers date-only and timestamp-offset types', () => {
      formatFieldValue(1505162400000, { name: 'D', type: 'date-only' })
      formatFieldValue(1505162400000, { name: 'D', type: 'timestamp-offset' })
      expect(formatDate).toHaveBeenCalledTimes(2)
    })
  })

  describe('formatFieldValue — numbers', () => {
    it('formats double via formatNumber', () => {
      expect(formatFieldValue(1234.5, { name: 'N', type: 'double' })).toBe('NUM(1234.5)')
    })
    it('formats integer via formatNumber', () => {
      expect(formatFieldValue(1000, { name: 'N', type: 'integer' })).toBe('NUM(1000)')
    })
    it('coerces a numeric string', () => {
      expect(formatFieldValue('42', { name: 'N', type: 'long' })).toBe('NUM(42)')
    })
    it('does NOT format oid (no comma-grouped OBJECTIDs)', () => {
      expect(formatFieldValue(1234, { name: 'OBJECTID', type: 'oid' })).toBe('1234')
      expect(formatNumber).not.toHaveBeenCalled()
    })
    it('returns raw for a non-numeric value on a numeric field', () => {
      expect(formatFieldValue('N/A', { name: 'N', type: 'double' })).toBe('N/A')
      expect(formatNumber).not.toHaveBeenCalled()
    })
  })

  describe('formatFieldValue — fallback', () => {
    it('returns string for text fields', () => {
      expect(formatFieldValue('Enforcement', { name: 'T', type: 'string' })).toBe('Enforcement')
    })
    it('returns string when no meta is supplied', () => {
      expect(formatFieldValue('plain')).toBe('plain')
    })
    it('stringifies a value on an unknown type', () => {
      expect(formatFieldValue(7, { name: 'X', type: 'guid' })).toBe('7')
    })
  })

  describe('buildFieldMetaMap', () => {
    it('maps name, alias, type, and coded values from the schema', () => {
      const map = buildFieldMetaMap([
        { name: 'DateReceived', alias: 'Date received', type: 'date' },
        { name: 'STATUS', alias: 'Status', type: 'small-integer', domain: { codedValues: [{ code: 1, name: 'Open' }] } },
        { name: 'PIN', alias: 'Parcel', type: 'string' }
      ])
      expect(map.DateReceived).toEqual({ name: 'DateReceived', alias: 'Date received', type: 'date', codedValues: undefined })
      expect(map.STATUS.codedValues).toEqual([{ code: 1, name: 'Open' }])
      expect(map.PIN.alias).toBe('Parcel')
    })
    it('skips fields without a name and tolerates null input', () => {
      expect(buildFieldMetaMap(null)).toEqual({})
      const map = buildFieldMetaMap([{ name: '', type: 'string' } as any, { name: 'OK', type: 'string' }])
      expect(Object.keys(map)).toEqual(['OK'])
    })
  })
})
