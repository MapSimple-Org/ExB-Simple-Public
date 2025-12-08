/** @jsx jsx */
import { React, classNames, jsx, css, hooks } from 'jimu-core'
import { Icon, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import defaultMessages from '../../../../../translations/default'

type GaugeShape = 'half-donut' | 'horseshoe' | 'circle'
const GaugeShapeMap = {
  'half-donut': {
    startAngle: -180,
    endAngle: 0,
    yoffset: '0%'
  },
  horseshoe: {
    startAngle: -200,
    endAngle: 20,
    yoffset: '22%'
  },
  circle: {
    startAngle: 0,
    endAngle: 360,
    yoffset: '0%'
  }
}

const GaugeShapeIcons = {
  'half-donut': require('../../../../../assets/icons/gauge-shape-half-donut.svg'),
  horseshoe: require('../../../../../assets/icons/gauge-shape-horseshoe.svg'),
  circle: require('../../../../../assets/icons/gauge-shape-circle.svg')
}

const ShapeTranslations = {
  'half-donut': 'halfDonut',
  horseshoe: 'horseshoe',
  circle: 'circle'
}

interface ShapeValue {
  startAngle?: number
  endAngle?: number
}

const getGaugeShape = (value: ShapeValue): GaugeShape => {
  const { startAngle, endAngle } = value
  if (startAngle === GaugeShapeMap['half-donut'].startAngle && endAngle === GaugeShapeMap['half-donut'].endAngle) {
    return 'half-donut'
  } else if (startAngle === GaugeShapeMap.horseshoe.startAngle && endAngle === GaugeShapeMap.horseshoe.endAngle) {
    return 'horseshoe'
  } else if (startAngle === GaugeShapeMap.circle.startAngle && endAngle === GaugeShapeMap.circle.endAngle) {
    return 'circle'
  }
}

interface GaugeShapeCardProps {
  className?: string
  title?: string
  shape: GaugeShape
  active: boolean
  onSelect?: (shape: GaugeShape) => void
}

const style = css`
  height: 42px;
  width: 51px;
  background-color: var(--ref-palette-white);
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  > .svg-component {
    width: 40px;
    height: 40px;
  }
  &.active {
    border: 2px solid var(--sys-color-primary-light);
  }
`

const GaugeShapeCard = (props: GaugeShapeCardProps) => {
  const { title, shape, active, onSelect, className, ...others } = props

  const icon = React.useMemo(() => GaugeShapeIcons[shape], [shape])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSelect?.(shape)
    }
  }

  const handleClick = () => {
    onSelect?.(shape)
  }

  return <div
    role='button'
    tabIndex={0}
    css={style}
    className={classNames('gauge-shape-card', className, { active })}
    onKeyDown={handleKeyDown}
    onClick={handleClick}
    title={title}
    aria-label={title}
    {...others}
  >
    <Icon
      icon={icon}
    />
  </div>
}

interface GaugeShapeSettingsProps {
  className?: string
  value: ShapeValue
  onChange?: (value: ShapeValue) => void
}

export const GaugeShapesSetting = (props: GaugeShapeSettingsProps): React.ReactElement => {
  const { className, value, onChange } = props

  const selectedShape = getGaugeShape(value)

  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  const handleChange = (shape) => {
    const shapeVale = GaugeShapeMap[shape]
    onChange(shapeVale)
  }

  return (
    <div
      role='group'
      className={classNames('gauge-shape-setting d-flex w-100 mt-2', className)}
      aria-label={translate('shape')}
    >
      {Object.keys(GaugeShapeMap).filter((shape) => shape !== 'circle').map((shape: GaugeShape) => {
        const title = translate(ShapeTranslations[shape])
        return <GaugeShapeCard className='mr-3' key={shape} shape={shape} title={title} active={shape === selectedShape} onSelect={handleChange} />
      })}
    </div>
  )
}
