import type { LayoutJson } from './config'

const layoutJson1: LayoutJson = {
  elements: {
    leftTopContainer: {
      type: 'GROUP',
      groupName: 'leftTopContainer',
      direction: 'horizontal',
      style: {
        position: 'absolute',
        top: '15px',
        left: '15px'
      }
    },
    navigator: {
      type: 'GROUP',
      groupName: 'navigator',
      direction: 'vertical',
      style: {
        marginRight: '10px'
      }
    },
    interact: {
      type: 'GROUP',
      groupName: 'interact',
      direction: 'vertical',
      isResponsive: true,
      style: {
        position: 'absolute',
        top: '15px',
        right: '15px'
      }
    },
    bottom: {
      type: 'GROUP',
      groupName: 'bottom',
      direction: 'vertical',
      className: 'w-100',
      style: {
        position: 'absolute',
        bottom: '0px',
        left: '0px'
      }
    },
    'bottom-line1': {
      type: 'GROUP',
      groupName: 'bottom-line1',
      direction: 'horizontal',
      className: 'd-flex align-items-center justify-content-between w-100 scale-attribution-xy-group',
      style: {
        marginBottom: '0px',
        marginTop: '0px'
      }
    },
    'bottom-line2': {
      type: 'GROUP',
      groupName: 'bottom-line2',
      direction: 'horizontal',
      className: 'd-flex align-items-end justify-content-between w-100',
      style: {
        paddingLeft: '15px',
        paddingRight: '15px',
        marginBottom: '10px'
      }
    },
    'SelectState-FullScreen-Container': {
      type: 'GROUP',
      groupName: 'SelectState-FullScreen-Container',
      direction: 'vertical',
      isVerticalRrlAlignItemsEnd: true
    },
    attributionGroup: {
      type: 'GROUP',
      groupName: 'attributionGroup',
      direction: 'horizontal',
      style: {
        maxWidth: '60%'
      }
    },
    overviewMapContainer: {
      type: 'GROUP',
      groupName: 'overviewMapContainer',
      direction: 'horizontal',
      style: {
        position: 'absolute',
        right: '0px',
        bottom: '16px'
      }
    },
    Zoom: {
      type: 'TOOL',
      toolName: 'Zoom',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '10px'
      }
    },
    Home: {
      type: 'TOOL',
      toolName: 'Home',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '10px'
      }
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Navigation: {
      type: 'TOOL',
      toolName: 'Navigation',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '10px'
      }
    },
    Locate: {
      type: 'TOOL',
      toolName: 'Locate',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '10px'
      }
    },
    Layers: {
      type: 'TOOL',
      toolName: 'Layers',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginBottom: '10px'
      }
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginBottom: '10px'
      }
    },
    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    ExtentNavigate: {
      type: 'TOOL',
      toolName: 'ExtentNavigate',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginBottom: '10px'
      }
    },
    Measure: {
      type: 'TOOL',
      toolName: 'Measure',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start'
    },
    MapSwitch: {
      type: 'TOOL',
      toolName: 'MapSwitch',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    FullScreen: {
      type: 'TOOL',
      toolName: 'FullScreen',
      isOnlyExpanded: false,
      isShowIconTitle: true
    },
    ClearActionData: {
      type: 'TOOL',
      toolName: 'ClearActionData',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    ScaleBar: {
      type: 'TOOL',
      toolName: 'ScaleBar',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginLeft: '6px'
      }
    },
    Attribution: {
      type: 'TOOL',
      toolName: 'Attribution',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'w-100'
    },
    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginBottom: '10px'
      }
    },
    OverviewMap: {
      type: 'TOOL',
      toolName: 'OverviewMap',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      isSecondLayout: false
    }
  },
  layout: {
    leftTopContainer: {
      isMainGroup: true,
      children: ['navigator', 'Select']
    },
    navigator: {
      children: ['Zoom', 'Home', 'Navigation', 'ExtentNavigate', 'Locate', 'Compass']
    },
    interact: {
      isMainGroup: true,
      children: ['Search', 'Layers', 'BaseMap', 'Measure']
    },
    'bottom-line1': {
      children: ['ScaleBar', 'attributionGroup']
    },
    'bottom-line2': {
      children: ['MapSwitch', 'SelectState-FullScreen-Container']
    },
    'SelectState-FullScreen-Container': {
      children: ['FullScreen', 'ClearActionData', 'SelectState']
    },
    bottom: {
      isMainGroup: true,
      children: ['bottom-line2', 'bottom-line1']
    },
    attributionGroup: {
      children: ['Attribution']
    },
    overviewMapContainer: {
      isMainGroup: true,
      children: ['OverviewMap']
    }
  }
}

