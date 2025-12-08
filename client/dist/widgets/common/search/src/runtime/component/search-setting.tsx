/** @jsx jsx */
import { React, css, jsx, polished, type ImmutableArray, type UseDataSource, hooks, DataSourceStatus, getAppStore, focusElementInKeyboardMode } from 'jimu-core'
import { Checkbox, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Alert, Loading, Button, defaultMessages as jimUiDefaultMessage, LoadingType } from 'jimu-ui'
import { type IMConfig, type NewDatasourceConfigItem, type IMDatasourceCreatedStatus, SearchServiceType, SourceType } from '../../config'
import defaultMessage from '../translations/default'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import { handleSearchWidgetUrlParamsChange } from '../utils/utils'
const { useRef, useState, useEffect } = React

interface SearchSettingProps {
  showLoading?: boolean
  config: IMConfig
  synchronizeSettings: boolean
  datasourceConfig: ImmutableArray<NewDatasourceConfigItem>
  onDatasourceConfigChange: (newDatasourceConfig: ImmutableArray<NewDatasourceConfigItem>) => void
  dsStatus: IMDatasourceCreatedStatus
  className?: string
  useDataSources?: ImmutableArray<UseDataSource>
  id: string
}

const STYLE = css`
& {
  box-sizing: border-box;
  width: 32px;
}
.setting-dropdown-button {
  height: 32px;
  border-radius: 0;
  .dropdown-button-content {
    text-align: center;
  }
  svg {
    margin: 0 !important;
  }
}
&.ds-setting-Style1 {
  .setting-dropdown-button {
    border-radius: var(--sys-shape-2) 0 0 var(--sys-shape-2);
  }
}
&.ds-setting-Style2 {
  & {
    margin-right: ${polished.rem(4)};
  }
  .setting-dropdown-button {
    border-radius: 50%;
  }
}
&.ds-setting-Style3 {
  .setting-dropdown-button {
    background: none;
    border: none;
    color: inherit !important;
  }
}
`

const STYLE_OF_MENU = css`
  & {
    overflow: hidden
  }
`

