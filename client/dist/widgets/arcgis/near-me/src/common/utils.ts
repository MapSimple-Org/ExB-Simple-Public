import { type DataSource, DataSourceManager, Immutable, DataSourceTypes, type ImmutableObject, getAppStore, loadArcGISJSAPIModule, type IMDataSourceSchema, type FeatureLayerDataSource, type FeatureLayerQueryParams, type FeatureDataRecord } from 'jimu-core'
import { MapViewManager } from 'jimu-arcgis'
import { type SearchSettings, type ColorMatches, type ColorMatchUpdate, type LayersInfo, AnalysisTypeName, type DataSourceOptions, type SaveFeatures } from '../config'

/**
 * Get the combination of colors
 * @param _colorMatches Update the color depending on the color match
 * @param colors Array of colors
 * @returns colors for each fields
 */

export const applyColorMatchColors = (_colorMatches: ColorMatchUpdate | ImmutableObject<ColorMatches>, colors: string[]): ImmutableObject<ColorMatches> => {
  if (!colors) return
  let colorMatches = Immutable({}) as ImmutableObject<ColorMatches>
  Object.entries(_colorMatches).forEach(([name, _match], index) => {
    const color = getColorMatchColor(colors, index)
    const newItem = { ..._match }
    newItem._fillColor = color
    colorMatches = colorMatches.set(name, newItem)
  })
  return colorMatches
}

/**
 * Get color for each element
 * @param colors Array of colors
 * @param index From 0 to number
 * @returns Specific colors
 */

const getColorMatchColor = (colors: string[], index: number = 0): string => {
  if (!colors?.length) return
  const idx = index % colors.length
  const color = colors[idx]
  return color
}

/**
 * Get the instance of current layer datasource
 * @param currentLayerDsId Current layer datasource used
 * @returns layer datasource instance
 */
export const getSelectedLayerInstance = (currentLayerDsId: string): DataSource => {
  return DataSourceManager.getInstance().getDataSource(currentLayerDsId)
}

//Specifies unit wise buffer limits
const enum UnitWiseMaxDistance {
  Feet = 5280000,
  Miles = 1000,
  Kilometers = 1609.344,
  Meters = 1609344,
  Yards = 1760000
}

/**
 * Limits a buffer distance.
 * @param unit Measurement units, e.g., feet, miles, meters
 * @returns The max value for the selected unit,
 */

export const getMaxBufferLimit = (unit: string) => {
  switch (unit) {
    case 'feet':
      return UnitWiseMaxDistance.Feet
    case 'miles':
      return UnitWiseMaxDistance.Miles
    case 'kilometers':
      return UnitWiseMaxDistance.Kilometers
    case 'meters':
      return UnitWiseMaxDistance.Meters
    case 'yards':
      return UnitWiseMaxDistance.Yards
    default:
      return 1000
  }
}

/**
 * Limits the distance to max of the selected unit
 * @param distance Distance subject to limit
 * @param unit Measurement units, e.g., feet, miles, meters
 * @return `distance` capped at the maximum for the `unit` type
 */

export const validateMaxBufferDistance = (distance: number, unit: string) => {
  const maxDistanceForUnit = getMaxBufferLimit(unit)
  if (distance > maxDistanceForUnit) {
    return maxDistanceForUnit
  }
  return distance
}

/**
 * Get all the available layers from the webmap/webscene
 * @param mapViewGroup specifies the map view group of the selected webmap/webscene
 * @returns all available layers
 */
export const getAllAvailableLayers = (mapViewId: string): DataSource[] => {
  let layerInstance = null
  const allDsLayers = []
  let dsAdded = false
  //get the layer views which includes different types layers e.g. map-image, feature layer
  const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(mapViewId)
  const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
  jimuLayerViews?.forEach((layer) => {
    layerInstance = getSelectedLayerInstance(layer.layerDataSourceId)
    if (layerInstance) {
      if (layerInstance?.type === DataSourceTypes.MapService || layerInstance?.type === DataSourceTypes.GroupLayer || layerInstance?.type === DataSourceTypes.SubtypeGroupLayer) {
        const recursiveCheckForGroupLayers = (grpLayer) => {
          const grpChildlayers = grpLayer.getChildDataSources()
          grpChildlayers.forEach((subLayers) => {
            if (subLayers?.type === DataSourceTypes.MapService || subLayers?.type === DataSourceTypes.GroupLayer || subLayers?.type === DataSourceTypes.SubtypeGroupLayer) {
              recursiveCheckForGroupLayers(subLayers)
            } else if (subLayers?.type === DataSourceTypes.FeatureLayer || subLayers?.type === DataSourceTypes.SubtypeSublayer) { //for feature layer
              allDsLayers.push(subLayers)
            }
          })
        }
        recursiveCheckForGroupLayers(layerInstance)
      } else if (layerInstance?.type === DataSourceTypes.FeatureLayer || layerInstance?.type === DataSourceTypes.SubtypeSublayer) { //for feature layer
        if (allDsLayers.length > 0) { //check for if map service child data source is same as feature layer ds id
          const matchedLayerWithMapService = allDsLayers.find(item => item.id === layerInstance.id)
          if (!matchedLayerWithMapService) {
            dsAdded = true
          }
          if (dsAdded) allDsLayers.push(layerInstance)
        } else {
          allDsLayers.push(layerInstance)
        }
      }
    }
  })
  return allDsLayers
}

