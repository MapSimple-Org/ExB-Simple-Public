import { findDraggedItemPosition } from '../runtime/utils'

describe('findDragedItemPosition', () => {
  it('should return null if no any changes', () => {
    expect(findDraggedItemPosition([1, 2, 3, 4], [1, 2, 3, 4])).toEqual(null)
  })

  it('should return null if the count of prev and current is changed', () => {
    expect(findDraggedItemPosition([1, 2, 3, 4], [1, 2, 3])).toEqual(null)
  })

  it('should return null if inputs are empty array', () => {
    expect(findDraggedItemPosition([], [])).toEqual(null)
  })

  it('should return from index and to index if inputs are valid', () => {
    expect(findDraggedItemPosition([1, 2, 3, 4], [1, 4, 2, 3])).toEqual({ from: 3, to: 1 })
    expect(findDraggedItemPosition([1, 2, 3, 4], [1, 3, 4, 2])).toEqual({ from: 1, to: 3 })
    expect(findDraggedItemPosition([1, 2, 3, 4, 5], [1, 2, 3, 5, 4])).toEqual({ from: 3, to: 4 })
    expect(findDraggedItemPosition([1, 2], [2, 1])).toEqual({ from: 0, to: 1 })
  })
})
