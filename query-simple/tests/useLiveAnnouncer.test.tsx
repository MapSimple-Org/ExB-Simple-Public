/**
 * useLiveAnnouncer tests (TODO #38, r028.138)
 *
 * Exercises the debounce and same-message re-announce behavior with fake timers,
 * via a tiny harness component that surfaces the hook's message + announce.
 */
import { React } from 'jimu-core'
import { render, act } from '@testing-library/react'
import { useLiveAnnouncer } from '../src/runtime/useLiveAnnouncer'

let announceFn: (m: string) => void
let currentMessage: string

function Harness (): React.ReactElement {
  const { message, announce } = useLiveAnnouncer(150)
  announceFn = announce
  currentMessage = message
  return React.createElement('div', null, message)
}

describe('useLiveAnnouncer', () => {
  beforeEach(() => { jest.useFakeTimers() })
  afterEach(() => { jest.useRealTimers() })

  it('starts empty and does not announce before the debounce window elapses', () => {
    render(React.createElement(Harness))
    act(() => { announceFn('hello') })
    expect(currentMessage).toBe('')
    act(() => { jest.advanceTimersByTime(150) })
    expect(currentMessage).toBe('hello')
  })

  it('collapses rapid calls to the last message (debounce)', () => {
    render(React.createElement(Harness))
    act(() => {
      announceFn('first')
      announceFn('second')
      announceFn('third')
    })
    act(() => { jest.advanceTimersByTime(150) })
    expect(currentMessage).toBe('third')
  })

  it('re-announces an identical message by clearing then re-setting next tick', () => {
    render(React.createElement(Harness))
    act(() => { announceFn('Draw mode. Help updated.') })
    act(() => { jest.advanceTimersByTime(150) })
    expect(currentMessage).toBe('Draw mode. Help updated.')

    act(() => { announceFn('Draw mode. Help updated.') })
    act(() => { jest.advanceTimersByTime(150) })
    expect(currentMessage).toBe('') // cleared first so aria-live re-fires
    act(() => { jest.advanceTimersByTime(50) })
    expect(currentMessage).toBe('Draw mode. Help updated.')
  })

  it('ignores empty messages', () => {
    render(React.createElement(Harness))
    act(() => { announceFn('') })
    act(() => { jest.advanceTimersByTime(200) })
    expect(currentMessage).toBe('')
  })
})
