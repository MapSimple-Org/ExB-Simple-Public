/** @jsx jsx */
import { React, jsx, css, defaultMessages as jimuCoreMessages, hooks, type ImmutableArray, focusElementInKeyboardMode, ReactRedux, type IMState } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Button, Popper, Tab, Tabs, PanelHeader, Alert, MobilePanel, FOCUSABLE_CONTAINER_CLASS, Resizable, type ResizableProps } from 'jimu-ui'

import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'

import defaultMessages from '../../translations/default'
import type { DataOptions } from '../../types'
import { DataItemSearch } from './data-item-search'
import { DataUrlInput } from './data-url-input'
import { DataFileUpload } from './data-file-upload'
import { DataCollapse } from './data-collapse'
import type { IMConfig, ItemCategoryInfo } from '../../../config'
import type { ItemTypeCategory } from 'jimu-ui/basic/item-selector'

export interface AddDataPopperProps {
  portalUrl: string
  widgetId: string
  buttonSize: 'sm' | 'lg'
  hiddenTabs: SupportedTabs[]
  popperReference: React.RefObject<HTMLDivElement>
  nextOrder: number
  config: IMConfig
  itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>
  displayedItemTypeCategories?: ImmutableArray<ItemTypeCategory>
  hidePopper?: boolean
  buttonDescribedby?: string
  onFinish: (multiDataOptions: DataOptions[]) => void
}

const { useState, useMemo, useRef, useCallback, useEffect } = React

const SUPPORTED_TABS = ['search', 'url', 'file'] as const

const POPPER_DEFAULT_SIZE = { width: 240, height: 600 }

export type SupportedTabs = typeof SUPPORTED_TABS[number]