const SearchSetting = (props: SearchSettingProps) => {
  const nls = hooks.useTranslation(defaultMessage, jimUiDefaultMessage)

  const [isCheckAll, setIsCheckAll] = useState(true)
  const [isCheckPart, setIsCheckPart] = useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const { className, datasourceConfig, dsStatus, config, id, useDataSources, synchronizeSettings, showLoading, onDatasourceConfigChange } = props

  const dropdownMenuRef = useRef<HTMLDivElement>(null)
  const dropdownButtonRef = useRef<HTMLButtonElement>(null)
  const selectAllButtonRef = useRef<HTMLButtonElement>(null)
  const setSearchStatusInUrlTimeoutRef = useRef(null)

  const setSearchStatusInUrl = (dataSourceConfig: ImmutableArray<NewDatasourceConfigItem>) => {
    const serviceEnabledList = []
    dataSourceConfig?.forEach(item => {
      if (item.enable) {
        serviceEnabledList.push(item.configId)
      }
    })
    const isCheckAll = serviceEnabledList.length === dataSourceConfig?.length
    const searchStatus = isCheckAll ? null : { enabledList: serviceEnabledList }
    clearTimeout(setSearchStatusInUrlTimeoutRef.current)
    //When changing DsConfigItem, the search text will be cleared. When clearing the search,
    //the latest URL params cannot be obtained when updating Url params, so setTimeout is used to solve this problem.
    setSearchStatusInUrlTimeoutRef.current = setTimeout(() => {
      handleSearchWidgetUrlParamsChange(id, searchStatus)
    }, 200)
  }

  const toggleSearchSetting = (e) => {
    if (!isOpen) {
      setTimeout(() => {
        focusElementInKeyboardMode(selectAllButtonRef.current, true)
      }, 200)
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const disableItem = datasourceConfig?.filter(dsConfigItem => !dsConfigItem?.enable)
    const isSelectAll = disableItem?.length === 0
    const isCheckPart = disableItem?.length > 0 && disableItem?.length < datasourceConfig?.length
    setIsCheckPart(isCheckPart)
    setIsCheckAll(isSelectAll)
  }, [datasourceConfig])

  const onDsConfigItemChange = (enable: boolean, index: number) => {
    const newDatasourceConfig = (datasourceConfig as any)?.setIn([index, 'enable'], enable)
    setSearchStatusInUrl(newDatasourceConfig)
    onDatasourceConfigChange(newDatasourceConfig)
  }

  const selectAll = () => {
    const isSelect = !isCheckAll
    const newDatasourceConfig = datasourceConfig?.map(configItem => {
      return configItem.setIn(['enable'], isSelect)?.asMutable({ deep: true })
    })
    setSearchStatusInUrl(newDatasourceConfig)
    onDatasourceConfigChange(newDatasourceConfig)
  }

  const isDataSourceExist = (dataSourceId: string, isOutputDs: boolean = false) => {
    let isDataSourceInProps
    if ((synchronizeSettings as any) !== false && config?.sourceType === SourceType.MapCentric) {
      return true
    }
    if (isOutputDs) {
      const appConfig = getAppStore().getState().appConfig
      const widgetsJson = appConfig?.widgets?.[id]
      const outputDs = widgetsJson?.outputDataSources || []
      isDataSourceInProps = outputDs?.filter(dsId => dataSourceId === dsId).length > 0
    } else {
      isDataSourceInProps = useDataSources?.filter(useDs => dataSourceId === useDs.dataSourceId).length > 0
    }
    return isDataSourceInProps && dataSourceId
  }

  const handleSearchSettingConKeydown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      focusElementInKeyboardMode(dropdownButtonRef.current)
    }
  }

  const renderFieldListElement = () => {
    return datasourceConfig?.map((configDsItem, index) => {
      const isDsError = dsStatus[configDsItem.configId] === DataSourceStatus.LoadError || dsStatus[configDsItem.configId] === DataSourceStatus.CreateError
      const isGeocodeService = configDsItem.searchServiceType === SearchServiceType.GeocodeService
      const dsId = !isGeocodeService ? configDsItem.useDataSource.dataSourceId : configDsItem.outputDataSourceId
      const isDataSourceExists = isDataSourceExist(dsId, isGeocodeService)

      const disabled = datasourceConfig?.filter(dsConfigItem => dsConfigItem?.enable)?.length === 1 && configDsItem?.enable && isDsError
      return <DropdownItem toggle={false} key={`${configDsItem?.label}${index}`} title={configDsItem?.label} disabled={disabled} onClick={() => { onDsConfigItemChange(!configDsItem?.enable, index) }} >
        <div className='d-flex w-100 h-100 align-items-center'>
          <div className='flex-grow-1 d-flex align-items-center'>
            <Checkbox checked={configDsItem?.enable} disabled={disabled} className='mr-2'/>
            <div className='flex-grow-1'>{configDsItem?.label}</div>
          </div>
          {(isDsError || !isDataSourceExists) && <Alert
            buttonType='tertiary'
            form='tooltip'
            size='small'
            type='error'
            text={nls('dataSourceCreateError')}
          />}
        </div>
      </DropdownItem>
    })
  }

  return (
    <div className={`${className || ''} ds-setting-${config.arrangementStyle}`} onKeyDown={handleSearchSettingConKeydown} css={STYLE} role='group' aria-label={nls('searchIn', { value: '' })}>
      {showLoading && <Button icon className='setting-dropdown-button'>
        <Loading width={14} height={14} type={LoadingType.Donut} />
      </Button>}
      {!showLoading && <Dropdown className='w-100 h-100' menuItemCheckMode='multiCheck' toggle={toggleSearchSetting} isOpen={isOpen}>
        <DropdownButton ref={dropdownButtonRef} className='setting-dropdown-button' arrow={false} icon title={nls('searchIn', { value: '' })}>
          {!isOpen && <DownOutlined size={16} className='mr-1 d-inline-block' autoFlip/>}
          {isOpen && <UpOutlined size={16} className='mr-1 d-inline-block' autoFlip/>}
        </DropdownButton>
        <DropdownMenu css={STYLE_OF_MENU} trapFocus={false} autoFocus={false} style={{ maxHeight: 'auto' }}>
          <div ref={dropdownMenuRef}>
            <DropdownItem toggle={false} onClick={selectAll} title={nls('all')} ref={selectAllButtonRef}>
              <Checkbox checked={isCheckAll && !isCheckPart} indeterminate={isCheckPart} className='mr-2'/>
              {nls('all')}
            </DropdownItem>
            <DropdownItem divider={true} />
            {
             renderFieldListElement()
            }
          </div>
        </DropdownMenu>
      </Dropdown>}
    </div>
  )
}

export default SearchSetting
