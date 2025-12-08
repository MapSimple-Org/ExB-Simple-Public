import { hooks } from "jimu-core"
import { Fragment, useState } from 'react'
import { Switch, defaultMessages as jimuUIMessages, Label, Alert } from "jimu-ui"
import {
  MapWidgetSelector,
  SettingRow,
  SettingSection,
} from "jimu-ui/advanced/setting-components"
import { CalciteInputNumber } from 'calcite-components'
import type { AllWidgetSettingProps } from "jimu-for-builder"
import type { IMConfig } from "../config"
import { isMapWidgetDataSourceEmpty, getJimuMapViewId } from '../utils'

import { CustomizeLayerPopper } from './components/customize-layer-popper'
import { MultipleMapConfig } from './components/multiple-map-config'

import defaultMessages from "./translations/default"


export type WidgetSettingProps = AllWidgetSettingProps<IMConfig>

const Setting = (props: WidgetSettingProps) => {
  const { id, config, useMapWidgetIds, onSettingChange } = props

  const [dataSourceId, setDataSourceId] = useState('')
  const [enableFilters, setEnableFilters] = useState(true)

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const handleMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({ id, useMapWidgetIds })
  }

  const handleSwitchOptionChange = (name: string, checked: boolean): void => {
   onSettingChange({
      id,
      config: config.set(name, checked)
    })
  }

  const handleEnableFiltersChange = (isEnabled: boolean): void => {
    setEnableFilters(isEnabled)
    if (!isEnabled) {
      onSettingChange({
      id,
      config: config.set("enableAttributeFilter", false).set('enableSpatialFilter', false).set('enableImageTypeFilter', false)
    })
    }
  }

  const handleMaxImageItemNumberInputChange = (e: Event): void => {
    const node = e.target as HTMLCalciteInputElement
    const value = typeof node.value === "string" && node.value.trim() !== '' && Number.isInteger(Number(node.value)) ? parseInt(node.value) : ''
    onSettingChange({
      id,
      config: config.set("maxImageItemCountPerPage", value)
    })
  }

  const hasMapWidgetSelected = useMapWidgetIds?.length > 0
  const mapWidgetId = useMapWidgetIds?.[0] ?? ''
  const isEmptyDataSource = isMapWidgetDataSourceEmpty(mapWidgetId)
  const jimuMapViewId = getJimuMapViewId(mapWidgetId, dataSourceId)

  return (
    <Fragment>
      <SettingSection title={translate("selectMapWidget")}>
        <SettingRow className="w-100" aria-label={translate("selectMapWidget")}>
          <MapWidgetSelector
            useMapWidgetIds={useMapWidgetIds}
            onSelect={handleMapWidgetSelected}
          />
        </SettingRow>
        {hasMapWidgetSelected && (
            <SettingRow className='w-100 mt-4' aria-label={translate('selectLayers')}>
                {isEmptyDataSource
                  ? (
                        <Alert
                            type='warning'
                            text={translate('noDataSourceWarning')}
                            closable={false}
                            withIcon={false}
                            aria-label={translate('noDataSourceWarning')}
                        />
                    )
                  : (
                        <MultipleMapConfig
                            mapWidgetId={useMapWidgetIds?.[0]}
                            sidePopperContent={
                                <CustomizeLayerPopper
                                    jimuMapViewId={jimuMapViewId}
                                    dataSourceId={dataSourceId}
                                    settingProps={props}
                                />
                            }
                            onClick={setDataSourceId}
                            aria-label={translate('selectLayers')}
                        />
                    )}
            </SettingRow>
        )}
      </SettingSection>

      <SettingSection title={translate("tools")}>
        <Fragment>
          <SettingRow tag='label' label={translate("filter")} >
            <Switch
              className="can-x-switch"
              checked={enableFilters}
              onChange={(evt) => { handleEnableFiltersChange(evt.target.checked) }}
            />
          </SettingRow>

          {enableFilters && (
            <div className="d-flex flex-column pt-4 pb-4 pl-4">
              <SettingRow tag='label' label={translate("attributeFilter")} >
                <Switch
                  className="can-x-switch"
                  checked={config.enableAttributeFilter}
                  onChange={(evt) => { handleSwitchOptionChange("enableAttributeFilter", evt.target.checked) }}
                  defaultChecked={config.enableAttributeFilter}
                />
              </SettingRow>


              <SettingRow tag='label' label={translate("spatialFilter")} >
                <Switch
                  className="can-x-switch"
                  checked={config.enableSpatialFilter}
                  onChange={(evt) => { handleSwitchOptionChange("enableSpatialFilter", evt.target.checked) }}
                  defaultChecked={config.enableSpatialFilter}
                />
              </SettingRow>

              <SettingRow tag='label' label={translate("imageTypeFilter")} >
                <Switch
                  className="can-x-switch"
                  checked={config.enableImageTypeFilter}
                  onChange={(evt) => { handleSwitchOptionChange("enableImageTypeFilter", evt.target.checked) }}
                  defaultChecked={config.enableImageTypeFilter}
                />
              </SettingRow>
            </div>)
          }

           <SettingRow tag='label' label={translate("sort")} >
              <Switch
                className="can-x-switch"
                checked={config.enableSort}
                onChange={(evt) => { handleSwitchOptionChange("enableSort", evt.target.checked) }}
                defaultChecked={config.enableSort}
              />
            </SettingRow>


            <SettingRow tag='label' label={translate("listSettings")} >
              <Switch
                className="can-x-switch"
                checked={config.enableListSettings}
                onChange={(evt) => { handleSwitchOptionChange("enableListSettings", evt.target.checked) }}
                defaultChecked={config.enableListSettings}
              />
            </SettingRow>
        </Fragment>
      </SettingSection>

      <SettingSection title={translate("options")}>
          <SettingRow tag='label' label={translate("viewImageDetails")} >
              <Switch
                className="can-x-switch"
                checked={config.enableViewImageDetails}
                onChange={(evt) => { handleSwitchOptionChange("enableViewImageDetails", evt.target.checked) }}
                defaultChecked={config.enableViewImageDetails}
              />
          </SettingRow>

          <SettingRow tag='label' label={translate("SelectionZoomTo")} >
              <Switch
                className="can-x-switch"
                checked={config.enableZoomTo}
                onChange={(evt) => { handleSwitchOptionChange("enableZoomTo", evt.target.checked) }}
                defaultChecked={config.enableZoomTo}
              />
          </SettingRow>

          <SettingRow tag='label' label={translate("showOnMap")} >
              <Switch
                className="can-x-switch"
                checked={config.enableAddToMap}
                onChange={(evt) => { handleSwitchOptionChange("enableAddToMap", evt.target.checked) }}
                defaultChecked={config.enableAddToMap}
              />
          </SettingRow>
      </SettingSection>

       <SettingSection title={translate("resultStyle")}>
        <Label aria-label={translate("maxImageItemCountPerPage")}>
          {translate("maxImageItemCountPerPage")}
        </Label>
       <CalciteInputNumber value={config.maxImageItemCountPerPage.toString()} onCalciteInputNumberChange={handleMaxImageItemNumberInputChange} onCalciteInputNumberInput={handleMaxImageItemNumberInputChange} integer />
      </SettingSection>
    </Fragment>
  )
}

export default Setting
