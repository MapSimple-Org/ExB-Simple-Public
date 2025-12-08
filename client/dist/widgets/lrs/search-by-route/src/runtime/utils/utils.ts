import type { IntlShape, FeatureLayerDataSource, ImmutableArray } from 'jimu-core'
import { derivedFields, distanceField, GetUnits, Identifiers, isDefined, type LrsLayer, measureFields, SearchMeasuresType, SearchMethod, stationField, toRouteField } from 'widgets/shared-code/lrs'
import type { ImmutableObject } from 'seamless-immutable'

/**
 * Converts a station value (ie 100+00 or 100+000) to a numerical value. If
 * the value is not a valid station value, NaN is returned.
*/
export function convertStationToNumber (station: string): number {
  const stationFeetRegExp: RegExp = /^-?\d+\+\d{2}(\.\d+)?$/g
  const stationMeterRegExp: RegExp = /^-?\d+\+\d{3}(\.\d+)?$/g
  if (station != null && stationFeetRegExp.test(station)) {
    const isNegative = station.charAt(0) === '-'
    const valuesArray = station.split('+')
    let parsedValue = parseInt(valuesArray[0], 10) * 100
    if (isNaN(parsedValue)) {
      parsedValue = NaN
    } else if (valuesArray.length === 2) {
      if (isNegative) {
        parsedValue -= parseFloat(valuesArray[1])
      } else {
        parsedValue += parseFloat(valuesArray[1])
      }
    }
    return parsedValue
  } else if (station != null && stationMeterRegExp.test(station)) {
    const isNegative = station.charAt(0) === '-'
    const valuesArray = station.split('+')
    let parsedValue = parseInt(valuesArray[0], 10) * 1000
    if (isNaN(parsedValue)) {
      parsedValue = NaN
    } else if (valuesArray.length === 2) {
      if (isNegative) {
        parsedValue -= parseFloat(valuesArray[1])
      } else {
        parsedValue += parseFloat(valuesArray[1])
      }
    }
    return parsedValue
  }
  return NaN
}

/**
 * Returns the popup template for an individual record.
 */
