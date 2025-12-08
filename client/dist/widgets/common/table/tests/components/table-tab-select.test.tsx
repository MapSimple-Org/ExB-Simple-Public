import * as React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { getInitState, withStoreThemeIntlRender } from 'jimu-for-test'
import TableTabSelect, { type Props } from '../../src/runtime/components/table-tab-select'
import { layerConfig, layerConfig2 } from '../config'
import { appActions, getAppStore } from 'jimu-core'

const render = withStoreThemeIntlRender()
const initState = getInitState().merge({
  appContext: { isRTL: false },
  appConfig: {
    widgets: [] as any,
    views: {},
    dialogs: {}
  }
})
getAppStore().dispatch(appActions.updateStoreState(initState))
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

describe('TableTabSelect component', () => {
  const defaultProps: Props = {
    allLayersConfig: [ layerConfig, layerConfig2 ],
    isHorizontalTab: true,
    activeTabId: 'test-1',
    searchOn: false,
    toolListNode: <div>Tool List</div>,
    onTabClick: jest.fn(),
    onCloseTab: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render horizontal tabs correctly', () => {
    render(<TableTabSelect {...defaultProps} />)
    expect(screen.getByText('Layer 1')).toBeInTheDocument()
    expect(screen.getByText('Layer 2')).toBeInTheDocument()
  })

  it('should call onTabClick when a tab is clicked', () => {
    render(<TableTabSelect {...defaultProps} />)
    const tab = screen.getByText('Layer 2')
    fireEvent.click(tab)
    expect(defaultProps.onTabClick).toHaveBeenCalledWith('test-2')
  })

  it('should call onCloseTab when the close button is clicked for a closeable tab', () => {
    render(<TableTabSelect {...defaultProps} />)
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    expect(defaultProps.onCloseTab).toHaveBeenCalledWith('test-1')
  })

  it('should render dropdown select when isHorizontalTab is false', () => {
    render(<TableTabSelect {...defaultProps} isHorizontalTab={false} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should call onTabClick when a dropdown option is selected', () => {
    render(<TableTabSelect {...defaultProps} isHorizontalTab={false} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'test-2' } })
    expect(select).toHaveValue('test-2')
  })

  it('should render toolListNode when searchOn is false', () => {
    render(<TableTabSelect {...defaultProps} />)
    expect(screen.getByText('Tool List')).toBeInTheDocument()
  })

  it('should not render toolListNode when searchOn is true', () => {
    render(<TableTabSelect {...defaultProps} searchOn={true} />)
    expect(screen.queryByText('Tool List')).not.toBeInTheDocument()
  })
})