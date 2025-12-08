/** @jsx jsx */
import { jsx, React, hooks, DataSourceComponent, dataSourceUtils } from 'jimu-core'
import type { ImmutableArray, UseDataSource, DataSource, IMDataSourceInfo } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { IMConfig } from '../../config'
import { useEffect } from 'react'

interface Props {
  id: string
  config: IMConfig
  datasource: DataSource
  useDataSources: ImmutableArray<UseDataSource>
  onSettingChange: SettingChangeFunction
  setDatasource: (ds: DataSource, setDsCallBack?: () => void) => void
  checkIsDsAutoRefreshSettingOpen: (datasource: DataSource) => boolean
  onSettingChangeAndUpdateUsedFieldsOfDs: (config?: IMConfig) => void
}

const CreateDataSource = (props: Props) => {
  const isPreDataSourceRefreshOpenRef = React.useRef(false)
  const preUseDataSources = React.useRef(null)
  const didMountRef = React.useRef(false)
  const { id, useDataSources, datasource, config } = props
  const { onSettingChange, setDatasource, checkIsDsAutoRefreshSettingOpen, onSettingChangeAndUpdateUsedFieldsOfDs } = props

  useEffect(() => {
    didMountRef.current && updateConfigWhenDataSourceChange(useDataSources)
    preUseDataSources.current = useDataSources
    didMountRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDataSources])

  const updateConfigWhenDataSourceChange = hooks.useEventCallback((currentUseDataSources: ImmutableArray<UseDataSource>) => {
    const oldDs = preUseDataSources.current?.[0]
    const currentDs = currentUseDataSources?.[0]
    if (oldDs?.dataSourceId !== currentDs?.dataSourceId) {
      let areDerivedFromSameMain = oldDs?.dataSourceId === currentDs?.dataSourceId
      if (currentDs && oldDs && oldDs?.dataSourceId !== currentDs?.dataSourceId) {
        // Same-origin ds, that is, toggle data view or selection view，keep config
        areDerivedFromSameMain = dataSourceUtils.areDerivedFromSameMain(oldDs?.dataSourceId, currentDs?.dataSourceId)
      }
      if (!currentDs || !oldDs || !areDerivedFromSameMain) {
        if (currentDs?.fields?.length > 0) {
          const newConfig = config.set('sorts', undefined).set('searchFields', undefined).set('filter', undefined)
          onSettingChangeAndUpdateUsedFieldsOfDs(newConfig)
        }
        if (oldDs && !currentDs) {
          // remove from ds manager
          setDatasource(undefined)
        }
      }
    }
  })

  const onDsCreate = ds => {
    setDatasource(ds, () => {
      const isShowAutoRefresh = checkIsDsAutoRefreshSettingOpen(ds)
      isPreDataSourceRefreshOpenRef.current = isShowAutoRefresh
      initIsShowAutoRefresh(ds)
    })
  }

  const initIsShowAutoRefresh = hooks.useEventCallback((ds) => {
    const isShowAutoRefresh = checkIsDsAutoRefreshSettingOpen(ds)
    if ((config?.isShowAutoRefresh as any) !== true && isShowAutoRefresh) {
      const newConfig = config.set('isShowAutoRefresh', isShowAutoRefresh)
      onConfigChange(newConfig)
    }
  })

  const onDataSourceInfoChange = hooks.useEventCallback((info: IMDataSourceInfo) => {
    if (!info || !datasource) {
      return
    }
    const isDsAutoRefreshSettingOpen = checkIsDsAutoRefreshSettingOpen(datasource)
    if (isDsAutoRefreshSettingOpen && !isPreDataSourceRefreshOpenRef.current) {
      const newConfig = config.set('isShowAutoRefresh', isDsAutoRefreshSettingOpen)
      onConfigChange(newConfig)
    }
    isPreDataSourceRefreshOpenRef.current = isDsAutoRefreshSettingOpen
  })

  const onConfigChange = newConfig => {
    const alterProps = {
      id: id,
      config: newConfig
    }
    onSettingChange(alterProps)
  }

  return (
    <React.Fragment>
      {useDataSources?.[0] && <div className='waiting-for-database'>
        <DataSourceComponent
          useDataSource={useDataSources[0]}
          onDataSourceCreated={onDsCreate}
          onDataSourceInfoChange={onDataSourceInfoChange}
        />
      </div>}
    </React.Fragment>
  )
}
export default CreateDataSource