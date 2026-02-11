import { type DataRecordSet, type DataAction, DataLevel, type DataSource, type IntlShape, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import { createAddToMapAction } from './add-to-map-action'
import { createZoomToAction } from './zoom-to-action'
import type { QueryItemType } from '../config'

/**
 * QuerySimple Custom Data Actions
 * 
 * Returns custom data actions for the widget.
 * Includes custom "Zoom To" and "Add to Map" actions that use QuerySimple's processes.
 * 
 * @param widgetId - The widget ID
 * @param outputDS - The output data source (null/undefined if not available)
 * @param mapView - The map view (null/undefined if not available)
 * @param intl - The Intl object for internationalization
 * @param queryItem - Optional query item configuration
 * @param runtimeZoomToSelected - Optional runtime zoom override from the query form
 * @param graphicsLayer - r023.3: Graphics layer to interrogate for multi-layer selection
 * @param queries - r023.3: All query configs to map queryConfigId to data sources
 * @returns Array of custom DataAction objects (empty if conditions not met)
 */
export function getExtraActions(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  mapView: __esri.MapView | __esri.SceneView | undefined,
  intl: IntlShape,
  queryItem?: QueryItemType,
  runtimeZoomToSelected?: boolean,
  graphicsLayer?: __esri.GraphicsLayer,
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
): DataAction[] {
  const actions: DataAction[] = []
  
  // Add "Zoom To" action if we have mapView and intl
  if (mapView && intl) {
    actions.push(createZoomToAction(widgetId, mapView, intl))
  }
  
  // Add "Add to Map" action if we have outputDS and intl
  // r023.3: Pass graphics layer and queries so action can interrogate graphics for multi-layer selection
  if (outputDS && intl) {
    actions.push(createAddToMapAction(widgetId, outputDS, intl, queryItem, runtimeZoomToSelected, graphicsLayer, queries))
  }
  
  return actions
}

