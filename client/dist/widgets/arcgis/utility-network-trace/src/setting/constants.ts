import defaultMessages from './translations/default'

export const defaultConfiguration = {
  traceResultAreaSettings: {
    enableResultArea: false,
    resultAreaProperties: {
      type: 'convexhull',
      distance: 10,
      unit: '',
      areaUnit: '',
      color: {
        color: [255, 165, 0, 0.5],
        haloOpacity: 0.9,
        fillOpacity: 0.2,
        hex: '#ffa500'
      },
      show: false
    }
  }
}

export const defaultShapeDistance = 10

export const unitOptions = [
  {
    value: 'meters'
  },
  {
    value: 'feet'
  },
  {
    value: 'kilometers'
  },
  {
    value: 'miles'
  }
]

export const traceInformation = [
  {
    value: 'traceId', label: defaultMessages.traceId
  },
  {
    value: 'traceName', label: defaultMessages.traceName
  },
  {
    value: 'traceDescription', label: defaultMessages.traceDescription
  },
  {
    value: 'startingPoints', label: defaultMessages.startingPoints
  },
  {
    value: 'barriers', label: defaultMessages.barriers
  },
  {
    value: 'version', label: defaultMessages.version
  },
  {
    value: 'username', label: defaultMessages.username
  },
  {
    value: 'date', label: defaultMessages.traceDate
  },
  {
    value: 'elementCount', label: defaultMessages.elementCount
  },
  {
    value: 'functionResult', label: defaultMessages.functionResult
  },
  {
    value: 'areaStatistic', label: defaultMessages.areaStatistic
  }
]
