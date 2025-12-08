import { React, uuidv1 } from 'jimu-core'
import { Button, type ButtonProps } from 'jimu-ui'
import { SidePopper } from 'jimu-ui/advanced/setting-components'

interface Props {
  buttonText: string
  buttonProps?: ButtonProps
  buttonDescription?: string
  widgetId: string
  sidePopperTitle: string
  children: React.ReactNode
}

const ButtonWithSidePopper = (props: Props) => {
  const { buttonText, buttonProps = {}, sidePopperTitle, buttonDescription, widgetId, children } = props
  const importButtonRef = React.useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = React.useState(false)
  const openSidePopper = () => {
    if (!isOpen) {
      setIsOpen(true)
    }
  }
  const closeSidePopper = () => {
    if (isOpen) {
      setIsOpen(false)
    }
  }

  const [descId] = React.useState(`${widgetId}-button-description-${uuidv1()}`)

  return <React.Fragment>
    <Button
      type="primary"
      ref={importButtonRef}
      onClick={openSidePopper}
      aria-describedby={descId}
      {...buttonProps}
    >
      {buttonText}
    </Button>
    <span className='sr-only' id={descId}>{buttonDescription}</span>

    <SidePopper
      position='right' title={sidePopperTitle} aria-label={sidePopperTitle}
      isOpen={isOpen} toggle={closeSidePopper} trigger={importButtonRef.current}
    >
      {children}
    </SidePopper>
  </React.Fragment>
}

export default ButtonWithSidePopper
