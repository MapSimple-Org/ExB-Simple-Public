/** @jsx jsx */
import { jsx, css, React, type IconResult, type ImmutableObject, lodash, classNames, hooks, isKeyboardMode, focusElementInKeyboardMode } from 'jimu-core'
import { Button, Icon, MobilePanel, type Size, type ButtonType, FOCUSABLE_CONTAINER_CLASS, FloatingPanel, type ShiftOptions } from 'jimu-ui'
import { WIDGET_VERSION } from '../version'

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
            <div css={css`
              display: flex;
              flex-direction: column;
              height: 100%;
            `}>
              <div css={css`
                flex: 1;
                overflow: auto;
                padding-bottom: 1rem; /* Scoped padding to space content from footer */
              `}>
                {children}
              </div>
              {/* Stationary footer */}
              <div css={css`
                padding: 4px 12px;
                border-top: 1px solid var(--sys-color-divider-secondary);
                background-color: var(--sys-color-surface-paper);
                flex-shrink: 0;
                text-align: center;
              `}>
                <span css={css`
                  font-size: 0.75rem;
                  color: var(--sys-color-text-tertiary);
                  font-weight: 400;
                  letter-spacing: 0.025em;
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                `}>
                  {/* Code/Open Source Symbol */}
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    css={css`
                      flex-shrink: 0;
                      opacity: 0.6;
                    `}
                  >
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                  QuerySimple by MapSimple.org
                  <span css={css`
                    margin-left: 6px;
                    opacity: 0.5;
                    font-size: 0.7rem;
                  `}>
                    v{WIDGET_VERSION}
                  </span>
                </span>
              </div>
            </div>
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
            <div css={css`
              display: flex;
              flex-direction: column;
              height: 100%;
            `}>
              <div css={css`
                flex: 1;
                overflow: auto;
                padding-bottom: 1rem; /* Scoped padding to space content from footer */
              `}>
                {children}
              </div>
              {/* Stationary footer */}
              <div css={css`
                padding: 4px 12px;
                border-top: 1px solid var(--sys-color-divider-secondary);
                background-color: var(--sys-color-surface-paper);
                flex-shrink: 0;
                text-align: center;
              `}>
                <span css={css`
                  font-size: 0.75rem;
                  color: var(--sys-color-text-tertiary);
                  font-weight: 400;
                  letter-spacing: 0.025em;
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                `}>
                  {/* Code/Open Source Symbol */}
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    css={css`
                      flex-shrink: 0;
                      opacity: 0.6;
                    `}
                  >
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                  QuerySimple by MapSimple.org
                  <span css={css`
                    margin-left: 6px;
                    opacity: 0.5;
                    font-size: 0.7rem;
                  `}>
                    v{WIDGET_VERSION}
                  </span>
                </span>
              </div>
            </div>
          </FloatingPanel>
      }
    </div>
  )
}
