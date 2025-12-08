import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { DataSourceStatus, type FeatureLayerDataSource, type QueriableDataSource, type FieldSchema, Immutable, UtilityManager } from 'jimu-core'
import type { GeocodeList, GeocodeListItem, SuggestionItem, Suggestion, SearchResultView, RecordResultType, ISpatialReference } from '../../config'
import { DEFAULT_SPATIAL_REFERENCE } from '../../config'
import { checkIsSuggestionRepeat, getSuggestionItem, uniqueJson, getDatasource, changeDsStatus, checkIsDsCreated } from '../utils/utils'
import { OutputDsObjectField, OutputDsAddress } from '../../constants'
import { convertSR, checkIsShouldConvertSR } from './convert-SR'
import type { JimuMapView } from 'jimu-arcgis'
export interface LoadGeocodeRecordsOptions {
  address: string
  maxResultNumber: number
  geocodeList: GeocodeList
}

export interface updateOutputDsRecordsOptions {
  id: string
  address: string
  maxResultNumber: number
  searchResultView: SearchResultView
  geocodeItem: GeocodeListItem
  extent?: __esri.Extent
  jimuMapView?: JimuMapView
}

interface AddressToLocationsOption {
  geocodeItem: GeocodeListItem
  address: string
  maxResultNumber: number
  singleLineFieldName: string
  displayFields?: FieldSchema[]
  addressFields?: FieldSchema[]
  countryCode?: string
  extent?: __esri.Extent
  jimuMapView?: JimuMapView
}

interface LocatorResultType {
  graphics: __esri.GraphicProperties[]
  extent: __esri.Extent
}

export const ObjectIdField = {
  alias: 'OBJECTID',
  type: 'oid',
  name: OutputDsObjectField
}

export const AddressField = {
  alias: 'ADDRESS',
  type: 'string',
  name: OutputDsAddress
}

export const AddressSchema = {
  ...AddressField,
  jimuName: OutputDsAddress
}

/**
 * Get geocode suggestion
*/
export const fetchGeocodeSuggestions = (
  searchText: string,
  serviceListItem: GeocodeListItem,
  extent: __esri.Extent,
  jimuMapView?: JimuMapView
): Promise<Suggestion> => {
  if (!checkIsDsCreated(serviceListItem?.outputDataSourceId) || !serviceListItem?.isSupportSuggest) {
    return Promise.resolve({} as Suggestion)
  }
  return getSuggestion(serviceListItem, searchText, extent, jimuMapView)
}

/**
 * Query and get suggestion element
*/
export const getSuggestion = (geocodeItem: GeocodeListItem, searchText: string, extent: __esri.Extent, jimuMapView?: JimuMapView): Promise<Suggestion> => {
  const loadSuggestOption = {
    geocodeURL: geocodeItem?.geocodeURL,
    address: searchText,
    maxSuggestion: geocodeItem?.maxSuggestions,
    utilityId: geocodeItem?.useUtility?.utilityId,
    countryCode: geocodeItem?.countryCode,
    extent,
    enableLocalSearch: geocodeItem?.enableLocalSearch,
    minScale: geocodeItem?.minScale,
    jimuMapView,
    spatialReference: geocodeItem?.spatialReference || DEFAULT_SPATIAL_REFERENCE
  }
  return loadSuggest(loadSuggestOption).then(res => {
    if (!Array.isArray(res)) {
      return Promise.resolve({
        suggestionItem: [],
        layer: geocodeItem?.label,
        icon: geocodeItem?.icon,
        err: res
      } as Suggestion)
    }
    let searchSuggestion: SuggestionItem[] = []
    res.forEach((addrInfo, index) => {
      const address = addrInfo.text
      if (address && !checkIsSuggestionRepeat(searchSuggestion, address)) {
        const layerSuggestion: SuggestionItem = {
          suggestionHtml: getSuggestionItem(address, searchText),
          suggestion: address,
          configId: geocodeItem?.configId,
          magicKey: addrInfo?.magicKey
        }
        searchSuggestion.push(layerSuggestion)
      }
    })
    searchSuggestion = uniqueJson(searchSuggestion, 'suggestion')
    const suggestion: Suggestion = {
      suggestionItem: searchSuggestion.splice(0, geocodeItem.maxSuggestions),
      layer: geocodeItem?.label,
      icon: geocodeItem?.icon
    }
    return Promise.resolve(suggestion)
  }).catch((error) => {
    return Promise.reject(new Error(error))
  })
}

