/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  type DataSource,
  type ImmutableObject,
  type IntlShape,
  focusElementInKeyboardMode
} from 'jimu-core'
import {
  GetUnits,
  Intellisense,
  type NetworkInfo,
  QueryMeasureOnRoute,
  QueryRouteMeasures,
  type RouteInfo,
  RoutePicker,
  RoutePickerPopup,
  type Suggestion,
  convertStationToNumber,
  getNetworkOutFields,
  getRouteFromEndMeasures,
  getSuggestions,
  isDefined,
  queryRouteIdOrName,
  getDateWithTZOffset,
  formatMessage,
  QueryMapPointWithMeasureOnRoute
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import { Label, TextInput, type ValidityResult } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import type Polyline from 'esri/geometry/Polyline'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { debounce, round } from 'lodash-es'

export interface RouteAndMeasureFormProps {
  intl: IntlShape
  widgetId: string
  isReady: boolean
  network: ImmutableObject<NetworkInfo>
  networkDS: DataSource
  routeInfo: RouteInfo
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  reset: boolean
  routeInfoFromDataAction: RouteInfo
  revalidateRouteFromDataAction: boolean
  onResetDataAction: () => void
  clearPickedGraphic: () => void
  onRouteInfoUpdated: (newRouteInfo: RouteInfo, flash?: boolean) => void
  measureLabelId?: string
}

export function RouteAndMeasureForm (props: RouteAndMeasureFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    widgetId,
    isReady,
    network,
    networkDS,
    routeInfo,
    jimuMapView,
    hoverGraphic,
    reset,
    routeInfoFromDataAction,
    revalidateRouteFromDataAction,
    onResetDataAction,
    clearPickedGraphic,
    onRouteInfoUpdated,
    measureLabelId
  } = props
  const [isRoutePickerActive, setIsRoutePickerActive] = React.useState<boolean>(false)
  const [measureInput, setMeasureInput] = React.useState<string>('')
  const [isPopupOpen, setIsPopupOpen] = React.useState<boolean>(false)
  const [routeInfos, setRouteInfos] = React.useState<RouteInfo[]>([])
  const [isPopupEnabled, setIsPopupEnabled] = React.useState<boolean>()

  const searchConRef = React.useRef<HTMLDivElement>(null)
  const debounceQuerySuggestionRef = React.useRef((searchText: string) => undefined)

  //Input Ref
  const searchValueRef = React.useRef(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const measureInputRef = React.useRef<HTMLInputElement>(null)
  const inputBlurTimeoutRef = React.useRef(null)

  //Result Suggestion ref
  const suggestionClickedItem = React.useRef(null)
  const isFocusSuggestion = React.useRef<boolean>(false)
  const isFocusLocationAndRecentSearch = React.useRef<boolean>(false)

  //suggestion
  const [searchValue, setSearchValue] = React.useState(null)
  const [isOpenSuggestion, setIsOpenSuggestion] = React.useState(false)
  const [searchSuggestion, setSearchSuggestion] = React.useState([] as Suggestion[])

  React.useEffect(() => {
    debounceQuerySuggestionRef.current = debounce(querySuggestion, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (reset) {
      revalidateFields()
    }
  }, [reset])

  /**
  * Query suggestion
  */
  const querySuggestion = hooks.useEventCallback((starchText: string) => {
    const fieldName = network.useRouteName ? network.routeNameFieldSchema.jimuName : network.routeIdFieldSchema.jimuName
    const serviceSuggestion = getSuggestions(fieldName, starchText, networkDS)
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

  React.useEffect(() => {
    if (revalidateRouteFromDataAction) {
      setTimeout(()=> {
        updateSearchValue(network.useRouteName ? routeInfoFromDataAction.routeName : routeInfoFromDataAction.routeId)
        setMeasureInput('')
        onRouteInfoUpdated(routeInfoFromDataAction)
        revalidateFields()
        onResetDataAction()
      }, 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidateRouteFromDataAction])

  React.useEffect(() => {
    if (isDefined(network)) {
      setSearchValue('')
      setMeasureInput('')
      setIsRoutePickerActive(false)
      clearPickedGraphic()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  React.useEffect(() => {
    if (isDefined(jimuMapView)) {
      setIsPopupEnabled(jimuMapView?.view.popupEnabled)
    }
  }, [jimuMapView])

  React.useEffect(() => {
    if (isDefined(network) && network.useRouteName) {
      setSearchValue(routeInfo.routeName)
    } else {
      setSearchValue(routeInfo.routeId)
    }
    if (!isNaN(routeInfo.selectedMeasure)) {
      setMeasureInput(routeInfo.selectedMeasure.toString())
    } else {
      setMeasureInput('')
    }
  }, [network, routeInfo])

  React.useEffect(() => {
    if (!isNaN(routeInfo.selectedMeasure)) {
      setMeasureInput(routeInfo.selectedMeasure.toString())
    } else {
      setMeasureInput('')
    }
  }, [network, routeInfo.selectedMeasure])

  const validateRouteIdOrName = (routeIdOrName: string, fromDataAction = false): Promise<ValidityResult> => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (suggestionClickedItem.current) {
          routeIdOrName = suggestionClickedItem.current
        }
        const routeInfoArray: RouteInfo[] = []
        const isValid = queryRouteIdOrName(routeIdOrName, network, networkDS)
          .then(async (results) => {
            if (isDefined(results)) {
              if (!fromDataAction) {
                if (reset ||
                    routeIdOrName === routeInfo.routeId ||
                    routeIdOrName === routeInfo.routeName) {
                  return { valid: true }
                }
              }
              await Promise.all(results.features.map(async (feature) => {
                const updatedRoute = setRouteInfoByRouteIdOrName(feature, routeIdOrName)
                routeInfoArray.push(await updatedRoute)
              }))
              if (routeInfoArray.length > 1 && !fromDataAction) {
                handleMultiRouteSelect(routeInfoArray)
              } else {
                if (measureInput.length > 0 || (fromDataAction && !isNaN(routeInfo.selectedMeasure))) {
                  return updateSelectedMeasure(routeInfoArray[0], fromDataAction)
                    .then((result) => {
                      onRouteInfoUpdated(result, true)
                      return { valid: true }
                    })
                } else {
                  onRouteInfoUpdated(routeInfoArray[0], true)
                }
              }
              return { valid: true }
            }
          }).catch((e: any) => {
            if (network.useRouteName) {
              const updateRouteInfo = { ...routeInfo, routeName: routeIdOrName, validRoute: false }
              onRouteInfoUpdated(updateRouteInfo)
            } else {
              const updateRouteInfo = { ...routeInfo, routeId: routeIdOrName, validRoute: false }
              onRouteInfoUpdated(updateRouteInfo)
            }

            if (routeIdOrName.length) {
              // Replace each space with \xa0 to avoid all spaces collapsed into one when being displayed.
              // Put in string resource file in next release since already frozen.
              const message = 'Route \'' + routeIdOrName.replace(/ /g, '\xa0') + '\' not found'
              return { valid: false, msg: message }
            }
            return { valid: true }
          })

        resolve(isValid)
      }, 200)
    })
  }

  const validateMeasure = async (value: string): Promise<ValidityResult> => {
    let measure = NaN

    if (value === '') {
      measure = NaN
      const updateRouteInfo = { ...routeInfo, selectedMeasure: NaN, selectedPoint: null }
      onRouteInfoUpdated(updateRouteInfo)
      setInputMeasure('')
      return { valid: true }
    } else if (isNaN(Number(value))) {
      measure = convertStationToNumber(value)
    } else {
      measure = Number(value)
    }

    if (!isNaN(measure)) {
      if (isDefined(routeInfo.selectedPolyline)) {
        measure = round(measure, network.measurePrecision)
        let updateRouteInfo = { ...routeInfo, selectedMeasure: measure }
        if (measure < routeInfo.fromMeasure) {
          onRouteInfoUpdated(updateRouteInfo)
          return { valid: false, msg: getI18nMessage('measureLessError') }
        } else if (measure > routeInfo.toMeasure) {
          onRouteInfoUpdated(updateRouteInfo)
          return { valid: false, msg: getI18nMessage('measureGreaterError') }
        }

        if (updateRouteInfo.routeId.length) {
          await QueryMapPointWithMeasureOnRoute(networkDS, network, updateRouteInfo.routeId, updateRouteInfo.fromDate, measure.toString())
            .then((point) => {
              if (isDefined(point)) {
                updateRouteInfo = { ...updateRouteInfo, selectedPoint: point, isNearestCoordinate: false }
                onRouteInfoUpdated(updateRouteInfo)
              }
            })
        } else {
          onRouteInfoUpdated(updateRouteInfo)
        }
      }

      return { valid: true }
    } else {
      clearPickedGraphic()
      const updateRouteInfo = { ...routeInfo, selectedMeasure: NaN, selectedPoint: null }
      onRouteInfoUpdated(updateRouteInfo)
      setInputMeasure('')
      return { valid: true }
    }
  }

  const setRouteInfoByRouteIdOrName = async (record: __esri.Graphic, routeIdOrName: string): Promise<RouteInfo> => {
    const networkFields = getNetworkOutFields(network)
    const routeNameValue = network.useRouteName ? record.attributes[networkFields.routeNameFieldName] : ''
    const routeIdValue = record.attributes[networkFields.routeIdFieldName]
    const routeFromDateValue = record.attributes[networkFields.fromDateFieldName]
    const routeToDateValue = record.attributes[networkFields.toDateFieldName]
    const routePolylineValue = record.geometry as Polyline
    const routeEndPoints = getRouteFromEndMeasures(routePolylineValue)
    const lineIdValue = record.attributes[networkFields.lineIdFieldName]
    const lineNameValue = record.attributes[networkFields.lineNameFieldName]

    let defaultFromSelectedDate = new Date(Date.now())
    if (isDefined(routeToDateValue) && defaultFromSelectedDate > routeToDateValue) {
      defaultFromSelectedDate = getDateWithTZOffset(routeFromDateValue, networkDS)
    } else {
      defaultFromSelectedDate.setHours(0, 0, 0, 0)
    }

    let defaultToSelectedDate = new Date(Date.now())
    if (isDefined(routeToDateValue) && defaultToSelectedDate > routeToDateValue) {
      defaultToSelectedDate = getDateWithTZOffset(routeToDateValue, networkDS)
    } else {
      defaultToSelectedDate.setHours(0, 0, 0, 0)
    }

    if (!isDefined(routeToDateValue)) {
      defaultToSelectedDate = null
    }
    return await QueryRouteMeasures(networkDS, network, routeEndPoints, routeFromDateValue, routeIdValue)

      .then((endpointMeasures) => {
        const minMeasure = Math.min(...endpointMeasures)
        const maxMeasure = Math.max(...endpointMeasures)
        const updateRouteInfo = {
          ...routeInfo,
          routeName: routeNameValue,
          routeId: routeIdValue,
          fromDate: isDefined(routeFromDateValue) ? getDateWithTZOffset(routeFromDateValue, networkDS) : null,
          toDate: isDefined(routeToDateValue) ? getDateWithTZOffset(routeToDateValue, networkDS) : null,
          selectedPolyline: routePolylineValue,
          fromMeasure: round(minMeasure, network.measurePrecision),
          toMeasure: round(maxMeasure, network.measurePrecision),
          validRoute: true,
          selectedFromDate: defaultFromSelectedDate,
          selectedToDate: defaultToSelectedDate,
          lineName: lineNameValue,
          lineId: lineIdValue
        }
        return updateRouteInfo
      })
  }

  const updateSelectedMeasure = (routeInfo: RouteInfo, fromDataAction: boolean): Promise<RouteInfo> => {
    return QueryMeasureOnRoute(networkDS, network, routeInfo.routeId, routeInfo.fromDate, measureInput)
      .then((point) => {
        if (point) {
          const updateRouteInfo = { ...routeInfo, selectedPoint: point, selectedMeasure: parseFloat(fromDataAction ? routeInfo.selectedMeasure.toString() : measureInput) }
          return updateRouteInfo
        } else {
          const updateRouteInfo = { ...routeInfo, selectedPoint: null }
          return updateRouteInfo
        }
      })
  }

  const handleRoutePickerChange = () => {
    const isPickerActive = !isRoutePickerActive
    setIsRoutePickerActive(isPickerActive)
    if (isPickerActive) {
      jimuMapView.view.popupEnabled = false
    } else {
      setTimeout(() => {
        jimuMapView.view.popupEnabled = isPopupEnabled
      }, 800)
    }
  }

  const revalidateFields = () => {
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.select()
        focusElementInKeyboardMode(searchInputRef.current, true)
        searchInputRef.current.blur()
      }
      if (inputBlurTimeoutRef.current) {
        measureInputRef.current.select()
        focusElementInKeyboardMode(measureInputRef.current, true)
        measureInputRef.current.blur()
      }
    }, 200)
  }

  const handleRouteInfoUpdate = React.useCallback((routeInfo: RouteInfo, flash: boolean = false) => {
    onRouteInfoUpdated(routeInfo, flash)
    suggestionClickedItem.current = null
    revalidateFields()

  }, [onRouteInfoUpdated])

  const setInputMeasure = (value: string) => {
    setMeasureInput(value)
  }

  const handleMultiRouteSelect = React.useCallback((routeInfos: RouteInfo[]) => {
    if (routeInfos.length) {
      setIsPopupOpen(true)
      setRouteInfos(routeInfos)
    }
  }, [])

  const handlePopupSelect = React.useCallback((routeInfo: RouteInfo) => {
    if (isDefined(routeInfo)) {
      onRouteInfoUpdated(routeInfo, true)
      suggestionClickedItem.current = null
      revalidateFields()
    }
    setIsPopupOpen(false)
  }, [onRouteInfoUpdated])

  const handlePopupCancel = React.useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  return (
    <div className='route-and-measure-form d-flex w-100 px-3'>
      {network && (
        <div className='w-100'>
          <Label size="sm" className='w-100 mb-0 pt-3 title3' centric style={{ width: 100 }} >
            {network.useRouteName ? formatMessage(intl, 'routeNameRequiredLabel') : formatMessage(intl, 'routeIdRequiredLabel')}
          </Label>
          <div ref={searchConRef} className='d-flex w-100'>
            <TextInput
              aria-label={network.useRouteName ? formatMessage(intl, 'routeNameRequiredLabel') : formatMessage(intl, 'routeIdRequiredLabel')}
              type='text'
              className='w-100'
              size='sm'
              allowClear
              disabled={!isReady}
              onBlur={handleInputBlur}
              value={searchValue || ''}
              ref={searchInputRef}
              onChange={onRouteChange}
              checkValidityOnAccept={validateRouteIdOrName}
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
            <RoutePicker
              type='route-measure'
              active={isRoutePickerActive}
              networkDs={networkDS}
              network={network}
              routeInfo={routeInfo}
              disabled={!isReady}
              jimuMapView={jimuMapView}
              symbolColor={null}
              hoverGraphic={hoverGraphic}
              isFrom={true}
              onActiveChange={handleRoutePickerChange}
              onRouteInfoUpdated={handleRouteInfoUpdate }
              onMultiRouteSelect={handleMultiRouteSelect }
            />
          </div>
          <Label size="sm" className='w-100 mb-0 pt-3 title3' style={{ width: 100 }} >
            {measureLabelId
              ? getI18nMessage(measureLabelId, { units: GetUnits(network.unitsOfMeasure, intl) })
              : getI18nMessage('measureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) })}
          </Label>
          <div className='d-flex w-100'>
            <TextInput
              ref={measureInputRef}
              aria-label={getI18nMessage('measureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) })}
              className='w-100'
              size='sm'
              value={measureInput}
              disabled={!isReady}
              onChange={(evt) => { setInputMeasure(evt.target.value) }}
              checkValidityOnAccept={validateMeasure}
            >
            </TextInput>
          </div>

          <RoutePickerPopup
            isOpen={isPopupOpen}
            routeInfos={routeInfos}
            useRouteName={network.useRouteName}
            onRouteSelect={handlePopupSelect}
            onRouteSelectCancel={handlePopupCancel}
            measurePrecision={network.measurePrecision}
            isFrom={true}
            jimuMapView={jimuMapView}
            graphicLayer={hoverGraphic}
          />
        </div>
      )}
    </div>
  )
}
