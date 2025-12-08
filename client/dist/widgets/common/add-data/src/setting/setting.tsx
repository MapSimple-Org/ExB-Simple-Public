/** @jsx jsx */
import { jsx, React, css, hooks, Immutable, indexedDBUtils, ExportFormat } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages, MultiSelect, MultiSelectItem, Switch, TextInput, Popper, Label, Checkbox } from 'jimu-ui'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'

import defaultMessages from './translations/default'
import type { ItemCategoryInfo, IMConfig, Config } from '../config'
import { List, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { useCuratedIndex, getDefaultLabel, useItemCategoriesInfo, useNeedHideItemCategories } from '../utils'
import SearchConfigItem from './components/search-config-item'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { ItemCategory, ItemTypeCategory } from 'jimu-ui/basic/item-selector'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'

const { useEffect, useRef } = React

const SupportedItemTypeCategories = Immutable([
  ItemTypeCategory.FeatureLayer,
  ItemTypeCategory.TileLayer,
  ItemTypeCategory.MapImageLayer,
  ItemTypeCategory.ImageryLayer,
  ItemTypeCategory.SceneLayer,
  ItemTypeCategory.TiledImageryLayer,
  ItemTypeCategory.ElevationLayer,
  ItemTypeCategory.Table,
  ItemTypeCategory.LayerFiles,
  ItemTypeCategory.GroupLayer,
  ItemTypeCategory.OrientedImageryLayer
])

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { onSettingChange: propsOnSettingChange, id, config, theme, intl } = props
  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const cache = useRef<indexedDBUtils.IndexedDBCache>(null)

  const itemCategoriesInfo = useItemCategoriesInfo(config)
  const needHideItemCategories = useNeedHideItemCategories()

  useEffect(() => {
    // Init indexed DB.
    cache.current = new indexedDBUtils.IndexedDBCache(id, 'add-data', 'added-data')
    cache.current.init().catch(err => {
      console.error('Failed to read cache.', err)
    })

    return () => { cache.current.close() }
  }, [id])

  const onSettingChange: typeof propsOnSettingChange = (...args) => {
    propsOnSettingChange(...args)
    // Clear cache on setting change.
    cache.current.initialized() && cache.current.clear()
  }

  const onAddWayChange = e => {
    const key = e.target.value
    const prevValue = config[key]
    const isDisableAddBySearch = key === 'disableAddBySearch'
    if (prevValue === true) {
      const newConfig = config.without(key)
      onSettingChange({
        id,
        config: {
          ...newConfig
        }
      })
    } else {
      onSettingChange({
        id,
        config: {
          ...(isDisableAddBySearch ? config.without('itemCategoriesInfo').without('displayedItemTypeCategories') : config),
          [key]: true
        }
      })
    }
  }

  const onPlaceholderTextChange = (value: string) => {
    onSettingChange({
      id,
      config: {
        ...config,
        placeholderText: value
      }
    })
  }

  const onItemCategoryInfoChange = (value, key, index) => {
    const newItemCategoriesInfo = [...itemCategoriesInfo.asMutable({ deep: true })]
    newItemCategoriesInfo[index] = { ...newItemCategoriesInfo[index], [key]: value }

    onSettingChange({
      id,
      config: {
        ...config,
        itemCategoriesInfo: newItemCategoriesInfo
      }
    })
  }

  const onDelete = (index: number) => {
    const newItemCategoriesInfo = [...itemCategoriesInfo.asMutable()]
    newItemCategoriesInfo.splice(index, 1)
    onSettingChange({
      id,
      config: {
        ...config,
        itemCategoriesInfo: newItemCategoriesInfo
      }
    })
  }

  const curatedIndex = useCuratedIndex(itemCategoriesInfo)


  const [newlyAddedCuratedFilterId, setNewlyAddedCuratedFilterId] = React.useState('')

  const createListItemElement = (itemCategoryInfo: ItemCategoryInfo, index: number) => {
    return <SearchConfigItem
      widgetId={id}
      intl={intl}
      theme={theme}
      itemCategoryInfo={itemCategoryInfo}
      defaultLabel={getDefaultLabel(translate, itemCategoryInfo)}
      autoFocusCuratedFilter={newlyAddedCuratedFilterId === itemCategoryInfo.id}
      onEnabledChange={(e, checked) => { onItemCategoryInfoChange(checked, 'enabled', index) }}
      onCustomLabelChange={(value) => { onItemCategoryInfoChange(value, 'customLabel', index) }}
      onCuratedFilterChange={(value) => { onItemCategoryInfoChange(value, 'curatedFilter', index) }}
      onDelete={() => { onDelete(index) }}
      translate={translate}
    />
  }

  // const curatedIdRef = useRef(1)
  // useEffect(() => {
  //   if (config.itemCategoriesInfo) {
  //     const curatedOptions = config.itemCategoriesInfo.filter((item) => item.type === ItemCategory.Curated).map((item) => item.id)
  //     const maxOldId = curatedOptions.length ? Math.max(...curatedOptions.map((item) => Number(item.split('_')[1]))) : 0
  //     curatedIdRef.current = maxOldId + 1 || 1
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const onAddCuratedItemCategory = () => {
    const newCuratedItemCategoryId = `${ItemCategory.Curated}_${curatedIndex}`
    setNewlyAddedCuratedFilterId(newCuratedItemCategoryId)
    onSettingChange({
      id,
      config: {
        ...config,
        itemCategoriesInfo: [...itemCategoriesInfo, {
          type: ItemCategory.Curated,
          customLabel: '',
          enabled: true,
          curatedFilter: '',
          id: newCuratedItemCategoryId
        }]
      }
    })
  }

  const onItemOperationDisableChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const key = e.target.value as keyof Config
    onSettingChange({
      id,
      config: checked ? config.without(key) : config.set(key, true)
    })
  }

  const onDisplayedItemTypeCategoriesChange = (value, values: ItemTypeCategory[]) => {
    onSettingChange({
      id,
      config: SupportedItemTypeCategories.length === values.length ? config.without('displayedItemTypeCategories') : config.set('displayedItemTypeCategories', values.sort((a, b) => SupportedItemTypeCategories.indexOf(a) - SupportedItemTypeCategories.indexOf(b)))
    })
  }

  const getSelectedItemTypeCategoriesText = (values: string[]) => {
    return `${values.length} ${translate('SelectionSelected')}`
  }

  const displayedItemTypeCategories = config.displayedItemTypeCategories || SupportedItemTypeCategories

  const onAllowExportChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const key = e.target.value as keyof Config
    const newConfig = config.without('notAllowedExportFormat')
    onSettingChange({
      id,
      config: checked ? newConfig.without(key) : newConfig.set(key, true)
    })
  }
  const [exportSettingIsOpen, setExportSettingIsOpen] = React.useState(false)
  const exportSettingPopperRef = React.useRef<HTMLButtonElement>(null)
  const exportOptionLabelId = React.useId()

  const onExportOptionChange = (evt: React.ChangeEvent<HTMLInputElement>, value: ExportFormat) => {
    const checked = evt.target.checked
    if (checked && config.notAllowedExportFormat?.includes(value)) {
      const newValue = config.notAllowedExportFormat.filter(f => f !== value)
      onSettingChange({
        id,
        config: newValue.length ? config.set('notAllowedExportFormat', newValue) : config.without('notAllowedExportFormat')
      })
    }

    if (!checked && !config.notAllowedExportFormat?.includes(value)) {
      onSettingChange({
        id,
        config: config.set('notAllowedExportFormat', [...(config.notAllowedExportFormat || []), value])
      })
    }
  }

  return (
    <div className='widget-setting-add-data jimu-widget-setting' css={style}>
      <SettingSection className='border-0 way-of-add-data-section' role='group' title={translate('wayOfAddingData')} aria-label={translate('wayOfAddingData')}>
        <SettingRow className='way-of-add-data-row' tag='label' label={translate('selectFromAccount')}>
          <Switch onChange={onAddWayChange} value='disableAddBySearch' checked={!config.disableAddBySearch} />
        </SettingRow>
        {!config.disableAddBySearch && itemCategoriesInfo && <SettingRow className='account-config-row' label={translate('tabs')} aria-label={translate('tabs')} role='group' flow='wrap'>
          <List
            className='search-config-list w-100'
            size='sm'
            itemsJson={itemCategoriesInfo.asMutable().filter((item) => !needHideItemCategories.includes(item.type)).map((i, x) => ({ itemStateDetailContent: i, itemKey: i.id }))}
            dndEnabled
            onUpdateItem={(actionData, refComponent) => {
              if (actionData.updateType !== TreeItemActionType.HandleDidDrop) {
                return
              }
              const [, parentItemJson] = actionData.itemJsons
              const newSortData: ItemCategoryInfo[] = parentItemJson.map(item => {
                return item.itemStateDetailContent
              })
              if (newSortData.map((item) => item.id).join(',') !== itemCategoriesInfo.map((item) => item.id).join(',')) {
                onSettingChange({
                  id,
                  config: {
                    ...config,
                    itemCategoriesInfo: newSortData.map((item) => Immutable(item))
                  }
                })
              }
            }}
            overrideItemBlockInfo={({ itemBlockInfo }) => {
              return {
                name: TreeItemActionType.RenderOverrideItem,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDroppableContainer,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemBody,
                      children: [{
                        name: TreeItemActionType.RenderOverrideItemDragHandle
                      }, {
                        name: TreeItemActionType.RenderOverrideItemMainLine
                      }]
                    }]
                  }]
                }]
              }
            }}
            renderOverrideItemMainLine={(actionData, refComponent) => {
              const { itemJsons } = refComponent.props
              const currentItemJson = itemJsons[0]
              const listItemJsons = itemJsons[1] as any
              return createListItemElement(currentItemJson.itemStateDetailContent, listItemJsons.indexOf(currentItemJson))
            }}
          ></List>
        </SettingRow>}
        {!config.disableAddBySearch && <SettingRow className='account-config-row'>
          <Button className='w-100 my-2' type='secondary' aria-label={translate('curateACollection')} onClick={onAddCuratedItemCategory}>
            <PlusOutlined />
            {translate('curateACollection')}
          </Button>
        </SettingRow>}
        {!config.disableAddBySearch && <SettingRow className='account-config-row' label={translate('dataTypeRestriction')} flow='wrap'>
          <MultiSelect
            className='w-100 mb-2' displayByValues={getSelectedItemTypeCategoriesText}
            aria-label={translate('dataTypeRestriction')}
            onChange={onDisplayedItemTypeCategoriesChange}
            values={displayedItemTypeCategories}
          >{SupportedItemTypeCategories.map((type) => <MultiSelectItem key={type} value={type} label={type} disabled={displayedItemTypeCategories.length === 1 && displayedItemTypeCategories.includes(type)} />)}</MultiSelect>
        </SettingRow>}
        <SettingRow className='way-of-add-data-row mt-4' tag='label' label={translate('inputUrl')}>
          <Switch onChange={onAddWayChange} value='disableAddByUrl' checked={!config.disableAddByUrl} />
        </SettingRow>
        <SettingRow className='way-of-add-data-row' tag='label' label={translate('uploadFiles')}>
          <Switch onChange={onAddWayChange} value='disableAddByFile' checked={!config.disableAddByFile} />
        </SettingRow>
      </SettingSection>

      <SettingSection className='border-0 pt-0' role='group' title={translate('general')} aria-label={translate('general')}>
        <SettingRow tag='label' label={translate('allowRenaming')}>
          <Switch onChange={onItemOperationDisableChange} value='disableRenaming' checked={!config.disableRenaming} />
        </SettingRow>
        <SettingRow tag='div' label={translate('allowExportSetting')}>
          {!config.disableExport && <Button size='sm' icon type='tertiary' aria-haspopup={'dialog'} aria-label={translate('exportSettings')} ref={exportSettingPopperRef} onClick={() => { setExportSettingIsOpen(!exportSettingIsOpen) }}><SettingOutlined /></Button>}
          <Switch onChange={onAllowExportChange} value='disableExport' checked={!config.disableExport} aria-label={translate('allowExportSetting')} />
          <Popper
            placement='bottom-start'
            offsetOptions={8}
            open={exportSettingIsOpen}
            toggle={() => { setExportSettingIsOpen(false) }}
            reference={exportSettingPopperRef}
            aria-label={translate('exportSettings')}
          >
            <div className='d-flex flex-column p-4' css={exportPopperContentStyle} role='group' aria-label={translate('formatOptions')}>
              <Label className='format-label w-100 py-1 mb-0' id={exportOptionLabelId} >{translate('formatOptions')}</Label>
              <div className='mt-2 d-flex flex-column' >
                {Object.values(ExportFormat).map((format) => {
                  const label = format === ExportFormat.Item ? translate('exportItem') : format
                  return <div key={format}>
                    <Label className='py-1 w-100 d-flex justify-content-start align-items-center' aria-describedby={exportOptionLabelId} >
                      <Checkbox key={format} value={format} checked={!config.notAllowedExportFormat?.includes(format)} onChange={(evt) => { onExportOptionChange(evt, format) }} />
                      <div className='ml-2'>{label}</div>
                    </Label>
                  </div>
                })}
              </div>
            </div>
          </Popper>
        </SettingRow>
        <SettingRow label={translate('emptyListMessage')} flow='wrap' role='group' aria-label={translate('emptyListMessage')}>
          <TextInput
            className='w-100'
            aria-label={config.placeholderText || translate('defaultPlaceholderText')}
            size='sm'
            defaultValue={config.placeholderText}
            placeholder={translate('defaultPlaceholderText')}
            onAcceptValue={onPlaceholderTextChange} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default Setting

const style = css`
  .way-of-add-data-section {
    .way-of-add-data-row {
      padding: 0.5rem 0.5rem 0.5rem 0.625rem;
      background-color: var(--ref-palette-neutral-500);
    }
    .account-config-row {
      margin: 0;
      padding: 0 0.5rem;
      background-color: var(--ref-palette-neutral-500);
    }
    .jimu-tree-item .jimu-tree-item__body {
      flex-wrap: nowrap;
      align-items: flex-start;
      .jimu-tree-item__drag-handle {
        margin-top: 0.5rem
      }
    }
  }
`

const exportPopperContentStyle = css`
  width: 200px;
  .format-label {
    color: var(--sys-color-surface-paper-hint);
  }
`
