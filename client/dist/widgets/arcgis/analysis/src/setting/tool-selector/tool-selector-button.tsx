/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import { PlusCircleOutlined } from 'jimu-icons/outlined/editor/plus-circle'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { styled } from 'jimu-theme'
import { Button, Icon, type ButtonProps, Tooltip } from 'jimu-ui'

interface Props extends ButtonProps {
  iconSvg: string
  text: string
  disabledWarningText?: React.ReactNode
}

const style = css`
  line-height: 1.3;
  padding: 7px 8px;
  text-align: left;
  border: none !important;
  border-radius: 0;
  background-color: var(--ref-palette-neutral-500);
  &:hover:not(.active) {
    background-color: var(--ref-palette-neutral-600);
  }
  &:disabled, .disabled:hover {
    background-color: var(--ref-palette-neutral-500) !important;
    color: var(--ref-palette-neutral-900);
  }
  .text {
    flex: 1;
  }
`

const StyledTooltip = styled(Tooltip)(() => {
  return {
    width: '230px',
    '.plain-tooltip': {
      padding: '8px 10px 6px 8px'
    }
  }
})

const ToolSelectorButton = React.forwardRef((props: Props & React.RefAttributes<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>): React.ReactElement => {
  const { text, iconSvg, disabled, disabledWarningText, ...rest } = props
  return (
    <Button
      ref={ref}
      css={style}
      type='primary'
      title={text}
      aria-label={text}
      className='w-100'
      disabled={disabled}
      tag={disabled ? 'div' : 'button'}
      {...rest}>
      <div className='w-100 d-flex align-items-center inner-box'>
        <Icon icon={iconSvg}></Icon>
        <span className='text ml-2 text-truncate'>{text}</span>
        {disabled && !!disabledWarningText && <StyledTooltip placement='bottom' showArrow interactive leaveDelay={500} title={<div className='plain-tooltip'>{disabledWarningText}</div>}>
        <Button className='border-0 mr-2 p-0' size='sm' type='tertiary' icon >
            <WarningOutlined color='var(--sys-color-warning-dark)' />
          </Button>
        </StyledTooltip>}
        <PlusCircleOutlined size={16} />
      </div>
    </Button>
  )
})

export default ToolSelectorButton
