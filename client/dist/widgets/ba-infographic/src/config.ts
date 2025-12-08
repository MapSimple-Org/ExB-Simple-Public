/* eslint-disable jimu-theme/no-classic-css-vars */
import type { ImmutableObject } from 'seamless-immutable'
import type { UseUtility } from 'jimu-core'

// Travel Mode interface for custom travel modes
export interface TravelMode {
  name: string
  itemId: string // This is the TravelModeId from the API
  type?: string // AUTOMOBILE, TRUCK, WALK, etc.
  description?: string // Raw JSON string from TravelMode attribute
  travelModeData?: any // Parsed travel mode data
}

// Travel Direction enum
export enum TravelDirection {
  away = 'Away From Facility',
  toward = 'Towards Facility'
}

// Traffic Type enum
export enum TrafficType {
  live = 'live',
  typical = 'typical'
}

export interface Config {
  defaultImage: boolean
  defaultPdf: boolean
  bufferSize1: number
  bufferSize2: number
  bufferSize3: number
  bufferUnit: string
  imageExport: boolean
  pdf: boolean
  zoomLevel: boolean
  excel: boolean
  fullscreen: boolean
  displayHeader: boolean
  reportShowStacked: boolean
  runReportOnClick: boolean
  showSearch: boolean
  dynamicHtml: boolean
  selectedCountry: string
  latitude: number
  longitude: number
  selectedInfographicName: string
  selectedInfographicId: string
  infographicLongitude: number
  infographicLatitude: number
  searchSelectedItem: any
  locationObject: any
  geoenrichmentConfig: GeoenrichmentConfig
  // Travel Mode properties
  travelModeData?: TravelMode | string // Support both object and string for backward compatibility
  drivingMode?: string // Deprecated: old property name for backward compatibility
  travelDirection?: TravelDirection
  useTrafficEnabled?: boolean
  useTrafficChecked?: boolean
  trafficType?: TrafficType
  offsetTime?: number
  offsetDay?: string
  offsetHr?: string
}

// Default travel mode object
export const DEFAULT_TRAVEL_MODE: TravelMode = {
  name: 'Driving Time',
  itemId: 'FEgifRtFndKNcJMJ',
  type: 'AUTOMOBILE',
  description: 'Models the movement of cars and other similar small automobiles, such as pickup trucks, and finds solutions that optimize travel time. Travel obeys one-way roads, avoids illegal turns, and follows other rules that are specific to cars. When you specify a start time, dynamic travel speeds based on traffic are used where it is available.',
  travelModeData: {
    "attributeParameterValues": [
      {
        "attributeName": "TravelTime",
        "parameterName": "Vehicle Maximum Speed (km/h)",
        "value": 0
      },
      {
        "attributeName": "Avoid Carpool Roads",
        "parameterName": "Restriction Usage",
        "value": "PROHIBITED"
      },
      {
        "attributeName": "Avoid Express Lanes",
        "parameterName": "Restriction Usage",
        "value": "PROHIBITED"
      },
      {
        "attributeName": "Avoid Gates",
        "parameterName": "Restriction Usage",
        "value": "AVOID_MEDIUM"
      },
      {
        "attributeName": "Avoid Private Roads",
        "parameterName": "Restriction Usage",
        "value": "AVOID_MEDIUM"
      },
      {
        "attributeName": "Avoid Unpaved Roads",
        "parameterName": "Restriction Usage",
        "value": "AVOID_HIGH"
      },
      {
        "attributeName": "Driving an Automobile",
        "parameterName": "Restriction Usage",
        "value": "PROHIBITED"
      },
      {
        "attributeName": "Roads Under Construction Prohibited",
        "parameterName": "Restriction Usage",
        "value": "PROHIBITED"
      },
      {
        "attributeName": "Through Traffic Prohibited",
        "parameterName": "Restriction Usage",
        "value": "AVOID_HIGH"
      }
    ],
    "description": "Models the movement of cars and other similar small automobiles, such as pickup trucks, and finds solutions that optimize travel time. Travel obeys one-way roads, avoids illegal turns, and follows other rules that are specific to cars. When you specify a start time, dynamic travel speeds based on traffic are used where it is available.",
    "distanceAttributeName": "Kilometers",
    "id": "FEgifRtFndKNcJMJ",
    "impedanceAttributeName": "TravelTime",
    "name": "Driving Time",
    "restrictionAttributeNames": [
      "Avoid Carpool Roads",
      "Avoid Express Lanes",
      "Avoid Gates",
      "Avoid Private Roads",
      "Avoid Unpaved Roads",
      "Driving an Automobile",
      "Roads Under Construction Prohibited",
      "Through Traffic Prohibited"
    ],
    "simplificationTolerance": 10,
    "simplificationToleranceUnits": "esriMeters",
    "timeAttributeName": "TravelTime",
    "type": "AUTOMOBILE",
    "useHierarchy": true,
    "uturnAtJunctions": "esriNFSBAtDeadEndsAndIntersections"
  }
}

