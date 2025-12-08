import * as React from 'react'
import { withStoreThemeIntlRender } from 'jimu-for-test'
import { screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AutoRefreshLoading from '../../src/runtime/components/auto-refresh-loading'

const render = withStoreThemeIntlRender()
const BASE_REFRESH_TIME = 60000
const defaultProps = {
  showLoading: true,
  interval: BASE_REFRESH_TIME,
  isMobile: false,
  bottomResponsive: false,
  refreshTime: Date.now()
}

describe('AutoRefreshLoading', () => {
  it('renders loading indicator when showLoading is true', () => {
    render(<AutoRefreshLoading {...defaultProps} />)
    expect(queryByClass('loading-con')).toBeInTheDocument()
  })

  it('does not render loading indicator when showLoading is false', () => {
    render(<AutoRefreshLoading {...defaultProps} showLoading={false} />)
    expect(queryByClass('loading-con')).not.toBeInTheDocument()
  })

  it('shows refresh string when interval > 0 and bottomResponsive is false', () => {
    render(<AutoRefreshLoading {...defaultProps} />)
    expect(screen.getByText('Last update: a few seconds ago')).toBeInTheDocument()
  })

  it('shows tooltip when bottomResponsive is true', () => {
    render(<AutoRefreshLoading {...defaultProps} bottomResponsive={true} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Last update: a few seconds ago')
  })

  it('does not show refresh string or tooltip when interval <= 0', () => {
    render(<AutoRefreshLoading {...defaultProps} interval={0} />)
    expect(screen.queryByText('Last update: a few seconds ago')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows "Last update: a few seconds ago" if refreshTime is less than 1 minute', () => {
    jest.useFakeTimers()
    render(<AutoRefreshLoading {...defaultProps} refreshTime={Date.now() + 6000}/>)
    act(() => { jest.advanceTimersByTime(BASE_REFRESH_TIME) })
    expect(screen.getByText('Last update: a few seconds ago')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('shows "Last update: a minute ago" if refreshTime is over 1 minute ago', () => {
    jest.useFakeTimers()
    render(<AutoRefreshLoading {...defaultProps} refreshTime={Date.now() - 1000}/>)
    act(() => { jest.advanceTimersByTime(BASE_REFRESH_TIME) })
    expect(screen.getByText('Last update: a minute ago')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('shows "Last update: X minutes ago" if refreshTime is over 2 minutes ago', () => {
    jest.useFakeTimers()
    render(<AutoRefreshLoading {...defaultProps} refreshTime={Date.now() - BASE_REFRESH_TIME * 2} />)
    act(() => { jest.advanceTimersByTime(BASE_REFRESH_TIME) })
    expect(screen.getByText('Last update: 3 minutes ago')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const { unmount } = render(<AutoRefreshLoading {...defaultProps} />)
    const clearSpy = jest.spyOn(window, 'clearInterval')
    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
    jest.useRealTimers()
  })
})

// Helper for queryByClass (since getByClassName is not in testing-library)
function queryByClass(className: string) {
  return document.querySelector('.' + className)
}