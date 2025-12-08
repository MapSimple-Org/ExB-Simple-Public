import type { ImmutableObject } from 'seamless-immutable'
import type { Tool3D, Arrangement } from './constraints'

export interface config {
  tools: Tool3D[]
  arrangement: Arrangement
}
export type IMConfig = ImmutableObject<config>
