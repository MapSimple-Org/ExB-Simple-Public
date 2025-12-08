import { css, React, classNames } from 'jimu-core'
import { Icon, Tooltip, Button } from 'jimu-ui'
import infoOutlined from 'jimu-icons/svg/outlined/suggested/info.svg'

export interface IconTooltipProps {
  className?: string
  icon?: any
  tooltip: string
}

const style = css`
  .jimu-icon {
    color: var(--ref-palette-neutral-1000);
    &:hover {
      color: var(--ref-palette-black);
    }
  }
`

export const IconTooltip = (props: IconTooltipProps): React.ReactElement => {
  const { className, tooltip = '', icon = infoOutlined } = props
  return (
    <Tooltip title={tooltip}>
      <Button icon size='sm' type='tertiary' disableHoverEffect disableRipple css={style} className={classNames('icon-tooltip d-flex align-items-center', className)}>
        <Icon icon={icon} />
      </Button>
    </Tooltip>
  )
}

export interface LabelTooltipProps extends IconTooltipProps {
  label: string
}

export const LabelTooltip = (props: LabelTooltipProps) => {
  const { className, label, tooltip = '', icon } = props

  return <div className={classNames('label-tooltip d-flex align-items-center justify-content-between', className)}>
    <div className='text-truncate' title={label}>{label}</div>
    <IconTooltip icon={icon} tooltip={tooltip}></IconTooltip>
  </div>
}
