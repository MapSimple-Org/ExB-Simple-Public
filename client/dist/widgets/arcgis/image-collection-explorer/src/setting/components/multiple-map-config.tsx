import { Fragment, useCallback, useEffect, useState, useRef } from 'react'
import { React, type IMState, ReactRedux, DataSourceManager, css, DataSourceStatus, hooks } from 'jimu-core'
import { MapViewManager } from 'jimu-arcgis'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { List, type TreeActionDataType, type TreeItemsType, type _TreeItem } from 'jimu-ui/basic/list-tree'

import dataMapOutlined from 'jimu-icons/svg/outlined/gis/data-map.svg'
import dataSceneOutlined from 'jimu-icons/svg/outlined/gis/data-scene.svg'
import settingOutlined from 'jimu-icons/svg/outlined/application/setting.svg'

import { getJimuMapViewId } from '../../utils'

import defaultMessages from '../translations/default'

export interface MultipleMapConfigProps {
  mapWidgetId: string
  sidePopperContent?: React.JSX.Element
  onClick?: (dataSourceId: string) => void
  'aria-describedby'?: string
}

const getStyle = () => {
  return css`
    .jimu-tree-main {
      padding-top: 2px;
    }
    .jimu-tree-item {
      padding: 2px;
    }
    .jimu-tree-item__icon {
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
      svg {
        margin-right: 0!important;
      }
    }
    .jimu-tree-item__body {
      background-color: transparent!important;
    }
  `
}

export const MultipleMapConfig = (props: MultipleMapConfigProps): React.ReactElement => {
  const {
    mapWidgetId,
    sidePopperContent,
    onClick,
    'aria-describedby': ariaDescribedby = '',
    ...restProps
  } = props

  const currentActiveDataSourceIdRef = useRef('')
  const containerRef = useRef(null)

  const [showPopper, setShowPopper] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  const [isAllDataSourcesReady, setIsAllDataSourcesReady] = useState(false)

  const useDataSources = ReactRedux.useSelector((state: IMState) => {
    const appState = state.appStateInBuilder
    const useDataSourcesConfig = appState && appState?.appConfig?.widgets?.[mapWidgetId]?.useDataSources
    return useDataSourcesConfig
  })

  const dataSourcesInfo = ReactRedux.useSelector((state: IMState) => {
    const appState = state.appStateInBuilder
    const dataSourcesInfoConfig = appState && appState?.dataSourcesInfo
    return dataSourcesInfoConfig
  }, (oldDssInfo, newDssInfo) => {
    if (!useDataSources) {
      return true
    } else {
      for (const useDataSource of useDataSources) {
        if (oldDssInfo && newDssInfo && (oldDssInfo[useDataSource.dataSourceId] !== newDssInfo[useDataSource.dataSourceId])) {
          return false
        }
      }
      return true
    }
  })

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  useEffect(() => {
    if (isAllDataSourcesReady) {
      return
    }
    if (!useDataSources || useDataSources?.length === 0) {
      setIsAllDataSourcesReady(true)
      return
    }
    const isReady = useDataSources?.every(item => {
    const dsInfo = dataSourcesInfo?.[item.dataSourceId]
    return dsInfo &&
          (dsInfo.instanceStatus === DataSourceStatus.Created ||
            dsInfo.instanceStatus === DataSourceStatus.CreateError)
    })
    setIsAllDataSourcesReady(isReady)
  }, [isAllDataSourcesReady, dataSourcesInfo, useDataSources])

  const getSkeletonList = useCallback(() => {
    const SKELETON_NUM = 2
    const skeletonItems = []
    for (let i = 0; i < SKELETON_NUM; i++) {
      skeletonItems.push({
        itemKey: i.toString(),
        itemStateCommands: [{
          iconProps: () => ({ icon: ' ', size: 12, style: { opacity: 0 } })
        }]
      })
    }
    return <List
      className='w-100'
      itemsJson={skeletonItems}
      dndEnabled={false}
    />
  }, [])

  const defaultItemsJson: TreeItemsType = (useDataSources?.asMutable())
    ?.sort((useDataSource1, useDataSource2) => useDataSource1.dataSourceId.localeCompare(useDataSource2.dataSourceId))
    ?.map(useDataSource => {
      const dataSourceId = useDataSource.dataSourceId
      const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
      const jimuMapViewId = getJimuMapViewId(mapWidgetId, dataSourceId)
      const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)
      const isWebScene = jimuMapView?.view?.type === '3d'
      let item = null
      if (dataSource) {
        const dataSourceLabel = dataSource.getLabel() ?? dataSource.getDataSourceJson()?.sourceLabel ?? dataSourceId
        item = {
          itemStateTitle: dataSourceLabel,
          itemKey: dataSourceId,
          itemStateIcon: { icon: isWebScene ? dataSceneOutlined : dataMapOutlined},
          itemStateCommands: [{
            label: translate('selectLayers'),
            iconProps: () => ({ icon: settingOutlined })
          }]
        }
      } else {
        item = {
          itemStateTitle: translate('none'),
          itemKey: dataSourceId,
          itemStateDisabled: true
        }
      }
      return item
    })

  const handleDataSourceSelection = useCallback((_: TreeActionDataType, refComponent: _TreeItem) => {
    const { itemJsons } = refComponent.props
    const currentItemJson = itemJsons[0]

    const itemsJson = defaultItemsJson
    const index = itemsJson.findIndex(item => item.itemKey === currentItemJson.itemKey)
    const item = containerRef.current.querySelectorAll('.jimu-tree-item__body')[index]
    setActiveItem(item)

    if (onClick) {
      onClick(currentItemJson.itemKey)
    }

    currentActiveDataSourceIdRef.current = currentActiveDataSourceIdRef.current !== currentItemJson.itemKey ? currentItemJson.itemKey : ''
    setShowPopper(currentActiveDataSourceIdRef.current === currentItemJson.itemKey)
  }, [defaultItemsJson, onClick])

  return (
    <div ref={containerRef} className='w-100 multiple-jimu-map-config-component' css={getStyle()} aria-describedby={ariaDescribedby}>
      {
        (isAllDataSourcesReady)
          ? <Fragment>
              <List
                {...restProps}
                itemsJson={defaultItemsJson}
                onClickItemCommand={handleDataSourceSelection}
              />
              <SidePopper
                position='right'
                isOpen={showPopper}
                toggle={() => {
                  setShowPopper(false)
                  currentActiveDataSourceIdRef.current = ''
                  containerRef?.current.focus()
                }}
                title={translate('selectLayers')}
                trigger={containerRef?.current}
                backToFocusNode={activeItem}
              >
                {sidePopperContent}
              </SidePopper>
            </Fragment>
          : getSkeletonList()
      }
    </div>
  )
}
