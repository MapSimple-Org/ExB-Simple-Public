/** @jsx jsx */
import { React, jsx, css, type DataSourceJson, type URIScheme, dataSourceUtils, esri, requestUtils, DataSourceTypes, ServiceManager, type ServiceDefinition, classNames, defaultMessages as jimuCoreMessages, hooks } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages, Dropdown, DropdownButton, DropdownMenu, DropdownItem, UrlInput, type ValidityResult, type UrlInputResult, Loading, LoadingType } from 'jimu-ui'
// Only used as type.
import type { IItem } from '@esri/arcgis-rest-portal'

import defaultMessages from '../../translations/default'
import type { DataOptions } from '../../types'
import { getLayerInfoFromSingleLayerFeatureService, getNextAddedDataId } from '../../utils'
import { CopyButton } from 'jimu-ui/basic/copy-button'

const dataSourceJsonCreator = dataSourceUtils.dataSourceJsonCreator

export interface UrlInputProps {
  className?: string
  widgetId: string
  multiDataOptions: DataOptions[]
  nextOrder: number
  onChange: (multiDataOptions: DataOptions[]) => void
  setErrorMsg: (msg: string) => void
}

// value is translate key
enum UrlError {
  NotSupportedType = 'addDataErrorNotSupported',
  FailedToFetch = 'invalidResourceItem',
  CannotBeAdded = 'cannotBeAddedError'
}

const { useState, useMemo, useRef } = React

// value is translate key
enum SupportedUrlTypes {
  ArcGISWebService = 'arcgisUrl',
  WMS = 'wmsUrl',
  WMTS = 'wmtsUrl',
  WFS = 'wfsUrl',
  KML = 'kmlUrl',
  CSV = 'csvUrl',
  GeoJSON = 'geojsonUrl'
}

const SampleURL: { [key in SupportedUrlTypes]: string } = {
  [SupportedUrlTypes.ArcGISWebService]: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Cities/FeatureServer/0',
  [SupportedUrlTypes.WMS]: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?service=WMS&request=GetCapabilities',
  [SupportedUrlTypes.WMTS]: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/45134/%7Blevel%7D/%7Brow%7D/%7Bcol%7D',
  [SupportedUrlTypes.WFS]: 'https://dservices.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/services/JapanPrefectures2018/WFSServer',
  [SupportedUrlTypes.KML]: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month_age_animated.kml',
  [SupportedUrlTypes.CSV]: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.csv',
  [SupportedUrlTypes.GeoJSON]: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
}

const SupportedSchemes: URIScheme[] = ['https']

