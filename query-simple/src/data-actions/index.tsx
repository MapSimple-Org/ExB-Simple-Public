import { type DataAction, type DataSource, type IntlShape, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import { createZoomToAction } from './zoom-to-action'
import type { QueryItemType } from '../config'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'

/**
 * QuerySimple Custom Data Actions
 *
 * Returns custom data actions for the widget.
 * Currently includes the custom "Zoom To" action.
 * (r028.080: "Add to Map" / Select on map action removed.)
 *
 * @param widgetId - The widget ID
 * @param outputDS - The output data source (null/undefined if not available)
 * @param mapView - The map view (null/undefined if not available)
 * @param intl - The Intl object for internationalization
 * @param queryItem - Optional query item configuration (reserved for future actions)
 * @param runtimeZoomToSelected - Optional runtime zoom override (reserved for future actions)
 * @param graphicsLayer - Reserved for future actions
 * @param queries - Reserved for future actions
 * @returns Array of custom DataAction objects (empty if conditions not met)
 */
export function getExtraActions(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  mapView: MapView | SceneView | undefined,
  intl: IntlShape,
  queryItem?: QueryItemType,
  runtimeZoomToSelected?: boolean,
  graphicsLayer?: GraphicsLayer,
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
): DataAction[] {
  const actions: DataAction[] = []

  // Add "Zoom To" action if we have mapView and intl
  if (mapView && intl) {
    actions.push(createZoomToAction(widgetId, mapView, intl))
  }

  return actions
}

