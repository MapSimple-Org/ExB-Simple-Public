/** @jsx jsx */
import { React, jsx, defaultMessages as jimuCoreDefaultMessage, hooks } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Checkbox, NumericInput, CollapsablePanel, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { type IMPrintTemplateProperties, type IMConfig, DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT, ModeType } from '../../../config'
import defaultMessages from '../../translations/default'
import { SettingCollapseType } from '../../type/type'
const { useEffect, useState } = React
const EditIcon = require('jimu-icons/svg/outlined/editor/edit.svg')

interface Props {
  id: string
  config: IMConfig
  template: IMPrintTemplateProperties
  handelCustomSettingChange?: (key: string[], value) => void
}

const MapOnlyCustomSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const { config, template, handelCustomSettingChange } = props

  const [mapWidth, setMapWidth] = useState(template?.exportOptions?.width)
  const [mapHeight, setMapHeight] = useState(template?.exportOptions?.height)
  const [openCollapseType, setOpenCollapseType] = useState(null as SettingCollapseType)

  useEffect(() => {
    setMapWidth(template?.exportOptions?.width)
    setMapHeight(template?.exportOptions?.height)
  }, [template])

  const handleMapWidthAccept = (value) => {
    if (!value || Number(value) < 1) {
      setMapWidth(template?.exportOptions?.width)
      return false
    }
    handelCustomSettingChange(['exportOptions', 'width'], Number(value))
  }

  const handleMapWidthChange = (value) => {
    if (value < 1) return false
    setMapWidth(value)
  }

  const handleMapHeightAccept = (value) => {
    if (!value || Number(value) < 1) {
      setMapHeight(template?.exportOptions?.height)
      return false
    }
    handelCustomSettingChange(['exportOptions', 'height'], Number(value))
  }

  const handleMapHeightChange = (value) => {
    setMapHeight(value)
  }

  const openSettingCollapse = (openCollapseType: SettingCollapseType) => {
    setOpenCollapseType(openCollapseType)
  }

  const closeSettingCollapse = () => {
    setOpenCollapseType(null)
  }

  const handleCheckBoxChange = (key: string) => {
    handelCustomSettingChange([key], !template?.[key])
  }

  const handleAttributionVisibleChanged = (e) => {
    const attributionVisible = !template?.attributionVisible
    handelCustomSettingChange(['attributionVisible'], attributionVisible)
  }

  return (
    <SettingSection title={nls('MapOnlyOptions')} role='group' aria-label={nls('MapOnlyOptions')}>
      <div role='group' aria-label={nls('setDefaults')}>
      <SettingRow label={nls('setDefaults')} flow='wrap'/>
      {/* Print title */}
      <CollapsablePanel
        label={nls('mapSize')}
        isOpen={openCollapseType === SettingCollapseType.MapSize}
        onRequestOpen={() => { openSettingCollapse(SettingCollapseType.MapSize) }}
        onRequestClose={closeSettingCollapse}
        role='group'
        aria-label={nls('mapSize')}
        rightIcon={EditIcon}
        type='primary'
        className={openCollapseType === SettingCollapseType.MapSize && 'active-collapse'}
      >
        <SettingRow label={nls('width')} className='mt-2'>
          <NumericInput
            className='map-size-input'
            size='sm'
            placeholder={nls('width')}
            value={mapWidth || DEFAULT_MAP_WIDTH}
            onAcceptValue={handleMapWidthAccept}
            onChange={handleMapWidthChange}
            showHandlers={false}
            aria-label={nls('width')}
          />
        </SettingRow>
        <SettingRow label={nls('height')}>
          <NumericInput
            className='map-size-input'
            size='sm'
            placeholder={nls('height')}
            value={mapHeight || DEFAULT_MAP_HEIGHT}
            onAcceptValue={handleMapHeightAccept}
            onChange={handleMapHeightChange}
            showHandlers={false}
            aria-label={nls('height')}
          />
        </SettingRow>
      </CollapsablePanel>
      <CollapsablePanel
        label={nls('mapAttribution')}
        isOpen={openCollapseType === SettingCollapseType.AttributionVisible}
        onRequestOpen={() => { openSettingCollapse(SettingCollapseType.AttributionVisible) }}
        onRequestClose={closeSettingCollapse}
        role='group'
        aria-label={nls('mapAttribution')}
        rightIcon={EditIcon}
        type='primary'
        className={openCollapseType === SettingCollapseType.AttributionVisible && 'active-collapse'}
      >
        <SettingRow flow='wrap' className='mt-2'>
          <div
            title={nls('includeAttribution')}
            aria-label={nls('includeAttribution')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={handleAttributionVisibleChanged}
          >
            <Checkbox
              title={nls('includeAttribution')}
              className='lock-item-ratio'
              data-field='mapSize'
              checked={!!template?.attributionVisible || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('includeAttribution')}
            </div>
          </div>
        </SettingRow>
      </CollapsablePanel>
      </div>

      {config.modeType === ModeType.Classic && <SettingRow className='mt-2' flow='wrap' role='group' aria-label={nls('selectEditableSettings')} label={nls('selectEditableSettings')}>
        <div className='w-100'>
          <div
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableMapSize') }}
            title={nls('mapSize')}
            aria-label={nls('mapSize')}
          >
            <Checkbox
              title={nls('mapSize')}
              className='lock-item-ratio'
              data-field='mapSize'
              checked={template?.enableMapSize || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('mapSize')}
            </div>
          </div>
        </div>
        <div className='w-100 mt-1'>
          <div
            title={nls('mapAttribution')}
            aria-label={nls('mapAttribution')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableMapAttribution') }}
          >
            <Checkbox
              title={nls('mapAttribution')}
              className='lock-item-ratio'
              data-field='mapSize'
              checked={template?.enableMapAttribution || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('mapAttribution')}
            </div>
          </div>
        </div>
      </SettingRow>}
    </SettingSection>
  )
}

export default MapOnlyCustomSetting
