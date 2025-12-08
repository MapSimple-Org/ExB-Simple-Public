import { checkIsOutlineSizeAvailable } from '../../src/setting/util/util'

describe('Print setting utils function', function () {
  it('check is outline size available', () => {
    expect(checkIsOutlineSizeAvailable('1px')).toBeTruthy()
    expect(checkIsOutlineSizeAvailable('test')).toBeFalsy()
    expect(checkIsOutlineSizeAvailable('1')).toBeTruthy()
    expect(checkIsOutlineSizeAvailable('0px')).toBeTruthy()
  })
})
