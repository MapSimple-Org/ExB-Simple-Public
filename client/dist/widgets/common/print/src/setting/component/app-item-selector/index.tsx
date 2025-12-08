/** @jsx jsx */
import { React, hooks, jsx, classNames, css, type AppInfo, Immutable, type ImmutableArray, polished, SessionManager, focusElementInKeyboardMode } from 'jimu-core'
import { Dropdown, DropdownButton, DropdownMenu, TextInput, type DropdownButtonProps, DropdownItem, type DropdownMenuProps, type Strategy, defaultMessages as jimuUiDefaultMessage, type ShiftOptions } from 'jimu-ui'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { searchItemByPortalUrl, intersectionObserver } from './utils'
import { styled } from 'jimu-theme'
import type { ActiveItem } from '../../../config'

interface AppItemSelectorProps {
  /**
   * Callback fired when the item is checked or unchecked.
   */
  portalUrl: string
  /** @ignore */
  className?: string
  /**
   * The types of item
   */
  itemtype?: string
  /**
   * Do not search for items of this type
   */
  excludeType?: string
  /**
   * Active items
   */
  activeItem?: ActiveItem
  /**
   * placeholder
   */
  placeholder?: string
  /**
   * Callback fired when the item is checked or unchecked.
   */
  onChange?: (valueObj: AppInfo) => void
  /**
   * See {@link DropdownButtonProps} for details.
   */
  title?: string
  /**
   * Whether to hide search input.
   * @default false
   */
  hideSearchInput?: boolean
  /**
   * Defines the size of the dropdown button.
   * @default default
   */
  size?: 'default' | 'sm' | 'lg'
  /**
   * See {@link DropdownButtonProps} for details.
   */
  'aria-label'?: string
  /**
   * See {@link DropdownButtonProps} for details.
   */
  'a11y-description'?: string
  /**
   * Applies to the internal DropdownButton component, except `size` property.
   * See {@link DropdownButtonProps} for details.
   */
  buttonProps?: Omit<DropdownButtonProps, 'size'>
  /**
   * Applies to the internal DropdownMenu component.
   * See {@link DropdownMenuProps} for details.
   */
  menuProps?: DropdownMenuProps
  /**
   * Control multi-select's z-index,
   * but if appendToBody is true, it'll be invalid
   */
  zIndex?: number
  /**
   * If `true`, the dropdown will take the full width of its parent container.
   */
  fluid?: boolean
  /**
   * See {@link DropdownProps} for details.
   */
  autoWidth?: boolean
  /**
   * Whether to put dropdown menu to body by ReactDOM.createPortal
   * @default true
   */
  appendToBody?: boolean
  /**
   * Describes the positioning strategy to use.
   * @default absolute
   */
  strategy?: Strategy
  /**
   * Whether to trigger click event in onkeyUp stage for `DropdownButton` and `DropdownItem`.
   * @default false
   * @ignore
   */
  useKeyUpEvent?: boolean
}

const shiftOptions: ShiftOptions = {
  crossAxis: true
}

const STYLE = css`
  .dropdown >.dropdown-button:hover,  .dropdown >.dropdown-button{
    background: var(--ref-palette-neutral-300);
    border: 1px solid var(--ref-palette-neutral-300);
    border-radius: ${polished.rem(2)};
    text-align: left;
  }
`

const StyledDropdownMenu = styled(DropdownMenu)`
  & .dropdown-item-con{
    max-height: ${polished.rem(400)};
    max-width: ${polished.rem(300)};
    min-width: ${polished.rem(227)};
    overflow: auto;
  }
  .search-container{
    padding: 0 0.5rem 0.5rem 0.5rem;
  }
  .loading-placeholder, .loading-con {
    width: ${polished.rem(16)};
    height: ${polished.rem(16)};
  }
  .loading-con {
    @keyframes loading {
      0% {transform: rotate(0deg)};
      100% {transform: rotate(360deg)};
    }
    position: absolute;
    right: ${polished.rem(8)};
    bottom: ${polished.rem(2)};
    min-width: ${polished.rem(16)};
    border: 2px solid var(--ref-palette-neutral-1000);
    border-radius: 50%;
    border-top: 2px solid var(--sys-color-primary-main);
    box-sizing: border-box;
    animation:loading 2s infinite linear;
    box-sizing: border-box;
  }
`