export const AddDataPopper = (props: AddDataPopperProps) => {
  const { portalUrl, widgetId, buttonSize, hiddenTabs, popperReference, nextOrder: propsNextOrder, config, onFinish: propsOnFinish, itemCategoriesInfo, hidePopper, buttonDescribedby, displayedItemTypeCategories } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>(null)
  const [multiDataOptionsFromSearch, setMultiDataOptionsFromSearch] = useState<DataOptions[]>([])
  const [multiDataOptionsFromUrl, setMultiDataOptionsFromUrl] = useState<DataOptions[]>([])
  const [multiDataOptionsFromFile, setMultiDataOptionsFromFile] = useState<DataOptions[]>([])
  const multiDataOptions = useMemo(() => multiDataOptionsFromSearch.concat(multiDataOptionsFromUrl).concat(multiDataOptionsFromFile).sort((d1, d2) => d1.order - d2.order), [multiDataOptionsFromSearch, multiDataOptionsFromUrl, multiDataOptionsFromFile])
  const nextOrder = useMemo(() => multiDataOptions.length > 0 ? Math.max(...multiDataOptions.map(d => d.order)) + 1 : propsNextOrder, [multiDataOptions, propsNextOrder])
  const tabs: SupportedTabs[] = useMemo(() => SUPPORTED_TABS.filter(t => !hiddenTabs?.some(hiddenT => t === hiddenT)), [hiddenTabs])
  const translate = hooks.useTranslation(jimuUIMessages, jimuCoreMessages, defaultMessages)
  const hideErrorMsgTimer = useRef<NodeJS.Timeout>(null)
  const mobile = hooks.useCheckSmallBrowserSizeMode()

  const addDataButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // if first enter sm mode, means just added data from lg mode, should focus the small add data button
    if (buttonSize === 'sm') {
      focusElementInKeyboardMode(addDataButtonRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (errorMsg && !hideErrorMsgTimer.current) {
      hideErrorMsgTimer.current = setTimeout(() => {
        setErrorMsg(null)
        hideErrorMsgTimer.current = null
      }, 5000)
    }
  }, [errorMsg])

  const onRemove = (dsId: string) => {
    if (multiDataOptionsFromSearch.some(d => d.dataSourceJson.id === dsId)) {
      setMultiDataOptionsFromSearch(multiDataOptionsFromSearch.filter(d => d.dataSourceJson.id !== dsId))
    }
    if (multiDataOptionsFromUrl.some(d => d.dataSourceJson.id === dsId)) {
      setMultiDataOptionsFromUrl(multiDataOptionsFromUrl.filter(d => d.dataSourceJson.id !== dsId))
    }
    if (multiDataOptionsFromFile.some(d => d.dataSourceJson.id === dsId)) {
      setMultiDataOptionsFromFile(multiDataOptionsFromFile.filter(d => d.dataSourceJson.id !== dsId))
    }
  }

  const onFinish = (multiDataOptions: DataOptions[]) => {
    propsOnFinish(multiDataOptions)
    togglePopper()
  }

  const [bounds, setBounds] = useState<ResizableProps['bounds']>()

  const popperNodeRef = useRef<HTMLDivElement>(null)
  const resizableContainerRef = useRef<HTMLDivElement>(null)

  const togglePopper = useCallback(() => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    // When closing popper, need to reset the added data.
    if (!newIsOpen) {
      setMultiDataOptionsFromSearch([])
      setMultiDataOptionsFromUrl([])
      setMultiDataOptionsFromFile([])

      if (addDataButtonRef.current) {
        focusElementInKeyboardMode(addDataButtonRef.current)
      }
    }

    if (newIsOpen) {
      // wait for popper DOM render
      setTimeout(() => {
        const bodyRect = document.body.getBoundingClientRect()
        const popperNodeReact = popperNodeRef.current?.getBoundingClientRect()
        if (bodyRect && popperNodeReact) {
          setBounds({
            left: -popperNodeReact.left,
            top: 0,
            right: bodyRect.width - popperNodeReact.right + POPPER_DEFAULT_SIZE.width,
            bottom: bodyRect.height - popperNodeReact.bottom + POPPER_DEFAULT_SIZE.height
          })
        }
      }, 500)
    }

  }, [isOpen])

  useEffect(() => {
    if (!mobile && hidePopper && isOpen) {
      togglePopper()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidePopper])

  // When currentPageId changed and the popper is open, close popper
  const currentPageId = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.currentPageId)
  hooks.useUpdateEffect(() => {
    if (isOpen) {
      togglePopper()
    }
  }, [currentPageId])

  const popperContainerRef = useRef<HTMLDivElement>(null)
  const popperCloseBtnRef = useRef<HTMLButtonElement>(null)
  const doneButtonInCollapseRef = useRef<HTMLButtonElement>(null)

  const getPopperContent = () => {
    return <PopperContent
      mobile={mobile} errorMsg={errorMsg} translate={translate} tabs={tabs}
      togglePopper={togglePopper} onFinish={onFinish} onRemove={onRemove}
      portalUrl={portalUrl} widgetId={widgetId} nextOrder={nextOrder}
      multiDataOptions={multiDataOptions} multiDataOptionsFromSearch={multiDataOptionsFromSearch}
      multiDataOptionsFromUrl={multiDataOptionsFromUrl} multiDataOptionsFromFile={multiDataOptionsFromFile}
      setErrorMsg={setErrorMsg} setMultiDataOptionsFromSearch={setMultiDataOptionsFromSearch}
      setMultiDataOptionsFromUrl={setMultiDataOptionsFromUrl} setMultiDataOptionsFromFile={setMultiDataOptionsFromFile}
      itemCategoriesInfo={itemCategoriesInfo} containerRef={popperContainerRef}
      closeButtonRef={popperCloseBtnRef} doneButtonInCollapseRef={doneButtonInCollapseRef}
      displayedItemTypeCategories={displayedItemTypeCategories} config={config} />
  }

  const handlePopperKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      if (!popperContainerRef.current?.contains(e.target as HTMLDivElement)) {
        return
      }
      if (e.target === popperCloseBtnRef.current) {
        togglePopper()
      } else {
        const isInItemSearch = !!(e.target as HTMLElement)?.closest('.data-item-search')
        const isDataCollapseDisplayed = multiDataOptions.length > 0
        const focusButton = isInItemSearch && isDataCollapseDisplayed && doneButtonInCollapseRef.current && !doneButtonInCollapseRef.current.disabled
          ? doneButtonInCollapseRef.current
          : popperCloseBtnRef.current
        focusElementInKeyboardMode(focusButton)
      }
    }
  }

  return <div className='add-data-popper' css={style}>
    {
      buttonSize === 'lg' &&
      <Button type='primary' className='flex-grow-1 text-center' onClick={togglePopper} aria-label={translate('clickToAddData')} ref={addDataButtonRef} title={translate('clickToAddData')} aria-haspopup='dialog' aria-describedby={buttonDescribedby}>
        <div className='w-100 px-2 d-flex align-items-center justify-content-center'>
          <PlusOutlined size='m' className='mr-2' />
          <div className='text-truncate'>
            {translate('clickToAddData')}
          </div>
        </div>
      </Button>
    }
    {
      buttonSize === 'sm' &&
      <Button type='primary' className='d-flex justify-content-center align-items-center small-add-btn' onClick={togglePopper} aria-label={translate('clickToAddData')} ref={addDataButtonRef} title={translate('clickToAddData')} aria-haspopup='dialog'>
        <PlusOutlined size='m' className='m-0' />
      </Button>
    }
    {
      mobile
        ? <MobilePanel open={isOpen} onClose={togglePopper} title={translate('addData')}>
        {getPopperContent()}
      </MobilePanel>
        : <Popper
            open={isOpen} toggle={null} reference={popperReference} placement='right-start' ref={popperNodeRef} css={popperStyle}
            aria-label={translate('addData')} forceLatestFocusElements onKeyDown={handlePopperKeyDown}>
              <Resizable
                className={FOCUSABLE_CONTAINER_CLASS}
                ref={resizableContainerRef}
                defaultSize={POPPER_DEFAULT_SIZE}
                minSize={POPPER_DEFAULT_SIZE}
                handles={['bottom-left', 'bottom-right']}
                bounds={bounds}>
                {getPopperContent()}
              </Resizable>
        </Popper>
    }
  </div>
}

