/** @jsx jsx */
import { React, jsx, hooks, type ImmutableObject } from 'jimu-core'
import { Checkbox, CollapsablePanel, defaultMessages as jimuiDefaultMessage, Label, TextInput } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { CustomToolParam } from '../../config'

interface Props {
  parameter: ImmutableObject<CustomToolParam>
  children?: React.ReactNode
  onParameterChange: (parameter: ImmutableObject<CustomToolParam>) => void
}

const CustomToolConfigCollapsablePanel = (props: Props) => {
  const { parameter, onParameterChange, children } = props
  const translate = hooks.useTranslation(jimuiDefaultMessage)

  const [editingDisplayName, setEditingDisplayName] = React.useState('')
  React.useEffect(() => {
    setEditingDisplayName(parameter.displayName || '')
  }, [parameter.displayName])

  const isRequired = parameter.parameterType === 'esriGPParameterTypeRequired'

  return <CollapsablePanel
    className='parameter-setting-collapse'
    label={parameter.displayName || parameter.name}
    aria-label={parameter.displayName || parameter.name}
    type="default" defaultIsOpen={false}
  >
    <SettingRow className='pt-4 dark-600'>{`${translate('type')}: ${parameter.dataType}`}</SettingRow>
    <SettingRow className='mt-2 dark-600'>{`${translate('required')}: ${translate(isRequired ? 'trueKey' : 'falseKey')}`}</SettingRow>
    {parameter.direction === 'esriGPParameterDirectionInput' && !isRequired && <SettingRow className='mt-2 dark-600'>
      <Label centric>
        <Checkbox className='mr-2' checked={!parameter.invisible} onChange={(e, checked) => { onParameterChange(checked ? parameter.without('invisible') : parameter.set('invisible', true)) }} />
        {translate('visible')}
      </Label>
    </SettingRow>}
    <SettingRow className={`mt-2 label-dark-400 ${children ? '' : 'last-setting-row'}`} label={translate('label')} flow='wrap' role='group' aria-label={translate('label')}>
      <TextInput size='sm' className='w-100' value={editingDisplayName}
        onChange={(e) => { setEditingDisplayName(e.target.value) }}
        onAcceptValue={(value) => {
          if (!value) {
            setEditingDisplayName(parameter.displayName || '')
            return
          }
          onParameterChange(parameter.set('displayName', value))
        }}
      />
    </SettingRow>
    {children}
  </CollapsablePanel>
}

export default CustomToolConfigCollapsablePanel
