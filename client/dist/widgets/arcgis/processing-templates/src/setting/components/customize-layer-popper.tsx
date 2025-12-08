/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
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

const CustomizeLayerPopper = (props: Props): React.ReactElement => {
  const {
    jimuMapViewId,
    dataSourceId,
    settingProps: {
      id,
      config,
      onSettingChange
    }
  } = props

  const [selectedLayerViewIds, setSelectedLayerViewIds] = React.useState<string[]>([])

  const isCustomized = isCustomizeLayersEnabled(jimuMapViewId, config.customizeLayersOptions)

  React.useEffect(() => {
    getLayerViewIds(jimuMapViewId, config.customizeLayersOptions).then(
      (layerViewIds) => { setSelectedLayerViewIds(layerViewIds) }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapViewId, isCustomized])

  const translate = hooks.useTranslation(defaultMessages)

  const onToggleCustomizeLayers = (jimuMapViewId: string, isCustomizedLayersChecked: boolean) => {
    onSettingChange({
      id,
      config: config.setIn(['customizeLayersOptions', jimuMapViewId], {
        isEnabled: isCustomizedLayersChecked,
        selectedLayerViewIds: isCustomizedLayersChecked ? selectedLayerViewIds : []
      })
    })
  }

  const onLayerViewSelectionChange = (jimuLayerViewIds: string[]) => {
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
        <React.Fragment>
            <SettingRow tag='label' label={translate('customizeLayer')} className='w-100 pl-4 pr-4'>
                <Switch
                    checked={isCustomized}
                    aria-label={translate('customizeLayer')}
                    onChange={(event) => { onToggleCustomizeLayers(jimuMapViewId, event.target.checked) }}
                />
            </SettingRow>
            {isCustomized && (
              <React.Fragment>
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
                        onChange={onLayerViewSelectionChange}
                        hideLayers={shouldHideLayer}
                    />
                </div>
              </React.Fragment>
            )}
        </React.Fragment>
  )
}

export default CustomizeLayerPopper
