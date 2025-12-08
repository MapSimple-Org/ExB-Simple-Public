import { React } from 'jimu-core'
import { getLocaleInfo } from '@arcgis/analysis-shared-utils'
import * as sharedUtils from './shared-utils'

export const getAssetsPathByFolderName = sharedUtils.getAssetsPathByFolderName

export const getAnalysisAssetPath = sharedUtils.getAnalysisAssetPath

export const useStrings = sharedUtils.useStrings

export const useHelpMapStrings = () => {
  return useStrings(`${getAnalysisAssetPath()}assets/help/helpmap.json`)
}

export const useHelpMapEnterpriseStrings = () => {
  return useStrings(`${getAnalysisAssetPath()}assets/help/helpmap_enterprise.json`)
}

export const useGPMessageStrings = (locale: string = getLocaleInfo().locale) => {
  return useStrings(`${getAnalysisAssetPath()}assets/t9n/gpmessage/gpmessage.t9n.${locale ?? 'en-US'}.json`)
}

export const useErrorMessageStrings = (locale: string = getLocaleInfo().locale) => {
  return useStrings(`${getAnalysisAssetPath()}assets/t9n/validation/errors.t9n.${locale ?? 'en-US'}.json`)
}

export const useToolInfoStrings = (locale: string = getLocaleInfo().locale) => {
  return sharedUtils.useToolInfoStringsByLocale(locale)
}

export const useCommonStrings = (locale: string = getLocaleInfo().locale) => {
  return sharedUtils.useCommonStringsByLocale(locale)
}

export const useWebToolsUnits = () => {
  const commonStrings = useCommonStrings()
  return (commonStrings?.webToolsUnits || {}) as { [key: string]: string }
}

let translatedRFTNamesMapCache = new Map()

export const useTranslatedRFTNamesMap = () => {
  const [translatedRFTNamesMap, setTranslatedRFTNamesMap] = React.useState<Map<string, string>>(translatedRFTNamesMapCache)

  React.useEffect(() => {
    if (translatedRFTNamesMap.size) {
      return
    }
    if (translatedRFTNamesMapCache.size) {
      setTranslatedRFTNamesMap(translatedRFTNamesMap)
      return
    }

    import('@arcgis/arcgis-raster-function-editor').then(({ getTranslatedRFTNamesMap }) => {
      getTranslatedRFTNamesMap().then((names) => {
        setTranslatedRFTNamesMap(names)
        translatedRFTNamesMapCache = names
      })
    })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return translatedRFTNamesMap
}
