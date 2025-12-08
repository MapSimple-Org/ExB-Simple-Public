import defaultMessages from './translations/default'

const elevationIcon = require('./assets/icons/elevation-icon.svg')
const selectIcon = require('jimu-icons/svg/outlined/gis/select-line.svg')
const infoIcon = require('jimu-icons/svg/outlined/suggested/info.svg')
const drawIcon = require('jimu-icons/svg/outlined/editor/edit.svg')
const arrowNavBack = require('jimu-icons/svg/outlined/directional/arrow-left.svg')
const doneIcon = require('jimu-icons/svg/outlined/application/check.svg')
const clearIcon = require('jimu-icons/svg/outlined/editor/trash.svg')

const chartIcon = require('jimu-icons/svg/outlined/brand/widget-chart.svg')
const flipIcon = require('jimu-icons/svg/outlined/directional/exchange.svg')
const settingsIcon = require('jimu-icons/svg/outlined/application/setting.svg')
const iconExpandCollapse = require('jimu-icons/svg/outlined/directional/down.svg')

export const getRuntimeIcon = () => ({
  epIcon: {
    elevationIcon,
    selectIcon,
    infoIcon,
    drawIcon,
    arrowNavBack,
    doneIcon,
    clearIcon,
    chartIcon,
    flipIcon,
    settingsIcon,
    iconExpandCollapse
  }
})

export const defaultElevationLayer = 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'

export const unitOptions = [
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

export const epStatistics = [
  {
    value: 'maxDistance', label: defaultMessages.maxDistance
  },
  {
    value: 'minElevation', label: defaultMessages.minElevation
  },
  {
    value: 'maxElevation', label: defaultMessages.maxElevation
  },
  {
    value: 'avgElevation', label: defaultMessages.avgElevation
  },
  {
    value: 'elevationGain', label: defaultMessages.elevationGain
  },
  {
    value: 'elevationLoss', label: defaultMessages.elevationLoss
  },
  {
    value: 'maxPositiveSlope', label: defaultMessages.maxPositiveSlope
  },
  {
    value: 'maxNegativeSlope', label: defaultMessages.maxNegativeSlope
  },
  {
    value: 'avgPositiveSlope', label: defaultMessages.avgPositiveSlope
  },
  {
    value: 'avgNegativeSlope', label: defaultMessages.avgNegativeSlope
  }
]

/**
 * Enum which describes the error sub-states the widget can be in once it is in
 * the 'creating' or 'created' state. We can show different error messages to
 * the user based on this.
 *
 * @ignore
 */
export const enum ElevationProfileErrorState {
  /**
   * No profiles are currently visible.
   */
  NoVisibleProfiles = 'no-visible-profiles',
  /**
   * The input path doesn't have a valid geometry.
   */
  InvalidGeometry = 'invalid-geometry',
  /**
   * The input path is too complex and the profile can't be generated.
   */
  TooComplex = 'too-complex',
  /**
   * The input path has an invalid or unsupported configuration.
   */
  InvalidElevationInfo = 'invalid-elevation-info',
  /**
   * The elevation profile could not be generated due to an unknown error. We'll
   * typically log the error to the console in such cases.
   */
  UnknownError = 'unknown-error',
  /**
   * Profile has been fully refined but we don't have any data for the chart.
   * This can happen, for example, when the configured elevation sources don't
   * contain elevation for the area of the input path.
   */
  RefinedButNoChartData = 'refined-but-no-chart-data',
  /**
   * No error.
   */
  None = 'none'
}

/** Profile statistics names */
export const enum ElevationProfileStatisticsName {
  MaxDistance = 'maxDistance',
  MinElevation = 'minElevation',
  MaxElevation = 'maxElevation',
  AvgElevation = 'avgElevation',
  ElevationGain = 'elevationGain',
  ElevationLoss = 'elevationLoss',
  MaxPositiveSlope = 'maxPositiveSlope',
  MaxNegativeSlope = 'maxNegativeSlope',
  AvgPositiveSlope = 'avgPositiveSlope',
  AvgNegativeSlope = 'avgNegativeSlope'
}

/** Returns the StatsName to be used when flipping the chart */
export const getReverseStatsOnFlip = (statsName: string): string => {
  switch (statsName) {
    case ElevationProfileStatisticsName.MaxPositiveSlope:
      return ElevationProfileStatisticsName.MaxNegativeSlope
    case ElevationProfileStatisticsName.MaxNegativeSlope:
      return ElevationProfileStatisticsName.MaxPositiveSlope
    case ElevationProfileStatisticsName.AvgPositiveSlope:
      return ElevationProfileStatisticsName.AvgNegativeSlope
    case ElevationProfileStatisticsName.AvgNegativeSlope:
      return ElevationProfileStatisticsName.AvgPositiveSlope
    case ElevationProfileStatisticsName.ElevationLoss:
      return ElevationProfileStatisticsName.ElevationGain
    case ElevationProfileStatisticsName.ElevationGain:
      return ElevationProfileStatisticsName.ElevationLoss
  }
  return statsName
}
