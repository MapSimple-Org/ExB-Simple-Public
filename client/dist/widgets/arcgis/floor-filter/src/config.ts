import type { ImmutableObject } from 'jimu-core'

export interface Config {
  displayLabel?: boolean
  filterDataSources?: boolean
  filterByActiveFloorOnly?: boolean
  autoSetOnFeatureSelection?: boolean
  zoomOnAutoSet?: boolean,
  longNames?: boolean
  position?: string
}

export type IMConfig = ImmutableObject<Config>
