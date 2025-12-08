import type AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D'
import type AreaMeasurement3D from '@arcgis/core/widgets/AreaMeasurement3D'
import type DirectLineMeasurement3D from '@arcgis/core/widgets/DirectLineMeasurement3D'
import type DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D'
import type { ImmutableObject } from 'jimu-core'

export interface Config {
  enableDistance: boolean
  defaultDistanceUnit: __esri.SystemOrLengthUnit
  enableArea: boolean
  defaultAreaUnit: __esri.SystemOrAreaUnit
  arrangement: MeasurementArrangement
  disableSnapping: boolean
}

export enum MeasurementArrangement {
  Classic = 'CLASSIC',
  Toolbar = 'TOOLBAR'
}

export const measurementSystemList: Array<{ key: string, value: __esri.MeasurementSystem }> = [
  { key: 'unitsLabelMetric', value: 'metric' },
  { key: 'unitsLabelImperial', value: 'imperial' }
]

export const lengthUnitList: Array<{ key: string, value: __esri.LengthUnit }> = [
  { key: 'unitsInches', value: 'inches' },
  { key: 'unitsLabelFeet', value: 'feet' },
  { key: 'unitsLabelYards', value: 'yards' },
  { key: 'unitsLabelMiles', value: 'miles' },
  { key: 'unitsLabelNauticalMiles', value: 'nautical-miles' },
  { key: 'unitsLabelFeetUS', value: 'us-feet' },
  { key: 'unitsLabelMeters', value: 'meters' },
  { key: 'unitsLabelKilometers', value: 'kilometers' }
]
export const areaUnitList: Array<{ key: string, value: __esri.AreaUnit }> = [
  { key: 'unitsLabelSquareInches', value: 'square-inches' },
  { key: 'unitsLabelSquareFeet', value: 'square-feet' },
  { key: 'unitsLabelSquareYards', value: 'square-yards' },
  { key: 'unitsLabelSquareMiles', value: 'square-miles' },
  { key: 'unitsLabelSquareNauticalMiles', value: 'square-nautical-miles' },
  { key: 'unitsLabelSquareFeetUS', value: 'square-us-feet' },
  { key: 'unitsLabelSquareMeters', value: 'square-meters' },
  { key: 'unitsLabelSquareKilometers', value: 'square-kilometers' },
  { key: 'unitsLabelAcres', value: 'acres' },
  { key: 'unitsLabelAres', value: 'ares' },
  { key: 'unitsLabelHectares', value: 'hectares' }
]

export type MeasurementClass = DistanceMeasurement2D | DirectLineMeasurement3D | AreaMeasurement2D | AreaMeasurement3D

export interface MeasureButton {
  name: 'measureDistance' | 'measureArea' | ''
  icon: string
  enabled: boolean
}

export type MeasureState = 'disabled' | 'ready' | 'measuring' | 'measured'

export type IMConfig = ImmutableObject<Config>
