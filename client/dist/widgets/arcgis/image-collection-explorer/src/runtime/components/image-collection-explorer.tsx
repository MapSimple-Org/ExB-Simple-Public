import { useEffect, useState } from "react"
import type { AllWidgetProps } from "jimu-core"
import { Loading, LoadingType } from "jimu-ui"
import "calcite-components"
import { defineCustomElements } from "@arcgis/imagery-components/dist/loader"
import type { IMConfig } from "../../config"
import { getImageryComponentsAssetsPath } from "../../utils"

interface ImageCollectionExplorerProps extends AllWidgetProps<IMConfig> {
  layer?: __esri.ImageryLayer;
  mapView?: __esri.MapView;
}

export const ImageCollectionExplorer = (
  props: ImageCollectionExplorerProps
): React.ReactElement => {
  const {
    context: { folderUrl },
    mapView,
    layer,
    config,
  } = props

  const [hasComponentDefined, setHasComponentDefined] = useState(false)

  useEffect(() => {
    defineCustomElements(window, {
      resourcesUrl: getImageryComponentsAssetsPath(folderUrl),
    })
    setHasComponentDefined(true)
  }, [folderUrl])

  return (
    <div className="d-flex flex-grow-1 overflow-auto">
      {hasComponentDefined ? (
        <arcgis-imagery-collection-explorer
          view={mapView}
          layer={layer}
          hidePanelHeader={true}
          attributeFilterDisabled={!config.enableAttributeFilter}
          spatialFilterDisabled={!config.enableSpatialFilter}
          imageTypeFilterDisabled={!config.enableImageTypeFilter}
          viewImageDetailsDisabled={!config.enableViewImageDetails}
          zoomToDisabled={!config.enableZoomTo}
          addToMapDisabled={!config.enableAddToMap}
          sortDisabled={!config.enableSort}
          listSettingsDisabled={!config.enableListSettings}
          maxImageItemCountPerPage={config.maxImageItemCountPerPage}
        />
      ) : (
        <Loading type={LoadingType.Secondary} />
      )}
    </div>
  )
}
