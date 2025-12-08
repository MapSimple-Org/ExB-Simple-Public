/** @jsx jsx */
import { Popper,hooks as uiHooks, type TargetType, type SizeOptions } from 'jimu-ui'
import { React, jsx, css, classNames, ReactRedux, type IMState, WidgetState, hooks, lodash, focusElementInKeyboardMode } from 'jimu-core'
import { getStyle } from '../../style/popper-style'
import { useTheme } from 'jimu-theme'
import { DEFAULT_POPPER_OFFSET } from '../../../config'
const { useEffect, useRef } = React

interface Props {
  id: string
  reference: TargetType
  isOpen: boolean
  isFocusWithSearchInput?: boolean
  searchInputRef?: any
  children?: React.ReactNode
  autoFocus?: boolean
  className?: string
  offset?: [number, number]
  containerEventPreventDefault?: boolean
  differentWithReferenceWidth?: boolean
  toggle?: (e) => void
}

const sizeOptions: SizeOptions = {
  apply({ elements, rects }) {
    const referenceWidth = rects.reference.width
    if (referenceWidth) {
      (elements.floating as any).style.width = `${referenceWidth}px`
    }
  }
}

const sizeOptionsOfCompactStyle: SizeOptions = {
  apply({ elements, rects }) {
    if ((elements.floating as any).style.width !== '33px') {
      (elements.floating as any).style.width = '33px'
    }
  }
}

const POPPER_STYLE = css`
  border-radius: var(--sys-shape-2);
  overflow: hidden;
  &:has(.result-list-con-compact-close) {
    border-radius: 0 0 var(--sys-shape-2) var(--sys-shape-2) !important;
  }
`

