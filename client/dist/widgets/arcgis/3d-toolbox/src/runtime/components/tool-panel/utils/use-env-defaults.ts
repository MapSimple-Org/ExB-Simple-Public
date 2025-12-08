/** @jsx jsx */
import { React } from 'jimu-core'

// export interface EnvDefaultProps {
//   jimuMapView: JimuMapView
// }
export const useEnvDefault = (/*props: EnvDefaultProps*/) => {
  // 1.Lighting
  const defaultLightingRef = React.useRef<__esri.websceneSunLighting | __esri.websceneVirtualLighting>(null)
  const cacheDefaultLighting = React.useCallback((view: __esri.SceneView) => {
    if (!defaultLightingRef.current) {
      const defautLighting = view.environment.lighting.clone()
      defaultLightingRef.current = defautLighting
    }
  }, [])
  const restoreDefaultLighting = React.useCallback((view: __esri.SceneView) => {
    if (view && defaultLightingRef.current) {
      view.environment.lighting = (defaultLightingRef.current as __esri.SunLighting | __esri.VirtualLighting)
    }

    defaultLightingRef.current = null
  }, [])

  // 2.Weather
  const defaultWeatherRef = React.useRef<__esri.SunnyWeather | __esri.CloudyWeather | __esri.RainyWeather | __esri.SnowyWeather | __esri.FoggyWeather>(null)
  const cacheDefaultWeather = React.useCallback((view: __esri.SceneView) => {
    if (!defaultWeatherRef.current) {
      const defautWeather = view.environment.weather.clone()
      defaultWeatherRef.current = defautWeather
    }
  }, [])
  const restoreDefaultWeather = React.useCallback((view: __esri.SceneView) => {
    if (view && defaultWeatherRef.current) {
      view.environment.weather = defaultWeatherRef.current
    }

    defaultWeatherRef.current = null
  }, [])

  // export interfaces
  return {
    // Lighting
    cacheDefaultLighting: cacheDefaultLighting,
    restoreDefaultLighting: restoreDefaultLighting,
    // Weather
    cacheDefaultWeather: cacheDefaultWeather,
    restoreDefaultWeather: restoreDefaultWeather
  }
}
