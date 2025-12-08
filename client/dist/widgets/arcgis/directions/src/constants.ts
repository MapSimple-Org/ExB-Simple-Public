export const DEFAULT_ROUTE_URL = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World'

export const MAX_SUGGESTIONS = 6

/**
 * `locationEnabled` isn't defined in __esri.DirectionsSearchProperties, but works.
 */
export const DefaultJSAPISearchProperties: __esri.DirectionsSearchProperties & { locationEnabled?: boolean } = {
  includeDefaultSources: false,
  locationEnabled: false,
  maxSuggestions: MAX_SUGGESTIONS
}
