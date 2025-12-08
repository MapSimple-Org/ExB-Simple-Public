import { hooks, React } from 'jimu-core'
import { Select, Option, defaultMessages } from 'jimu-ui'
import type { WebChartLabelBehavior } from 'jimu-ui/advanced/chart'

interface LabelBehaviorProps {
  className?: string
  horizontal?: boolean
  value: WebChartLabelBehavior
  onChange: (value: WebChartLabelBehavior, horizontal: boolean) => void
}

const getLabelBehaviors = (horizontal?: boolean) => {
  return horizontal ? ['rotate', 'stagger', 'wrap'] : ['hide', 'wrap']
}

export const LabelBehavior = (props: LabelBehaviorProps): React.ReactElement => {
  const { className, horizontal = true, value, onChange } = props

  const behaviors = React.useMemo(() => getLabelBehaviors(horizontal), [horizontal])
  const translate = hooks.useTranslation(defaultMessages)
  const handleChange = (e) => {
    onChange(e.target.value, horizontal)
  }

  return (
    <Select className={className} size='sm' value={value} onChange={handleChange}>
      {
        behaviors.map(behavior => {
          return <Option key={behavior} value={behavior}>{translate(behavior === 'rotate' ? 'default' : behavior)}</Option>
        })
      }
    </Select>
  )
}

