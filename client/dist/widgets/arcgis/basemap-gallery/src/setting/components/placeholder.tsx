/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'

interface Props {
  text: string
  icon?: React.ReactNode
  style?: React.CSSProperties
}

const containerStyle = css`
  flex-direction: column;
  font-size: 0.875rem;
  text-align: center;
  color: var(--ref-palette-neutral-1000);
  overflow: hidden;
  svg {
    flex-shrink: 0;
  }
  span {
    padding: 0 1rem;
  }
`

const Placeholder = (props: Props) => {
  const { text, icon, style } = props

  return <div css={containerStyle} style={style} className='d-flex align-items-center justify-content-center'>
    {icon || <ClickOutlined size={48} color='var(--ref-palette-neutral-800)' />}
    <span className='mt-4'>{text}</span>
  </div>
}

export default Placeholder
