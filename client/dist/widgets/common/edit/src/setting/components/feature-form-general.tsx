import { React, hooks, Immutable } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Switch, TextArea } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { LayerHonorModeType, type IMConfig } from '../../config'

interface FeatureFormGeneralProps {
  config: IMConfig
  onPropertyChange: (name: string, value: string | number | boolean | object) => void
  onMultiplePropertyChange: (changeArr: Array<{ name: string, value: string | number | boolean | object }>) => void
}

const FeatureFormGeneral = (props: FeatureFormGeneralProps) => {
  const { config, onPropertyChange, onMultiplePropertyChange } = props
  const { description, noDataMessage, batchEditing = false } = config

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const handleBatchEditingToggle = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked && config.layersConfig?.length > 0) {
      let layersConfig = config.layersConfig
      for (let i = 0; i < layersConfig.length; i++) {
        let layerConfig = layersConfig[i]
        if (layerConfig.layerHonorMode === LayerHonorModeType.Custom) {
          layerConfig = layerConfig.set('layerHonorMode', LayerHonorModeType.Webmap)
          layersConfig = Immutable.set(layersConfig, i, layerConfig)
        }
      }
      onMultiplePropertyChange([
        { name: 'batchEditing', value: checked },
        { name: 'layersConfig', value: layersConfig }
      ])
    } else {
      onPropertyChange('batchEditing', checked)
    }
  }

  return <SettingSection role='group' aria-label={translate('iconGroup_general')} title={translate('iconGroup_general')} >
    <SettingRow tag='label' label={translate('batchEditingSetting')}>
      <Switch
        checked={batchEditing}
        data-key='batchEditing'
        onChange={handleBatchEditingToggle}
      />
    </SettingRow>
    <SettingRow flow='wrap' label={translate('description')} >
      <TextArea
        className='w-100'
        height={90}
        aria-label={translate('description')}
        placeholder={translate('editFieldDescription')}
        defaultValue={description ?? ''}
        onBlur={evt => { onPropertyChange('description', evt.target.value) }}
      />
    </SettingRow>
    <SettingRow flow='wrap' label={translate('noDataMessage')} >
      <TextArea
        className='w-100'
        height={75}
        aria-label={translate('noDataMessage')}
        placeholder={translate('noDataMessageDefaultText')}
        defaultValue={noDataMessage}
        onBlur={evt => { onPropertyChange('noDataMessage', evt.target.value) }}
      />
    </SettingRow>
  </SettingSection>
}

export default FeatureFormGeneral
