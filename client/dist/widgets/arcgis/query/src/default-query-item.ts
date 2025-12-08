import {
  type QueryItemType,
  CreateToolType,
  UnitType,
  SpatialRelation,
  ListDirection,
  PagingType,
  FieldsType,
  SymbolType
} from './config'

export const DEFAULT_QUERY_ITEM: Partial<QueryItemType> = {
  icon: null,
  displayLabel: true,
  sqlExprObj: null,
  useAttributeFilter: true,
  useSpatialFilter: true,
  spatialMapWidgetIds: [],
  spatialFilterTypes: [],
  spatialInteractiveCreateToolTypes: [
    CreateToolType.Point,
    CreateToolType.Polyline,
    CreateToolType.Polygon,
    CreateToolType.Rectangle,
    CreateToolType.Circle
  ],
  spatialInteractiveEnableBuffer: false,
  spatialInteractiveBufferDistance: 0,
  spatialInteractiveBufferUnit: UnitType.Meters,
  spatialRelations: [SpatialRelation.Intersect],
  spatialRelationUseDataSources: [],
  spatialRelationEnableSelectTool: false,
  spatialRelationEnableBuffer: false,
  spatialRelationBufferDistance: 0,
  spatialRelationBufferUnit: UnitType.Meters,
  resultListDirection: ListDirection.Vertical,
  resultPagingStyle: PagingType.MultiPage,
  resultFieldsType: FieldsType.PopupSetting,
  resultSymbolType: SymbolType.DefaultSymbol,
  resultCustomSymbol: {
    angle: 0,
    color: [255, 255, 255, 255],
    outline: {
      color: [255, 255, 255, 255],
      style: 'esriSLSSolid',
      type: 'esriSLS',
      width: 1
    },
    size: 6,
    style: 'esriSMSCircle',
    type: 'esriSMS',
    xoffset: 0,
    yoffset: 0
  },
  resultAllowChangeSymbol: false,
  allowExport: false,
  sortOptions: [],
  itemSizeMap: {
    arrangementHorizontalPopper: {
      minSize: { width: 300, height: 300 },
      defaultSize: { width: 360, height: 480 }
    }
  }
}
