/** @jsx jsx */
import Graphic from 'esri/Graphic'
// import SpatialReference from 'esri/geometry/SpatialReference'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import PictureMarkerSymbol from 'esri/symbols/PictureMarkerSymbol'
import D from '../utils/dbg-log'
import Circle from 'esri/geometry/Circle'
import Point from 'esri/geometry/Point'
import MapSearch from './map-search'
import BAProjection from './projection'
import { InfoBufferType } from './widget'
import TransportUtil from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/util/mobile/TransportUtil'
import Environments from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/util/Environments'
import Debounce from '../utils/debounce'
import GeocoderClient from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/util/mobile/GeocoderClient.js'
import { ACLUtils } from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/ACLUtils'

/**
 *  Map actions:
 *   - user clicks somewhere on the map - this resets map graphicsLayer and draws new graphics
 *     based on settings.  The map graphics may be a dot for location, and then either circles
 *     or drive/walk polygons.
 *   - user clicks on a point feature
 */
export default class BAMapActions {
  private _initialized: boolean = false
  private readonly env: string
  private searchControl: any
  private doMapClicks: boolean
  //private mapView: any
  private graphicsLayer: any
  private graphicsLayerId: any
  private map: any
  private view: any
  private readonly search: any
  private bufferSizes: [number]
  private bufferSizesString: string
  private bufferType: InfoBufferType
  private bufferUnits: string
  private drivetimeOptions: any
  private readonly callback: any
  private readonly context: any
  private readonly mapWidgetId: string
  private readonly widgetId: string
  public readonly colors: any
  private latitude: any
  private longitude: any
  private geometry: any
  private activeSpatial: any
  private readonly settingsAreaId: any
  private ignorePropChanges: boolean = false
  private readonly propChangeDebouncer: Debounce
  private readonly _allowPropChanges: any
  private readonly searchPlaceholderLocalized: string
  private readonly geoenrichmentServiceUrl: string
  private readonly geocodeServiceUrl: string

  public showSearch: boolean

  /** constructor
     *
     * @param showSearch = boolean turns on search control top-right of map
     * @param reportChangeCallback = Function to call when map actions or search results change
     * Return:
     * {
     *      type: <'point' or 'polygon'>,
     *      latitude: <for point type only>,
     *      longitude: <for point type only>,
     *      rings:<polygon only>,
     *      displayName: <location name = may be empty>
     * }
     */
  // eslint-disable-next-line max-params
  constructor ( widgetId: string, mapId: string, showSearch: boolean, env: string, reportChangeCallback: any, context, searchPlaceholderLocalized: string, geoenrichmentServiceUrl: string, geocodeServiceUrl: string ) {
    // set to 'true' to display logs
    D.showDebugConsoleLogs = false
    D.log( 'map-actions', 'constructor' )
    this.propChangeDebouncer = new Debounce( this )
    this._allowPropChanges = this.propChangeDebouncer.debounce( function () { this.ignorePropChanges = false } )

    this.widgetId = widgetId
    this.mapWidgetId = mapId
    this.showSearch = ( typeof showSearch === 'undefined' ) ? true : showSearch
    this.env = env
    this.doMapClicks = false
    this.bufferType = InfoBufferType.ring
    this.bufferSizes = [1]
    this.bufferSizesString = '1'
    this.bufferUnits = 'miles'
    this.drivetimeOptions = {}
    this.context = context
    this.callback = reportChangeCallback
    this.colors = [
      {
        color: [245, 172, 70, 0.4],
        outline: {
          color: [204, 50, 2, 0.7],
          width: 1
        }
      },
      {
        color: [70, 178, 121, 0.3],
        outline: {
          color: [70, 178, 121, 0.7],
          width: 1
        }
      },
      {
        color: [120, 144, 173, 0.3],
        outline: {
          color: [17, 59, 143, 0.7],
          width: 1
        }
      }
    ]
    this.searchPlaceholderLocalized = searchPlaceholderLocalized
    this.geoenrichmentServiceUrl = geoenrichmentServiceUrl
    this.geocodeServiceUrl = geocodeServiceUrl
  }

  /** allowMapClicks
     *
     * @param flag = boolean that listens to map clicks and performs hit tests
     */
  public allowMapClicks( flag: boolean ) {
    this.doMapClicks = flag
  }

