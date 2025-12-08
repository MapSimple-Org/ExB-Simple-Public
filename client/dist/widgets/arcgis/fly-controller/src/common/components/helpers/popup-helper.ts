// import { JimuMapView } from 'jimu-arcgis';
// import * as SceneView from 'esri/views/SceneView';

// interface Options {
//   jimuMapView: JimuMapView;
//   sceneView: __esri.SceneView;
// }

// export default class PopupHelper_1 {
//   sceneView: SceneView;
//   jimuMapView: JimuMapView;

//   cache: {
//     mapState: {
//       popup: boolean,
//       hightLight: boolean
//     }
//   }

//   constructor(options: Options) {
//     this.props.jimuMapView = options.jimuMapView;
//     this.sceneView = options.sceneView;

//     this.cache = {
//       mapState: {
//         popup: null,
//         hightLight: null
//       },
//       // currentHighlightGeo: {
//       //   highlightGeo: null,
//       //   highlightHandler: null
//       // }
//     }

//     this.clearCacheMapState();
//     //this.clearCacheHighlightGeo();
//   }
//   destructor() {
//     //this.clear();
//     this.restoreMapPopupHighlightState();
//   }

//   private clearCacheMapState = () => {
//     this.mapPopupState = {
//       popup: null,
//       hightLight: null
//     }
//   }
//   // private clearCacheHighlightGeo = () => {
//   //   this.cache.currentHighlightGeo = {
//   //     highlightGeo: null,
//   //     highlightHandler: null
//   //   };
//   // }

//   //enable&disable
//   enablePopupAndHighlight = () => {
//     const jimuMapView = this.props.jimuMapView;
//     if (jimuMapView) {
//       jimuMapView.startEdit();
//       jimuMapView.enablePopup();
//       jimuMapView.enableHighlight();
//       jimuMapView.exitEdit();
//       //console.log("==> EnablePopupAndHighlight")
//     }
//   }
//   disablePopupAndHighlight = () => {
//     const jimuMapView = this.props.jimuMapView;
//     if (jimuMapView) {
//       jimuMapView.startEdit();
//       jimuMapView.disablePopup();
//       jimuMapView.disableHighlight();
//       jimuMapView.exitEdit();
//       //console.log("==> DisablePopupAndHighlight")
//     }
//   }

//   //cache&restore
//   cacheMapPopupHighlightState = () => {
//     this.mapPopupState.popup = this.props.jimuMapView?.getIsEnablePopup();
//     this.mapPopupState.hightLight = this.props.jimuMapView?.getIsEnableHighlight();
//   }
//   restoreMapPopupHighlightState = () => {
//     const jimuMapView = this.props.jimuMapView;
//     if (jimuMapView) {
//       let update = false;
//       jimuMapView.startEdit();

//       const popup = this.mapPopupState.popup;
//       if (true === popup) {
//         jimuMapView.enablePopup();
//         update = true;
//       } else if (false === popup) {
//         jimuMapView.disablePopup();
//         update = true;
//       }

//       const hightLight = this.mapPopupState.hightLight;
//       if (true === hightLight) {
//         jimuMapView.enableHighlight();
//         update = true;
//       } else if (false === hightLight) {
//         jimuMapView.disableHighlight();
//         update = true;
//       }

//       if (update) {
//         this.clearCacheMapState();//restore once
//       }

//       jimuMapView.exitEdit();
//     }
//   }

//   // getIsEnablePopupAndHighlight = () => {
//   //   let jimuMapView = this.props.jimuMapView;
//   //   if (jimuMapView) {
//   //     jimuMapView.getIsEnablePopup();
//   //     jimuMapView.getIsEnableHighlight();
//   //   }
//   // }

//   //Graphic
//   // getHighlightGraphic = () => {
//   //   return this.cache.currentHighlightGeo.highlightGeo;
//   // }
//   // cacheHighlightGraphic = (handler, geo) => {
//   //   this.clear();
//   //   this.cache.currentHighlightGeo.highlightGeo = geo;
//   //   this.cache.currentHighlightGeo.highlightHandler = handler;
//   // }
//   // clear = () => {
//   //   if (this.cache.currentHighlightGeo.highlightHandler) {
//   //     this.cache.currentHighlightGeo.highlightHandler.remove();
//   //   }
//   //   this.cache.currentHighlightGeo.highlightGeo = null;
//   //   this.cache.currentHighlightGeo.highlightHandler = null;
//   // };
//   // clear = () => {
//   //   this.restoreMapPopupHighlightState();
//   // }
// }
import { React } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import * as utils from '../../utils/utils'

interface Props {
  jimuMapView: JimuMapView
  onPopupHelperCreated: (ref: PopupHelper) => void
}
// interface States {
//   //
// }
export interface MapPopupState {
  popup: boolean
  hightLight: boolean
}

export default class PopupHelper extends React.PureComponent<Props/*, States */> {
  mapPopupState: MapPopupState

  constructor (props) {
    super(props)

    this.mapPopupState = {
      popup: null,
      hightLight: null
    }

    this.clearCacheMapState()
  }

  componentDidMount = (): void => {
    this.props.onPopupHelperCreated(this)
  }

  componentWillUnmount = (): void => {
    this.restoreMapPopupHighlightState()
  }

  private readonly clearCacheMapState = (): void => {
    this.mapPopupState = {
      popup: null,
      hightLight: null
    }
  }

  /* eslint-disable react/no-unused-class-component-methods */
  // enable&disable
  enablePopupAndHighlight = (): void => {
    const jimuMapView = this.props.jimuMapView
    if (utils.isDefined(jimuMapView)) {
      jimuMapView.enableClickOpenPopup()
      jimuMapView.enableClickHighlight()
      // console.log("==> EnablePopupAndHighlight")
    }
  }

  disablePopupAndHighlight = (): void => {
    const jimuMapView = this.props.jimuMapView
    if (utils.isDefined(jimuMapView)) {
      jimuMapView.disableClickOpenPopup()
      jimuMapView.disableClickHighlight()
      // console.log("==> DisablePopupAndHighlight")
    }
  }

  // cache&restore
  cacheMapPopupHighlightState = (): void => {
    this.mapPopupState.popup = this.props.jimuMapView?.isClickOpenPopupEnabled()
    this.mapPopupState.hightLight = this.props.jimuMapView?.isClickHighlightEnabled()
  }
  /* eslint-enable react/no-unused-class-component-methods */

  restoreMapPopupHighlightState = (): void => {
    const jimuMapView = this.props.jimuMapView
    const isMapStateCached = (this.mapPopupState.popup !== null && this.mapPopupState.hightLight !== null)
    if (utils.isDefined(jimuMapView) && jimuMapView?.view && isMapStateCached) {
      let update = false

      const popup = this.mapPopupState.popup
      if (popup) {
        jimuMapView.enableClickOpenPopup()
        update = true
      } else if (!popup) {
        jimuMapView.disableClickOpenPopup()
        update = true
      }

      const hightLight = this.mapPopupState.hightLight
      if (hightLight) {
        jimuMapView.enableClickHighlight()
        update = true
      } else if (!hightLight) {
        jimuMapView.disableClickHighlight()
        update = true
      }

      if (update) {
        this.clearCacheMapState()// restore once
      }
    }
  }

  render (): React.ReactElement {
    return null
  }
}
