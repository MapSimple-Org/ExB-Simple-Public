/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  type DataSource,
  type ImmutableObject,
  type IntlShape
} from 'jimu-core'
import {
  GetUnits,
  isDefined,
  type RouteInfo,
  type NetworkInfo,
  type LrsLayer,
  queryAllRoutesByLineIdAndFromDate,
  IsRouteReversed
} from 'widgets/shared-code/lrs'
import { round } from 'lodash-es'
import defaultMessages from '../translations/default'
import { Label } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'

export interface RouteAndMeasureFormProps {
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  networkDS: DataSource
  routeInfo: RouteInfo
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  reset: boolean
  clearPickedGraphic: () => void
  onRouteInfoUpdated: (newRouteInfo: RouteInfo, flash?: boolean) => void
  eventLayer: ImmutableObject<LrsLayer>
  eventFeatures: any[]
  intl: IntlShape
  resetForDataAction: boolean
}

export function RouteAndMeasureForm (props: RouteAndMeasureFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { network, networkDS, routeInfo, reset, clearPickedGraphic, eventLayer, eventFeatures, intl, resetForDataAction } = props
  const [measureInput, setMeasureInput] = React.useState<string>(getI18nMessage('chooseEventsFromMap'))
  const [toMeasureInput, setToMeasureInput] = React.useState<string>(getI18nMessage('chooseEventsFromMap'))

  React.useEffect(() => {
    if (isDefined(eventLayer)) {
      setMeasureInput(getI18nMessage('chooseEventsFromMap'))
      setToMeasureInput(getI18nMessage('chooseEventsFromMap'))
      clearPickedGraphic()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventLayer])

  React.useEffect(() => {
    return () => {
      const setFromAndToMeasureInputs = async () => {
        if (isDefined(eventFeatures) && isDefined(routeInfo) && isDefined(network) && isDefined(routeInfo.lineId) && routeInfo.lineId.length > 0) {
          // Handle reversed route within line
          const firstRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.routeIdFieldName]
          const lastRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.routeIdFieldName]
          if (firstRouteId !== lastRouteId) {
            const routeIdField = network.routeIdFieldSchema.jimuName
            const lineOrderField = network.lineOrderFieldSchema.jimuName

            // store all of the route features in a dictionary.  Key is routeId, value is RouteInfo object
            const results = await queryAllRoutesByLineIdAndFromDate(routeInfo.lineId, network, networkDS, routeInfo.selectedFromDate)
            if (isDefined(results)) {
              const sortedFeatures = results.features.sort((a, b) => a.attributes[lineOrderField] - b.attributes[lineOrderField])
              let firstRouteIdx: number = -1
              let lastRouteIdx: number = -1

              const routeShapes: __esri.Polyline[] = []
              sortedFeatures.forEach((feature, index) => {
                routeShapes.push(feature.geometry as __esri.Polyline)
                if (feature.attributes[routeIdField] === firstRouteId) {
                  firstRouteIdx = index
                }
                if (feature.attributes[routeIdField] === lastRouteId) {
                  lastRouteIdx = index
                }
              })

              const isFromReversed: boolean = IsRouteReversed(routeShapes, firstRouteIdx)
              const isToReversed: boolean = IsRouteReversed(routeShapes, lastRouteIdx)

              clearPickedGraphic()
              if (!isDefined(eventFeatures) || eventFeatures.length === 0) {
                setMeasureInput(getI18nMessage('chooseEventsFromMap'))
                setToMeasureInput(getI18nMessage('chooseEventsFromMap'))
              } else {
                if (isDefined(network)) {
                  let fromM = round(eventFeatures[0].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.measurePrecision)
                  if (isFromReversed) {
                    fromM = round(eventFeatures[0].attributes[eventLayer.eventInfo.toMeasureFieldName], network.measurePrecision)
                  } else {
                    const firstRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.routeIdFieldName]
                    const lastRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.routeIdFieldName]
                    const lastFromM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.measurePrecision)
                    if (firstRouteId === lastRouteId && lastFromM < fromM) {
                      // Last event has smaller From measure than the first event
                      fromM = lastFromM
                    }
                  }

                  let toM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toMeasureFieldName], network.measurePrecision)
                  if (isToReversed) {
                    toM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.measurePrecision)
                  } else {
                    const firstToRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.toRouteIdFieldName]
                    const lastToRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toRouteIdFieldName]
                    const firstToM = round(eventFeatures[0].attributes[eventLayer.eventInfo.toMeasureFieldName], network.measurePrecision)
                    if (firstToRouteId === lastToRouteId && firstToM > toM) {
                      // First event has greater To measure than the last event
                      toM = firstToM
                    }
                  }

                  setMeasureInput(fromM.toString())
                  setToMeasureInput(toM.toString())
                }
              }
            }
          }
        } else {
          clearPickedGraphic()
          if (!isDefined(eventFeatures) || eventFeatures.length === 0) {
            setMeasureInput(getI18nMessage('chooseEventsFromMap'))
            setToMeasureInput(getI18nMessage('chooseEventsFromMap'))
          } else {
            if (isDefined(network)) {
              const firstRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.routeIdFieldName]
              const lastRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.routeIdFieldName]
              let fromM = round(eventFeatures[0].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.measurePrecision)
              const lastFromM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.fromMeasureFieldName], network.measurePrecision)
              if (firstRouteId === lastRouteId && lastFromM < fromM) {
                // Last event has smaller From measure than the first event
                fromM = lastFromM
              }

              const firstToRouteId = eventFeatures[0].attributes[eventLayer.eventInfo.toRouteIdFieldName]
              const lastToRouteId = eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toRouteIdFieldName]
              const firstToM = round(eventFeatures[0].attributes[eventLayer.eventInfo.toMeasureFieldName], network.measurePrecision)
              let toM = round(eventFeatures[eventFeatures.length - 1].attributes[eventLayer.eventInfo.toMeasureFieldName], network.measurePrecision)
              if (firstToRouteId === lastToRouteId && firstToM > toM) {
                // First event has greater To measure than the last event
                toM = firstToM
              }
              setMeasureInput(fromM.toString())
              setToMeasureInput(toM.toString())
            }
          }
        }
      }
      setFromAndToMeasureInputs()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, networkDS, routeInfo, eventFeatures])

  React.useEffect(() => {
    if (reset && !resetForDataAction) {
      setMeasureInput(getI18nMessage('chooseEventsFromMap'))
      setToMeasureInput(getI18nMessage('chooseEventsFromMap'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  return (
    <div className='route-and-measure-form d-flex w-100 pt-1 px-3'>
      {network && (
        <div className='w-100'>
          <Label size="sm" className='w-100 mb-0 pt-3 title3' centric style={{ width: 100 }} >
            {getI18nMessage('fromMeasureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) })}
          </Label>
          <div className='d-flex w-100'>
            <Label size="sm" className='w-100 mb-0 label2' style={{ width: 100, alignItems: 'center' }} >
              {measureInput}
            </Label>
          </div>
          <Label size="sm" className='w-100 mb-0 pt-3 title3' centric style={{ width: 100}} >
            {getI18nMessage('toMeasureWithUnits', { units: GetUnits(network.unitsOfMeasure, intl) })}
          </Label>
          <div className='d-flex w-100'>
            <Label size="sm" className='w-100 mb-0 label2' style={{ width: 100, alignItems: 'center' }} >
              {toMeasureInput}
            </Label>
          </div>
        </div>
      )}
    </div>
  )
}
