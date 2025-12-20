import { combineFields, generateQueryParams, sanitizeQueryInput } from '../src/runtime/query-utils';
import { FieldsType } from '../src/config';
import { Immutable } from 'jimu-core';

// Mock jimu-core
jest.mock('jimu-core', () => {
  return {
    ...jest.requireActual('jimu-core'),
    dataSourceUtils: {
      getArcGISSQL: jest.fn().mockImplementation((sqlExpr) => ({ sql: sqlExpr.sql })),
      changeJSAPIGeometryTypeToRestAPIGeometryType: jest.fn().mockReturnValue('esriGeometryPoint')
    }
  };
});

describe('query-utils unit tests', () => {
  describe('combineFields', () => {
    it('should combine display fields and title expression fields', () => {
      const displayFields = Immutable(['FIELD1', 'FIELD2']);
      const titleExpr = 'Title {FIELD3} and {FIELD1}';
      const idField = 'OBJECTID';
      
      const result = combineFields(displayFields as any, titleExpr, idField);
      
      expect(result).toContain('FIELD1');
      expect(result).toContain('FIELD2');
      expect(result).toContain('FIELD3');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(4);
    });

    it('should handle missing title expression', () => {
      const displayFields = Immutable(['FIELD1']);
      const result = combineFields(displayFields as any, '', 'OBJECTID');
      expect(result).toEqual(['FIELD1', 'OBJECTID']);
    });

    it('should avoid duplicates', () => {
      const displayFields = Immutable(['FIELD1', 'OBJECTID']);
      const result = combineFields(displayFields as any, '{FIELD1}', 'OBJECTID');
      expect(result).toEqual(['FIELD1', 'OBJECTID']);
    });
  });

  describe('sanitizeQueryInput', () => {
    it('should strip leading and trailing spaces', () => {
      expect(sanitizeQueryInput('  12345  ')).toBe('12345');
    });

    it('should return null for empty or whitespace strings', () => {
      expect(sanitizeQueryInput('')).toBe(null);
      expect(sanitizeQueryInput('   ')).toBe(null);
      expect(sanitizeQueryInput(null as any)).toBe(null);
    });

    it('should escape single quotes to prevent basic SQL injection', () => {
      // In SQL, ' is escaped as ''
      expect(sanitizeQueryInput("O'Malley")).toBe("O''Malley");
    });
  });

  describe('generateQueryParams - Universal SQL Optimizer', () => {
    let mockDS: any;
    let mockQueryItem: any;

    beforeEach(() => {
      mockDS = {
        getDataSourceJson: jest.fn().mockReturnValue({}),
        getOriginDataSources: jest.fn().mockReturnValue([{
          getCurrentQueryParams: jest.fn().mockReturnValue({}),
          getSchema: jest.fn().mockReturnValue({ fields: {} }),
          getPopupInfo: jest.fn().mockReturnValue({ fieldInfos: [] })
        }]),
        getIdField: jest.fn().mockReturnValue('OBJECTID'),
        mergeQueryParams: jest.fn().mockImplementation((base, extra) => ({ ...base, ...extra })),
        setSourceRecords: jest.fn()
      };

      mockQueryItem = Immutable({
        useAttributeFilter: true,
        useSpatialFilter: false,
        resultFieldsType: FieldsType.SelectAttributes,
        resultDisplayFields: ['FIELD1'],
        resultTitleExpression: '{FIELD2}'
      });
    });

    it('should unwrap LOWER() and convert value to UPPERCASE (Universal SQL Optimizer)', () => {
      const sqlExpr = { sql: "LOWER(MYFIELD) = 'abc'" };
      const params = generateQueryParams(mockDS, sqlExpr as any, null, mockQueryItem, 1, 10);
      
      // Expected optimization: LOWER(MYFIELD) = 'abc' -> MYFIELD = 'ABC'
      expect(params.where).toBe("MYFIELD = 'ABC'");
    });

    it('should handle LIKE operator in SQL Optimizer', () => {
      const sqlExpr = { sql: "LOWER(NAME) LIKE '%john%'" };
      const params = generateQueryParams(mockDS, sqlExpr as any, null, mockQueryItem, 1, 10);
      
      expect(params.where).toBe("NAME LIKE '%JOHN%'");
    });

    it('should not affect normal SQL queries', () => {
      const sqlExpr = { sql: "MYFIELD = 'NORMAL'" };
      const params = generateQueryParams(mockDS, sqlExpr as any, null, mockQueryItem, 1, 10);
      
      expect(params.where).toBe("MYFIELD = 'NORMAL'");
    });

    it('should handle multiple LOWER() clauses (Stress Test)', () => {
      const sqlExpr = { sql: "LOWER(FIELD1) = 'abc' AND LOWER(FIELD2) LIKE '%xyz%'" };
      const params = generateQueryParams(mockDS, sqlExpr as any, null, mockQueryItem, 1, 10);
      
      expect(params.where).toBe("FIELD1 = 'ABC' AND FIELD2 LIKE '%XYZ%'");
    });

    it('should handle mixed case values in LOWER() clauses', () => {
      const sqlExpr = { sql: "LOWER(PIN) = 'aBc123D'" };
      const params = generateQueryParams(mockDS, sqlExpr as any, null, mockQueryItem, 1, 10);
      
      expect(params.where).toBe("PIN = 'ABC123D'");
    });
  });

  describe('generateQueryParams - Field Shredder', () => {
    let mockDS: any;
    let mockQueryItem: any;

    beforeEach(() => {
      mockDS = {
        getDataSourceJson: jest.fn().mockReturnValue({}),
        getOriginDataSources: jest.fn().mockReturnValue([{
          getCurrentQueryParams: jest.fn().mockReturnValue({}),
          getSchema: jest.fn().mockReturnValue({ fields: {} }),
          getPopupInfo: jest.fn().mockReturnValue({ fieldInfos: [] })
        }]),
        getIdField: jest.fn().mockReturnValue('OBJECTID'),
        mergeQueryParams: jest.fn().mockImplementation((base, extra) => ({ ...base, ...extra })),
        setSourceRecords: jest.fn()
      };
    });

    it('should only request required fields (Field Shredder Optimization)', () => {
      mockQueryItem = Immutable({
        useAttributeFilter: true,
        resultFieldsType: FieldsType.SelectAttributes,
        resultDisplayFields: ['FIELD1'],
        resultTitleExpression: 'Title {FIELD2}'
      });

      const params = generateQueryParams(mockDS, { sql: '1=1' } as any, null, mockQueryItem, 1, 10);
      
      expect(params.outFields).toContain('FIELD1');
      expect(params.outFields).toContain('FIELD2');
      expect(params.outFields).toContain('OBJECTID');
      expect(params.outFields?.length).toBe(3);
    });

    it('should default to 1000 pageSize if not specified', () => {
      mockQueryItem = Immutable({ resultFieldsType: FieldsType.SelectAttributes });
      const params = generateQueryParams(mockDS, null, null, mockQueryItem, 1, 0);
      expect(params.pageSize).toBe(1000);
    });
  });
});

