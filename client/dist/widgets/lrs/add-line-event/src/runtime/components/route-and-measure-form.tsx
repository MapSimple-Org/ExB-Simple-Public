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
import defaultMessages from '../translations/default'
import { Label, TextInput, type ValidityResult } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import {
  type LrsLayer,
  type NetworkInfo,
  type RouteInfo,
  type RouteMeasurePickerInfo,
  type Suggestion,
  GetUnits,
  Intellisense,
  QueryMeasureOnRoute,
  QueryRouteMeasures,
  RoutePicker,
  RoutePickerPopup,
  convertStationToNumber,
  getNetworkOutFields,
  getRouteFromEndMeasures,
  getSuggestions,
  isDefined,
  queryRouteIdOrName,
  queryRoutesByLineId,
  getDateWithTZOffset,
  getDateWithoutTime
} from 'widgets/shared-code/lrs'
import type Polyline from 'esri/geometry/Polyline'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { round, debounce } from 'lodash-es'

export interface RouteAndMeasureFormProps {
  intl: IntlShape
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  event: ImmutableObject<LrsLayer>
  networkDS: DataSource
  routeInfo: RouteInfo
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  clearPickedGraphic: () => void
  clearHoverGraphic: () => void
  onRouteInfoUpdated: (newRouteInfo: RouteInfo, flash?: boolean) => void
  onRouteMeasurePickerInfoUpdated: (newRouteMeasurePickInfo: RouteMeasurePickerInfo) => void
  routeMeasurePickerInfo: RouteMeasurePickerInfo
  isFrom: boolean
  canSpanRoutes: boolean
  reset: boolean
  revalidateRouteFromDataAction: boolean
  onResetDataAction: () => void
  useStartMeasure: boolean
  useEndMeasure: boolean
  hideMeasures: boolean
}

