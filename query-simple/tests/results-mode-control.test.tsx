import { React } from 'jimu-core'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResultsModeControl, ResultsModeValue } from '../src/runtime/components/ResultsModeControl'

// Mock jimu-core
jest.mock('jimu-core', () => {
  const React = require('react')
  return {
    React,
    jsx: React.createElement,
    css: jest.fn(() => ''),
    hooks: {
      useTranslation: jest.fn((msgs: any) => (id: string) => id)
    }
  }
})

// Mock jimu-ui Button
jest.mock('jimu-ui', () => {
  const React = require('react')
  return {
    Button: React.forwardRef(({ children, onClick, disabled, ...props }: any, ref: any) =>
      React.createElement('button', {
        onClick,
        disabled,
        'data-testid': props.title,
        'aria-pressed': props['aria-pressed'],
        ref
      }, children)
    )
  }
})

describe('ResultsModeControl', () => {
  const mockOnChange = jest.fn()
  const mockGetI18nMessage = jest.fn((id: string) => id)

  const defaultProps = {
    value: 'new' as ResultsModeValue,
    onChange: mockOnChange,
    getI18nMessage: mockGetI18nMessage
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── Test 1: Renders three buttons ──────────────────────────────────

  it('renders three buttons (New, Add, Remove)', () => {
    render(<ResultsModeControl {...defaultProps} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  // ─── Test 2: Active button has aria-pressed="true" ──────────────────

  it('marks the active button with aria-pressed="true"', () => {
    render(<ResultsModeControl {...defaultProps} value='add' />)

    // The Button mock uses title as data-testid — find by title i18n keys
    const addButton = screen.getByTestId('addToCurrentResults')
    expect(addButton).toHaveAttribute('aria-pressed', 'true')

    const newButton = screen.getByTestId('createNewResults')
    expect(newButton).toHaveAttribute('aria-pressed', 'false')

    const removeButton = screen.getByTestId('removeFromCurrentResults')
    expect(removeButton).toHaveAttribute('aria-pressed', 'false')
  })

  // ─── Test 3: Calls onChange with 'new' ──────────────────────────────

  it('calls onChange with "new" when New button is clicked', () => {
    render(<ResultsModeControl {...defaultProps} value='add' />)

    fireEvent.click(screen.getByTestId('createNewResults'))
    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith('new')
  })

  // ─── Test 4: Calls onChange with 'add' ──────────────────────────────

  it('calls onChange with "add" when Add button is clicked', () => {
    render(<ResultsModeControl {...defaultProps} value='new' />)

    fireEvent.click(screen.getByTestId('addToCurrentResults'))
    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith('add')
  })

  // ─── Test 5: Calls onChange with 'remove' ───────────────────────────

  it('calls onChange with "remove" when Remove button is clicked', () => {
    render(<ResultsModeControl {...defaultProps} value='new' />)

    fireEvent.click(screen.getByTestId('removeFromCurrentResults'))
    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith('remove')
  })

  // ─── Test 6: Remove disabled when removeDisabled is true ────────────

  it('disables Remove button when removeDisabled is true', () => {
    render(<ResultsModeControl {...defaultProps} removeDisabled={true} />)

    const removeButton = screen.getByTestId('removeFromCurrentResults')
    expect(removeButton).toBeDisabled()
  })

  // ─── Test 7: Remove NOT disabled when removeDisabled is false/undefined

  it('does NOT disable Remove button when removeDisabled is false', () => {
    render(<ResultsModeControl {...defaultProps} removeDisabled={false} />)

    const removeButton = screen.getByTestId('removeFromCurrentResults')
    expect(removeButton).not.toBeDisabled()
  })

  it('does NOT disable Remove button when removeDisabled is undefined', () => {
    render(<ResultsModeControl {...defaultProps} />)

    const removeButton = screen.getByTestId('removeFromCurrentResults')
    expect(removeButton).not.toBeDisabled()
  })

  // ─── Test 8: Logic summary bar shows correct i18n key ───────────────

  it('renders logic summary bar with correct i18n key for "new" mode', () => {
    render(<ResultsModeControl {...defaultProps} value='new' />)

    expect(screen.getByText('resultsModeLogicNew')).toBeInTheDocument()
  })

  it('renders logic summary bar with correct i18n key for "add" mode', () => {
    render(<ResultsModeControl {...defaultProps} value='add' />)

    expect(screen.getByText('resultsModeLogicAdd')).toBeInTheDocument()
  })

  it('renders logic summary bar with correct i18n key for "remove" mode', () => {
    render(<ResultsModeControl {...defaultProps} value='remove' />)

    expect(screen.getByText('resultsModeLogicRemove')).toBeInTheDocument()
  })

  // ─── Test 9: getI18nMessage used for all button labels ──────────────

  it('uses getI18nMessage for all button labels', () => {
    render(<ResultsModeControl {...defaultProps} />)

    // Each button label and title calls getI18nMessage
    // 3 buttons x (1 label + 1 title) = 6 calls, plus radiogroup aria-label + logic summary = 8
    expect(mockGetI18nMessage).toHaveBeenCalledWith('resultsModeNew')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('resultsModeAdd')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('resultsModeRemove')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('createNewResults')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('addToCurrentResults')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('removeFromCurrentResults')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('resultsMode')
    expect(mockGetI18nMessage).toHaveBeenCalledWith('resultsModeLogicNew')
  })

  // ─── Test 10: New button never disabled regardless of removeDisabled ─

  it('New button is never disabled regardless of removeDisabled', () => {
    const { rerender } = render(
      <ResultsModeControl {...defaultProps} removeDisabled={true} />
    )

    const newButton = screen.getByTestId('createNewResults')
    expect(newButton).not.toBeDisabled()

    rerender(<ResultsModeControl {...defaultProps} removeDisabled={false} />)
    expect(screen.getByTestId('createNewResults')).not.toBeDisabled()
  })
})
