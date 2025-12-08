import * as React from 'react'
import { withStoreThemeIntlRender } from 'jimu-for-test'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchTool from '../../src/runtime/components/search-tool'

const render = withStoreThemeIntlRender()

describe('SearchTool component', () => {
  const defaultProps = {
    searchToolTowed: false,
    hint: 'search hint',
    tableLoaded: true,
    searchText: '',
    handleSearchChange: jest.fn(),
    closeSuggestionAndSearch: jest.fn(),
    closeSuggestion: jest.fn()
  }

  it('should render correctly when searchToolTowed is false', () => {
    render(<SearchTool {...defaultProps} />)
    expect(screen.getByPlaceholderText('search hint')).toBeInTheDocument()
  })

  it('should render correctly when searchToolTowed is true', () => {
    render(<SearchTool {...defaultProps} searchToolTowed={true} />)
    expect(screen.getByTitle('Open search')).toBeInTheDocument()
  })

  it('should call handleSearchChange when text is entered', () => {
    render(<SearchTool {...defaultProps} />)
    const input = screen.getByPlaceholderText('search hint')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(defaultProps.handleSearchChange).toHaveBeenCalledWith('test')
  })

  it('should call closeSuggestionAndSearch when Enter key is pressed', () => {
    render(<SearchTool {...defaultProps} />)
    const input = screen.getByPlaceholderText('search hint')
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(defaultProps.closeSuggestionAndSearch).toHaveBeenCalled()
  })

  it('should toggle Popper when search button is clicked', () => {
    render(<SearchTool {...defaultProps} searchToolTowed={true} />)
    const button = screen.getByTitle('Open search')
    fireEvent.click(button)
    expect(screen.getByPlaceholderText('search hint')).toBeInTheDocument()
  })
})