import { React, type ImmutableArray, type UseDataSource, hooks, type StatisticDefinition } from 'jimu-core'
import defaultMessages from '../../../../../translations/default'
import { NumericInput, Tab, Tabs, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import { defaultMessages as jimuLayoutDefaultMessage } from 'jimu-layouts/layout-runtime'
import { useLatestDefaultValue } from '../../../../utils'
import { StatisticDefinitionSetting } from './statistic'

interface RangeSettingProps {
  'aria-label'?: string
  useDataSources: ImmutableArray<UseDataSource>
  numberValue: number
  onNumberChange: (value: number) => void
  statisticValue: StatisticDefinition
  onStatisticChange: (value: StatisticDefinition) => void
}

export const RangeSetting = (props: RangeSettingProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage, jimuLayoutDefaultMessage)

  const {
    useDataSources,
    numberValue: propNumberValue,
    statisticValue,
    onNumberChange,
    onStatisticChange,
    'aria-label': ariaLabel
  } = props

  const [numberValue, setNumberValue] = useLatestDefaultValue(propNumberValue)
  const [mode, setMode] = React.useState(statisticValue ? 'statistics' : 'fixed')

  const handleNumberChange = (val: number): void => {
    const number = +val
    if (!Number.isNaN(number)) {
      setNumberValue(number)
    }
  }

  const handleAcceptNumberValue = (val: number): void => {
    if (val == null) return
    const number = +val
    if (!Number.isNaN(number)) {
      onNumberChange(number)
    }
  }

  const handleModeChange = (mode: 'fixed' | 'statistics') => {
    setMode(mode)
    if (mode === 'fixed') {
      onStatisticChange(null)
    }
  }

  return <Tabs className='w-100' type='pills' fill={true} value={mode} onChange={handleModeChange}>
    <Tab id='fixed' title={translate('fixed')}>
      <NumericInput
        className='w-100 mt-2'
        aria-label={ariaLabel}
        size='sm'
        step={0.01}
        value={numberValue}
        onChange={handleNumberChange}
        onAcceptValue={handleAcceptNumberValue}
      />
    </Tab>
    <Tab id='statistics' title={translate('statistics')}>
      <StatisticDefinitionSetting useDataSources={useDataSources} value={statisticValue} onChange={onStatisticChange} />
    </Tab>
  </Tabs>
}
