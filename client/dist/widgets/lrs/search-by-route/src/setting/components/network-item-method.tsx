/** @jsx jsx */
import { React, jsx, type ImmutableObject, hooks, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Switch, Select } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { lrsDefaultMessages, type LrsLayer, LrsLayerType, SearchMethod } from 'widgets/shared-code/lrs'

interface Props {
  widgetId: string
  lrsLayer?: ImmutableObject<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
  onPropertiesChanged: (prop: string[], value: any[], dsUpdateRequired?: boolean) => void
}

export function NetworkItemMethod (props: Props) {
  const { lrsLayer, onPropertyChanged, onPropertiesChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const networkInfo = props.lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  const handleSwitchChange = (e, name: string) => {
    if (!e.target) return
    if (checkIfMethodNeedsUpdate(name)) {
      // Need to update 2 properties, the default method and
      // the method that was disabled.
      const props: string[] = []
      const values: SearchMethod[] = []
      // update swtich value
      props.push(name)
      values.push(e.target.checked)
      // update default value
      props.push('defaultMethod')
      values.push(getNewActiveMethod(name))
      onPropertiesChanged(props, values, true)
    } else {
      // Only the disabled method needs updating.
      onPropertyChanged(name, e.target.checked, true)
    }
  }

  const checkIfMethodNeedsUpdate = (name: string): boolean => {
    // Checks if the disabled method was also the selected default method.
    let needsUpdate: boolean = false
    switch (name) {
      case 'useMeasure': {
        needsUpdate = networkInfo.defaultMethod === SearchMethod.Measure
        break
      }
      case 'useCoordinate': {
        needsUpdate = networkInfo.defaultMethod === SearchMethod.Coordinate
        break
      }
      case 'useReferent': {
        needsUpdate = networkInfo.defaultMethod === SearchMethod.Referent
        break
      }
      case 'useLineAndMeasure': {
        needsUpdate = networkInfo.defaultMethod === SearchMethod.LineAndMeasure
        break
      }
    }
    return needsUpdate
  }

  const getNewActiveMethod = (currentChange: string): SearchMethod => {
    // Returns the first available method if the selected method was disabled.
    if (currentChange !== 'useMeasure' && networkInfo.useMeasure && networkInfo.defaultMethod !== SearchMethod.Measure) {
      return SearchMethod.Measure
    } else if (currentChange !== 'useCoordinate' && networkInfo.useCoordinate && networkInfo.defaultMethod !== SearchMethod.Coordinate) {
      return SearchMethod.Coordinate
    } else if (currentChange !== 'useLineAndMeasure' && networkInfo.useLineAndMeasure &&
                networkInfo.defaultMethod !== SearchMethod.LineAndMeasure) {
      return SearchMethod.LineAndMeasure
    } else {
      return SearchMethod.Referent
    }
  }

  const GetActiveMethods = (): number => {
    // Returns how many methods are enabled.
    let count = 0
    if (networkInfo.useMeasure) { count++ }
    if (networkInfo.useCoordinate) { count++ }
    if (networkInfo.useReferent) { count++ }
    if (networkInfo.useLineAndMeasure) { count++ }
    return count
  }

  return (
    <SettingSection role='group' aria-label={getI18nMessage('searchMethod')} title={getI18nMessage('searchMethod')}>
      <SettingRow flow='wrap' label={getI18nMessage('defaultStr')}>
        <Select
          aria-label={getI18nMessage('defaultStr')}
          className='w-100'
          size='sm'
          value={networkInfo.defaultMethod}
          disabled={GetActiveMethods() === 1}
          onChange={e => { onPropertyChanged('defaultMethod', e.target.value, true) }}
        >
          {networkInfo.useMeasure && (
            <option value={SearchMethod.Measure}>{getI18nMessage('measure')}</option>
          )}
          {networkInfo.useCoordinate && (
            <option value={SearchMethod.Coordinate}>{getI18nMessage('coordinate')}</option>
          )}
          {networkInfo.useReferent && (
            <option value={SearchMethod.Referent}>{getI18nMessage('referent')}</option>
          )}
          {networkInfo.useLineAndMeasure && (
            <option value={SearchMethod.LineAndMeasure}>{getI18nMessage('lineAndMeasure')}</option>
          )}
        </Select>
      </SettingRow>
      <SettingRow tag='label' label={getI18nMessage('measure')}>
        <Switch
          checked={networkInfo.useMeasure}
          disabled={GetActiveMethods() === 1 && networkInfo.useMeasure}
          onChange={(e) => { handleSwitchChange(e, 'useMeasure') }}
        />
      </SettingRow>
      <SettingRow tag='label' label={getI18nMessage('coordinate')}>
        <Switch
          checked={networkInfo.useCoordinate}
          disabled={GetActiveMethods() === 1 && networkInfo.useCoordinate}
          onChange={(e) => { handleSwitchChange(e, 'useCoordinate') }}
        />
      </SettingRow>
      <SettingRow tag='label' label={getI18nMessage('referent')}>
        <Switch
          checked={networkInfo.useReferent}
          disabled={GetActiveMethods() === 1 && networkInfo.useReferent}
          onChange={(e) => { handleSwitchChange(e, 'useReferent') }}
        />
      </SettingRow>
      {networkInfo.showLineAndMeasure && (
        <SettingRow tag='label' label={getI18nMessage('lineAndMeasure')}>
          <Switch
            checked={networkInfo.useLineAndMeasure}
            disabled={GetActiveMethods() === 1 && networkInfo.useLineAndMeasure}
            onChange={(e) => { handleSwitchChange(e, 'useLineAndMeasure') }}
          />
        </SettingRow>
      )}
    </SettingSection>
  )
}
