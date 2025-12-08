import type { ImmutableObject } from 'jimu-core'

export interface Config {
  modelViewerWidgetId: string
}

export type IMConfig = ImmutableObject<Config>
