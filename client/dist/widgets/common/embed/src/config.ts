import type { ImmutableObject } from 'jimu-core'

export enum EmbedType {
  Url = 'url',
  Code = 'code'
}

export interface Config {
  embedType: EmbedType
  embedCode: string
  staticUrl: string
  expression: string
  autoRefresh?: boolean
  autoInterval?: number
  enableLabel?: boolean
  label?: string
  enableBlankMessage?: boolean
  blankMessage?: string
  honorThemeFont?: boolean
}

export type IMConfig = ImmutableObject<Config>