const layoutJson2: LayoutJson = {
  elements: {
    navigator: {
      type: 'GROUP',
      groupName: 'navigator',
      direction: 'vertical',
      isVerticalRrlAlignItemsEnd: true
    },
    interact: {
      type: 'GROUP',
      groupName: 'interact',
      direction: 'horizontal',
      isResponsive: true,
      style: {
        position: 'absolute',
        top: '15px',
        left: '15px'
      }
    },
    fullScreenGroup: {
      type: 'GROUP',
      groupName: 'fullScreenGroup',
      direction: 'horizontal',
      style: {
        position: 'absolute',
        top: '15px',
        right: '15px'
      }
    },
    bottom: {
      type: 'GROUP',
      groupName: 'bottom',
      direction: 'vertical',
      className: 'w-100',
      style: {
        position: 'absolute',
        bottom: '0px',
        left: '0px'
      }
    },
    'bottom-line1': {
      type: 'GROUP',
      groupName: 'bottom-line1',
      direction: 'horizontal',
      className: 'd-flex align-items-center justify-content-between w-100 scale-attribution-xy-group',
      style: {
        marginBottom: '0px',
        marginTop: '0px'
      }
    },
    'bottom-line2': {
      type: 'GROUP',
      groupName: 'bottom-line2',
      direction: 'horizontal',
      className: 'd-flex align-items-end justify-content-between w-100',
      style: {
        paddingLeft: '15px',
        paddingRight: '15px',
        marginBottom: '10px'
      }
    },
    attributionGroup: {
      type: 'GROUP',
      groupName: 'attributionGroup',
      direction: 'horizontal',
      style: {
        maxWidth: '60%'
      },
      className: 'attibute-group'
    },
    overviewMapContainer: {
      type: 'GROUP',
      groupName: 'overviewMapContainer',
      direction: 'horizontal',
      style: {
        position: 'absolute',
        right: '0px',
        top: '0px'
      }
    },
    Zoom: {
      type: 'TOOL',
      toolName: 'Zoom',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    Home: {
      type: 'TOOL',
      toolName: 'Home',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Navigation: {
      type: 'TOOL',
      toolName: 'Navigation',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    Locate: {
      type: 'TOOL',
      toolName: 'Locate',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    ExtentNavigate: {
      type: 'TOOL',
      toolName: 'ExtentNavigate',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginTop: '10px'
      }
    },
    Layers: {
      type: 'TOOL',
      toolName: 'Layers',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '10px'
      }
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '10px'
      }
    },
    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    Measure: {
      type: 'TOOL',
      toolName: 'Measure',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '10px'
      }
    },
    MapSwitch: {
      type: 'TOOL',
      toolName: 'MapSwitch',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    FullScreen: {
      type: 'TOOL',
      toolName: 'FullScreen',
      isOnlyExpanded: false,
      isShowIconTitle: true
    },
    ClearActionData: {
      type: 'TOOL',
      toolName: 'ClearActionData',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginLeft: '10px'
      }
    },
    ScaleBar: {
      type: 'TOOL',
      toolName: 'ScaleBar',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginLeft: '6px'
      }
    },
    Attribution: {
      type: 'TOOL',
      toolName: 'Attribution',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'w-100'
    },
    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '10px'
      }
    },
    OverviewMap: {
      type: 'TOOL',
      toolName: 'OverviewMap',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      isSecondLayout: true
    }
  },
  layout: {
    navigator: {
      children: ['Compass', 'Locate', 'ExtentNavigate', 'Navigation', 'Zoom', 'Home', 'SelectState']
    },
    interact: {
      isMainGroup: true,
      children: ['Search', 'Layers', 'BaseMap', 'Measure', 'Select']
    },
    fullScreenGroup: {
      isMainGroup: true,
      children: ['FullScreen', 'ClearActionData']
    },
    'bottom-line1': {
      children: ['ScaleBar', 'attributionGroup']
    },
    'bottom-line2': {
      children: ['MapSwitch', 'navigator']
    },
    bottom: {
      isMainGroup: true,
      children: ['bottom-line2', 'bottom-line1']
    },
    attributionGroup: {
      children: ['Attribution']
    },
    overviewMapContainer: {
      isMainGroup: true,
      children: ['OverviewMap']
    }
  }
}

const layoutJsons: LayoutJson[] = [layoutJson1, layoutJson2]

export default layoutJsons
