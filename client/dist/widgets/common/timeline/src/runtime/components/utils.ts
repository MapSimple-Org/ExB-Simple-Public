import type { IntlShape } from 'jimu-core'
import type { DateTimeUnits, DateUnitInputValue } from 'jimu-ui/advanced/style-setting-components'
import { MIN_TICK_WIDTH, SecondsForDateUnit } from '../../utils/utils'

export enum TimelineAccuracy {
  'year' = 1,
  'month' = 2,
  'day' = 3,
  'hour' = 4,
  'minute' = 5,
  'second' = 6
}
export interface TimelineDetails {
  year: ValueTickPair
  month: ValueTickPair
  day: ValueTickPair
  hour: ValueTickPair
  minute: ValueTickPair
  second: ValueTickPair
  // minTickWidth: number
}

interface TimelineDetailsProps {
  width: number
  startTime: number
  endTime: number
  accuracy?: string
  dividedCount?: number
  zoomLevel?: number
}
export interface ValueTickPair {
  value: number
  tickWidth: number
}

export interface ValueTickInfo {
  value: number
  label: string
  position: string | number
}

/**
 * Get next/previous thumb range.
 * @param range
 * @param isNext
 * @returns
 */
export function getNextSelectedRange (range, isNext = false) {
  const { startTime, endTime } = range
  const diff = (isNext ? 1 : -1) * (endTime - startTime)
  return {
    startTime: startTime + diff,
    endTime: endTime + diff
  }
}

/**
 * Get timeline details.
 * @param width : the width of container;
 * @param accuracy : THe shown accuracy should be equal or bigger than user input.
 * @param startTime : local start time
 * @param endTime : local end time
 */
