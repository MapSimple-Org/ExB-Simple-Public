import { getFlatFormElements } from '../src/utils/index'

describe('edit widget utils test cases', () => {
  describe('getFlatFormElements', () => {
    it('should return empty array for empty input', () => {
      expect(getFlatFormElements([])).toEqual([])
      expect(getFlatFormElements(null)).toEqual([])
      expect(getFlatFormElements(undefined)).toEqual([])
    })

    it('should flatten a flat array', () => {
      const elements = [
        { label: 'A', type: 'field' },
        { label: 'B', type: 'field' }
      ] as __esri.FormTemplate['elements']
      expect(getFlatFormElements(elements)).toEqual(elements)
    })

    it('should flatten nested elements', () => {
      const elements = [
        { label: 'A', type: 'group', elements: [
          { label: 'B', type: 'field' },
          { label: 'C', type: 'field' },
          { label: 'D', type: 'field' },
        ]},
        { label: 'E', type: 'field' },
      ] as __esri.FormTemplate['elements']
      const flat = getFlatFormElements(elements)
      expect(flat.map(e => e.label)).toEqual(['B', 'C', 'D', 'E'])
    })
  })
})