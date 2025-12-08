/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  type IntlShape
} from 'jimu-core'
import { CalciteAction } from 'calcite-components'
import defaultMessages from '../../translations/default'
import { useDynSegRuntimeState } from '../../state'
import { Tooltip } from 'jimu-ui'

export interface FieldCalculatorProps {
  dynSegFeatureLayer: __esri.FeatureLayer
  lrsLayers
  attributeSet
  intl: IntlShape
}

export function FieldCalculator (props: FieldCalculatorProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { fieldInfo, display } = useDynSegRuntimeState()
  const [isDisable, setDisable] = React.useState(true)

  React.useEffect(() => {
    if (!fieldInfo || fieldInfo.length === 0) setDisable(true)
    else setDisable(undefined)
  }, [fieldInfo, display])

  return (
    <Tooltip
      placement='auto'
      title={getI18nMessage('fieldCalculatorLabel')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <CalciteAction
        disabled={isDisable}
        text={getI18nMessage('fieldCalculatorLabel')}
        icon='calculator'
        scale='m'
        id="field-calculator"
      />
    </Tooltip>
  )
}
