import { css, classNames } from 'jimu-core'
import { Button } from 'jimu-ui'

export enum ShapeType { Circle, Rectangle }

interface ShapesProps {
  title?: string
  className?: string
  type: ShapeType
  active: boolean
  onClick: () => any
}

const style = css`
  background-color: var(--ref-palette-white) !important;
  padding: 0px !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 2px;
  border-radius: 0px; 
  &.active{
    border: 2px var(--sys-color-primary-light) solid !important;
  }
  .inner {
    width: 66%;
    height: 66%;
    border: 1px var(--ref-palette-neutral-1200) solid;
    border-radius: 2px;
    &.circle {
      border-radius: 50%;
  }
  }
`

export const Shapes = (props: ShapesProps) => {
  const { className, title, type, active, onClick } = props
  const classes = classNames('shapes', { active: active }, className)

  return <Button
    css={style}
    onClick={onClick}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={classes}>
    <div className={classNames('inner', { rectangle: type === ShapeType.Rectangle }, { circle: type === ShapeType.Circle })} />
  </Button>
}
