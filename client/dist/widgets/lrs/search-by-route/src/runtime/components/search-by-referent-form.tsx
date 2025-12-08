/** @jsx jsx */
import {
  React,
  css,
  type ImmutableObject,
  type DataSource,
  jsx,
  hooks,
  DataSourceComponent,
  type FeatureLayerDataSource,
  type FeatureLayerQueryParams,
  type IntlShape,
  focusElementInKeyboardMode,
  type ImmutableArray,
  DataSourceManager
} from 'jimu-core'
import { TextInput, Label, type ValidityResult } from 'jimu-ui'
import type { ReferentQuery, ResultConfig } from '../../config'
import defaultMessages from '../translations/default'
import { convertStationToNumber } from '../utils/utils'
import { debounce } from 'lodash-es'
import { Intellisense, getSuggestions, type Suggestion, GetUnits, isDefined, type LrsLayer } from 'widgets/shared-code/lrs'
import { useImperativeHandle } from 'react'
import { getReferentProperties } from '../../common/utils'

export interface SearchReferentProps {
  referentItem?: ImmutableObject<LrsLayer>
  dataSource: DataSource
  isDataSourceReady: boolean
  lrsLayers: ImmutableArray<LrsLayer>
  intl: IntlShape
  id: string
  widgetId: string
  reset?: boolean
  resultConfig: ResultConfig
  onSubmit: (query: any, objectIdFromDt: any[]) => void
  onValidationChanged: (isValid: boolean) => void
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    .search-by-referent-form__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
  `
}

export const SearchReferentForm = React.forwardRef((props: SearchReferentProps, ref) => {
  const [referentQuery, setReferentRequest] = React.useState<ReferentQuery>({})
  const [isReferentValid, setIsReferentValid] = React.useState<boolean>(false)
  const [isOffsetValid, setIsOffsetValid] = React.useState<boolean>(true)
  const [originDS, setOriginDs] = React.useState<DataSource>()
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { widgetId, referentItem, isDataSourceReady, resultConfig, onSubmit, onValidationChanged, intl, reset } = props
  const searchConRef = React.useRef<HTMLDivElement>(null)
  const debounceQuerySuggestionRef = React.useRef((searchText: string) => undefined)

  const referentProperties = React.useMemo(() => {
    return getReferentProperties(referentItem)
  }, [referentItem])

  useImperativeHandle(ref, () => ({
    submitForm
  }))

  const isValidInput = React.useMemo(() => {
    return isDataSourceReady && isOffsetValid && isReferentValid
  }, [isDataSourceReady, isOffsetValid, isReferentValid])

  React.useEffect(() => {
    revalidateFields()
  }, [reset])

  React.useEffect(() => {
    onValidationChanged(isValidInput)
  }, [isValidInput, onValidationChanged])

  //Input Ref
  const searchValueRef = React.useRef(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const searchOffsetRef = React.useRef<HTMLInputElement>(null)
  const inputBlurTimeoutRef = React.useRef(null)

  //Result Suggestion ref
  const suggestionClickedItem = React.useRef(null)
  const isFocusSuggestion = React.useRef<boolean>(false)
  const isFocusLocationAndRecentSearch = React.useRef<boolean>(false)

  //suggestion
  const [searchValue, setSearchValue] = React.useState(null) // search value for referent field
  const [offsetValue, setOffsetValue] = React.useState(null) // search value for offset field
  const [isOpenSuggestion, setIsOpenSuggestion] = React.useState(false)
  const [searchSuggestion, setSearchSuggestion] = React.useState([] as Suggestion[])

  React.useEffect(() => {
    revalidateFields()
    debounceQuerySuggestionRef.current = debounce(querySuggestion, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referentItem])

  const revalidateFields = () => {
    setSearchValue(null)
    setOffsetValue(null)
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.select()
        focusElementInKeyboardMode(searchInputRef.current, true)
        searchInputRef.current.blur()
      }
      if (searchOffsetRef.current) {
        searchOffsetRef.current.select()
        focusElementInKeyboardMode(searchOffsetRef.current, true)
        searchOffsetRef.current.blur()
      }
    }, 200)
  }

  /**
  * Query suggestion
  */
  const querySuggestion = hooks.useEventCallback((starchText: string) => {
    const fieldName = referentItem?.displayField
    const referentDS = originDS as FeatureLayerDataSource
    const serviceSuggestion = getSuggestions(fieldName, starchText, referentDS)
    Promise.all([serviceSuggestion]).then(allSuggestion => {
      const suggestion = allSuggestion?.[0]
      if (suggestion) {
        setSearchSuggestion(suggestion)
      }
      searchValueRef.current && setIsOpenSuggestion(true)
    })
  })

  /**
   * Fire callback when the text of search input changes
  */
  const onRouteChange = (e: { target: { value: any } }) => {
    suggestionClickedItem.current = null
    const value = e?.target?.value
    const isShowSuggestion = value?.length > 2
    updateSearchValue(value)
    if (!isShowSuggestion) {
      setIsOpenSuggestion(false)
      return false
    }
    debounceQuerySuggestionRef.current(value)
  }

  /**
   * Fire callback when the text of search input changes
  */
  const updateSearchValue = (searchText: string) => {
    setSearchValue(searchText)
    searchValueRef.current = searchText
  }

  const updateOffsetValue = (e) => {
    const offset = e?.target?.value
    setOffsetValue(offset)
  }

  const checkIsOpenSuggestionPopper = () => {
    if (!isOpenSuggestion) {
      isFocusSuggestion.current = false
    }
    return isOpenSuggestion
  }

  /**
   * Fire callback when the suggestion list item is clicked.
  */
  const onSuggestionItemClick = (searchText: string, isUseLocationError?: boolean) => {
    if (isUseLocationError) {
      loadLocationError()
      return false
    }
    suggestionClickedItem.current = searchText
    updateSearchValue(searchText)
  }

  const loadLocationError = () => {
    focusElementInKeyboardMode(searchInputRef.current)
    toggleLocationOrRecentSearches(true, false)
  }

  const toggleLocationOrRecentSearches = (isOpen = false, isInitGetLocationStatus = true) => {
    if (!isOpen) {
      isFocusLocationAndRecentSearch.current = false
    }
  }

  const handleInputBlur = () => {
    inputBlurTimeoutRef.current = setTimeout(() => {
      if (!isFocusSuggestion.current) {
        setIsOpenSuggestion(false)
      }
      if (!isFocusLocationAndRecentSearch.current) {
        toggleLocationOrRecentSearches(false)
      }
    }, 200)
  }

  const validateOffsetTextInput = (value: string): any => {
    if (isNaN(Number(value))) {
      const stationValue = convertStationToNumber(value)
      if (isNaN(stationValue)) {
        updateOffset(NaN, false)
        return { valid: false, msg: getI18nMessage('invalidOffset') }
      } else {
        updateOffset(stationValue, true)
        return { valid: true }
      }
    }
    if (value === '') {
      updateOffset(Number(NaN), true)
    } else {
      updateOffset(Number(value), true)
    }
    return { valid: true }
  }

  const validateReferentTextInput = (value: string | number): Promise<ValidityResult> => {
    if (!value) {
      setIsReferentValid(false)
      //@ts-expect-error
      return { valid: true }
    }
    return new Promise(resolve => {
      setTimeout(() => {
        const objIdFromDt = []
        if (suggestionClickedItem.current) {
          value = suggestionClickedItem.current
        }
        const featureLayerDS = originDS as FeatureLayerDataSource
        const featureQuery: FeatureLayerQueryParams = {}

        const displayFieldType = getDisplayFieldType(referentItem?.displayField)
        const code = getCode(value)
        if (code) value = code

        if (displayFieldType === 'NUMBER') {
          featureQuery.where = `${referentItem?.displayField} = ${value}`
        } else if (displayFieldType === 'STRING') {
          featureQuery.where = `${referentItem?.displayField} = '${value}'`
        }
        featureQuery.outFields = [featureLayerDS.getIdField()]
        if (isDefined(referentItem?.eventInfo?.fromDateFieldName)) {
          featureQuery.outFields.push(referentItem?.eventInfo?.fromDateFieldName)
        }

        const isValid = featureLayerDS.query(featureQuery).then((results) => {
          const records = results?.records
          const objectIds = []
          const objectIdFieldName = featureLayerDS.getIdField()
          const fromDateFieldName = referentItem?.eventInfo?.fromDateFieldName
          if (records?.length > 0) {
            records.forEach((record) => {
              const objectId = record?.getFieldValue(objectIdFieldName)
              objectIds.push(objectId)
            })
          }
          if (records?.length > 0) {
            records.forEach((record) => {
              const objectId = record?.getFieldValue(objectIdFieldName)
              const fromDate = record?.getFieldValue(fromDateFieldName)
              objIdFromDt[objectId] = fromDate
            })
            updateObjectIdFromDate(objIdFromDt)
          }

          if (objectIds?.length > 0) {
            updateObjectIds(objectIds, true)
            return { valid: true }
          } else {
            updateObjectIds(objectIds, false)
            return { valid: false, msg: getI18nMessage('invalidReferent') }
          }
        }).catch((e: any) => {
          console.error(e)
          return { valid: false, msg: getI18nMessage('invalidReferent') }
        })
        resolve(isValid)
      }, 200)
    })
  }

  const updateOffset = (value: number, isValid: boolean) => {
    const request = referentQuery
    request.offset = value
    setIsOffsetValid(isValid)
    setReferentRequest(request)
  }

  const updateObjectIds = (value: number[], isValid: boolean) => {
    const request = referentQuery
    request.objectId = value
    setIsReferentValid(isValid)
    setReferentRequest(request)
  }

  const updateObjectIdFromDate = (value) => {
    const request = referentQuery
    request.objectIdFromDt = value
    setReferentRequest(request)
  }

  const getDisplayFieldType = (displayField: string): string => {
    const layerFields = referentProperties?.layerFields
    for (let i = 0; i < layerFields.length; i++) {
      if (layerFields[i].name === displayField) {
        return layerFields[i].type
      }
    }
  }

  const getCode = (value: string | number): string | number => {
    const ds = DataSourceManager.getInstance().getDataSource(referentItem?.useDataSource.dataSourceId)
    const featureLayerDS = ds as FeatureLayerDataSource
    const allFields = featureLayerDS?.getLayerDefinition()?.fields
    let codedValues = []
    let code

    // Check if referent field has codedValue domain. If it does, return the code
    // to construct where clause in search query
    if (allFields?.length > 0) {
      allFields.forEach((field) => {
        if (field?.name === referentItem?.displayField) {
          if (field?.domain?.type === 'codedValue') {
            codedValues = field?.domain?.codedValues
          }
        }
      })
    }

    if (codedValues?.length > 0) {
      codedValues.forEach((info) => {
        if (info.name === value) {
          code = info.code
        }
      })
    }

    if (code) return code
    return null
  }

  const handleReferentDataSourceCreated = (ds: DataSource) => {
    setOriginDs(ds)
  }

  const submitForm = () => {
    const revalidateFields = () => {
      const offset = offsetValue || 0
      const referent = searchValue
      setTimeout(() => {
        validateOffsetTextInput(offset)
        setTimeout(() => {
          validateReferentTextInput(referent)
          setTimeout(() => {
            const params = []
            const objectIds = referentQuery?.objectId
            const layerId = referentItem?.serviceId
            const offset = referentQuery?.offset || 0
            const objectIdFromDt = referentQuery?.objectIdFromDt
            objectIds?.forEach((objectId) => {
              params.push({
                layerId: layerId,
                offset: offset,
                objectId: objectId
              })
            })
            onSubmit(params, objectIdFromDt)
          }, 200)
        }, 200)
      }, 200)
    }
    revalidateFields()
  }

  const offsetUnits = GetUnits(resultConfig?.defaultOffsetUnit, intl)
  const offsetLabel = getI18nMessage('offsetlabel', { unit: offsetUnits })
  const referentFieldLabel = getI18nMessage('referentDisplayName', { displayName: referentItem?.displayField })

  return (
    <div className='search-method-form h-100' css={getFormStyle()}>
      <div className='search-by-referent-form__content'>
      <DataSourceComponent
        useDataSource={referentItem?.useDataSource}
        onDataSourceCreated={handleReferentDataSourceCreated} />
      <div className="search-method-form__method-label px-3 pt-3">
        <Label size="default" className='mb-1 title3' centric>
          {referentFieldLabel}
        </Label>
        <div ref={searchConRef}>
          <TextInput
            aria-label={referentFieldLabel}
            size='sm'
            type="text"
            style={{ width: '100%' }}
            ref={searchInputRef}
            allowClear={!!searchValue}
            value={searchValue || ''}
            onChange={onRouteChange}
            onBlur={handleInputBlur}
            disabled={!isDataSourceReady}
            checkValidityOnAccept={(e) => { return validateReferentTextInput(e) }}
          />
          {searchValue && <Intellisense
              isOpen={checkIsOpenSuggestionPopper()}
              reference={searchConRef}
              searchText={searchValue}
              searchSuggestion={searchSuggestion}
              onRecordItemClick={onSuggestionItemClick}
              id={widgetId}
              searchInputRef={searchInputRef}
            />
          }
        </div>
      </div>
      <div className="search-method-form__method-label px-3 pt-3">
        <Label size="default" className='mb-1 w-100 title3'>
          {offsetLabel}
        </Label>
        <TextInput
          aria-label={offsetLabel}
          size='sm'
          type="text"
          style={{ width: '100%' }}
          ref={searchOffsetRef}
          allowClear={offsetValue}
          value={offsetValue || ''}
          onChange={updateOffsetValue}
          disabled={!isDataSourceReady}
          checkValidityOnAccept={(e) => { return validateOffsetTextInput(e) }}
        />
      </div>
      </div>
    </div>
  )
})
