/** @jsx jsx */
import { css, jsx, React, type SerializedStyles, hooks } from 'jimu-core'
import { Button, defaultMessages } from 'jimu-ui'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { useTheme } from 'jimu-theme'

export interface BackProps {
  className?: string
  onClick: () => void
  text?: string
}

const useStyle = (): SerializedStyles => {
  const theme = useTheme()
  const dark400 = theme?.ref.palette.neutral[900]

  return React.useMemo(() => {
    return css`
      span {
        color: ${dark400};
      }
    `
  }, [dark400])
}

export const Back = (props: BackProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages)
  const style = useStyle()

  const { className, onClick, text = translate('back') } = props
  return (
    <Button
      css={style}
      className={className}
      icon
      size='sm'
      type='tertiary'
      onClick={onClick}
    >
      <ArrowLeftOutlined />
      <span className='input-field text-paper ml-2'>{text}</span>
    </Button>
  )
}
