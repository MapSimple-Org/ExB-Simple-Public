import { React, type ImmutableObject, Immutable } from 'jimu-core'
import type { WebChartText } from 'jimu-ui/advanced/chart'
import { TextInput, TextArea } from 'jimu-ui'
import { getChartText } from '../../../../../../../utils/default'
import { SettingRow } from 'jimu-ui/advanced/setting-components'

interface TitleProps {
  label: string
  type: 'input' | 'area'
  value: ImmutableObject<WebChartText>
  onChange?: (title: ImmutableObject<WebChartText>) => void
}

const defaultValue = Immutable(getChartText())

export const Title = (props: TitleProps): React.ReactElement => {
  const { label, type = 'input', value = defaultValue, onChange } = props

  const text = value?.content?.text ?? ''

  const handleChange = (val: string): void => {
    const visible = val !== ''
    onChange?.(value.setIn(['content', 'text'], val).set('visible', visible))
  }

  return (
    <SettingRow level={2} label={label} flow='wrap'>
      {type === 'input' && <TextInput
        size='sm'
        className='w-100'
        defaultValue={text}
        aria-label={label}
        onAcceptValue={handleChange}
      />}
      {type === 'area' && <TextArea
        defaultValue={text}
        aria-label={label}
        onAcceptValue={handleChange}
      />}
    </SettingRow>
  )
}
