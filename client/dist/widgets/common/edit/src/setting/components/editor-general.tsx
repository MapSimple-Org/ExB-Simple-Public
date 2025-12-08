import { React, hooks, Immutable } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Label, Switch, Checkbox } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { LayerHonorModeType, type IMConfig } from '../../config'

interface EditorGeneralProps {
  config: IMConfig
  isActiveScene: boolean
  onPropertyChange: (name: string, value: string | number | boolean | object) => void
  onMultiplePropertyChange: (changeArr: Array<{ name: string, value: string | number | boolean | object }>) => void
}

const EditorGeneral = (props: EditorGeneralProps) => {
  const { config, isActiveScene, onPropertyChange, onMultiplePropertyChange } = props
  const { tooltip, defaultTooltipEnabled = false, templateFilter, relatedRecords, liveDataEditing, initialReshapeMode, segmentLabel = true, defaultSegmentLabelEnabled = false, batchEditing = false } = config

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const onTooltipToggle = (showTooltip: boolean) => {
    const changeArray = [
      { name: 'tooltip', value: showTooltip },
      { name: 'defaultTooltipEnabled', value: false }
    ]
    onMultiplePropertyChange(changeArray)
  }

  const onSegmentLabelToggle = (showSegmentLabel: boolean) => {
    const changeArray = [
      { name: 'segmentLabel', value: showSegmentLabel },
      { name: 'defaultSegmentLabelEnabled', value: false }
    ]
    onMultiplePropertyChange(changeArray)
  }

  const handleBatchEditingToggle = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked && config.mapViewsConfig && Object.keys(config.mapViewsConfig).length > 0) {
      let newMapViewsConfig = config.mapViewsConfig
      Object.entries(newMapViewsConfig).forEach(([mapViewId, mapViewConfig]) => {
        let layersConfig = mapViewConfig.layersConfig
        if (!layersConfig) return
        for (let i = 0; i < layersConfig.length; i++) {
          let layerConfig = layersConfig[i]
          if (layerConfig.layerHonorMode === LayerHonorModeType.Custom) {
            layerConfig = layerConfig.set('layerHonorMode', LayerHonorModeType.Webmap)
            layersConfig = Immutable.set(layersConfig, i, layerConfig)
            newMapViewsConfig = newMapViewsConfig.setIn([mapViewId, 'layersConfig'], layersConfig)
          }
        }
      })
      onMultiplePropertyChange([
        { name: 'batchEditing', value: checked },
        { name: 'mapViewsConfig', value: newMapViewsConfig }
      ])
    } else {
      onPropertyChange('batchEditing', checked)
    }
  }

  return <SettingSection role='group' aria-label={translate('iconGroup_general')} title={translate('iconGroup_general')} >
    <SettingRow tag='label' label={translate('tooltip')}>
      <Switch
        checked={tooltip}
        data-key='tooltip'
        onChange={evt => { onTooltipToggle(evt.target.checked) }}
      />
    </SettingRow>
    {tooltip &&
      <SettingRow>
        <Label className='d-flex align-items-center'>
          <Checkbox
            checked={defaultTooltipEnabled}
            className='mr-1'
            onChange={evt => { onPropertyChange('defaultTooltipEnabled', evt.target.checked) }}
          />
          {translate('defaultEnabled')}
        </Label>
      </SettingRow>
    }
    {isActiveScene && <React.Fragment>
      <SettingRow tag='label' label={translate('segmentLabel')}>
        <Switch
          checked={segmentLabel}
          onChange={evt => { onSegmentLabelToggle(evt.target.checked) }}
        />
      </SettingRow>
      {segmentLabel &&
        <SettingRow>
          <Label className='d-flex align-items-center'>
            <Checkbox
              checked={defaultSegmentLabelEnabled}
              className='mr-1'
              onChange={evt => { onPropertyChange('defaultSegmentLabelEnabled', evt.target.checked) }}
            />
            {translate('defaultEnabled')}
          </Label>
        </SettingRow>
      }
    </React.Fragment>}
    <SettingRow tag='label' label={translate('templateFilter')}>
      <Switch
        checked={templateFilter}
        data-key='templateFilter'
        onChange={evt => { onPropertyChange('templateFilter', evt.target.checked) }}
      />
    </SettingRow>
    <SettingRow tag='label' label={translate('relatedRecords')}>
      <Switch
        checked={relatedRecords}
        data-key='relatedRecords'
        onChange={evt => { onPropertyChange('relatedRecords', evt.target.checked) }}
      />
    </SettingRow>
    <SettingRow tag='label' label={translate('runtimeDataEditing')}>
      <Switch
        checked={liveDataEditing}
        data-key='liveDataEditing'
        onChange={evt => { onPropertyChange('liveDataEditing', evt.target.checked) }}
      />
    </SettingRow>
    <SettingRow tag='label' label={translate('initialReshapeMode')}>
      <Switch
        checked={initialReshapeMode}
        data-key='initialReshapeMode'
        onChange={evt => { onPropertyChange('initialReshapeMode', evt.target.checked) }}
      />
    </SettingRow>
    <SettingRow tag='label' label={translate('batchEditingSetting')}>
      <Switch
        checked={batchEditing}
        data-key='batchEditing'
        onChange={handleBatchEditingToggle}
      />
    </SettingRow>
  </SettingSection>
}

export default EditorGeneral
