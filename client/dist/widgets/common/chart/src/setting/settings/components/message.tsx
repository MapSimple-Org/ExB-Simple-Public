/**@jsx jsx */
import { React, jsx, css, classNames } from 'jimu-core'
import { AlertPanel, type AlertPanelProps, hooks } from 'jimu-ui'

interface MessageProps extends Pick<AlertPanelProps, 'className' | 'type' | 'text' | 'withIcon' | 'onClose'> {}

const style = css`
  z-index: 1;
  position: absolute;
  left: 0px;
  bottom: 0px;
  > .left-part {
    max-width: calc(100% - 24px);
  }
  > div:nth-of-type(2) {
    align-self: flex-end;
  }
`

export const Message = (props: MessageProps): React.ReactElement => {
  const { className, text, type = 'info', withIcon = false, onClose } = props
  const [open, setOpen] = React.useState(!!text)
  const unmountRef = React.useRef<boolean>(false)
  hooks.useUnmount(() => { unmountRef.current = true })

  React.useEffect(() => {
    setOpen(!!text)
  }, [text])

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  return (<AlertPanel
    css={style}
    title={text}
    type={type}
    open={open}
    fullWidth={true}
    className={classNames('message', className)}
    withIcon={withIcon}
    text={text}
    closable={true}
    onClose={handleClose} />)
}
