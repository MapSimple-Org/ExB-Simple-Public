import { React, hooks, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Label, Switch, Checkbox, Select, AdvancedSelect, type AdvancedSelectItem, Tooltip, Button } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type JimuMapView, SnappingUtils } from 'jimu-arcgis'
import defaultMessages from '../translations/default'
import { type IMConfig, SnapSettingMode } from '../../config'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface EditorSnappingProps {
  config: IMConfig
  jimuMapViews: JimuMapView[]
  onPropertyChange: (name: string, value: string | number | boolean | object) => void
}


const EditorSnapping = (props: EditorSnappingProps) => {
  const { config, jimuMapViews, onPropertyChange } = props
  const { selfSnapping, featureSnapping, defaultSelfEnabled, defaultFeatureEnabled, gridSnapping = false, defaultGridEnabled = false, defaultSnapLayers, snapSettingMode } = config

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages, jimuCoreMessages)

  const allLayers = SnappingUtils.getAllSnappingLayerItems(jimuMapViews)

  const snapLayers = React.useMemo(() => allLayers.filter(l => defaultSnapLayers?.includes(l.value as string)), [allLayers, defaultSnapLayers])

  const onSnapLayersChange = (valueObj: AdvancedSelectItem[]) => {
    const newSnapLayers = (valueObj || []).map(item => item.value)
    onPropertyChange('defaultSnapLayers', newSnapLayers)
  }

  const snappingTips = <React.Fragment>
    <div className="plain-tooltip" style={{ maxWidth: 260 }}>
      <div className='mt-1' style={{ fontWeight: 700 }}> {translate('geometryGuides')} </div>
      <div className='mb-3'> {translate('editGeometryGuides')}</div>

      <div className='mt-2' style={{ fontWeight: 700 }}> {translate('featureToFeature')} </div>
      <div className='mb-3'> {translate('editFeatureToFeature')}</div>

      <div className='mt-2' style={{ fontWeight: 700 }}> {translate('grid')} </div>
      <div className='mb-3'> {translate('tipsForGrid')}</div>
    </div>
  </React.Fragment>

  const snappingTitle = <div className='d-flex justify-content-between align-items-center'>
      <span className='text-wrap'>{translate('snappingSettings')}</span>
      <Tooltip showArrow role="tooltip" title={snappingTips}>
        <Button icon disableHoverEffect disableRipple variant="text" size='sm' className='flex-shrink-0'><InfoOutlined /></Button>
      </Tooltip>
    </div>

  return <SettingSection
    role='group'
    title={snappingTitle}
    aria-label={translate('snappingSettings')}
  >
    <SettingRow>
      <Select
        size='sm'
        className='w-100'
        value={snapSettingMode}
        onChange={evt => { onPropertyChange('snapSettingMode', evt.target.value) }}
      >
        <option value={SnapSettingMode.Prescriptive}>{translate('prescriptiveMode')}</option>
        <option value={SnapSettingMode.Flexible}>{translate('flexibleMode')}</option>
      </Select>
    </SettingRow>
    {snapSettingMode === SnapSettingMode.Prescriptive
      ? <React.Fragment>
        <SettingRow>
          <Label className='d-flex align-items-center'>
            <Checkbox
              checked={defaultSelfEnabled}
              className='mr-1'
              onChange={evt => { onPropertyChange('defaultSelfEnabled', evt.target.checked) }}
            />
            {translate('geometryGuides')}
          </Label>
        </SettingRow>
        <SettingRow>
          <Label className='d-flex align-items-center'>
            <Checkbox
              checked={defaultFeatureEnabled}
              className='mr-1'
              onChange={evt => { onPropertyChange('defaultFeatureEnabled', evt.target.checked) }}
            />
            {translate('featureToFeature')}
          </Label>
        </SettingRow>
      </React.Fragment>
      : <React.Fragment>
        <SettingRow tag='label' label={translate('geometryGuides')}>
          <Switch
            checked={selfSnapping}
            data-key='selfSnapping'
            onChange={evt => { onPropertyChange('selfSnapping', evt.target.checked) }}
          />
        </SettingRow>
        {selfSnapping &&
          <SettingRow>
            <Label className='d-flex align-items-center'>
              <Checkbox
                checked={defaultSelfEnabled}
                className='mr-1'
                onChange={evt => { onPropertyChange('defaultSelfEnabled', evt.target.checked) }}
              />
              {translate('defaultEnabled')}
            </Label>
          </SettingRow>
        }
        <SettingRow tag='label' label={translate('featureToFeature')}>
          <Switch
            checked={featureSnapping}
            data-key='featureSnapping'
            onChange={evt => { onPropertyChange('featureSnapping', evt.target.checked) }}
          />
        </SettingRow>
        {featureSnapping &&
          <SettingRow>
            <Label className='d-flex align-items-center'>
              <Checkbox
                checked={defaultFeatureEnabled}
                className='mr-1'
                onChange={evt => { onPropertyChange('defaultFeatureEnabled', evt.target.checked) }}
              />
              {translate('defaultEnabled')}
            </Label>
          </SettingRow>
        }
        <SettingRow tag='label' label={translate('grid')}>
          <Switch
            checked={gridSnapping}
            data-key='gridSnapping'
            onChange={evt => { onPropertyChange('gridSnapping', evt.target.checked) }}
          />
        </SettingRow>
        {gridSnapping &&
          <SettingRow>
            <Label className='d-flex align-items-center'>
              <Checkbox
                checked={defaultGridEnabled}
                className='mr-1'
                onChange={evt => { onPropertyChange('defaultGridEnabled', evt.target.checked) }}
              />
              {translate('defaultEnabled')}
            </Label>
          </SettingRow>
        }
      </React.Fragment>
    }
    <SettingRow
      flow='wrap'
      label={translate('chooseDefaultSnappingLayers')}
      className='select-option'
    >
      <AdvancedSelect
        size='sm'
        title={translate('chooseDefaultSnappingLayers')}
        hideCheckAll={false}
        hideBottomTools={true}
        hideSearchInput={true}
        staticValues={allLayers}
        sortList={false}
        isMultiple
        selectedValues={snapLayers}
        disabled={jimuMapViews.length === 0}
        onChange={onSnapLayersChange}
        aria-label={translate('chooseDefaultSnappingLayers')}
      />
    </SettingRow>
  </SettingSection>
}

export default EditorSnapping