export function RouteAndMeasureForm (props: RouteAndMeasureFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    widgetId,
    network,
    event,
    networkDS,
    routeInfo,
    jimuMapView,
    hoverGraphic,
    clearPickedGraphic,
    clearHoverGraphic,
    onRouteInfoUpdated,
    onRouteMeasurePickerInfoUpdated,
    routeMeasurePickerInfo,
    isFrom,
    canSpanRoutes,
    reset,
    revalidateRouteFromDataAction,
    onResetDataAction,
    hideMeasures,
    useStartMeasure,
    useEndMeasure
  } = props
  const [isFromRoutePickerActive, setIsFromRoutePickerActive] = React.useState<boolean>(false)
  const [isToRoutePickerActive, setIsToRoutePickerActive] = React.useState<boolean>(false)
  const [isFromMeasurePickerActive, setIsFromMeasurePickerActive] = React.useState<boolean>(false)
  const [isToMeasurePickerActive, setIsToMeasurePickerActive] = React.useState<boolean>(false)
  const [fromMeasureInput, setFromMeasureInput] = React.useState<string>('')
  const [toMeasureInput, setToMeasureInput] = React.useState<string>('')
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
  const [fromSearchValue, setFromSearchValue] = React.useState(null)
  const [toSearchValue, setToSearchValue] = React.useState(null)
  const [isOpenSuggestion, setIsOpenSuggestion] = React.useState(false)
  const [searchSuggestion, setSearchSuggestion] = React.useState([] as Suggestion[])

  React.useEffect(() => {
    debounceQuerySuggestionRef.current = debounce(querySuggestion, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (revalidateRouteFromDataAction) {
      const routeIdOrName = isFrom ? network.useRouteName ? routeInfo.routeName : routeInfo.routeId : network.useRouteName ? routeInfo.toRouteName : routeInfo.toRouteId
      updateSearchValue(routeIdOrName)
      if (isFrom) {
        (async () => {
          await validateRouteIdOrName(routeIdOrName, true)
          if (!isNaN(routeInfo.selectedMeasure)) {
            setFromMeasureInput(routeInfo.selectedMeasure.toString())
          }
        })()
        if (!routeInfo.selectedToMeasure) {
          onResetDataAction()
        }
      } else {
        (async () => {
          await validateRouteIdOrName(routeIdOrName, true)
          if (routeInfo.selectedToMeasure) {
            setToMeasureInput(routeInfo.selectedToMeasure.toString())
          }
          onResetDataAction()
        })()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidateRouteFromDataAction])

  React.useEffect(() => {
    if (reset) {
      setFromMeasureInput('')
      setToMeasureInput('')
      suggestionClickedItem.current = null
      revalidateFields()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  React.useEffect(() => {
    if (isFrom) {
      if (network && network.useRouteName) {
        setFromSearchValue(routeInfo.routeName)
      } else if (network && !network.useRouteName) {
        setFromSearchValue(routeInfo.routeId)
      }
    } else {
      if (network && network.useRouteName) {
        setToSearchValue(routeInfo.toRouteName)
      } else if (network && !network.useRouteName) {
        setToSearchValue(routeInfo.toRouteId)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, routeInfo.routeId, routeInfo.toRouteId, routeInfo.routeName, routeInfo.toRouteName])

  const handleRouteInfoUpdate = React.useCallback((routeInfo: RouteInfo, flash: boolean = false) => {
    onRouteInfoUpdated(routeInfo, flash)
    suggestionClickedItem.current = null
  }, [onRouteInfoUpdated])

  React.useEffect(() => {
    if (isFrom) {
      if (!isNaN(routeInfo.selectedMeasure)) {
        setFromMeasureInput(routeInfo.selectedMeasure.toString())
      } else {
        setFromMeasureInput('')
      }
      revalidateFields(false, true)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, routeInfo.selectedMeasure])

  React.useEffect(() => {
    if (isFrom) {
      if (useStartMeasure) {
        revalidateFields(false, true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo.selectedPoint])

  React.useEffect(() => {
    if (!isFrom) {
      if (useEndMeasure) {
        revalidateFields(false, true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo.selectedToPoint])

  React.useEffect(() => {
    if (!isFrom) {
      if (!isNaN(routeInfo.selectedToMeasure)) {
        setToMeasureInput(routeInfo.selectedToMeasure.toString())
      } else {
        setToMeasureInput('')
      }
      revalidateFields(false, true)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, routeInfo.selectedToMeasure])

  React.useEffect(() => {
    // spanning routes
    if (!isFrom && canSpanRoutes && routeInfo.validRoute) {
      if (network.useRouteName) {
        setToSearchValue(routeInfo.toRouteName)
      } else {
        setToSearchValue(routeInfo.toRouteId)
      }
    }
    // non spanning routes
    if (!isFrom && !canSpanRoutes && routeInfo.validRoute) {
      if (network.useRouteName) {
        setToSearchValue(routeInfo.routeName)
      } else {
        setToSearchValue(routeInfo.routeId)
      }

      if (routeInfo.routeId !== routeInfo.toRouteId || routeInfo.routeName !== routeInfo.toRouteName) {
        const updateRouteInfo = { ...routeInfo, toRouteId: routeInfo.routeId, toRouteName: routeInfo.routeName }
        onRouteInfoUpdated(updateRouteInfo)
      }
    }
    if (isFrom) {
      revalidateFields()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo.routeName, routeInfo.routeId])

  React.useEffect(() => {
    if (!isFrom) {
      revalidateFields()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo.toRouteName, routeInfo.toRouteId])

  // event or network change
  React.useEffect(() => {
    // update the search value if the event or network changed
    if (routeInfo.routeName && routeInfo.routeId) {
      if (routeInfo.routeName.length < 1 && routeInfo.routeId.length < 1) {
        updateSearchValue('')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, network])

  /**
  * Query suggestion
  */
  const querySuggestion = hooks.useEventCallback((starchText: string) => {
    const fieldName = network.useRouteName ? network.routeNameFieldSchema.jimuName : network.routeIdFieldSchema.jimuName
    const serviceSuggestion = getSuggestions(fieldName, starchText, networkDS)
    Promise.all([serviceSuggestion]).then(async allSuggestion => {
      const suggestion = allSuggestion?.[0]

      // If dealing with spanning events, only display routes on the currently selected line
      if (!isFrom && routeInfo.lineId) {
        const routes = []
        suggestion.forEach((element) => {
          element.suggestionItem.forEach((rte) => {
            routes.push(rte.suggestion)
          })
        })

        const foundRoutes = []
        const isValid = queryRoutesByLineId(routes, routeInfo.lineId, network, networkDS)
        await Promise.all([isValid]).then((results) => {
          const queryResults = results?.[0]
          if (isDefined(queryResults)) {
            for (let i = 0; i < queryResults.features.length; i++) {
              const feature = queryResults.features[i]
              const routeValue = feature.attributes[fieldName]
              foundRoutes.push(routeValue)
            }

            if (foundRoutes.length > 0) {
              // remove any items that weren't retured in the query results
              suggestion.forEach((element) => {
                const filteredSuggestions = element.suggestionItem.filter(item => foundRoutes.includes(item.suggestion))
                element.suggestionItem = filteredSuggestions
              })
            } else {
              suggestion.forEach((element) => {
                element.suggestionItem = []
              })
            }
          }
        }).catch((e: any) => {
          suggestion.forEach((element) => {
            element.suggestionItem = []
          })
        })
      }

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
    isFrom ? setFromSearchValue(searchText) : setToSearchValue(searchText)
    searchValueRef.current = searchText
    suggestionClickedItem.current = searchText
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
    if (isDefined(network)) {
      if (!isDefined(revalidateRouteFromDataAction)) {
        setFromSearchValue('')
        setToSearchValue('')
      }
      setFromMeasureInput('')
      setToMeasureInput('')
      setIsFromRoutePickerActive(false)
      setIsToRoutePickerActive(false)
      setIsFromMeasurePickerActive(false)
      setIsToMeasurePickerActive(false)
      clearPickedGraphic()
      clearHoverGraphic()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  React.useEffect(() => {
    if (isDefined(jimuMapView)) {
      if (jimuMapView.view) {
        setIsPopupEnabled(jimuMapView.view.popupEnabled)
      }
    }
  }, [jimuMapView])

  const validateRouteIdOrName = (routeIdOrName: string, fromDataAction = false): Promise<ValidityResult> => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (suggestionClickedItem.current && !fromDataAction) {
          routeIdOrName = suggestionClickedItem.current
        }
        suggestionClickedItem.current = null
        const routeInfoArray: RouteInfo[] = []
        const lineId = isDefined(routeInfo.lineId) ? isFrom ? '' : routeInfo.lineId : ''
        const isValid = queryRouteIdOrName(routeIdOrName, network, networkDS, canSpanRoutes, isFrom, lineId)
          .then(async (results) => {
            if (isDefined(results)) {
              if (!fromDataAction) {
                if (reset || (isFrom && (routeIdOrName === routeInfo.routeId || routeIdOrName === routeInfo.routeName)) ||
                  (!isFrom && (routeIdOrName === routeInfo.toRouteId || routeIdOrName === routeInfo.toRouteName))) {
                  return { valid: true }
                }
              }
              await Promise.all(results.features.map(async (feature) => {
                const updatedRoute = isFrom ? await setFromRouteInfoByRouteIdOrName(feature, routeIdOrName) : await setToRouteInfoByRouteIdOrName(feature, routeIdOrName)
                routeInfoArray.push(updatedRoute)
              }))
              // show route selector popup
              // don't want to show route selector popup if this is from a data action as the route was already chosen from the data action
              if (routeInfoArray.length > 1 && !fromDataAction) {
                handleMultiRouteSelect(routeInfoArray)
              } else if (routeInfoArray.length > 0) {
                let updateRouteInfo = routeInfoArray[0]
                // there could be multiple routes returned from the query.  Choose the correct one when coming from a data action
                if (fromDataAction) {
                  updateRouteInfo = routeInfoArray.find((route) => getDateWithoutTime(route.fromDate).getTime() === getDateWithoutTime(routeInfo.fromDate).getTime())
                }
                if (isFrom) {
                  if (fromMeasureInput.length > 0 || (fromDataAction && !isNaN(routeInfo.selectedMeasure))) {
                    return updateSelectedFromMeasure(updateRouteInfo, fromDataAction)
                      .then((result) => {
                        if (!canSpanRoutes && routeIdOrName !== routeInfo.toRouteId && routeIdOrName !== routeInfo.toRouteName && !useStartMeasure) {
                          result.selectedToMeasure = NaN
                        }
                        onRouteInfoUpdated(result, true)
                        return { valid: true }
                      })
                  } else {
                    if (!canSpanRoutes && routeIdOrName !== routeInfo.toRouteId && routeIdOrName !== routeInfo.toRouteName && !useEndMeasure) {
                      updateRouteInfo.selectedToMeasure = NaN
                    }
                    onRouteInfoUpdated(updateRouteInfo, true)
                  }
                } else {
                  if (toMeasureInput.length > 0 || (fromDataAction && !isNaN(routeInfo.selectedToMeasure))) {
                    return updateSelectedToMeasure(updateRouteInfo, fromDataAction)
                      .then((result) => {
                        onRouteInfoUpdated(result, true)
                        return { valid: true }
                      })
                  } else {
                    onRouteInfoUpdated(updateRouteInfo, true)
                  }
                }
              }
              return { valid: true }
            }
          }).catch((e: any) => {
            if (!reset) {
              const updatedToRouteId = !canSpanRoutes ? '' : routeInfo.toRouteId
              const updatedSelectedToMeasure = !canSpanRoutes ? routeIdOrName === '' ? NaN : routeInfo.selectedToMeasure : NaN
              const updatedSelectedToPoint = isNaN(updatedSelectedToMeasure) ? null : routeInfo.selectedToPoint
              const updateSelectedToPolyline = !canSpanRoutes ? null : routeInfo.selectedToPolyline

              if (isDefined(network) && network.useRouteName) {
                if (isFrom) {
                  const updatedToRouteName = !canSpanRoutes ? routeIdOrName === '' ? '' : routeInfo.toRouteName : routeInfo.toRouteName
                  const updateRouteInfo = { ...routeInfo, routeName: routeIdOrName, toRouteName: updatedToRouteName, routeId: '', toRouteId: updatedToRouteId, selectedMeasure: NaN, selectedToMeasure: updatedSelectedToMeasure, selectedPolyline: null, selectedToPolyline: updateSelectedToPolyline, selectedPoint: null, selectedToPoint: updatedSelectedToPoint, validRoute: false }
                  onRouteInfoUpdated(updateRouteInfo)
                } else {
                  const updateRouteInfo = { ...routeInfo, toRouteName: routeIdOrName, toRouteId: '', selectedToPolyline: null, selectedToMeasure: NaN, selectedToPoint: null, validToRoute: false }
                  onRouteInfoUpdated(updateRouteInfo)
                }
              } else {
                if (isFrom) {
                  const updateRouteInfo = { ...routeInfo, routeId: routeIdOrName, toRouteId: updatedToRouteId, selectedMeasure: NaN, selectedToMeasure: updatedSelectedToMeasure, selectedPolyline: null, selectedToPolyline: updateSelectedToPolyline, selectedPoint: null, selectedToPoint: updatedSelectedToPoint, validRoute: false }
                  onRouteInfoUpdated(updateRouteInfo)
                } else {
                  const updateRouteInfo = { ...routeInfo, toRouteId: routeIdOrName, selectedToMeasure: NaN, selectedToPolyline: null, selectedToPoint: null, validToRoute: false }
                  onRouteInfoUpdated(updateRouteInfo)
                }
              }
              if (routeIdOrName.length > 0) {
                if (e.message === 'Error: routeNotOnSameLine') {
                  return { valid: false, msg: getI18nMessage('routeNotOnSameLine') }
                }
                // Replace each space with \xa0 to avoid all spaces collapsed into one when being displayed.
                // Put in string resource file in next release since already frozen.
                const message = 'Route \'' + routeIdOrName.replace(/ /g, '\xa0') + '\' not found'
                return { valid: false, msg: message }
              } else {
                updateSearchValue('')
                return { valid: true }
              }
            } else {
              updateSearchValue('')
              return { valid: true }
            }
          })

        resolve(isValid)
      }, 200)
    })
  }

  const setFromRouteInfoByRouteIdOrName = async (record: __esri.Graphic, routeIdOrName: string): Promise<RouteInfo> => {
    const networkFields = getNetworkOutFields(network)
    const routeNameValue = network.useRouteName ? record.attributes[networkFields.routeNameFieldName] : ''
    const routeIdValue = record.attributes[networkFields.routeIdFieldName]
    const routeFromDateValue = record.attributes[networkFields.fromDateFieldName]
    const routeToDateValue = record.attributes[networkFields.toDateFieldName]
    const routePolylineValue = record.geometry as Polyline
    const routeEndPoints = getRouteFromEndMeasures(record.geometry as Polyline)
    const fromLineIdValue = record.attributes[networkFields.lineIdFieldName]
    const fromLineOrderValue = record.attributes[networkFields.lineOrderFieldName]
    const fromLineNameValue = record.attributes[networkFields.lineNameFieldName]

    let defaultFromSelectedDate = revalidateRouteFromDataAction ? routeInfo.fromDate : new Date(Date.now())
    if (isDefined(defaultFromSelectedDate)) {
      if (isDefined(routeToDateValue) && defaultFromSelectedDate > routeToDateValue) {
        defaultFromSelectedDate = getDateWithTZOffset(routeFromDateValue, networkDS)
      } else {
        // Commented out to fix https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/19004
        // Uncommented to fix https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/28336#issuecomment-5735412 and made sure the above issue 19004 is not reproducible.
        defaultFromSelectedDate.setHours(0, 0, 0, 0)
      }
    }

    let defaultToSelectedDate = revalidateRouteFromDataAction ? routeInfo.toDate : new Date(Date.now())
    if (isDefined(defaultToSelectedDate)) {
      if (isDefined(routeToDateValue) && defaultToSelectedDate > routeToDateValue) {
        defaultToSelectedDate = getDateWithTZOffset(routeToDateValue, networkDS)
      } else {
        // Commented out since we commented out defaultFromSelectedDate.setHours(0, 0, 0, 0) above to fix https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/19004.
        // Uncommented to fix https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/28336#issuecomment-5735412 and made sure the above issue 19004 is not reproducible.
        defaultToSelectedDate.setHours(0, 0, 0, 0)
      }
    }

    if (!isDefined(routeToDateValue) && !revalidateRouteFromDataAction) {
      defaultToSelectedDate = null
    }

    let resetToRoute = false
    if (canSpanRoutes && !routeInfo.validToRoute) {
      resetToRoute = true
    } else if (fromLineIdValue && routeInfo.toLineId !== fromLineIdValue) {
      resetToRoute = true
    } else if (!canSpanRoutes) {
      resetToRoute = true
    }

    return await QueryRouteMeasures(networkDS, network, routeEndPoints, routeFromDateValue, routeIdValue)

      .then((endpointMeasures) => {
        const minMeasure = Math.min(...endpointMeasures)
        const maxMeasure = Math.max(...endpointMeasures)
        const updateRouteInfo = {
          ...routeInfo,
          routeId: routeIdValue,
          toRouteId: resetToRoute ? routeIdValue : routeInfo.toRouteId,
          routeName: routeNameValue,
          toRouteName: resetToRoute ? routeNameValue : routeInfo.toRouteName,
          routeLineOrder: fromLineOrderValue,
          toRouteLineOrder: resetToRoute ? fromLineOrderValue : routeInfo.toRouteLineOrder,
          lineId: fromLineIdValue,
          toLineId: fromLineIdValue,
          lineName: fromLineNameValue,
          toLineName: fromLineNameValue,
          fromMeasure: round(minMeasure, network.measurePrecision),
          toMeasure: round(maxMeasure, network.measurePrecision),
          toRouteFromMeasure: resetToRoute ? round(minMeasure, network.measurePrecision) : routeInfo.toRouteFromMeasure,
          toRouteToMeasure: resetToRoute ? round(maxMeasure, network.measurePrecision) : routeInfo.toRouteToMeasure,
          selectedToMeasure: resetToRoute ? NaN : routeInfo.selectedToMeasure,
          fromDate: isDefined(routeFromDateValue) ? getDateWithTZOffset(routeFromDateValue, networkDS) : null,
          toDate: isDefined(routeToDateValue) ? getDateWithTZOffset(routeToDateValue, networkDS) : null,
          toRouteFromDate: resetToRoute ? isDefined(routeFromDateValue) ? getDateWithTZOffset(routeFromDateValue, networkDS) : null : routeInfo.toRouteFromDate,
          toRouteToDate: resetToRoute ? isDefined(routeToDateValue) ? getDateWithTZOffset(routeToDateValue, networkDS) : null : routeInfo.toRouteToDate,
          selectedToPoint: resetToRoute ? null : routeInfo.selectedToPoint,
          selectedPolyline: routePolylineValue,
          selectedToPolyline: resetToRoute ? routePolylineValue : routeInfo.selectedToPolyline,
          selectedFromDate: defaultFromSelectedDate,
          selectedToDate: defaultToSelectedDate,
          validRoute: true,
          validToRoute: true
        }

        if (useStartMeasure) {
          updateRouteInfo.selectedMeasure = round(minMeasure, network.measurePrecision)
          updateRouteInfo.selectedPoint = routeEndPoints[0]
          setFromMeasureInput(round(minMeasure, network.measurePrecision).toString())
        }

        if ((!isFrom && useEndMeasure) || ((routeInfo.lineId !== fromLineIdValue) && useEndMeasure) || ((!routeInfo.lineId && !fromLineIdValue) && useEndMeasure)) {
          updateRouteInfo.selectedToMeasure = round(maxMeasure, network.measurePrecision)
          updateRouteInfo.selectedToPoint = routeEndPoints[1]
          setToMeasureInput(round(maxMeasure, network.measurePrecision).toString())
        }

        return updateRouteInfo
      })
  }

  const setToRouteInfoByRouteIdOrName = async (record: __esri.Graphic, routeIdOrName: string): Promise<RouteInfo> => {
    const networkFields = getNetworkOutFields(network)
    const routeNameValue = network.useRouteName ? record.attributes[networkFields.routeNameFieldName] : ''
    const routeFromDateValue = record.attributes[networkFields.fromDateFieldName]
    const routeIdValue = record.attributes[networkFields.routeIdFieldName]
    const routeToDateValue = record.attributes[networkFields.toDateFieldName]
    const routePolylineValue = record.geometry as Polyline
    const routeEndPoints = getRouteFromEndMeasures(record.geometry as Polyline)
    const toLineOrderValue = record.attributes[networkFields.lineOrderFieldName]

    let defaultFromSelectedDate = revalidateRouteFromDataAction ? routeInfo.fromDate : new Date(Date.now())
    if (isDefined(routeToDateValue) && isDefined(defaultFromSelectedDate) && defaultFromSelectedDate > routeToDateValue) {
      defaultFromSelectedDate = getDateWithTZOffset(routeFromDateValue, networkDS)
    } else {
      if (!isDefined(defaultFromSelectedDate)) {
        defaultFromSelectedDate.setHours(0, 0, 0, 0)
      }
    }

    let defaultToSelectedDate = revalidateRouteFromDataAction ? routeInfo.toDate : new Date(Date.now())
    if (isDefined(routeToDateValue) && isDefined(defaultToSelectedDate) && defaultToSelectedDate > routeToDateValue) {
      defaultToSelectedDate = getDateWithTZOffset(routeToDateValue, networkDS)
    } else {
      if (isDefined(defaultToSelectedDate)) {
        defaultToSelectedDate.setHours(0, 0, 0, 0)
      }
    }

    if (!isDefined(routeToDateValue) && !revalidateRouteFromDataAction) {
      defaultToSelectedDate = null
    }

    return await QueryRouteMeasures(networkDS, network, routeEndPoints, routeFromDateValue, routeIdValue)

      .then((endpointMeasures) => {
        const minMeasure = Math.min(...endpointMeasures)
        const maxMeasure = Math.max(...endpointMeasures)
        const updateRouteInfo = {
          ...routeInfo,
          toRouteName: canSpanRoutes ? routeNameValue : routeInfo.routeName,
          toRouteId: canSpanRoutes ? routeIdValue : routeInfo.routeId,
          toRouteFromDate: canSpanRoutes
            ? (isDefined(routeFromDateValue) ? getDateWithTZOffset(routeFromDateValue, networkDS) : null)
            : (isDefined(routeFromDateValue) ? getDateWithTZOffset(routeFromDateValue, networkDS) : routeInfo.toRouteFromDate),
          toRouteToDate: canSpanRoutes
            ? (isDefined(routeToDateValue) ? getDateWithTZOffset(routeToDateValue, networkDS) : null)
            : (isDefined(routeToDateValue) ? getDateWithTZOffset(routeToDateValue, networkDS) : routeInfo.toRouteToDate),
          selectedToPolyline: canSpanRoutes ? routePolylineValue : routeInfo.selectedToPolyline,
          toRouteFromMeasure: canSpanRoutes ? round(minMeasure, network.measurePrecision) : routeInfo.toRouteFromMeasure,
          toRouteToMeasure: canSpanRoutes ? round(maxMeasure, network.measurePrecision) : routeInfo.toRouteToMeasure,
          toRouteLineOrder: canSpanRoutes ? toLineOrderValue : routeInfo.toRouteLineOrder,
          validToRoute: true
        }

        if (useEndMeasure) {
          updateRouteInfo.selectedToMeasure = round(maxMeasure, network.measurePrecision)
          updateRouteInfo.selectedToPoint = routeEndPoints[1]
          setToMeasureInput(round(maxMeasure, network.measurePrecision).toString())
        }
        return updateRouteInfo
      })
  }

  const updateSelectedFromMeasure = (routeInfo: RouteInfo, fromDataAction: boolean): Promise<RouteInfo> => {
    return QueryMeasureOnRoute(networkDS, network, routeInfo.routeId, routeInfo.fromDate, fromDataAction || useStartMeasure ? routeInfo.selectedMeasure.toString() : fromMeasureInput).then((point) => {
        if (point) {
          const updateRouteInfo = { ...routeInfo, selectedPoint: point, selectedMeasure: parseFloat(fromDataAction || useStartMeasure ? routeInfo.selectedMeasure.toString() : fromMeasureInput) }
          return updateRouteInfo
        } else {
          const updateRouteInfo = { ...routeInfo, selectedPoint: null, selectedMeasure: NaN }
          return updateRouteInfo
        }
      })
  }

  const updateSelectedToMeasure = (routeInfo: RouteInfo, fromDataAction: boolean): Promise<RouteInfo> => {
    return QueryMeasureOnRoute(networkDS, network, routeInfo.toRouteId, routeInfo.toRouteFromDate, fromDataAction || useEndMeasure ? routeInfo.selectedToMeasure.toString() : toMeasureInput).then((point) => {
        if (point) {
          const updateRouteInfo = { ...routeInfo, selectedToPoint: point, selectedToMeasure: parseFloat(fromDataAction || useEndMeasure ? routeInfo.selectedToMeasure.toString() : toMeasureInput) }
          return updateRouteInfo
        } else {
          const updateRouteInfo = { ...routeInfo, selectedToMeasure: NaN }
          return updateRouteInfo
        }
      })
  }

  const validateMeasure = async (value: string): Promise<ValidityResult> => {
    let measure = NaN

    if (value === '') {
      measure = NaN
      const updateRouteInfo = { ...routeInfo }
      if (isFrom) {
        updateRouteInfo.selectedMeasure = NaN
        updateRouteInfo.selectedPoint = null
      } else {
        updateRouteInfo.selectedToMeasure = NaN
        updateRouteInfo.selectedToPoint = null
      }
      onRouteInfoUpdated(updateRouteInfo)
      return { valid: true }
    } else if (isNaN(Number(value))) {
      measure = convertStationToNumber(value)
    } else {
      measure = Number(value)
    }

    measure = round(measure, network.measurePrecision)

    if (!isNaN(measure)) {
      const toRouteValid = ((!canSpanRoutes && isDefined(routeInfo.selectedPolyline)) ||
                                        (canSpanRoutes && routeInfo.routeId === routeInfo.toRouteId && isDefined(routeInfo.selectedPolyline)) ||
                                        (canSpanRoutes && routeInfo.routeId !== routeInfo.toRouteId && isDefined(routeInfo.selectedToPolyline)))
      if ((isFrom && isDefined(routeInfo.selectedPolyline)) || (!isFrom && toRouteValid)) {
        if (isFrom) {
          if (measure < routeInfo.fromMeasure) {
            return { valid: false, msg: getI18nMessage('measureLessError') }
          } else if (measure > routeInfo.toMeasure) {
            return { valid: false, msg: getI18nMessage('measureGreaterError') }
          }
        } else {
          const toRouteFromMeasure = !canSpanRoutes ? routeInfo.fromMeasure : routeInfo.routeId === routeInfo.toRouteId ? routeInfo.fromMeasure : routeInfo.toRouteFromMeasure
          const toRouteToMeasure = !canSpanRoutes ? routeInfo.toMeasure : routeInfo.routeId === routeInfo.toRouteId ? routeInfo.toMeasure : routeInfo.toRouteToMeasure
          if (measure < toRouteFromMeasure) {
            return { valid: false, msg: getI18nMessage('measureLessError') }
          } else if (measure > toRouteToMeasure) {
            return { valid: false, msg: getI18nMessage('measureGreaterError') }
          }
        }

        let updateRouteInfo = { ...routeInfo }
        if (isFrom) {
          if (measure > routeInfo.selectedToMeasure && updateRouteInfo.routeId === updateRouteInfo.toRouteId) {
            updateRouteInfo = { ...updateRouteInfo, selectedMeasure: parseFloat(measure.toString()) }
            onRouteInfoUpdated(updateRouteInfo)
            return { valid: false, msg: getI18nMessage('fromMeasureGreaterThanToMeasureError')}
          } else {
            if (updateRouteInfo.routeId.length) {
              await QueryMeasureOnRoute(networkDS, network, updateRouteInfo.routeId, updateRouteInfo.fromDate, measure.toString())
                .then((point) => {
                  if (isDefined(point)) {
                    // only update the routeInfo if the points aren't identical
                    if (!isDefined(updateRouteInfo.selectedPoint) || (point.x !== updateRouteInfo.selectedPoint.x && point.y !== updateRouteInfo.selectedPoint.y)) {
                      updateRouteInfo = { ...updateRouteInfo, selectedPoint: point, selectedMeasure: parseFloat(measure.toString()) }
                      onRouteInfoUpdated(updateRouteInfo)
                    } else {
                      updateRouteInfo = { ...updateRouteInfo, selectedMeasure: parseFloat(measure.toString()) }
                      onRouteInfoUpdated(updateRouteInfo)
                    }
                  }
                })
            } else {
              updateRouteInfo = { ...updateRouteInfo, selectedMeasure: parseFloat(measure.toString()) }
              onRouteInfoUpdated(updateRouteInfo)
            }
          }
        } else {
          if (!isFrom && measure < routeInfo.selectedMeasure && updateRouteInfo.routeId === updateRouteInfo.toRouteId) {
            updateRouteInfo = { ...updateRouteInfo, selectedToMeasure: parseFloat(measure.toString()) }
            onRouteInfoUpdated(updateRouteInfo)
            return { valid: false, msg: getI18nMessage('fromMeasureGreaterThanToMeasureError')}
          } else {
            if (updateRouteInfo.toRouteId.length) {
              await QueryMeasureOnRoute(networkDS, network, updateRouteInfo.toRouteId, updateRouteInfo.toRouteFromDate, measure.toString())
                .then((point) => {
                  if (!isDefined(updateRouteInfo.selectedToPoint) || (point.x !== updateRouteInfo.selectedToPoint.x && point.y !== updateRouteInfo.selectedToPoint.y)) {
                    updateRouteInfo = { ...updateRouteInfo, selectedToPoint: point, selectedToMeasure: parseFloat(measure.toString()) }
                    onRouteInfoUpdated(updateRouteInfo)
                  } else {
                    updateRouteInfo = { ...updateRouteInfo, selectedToMeasure: parseFloat(measure.toString()) }
                    onRouteInfoUpdated(updateRouteInfo)
                  }
                })
            } else {
              updateRouteInfo = { ...updateRouteInfo, selectedToMeasure: parseFloat(measure.toString()) }
              onRouteInfoUpdated(updateRouteInfo)
            }
          }
        }
      }

      return { valid: true }
    } else {
      clearPickedGraphic()
      const updateRouteInfo = { ...routeInfo }
      if (isFrom) {
        updateRouteInfo.selectedMeasure = NaN
        updateRouteInfo.selectedPoint = null
        setFromMeasureInput('')
      } else {
        updateRouteInfo.selectedToMeasure = NaN
        updateRouteInfo.selectedToPoint = null
        setToMeasureInput('')
      }
      onRouteInfoUpdated(updateRouteInfo)
      return { valid: true }
    }
  }

  const handleFromRoutePickerIsActive = () => {
    const isFromPickerActive = !routeMeasurePickerInfo.fromRoutePickerActive
    setIsFromRoutePickerActive(isFromPickerActive)
    if (isFromPickerActive) {
      setIsFromMeasurePickerActive(false)
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: true, fromMeasurePickerActive: false, toRoutePickerActive: false, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      jimuMapView.view.popupEnabled = false
    } else {
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: false, toRoutePickerActive: false, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      clearHoverGraphic()
      setTimeout(() => {
        jimuMapView.view.popupEnabled = isPopupEnabled && !isToRoutePickerActive && !isFromMeasurePickerActive && !isToMeasurePickerActive
      }, 800)
    }
  }

  const handleToRoutePickerIsActive = () => {
    const isToPickerActive = !routeMeasurePickerInfo.toRoutePickerActive
    setIsToRoutePickerActive(isToPickerActive)
    if (isToPickerActive) {
      setIsToMeasurePickerActive(false)
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: false, toRoutePickerActive: true, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      jimuMapView.view.popupEnabled = false
    } else {
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: false, toRoutePickerActive: false, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      clearHoverGraphic()
      setTimeout(() => {
        jimuMapView.view.popupEnabled = isPopupEnabled && !isFromRoutePickerActive && !isFromMeasurePickerActive && !isToMeasurePickerActive
      }, 800)
    }
  }

  const handleFromMeasurePickerIsActive = () => {
    const isFromPickerActive = !routeMeasurePickerInfo.fromMeasurePickerActive
    setIsFromMeasurePickerActive(isFromPickerActive)
    if (isFromPickerActive) {
      setIsFromRoutePickerActive(false)
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: true, toRoutePickerActive: false, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      jimuMapView.view.popupEnabled = false
    } else {
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: false, toRoutePickerActive: false, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      clearHoverGraphic()
      setTimeout(() => {
        jimuMapView.view.popupEnabled = isPopupEnabled && !isFromRoutePickerActive && !isToRoutePickerActive && !isToMeasurePickerActive
      }, 800)
    }
  }

  const handleToMeasurePickerIsActive = () => {
    const isToPickerActive = !routeMeasurePickerInfo.toMeasurePickerActive
    setIsToMeasurePickerActive(isToPickerActive)
    if (isToPickerActive) {
      setIsToRoutePickerActive(false)
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: false, toRoutePickerActive: false, toMeasurePickerActive: true }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      jimuMapView.view.popupEnabled = false
    } else {
      const updateRouteMeasurePickerInfo = { ...routeMeasurePickerInfo, fromRoutePickerActive: false, fromMeasurePickerActive: false, toRoutePickerActive: false, toMeasurePickerActive: false }
      onRouteMeasurePickerInfoUpdated(updateRouteMeasurePickerInfo)
      clearHoverGraphic()
      setTimeout(() => {
        jimuMapView.view.popupEnabled = isPopupEnabled && !isFromRoutePickerActive && !isToRoutePickerActive && !isFromMeasurePickerActive
      }, 800)
    }
  }

  React.useEffect(() => {
    // when new fromRoute is selected, set toRoute to the same
    if (isFrom && canSpanRoutes && (routeInfo.toRouteId.length < 1 && routeInfo.toRouteName.length < 1) && routeInfo.validRoute) {
      const updateRouteInfo = { ...routeInfo, toRouteId: routeInfo.routeId, toRouteName: routeInfo.routeName }
      onRouteInfoUpdated(updateRouteInfo)
    }
    if (!isFrom && !canSpanRoutes) {
      if (network && !network.useRouteName && !routeInfo.routeId.length && routeInfo.validToRoute) {
        setToSearchValue(routeInfo.routeId)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo.routeId, routeInfo.routeName])

  React.useEffect(() => {
    // when new line is selected for from route, clear out to route
    if (canSpanRoutes && !revalidateRouteFromDataAction && !useEndMeasure) {
      if (isFrom) {
        const updateRouteInfo = { ...routeInfo, toRouteId: routeInfo.routeId, toRouteName: routeInfo.routeName, selectedToMeasure: NaN, selectedToPoint: null }
        onRouteInfoUpdated(updateRouteInfo)
      } else {
        clearPickedGraphic()
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo.lineId])

  const revalidateFields = (validateRoute = true, validateMeasure = true) => {
    if (!revalidateRouteFromDataAction) {
      setTimeout(() => {
        // If resetting then we need to enable the inputs to allow validation to occur
        if (reset) {
          searchInputRef.current.disabled = false
          if (!hideMeasures) {
            measureInputRef.current.disabled = false
          }
        }

        if (validateRoute && searchInputRef.current) {
          searchInputRef.current.select()
          focusElementInKeyboardMode(searchInputRef.current, true)
          searchInputRef.current.blur()
        }

        if (validateMeasure && !hideMeasures && measureInputRef.current) {
          const state = measureInputRef.current.disabled
          measureInputRef.current.disabled = false
          focusElementInKeyboardMode(measureInputRef.current, true)
          measureInputRef.current.blur()
          measureInputRef.current.disabled = state
        }

        if (reset) {
          searchInputRef.current.disabled = !isFrom
          if (!hideMeasures) {
            measureInputRef.current.disabled = true
          }
        }
      }, 600)
    }
  }

  const setInputMeasure = (value: string) => {
    if (isFrom) {
      setFromMeasureInput(value)
    } else {
      setToMeasureInput(value)
    }
  }

  const handleMultiRouteSelect = React.useCallback((routeInfos: RouteInfo[]) => {
    if (routeInfos.length) {
      setIsPopupOpen(true)
      setRouteInfos(routeInfos)
    }
  }, [])

  const handlePopupSelect = React.useCallback((routeInfo: RouteInfo) => {
    if (isDefined(routeInfo)) {
      routeInfo.selectedFromDate = routeInfo.fromDate
      routeInfo.selectedToDate = routeInfo.toDate
      onRouteInfoUpdated(routeInfo, true)
      revalidateFields()
    }
    setIsPopupOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRouteInfoUpdated])

  const handlePopupCancel = React.useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  return (
    <div className='route-and-measure-form d-flex w-100 pt-1 px-3'>
      {network && (
        <div className='w-100'>
          <Label size="sm" className='w-100 title3' centric style={{ padding: 0, paddingTop: 5, width: 100 }} >
            {isFrom ? !network.useRouteName ? getI18nMessage('fromRouteIdLabel') : getI18nMessage('fromRouteNameLabel') : !network.useRouteName ? getI18nMessage('toRouteIdLabel') : getI18nMessage('toRouteNameLabel')}
          </Label>
          <div ref={searchConRef} className='d-flex w-100' style={{ paddingBottom: 3 }} >
            <TextInput
              type='text'
              className='w-100'
              size='sm'
              allowClear
              disabled={!isDefined(networkDS) || (!isFrom && (canSpanRoutes ? (routeInfo.routeId.length < 1 && routeInfo.routeName.length < 1 && routeInfo.toRouteId.length < 1 && routeInfo.toRouteName.length < 1) : true))}
              onBlur={handleInputBlur}
              value={isFrom ? fromSearchValue || '' : toSearchValue || ''}
              ref={searchInputRef}
              onChange={onRouteChange}
              checkValidityOnAccept={validateRouteIdOrName}
            />
            {(isFrom ? fromSearchValue : toSearchValue) && <Intellisense
              isOpen={checkIsOpenSuggestionPopper()}
              reference={searchConRef}
              searchText={isFrom ? fromSearchValue : toSearchValue}
              searchSuggestion={searchSuggestion}
              onRecordItemClick={onSuggestionItemClick}
              id={widgetId}
              searchInputRef={searchInputRef}
            />
            }
            <RoutePicker
              type='route-measure'
              active={isFrom ? routeMeasurePickerInfo.fromRoutePickerActive : routeMeasurePickerInfo.toRoutePickerActive}
              networkDs={networkDS}
              network={network}
              routeInfo={routeInfo}
              disabled={!isDefined(networkDS) || (!isFrom && (canSpanRoutes ? (routeInfo.routeId?.length < 1 && routeInfo.routeName?.length < 1) : true))}
              jimuMapView={jimuMapView}
              symbolColor={null}
              hoverGraphic={hoverGraphic}
              onActiveChange={isFrom ? handleFromRoutePickerIsActive : handleToRoutePickerIsActive}
              onRouteInfoUpdated={handleRouteInfoUpdate }
              onMultiRouteSelect={handleMultiRouteSelect }
              isFrom={isFrom}
              canSpanRoutes={canSpanRoutes}
              useRouteStartMeasure={useStartMeasure}
              useRouteEndMeasure={useEndMeasure}
            />
          </div>
          {!hideMeasures && (
            <div>
              <Label size="sm" className='w-100 title3' centric style={{ padding: 0, paddingTop: 5, width: 100 }} >
                {isFrom ? getI18nMessage('fromMeasureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) }) : getI18nMessage('toMeasureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) })}
              </Label>
              <div className='d-flex w-100'>
                <TextInput
                  ref={measureInputRef}
                  aria-label={isFrom ? getI18nMessage('fromMeasureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) }) : getI18nMessage('toMeasureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) })}
                  className='w-100'
                  size='sm'
                  value={isFrom ? fromMeasureInput : toMeasureInput}
                  disabled={!isDefined(networkDS) || (isFrom ? useStartMeasure : useEndMeasure) || (isFrom ? (routeInfo.routeId.length < 1 && routeInfo.routeName?.length < 1) : (routeInfo.toRouteId.length < 1 && routeInfo.toRouteName?.length < 1))}
                  onChange={(evt) => { setInputMeasure(evt.target.value) }}
                  checkValidityOnAccept={validateMeasure}
                />
                <RoutePicker
                  type='measure'
                  active={isFrom ? routeMeasurePickerInfo.fromMeasurePickerActive : routeMeasurePickerInfo.toMeasurePickerActive}
                  networkDs={networkDS}
                  network={network}
                  routeInfo={routeInfo}
                  disabled={!isDefined(networkDS) || (isFrom ? useStartMeasure : useEndMeasure) || (isFrom ? (routeInfo.routeId.length < 1 && routeInfo.routeName?.length < 1) : (routeInfo.toRouteId.length < 1 && routeInfo.toRouteName?.length < 1))}
                  jimuMapView={jimuMapView}
                  symbolColor={null}
                  hoverGraphic={hoverGraphic}
                  onActiveChange={isFrom ? handleFromMeasurePickerIsActive : handleToMeasurePickerIsActive}
                  onRouteInfoUpdated={handleRouteInfoUpdate }
                  onMultiRouteSelect={handleMultiRouteSelect }
                  isFrom={isFrom}
                  canSpanRoutes={canSpanRoutes}
                />
              </div>
            </div>
          )}
          <RoutePickerPopup
              isOpen={isPopupOpen}
              routeInfos={routeInfos}
              useRouteName={network.useRouteName}
              onRouteSelect={handlePopupSelect}
              onRouteSelectCancel={handlePopupCancel}
              isFrom={isFrom}
              measurePrecision={network.measurePrecision}
              jimuMapView={jimuMapView}
              graphicLayer={hoverGraphic}
          />
        </div>
      )}
    </div>
  )
}
