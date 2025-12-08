/** @jsx jsx */
import { React, css, getAppStore, hooks, jsx, loadArcGISJSAPIModules, defaultMessages as jimuCoreMessages, SessionManager, ReactRedux, type IMState } from 'jimu-core'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { TextInput, Loading, LoadingType, Card, defaultMessages as jimuUIMessages, AdvancedSelect, Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { GroupInfo, IMConfig } from '../../config'
import { basemapUtils } from 'jimu-arcgis'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { EmptyOutlined } from 'jimu-icons/outlined/application/empty'
import Placeholder from './placeholder'
import Indicator3d from './indicator-3d'
import ButtonWithSidePopper from './button-with-side-popper'
import { SortOutlined } from 'jimu-icons/outlined/directional/sort'

interface Props extends AllWidgetSettingProps<IMConfig> {
  onGroupBasemapItemsChange: (item: basemapUtils.BasemapItem, isSelected: boolean) => void
}

type SortField = __esri.PortalQueryParams['sortField']
type SortOrder = __esri.PortalQueryParams['sortOrder']

const sidePopperContentStyle = css`
  display: flex;
  flex-direction: column;
  .search-row {
    margin-top: 0.75rem !important;
    .sort-btn {
      padding: 0.25rem 0.25rem;
    }
    .search-input {
      min-width: 0;
    }
  }
  .card-list-container {
    display: flex;
    flex-wrap: wrap;
    margin: 0 0.625rem;
    padding: 0 0 1rem;
    li {
      width: calc(50% - 0.75rem);
      margin: 0 0.375rem 0.625rem 0.375rem;
      list-style: none;
    }
    .card {
      border: 0;
      background-color: var(--ref-palette-neutral-500);
      &.card-active, &:hover {
        box-shadow: none;
        border: 0;
        outline: 0.125rem solid var(--sys-color-primary-light);
      }
      .card-checkmark {
        line-height: 0;
        background-color: var(--sys-color-primary-light);
        border-radius: 0 0 0 0.125rem;
      }
      img {
        width:100%;
        height: 5.0625rem;
        background-color: var(--ref-palette-neutral-600);
      }
      .content {
        box-sizing: content-box;
        height: 2.0625rem;
        margin: 0.25rem 0.25rem 0.5rem;
        overflow: hidden;
        font-size: 0.75rem;
        line-height: 1rem;
        font-weight: 400;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: var(--ref-palette-neutral-1100);
      }
    }
  }
`

const ImportBasemaps = (props: Props) => {
  const { portalUrl, portalSelf, config, widgetId, onGroupBasemapItemsChange } = props
  const token = SessionManager.getInstance().getMainSession()?.token
  const { customBasemaps } = config

  const translate = hooks.useTranslation(defaultMessages, jimuCoreMessages, jimuUIMessages)

  const esriRequestRef = React.useRef<typeof __esri.request>(null)

  const [portal, setPortal] = React.useState<__esri.Portal>()

  React.useEffect(() => {
    loadArcGISJSAPIModules([
      'esri/portal/Portal',
      'esri/request'
    ]).then(modules => {
      const [Portal, esriRequest] = modules as [typeof __esri.Portal, typeof __esri.request]
      esriRequestRef.current = esriRequest

      const portalInstance = new Portal({
        url: portalUrl,
        sourceJSON: portalSelf
      })

      portalInstance.load().then(() => {
        setPortal(portalInstance)
        initGroups(portalInstance)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [groups, setGroups] = React.useState<GroupInfo[]>([])
  const displayedGroups = React.useMemo(() => {
    return groups.length ? groups : [{ id: '', title: translate('esriDefault') }]
  }, [groups, translate])

  const [selectedGroupId, setSelectedGroupId] = React.useState<string>('')

  const [loading, setLoading] = React.useState(true)

  const [esriDefault3dGroupId, setEsriDefault3dGroupId] = React.useState('')

  const initGroups = async (portal: __esri.Portal) => {
    const esriDefaultGroupInfo = await basemapUtils.getBasemapGroup(portal, portalSelf, basemapUtils.BasemapGroupType.EsriDefault)
    const esriDefault3DGroupInfo = await basemapUtils.getBasemapGroup(portal, portalSelf, basemapUtils.BasemapGroupType.EsriDefault3d)
    const orgDefaultGroupInfo = await basemapUtils.getBasemapGroup(portal, portalSelf)

    const esriDefaultGroup = { id: esriDefaultGroupInfo?.id, title: translate('esriDefault') }
    const esriDefault3DGroup = { id: esriDefault3DGroupInfo?.id, title: translate('esriDefault3d') }
    setEsriDefault3dGroupId(esriDefault3DGroupInfo?.id)
    const orgDefaultGroup = { id: orgDefaultGroupInfo?.id, title: translate('organizationDefault') }
    const user = getAppStore()?.getState()?.user
    const userGroups = user?.groups?.asMutable().map((g) => ({ id: g.id, title: g.title, isUserGroup: true })) || []
    setGroups([esriDefaultGroup, esriDefault3DGroup, orgDefaultGroup, ...userGroups])

    setSelectedGroupId(esriDefaultGroupInfo?.id || '')
  }

  const [basemapItems, setBasemapItems] = React.useState<basemapUtils.BasemapItem[]>([])

  const [searchText, setSearchText] = React.useState('')

  const searchedBasemapItems = React.useMemo(() => {
    if (!searchText) {
      return basemapItems
    }
    return basemapItems.filter(item => {
      return item.title.toUpperCase().includes(searchText.toUpperCase())
    })
  }, [basemapItems, searchText])

  const refreshBasemapItemsByGroupId = async (groupId: string, sortField?: SortField, sortOrder?: SortOrder) => {
    const groupInfo = groups?.find((g) => g?.id === selectedGroupId)
    const newItems = await basemapUtils.getBasemapItemsByGroupId({
      portal,
      portalUrl,
      groupId,
      sortField,
      sortOrder,
      is3D: groupId === esriDefault3dGroupId,
      disableExtraQuery: !groupInfo?.isUserGroup
    })
    setBasemapItems(newItems)
  }

  React.useEffect(() => {
    if (selectedGroupId) {
      setSearchText('')
      setLoading(true)
      setBasemapItems([])
      refreshBasemapItemsByGroupId(selectedGroupId, 'modified', 'desc').then(() => {
        setLoading(false)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId])

  const [sortField, setSortField] = React.useState<SortField>('modified')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc')

  const sortInfosMap = new Map<SortField, { label: string, sortOrders: Array<{ type: SortOrder, label: string }> }>([
    [undefined, {
      label: 'relevance',
      sortOrders: []
    }],
    ['modified', {
      label: 'dateModified',
      sortOrders: [
        { type: 'desc', label: 'mostRecent' },
        { type: 'asc', label: 'leastRecent' }
      ]
    }],
    ['title', {
      label: 'title',
      sortOrders: [
        { type: 'asc', label: 'alphabetical' },
        { type: 'desc', label: 'reverseAlphabetical' }
      ]
    }],
    ['num-views', {
      label: 'viewCount',
      sortOrders: [
        { type: 'desc', label: 'mostToLeast' },
        { type: 'asc', label: 'leastToMost' }
      ]
    }],
    ['owner', {
      label: 'owner',
      sortOrders: [
        { type: 'asc', label: 'alphabetical' },
        { type: 'desc', label: 'reverseAlphabetical' }
      ]
    }]
  ])

  const onSortFieldChange = (sortField: SortField) => {
    setSortField(sortField)
    const sortOrder = sortInfosMap.get(sortField).sortOrders[0]?.type
    setSortOrder(sortOrder)
    refreshBasemapItemsByGroupId(selectedGroupId, sortField, sortOrder)
  }

  const onSortOrderChange = (sortOrder) => {
    setSortOrder(sortOrder)
    refreshBasemapItemsByGroupId(selectedGroupId, sortField, sortOrder)
  }

  hooks.useUpdateEffect(() => {
    setSortField('modified')
    setSortOrder('desc')
  }, [selectedGroupId])

  const showSortOrderPart = !!sortInfosMap.get(sortField).sortOrders.length

  const isRTL = ReactRedux.useSelector((state: IMState) => {
    return state.appContext.isRTL
  })

  return <ButtonWithSidePopper
    buttonText={translate('importBasemaps')}
    buttonProps={{ style: { [isRTL ? 'marginLeft' : 'marginRight']: '8px' } }}
    buttonDescription={translate('importTip')}
    widgetId={widgetId}
    sidePopperTitle={translate('sideTitle')}>
    <div className='h-100' css={sidePopperContentStyle}>
      <SettingSection className='pt-0 border-0' title={translate('chooseWebmaps')}>
        <SettingRow>
          <AdvancedSelect
            disabled={!groups.length}
            size="sm" aria-label={translate('chooseWebmaps')}
            isMultiple={false} isEmptyOptionHidden={true}
            selectedValues={[{ label: displayedGroups.find((g) => g.id === selectedGroupId)?.title, value: selectedGroupId }]}
            staticValues={displayedGroups.map((group) => ({ label: group.title, value: group.id }))}
            sortList={false}
            onChange={(value) => { setSelectedGroupId(value?.[0]?.value as string || '') }}
          />
        </SettingRow>

        <SettingRow className='search-row'>
          <TextInput
            size='sm' className='py-0 w-100 search-input'
            prefix={<SearchOutlined size='m' color="var(--ref-palette-neutral-1200)" />}
            placeholder={translate('search')} aria-label={translate('search')}
            value={searchText} disabled={loading} allowClear={!!searchText}
            onChange={(e) => { setSearchText(e.target.value) }}
          />
          <Dropdown activeIcon menuItemCheckMode='singleCheck' className='ml-2' aria-label={translate('sort')}>
            <DropdownButton className='sort-btn' size="sm" icon arrow={false} title={translate('sort')}><SortOutlined /></DropdownButton>
            <DropdownMenu>
              <div aria-label={translate('sortBy')} role='group'>
                <DropdownItem className='px-2' header style={{ color: 'var(--ref-palette-neutral-800)' }} aria-hidden='true'>{translate('sortBy')}</DropdownItem>
                {Array.from(sortInfosMap).map(([filed, filedInfo]) => {
                  return <DropdownItem key={filedInfo.label} aria-label={translate(filedInfo.label)} active={sortField === filed} onClick={() => { onSortFieldChange(filed) }}>
                  {translate(filedInfo.label)}
                </DropdownItem>
                })}
              </div>
              {showSortOrderPart && <div aria-label={translate('sortDirection')} role='group'>
                <DropdownItem divider className='mx-0' />
                <DropdownItem className='px-2' header style={{ color: 'var(--ref-palette-neutral-800)' }} aria-hidden='true'>{translate('sortDirection')}</DropdownItem>
                {[...sortInfosMap.get(sortField).sortOrders].sort((a, b) => a.label > b.label ? 1 : -1).map((orderInfo) => {
                  return <DropdownItem key={orderInfo.label} aria-label={translate(orderInfo.label)} active={sortOrder === orderInfo.type} onClick={() => { onSortOrderChange(orderInfo.type) }}>
                    {translate(orderInfo.label)}
                  </DropdownItem>
                })}
              </div>}
            </DropdownMenu>
          </Dropdown>
        </SettingRow>
      </SettingSection>

      {loading
        ? <Loading type={LoadingType.Secondary} />
        : searchedBasemapItems.length
          ? <ul className='card-list-container' role='listbox'>
              {searchedBasemapItems.map((item) => {
                const isSelected = !!customBasemaps.find(i => i.id === item.id)
                return <li key={item.id}>
                  <Card
                    clickable active={isSelected} role='option' aria-selected={isSelected}
                    onClick={() => { onGroupBasemapItemsChange(item, !isSelected) }}
                    onKeyDown={(evt) => {
                      if (evt.key === 'Enter' || evt.key === ' ') {
                        evt.stopPropagation()
                        onGroupBasemapItemsChange(item, !isSelected)
                      }
                    }}
                  >
                    <img src={`${item.thumbnailUrl}?token=${token}`} />
                    <div className='content' title={item.title}>{item.title}</div>
                    <Indicator3d basemapInfo={item} style={{ top: '2px', left: '2px' }} />
                  </Card>
                </li>
              })}
            </ul>
          : <Placeholder text={translate('noItemFoundWarning')} icon={<EmptyOutlined size={48} color='var(--ref-palette-neutral-800)' />} style={{ flex: 1 }} />}
    </div>
  </ButtonWithSidePopper>
}

export default ImportBasemaps
