import { toggleItemInArray, getFieldInfosInPopupContent } from '../utils';

describe('shared-code/common/utils unit tests', () => {
  describe('toggleItemInArray', () => {
    it('should add item if it does not exist', () => {
      const items = ['A', 'B'];
      const result = toggleItemInArray('C', items);
      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('should remove item if it exists', () => {
      const items = ['A', 'B', 'C'];
      const result = toggleItemInArray('B', items);
      expect(result).toEqual(['A', 'C']);
    });

    it('should handle empty array', () => {
      const result = toggleItemInArray('A', []);
      expect(result).toEqual(['A']);
    });
  });

  describe('getFieldInfosInPopupContent', () => {
    it('should extract field infos from fields element', () => {
      const popupInfo: any = {
        popupElements: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'FIELD1' },
              { fieldName: 'FIELD2' }
            ]
          },
          {
            type: 'text',
            text: 'some text'
          }
        ]
      };
      
      const result = getFieldInfosInPopupContent(popupInfo);
      expect(result.length).toBe(2);
      expect(result[0].fieldName).toBe('FIELD1');
      expect(result[1].fieldName).toBe('FIELD2');
    });

    it('should return empty array if no fields element found', () => {
      const popupInfo: any = {
        popupElements: [
          { type: 'text', text: 'no fields here' }
        ]
      };
      const result = getFieldInfosInPopupContent(popupInfo);
      expect(result).toEqual([]);
    });

    it('should handle null/undefined popupInfo', () => {
      expect(getFieldInfosInPopupContent(null)).toEqual([]);
      expect(getFieldInfosInPopupContent(undefined)).toEqual([]);
    });
  });
});

