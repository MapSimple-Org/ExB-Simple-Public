import { useEffect, useState, Fragment } from 'react'
import { hooks } from 'jimu-core'
import { Switch } from 'jimu-ui'
import { JimuLayerViewSelector, SettingRow } from 'jimu-ui/advanced/setting-components'

import { isCustomizeLayersEnabled, getDataSourceLabel, getLayerViewIds, shouldHideLayer } from '../../utils'

import type { WidgetSettingProps } from '../setting'

import defaultMessages from '../translations/default'

interface Props {
  jimuMapViewId: string
  dataSourceId: string
  settingProps: WidgetSettingProps
}

export const CustomizeLayerPopper = (props: Props): React.ReactElement => {
  const {
    jimuMapViewId,
    dataSourceId,
    settingProps: {
      id,
      config,
      onSettingChange
    }
  } = props

  const [selectedLayerViewIds, setSelectedLayerViewIds] = useState<string[]>([])

  const isEnabled = isCustomizeLayersEnabled(jimuMapViewId, config.customizeLayersOptions)

  useEffect(() => {
    const refreshSelectedLayerViewIds = async (): Promise<void> => {
      const layerViewIds = await getLayerViewIds(jimuMapViewId, config.customizeLayersOptions)
      setSelectedLayerViewIds(layerViewIds)
    }
    refreshSelectedLayerViewIds()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapViewId, isEnabled])

  const translate = hooks.useTranslation(defaultMessages)

  const handleToggleEnableCustomizeLayers = (e: any): void => {
    const isChecked = e.target.checked
    onSettingChange({
      id,
      config: config.setIn(['customizeLayersOptions', jimuMapViewId], {
        isEnabled: isChecked,
        selectedLayerViewIds: isChecked ? selectedLayerViewIds : []
      })
    })
  }

  const handleLayerViewSelectionChange = (jimuLayerViewIds: string[]): void => {
    setSelectedLayerViewIds(jimuLayerViewIds)
    onSettingChange({
      id,
      config: config.setIn(['customizeLayersOptions', jimuMapViewId], {
        isEnabled: true,
        selectedLayerViewIds: jimuLayerViewIds
      })
    })
  }

  const dataSourceLabel = getDataSourceLabel(dataSourceId)

  return (
        <Fragment>
            <SettingRow tag='label' label={translate('customizeLayer')} className='w-100 pl-4 pr-4'>
                <Switch
                    checked={isEnabled}
                    aria-label={translate('customizeLayer')}
                    onChange={handleToggleEnableCustomizeLayers}
                />
            </SettingRow>
            {isEnabled && (
              <Fragment>
                <SettingRow
                  className='w-100 pl-4 pr-4'
                  label={dataSourceLabel}
                  aria-label={dataSourceLabel}
                />
                <div className='select-jimu-layer-view-selector-container p-4'>
                    <JimuLayerViewSelector
                        isMultiSelection={true}
                        jimuMapViewId={jimuMapViewId}
                        selectedValues={selectedLayerViewIds}
                        onChange={handleLayerViewSelectionChange}
                        hideLayers={shouldHideLayer}
                    />
                </div>
              </Fragment>
            )}
        </Fragment>
  )
}