  _warnNotInitialized = () => {
    console.log( '%c BA Widget map not initialized', 'color:red;font-size:10pt' )
  }

  /* initialize
     *      This function sets up the map action handlers and
     *      search control.  It should only be called once on
     *      startup for any given map.
     *
     *      view : jsapi MapView
     */
  public initialize( view ) {
    if ( !view ) {
      throw new Error( 'BA map actions initialize: invalid view' )
    }
    if ( this.view ) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    self.map = view.map
    self.view = view
    self.graphicsLayerId = 'baGraphics' + Date.now()
    const id = self.graphicsLayerId
    self.graphicsLayer = new GraphicsLayer( { id, listMode: 'hide' } )
    self.map.add( self.graphicsLayer )

    // Add Search control and handler
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const srMarker = new PictureMarkerSymbol( {
      width: 14,
      height: 26.6,
      xoffset: 0,
      yoffset: 12.6,
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAjCAYAAAB2KjFhAAACtUlEQVRIS+2WS0wTURSG/zvT0kpfkGJ4pGCViA1Em9CtCQVx5QIWhiVRo8GdSNypqHElkcgOlzVh5ap1X6nEiAkQXzGBxkSKtZC0jdTSB7SdMXdwRjudB+w5q5t7T775z3/OzR0CWbT4x90Glh0CMEx43g1C3FIKz6/zhKwDCJYrldBWZIaupSDiqsE/3mBjmGeMyXLF7GiBubEVhmN2sIY6KblS3kO58BvFX5soZrbA7eYCWY67vR2Z2aZJAoyqMTLMvLXN47a1eeRiUSrmUSrmhHSGNYA11oGtMyO3FcVOYnW9xHH9VKUAcw1MfHSc9HktzvYaEN34B6suymSxCwozsQ+ReHi6n7gG7/iNZvv88W6/Ikgdtl+Y2d6I5NfXqJQK/cQ1MPHQ1uZ5oFSeSFdWtn9Ky93b/olsYvURhUWcXef7TPamGmWXfM3oPeVAi8OIeDKLpWgSrxY3qvIY1gjCl5GOvn2jCLOaWUyN9sDX6aj5wNJaErdm3yNbKAlnurCp0W709ThVPQy+i+H+ixV92OlWC+bGe1VB4sHlx2GsxTPayqhPkyNdurB7gRWEFmPasBsXT+D6YIcu7MnLz5gLf9OG0e7Njp3ThV2bXsBSNKUNo518ftML6p1aUK+oZwfqJgVRIAXLg47E1acLgvkHgtGk1kYTJkfOCEMrxnI0hbuBZSTSeWlPd87kaprqeWwkUopVHxqmdTePYMqTdeRZ9d1svzARtLnODlmbO1XvoqpnhMBkaUAhHUM2/iVE6ONrZZjIoZ+6v6BiZhOZ7yufdjjOL7ybesAaZQog+qpX/R6oKayCqYCoKAmmpVCCaYBqYGpAAbabF8z+3yPxh0XsXJUycVPuYWm3IIyAFkhRmRowl/4hdU2uSFOZHFjv7PDm0xtC+9VAmspkwOAOxw1rgWj+H4uVH6hj08HSAAAAAElFTkSuQmCC'
    } )

    self.initSearchControl()

    // Initialize Geocoder
    const creds = self.context.getCredentials()
    // if (creds && creds.length === 2) {
    //   TransportUtil.setToken(creds[0], creds[1])
    //   Environments.setEnvironment(self.env)
    //   self._geocoder = new GeocoderClient(creds[1], MapSearch.getGeocoderUrl(self.env))
    // }

    // Events
    self.view.on( 'click', evt => {
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const mapPoint = evt.mapPoint
      if ( self.doMapClicks ) {
        D.log( 'map-actions', 'onMapClick()...' )
        self.graphicsLayer.removeAll()
        if ( self.searchControl ) { self.searchControl.searchTerm = '' }

        // allow UI to catch up
        function _later() {
          // Check for features under the click
          self.view.hitTest( evt, {} ).then(
            function ( response ) {
              // if no other features/layers found (just a basemap) then allow map clicks
              if ( ( response.results.length <= 0 ) || ( !getGraphics( response ) ) ) {
                if ( self.context && self.context.onSiteObjectChanged ) {
                  // clear temporary graphics
                  self.graphicsLayer.removeAll()
                  // clear the map search control
                  if ( self.searchControl ) { self.searchControl.searchTerm = '' }

                  const clickPoint = self.view.toMap( { x: evt.x, y: evt.y } )
                  const lat = clickPoint.latitude
                  const lon = clickPoint.longitude

                  // Reverse geocode the map point to get an address
                  try {
                    Environments.setEnvironment( self.env )
                    const g = new GeocoderClient( creds[1], self.geocodeServiceUrl )
                    g.geocodeUsingApi( lat, lon ).then( ( result ) => {
                      if ( self.context && self.context.onSiteObjectChanged ) {
                        const obj: any = {
                          origin: 'mapClick',
                          data: {
                            type: 'click',
                            latitude: clickPoint.latitude,
                            longitude: clickPoint.longitude,
                            event: evt,
                            hit: response,
                            title: result.label
                          }
                        }
                        self.context.onSiteObjectChanged( obj )
                      }
                    },
                      ( err ) => {
                        console.log( 'GEOCODE ERROR= ', err )
                      } )
                  } catch ( ex ) {
                    console.log( 'GEOCODE Exception:', ex )
                  }
                }
              }
            } )
        }
        setTimeout( _later, 0 )
      }

      function getGraphics( response ): any {
        let pt: any, poly: any
        if ( response.results.length > 0 ) {
          for ( let ii = 0; ii < response.results.length; ii++ ) {
            const graphic = response.results[ii].graphic

            // Ignore internal layers (e.g. the box around a hand drawn polygon)
            const layer = graphic.layer

            if ( !layer ) {
              return
            }

            if ( typeof layer.internal === 'undefined' || layer.internal !== true ) {
              if ( graphic.geometry ) {
                switch ( graphic.geometry.type ) {
                  case ( 'polygon' ): {
                    if ( !poly ) poly = [ii, graphic]
                    break
                  }
                  case ( 'point' ): {
                    if ( !pt ) pt = [ii, graphic]
                  }
                }
              }
            }
          }
          if ( pt ) {
            try {
              highlightPoint( response, pt )
            } catch ( ex ) {
              console.log( ex )
            }
          } else if ( poly ) {
            try {
              highlightPolygon( response, poly )
            } catch ( ex ) {
              console.log( ex )
            }
          } else {
            return false
          }
          return true
        } else {
          return false
        }
      }

      function highlightPoint( response: any, data: any ) {
        const graphic = data[1]
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const attributes = graphic.attributes
        const ptLat = graphic.geometry.latitude
        const ptLon = graphic.geometry.longitude
        // update widget lat/lon
        self.ignorePropChanges = true
        self.latitude = ptLat
        self.longitude = ptLon
      }

      function highlightPolygon( response: any, data: any ) {
        const polyLat = evt.mapPoint.latitude
        const polyLon = evt.mapPoint.longitude
        // update widget lat/lon
        self.ignorePropChanges = true
        self.latitude = polyLat
        self.longitude = polyLon
      }
    } )

    this._initialized = true
    this.ignorePropChanges = false
  }

