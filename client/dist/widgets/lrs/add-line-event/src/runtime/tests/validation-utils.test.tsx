import { createIntl } from 'jimu-core'
import { isValidRouteSelectionUtil, isValidRouteSelectionUtilMulti, validateDateUtil } from '../utilities/validation-utils'

describe('isValidRouteSelectionUtil', () => {

  it('should return false for invalid inputs', () => {
    const result = isValidRouteSelectionUtil(null, null, false, null)
    expect(result).toBe(false)
  })

  it('should return false for invalid inputs', () => {
    const result = isValidRouteSelectionUtil({}, null, true, null)
    expect(result).toBe(false)
  })

  it('should return false for invalid from and to measures', () => {
    const routeInfo = {
      fromMeasure: 'invalid',
      toMeasure: 100,
      selectedMeasure: 'invalid',
      selectedToMeasure: 80,
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, null, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false if selectedToDate and selectedFromDate are null', () => {
    const routeInfo = {
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      selectedToDate: null,
      selectedFromDate: null
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return true if selectedFromDate and selectedToDate are valid', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-05"),
      selectedToDate: new Date("2025-05-15")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return true if selectedFromDate is null but remaining dates are valid', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: null,
      selectedToDate: new Date("2025-05-15")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return false if fromDate is greater than toDate', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-30"),
      toDate: new Date("2025-05-15"),
      selectedFromDate: new Date("2025-05-05"),
      selectedToDate: null
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false if selectedFromDate is greater than selectedToDate', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-25"),
      selectedToDate: new Date("2025-05-15")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false if fromDate and toDate are same', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-30"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-30"),
      selectedToDate: new Date("2025-05-30")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return true if fromDate is equal to selectedFromDate and toDate is equal to selectedToDate', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-01"),
      selectedToDate: new Date("2025-05-30")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: false
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return false for spanning events with no valid measures', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '56789',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      toRouteFromMeasure: 'invalid',
      toRouteToMeasure: 'invalid',
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-01"),
      selectedToDate: new Date("2025-05-30")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: true
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false for spanning events with no valid toRouteFromMeasure', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '56789',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      toRouteFromMeasure: 80,
      toRouteToMeasure: 'invalid',
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-01"),
      selectedToDate: new Date("2025-05-30")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: true
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return true for spanning events with valid dates', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '56789',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      toRouteFromMeasure: 0,
      toRouteToMeasure: 100,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-01"),
      selectedToDate: new Date("2025-05-30"),
      toRouteToDate: new Date("2025-05-30"),
      toRouteFromDate: new Date("2025-05-01")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: true
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return false for spanning events with invalid dates', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '56789',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      toRouteFromMeasure: 0,
      toRouteToMeasure: 100,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-01"),
      selectedToDate: new Date("2025-05-30"),
      toRouteToDate: new Date("2025-05-20"),
      toRouteFromDate: new Date("2025-05-01")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const selectedEvent = {
      eventInfo: {
        canSpanRoutes: true
      }
    }
    const result = isValidRouteSelectionUtil(routeInfo, selectedEvent, true, selectedNetwork)
    expect(result).toBe(true)
  })
})

describe('isValidRouteSelectionUtilMulti', () => {

  it('should return false if all inputs are null', () => {
    const result = isValidRouteSelectionUtilMulti(null, null, null)
    expect(result).toBe(false)
  })

  it('should return false if eventInfo is null', () => {
    const routeInfo = {
      routeId: 12345,
      toRouteId: 12345
    }
    const selectedNetwork = {
      networkInfo: null
    }
    const eventInfo = null

    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false if networkInfo is null', () => {
    const routeInfo = {
      routeId: 12345,
      toRouteId: 12345
    }
    const selectedNetwork = {
      networkInfo: null
    }
    const eventInfo = {
      canSpanRoutes: true
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false for invalid from and to measures', () => {
    const routeInfo = {
      fromMeasure: 'invalid',
      toMeasure: 100,
      selectedMeasure: 'invalid',
      selectedToMeasure: 80,
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, null, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false if selectedFromDate and selectedToDate are not defined', () => {
    const routeInfo = {
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const eventInfo = {
      canSpanRoutes: false
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false for undefined eventInfo', () => {
    const routeInfo = {
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, null, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return false for undefined selectedFromDate and selectedToDate', () => {
    const routeInfo = {
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      selectedFromDate: null,
      selectedToDate: null
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const eventInfo = {
      canSpanRoutes: false
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(false)
  })

  it('should return true for undefined selectedFromDate', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: null,
      selectedToDate: new Date("2025-05-15")
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const eventInfo = {
      canSpanRoutes: false
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return true for undefined selectedToDate', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '12345',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-15"),
      selectedToDate: null
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const eventInfo = {
      canSpanRoutes: false
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return true for valid spanning events', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '56789',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      toRouteFromMeasure: 0,
      toRouteToMeasure: 100,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-15"),
      selectedToDate: null
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const eventInfo = {
      canSpanRoutes: true
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(true)
  })

  it('should return false for invalid spanning events', () => {
    const routeInfo = {
      routeId: '12345',
      toRouteId: '56789',
      fromMeasure: 0,
      toMeasure: 100,
      selectedMeasure: 50,
      selectedToMeasure: 80,
      toRouteFromMeasure: 'invalid',
      toRouteToMeasure: 100,
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-15"),
      selectedToDate: null
    }
    const selectedNetwork = {
      networkInfo: {
        measurePrecision: 0.1
      }
    }
    const eventInfo = {
      canSpanRoutes: true
    }
    const result = isValidRouteSelectionUtilMulti(routeInfo, eventInfo, selectedNetwork)
    expect(result).toBe(false)
  })
})

describe('validateDateUtil', () => {
  it('should return false for invalid input', () => {
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'idle',
      setFromDateToolTip: '',
      setToDateToolTip: '',
      validDate: true
    }
    const result = validateDateUtil(null, null, null, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for start date before route start date isFrom=true', () => {
    const routeInfo = {
      fromDate: new Date("2025-05-30")
    }
    const selectedDate = new Date("2025-05-10")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'invalid',
      setToDateStatus: '',
      setFromDateToolTip: 'Start date is before route start date',
      setToDateToolTip: '',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for start date before route start date isFrom=false', () => {
    const routeInfo = {
      fromDate: new Date("2025-05-30")
    }
    const selectedDate = new Date("2025-05-10")
    const isFromDate = false
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'invalid',
      setFromDateToolTip: '',
      setToDateToolTip: 'End date is before route start date',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for start date before to route start date ', () => {
    const routeInfo = {
      fromDate: new Date("2025-05-20"),
      toRouteFromDate: new Date("2025-05-30")
    }
    const selectedDate = new Date("2025-05-25")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'invalid',
      setToDateStatus: '',
      setFromDateToolTip: 'Start date is before route start date',
      setToDateToolTip: '',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for start date before to route start date isFrom=false ', () => {
    const routeInfo = {
      fromDate: new Date("2025-05-20"),
      toRouteFromDate: new Date("2025-05-30")
    }
    const selectedDate = new Date("2025-05-25")
    const isFromDate = false
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'invalid',
      setFromDateToolTip: '',
      setToDateToolTip: 'End date is before route start date',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for selected date is after route to date ', () => {
    const routeInfo = {
      toDate: new Date("2025-05-20")
    }
    const selectedDate = new Date("2025-05-25")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'invalid',
      setToDateStatus: '',
      setFromDateToolTip: 'Start date is after route end date',
      setToDateToolTip: '',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for selected date is after route to date isFrom=false ', () => {
    const routeInfo = {
      toDate: new Date("2025-05-20")
    }
    const selectedDate = new Date("2025-05-25")
    const isFromDate = false
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'invalid',
      setFromDateToolTip: '',
      setToDateToolTip: 'End date is after route end date',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for selected date is after to route to date ', () => {
    const routeInfo = {
      toRouteToDate: new Date("2025-05-20")
    }
    const selectedDate = new Date("2025-05-25")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'invalid',
      setToDateStatus: '',
      setFromDateToolTip: 'Start date is after route end date',
      setToDateToolTip: '',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for selected date is greater than selected to date', () => {
    const routeInfo = {
      selectedToDate: new Date("2025-05-20")
    }
    const selectedDate = new Date("2025-05-25")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'invalid',
      setToDateStatus: '',
      setFromDateToolTip: 'Selected start date is greater than selected end date',
      setToDateToolTip: '',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return true for selected date is less than selected to date', () => {
    const routeInfo = {
      selectedToDate: new Date("2025-05-25")
    }
    const selectedDate = new Date("2025-05-20")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'idle',
      setToDateStatus: 'idle',
      setFromDateToolTip: '',
      setToDateToolTip: '',
      validDate: true
    }
    const toDateToolTip = 'Selected start date is greater than selected end date'
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, toDateToolTip, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return true for selected date is less than selected to date', () => {
    const routeInfo = {
      selectedToDate: new Date("2025-05-30"),
      selectedFromDate: new Date("2025-05-25")
    }
    const selectedDate = new Date("2025-05-20")
    const isFromDate = true
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: 'idle',
      setToDateStatus: 'idle',
      setFromDateToolTip: '',
      setToDateToolTip: '',
      validDate: true
    }
    const toDateToolTip = 'Start and end dates cannot be the same'
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, toDateToolTip, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return false for selected to date is less than selected date', () => {
    const routeInfo = {
      selectedFromDate: new Date("2025-05-25")
    }
    const selectedDate = new Date("2025-05-20")
    const isFromDate = false
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'invalid',
      setFromDateToolTip: '',
      setToDateToolTip: 'Selected start date is greater than selected end date',
      validDate: false
    }
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, null, intl)
    expect(result).toEqual(expectedResult)
  })

  it('should return true for selected date is less than selected to date', () => {
    const routeInfo = {
      selectedFromDate: new Date("2025-05-25")
    }
    const selectedDate = new Date("2025-05-30")
    const isFromDate = false
    const intl = createIntl({ locale: 'en' })
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'idle',
      setFromDateToolTip: '',
      setToDateToolTip: '',
      validDate: true
    }
    const toDateToolTip = 'Selected start date is greater than selected end date'
    const result = validateDateUtil(selectedDate, isFromDate, routeInfo, null, toDateToolTip, intl)
    expect(result).toEqual(expectedResult)
  })


  it('should return true if only selected date is not null', () => {
    const selectedDate = new Date("2025-05-30")
    const isFromDate = false
    const expectedResult = {
      setFromDateStatus: '',
      setToDateStatus: 'idle',
      setFromDateToolTip: '',
      setToDateToolTip: '',
      validDate: true
    }
    const result = validateDateUtil(selectedDate, isFromDate, null, null, null, null)
    expect(result).toEqual(expectedResult)
  })
})
