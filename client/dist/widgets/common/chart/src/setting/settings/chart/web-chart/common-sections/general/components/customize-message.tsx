import { React, hooks } from 'jimu-core'
import { CollapsableToggle, TextArea } from 'jimu-ui'
import defaultMessages from '../../../../../../translations/default'
import { styled } from 'jimu-theme'

interface CustomizeMessageProps {
  className?: string
  message: string
  onChange?: (message: string) => void
}

const StyledTextArea = styled(TextArea)(() => {
  return {
    'textarea::placeholder': {
      fontSize: '0.8125rem',
    }
  }
})

export const CustomizeMessage = (props: CustomizeMessageProps): React.ReactElement => {
  const { className, message = '', onChange } = props

  const [customized, setCustomized] = React.useState<boolean>(!!message)

  const translate = hooks.useTranslation(defaultMessages)

  const handleOpen = (): void => {
    setCustomized(true)
  }

  const handleClose = (): void => {
    setCustomized(false)
    if (message) {
      onChange?.('')
    }
  }

  const handleChange = (message: string): void => {
    onChange?.(message)
  }

  return (
    <CollapsableToggle
      role='group'
      className={className}
      level={2}
      label={translate('customizeNoDataMessage')}
      aria-label={translate('customizeNoDataMessage')}
      isOpen={customized}
      onRequestOpen={handleOpen}
      onRequestClose={handleClose}
    >
      <StyledTextArea height={75} defaultValue={message} placeholder={translate('customizeNoDataMessagePlaceholder')} onAcceptValue={handleChange} />
    </CollapsableToggle>
  )
}
