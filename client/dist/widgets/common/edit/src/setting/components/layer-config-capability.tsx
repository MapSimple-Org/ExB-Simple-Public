import { React, SupportedLayerServiceTypes, hooks, css } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Checkbox, Switch, Label } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'

import defaultMessages from '../translations/default'
import { getDsPrivileges } from '../../utils'
import type { LayerConfigProps } from './layer-config'

type LayerConfigCapabilityProps = Pick<LayerConfigProps, 'layerConfig' | 'isGeoMode' | 'onChange' | 'layerDefinition' | 'layerEditingEnabled'>

const style = css`
  .disabled-label{
    color: var(--ref-palette-neutral-700);
  }
`

const LayerConfigCapability = (props: LayerConfigCapabilityProps) => {
  const { layerConfig, isGeoMode, layerDefinition, layerEditingEnabled, onChange } = props
  const { addRecords, deleteRecords, updateRecords, updateAttributes, updateGeometries } = layerConfig

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const isTable = layerDefinition?.type === SupportedLayerServiceTypes.Table
  const {allowGeometryUpdates, create, update, deletable} = getDsPrivileges(layerDefinition)

  const handleSwitchChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const target = evt.currentTarget
    if (!target) return
    onChange(layerConfig.set(name, target.checked))
  }, [layerConfig, onChange])

  const handleUpdateRecordsChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const target = evt.currentTarget
    if (!target) return
    const newSwitchStatus = target.checked
    onChange(layerConfig.set('updateRecords', newSwitchStatus)
      .set('updateAttributes', newSwitchStatus)
      .set('updateGeometries', allowGeometryUpdates && newSwitchStatus)
    )
  }, [allowGeometryUpdates, layerConfig, onChange])

  const handleUpdateAttrOrGeoChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const target = evt.currentTarget
    if (!target) return
    const newStatus = target.checked
    const bothClose = (name === 'updateAttributes' && !newStatus && !updateGeometries) ||
      (name === 'updateGeometries' && !newStatus && !updateAttributes)
    if (bothClose) {
      onChange(layerConfig.set('updateRecords', false)
        .set('updateAttributes', false)
        .set('updateGeometries', false)
      )
    } else {
      onChange(layerConfig.set(name, newStatus))
    }
  }, [layerConfig, onChange, updateAttributes, updateGeometries])

  return <SettingSection title={translate('capability')} css={style}>
    {layerEditingEnabled
      ? <React.Fragment>
        {((!isGeoMode && isTable) || isGeoMode) &&
          <SettingRow tag='label' label={translate('addRecords')}>
            <Switch
              aria-label={translate('addRecords')}
              checked={addRecords}
              onChange={evt => { handleSwitchChange(evt, 'addRecords') }}
              disabled={!create}
            />
          </SettingRow>
        }
        <SettingRow tag='label' label={translate('deleteRecords')}>
          <Switch
            aria-label={translate('deleteRecords')}
            checked={deleteRecords}
            onChange={evt => { handleSwitchChange(evt, 'deleteRecords') }}
            disabled={!deletable}
          />
        </SettingRow>
        <SettingRow tag='label' label={translate('updateRecords')}>
          <Switch
            aria-label={translate('updateRecords')}
            checked={updateRecords}
            onChange={handleUpdateRecordsChange}
            disabled={!update}
          />
        </SettingRow>
        {isGeoMode && updateRecords &&
          <div className='ml-4 mt-2'>
            <Label className='w-100 d-flex'>
              <Checkbox
                style={{ cursor: 'pointer', marginTop: '2px' }}
                checked={updateAttributes}
                aria-label={translate('attribute')}
                onChange={evt => { handleUpdateAttrOrGeoChange(evt, 'updateAttributes') }}
                disabled={!update}
              />
              <div className='m-0 ml-2 flex-grow-1 omit-label'>
                {translate('attribute')}
              </div>
            </Label>
            <Label className='w-100 d-flex'>
              <Checkbox
                style={{ cursor: 'pointer', marginTop: '2px' }}
                checked={updateGeometries}
                aria-label={translate('geometry')}
                onChange={evt => { handleUpdateAttrOrGeoChange(evt, 'updateGeometries') }}
                disabled={!allowGeometryUpdates}
              />
              <div className={`m-0 ml-2 flex-grow-1 omit-label ${!allowGeometryUpdates && 'disabled-label'}`}>
                {translate('geometry')}
              </div>
            </Label>
          </div>
        }
      </React.Fragment>
      : translate('uneditableTips')
    }
  </SettingSection>
}

export default LayerConfigCapability
