class BAProjection {
  fixForLint: string

  constructor () {
    this.fixForLint = ''
  }

  // Converts a point in Web Mercator coordinates (x, y) to geographic coordinates (lon, lat)
  // This is the reverse of pointToWebMercator
  public static pointToGeographic = function (x, y) {
    const limit = 20037508.3427892
    // if the coordinates are already in geographic format, return them as is
    if ( BAProjection.isGeographicCoordinate( [x, y] ) ) {
      return [x, y]
    }
    // prevent converting invalid coordinates
    if ( Math.abs( x ) > limit || Math.abs( y ) > limit ) {
      console.error( 'Invalid Web Mercator coordinates: ', x, y )
      return null
    }
    const d = x / 6378137.0
    const h = d * 57.295779513082323
    const v = Math.floor(((h + 180.0) / 360.0))
    const r = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)))
    const lat = r * 57.295779513082323
    const lon = h - (v * 360.0)

    return [lon, lat]
  }

  // Converts a point in geographic coordinates (lon, lat) to Web Mercator coordinates (x, y)
  public static pointToWebMercator = function ( lon, lat ) {
    // if the coordinates are already in Web Mercator format, return them as is
    if ( BAProjection.isWebMercatorCoordinate( [lon, lat] ) ) {
      return [lon, lat]
    }
    // prevent converting invalid coordinates
    if ((Math.abs(lon) > 180 || Math.abs(lat) > 90)) {
      console.error( 'Invalid geographic coordinates: ', lat, lon )
      return null
    }
    const h = lon * 0.017453292519943295
    const x = 6378137.0 * h
    const d = lat * 0.017453292519943295
    const y = 3189068.5 * Math.log((1.0 + Math.sin(d)) / (1.0 - Math.sin(d)))

    return [x, y]
  }

  // Checks if the given coordinate is a valid Geographic coordinate
  public static isGeographicCoordinate = function ( a ) {
    return Array.isArray( a ) && a.length === 2 && !isNaN( a[0] ) && !isNaN( a[1] )
      ? ( ( Math.abs( a[1] ) <= 90 && Math.abs( a[0] ) <= 180 ) )
      : false
  }
  // Checks if the given coordinate is a valid Web Mercator coordinate

  public static isWebMercatorCoordinate = function ( a ) {
    const limit = 20037508.3427892
    return Array.isArray( a ) && a.length === 2 && !isNaN( a[0] ) && !isNaN( a[1] )
      ? ( Math.abs( a[1] ) > 90 && Math.abs( a[1] ) <= limit && Math.abs( a[0] ) > 180 && Math.abs( a[0] ) <= limit )
      : false
  }
  // Checks if the given coordinate is a valid Geographic or Web Mercator coordinate
  // a can be either a Geographic coordinate (lat, lon) or a Web Mercator coordinate (x, y) array with two numbers

  public static isValidCoordinate = function ( a ) {
    return BAProjection.isGeographicCoordinate( a ) || BAProjection.isWebMercatorCoordinate( a )
  }
}
export default BAProjection
