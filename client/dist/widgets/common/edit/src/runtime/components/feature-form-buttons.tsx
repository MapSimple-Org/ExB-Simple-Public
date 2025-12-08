import { classNames, css } from 'jimu-core'
import { Button } from 'jimu-ui'
import type { ControlButton } from './feature-form-component'

interface FeatureFormButtonsProps {
  buttons: ControlButton[]
}

const style = css`
  &.form-buttons{
    border-top: 1px solid var(--sys-color-divider-secondary);
    padding: 12px 15px;
    display: flex;
    .single-button {
      flex: 1;
    }
    .multi-buttons {
      width: 49%;
    }
  }
`

const FeatureFormButtons = (props: FeatureFormButtonsProps) => {
  const { buttons } = props
  return (
    <div className='d-flex justify-content-between form-buttons' css={style}>
      {buttons.map(({ disabled = false, label, type, clickHandler }, index) =>
        <Button
          key={index}
          className={classNames({
            'single-button': buttons.length === 1,
            'multi-buttons': buttons.length > 1,
          })}
          type={type}
          disabled={disabled}
          onClick={clickHandler}
        >
          {label}
        </Button>
      )}
    </div>
  )
}

export default FeatureFormButtons
