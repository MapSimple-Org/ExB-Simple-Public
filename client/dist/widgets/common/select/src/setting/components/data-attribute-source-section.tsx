/** @jsx jsx */
import { React, jsx, hooks, DataSourceComponent, type DataSource } from 'jimu-core'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages, Button, Icon } from 'jimu-ui'
import { List, type TreeItemType, type CommandType, type CommandActionDataType, type _TreeItem } from 'jimu-ui/basic/list-tree'
import { SettingRow, SidePopper } from 'jimu-ui/advanced/setting-components'
import iconAdd from 'jimu-icons/svg/outlined/editor/plus.svg'
import iconClose from 'jimu-icons/svg/outlined/editor/close.svg'
import SelectDataSourceItem from './select-data-source-item'
import DataSourceItemDetail from './data-source-item-detail'
import TitleWithSwitch from './title-with-switch'
import Placeholder from './placeholder'
import type { DataSourceItem } from '../../config'
import { type RootSettingProps, getUseDataSourcesByConfig } from '../utils'
import { getValidDataSourceItems, isExpressMode } from '../../utils'
import selectByAttributeIconSrc from 'jimu-icons/svg/outlined/application/attribute.svg'

export interface SourceSectionProps {
  rootSettingProps: RootSettingProps
  showPlaceholder: boolean
}

interface DataSourceCache {
  [dsId: string]: DataSource
}

enum CurrentDataSourceItemStatus {
  None = 'None',
  AddNew = 'AddNew',
  ShowDetail = 'ShowDetail'
}

interface CurrentDataSourceItemState {
  status: CurrentDataSourceItemStatus
  currentDataSourceItemUid: string
}

/**
 * Configure data sources when source radio 'Select by data attribute' is checked.
 */
