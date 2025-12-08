/** @jsx jsx */
import {
  React, jsx, Immutable, polished, css, hooks, type IMDataSourceJson, type ImmutableObject,
  type UseDataSource, type ImmutableArray, DataSourceManager, dataSourceUtils, ReactRedux, type IMState,
  DataSourceTypes
} from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { TextInput, defaultMessages as jimuUIMessages, PanelHeader, LoadingType, Loading, Switch, AlertPopup } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service'
import type { IMConfig, LayersConfig } from '../../config'
import defaultMessages from '../translations/default'
import { constructConfig, getTableDataSource, sameOriginUpdateConfig, type SupportedDataSource, supportedDsTypes } from '../../utils'
import LayerConfigField from './layer-config-field'
import GeneralSettings from './general-settings'
import TableSearch from './table-search'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

export interface LayerConfigProps {
  widgetId: string
  config: IMConfig
  layerConfig: ImmutableObject<LayersConfig>
  isMapMode: boolean
  layerDefinition: ILayerDefinition
  layerEditingEnabled: boolean
  isDsAutoRefresh: boolean
  isEditableDs: boolean
  isNewAdd?: boolean
  handleBatchAdd?: (newConfigs: ImmutableArray<LayersConfig>) => void
  onConfigSaved?: () => void
  getLayerModeConfigId?: (dsId: string) => string
  filterDs?: (dsJson: IMDataSourceJson) => boolean
  onChange: (layerConfig: ImmutableObject<LayersConfig>) => void
  onClose?: () => void
}

const getStyle = (isMapMode: boolean) => {
  return css`
    .layer-config-panel {
      .panel-inner {
        .title {
          max-width: 70%;
        }
      }
      .setting-container {
        height: ${isMapMode ? '100%' : `calc(100% - ${polished.rem(58)})`};
        overflow: auto;
      }
    }
  `
}