interface TabContentProps {
  tab: SupportedTabs
  portalUrl: string
  widgetId: string
  nextOrder: number
  multiDataOptionsFromSearch: DataOptions[]
  multiDataOptionsFromUrl: DataOptions[]
  multiDataOptionsFromFile: DataOptions[]
  setMultiDataOptionsFromSearch: (multiDataOptions: DataOptions[]) => void
  setMultiDataOptionsFromUrl: (multiDataOptions: DataOptions[]) => void
  setMultiDataOptionsFromFile: (multiDataOptions: DataOptions[]) => void
  setErrorMsg: (msg: string) => void
  itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>
  className?: string
  displayedItemTypeCategories?: ImmutableArray<ItemTypeCategory>
  onlyOneTab: boolean
}

const TabContent = ({
  tab, portalUrl, widgetId, nextOrder, multiDataOptionsFromSearch, multiDataOptionsFromUrl, multiDataOptionsFromFile,
  setMultiDataOptionsFromSearch, setMultiDataOptionsFromUrl, setMultiDataOptionsFromFile, setErrorMsg,
  itemCategoriesInfo, className, displayedItemTypeCategories, onlyOneTab
}: TabContentProps) => {
  if (tab === 'search') {
    return <DataItemSearch className={className} portalUrl={portalUrl} widgetId={widgetId} onChange={setMultiDataOptionsFromSearch} nextOrder={nextOrder} multiDataOptions={multiDataOptionsFromSearch} itemCategoriesInfo={itemCategoriesInfo} displayedItemTypeCategories={displayedItemTypeCategories} />
  } else if (tab === 'url') {
    return <DataUrlInput className={className} widgetId={widgetId} onChange={setMultiDataOptionsFromUrl} nextOrder={nextOrder} multiDataOptions={multiDataOptionsFromUrl} setErrorMsg={setErrorMsg} />
  } else if (tab === 'file') {
    return <DataFileUpload className={className} portalUrl={portalUrl} widgetId={widgetId} nextOrder={nextOrder} onChange={setMultiDataOptionsFromFile} multiDataOptions={multiDataOptionsFromFile} setErrorMsg={setErrorMsg} onlyOneTab={onlyOneTab} />
  }
}

interface PopperContentProps {
  mobile: boolean
  errorMsg: string
  translate: (id: string, values?: any) => string
  tabs: SupportedTabs[]
  togglePopper: () => void
  onFinish: (multiDataOptions: DataOptions[]) => void
  onRemove: (dsId: string) => void
  portalUrl: string
  widgetId: string
  nextOrder: number
  multiDataOptions: DataOptions[]
  multiDataOptionsFromSearch: DataOptions[]
  multiDataOptionsFromUrl: DataOptions[]
  multiDataOptionsFromFile: DataOptions[]
  setMultiDataOptionsFromSearch: (multiDataOptions: DataOptions[]) => void
  setMultiDataOptionsFromUrl: (multiDataOptions: DataOptions[]) => void
  setMultiDataOptionsFromFile: (multiDataOptions: DataOptions[]) => void
  setErrorMsg: (msg: string) => void
  itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>
  containerRef: React.MutableRefObject<HTMLDivElement>
  closeButtonRef: React.MutableRefObject<HTMLButtonElement>
  doneButtonInCollapseRef: React.MutableRefObject<HTMLButtonElement>
  displayedItemTypeCategories?: ImmutableArray<ItemTypeCategory>
  config: IMConfig
}

