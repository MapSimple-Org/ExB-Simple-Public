import type { extensionSpec, ImmutableObject, IMState } from 'jimu-core'

export enum OrientedImageryActions {
  BtnClickAction = 'Click_Btn_Active',
  OICSelectAction = 'OIC_Loaded',
  APILoadAction = 'API_Loaded'
}

export interface Action1 {
  type: OrientedImageryActions.BtnClickAction
  val: boolean
}

export interface Action2 {
  type: OrientedImageryActions.OICSelectAction
  val: any
}

export interface Action3 {
  type: OrientedImageryActions.APILoadAction
  val: boolean
}

type ActionTypes = Action1 | Action2 | Action3

interface MyState {
  pointBool: boolean
  oic: any
  oiApiLoaded: boolean
}
type IMMyState = ImmutableObject<MyState>

declare module 'jimu-core/lib/types/state' {
  interface State {
    widget_orientedimagery?: IMMyState
  }
}

export default class OIReduxStore implements extensionSpec.ReduxStoreExtension {
  id = 'oi-redux-store'

  getActions () {
    return Object.keys(OrientedImageryActions).map(k => OrientedImageryActions[k])
  }

  getInitLocalState () {
    return {
      pointBool: true,
      oic: null,
      oiApiLoaded: false
    }
  }

  getReducer () {
    return (localState: IMMyState, action: ActionTypes, appState: IMState): IMMyState => {
      switch (action.type) {
        case OrientedImageryActions.BtnClickAction:
          return localState.set('pointBool', action.val)
        case OrientedImageryActions.OICSelectAction:
          return localState.set('oic', action.val)
        case OrientedImageryActions.APILoadAction:
          return localState.set('oiApiLoaded', action.val)
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          return localState
      }
    }
  }

  getStoreKey () {
    return 'widget_orientedimagery'
  }
}