/**
 * Get the default selected display field for proximity
 * @param layerDs layer datasource
 * @returns displayfield
 */
export const getDisplayField = (layerDs): string => {
  let displayField: string = ''
  const layerDefinition = layerDs?.getLayerDefinition()
  const objectIdFieldByLayerDs = layerDs?.getIdField()
  if (objectIdFieldByLayerDs) {
    displayField = objectIdFieldByLayerDs
  } else if (layerDefinition?.displayField) {
    displayField = layerDefinition.displayField
  } else {
    displayField = layerDefinition?.fields?.[0].name
  }
  return displayField
}

/**
 * Get the display label for groups and feature list
 * @param label group field value or display field value
 * @param noValueNlsString string to be displayed in case of no value
 * @returns display label for groups and feature list
 */
export const getDisplayLabel = (label: any, noValueNlsString: string): string => {
  let title = label
  if (typeof (title) === 'string') {
    title = title.trim()
  }
  return [null, undefined, ''].includes(title) ? noValueNlsString : title
}

/**
 * Get the portal default unit
 * @returns portal default unit
 */
export const getPortalUnit = (): string => {
  const portalSelf = getAppStore().getState().portalSelf
  return portalSelf?.units === 'english' ? 'miles' : 'kilometers'
}

export interface SearchWorkflow {
  searchByLocation: boolean
  searchCurrentExtent: boolean
  showAllFeatures: boolean
}

/**
 * Returns the workflow(SearchBy Location/CurrentExtent/ShowAll) based on search configuration.
 * @param searchSettings from the configuration
 * @returns workflow flags
 */
export const getSearchWorkflow = (searchSettings: SearchSettings): SearchWorkflow => {
  const workflow: SearchWorkflow = {
    searchByLocation: false,
    searchCurrentExtent: false,
    showAllFeatures: false
  }
  if (searchSettings) {
    const { searchByActiveMapArea, includeFeaturesOutsideMapArea } = searchSettings
    // if search by active map area is enabled
    // else search by location is enabled
    if (searchByActiveMapArea) {
      //if searchByActiveMapArea is enabled and includeFeaturesOutsideMapArea means show all features
      //else only search in current extent
      if (includeFeaturesOutsideMapArea) {
        workflow.showAllFeatures = true
      } else {
        workflow.searchCurrentExtent = true
      }
    } else {
      workflow.searchByLocation = true
    }
  }
  return workflow
}

/**
 * Get the output datasource id
 * @param widgetId Widget id
 * @param layerAnalysisType Layer analysis type
 * @param analysisId analysis id
 * @returns output data source id
 */
export const getOutputDsId = (widgetId: string, layerAnalysisType: string, analysisId: string): string => {
  return `${widgetId}_output_${layerAnalysisType}_${analysisId}`
}

/**
 * Get random unique analysis id
 * @returns unique analysis id
 */
export const getUniqueAnalysisId = (): string => {
  return `${Math.random()}`.slice(2).toString()
}

/**
 * Create the html node from symbol using symbol utils methods
 * @param selectedRecord selected record
 * @param symbolRef symbol div reference
 */
export const createSymbol = async (selectedRecord: any, symbolRef: React.RefObject<HTMLDivElement>) => {
  const symbolUtils = await loadArcGISJSAPIModule('esri/symbols/support/symbolUtils')
  symbolUtils.getDisplayedSymbol(selectedRecord.feature as __esri.Graphic).then(async (symbol) => {
    if (symbol.size > 23) {
      symbol.set('size', 23)
    }
    if (selectedRecord.dataSource?.getGeometryType() === 'esriGeometryPoint' && (symbol.height || symbol.width)) {
      if (symbol.height < 15) {
        symbol.set('height', 15)
      }
      if (symbol.width < 15) {
        symbol.set('width', 15)
      }
    }
    const nodeHtml = document.createElement('div')
    nodeHtml.className = 'w-100 h-100 d-flex justify-content-center align-items-center'
    await symbolUtils.renderPreviewHTML(symbol as __esri.symbolsSymbol, {
      node: nodeHtml
    })
    if (symbolRef.current.innerHTML) {
      symbolRef.current.innerHTML = ''
    }
    if (nodeHtml.children?.length) {
      const imgOrSvgElm = nodeHtml.children[0]
      if (imgOrSvgElm) {
        const height = Number(imgOrSvgElm.getAttribute('height'))
        const width = Number(imgOrSvgElm.getAttribute('width'))
        if (width > 30) {
          imgOrSvgElm.setAttribute('width', '30')
        }
        imgOrSvgElm.setAttribute('viewBox', `0 0 ${width} ${height}`)
        symbolRef.current.appendChild(nodeHtml)
      }
    }
  })
}

