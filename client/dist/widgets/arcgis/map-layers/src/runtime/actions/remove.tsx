import { ExBAddedJSAPIProperties, CONSTANTS } from 'jimu-core'
import Action from './action'
import type { Widget } from '../widget'
import { ACTION_INDEXES } from './constants'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'

export default class Remove extends Action {
  constructor (widget: Widget, title: string) {
    super()
    this.id = 'remove'
    this.title = title
    this.className = 'esri-icon-remove'
    this.group = ACTION_INDEXES.Remove
    this.widget = widget
    this.icon = <TrashOutlined />
  }

  isValid = (layerItem): boolean => {
    if (layerItem.layer[ExBAddedJSAPIProperties.EXB_LAYER_FROM_RUNTIME]) {
      return true
    } else {
      return false
    }
  }

  execute = (layerItem): void => {
    const jmv = this.widget.jmvFromMap
    if (!jmv) {
      return
    }

    const map = jmv?.view?.map

    if (!map) {
      return
    }

    const layer = layerItem.layer

    // The logic for removing the marker layer is a bit complicated and requires calling the method on JimuMapView to delete it.
    if (layer?.id === CONSTANTS.ADD_MARKER_LAYER_ID) {
      jmv.removeMarkerLayer()
      jmv.updateMarkerUrlParamIfActive()
      return
    }

    map.remove(layer)
  }
}
