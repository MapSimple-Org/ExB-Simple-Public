import defaultMessages from './translations/default'

export const unitOptions = [
  { value: 'miles', label: defaultMessages.miles },
  { value: 'meters', label: defaultMessages.meters },
  { value: 'kilometers', label: defaultMessages.kilometers },
  { value: 'feet', label: defaultMessages.feet },
  { value: 'yards', label: defaultMessages.yards }
]

export const distanceUnitWithAbbr = [
  {
    value: 'meters',
    abbreviation: 'metersAbbreviation'
  },
  {
    value: 'feet',
    abbreviation: 'feetAbbreviation'
  },
  {
    value: 'kilometers',
    abbreviation: 'kilometersAbbreviation'
  },
  {
    value: 'miles',
    abbreviation: 'milesAbbreviation'
  },
  {
    value: 'yards',
    abbreviation: 'yardsAbbreviation'
  }
]

export const defaultPageSize = {
  a3Portrait: { height: 16.54, width: 11.69 },
  a3Landscape: { height: 11.69, width: 16.54 },
  a4Portrait: { height: 11.69, width: 8.27 },
  a4Landscape: { height: 8.27, width: 11.69 },
  letterAnsiAPortrait: { height: 11.00, width: 8.50 },
  letterAnsiALandscape: { height: 8.50, width: 11.00 },
  tabloidAnsiBPortrait: { height: 17.00, width: 11.00 },
  tabloidAnsiBLandscape: { height: 11.00, width: 17.00 }
}

export const defaultMapSize = {
  a3Portrait: { height: 13.50, width: 11.70 },
  a3Landscape: { height: 7.70, width: 16.50 },
  a4Portrait: { height: 8.50, width: 8.30 },
  a4Landscape: { height: 4.80, width: 11.70 },
  letterAnsiAPortrait: { height: 7.80, width: 8.50 },
  letterAnsiALandscape: { height: 4.50, width: 11.00 },
  tabloidAnsiBPortrait: { height: 14.50, width: 11.00 },
  tabloidAnsiBLandscape: { height: 7.00, width: 17.00 }
}

export const defaultLegendSize = {
  a3Portrait: { height: 2.00, width: 11.70 },
  a3Landscape: { height: 2.00, width: 16.50 },
  a4Portrait: { height: 2.00, width: 8.30 },
  a4Landscape: { height: 1.00, width: 11.70 },
  letterAnsiAPortrait: { height: 2.00, width: 8.50 },
  letterAnsiALandscape: { height: 2.00, width: 11.00 },
  tabloidAnsiBPortrait: { height: 2.00, width: 11.00 },
  tabloidAnsiBLandscape: { height: 2.00, width: 17.00 }
}

export const enum PageOrientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape'
}