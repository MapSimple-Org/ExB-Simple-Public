import { type LrsLayer, type NetworkInfo, createFeatureLayer, createField, findFieldByName, findFieldByType, getExistingFieldNames, getLayer, isDefined, resolveFieldName } from 'widgets/shared-code/lrs'
import type { SubtypeLayers, AttributeSetParam, QueryAttributeSetResults } from '../../config'
import { type ImmutableArray, type ImmutableObject, loadArcGISJSAPIModules } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { DynSegFields } from '../../constants'

export async function createDynSegFeatureLayer (
  networkInfo: ImmutableObject<NetworkInfo>,
  lrsLayer: ImmutableArray<LrsLayer>,
  attributeSet: AttributeSetParam[],
  jimuMapView: JimuMapView
): Promise<__esri.FeatureLayer> {
  if (!isDefined(networkInfo) || !isDefined(lrsLayer) || !isDefined(jimuMapView)) {
    return null
  }

  const fields = await cloneFields(networkInfo, lrsLayer, attributeSet)
  return await createFeatureLayer(fields, 'polyline', 'hide', jimuMapView, 'dynamic-segmentation', false)
}

export async function cloneFields (
  networkInfo: ImmutableObject<NetworkInfo>,
  lrsLayer: ImmutableArray<LrsLayer>,
  attributeSet: AttributeSetParam[]
): Promise<__esri.Field[]> {
  const fields: __esri.Field[] = []
  const existingFieldNames = getExistingFieldNames()
  const network = lrsLayer.find((layer) => isDefined(layer.networkInfo) && layer.networkInfo.datasetName === networkInfo.datasetName)
  return await getLayer(network.useDataSource).then(async (networkLayer) => {
    // Add object id
    const objectIdField = findFieldByType(networkLayer.fields, 'oid')
    if (isDefined(objectIdField)) {
      existingFieldNames.push(objectIdField.name.toUpperCase())
      fields.push(objectIdField)
    }

    // Add shape field
    const shapeField = findFieldByType(networkLayer.fields, 'geometry')
    if (isDefined(shapeField)) {
      existingFieldNames.push(shapeField.name.toUpperCase())
      fields.push(shapeField)
    }

    const routeId = await createField(DynSegFields.routeIdName, DynSegFields.routeIdAlias, 'string', true)
    existingFieldNames.push(routeId.name.toUpperCase())
    fields.push(routeId)

    const fromDate = await createField(DynSegFields.fromDateName, DynSegFields.fromDateAlias, 'date', true)
    existingFieldNames.push(fromDate.name.toUpperCase())
    fields.push(fromDate)

    const toDate = await createField(DynSegFields.toDateName, DynSegFields.toDateAlias, 'date', true)
    existingFieldNames.push(toDate.name.toUpperCase())
    fields.push(toDate)

    const fromMeasure = await createField(DynSegFields.fromMeasureName, DynSegFields.fromMeasureAlias, 'double', true)
    existingFieldNames.push(fromMeasure.name.toUpperCase())
    fields.push(fromMeasure)

    const toMeasure = await createField(DynSegFields.toMeasureName, DynSegFields.toMeasureAlias, 'double', true)
    existingFieldNames.push(toMeasure.name.toUpperCase())
    fields.push(toMeasure)

    const type = await createField(DynSegFields.typeName, DynSegFields.typeAlias, 'string', true)
    existingFieldNames.push(type.name.toUpperCase())
    fields.push(type)

    attributeSet.forEach(async (set) => {
      const event = lrsLayer.find((layer) => layer.serviceId.toString() === set.layerId)

      await getLayer(event.useDataSource).then((eventLayer) => {
        set.fields.forEach((field) => {
          const eventField = findFieldByName(eventLayer.fields, field)
          if (isDefined(eventField)) {
            const name = resolveFieldName(existingFieldNames, eventField.name)
            eventField.name = name
            eventField.alias = event.eventInfo.datasetName + '.' + field
            eventField.nullable = true
            eventField.defaultValue = null
            if (eventField.type === 'oid') {
              eventField.type = 'integer'
              eventField.editable = true
            }
            existingFieldNames.push(name.toUpperCase())
            fields.push(eventField)
          }
        })
      })
    })
    return fields
  }).catch(() => {
    return []
  })
}

