/** @jsx jsx */
import { React, jsx, css, esri, type QueriableDataSource, type IMState, ReactRedux, AppMode, WidgetState } from 'jimu-core'
import { Button, Popper } from 'jimu-ui'
import SearchTool from './search-tool'
import { getSuggestionStyle } from '../style'
import type { LayersConfig, Suggestion } from '../../config'
import { useEffect } from 'react'
import { fetchSuggestionRecords } from './utils'
import type { JSX } from 'react'

export interface Props {
  searchToolTowed: boolean
  curLayerConfig: LayersConfig
  dataSource: QueriableDataSource
  tableLoaded: boolean
  widgetState: WidgetState
  toolListNode: JSX.Element
  handleSubmit: (searchText: string) => void
}

const getStyles = () => css`
  &.table-header{
    height: 40px;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
`

const TableHeader = (props: Props) => {
  const { searchToolTowed, curLayerConfig, dataSource, tableLoaded, widgetState, toolListNode, handleSubmit } = props
  const [searchText, setSearchText] = React.useState<string>()
  const [isShowSuggestion, setIsShowSuggestion] = React.useState<boolean>(false)
  const [searchSuggestion, setSearchSuggestion] = React.useState<Suggestion[]>([])

  const suggestPopup = React.useRef<HTMLDivElement>(null)
  const suggestionsQueryTimeout = React.useRef<any>(null)

  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const currentPageId = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo?.currentPageId)
  const Sanitizer = esri.Sanitizer
  const sanitizer = new Sanitizer()

  const getSearchSuggestions = React.useCallback(() => {
    if (searchText?.length < 3) {
      return false
    }
    fetchSuggestionRecords(searchText, curLayerConfig, dataSource).then(searchSuggestion => {
      setSearchSuggestion(searchSuggestion)
    })
  }, [searchText, curLayerConfig, dataSource])

  useEffect(() => {
    if (!searchText) {
      handleSubmit('')
    } else {
      clearTimeout(suggestionsQueryTimeout.current)
      suggestionsQueryTimeout.current = setTimeout(() => {
        getSearchSuggestions()
      }, 200)
    }
    return () => {
      clearTimeout(suggestionsQueryTimeout.current)
    }
  }, [searchText, isShowSuggestion, handleSubmit, getSearchSuggestions])

  // reset searchText and suggestion
  useEffect(() => {
    const controllerClose = widgetState === WidgetState.Closed
    const liveClose = appMode === AppMode.Design
    if (controllerClose || liveClose) {
      setSearchText('')
      setIsShowSuggestion(false)
    }
  }, [widgetState, appMode])

  useEffect(() => {
    // persist the filter when switching pages, so remove reset searchText
    setIsShowSuggestion(false)
  }, [currentPageId])

  const handleSearchChange = (searchText: string) => {
    if (!searchText) {
      setSearchText(searchText)
      setIsShowSuggestion(false)
      setSearchSuggestion([])
    } else {
      setSearchText(searchText)
      setIsShowSuggestion(searchText?.length > 2)
    }
  }

  const closeSuggestionAndSearch = () => {
    setIsShowSuggestion(false)
    handleSubmit(searchText)
  }

  const onToggleSuggestion = () => {
    setIsShowSuggestion(!isShowSuggestion)
  }

  const onCloseSuggestion = () => {
    setIsShowSuggestion(false)
  }

  const onSuggestionConfirm = (suggestion: string) => {
    setSearchText(suggestion)
    setIsShowSuggestion(false)
    handleSubmit(suggestion)
  }

  return (
    <div className='table-header' ref={suggestPopup} css={getStyles()}>
      <SearchTool
        searchToolTowed={searchToolTowed}
        hint={curLayerConfig?.searchHint}
        tableLoaded={tableLoaded}
        searchText={searchText}
        handleSearchChange={handleSearchChange}
        closeSuggestionAndSearch={closeSuggestionAndSearch}
        closeSuggestion={onCloseSuggestion}
      />
      <Popper
        css={getSuggestionStyle()}
        placement='bottom-start'
        reference={suggestPopup}
        offsetOptions={[searchToolTowed ? 35 : 0, -2]}
        open={isShowSuggestion && searchSuggestion?.length > 0}
        trapFocus={false}
        autoFocus={false}
        toggle={onToggleSuggestion}
        hideOptions={false}
      >
        {searchSuggestion.map((suggestion, index) => {
          const suggestionHtml = sanitizer.sanitize(suggestion.suggestionHtml)
          return (
            <Button
              key={index}
              type='secondary'
              size='sm'
              onClick={() => { onSuggestionConfirm(suggestion.suggestion) }}
            >
              <div className='w-100' dangerouslySetInnerHTML={{ __html: suggestionHtml }}></div>
            </Button>
          )
        })}
      </Popper>
      {toolListNode}
    </div>
  )
}

export default TableHeader
