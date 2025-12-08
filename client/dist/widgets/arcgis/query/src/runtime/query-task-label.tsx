/** @jsx jsx */
import { jsx, css, type IconResult, type ImmutableObject } from 'jimu-core'
import { Icon } from 'jimu-ui'

interface ContentProps {
  icon?: IconResult | ImmutableObject<IconResult>
  name: string
}

const textStyle = css`
  font-weight: 500;
  font-size: 0.875rem;
`

export function QueryTaskLabel (props: ContentProps) {
  const { icon, name } = props

  return (
    <div className='d-flex align-items-center text-truncate' css={textStyle}>
      {icon && <Icon className='query-task-icon mr-2' icon={icon.svg} />}
      <div className='text-truncate' title={name}>
        {name}
      </div>
    </div>
  )
}
