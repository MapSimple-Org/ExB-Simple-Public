import type { ImmutableObject } from 'jimu-core'

export interface FlexRowConfig {
  min: number
  space: number
  style: {
    padding?: {
      number: number[]
      unit: string
    }
    justifyContent?: string
    alignItems?: string
    overflowY?: boolean
  }
}

export type IMFlexRowConfig = ImmutableObject<FlexRowConfig>
