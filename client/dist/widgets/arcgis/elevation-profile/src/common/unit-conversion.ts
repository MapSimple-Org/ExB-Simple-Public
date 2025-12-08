export function convertElevationsInfoArray (elevationsArray: [], linearEU, elevationEU, selectedLinearUnit: string, selectedElevationUnit: string) {
  elevationsArray.forEach((item: any) => {
    item.x = parseFloat(getDisplayValue(item.x, linearEU, selectedLinearUnit).toString())
    item.y = parseFloat(getDisplayValue(item.y, elevationEU, selectedElevationUnit).toString())
  })
  return elevationsArray
}

export function convertDistancesArray (distancesArray: [], linearEU, selectedLinearUnit: string) {
  distancesArray.map((distance) => {
    return parseFloat(getDisplayValue(distance, linearEU, selectedLinearUnit).toString())
  })
  return distancesArray
}

export function getArrayMin (dataArray) {
  const values = dataArray.map((item: any) => {
    return item.y
  })
  return Math.min.apply(Math, values)
}

export function getArrayMax (dataArray) {
  const values = dataArray.map((item: any) => {
    return item.y
  })
  return Math.max.apply(Math, values)
}

function getDisplayValue (value: number, effectiveUnitValue, displayUnits: string): number {
  return convertSingle(value, effectiveUnitValue, displayUnits)
}

export function convertSingle (fromValue: number | [], fromUnits: string, toUnits: string | []): number {
  if (fromUnits === toUnits) {
    return +fromValue
  } else {
    // CONVERT //
    return (+fromValue / perMeter(fromUnits)) * perMeter(toUnits)
  }
}

function perMeter (units: string | []): number {
  let conversionFactor = 1.0
  switch (units) {
    case 'meters':
      conversionFactor = 1.0
      break
    case 'kilometers':
      conversionFactor = 1 / 1000
      break
    case 'feet':
      conversionFactor = 1 / 0.3048
      break
    case 'yards':
      conversionFactor = 1 / 0.9144
      break
    case 'miles':
      conversionFactor = 1 / 1609.344
      break
  }
  return conversionFactor
}

export function niceScale (min: number, max: number, maxTicks = 10): [number, number] {
  const range = niceRange(max - min, false)

  if (range === 0) {
    return [min, max]
  }

  const spacing = niceRange(range / (maxTicks - 1), true)

  const niceMin = Math.floor(min / spacing) * spacing
  const niceMax = Math.ceil(max / spacing) * spacing

  return [niceMin, niceMax]
}

function niceRange (value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value))
  const fraction = value / 10 ** exponent

  let niceFraction
  if (round) {
    if (fraction < 1.5) {
      niceFraction = 1
    } else if (fraction < 3) {
      niceFraction = 2
    } else if (fraction < 5) {
      niceFraction = 2.5
    } else if (fraction < 7) {
      niceFraction = 5
    } else {
      niceFraction = 10
    }
  } else {
    if (fraction <= 1) {
      niceFraction = 1
    } else if (fraction <= 2) {
      niceFraction = 2
    } else if (fraction <= 3) {
      niceFraction = 2.5
    } else if (fraction <= 5) {
      niceFraction = 5
    } else {
      niceFraction = 10
    }
  }

  return niceFraction * 10 ** exponent
}
