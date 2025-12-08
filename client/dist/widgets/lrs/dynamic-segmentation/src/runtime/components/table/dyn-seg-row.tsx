/** @jsx jsx */
import { type DataSource, type FeatureLayerDataSource, type ImmutableArray, type ImmutableObject, type IntlShape, React, jsx } from 'jimu-core'
import { CalciteTableCell, CalciteTableRow } from 'calcite-components'
import { DynSegCell } from './dyn-seg-cell'
import classNames from 'classnames'
import type { SubtypeLayers, DynSegFieldInfo, MessageProp, RouteInfoFromDataAction } from '../../../config'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'
import { isDefined, type LrsLayer, type NetworkInfo } from 'widgets/shared-code/lrs'
import { Label } from 'jimu-ui'
import { getAttributesByTable, getPendingEditsKey } from '../../utils/table-utils'
import { createLockInfoFromParams, preventConflict } from '../../utils/edit-utils'

export interface RowProps {
  intl: IntlShape
  allowEditing?: boolean
  rowIndex: number
  featureLayer: __esri.FeatureLayer
  record: __esri.Graphic
  rangeHeader: string
  fieldInfos: DynSegFieldInfo[]
  lastIndex: number
  subTypeInfo: SubtypeLayers[]
  layerMap: Map<string, __esri.Layer>
  fieldGroups: Map<string, any>
  contingentValues: Map<string, any>
  networkInfo: ImmutableObject<NetworkInfo>
  currentRouteInfo: RouteInfoFromDataAction
  lrsLayers: ImmutableArray<LrsLayer>
  routeId: string
  networkDS: DataSource
  handleLockToast: (messageProp: MessageProp, reloadOnClose: boolean) => void
}

