// routes
import type { RouteConfig as _RouteConfig } from './fly-facade/plan-routes/routes'
import type _Routes from './fly-facade/plan-routes/routes'
import type { RecordConfig as _RecordConfig } from './fly-facade/plan-routes/record/record'
import type _Record from './fly-facade/plan-routes/record/record'
// controllers
import type { FlyStateChangeCallbacks as _FlyStateChangeCallbacks } from './fly-facade/controllers/base-fly-controller'
import type { LiveViewSettingOptions as _LiveviewSettingOptions, LiveviewSettingState as _LiveviewSettingState } from './fly-facade/controllers/common/liveview-setting'
// GraphicsInfo
import DefaultSymbols from './graphics/default-symbols'
// Layout
import { PanelLayout } from '../config'

import GraphicsInfo, { type GraphicsInfoConfig as _GraphicsInfoConfig } from './graphics/graphics-info'
export type Routes = _Routes
export type RouteConfig = _RouteConfig
export type Record = _Record
export type RecordConfig = _RecordConfig
export type FlyStateChangeCallbacks = _FlyStateChangeCallbacks
export type LiveViewSettingOptions = _LiveviewSettingOptions
export type LiveviewSettingState = _LiveviewSettingState

export { DefaultSymbols }
export { GraphicsInfo }
export type GraphicsInfoConfig = _GraphicsInfoConfig

export const Constraints = {
  // default auto size ,#13367
  ControllerStyleSize: {
    [PanelLayout.Horizontal]: { w: 262, h: 44 },
    [PanelLayout.Palette]: { w: 146, h: 94 }
  },

  SPEED: {
    MIN: 0,
    MAX: 1,
    MULTIPLIER: 8,
    DECIMAL: 3,
    DEFAULT_SPEED: 50
  },

  // max/min values ,#6382
  ALT: {
    MIN: 0,
    MAX: 800,
    STEP: 10
  },

  TILT: {
    MIN: 0,
    MAX: 90,
    STEP: 1
  },

  TIME: {
    MIN: 0
  },

  // calculated value rounded ,#6406
  CALCULATED_VALUE_ROUNDED: {
    ANGLE: 0,
    ELEV: 1,
    TIME: 1
  }
}
