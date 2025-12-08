import { act, renderHook, waitFor } from '@testing-library/react'
import { useDebouncedCallback } from '../../src/setting/settings/utils'

describe('src/setting/utils', () => {
  it('useDebouncedSetValue', async () => {
    const fn = jest.fn()
    const { result } = renderHook(() => useDebouncedCallback(fn, 500))

    act(() => {
      result.current(1)
      result.current(2)
    })
    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(2)
    })
  })
})
