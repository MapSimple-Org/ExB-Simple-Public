import { combineFields, generateQueryParams, sanitizeQueryInput, isQueryInputValid, sanitizeSqlExpression, resolvePopupOutFields } from '../src/runtime/query-utils';
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

    it('should extract fields from contentExpression (CustomTemplate mode)', () => {
      const result = combineFields(null as any, '{NAME}', 'OBJECTID', 'Address: {ADDRESS}, City: {CITY}');
      expect(result).toContain('NAME');
      expect(result).toContain('ADDRESS');
      expect(result).toContain('CITY');
      expect(result).toContain('OBJECTID');
    });

    it('should handle contentExpression with no field tokens', () => {
      const result = combineFields(null as any, '', 'OBJECTID', 'Static text only');
      expect(result).toEqual(['OBJECTID']);
    });

    it('should combine displayFields, titleExpression, and contentExpression without duplicates', () => {
      const displayFields = Immutable(['NAME', 'ADDRESS']);
      const result = combineFields(displayFields as any, '{NAME}', 'OBJECTID', '{ADDRESS} {PHONE}');
      expect(result).toContain('NAME');
      expect(result).toContain('ADDRESS');
      expect(result).toContain('PHONE');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(4);
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

  describe('isQueryInputValid', () => {
    it('should identify an empty string as invalid', () => {
      expect(isQueryInputValid('')).toBe(false);
    });

    it('should identify a whitespace-only string as invalid', () => {
      expect(isQueryInputValid('   ')).toBe(false);
    });

    it('should identify a valid string as valid', () => {
      expect(isQueryInputValid('12345')).toBe(true);
    });

    it('should identify a number as valid', () => {
      expect(isQueryInputValid(12345)).toBe(true);
    });

    it('should identify an array of objects as valid if the first object has a value', () => {
      expect(isQueryInputValid([{ value: '123', label: '123' }])).toBe(true);
    });

    it('should identify an array of objects as invalid if the first object has an empty value', () => {
      expect(isQueryInputValid([{ value: ' ', label: ' ' }])).toBe(false);
      expect(isQueryInputValid([{ value: '', label: '' }])).toBe(false);
    });

    it('should identify as valid if we explicitly say it is a list, even if empty', () => {
      expect(isQueryInputValid('', true)).toBe(true);
      expect(isQueryInputValid(null, true)).toBe(true);
    });
  });

  describe('sanitizeSqlExpression (Complex Structures)', () => {
    // Mock for setIn
    const mockSetIn = jest.fn().mockImplementation((path, val) => ({
      ...mockExpr,
      setIn: mockSetIn
    }));
    
    const mockExpr: any = {
      parts: [
        {
          type: 'SINGLE',
          valueOptions: { value: "  O'Reilly  " }
        }
      ],
      setIn: mockSetIn
    };

    it('should sanitize a simple string part', () => {
      const result = sanitizeSqlExpression(mockExpr);
      expect(mockSetIn).toHaveBeenCalledWith(['parts', 0, 'valueOptions', 'value'], "O''Reilly");
    });

    it('should sanitize a Value List (array of objects) part', () => {
      const complexExpr: any = {
        parts: [
          {
            type: 'SINGLE',
            valueOptions: {
              value: [
                { value: "  O'Reilly  ", label: "O'Reilly" },
                { value: "  Smith  ", label: "Smith" }
              ]
            }
          }
        ],
        setIn: jest.fn()
      };
      
      const result = sanitizeSqlExpression(complexExpr);
      const expectedArr = [
        { value: "O''Reilly", label: "O'Reilly" },
        { value: "Smith", label: "Smith" }
      ];
      expect(complexExpr.setIn).toHaveBeenCalledWith(['parts', 0, 'valueOptions', 'value'], expectedArr);
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

  describe('generateQueryParams - PopupSetting mode', () => {
    let mockDS: any;

    beforeEach(() => {
      mockDS = {
        getDataSourceJson: jest.fn().mockReturnValue({}),
        getOriginDataSources: jest.fn().mockReturnValue([{
          getCurrentQueryParams: jest.fn().mockReturnValue({}),
          getSchema: jest.fn().mockReturnValue({
            fields: {
              NAME: { name: 'NAME' },
              ADDRESS: { name: 'ADDRESS' },
              PHONE: { name: 'PHONE' },
              OBJECTID: { name: 'OBJECTID' }
            }
          }),
          getPopupInfo: jest.fn().mockReturnValue({
            fieldInfos: [
              { fieldName: 'NAME', visible: true },
              { fieldName: 'ADDRESS', visible: true },
              { fieldName: 'PHONE', visible: false }
            ]
          })
        }]),
        getIdField: jest.fn().mockReturnValue('OBJECTID'),
        mergeQueryParams: jest.fn().mockImplementation((base, extra) => ({ ...base, ...extra })),
        setSourceRecords: jest.fn()
      };
    });

    it('should use visible popup fields for PopupSetting mode', () => {
      const mockQueryItem = Immutable({
        useAttributeFilter: true,
        resultFieldsType: FieldsType.PopupSetting
      });
      const params = generateQueryParams(mockDS, { sql: '1=1' } as any, null, mockQueryItem, 1, 10);

      expect(params.outFields).toContain('NAME');
      expect(params.outFields).toContain('ADDRESS');
      expect(params.outFields).toContain('OBJECTID');
      expect(params.outFields).not.toContain('PHONE'); // visible: false
    });

    it('should always include ID field in PopupSetting mode', () => {
      mockDS.getOriginDataSources.mockReturnValue([{
        getCurrentQueryParams: jest.fn().mockReturnValue({}),
        getSchema: jest.fn().mockReturnValue({
          fields: { NAME: { name: 'NAME' } }
        }),
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [{ fieldName: 'NAME', visible: true }]
        })
      }]);

      const mockQueryItem = Immutable({
        useAttributeFilter: true,
        resultFieldsType: FieldsType.PopupSetting
      });
      const params = generateQueryParams(mockDS, { sql: '1=1' } as any, null, mockQueryItem, 1, 10);

      expect(params.outFields).toContain('OBJECTID');
    });
  });

  describe('generateQueryParams - CustomTemplate mode', () => {
    let mockDS: any;

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

    it('should extract fields from contentExpression in CustomTemplate mode', () => {
      const mockQueryItem = Immutable({
        useAttributeFilter: true,
        resultFieldsType: FieldsType.CustomTemplate,
        resultTitleExpression: '{NAME}',
        resultContentExpression: 'Address: {ADDRESS}, Phone: {PHONE}'
      });

      const params = generateQueryParams(mockDS, { sql: '1=1' } as any, null, mockQueryItem, 1, 10);

      expect(params.outFields).toContain('NAME');
      expect(params.outFields).toContain('ADDRESS');
      expect(params.outFields).toContain('PHONE');
      expect(params.outFields).toContain('OBJECTID');
    });
  });

  describe('resolvePopupOutFields', () => {
    it('should return visible popup fields + objectIdField when popup info exists', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'NAME' },
          { name: 'ADDRESS' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [
            { fieldName: 'NAME', visible: true },
            { fieldName: 'ADDRESS', visible: true }
          ]
        }),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('ADDRESS');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(3);
    });

    it('should add objectIdField when not already in visible fields', () => {
      const mockFeatureLayer = {
        objectIdField: 'OID',
        fields: [
          { name: 'NAME' },
          { name: 'OID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [
            { fieldName: 'NAME', visible: true }
          ]
        }),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('OID');
      expect(result.length).toBe(2);
    });

    it('should NOT add objectIdField when it is already included in visible fields', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'NAME' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [
            { fieldName: 'NAME', visible: true },
            { fieldName: 'OBJECTID', visible: true }
          ]
        }),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(2);
      // Verify no duplicate OBJECTID
      expect(result.filter(f => f === 'OBJECTID').length).toBe(1);
    });

    it('should fall back to all layer fields when no popup info exists', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'NAME' },
          { name: 'ADDRESS' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue(null),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('ADDRESS');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(3);
    });

    it('should fall back to all layer fields when popupInfo.fieldInfos is empty', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'CITY' },
          { name: 'STATE' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: []
        }),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('CITY');
      expect(result).toContain('STATE');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(3);
    });

    it('should fall back to origin DS popup info when ds.getPopupInfo returns null', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'NAME' },
          { name: 'PHONE' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockOriginDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [
            { fieldName: 'NAME', visible: true },
            { fieldName: 'PHONE', visible: true }
          ]
        })
      };

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue(null),
        getOriginDataSources: jest.fn().mockReturnValue([mockOriginDS])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('PHONE');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(3);
    });

    it('should filter out fields not present in the layer actual fields', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'NAME' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [
            { fieldName: 'NAME', visible: true },
            { fieldName: 'DELETED_FIELD', visible: true },
            { fieldName: 'ANOTHER_MISSING', visible: true }
          ]
        }),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('OBJECTID');
      expect(result).not.toContain('DELETED_FIELD');
      expect(result).not.toContain('ANOTHER_MISSING');
      expect(result.length).toBe(2);
    });

    it('should fall back to all fields when all popup fields are visible:false', () => {
      const mockFeatureLayer = {
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'NAME' },
          { name: 'ADDRESS' },
          { name: 'OBJECTID' }
        ]
      } as any;

      const mockDS = {
        getPopupInfo: jest.fn().mockReturnValue({
          fieldInfos: [
            { fieldName: 'NAME', visible: false },
            { fieldName: 'ADDRESS', visible: false }
          ]
        }),
        getOriginDataSources: jest.fn().mockReturnValue([])
      } as any;

      const result = resolvePopupOutFields(mockDS, mockFeatureLayer);

      expect(result).toContain('NAME');
      expect(result).toContain('ADDRESS');
      expect(result).toContain('OBJECTID');
      expect(result.length).toBe(3);
    });
  });
});

