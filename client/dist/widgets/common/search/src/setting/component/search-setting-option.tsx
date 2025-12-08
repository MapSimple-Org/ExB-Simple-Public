/** @jsx jsx */
import { React, css, jsx, type UseDataSource, type ImmutableArray, LinkType, Immutable, defaultMessages as jimuCoreDefaultMessage, hooks, type IMLinkParam, OpenTypes } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { SettingSection, SettingRow, LinkSelector, type IMSearchSuggestionConfig, type SearchSuggestionConfig, SearchSuggestionSetting, SearchGeneralSetting } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, SearchResultView, MAX_RESULT, DEFAULT_MAX_RESULT, SourceType } from '../../config'
import { TextInput, Checkbox, Switch, defaultMessages as jimuiDefaultMessage, CollapsablePanel } from 'jimu-ui'
import defaultMessage from '../translations/default'
import { useTheme } from 'jimu-theme'
import SearchStyleSetting from './search-result-style'

interface SearchOptionsProps {
  id: string
  onSettingChange: SettingChangeFunction
  config: IMConfig
  useDataSources: ImmutableArray<UseDataSource>
}

const SearchOptions = (props: SearchOptionsProps) => {
  const nls = hooks.useTranslation(defaultMessage, jimuiDefaultMessage, jimuCoreDefaultMessage)
  const appTheme = useTheme()

  const STYLE = css`
    .check-box-label {
      color: ${appTheme.ref.palette.neutral[1100]}
    }
    .search-setting-con {
      padding-left: 0;
      padding-right: 0;
    }
    .divider-line {
      padding-bottom: 0;
    }
    .checkbox-con .jimu-widget-setting--row-label{
      max-width: 100%;
    }
    .cursor-pointer {
      cursor: pointer;
    }
  `

  const { config, id, useDataSources, onSettingChange } = props
  const { searchResultView, hint, resultMaxNumber, linkParam } = config

  const [openSearchSuggestion, setOpenSearchSuggestion] = React.useState(false)
  const [openSearchResult, setOpenSearchResult] = React.useState(false)
  const [isAutoSelectFirstResult, setIsAutoSelectFirstResult] = React.useState(false)

  const [newResultMaxNumber, setResultMaxNumber] = React.useState(resultMaxNumber)
  const [settingConfig, setSettingConfig] = React.useState(Immutable({}) as IMSearchSuggestionConfig)

  React.useEffect(() => {
    initSettingConfig()
    setIsAutoSelectFirstResult(config?.isAutoSelectFirstResult)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  const initSettingConfig = () => {
    const newSettingConfig: SearchSuggestionConfig = {
      maxSuggestions: config?.maxSuggestions,
      isUseCurrentLoation: config?.isUseCurrentLoation,
      isShowRecentSearches: config?.isShowRecentSearches,
      recentSearchesMaxNumber: config?.recentSearchesMaxNumber
    }
    setSettingConfig(Immutable(newSettingConfig))
  }

  const onConfigChange = (key: string[], value: any) => {
    onSettingChange({ id: id, config: config.setIn(key, value) })
  }

  const handleAutoSelectChange = (evt) => {
    setIsAutoSelectFirstResult(!config?.isAutoSelectFirstResult)
    onConfigChange(['isAutoSelectFirstResult'], !config?.isAutoSelectFirstResult)
  }

  const handleResultMaxNumberAccept = value => {
    if (!value || value > MAX_RESULT) {
      value = resultMaxNumber || DEFAULT_MAX_RESULT
      setResultMaxNumber(value)
    }
    checkNumber(value) && onConfigChange(['resultMaxNumber'], Number(value))
  }

  const handleResultMaxNumberChange = (e) => {
    const value = e.target.value
    checkNumber(value) && setResultMaxNumber(value)
  }

  const checkNumber = (value): boolean => {
    if (value?.length === 0) return true
    return Number(value) && Number(value) > 0
  }

  const onSettingLinkConfirm = (linkResult: IMLinkParam) => {
    if (!linkResult) {
      return
    }
    onConfigChange(['linkParam'], linkResult)
  }

  const onResultViewChange = (isShowSearchResultView: boolean) => {
    const resultView = isShowSearchResultView ? SearchResultView.ResultPanel : SearchResultView.OtherWidgets
    onConfigChange(['searchResultView'], resultView)
  }

  const getHiddenLinks = (): ImmutableArray<LinkType> => {
    return Immutable([LinkType.WebAddress, LinkType.PrintPreview])
  }

  const onSuggestionSettingChange = (settingConfig: IMSearchSuggestionConfig) => {
    if (!settingConfig) return false
    const newConfig = config.merge(settingConfig)
    onSettingChange({ id: id, config: newConfig })
  }

  const renderSearchSuggestionSetting = () => {
    return (
      <div>
        <SettingSection className='search-setting-con'>
          <SettingRow role='group' aria-label={nls('searchSuggestion')}>
            <CollapsablePanel
              label={nls('searchSuggestion')}
              isOpen={openSearchSuggestion}
              onRequestOpen={() => { setOpenSearchSuggestion(true) }}
              onRequestClose={() => { setOpenSearchSuggestion(false) }}
              level={1}
            >
              <SearchSuggestionSetting
                id={id}
                settingConfig={settingConfig}
                onSettingChange={onSuggestionSettingChange}
              />
            </CollapsablePanel>
          </SettingRow>
        </SettingSection>
        {openSearchSuggestion && <SettingSection className='divider-line'/>}
      </div>
    )
  }

  const renderSearchResultSetting = () => {
    return (
      <SettingRow role='group' aria-label={nls('searchResult')}>
        <CollapsablePanel
          label={nls('searchResult')}
          isOpen={openSearchResult}
          onRequestOpen={() => { setOpenSearchResult(true) }}
          onRequestClose={() => { setOpenSearchResult(false) }}
          level={1}
        >
          <SettingRow>
            <div className='cursor-pointer d-flex align-items-center mt-2 mb-2' onClick={handleAutoSelectChange} aria-label={nls('autoSelect')}>
              <Checkbox checked={isAutoSelectFirstResult} title={nls('autoSelect')} className='mr-1'/>
              <span className='check-box-label flex-grow-1 ml-1'>{nls('autoSelect')}</span>
            </div>
          </SettingRow>
          <SettingRow tag='label' label={nls('resultPanel')} className='mt-2'>
            <Switch title={nls('resultPanel')} checked={searchResultView === SearchResultView.ResultPanel} onChange={(evt: any) => { onResultViewChange(searchResultView === SearchResultView.OtherWidgets) }} />
          </SettingRow>

          {searchResultView === SearchResultView.ResultPanel && <SettingRow flow='wrap' className='checkbox-con' label={nls('maximumResults')}>
            <TextInput aria-label={nls('maximumResults')} size='sm' value={newResultMaxNumber} onChange={handleResultMaxNumberChange} onAcceptValue={handleResultMaxNumberAccept} className='w-100' />
          </SettingRow>}

          {(searchResultView === SearchResultView.OtherWidgets && config?.sourceType !== SourceType.MapCentric) && <SettingRow className='d-block' flow='wrap' label={nls('redirectSearchResult')} aria-label={nls('redirectSearchResult')}>
            <LinkSelector
              onSettingConfirm={onSettingLinkConfirm}
              linkParam={linkParam}
              useDataSources={useDataSources}
              widgetId={id}
              hiddenLinks={getHiddenLinks()}
              openTypes={Immutable([OpenTypes.CurrentWindow])}
            />
          </SettingRow>}

          {searchResultView === SearchResultView.ResultPanel && <SearchStyleSetting
            id={id}
            config={config}
            onSettingChange={onSettingChange}
          />}
        </CollapsablePanel>
      </SettingRow>
    )
  }

  return (
    <SettingSection title={nls('generalSearchOption')} role='group' aria-label={nls('generalSearchOption')} css={STYLE}>
      <SearchGeneralSetting
        id={id}
        hint={hint}
        allowSearchSourceSelection={config?.allowSearchSourceSelection}
        enableAllowSearchSourceSelectionSetting
        onGeneralSettingChange={onConfigChange}
      />
      {renderSearchSuggestionSetting()}
      {renderSearchResultSetting()}
    </SettingSection>
  )
}

export default SearchOptions
