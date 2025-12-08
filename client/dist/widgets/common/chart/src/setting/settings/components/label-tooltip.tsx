/** @jsx jsx */
import { css, jsx, React, classNames } from 'jimu-core'
import iconInfo from 'jimu-icons/svg/outlined/suggested/info.svg'
import { useTheme } from 'jimu-theme'
import { Icon, Tooltip } from 'jimu-ui'

export interface IconTooltipProps {
  className?: string
  icon?: any
  tooltip: string
  showArrow?: boolean
}

const useStyle = () => {
  const theme = useTheme()
  const dark600 = theme?.ref.palette.neutral[1000]
  const black = theme?.ref.palette.black

  return css`
    .jimu-icon {
      color: ${dark600};
      &:hover {
        color: ${black};
      }
    }
  `
}

export const IconTooltip = (props: IconTooltipProps): React.ReactElement => {
  const style = useStyle()
  const { className, tooltip = '', icon = iconInfo, showArrow = false } = props
  return (
    <Tooltip title={tooltip} showArrow={showArrow}>
      <div css={style} className={classNames('icon-tooltip d-flex align-items-center', className)}>
        <Icon size={12} icon={icon} />
      </div>
    </Tooltip>
  )
}

export interface LabelTooltipProps extends IconTooltipProps {
  label: string
}

export const LabelTooltip = (props: LabelTooltipProps) => {
  const { className, label, tooltip = '', icon, showArrow } = props

  return <div className={classNames('label-tooltip d-flex align-items-center', className)}>
    <div className='mr-2 text-truncate' title={label}>{label}</div>
    <IconTooltip icon={icon} tooltip={tooltip} showArrow={showArrow}></IconTooltip>
  </div>
}
