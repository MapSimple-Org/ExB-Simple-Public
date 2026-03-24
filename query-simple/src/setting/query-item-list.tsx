/** @jsx jsx */
import { React, jsx, css, Immutable, type ImmutableArray, type ImmutableObject, urlUtils, polished, classNames, hooks } from 'jimu-core'
import { Button, Icon } from 'jimu-ui'
import { List, TreeItemActionType, type TreeItemsType, type TreeItemType, type CommandActionDataType } from 'jimu-ui/basic/list-tree'
import { SettingRow, SettingSection, SidePopper } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import type { QueryItemType, QueryArrangeType } from '../config'
import { DataSourceTip } from 'widgets/shared-code/mapsimple-common'
import { widgetSettingDataMap } from './setting-config'
import { QueryItemSetting } from './query-item-setting'

const { iconMap, iconPropMap } = widgetSettingDataMap

interface Props {
  widgetId: string
  arrangeType: QueryArrangeType
  queryItems?: ImmutableArray<QueryItemType>
  onNewQueryItemAdded: (item: ImmutableObject<QueryItemType>) => void
  onQueryItemRemoved: (index: number) => void
  onQueryItemChanged: (index: number, item: ImmutableObject<QueryItemType>, dsUpdateRequired?: boolean) => void
  onOrderChanged: (queryItems: QueryItemType[]) => void
}

const style = css`
  height: calc(100vh - 485px);
  & > div {
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    color: var(--ref-palette-neutral-800);
  }
  p {
    color: var(--ref-palette-neutral-1000);
    font-size: 0.875rem;
    margin: ${polished.rem(16)} auto 0;
    line-height: 1.5;
    width: ${polished.rem(228)};
  }
`

