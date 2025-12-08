/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, MutableStoreManager, hooks, ReactRedux, type IMState, WidgetState, indexedDBUtils, DataSourcesChangeType } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Paper } from 'jimu-ui'

import { EmptyOutlined } from 'jimu-icons/outlined/application/empty'

import defaultMessages from './translations/default'
import type { IMConfig } from '../config'
import type { DataOptions } from './types'
import { createDataSourcesByDataOptions, getDataSource, publishDataSourcesChangeMessage, updateDataSourcesByDataOptions, updateExportSettingForDataSources } from './utils'
import { AddDataPopper, type SupportedTabs } from './components/add-data-popper'
import { DataList } from './components/data-list'
import { versionManager } from '../version-manager'
import { useItemCategoriesInfo } from '../utils'

const { useState, useEffect, useMemo, useRef, useCallback } = React
const useCache = !window.jimuConfig.isInBuilder

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { portalUrl, id, enableDataAction = true, config, mutableStateProps } = props
  const itemCategoriesInfo = useItemCategoriesInfo(config)
  const multiDataOptions: DataOptions[] = useMemo(() => mutableStateProps?.multiDataOptions || [], [mutableStateProps?.multiDataOptions])
  const setMultiDataOptions = useCallback((multiDataOptions: DataOptions[]) => {
    MutableStoreManager.getInstance().updateStateValue(id, 'multiDataOptions', multiDataOptions)
  }, [id])
  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const hiddenAddDataTabs = useMemo(() => {
    const items: SupportedTabs[] = []
    if (config.disableAddBySearch) items.push('search')
    if (config.disableAddByUrl) items.push('url')
    if (config.disableAddByFile) items.push('file')
    return items
  }, [config.disableAddBySearch, config.disableAddByUrl, config.disableAddByFile])
  const nextOrder = useMemo(() => multiDataOptions.length > 0 ? Math.max(...multiDataOptions.map(d => d.order)) + 1 : 0, [multiDataOptions])
  const rootDomRef = React.useRef<HTMLDivElement>(null)
  const cache = useRef<indexedDBUtils.IndexedDBCache>(null)

  useEffect(() => {
    // Init indexed DB and set cached data to state.
    cache.current = new indexedDBUtils.IndexedDBCache(id, 'add-data', 'added-data')
    useCache && cache.current.init().then(async () => {
      const cachedDataOptions = await cache.current.getAll() as DataOptions[]
      if (cachedDataOptions.length > 0) {
        setIsLoading(true)
        createDataSourcesByDataOptions(cachedDataOptions, id, config).catch(err => {
          console.error('Failed to create data source', err)
        }).finally(() => {
          setIsLoading(false)
        })
        setMultiDataOptions(cachedDataOptions.sort((d1, d2) => d1.order - d2.order))
      }
    }).catch(err => {
      console.error('Failed to read cache.', err)
    })

    return () => { cache.current.close() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setMultiDataOptions])

  const onAddData = (addedMultiDataOptions: DataOptions[]) => {
    // Create new data based on diff.
    cache.current.initialized() && cache.current.putAll(addedMultiDataOptions.map(d => ({ key: d.dataSourceJson.id, value: d })))
    setIsLoading(true)
    createDataSourcesByDataOptions(addedMultiDataOptions, id, config).catch(err => {
      console.error('Failed to create data source', err)
    }).finally(() => {
      setIsLoading(false)
    })

    setMultiDataOptions(multiDataOptions.concat(addedMultiDataOptions))
  }

  const onRemoveData = (dsId: string) => {
    // Remove data based on diff.
    cache.current.initialized() && cache.current.deleteAll([dsId])

    setMultiDataOptions(multiDataOptions.filter(d => d.dataSourceJson.id !== dsId))

    publishDataSourcesChangeMessage(id, DataSourcesChangeType.Remove, [getDataSource(dsId)])
  }

  const onChangeData = (newDataOptions: DataOptions) => {
    // Update data based on diff.
    cache.current.initialized() && cache.current.put(newDataOptions.dataSourceJson.id, newDataOptions)
    setIsLoading(true)
    updateDataSourcesByDataOptions([newDataOptions]).catch(err => {
      console.error('Failed to update data source', err)
    }).finally(() => {
      setIsLoading(false)
    })

    setMultiDataOptions(multiDataOptions.map(d => {
      if (d.dataSourceJson.id === newDataOptions.dataSourceJson.id) {
        return newDataOptions
      } else {
        return d
      }
    }))
  }

  hooks.useUpdateEffect(() => {
    updateExportSettingForDataSources(multiDataOptions, config)
  }, [config.disableExport, config.notAllowedExportFormat])

  const stateInControllerWidget = ReactRedux.useSelector((state: IMState) => {
    const widgetsRuntimeInfo = state?.widgetsRuntimeInfo
    return widgetsRuntimeInfo?.[id]?.state
  })

  const hideAddDataPopper = useMemo(() => stateInControllerWidget === WidgetState.Closed, [stateInControllerWidget])

  const placeholderId = `${id}-placeholder`

  return (
    <Paper className='widget-add-data jimu-widget d-flex align-items-center justify-content-center' css={style} ref={rootDomRef} shape='none'>
      {
        multiDataOptions.length === 0 &&
        <div className='no-data-placeholder w-100'>
          <div className='no-data-placeholder-icon'>
            <EmptyOutlined size={32} />
          </div>
          <div className='no-data-placeholder-text' id={placeholderId}>
            <span>{ config.placeholderText || translate('defaultPlaceholderText') }</span>
          </div>
          <div className='no-data-placeholder-btn'>
            <AddDataPopper buttonSize='lg' portalUrl={portalUrl} widgetId={id} onFinish={onAddData} hiddenTabs={hiddenAddDataTabs} popperReference={rootDomRef} nextOrder={nextOrder} config={config} itemCategoriesInfo={itemCategoriesInfo} hidePopper={hideAddDataPopper} buttonDescribedby={placeholderId} displayedItemTypeCategories={config.displayedItemTypeCategories} />
          </div>
        </div>
      }
      {
        multiDataOptions.length > 0 &&
        <div className='w-100 h-100 p-4'>
          <DataList
            multiDataOptions={multiDataOptions} enableDataAction={enableDataAction} isLoading={isLoading} widgetId={id}
            disableRenaming={config.disableRenaming}
            onRemoveData={onRemoveData} onChangeData={onChangeData} />
          <div className='w-100 d-flex justify-content-end add-by-search-samll'>
            <AddDataPopper buttonSize='sm' portalUrl={portalUrl} widgetId={id} onFinish={onAddData} hiddenTabs={hiddenAddDataTabs} popperReference={rootDomRef} nextOrder={nextOrder} config={config} itemCategoriesInfo={itemCategoriesInfo} hidePopper={hideAddDataPopper} displayedItemTypeCategories={config.displayedItemTypeCategories} />
          </div>
        </div>
      }
    </Paper>
  )
}

Widget.versionManager = versionManager

export default Widget

const style = css`
  position: relative;

  .add-by-search-samll {
    position: absolute;
    bottom: 10px;
    right: 15px;
  }

  .no-data-placeholder {
    padding: 8px;
    .no-data-placeholder-text, .no-data-placeholder-icon, .no-data-placeholder-btn{
      display: table;
      margin: 0 auto;
    }
    .no-data-placeholder-text {
      color: var(--sys-color-surface-paper-hint);
      font-size: 0.8125rem;
      margin-top: 1rem;
      text-align: center;
    }
    .no-data-placeholder-icon {
      color: var(--sys-color-surface-paper-hint);
    }
    .no-data-placeholder-btn {
      margin-top: 1rem;
    }
  }
`