const ResultPopper = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const focusTimeoutRef = useRef<any>(null)
  const { children, isOpen, reference, searchInputRef, autoFocus, className, differentWithReferenceWidth, isFocusWithSearchInput, id, offset, containerEventPreventDefault, toggle } = props
  const theme = useTheme()
  const isClassicTheme = uiHooks.useClassicTheme()

  const stateInControllerWidget = ReactRedux.useSelector((state: IMState) => {
    const widgetsRuntimeInfo = state?.widgetsRuntimeInfo
    return widgetsRuntimeInfo?.[id]?.state
  })

  useEffect(() => {
    if (searchInputRef?.current) {
      isFocusWithSearchInput && searchInputRef.current?.addEventListener('keydown', handleSearchInputKeyDown, true)
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isFocusWithSearchInput && searchInputRef.current?.removeEventListener('keydown', handleSearchInputKeyDown, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearchInputKeyDown = hooks.useEventCallback((e) => {
    if (!isOpen) {
      return false
    }
    const items = getMenuItems() || []
    const itemLength = items?.length - 1
    if (e.key === 'ArrowUp') {
      focusTimeoutRef.current = setTimeout(() => {
        focusElementInKeyboardMode(items[itemLength])
      })
    } else if (e.key === 'ArrowDown') {
      focusTimeoutRef.current = setTimeout(() => {
        focusElementInKeyboardMode(items[0])
      })
    }
  })

  const handleKeyDown = hooks.useEventCallback((e) => {
    if (!isOpen) {
      return
    }
    const isTargetMenuItem = e.target.getAttribute('role') === 'button' || e.target.getAttribute('role') === 'option'
    if (!['Tab', 'ArrowUp', 'ArrowDown', 'Escape'].includes(e.key)) {
      return
    }

    if (((e.which >= 48) && (e.which <= 90)) || e.key === 'Tab') {
      e.preventDefault()
    }

    if (isOpen && isTargetMenuItem) {
      clearTimeout(focusTimeoutRef.current)
      if (e.key === 'Escape') {
        handleEscEvent(e)
      } else if (
        ['ArrowUp', 'ArrowDown', 'Tab'].includes(e.key) || (['n', 'p'].includes(e.key) && e.ctrlKey)
      ) {
        const $menuitems = getMenuItems()
        let index = $menuitems.indexOf(e.target)
        let isArrowUp = false
        if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey) || (e.key === 'Tab' && (e.shiftKey || $menuitems.length === 1))) {
          index = index !== 0 ? index - 1 : $menuitems.length - 1
          isArrowUp = true
        } else if (e.key === 'ArrowDown' || e.key === 'Tab' || (e.key === 'n' && e.ctrlKey)) {
          isArrowUp = false
          index = index === $menuitems.length - 1 ? 0 : index + 1
        }

        const isArrowUpToInput = (index === 0 && !isArrowUp)
        const isArrowDownToInput = (index === $menuitems.length - 1 && isArrowUp)
        if (isFocusWithSearchInput && (isArrowUpToInput || isArrowDownToInput)) {
          focusTimeoutRef.current = setTimeout(() => {
            focusElementInKeyboardMode(searchInputRef.current, true)
          })
        } else {
          focusElementInKeyboardMode(Array.prototype.slice.call(containerRef.current.querySelectorAll('.popper-box'))[0], true)
          focusTimeoutRef.current = setTimeout(() => {
            focusElementInKeyboardMode($menuitems[index], true)
          })
        }
        if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault()
        }
      } else if (e.key === 'End') {
        const $menuitems = getMenuItems()
        focusTimeoutRef.current = setTimeout(() => {
          focusElementInKeyboardMode($menuitems[$menuitems.length - 1], true)
        })
      } else if (e.key === 'Home') {
        const $menuitems = getMenuItems()
        focusTimeoutRef.current = setTimeout(() => {
          focusElementInKeyboardMode($menuitems[0], true)
        })
      } else if ((e.which >= 48) && (e.which <= 90)) {
        const $menuitems = getMenuItems()
        const charPressed = String.fromCharCode(e.which).toLowerCase()
        for (let i = 0; i < $menuitems.length; i += 1) {
          const firstLetter = $menuitems[i].textContent && $menuitems[i].textContent[0].toLowerCase()
          if (firstLetter === charPressed) {
            focusTimeoutRef.current = setTimeout(() => {
              focusElementInKeyboardMode($menuitems[i], true)
            })
            break
          }
        }
      }
    }
  })

  const handleEscEvent = (e) => {
    e.preventDefault()
    togglePopper(e)
    lodash.defer(() => {
      focusElementInKeyboardMode(searchInputRef?.current, true)
    })
  }

  const getMenuItems = () => {
    return containerRef ? Array.prototype.slice.call(containerRef.current.querySelectorAll('[role="button"], [role="option"]')).filter(item => !item.disabled) : []
  }

  const togglePopper = (e) => {
    toggle(e)
    if (e?.key === 'Escape') {
      lodash.defer(() => {
        focusElementInKeyboardMode(searchInputRef?.current)
      })
    }
  }

  const handleMouseDown = (e) => {
    if (containerEventPreventDefault) {
      e.preventDefault()
    }
  }

  return (
    <div>
      <Popper
        autoFocus={autoFocus}
        placement='bottom-start'
        open={isOpen}
        toggle={togglePopper}
        reference={reference}
        autoUpdate
        offsetOptions={offset || DEFAULT_POPPER_OFFSET}
        ref={containerRef}
        sizeOptions={differentWithReferenceWidth ? sizeOptionsOfCompactStyle: sizeOptions}
        forceLatestFocusElements
        css={POPPER_STYLE}
      >
        <div
          onMouseDown={handleMouseDown}
          css={getStyle(theme, reference, isClassicTheme)}
          role='alert'
          aria-live='assertive'
          className={classNames('result-list-popper', className, { 'hide-popper': stateInControllerWidget === WidgetState.Closed })}
        >
          <div style={{userSelect: "none"}} onKeyDown={handleKeyDown}>
            {children}
          </div>
        </div>
      </Popper>
    </div>
  )
}

export default ResultPopper
