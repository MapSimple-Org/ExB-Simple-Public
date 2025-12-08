/** @jsx jsx */
import { React, hooks, jsx, css, type AllWidgetProps, type IMState, DataSourceStatus } from 'jimu-core'
import { defaultMessages as jimuUIMessages, WidgetPlaceholder, Loading, LoadingType, Paper } from 'jimu-ui'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import defaultMessages from './translations/default'
import UseDataSourceEntry from './components/use-data-source-entry'
import UseMapEntry from './components/use-map-entry'
import { WidgetDisplayMode, type ExtraSelectWidgetProps, type SelectWidgetProps, type DataSourceItemRuntimeInfoMap, type DataSourceItemRuntimeInfo, type ClearAllDataSourceItemRuntimeInfoMap } from './utils'
import { getConfigWithValidDataSourceItems } from '../utils'
import type { IMConfig } from '../config'
import selectWidgetIconSrc from '../../icon.svg'
import { versionManager } from '../version-manager'

const style = css`
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  .nowrap {
    white-space: nowrap;
    text-wrap: nowrap;
  }

  .no-layers-panel-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding-left: 50px;
    padding-right: 50px;
    overflow-y: hidden;
  }

  :has(.select-custom-sql-builder) {
    .select-use-data-source-entry, .select-use-map-entry {
      display: none;
    }
  }
`

