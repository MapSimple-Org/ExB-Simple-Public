
import { isDefined, getDateWithoutTime } from '../../../../../shared-code/lib/lrs/utilities/utils'
import defaultMessages from '../translations/default'
import { round } from 'lodash-es'

  export function validateDateUtil (date: Date, isFromDate: boolean, routeInfo, fromDateToolTip, toDateToolTip, intl) {
    const dateInfo = {
      setFromDateStatus: '',
      setToDateStatus: '',
      setFromDateToolTip: '',
      setToDateToolTip: '',
      validDate: true
    }
    const selectedDate = date
    if (!isDefined(selectedDate)) {
      isFromDate ? dateInfo.setFromDateStatus = 'idle' : dateInfo.setToDateStatus = 'idle'
      isFromDate ? dateInfo.setFromDateToolTip = '' : dateInfo.setToDateToolTip = ''
      return dateInfo
    }

    const selectedDateWithoutTime: Date = getDateWithoutTime(selectedDate)
    const routeInfoFromDateWithoutTime: Date = getDateWithoutTime(routeInfo?.fromDate)
    const routeInfoToDateWithoutTime: Date = getDateWithoutTime(routeInfo?.toDate)
    const routeInfoSelectedFromDateWithoutTime: Date = getDateWithoutTime(routeInfo?.selectedFromDate)
    const routeInfoSelectedToDateWithoutTime: Date = getDateWithoutTime(routeInfo?.selectedToDate)
    const routeInfoToRouteFromDateWithoutTime: Date = getDateWithoutTime(routeInfo?.toRouteFromDate)
    const routeInfoToRouteToDateWithoutTime: Date = getDateWithoutTime(routeInfo?.toRouteToDate)

    // Check if selected date is before the routes from date.
    if (isDefined(routeInfo?.fromDate)) {
      if (selectedDateWithoutTime < routeInfoFromDateWithoutTime) {
        isFromDate ? dateInfo.setFromDateStatus = 'invalid' : dateInfo.setToDateStatus ='invalid'
        isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidFromDateBefore', defaultMessage: defaultMessages.invalidFromDateBefore}) :
            dateInfo.setToDateToolTip = intl.formatMessage({id:'invalidToDateBefore', defaultMessage: defaultMessages.invalidToDateBefore})
        dateInfo.validDate = false
        return dateInfo
      }
    }

    // Check if the selected date is before the to routes from date
    // Verify that the selected date is not before the to route from date.
    if (isDefined(routeInfo?.toRouteFromDate)) {
      if (selectedDateWithoutTime < routeInfoToRouteFromDateWithoutTime) {
        isFromDate ? dateInfo.setFromDateStatus ='invalid' : dateInfo.setToDateStatus ='invalid'
        isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id:'invalidFromDateBefore', defaultMessage: defaultMessages.invalidFromDateBefore}) :
        dateInfo.setToDateToolTip = intl.formatMessage({id:'invalidToDateBefore', defaultMessage: defaultMessages.invalidToDateBefore})
        dateInfo.validDate = false
        return dateInfo
      }
    }

    // Check if the selected date is after the routes to date.
    if (isDefined(routeInfo?.toDate)) {
      if (selectedDateWithoutTime > routeInfoToDateWithoutTime) {
        isFromDate ? dateInfo.setFromDateStatus = 'invalid' : dateInfo.setToDateStatus = 'invalid'
        isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidFromDateAfter', defaultMessage: defaultMessages.invalidFromDateAfter}) :
        dateInfo.setToDateToolTip = intl.formatMessage({id: 'invalidToDateAfter', defaultMessage: defaultMessages.invalidToDateAfter})
        dateInfo.validDate = false
        return dateInfo
      }
    }

    // Check if the selected date is after the to routes to date.
    // Verify that the selected date is not after the to route to date.
    if (isDefined(routeInfo?.toRouteToDate)) {
      if (selectedDateWithoutTime > routeInfoToRouteToDateWithoutTime) {
        isFromDate ? dateInfo.setFromDateStatus = 'invalid' : dateInfo.setToDateStatus = 'invalid'
        isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidFromDateAfter', defaultMessage: defaultMessages.invalidFromDateAfter}) :
        dateInfo.setToDateToolTip = intl.formatMessage({id: 'invalidToDateAfter', defaultMessage: defaultMessages.invalidToDateAfter})
        dateInfo.validDate = false
        return dateInfo
      }
    }

    // From date is greater than to date
    if (isDefined(routeInfo?.selectedToDate)) {
      if (isFromDate) {
        if (selectedDateWithoutTime > routeInfoSelectedToDateWithoutTime) {
          dateInfo.setFromDateStatus = 'invalid'
          isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidDatesOrder', defaultMessage: defaultMessages.invalidDatesOrder}) :
          dateInfo.setToDateToolTip = intl.formatMessage({id: 'invalidDatesOrder', defaultMessage: defaultMessages.invalidDatesOrder})
          dateInfo.validDate = false
        }
        // see if we need to clear toDate error
        if (toDateToolTip === intl.formatMessage({id: 'invalidDatesOrder', defaultMessage: defaultMessages.invalidDatesOrder})) {
          if (selectedDateWithoutTime < routeInfoSelectedToDateWithoutTime) {
            dateInfo.setToDateStatus = 'idle'
            dateInfo.setToDateToolTip = ''
          }
        // see if this fixes to date error where dates were same
        } else if (toDateToolTip === intl.formatMessage({id: 'invalidDatesSameDay', defaultMessage: defaultMessages.invalidDatesSameDay})) {
          if (selectedDateWithoutTime !== routeInfoSelectedFromDateWithoutTime) {
            dateInfo.setToDateStatus = 'idle'
            dateInfo.setToDateToolTip = ''
          }
        }
      }
    }

    // From date and to date are equal
    if (isDefined(routeInfo?.selectedToDate)) {
      if (isFromDate && selectedDateWithoutTime.getTime() === routeInfoSelectedToDateWithoutTime.getTime()) {
        dateInfo.setFromDateStatus = 'invalid'
        isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidDatesSameDay', defaultMessage: defaultMessages.invalidDatesSameDay}) :
        dateInfo.setToDateToolTip = intl.formatMessage({id: 'invalidDatesSameDay', defaultMessage: defaultMessages.invalidDatesSameDay})
        dateInfo.validDate = false
      }
    }

    // To date is less than from date
    if (isDefined(routeInfo?.selectedFromDate)) {
      if (!isFromDate) {
        if (selectedDateWithoutTime < routeInfoSelectedFromDateWithoutTime) {
          dateInfo.setToDateStatus = 'invalid'
          isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidDatesOrder', defaultMessage: defaultMessages.invalidDatesOrder}) :
          dateInfo.setToDateToolTip = intl.formatMessage({id: 'invalidDatesOrder', defaultMessage: defaultMessages.invalidDatesOrder})
          dateInfo.validDate = false
        }
        // see if we need to clear from date error
        if (fromDateToolTip === intl.formatMessage({id: 'invalidDatesOrder', defaultMessage: defaultMessages.invalidDatesOrder})) {
          if (selectedDateWithoutTime > routeInfoSelectedFromDateWithoutTime) {
            dateInfo.setFromDateStatus = 'idle'
            dateInfo.setFromDateToolTip = ''
          }
        // see if we need to clear from date equals error
        } else if (fromDateToolTip === intl.formatMessage({id: 'invalidDatesSameDay', defaultMessage: defaultMessages.invalidDatesSameDay})) {
          if (selectedDateWithoutTime !== routeInfoSelectedFromDateWithoutTime) {
            dateInfo.setFromDateStatus = 'idle'
            dateInfo.setFromDateToolTip = ''
          }
        }
      }
    }

    // To date and from date are equal
    if (isDefined(routeInfo?.selectedFromDate)) {
      if (!isFromDate && selectedDateWithoutTime.getTime() === routeInfoSelectedFromDateWithoutTime.getTime()) {
        dateInfo.setToDateStatus = 'invalid'
        isFromDate ? dateInfo.setFromDateToolTip = intl.formatMessage({id: 'invalidDatesSameDay', defaultMessage: defaultMessages.invalidDatesSameDay}) :
        dateInfo.setToDateToolTip = intl.formatMessage({id: 'invalidDatesSameDay', defaultMessage: defaultMessages.invalidDatesSameDay})
        dateInfo.validDate = false
      }
    }

    if (dateInfo.validDate) {
      isFromDate ? dateInfo.setFromDateStatus = 'idle' : dateInfo.setToDateStatus = 'idle'
      isFromDate ? dateInfo.setFromDateToolTip = '' : dateInfo.setToDateToolTip =''
    }

    return dateInfo
  }

  export function isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork) {

    if (!isDefined(routeInfo)) {
      return false
    }

    let isValid = true
    isValid = isValid && routeInfo.routeId?.length > 0
    isValid = isValid && routeInfo.toRouteId?.length > 0

    if (!isDefined(selectedNetwork) || !isDefined(selectedNetwork.networkInfo)) {
      return false
    }
    const fromMeasure = round(routeInfo.fromMeasure, selectedNetwork.networkInfo.measurePrecision)
    const toMeasure = round(routeInfo.toMeasure, selectedNetwork.networkInfo.measurePrecision)
    const selectedFromMeasure = round(routeInfo.selectedMeasure, selectedNetwork.networkInfo.measurePrecision)
    const selectedToMeasure = round(routeInfo.selectedToMeasure, selectedNetwork.networkInfo.measurePrecision)

    if (!isNaN(fromMeasure) && !isNaN(selectedFromMeasure)) {
      isValid = isValid && selectedFromMeasure >= fromMeasure
    } else {
      // No route selected or no measure on selected route.
      return false
    }

    if (!eventInfo?.canSpanRoutes) {
      if (!isNaN(toMeasure) && !isNaN(selectedToMeasure)) {
        isValid = isValid && selectedToMeasure <= toMeasure
      } else {
        // No route selected or no measure on selected route.
        return false
      }
    } else {
      const toRouteFromMeasure = round(routeInfo.toRouteFromMeasure, selectedNetwork.networkInfo.measurePrecision)
      const toRouteToMeasure = round(routeInfo.toRouteToMeasure, selectedNetwork.networkInfo.measurePrecision)
      if (!isNaN(toRouteFromMeasure) && !isNaN(selectedToMeasure)) {
        isValid = isValid && selectedToMeasure >= toRouteFromMeasure
      } else {
        // No route selected or no measure on selected route.
        return false
      }
      if (!isNaN(toRouteToMeasure) && !isNaN(selectedToMeasure)) {
        isValid = isValid && selectedToMeasure <= toRouteToMeasure
      } else {
        // No route selected or no measure on selected route.
        return false
      }
    }

    const routeInfoFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.fromDate)
    const routeInfoToDateWithoutTime: Date = getDateWithoutTime(routeInfo.toDate)
    const routeInfoSelectedFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedFromDate)
    const routeInfoSelectedToDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedToDate)

    if (
      isDefined(routeInfo.selectedFromDate) &&
      !isDefined(routeInfo.selectedToDate)
    ) {
      // Only from date provided.

      if (isDefined(routeInfo.fromDate)) {
        isValid = isValid && routeInfoSelectedFromDateWithoutTime >= routeInfoFromDateWithoutTime
      }
      if (isDefined(routeInfo.toDate)) {
        isValid = isValid && routeInfoSelectedFromDateWithoutTime < routeInfoToDateWithoutTime
      }
    }
    if (
      !isDefined(routeInfo.selectedFromDate) &&
      isDefined(routeInfo.selectedToDate)
    ) {
      // Only to date provided.
      if (isDefined(routeInfo.fromDate)) {
        isValid = isValid && routeInfoSelectedToDateWithoutTime >= routeInfoFromDateWithoutTime
      }
      if (isDefined(routeInfo.toDate)) {
        isValid = isValid && routeInfoSelectedToDateWithoutTime < routeInfoToDateWithoutTime
      }
    }
    if (
      isDefined(routeInfo.selectedFromDate) &&
      isDefined(routeInfo.selectedToDate)
    ) {
      // Both from and to date provided.
      isValid = isValid && routeInfoSelectedFromDateWithoutTime < routeInfoSelectedToDateWithoutTime
      if (isDefined(routeInfo.fromDate)) {
        isValid = isValid && routeInfoSelectedFromDateWithoutTime >= routeInfoFromDateWithoutTime
      }
      if (isDefined(routeInfo.toDate)) {
        isValid = isValid && routeInfoSelectedToDateWithoutTime <= routeInfoToDateWithoutTime
      }
    }
    if (
      !isDefined(routeInfo.selectedFromDate) &&
      !isDefined(routeInfo.selectedToDate)
    ) {
      // No date selected.
      return false
    }

    return isValid
  }

  export function isValidRouteSelectionUtil(routeInfo, selectedEvent, lockAquired, selectedNetwork) {

    if (!isDefined(routeInfo)) {
      return false
    }

    let isValid = true
    isValid = isValid && routeInfo.routeId?.length > 0
    isValid = isValid && routeInfo.toRouteId?.length > 0

    if (!lockAquired) {
      return false
    }

    if (!isDefined(selectedNetwork) || !isDefined(selectedNetwork.networkInfo)) {
      return false
    }
    const fromMeasure = round(routeInfo.fromMeasure, selectedNetwork.networkInfo.measurePrecision)
    const toMeasure = round(routeInfo.toMeasure, selectedNetwork.networkInfo.measurePrecision)
    const selectedFromMeasure = round(routeInfo.selectedMeasure, selectedNetwork.networkInfo.measurePrecision)
    const selectedToMeasure = round(routeInfo.selectedToMeasure, selectedNetwork.networkInfo.measurePrecision)

    if (!isNaN(fromMeasure) && !isNaN(selectedFromMeasure)) {
      isValid = isValid && selectedFromMeasure >= fromMeasure && (selectedFromMeasure < selectedToMeasure || routeInfo.routeId !== routeInfo.toRouteId)
    } else {
      // No route selected or no measure on selected route.
      return false
    }

    if (!selectedEvent.eventInfo?.canSpanRoutes) {
      if (!isNaN(toMeasure) && !isNaN(selectedToMeasure)) {
        isValid = isValid && selectedToMeasure <= toMeasure && (selectedFromMeasure < selectedToMeasure || routeInfo.routeId !== routeInfo.toRouteId)
      } else {
        // No route selected or no measure on selected route.
        return false
      }
    } else {
      const toRouteFromMeasure = round(routeInfo.toRouteFromMeasure, selectedNetwork.networkInfo.measurePrecision)
      const toRouteToMeasure = round(routeInfo.toRouteToMeasure, selectedNetwork.networkInfo.measurePrecision)
      if (!isNaN(toRouteFromMeasure) && !isNaN(selectedToMeasure)) {
        isValid = isValid && selectedToMeasure >= toRouteFromMeasure
      } else {
        // No route selected or no measure on selected route.
        return false
      }
      if (!isNaN(toRouteToMeasure) && !isNaN(selectedToMeasure)) {
        isValid = isValid && selectedToMeasure <= toRouteToMeasure
      } else {
        // No route selected or no measure on selected route.
        return false
      }
    }

    const routeInfoFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.fromDate)
    const routeInfoToDateWithoutTime: Date = getDateWithoutTime(routeInfo.toDate)
    const routeInfoSelectedFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedFromDate)
    const routeInfoSelectedToDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedToDate)
    const routeInfoToRouteFromDateWithoutTime: Date = getDateWithoutTime(routeInfo?.toRouteFromDate)
    const routeInfoToRouteToDateWithoutTime: Date = getDateWithoutTime(routeInfo?.toRouteToDate)

    // dates
    if (
      isDefined(routeInfo.selectedFromDate) &&
      !isDefined(routeInfo.selectedToDate)
    ) {
      // Only from date provided.
      if (isDefined(routeInfo.fromDate)) {
        isValid = isValid && routeInfoSelectedFromDateWithoutTime >= routeInfoFromDateWithoutTime
      }
      if (isDefined(routeInfo.toDate)) {
        isValid = isValid && routeInfoSelectedFromDateWithoutTime < routeInfoToDateWithoutTime
      }
    }
    if (
      !isDefined(routeInfo.selectedFromDate) &&
      isDefined(routeInfo.selectedToDate)
    ) {
      // Only to date provided.
      if (isDefined(routeInfo.fromDate)) {
        isValid = isValid && routeInfoSelectedToDateWithoutTime >= routeInfoFromDateWithoutTime
      }
      if (isDefined(routeInfo.toDate)) {
        isValid = isValid && routeInfoSelectedToDateWithoutTime < routeInfoToDateWithoutTime
      }
    }
    if (
      isDefined(routeInfo.selectedFromDate) &&
      isDefined(routeInfo.selectedToDate)
    ) {
      // Both from and to date provided.
      isValid = isValid && routeInfoSelectedFromDateWithoutTime < routeInfoSelectedToDateWithoutTime
      if (isDefined(routeInfo.fromDate)) {
        isValid = isValid && routeInfoSelectedFromDateWithoutTime >= routeInfoFromDateWithoutTime
      }
      if (isDefined(routeInfo.toDate)) {
        isValid = isValid && routeInfoSelectedToDateWithoutTime <= routeInfoToDateWithoutTime
      }
    }
    if (
      !isDefined(routeInfo.selectedFromDate) &&
      !isDefined(routeInfo.selectedToDate)
    ) {
      // No date selected.
      return false
    }
    // verify that both routes are within the selected date range
    if (routeInfo.routeId !== routeInfo.toRouteId) {
      if (isDefined(routeInfo.fromDate) && isDefined(routeInfo.toRouteFromDate)) {
        if (routeInfoSelectedFromDateWithoutTime < routeInfoFromDateWithoutTime || (isDefined(routeInfo.toDate) && routeInfoSelectedFromDateWithoutTime > routeInfoToDateWithoutTime) ||
          routeInfoSelectedFromDateWithoutTime < routeInfoToRouteFromDateWithoutTime || (isDefined(routeInfo.toRouteToDate) && routeInfoSelectedFromDateWithoutTime > routeInfoToRouteToDateWithoutTime)) {
          return false
        }
      }
    }

    return isValid
  }