  public updateMapBuffers() {
    const widget = this.context
    const options = widget.buildInfographicOptions()
    const info: any = options.infographicOptions
    const dto: any = info.drivetimeOptions

    this.bufferType = info.bufferType
    this.bufferUnits = info.bufferUnits
    this.bufferSizes = info.bufferSizes
    this.drivetimeOptions = info.bufferType === 'drivetime' ? dto : undefined
    this._renderToMap( false, undefined, false, true )
  }

  // create or re-create search control
  // This happens when the user associates a map widget OR
  // when the map layers change
  //
  public initSearchControl() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    function _action() {
      // do nothing
      D.log( 'map-actions', 'search control css update' )
    }

    if ( self.showSearch ) {
      // self.map.allLayers.on('change', (e) => {
      //   console.log('%cLayers changed: ', 'color:orange;font-size:12pt;', e)
      //   console.log('%c   (added) ', 'color:orange;font-size:12pt;', e.added.length)
      //   console.log('%c   (removed) ', 'color:orange;font-size:12pt;', e.removed.length)
      //   console.log('%c   (moved) ', 'color:orange;font-size:12pt;', e.moved.length)
      // })

      // (re) create search control
      self.searchControl = null

      self.searchControl = MapSearch.registerCallbacks(
        self.widgetId,
        self.mapWidgetId,
        self.view,
        self.env,
        self.searchPlaceholderLocalized,
        function onMapSearchControlResults( results, bamInstance ) {
          // This handles the results from the map widget Search Control
          self.ignorePropChanges = true
          // This is always a location.
          // Boundaries are either features that are selected on the map, or come
          // from arcgis-ba-search (and those results don't go thru here, but
          // are handled directly by the widget)
          // NOTE: the results are not rendered from here, but instead are passed on
          // to the widget so they can be part of the workflow.  The widget is setup
          // to to process the change and then call MapActions to render in the map

          if ( self.context && self.context.onSiteObjectChanged ) {
            const data = { origin: 'mapSearch', data: results }
            self.context.onSiteObjectChanged( data )
          }
        },
        function onSearchCleared( bamInstance ) {
          self.ignorePropChanges = true
          self.latitude = undefined
          self.longitude = undefined
          self.graphicsLayer.removeAll()
          if ( self.context && self.context.onSiteObjectChanged ) {
            const data = { origin: 'mapSearch', data: undefined }
            self.context.onSiteObjectChanged( data )
          }
        },
        self,
        self.geocodeServiceUrl
      )
      const conditionCheck = () => {
        return self.attemptMapSearchControlUpdate()
      }
      const now = new Date().getTime()
      // Attempt to modify the search control's autoComplete positioning attribute
      ACLUtils.runUntilCondition( conditionCheck, now, 100, 8000, _action )
    }
  }

  public attemptMapSearchControlUpdate(): boolean {
    if ( this.searchControl ) {
      const auto = document.querySelector( 'calcite-autocomplete[name="' + this.searchControl.id + '"]' )
      if ( auto ) {
        auto.setAttribute( 'overlay-positioning', 'absolute' )
        return true
      }
    }
    return false
  }

  /*  renderBoundary() - Renders a boundary in the linked map

      data = {
        lat:<latitude>,
        lon:<longitude>,
        geom:<geometry
      }
   */
  public renderBoundary( data: any, preventZoom?: boolean ) {
    if ( this._initialized ) {
      this.graphicsLayer.removeAll()

      this.ignorePropChanges = true
      this.latitude = undefined
      this.longitude = undefined
      this.geometry = data.rings
      this.activeSpatial = data.spatial

      this._renderToMap( true, preventZoom )
    } else {
      this._warnNotInitialized()
    }
  }

  /*  renderLocation() - Renders a location with rings or DT/WT

      data = {
        lat:<latitude>,
        lon:<longitude>,
        bufferType:<type>,
        bufferSizes:<sizes>,
        bufferUnits:<units>
      }
   */
  public renderLocation( data: any, preventZoom?: boolean ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    if ( self._initialized ) {
      if ( !data || !data.lat || !data.lon ) return

      this.graphicsLayer.removeAll()
      // this.restartGraphics()
      self.ignorePropChanges = true
      self.latitude = data.lat
      self.longitude = data.lon
      self.bufferType = data.bufferType as InfoBufferType
      self.bufferUnits = data.bufferUnits
      self.bufferSizes = data.bufferSizes
      self.drivetimeOptions = data.drivetimeOptions
      self.bufferSizesString = JSON.stringify( self.bufferSizes ).replace( '[', '' ).replace( ']', '' )

      function _drawMarker() {
        // Add point location marker to the map
        // Show the found search location dot
        const ptSym = new PictureMarkerSymbol( {
          width: 14,
          height: 26.6,
          xoffset: 0,
          yoffset: 12.6,
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAjCAYAAAB2KjFhAAACtUlEQVRIS+2WS0wTURSG/zvT0kpfkGJ4pGCViA1Em9CtCQVx5QIWhiVRo8GdSNypqHElkcgOlzVh5ap1X6nEiAkQXzGBxkSKtZC0jdTSB7SdMXdwRjudB+w5q5t7T775z3/OzR0CWbT4x90Glh0CMEx43g1C3FIKz6/zhKwDCJYrldBWZIaupSDiqsE/3mBjmGeMyXLF7GiBubEVhmN2sIY6KblS3kO58BvFX5soZrbA7eYCWY67vR2Z2aZJAoyqMTLMvLXN47a1eeRiUSrmUSrmhHSGNYA11oGtMyO3FcVOYnW9xHH9VKUAcw1MfHSc9HktzvYaEN34B6suymSxCwozsQ+ReHi6n7gG7/iNZvv88W6/Ikgdtl+Y2d6I5NfXqJQK/cQ1MPHQ1uZ5oFSeSFdWtn9Ky93b/olsYvURhUWcXef7TPamGmWXfM3oPeVAi8OIeDKLpWgSrxY3qvIY1gjCl5GOvn2jCLOaWUyN9sDX6aj5wNJaErdm3yNbKAlnurCp0W709ThVPQy+i+H+ixV92OlWC+bGe1VB4sHlx2GsxTPayqhPkyNdurB7gRWEFmPasBsXT+D6YIcu7MnLz5gLf9OG0e7Njp3ThV2bXsBSNKUNo518ftML6p1aUK+oZwfqJgVRIAXLg47E1acLgvkHgtGk1kYTJkfOCEMrxnI0hbuBZSTSeWlPd87kaprqeWwkUopVHxqmdTePYMqTdeRZ9d1svzARtLnODlmbO1XvoqpnhMBkaUAhHUM2/iVE6ONrZZjIoZ+6v6BiZhOZ7yufdjjOL7ybesAaZQog+qpX/R6oKayCqYCoKAmmpVCCaYBqYGpAAbabF8z+3yPxh0XsXJUycVPuYWm3IIyAFkhRmRowl/4hdU2uSFOZHFjv7PDm0xtC+9VAmspkwOAOxw1rgWj+H4uVH6hj08HSAAAAAElFTkSuQmCC'
        } )
        const pt = new Point( { longitude: data.lon, latitude: data.lat, spatialReference: self.map.spatialReference } )
        const gr = new Graphic( { geometry: pt, symbol: ptSym } )
        self.graphicsLayer.add( gr )
      }

      this._renderToMap( true, _drawMarker, preventZoom )
    } else {
      this._warnNotInitialized()
    }
  }

  public onDrawnPolygon( e: any ) {
    if ( e.geometry?.type === 'polygon' ) {
      const geometry = e.geometry as __esri.geometry.Polygon

      e.layer.remove( e )

      if ( this.context && this.context.onSiteObjectChanged ) {
        const obj: any = {
          origin: 'drawnPolygon',
          data: {
            latitude: geometry.centroid.latitude,
            longitude: geometry.centroid.longitude,
            rings: geometry.rings,
            spatial: geometry.spatialReference,
            symbol: e.symbol
          }
        }

        this.context.onSiteObjectChanged( obj )
      }
    }
  }

  public onDrawnPoint( e: any ) {
    if ( e.geometry?.type === 'point' ) {
      const geometry = e.geometry as __esri.geometry.Point

      if ( this.context && this.context.onSiteObjectChanged ) {
        // clear temporary graphics
        this.graphicsLayer.removeAll()
        // clear the map search control
        if ( this.searchControl ) { this.searchControl.searchTerm = '' }

        const lat = geometry.latitude
        const lon = geometry.longitude

        // remove drawn point
        e.layer.remove( e )

        // Reverse geocode the map point to get an address
        try {
          Environments.setEnvironment( this.env )
          const creds = this.context.getCredentials()
          const g = new GeocoderClient( creds[1], this.geocodeServiceUrl )
          // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
          const self = this
          g.geocodeUsingApi( lat, lon ).then( ( result ) => {
            if ( self.context && self.context.onSiteObjectChanged ) {
              const obj: any = {
                origin: 'mapClick',
                data: {
                  type: 'click',
                  latitude: geometry.latitude,
                  longitude: geometry.longitude,
                  event: e,
                  //hit: response,
                  title: result.label
                }
              }
              self.context.onSiteObjectChanged( obj )
            }
          },
            ( err ) => {
              console.log( 'GEOCODE ERROR= ', err )
            } )
        } catch ( ex ) {
          console.log( 'GEOCODE Exception:', ex )
        }
      }
    }
  }

  // async GE request to generate drivetime/walktime geometry
  //
  async generateBuffers() {
    //
    let resultObject
    const { sourceCountry } = this.context.props.config

    if ( this.latitude && this.longitude && this.bufferType && this.bufferSizes && this.bufferUnits ) {
      const creds = this.context.getCredentials()
      if ( creds && creds.length === 2 ) {
        TransportUtil.setToken( creds[0], creds[1] )
        Environments.setEnvironment( this.env )

        // Set Geoenrichment Service Url (Proxy) if specified
        if ( this.geoenrichmentServiceUrl ) {
          Environments.setGeoenrichmentUrl( this.geoenrichmentServiceUrl )
        }

        const lat: number = this.latitude
        const lon: number = this.longitude
        if ( this.bufferType === 'drivetime' ) {
          resultObject = await TransportUtil.getBuffers( 'drivetime', sourceCountry, this.bufferUnits, this.bufferSizes, lon, lat, this.drivetimeOptions )
        } else if ( this.bufferType === 'walktime' ) {
          resultObject = await TransportUtil.getBuffers( 'walktime', sourceCountry, this.bufferUnits, this.bufferSizes, lon, lat )
        }
      }
    }
    // remove duplicate results
    const checked = {}
    if ( resultObject && resultObject.length > 0 ) {
      for ( let ii = 0; ii < resultObject.length; ii++ ) {
        const b = resultObject[ii]
        const s: string = b.value as string
        if ( !checked[s] ) { checked[s] = b }
      }
      const keys = Object.keys( checked )
      const filtered = []
      if ( keys && keys.length > 0 ) {
        for ( let jj = 0; jj < keys.length; jj++ ) {
          filtered.push( checked[keys[jj]] )
        }
      }
      resultObject = filtered
    }
    return resultObject
  }

  public reset() {
    this.graphicsLayer.removeAll()

    this.ignorePropChanges = true
    this.latitude = undefined
    this.longitude = undefined
    this.geometry = undefined
  }

  private _drawRings( lat, lon ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    let outerGraphic
    let outerSize: number = 0
    for ( let ii = this.bufferSizes.length - 1; ii >= 0; ii-- ) {
      if ( !isNaN( this.bufferSizes[ii] ) ) {
        // @ts-expect-error: Unreachable code error
        const buffer = new Circle( { center: [lon, lat], geodesic: true, numberOfPoints: 64, radiusUnit: this.bufferUnits, radius: this.bufferSizes[ii] } )
        const symbol = {
          type: 'simple-fill',
          color: this.colors[ii].color,
          style: 'solid',
          outline: this.colors[ii].outline
        }
        const gr = new Graphic( { geometry: buffer, symbol: symbol as __esri.SymbolUnion } )
        if ( this.bufferSizes[ii] > outerSize || !outerGraphic ) {
          outerSize = this.bufferSizes[ii]
          outerGraphic = gr
        }

        this.graphicsLayer.add( gr )
      }
    }
    self.view.goTo( outerGraphic )
  }

  /**  MapActions  _renderToMap() ============================================================
   *
   * @param noClear - if true, the graphicsLayer will not be cleared before render
   *
   * ----------------------------------------------------------------------------------
   */
  private _renderToMap( noClear?: boolean, markerRenderFunc?: any, preventZoom?: boolean, forceBuffers?: boolean ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    // const spatial = self.activeSpatial

    // this.syncSettings()
    if ( !noClear ) {
      // this.restartGraphics()
      self.graphicsLayer.removeAll()
    }
    // reset the buffer change flag since it has rendered in the widget, and
    // we are now going to render in the map
    let renderBuffers = false
    if ( self.context.presetBuffersHaveChanged || forceBuffers ) {
      renderBuffers = true
    }

    function _delay() {
      const lat = self.latitude
      const lon = self.longitude
      const geom = self.geometry
      let centered: boolean = false
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const id = '#' + self.context.props.id

      // Render Buffers
      if ( lat && lon ) {
        // point location  - - - - - - - - - - - - - -
        //
        if ( renderBuffers || self.context.isOkToRenderBuffers() ) {
          // Rings
          if ( self.bufferType === InfoBufferType.ring ) {
            self.view.center = [lon, lat]
            self.view.zoom = 10

            // Render 1 or more buffer rings as temporary graphics on the map.
            self._drawRings( lat, lon )
            centered = true
            //
            // Drivetime or Walktime
          } else {
            // point location with drivetime/walktime buffers - - -
            //
            self.generateBuffers().then(
              function ( data ) {
                if ( !data || data.error ) {
                  console.log( 'map actions generateBuffers: ', data.error )
                } else if ( data.length > 0 ) {
                  let outerPoly
                  for ( let ii = data.length - 1; ii >= 0; ii-- ) {
                    // create map graphics for the drive/walk rings
                    const polygon = {
                      type: 'polygon',
                      rings: data[ii].rings
                    }
                    const simpleFillSymbol = {
                      type: 'simple-fill',
                      color: self.colors[ii].color,
                      outline: self.colors[ii].outline
                    }
                    const polyGraphic = new Graphic( {
                      // @ts-expect-error
                      geometry: polygon,
                      symbol: simpleFillSymbol as __esri.SymbolUnion
                    } )
                    // - - - - - - - - - - - - - - - - - - -
                    // Add dt/wt buffers to the map
                    self.graphicsLayer.add( polyGraphic )
                    if ( !outerPoly ) outerPoly = polyGraphic
                    // - - - - - - - - - - - - - - - - - - -
                  }
                  // console.log('%cDEBUG:  MAP ACTIONS zoom to buffers ', 'color:orange;font-size:11pt', outerPoly)

                  if ( !preventZoom ) {
                    self.view.goTo( outerPoly.geometry )
                  }
                  centered = true

                  if ( markerRenderFunc ) {
                    // eslint-disable-next-line @typescript-eslint/no-implied-eval
                    setTimeout( markerRenderFunc, 0 )
                  }
                }
              },
              function ( err ) {
                console.log( err )
              } )
          }
        }
        // Add point location marker to the map
        // Show the found search location dot
        const ptSym = new PictureMarkerSymbol( {
          width: 14,
          height: 26.6,
          xoffset: 0,
          yoffset: 12.6,
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAjCAYAAAB2KjFhAAACtUlEQVRIS+2WS0wTURSG/zvT0kpfkGJ4pGCViA1Em9CtCQVx5QIWhiVRo8GdSNypqHElkcgOlzVh5ap1X6nEiAkQXzGBxkSKtZC0jdTSB7SdMXdwRjudB+w5q5t7T775z3/OzR0CWbT4x90Glh0CMEx43g1C3FIKz6/zhKwDCJYrldBWZIaupSDiqsE/3mBjmGeMyXLF7GiBubEVhmN2sIY6KblS3kO58BvFX5soZrbA7eYCWY67vR2Z2aZJAoyqMTLMvLXN47a1eeRiUSrmUSrmhHSGNYA11oGtMyO3FcVOYnW9xHH9VKUAcw1MfHSc9HktzvYaEN34B6suymSxCwozsQ+ReHi6n7gG7/iNZvv88W6/Ikgdtl+Y2d6I5NfXqJQK/cQ1MPHQ1uZ5oFSeSFdWtn9Ky93b/olsYvURhUWcXef7TPamGmWXfM3oPeVAi8OIeDKLpWgSrxY3qvIY1gjCl5GOvn2jCLOaWUyN9sDX6aj5wNJaErdm3yNbKAlnurCp0W709ThVPQy+i+H+ixV92OlWC+bGe1VB4sHlx2GsxTPayqhPkyNdurB7gRWEFmPasBsXT+D6YIcu7MnLz5gLf9OG0e7Njp3ThV2bXsBSNKUNo518ftML6p1aUK+oZwfqJgVRIAXLg47E1acLgvkHgtGk1kYTJkfOCEMrxnI0hbuBZSTSeWlPd87kaprqeWwkUopVHxqmdTePYMqTdeRZ9d1svzARtLnODlmbO1XvoqpnhMBkaUAhHUM2/iVE6ONrZZjIoZ+6v6BiZhOZ7yufdjjOL7ybesAaZQog+qpX/R6oKayCqYCoKAmmpVCCaYBqYGpAAbabF8z+3yPxh0XsXJUycVPuYWm3IIyAFkhRmRowl/4hdU2uSFOZHFjv7PDm0xtC+9VAmspkwOAOxw1rgWj+H4uVH6hj08HSAAAAAElFTkSuQmCC'
        } )
        const pt = new Point( { longitude: lon, latitude: lat, spatialReference: self.map.spatialReference } )
        const gr = new Graphic( { geometry: pt, symbol: ptSym } )
        self.graphicsLayer.add( gr )

        if ( !preventZoom ) {
          if ( !centered && lat && lon ) {
            self.view.center = [lon, lat]
            self.view.zoom = 10
          }
        }

        self._allowPropChanges()
      } else if ( geom ) {
        // boundary - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        //
        // console.log( '%c _renderToMap() - spatial ref comparison=', 'color:orange;font-size:11pt', self.graphicsLayer.spatialReference, self.activeSpatial ) // DEBUG ONLY

        const projectedRings = self.projectionCheck( geom, self.activeSpatial, self.graphicsLayer.spatialReference )
        const polygon: any = {
          type: 'polygon',
          rings: projectedRings
        }

        // console.log( '%c _renderToMap() - rendering boundary', 'color:orange;font-size:11pt', geom, self.activeSpatial ) // DEBUG ONLY
        // console.log( '%c _renderToMap() - graphics layer spatial=', 'color:orange;font-size:11pt', self.graphicsLayer.spatialReference ) // DEBUG ONLY


        const simpleFillSymbol = {
          type: 'simple-fill',
          color: self.colors[0].color,
          outline: self.colors[0].outline
        }
        const polyGraphic = new Graphic( {
          geometry: polygon,
          symbol: simpleFillSymbol as __esri.SymbolUnion
        } )
        // Add to map
        self.graphicsLayer.add( polyGraphic )
        if ( !preventZoom ) {
          self.view.goTo( polygon.rings )
        }
      }
    }
    setTimeout( _delay, 0 )
  }

  // Takes rings as input and may re-project to the appropriate spatial reference
  // Returns the re-projected rings or the original rings if no re-projection is needed

  projectionCheck( rings: any, activeSpatial: any, mapSpatial: any ) {
    if ( !activeSpatial || !mapSpatial ) {
      return rings
    }
    let doNothing = true
    let useGeographicConversion = false

    // Check if we have an incoming rings spatial ref and also
    // if the map spatial reference is different from our active spatial reference
    if ( typeof activeSpatial.isGeographic !== "undefined" ) {
    if ( activeSpatial.isGeographic !== mapSpatial.isGeographic ) {
        // spatial refs are different - reprojection needed
        doNothing = false
      if ( activeSpatial.isGeographic ) {
        useGeographicConversion = false
      } else {
        useGeographicConversion = true
      }
    }
    } else if ( typeof mapSpatial.isGeographic !== "undefined" ) {
      // check incoming coordinates since there is no active spatial reference
      if ( rings && rings.length > 0 ) {
        const ringsAreGeo: boolean = BAProjection.isGeographicCoordinate( rings[0][0] )
        if ( ringsAreGeo !== mapSpatial.isGeographic ) {
          doNothing = false
          if ( ringsAreGeo ) {
            // incoming coordinates are geographic and so are map coordinates
            useGeographicConversion = false
          } else {
            useGeographicConversion = true
          }
        }
      } else {
        console.error( 'BA MapActions projectionCheck: invalid rings' )
        return rings
      }
    } else {
      console.error( 'BA MapActions projectionCheck: invalid spatial references' )
      return rings
    }

    if ( !doNothing ) {
    if ( rings && rings.length > 0 ) {
      // the projection module is loaded. Geometries can be re-projected.
      const newRings = []
      rings.forEach( function ( g ) {
        const inner = []
        g.forEach( ( a ) => {
          if ( useGeographicConversion ) {
            const c = BAProjection.pointToGeographic( a[0], a[1] ) // convert to geographic
              inner.push( [c[0], c[1]] )
          } else {
            const c = BAProjection.pointToWebMercator( a[0], a[1] ) // convert to web mercator
              inner.push( [c[0], c[1]] )
          }
        } )
        newRings.push( inner )
      } )
      return newRings
    }
    }
    return rings
  }
}
