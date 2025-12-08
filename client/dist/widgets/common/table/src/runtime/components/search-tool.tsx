import { React, type IMThemeVariables, css, hooks, defaultMessages as jimuCoreMessages, focusElementInKeyboardMode } from 'jimu-core'
import defaultMessages from '../translations/default'
import { Button, Popper, TextInput } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

export interface Props {
  // This value is true when widget width is less than SEARCH_TOOL_MIN_SIZE, and tool will display the mode that pops up when clicked by the button
  searchToolTowed: boolean
  hint?: string
  tableLoaded: boolean
  searchText: string
  handleSearchChange: (searchText: string) => void
  closeSuggestionAndSearch: () => void
  closeSuggestion: () => void
}

const getStyles = (theme: IMThemeVariables) => css`
  &.table-search-div{
    .table-search{
      .search-icon{
        z-index: 2;
      }
      .search-input{
        .input-wrapper{
          height: 30px;
        }
        input::placeholder {
          color: ${theme.sys.color.action.inputField.text};
        }
      }
    }
  }
`

const SearchTool = (props: Props) => {
  const { searchToolTowed, hint, tableLoaded, searchText, handleSearchChange, closeSuggestionAndSearch, closeSuggestion } = props
  const [isSearchPopperOpen, setIsSearchPopperOpen] = React.useState(false)
  const searchPopupRef = React.useRef<HTMLButtonElement>(null)
  const translate = hooks.useTranslation(defaultMessages, jimuCoreMessages)
  const theme = useTheme()
  const searchHint = hint || translate('search')

  const handleKeyDown = evt => {
    if (!evt || !evt.target) return
    if (evt.key === 'Enter') {
      closeSuggestionAndSearch()
    }
  }

  const getTextInputPrefixElement = () => {
    return (
      <SearchOutlined color={theme.sys.color.action.inputField.text} />
    )
  }

  return (
    <div className='table-search-div' css={getStyles(theme)}>
      {searchToolTowed
        ? (
          <div className='table-search-popper'>
            <Button
              type='tertiary'
              icon
              size='sm'
              className='tools-menu'
              title={translate('openSearch')}
              aria-label={translate('openSearch')}
              onClick={evt => {
                setIsSearchPopperOpen(!isSearchPopperOpen)
              }}
              ref={searchPopupRef}
            >
              <SearchOutlined color={'var(--sys-color-surface-paper-text)'} />
            </Button>
            <Popper
              placement='right-start'
              reference={searchPopupRef.current}
              offsetOptions={[-10, -30]}
              open={isSearchPopperOpen}
              arrowOptions={false}
              hideOptions={false}
            >
              <div className='d-flex align-items-center table-popup-search m-2'>
                <Button
                  type='tertiary'
                  icon
                  size='sm'
                  onClick={evt => {
                    closeSuggestion()
                    setIsSearchPopperOpen(false)
                    focusElementInKeyboardMode(searchPopupRef.current, true)
                  }}
                  className='search-back mr-1'
                  title={translate('closeSearch')}
                  aria-label={translate('closeSearch')}
                >
                  <ArrowLeftOutlined color={'var(--sys-color-surface-overlay-text)'} />
                </Button>
                <TextInput
                  className='popup-search-input'
                  placeholder={searchHint}
                  onChange={e => { handleSearchChange(e.target.value) }}
                  value={searchText || ''}
                  onKeyDown={e => { handleKeyDown(e) }}
                  prefix={getTextInputPrefixElement()}
                  allowClear
                  title={searchHint}
                  disabled={!tableLoaded}
                  aria-label={searchHint}
                />
              </div>
            </Popper>
          </div>
          )
        : (
          <div className='d-flex align-items-center table-search'>
            <TextInput
              className='search-input'
              placeholder={searchHint}
              onChange={e => { handleSearchChange(e.target.value) }}
              value={searchText || ''}
              onKeyDown={e => { handleKeyDown(e) }}
              prefix={getTextInputPrefixElement()}
              allowClear
              title={searchHint}
              disabled={!tableLoaded}
              aria-label={searchHint}
            />
          </div>
          )}
    </div>
  )
}

export default SearchTool
