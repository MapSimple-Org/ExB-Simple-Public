/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import type { MessageProp } from '../../config'
import { CalciteNotice } from 'calcite-components'

export interface ToastProps {
  time?: number
  open: boolean
  messageProp: MessageProp
  onClose: () => void
}

export function Toast (props: ToastProps) {
  const { open, messageProp, onClose } = props

  React.useEffect(() => {
    let delay = messageProp?.time
    if (!delay) delay = 5000
    if (open) {
      setTimeout(() => {
        onClose()
      }, delay)
    }
  }, [open, onClose, messageProp?.time])

  const getIcon = (type) => {
    switch (type) {
      case 'brand':
        return 'information'
      case 'success':
        return 'checkCircle'
      case 'error':
        return 'exclamationMarkTriangle'
      case 'danger':
        return 'exclamationMarkTriangle'
      case 'warning':
        return 'exclamationMarkTriangle'
      default:
        return 'information'
    }
  }
  return (
    <div className='toast-container h-100 w-100 d-flex'>
      <div className='toast m-auto'>
        <CalciteNotice
          className='toast-notice'
          kind={messageProp.type}
          closable={true}
          icon={getIcon(messageProp.type)}
          open={true}
          scale='m'
          onCalciteNoticeClose={() => { onClose() }}
        >
          <div slot='title'>
            {messageProp.title}
          </div>
          <div slot='message'>
            <span>{messageProp.body}</span>
            {messageProp.details && (
              <div>
                <span>{messageProp.details}</span>
              </div>
            )}
          </div>
        </CalciteNotice>
      </div>
    </div>
  )
}
