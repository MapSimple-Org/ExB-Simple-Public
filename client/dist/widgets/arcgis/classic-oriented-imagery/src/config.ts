import type { ImmutableObject } from 'jimu-core'

export interface Config {
  catalogSourceType: string | null
  catalogGroupFolder: string | null
  catalogSelectDefault: oicItem | null
  itemUrlInput: string | null
  editingEnabled: boolean
  vectorLayers: any
  oicList: any
}

export interface oicItem {
  name: string | null
  url: string | null
}

export type IMConfig = ImmutableObject<Config>