/**
 * Get all the fields names for the current layer data source
 * @param currentLayerDsId current layer ds id
 * @returns array of all fields names
 */
export const getAllFieldsNames = (currentLayerDsId: string): string[] => {
  const ds: DataSource = getSelectedLayerInstance(currentLayerDsId)
  const dsSchema: IMDataSourceSchema = ds && ds.getSchema()
  const allFieldsDetails = dsSchema?.fields ? Object.values(dsSchema?.fields) : []
  const allFieldsNames: string[] = []
  if (allFieldsDetails && allFieldsDetails.length > 0) {
    allFieldsDetails.forEach(item => {
      allFieldsNames.push(item.jimuName)
    })
  }
  return allFieldsNames
}

/**
 * Get the used data sources for the all the configured data sources
 * @param configInfo config info
 * @param dataSources Current selected dataSource info
 * @returns use data source info
 */
export const getUseDataSourcesForAllDs = (config, dataSources?: DataSourceOptions[]) => {
  const updatedConfigInfo = config
  let usedDataSources = []
  if (!usedDataSources) {
    usedDataSources = []
  }
  //get the current selected ds id's
  let currentDsId: string[] = []
  if (dataSources) {
    currentDsId = dataSources.map(ds => ds.value)
  }
  for (const mapDsId in updatedConfigInfo) {
    //add use data source only for the current ds when dataSources is passed
    if (!dataSources || currentDsId.includes(mapDsId)) {
      const layersInfo: LayersInfo[] = updatedConfigInfo[mapDsId].analysisSettings.layersInfo
      const saveFeatures: SaveFeatures = updatedConfigInfo[mapDsId].analysisSettings.saveFeatures

      layersInfo?.forEach((configLayer) => {
        const analysisInfo = configLayer.analysisInfo as any
        const alreadyUsedDs = usedDataSources.filter((ds) => ds.dataSourceId === configLayer.useDataSource.dataSourceId)
        let useDs = alreadyUsedDs?.length > 0
          ? alreadyUsedDs[0]
          : {
            dataSourceId: configLayer.useDataSource.dataSourceId,
            mainDataSourceId: configLayer.useDataSource.mainDataSourceId,
            rootDataSourceId: mapDsId,
            fields: []
          }
        if (configLayer.useDataSource.dataViewId) {
          useDs = {
            dataSourceId: configLayer.useDataSource.dataSourceId,
            mainDataSourceId: configLayer.useDataSource.mainDataSourceId,
            dataViewId: configLayer.useDataSource.dataViewId,
            rootDataSourceId: mapDsId,
            fields: []
          }
        }

        // Collect fields depending on analysis type
        (analysisInfo.analysisType === AnalysisTypeName.Closest ||
          analysisInfo.analysisType === AnalysisTypeName.Proximity ||
          analysisInfo.analysisType === AnalysisTypeName.Summary) &&
          analysisInfo.fieldsToExport?.length > 0 &&
          (analysisInfo.fieldsToExport.forEach((field) => {
            !useDs.fields.includes(field) && field !== 'esriCTApproxDistance' &&
              useDs.fields.push(field)
          }))

        analysisInfo.analysisType === AnalysisTypeName.Proximity &&
          analysisInfo.displayField?.length > 0 && !useDs.fields.includes(analysisInfo.displayField) && useDs.fields.push(analysisInfo.displayField)
        analysisInfo.sortFeatures?.sortFeaturesByField?.length > 0 && !useDs.fields.includes(analysisInfo.sortFeatures.sortFeaturesByField) && useDs.fields.push(analysisInfo.sortFeatures.sortFeaturesByField)
        analysisInfo.groupFeatures?.groupFeaturesByField?.length > 0 && !useDs.fields.includes(analysisInfo.groupFeatures.groupFeaturesByField) && useDs.fields.push(analysisInfo.groupFeatures.groupFeaturesByField)
        analysisInfo.subGroupFeatures?.subGroupFeaturesByField?.length > 0 && !useDs.fields.includes(analysisInfo.subGroupFeatures.subGroupFeaturesByField) && useDs.fields.push(analysisInfo.subGroupFeatures.subGroupFeaturesByField)

        analysisInfo.analysisType === AnalysisTypeName.Summary &&
          analysisInfo.summaryFields?.forEach((summaryInfo) => {
            summaryInfo.summaryFieldInfo.parts?.forEach((exp) => {
              if (exp.jimuFieldName && !useDs.fields.includes(exp.jimuFieldName)) {
                useDs.fields.push(exp.jimuFieldName)
              }
            })
          })
        alreadyUsedDs.length === 0 && usedDataSources.push(useDs)
      })

      // Save Features
      if (saveFeatures) {
        const featureTypes = ['pointFeature', 'polylineFeature', 'polygonFeature', 'searchAreaFeature']
        featureTypes.forEach((type) => {
          const setting = saveFeatures[type]
          if (setting?.enabled && setting.useDataSource) {
            const alreadyUsedDs = usedDataSources.filter((ds) => ds.dataSourceId === setting.useDataSource.dataSourceId)
            const useDs = alreadyUsedDs?.length > 0 ? alreadyUsedDs[0] :
              {
                dataSourceId: setting.useDataSource.dataSourceId,
                mainDataSourceId: setting.useDataSource.mainDataSourceId,
                rootDataSourceId: mapDsId,
                fields: []
              }
            alreadyUsedDs.length === 0 && usedDataSources.push(useDs)
          }
        })
      }
    }
  }
  return usedDataSources
}