const Widget = (props: SelectWidgetProps): React.ReactElement => {
  const {
    isRTL,
    widgetId,
    config
  } = props

  const {
    useMap
  } = config

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const widgetDomRef = React.useRef<HTMLDivElement>(null)
  const [widgetDisplayMode, setWidgetDisplayMode] = React.useState<WidgetDisplayMode>(WidgetDisplayMode.Placeholder)
  const widgetDisplayModeRef = React.useRef<WidgetDisplayMode>(widgetDisplayMode)
  widgetDisplayModeRef.current = widgetDisplayMode
  const alreadySetLoadingDisplayModeRef = React.useRef<boolean>(false)
  const timerRef = React.useRef<NodeJS.Timeout>(null)
  const [dataSourceItemRuntimeInfoMap, setDataSourceItemRuntimeInfoMap] = React.useState<DataSourceItemRuntimeInfoMap>({})

  const updateWidgetDisplayMode = React.useCallback((displayMode: WidgetDisplayMode) => {
    if (displayMode !== widgetDisplayModeRef.current) {
      if (displayMode === WidgetDisplayMode.Loading) {
        if (alreadySetLoadingDisplayModeRef.current) {
          // we have ever set loading display mode before, we only show loading mode one time
          return
        } else {
          alreadySetLoadingDisplayModeRef.current = true

          // only show loading for 20s, we will show NoLayersTip display mode if timeout
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              if (widgetDisplayModeRef.current === WidgetDisplayMode.Loading) {
                setWidgetDisplayMode(WidgetDisplayMode.NoLayersTip)
              }
            }, 20000)
          }
        }
      }

      setWidgetDisplayMode(displayMode)
    }
  }, [])

  // clear timer when unmounted
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // mixin newly added runtimeInfoMap or updated runtimeInfoMap into dataSourceItemRuntimeInfoMap
  const mixinDataSourceItemRuntimeInfoMap = React.useCallback((updatedDataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap) => {
    if (!updatedDataSourceItemRuntimeInfoMap || Object.keys(updatedDataSourceItemRuntimeInfoMap).length === 0) {
      return
    }

    setDataSourceItemRuntimeInfoMap(currDataSourceItemRuntimeInfoMap => {
      // console.debug('mixinDataSourceItemRuntimeInfoMap')
      const newDataSourceItemRuntimeInfoMap = Object.assign({}, currDataSourceItemRuntimeInfoMap, updatedDataSourceItemRuntimeInfoMap)
      return newDataSourceItemRuntimeInfoMap
    })
  }, [setDataSourceItemRuntimeInfoMap])

  // update the DataSourceItemRuntimeInfo for the specific uid
  const updateDataSourceItemRuntimeInfoForUid = React.useCallback((uid: string, itemRuntimeInfoMixin: Partial<DataSourceItemRuntimeInfo>) => {
    setDataSourceItemRuntimeInfoMap((currDataSourceItemRuntimeInfoMap) => {
      const oldItemRuntimeInfo = currDataSourceItemRuntimeInfoMap[uid]

      if (!oldItemRuntimeInfo) {
        return currDataSourceItemRuntimeInfoMap
      }

      const newItemRuntimeInfo = Object.assign({}, oldItemRuntimeInfo, itemRuntimeInfoMixin)
      const newDataSourceItemRuntimeInfoMap = Object.assign({}, currDataSourceItemRuntimeInfoMap)
      newDataSourceItemRuntimeInfoMap[uid] = newItemRuntimeInfo
      return newDataSourceItemRuntimeInfoMap
    })
  }, [setDataSourceItemRuntimeInfoMap])

  const clearAllDataSourceItemRuntimeInfoMap = React.useCallback(() => {
    setDataSourceItemRuntimeInfoMap(() => {
      // console.debug('clearAllDataSourceItemRuntimeInfoMap')
      return {}
    })
  }, [setDataSourceItemRuntimeInfoMap])
  const clearAllDataSourceItemRuntimeInfoMapRef = React.useRef<ClearAllDataSourceItemRuntimeInfoMap>(null)
  clearAllDataSourceItemRuntimeInfoMapRef.current = clearAllDataSourceItemRuntimeInfoMap

  const removeNotUsedDataSourceItemRuntimeInfoMap = React.useCallback((allUsedUids: string[]) => {
    setDataSourceItemRuntimeInfoMap((currDataSourceItemRuntimeInfoMap) => {
      // console.debug('removeNotUsedDataSourceItemRuntimeInfoMap')
      const needToRemovedUids: string[] = []
      Object.keys(currDataSourceItemRuntimeInfoMap).forEach(uid => {
        if (!allUsedUids.includes(uid)) {
          needToRemovedUids.push(uid)
        }
      })

      if (needToRemovedUids.length > 0) {
        const newDataSourceItemRuntimeInfoMap = Object.assign({}, currDataSourceItemRuntimeInfoMap)
        needToRemovedUids.forEach(uid => {
          // console.debug(`removeNotUsedDataSourceItemRuntimeInfoMap delete uid, uid: ${uid}, displayTitle: ${newDataSourceItemRuntimeInfoMap[uid].displayTitle}`)
          delete newDataSourceItemRuntimeInfoMap[uid]
        })
        return newDataSourceItemRuntimeInfoMap
      } else {
        // nothing changed
        return currDataSourceItemRuntimeInfoMap
      }
    })
  }, [setDataSourceItemRuntimeInfoMap])

  const removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap = React.useCallback(() => {
    setDataSourceItemRuntimeInfoMap((currDataSourceItemRuntimeInfoMap) => {
      // console.debug('removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap')

      const needToRemovedUids: string[] = []
      Object.keys(currDataSourceItemRuntimeInfoMap).forEach(uid => {
        const runtimeInfo = currDataSourceItemRuntimeInfoMap[uid]

        if (runtimeInfo?.jimuLayerView?.fromRuntime) {
          needToRemovedUids.push(uid)
        }
      })

      if (needToRemovedUids.length > 0) {
        const newDataSourceItemRuntimeInfoMap = Object.assign({}, currDataSourceItemRuntimeInfoMap)
        needToRemovedUids.forEach(uid => {
          // console.debug(`removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap delete uid, uid: ${uid}, displayTitle: ${newDataSourceItemRuntimeInfoMap[uid].displayTitle}`)
          delete newDataSourceItemRuntimeInfoMap[uid]
        })
        return newDataSourceItemRuntimeInfoMap
      } else {
        // nothing changed
        return currDataSourceItemRuntimeInfoMap
      }
    })
  }, [setDataSourceItemRuntimeInfoMap])

  // If useMap changed, we should clear all runtimeInfo cache
  // Don't use React.useEffect(cb, [useMap]) here, because even if useMap doesn't change, cb will be executed on the first render, which is not expected.
  // We only want cb to be executed when useMap actually changes.
  hooks.useEffectWithPreviousValues((preValues) => {
    const preUseMap = preValues[0] || false

    if (useMap !== preUseMap) {
      if (clearAllDataSourceItemRuntimeInfoMapRef.current) {
        clearAllDataSourceItemRuntimeInfoMapRef.current()
      }
    }
  }, [useMap]) // Note, this effect should only use useMap as the only dependency.

  const styleObj = widgetDisplayMode === WidgetDisplayMode.Placeholder ? { borderRadius: 0 } : {}

  return (
    <Paper shape='none' ref={widgetDomRef} className='jimu-widget widget-select' css={style} style={styleObj}>
      {/* use data source */}
      {
        !useMap &&
        <UseDataSourceEntry
          isRTL={isRTL}
          className={ widgetDisplayMode === WidgetDisplayMode.Normal ? '' : 'd-none'}
          widgetProps={props}
          widgetDomRef={widgetDomRef}
          dataSourceItemRuntimeInfoMap={dataSourceItemRuntimeInfoMap}
          mixinDataSourceItemRuntimeInfoMap={mixinDataSourceItemRuntimeInfoMap}
          updateDataSourceItemRuntimeInfoForUid={updateDataSourceItemRuntimeInfoForUid}
          removeNotUsedDataSourceItemRuntimeInfoMap={removeNotUsedDataSourceItemRuntimeInfoMap}
          updateWidgetDisplayMode={updateWidgetDisplayMode}
        />
      }

      {/* use map */}
      {
        useMap &&
        <UseMapEntry
          isRTL={isRTL}
          className={ widgetDisplayMode === WidgetDisplayMode.Normal ? '' : 'd-none'}
          widgetProps={props}
          widgetDomRef={widgetDomRef}
          dataSourceItemRuntimeInfoMap={dataSourceItemRuntimeInfoMap}
          mixinDataSourceItemRuntimeInfoMap={mixinDataSourceItemRuntimeInfoMap}
          updateDataSourceItemRuntimeInfoForUid={updateDataSourceItemRuntimeInfoForUid}
          clearAllDataSourceItemRuntimeInfoMap={clearAllDataSourceItemRuntimeInfoMap}
          removeNotUsedDataSourceItemRuntimeInfoMap={removeNotUsedDataSourceItemRuntimeInfoMap}
          removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap={removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap}
          updateWidgetDisplayMode={updateWidgetDisplayMode}
        />
      }

      {
        (widgetDisplayMode === WidgetDisplayMode.NoLayersTip) &&
        <div className='no-layers-panel w-100 h-100 d-flex align-items-center'>
          <div className='no-layers-panel-content w-100 h-100'>
            <InfoOutlined width={24} height={24} />
            <div className='mt-2 mb-2'>{translate('noLayersAvailableTip')}</div>
            {
              window.jimuConfig?.isInBuilder &&
              <div>{translate('openSettingPanelTip')}</div>
            }
            </div>
        </div>
      }

      {
        (widgetDisplayMode === WidgetDisplayMode.Loading) &&
        <Loading type={LoadingType.Secondary} />
      }

      {
        (widgetDisplayMode === WidgetDisplayMode.Placeholder) &&
        <WidgetPlaceholder
          widgetId={widgetId}
          icon={selectWidgetIconSrc}
          name={translate('_widgetLabel')}
        />
      }
    </Paper>
  )
}

Widget.mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMConfig>): ExtraSelectWidgetProps => {
  let isRTL = false
  let dataSourceCount = 0
  let mapWidgetId = ''
  let autoControlWidgetId = ''

  const config = getConfigWithValidDataSourceItems(props.config, props.useDataSources) || props.config

  if (state.appContext?.isRTL) {
    isRTL = true
  }

  if (state.dataSourcesInfo) {
    Object.values(state.dataSourcesInfo).forEach(dataSourceInfo => {
      // dataSourceCount should only record the created data source count
      if (dataSourceInfo && dataSourceInfo.instanceStatus === DataSourceStatus.Created) {
        dataSourceCount++
      }
    })
  }

  const useMapWidgetIds = props.useMapWidgetIds

  if (useMapWidgetIds && useMapWidgetIds.length > 0) {
    mapWidgetId = useMapWidgetIds[0]
  }

  if (state.mapWidgetsInfo && mapWidgetId) {
    autoControlWidgetId = state.mapWidgetsInfo[mapWidgetId]?.autoControlWidgetId || ''
  }

  return {
    isRTL,
    dataSourceCount,
    mapWidgetId,
    autoControlWidgetId,
    config
  }
}

Widget.versionManager = versionManager

export default Widget
