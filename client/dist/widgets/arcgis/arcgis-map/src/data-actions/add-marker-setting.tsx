/** @jsx jsx */
import { React, hooks, jsx, css, type DataActionSettingProps } from 'jimu-core'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SymbolSelector, JimuSymbolType, type JimuSymbol } from 'jimu-ui/advanced/map'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { type IMAddMarkerConfig, getFinalIMAddMarkerConfig, getFinalAddMarkerSymbolInstance } from '../common/add-marker-common'

const style = css`
  .add-marker-setting-row {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .jimu-symbol-selector {
    margin-top: 8px;
  }
`

function AddMarkerSetting(props: DataActionSettingProps<IMAddMarkerConfig>) {
  const configProp = props.config
  const onSettingChangeProp = props.onSettingChange

  const symbolsSupportJsonUtilsRef = React.useRef<typeof __esri.symbolsSupportJsonUtils>(null)
  const [isModulesLoaded, setIsModulesLoaded] = React.useState<boolean>(false)

  React.useEffect(() => {
    loadArcGISJSAPIModules([
      'esri/symbols/support/jsonUtils'
    ]).then(modules => {
      symbolsSupportJsonUtilsRef.current = modules[0]
      setIsModulesLoaded(true)
    })
  }, [])

  // make sure finalConfig.symbol is not empty
  const finalConfig = React.useMemo(() => {
    const result = getFinalIMAddMarkerConfig(configProp)
    return result
  }, [configProp])

  const onPointSymbolChanged = React.useCallback((newSymbol: JimuSymbol) => {
    const symbolJson = newSymbol?.toJSON()

    if (symbolJson && onSettingChangeProp) {
      const newConfig = finalConfig.set('symbol', symbolJson)
      onSettingChangeProp(newConfig)
    }
  }, [finalConfig, onSettingChangeProp])

  const symbol = getFinalAddMarkerSymbolInstance(finalConfig, symbolsSupportJsonUtilsRef.current)
  const translate = hooks.useTranslation(jimuUIMessages)
  const symbolLabel = translate('symbol')

  return (
    <div className='add-marker-setting w-100 mb-3' css={style}>
      <SettingRow
        className='add-marker-setting-row'
        label={symbolLabel}
        aria-label={symbolLabel}
      >
        {
          isModulesLoaded && symbolsSupportJsonUtilsRef.current && symbol &&
          <SymbolSelector
            jimuSymbolType={JimuSymbolType.Point}
            symbol={symbol}
            onPointSymbolChanged={ onPointSymbolChanged }
          />
        }
      </SettingRow>
    </div>
  )
}

export default AddMarkerSetting
