/**
 * Unit tests for suggest-utils.ts — isValidFieldName() SQL identifier validation.
 *
 * isValidFieldName is a pure function (no DOM, no JSAPI, no mocks needed).
 * Tests cover valid SQL identifiers and common injection patterns.
 */

import { isValidFieldName } from '../src/runtime/suggest-utils'

// ── Valid field names ────────────────────────────────────────────

describe('isValidFieldName — valid identifiers', () => {
  it('should accept uppercase field names', () => {
    expect(isValidFieldName('PROP_NAME')).toBe(true)
  })

  it('should accept mixed case field names', () => {
    expect(isValidFieldName('FacilityName')).toBe(true)
  })

  it('should accept field names starting with underscore', () => {
    expect(isValidFieldName('_internal')).toBe(true)
  })

  it('should accept field names with digits', () => {
    expect(isValidFieldName('Field1')).toBe(true)
  })

  it('should accept dot-qualified names (schema.field)', () => {
    expect(isValidFieldName('dbo.FieldName')).toBe(true)
  })

  it('should accept lowercase field names', () => {
    expect(isValidFieldName('votdst')).toBe(true)
  })

  it('should accept single-character names', () => {
    expect(isValidFieldName('X')).toBe(true)
  })

  it('should accept names with multiple underscores', () => {
    expect(isValidFieldName('ADDR_FULL_LINE')).toBe(true)
  })
})

// ── Invalid field names (injection patterns) ────────────────────

describe('isValidFieldName — injection strings rejected', () => {
  it('should reject SQL injection with quote-break', () => {
    expect(isValidFieldName("'; DROP TABLE parcels--")).toBe(false)
  })

  it('should reject OR-based tautology injection', () => {
    expect(isValidFieldName('FIELD OR 1=1')).toBe(false)
  })

  it('should reject field names with double quotes', () => {
    expect(isValidFieldName('name"')).toBe(false)
  })

  it('should reject field names with single quotes', () => {
    expect(isValidFieldName("name'")).toBe(false)
  })

  it('should reject field names with spaces', () => {
    expect(isValidFieldName('field name')).toBe(false)
  })

  it('should reject field names with semicolons', () => {
    expect(isValidFieldName('field;')).toBe(false)
  })

  it('should reject field names with parentheses', () => {
    expect(isValidFieldName('UPPER(field)')).toBe(false)
  })

  it('should reject field names starting with a digit', () => {
    expect(isValidFieldName('1field')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidFieldName('')).toBe(false)
  })

  it('should reject null', () => {
    expect(isValidFieldName(null)).toBe(false)
  })

  it('should reject undefined', () => {
    expect(isValidFieldName(undefined)).toBe(false)
  })
})
