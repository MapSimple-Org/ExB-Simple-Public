import { abortMaybe, destroyMaybe } from '@arcgis/core/core/maybe'
import type { OiViewerWithVisibleElements } from '../config'

export const removeLoadedOiElements = (oiViewer: OiViewerWithVisibleElements) => {
  const viewModel = oiViewer.viewModel
  //@ts-expect-error undocumented property _updateFootprintTask
  viewModel._updateFootprintTask = abortMaybe(viewModel._updateFootprintTask)
  //@ts-expect-error undocumented property _clickTask
  viewModel._clickTask = abortMaybe(viewModel._clickTask)

  //@ts-expect-error undocumented property coverageFrustums
  viewModel.coverageFrustums?.destroy()
  //@ts-expect-error undocumented property coveragePolygons
  viewModel.coveragePolygons?.destroy()
  //@ts-expect-error undocumented property pointSources
  viewModel.pointSources?.destroy()
  //@ts-expect-error undocumented property additionalFootprints
  viewModel.additionalFootprints?.destroy()
  //@ts-expect-error undocumented property additionalCameraLocations
  viewModel.additionalCameraLocations?.destroy()

  //@ts-expect-error undocumented property bestFeatureFootprint
  viewModel.bestFeatureFootprint = destroyMaybe(viewModel.bestFeatureFootprint)
  //@ts-expect-error undocumented property bestFeatureCurrentFootprint
  viewModel.bestFeatureCurrentFootprint = destroyMaybe(viewModel.bestFeatureCurrentFootprint)
  //@ts-expect-error undocumented property _crossSymbol
  viewModel._crossSymbol = destroyMaybe(viewModel._crossSymbol)
  //@ts-expect-error undocumented property _referencePointOnGround
  viewModel._referencePointOnGround = destroyMaybe(viewModel._referencePointOnGround)
  //@ts-expect-error undocumented property _referencePointOnImage
  viewModel._referencePointOnImage = destroyMaybe(viewModel._referencePointOnImage)
  //@ts-expect-error undocumented property _overlays
  if (viewModel._overlays) {
    //@ts-expect-error undocumented property _overlays
    viewModel._overlays.graphics.removeAll()
  }
  //@ts-expect-error undocumented property resetImage()
  oiViewer.viewModel.resetImage()
  //@ts-expect-error undocumented property resetVideo()
  viewModel.resetVideo()
}
