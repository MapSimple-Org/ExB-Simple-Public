import { ACLUtils } from '../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/ACLUtils'

interface Hierarchy {
  ID: string
  alias: string
  default: boolean
  geographyLevels: any
}
/** getCountries
 *      Returns data from GE for all countries (includes hierarchies)
 */
export const getCountries = async ( langCode: string, geUrl: string, token?: string ) => {
  if ( !langCode || !geUrl ) { throw new Error( 'invalid args' ) }

  let countriesUrl = geUrl + '/Geoenrichment/countries?f=pjson&appID=esriexperiencebuilder&langCode=' + langCode
  if ( token && ACLUtils.hasText( token ) && token !== 'undefined' ) {
    countriesUrl = countriesUrl + '&token=' + token
  }

  const response: any = await fetch( countriesUrl )
  const data = await response.json()
  if ( data?.error && data.error.message && data.error.message.includes( 'Invalid token' ) ) {
    console.log( '%c ERROR: getCountries invalid token, request failed', 'color:red;font-size:10pt;', token )
    throw new Error( 'invalid token' )
  }
  return data.countries
}

/** getValidHierarchies
 *      Returns an array of valid hierarchies for a given country.  The 'countryData' is
 *      the result from a call to 'getCountries()'
 */
export const getValidHierarchies = ( country: string, countryData: any ) => {
  if ( !country || !countryData ) { throw new Error( 'invalid args' ) }

  const hierarchies: Hierarchy[] = []

  const countryInfo = countryData.find( o => o.id === country )
  if ( countryInfo && countryInfo.hierarchies ) {
    for ( let ii = 0; ii < countryInfo.hierarchies.length; ii++ ) {
      const h = countryInfo.hierarchies[ii]
      // filter out landscape hierarchy
      if ( h.ID !== 'landscape' ) {
        hierarchies.push( { ID: h.ID, alias: h.alias, default: h.default, geographyLevels: h.levelsInfo?.geographyLevels } as Hierarchy )
      }
    }
  }
  return hierarchies
}
export const getActiveHierarchyId = ( selectedHierarchy: string, useLatestFlag: boolean ): string => {
  if ( !selectedHierarchy ) { throw new Error( 'invalid args' ) }
  if ( useLatestFlag ) {
    // If using latest flag, find the latest hierarchy ID
    return ( '' )
  }
  return selectedHierarchy
}

export const getLatestHierarchyID = ( country: string, countries: any ): string => {
  // TODO: find the country and return the ID of the most recent hierarchy
  // Note: the hierarchy 'dataVintage' has the year to compare
  let result = ''
  if ( country && ACLUtils.hasText( country ) && countries && countries.length > 0 ) {
    const c = countries.find( d => d.id === country )
    if ( c ) {
      const arr = c.hierarchies
      if ( arr && arr.length > 0 ) {
        let latest = ''
        for ( let ii = 0; ii < arr.length; ii++ ) {
          const h = arr[ii]
          if ( h.ID !== 'landscape' ) {
            if ( latest === '' ) {
              latest = h.dataVintage
              result = h.ID
            } else {
              const a = parseInt( latest )
              const b = parseInt( h.dataVintage )
              if ( b > a ) {
                latest = h.dataVintage
                result = h.ID
              }
            }
          }
        }
      }
    }
  }
  return result
}