interface LoadGeocodeRecordsOptionType {
  id: string
  address: string
  maxResultNumber: number
  geocodeItem: GeocodeListItem
  searchResultView: SearchResultView
  extent?: __esri.Extent
  jimuMapView?: JimuMapView
}

/**
 * Load all geocode records
*/
export const loadGeocodeRecords = (options: LoadGeocodeRecordsOptionType) => {
  const { address, maxResultNumber, geocodeItem, searchResultView, extent, jimuMapView, id } = options
  if (!checkIsDsCreated(geocodeItem?.outputDataSourceId)) return
  const outputDs = getDatasource(geocodeItem.outputDataSourceId) as QueriableDataSource
  changeDsStatus(outputDs, DataSourceStatus.NotReady)
  return loadGeocodeRecordsAndUpdateOutputDs({
    address,
    maxResultNumber,
    searchResultView,
    geocodeItem: geocodeItem,
    extent: extent,
    jimuMapView: jimuMapView,
    id
  })
}

/**
 * load data from geocode service and then init outputDs records
*/
export const loadGeocodeRecordsAndUpdateOutputDs = (option: updateOutputDsRecordsOptions) => {
  const { address, maxResultNumber, geocodeItem, extent, jimuMapView, id } = option
  const { outputDataSourceId, singleLineFieldName, defaultAddressFieldName, enableLocalSearch } = geocodeItem
  const outputDs = getDatasource(outputDataSourceId)
  const addressToLocationsOption = {
    geocodeItem: geocodeItem,
    address: address,
    maxResultNumber: maxResultNumber,
    singleLineFieldName: singleLineFieldName,
    addressFields: geocodeItem?.addressFields || [],
    countryCode: geocodeItem?.countryCode,
    extent: extent,
    enableLocalSearch,
    jimuMapView
  }

  return addressToLocations(addressToLocationsOption).then(async (response) => {
    if (!Array.isArray(response)) {
      return Promise.resolve(false)
    }
    const newResponse = response?.filter(res => res?.address)
    const { extent, graphics } = getGraphicsByLocatorResult(newResponse, defaultAddressFieldName)
    const featureLayerDs = outputDs as FeatureLayerDataSource

    const label = geocodeItem?.label || featureLayerDs.getLabel()
    const popupTemplate = getPopupTemplateOfGeocodeDs(geocodeItem?.displayFields, label)

    const setSourceFeaturesOption = {
      id: `${outputDataSourceId}_layer`,
      geometryType: 'point',
      fullExtent: extent
    } as any
    if (popupTemplate) {
      setSourceFeaturesOption.popupTemplate = popupTemplate
    }
    await featureLayerDs.setSourceFeatures(graphics, setSourceFeaturesOption)
    const dsStatus = address ? DataSourceStatus.Unloaded : DataSourceStatus.NotReady
    changeDsStatus(outputDs as QueriableDataSource, dsStatus)

    const defaultQuery = {
      //Because in create-datasource, the 'where' is '2=2', the same ds id, if two places are set to '1=1' and '2=2' respectively,
      //when '1=1', ds goes to load, but before the load is completed, it updates the filter corresponding to this widget id to '2=2', '1=1'. The result is invalid and is cleared.
      //So here we also use '2=2'
      where: '2=2',
      sqlExpression: null,
      pageSize: newResponse?.length,
      outFields: ['*'],
      page: 1,
      returnGeometry: true
    }

    return featureLayerDs.load(defaultQuery, { widgetId: id }).then(res => {
      const records = featureLayerDs.getRecords()
      records.forEach((record, index) => {
        (records[index] as any).__extent = newResponse[index].extent
      })
      return Promise.resolve(DataSourceStatus.Unloaded)
    })
  }).catch((error) => {
    return Promise.reject(new Error(error))
  })
}

function getGraphicsByLocatorResult (response: __esri.AddressCandidate[], defaultAddressFieldName: string): LocatorResultType {
  let extent
  const graphics: __esri.GraphicProperties[] = response?.map((res, index) => {
    const attributes = res.attributes
    attributes.address = res.address
    if (defaultAddressFieldName) {
      attributes[defaultAddressFieldName] = res.address
    }
    attributes.objectid = index
    const newExtent = extent ? extent?.clone() : extent
    extent = newExtent ? newExtent?.union(res.extent?.clone()) : res.extent?.clone()
    const locationPoint = res.location
    const graphic = {
      attributes: attributes,
      geometry: locationPoint
    }
    return graphic
  }) || []

  return {
    graphics,
    extent
  }
}

