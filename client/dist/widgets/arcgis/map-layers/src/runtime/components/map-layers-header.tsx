/** @jsx jsx */
import { MapViewManager } from 'jimu-arcgis'
import { css, hooks, type IMThemeVariables, jsx, lodash, React } from 'jimu-core'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { SelectOptionOutlined } from 'jimu-icons/outlined/editor/select-option'
import { Button, Dropdown, DropdownButton, DropdownItem, DropdownMenu, TextInput } from 'jimu-ui'
import message from '../translations/default'

interface MapLayersHeaderProps {
  theme: IMThemeVariables
  jimuMapViewId: string
  layerListRef: React.MutableRefObject<__esri.LayerList>
  tableListRef: React.MutableRefObject<__esri.TableList>
  enableSearch: boolean
  enableBatchOption: boolean
  expandAllLayers: boolean
  isMapWidgetMode: boolean
  headerKey: string
}

const getStyle = (theme: IMThemeVariables) => {
  return css`
    .map-layers-header-title{
      span {
        font-size: var(--calcite-font-size-0);
        font-weight: 500;
      }
    }
    .map-layers-batch-action-dropdown {
      button: hover {
        background: var(--calcite-color-transparent-hover);
      }
    }
  `
}

const { useState, useCallback, useEffect } = React

const onFilterListItem = (searchContent) => {
  return (item) => {
    if (!item || !searchContent) {
      return true
    }
    const matched = item.layer.title.toLowerCase().includes(searchContent.toLowerCase())
    let currItem = item
    // Open all parent layers
    if (matched) {
      while (currItem) {
        currItem.open = true
        currItem = currItem.parent
      }
    }
    return matched
  }
}


export default function MapLayersHeader(props: MapLayersHeaderProps) {
  const { theme, jimuMapViewId, layerListRef, tableListRef, enableSearch, enableBatchOption, isMapWidgetMode, headerKey, expandAllLayers } = props

  const translate = hooks.useTranslation(message)

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const onSearchBtnClick = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const onSearchInputChange = lodash.throttle((event) => {
    const inputStr = event.target.value
    setSearchInput(inputStr)
  }, 200)

  const onTurnAllLayersClickGenerator = useCallback((visible: boolean) => {
    return () => {
      function toggleVisible(jimuLayerViews, visible) {
        for (const layerView of jimuLayerViews) {
          const layer = layerView.layer
          layer.visible = visible
        }
      }
      const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)
      toggleVisible(jimuMapView.getAllJimuLayerViews(), visible)
    }
  }, [jimuMapViewId])

  const onExpandAllLayersClickGenerator = useCallback((expand: boolean) => {
    return () => {
      function toggleExpand(items, expand) {
        if (!items) {
          return
        }
        for (const item of items) {
          item.open = expand
          if (item.children) {
            toggleExpand(item.children, expand)
          }
        }
      }
      toggleExpand(layerListRef.current.operationalItems, expand)
    }
  }, [layerListRef])

  useEffect(() => {
    // Do not set filterPredicate if search input is cleared
    if (searchInput === '') {
      layerListRef.current && (layerListRef.current.filterPredicate = null)
      tableListRef.current && (tableListRef.current.filterPredicate = null)
      if (expandAllLayers) {
        // Restore the expand status
        onExpandAllLayersClickGenerator(true)()
      } else {
        // Close all group layer, same as WAB, do not do this in the filterPredicate because sometimes it's called by mistake
        onExpandAllLayersClickGenerator(false)()
      }
      return
    }

    layerListRef.current && (layerListRef.current.filterPredicate = onFilterListItem(searchInput))
    tableListRef.current && (tableListRef.current.filterPredicate = onFilterListItem(searchInput))
  }, [layerListRef, searchInput, tableListRef, expandAllLayers, onExpandAllLayersClickGenerator])

  useEffect(() => {
    // Close the search input box when disable searching
    if (!enableSearch) {
      setIsSearchOpen(false)
    }
  }, [enableSearch])

  // Close the search input box when the component refreshes
  useEffect(() => {
    setIsSearchOpen(false)
  }, [headerKey])

  if (!enableBatchOption && !enableSearch) {
    return null
  }

  return (
    <div className='map-layers-header d-flex justify-content-between p-1' css={getStyle(theme)}>
      {
        isSearchOpen ?
          <TextInput className='w-100 mr-1' type='text' onChange={onSearchInputChange} autoFocus allowClear></TextInput> :
          <div className='map-layers-header-title d-flex align-items-center'>
            <span className='ml-2'>{translate('layers')}</span>
          </div>
      }
      <div className='map-layers-header-icons d-flex'>
        {(enableBatchOption && !isSearchOpen) &&
          <Dropdown className='map-layers-batch-action-dropdown' aria-label={translate("batchOptions")}>
            <DropdownButton color='inherit' icon arrow={false} title={translate("batchOptions")} variant='text'>
              <SelectOptionOutlined></SelectOptionOutlined>
            </DropdownButton>
            <DropdownMenu>
              {
                isMapWidgetMode && (
                  <React.Fragment>
                    <DropdownItem onClick={onTurnAllLayersClickGenerator(true)}>{translate('turnOnAllLayers')}</DropdownItem>
                    <DropdownItem onClick={onTurnAllLayersClickGenerator(false)}>{translate('turnOffAllLayers')}</DropdownItem>
                    <DropdownItem divider></DropdownItem>
                  </React.Fragment>
                )
              }
              <DropdownItem onClick={onExpandAllLayersClickGenerator(true)}>{translate('expandAllLayers')}</DropdownItem>
              <DropdownItem onClick={onExpandAllLayersClickGenerator(false)}>{translate('collapseAllLayers')}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        }
        {
          enableSearch &&
          <Button color='inherit' variant='text' title={translate("SearchLabel")} className='map-layers-search-btn' icon onClick={onSearchBtnClick} aria-label={translate("SearchLabel")}>
            <SearchOutlined></SearchOutlined>
          </Button>
        }
      </div>
    </div>
  )
}
