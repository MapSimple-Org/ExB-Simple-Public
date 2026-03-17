/**
 * Data source utilities for FeedSimple Map Integration.
 *
 * Handles:
 * - Output data source ID generation
 * - Output data source JSON generation for settings registration
 *
 * The output DS is registered in settings (via onSettingChange) so ExB's
 * framework is aware of the widget's data output. The runtime uses direct
 * FeatureLayer queries and popup for the actual map interaction.
 */

import {
  type DataSource,
  type UseDataSource
} from 'jimu-core'

/**
 * Generate a deterministic output data source ID for this widget instance.
 * Pattern: `{widgetId}_output`
 */
export function getOutputDataSourceId (widgetId: string): string {
  return `${widgetId}_output`
}

/**
 * Build the output data source JSON for settings registration.
 * Called from setting.tsx when Map Integration is fully configured.
 *
 * Derives type, geometry, URL, and portal metadata from the origin
 * DataSource (selected via DataSourceSelector in settings).
 *
 * @param widgetId - The widget instance ID
 * @param originDs - The DataSource instance selected as the spatial join layer
 * @param originUseDataSource - The UseDataSource reference for the origin layer
 */
export interface OutputDataSourceJson {
  id: string
  label: string
  type: string
  geometryType?: string
  url?: string
  itemId?: string
  portalUrl?: string
  originDataSources: UseDataSource[]
  isDataInDataSourceInstance: boolean
}

export function buildOutputDataSourceJson (
  widgetId: string,
  originDs: DataSource,
  originUseDataSource: UseDataSource
): OutputDataSourceJson {
  const dsJson = originDs.getDataSourceJson()
  return {
    id: getOutputDataSourceId(widgetId),
    label: 'FeedSimple Output',
    type: dsJson?.type || 'FEATURE_LAYER',
    geometryType: (dsJson as any)?.geometryType,
    url: dsJson?.url,
    itemId: dsJson?.itemId,
    portalUrl: dsJson?.portalUrl,
    originDataSources: [originUseDataSource],
    isDataInDataSourceInstance: true
  }
}