export async function getSubtypeLayers (lrsLayers: ImmutableArray<LrsLayer>, attributeSet: AttributeSetParam[]): Promise<SubtypeLayers[]> {
  const subtypeLayers: SubtypeLayers[] = []
  await Promise.all(attributeSet.map(async (set) => {
    const event = lrsLayers.find((layer) => layer.serviceId.toString() === set.layerId)
    if (isDefined(event)) {

      await getLayer(event.useDataSource).then((eventLayer) => {
        if (isDefined(eventLayer.subtypes)) {
          subtypeLayers.push({
            id: event.serviceId.toString(),
            subtypes: eventLayer.subtypes,
            subtypeField: eventLayer.subtypeField
          })
        }
      })
    }
  }))
  return subtypeLayers
}

export async function populateFeatureLayer (results: QueryAttributeSetResults, featureLayer: __esri.FeatureLayer, networkInfo: ImmutableObject<NetworkInfo>): Promise<void> {
  if (!results || !featureLayer) {
    return
  }

  let Polyline: typeof __esri.Polyline = null
  let Graphic: typeof __esri.Graphic = null
  let SpatialReference: typeof __esri.SpatialReference = null
  await loadArcGISJSAPIModules(['esri/geometry/Polyline', 'esri/Graphic', 'esri/geometry/SpatialReference']).then(modules => {
    [Polyline, Graphic, SpatialReference] = modules
  }).then(async () => {
    await Promise.all(results.features.map(async (feature) => {
      const spatialReference = new SpatialReference({ wkid: results.spatialReference.wkid, wkt: results.spatialReference.wkt })
      const polyline = new Polyline(feature.geometry)
      polyline.spatialReference = spatialReference

      // Create a small offset between the first and last point of a point feature. This
      // allows users to zoom to the location.
      const isPoint = feature.attributes[DynSegFields.typeName] === 'Point'
      if (isPoint && polyline.paths.length === 1 && polyline.paths[0].length === 2) {
        const firstPoint = polyline.getPoint(0, 0)
        const lastPoint = polyline.getPoint(0, 1)
        if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
          lastPoint.x += networkInfo.xyTolerance
          lastPoint.y += networkInfo.xyTolerance
          polyline.setPoint(0, 1, lastPoint)
        }
      }

      const attributes = Object.keys(feature.attributes)
        .filter(key => isDefined(feature.attributes[key]))
        .reduce((obj, key) => {
          obj[key] = feature.attributes[key]
          return obj
        }, {})

      const graphic = new Graphic({
        geometry: polyline,
        attributes: attributes
      })

      await featureLayer
        .applyEdits({ addFeatures: [graphic.clone()] })
        .then(async (editResults) => {
          if (editResults.addFeatureResults.length > 0) {
            let error = editResults.addFeatureResults[0].error
            let retryAttempts = 0
            while (isDefined(error)) {
              // Retry adding feature with null value for field that caused error
              error = await retryApplyEditsWithError(featureLayer, graphic, error)
              if (!isDefined(error) || retryAttempts > 10) {
                break
              }
              retryAttempts++
            }
          } else {
            console.error('Failed to add feature', editResults.addFeatureResults)
          }
        })
        .catch((error) => { console.error('Failed to add feature', error) })
    }))
  })
}

const retryApplyEditsWithError = async (featureLayer: __esri.FeatureLayer, graphic: __esri.Graphic, error: __esri.FeatureEditResultError): Promise<__esri.FeatureEditResultError> => {
  const errorMessage = error.message
  const fieldErrorStart = errorMessage.substring(errorMessage.indexOf('field: '), errorMessage.length)
  const fieldErrorEnd = fieldErrorStart.substring(0, fieldErrorStart.indexOf(','))
  const fieldName = fieldErrorEnd.substring(7, fieldErrorEnd.length)
  graphic.attributes[fieldName] = null
  return await featureLayer.applyEdits({ addFeatures: [graphic.clone()] }).then((editResults) => {
    if (editResults.addFeatureResults.length > 0) {
      return editResults.addFeatureResults[0].error
    }
    return null
  }).catch((error) => {
    console.error('Failed to add feature', error)
    return null
  })
}

export const reorderGraphicsLayer = (jimuMapView: JimuMapView, highlightLayer: __esri.GraphicsLayer): void => {
  const mapLayers = jimuMapView.view.map.layers.length - 1
  const highlightLayerIndex = jimuMapView.view.map.layers.findIndex((layer) => layer === highlightLayer)

  if (highlightLayerIndex !== mapLayers) {
    jimuMapView.view.map.reorder(highlightLayer, jimuMapView.view.map.layers.length - 1)
  }
}
