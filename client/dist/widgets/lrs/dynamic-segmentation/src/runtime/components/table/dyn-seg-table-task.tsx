/** @jsx jsx */
import {
  type IntlShape,
  React,
  jsx,
  type ImmutableArray,
  type ImmutableObject,
  hooks,
  type DataSource
} from 'jimu-core'
import { type LrsLayer, type NetworkInfo, isDefined } from 'widgets/shared-code/lrs'
import type { RouteInfoFromDataAction, AttributeSetParam, SubtypeLayers, MessageProp } from '../../../config'
import { DynSegTable } from './dyn-seg-table'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'
import { getContingentValues, getFieldGroups, getFieldInfo, getLayerMap } from '../../utils/table-utils'
import { getSubtypeLayers } from '../../utils/feature-layer-utils'
import defaultMessages from '../../translations/default'
import { round } from 'lodash-es'

export interface DynSegTableTaskProps {
  intl: IntlShape
  allowEditing?: boolean
  featureLayer: __esri.FeatureLayer
  records: __esri.Graphic[]
  lrsLayers: ImmutableArray<LrsLayer>
  attributeSet: AttributeSetParam[]
  networkInfo: ImmutableObject<NetworkInfo>
  currentRouteInfo: RouteInfoFromDataAction
  routeId: string
  networkDS: DataSource
  handleLockToast: (messageProp: MessageProp, reloadOnClose: boolean) => void
}

export function DynSegTableTask (props: DynSegTableTaskProps) {
  const { intl, allowEditing, routeId, networkDS, featureLayer, records, lrsLayers, attributeSet, networkInfo, currentRouteInfo, handleLockToast } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [showTable, setShowTable] = React.useState<boolean>(false)
  const [measureHeaders, setMeasureHeaders] = React.useState<string[]>([])
  const [subTypeInfo, setSubTypeInfo] = React.useState<SubtypeLayers[]>([])
  const [layerMap, setLayerMap] = React.useState<Map<string, __esri.Layer>>(new Map())
  const [fieldGroups, setFieldGroups] = React.useState<Map<string, any>>(new Map())
  const [contingentValues, setContingentValues] = React.useState<Map<string, any>>(new Map())
  const { fieldInfo } = useDynSegRuntimeState()
  const dispatch = useDynSegRuntimeDispatch()

  React.useEffect(() => {

    const loadRecords = (records: __esri.Graphic[]) => {
      dispatch({ type: 'SET_SELECTED_RECORD_IDS', value: [] })
      if (records.length > 0) {
        setState()
      } else {
        resetState()
      }
    }

    if (isDefined(records)) {
      loadRecords(records)
    } else {
      resetState()
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records])

  const setState = async () => {
    const subtypeLayers = await getSubtypeLayers(lrsLayers, attributeSet)
    const allFieldInfo = getFieldInfo(featureLayer, lrsLayers, subtypeLayers)
    const layerMap = await getLayerMap(lrsLayers, attributeSet)
    const measureRanges = getMeasureRanges(records, networkInfo)
    const fieldGroups = await getFieldGroups(layerMap, lrsLayers, attributeSet)
    const contingentValues = await getContingentValues(layerMap, lrsLayers, attributeSet)
    setMeasureHeaders(measureRanges)
    setSubTypeInfo(subtypeLayers)
    setLayerMap(layerMap)
    setFieldGroups(fieldGroups)
    setContingentValues(contingentValues)
    setShowTable(true)
    dispatch({ type: 'SET_FIELD_INFO', value: allFieldInfo })
    dispatch({ type: 'SET_SELECTED_RECORD_IDS', value: [] })
  }

  const resetState = () => {
    setShowTable(false)
    setMeasureHeaders([])
    setSubTypeInfo([])
    setLayerMap(new Map())
    setFieldGroups(new Map())
    setContingentValues(new Map())
    dispatch({ type: 'SET_SELECTED_RECORD_IDS', value: [] })
    dispatch({ type: 'SET_IS_LOADING', value: false })
    dispatch({ type: 'SET_FIELD_INFO', value: [] })
  }

  const getMeasureRanges = (records: __esri.Graphic[], networkInfo: ImmutableObject<NetworkInfo>): string[] => {
    if (isDefined(records) && records.length > 0) {
      const measureRanges: string[] = []
      records.forEach((record) => {
        const fromM = round(record.attributes.from_measure, networkInfo.measurePrecision).toFixed(networkInfo.measurePrecision)
        const toM = round(record.attributes.to_measure, networkInfo.measurePrecision).toFixed(networkInfo.measurePrecision)
        measureRanges.push(getI18nMessage('measuresRange', { fromM: fromM, toM: toM }))
      })
      return measureRanges
    }
    return []
  }

  return (
   <div className="dyn-seg-table-container h-100 w-100 d-flex">
    {showTable && (
      <DynSegTable
        intl={intl}
        featureLayer={featureLayer}
        records={records}
        allowEditing={allowEditing}
        measureHeaders={measureHeaders}
        fieldInfo={fieldInfo}
        subTypeInfo={subTypeInfo}
        layerMap={layerMap}
        fieldGroups={fieldGroups}
        contingentValues={contingentValues}
        networkInfo={networkInfo}
        networkDS={networkDS}
        currentRouteInfo={currentRouteInfo}
        lrsLayers={lrsLayers}
        routeId={routeId}
        handleLockToast={handleLockToast}
      />
    )}
  </div>
  )
}
