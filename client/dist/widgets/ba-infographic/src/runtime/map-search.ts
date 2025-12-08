import Search from '@arcgis/core/widgets/Search'
// import Locator from 'esri/rest/locator'
// import * as locator from 'esri/rest/locator'
// import Circle from 'esri/geometry/Circle'
import Graphic from 'esri/Graphic'
import D from '../utils/dbg-log'
import PictureMarkerSymbol from 'esri/symbols/PictureMarkerSymbol'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import type BAMapActions from './ba-map-actions'

interface MapSearchData {
  mapWidgetId: string
  view: any
  map: any
  graphicsLayer: any
  searchControl: any
  widgets: any[]
}
interface WidgetInfo {
  widgetId: string
  searchResultCallback: any
  cleared: any
  mapActions: BAMapActions
}

/**
 * This class is static and globally maintains a registry of all
 * map/widget associations to a Search control that is added to one or more
 * map widgets.  Once a search control is added to a map widget, this class
 * syncs the search events to each associated widget (as events).
 *
 * Multiple widgets can use the same search control on a single map widget.
 * Likewise, multiple map widgets can be added that can then individually
 * be associated to one or more widgets.
 *
 * Call 'registerCallbacks()' to create another widget to map association.
 * The callbacks are used to receive events when the user chooses a search
 * result or suggestion, and to know when the user clicks on the search
 * control 'X' button.
 *
 * This class will add a symbol to the map when a search result is located
 * (and clears the previous graphics).
 *
 * No other map graphics are managed by this class
 */
export default class MapSearch {
  public fixForLint: string

  constructor () {
    // to show debug logging set following to true
    D.showDebugConsoleLogs = false
  }

  public static maps: any = {}
  public static _searchIndex: number = 0

  /**
   * Each map object contains:
   *      mapWidgetId - key
   *      view
   *      map
   *      graphicsLayer
   *      search result callback
   *      search clear collback
   *      widgets - array of registered widget callbacks
   *
   * @private
   */

  public static hasText (s) {
    return !(typeof s === 'undefined' || s === null) && typeof s === 'string' && s.length > 0 && s.trim().length > 0
  }

  public static removeSearchbars () {
    // Clear out any previous search controls we created
    const view = this.searchInfo?.view

    if (!view) return

    const comps = view.ui?._components
    if (comps && comps.length > 0) {
      for (let ii = 0; ii < view.ui._components.length; ii++) {
        if (view.ui._components[ii].widget?._baFlag) {
          view.ui.remove(view.ui._components[ii].widget)
        }
      }
    }
  }

  public static searchInfo: MapSearchData | undefined = undefined
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  public static mapData: Record<string, MapSearchData> = {}