/**
 * Get the complete geometries results
 * @param incompleteGeometriesIds incomplete geometries ids
 * @param spatialRef feature geometry spatial reference
 * @returns all ds ids result
 */
export const getCompleteGeometries = (incompleteGeometriesIds, spatialRef) => {
  const defArr: any[] = []
  const result = {}
  const allDsIds = Object.keys(incompleteGeometriesIds)
  const promise = new Promise((resolve) => {
    allDsIds.forEach((dsLayerId) => {
      const dataSource = DataSourceManager.getInstance().getDataSource(dsLayerId) as FeatureLayerDataSource
      const query: FeatureLayerQueryParams = {}
      query.objectIds = incompleteGeometriesIds[dsLayerId]
      query.returnGeometry = true
      query.returnFullGeometry = true
      query.returnZ = true
      query.outSR = spatialRef
      defArr.push(dataSource.query(query))
    })
    Promise.all(defArr).then((queryResult) => {
      queryResult.forEach((results, index) => {
        if (results?.records.length > 0) {
          const geometryArray = []
          results.records.forEach((record: FeatureDataRecord) => {
            geometryArray.push(record.feature.geometry)
          })
          result[allDsIds[index]] = geometryArray
        }
      })
      resolve(result)
    })
  })
  return promise
}

/**
 * Format number to show significant digits for very small values
 * @param value The numeric value to format
 * @returns Formatted string with appropriate precision
 */
export const formatSmallNumberWithSignificantDigits = (value: number): string => {
  // Handle zero explicitly
  if (value === 0) return "0"

  // For numbers >= 0.01 or <= -0.01, use standard toString
  if (Math.abs(value) >= 0.01) {
    return value.toString()
  }

  // Handle very small numbers (< 0.01)
  const isNegative = value < 0
  const absValue = Math.abs(value)

  // Convert to decimal string, handling scientific notation
  let valueStr: string
  if (absValue < 1e-15) {
    // For extremely small numbers, limit to 15 decimal places max
    const decimalPlaces = Math.min(Math.abs(Math.floor(Math.log10(absValue))) + 1, 15)
    valueStr = absValue.toFixed(decimalPlaces)
  } else if (absValue.toString().includes('e')) {
    // Handle scientific notation
    const decimalPlaces = Math.abs(Math.floor(Math.log10(absValue))) + 5
    valueStr = absValue.toFixed(Math.min(decimalPlaces, 20))
  } else {
    valueStr = absValue.toString()
  }

  const decimalIndex = valueStr.indexOf('.')
  if (decimalIndex === -1) {
    return value.toString()
  }

  const decimalPart = valueStr.substring(decimalIndex + 1)
  let firstNonZeroIndex = -1

  // Find first non-zero digit
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] !== '0') {
      firstNonZeroIndex = i
      break
    }
  }

  if (firstNonZeroIndex === -1) {
    return "0"
  }

  // Show only the first significant digit (truncate after first non-zero)
  const truncatedDecimal = decimalPart.substring(0, firstNonZeroIndex + 1)

  const sign = isNegative ? '-' : ''
  return `${sign}0.${truncatedDecimal}`
}
