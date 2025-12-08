/** @jsx jsx */
import {
  type ImmutableArray,
  React,
  jsx,
  type DataSource,
  type FeatureLayerDataSource,
  type ImmutableObject,
  utils as coreUtils,
  hooks
} from 'jimu-core'
import {
  type AddEventRequest,
  type LrsLayer,
  type LrsRecord,
  type LrsApplyEditsEditsParam,
  LrsApplyEdits,
  type NetworkInfo,
  getLayer,
  type EventInfo,
  isDefined,
  useVmsManager,
  useEditSession
} from 'widgets/shared-code/lrs'
import { CalciteAction } from 'calcite-components'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'
import type { MessageProp, TableEdits } from '../../../config'
import { DynSegFields } from '../../../constants'
import defaultMessages from '../../translations/default'
import { Tooltip } from 'jimu-ui'

export interface SaveProps {
  allowMerge: boolean
  lrsLayers: ImmutableArray<LrsLayer>
  networkDS: DataSource
  networkInfo: ImmutableObject<NetworkInfo>
  onSave: (message: MessageProp) => void
}

export function Save (props: SaveProps) {
  const { allowMerge, lrsLayers, networkDS, networkInfo, onSave } = props
  const { pendingEdits, errorCount } = useDynSegRuntimeState()
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const dispatch = useDynSegRuntimeDispatch()
  const {sessionId, startEditSession, addEdit} = useVmsManager()
  const { supportsEditSession } = useEditSession()

  const hasPendingEdits = React.useMemo(() => {
    if (pendingEdits.size > 0 && errorCount === 0) {
      return true
    } else {
      return false
    }
  }, [errorCount, pendingEdits])


  const saveEdits = async () => {
    // save edits
    const request: AddEventRequest = {
      edits: []
    }

    const networkFeatureLayer = networkDS as FeatureLayerDataSource
    const edits: TableEdits[] = []
    pendingEdits.forEach((edit) => {
      edits.push(edit)
    })

    let lrsUrl = ''
    await Promise.all(edits.map(async (edit, index) => {
      const eventLayer = lrsLayers.find((layer) => layer.serviceId.toString() === edit.layerId)
      if (lrsUrl === '') {
        lrsUrl = eventLayer.lrsUrl
      }

      const indexedLrsAttrs = await getLayerEdits(eventLayer, edit, networkInfo.datasetName)

      const adds: LrsRecord[] = []
      const add: LrsRecord = {
        attributes: indexedLrsAttrs
      }
      adds.push(add)

      const edits: LrsApplyEditsEditsParam = {
        id: eventLayer.serviceId,
        adds: adds,
        allowMerge: allowMerge,
        retireMeasureOverlap: true,
        retireByEventId: false
      }

      request.edits.push(edits)
    })).then(async () => {

      if (supportsEditSession ) {
        const startEdit = await startEditSession()
        if (!startEdit.success) {
          const messageProp: MessageProp = {
            title: getI18nMessage('saveError'),
            body: startEdit.error,
            type: 'danger'
          }
          onSave(messageProp)
          return
        }
      }

      await LrsApplyEdits(networkFeatureLayer, lrsLayers[0], sessionId, request, null, null)

        .then((result) => {
          if (result.success) {
            if (supportsEditSession) {
              addEdit(result, getI18nMessage('_widgetLabel'))
            }
            const editCount = pendingEdits.size
            dispatch({ type: 'SET_EDITS', value: new Map<string, TableEdits>() })
            const messageProp: MessageProp = {
              title: getI18nMessage('saveSuccess'),
              body: getI18nMessage('saveSuccessMessage', { editCount: editCount }),
              type: 'success'
            }
            onSave(messageProp)
          } else {
            const messageProp: MessageProp = {
              title: getI18nMessage('saveError'),
              body: result.message,
              details: result.details,
              type: 'danger'
            }
            onSave(messageProp)
          }
        })
    })
  }

  const getLayerEdits = (lrsLayer: LrsLayer, edits: TableEdits, networkName: string): Promise<{ [key: string]: string | number | Date }> => {

    return getLayer(lrsLayer.useDataSource).then((featureLayer) => {
      const indexedLrsAttrs: { [key: string]: string | number | Date } = {}
      const eventInfo: EventInfo = lrsLayer.eventInfo
      const attributes = edits.attributes

      attributes.forEach((value, key) => {
        switch (key) {
          case DynSegFields.routeIdName:
            indexedLrsAttrs[eventInfo.routeIdFieldName] = value
            break
          case DynSegFields.fromDateName:
            indexedLrsAttrs[eventInfo.fromDateFieldName] = value
            break
          case DynSegFields.toDateName:
            indexedLrsAttrs[eventInfo.toDateFieldName] = value
            break
          case DynSegFields.fromMeasureName:
            indexedLrsAttrs[eventInfo.fromMeasureFieldName] = value
            break
          case DynSegFields.toMeasureName:
            if (!eventInfo.isPointEvent) {
              indexedLrsAttrs[eventInfo.toMeasureFieldName] = value
            }
            break
          case eventInfo.eventIdFieldName:
            if (!isDefined(value)) {
              indexedLrsAttrs[key] = '{' + coreUtils.getUUID() + '}'
            } else {
              indexedLrsAttrs[key] = value
            }
            break
          default:
            indexedLrsAttrs[key] = value
        }
      })

      // From referent
      if (eventInfo.fromReferentMethodFieldName) {
        const fields = featureLayer.fields
        const field = fields.find(f => f.name === eventInfo.fromReferentMethodFieldName)
        if (isDefined(field) && isDefined(field.domain) && field.domain.type === 'coded-value') {
          const codeValue = field.domain.codedValues.find(cv => cv.name === networkName)
          if (codeValue) {
            indexedLrsAttrs[eventInfo.fromReferentMethodFieldName] = codeValue.code
          }
        }
      }
      if (eventInfo.fromReferentLocationFieldName) {
        indexedLrsAttrs[eventInfo.fromReferentLocationFieldName] = indexedLrsAttrs[eventInfo.routeIdFieldName]
      }
      if (eventInfo.fromReferentOffsetFieldName) {
        const measure = indexedLrsAttrs[eventInfo.fromMeasureFieldName]
        indexedLrsAttrs[eventInfo.fromReferentOffsetFieldName] = isDefined(measure) ? measure.toString() : null
      }

      // To referent
      if (eventInfo.toReferentMethodFieldName) {
        const fields = featureLayer.fields
        const field = fields.find(f => f.name === eventInfo.toReferentMethodFieldName)
        if (isDefined(field) && isDefined(field.domain) && field.domain.type === 'coded-value') {
          const codeValue = field.domain.codedValues.find(cv => cv.name === networkName)
          if (codeValue) {
            indexedLrsAttrs[eventInfo.toReferentMethodFieldName] = codeValue.code
          }
        }
      }
      if (eventInfo.toReferentLocationFieldName) {
        indexedLrsAttrs[eventInfo.toReferentLocationFieldName] = indexedLrsAttrs[eventInfo.routeIdFieldName]
      }
      if (eventInfo.toReferentOffsetFieldName) {
        const measure = indexedLrsAttrs[eventInfo.toMeasureFieldName]
        indexedLrsAttrs[eventInfo.toReferentOffsetFieldName] = isDefined(measure) ? measure.toString() : null
      }

      return indexedLrsAttrs
    })
  }

  return (
    <Tooltip
      placement='auto'
      title={getI18nMessage('saveEdits')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <CalciteAction
        text={getI18nMessage('saveEdits')}
        icon='save'
        scale='m'
        disabled={hasPendingEdits ? undefined : true }
        onClick={saveEdits} />
    </Tooltip>
  )
}
