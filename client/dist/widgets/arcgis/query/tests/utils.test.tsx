import type { IntlShape } from 'jimu-core'
import {
  createGetI18nMessage,
  toggleItemInArray
} from '../src/common/utils'

describe('toggleItemInArray Fn', () => {
  describe('not given parameter item', () => {
    const item = 'item2'
    const result = toggleItemInArray(item)
    it('An array that includes the value of parameter item is returned', () => {
      expect(result.includes(item)).toBeTruthy()
    })
  })
  describe('given parameter item can be found in parameter items', () => {
    const item = 'item2'
    const result = toggleItemInArray(item, ['item1', 'item2', 'item3'])
    it('An array that excludes the value of parameter item is returned', () => {
      expect(result.includes(item)).toBeFalsy()
    })
  })
  describe('given parameter item cannot be found in parameter items', () => {
    const item = 'item4'
    const result = toggleItemInArray(item, ['item1', 'item2', 'item3'])
    it('An array that includes the value of parameter item is returned', () => {
      expect(result.includes(item)).toBeTruthy()
    })
  })
})

describe('createGetI18nMessage Fn', () => {
  it('returns a function', () => {
    const result = createGetI18nMessage.call(this)
    expect(typeof result).toBe('function')
  })
  describe('called with parameter intl.formatMessage incorrectly provided', () => {
    const options = [
      {},
      { intl: {} },
      { intl: { formatMessage: 'dummyString' } }
    ]
    it('returned function should throws error', () => {
      const results = options.map(option => createGetI18nMessage(option as { intl: IntlShape, defaultMessages?: any }))
      results.forEach(result => {
        const getResult = () => result('dummyId', {})
        expect(getResult).toThrow()
      })
    })
  })
  describe('called with parameter intl.formatMessage correctly provided', () => {
    it('returned function should have called intl.formatMessage', () => {
      const formatMessage = jest.fn(({ id }) => messages[id])
      const id = 'dummyId'
      const messages = { [id]: 'dummyContent' }
      const result = createGetI18nMessage({ intl: { formatMessage } as any, defaultMessages: {} })
      expect(result(id)).toBe('dummyContent')
    })
  })
})