const PopperContent = ({
  mobile, errorMsg, translate, tabs, togglePopper, onFinish, onRemove, portalUrl, widgetId, nextOrder,
  multiDataOptions, multiDataOptionsFromSearch, multiDataOptionsFromUrl, multiDataOptionsFromFile,
  setMultiDataOptionsFromSearch, setMultiDataOptionsFromUrl, setMultiDataOptionsFromFile, setErrorMsg,
  itemCategoriesInfo, containerRef, closeButtonRef, doneButtonInCollapseRef, displayedItemTypeCategories, config
}: PopperContentProps) => {
  return <div ref={containerRef} css={css`
    width: 100%;
    height: 100%;
    .panel-header {
      .title {
        color: var(--sys-color-surface-overlay-text);
      }
      .jimu-btn {
        color: var(--sys-color-action-text);
      }
    }
    .add-data-popper-content {
      height: ${multiDataOptions.length ? (mobile ? 'calc(100% - 64px)' : 'calc(100% - 120px)') : (mobile ? '100%' : 'calc(100% - 56px)')};
    }
    .tab-content {
      overflow: hidden;
    }
    .jimu-nav {
      border-bottom: 1px solid var(--sys-color-divider-secondary);
      .jimu-nav-link {
        &.active, &:hover:not(.active) {
          color: var(--sys-color-primary-main);
        }
        &.active {
          border-color: var(--sys-color-primary-main);
        }
      }
    }
    .multiple-lines-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      word-break: break-word;
      word-wrap: break-word;
    }
    .item-selector-search {
      .text-input-prefix {
        svg {
          margin-left: 0 !important;
          color: var(--sys-color-action-input-field-placeholder) !important;
        }
      }
    }
  `}>
    { !mobile && <PanelHeader title={translate('addData')} showClose={true} onClose={togglePopper} level={1} className='p-4' closeButtonRef={closeButtonRef} /> }
    <div className='add-data-popper-content'>
      {
        tabs.length > 1 && <Tabs type='underline' className='w-100 h-100' fill defaultValue={tabs[0]}>
          {
            tabs.map((t, i) => <Tab key={i} id={t} title={translate(t)}>
              <TabContent
                tab={t} portalUrl={portalUrl} widgetId={widgetId} nextOrder={nextOrder} setErrorMsg={setErrorMsg}
                multiDataOptionsFromSearch={multiDataOptionsFromSearch} multiDataOptionsFromUrl={multiDataOptionsFromUrl}
                multiDataOptionsFromFile={multiDataOptionsFromFile} setMultiDataOptionsFromSearch={setMultiDataOptionsFromSearch}
                setMultiDataOptionsFromUrl={setMultiDataOptionsFromUrl} setMultiDataOptionsFromFile={setMultiDataOptionsFromFile}
                itemCategoriesInfo={itemCategoriesInfo} displayedItemTypeCategories={displayedItemTypeCategories} onlyOneTab={false} />
            </Tab>)
          }
        </Tabs>
      }
      {
        tabs.length === 1 && <div className='w-100 h-100'>
          <TabContent
            tab={tabs[0]} portalUrl={portalUrl} widgetId={widgetId} nextOrder={nextOrder} setErrorMsg={setErrorMsg}
            multiDataOptionsFromSearch={multiDataOptionsFromSearch} multiDataOptionsFromUrl={multiDataOptionsFromUrl}
            multiDataOptionsFromFile={multiDataOptionsFromFile} setMultiDataOptionsFromSearch={setMultiDataOptionsFromSearch}
            setMultiDataOptionsFromUrl={setMultiDataOptionsFromUrl} setMultiDataOptionsFromFile={setMultiDataOptionsFromFile}
            itemCategoriesInfo={itemCategoriesInfo} displayedItemTypeCategories={displayedItemTypeCategories} onlyOneTab={true} />
        </div>
      }
      {
        errorMsg && <Alert className='w-100' css={css`position: absolute; top: ${tabs.length === 1 ? '56px' : '89px'}; left: 0; right: 0; z-index: 1;`} closable form='basic' onClose={() => { setErrorMsg(null) }} open text={errorMsg} type='warning' withIcon />
      }
    </div>
    <DataCollapse multiDataOptions={multiDataOptions} widgetId={widgetId} doneButtonRef={doneButtonInCollapseRef} config={config} onFinish={onFinish} onRemove={onRemove} setErrorMsg={setErrorMsg} />
  </div>
}

const style = css`
  .small-add-btn {
    border-radius: 16px;
    width: 32px;
    height: 32px;
    padding: 0;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  }
`
const popperStyle = css`
  width: ${POPPER_DEFAULT_SIZE.width}px;
  height: ${POPPER_DEFAULT_SIZE.height}px;
  border: none;
  box-shadow: none;
  background: none;
  overflow: visible;
  .resizable {
    background: var(--sys-color-surface-overlay);
    border-width: 1px;
    border-style: solid;
    border-color: var(--sys-color-divider-secondary);
    box-shadow: var(--sys-shadow-2);
  }
`
