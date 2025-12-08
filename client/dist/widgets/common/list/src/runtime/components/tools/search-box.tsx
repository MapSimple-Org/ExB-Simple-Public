/** @jsx jsx */
import {
  React,
  type IMThemeVariables,
  type SerializedStyles,
  css,
  jsx,
  polished,
  esri,
  AppMode,
  focusElementInKeyboardMode
} from 'jimu-core'
import { TextInput, Button, Popper, Loading, LoadingType } from 'jimu-ui'
import type { Suggestion } from '../../../config'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()

interface Props {
  theme: IMThemeVariables
  placeholder?: string
  searchText?: string
  onSearchTextChange?: (searchText: string) => void
  formatMessage?: (id: string) => string
  onSubmit?: (searchText: string, isEnter: boolean) => void
  showClear?: boolean
  hideSearchIcon?: boolean
  inputRef?: (ref: HTMLInputElement) => void
  searchSuggestion: Suggestion[]
  suggestionWidth: number
  showLoading: boolean
  isShowBackButton?: boolean
  appMode: AppMode
  toggleSearchBoxVisible?: (isVisible: boolean) => void
}

interface Stats {
  searchText: string
  isShowSuggestion: boolean
}

export default class SearchBox extends React.PureComponent<
Props & React.InputHTMLAttributes<HTMLInputElement>,
Stats
> {
  reference: HTMLDivElement
  suggestionRequestTimeout: any
  containerRef: HTMLDivElement
  searchInputRef: HTMLElement
  focusTimeout: any
  constructor (props) {
    super(props)
    this.state = {
      searchText: props.searchText || '',
      isShowSuggestion: false
    }
  }

  componentDidUpdate (preProps) {
    if (
      this.props.searchText !== preProps.searchText &&
      this.props.searchText !== this.state.searchText
    ) {
      const { searchText } = this.props
      this.setState({
        searchText: searchText
      })
    }
    if (this.props?.appMode === AppMode.Design && this.state.isShowSuggestion) {
      this.setState({
        isShowSuggestion: false,
        searchText: ''
      })
    }
  }

  handleChange = searchText => {
    this.setState(
      {
        searchText: searchText,
        isShowSuggestion: searchText?.length > 2
      },
      () => {
        const { onSearchTextChange } = this.props
        if (onSearchTextChange) {
          onSearchTextChange(searchText)
        }
      }
    )
  }

  handleSubmit = (value, isEnter = false) => {
    const { onSubmit } = this.props
    if (onSubmit) {
      onSubmit(value, isEnter)
    }
  }

  onKeyUp = evt => {
    if (!evt || !evt.target) return
    const { isShowSuggestion } = this.state
    if (evt.key === 'Enter') {
      this.setState({
        isShowSuggestion: false
      })
      this.handleSubmit(evt.target.value, true)
    }
    if (isShowSuggestion) {
      const items = this.getMenuItems() || []
      const itemLength = items?.length - 1
      if (evt.key === 'ArrowUp') {
        setTimeout(() => {
          focusElementInKeyboardMode(items[itemLength], true)
        })
      } else if (evt.key === 'ArrowDown') {
        setTimeout(() => {
          focusElementInKeyboardMode(this.containerRef, true)
          focusElementInKeyboardMode(items[0], true)
        })
      }
    }
  }

  onSuggestionConfirm = suggestion => {
    this.setState(
      {
        searchText: suggestion,
        isShowSuggestion: false
      },
      () => {
        this.handleSubmit(suggestion)
        this.props?.toggleSearchBoxVisible(true)
      }
    )
  }

  handleClear = evt => {
    this.setState({
      searchText: ''
    })
    evt.stopPropagation()
  }

  getStyle = (): SerializedStyles => {
    const { theme } = this.props

    return css`
      position: relative;
      .search-input {
        margin-bottom: 2px;
        padding-left: 3px;
        border: 0;
        background: transparent;
        height: ${polished.rem(26)};
        min-width: 0;
        .input-wrapper {
          color: inherit !important;
          background: transparent;
          border: none;
          padding: 0;
          height: 100%;
        }
        input::placeholder {
          color: inherit !important;
          opacity: 0.6;
        }
      }
      .search-input:focus {
        background: transparent;
      }
      .search-loading-con {
        width: 13px;
        height: 13px;
      }
      .clear-search, .search-back {
        cursor: pointer;
        padding: ${polished.rem(6)};
        background: none;
        border: none;
        color: ${theme.sys.color.action.text};
      }
      .search-back {
        margin-left: ${polished.rem(-6)};
      }
      .clear-search:hover {
        background: none;
      }
    `
  }

  getSuggestionListStyle = (): SerializedStyles => {
    const { suggestionWidth } = this.props
    return css`
      & {
        max-height: ${polished.rem(300)};
        min-width: ${polished.rem(suggestionWidth)};
        overflow: auto;
      }
      button {
        display: block;
        width: 100%;
        text-align: left;
        border: none;
        border-radius: 0;
      }
      .suggestion-item:focus {
        background: var(--sys-color-action-hover);
        color: var(--sys-color-action-text);
      }
      button:hover {
        border: none;
      }
      .color-inherit { color: inherit !important;}
    `
  }

  clearSearchText = () => {
    const { searchText } = this.state
    if (searchText) {
      this.handleChange('')
      this.setState({
        isShowSuggestion: false
      })
    }
  }

  getMenuItems = () => {
    return this.containerRef ? Array.prototype.slice.call(this.containerRef.querySelectorAll('[role="button"]')).filter(item => !item.disabled) : []
  }

  getTextInputSuffixElement = () => {
    const { showLoading, formatMessage } = this.props
    const { searchText } = this.state
    return (
      <div className='d-flex align-items-center'>
        {showLoading && <div className='position-relative search-loading-con'>
          <Loading type={LoadingType.Donut} width={13} height={13}/>
        </div>}
        {searchText && (
          <Button
            className='clear-search color-inherit'
            icon
            size='sm'
            type='tertiary'
            onClick={this.clearSearchText}
            title={formatMessage('clearSearch')}
            aria-label={formatMessage('clearSearch')}
          >
            <CloseOutlined size={14}/>
          </Button>
        )}
      </div>
    )
  }

  getTextInputPrefixElement = () => {
    const { formatMessage } = this.props
    return (
      <Button
        type='tertiary'
        icon
        size='sm'
        title={formatMessage('SearchLabel')}
        aria-label={formatMessage('SearchLabel')}
        className='color-inherit'
        onClick={evt => { this.handleSubmit(this.state.searchText) }}
      >
        <SearchOutlined size={16}/>
      </Button>
    )
  }

  handlePopperKeyDown = (e) => {
    const { isShowSuggestion } = this.state
    if (!isShowSuggestion) {
      return
    }
    const isTargetMenuItem = e.target.getAttribute('role') === 'button'
    if (!['Tab', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return
    }

    if (((e.which >= 48) && (e.which <= 90)) || e.key === 'Tab') {
      e.preventDefault()
    }

    if (isShowSuggestion && isTargetMenuItem) {
      if (e.key === 'Escape') {
        this.handleEscEvent(e)
      } else if (
        ['ArrowUp', 'ArrowDown'].includes(e.key) || (['n', 'p'].includes(e.key) && e.ctrlKey)
      ) {
        const $menuitems = this.getMenuItems()
        let index = $menuitems.indexOf(e.target)
        let isArrowUp = false
        if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
          index = index !== 0 ? index - 1 : $menuitems.length - 1
          isArrowUp = true
        } else if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
          isArrowUp = false
          index = index === $menuitems.length - 1 ? 0 : index + 1
        }

        const isArrowUpToInput = (index === 0 && !isArrowUp)
        const isArrowDownToInput = (index === $menuitems.length - 1 && isArrowUp)
        clearTimeout(this.focusTimeout)
        if (isArrowUpToInput || isArrowDownToInput) {
          this.focusTimeout = setTimeout(() => {
            focusElementInKeyboardMode(this.searchInputRef, true)
          })
        } else {
          this.focusTimeout = setTimeout(() => {
            focusElementInKeyboardMode(this.containerRef, true)
            focusElementInKeyboardMode($menuitems[index], true)
          })
        }
      } else if (e.key === 'End') {
        const $menuitems = this.getMenuItems()
        focusElementInKeyboardMode($menuitems[$menuitems.length - 1], true)
      } else if (e.key === 'Home') {
        const $menuitems = this.getMenuItems()
        focusElementInKeyboardMode($menuitems[0], true)
      } else if ((e.which >= 48) && (e.which <= 90)) {
        const $menuitems = this.getMenuItems()
        const charPressed = String.fromCharCode(e.which).toLowerCase()
        for (let i = 0; i < $menuitems.length; i += 1) {
          const firstLetter = $menuitems[i].textContent && $menuitems[i].textContent[0].toLowerCase()
          if (firstLetter === charPressed) {
            focusElementInKeyboardMode($menuitems[i], true)
            break
          }
        }
      }
    }
  }

  handleEscEvent = (e) => {
    const { isShowSuggestion } = this.state
    e.preventDefault()
    this.setState({ isShowSuggestion: !isShowSuggestion })
    focusElementInKeyboardMode(this.searchInputRef)
  }

  setInputRef = (ref) => {
    const { inputRef } = this.props
    this.searchInputRef = ref
    inputRef && inputRef(ref)
  }

  render () {
    const {
      placeholder,
      className,
      showClear,
      hideSearchIcon,
      onFocus,
      onBlur,
      searchSuggestion,
      formatMessage,
      isShowBackButton
    } = this.props
    const { searchText, isShowSuggestion } = this.state

    return (
      <div className='w-100' ref={ref => { this.reference = ref }}>
        <div
          css={this.getStyle()}
          className={`d-flex align-items-center ${className}`}
        >
          {isShowBackButton && (
            <Button
              className='search-back color-inherit'
              icon
              size='sm'
              onClick={evt => {
                this.props?.toggleSearchBoxVisible(false)
              }}
              type='tertiary'
              title={formatMessage('topToolBack')}
              aria-label={formatMessage('topToolBack')}
            >
              <ArrowLeftOutlined size={20}/>
            </Button>
          )}
          <TextInput
            className='search-input flex-grow-1'
            ref={ref => { this.setInputRef(ref) }}
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={e => { this.handleChange(e.target.value) }}
            onBlur={onBlur}
            onFocus={onFocus}
            title={searchText || placeholder}
            value={searchText || ''}
            onKeyDown={e => { this.onKeyUp(e) }}
            prefix={(!hideSearchIcon && !isShowBackButton) && this.getTextInputPrefixElement()}
            suffix={this.getTextInputSuffixElement()}
          />
          {showClear && (
            <Button className='color-inherit' id='test-focus' icon size='sm' onClick={this.handleSubmit} aria-label={formatMessage('clearSearch')}>
              <CloseOutlined size={12}/>
            </Button>
          )}
        </div>
        <div>
          <Popper
            css={this.getSuggestionListStyle()}
            placement='bottom-start'
            reference={this.reference}
            offsetOptions={8}
            open={isShowSuggestion && searchSuggestion?.length > 0}
            autoFocus={false}
            hideOptions={false}
            toggle={e => {
              this.setState({ isShowSuggestion: !isShowSuggestion })
            }}
          >
            <div ref={ref => { this.containerRef = ref }} aria-live='assertive' role='alert' onKeyDown={this.handlePopperKeyDown}>
              {searchSuggestion.map((suggestion, index) => {
                const suggestionHtml = sanitizer.sanitize(
                  suggestion.suggestionHtml
                )
                return (
                  <Button
                    key={index}
                    type='tertiary'
                    size='sm'
                    role='button'
                    title={suggestion?.suggestion}
                    aria-label={suggestion?.suggestion}
                    className='suggestion-item color-inherit'
                    onClick={() => {
                      this.onSuggestionConfirm(suggestion.suggestion)
                    }}
                  >
                    <div className='w-100' dangerouslySetInnerHTML={{ __html: suggestionHtml }}></div>
                  </Button>
                )
              })}
            </div>
          </Popper>
        </div>
      </div>
    )
  }
}
