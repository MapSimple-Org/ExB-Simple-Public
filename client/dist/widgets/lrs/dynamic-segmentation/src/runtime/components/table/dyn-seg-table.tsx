/** @jsx jsx */
import { React, type IntlShape, jsx, type ImmutableArray, type DataSource, type ImmutableObject } from 'jimu-core'
import { CalciteTable } from 'calcite-components'
import { DynSegHeader } from './dyn-seg-header'
import { DynSegRow } from './dyn-seg-row'
import type { SubtypeLayers, DynSegFieldInfo, RouteInfoFromDataAction, MessageProp } from '../../../config'
import { useDynSegRuntimeState } from '../../state'
import { useTheme } from 'jimu-theme'
import type { LrsLayer, NetworkInfo } from 'widgets/shared-code/lrs'

export interface DynSegTableProps {
  intl: IntlShape
  allowEditing?: boolean
  featureLayer: __esri.FeatureLayer
  records: __esri.Graphic[]
  measureHeaders: string[]
  fieldInfo: DynSegFieldInfo[]
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

export function DynSegTable (props: DynSegTableProps) {
  const { intl, networkDS, allowEditing, routeId, lrsLayers, currentRouteInfo, networkInfo, featureLayer, records, measureHeaders, fieldInfo, subTypeInfo, layerMap, fieldGroups, contingentValues, handleLockToast } = props
  const { isLoading } = useDynSegRuntimeState()
  const theme = useTheme()

  React.useEffect(() => {
    if (!isLoading) {
      let updated = false
      let retries = 0

      while (!updated) {
        let tableUpdated = false
        let tableHeaderUpdated = false
        let columnHeaderUpdated = false
        let rowHeaderUpdated = false
        let rowBorderUpdated = false

        setTimeout(() => {
          // Update table height
          const tableElm = document.querySelector('.dyn-seg-table')
          if (tableElm && tableElm.shadowRoot) {
            const container = tableElm.shadowRoot.querySelector('.table-container')
            if (container) {
              (container as HTMLElement).style.height = '100%'
              tableUpdated = true
            }
          }

          // Update table header (tr)
          const headerElm = document.querySelector('.dyn-seg-table-header')
          if (headerElm && headerElm.shadowRoot) {
            const container = headerElm.shadowRoot.querySelector('.interaction-container')
            if (container) {
              const tr = container.firstChild
              if (tr) {
                if (tr && (tr as HTMLElement).style) {
                  (tr as HTMLElement).style.position = 'sticky';
                  (tr as HTMLElement).style.top = '0';
                  (tr as HTMLElement).style.zIndex = '10';
                  (tr as HTMLElement).style.backgroundColor = theme.sys.color.surface.background
                  tableHeaderUpdated = true
                }
              }
            }
          }

          // Update first column header (th)
          const columnHeaderElm = document.querySelectorAll('.dyn-seg-column-header')
          if (columnHeaderElm) {
            columnHeaderElm.forEach((elm) => {
              const th = elm.shadowRoot.querySelector('.content-cell')
              if (th && th.ariaColIndex === '1') {
                (th as HTMLElement).style.position = 'sticky';
                (th as HTMLElement).style.left = '0';
                (th as HTMLElement).style.zIndex = '10'
                columnHeaderUpdated = true
              }
            })
          }

          // Update all row headers (td)
          const headers = document.querySelectorAll('.dyn-seg-row-header')
          if (headers) {
            headers.forEach((elm) => {
              const container = elm.shadowRoot.querySelector('.interaction-container')
              if (container) {
                const td = container.childNodes[0]
                if (td && (td as HTMLElement).style) {
                  (td as HTMLElement).style.position = 'sticky';
                  (td as HTMLElement).style.left = '0';
                  (td as HTMLElement).style.zIndex = '5';
                  (td as HTMLElement).style.userSelect = 'none'
                }
              }
              rowHeaderUpdated = true
            })
          }

          // Update last row border
          const rows = document.querySelectorAll('.dyn-seg-row')
          const lastRow = rows[rows.length - 1]
          if (lastRow) {
            const container = lastRow.shadowRoot.querySelector('.interaction-container')
            if (container) {
              const td = container.lastChild
              if (td) {
                (td as HTMLElement).className = '';
                (td as HTMLElement).style.borderBlockEnd = `1px solid ${theme.sys.color.surface.background};`
              }
            }
            rowBorderUpdated = true
          }
        }, 1000)

        retries++
        if (retries > 10) {
          updated = true
        }
        if (tableUpdated && tableHeaderUpdated && columnHeaderUpdated && rowHeaderUpdated && rowBorderUpdated) {
          updated = true
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  return (
    <CalciteTable
      caption='Dynamic Segmentation Table'
      className='dyn-seg-table'
      bordered
      scale='s'
      layout='auto'
      style={{ height: '100%', width: '100%' }}
    >
    <DynSegHeader fieldInfo={fieldInfo}/>

    {records.map((record, index) => {
      return (
        <DynSegRow
          intl={intl}
          key={index}
          allowEditing={allowEditing}
          rowIndex={index}
          featureLayer={featureLayer}
          record={record}
          rangeHeader={measureHeaders[index]}
          fieldInfos={fieldInfo}
          lastIndex={records.length - 1}
          subTypeInfo={subTypeInfo}
          layerMap={layerMap}
          fieldGroups={fieldGroups}
          contingentValues={contingentValues}
          networkInfo={networkInfo}
          currentRouteInfo={currentRouteInfo}
          lrsLayers={lrsLayers}
          routeId={routeId}
          networkDS={networkDS}
          handleLockToast={handleLockToast}
        />
      )
    })}
    </CalciteTable>
  )
}