const { useState, useRef, useEffect } = React
export const AppItemSelector = (props: AppItemSelectorProps) => {
  const dropdownBtnRef = useRef(null)
  const searchRef = useRef(null)
  const firstMenuItemRef = useRef(null)
  const startNumberRef = useRef(1)
  const searchTextRef = useRef('')
  const appItemsRef = useRef(Immutable([]) as ImmutableArray<AppInfo>)
  const searchItemTimeoutRef = useRef(null)
  const scrollMarkElementRef = useRef(null)
  const portalUrlRef = useRef(null)

  const nls = hooks.useTranslation(jimuUiDefaultMessage)
  const { portalUrl, title, className, size, buttonProps, menuProps, zIndex, fluid, autoWidth, appendToBody, strategy, useKeyUpEvent, hideSearchInput, itemtype, activeItem, placeholder, excludeType, onChange } = props

  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [appItems, setAppItems] = useState(Immutable([]) as ImmutableArray<AppInfo>)

  useEffect(() => {
    portalUrlRef.current = portalUrl
    searchItem()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalUrl])

  const onTogglePopper = () => {
    setIsOpen(!isOpen)
  }

  const searchItem = hooks.useEventCallback(() => {
    if (startNumberRef.current < 0 || !portalUrlRef.current) return
    const session = SessionManager.getInstance().getSessionByUrl(portalUrlRef.current)
    const searchOption = {
      searchText: searchText,
      start: startNumberRef.current,
      searchItemtype: itemtype || 'Layout',
      portalUrl: portalUrlRef.current,
      excludeType: excludeType
    } as any
    if (session) {
      searchOption.authentication = session
    }
    setShowLoading(true)
    searchItemByPortalUrl(searchOption).then(res => {
      setShowLoading(false)
      if (res) {
        let newAppItems = startNumberRef.current === 1 ? [] : appItemsRef.current?.asMutable({ deep: true })
        startNumberRef.current = res?.nextStart
        const newAppItem = res?.results || []
        newAppItems = newAppItems.concat(newAppItem as any)
        appItemsRef.current = Immutable(newAppItems)
        setAppItems(Immutable(newAppItems))
      }
    }).catch(err => {
      setShowLoading(false)
    })
  })

  const onTextChange = e => {
    startNumberRef.current = 1
    searchTextRef.current = e.target.value
    setSearchText(e.target.value)
    clearTimeout(searchItemTimeoutRef.current)
    appItemsRef.current = Immutable([])
    searchItemTimeoutRef.current = setTimeout(() => {
      searchItem()
    }, 500)
  }

  // Overwrite the tab event for dropdown menu.
  const handelTabEvent = (e) => {
    const previousFocusableNode = !hideSearchInput && searchRef.current
    // const nextFocusableNode = this.props.isMultiple && !this.props.hideBottomTools && this.showAllRef

    let nextFocusNode
    if (e.key === 'Tab' && e.shiftKey) {
      nextFocusNode = previousFocusableNode
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // nextFocusNode = this.searchMoreRef || nextFocusableNode
    }

    if (nextFocusNode) {
      e.preventDefault()
      focusElementInKeyboardMode(nextFocusNode)
      return true
    } else {
      return false
    }
  }

  const initScroll = ref => {
    if (ref && scrollMarkElementRef.current) {
      intersectionObserver(scrollMarkElementRef.current, ref, intersectionObserverCallback)
    }
  }

  const intersectionObserverCallback = (isScrollEnd = false) => {
    if (isScrollEnd && appItemsRef.current?.length > 0) {
      searchItem()
    }
  }

  const handleItemClick = (item: AppInfo) => {
    if (item.id === activeItem?.id) return
    onChange && onChange(item)
  }

  const setFirstMenuItemRef = (ref, index) => {
    if (index === 0 && ref) {
      firstMenuItemRef.current = ref
    }
  }

  const getItemList = () => {
    return (
      <div>
        {!hideSearchInput && <div className='search-container'>
          <TextInput
            prefix={<SearchOutlined />}
            allowClear
            size='sm'
            type='text'
            value={searchText}
            ref={searchRef}
            placeholder={nls('SearchLabel')}
            onChange={onTextChange}
          />
        </div>}

        <div className='dropdown-item-con' ref={ref => { initScroll(ref) }}>
          {appItems.map((item, index) => {
            return (
              <DropdownItem
                ref={ref => { setFirstMenuItemRef(ref, index) }}
                key={index}
                className='select-item text-truncate d-block text-left'
                onClick={e => { handleItemClick(item?.asMutable({ deep: true })) }}
                active={activeItem?.id === item.id}
                title={item.title}
                aria-label={item.title}
              >
                {item.title}
              </DropdownItem>
            )
          })}

          {(appItems?.length > 0 && !showLoading) && <span ref={scrollMarkElementRef}/>}

          {(appItems?.length === 0 && !showLoading) && <DropdownItem disabled aria-label={nls('noItemsFound')}>{nls('noItemsFound')}</DropdownItem>}
          {showLoading && <div className='loading-item'>
            <div className='loading-placeholder'></div>
            <div className='loading-con'/>
          </div>}
        </div>
      </div>
    )
  }

  return (
    <div className={classNames('app-item-selector-con w-100', className)} css={STYLE}>
      <Dropdown
        className='w-100' size={size} direction='down' fluid={fluid} autoWidth={autoWidth}
        toggle={onTogglePopper}
        isOpen={isOpen}
        useKeyUpEvent={useKeyUpEvent}
        handelTabEvent={handelTabEvent}
        menuRole='listbox'
        aria-label={props['aria-label']}
      >
        <DropdownButton
          size={size}
          {...buttonProps}
          innerRef={ref => { dropdownBtnRef.current = ref }}
          title={title || activeItem?.title}
          aria-describedby={props['aria-describedby']}
          a11y-description={props['a11y-description']}
          role='combobox'
        >
          {activeItem?.title || placeholder}
        </DropdownButton>
        <StyledDropdownMenu
          appendToBody={appendToBody}
          strategy={strategy}
          zIndex={zIndex}
          className='shadow-3'
          shiftOptions={shiftOptions}
          trapFocus={false}
          {...menuProps}
        >
          {portalUrl && getItemList()}
        </StyledDropdownMenu>
      </Dropdown>
    </div>
  )
}