export const DataUrlInput = (props: UrlInputProps) => {
  const { className = '', widgetId, onChange, setErrorMsg, nextOrder, multiDataOptions } = props
  const translate = hooks.useTranslation(jimuCoreMessages, jimuUIMessages, defaultMessages)
  const [selectedUrlType, setSelectedUrlType] = useState<SupportedUrlTypes>(SupportedUrlTypes.ArcGISWebService)
  const [urlResult, setUrlResult] = useState<UrlInputResult>({ value: '', valid: true })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const addingDsJson = useRef<DataSourceJson>(null)

  const dropdownItems = useMemo(() => {
    const items = {} as { [key in SupportedUrlTypes]: string }
    Object.values(SupportedUrlTypes).forEach(key => {
      items[key] = translate(key)
    })
    return items
  }, [translate])

  const onDropdownItemClick = (urlType: SupportedUrlTypes) => {
    if (urlType !== selectedUrlType) {
      setSelectedUrlType(urlType)
      setUrlResult({ value: '', valid: urlResult.valid })
    }
  }

  const checkUrl = (url: string): ValidityResult => {
    const valid = isUrlValid(url, selectedUrlType)
    return { valid, msg: !valid && translate('invalidUrlMessage') }
  }

  const onUrlChange = (result: UrlInputResult) => {
    setUrlResult(result)
  }

  const onAdd = async () => {
    const url = urlResult?.value
    if (!url) {
      return
    }

    try {
      setIsLoading(true)

      const dsJson = await getDsJsonFromUrl(getNextAddedDataId(widgetId, nextOrder), url, selectedUrlType)
      addingDsJson.current = dsJson
      /**
       * Do not allow to add a group layer by URL.
       * Since we can not create a proper JS API layer and add the layer to map without the map service layer.
       */
      if (dsJson.type === DataSourceTypes.GroupLayer) {
        throw new Error(UrlError.CannotBeAdded)
      }
      if (dsJson) {
        onChange(multiDataOptions.concat({ dataSourceJson: dsJson, order: nextOrder }))
      }
    } catch (err) {
      // Show warning.
      if (err.message === UrlError.NotSupportedType) {
        setErrorMsg(translate(UrlError.NotSupportedType))
      } else if (err.message === UrlError.CannotBeAdded) {
        setErrorMsg(translate(UrlError.CannotBeAdded, { layerName: addingDsJson.current?.sourceLabel }))
      } else {
        setErrorMsg(translate(UrlError.FailedToFetch))
      }
    } finally {
      addingDsJson.current = null
      setIsLoading(false)
    }
  }

  const sampleUrlContentId = `add-data-${widgetId}-sample-url-content`

  return <div className={`data-url-input w-100 h-100 p-4 ${className}`} css={style}>
    <div>
      <div className='url-input-label'>
        {translate('urlType')}
      </div>
      <Dropdown className='w-100' activeIcon menuRole='listbox' aria-label={translate('urlType')}>
        <DropdownButton size='sm' className='text-left' role='combobox'>
          {dropdownItems[selectedUrlType]}
        </DropdownButton>
        <DropdownMenu>
          {
            Object.keys(dropdownItems).map((id, index) => {
              return <DropdownItem key={index} active={selectedUrlType === id} onClick={() => { onDropdownItemClick(id as SupportedUrlTypes) }}>{dropdownItems[id]}</DropdownItem>
            })
          }
        </DropdownMenu>
      </Dropdown>
    </div>

    <div className='mt-4'>
      <div className='url-input-label'>
        {translate('url')}
      </div>
      <UrlInput className={classNames({ 'with-error': !urlResult.valid })} height={80} schemes={SupportedSchemes} value={urlResult.value} checkValidityOnChange={checkUrl} checkValidityOnAccept={checkUrl} onChange={onUrlChange} aria-label={translate('url')} />
    </div>

    <div className='mt-4'>
      <Button onClick={onAdd} type='primary' disabled={!urlResult.value || !urlResult.valid} className='px-4 w-100' title={translate('add')} aria-label={translate('add')}>
        {translate('add')}
      </Button>
    </div>

    <div className='mt-4'>
      <div className='url-input-label mb-1 d-flex align-items-center sample-url-title' role='group' aria-label={translate('sampleUrl')}>
        {translate('sampleUrl')}
        <CopyButton text={SampleURL[selectedUrlType]} aria-describedby={sampleUrlContentId} />
      </div>
      <div className='sample-url' id={sampleUrlContentId}>
        {SampleURL[selectedUrlType]}
      </div>
    </div>

    {
      isLoading &&
      <div className='upload-loading-container'>
        <div className='upload-loading-content'>
          <Loading className='upload-loading' type={LoadingType.Primary} width={30} height={28} />
        </div>
      </div>
    }
  </div>
}

function isUrlValid (url: string, urlType: SupportedUrlTypes): boolean {
  if (!url || !urlType) {
    // Do not show error message
    return true
  }
  // If the service is not provided by AGOL or portal, we won't check the url since the service url doesn't have a specific format.
  if (urlType !== SupportedUrlTypes.ArcGISWebService) {
    return /^https:\/\//.test(url)
  } else {
    return dataSourceUtils.isSupportedArcGISService(url) || isSupportedVectorTileStyleJson(url)
  }
}

/**
 * Vector tile service data source is from a vector tile service or a vector tile style json.
 * If is from a style json, the url format will be different. Need to check it separately.
 */
function isSupportedVectorTileStyleJson (url: string): boolean {
  if (!url || !/^https:\/\//.test(url)) {
    return false
  }
  // Item resources url, https://developers.arcgis.com/rest/users-groups-and-items/item-resources.htm .
  return /\/content\/items\/.+\/resources\/styles\/root.json/.test(url)
}

// Services which are not provided by AGOL or portal.
const NonArcGISServiceUrlTypeToDsType = {
  [SupportedUrlTypes.CSV]: DataSourceTypes.CSV,
  [SupportedUrlTypes.GeoJSON]: DataSourceTypes.GeoJSON,
  [SupportedUrlTypes.KML]: DataSourceTypes.KML,
  [SupportedUrlTypes.WFS]: DataSourceTypes.WFS,
  [SupportedUrlTypes.WMS]: DataSourceTypes.WMS,
  [SupportedUrlTypes.WMTS]: DataSourceTypes.WMTS
}

