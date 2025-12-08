/** @jsx jsx */

import {
  classNames, React, jsx, defaultMessages as jimuCoreMessages, hooks, css,
  SessionManager,
  type ImmutableObject,
  Immutable
} from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { defaultMessages as jimuUIMessages, Radio, Label } from 'jimu-ui'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, BasemapsType, type Config, type BasemapFromUrl, type BasemapInfo } from '../config'
import defaultMessages from './translations/default'
import { Fragment } from 'react'
import Placeholder from './components/placeholder'
import CustomBasemapList from './components/custom-basemap-list'
import ImportBasemaps from './components/import-basemaps'
import type { basemapUtils } from 'jimu-arcgis'
import { useFullConfig } from '../utils'
import AddBasemapsByUrl from './components/add-by-url'

const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)

const style = css`
  display: flex;
  flex-flow: column;
  overflow-y: hidden;
  .btn-container {
    .jimu-btn {
      flex: 1;
    }
  }
  .custom-list-container {
    position: relative;
    flex: 1;
    overflow: auto;
  }
`

type SettingProps = AllWidgetSettingProps<IMConfig>
const Setting = (props: SettingProps): React.ReactElement => {
  const {
    id,
    onSettingChange,
    config: propConfig,
    useMapWidgetIds
  } = props

  const token = SessionManager.getInstance().getMainSession()?.token

  const fullConfig = useFullConfig(propConfig)

  const { basemapsType, customBasemaps } = fullConfig

  const translate = hooks.useTranslation(allDefaultMessages)

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({ id, useMapWidgetIds })
  }

  const onPropertyChange = (name: keyof Config, value: Array<ImmutableObject<BasemapInfo>> | BasemapsType) => {
    if (value === propConfig[name]) {
      return
    }
    const newConfig = value === BasemapsType.Organization || !value.length ? propConfig.without(name) : propConfig.set(name, value)
    onSettingChange({ id, config: newConfig })
  }

  const noMap = React.useMemo(() => !useMapWidgetIds?.length, [useMapWidgetIds])

  const usingCustomBasemaps = React.useMemo(() => basemapsType === BasemapsType.Custom, [basemapsType])

  const onGroupBasemapItemsChange = (item: basemapUtils.BasemapItem, isSelected: boolean) => {
    const oldBasemaps = customBasemaps.asMutable()
    onPropertyChange('customBasemaps', isSelected ? [...oldBasemaps, Immutable(item)] : oldBasemaps.filter((i) => i.id !== item.id))
  }

  const onAddNewBasemapByUrl = (item: BasemapFromUrl) => {
    onPropertyChange('customBasemaps', [...customBasemaps.asMutable(), Immutable(item)])
  }

  return (
    <div className="jimu-widget-setting jimu-widget-basemap-setting h-100" css={style}>
      <SettingSection
        className={classNames({ 'border-bottom-0': noMap })}
        title={translate('selectMapWidget')}
      >
        <SettingRow>
          <MapWidgetSelector onSelect={onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds}/>
        </SettingRow>
      </SettingSection>

      {noMap
        ? <Placeholder text={translate('selectMapHint')} style={{ height: 'calc(100% - 6rem)' }} />
        : (<Fragment>
            <SettingSection
              className={classNames({ 'border-0': !usingCustomBasemaps || !customBasemaps.length })}
              title={translate('baseMapSettings')} role='group' aria-label={translate('baseMapSettings')}
            >
              <SettingRow flow="wrap" role='radiogroup' className="mb-4">
                <Label className="d-flex align-items-center">
                  <Radio
                    className="mr-2" name="basemapsType"
                    checked={basemapsType === BasemapsType.Organization}
                    onChange={() => { onPropertyChange('basemapsType', BasemapsType.Organization) }}
                  />
                  {translate('groupBasemaps')}
                </Label>
                <Label className="d-flex align-items-center">
                  <Radio
                    className="mr-2" name="basemapsType"
                    checked={basemapsType === BasemapsType.Custom}
                    onChange={() => { onPropertyChange('basemapsType', BasemapsType.Custom) }
                    }
                  />
                  {translate('customBasemaps')}
                </Label>
              </SettingRow>

              {usingCustomBasemaps && <div className='btn-container d-flex'>
                <ImportBasemaps
                  {...props}
                  config={fullConfig}
                  onGroupBasemapItemsChange={onGroupBasemapItemsChange}
                />
                <AddBasemapsByUrl
                  {...props}
                  config={fullConfig}
                  onConfirm={onAddNewBasemapByUrl}
                />
              </div>}
            </SettingSection>

            {usingCustomBasemaps && <div className="custom-list-container">
              <div className="h-100">
                {customBasemaps.length
                  ? <CustomBasemapList
                      {...props} config={fullConfig} token={token}
                      onCustomBasemapsChange={(newCustomBasemaps) => { onPropertyChange('customBasemaps', newCustomBasemaps) }}
                    />
                  : <Placeholder text={translate('settingHint')} style={{ height: '100% ' }} />}
              </div>
            </div>}
          </Fragment>)
      }
    </div>
  )
}
export default Setting