export function QueryItemList (props: Props) {
  const { queryItems = [], onNewQueryItemAdded, onQueryItemChanged, onQueryItemRemoved, onOrderChanged } = props
  const sidePopperTrigger = React.useRef<HTMLDivElement>(null)
  const newQueryBtn = React.useRef<HTMLButtonElement>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const selectedIndexRef = hooks.useLatest(selectedIndex)

  // r026.023: Track which query items have broken data sources via DataSourceTip callbacks.
  // Use a ref to avoid re-render loops — DataSourceTip fires onStatusChange on mount,
  // which would trigger setState → re-render → re-mount DataSourceTip → infinite loop.
  const brokenDsRef = React.useRef<Set<number>>(new Set())
  const [brokenDsCount, setBrokenDsCount] = React.useState(0)
  const handleDsStatusChange = React.useCallback((index: number, enabled: boolean) => {
    const prev = brokenDsRef.current
    const hadIt = prev.has(index)
    if (enabled && hadIt) {
      prev.delete(index)
      setBrokenDsCount(prev.size)
    } else if (!enabled && !hadIt) {
      prev.add(index)
      setBrokenDsCount(prev.size)
    }
    // No state change if nothing actually changed — prevents re-render loops
  }, [])
  const hasBrokenDs = brokenDsCount > 0

  const handleNewQueryClicked = React.useCallback(() => {
    setSelectedIndex(queryItems.length)
  }, [queryItems.length])

  const toggleQueryItemPanel = (index: number) => {
    if (selectedIndexRef.current === index) {
      setSelectedIndex(-1)
    } else {
      setSelectedIndex(index)
    }
  }

  const clearSelection = React.useCallback(() => {
    setSelectedIndex(-1)
  }, [])

  const handleDuplicateQuery = React.useCallback((index: number) => {
    const queryToDuplicate = queryItems[index]
    const newConfigId = `${Math.random()}`.slice(2)
    
    const duplicatedQuery = Immutable({
      ...queryToDuplicate,
      configId: newConfigId,
      outputDataSourceId: `${props.widgetId}_output_${newConfigId}`,
      name: `${queryToDuplicate.name} (Copy)`,
      searchAlias: queryToDuplicate.searchAlias ? `${queryToDuplicate.searchAlias}_copy` : undefined,
      shortId: queryToDuplicate.shortId ? `${queryToDuplicate.shortId}_copy` : undefined
    })
    
    onNewQueryItemAdded(duplicatedQuery)
  }, [queryItems, props.widgetId, onNewQueryItemAdded])

  const advancedActionMap = {
    overrideItemBlockInfo: ({ itemBlockInfo }, refComponent) => {
      return {
        name: TreeItemActionType.RenderOverrideItem,
        children: [{
          name: TreeItemActionType.RenderOverrideItemDroppableContainer,
          withListGroupItemWrapper: false,
          children: [{
            name: TreeItemActionType.RenderOverrideItemDraggableContainer,
            children: [{
              name: TreeItemActionType.RenderOverrideItemBody,
              children: [{
                name: TreeItemActionType.RenderOverrideItemMainLine,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDragHandle
                }, {
                  name: TreeItemActionType.RenderOverrideItemIcon,
                  autoCollapsed: true
                }, {
                  name: TreeItemActionType.RenderOverrideItemTitle
                }, {
                  name: TreeItemActionType.RenderOverrideItemDetailToggle
                }, {
                  name: TreeItemActionType.RenderOverrideItemCommands
                }]
              }]
            }]
          }]
        }]
      }
    }
  }

  return (
    <div
      ref={sidePopperTrigger}
      css={css`
        border-bottom: 1px solid var(--ref-palette-neutral-700);
        &.h-100 > .jimu-widget-setting--section {
          border-bottom: none;
        }
      `}
      className={classNames('d-flex flex-column', { 'h-100': queryItems.length === 0 })}
    >
      <SettingSection role='group' aria-label={getI18nMessage('queryItem')} title={getI18nMessage('queryItem')}>
        <SettingRow flow='wrap'>
          <Button
            aria-describedby={queryItems.length === 0 ? 'noQueryItemDesc' : undefined}
            className='w-100 text-default set-link-btn'
            onClick={handleNewQueryClicked}
            type='primary'
            ref={newQueryBtn}
          >
            <div className='w-100 px-2 text-truncate'>
              <Icon icon={iconMap.iconAdd} className='mr-1' size={14} />
              {getI18nMessage('newQuery')}
            </div>
          </Button>
        </SettingRow>
        {/* r026.022–024: Banner when DataSourceTip reports broken data sources.
            Directs user to the Data Source Management (rebind) tool below. */}
        {hasBrokenDs && (
          <div css={css`
            margin-top: 8px; padding: 6px 10px;
            background: var(--ref-palette-yellow-100, #fff3cd);
            color: var(--ref-palette-yellow-900, #856404);
            border-radius: 4px; font-size: 11px; line-height: 1.5;
          `}>
            {brokenDsCount} {brokenDsCount === 1 ? 'query has' : 'queries have'} an inaccessible data source.
            Use <strong>Data Source Management</strong> below to rebind.
          </div>
        )}
        <div className='setting-ui-unit-list mt-4'>
          <List
            className='setting-ui-unit-list-existing'
            itemsJson={queryItems.map((item, index) => ({
              itemStateDetailContent: item,
              itemKey: `${index}`,
              itemStateChecked: selectedIndex === index,
              itemStateIcon: { icon: item.icon?.svg },
              itemStateTitle: item.name,
              itemStateCommands: [
                {
                  label: getI18nMessage('duplicate'),
                  iconProps: () => ({ icon: iconMap.iconDuplicate, size: 12 }),
                  action: ({ data }: CommandActionDataType) => {
                    const { itemJsons: [currentItemJson] } = data
                    handleDuplicateQuery(+currentItemJson.itemKey)
                  }
                },
                {
                  label: getI18nMessage('remove'),
                  iconProps: () => ({ icon: iconMap.iconClose, size: 12 }),
                  action: ({ data }: CommandActionDataType) => {
                    const { itemJsons: [currentItemJson] } = data
                    onQueryItemRemoved(+currentItemJson.itemKey)
                  }
                }
              ]
            })) as TreeItemType[]}
            dndEnabled
            renderOverrideItemDetailToggle={(actionData, refComponent) => {
              const { itemJsons } = refComponent.props
              const [currentItemJson] = itemJsons
              const ds = currentItemJson?.itemStateDetailContent?.useDataSource
              const itemIndex = +currentItemJson.itemKey
              return (
                <DataSourceTip
                  widgetId={props.widgetId}
                  useDataSource={ds}
                  onStatusChange={(enabled) => handleDsStatusChange(itemIndex, enabled)}
                />
              )
            }}
            onUpdateItem={(actionData, refComponent) => {
              const { itemJsons } = refComponent.props
              const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
              onOrderChanged(parentItemJson.map(i => i.itemStateDetailContent))
            }}
            onClickItemBody={(actionData, refComponent) => {
              const { itemJsons: [currentItemJson] } = refComponent.props
              toggleQueryItemPanel(+currentItemJson.itemKey)
            }}
            {...advancedActionMap}
          />
          {
            queryItems.length === selectedIndex && // render the adding query item(new query item)
              <List
                className='setting-ui-unit-list-new pt-1'
                css={css`.jimu-tree-item__detail-toggle { display: none !important; }`}
                itemsJson={[{
                  icon: iconPropMap.defaultIconResult,
                  name: '......'
                }].map(item => ({
                  itemStateDetailContent: item,
                  itemKey: `${selectedIndex}`,
                  itemStateChecked: true,
                  itemStateIcon: { icon: item.icon?.svg },
                  itemStateTitle: item.name,
                  itemStateCommands: []
                }))}
                dndEnabled={false}
                {...advancedActionMap}
              />
          }
        </div>
      </SettingSection>
      {
        queryItems.length === 0 && queryItems.length !== selectedIndex && // render empty placeholder if there is no query items
          <div className='text-center flex-grow-1' css={style}>
            <div className='position-absolute'>
              <Icon size={48} icon={iconMap.iconEmpty} />
              <p id='noQueryItemDesc' className='trigger-tip'>
                { getI18nMessage('noQueryTip', { newQuery: getI18nMessage('newQuery') }) }
              </p>
            </div>
          </div>
      }
      <SidePopper
        isOpen={selectedIndex >= 0 && !urlUtils.getAppIdPageIdFromUrl().pageId}
        toggle={clearSelection}
        position='right'
        trigger={sidePopperTrigger.current}
        title={getI18nMessage('setQuery')}
        backToFocusNode={newQueryBtn.current}
      >
        <div className='setting-query__query-item-panel w-100 h-100'>
          <QueryItemSetting
            widgetId={props.widgetId}
            index={selectedIndex}
            total={queryItems.length}
            arrangeType={props.arrangeType}
            queryItem={queryItems[selectedIndex]}
            onQueryItemAdded={onNewQueryItemAdded}
            onQueryItemChanged={onQueryItemChanged}
          />
        </div>
      </SidePopper>
    </div>
  )
}