const LayerConfig = (props: LayerConfigProps) => {
  const {
    widgetId, config, layerConfig, isMapMode, layerDefinition, isEditableDs, isNewAdd,
    handleBatchAdd, onConfigSaved, getLayerModeConfigId, filterDs, onChange, onClose
  } = props
  const [itemLabel, setItemLabel] = React.useState<string>('')
  const [tempUseDs, setTempUseDs] = React.useState<ImmutableArray<UseDataSource>>(null)
  const [isOpenRemind, setIsOpenRemind] = React.useState<boolean>(false)
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  // isDsAutoRefresh
  const isAutoRefresh = ReactRedux.useSelector((state: IMState) => {
    const appConfig = state?.appStateInBuilder?.appConfig
    const dsInfos = appConfig?.dataSources
    const currentDsId = layerConfig?.useDataSource?.dataSourceId
    if (!currentDsId) return false
    const splitIndex = currentDsId.indexOf('-')
    if (splitIndex < 0) return false
    const rootDsIdFromUseDs = currentDsId.substring(0, splitIndex)
    const layerId = currentDsId.substring(splitIndex + 1)
    const currentRootDsId = layerConfig?.useDataSource?.rootDataSourceId || rootDsIdFromUseDs
    const currentInfo = dsInfos?.[currentRootDsId]?.childDataSourceJsons?.[layerId]
    if (!currentInfo) return false
    const isRefresh = currentInfo?.query?.refreshInterval > 0
    return isRefresh
  })
  const useDataSources = ReactRedux.useSelector((state: IMState) => {
    const appConfig = state?.appStateInBuilder?.appConfig
    const widgetInfo = appConfig?.widgets?.[widgetId]
    return widgetInfo?.useDataSources || Immutable([])
  })

  const prevIsAutoRefresh = hooks.usePrevious(isAutoRefresh)

  React.useEffect(() => {
    setItemLabel(layerConfig?.name || '')
  }, [layerConfig?.name])

  React.useEffect(() => {
    if (prevIsAutoRefresh && (prevIsAutoRefresh !== isAutoRefresh) && layerConfig) {
      onChange(layerConfig.set('updateText', isAutoRefresh))
    }
  }, [prevIsAutoRefresh, isAutoRefresh, onChange, layerConfig])

  // when remove ds/ds view, need to check if the layerConfig.useDataSource is still in useDataSources
  const isDsInUseDs = layerConfig?.useDataSource && useDataSources?.find(useDs => useDs.dataSourceId === layerConfig?.useDataSource?.dataSourceId)
  const layerUseDs = isDsInUseDs ? Immutable([layerConfig.useDataSource]) : Immutable([])

  const handleDsChange = React.useCallback(async (useDss: UseDataSource[]) => {
    const isBatch = useDss?.length > 1
    if (isBatch) {
      const newConfigs: LayersConfig[] = []
      for (const [index, useDs] of useDss.entries()) {
        if (index === 0) setTempUseDs(Immutable([useDss[0]]))
        try {
          const ds = await DataSourceManager.getInstance().createDataSourceByUseDataSource(useDs) as SupportedDataSource
          const originalIsScene = ds?.type === DataSourceTypes.SceneLayer || ds?.type === DataSourceTypes.BuildingComponentSubLayer
          const dataSource = getTableDataSource(ds)
          const newLayerConfig = constructConfig(dataSource, isMapMode, getLayerModeConfigId, originalIsScene ? ds : undefined)
          newConfigs.push(newLayerConfig)
        } catch (err) {
          console.error(err)
        }
        if (index === useDss.length -1) setTempUseDs(null)
      }
      handleBatchAdd(Immutable(newConfigs))
      onConfigSaved()
    } else {
      const useDs = useDss?.[0]
      if (!useDs) return
      // Same-origin ds, that is, toggle data view or selection view，keep config
      const isSameMainDs = layerConfig && dataSourceUtils.areDerivedFromSameMain(useDs.dataSourceId, layerConfig.useDataSource.dataSourceId)
      try {
        setTempUseDs(Immutable(useDss))
        const ds = await DataSourceManager.getInstance().createDataSourceByUseDataSource(useDs) as SupportedDataSource
        const originalIsScene = ds?.type === DataSourceTypes.SceneLayer || ds?.type === DataSourceTypes.BuildingComponentSubLayer
        const dataSource = getTableDataSource(ds)
        const newLayerConfig = isSameMainDs
          ? sameOriginUpdateConfig(dataSource, layerConfig, getLayerModeConfigId, originalIsScene ? ds : undefined)
          : constructConfig(dataSource, isMapMode, getLayerModeConfigId, originalIsScene ? ds : undefined)
        onChange(Immutable(newLayerConfig))
        onConfigSaved()
      } catch (err) {
        console.error(err)
      } finally {
        setTempUseDs(null)
      }
    }
  }, [isMapMode, layerConfig, getLayerModeConfigId, handleBatchAdd, onChange, onConfigSaved])

  const nameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setItemLabel(value)
  }, [])

  const nameAccept = React.useCallback((value: string) => {
    value = value?.trim()
    value = value === '' ? layerConfig?.name : value
    if (value !== itemLabel) {
      setItemLabel(value)
    }
    onChange(layerConfig.set('name', value))
  }, [itemLabel, layerConfig, onChange])

  const handleToggleRemindModel = React.useCallback(() => {
    setIsOpenRemind(!isOpenRemind)
  }, [isOpenRemind])

  const onOverrideGeneralSettings = React.useCallback((checked: boolean) => {
    if (!checked) {
      handleToggleRemindModel()
    } else {
      const propertiesToInclude = [
        'enableRelatedRecords', 'enableAttachments', 'columnSetting', 'headerFontSetting', 'enableSelect', 'selectMode',
        'showCount', 'enableRefresh', 'enableDelete', 'enableShowHideColumn', 'enableMapExtentFilter', 'defaultExtentFilterEnabled'
      ]
      const generalSettings = propertiesToInclude.reduce((obj, key) => {
        if (key in config) {
            obj[key] = config[key]
        }
        return obj
      }, {})
      onChange(layerConfig.merge(generalSettings).set('overrideGeneralSettings', checked))
    }
  }, [handleToggleRemindModel, config, layerConfig, onChange])

  const REMIND_MODEL_STYLE = css`
    .remind-con {
      padding-left: ${polished.rem(25)};
      color: var(--ref-palette-neutral-1100);
      margin-bottom: ${polished.rem(60)};
      margin-top: ${polished.rem(19)};
      font-size: ${polished.rem(13)};
    }
    .modal-body {
      padding: ${polished.rem(30)} ${polished.rem(30)} 0 ${polished.rem(30)};
    }
    .modal-footer {
      padding: 0 ${polished.rem(30)} ${polished.rem(30)} ${polished.rem(30)};
    }
    .remind-title {
      font-size: ${polished.rem(16)};
      font-weight: 500;
    }
  `

  const renderRemindModel = () => {
    return (
      <AlertPopup
        isOpen={isOpenRemind}
        toggle={handleToggleRemindModel}
        hideHeader={true}
        onClickOk={() => { onChange(layerConfig.set('overrideGeneralSettings', false)) }}
        onClickClose={handleToggleRemindModel}
        css={REMIND_MODEL_STYLE}
      >
        <div className='align-middle pt-2 remind-title d-flex align-items-center' aria-label={translate('overrideSettingsTitle')}>
          <div className='mr-1'>
            <WarningOutlined className='align-middle' size='l' color={'var(--sys-color-warning-main)'} />
          </div>
          <span className='align-middle flex-grow-1'>{translate('overrideSettingsTitle')}</span>
        </div>
        <div className='remind-con'>{translate('overrideSettingsRemind')}</div>
      </AlertPopup>
    )
  }

  return (
    <div className='w-100 h-100' css={getStyle(isMapMode)}>
      {tempUseDs && <Loading type={LoadingType.Secondary} />}
      <div className='w-100 h-100 layer-config-panel'>
        {!isMapMode &&
          <div className="w-100 d-flex px-4 py-0">
            <PanelHeader
              level={1}
              className='px-0 py-4 panel-inner'
              showClose={!!onClose}
              onClose={onClose}
              title={translate('layerConfig')}>
            </PanelHeader>
          </div>
        }
        <div className='setting-container'>
          <SettingSection title={translate('data')} className="pt-0">
            <SettingRow>
              <DataSourceSelector
                types={supportedDsTypes}
                disableRemove={() => true}
                disableDataSourceList={isMapMode}
                hideDataView={isMapMode}
                useDataSources={tempUseDs || layerUseDs}
                mustUseDataSource
                onChange={handleDsChange}
                closeDataSourceListOnChange
                hideDs={filterDs}
                isMultiple={isNewAdd}
                isBatched={true}
              />
            </SettingRow>
            {(tempUseDs || layerUseDs) && isAutoRefresh &&
              <SettingRow tag='label' label={translate('updateText')}>
                <Switch
                  className='can-x-switch'
                  checked={layerConfig?.updateText === undefined ? true : layerConfig.updateText}
                  onChange={evt => { onChange(layerConfig.set('updateText', evt.target.checked)) }}
                  aria-label={translate('updateText')}
                />
              </SettingRow>
            }
          </SettingSection>
          {layerConfig &&
            <React.Fragment>
              <SettingSection title={translate('label')}>
                <SettingRow>
                  <TextInput
                    size='sm'
                    type='text'
                    className='w-100'
                    value={itemLabel}
                    onChange={nameChange}
                    onAcceptValue={nameAccept}
                    aria-label={translate('label')}
                  />
                </SettingRow>
              </SettingSection>

              <LayerConfigField
                layerConfig={layerConfig}
                layerDefinition={layerDefinition}
                isEditableDs={isEditableDs}
                onChange={onChange}
              />
              <TableSearch
                widgetId={widgetId}
                layerConfig={layerConfig}
                onChange={onChange}
              />
              {/* Override general settings */}
              <SettingSection
                role='group'
                aria-label={translate('overrideGeneralSettings')}
              >
                <SettingRow tag='label' label={translate('overrideGeneralSettings')}>
                  <Switch
                    className='can-x-switch'
                    checked={layerConfig.overrideGeneralSettings}
                    onChange={evt => { onOverrideGeneralSettings(evt.target.checked) }}
                    aria-label={translate('overrideGeneralSettings')}
                  />
                </SettingRow>
                {renderRemindModel()}
                {layerConfig.overrideGeneralSettings &&
                  <GeneralSettings
                    isMapMode={isMapMode}
                    level={'layer'}
                    config={layerConfig}
                    onPropertyChange={(name, value) => {
                      onChange(layerConfig.set(name, value))
                    }}
                  />
                }
              </SettingSection>
            </React.Fragment>
          }
        </div>
      </div>
    </div>
  )
}

export default LayerConfig