// eslint-disable-next-line max-params
export function getPopupTemplate (intl: IntlShape, record: __esri.Graphic, outputDS: FeatureLayerDataSource, lrsLayer: ImmutableObject<LrsLayer>, selectedMethod: string, measureType: string, lrsLayers: ImmutableArray<LrsLayer>) {
  const allFieldsSchema = outputDS.getSchema()
  const fields = allFieldsSchema?.fields ? Object.values(allFieldsSchema.fields) : []
  const lrsNetworkId = lrsLayer.networkInfo.lrsNetworkId.toString()
  const derivedNetwork = lrsLayers.find(item => (item.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
  const showAdditionalFields = lrsLayer.networkInfo.showAdditionalFields
  let fieldsToDisplay
  if (showAdditionalFields) {
    fieldsToDisplay = getNetworkFieldNamesForDisplay(lrsLayer, record, selectedMethod, derivedNetwork)
    if (fieldsToDisplay.length === 0) {
      fieldsToDisplay = getSortFieldsToDisplay(lrsLayer.networkInfo, record, selectedMethod, derivedNetwork)
    }
  } else {
    fieldsToDisplay = getNetworkFieldNamesForDisplayOrig(lrsLayer, record, selectedMethod)
  }

  // check if the route is spanning
  const toRouteId = toRouteField.at(0).value
  let resultTitle = `{${getNetworkTitleField(lrsLayer)}}`
  if (selectedMethod === SearchMethod.LineAndMeasure && measureType === SearchMeasuresType.Range && record.attributes[toRouteId]) {
    resultTitle = getNetworkTitleSpanning(lrsLayer, record)
  }

  if (fields) {
    const fieldInfos = []
    fieldsToDisplay.forEach((fieldAlias) => {
      const fieldInfo = fields.find(fieldInfo => fieldInfo.alias === fieldAlias)
      if (isDefined(fieldInfo)) {
        if (fieldAlias === distanceField.value) {
          // Add units to the Distance label.  For GCS, we show meters.  For PCS, we show units of XY tolerance.
          const dataSource: any = outputDS.getOriginDataSources()[0]
          const xyUnits = dataSource?.layerDefinition?.geometryProperties?.units
          const isGeographic = xyUnits === 'esriDecimalDegrees'
          fieldInfos.push({
            fieldName: fieldInfo.name,
            // i18n TODO: add string to resource file
            label: fieldInfo.alias + (isGeographic ? ' (' + GetUnits('esriMeters', intl) + ')' : (isDefined(xyUnits) ? ' (' + GetUnits(xyUnits, intl) + ')' : ''))
          })
        } else {
          fieldInfos.push({
            fieldName: fieldInfo.name,
            label: fieldInfo.alias
          })
        }
      }
    })
    return {
      fieldInfos,
      content: [{
        type: 'fields'
      }],
      title: resultTitle
    }
  } else {
    return null
  }
}

/**
 * Gets the fields that will be displayed in the popup template. Excludes to measure, stations, and distance fields
 * if they are not populated.
 * */
function getNetworkFieldNamesForDisplayOrig (lrsLayer: ImmutableObject<LrsLayer>, record: __esri.Graphic, selectedMethod: string): string[] {
  const fieldNames: string[] = []

  // There will always be a routeId.
  fieldNames.push(lrsLayer.networkInfo.routeIdFieldSchema.alias)

  // Include network name if configured.
  if (lrsLayer.networkInfo.useRouteName) {
    fieldNames.push(lrsLayer.networkInfo.routeNameFieldSchema.alias)
  }

  // If multi field configuration is selected, display each field.
  if (lrsLayer.networkInfo.defaultIdentifer === Identifiers.MultiField) {
    lrsLayer.networkInfo.routeIdFields.forEach((item) => {
      fieldNames.push(item.field.alias)
    })
  }

  const toMeasure = record.attributes[measureFields.at(1).value]
  const station = record.attributes[stationField.at(0).value]
  const fromStation = record.attributes[stationField.at(1).value]
  const toStation = record.attributes[stationField.at(2).value]
  const distance = record.attributes[distanceField.value]
  const toRouteId = record.attributes[toRouteField.at(0).value]

  // Include from measures.
  fieldNames.push(measureFields.at(0).value)

  // Include to measure on the top if not a spanning route
  if (toRouteId === null || toRouteId === undefined) {
    // Include to measures.
    if (!isNaN(toMeasure) && toMeasure !== null && toMeasure !== undefined) {
      fieldNames.push(measureFields.at(1).value)
    }
  }

  // Include station and distance fields.
  if (station !== null && station !== undefined) {
    fieldNames.push(stationField.at(0).value)
  }
  if (fromStation !== null && fromStation !== undefined) {
    fieldNames.push(stationField.at(1).value)
  }
  if (toStation !== null && toStation !== undefined) {
    fieldNames.push(stationField.at(2).value)
  }
  if (distance !== null && distance !== undefined) {
    fieldNames.push(distanceField.value)
  }

  // Include the date fields.
  if (lrsLayer.networkInfo.fromDateFieldName) {
    fieldNames.push(lrsLayer.networkInfo.fromDateFieldSchema.alias)
  }
  if (lrsLayer.networkInfo.toDateFieldName) {
    fieldNames.push(lrsLayer.networkInfo.toDateFieldSchema.alias)
  }

  if (selectedMethod === SearchMethod.LineAndMeasure) {
    // Include the line fields for search by line and measure
    if (lrsLayer.networkInfo.lineIdFieldName) {
      fieldNames.push(lrsLayer.networkInfo.lineIdFieldSchema.alias)
    }
    if (lrsLayer.networkInfo.lineNameFieldName) {
      fieldNames.push(lrsLayer.networkInfo.lineNameFieldSchema.alias)
    }
    if (lrsLayer.networkInfo.lineOrderFieldName) {
      fieldNames.push(lrsLayer.networkInfo.lineOrderFieldSchema.alias)
    }
    // Include the to route details for spanning routes
    if (toRouteId !== null && toRouteId !== undefined) {
      fieldNames.push(toRouteField.at(0)?.value)
      // Include to measures.
      if (!isNaN(toMeasure) && toMeasure !== null && toMeasure !== undefined) {
        fieldNames.push(measureFields.at(1).value)
      }
      fieldNames.push(toRouteField.at(1)?.value)
      fieldNames.push(toRouteField.at(2)?.value)
      fieldNames.push(toRouteField.at(3)?.value)
      fieldNames.push(toRouteField.at(4)?.value)
    }
  }

  return fieldNames
}

export function getSortFieldsToDisplay (networkItem, record, selectedMethod, derivedNetwork) {
  const fieldNames: string[] = []
  const routeNameAlias = networkItem.routeNameFieldSchema.alias
  const routeIdAlias = networkItem.routeIdFieldSchema.alias
  if (routeNameAlias) fieldNames.push(routeNameAlias)
  else fieldNames.push(routeIdAlias)
  return fieldNames
}

export function getToleranceInMapCoords (jimuMapView, pixelTolerance: number = 5): number {
  //calculate map coords represented per pixel
  const viewExtentWidth: number = jimuMapView.view.extent.width
  const viewWidth: number = jimuMapView.view.width
  const pixelWidth = viewExtentWidth / viewWidth
  //calculate map coords for tolerance in pixel
  return pixelTolerance * pixelWidth
}

/**
 * Gets the fields that will be displayed in the popup template. Excludes to measure, stations, and distance fields
 * if they are not populated.
 * */
function getNetworkFieldNamesForDisplay (lrsLayer: ImmutableObject<LrsLayer>, record: __esri.Graphic, selectedMethod: string, derivedNetwork): string[] | string {
  const fieldNames: string[] = []
  const lrsDisplayFields = lrsLayer.networkInfo.lrsFields
  const nonLrsDisplayFields = lrsLayer.networkInfo.additionalFields
  const allFields = lrsLayer.networkInfo.layerFields

  if (!lrsDisplayFields || !nonLrsDisplayFields) return 'additionalFieldsNotConfig'

  // There will always be a routeId.
  if (lrsDisplayFields.includes(lrsLayer.networkInfo.routeIdFieldSchema.jimuName)) fieldNames.push(lrsLayer.networkInfo.routeIdFieldSchema.alias)

  // Include network name if configured.
  if (lrsLayer.networkInfo.useRouteName && lrsDisplayFields.includes(lrsLayer.networkInfo.routeNameFieldSchema.jimuName)) {
    fieldNames.push(lrsLayer.networkInfo.routeNameFieldSchema.alias)
  }

  const excludeFields = [lrsLayer.networkInfo.lineIdFieldName, lrsLayer.networkInfo.lineNameFieldName, lrsLayer.networkInfo.lineOrderFieldName]

  allFields.forEach((field) => {
    const jimuFieldName = field.jimuName
    if (!excludeFields.includes(jimuFieldName) && lrsDisplayFields.includes(jimuFieldName) &&
      (!fieldNames.includes(field.alias))) {
      fieldNames.push(field.alias)
    }
  })

  // If multi field configuration is selected, display each field.
  if (lrsLayer.networkInfo.defaultIdentifer === Identifiers.MultiField) {
    lrsLayer.networkInfo.routeIdFields.forEach((item) => {
      const fieldName = item.field.jimuName
      if (lrsDisplayFields.includes(fieldName)) fieldNames.push(item.field.alias)
    })
  }

  const toMeasure = record.attributes[measureFields.at(1).value]
  const station = record.attributes[stationField.at(0).value]
  const fromStation = record.attributes[stationField.at(1).value]
  const toStation = record.attributes[stationField.at(2).value]
  const distance = record.attributes[distanceField.value]
  const toRouteId = record.attributes[toRouteField.at(0).value]

  // Include from and to measures.
  if (nonLrsDisplayFields.includes(measureFields.at(0).value)) fieldNames.push(measureFields.at(0).value)
  if (!isNaN(toMeasure) && toMeasure !== null && toMeasure !== undefined && (nonLrsDisplayFields.includes(measureFields.at(1).value))) {
    fieldNames.push(measureFields.at(1).value)
  }

  // Include station and distance fields.
  if (station !== null && station !== undefined && (nonLrsDisplayFields.includes(stationField.at(0).value))) {
    fieldNames.push(stationField.at(0).value)
  }
  if (fromStation !== null && fromStation !== undefined && (nonLrsDisplayFields.includes(stationField.at(1).value))) {
    fieldNames.push(stationField.at(1).value)
  }
  if (toStation !== null && toStation !== undefined && (nonLrsDisplayFields.includes(stationField.at(2).value))) {
    fieldNames.push(stationField.at(2).value)
  }
  if (distance !== null && distance !== undefined && (nonLrsDisplayFields.includes(distanceField.value))) {
    fieldNames.push(distanceField.value)
  }

  // Include derived fields.
  if (isDefined(derivedNetwork)) {
    if (nonLrsDisplayFields.includes(derivedFields.at(0).value)) fieldNames.push(derivedFields.at(0).value)
    if (nonLrsDisplayFields.includes(derivedFields.at(1).value))fieldNames.push(derivedFields.at(1).value)
    if (nonLrsDisplayFields.includes(derivedFields.at(2).value))fieldNames.push(derivedFields.at(2).value)
    if (nonLrsDisplayFields.includes(derivedFields.at(3).value))fieldNames.push(derivedFields.at(3).value)
  }
  if (selectedMethod === SearchMethod.LineAndMeasure) {
    // Include the line fields for search by line and measure
    if (lrsLayer.networkInfo.lineIdFieldName && lrsDisplayFields.includes(lrsLayer.networkInfo.lineIdFieldName)) {
      fieldNames.push(lrsLayer.networkInfo.lineIdFieldSchema.alias)
    }
    if (lrsLayer.networkInfo.lineNameFieldName && lrsDisplayFields.includes(lrsLayer.networkInfo.lineNameFieldName)) {
      fieldNames.push(lrsLayer.networkInfo.lineNameFieldSchema.alias)
    }
    if (lrsLayer.networkInfo.lineOrderFieldName && lrsDisplayFields.includes(lrsLayer.networkInfo.lineOrderFieldName)) {
      fieldNames.push(lrsLayer.networkInfo.lineOrderFieldSchema.alias)
    }
    // Include the to route details
    if (toRouteId !== null && toRouteId !== undefined) {
      if (nonLrsDisplayFields.includes(toRouteField.at(0).value)) fieldNames.push(toRouteField.at(0)?.value)
      if (nonLrsDisplayFields.includes(toRouteField.at(1).value)) fieldNames.push(toRouteField.at(1)?.value)
      if (nonLrsDisplayFields.includes(toRouteField.at(2).value)) fieldNames.push(toRouteField.at(2)?.value)
      if (nonLrsDisplayFields.includes(toRouteField.at(3).value)) fieldNames.push(toRouteField.at(3)?.value)
      if (nonLrsDisplayFields.includes(toRouteField.at(4).value)) fieldNames.push(toRouteField.at(4)?.value)
    }
  }

  return fieldNames
}

function getNetworkTitleField (lrsLayer: ImmutableObject<LrsLayer>): string {
  // Use route name field as the display if configured.
  if (lrsLayer.networkInfo.defaultIdentifer === Identifiers.RouteName) {
    return lrsLayer.networkInfo.routeNameFieldSchema.jimuName
  }

  // All other cases use route id.
  return lrsLayer.networkInfo.routeIdFieldSchema.jimuName
}

function getNetworkTitleSpanning (lrsLayer: ImmutableObject<LrsLayer>, record: __esri.Graphic): string {
  const toRouteId = record.attributes[toRouteField.at(0).value]
  const toRouteName = record.attributes[toRouteField.at(1).value]
  const routeName = lrsLayer.networkInfo.routeNameFieldSchema && record.attributes[lrsLayer.networkInfo.routeNameFieldSchema.jimuName]
  const routeId = lrsLayer.networkInfo.routeIdFieldSchema && record.attributes[lrsLayer.networkInfo.routeIdFieldSchema.jimuName]

  // Use route name field as the display if configured.
  if ((lrsLayer.networkInfo.defaultIdentifer === Identifiers.RouteName) && routeName && toRouteName) {
    return routeName + ' - ' + toRouteName
  }

  // All other cases use route id.
  return routeId + ' - ' + toRouteId
}

/**
 * Creates the label expression used for the label layer.
 */
export function createLabelExpression (lrsLayer: ImmutableObject<LrsLayer>, isPoint: boolean): string {
  let expression = ''
  if (isPoint) {
    if (lrsLayer.networkInfo.useRouteName) {
      expression = `'${lrsLayer.networkInfo.routeNameFieldSchema.alias}: ' + $feature.${lrsLayer.networkInfo.routeNameFieldSchema.name} + textformatting.NewLine +
                    '${measureFields.at(0).label}: ' + $feature.Measure`
    } else {
      expression = `'${lrsLayer.networkInfo.routeIdFieldSchema.alias}: ' + $feature.${lrsLayer.networkInfo.routeIdFieldSchema.name} + textformatting.NewLine +
                    '${measureFields.at(0).label}: ' + $feature.Measure`
    }
  } else {
    if (lrsLayer.networkInfo.useRouteName) {
      expression = `'${lrsLayer.networkInfo.routeNameFieldSchema.alias}: ' + $feature.${lrsLayer.networkInfo.routeNameFieldSchema.name} + textformatting.NewLine +
                    '${measureFields.at(0).label}: ' + $feature.Measure + textformatting.NewLine +
                    '${measureFields.at(1).label}: ' + $feature.ToMeasure`
    } else {
      expression = `'${lrsLayer.networkInfo.routeIdFieldSchema.alias}: ' + $feature.${lrsLayer.networkInfo.routeIdFieldSchema.name} + textformatting.NewLine +
                    '${measureFields.at(0).label}: ' + $feature.Measure + textformatting.NewLine +
                    '${measureFields.at(1).label}: ' + $feature.ToMeasure`
    }
  }
  return expression
}

export function getLabelFields (fields: __esri.Field[]): __esri.Field[] {
  if (!fields || fields.length === 0) {
    return fields
  }

  const fieldCopy = [...fields]
  const hasMeasureField = fieldCopy.find(field => field.name === measureFields.at(0).value)
  if (!isDefined(hasMeasureField)) {
    const measureField = fields.at(0).clone()
    measureField.name = measureFields.at(0).value
    measureField.alias = measureFields.at(0).label
    measureField.type = 'double'
    measureField.nullable = true
    measureField.editable = true
    fieldCopy.push(measureField)
  }

  const hasToMeasureField = fieldCopy.find(field => field.name === measureFields.at(1).value)
  if (!isDefined(hasToMeasureField)) {
    const toMeasureField = fields.at(0).clone()
    toMeasureField.name = measureFields.at(1).value
    toMeasureField.alias = measureFields.at(1).label
    toMeasureField.type = 'double'
    toMeasureField.nullable = true
    toMeasureField.editable = true
    fieldCopy.push(toMeasureField)
  }

  return fieldCopy
}

/**
 * Returns a set of unique dates in sorted order.
 */
export function getUniqueDates (dates: Date[]): Date[] {
  const uniqueTimesSet = new Set<number>()
  dates.forEach((interval) => {
    if (interval.valueOf() === 0) {
      return
    }

    if (!uniqueTimesSet.has(interval.valueOf())) {
      uniqueTimesSet.add(interval.valueOf())
    }
  })

  const allTimeAsDates = Array.from(uniqueTimesSet).map((date) => new Date(date))
  return Array.from(allTimeAsDates).sort((a, b) => a.getTime() - b.getTime())
}
