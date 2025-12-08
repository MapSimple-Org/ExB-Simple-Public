import {
  atOrBetween,
  atOrBefore,
  atOrAfter,
  isDefined,
  type ConcurrenciesResponse,
  QueryRouteConcurrencies,
  type Concurrency,
  getRoutesByRouteIds,
  type RouteMapInfo,
  type LrsAttributesInfo,
  type DateRange,
  queryAllRoutesByLineIdAndFromDate,
  getPolylineStartEndMValues
} from 'widgets/shared-code/lrs'
import { round } from 'lodash-es'

export interface ConcurrenciesResult {
  newResponse: ConcurrenciesResponse
  response: ConcurrenciesResponse
  concurrenciesAdded: boolean
  dateRanges: DateRange[]
}

export async function getLineConcurrencies (routeInfo, network, networkDS): Promise<ConcurrenciesResult> {
  // Check for concurrencies
  const infos: LrsAttributesInfo[] = []
  if (routeInfo.routeId !== routeInfo.toRouteId) {
    const routeIdField = network.routeIdFieldSchema.jimuName
    const lineOrderField = network.lineOrderFieldSchema.jimuName

    // store all of the route features in a dictionary.  Key is routeId, value is RouteInfo object
    const results = await queryAllRoutesByLineIdAndFromDate(routeInfo.lineId, network, networkDS, routeInfo.selectedFromDate)
    if (isDefined(results)) {
      const sortedFeatures = results.features.sort((a, b) => a.attributes[lineOrderField] - b.attributes[lineOrderField])
      sortedFeatures.forEach((feature) => {
          const startEndMeasures = getPolylineStartEndMValues(feature.geometry)
          if (feature.attributes[routeIdField] === routeInfo.routeId && startEndMeasures.length === 2) {
            const info: LrsAttributesInfo = {
              routeId: feature.attributes[routeIdField],
              fromMeasure: routeInfo.selectedMeasure,
              toMeasure: startEndMeasures[1]
            }
            infos.push(info)
          } else if (feature.attributes[routeIdField] === routeInfo.toRouteId && startEndMeasures.length === 2) {
            const info: LrsAttributesInfo = {
              routeId: feature.attributes[routeIdField],
              fromMeasure: startEndMeasures[0],
              toMeasure: routeInfo.selectedToMeasure
            }
            infos.push(info)
          } else if (feature.attributes[lineOrderField] > sortedFeatures[0].attributes[lineOrderField] &&
            feature.attributes[lineOrderField] < sortedFeatures[sortedFeatures.length - 1].attributes[lineOrderField]
          ) {
            const info: LrsAttributesInfo = {
              routeId: feature.attributes[routeIdField],
              fromMeasure: startEndMeasures[0],
              toMeasure: startEndMeasures[1]
            }
            infos.push(info)
          }
      })
    }
  } else {
    const info: LrsAttributesInfo = {
      routeId: routeInfo.routeId,
      fromMeasure: routeInfo.selectedMeasure,
      toMeasure: routeInfo.selectedToMeasure
    }
    infos.push(info)
  }

  const fromDate: Date = routeInfo.selectedFromDate
  const toDate: Date = !isDefined(routeInfo.selectedToDate) ? new Date(253402300799999) : routeInfo.selectedToDate
  const response:ConcurrenciesResponse = await QueryRouteConcurrencies(networkDS, network, fromDate, toDate, infos)

  const dates: Date[] = []
  let addSelectedFromDate: boolean = true
  let addSelectedToDate: boolean = true
  const routeIds:string[] = []

  response?.locations.forEach((location) => {
    if (!routeIds.includes(location.routeId)) {
      routeIds.push(location.routeId)
    }
    location.concurrencies.forEach((concurrency) => {
      if (!routeIds.includes(concurrency.routeId)) {
        routeIds.push(concurrency.routeId)
      }
      concurrency.isChosen = concurrency.isDominant
      concurrency.isAdded = false

      // Reverse From and To measures if response has From measure greater than To measure
      if (concurrency.fromMeasure > concurrency.toMeasure) {
        const fromM = concurrency.fromMeasure
        concurrency.fromMeasure = concurrency.toMeasure
        concurrency.toMeasure = fromM
      }

      if (isDefined(concurrency.fromDate) && !dates.includes(concurrency.fromDate)) {
        if (!isDefined(routeInfo.selectedFromDate) || concurrency.fromDate >= routeInfo.selectedFromDate) {
          dates.push(concurrency.fromDate)
        }

        if (isDefined(routeInfo.selectedFromDate) && concurrency.fromDate === routeInfo.selectedFromDate.getTime()) {
          addSelectedFromDate = false
        }
      }
      if (isDefined(concurrency.toDate) && !dates.includes(concurrency.toDate)) {
        if (!isDefined(routeInfo.selectedToDate) || concurrency.toDate <= routeInfo.selectedToDate) {
          dates.push(concurrency.toDate)
        }

        if (isDefined(routeInfo.selectedToDate) && concurrency.toDate === routeInfo.selectedToDate.getTime()) {
          addSelectedToDate = false
        }
      }
    })
  })

  if (addSelectedFromDate && isDefined(routeInfo.selectedFromDate) && !dates.includes(routeInfo.selectedFromDate)) {
    const date = new Date(routeInfo.selectedFromDate.getFullYear(), routeInfo.selectedFromDate.getMonth(), routeInfo.selectedFromDate.getDate())
    dates.push(date)
  }

  if (addSelectedToDate && isDefined(routeInfo.selectedToDate) && !dates.includes(routeInfo.selectedToDate)) {
    const date = new Date(routeInfo.selectedToDate.getFullYear(), routeInfo.selectedToDate.getMonth(), routeInfo.selectedToDate.getDate())
    dates.push(date)
  }

  dates.sort((a, b) => Number(a) - Number(b))

  if (!isDefined(routeInfo.selectedToDate)) {
    dates.push(null)
  }

  const dateRanges: DateRange[] = []
  for (let i = 0; i < dates.length - 1; i++) {
    const dateRange: DateRange = {
      fromDate: dates[i],
      toDate: dates[i + 1]
    }
    dateRanges.push(dateRange)
  }

  const routeIdToNameAndLineId = new Map<string, RouteMapInfo>()

  if (routeIds.length > 0 && (network?.useRouteName || network?.supportsLines)) {
    const isValid = getRoutesByRouteIds(routeIds, network, networkDS)
    await Promise.all([isValid]).then((results) => {
      const queryResults = results?.[0]

      if (isDefined(queryResults)) {
        queryResults.features.forEach((feature) => {
          const routeMapInfo: RouteMapInfo = {}

          if (network?.useRouteName) {
            routeMapInfo.routeName = feature.attributes[network.routeNameFieldSchema.jimuName]
          }
          if (network?.supportsLines) {
            routeMapInfo.lineId = feature.attributes[network.lineIdFieldSchema.jimuName]
          }

          const routeId: string = feature.attributes[network.routeIdFieldSchema.jimuName]
          if (!routeIdToNameAndLineId.has(routeId)) {
            routeIdToNameAndLineId.set(routeId, routeMapInfo)
          }
        })
      }
    })
  }

  const newResponse: ConcurrenciesResponse = { locations: [] }

  if (routeInfo.routeId === routeInfo.toRouteId) {
    newResponse.locations.push({
      routeId: response?.locations[0].routeId,
      fromMeasure: response?.locations[0].fromMeasure,
      toMeasure: response?.locations[0].toMeasure,
      concurrencies: []
    })
  } else {
    response?.locations.forEach((loc) => {
      newResponse.locations.push({
        routeId: loc.routeId,
        fromMeasure: round(loc.fromMeasure, network.measurePrecision),
        toMeasure: round(loc.toMeasure, network.measurePrecision),
        concurrencies: []
      })
    })
  }

  let concurrenciesAdded: boolean = false
  dateRanges.forEach((dateRange) => {
    response?.locations.forEach((location, locationIndex) => {
      let hasSelectedDateRangeConcurrencies: boolean = false
      let previousToMeasure: number
      location.concurrencies.sort((a, b) => a.fromMeasure - b.fromMeasure)

      location.concurrencies.forEach((concurrency, index) => {
        if ((!isDefined(concurrency.fromDate) || (isDefined(dateRange.fromDate) && concurrency.fromDate <= dateRange.fromDate)) &&
        (!isDefined(concurrency.toDate) || (isDefined(dateRange.toDate) && dateRange.toDate <= concurrency.toDate))) {

          if (concurrency.routeId === location.routeId) {
            if (!isDefined(previousToMeasure)) {
              if (round(location.fromMeasure, network.measurePrecision) !== round(concurrency.fromMeasure, network.measurePrecision)) {
                // first measure range for the selected route that concurrencies don't cover
                const newConcurrency: Concurrency = {
                  routeId: location.routeId,
                  fromMeasure: round(location.fromMeasure, network.measurePrecision),
                  toMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                  fromDate: dateRange.fromDate,
                  toDate: dateRange.toDate,
                  sectionId: index * -1,
                  isDominant: true,
                  isChosen: true,
                  isAdded: true
                }
                newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                concurrenciesAdded = true
              }
              const newConcurrency: Concurrency = {
                routeId: concurrency.routeId,
                fromMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                toMeasure: round(concurrency.toMeasure, network.measurePrecision),
                fromDate: dateRange.fromDate,
                toDate: dateRange.toDate,
                sectionId: concurrency.sectionId,
                isDominant: concurrency.isDominant,
                isChosen: concurrency.isDominant,
                isAdded: false
              }
              newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
              hasSelectedDateRangeConcurrencies = true
              concurrenciesAdded = true
              previousToMeasure = round(concurrency.toMeasure, network.measurePrecision)
            } else {
              if (previousToMeasure !== round(concurrency.fromMeasure, network.measurePrecision)) {
                // middle measure range(s) for the selected route that concurrencies don't cover

                if (routeInfo.selectedPolyline.paths.length > 1) {
                  // break the coverage based on gaps if exist
                  for (let i = 0; i < routeInfo.selectedPolyline.paths.length; i++) {
                    const path = routeInfo.selectedPolyline.paths[i]
                    if (path.length > 0) {
                      const mIndex = path[0].length-1
                      const startM = path[0][mIndex]
                      const endM = path[path.length-1][mIndex]

                      if (atOrBetween([startM, endM], previousToMeasure, network.mTolerance) &&
                        atOrBetween([startM, endM], concurrency.fromMeasure, network.mTolerance)) {
                        // No need to break coverage since no gap
                        const newConcurrency: Concurrency = {
                          routeId: location.routeId,
                          fromMeasure: previousToMeasure,
                          toMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                          fromDate: dateRange.fromDate,
                          toDate: dateRange.toDate,
                          sectionId: -Number.MAX_VALUE,
                          isDominant: true,
                          isChosen: true,
                          isAdded: true
                        }
                        newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                        break
                      } else if (atOrBetween([startM, endM], previousToMeasure, network.mTolerance) &&
                        previousToMeasure !== round(endM, network.measurePrecision)) {
                        const newConcurrency: Concurrency = {
                          routeId: location.routeId,
                          fromMeasure: previousToMeasure,
                          toMeasure: round(endM, network.measurePrecision),
                          fromDate: dateRange.fromDate,
                          toDate: dateRange.toDate,
                          sectionId: index * -1,
                          isDominant: true,
                          isChosen: true,
                          isAdded: true
                        }
                        newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                      } else if (atOrBetween([startM, endM], concurrency.fromMeasure, network.mTolerance) &&
                        round(startM, network.measurePrecision) !== round(concurrency.fromMeasure, network.measurePrecision)) {
                        const newConcurrency: Concurrency = {
                          routeId: location.routeId,
                          fromMeasure: round(startM, network.measurePrecision),
                          toMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                          fromDate: dateRange.fromDate,
                          toDate: dateRange.toDate,
                          sectionId: index * -1,
                          isDominant: true,
                          isChosen: true,
                          isAdded: true
                        }
                        newResponse.locations[locationIndex].concurrencies.push(newConcurrency)

                      } else if (atOrBefore(previousToMeasure, startM, network.mTolerance) &&
                          atOrAfter(concurrency.fromMeasure, endM, network.mTolerance)) {
                        const newConcurrency: Concurrency = {
                          routeId: location.routeId,
                          fromMeasure: round(startM, network.measurePrecision),
                          toMeasure: round(endM, network.measurePrecision),
                          fromDate: dateRange.fromDate,
                          toDate: dateRange.toDate,
                          sectionId: index * -1,
                          isDominant: true,
                          isChosen: true,
                          isAdded: true
                        }
                        newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                      }
                    }
                  }
                } else {
                  // No need to break coverage since no gap
                  const newConcurrency: Concurrency = {
                    routeId: location.routeId,
                    fromMeasure: previousToMeasure,
                    toMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                    fromDate: dateRange.fromDate,
                    toDate: dateRange.toDate,
                    sectionId: index * -1,
                    isDominant: true,
                    isChosen: true,
                    isAdded: true
                  }
                  newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                }
                concurrenciesAdded = true
              }
              const newConcurrency: Concurrency = {
                routeId: concurrency.routeId,
                fromMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                toMeasure: round(concurrency.toMeasure, network.measurePrecision),
                fromDate: dateRange.fromDate,
                toDate: dateRange.toDate,
                sectionId: concurrency.sectionId,
                isDominant: concurrency.isDominant,
                isChosen: concurrency.isDominant,
                isAdded: false
              }
              newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
              hasSelectedDateRangeConcurrencies = true
              concurrenciesAdded = true
              previousToMeasure = round(concurrency.toMeasure, network.measurePrecision)
            }
          } else {
            const newConcurrency: Concurrency = {
              routeId: concurrency.routeId,
              fromMeasure: round(concurrency.fromMeasure, network.measurePrecision),
              toMeasure: round(concurrency.toMeasure, network.measurePrecision),
              fromDate: dateRange.fromDate,
              toDate: dateRange.toDate,
              sectionId: concurrency.sectionId,
              isDominant: concurrency.isDominant,
              isChosen: concurrency.isDominant,
              isAdded: false
            }
            newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
            hasSelectedDateRangeConcurrencies = true
            concurrenciesAdded = true
          }
        }
      })

      // last measure range for the selected route that concurrencies don't cover
      if (isDefined(previousToMeasure) && previousToMeasure !== round(location.toMeasure, network.measurePrecision)) {

        if (routeInfo.selectedPolyline.paths.length > 1) {
          // break the coverage based on gaps if exist
          for (let i = 0; i < routeInfo.selectedPolyline.paths.length; i++) {
            const path = routeInfo.selectedPolyline.paths[i]
            if (path.length > 0) {
              const mIndex = path[0].length-1
              const startM = path[0][mIndex]
              const endM = path[path.length-1][mIndex]

              if (atOrBetween([startM, endM], previousToMeasure, network.mTolerance) &&
                atOrBetween([startM, endM], location.toMeasure, network.mTolerance)) {
                // No need to break coverage since no gap
                const newConcurrency: Concurrency = {
                  routeId: location.routeId,
                  fromMeasure: previousToMeasure,
                  toMeasure: round(location.toMeasure, network.measurePrecision),
                  fromDate: dateRange.fromDate,
                  toDate: dateRange.toDate,
                  sectionId: -Number.MAX_VALUE,
                  isDominant: true,
                  isChosen: true,
                  isAdded: true
                }
                newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                break
              } else if (atOrBetween([startM, endM], previousToMeasure, network.mTolerance) &&
                previousToMeasure !== round(endM, network.measurePrecision)) {

                const newConcurrency: Concurrency = {
                  routeId: location.routeId,
                  fromMeasure: previousToMeasure,
                  toMeasure: round(endM, network.measurePrecision),
                  fromDate: dateRange.fromDate,
                  toDate: dateRange.toDate,
                  sectionId: -Number.MAX_VALUE,
                  isDominant: true,
                  isChosen: true,
                  isAdded: true
                }
                newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
              } else if (atOrBetween([startM, endM], location.toMeasure, network.mTolerance) &&
                round(startM, network.measurePrecision) !== round(location.toMeasure, network.measurePrecision)) {

                const newConcurrency: Concurrency = {
                  routeId: location.routeId,
                  fromMeasure: round(startM, network.measurePrecision),
                  toMeasure: round(location.toMeasure, network.measurePrecision),
                  fromDate: dateRange.fromDate,
                  toDate: dateRange.toDate,
                  sectionId: -Number.MAX_VALUE,
                  isDominant: true,
                  isChosen: true,
                  isAdded: true
                }
                newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
              } else if (atOrBefore(previousToMeasure, startM, network.mTolerance) &&
                  atOrAfter(location.toMeasure, endM, network.mTolerance)) {

                const newConcurrency: Concurrency = {
                  routeId: location.routeId,
                  fromMeasure: round(startM, network.measurePrecision),
                  toMeasure: round(endM, network.measurePrecision),
                  fromDate: dateRange.fromDate,
                  toDate: dateRange.toDate,
                  sectionId: -Number.MAX_VALUE,
                  isDominant: true,
                  isChosen: true,
                  isAdded: true
                }
                newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
              }
              concurrenciesAdded = true
            }
          }
        } else {
          // No need to break coverage since no gap
          const newConcurrency: Concurrency = {
            routeId: location.routeId,
            fromMeasure: previousToMeasure,
            toMeasure: round(location.toMeasure, network.measurePrecision),
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
            sectionId: -Number.MAX_VALUE,
            isDominant: true,
            isChosen: true,
            isAdded: true
          }
          newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
        }
        hasSelectedDateRangeConcurrencies = true
        concurrenciesAdded = true
      }

      // measure range for the selected route and date range that have no concurrencies
      if (!hasSelectedDateRangeConcurrencies) {
        const newConcurrency: Concurrency = {
          routeId: location.routeId,
          fromMeasure: round(location.fromMeasure, network.measurePrecision),
          toMeasure: round(location.toMeasure, network.measurePrecision),
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate,
          sectionId: -Number.MAX_VALUE,
          isDominant: true,
          isChosen: true,
          isAdded: true
        }
        newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
        concurrenciesAdded = true
      }
    })
  })

  if (routeIdToNameAndLineId.size > 0) {
    newResponse?.locations.forEach((location) => {
      const routeMapInfo: RouteMapInfo = routeIdToNameAndLineId.get(location.routeId)
      location.routeName = routeMapInfo.routeName
      location.lineId = routeMapInfo.lineId

      location.concurrencies.forEach((concurrency) => {
        const routeMapInfo: RouteMapInfo = routeIdToNameAndLineId.get(concurrency.routeId)
        concurrency.routeName = routeMapInfo.routeName
        concurrency.lineId = routeMapInfo.lineId
      })
    })
  }

  const concurrenciesresult: ConcurrenciesResult = {
    newResponse: newResponse,
    response: response,
    concurrenciesAdded: concurrenciesAdded,
    dateRanges: dateRanges
  }

  return concurrenciesresult
}