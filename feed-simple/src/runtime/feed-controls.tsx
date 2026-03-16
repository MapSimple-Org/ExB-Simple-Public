/** @jsx jsx */
import { React, jsx, css, hooks } from 'jimu-core'
import { TextInput, Select, Option, Button } from 'jimu-ui'
import { SortAscendingArrowOutlined } from 'jimu-icons/outlined/directional/sort-ascending-arrow'
import { SortDescendingArrowOutlined } from 'jimu-icons/outlined/directional/sort-descending-arrow'

interface FeedControlsProps {
  /** Whether to show the search bar */
  enableSearch: boolean
  /** Placeholder text for search input */
  searchPlaceholder: string
  /** Callback when search query changes (debounced) */
  onSearchChange: (query: string) => void
  /** Current search query (controlled) */
  searchQuery: string
  /** Number of items after filter/search/sort (pre-pagination) */
  filteredCount: number
  /** Total items before any pipeline processing */
  totalCount: number
  /** Item label for count display (e.g. 'items', 'closures') */
  itemLabel: string
  /** Whether to show sort controls */
  enableSort: boolean
  /** Fields available for sorting */
  sortableFields: string[]
  /** All field names discovered from the feed */
  allFieldNames: string[]
  /** Current sort field */
  sortField: string
  /** Current sort direction */
  sortDirection: 'asc' | 'desc'
  /** Callback when sort field or direction changes */
  onSortChange: (field: string, direction: 'asc' | 'desc') => void
  /** Whether range-label sorting is available (colorMode = 'range' with labeled breaks) */
  hasRangeLabels?: boolean
}

/**
 * FeedControls — search bar, sort dropdown, and results label.
 * Renders above the card list in an ExB-native toolbar style.
 */
export default function FeedControls (props: FeedControlsProps): React.ReactElement | null {
  const {
    enableSearch,
    searchPlaceholder,
    onSearchChange,
    searchQuery,
    filteredCount,
    totalCount,
    itemLabel,
    enableSort,
    sortableFields,
    allFieldNames,
    sortField,
    sortDirection,
    onSortChange,
    hasRangeLabels
  } = props

  // Local input state — updates immediately for responsive typing
  const [localQuery, setLocalQuery] = React.useState(searchQuery)

  // Sync local state if parent clears the query (e.g. on poll refresh)
  React.useEffect(() => {
    if (searchQuery === '' && localQuery !== '') {
      setLocalQuery('')
    }
  }, [searchQuery])

  // Debounced callback — fires 200ms after user stops typing
  const debouncedSearch = hooks.useDebounceCallback((query: string) => {
    onSearchChange(query)
  }, 200)

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    debouncedSearch(value)
  }, [debouncedSearch])

  const handleClear = React.useCallback(() => {
    setLocalQuery('')
    onSearchChange('')
  }, [onSearchChange])

  // Direction toggle — active for real sort fields and range label sort (not feed order / reverse)
  const isFieldSort = sortField !== '' && sortField !== '__reverse__'

  const handleDirectionToggle = React.useCallback(() => {
    onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')
  }, [onSortChange, sortField, sortDirection])

  // Sort field options — use sortableFields if configured, otherwise all fields
  const sortFields = sortableFields.length > 0 ? sortableFields : allFieldNames

  // Sort controls are packaged with search — if search is off, the whole toolbar hides
  if (!enableSearch) return null

  const isFiltered = searchQuery.trim() !== ''

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 0px;
      background: var(--sys-color-surface-background, rgba(0, 0, 0, 0.02));
      border-bottom: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
      border-radius: var(--sys-shape-2, 4px) var(--sys-shape-2, 4px) 0 0;
    `}>
      {/* Controls row — search input + sort controls */}
      <div css={css`
        display: flex;
        align-items: center;
        gap: 8px;
      `}>
        {/* Search input — borderless style */}
        {enableSearch && (
          <div css={css`
            flex: 1;
            min-width: 0;
            .jimu-input {
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
              height: 32px;
              font-size: 13px;
            }
            /* Prevent iOS Safari auto-zoom on input focus (triggers at < 16px) */
            @media (max-width: 1024px) {
              .jimu-input,
              .jimu-input input {
                font-size: 16px !important;
              }
            }
          `}>
            <TextInput
              className='w-100'
              size='sm'
              type='text'
              placeholder={searchPlaceholder || 'Search...'}
              value={localQuery}
              onChange={handleChange}
              allowClear
              onAcceptValue={(value: string) => {
                if (value === '') {
                  handleClear()
                }
              }}
            />
          </div>
        )}

        {/* Sort controls — compact inline group, flush against Select */}
        {enableSort && sortFields.length > 0 && (
          <div css={css`
            display: flex;
            align-items: center;
            flex-shrink: 0;
          `}>
            <Select
              size='sm'
              value={sortField || ''}
              placeholder='Sort'
              onChange={(e) => { onSortChange(e.target.value, sortDirection) }}
              css={css`
                min-width: 100px;
                max-width: 150px;
                font-size: 12px;
                height: 32px;
                /* Prevent iOS Safari auto-zoom on select focus */
                @media (max-width: 1024px) {
                  font-size: 16px;
                }
              `}
            >
              <Option value=''>Feed order</Option>
              <Option value='__reverse__'>Reverse feed order</Option>
              {hasRangeLabels && (
                <Option value='__rangeLabel__'>Range label</Option>
              )}
              {sortFields.map(field => (
                <Option key={field} value={field}>
                  {field}
                </Option>
              ))}
            </Select>
            {isFieldSort && (
              <Button
                type='tertiary'
                size='sm'
                icon
                onClick={handleDirectionToggle}
                title={sortDirection === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'}
                css={css`
                  width: 28px;
                  height: 26px;
                  min-width: 28px;
                  padding: 0;
                  margin-top: -5px;
                  align-items: start;
                `}
              >
                {sortDirection === 'asc' ? <SortAscendingArrowOutlined /> : <SortDescendingArrowOutlined />}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results label — shown when search is active */}
      {isFiltered && (
        <div css={css`
          font-size: 12px;
          color: var(--sys-color-text-tertiary, #888);
          padding: 0 2px;
          line-height: 1;
        `}>
          {filteredCount} of {totalCount} {itemLabel}
        </div>
      )}
    </div>
  )
}