function getPopupTemplateOfGeocodeDs (displayField: FieldSchema[], label: string) {
  if (!displayField || displayField?.length === 0) return
  const fieldInfo = displayField.map(field => {
    return {
      fieldName: field.name,
      isEditable: false,
      label: field.name,
      visible: true
    }
  })

  const popUpTemplate = {
    content: [
      {
        type: 'fields',
        fieldInfos: fieldInfo
      },
      {
        type: 'attachments',
        displayType: 'auto'
      }
    ],
    title: `${label}: {${displayField[0]?.name}}`
  }
  return popUpTemplate
}

/**
 * Query geocode service and get geocode record
*/
export const addressToLocations = async (addressToLocationsOption: AddressToLocationsOption): Promise<__esri.AddressCandidate[]> => {
  const { geocodeItem, address, maxResultNumber, singleLineFieldName, addressFields, countryCode, extent, jimuMapView } = addressToLocationsOption
  const { geocodeURL, magicKey, useUtility, enableLocalSearch, minScale } = geocodeItem
  const spatialReference = geocodeItem?.spatialReference || DEFAULT_SPATIAL_REFERENCE
  const isShouldConvertSR = checkIsShouldConvertSR(address)
  let SrResult
  if (isShouldConvertSR) {
    SrResult = await convertSR(address)
  }
  return loadArcGISJSAPIModules(['esri/rest/locator', 'esri/geometry/SpatialReference']).then(modules => {
    const [locator, SpatialReference] = modules
    const outSpatialReference = jimuMapView?.view?.spatialReference || new SpatialReference(spatialReference)
    const singleLineKey = singleLineFieldName || 'SingleLine'
    let addressOption = Immutable({
      maxSuggestions: maxResultNumber
    })
    const outFields = addressFields?.map(field => field?.jimuName)?.join(',')
    if (outFields) {
      //Due to the Get request URL length limit, we use '*' here
      addressOption = addressOption.set('outFields', '*')
    }

    const searchAddress = (isShouldConvertSR && SrResult.searchText) ? SrResult.searchText : address
    addressOption = addressOption.setIn([singleLineKey], searchAddress)
    magicKey && (addressOption = addressOption.set('magicKey', magicKey))

    const params = {
      address: addressOption?.asMutable({ deep: true }),
      outSpatialReference: outSpatialReference
    } as any

    if (isShouldConvertSR && SrResult.locationPoint) {
      params.location = SrResult.locationPoint
    } else if (enableLocalSearch) {
      const currentLocation = getLocationByMapView(enableLocalSearch, minScale, jimuMapView)
      if (currentLocation) {
        params.location = currentLocation
      }
    }

    if (countryCode) {
      params.countryCode = countryCode
    }

    if (extent) {
      params.searchExtent = extent.toJSON()
    }

    return locator.addressToLocations(geocodeURL, params, {
      query: {}
    }).then(response => {
      response = response.sort((a, b) => { return b.score - a.score })
      response = response.filter((item) => { return !!item?.location })
      reportUtilitySuccess(useUtility?.utilityId)
      return response
    }, err => {
      console.error(err.message)
      const isReportUtilityState = checkIsReportUtilityState(useUtility?.utilityId, err)
      reportUtilityState(useUtility?.utilityId, err)
      return isReportUtilityState ? err : []
    })
  })
}

interface LoadSuggestOption {
  geocodeURL: string
  address: string
  maxSuggestion: number
  utilityId: string
  countryCode: string
  extent: __esri.Extent
  enableLocalSearch?: boolean
  jimuMapView?: JimuMapView
  minScale?: number
  spatialReference?: ISpatialReference
}
/**
 * Query geocode service suggestion
*/
export const loadSuggest = (options: LoadSuggestOption): Promise<__esri.SuggestionResult[]> => {
  const { geocodeURL, address, maxSuggestion, utilityId, countryCode, extent, enableLocalSearch, jimuMapView, minScale, spatialReference} = options
  return loadArcGISJSAPIModules(['esri/rest/locator', 'esri/geometry/SpatialReference']).then(modules => {
    const [locator, SpatialReference] = modules
    const params = {
      text: address,
      maxSuggestions: maxSuggestion,
      outSpatialReference: jimuMapView?.view?.spatialReference || new SpatialReference(spatialReference)
    }
    if (countryCode) {
      (params as any).countryCode = countryCode
    }
    if (extent) {
      (params as any).searchExtent = extent.toJSON()
    }

    const currentLocation = getLocationByMapView(enableLocalSearch, minScale, jimuMapView)
    if (currentLocation) {
      (params as any).location = currentLocation
    }

    return locator.suggestLocations(geocodeURL, params).then(response => {
      reportUtilitySuccess(utilityId)
      return response || []
    }, err => {
      console.error(err.message)
      const isReportUtilityState = checkIsReportUtilityState(utilityId, err)
      reportUtilityState(utilityId, err)
      return isReportUtilityState ? err : []
    })
  })
}

