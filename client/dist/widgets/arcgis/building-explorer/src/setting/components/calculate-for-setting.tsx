/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import WebScene from 'esri/WebScene'
import Portal from 'esri/portal/Portal'
import PortalItem from 'esri/portal/PortalItem'
import type { JimuMapView } from 'jimu-arcgis'
import BuildingExplorerViewModel from 'esri/widgets/BuildingExplorer/BuildingExplorerViewModel'
import Collection from 'esri/core/Collection'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import type { NumericRange, ViewModelResult } from '../../config'

export interface Props {
  widgetId: string
  jimuMapView: JimuMapView
  onViewModelResultChange: (viewModelResult: ViewModelResult) => void
}

export const CalculateForSetting = React.memo((props: Props) => {
  const view = props.jimuMapView?.view as __esri.SceneView

  if (view?.map) {
    const portal = new Portal({
      url: (view.map as any).portalItem.portal.url
    })
    const webSceneForSetting = new WebScene({
      portalItem: new PortalItem({
        id: (view.map as any).portalItem.id,
        portal: portal
      })
    })

    webSceneForSetting.load()
    //webSceneForSetting.loadAll()
    webSceneForSetting.when(() => {
      function getBuildingLayers (allLayers: __esri.ReadonlyCollection<__esri.Layer>): __esri.Collection<__esri.BuildingSceneLayer> {
        const buildingLayers = new Collection()
        allLayers?.forEach((layer) => {
          if (layer.type === 'building-scene' /* && layer.visible*/) { // honor layer visibility in web scene ,#18930
            //console.log('use BuildingSceneLayer ==> ' + layer.title)
            buildingLayers.push(layer)
          }
        })

        return buildingLayers
      }

      const buildingLayers = getBuildingLayers(webSceneForSetting?.allLayers)
      if (buildingLayers && buildingLayers.length > 0) {
        try {
          view.when(() => {
            const vm = new BuildingExplorerViewModel({
              view: view,
              layers: buildingLayers
            })

            reactiveUtils.whenOnce(() => (vm.state === 'ready')).then(() => {
              const level = vm.level
              const phase = vm.phase

              // result from runtime VM
              const vmResult = {
                level: {
                  min: level?.min,
                  max: level?.max,
                  allowedValuesLimit: level?.allowedValues
                } as NumericRange,
                phase: {
                  min: phase?.min,
                  max: phase?.max,
                  allowedValuesLimit: phase?.allowedValues
                } as NumericRange
              }
              //console.table(obj)

              props.onViewModelResultChange(vmResult)
            })
          })
        } catch (e) {
          console.error(e)
        }
      }
    })
  }

  return (
    <React.Fragment>
    </React.Fragment>
  )
})
