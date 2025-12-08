// disable drawing before the layer gets loaded ,#6378
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

export interface Options {
  sceneView: __esri.SceneView
  onTerrainLoaded: () => void
}

export default class TerrainLoadingHelper {
  private reactiveUtils: __esri.reactiveUtils
  private sceneView: __esri.SceneView = null
  private onTerrainLoaded: () => void

  // constructor
  async setup (opts: Options): Promise<TerrainLoadingHelper> {
    await loadArcGISJSAPIModules([
      'esri/core/reactiveUtils'
    ]).then(modules => {
      [this.reactiveUtils] = modules
      this.sceneView = opts.sceneView
      this.onTerrainLoaded = opts.onTerrainLoaded

      this.handleTerrainLoaded()
    })
    return this
  }

  async handleTerrainLoaded () {
    /* const p = */await Promise.race([this.getTerrainLoadedPromise(), this.getTimerPromise(10000)])
    this.onTerrainLoaded()
  }

  private async getTerrainLoadedPromise (): Promise<boolean> {
    if (!this.sceneView || !this.sceneView.groundView) {
      return false
    }

    try {
      await this.reactiveUtils.whenOnce(() => this.sceneView?.groundView?.updating) // Starting from 4.28, null may be obtained here after map is unloaded ,#16303
      await this.reactiveUtils.whenOnce(() => !this.sceneView?.groundView?.updating)
    } catch (error) {
      return false
    }

    return true
  }

  private async getTimerPromise (ms): Promise<boolean> {
    return await new Promise(resolve => setTimeout(resolve, ms))
  }
}
