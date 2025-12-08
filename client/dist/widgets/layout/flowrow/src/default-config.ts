import { Immutable } from 'jimu-core'
import type { IMFlexRowConfig } from './config'

export const defaultConfig: IMFlexRowConfig = Immutable({
  space: 10,
  min: 16,
  style: {
    padding: {
      number: [0],
      unit: 'px'
    },
    justifyContent: 'center',
    alignItems: 'stretch'
  }
})
