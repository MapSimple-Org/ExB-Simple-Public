/** @jsx jsx */
import { React, css, jsx, type IMThemeVariables } from 'jimu-core'
import { useTheme } from 'jimu-theme'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'

interface PlaceholderProps {
  text: string
  icon?: React.ReactNode
  style?: React.CSSProperties
}

const getStyle = (theme: IMThemeVariables) => {
  return css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 0.875rem;
    color: ${theme.ref.palette.neutral[1000]};
    overflow: hidden;
    svg {
      flex-shrink: 0;
    }
  `
}

const Placeholder = (props: PlaceholderProps) => {
  const { text, icon, style } = props

  const theme = useTheme()

  return (
    <div css={getStyle(theme)} style={style}>
      {icon || <ClickOutlined size={48} color={theme.ref.palette.neutral[800]} />}
      <div className='mt-4 px-4'>{text}</div>
    </div>
  )
}

export default Placeholder
