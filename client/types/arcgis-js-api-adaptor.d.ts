/// <reference path="../node_modules/@arcgis/core/interfaces.d.ts"/>

/// API extension
declare namespace __esri {
  export interface SceneView {
    /// esri/views/3d/support/RenderCoordsHelper
    renderCoordsHelper?: {
      worldUpAtPosition: function
    }
  }

  export interface CoordinateConversionViewModel {
    pause: function;
    messages: null;
  }

  export interface Format {
    _project: function
  }

  export interface Field {
    clone: function
  }
}