export function getValueTickPairs (props: TimelineDetailsProps): TimelineDetails {
  const {
    width, startTime, endTime, accuracy = 'hour'
  } = props

  const tsAccuracy = TimelineAccuracy[accuracy]

  // const maxCount = containerWidth / MIN_TICK_WIDTH

  // const diffTime = endTime.getTime() - startTime.getTime()

  // const year = 86400000 * 365
  // const month = 86400000 * 30
  // const day = 86400000
  // const hour = 3600000
  // const minute = 60000
  // const second = 1000

  const valueTickPair: TimelineDetails = {
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null,
    second: null
  }

  // Year
  const yearInfo = getRenderedYearByCount(new Date(startTime), new Date(endTime), width)
  valueTickPair.year = {
    value: yearInfo.value,
    tickWidth: yearInfo.tickWidth
  }

  // Month
  if (TimelineAccuracy.month <= tsAccuracy && yearInfo.value === 1) {
    const monthInfo = getRenderedMonthByCount(yearInfo.tickWidth, width)
    if (monthInfo.value !== null) {
      valueTickPair.month = {
        value: monthInfo.value,
        tickWidth: monthInfo.tickWidth
      }

      // Day
      if (TimelineAccuracy.day <= tsAccuracy && monthInfo.value === 1) {
        const dayInfo = getRenderedDayByCount(startTime, endTime, width)
        if (dayInfo.value !== null) {
          valueTickPair.day = {
            value: dayInfo.value,
            tickWidth: dayInfo.tickWidth
          }

          // Hour
          if (TimelineAccuracy.hour <= tsAccuracy && dayInfo.value === 1) {
            const hourInfo = getRenderedHourByCount(dayInfo.tickWidth, width)
            if (hourInfo.value !== null) {
              valueTickPair.hour = {
                value: hourInfo.value,
                tickWidth: hourInfo.tickWidth
              }

              // Minute
              if (TimelineAccuracy.minute <= tsAccuracy && hourInfo.value === 1) {
                const minuteInfo = getRenderedMinuteOrSecondByCount(hourInfo.tickWidth, width)
                if (minuteInfo.value !== null) {
                  valueTickPair.minute = {
                    value: minuteInfo.value,
                    tickWidth: minuteInfo.tickWidth
                  }

                  // Second
                  if (TimelineAccuracy.second <= tsAccuracy) {
                    const secondInfo = getRenderedMinuteOrSecondByCount(minuteInfo.tickWidth, width)
                    if (secondInfo.value !== null) {
                      valueTickPair.second = {
                        value: secondInfo.value,
                        tickWidth: secondInfo.tickWidth
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return valueTickPair
}

/**
 * Get rendered year accuracy by total count
 * @param startTime
 * @param endTime
 * @returns ValueTickPair
 */
function getRenderedYearByCount (startTime: Date, endTime: Date, width: number): ValueTickPair {
  const count = width / MIN_TICK_WIDTH // The total count
  let year: number
  let tickWidth: number

  // const yearNumber = endTime.getFullYear() - startTime.getFullYear() + 1
  const yearNumber = (endTime.getTime() - startTime.getTime()) / 31536000000
  const countsOfOneYear = count / yearNumber
  if (countsOfOneYear >= 1) {
    year = 1
    tickWidth = countsOfOneYear * MIN_TICK_WIDTH
  } else {
    if (countsOfOneYear >= 0.2) {
      year = 5
    } else if (countsOfOneYear >= 0.1 && countsOfOneYear < 0.2) {
      year = 10
    } else if (countsOfOneYear >= 0.02 && countsOfOneYear < 0.1) {
      year = 50
    } else if (countsOfOneYear < 0.02) {
      year = 100
    }
    tickWidth = width / (yearNumber / year)
  }
  return { value: year, tickWidth: tickWidth / width } // not exact value
}

/**
 * Get rendered month accuracy by counts of one year
 * @param width : The width of one year;
 * @returns ValueTickPair
 */
function getRenderedMonthByCount (yearTickWidth: number, width: number): ValueTickPair {
  const count = yearTickWidth * width / MIN_TICK_WIDTH // The counts of one month
  let month = null
  if (count >= 12) {
    month = 1
  } else if (count >= 4) {
    month = 3
  } else if (count >= 2) {
    month = 6
  }
  const tickWidth = yearTickWidth / (12 / month)
  return { value: month, tickWidth: tickWidth } // not exact value
}

/**
 * Get rendered day
 * @param startTime
 * @param endTime
 * @param width: The width of the whole timeline container
 * @returns
 */
function getRenderedDayByCount (startTime: number, endTime: number, width: number): ValueTickPair {
  const count = width / MIN_TICK_WIDTH // The total count
  let day: number
  const dayNumber = (endTime - startTime) / 86400000
  const countsOfOneDay = count / dayNumber
  if (countsOfOneDay >= 1) {
    day = 1
  } else {
    if (countsOfOneDay >= 0.5 && countsOfOneDay < 1) {
      day = 2
    } else if (countsOfOneDay >= 1 / 7 && countsOfOneDay < 0.5) {
      day = 7
    } else if (countsOfOneDay >= 0.1 && countsOfOneDay < 1 / 7) {
      day = 10
    } else if (countsOfOneDay >= 1 / 15 && countsOfOneDay < 0.1) {
      day = 15
    } else {
      day = null
    }
  }
  const tickWidth = 1 / (dayNumber / day)
  return { value: day, tickWidth: tickWidth }
}

/**
 * Get rendered hour accuracy by counts of one month
 * @param width : The width of one year;
 * @returns ValueTickPair
 */
function getRenderedHourByCount (tickWidth: number, width: number): ValueTickPair {
  const count = tickWidth * width / MIN_TICK_WIDTH // The counts of hour in one day

  let hour
  if (count >= 24) {
    hour = 1
  } else {
    if (count >= 12 && count < 24) {
      hour = 2
    } else if (count >= 4 && count < 12) {
      hour = 6
    } else if (count >= 3 && count < 4) {
      hour = 8
    } else if (count >= 2 && count < 3) {
      hour = 12
    } else if (count < 2) {
      hour = null
    }
  }
  const _tickWidth = tickWidth / (24 / hour)
  return { value: hour, tickWidth: _tickWidth }
}

/**
 * Get rendered minute/second accuracy by counts of one minute/second
 * @param width : The width of one hour/minute;
 * @returns ValueTickPair
 */
function getRenderedMinuteOrSecondByCount (tickWidth: number, width: number): ValueTickPair {
  const count = tickWidth * width / MIN_TICK_WIDTH
  let value
  if (count >= 60) {
    value = 1
  } else {
    if (count >= 12 && count < 60) {
      value = 5
    } else if (count >= 6 && count < 12) {
      value = 10
    } else if (count >= 4 && count < 6) {
      value = 15
    } else if (count >= 2 && count < 4) {
      value = 30
    } else if (count < 2) {
      value = null
    }
  }
  const _tickWidth = tickWidth / (60 / value)
  return { value: value, tickWidth: _tickWidth }
}

/************************** Ticks start *************************/
export interface ValueTickInfoProps {
  details: TimelineDetails,
  width: number,
  localStartTime: number,
  localEndTime: number,
  leftPosition: number,
  endPosition: number,
  scale: number,
  marginForLR?: number
  intl: IntlShape
}

/**
 * Get all ticks' {value, label, position} for years
 */
export function getValueTickInfoForYear (props: ValueTickInfoProps): ValueTickInfo[] {
  const {
    details, width, localStartTime, localEndTime, leftPosition, endPosition, scale, intl
  } = props
  const startTime = new Date(localStartTime)
  const endTime = new Date(localEndTime)
  const startYear = startTime.getFullYear()
  const endYear = endTime.getFullYear()

  const years = []
  const labels = []
  // Add start year.
  const startItem = {
    value: startYear,
    label: getLabelForYearTick(details, startTime, intl, true),
    position: 0
  }
  if (checkIfItemShown(leftPosition, endPosition, 0, scale)) {
    years.push(startItem)
    labels.push(startItem)
  }

  let firstYear = getFirstYearByTickValue(localStartTime, details.year.value)
  if (firstYear === startYear) {
    firstYear = startYear + details.year.value
  }

  // Add years inside.
  for (let i = firstYear; i <= endYear; i = i + details.year.value) {
    const tempEndTime = new Date(i, 0, 1, 0, 0, 0)
    const diffTime = tempEndTime.getTime() - localStartTime
    const position = diffTime / (localEndTime - localStartTime)

    if (!checkIfItemShown(leftPosition, endPosition, position * 100, scale)) {
      continue
    }

    let showLabel = false
    const dif = details.year.tickWidth * width / 52
    if (dif >= 1) {
      showLabel = true
    } else {
      if (dif < 0.03) {
        showLabel = i % 50 === 0 && i - startYear >= 49
      } else if (dif < 0.15) {
        showLabel = i % (10 * details.year.value) === 0 && i - startYear >= 9
      } else if (dif < 0.3) {
        showLabel = i % (5 * details.year.value) === 0 && i - startYear >= 4
      } else if (dif < 1) {
        showLabel = i % 2 === 0
      }
    }

    // const label = getDateLabel(tempEndTime, details)
    const label = getLabelForYearTick(details, tempEndTime, intl) // only show year
    showLabel = isShowLabelByPrevLabel(showLabel, label, position, labels, width)

    const currentItem = {
      value: i,
      label: showLabel ? label : null,
      position: position * 100 + '%'
    }
    if (showLabel) {
      labels.push(currentItem)
    }
    years.push(currentItem)
  }
  // Add last tick
  // years.push({
  //   value: endYear,
  //   // label: getDateLabel(endTime, details),
  //   label: endYear,
  //   position: width - marginForLR
  // })
  return years
}

/**
 * Get all ticks' {value, label, position} for months
 */
// new Date(2021,9,1,0,0,0).
// 10/01 2021
// getMonth()  = 9
export function getValueTickInfoForMonth (props: ValueTickInfoProps): ValueTickInfo[] {
  const {
    details, width, localStartTime, localEndTime, leftPosition, endPosition, scale, intl
  } = props
  if (!details.month || (details.month.tickWidth > 1 && new Date(localEndTime).getMonth() === new Date(localStartTime).getMonth())) {
    return []
  }
  const startTime = new Date(localStartTime)
  const endTime = new Date(localEndTime)
  const startMonth = startTime.getMonth() + 1
  const endMonth = endTime.getMonth() + 1

  const startYear = startTime.getFullYear()

  const monthLength = 12 - startMonth + (endTime.getFullYear() - startYear - 1) * 12 + endMonth + 1

  const months = []
  const labels = []

  let firstMonth = getFirstMonthByTickValue(localStartTime, details.month.value)
  if (firstMonth === startMonth) {
    firstMonth = startMonth + details.month.value
  }

  let firstAdded = false
  // Add months inside, and ignore the first month.
  for (let i = firstMonth - startMonth; i <= monthLength - 1; i = i + details.month.value) {
    const currentMonth = startMonth + i

    const tempEndTime = new Date(startYear, currentMonth - 1, 1, 0, 0, 0)

    const diffTime = tempEndTime.getTime() - localStartTime
    const position = diffTime / (localEndTime - localStartTime)
    if (!checkIfItemShown(leftPosition, endPosition, position * 100, scale)) {
      continue
    }

    // calc year items by itself, since above years array is not reliable.
    if (!firstAdded || tempEndTime.getMonth() === 0) {
      const _first = new Date(tempEndTime.getFullYear(), tempEndTime.getMonth() - 1, 1, 0, 0, 0)
      const _diffTime = _first.getTime() - localStartTime
      const _position = Math.max(_diffTime, 0) / (localEndTime - localStartTime)
      labels.unshift({
        value: _first.getFullYear(),
        label: getLabelForYearTick(details, _first, intl, !firstAdded),
        position: _position * 100 + '%'
      })
      firstAdded = true
      // Skip the first Y+M and all Jan since the year label is rendered already.
      if (tempEndTime.getMonth() === 0) {
        continue
      }
    }
    let showLabel = false
    const mTickW = details.month.tickWidth * width
    if (details.year.tickWidth * width > 58) {
      if (mTickW >= 28) {
        showLabel = true
      } else if (mTickW >= 15) {
        showLabel = (tempEndTime.getMonth()) % 3 === 0
      } else {
        showLabel = (tempEndTime.getMonth() + 1) % 12 === 7
      }
    }

    const label = getLabelForMonthTick(details, tempEndTime, intl)
    showLabel = isShowLabelByPrevLabel(showLabel, label, position, labels, width)

    const currentItem = {
      value: tempEndTime.getMonth() + 1,
      label: showLabel ? label : null,
      position: position * 100 + '%'
    }
    if (showLabel) {
      labels.push(currentItem)
    }
    months.push(currentItem)
  }
  return months
}

function skipToNextMonth (date: Date, day: number, details) {
  let skip = false
  const dayVal = details.day.value
  if (dayVal !== 1) {
    const month = date.getMonth() + 1
    if (dayVal === 2) {
      if (month === 2 && day === 28) {
        skip = true
      } else if (day === 30) {
        skip = true
      }
    } else if (dayVal === 7) {
      if (month === 2 && day === 21) {
        skip = true
      } else if (day === 28) {
        skip = true
      }
    } else if (dayVal === 10) {
      if (day === 20) {
        skip = true
      }
    } else if (dayVal === 15) {
      if (day === 15) {
        skip = true
      }
    }
  }
  return skip
}
/**
 * Get all ticks' {value, label, position} for days
 */
export function getValueTickInfoForDay (props: ValueTickInfoProps): ValueTickInfo[] {
  const {
    details, width, localStartTime, localEndTime, leftPosition, endPosition, scale, intl
  } = props
  if (!details.day) {
    return []
  }

  const startTime = new Date(localStartTime)
  const startDay = startTime.getDate()

  const startYear = startTime.getFullYear()
  const startMonth = startTime.getMonth()

  const dayLength = Math.ceil((localEndTime - localStartTime) / 86400000) + 1

  // const daysInfo = {
  //   firstDay: {
  //     value: startDay,
  //     label: getDateLabel(tempEndTime, details),
  //     position: position
  //   }
  // }
  const days = []
  const labels = []
  const startItem = {
    value: startDay,
    label: getLabelForMonthTick(details, startTime, intl),
    position: 0
  }
  labels.push(startItem)

  let firstDay = getFirstDayByTickValue(localStartTime, details.day.value)
  // firstDay = startDay + (firstDay === startDay ? details.day.value : 0)
  if (firstDay === startDay) {
    firstDay = startDay + details.day.value
  }

  // Add days inside, and ignore the first month.
  for (let i = firstDay - startDay; i <= dayLength - 1; i = i + details.day.value) {
    const currentDay = startDay + i
    const tempEndTime = new Date(startYear, startMonth, currentDay, 0, 0, 0)
    const tempEndDate = tempEndTime.getDate()

    if (tempEndDate === 1) {
      continue // skip since the year/month label is rendered already.
    }

    const diffTime = tempEndTime.getTime() - localStartTime
    const position = diffTime / (localEndTime - localStartTime)
    if (!checkIfItemShown(leftPosition, endPosition, position * 100, scale)) {
      continue
    }

    let showLabel = false
    const tickW = details.day.tickWidth * width
    if (details.month.tickWidth * width > 100) {
      if (tickW >= 30) {
        showLabel = true
      } else if (tickW >= 15) {
        showLabel = tempEndDate % 2 === 0
      } else if (tickW >= 8) {
        showLabel = (tempEndDate - 1) % 7 === 0
      } else if (tickW >= 3) {
        showLabel = tempEndDate === 11 || tempEndDate === 21
      }
    }

    const label = getLabelForDayTick(tempEndTime, details, intl)
    showLabel = isShowLabelByPrevLabel(showLabel, label, position, labels, width)

    const currentItem = {
      value: tempEndDate,
      label: showLabel ? label : '',
      position: position * 100 + '%'
    }

    if (showLabel) {
      labels.push(currentItem)
    }
    days.push(currentItem)

    // skip to next month if needed.
    if (skipToNextMonth(tempEndTime, tempEndDate, details)) {
      const nextMonthTime = new Date(tempEndTime.getTime())
      nextMonthTime.setDate(1)
      nextMonthTime.setMonth(nextMonthTime.getMonth() + 1) // This line must be after the setDate() because February has 28/9 days.
      const skipDays = (nextMonthTime.getTime() - tempEndTime.getTime()) / 86400000 - 1
      i += skipDays
    }
  }
  return days
}

/**
 * Get all ticks' {value, label, position} for hour
 */
export function getValueTickInfoForHour (props: ValueTickInfoProps): ValueTickInfo[] {
  const {
    details, width, localStartTime, localEndTime, leftPosition, endPosition, scale, intl
  } = props
  if (!details.hour) {
    return []
  }
  const startTime = new Date(localStartTime)
  const startHour = startTime.getHours()

  const startYear = startTime.getFullYear()
  const startMonth = startTime.getMonth()
  const startDay = startTime.getDate()

  const hourLength = Math.ceil((localEndTime - localStartTime) / 3600000) + 1

  const hours = []
  const labels = []
  const startItem = {
    value: startHour,
    label: getLabelForDayTick(startTime, details, intl),
    position: 0
  }
  labels.push(startItem)

  let firstHour = getFirstHourByTickValue(localStartTime, details.hour.value)
  if (firstHour === startHour) {
    firstHour = startHour + details.hour.value
  }

  // Add hours inside, and ignore the first hour.
  for (let i = firstHour - startHour; i <= hourLength - 1; i = i + details.hour.value) {
    const currentHour = startHour + i
    const tempEndTime = new Date(startYear, startMonth, startDay, currentHour, 0, 0)
    const tempEndHours = tempEndTime.getHours()
    if (tempEndHours === 0) {
      continue
    }
    if (tempEndTime.getTime() > localEndTime) {
      break
    }

    const diffTime = tempEndTime.getTime() - localStartTime
    const position = diffTime / (localEndTime - localStartTime)
    if (!checkIfItemShown(leftPosition, endPosition, position * 100, scale)) {
      continue
    }

    let showLabel = false
    const dTickW = details.day.tickWidth * width
    const hTickW = details.hour.tickWidth * width
    if (dTickW < 60) {
      showLabel = false
    } else if (dTickW < 100) {
      showLabel = tempEndHours % 12 === 0
    } else {
      if (hTickW >= 40) {
        showLabel = true
      } else if (hTickW >= 20) {
        showLabel = tempEndHours % 2 === 0
      } else if (hTickW >= 6.67) {
        showLabel = tempEndHours % 6 === 0
      } else if (hTickW >= 5) {
        showLabel = tempEndHours % 8 === 0
      } else if (hTickW >= 3.3) {
        showLabel = tempEndHours % 12 === 0
      }
    }

    const label = getLabelForHourTick(tempEndTime, details)
    showLabel = isShowLabelByPrevLabel(showLabel, label, position, labels, width)

    const currentItem = {
      value: tempEndHours,
      label: showLabel ? label : '',
      position: position * 100 + '%'
    }
    if (showLabel) {
      labels.push(currentItem)
    }
    hours.push(currentItem)
  }
  return hours
}

/**
 * Get all ticks' {value, label, position} for hour
 */
export function getValueTickInfoForMinute (props: ValueTickInfoProps): ValueTickInfo[] {
  const {
    details, width, localStartTime, localEndTime, leftPosition, endPosition, scale
  } = props
  if (!details.minute) {
    return []
  }
  const startTime = new Date(localStartTime)
  const startMinute = startTime.getMinutes()

  const startYear = startTime.getFullYear()
  const startMonth = startTime.getMonth()
  const startDay = startTime.getDate()
  const startHour = startTime.getHours()

  const mLength = (localEndTime - localStartTime) / 60000 + 1

  const minutes = []
  const labels = []
  const startItem = {
    value: startMinute,
    label: getLabelForHourTick(startTime, details),
    position: 0
  }
  labels.push(startItem)

  let firstMinute = getFirstMinuteByTickValue(localStartTime, details.minute.value)
  if (firstMinute === startMinute) {
    firstMinute = startMinute + details.minute.value
  }

  // Add minutes inside, and ignore the first minute.
  for (let i = firstMinute - startMinute; i <= mLength - 1; i = i + details.minute.value) {
    const currentMinute = startMinute + i
    const tempEndTime = new Date(startYear, startMonth, startDay, startHour, currentMinute, 0)
    const tempEndMinutes = tempEndTime.getMinutes()
    if (tempEndTime.getMinutes() === 0) {
      continue
    }

    const diffTime = tempEndTime.getTime() - localStartTime
    const position = diffTime / (localEndTime - localStartTime)
    if (!checkIfItemShown(leftPosition, endPosition, position * 100, scale)) {
      continue
    }

    let showLabel = false
    // const hTickW = details.hour.tickWidth * width
    // const mTickW = details.minute.tickWidth * width
    // if (hTickW > 60 && hTickW <= 160) {
    //   showLabel = tempEndMinutes % 30 === 0
    // } else if (hTickW > 160) {
    //   showLabel = tempEndMinutes % 15 === 0
    // } else if (hTickW > 300) {
    //   showLabel = tempEndMinutes % 10 === 0
    // } else {
    //   if (mTickW >= 20) {
    //     showLabel = true
    //   } else if (mTickW >= 15) {
    //     showLabel = tempEndMinutes % 5 === 0
    //   }
    //   //  else if (mTickW >= 10) {
    //   //   showLabel = tempEndMinutes % 10 === 0
    //   // } else if (mTickW >= 8) {
    //   //   showLabel = tempEndMinutes % 15 === 0
    //   // } else if (mTickW >= 5) {
    //   //   showLabel = tempEndMinutes % 30 === 0
    //   // }
    // }

    const hTickW = details.hour.tickWidth * width
    const mTickW = details.minute.tickWidth * width
    if (hTickW < 60) {
      showLabel = false
    } else if (hTickW <= 160) {
      showLabel = tempEndMinutes % 30 === 0
    } else if (hTickW < 300) {
      showLabel = tempEndMinutes % 15 === 0
    } else {
      if (mTickW > 28) {
        showLabel = true
      } else if (mTickW > 20) {
        showLabel = tempEndMinutes % 2 === 0
      } else if (hTickW > 15) {
        showLabel = tempEndMinutes % 5 === 0
      } else if (hTickW > 10) {
        showLabel = tempEndMinutes % 10 === 0
      }
    }

    const label = getLabelForMinuteTick(tempEndTime, details)
    showLabel = isShowLabelByPrevLabel(showLabel, label, position, labels, width)

    const currentItem = {
      value: tempEndTime.getMinutes(),
      label: showLabel ? label : '',
      position: position * 100 + '%'
    }
    if (showLabel) {
      labels.push(currentItem)
    }
    minutes.push(currentItem)
  }
  return minutes
}

/**
 * Get all ticks' {value, label, position} for hour
 */
export function getValueTickInfoForSecond (props: ValueTickInfoProps): ValueTickInfo[] {
  const {
    details, width, localStartTime, localEndTime, leftPosition, endPosition, scale
  } = props
  if (!details.second) {
    return []
  }
  const startTime = new Date(localStartTime)
  const startSecond = startTime.getSeconds()

  const startYear = startTime.getFullYear()
  const startMonth = startTime.getMonth()
  const startDay = startTime.getDate()
  const startHour = startTime.getHours()
  const startMinute = startTime.getMinutes()

  const mLength = (localEndTime - localStartTime) / 1000 + 1

  const seconds = []
  const labels = []
  const startItem = {
    value: startSecond,
    label: getLabelForMinuteTick(startTime, details),
    position: 0
  }
  labels.push(startItem)

  let firstSecond = getFirstSecondByTickValue(localStartTime, details.second.value)
  if (firstSecond === startSecond) {
    firstSecond = startSecond + details.second.value
  }

  // Add seconds inside, and ignore the first second.
  for (let i = firstSecond - startSecond; i <= mLength - 1; i = i + details.second.value) {
    const currentSecond = startSecond + i
    const tempEndTime = new Date(startYear, startMonth, startDay, startHour, startMinute, currentSecond)
    const tempEndSeconds = tempEndTime.getSeconds()
    if (tempEndTime.getSeconds() === 0) {
      continue
    }

    const diffTime = tempEndTime.getTime() - localStartTime
    const position = diffTime / (localEndTime - localStartTime)
    if (!checkIfItemShown(leftPosition, endPosition, position * 100, scale)) {
      continue
    }

    let showLabel = false

    const mTickW = details.minute.tickWidth * width
    const sTickW = details.second.tickWidth * width
    if (mTickW < 60) {
      showLabel = false
    } else if (mTickW <= 160) {
      showLabel = tempEndSeconds % 30 === 0
    } else if (mTickW < 300) {
      showLabel = tempEndSeconds % 15 === 0
    } else {
      if (sTickW > 28) {
        showLabel = true
      } else if (sTickW > 20) {
        showLabel = tempEndSeconds % 2 === 0
      } else if (mTickW > 15) {
        showLabel = tempEndSeconds % 5 === 0
      } else if (mTickW > 10) {
        showLabel = tempEndSeconds % 10 === 0
      }
    }

    const label = getLabelForSecondTick(tempEndTime, details)
    showLabel = isShowLabelByPrevLabel(showLabel, label, position, labels, width)

    const currentItem = {
      value: tempEndTime.getSeconds(),
      label: showLabel ? label : '',
      position: position * 100 + '%'
    }
    if (showLabel) {
      labels.push(currentItem)
    }
    seconds.push(currentItem)
  }
  return seconds
}

/**
 * check if current label id hidden by prev label
 */
function isShowLabelByPrevLabel (showLabel, label, position, labels, width) {
  if (showLabel) {
    const prevItem = labels[labels.length - 1]
    if (!prevItem) {
      return true
    }
    const prevLabel = getWidthOfText(prevItem.label)
    const currentLabel = getWidthOfText(label)
    if (prevLabel / (labels.length === 1 ? 1 : 2) + currentLabel / 2 > (position - parseFloat(prevItem.position) / 100) * width) {
      showLabel = false
    }
  }
  return showLabel
}

/************************** get First item by unit *************************/
function getFirstYearByTickValue (startTimes, value) {
  let startYear = new Date(startTimes).getFullYear()
  let itemYear = null
  while (!itemYear) {
    if (startYear % 100 % value === 0) {
      itemYear = startYear
    }
    startYear++
  }
  return itemYear
}

function getFirstMonthByTickValue (startTimes, value) {
  const date = new Date(startTimes)
  date.setDate(1)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  if (startTimes > date.getTime()) { // current date has extra hms
    date.setMonth(date.getMonth() + 1)
  }
  let startItem = date.getMonth()
  let item = null
  while (!item) {
    if (startItem % value === 0 || startItem === 11) {
      item = startItem
    }
    startItem++
  }
  return item + 1
}

function getFirstDayByTickValue (startTimes, value) {
  const date = new Date(startTimes)
  let startItem = date.getDate()
  let item = null
  while (!item) {
    if ((startItem - 1) % value === 0 && startItem !== 1) {
      item = startItem
    }
    startItem++
  }
  return item
}

function getFirstHourByTickValue (startTimes, value) {
  let startItem = new Date(startTimes).getHours()
  let item = null
  while (!item) {
    if (startItem % value === 0) {
      item = startItem
    }
    startItem++
  }
  return item
}

function getFirstMinuteByTickValue (startTimes, value) {
  let startItem = new Date(startTimes).getMinutes()
  let item = null
  while (!item) {
    if (startItem % value === 0) {
      item = startItem
    }
    startItem++
  }
  return item
}

function getFirstSecondByTickValue (startTimes, value) {
  let startItem = new Date(startTimes).getSeconds()
  let item = null
  while (!item) {
    if (startItem % value === 0) {
      item = startItem
    }
    startItem++
  }
  return item
}

/************************** get labels by unit  --- start  *************************/
function getLabelForYearTick (details, date, intl, isFirst = false) {
  let label = ''
  if (details.day) {
    label = date.getFullYear()
  } else if (details.month) {
    label = date.getFullYear()
    if (isFirst) {
      label = intl.formatDate(new Date(date.getFullYear(), date.getMonth()), { year: 'numeric', month: 'numeric' })
    }
  } else {
    label = date.getFullYear()
  }
  return label
}

function getLabelForMonthTick (details, date, intl) {
  const month = date.getMonth() + 1
  let label = ''
  if (details.day && (!details.hour || details.hour.value !== 1)) {
    label = intl.formatDate(new Date(2000, date.getMonth(), date.getDate()), { month: 'numeric', day: 'numeric' })
  } else if (month !== 1) {
    label = month
  }
  return label
}

function getLabelForDayTick (date, details, intl) {
  let label = date.getDate()
  if (details.hour) {
    label = intl.formatDate(new Date(2000, date.getMonth(), date.getDate()), { month: 'numeric', day: 'numeric' })
  }
  return label
}

function getLabelForHourTick (date, details) {
  const label = date.getHours()
  return label + ':00'
}

function getLabelForMinuteTick (date, details) {
  let label = date.getMinutes()
  if (details.second) {
    label = date.getHours() + ':' + (label < 10 ? '0' : '') + label
  }
  return label
}

function getLabelForSecondTick (date, details) {
  return date.getSeconds()
}

/************************** Ticks end *************************/

/**
 * Get combined date label.
 */
// function getDateLabel (date: Date, details) {
//   const label = `${details.year ? date.getFullYear() : ''}` +
//     `${details.month ? (details.year ? '/' : '') + (date.getMonth() + 1) : ''}` +
//     `${details.day ? ((details.month ? '/' : '') + date.getDate()) : ''}` +
//     `${details.hour ? ' ' + date.getHours() + ':' : ''}` +
//     `${details.minute ? date.getMinutes() : (details.hour ? '00' : '')}` +
//     `${details.second ? ':' + date.getSeconds() : ''}`
//   return label
// }

// Cache length for txt, only works for txt.length
const txtLength = {}

/**
* Calculate the length of label by invisible canvas.
* @param txt
* @param fontName
* @param fontSize
* @returns
*/
export function getWidthOfText (txt, fontName?, fontSize?) {
  const tempWindow = window as any // TEMP
  if (tempWindow.measureCanvasCTX === undefined) {
    const canvas = document.createElement('canvas')
    tempWindow.measureCanvasCTX = canvas.getContext('2d')
  }
  if (txtLength[txt]) {
    return txtLength[txt]
  }
  const len = tempWindow.measureCanvasCTX.measureText(txt).width + 10 // add 4px for lr-padding
  txtLength[txt] = len
  return len
}

export interface DragHandlerProps {
  interact: any,
  dragRef: any,
  getDragProps: () => resizeHandlerProps,
  resizeHandlerDragging: (startT: number, endT: number) => void,
  resizeHandlerDragend: (startT, endT, tempEndT) => void
}
export function bindDragHandler (props: DragHandlerProps) {
  const {
    interact, dragRef, getDragProps, resizeHandlerDragging, resizeHandlerDragend
  } = props
  let dw
  let dragProps
  let initStartValue, initEndValue
  let startValue, endValue // dragging
  let endTempValue = null
  return interact(dragRef).draggable(
    {
      inertia: false,
      modifiers: [],
      autoScroll: true,
      onstart: event => {
        event.stopPropagation()
        event.preventDefault()
        dragProps = getDragProps()
        initStartValue = dragProps.startValue
        initEndValue = dragProps.endValue
        startValue = dragProps.startValue
        endValue = dragProps.endValue
        dw = 0
      },
      onmove: event => {
        event.stopPropagation()
        event.preventDefault()
        const { extent, width } = dragProps
        dw = event.clientX - event.clientX0

        const valueForDw = getDraggingOffsetByPixel(extent, width, dw)
        const draggingExtentProps = {
          valueForDw,
          dragProps,
          initStartValue,
          initEndValue,
          startValue,
          endValue,
          newTempEnd: endTempValue
        }
        const updatedRange = getDraggingExtentValues(draggingExtentProps)

        resizeHandlerDragging(updatedRange.newStart, updatedRange.newEnd)
        startValue = updatedRange.newStart
        endValue = updatedRange.newEnd
        endTempValue = updatedRange.updatedNewTempEnd
      },
      onend: event => {
        event.stopPropagation()
        resizeHandlerDragend(startValue, endValue, endTempValue)
      }
    }
  )
}

function getDraggingOffsetByPixel (extent, width, dw) {
  return (extent[1] - extent[0]) / width * dw // get changed value by pixel.
}

interface DraggingExtentProps {
  valueForDw,
  dragProps: resizeHandlerProps,
  initStartValue,
  initEndValue,
  startValue,
  endValue,
  newTempEnd
}
function getDraggingExtentValues (props: DraggingExtentProps) {
  const {
    valueForDw, dragProps, initStartValue, initEndValue, startValue, endValue, newTempEnd
  } = props
  let updatedNewTempEnd = newTempEnd
  const { extent, stepLength, dividedCount } = dragProps
  let newStart = initStartValue
  let newEnd = initEndValue
  // Get nearest tick
  if (stepLength) {
    const diff = Math.round(valueForDw / SecondsForDateUnit[stepLength.unit] / stepLength.val / 1000)
    if (diff !== 0) {
      newStart = getNewValueByAccuracy(stepLength.unit, new Date(newStart), diff * stepLength.val)
      newEnd = getNewValueByAccuracy(stepLength.unit, new Date(newEnd), diff * stepLength.val)
    }
  } else { // divided
    const _accuracy = (extent[1] - extent[0]) / dividedCount
    const diff = Math.round(valueForDw / _accuracy)
    if (diff !== 0) {
      newStart = newStart + diff * _accuracy
      newEnd = newEnd + diff * _accuracy
    }
  }

  if (valueForDw > 0) {
    if (newEnd > extent[1]) {
      if (stepLength) {
        if (newStart >= extent[1]) { // keep current position
          newStart = startValue
          newEnd = endValue
        } else { // show slider in partial space
          updatedNewTempEnd = extent[1]
        }
      } else {
        newStart = extent[1] - (initEndValue - initStartValue)
        newEnd = extent[1]
      }
    } else {
      updatedNewTempEnd = null
    }
  } else {
    updatedNewTempEnd = null
    if (newStart < extent[0]) {
      newStart = extent[0]
      newEnd = newStart + (initEndValue - initStartValue)
    }
  }
  return { newStart, newEnd, updatedNewTempEnd }
}

/**
 * Resize handler for timeline
 */
export interface resizeHandlerProps {
  startValue: number
  endValue: number
  extent: number[]
  width: number
  accuracy: DateTimeUnits
  stepLength?: DateUnitInputValue
  dividedCount?: number
}
export function bindResizeHandler (interact: any, resizeRef: any, getResizeProps, resizeHandlerDragging, resizeHandlerDragend): Interact.Interactable {
  let dw
  let initWidth

  const edges = {
    left: '.resize-left',
    right: '.resize-right'
  }

  let resizeProps: resizeHandlerProps

  let originW
  let initStartValue, initEndValue
  let startValue, endValue // dragging
  return interact(resizeRef)
    .resizable({
      edges: edges
    })
    .on('resizestart', event => {
      event.stopPropagation()
      resizeProps = getResizeProps()
      initStartValue = resizeProps.startValue
      initEndValue = resizeProps.endValue
      startValue = resizeProps.startValue
      endValue = resizeProps.endValue
      originW = initEndValue - initStartValue
      dw = 0
      const size = resizeRef.getBoundingClientRect()
      initWidth = size.width
      resizeRef.style.minWidth = '0px'
    })
    .on('resizemove', event => {
      const { extent } = resizeProps
      event.stopPropagation()
      const deltaRect = event.deltaRect
      dw += deltaRect.width

      const w = originW && (initWidth + dw)
      const newRange = getRangeByPixel(startValue, endValue, extent, w, dw, event)
      const updatedRange = getDragValuesByAccuracy(event, w || dw, resizeProps, { initStartValue, initEndValue }, newRange)
      resizeHandlerDragging(updatedRange.newStart, updatedRange.newEnd)
      startValue = updatedRange.newStart
      endValue = updatedRange.newEnd
    })
    .on('resizeend', event => {
      event.stopPropagation()
      resizeHandlerDragend(startValue, endValue)
    })
}

function getRangeByPixel (startValue, endValue, extent, width, dw, event) {
  // get real value by pixel.
  let newStart = startValue
  let newEnd = endValue
  const valueForDw = (extent[1] - extent[0]) / width * dw
  if (event.edges.left) {
    newStart = startValue - valueForDw
  } else {
    newEnd = endValue + valueForDw
  }
  return { newStart, newEnd }
}

function getDragValuesByAccuracy (event, clientWidth, resizeProps: resizeHandlerProps, initDateRange, newDateRange) {
  const { width, extent, stepLength, accuracy, dividedCount } = resizeProps
  const { initStartValue, initEndValue } = initDateRange
  const {newStart: startValue, newEnd: endValue} = newDateRange

  let newStart = initStartValue
  let newEnd = initEndValue
  // Get nearest tick
  if (stepLength) {
    const diff = Math.round((extent[1] - extent[0]) * clientWidth / width / SecondsForDateUnit[accuracy] / 1000)
    if (event.edges.left) {
      newStart = getNewValueByAccuracy(accuracy, new Date(endValue), -diff)
    } else {
      newEnd = getNewValueByAccuracy(accuracy, new Date(startValue), diff)
    }
  } else { // divided
    const _accuracy = (extent[1] - extent[0]) / dividedCount
    // const diff = Math.round((endValue - startValue) / _accuracy)
    const diff = Math.round((extent[1] - extent[0]) * clientWidth / width / _accuracy)
    if (event.edges.left) {
      newStart = endValue - diff * _accuracy
    } else {
      newEnd = startValue + diff * _accuracy
    }
  }

  if (event.edges.left) {
    newStart = Math.min(newStart, newEnd)
    newStart = Math.max(extent[0], newStart)
    newStart = Math.min(extent[1], newStart)
  } else {
    newEnd = Math.max(newStart, newEnd)
    newEnd = Math.min(extent[1], newEnd)
    newEnd = Math.max(extent[0], newEnd)
  }
  return { newStart, newEnd }
}

/**
 * Get nearest startTime or endTime by accuracy when dragging is end.
 * @param accuracy
 * @param date
 * @param diff
 * @returns
 */
export function getNewValueByAccuracy (accuracy: DateTimeUnits, date: Date, diff: number) {
  switch (accuracy) {
    case 'year':
      date.setFullYear(date.getFullYear() + diff)
      break
    case 'month':
      date.setMonth(date.getMonth() + diff)
      break
    // case 'week':
    //   date.setDate(date.getDate() + diff)
    //   break
    case 'day':
      date.setDate(date.getDate() + diff)
      break
    case 'hour':
      date.setHours(date.getHours() + diff)
      break
    case 'minute':
      date.setMinutes(date.getMinutes() + diff)
      break
    case 'second':
      date.setSeconds(date.getSeconds() + diff)
      break
    default:
      break
  }
  return date.getTime()
}

export function getStepEndTimeForTarget (startTime, endTime, targetEndTime, stepLength, dividedCount, isNext = true) {
  let times
  const direction = isNext ? 1 : -1
  if (dividedCount) {
    times = targetEndTime + 1 / dividedCount * (endTime - startTime) * direction
    times = Math.round(times)

    // limit the current extent
    if (Math.abs(times - startTime) < 10000) {
      times = startTime
    } else if (Math.abs(times - endTime) < 10000) {
      times = endTime
    }
  } else {
    const sDate = new Date(targetEndTime)
    const difValue = stepLength.val * direction
    switch (stepLength?.unit) {
      case 'year':
        sDate.setFullYear(sDate.getFullYear() + difValue)
        break
      case 'month':
        sDate.setMonth(sDate.getMonth() + difValue)
        break
      case 'day':
        sDate.setDate(sDate.getDate() + difValue)
        break
      case 'hour':
        sDate.setHours(sDate.getHours() + difValue)
        break
      case 'minute':
        sDate.setMinutes(sDate.getMinutes() + difValue)
        break
      case 'second':
        sDate.setSeconds(sDate.getSeconds() + difValue)
        break
      default:
        break
    }
    times = sDate.getTime()

    // use endTime if dragged-step is out of current extent for last
    // if (times > endTime) {
    //   times = endTime
    // }
  }

  return times
}

/**
 * Get proper sizes for ticks and labels.
 * Three expected groups:
 * Ticks: 'medium', 'long, medium', or 'long, medium, short'
 * Labels: 'short', 'long, medium', or 'long, medium, short'
 */
export interface TickSizeProps {
  tsDetails: TimelineDetails
  years: ValueTickInfo[],
  months: ValueTickInfo[],
  days: ValueTickInfo[],
  hours: ValueTickInfo[],
  minutes: ValueTickInfo[],
  seconds: ValueTickInfo[]
}
export function getTickSizes (props: TickSizeProps): any {
  const {
    tsDetails, years, months, days, hours, minutes, seconds
  } = props
  const sizes = {
    labels: {},
    ticks: {}
  }
  const list = []
  if (years.length > 1) {
    list.push('year')
  }
  if (months.length > 1) {
    list.push('month')
  }
  if (days.length > 1) {
    list.push('day')
  }
  if (hours.length > 1) {
    list.push('hour')
  }
  if (minutes.length > 1) {
    list.push('minute')
  }
  if (seconds.length > 1) {
    list.push('second')
  }
  const lastUnit = list[list.length - 1]
  const displayedList = Object.keys(tsDetails).filter(unit => tsDetails[unit])

  if (list.length === 1) {
    displayedList.forEach(unit => {
      sizes.ticks[unit] = 'medium'
      sizes.labels[unit] = 'short'
    })
  } else {
    if (list.length === 2) {
      sizes.ticks[lastUnit] = 'medium'
      displayedList.forEach(unit => {
        if (unit !== lastUnit) {
          sizes.ticks[unit] = 'long'
        }
      })
    } else {
      const lastSecond = list[list.length - 2]
      sizes.ticks[lastUnit] = 'short'
      sizes.ticks[lastSecond] = 'medium'
      displayedList.forEach(unit => {
        if (unit !== lastUnit && unit !== lastSecond) {
          sizes.ticks[unit] = 'long'
        }
      })
    }
    sizes.labels = sizes.ticks
  }

  return sizes
}

/** Check if current item is shown from current screen * 1.5 */
export function checkIfItemShown (leftPosition: number, endPosition: number, itemPosition: number, widthNum: number): boolean {
  let isShown = false
  const buffer = 1 / widthNum / 2 * 100
  if (itemPosition >= leftPosition - buffer && itemPosition <= endPosition + buffer) {
    isShown = true
  }
  return isShown
}

export function getMultipleByZoomLevel (width, zoomLevel, maxWidthAndZoomLevel?): number {
  if (maxWidthAndZoomLevel?.zoomLevel === zoomLevel && zoomLevel !== 0) {
    return maxWidthAndZoomLevel.maxWidth / width
  }
  return Math.pow(2, zoomLevel)
}

export function getWidthByZoomLevel (width, zoomLevel, maxWidthAndZoomLevel?): number {
  return width * getMultipleByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel)
}

const MAX_ZOOM_LEVEL = 30
export function getMaxWidthAndZoomLevel (width: number, startTime: number, endTime: number, accuracy: DateTimeUnits) {
  if (width < 0) { // It could be negative when changing to another page.
    return
  }
  const multiple = 8
  const tickNum = (endTime - startTime) / SecondsForDateUnit[accuracy] / 1000
  const maxWidth = Math.max(width, multiple * MIN_TICK_WIDTH * tickNum)
  let zoomLevel = 0
  while (getWidthByZoomLevel(width, zoomLevel) < maxWidth || zoomLevel === MAX_ZOOM_LEVEL) {
    zoomLevel++
  }
  return { maxWidth, zoomLevel }
}
