/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  type DataSource,
  type ImmutableObject,
  type FeatureLayerDataSource
} from 'jimu-core'
import {
  type RouteInfo,
  isDefined,
  flash,
  getGeometryGraphic,
  getSimpleLineGraphic,
  type NetworkInfo,
  type LrsLayer,
  queryEventsByEventObjectIds
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import { Label } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { type CommandActionDataType, List, TreeItemActionType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import type Polyline from 'esri/geometry/Polyline'
import { colorCyan } from '../constants'
const IconClose = require('jimu-icons/svg/outlined/editor/close.svg')

export interface MergeEventsListFormProps {
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  networkDS: DataSource
  eventDS: DataSource
  eventLayer: ImmutableObject<LrsLayer>
  routeInfo: RouteInfo
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  reset: boolean
  clearPickedGraphic: () => void
  eventFeatures: any[]
  onEventRemoved: (index: number) => void
  onPreservedEventIndexChanged: (index: number) => void
  preservedEventIndex: number
  flashGraphic: GraphicsLayer
}

export function MergeEventsListForm (props: MergeEventsListFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    network,
    eventDS,
    eventLayer,
    clearPickedGraphic,
    eventFeatures,
    onEventRemoved,
    onPreservedEventIndexChanged,
    preservedEventIndex,
    flashGraphic
  } = props

  React.useEffect(() => {
    if (isDefined(network)) {
      clearPickedGraphic()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  // Actions for list items
  const advancedActionMap = {
    overrideItemBlockInfo: ({ itemBlockInfo }: any, refComponent: any) => {
      return {
        name: TreeItemActionType.RenderOverrideItem,
        children: [{
          name: TreeItemActionType.RenderOverrideItemDroppableContainer,
          withListGroupItemWrapper: false,
          children: [{
            name: TreeItemActionType.RenderOverrideItemDraggableContainer,
            children: [{
              name: TreeItemActionType.RenderOverrideItemBody,
              children: [{
                name: TreeItemActionType.RenderOverrideItemMainLine,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDragHandle
                }, {
                  name: TreeItemActionType.RenderOverrideItemTitle
                }, {
                  name: TreeItemActionType.RenderOverrideItemDetailToggle
                }, {
                  name: TreeItemActionType.RenderOverrideItemCommands
                }]
              }]
            }]
          }]
        }]
      }
    }
  }

  const highlightSelectedEventFeature = (index: number) => {
    if (isDefined(eventLayer) && isDefined(eventDS)) {
      // Get basic field info for non lrs fields and set default values.
      const featureLayerDS = eventDS as FeatureLayerDataSource
      // Perform query on route identifier.
      const objectIdFieldName = eventDS.getSchema()?.idField
      queryEventsByEventObjectIds(featureLayerDS, [eventFeatures[index].attributes[objectIdFieldName]]).then((features) => {
        features.forEach(async (feature) => {
          const polyline = feature.geometry as Polyline
          if (isDefined(polyline)) {
            flash(flashGraphic, await getGeometryGraphic(await getSimpleLineGraphic(polyline), colorCyan))
          }
        })
      })
    }
  }

  return (
    <div className='merge-events-list-form d-flex w-100 pt-1 px-3'>
      {network && (
        <div className='w-100'>
          <Label size="sm" className='w-100 mb-0 pt-3 title3' centric style={{ width: 100 }} >
            {getI18nMessage('eventListLabel')}
          </Label>
          <div className="setting-ui-unit-list w-100">
            <List
              className="setting-ui-unit-list-exsiting"
              itemsJson={Array.from(eventFeatures).map((item, index) => ({
                itemStateDetailContent: item,
                itemKey: `${index}`,
                itemStateChecked: preservedEventIndex === index,
                itemStateTitle: item.attributes[eventDS.getSchema().idField],
                itemStateCommands: [
                  {
                    label: getI18nMessage('remove'),
                    iconProps: () => ({ icon: IconClose, size: 12 }),
                    action: ({ data }: CommandActionDataType) => {
                      onEventRemoved(index)
                    }
                  }
                ]
              })) as TreeItemType[]}
              renderOverrideItemDetailToggle={(actionData, refComponent) => {
                const item = refComponent.props.itemJsons[0]
                if (item.itemStateChecked) {
                  return (
                    <div className='title3'>
                      {getI18nMessage('preserveLabel')}
                    </div>
                  )
                } else {
                  return ''
                }
              }}
              onClickItemBody={(actionData, refComponent) => {
                const { itemJsons: [currentItemJson] } = refComponent.props
                onPreservedEventIndexChanged(+currentItemJson.itemKey)
                highlightSelectedEventFeature(+currentItemJson.itemKey)
              }}
              {...advancedActionMap}
            />
          </div>
        </div>
      )}
    </div>
  )
}
