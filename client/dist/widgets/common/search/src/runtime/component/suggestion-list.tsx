/** @jsx jsx */
import { React, jsx, esri, classNames } from 'jimu-core'
import { Icon } from 'jimu-ui'
import type { Suggestion, InitResultServiceListOption, IMConfig, IMServiceList } from '../../config'
import ResultPopper from './resultPopper'
import UtilityErrorRemind from './utility-remind'
const { useRef } = React
interface SearchSettingProps {
  searchText: string
  isOpen: boolean
  reference: any
  searchSuggestion: Suggestion[]
  className?: string
  canUseOutputDsLength: number
  config: IMConfig
  searchInputRef?: any
  id: string
  openUtilityErrRemindInSuggestion: boolean
  serviceList: IMServiceList
  toggleSuggestionUtilityError?: (open?: boolean) => void
  toggle?: () => void
  onRecordItemClick: (searchText: string, initResultServiceListOption?: InitResultServiceListOption, isUseLocationError?: boolean) => void
  setSuggestionFirstItem: (ref) => void
}
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()

const SuggestionList = (props: SearchSettingProps) => {
  const { className, reference, searchSuggestion, isOpen, canUseOutputDsLength, id, searchInputRef, openUtilityErrRemindInSuggestion, serviceList, searchText, toggleSuggestionUtilityError, toggle, onRecordItemClick, setSuggestionFirstItem } = props
  const isHasSetFirstItem = useRef<boolean>(false)

  const checkIsNoResult = () => {
    let totalSuggestionItem = []
    searchSuggestion.forEach(layerSuggestion => {
      const suggestionItem = layerSuggestion?.suggestionItem || []
      totalSuggestionItem = totalSuggestionItem.concat(suggestionItem)
    })
    return searchText && totalSuggestionItem.length === 0
  }

  const handelSuggestionItemClick = (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    const { configId, isFromSuggestion, magicKey } = initResultServiceListOption || {}
    if (configId && (isFromSuggestion || magicKey)) {
      onRecordItemClick(searchText, initResultServiceListOption)
    } else {
      onRecordItemClick(searchText)
    }
  }

  const renderLayerSuggestionElement = () => {
    isHasSetFirstItem.current = null
    return searchSuggestion?.map((layerSuggestion, index) => {
      const isShowLayerName = searchSuggestion?.length > 1 && layerSuggestion?.suggestionItem?.length > 0
      return (
        <div key={`${layerSuggestion?.layer}-${index}`} role='listbox' aria-label={layerSuggestion?.layer}>
          {isShowLayerName && <button aria-label={layerSuggestion?.layer} role='button' className='source-label-con d-flex align-items-center jimu-outline-inside' disabled={true} title={layerSuggestion?.layer}>
            {layerSuggestion?.icon && <Icon className='mr-2' size={16} icon={layerSuggestion?.icon?.svg}/> }
            <div className='flex-grow-1'>{layerSuggestion?.layer}</div>
          </button>}
          {renderSuggestionItemElement(layerSuggestion, checkIsShowPadding())}
        </div>
      )
    })
  }

  const checkIsShowPadding = () => {
    const sourceNumber = searchSuggestion?.length
    if (sourceNumber < 2) {
      return false
    }
    // The total number of icons
    let iconNumber = 0
    //when only one source has suggestion, and the source item has an icon, padding should also be added
    let numberOfSourceWithSuggestionAndIcon = 0
    searchSuggestion?.forEach(layerSuggestion => {
      const icon = layerSuggestion?.icon
      if (icon) {
        iconNumber += 1
      }
      if (layerSuggestion.suggestionItem?.length > 0 && icon) {
        numberOfSourceWithSuggestionAndIcon += 1
      }
    })
    return numberOfSourceWithSuggestionAndIcon > 0 && iconNumber > 0
  }

  const renderSuggestionItemElement = (suggestion: Suggestion, isShowPadding = false) => {
    const suggestionItem = suggestion?.suggestionItem
    const icon = suggestion?.icon
    return suggestionItem?.map((item, index) => {
      const suggestionHtml = sanitizer.sanitize(
        item.suggestionHtml
      )
      const initResultServiceListOption = {
        configId: item?.configId,
        isFromSuggestion: item?.isFromSuggestion,
        magicKey: item?.magicKey
      }
      return (
        <button
          className={classNames('d-flex align-items-center py-2 jimu-outline-inside', { 'item-p-l': isShowPadding })}
          key={`${suggestion?.layer}${index}`}
          title={item.suggestion}
          aria-label={item.suggestion}
          role='button'
          onClick={() => {
            handelSuggestionItemClick(item.suggestion, initResultServiceListOption)
          }}
          ref={ref => { setFirstItemRef(index, ref) }}
        >
          {(icon && canUseOutputDsLength === 1) && <Icon className='mr-2' size={16} icon={icon?.svg}/> }
          <div className='flex-grow-1' dangerouslySetInnerHTML={{ __html: suggestionHtml }}></div>
        </button>
      )
    })
  }

  const setFirstItemRef = (index: number, ref) => {
    if (index === 0 && !isHasSetFirstItem.current && ref) {
      setSuggestionFirstItem(ref)
      isHasSetFirstItem.current = true
    }
  }

  return (
    <div>
      <ResultPopper
        isOpen={(isOpen && !checkIsNoResult()) || openUtilityErrRemindInSuggestion}
        autoFocus={false}
        reference={reference}
        searchInputRef={searchInputRef}
        isFocusWithSearchInput
        toggle={toggle}
        id={id}
        containerEventPreventDefault
        className={classNames('result-list-con suggestion-list-con', className)}
      >
        {!openUtilityErrRemindInSuggestion && renderLayerSuggestionElement()}

        {openUtilityErrRemindInSuggestion && <UtilityErrorRemind open={openUtilityErrRemindInSuggestion} serviceList={serviceList} toggleUtilityErrorRemind={toggleSuggestionUtilityError}/>}
      </ResultPopper>
    </div>
  )
}

export default SuggestionList