export function DynSegRow (props: RowProps) {
  const { networkDS, intl, routeId, allowEditing, lrsLayers, currentRouteInfo, rowIndex, handleLockToast, featureLayer, record, rangeHeader, fieldInfos, lastIndex, subTypeInfo, layerMap, fieldGroups, contingentValues } = props
  const [isRowSelected, setIsRowSelected] = React.useState<boolean>(false)
  const [currentRecord, setCurrentRecord] = React.useState<__esri.Graphic>(record)
  const { pendingEdits, selectedRecordIds, conflictPreventionEnabled } = useDynSegRuntimeState()
  const dispatch = useDynSegRuntimeDispatch()

  React.useEffect(() => {
    if (pendingEdits.size > 0) {
      let update = false
      fieldInfos.forEach((fieldInfo) => {
        const key = getPendingEditsKey(record, fieldInfo.eventName)
        const existingEdit = pendingEdits.get(key)
        if (existingEdit) {
          update = true
        }
      })
      if (update) {
        const where = featureLayer.objectIdField + ' = ' + record.getObjectId()
        featureLayer.queryFeatures({ where: where }).then((result) => {
          setCurrentRecord(result.features[0])
        })
      }
    } else {
      setCurrentRecord(record)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEdits])

  React.useEffect(() => {
    if (selectedRecordIds.length > 0) {
      const isSelected = selectedRecordIds.find((r) => r === record.getObjectId())
      if ((isSelected && !isRowSelected) || (!isSelected && isRowSelected)) {
        setIsRowSelected(isDefined(isSelected))
      } else {
        setIsRowSelected(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecordIds])

  React.useEffect(() => {
    if (rowIndex === lastIndex) {
      // Disable loading after we are rendering the last row
      dispatch({ type: 'SET_IS_LOADING', value: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectedRow = (e) => {
    e.stopPropagation()
    let selected = [...selectedRecordIds]
    if (e.shiftKey) {
      const lastSelected = selected[selected.length - 1]
      const currentId = record.getObjectId() as number
      if (lastSelected < currentId) {
        const range = Array.from({ length: currentId - lastSelected + 1 }, (_, i) => i + lastSelected)
        range.forEach((r) => {
          const existingIndex = selected.findIndex((r) => r === record.getObjectId())
          if (existingIndex === -1) {
            selected.push(r)
          }
        })
      } else if (lastSelected > currentId) {
        const range = Array.from({ length: lastSelected - currentId + 1 }, (_, i) => i + currentId)
        range.forEach((r) => {
          const existingIndex = selected.findIndex((r) => r === record.getObjectId())
          if (existingIndex === -1) {
            selected.push(r)
          }
        })
      }
    } else if (e.ctrlKey) {
      const existingIndex = selected.findIndex((r) => r === record.getObjectId())
      if (existingIndex > -1) {
        selected.splice(existingIndex, 1)
      } else {
        selected.push(record.getObjectId() as number)
      }
    } else {
      const lastSelected = selected[selected.length - 1]
      const currentId = record.getObjectId() as number
      if (lastSelected === currentId) {
        selected = []
        setIsRowSelected(false)
      } else {
        selected = [record.getObjectId() as number]
      }
    }
    dispatch({ type: 'SET_SELECTED_RECORD_IDS', value: selected })
  }

  const handleCellEdit = (fieldInfo: DynSegFieldInfo, incomingRecord: __esri.Graphic) => {
    const key = getPendingEditsKey(incomingRecord, fieldInfo.eventName)
    const existingEdits = pendingEdits.get(key)
    const attributes = getAttributesByTable(fieldInfos, incomingRecord, fieldInfo.eventName, false)

    const updatedPendingEdits = new Map(pendingEdits)
    if (isDefined(existingEdits)) {
      existingEdits.attributes = attributes
      updatedPendingEdits.set(key, existingEdits)
    } else {
      const DynSegEdits = {
        layerId: fieldInfo.eventLayerId,
        attributes: attributes
      }
      updatedPendingEdits.set(key, DynSegEdits)
    }
    dispatch({ type: 'SET_EDITS', value: updatedPendingEdits })
  }

  const handleUpdateRecord = async (record: __esri.Graphic, fields: DynSegFieldInfo) => {
    let locks
    if (conflictPreventionEnabled) {
      const params = await createLockInfoFromParams(currentRouteInfo, lrsLayers, routeId, networkDS, fields.eventLayerId)
      const featureDS = networkDS as FeatureLayerDataSource
      locks = await preventConflict(params, featureDS, intl)
      if (locks) {
        const messageProp: MessageProp = {
          title: locks.toastMsg,
          body: '',
          type: locks.toastMsgType
        }
        handleLockToast(messageProp, false)
        handleCellEdit(fields, record)
        setCurrentRecord(record)
      } else {
        const messageProp: MessageProp = {
          title: 'Field updated successfully',
          body: '',
          type: 'success'
        }
        handleLockToast(messageProp, false)
        handleCellEdit(fields, record)
        setCurrentRecord(record)
      }
    } else {
      handleCellEdit(fields, record)
      setCurrentRecord(record)
    }
  }

  return (
    <CalciteTableRow
      className='dyn-seg-row'
      onClick={handleSelectedRow}
    >
      <CalciteTableCell className={classNames('dyn-seg-row-header', isRowSelected ? 'selected' : '')}>
        <div className='h-100 d-flex'>
          <Label size="sm" className='w-100 label2' centric style={{ minWidth: '100px', textWrap: 'nowrap', marginBottom: 0, textAlign: 'left', whiteSpace: 'pre' }} >
            {rangeHeader}
          </Label>
        </div>
      </CalciteTableCell>

      {fieldInfos.map((field, index) => {
        return field.visible && !field.exclude
          ? <DynSegCell
              intl={intl}
              key={index}
              allowEditing={allowEditing}
              rowIndex={index}
              fieldInfo={field}
              featureLayer={featureLayer}
              record={currentRecord}
              subTypeInfo={subTypeInfo}
              layerMap={layerMap}
              fieldGroups={fieldGroups}
              contingentValues={contingentValues}
              networkDS={networkDS}
              updateRecord={handleUpdateRecord}
              />

          : null
      })}
    </CalciteTableRow>
  )
}