  /**  registerCallbacks
   *
   *  This function accepts a widget id and associates it with a map (mapWidgetId) and view.  If the map does not already
   *  have a search control, it creates one.  Then the search results and clear callbacks are registered to receive
   *  notifications from the single search control.
   *
   * @param widgetId  = element id of widget receiving search notifications
   * @param mapWidgetId  = element id of the related map widget
   * @param view  = jsapi MapView object for the map
   * @param env = environment dev | qa | prod
   * @param searchResultCallback  =  callback for search result notifications (may be null or undefined)
   * @param searchClearCallback  = callback for search control cancel buttton that clears the search (may be null or undefined)
   * @param mapActionsContext = BAMapActions instance reference for the widget
   */
  // eslint-disable-next-line max-params
  public static registerCallbacks (
    widgetId: string,
    mapWidgetId: string,
    view: any,
    env: string,
    searchPlaceholderLocalized: string,
    searchResultCallback: any,
    searchClearCallback: any,
    mapActionsContext: any,
    geocoderUrl: string | null = null) {
    if (!this.hasText(widgetId) || !this.hasText(mapWidgetId) || !view || !mapActionsContext) {
      D.log('map-search', 'map search register callbacks failed - invalid args')
      return
    }
    this.searchInfo = {
      mapWidgetId,
      view,
      map: view.map,
      graphicsLayer: undefined,
      searchControl: undefined,
      widgets: []
    }
    // Clear out any previous search controls we created
    this.removeSearchbars()

    const myWidgetInfo: WidgetInfo = {
      widgetId,
      searchResultCallback,
      cleared: searchClearCallback,
      mapActions: mapActionsContext
    }

    const id = 'baSearch' + Date.now()
    let gl: any
    if (view.map.graphicsLayer) {
      gl = view.map.graphicsLayer
    } else {
      gl = new GraphicsLayer({ id, listMode: 'hide' }) as any
    }

    const staticData = MapSearch.mapData[mapWidgetId]
    const widgets: any = staticData ? staticData.widgets : []
    const searchCtl = staticData ? staticData.searchControl : null
    // create or update map data
    const newMapData: MapSearchData = {
      mapWidgetId,
      view,
      map: view.map,
      graphicsLayer: gl,
      searchControl: searchCtl,
      widgets
    }
    // add widget info if not already there
    const winfo = newMapData.widgets.find(o => o.widgetId === widgetId)
    if (!winfo) {
      newMapData.widgets.push(myWidgetInfo)
    }

    if (view.map.graphicsLayer) {
      view.map.graphicsLayer.clear()
    } else {
      newMapData.map.add(newMapData.graphicsLayer)
    }
    const srMarker = new PictureMarkerSymbol({
      width: 14,
      height: 26.6,
      xoffset: 0,
      yoffset: 12.6,
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAjCAYAAAB2KjFhAAACtUlEQVRIS+2WS0wTURSG/zvT0kpfkGJ4pGCViA1Em9CtCQVx5QIWhiVRo8GdSNypqHElkcgOlzVh5ap1X6nEiAkQXzGBxkSKtZC0jdTSB7SdMXdwRjudB+w5q5t7T775z3/OzR0CWbT4x90Glh0CMEx43g1C3FIKz6/zhKwDCJYrldBWZIaupSDiqsE/3mBjmGeMyXLF7GiBubEVhmN2sIY6KblS3kO58BvFX5soZrbA7eYCWY67vR2Z2aZJAoyqMTLMvLXN47a1eeRiUSrmUSrmhHSGNYA11oGtMyO3FcVOYnW9xHH9VKUAcw1MfHSc9HktzvYaEN34B6suymSxCwozsQ+ReHi6n7gG7/iNZvv88W6/Ikgdtl+Y2d6I5NfXqJQK/cQ1MPHQ1uZ5oFSeSFdWtn9Ky93b/olsYvURhUWcXef7TPamGmWXfM3oPeVAi8OIeDKLpWgSrxY3qvIY1gjCl5GOvn2jCLOaWUyN9sDX6aj5wNJaErdm3yNbKAlnurCp0W709ThVPQy+i+H+ixV92OlWC+bGe1VB4sHlx2GsxTPayqhPkyNdurB7gRWEFmPasBsXT+D6YIcu7MnLz5gLf9OG0e7Njp3ThV2bXsBSNKUNo518ftML6p1aUK+oZwfqJgVRIAXLg47E1acLgvkHgtGk1kYTJkfOCEMrxnI0hbuBZSTSeWlPd87kaprqeWwkUopVHxqmdTePYMqTdeRZ9d1svzARtLnODlmbO1XvoqpnhMBkaUAhHUM2/iVE6ONrZZjIoZ+6v6BiZhOZ7yufdjjOL7ybesAaZQog+qpX/R6oKayCqYCoKAmmpVCCaYBqYGpAAbabF8z+3yPxh0XsXJUycVPuYWm3IIyAFkhRmRowl/4hdU2uSFOZHFjv7PDm0xtC+9VAmspkwOAOxw1rgWj+H4uVH6hj08HSAAAAAElFTkSuQmCC'
    })

    const getGeocoderUrl = (env: string) => {
      switch (env) {
        case 'dev':
          return 'https://geocodedev.arcgis.com/arcgis/rest/services/World/GeocodeServer'
        case 'qa':
          return 'https://geocodeqa.arcgis.com/arcgis/rest/services/World/GeocodeServer'
        default:
          return 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
      }
    }
    const envUrl: string = geocoderUrl || getGeocoderUrl(env)
    const searchElementId = widgetId + '-map-search-' + this._searchIndex++

    newMapData.searchControl = new Search({
      id: searchElementId,
      view,
      popupEnabled: false,
      sources: [
        {
          // @ts-expect-error allow url
          url: envUrl,
          singleLineFieldName: 'SingleLine',
          outFields: ['Addr_type', 'Match_addr', 'StAddr', 'City'],
          name: 'ArcGIS World Geocoding Service',
          placeholder: searchPlaceholderLocalized,
          resultSymbol: srMarker
        }
      ],
      _baFlag: true
    })
    newMapData.searchControl.viewModel.includeDefaultSources = false
    newMapData.view.ui.add(newMapData.searchControl, { position: 'top-right' })
    newMapData.searchControl.container.style.marginRight = '40px' // move search control to left to make room for other widgets

    // User cleared the search string
    newMapData.searchControl.on('search-clear', function (event) {
      newMapData.graphicsLayer.removeAll()
      MapSearch.notifyClear(newMapData)
    })

    // User performed search and chose something
    newMapData.searchControl.on('select-result', function (ev) {
      D.log('MapSearch', 'ON SEARCH RESULTS...')
      const center = ev.result.extent.center
      D.log('MapSearch', 'clearing GraphicsLayer')
      newMapData.graphicsLayer.removeAll()
      D.log('MapSearch', 'SEARCH_RESULT= ', ev)
      D.log('MapSearch', 'name=', ev.result.name)
      D.log('MapSearch', 'Location=', center.latitude, center.longitude)

      // Show the found search location dot
      const symbol = {
        type: 'simple-fill',
        color: [51, 51, 204, 0.15],
        style: 'solid',
        outline: {
          color: 'blue',
          width: 1
        }
      }
      const gr = new Graphic({ symbol: symbol as unknown as __esri.SymbolUnion })
      D.log('MapSearch', 'adding search result graphic=', gr)
      newMapData.graphicsLayer.add(gr)

      const details = {
        type: 'point',
        latitude: center.latitude,
        longitude: center.longitude,
        displayName: ev.result.name
      }
      MapSearch.notifySearchResults(newMapData, details)
    })

    // update our map data using latest view references
    MapSearch.mapData[mapWidgetId] = newMapData

    // Register the map info
    MapSearch.maps[mapWidgetId] = newMapData

    if (newMapData && newMapData.searchControl) {
      return newMapData.searchControl
    }
    return null
  }

  private static notifyClear (mapData) {
    D.log('MapSearch', 'notify Search Cleared for ' + mapData.widgets.length + ' widgets')
    // for all registered widgets, notify each
    for (let ii = 0; ii < mapData.widgets.length; ii++) {
      const w = mapData.widgets[ii]
      if (w.cleared) {
        try {
          w.cleared(w.mapActions)
        } catch (ex) {
          throw new Error('Map Search clear notify failed')
        }
      }
    }
  }

  private static notifySearchResults (mapData, details) {
    D.log('MapSearch', 'notify SR for ' + mapData.widgets.length)
    // for all registered widgets, notify each
    for (let ii = 0; ii < mapData.widgets.length; ii++) {
      const w = mapData.widgets[ii]
      D.log('MapSearch', 'widget' + ii + ' =', w)
      if (w.searchResultCallback) {
        try {
          w.searchResultCallback(details, w.mapActions)
        } catch (ex) {
          throw new Error('Map Search clear notify failed')
        }
      }
    }
  }
}
