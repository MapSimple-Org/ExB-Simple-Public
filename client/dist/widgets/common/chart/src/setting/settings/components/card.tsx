/** @jsx jsx */
import { React, jsx, css, classNames, type SerializedStyles } from 'jimu-core'
import { Icon, Tooltip } from 'jimu-ui'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical: boolean
  label?: string
  tooltip?: string
  icon: any
  active?: boolean
  disabled?: boolean
}

const useStyle = (vertical: boolean): SerializedStyles => {
  return React.useMemo(() => {
    return css`
    display: flex;
    flex-direction: ${vertical ? 'column' : 'row'};
    align-items: center;
    cursor: pointer;
    border: 1px solid transparent;
    .wrapper {
      width: ${vertical ? '100%' : '20%'};
      height: ${vertical ? '100%' : '85%'};
      background-color: var(--ref-palette-white);
    }
    label {
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 100%;
      margin-bottom: 0;
    }
    &.active {
      border: 2px solid var(--sys-color-primary-main);
    }
    &.disabled {
      .wrapper {
        opacity: 0.5;
        background-color: var(--ref-palette-neutral-500);
        border: 1px solid var(--ref-palette-neutral-700);
      }
      cursor: default;
    }
  `
  }, [vertical])
}

export const Card = (props: CardProps): React.ReactElement => {
  const { vertical = true, label, title, tooltip, icon, active, disabled = false, onClick, className, ...others } = props

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleClick?.(e)
    }
  }

  const handleClick = (e) => {
    if (disabled) return
    onClick?.(e)
  }

  const style = useStyle(vertical)

  const children = <div
    role='button'
    tabIndex={0}
    css={style}
    className={classNames('template-card', className, { active, disabled })}
    onKeyDown={handleKeyDown}
    onClick={handleClick}
    title={tooltip ? '' : title}
    {...others}
  >
    <Icon
      className={classNames('wrapper', { 'mx-2': !vertical })}
      icon={icon}
    />
    {label && (
      <label className={classNames({ 'mt-2': vertical })}>{label}</label>
    )}
  </div>

  if (tooltip) {
    return <Tooltip title={tooltip}>{children}</Tooltip>
  } else return children
}
