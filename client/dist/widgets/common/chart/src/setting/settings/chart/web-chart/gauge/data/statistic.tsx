import { Immutable, type ImmutableArray, React, type UseDataSource, hooks, type StatisticDefinition } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector, StatisticsSelector } from '../../components'
import defaultMessages from '../../../../../translations/default'
import { defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import { createGaugeOutStatisticDefinition, getObjectIdField } from '../../../../../../utils/common'
import { useLatestDefaultValue } from '../../../../utils'

interface StatisticDefinitionSettingProps {
  useDataSources: ImmutableArray<UseDataSource>
  value: StatisticDefinition
  onChange: (value: StatisticDefinition) => void
}

export const StatisticDefinitionSetting = (props: StatisticDefinitionSettingProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)

  const { useDataSources, value: propValue, onChange } = props

  const propStatisticField = propValue?.onStatisticField ?? ''
  const propStatisticType = propValue?.statisticType ?? 'sum'
  const [statisticField, setStatisticField] = useLatestDefaultValue(propStatisticField)
  const [statisticType, setStatisticType] = useLatestDefaultValue(propStatisticType)

  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const objectidField = React.useMemo(() => getObjectIdField(dataSourceId), [dataSourceId])

  const fields = React.useMemo(() => statisticField ? Immutable([statisticField]) : Immutable([]), [statisticField])
  const hideFields = statisticType === 'count'

  const handleStatisticTypeChange = (statisticType): void => {
    setStatisticType(statisticType)
    let _numericField = statisticField
    if (statisticType === 'count') {
      _numericField = objectidField
    } else {
      if (statisticField === objectidField) {
        _numericField = ''
      }
    }
    setStatisticField(_numericField)
    const statisticDefinition = createGaugeOutStatisticDefinition({ statisticType, numericField: _numericField })
    onChange(statisticDefinition)
  }

  const handleNumericFieldsChange = (fields: string[]): void => {
    const numericField = fields[0]
    const statisticDefinition = createGaugeOutStatisticDefinition({ statisticType, numericField })
    onChange(statisticDefinition)
  }

  return <>
    <SettingRow className='mt-2' label={translate('statistics')} flow='wrap'>
      <StatisticsSelector
        aria-label={translate('statistics')}
        hideCount={false}
        hideNoAggregation={true}
        hidePercentileCount={true}
        value={statisticType}
        onChange={handleStatisticTypeChange}
        disabled={false}
      />
    </SettingRow>
    {!hideFields && <SettingRow label={translate('numberFields')} flow='wrap'>
      <FieldSelector
        aria-label={translate('numberFields')}
        className='numeric-fields-selector'
        type='numeric'
        isMultiple={false}
        useDataSources={useDataSources}
        fields={fields}
        debounce={false}
        hideIdField={true}
        onChange={handleNumericFieldsChange}
      />
    </SettingRow>}
  </>
}
