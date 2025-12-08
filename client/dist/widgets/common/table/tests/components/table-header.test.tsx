import * as React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { withStoreThemeIntlRender } from 'jimu-for-test'
import TableHeader, { type Props } from '../../src/runtime/components/table-header'
// import { fetchSuggestionRecords } from '../../src/runtime/components/utils'
import { WidgetState } from 'jimu-core'

jest.mock('../../src/runtime/components/utils', () => ({
  fetchSuggestionRecords: jest.fn()
}))

jest.mock('jimu-core', () => ({
  ...jest.requireActual('jimu-core'),
  esri: {
    Sanitizer: jest.fn().mockImplementation(() => ({
      sanitize: jest.fn((html) => html)
    }))
  }
}))

const render = withStoreThemeIntlRender()

describe('TableHeader component', () => {
  const defaultProps: Props = {
    searchToolTowed: false,
    curLayerConfig: { searchHint: 'Search...' } as any,
    dataSource: {} as any,
    tableLoaded: true,
    widgetState: WidgetState.Active,
    toolListNode: <div>Tool List</div>,
    handleSubmit: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<TableHeader {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    expect(screen.getByText('Tool List')).toBeInTheDocument()
  })

  it('should call handleSubmit with empty string when searchText is cleared', () => {
    render(<TableHeader {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: '' } })
    expect(defaultProps.handleSubmit).toHaveBeenCalledWith('')
  })

  // TODO
  // suggestionsQueryTimeout.current = setTimeout(() => {xxx}, 200) not executed

  // it('should fetch suggestions when searchText length is greater than 2', async () => {
  //   (fetchSuggestionRecords as jest.Mock).mockResolvedValue([{ suggestion: 'Test Suggestion' }])
  //   render(<TableHeader {...defaultProps} />)
  //   const input = screen.getByPlaceholderText('Search...')
  //   fireEvent.change(input, { target: { value: 'Test' } })

  //   await waitFor(() => {
  //     expect(fetchSuggestionRecords).toHaveBeenCalledWith('Test', defaultProps.curLayerConfig, defaultProps.dataSource)
  //   }, { timeout: 200 })
  // })

  // it('should display suggestions when fetched', async () => {
  //   (fetchSuggestionRecords as jest.Mock).mockResolvedValue([{ suggestion: 'Test Suggestion' }])
  //   render(<TableHeader {...defaultProps} />)
  //   const input = screen.getByPlaceholderText('Search...')
  //   fireEvent.change(input, { target: { value: 'Test' } })

  //   await waitFor(() => {
  //     expect(screen.getByText('Test Suggestion')).toBeInTheDocument()
  //   }, { timeout: 1000 })
  // })

  // it('should call handleSubmit with suggestion when a suggestion is clicked', async () => {
  //   (fetchSuggestionRecords as jest.Mock).mockResolvedValue([{ suggestion: 'Test Suggestion' }])
  //   render(<TableHeader {...defaultProps} />)
  //   const input = screen.getByPlaceholderText('Search...')
  //   fireEvent.change(input, { target: { value: 'Test' } })

  //   await waitFor(() => {
  //     const suggestionButton = screen.getByText('Test Suggestion')
  //     fireEvent.click(suggestionButton)
  //     expect(defaultProps.handleSubmit).toHaveBeenCalledWith('Test Suggestion')
  //   }, { timeout: 500 })
  // })

  it('should reset searchText and suggestions when widgetState is closed', () => {
    const { rerender } = render(<TableHeader {...defaultProps} widgetState={WidgetState.Active} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'Test' } })

    rerender(<TableHeader {...defaultProps} widgetState={WidgetState.Closed} />)
    const newInput = screen.getByPlaceholderText('Search...')
    expect(newInput).toHaveValue('')
  })
})