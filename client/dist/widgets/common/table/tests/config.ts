import type { IMFieldSchema } from 'jimu-core'
import { AlignModeType, LayerHonorModeType, ResponsiveType, SelectionModeType, type TableFieldsSchema } from '../src/config'

export const UseDataSources = [
  {
    dataSourceId: 'dataSource_1-Hydrants_8477',
    mainDataSourceId: 'dataSource_1-Hydrants_8477',
    rootDataSourceId: 'dataSource_1'
  },
  {
    dataSourceId: 'widget_5_output_4255323689842001-output',
    dataViewId: 'output',
    mainDataSourceId: 'widget_5_output_4255323689842001'
  }
]

export const layerConfig = {
  id: 'test-1',
  name: 'Layer 1',
  useDataSource: UseDataSources[0],
  allFields: [
    {
      jimuName: 'OBJECTID',
      name: 'OBJECTID',
      type: 'NUMBER',
      esriType: 'esriFieldTypeOID',
      alias: 'OBJECTID'
    }
  ] as IMFieldSchema[],
  tableFields: [
    {
      jimuName: 'OBJECTID',
      name: 'OBJECTID',
      type: 'NUMBER',
      esriType: 'esriFieldTypeOID',
      alias: 'OBJECTID'
    }
  ] as TableFieldsSchema[],
  enableAttachments: false,
  enableSearch: true,
  searchFields: [{
    alias: 'FACILITYID',
    esriType: 'esriFieldTypeOID',
    format: { digitSeparator: false, places: 0 },
    jimuName: 'FACILITYID',
    name: 'FACILITYID',
    type: 'NUMBER'
  }],
  enableEdit: false,
  enableRefresh: true,
  enableSelect: true,
  selectMode: SelectionModeType.Single,
  allowCsv: false,
  headerFontSetting: {
    backgroundColor: '',
    fontSize: 14,
    bold: false,
    color: ''
  },
  columnSetting: {
    responsiveType: ResponsiveType.Fixed,
    columnWidth: 200,
    textAlign: AlignModeType.Start,
    wrapText: false
  },
  layerHonorMode: LayerHonorModeType.Custom,
  enableShowHideColumn: true,
  enableDelete: false,
  dataActionObject: true
}

export const layerConfig2 = {
  id: 'test-2',
  name: 'Layer 2',
  useDataSource: UseDataSources[1],
  allFields: [
    {
      jimuName: 'OBJECTID',
      name: 'OBJECTID',
      type: 'NUMBER',
      esriType: 'esriFieldTypeOID',
      alias: 'OBJECTID'
    }
  ] as IMFieldSchema[],
  tableFields: [
    {
      jimuName: 'OBJECTID',
      name: 'OBJECTID',
      type: 'NUMBER',
      esriType: 'esriFieldTypeOID',
      alias: 'OBJECTID'
    }
  ] as TableFieldsSchema[],
  enableAttachments: false,
  enableSearch: false,
  searchFields: [],
  enableEdit: false,
  enableRefresh: true,
  enableSelect: true,
  selectMode: SelectionModeType.Single,
  allowCsv: false,
  headerFontSetting: {
    backgroundColor: '',
    fontSize: 14,
    bold: false,
    color: ''
  },
  columnSetting: {
    responsiveType: ResponsiveType.Fixed,
    columnWidth: 200,
    textAlign: AlignModeType.Start,
    wrapText: false
  },
  layerHonorMode: LayerHonorModeType.Custom,
  enableShowHideColumn: true,
  enableDelete: false
}

export const LayoutConfig = {
  layout1: {
    type: 'FIXED',
    content: {
      0: {
        id: '0',
        type: 'WIDGET',
        bbox: {
          left: '0.0%',
          right: '34.2%',
          top: '50.0%',
          bottom: '0.0%',
          width: '65.8%',
          height: '50.0%'
        },
        widgetId: 'widget2',
        setting: {
          autoProps: {
            bottom: false,
            left: false,
            right: true,
            top: true
          }
        }
      }
    },
    order: ['0'],
    id: 'layout1',
    parent: {
      id: 'page_0',
      type: 'pages'
    }
  }
}

