/** @jsx jsx */
import { type ImmutableArray, React, jsx, type DataSource, type ImmutableObject, type IntlShape } from 'jimu-core'
import { CalciteActionBar, CalciteActionGroup } from 'calcite-components'
import { useDynSegRuntimeState } from '../../state'
import type { JimuMapView } from 'jimu-arcgis'
import { getGeometryGraphic, isDefined, type LrsLayer, type NetworkInfo } from 'widgets/shared-code/lrs'
import { Save } from './save'
import { type AttributeSetParam, DisplayType, type MessageProp, type RouteInfoFromDataAction } from '../../../config'
import { Display } from './display'
import { Zoom } from './zoom'
import { Export } from './export'
import { FieldCalculator } from './fieldCalculator'
import { DiscardEdits } from './discardEdits'
import { HideFields } from './hideFields'
import { DynSegFields } from '../../../constants'
import { reorderGraphicsLayer } from '../../utils/feature-layer-utils'
import { MapInteract } from './map-interact'

export interface ActionsProps {
  widgetId: string
  highlightColor: string
  lrsLayers: ImmutableArray<LrsLayer>
  networkDS: DataSource
  networkInfo: ImmutableObject<NetworkInfo>
  jimuMapView: JimuMapView
  dynSegFeatureLayer: __esri.FeatureLayer
  onSave: (message: MessageProp) => void
  attributeSet: AttributeSetParam[]
  allowEditing?: boolean
  intl: IntlShape
  allowMerge: boolean
  routeId: string,
  routeInfo: RouteInfoFromDataAction
}

export function Actions (props: ActionsProps) {
  const { routeInfo, intl, routeId, allowMerge, allowEditing, widgetId, jimuMapView, highlightColor, lrsLayers, networkDS, networkInfo, dynSegFeatureLayer, onSave, attributeSet } = props
  const { records, selectedRecordIds, selectedSldId, display, highlightLayer } = useDynSegRuntimeState()

  React.useEffect(() => {

    const fetchData = () => {
      getGraphic(selectedRecordIds)
    }
    fetchData()

    function getGraphic (selectedRecordIds: number[]) {
      if (isDefined(highlightLayer)) {
        highlightLayer.removeAll()
        if (isDefined(records) && isDefined(selectedRecordIds)) {
          selectedRecordIds.forEach(async (id) => {
            const record = records.find((r) => r.getObjectId() === id)
            if (isDefined(record)) {
              reorderGraphicsLayer(jimuMapView, highlightLayer)
              const pointGraphic = record.attributes[DynSegFields.typeName] === 'Point'
              const graphic = await getGeometryGraphic(record, highlightColor, 4, !pointGraphic)
              highlightLayer.add(graphic)
            }
          })
        }
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecordIds])

  React.useEffect(() => {
    if (selectedSldId === '' && isDefined(highlightLayer)) {
      highlightLayer.removeAll()
    }
    if (selectedRecordIds.length === 0 && isDefined(highlightLayer)) {
      highlightLayer.removeAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSldId, selectedRecordIds])

  return (
      <CalciteActionBar
        slot='header-actions-end'
        layout="horizontal"
        scale='m'
        className='header-actions'
        expandDisabled={true}>
        <Display/>
        <CalciteActionGroup scale='m'>
          { allowEditing && (<Save
            lrsLayers={lrsLayers}
            networkDS={networkDS}
            networkInfo={networkInfo}
            onSave={onSave}
            allowMerge={allowMerge}
          />) }
          { display === DisplayType.Diagram &&
            <MapInteract
              routeInfo={routeInfo}
              networkDS={networkDS}
              networkInfo={networkInfo}
              jimuMapView={jimuMapView}
            />
          }
          { display === DisplayType.Table && allowEditing &&
            <DiscardEdits
              dynSegFeatureLayer={dynSegFeatureLayer}
            />
          }
          { display === DisplayType.Table &&
            <Zoom
              jimuMapView={jimuMapView}
              networkDS={networkDS}
            />
          }
          { display === DisplayType.Table &&
            <HideFields
              networkDS={networkDS}
            />
          }
          { display === DisplayType.Table && allowEditing &&
            <FieldCalculator
              intl={intl}
              attributeSet={attributeSet}
              lrsLayers={lrsLayers}
              dynSegFeatureLayer={dynSegFeatureLayer}
            />
          }
          { display === DisplayType.Table &&
            <Export
              dynSegFeatureLayer={dynSegFeatureLayer}
              widgetId={widgetId}
              routeId={routeId}
              jimuMapView={jimuMapView}
            />
          }
        </CalciteActionGroup>
      </CalciteActionBar>
  )
}
