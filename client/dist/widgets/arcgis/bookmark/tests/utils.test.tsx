import { getScrollParam } from '../src/runtime/utils/utils'

describe('getScrollParam', () => {
  it('should compute the correct param', () => {
    expect(getScrollParam('next', true, true, 200, 237.5, 24)).toEqual({
      top: 0,
      left: -224,
      behavior: 'smooth' as ScrollBehavior
    })
    expect(getScrollParam('previous', true, false, 200, 237.5, 24)).toEqual({
      top: 0,
      left: -224,
      behavior: 'smooth' as ScrollBehavior
    })
  })
})