export const Widgets = {
  widget1: {
    uri: 'widgets/layout/row/',
    context: {
      isRemote: false,
      folderUrl: 'https://exb.arcgis.com:3001/experience/../widgets/layout/row/'
    },
    manifest: {
      name: 'row',
      label: 'Row',
      type: 'widget',
      widgetType: 'LAYOUT',
      author: 'Esri R&D Center Beijing',
      description: 'This is the widget used in developer guide',
      copyright: '',
      license: 'http://www.apache.org/licenses/LICENSE-2.0',
      properties: {
        hasBuilderSupportModule: true,
        hasVersionManager: false,
        supportInlineEditing: false,
        supportRepeat: false,
        hasEmbeddedLayout: false,
        lockChildren: false,
        flipIcon: false,
        coverLayoutBackground: false,
        canCrossLayoutBoundary: false,
        needActiveState: false,
        hasMainClass: true,
        hasConfig: true,
        hasSettingPage: true,
        hasConfigInSettingPage: true,
        passDataSourceToChildren: true,
        deactivateOtherWidgets: true
      },
      layouts: [
        {
          name: 'DEFAULT',
          label: 'Default',
          type: 'ROW'
        }
      ],
      defaultSize: {
        width: 800,
        height: 400
      },
      extensions: [
        {
          name: 'LayoutTransformer',
          point: 'LAYOUT_TRANSFORMER',
          uri: 'layout/layout-transform'
        }
      ],
      translatedLocales: ['en'],
      i18nMessages: {}
    },
    icon:
      'https://exb.arcgis.com:3001/experience/../widgets/layout/row/icon.svg',
    label: 'Block 1',
    config: {
      space: 10,
      style: {
        padding: {
          number: [10],
          unit: 'px'
        }
      }
    },
    id: 'widget1',
    layouts: {
      DEFAULT: {
        LARGE: 'layout1'
      }
    }
  },
  widget2: {
    uri: 'widgets/common/table/',
    context: {
      isRemote: false,
      folderUrl:
        'https://exb.arcgis.com:3001/experience/../widgets/common/table/'
    },
    manifest: {
      name: 'table',
      label: 'Table',
      type: 'widget',
      author: 'Esri R&D Center Beijing',
      description: 'This is the widget provides an interactive table.',
      copyright: '',
      license: 'http://www.apache.org/licenses/LICENSE-2.0',
      publishMessages: ['DATA_RECORDS_SELECTION_CHANGE'],
      defaultSize: {
        width: 600,
        height: 400
      },
      properties: {
        canConsumeDataAction: true,
        canCrossLayoutBoundary: false,
        coverLayoutBackground: true,
        deactivateOtherWidgets: true,
        flipIcon: false,
        hasBuilderSupportModule: false,
        hasConfig: true,
        hasConfigInSettingPage: true,
        hasEmbeddedLayout: false,
        hasMainClass: true,
        hasSettingPage: true,
        hasVersionManager: false,
        isWidgetController: false,
        lockChildren: false,
        needActiveState: false,
        passDataSourceToChildren: true,
        supportAutoSize: true,
        supportInlineEditing: false,
        supportRepeat: false,
        watchViewportVisibility: false
      },
      excludeDataActions: ['table.*', 'arcgis-map.addToMap'],
      translatedLocales: ['en']
    },
    icon: 'https://exb.arcgis.com:3001/experience/../widgets/common/table/icon.svg',
    label: 'Table 1',
    config: {
      arrangeType: 'TABS',
      layersConfig: [layerConfig]
    },
    id: 'widget2',
    parent: {
      LARGE: [{
        layoutId: 'layout1',
        layoutItemId: '0'
      }]
    },
    useDataSources: UseDataSources
  }
}
