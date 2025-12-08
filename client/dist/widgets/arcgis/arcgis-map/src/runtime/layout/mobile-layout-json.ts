import type { LayoutJson } from './config'

const mobileLayoutJson: LayoutJson = {
  elements: {
    mainGroup: {
      type: 'GROUP',
      groupName: 'mainGroup',
      direction: 'vertical',
      className: 'd-flex flex-column',
      style: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px'
      }
    },
    topGroup: {
      type: 'GROUP',
      groupName: 'topGroup',
      direction: 'horizontal',
      className: 'd-flex w-100 align-items-center justify-content-between',
      style: {
        padding: '10px 10px 0 10px'
      }
    },
    midGroup: {
      type: 'GROUP',
      groupName: 'midGroup',
      direction: 'horizontal',
      className: 'flex-grow-1 d-flex w-100 justify-content-between',
      style: {
        position: 'relative'
      }
    },
    bottomGroup: {
      type: 'GROUP',
      groupName: 'bottomGroup',
      direction: 'horizontal',
      className: 'd-flex w-100 align-items-center justify-content-between'
    },
    'midGroup-left-top': {
      type: 'GROUP',
      groupName: 'midGroup-left-top',
      direction: 'vertical',
      style: {
        position: 'absolute',
        left: '0px',
        top: '0px'
      }
    },
    'midGroup-left-bottom': {
      type: 'GROUP',
      groupName: 'midGroup-left-bottom',
      direction: 'vertical',
      className: 'd-flex flex-column',
      isVerticalRrlAlignItemsStart: true,
      style: {
        position: 'absolute',
        left: '0px',
        bottom: '0px'
      }
    },
    'midGroup-right-content-top': {
      type: 'GROUP',
      groupName: 'midGroup-right-content-top',
      direction: 'vertical',
      style: {
        position: 'absolute',
        top: '0px',
        right: '10px'
      }
    },
    'midGroup-right-content-bottom': {
      type: 'GROUP',
      groupName: 'midGroup-right-content-bottom',
      direction: 'vertical',
      style: {
        position: 'absolute',
        bottom: '10px',
        right: '10px'
      }
    },
    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'flex-grow-1'
    },
    FullScreen: {
      type: 'TOOL',
      toolName: 'FullScreen',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      style: {
        marginLeft: '10px'
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
    ClearActionData: {
      type: 'TOOL',
      toolName: 'ClearActionData',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'mb-0',
      style: {
        marginLeft: '10px',
        marginTop: '10px'
      }
    },
    MapSwitch: {
      type: 'TOOL',
      toolName: 'MapSwitch',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginLeft: '10px',
        marginBottom: '10px'
      }
    },
    Zoom: {
      type: 'TOOL',
      toolName: 'Zoom',
      isOnlyExpanded: true,
      isShowIconTitle: false
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
    ExtentNavigate: {
      type: 'TOOL',
      toolName: 'ExtentNavigate',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginLeft: '10px',
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
        marginTop: '10px'
      }
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginTop: '10px'
      }
    },
    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '10px'
      }
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        width: '100%'
      }
    },
    Measure: {
      type: 'TOOL',
      toolName: 'Measure',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
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
    }
  },
  layout: {
    mainGroup: {
      isMainGroup: true,
      children: ['topGroup', 'midGroup', 'bottomGroup']
    },
    topGroup: {
      children: ['Search', 'FullScreen']
    },
    midGroup: {
      children: ['midGroup-left-top', 'midGroup-left-bottom', 'midGroup-right-content-top', 'midGroup-right-content-bottom']
    },
    'midGroup-left-top': {
      children: ['Compass']
    },
    'midGroup-left-bottom': {
      children: ['ExtentNavigate', 'MapSwitch', 'ScaleBar']
    },
    'midGroup-right-content-top': {
      children: ['Layers', 'BaseMap', 'Measure', 'Select']
    },
    'midGroup-right-content-bottom': {
      children: ['Zoom', 'Home', 'Locate', 'ClearActionData']
    },
    bottomGroup: {
      children: ['SelectState']
    }
  },
  mobileResponsiveStrategy: {
    // height: 400-465
    stage1: ['Measure', 'Locate'],

    // height: 320-400
    stage2: ['Measure', 'Select', 'Locate', 'bottomGroup'],

    // height: 250-320
    stage3: ['ExtentNavigate', 'midGroup-right-content-top', 'Locate', 'bottomGroup'],

    // height: 160-250
    stage4: ['MapSwitch', 'midGroup-right-content-top', 'Home', 'Locate', 'ClearActionData', 'bottomGroup'],

    // height: 54-160
    stage5: ['midGroup', 'bottomGroup'],

    // height: 0-54
    stage6: ['topGroup', 'midGroup', 'bottomGroup']
  },
  lockToolNames: []
}

const mobileLayoutJsons: LayoutJson[] = [mobileLayoutJson]

export default mobileLayoutJsons
