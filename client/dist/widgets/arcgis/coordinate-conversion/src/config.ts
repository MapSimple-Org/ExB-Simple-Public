import type { ImmutableArray, UseUtility, ImmutableObject } from 'jimu-core'

export interface Config {
  inputSettings: InputSettings
  outputSettings: OutputSettings[]
  addressSettings: AddressSettings
  generalSettings: GeneralSettings
}

export interface InputSettings {
  defaultCoordinate: string
  format: string
}

export interface OutputSettings {
  name: string
  label: string
  defaultPattern: string
  currentPattern: string
  enabled: boolean
  isCustom?: boolean
}

export interface AddressSettings {
  minCandidateScore: number
  maxSuggestions: number
  useUtilitiesGeocodeService: ImmutableArray<UseUtility>
  geocodeServiceUrl: string
  displayFullAddress: boolean
}

export interface GeneralSettings {
  zoomScale: number
  defaultPointSymbol: __esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol | __esri.PointSymbol3D
}

export type IMConfig = ImmutableObject<Config>
export type IMInputSettings = ImmutableObject<InputSettings>
export type IMOutputSettings = ImmutableObject<OutputSettings>
export type IMAddressSettings = ImmutableObject<AddressSettings>
export type IMGeneralSettings = ImmutableObject<GeneralSettings>