export default function DataAttributeSourceSection (props: SourceSectionProps): React.ReactElement {
  const {
    rootSettingProps
  } = props

  const {
    id: widgetId,
    config,
    useDataSources,
    onSettingChange
  } = rootSettingProps

  const {
    dataAttributeInfo
  } = config

  const dataSourceItems = dataAttributeInfo.dataSourceItems
  const allowGenerated = !!dataAttributeInfo.allowGenerated

  const validDtaSourceItems = React.useMemo(() => {
    return getValidDataSourceItems(dataSourceItems, useDataSources)
  }, [dataSourceItems, useDataSources])

  const hasDataSourceItem = validDtaSourceItems?.length > 0

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const [dataSourceCache, setDataSourceCache] = React.useState<DataSourceCache>({})
  const newDataBtnRef = React.useRef<HTMLButtonElement>(null)
  const dataSourceButtonContainerRef = React.useRef<HTMLDivElement>(null)
  const dataSourceListContainerRef = React.useRef<HTMLDivElement>(null)
  const layerDetailPopperBackToFocusRef = React.useRef<HTMLElement>(null)
  const [currentDataSourceItemState, setCurrentDataSourceItemState] = React.useState<CurrentDataSourceItemState>({
    status: CurrentDataSourceItemStatus.None,
    currentDataSourceItemUid: null
  })

  const currentDataSourceItem: DataSourceItem = React.useMemo(() => {
    let resultCurrentDataSourceItem: DataSourceItem = null

    if (currentDataSourceItemState.currentDataSourceItemUid) {
      resultCurrentDataSourceItem = dataSourceItems.find(item => item.uid === currentDataSourceItemState.currentDataSourceItemUid)
    }

    return resultCurrentDataSourceItem
  }, [currentDataSourceItemState.currentDataSourceItemUid, dataSourceItems])

  const showSelectDataSourceItemSidePopper = currentDataSourceItemState.status === CurrentDataSourceItemStatus.AddNew
  const showDataSourceItemDetailPopper = currentDataSourceItemState.status === CurrentDataSourceItemStatus.ShowDetail && (!!currentDataSourceItem)

  const onDataSourceCreated = React.useCallback((ds: DataSource) => {
    if (ds) {
      setDataSourceCache(currDataSourceCache => {
        const dsId = ds.id
        const newDataSourceCache = Object.assign({}, currDataSourceCache, {
          [dsId]: ds
        })
        return newDataSourceCache
      })
    }
  }, [setDataSourceCache])

  const setCurrentDataSourceItemStatusToNone = React.useCallback(() => {
    setCurrentDataSourceItemState({
      status: CurrentDataSourceItemStatus.None,
      currentDataSourceItemUid: null
    })
  }, [setCurrentDataSourceItemState])

  const setCurrentDataSourceItemStatusToShowDetail = React.useCallback((dataSourceItemUid: string) => {
    setCurrentDataSourceItemState({
      status: CurrentDataSourceItemStatus.ShowDetail,
      currentDataSourceItemUid: dataSourceItemUid
    })
  }, [setCurrentDataSourceItemState])

  const onAddNewDataSourceBtnClicked = React.useCallback(() => {
    setCurrentDataSourceItemState({
      status: CurrentDataSourceItemStatus.AddNew,
      currentDataSourceItemUid: null
    })
  }, [setCurrentDataSourceItemState])

  const onAllowGeneratedLayersSwitchChange = React.useCallback((evt, checked: boolean) => {
    const newConfig = config.setIn(['dataAttributeInfo', 'allowGenerated'], checked)

    onSettingChange({
      id: widgetId,
      config: newConfig
    })
  }, [config, onSettingChange, widgetId])

  const lastSelectNewDataSourceItemTimestampRef = React.useRef<number>(null)

  const onSelectNewDataSourceItem = React.useCallback((newDataSourceItemUid) => {
    // update refs before update currentDataSourceItemState
    lastSelectNewDataSourceItemTimestampRef.current = Date.now()
    layerDetailPopperBackToFocusRef.current = newDataBtnRef.current
    setCurrentDataSourceItemStatusToShowDetail(newDataSourceItemUid)
  }, [setCurrentDataSourceItemStatusToShowDetail])

  const onSelectDataSourceItemSidePopperToggle = React.useCallback(() => {
    setCurrentDataSourceItemStatusToNone()
  }, [setCurrentDataSourceItemStatusToNone])

  const onDataSourceItemDetailPopperToggle = React.useCallback(() => {
    setCurrentDataSourceItemStatusToNone()
  }, [setCurrentDataSourceItemStatusToNone])

  // remove data source item from list
  const onRemoveDataSourceItem = React.useCallback((uid: string) => {
    if (currentDataSourceItem && currentDataSourceItem.uid === uid) {
      setCurrentDataSourceItemStatusToNone()
    }

    const newDataSourceItems = dataSourceItems.filter((item) => {
      return item.uid !== uid
    })

    const newConfig = config.setIn(['dataAttributeInfo', 'dataSourceItems'], newDataSourceItems)
    const useDataSources = getUseDataSourcesByConfig(newConfig)
    onSettingChange({
      id: widgetId,
      config: newConfig,
      useDataSources
    })
  }, [config, currentDataSourceItem, dataSourceItems, onSettingChange, setCurrentDataSourceItemStatusToNone, widgetId])

  const popupTrigger: HTMLElement[] = []

  if (dataSourceButtonContainerRef.current) {
    popupTrigger.push(dataSourceButtonContainerRef.current)
  }

  if (dataSourceListContainerRef.current) {
    popupTrigger.push(dataSourceListContainerRef.current)
  }

  const currentDataSourceItemUid = currentDataSourceItemState?.currentDataSourceItemUid

  const onClickListItem = React.useCallback((refComponent: _TreeItem) => {
    const itemJsons = refComponent?.props?.itemJsons // [selectedItemJson, allItemJsons]
    const itemJson = itemJsons?.length > 0 ? itemJsons[0] : null

    if (itemJson) {
      // update layerDetailPopperBackToFocusRef.current before update currentDataSourceItemState
      let selectedListItemDom: HTMLDivElement = null
      const selectedUid = itemJson.itemKey

      if (selectedUid) {
        if (selectedUid === currentDataSourceItemUid) {
          // hide SidePopper
          layerDetailPopperBackToFocusRef.current = null
          setCurrentDataSourceItemStatusToNone()
        } else {
          // select another item and show SidePopper

          // update layerDetailPopperBackToFocusRef.current
          if (dataSourceItems?.length > 0) {
            const index = dataSourceItems.findIndex(item => item?.uid === selectedUid)

            if (index >= 0) {
              const listItemDoms = dataSourceListContainerRef.current.getElementsByClassName('jimu-tree-item__body')

              if (listItemDoms && listItemDoms.length > 0 && index <= listItemDoms.length - 1) {
                selectedListItemDom = listItemDoms[index] as HTMLDivElement
              }
            }
          }

          layerDetailPopperBackToFocusRef.current = selectedListItemDom

          // update currentDataSourceItemState
          setCurrentDataSourceItemStatusToShowDetail(selectedUid)
        }
      }
    }
  }, [currentDataSourceItemUid, dataSourceItems, setCurrentDataSourceItemStatusToNone, setCurrentDataSourceItemStatusToShowDetail])

  const listItemsJson = React.useMemo(() => {
    const resultListItemsJson: TreeItemType[] = []

    validDtaSourceItems.forEach((item) => {
      const itemDsId = item.useDataSource.dataSourceId
      const itemStateChecked = !!(currentDataSourceItem && itemDsId === currentDataSourceItem.useDataSource.dataSourceId)
      let itemTitle: string = ''

      const ds = dataSourceCache[itemDsId]

      if (ds) {
        itemTitle = ds.getLabel()
      }

      const commands: CommandType[] = [
        {
          label: translate('remove'),
          iconProps: () => ({ icon: iconClose, size: 12 }),
          action: ({ data }: CommandActionDataType) => {
            const itemJsons = data?.itemJsons
            const itemJson = itemJsons?.length > 0 ? itemJsons[0] : null

            if (itemJson) {
              const dataSourceItemUid = itemJson.itemKey
              onRemoveDataSourceItem(dataSourceItemUid)
            }
          }
        }
      ]

      const hasSql = item.sqlExpression?.parts?.length > 0

      if (hasSql) {
        // only show sql icon when user has configured sqlExpression
        commands.unshift({
          label: '',

          // IconComponentProps
          iconProps: {
            icon: selectByAttributeIconSrc,
            size: 16
          },

          action: ({ data }: CommandActionDataType) => {
            onClickListItem(data?.refComponent)
          }
        })
      }

      const listItem: TreeItemType = {
        itemKey: item.uid,
        // dataSourceItem: item,
        itemStateChecked,
        itemStateTitle: itemTitle, // item.useDataSource.dataSourceId,
        itemStateCommands: commands
      }

      resultListItemsJson.push(listItem)
    })

    return resultListItemsJson
  }, [currentDataSourceItem, dataSourceCache, validDtaSourceItems, onRemoveDataSourceItem, onClickListItem, translate])

  const shouldShowPlaceholder = !hasDataSourceItem && !isExpressMode()
  const noDataSourceTooltipDomId = React.useId()

  return (
    <React.Fragment>
      {
        dataSourceItems.map(dataSourceItem => {
          const useDataSource = dataSourceItem.useDataSource

          return (
            <DataSourceComponent
              key={useDataSource.dataSourceId}
              useDataSource={useDataSource}
              onDataSourceCreated={onDataSourceCreated}
            />
          )
        })
      }

      <SettingRow>
        <div className='w-100' ref={dataSourceButtonContainerRef}>
          <Button
            className='w-100 text-default set-link-btn'
            onClick={onAddNewDataSourceBtnClicked}
            type='primary'
            aria-label={translate('newData')}
            aria-describedby={noDataSourceTooltipDomId}
            ref={newDataBtnRef}
          >
            <div className='w-100 px-2 text-truncate'>
              <Icon icon={iconAdd} className='mr-1' size={14} />
              {translate('newData')}
            </div>
          </Button>
        </div>
      </SettingRow>

      {
        shouldShowPlaceholder &&
        <React.Fragment>
          <Placeholder
            text={translate('noDataSourceTooltip')}
            style={{ height: 'calc(100% - 15rem)' }}
          />
          <span id={noDataSourceTooltipDomId} className='d-none'>{translate('noDataSourceTooltip')}</span>
        </React.Fragment>
      }

      {
        hasDataSourceItem &&
        <React.Fragment>
          <SettingRow flow='wrap' label={translate('selectableLayers')} aria-label={translate('selectableLayers')} role='group'>
            <TitleWithSwitch
              checked={allowGenerated}
              titleKey='allowGeneratedData'
              onSwitchChange={onAllowGeneratedLayersSwitchChange}
            />
          </SettingRow>

          <SettingRow>
            <div className='w-100' ref={dataSourceListContainerRef}>
              <List
                dndEnabled={false}
                showCheckbox={false}
                itemsJson={listItemsJson}

                onClickItemBody={(actionData, refComponent) => {
                  onClickListItem(refComponent)
                }}
              />
            </div>
          </SettingRow>
        </React.Fragment>
      }

      <SidePopper
        isOpen={showSelectDataSourceItemSidePopper}
        toggle={onSelectDataSourceItemSidePopperToggle}
        position='right'
        trigger={popupTrigger}
        backToFocusNode={!showDataSourceItemDetailPopper ? newDataBtnRef.current : null}
        title={translate('configureLayerAttribute')}
      >
        {
          showSelectDataSourceItemSidePopper &&
          <SelectDataSourceItem rootSettingProps={rootSettingProps} onSelectNewDataSourceItem={onSelectNewDataSourceItem} />
        }
      </SidePopper>

      <SidePopper
        isOpen={showDataSourceItemDetailPopper}
        toggle={onDataSourceItemDetailPopperToggle}
        position='right'
        trigger={popupTrigger}
        backToFocusNode={layerDetailPopperBackToFocusRef.current}
        title={translate('configureLayerAttribute')}
      >
        {
          showDataSourceItemDetailPopper &&
          <DataSourceItemDetail rootSettingProps={rootSettingProps} currentDataSourceItem={currentDataSourceItem} lastSelectNewDataSourceItemTimestampRef={lastSelectNewDataSourceItemTimestampRef} />
        }
      </SidePopper>

    </React.Fragment>
  )
}
