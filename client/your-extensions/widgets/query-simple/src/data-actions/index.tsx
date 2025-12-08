import { type DataRecordSet, type DataAction, DataLevel, type DataSource, type IntlShape } from 'jimu-core'
import { createAddToMapAction } from './add-to-map-action'
import type { QueryItemType } from '../config'

/**
 * QuerySimple Custom Data Actions
 * 
 * Returns custom data actions for the widget.
 * Includes a custom "Add to Map" action that uses QuerySimple's selection process.
 * 
 * @param widgetId - The widget ID
 * @param outputDS - The output data source (null/undefined if not available)
 * @param intl - The Intl object for internationalization
 * @param queryItem - Optional query item configuration
 * @param runtimeZoomToSelected - Optional runtime zoom override from the query form
 * @returns Array of custom DataAction objects (empty if conditions not met)
 */
export function getExtraActions (
  widgetId: string,
  outputDS: DataSource | null | undefined,
  intl: IntlShape,
  queryItem?: QueryItemType,
  runtimeZoomToSelected?: boolean
): DataAction[] {
  // Only create the action if we have both an output data source and intl object
  if (outputDS && intl) {
    return [createAddToMapAction(widgetId, outputDS, intl, queryItem, runtimeZoomToSelected)]
  }
  
  return []
}