function getLocationByMapView(enableLocalSearch: boolean, minScale: number, jimuMapView: JimuMapView) {
  if (!enableLocalSearch || !jimuMapView || !minScale) return
  let location
  const currentMapScale = jimuMapView.view?.scale
  const centerPoint = jimuMapView.view?.center
  if (currentMapScale < minScale && centerPoint) {
    location = centerPoint
  }
  return location
}

export function reportUtilitySuccess (utilityId: string) {
  utilityId && UtilityManager.getInstance().reportUtilityState(utilityId, true)
}

export function reportUtilityState (utilityId: string, err?: any) {
  if (!utilityId) return
  const isReportUtilityState = checkIsReportUtilityState(utilityId, err)
  const isSignInError = UtilityManager.getInstance().utilityHasSignInError(utilityId)
  if (isReportUtilityState) {
    UtilityManager.getInstance().reportUtilityState(utilityId, false, isSignInError)
  } else {
    UtilityManager.getInstance().reportUtilityState(utilityId, false)
  }
}

export function checkIsReportUtilityState (utilityId: string, err?: any): boolean {
  const isSignInError = UtilityManager.getInstance().utilityHasSignInError(utilityId)
  let isNoService = err?.details?.httpStatus === 404
  if (err?.details?.httpStatus === 400 && err?.details?.message?.includes('Item does not exist')) {
    isNoService = true
  }
  return isSignInError || isNoService
}

export const getCurrentAddress = (geocodeURL: string, position: GeolocationPosition, spatialReference: ISpatialReference = DEFAULT_SPATIAL_REFERENCE) => {
  // const position = getCurrentLocation()
  if (!position) return Promise.resolve(null)
  return loadArcGISJSAPIModules(['esri/rest/locator', 'esri/geometry/SpatialReference']).then(modules => {
    const [locator, SpatialReference] = modules
    return createPoint(position, spatialReference).then(point => {
      const newSpatialReference = new SpatialReference(spatialReference)
      return locator.locationToAddress(geocodeURL, {
        location: point,
        outSpatialReference: newSpatialReference
      }, {
        query: {}
      }).then(response => {
        return Promise.resolve(response.address)
      }, err => {
        console.error(err.message)
        return Promise.reject(new Error(err.message))
      })
    })
  })
}

/**
 * Get current location
*/
export const getCurrentLocation = (onSuccess: (position) => void, onError) => {
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 3000,
      maximumAge: 10000
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
  } else {
    onError && onError()
  }
}

/**
 * Load geocode records by outputDatasources
*/
export const loadGeocodeOutputRecords = (geocodeItem: GeocodeListItem, resultMaxNumber: number, id: string, isPublishRecordCreateAction: boolean = false): Promise<RecordResultType> => {
  const outputDataSourceId = geocodeItem?.outputDataSourceId
  const ds = getDatasource(geocodeItem?.outputDataSourceId) as QueriableDataSource
  const records = ds?.getRecordsByPage(1, resultMaxNumber)
  return Promise.resolve({
    records: records,
    configId: geocodeItem.configId,
    dsId: outputDataSourceId,
    isGeocodeRecords: true,
    displayFields: geocodeItem?.displayFields,
    zoomScale: geocodeItem?.zoomScale
  })
}

/**
 * Create point by position
*/
export const createPoint = async (position: GeolocationPosition, spatialReference: ISpatialReference = DEFAULT_SPATIAL_REFERENCE): Promise<__esri.Point> => {
  const coords = position && position.coords
  if (!coords) {
    return Promise.resolve(null)
  }
  return loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference']).then(modules => {
    const [Point, SpatialReference] = modules
    const newSpatialReference = new SpatialReference(spatialReference)
    return new Point({
      longitude: coords.longitude,
      latitude: coords.latitude,
      z: coords.altitude || null,
      spatialReference: newSpatialReference
    })
  })
}