async function getDsJsonFromUrl (dsId: string, url: string, urlType: SupportedUrlTypes): Promise<DataSourceJson> {
  if (!url || !urlType) {
    return Promise.reject(new Error('Need URL.'))
  }

  url = url.replace(/^http:/, 'https:')

  // If the service is not provided by AGOL or portal, we won't check the url.
  if (Object.keys(NonArcGISServiceUrlTypeToDsType).some(nonArcGISServiceUrlType => nonArcGISServiceUrlType === urlType)) {
    return {
      id: dsId,
      type: NonArcGISServiceUrlTypeToDsType[urlType],
      sourceLabel: url.split('?')[0].split('/').filter(c => !!c).reverse()[0],
      url
    }
  } else if (urlType === SupportedUrlTypes.ArcGISWebService) {
    url = url.split('?')[0]
    return isSupportedVectorTileStyleJson(url) ? getDsJsonFromVectorTileStyleJson(url, dsId) : getDsJsonFromArcGISService(url, dsId)
  }

  return Promise.reject(new Error(UrlError.NotSupportedType))
}

async function getDsJsonFromArcGISService (url: string, dsId: string): Promise<DataSourceJson> {
  if (!url || !dsId) {
    return Promise.reject(new Error(UrlError.NotSupportedType))
  }

  const serviceDefinition = await ServiceManager.getInstance().fetchServiceInfo(url).then(res => res.definition)

  let dsJsonUrl = url
  let layerDefinition = serviceDefinition

  /**
   * For feature service, if it is single layer but the url is not end up with layer id, we need to find the single layer and create a feature layer data source, not feature service data source.
   * This is to make single layer feature service item to support 'set filter' action and 'view in table' action.
   */
  if (dataSourceUtils.isSupportedWholeArcGISService(url) && dataSourceJsonCreator.getDataSourceTypeFromArcGISWholeServiceUrl(url) === DataSourceTypes.FeatureService) {
    const serviceUrl = url.split('?')[0].replace(/^http:/, 'https:').replace(/\/$/, '')
    const layerInfo = await getLayerInfoFromSingleLayerFeatureService(serviceUrl, serviceDefinition)
    if (layerInfo) {
      dsJsonUrl = layerInfo.url
      layerDefinition = layerInfo.layerDefinition
    }
  }

  return getSingleDsJsonFromArcGISServiceDefinition(dsId, dsJsonUrl, layerDefinition)
}

function getSingleDsJsonFromArcGISServiceDefinition (dsId: string, url: string, serviceDefinition: ServiceDefinition): DataSourceJson {
  const dsJson: DataSourceJson = dataSourceJsonCreator.createDataSourceJsonByLayerDefinition(dsId, serviceDefinition, url)?.asMutable({ deep: true })

  if (!dsJson) {
    throw new Error(UrlError.FailedToFetch)
  } else {
    return dsJson
  }
}

async function getDsJsonFromVectorTileStyleJson (url: string, dsId: string): Promise<DataSourceJson> {
  if (!url || !dsId) {
    return Promise.reject(new Error(UrlError.NotSupportedType))
  }

  const portalUrl = url.match(new RegExp('(?<portalUrl>.+)content\/items\/.+\/resources\/styles\/root.json')).groups.portalUrl
  const itemId = url.match(new RegExp('.+\/content\/items\/(?<itemId>.+)\/resources\/styles\/root.json')).groups.itemId
  const itemInfo: IItem = await requestUtils.requestWrapper(portalUrl, (session) => {
    return esri.restPortal.getItem(itemId, {
      portal: portalUrl,
      authentication: session
    })
  })
  if (itemInfo.type !== 'Vector Tile Service') {
    return Promise.reject(new Error(UrlError.NotSupportedType))
  }
  return {
    id: dsId,
    type: DataSourceTypes.VectorTileService,
    sourceLabel: itemInfo.title,
    url,
    itemId,
    portalUrl: portalUrl.replace('/sharing/rest/', '')
  }
}

const style = css`
  position: relative;
  overflow: auto;

  .upload-loading-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
  .upload-loading-content {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .sample-url {
    font-style: italic;
    font-weight: 400;
    font-size: 13px;
    word-break: break-all;
    color: var(--sys-color-surface-overlay-text);
  }

  .url-input.with-error {
    margin-bottom: 60px;
  }
  .url-input-label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--sys-color-surface-overlay-text);
  }
  .sample-url-title {
    justify-content: space-between;
  }
  .jimu-dropdown-button {
    color: var(--sys-color-surface-overlay-text);
  }
`
