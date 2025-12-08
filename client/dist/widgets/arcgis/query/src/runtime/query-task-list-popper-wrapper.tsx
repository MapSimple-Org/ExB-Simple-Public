/** @jsx jsx */
import { jsx, css, React, type IconResult, type ImmutableObject, lodash, classNames, hooks, isKeyboardMode, focusElementInKeyboardMode } from 'jimu-core'
import { Button, Icon, MobilePanel, type Size, type ButtonType, FOCUSABLE_CONTAINER_CLASS, FloatingPanel, type ShiftOptions } from 'jimu-ui'

export interface TaskListPopperWrapperProps {
  id: number
  icon?: string | ImmutableObject<IconResult>
  label?: string
  forceClose?: boolean
  popperTitle?: string
  buttonType?: ButtonType
  onWidthChange?: (id: number, width: number) => void
  onOpenedChange?: (id: number, isOpen: boolean) => void
  minSize: Size
  defaultSize: Size
  children: React.ReactElement<any>
}

const shiftOptions: ShiftOptions = { padding: 1 }

export function TaskListPopperWrapper (props: TaskListPopperWrapperProps) {
  const { id, icon, label, forceClose, onOpenedChange, popperTitle, minSize, defaultSize, onWidthChange, buttonType = 'tertiary', children } = props
  const iconRef = React.useRef<HTMLButtonElement>(undefined)
  const widthRef = React.useRef(0)
  const [isOpen, setIsOpen] = React.useState(false)
  const [popperVersion, setPopperVersion] = React.useState(0)
  const isMobile = hooks.useCheckSmallBrowserSizeMode()

  React.useEffect(() => {
    if (forceClose) {
      setIsOpen(false)
    }
  }, [forceClose])

  hooks.useEffectOnce(() => {
    if (typeof onWidthChange === 'function') {
      widthRef.current = Math.round(iconRef.current.clientWidth)
      onWidthChange(id, widthRef.current)
      const resizeObserver = new ResizeObserver(lodash.throttle((entries) => {
        const width = Math.round(entries[0].contentRect.width)
        if (widthRef.current !== width) {
          widthRef.current = width
          onWidthChange(id, width)
        }
      }, 200))
      resizeObserver.observe(iconRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }
  })

  const togglePopper = React.useCallback(() => {
    if (typeof onOpenedChange === 'function') {
      onOpenedChange(id, !isOpen)
    }
    setIsOpen(!isOpen)
    setPopperVersion(popperVersion + 1)
    if (isOpen) {
      setTimeout(() => {
        if (isKeyboardMode()) {
          focusElementInKeyboardMode(iconRef.current)
        }
      }, 200)
    }
  }, [id, isOpen, popperVersion, onOpenedChange])

  return (
    <div className='runtime-query__widget-popper'>
      <Button
        title={label}
        aria-label={label}
        icon size='sm'
        variant={buttonType === 'tertiary' ? 'text' : undefined}
        color={buttonType === 'tertiary' ? 'inherit' : undefined}
        type={buttonType === 'tertiary' ? undefined : buttonType}
        ref={iconRef}
        onClick={togglePopper}
      >
        {icon && <Icon
          size={16}
          {...(typeof icon === 'string' ? { icon } : { icon: icon.svg, color: buttonType === 'tertiary' ? undefined : icon.properties.color })}
        />}
        {label && <div
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-word;
            word-wrap: break-word;
            line-height: 1.2;
          `}
          className={classNames({ 'ml-2': icon != null })}>{label}</div>}
      </Button>
      {isMobile
        ? <MobilePanel open={isOpen} title={popperTitle} onClose={togglePopper}>
            {children}
          </MobilePanel>
        : <FloatingPanel
            className='ui-unit-popper ui-unit-popper_k-arrangement-icon flex-grow-1'
            headerClassName={FOCUSABLE_CONTAINER_CLASS}
            open={isOpen}
            onHeaderClose={togglePopper}
            toggle={togglePopper}
            headerTitle={popperTitle}
            minSize={minSize}
            defaultSize={defaultSize}
            dragBounds='body'
            version={popperVersion}
            reference={iconRef}
            placement='bottom-start'
            shiftOptions={shiftOptions}
          >
            {children}
          </FloatingPanel>
      }
    </div>
  )
}
