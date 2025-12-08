/** @jsx jsx */
import { React, jsx, type ImmutableArray, hooks, type ImmutableObject, Immutable } from 'jimu-core'
import { Label, Select } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { InlineEditableDropdown, type LrsLayer, LrsLayerType, SearchMethod, isDefined } from 'widgets/shared-code/lrs'
import type { ResultConfig } from '../../config'

export interface SearchMethodProps {
  lrsLayers: ImmutableArray<LrsLayer>
  defaultNetwork: string
  resultConfig: ResultConfig
  hideMethod: boolean
  hideNetwork: boolean
  defaultReferent: ImmutableObject<LrsLayer>
  onMethodChanged?: (SearchMethod: SearchMethod) => void
  onNetworkChanged?: (selectedNetwork: ImmutableObject<LrsLayer>) => void
  onReferentChanged?: (selectedReferent: any) => void
}

export function SearchMethodForm (props: SearchMethodProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { defaultReferent, defaultNetwork, lrsLayers, resultConfig, hideMethod, hideNetwork, onMethodChanged, onNetworkChanged, onReferentChanged } = props
  const [selectedNetwork, setSelectedNetwork] = React.useState(lrsLayers[0])
  const [selectedPointLayer, setSelectedPointLayer] = React.useState(resultConfig?.defaultReferentLayer)
  const [selectedMethod, setSelectedMethod] = React.useState(selectedNetwork.networkInfo.defaultMethod)
  const [networkNames, setNetworkNames] = React.useState<string[]>([])

  const hasReferentLayers = React.useMemo(() => {
    return lrsLayers.some(item => item.isReferent)
  }, [lrsLayers])

  React.useEffect(() => {
    setSelectedPointLayer(defaultReferent)
  }, [defaultReferent])

  React.useEffect(() => {
    const item = lrsLayers.find(prop => prop.name === defaultNetwork && !prop?.isReferent)
    if (isDefined(item)) {
      setSelectedNetwork(Immutable(item))
      if (item.networkInfo.defaultMethod === SearchMethod.Referent && !hasReferentLayers) {
        // Default method is Referents, but no referents in the map.
        if (item.networkInfo.useMeasure) {
          setSelectedMethod(SearchMethod.Measure)
        } else if (item.networkInfo.useCoordinate) {
          setSelectedMethod(SearchMethod.Coordinate)
        } else {
          setSelectedMethod(SearchMethod.Referent)
        }
      } else {
        // Set default method
        setSelectedMethod(item.networkInfo.defaultMethod)
      }
    }
  }, [defaultNetwork, hasReferentLayers, lrsLayers])

  const networkChanged = (value: string, type: string) => {
    // Update both method and selected network.
    const index = lrsLayers.findIndex(prop => prop.name === value)
    if (type === 'network') {
      setSelectedNetwork(lrsLayers[index])
      onNetworkChanged(lrsLayers[index])
      setSelectedMethod(lrsLayers[index].networkInfo.defaultMethod)
      onMethodChanged(lrsLayers[index].networkInfo.defaultMethod)
    } else {
      setSelectedPointLayer(lrsLayers[index])
      onReferentChanged(lrsLayers[index])
    }
  }

  const methodChanged = (value: string) => {
    let method = SearchMethod.Measure
    if (value === SearchMethod.Coordinate) {
      method = SearchMethod.Coordinate
    } else if (value === SearchMethod.Referent) {
      method = SearchMethod.Referent
    } else if (value === SearchMethod.LineAndMeasure) {
      method = SearchMethod.LineAndMeasure
    }
    setSelectedMethod(method)
    onMethodChanged(method)
  }

  React.useEffect(() => {
    const names = lrsLayers.filter(item => !item.isReferent && item.layerType === LrsLayerType.Network).map(network => network.name).asMutable()
    setNetworkNames(names)
  }, [lrsLayers])

  const activeMethods = React.useMemo(() => {
    let count = 0
    if (selectedNetwork.networkInfo.useMeasure) { count++ }
    if (selectedNetwork.networkInfo.useCoordinate) { count++ }
    if (selectedNetwork.networkInfo.useReferent) { count++ }
    if (selectedNetwork.networkInfo.useLineAndMeasure) { count++ }
    return count
  }, [selectedNetwork])

  const getMethodItems = (): string[] => {
    const methodList: string[] = []
    if (selectedNetwork.networkInfo.useMeasure) { methodList.push(SearchMethod.Measure) }
    if (selectedNetwork.networkInfo.useCoordinate) { methodList.push(SearchMethod.Coordinate) }
    if (selectedNetwork.networkInfo.useReferent && hasReferentLayers) { methodList.push(SearchMethod.Referent) }
    if (selectedNetwork.networkInfo.useLineAndMeasure) { methodList.push(SearchMethod.LineAndMeasure) }
    return methodList
  }

  const getAltMethodDescriptions = (): string[] => {
    const methodList: string[] = []
    if (selectedNetwork.networkInfo.useMeasure) { methodList.push(getI18nMessage('measure')) }
    if (selectedNetwork.networkInfo.useCoordinate) { methodList.push(getI18nMessage('coordinate')) }
    if (selectedNetwork.networkInfo.useReferent) { methodList.push(getI18nMessage('referent')) }
    if (selectedNetwork.networkInfo.useLineAndMeasure) { methodList.push(getI18nMessage('lineAndMeasure')) }
    return methodList
  }

  return (
    <div className='search-method-form'>
      {!hideMethod && (
        <InlineEditableDropdown
          label={getI18nMessage('method')}
          isDisabled={activeMethods === 1}
          defaultItem={selectedMethod}
          altItemDescriptions={getAltMethodDescriptions()}
          listItems={getMethodItems()}
          onSelectionChanged={methodChanged}
        />
      )}
        {!hideNetwork && (
          <InlineEditableDropdown
            label={getI18nMessage('network')}
            isDisabled={lrsLayers.length === 1}
            defaultItem={isDefined(selectedNetwork) ? selectedNetwork.name : ''}
            listItems={networkNames}
            onSelectionChanged={(e) => { networkChanged(e, 'network') }}
          />
        )}
        {selectedMethod === SearchMethod.Referent && selectedPointLayer && (
          <div className="search-method-form__network-label px-3" style={{ paddingTop: '12px' }}>
            <Label size="default" className='mb-1 title3' centric style={{ width: 100 }} >
              {getI18nMessage('referentRequired')}
            </Label>
            <Select
              aria-label={getI18nMessage('referent')}
              className='w-100'
              size='sm'
              disabled={lrsLayers.length === 1}
              value={selectedPointLayer.name}
              onChange={(e) => { networkChanged(e.target.value, 'point') }}
            >
            {
              lrsLayers.map((config, index) => {
                const referent = config?.isReferent
                if (referent) {
                  return (
                    <option key={index} value={config.name}>{config.name}</option>
                  )
                } else {
                  return null
                }
              })
            }
            </Select>
          </div>
        )}
    </div>
  )
}