export interface GeoenrichmentConfig {
  useUtility?: UseUtility
}

export type IMGeoenrichmentConfig = ImmutableObject<GeoenrichmentConfig>

export enum ViewMode {
  Auto = 'auto', // default
  Full = 'full',
  Stack = 'stack',
  Slides = 'slides',
  StackAll = 'stack-all'
}

export enum Mode {
  Workflow = 'WORKFLOW',
  Preset = 'PRESET'
}

export enum Color {
  'var(--white)' = '#fff',
  'var(--black)' = '#000',
  'var(--transparent)' = 'transparent',
  'var(--primary)' = '#076fe5',
  'var(--secondary)' = '#c5c5c5',
  'var(--light)' = '#f0f0f0',
  'var(--dark)' = '#050505',
  'var(--success)' = '#09cf74',
  'var(--info)' = '#089bdc',
  'var(--warning)' = '#ffea1d',
  'var(--danger)' = '#e1001b',
  'var(--primary-100)' = '#e6f2ff',
  'var(--primary-200)' = '#acd3ff',
  'var(--primary-300)' = '#65adff',
  'var(--primary-400)' = '#2c8fff',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--primary-500)' = '#076fe5',
  'var(--primary-600)' = '#005eca',
  'var(--primary-700)' = '#004ca3',
  'var(--primary-800)' = '#003c82',
  'var(--primary-900)' = '#002958',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--secondary-100)' = '#f0f0f0',
  'var(--secondary-200)' = '#e3e3e3',
  'var(--secondary-300)' = '#d5d5d5',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--secondary-400)' = '#c5c5c5',
  'var(--secondary-500)' = '#b6b6b6',
  'var(--secondary-600)' = '#a8a8a8',
  'var(--secondary-700)' = '#989898',
  'var(--secondary-800)' = '#8b8b8b',
  'var(--secondary-900)' = '#828282',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-100)' = '#f0f0f0',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-200)' = '#e3e3e3',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-300)' = '#d5d5d5',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-400)' = '#c5c5c5',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-500)' = '#b6b6b6',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-600)' = '#a8a8a8',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-700)' = '#989898',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-800)' = '#8b8b8b',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--light-900)' = '#828282',
  'var(--dark-100)' = '#767676',
  'var(--dark-200)' = '#6a6a6a',
  'var(--dark-300)' = '#5e5e5e',
  'var(--dark-400)' = '#525252',
  'var(--dark-500)' = '#444444',
  'var(--dark-600)' = '#363636',
  'var(--dark-700)' = '#282828',
  'var(--dark-800)' = '#181818',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--dark-900)' = '#050505',
  'var(--info-100)' = '#e5f7ff',
  'var(--info-200)' = '#9fe2ff',
  'var(--info-300)' = '#60ceff',
  'var(--info-400)' = '#21bbff',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--info-500)' = '#089bdc',
  'var(--info-600)' = '#0077ac',
  'var(--info-700)' = '#005a82',
  'var(--info-800)' = '#003b56',
  'var(--info-900)' = '#002231',
  'var(--success-100)' = '#ebfff6',
  'var(--success-200)' = '#acffd9',
  'var(--success-300)' = '#56f8ad',
  'var(--success-400)' = '#16ed8a',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--success-500)' = '#09cf74',
  'var(--success-600)' = '#03b161',
  'var(--success-700)' = '#00904e',
  'var(--success-800)' = '#006838',
  'var(--success-900)' = '#004022',
  'var(--warning-100)' = '#fffdeb',
  'var(--warning-200)' = '#fff9c3',
  'var(--warning-300)' = '#fff592',
  'var(--warning-400)' = '#fff05f',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--warning-500)' = '#ffea1d',
  'var(--warning-600)' = '#eed800',
  'var(--warning-700)' = '#d4c000',
  'var(--warning-800)' = '#b5a400',
  'var(--warning-900)' = '#938500',
  'var(--danger-100)' = '#ffe9ec',
  'var(--danger-200)' = '#ff94a1',
  'var(--danger-300)' = '#ff5066',
  'var(--danger-400)' = '#ff203c',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'var(--danger-500)' = '#e1001b',
  'var(--danger-600)' = '#bf0017',
  'var(--danger-700)' = '#9f0013',
  'var(--danger-800)' = '#79000f',
  'var(--danger-900)' = '#4a0009'
}

export type IMConfig = ImmutableObject<Config>
