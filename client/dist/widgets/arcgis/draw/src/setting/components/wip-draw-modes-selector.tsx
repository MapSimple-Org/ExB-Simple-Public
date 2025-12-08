/** @jsx jsx */
import { jsx, React, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Radio, Label } from 'jimu-ui'
import { SymbolSelector, JimuSymbolType } from 'jimu-ui/advanced/map'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DrawMode } from '../../config'

interface Props {
  mode?: DrawMode
  onDrawModesChange?: (any) => void

  intl: IntlShape
  theme: IMThemeVariables
}

// symbols
interface _TestCurrentSymbols {
  currentSymbol1: any
  currentSymbol2: any
  currentSymbol3: any
}

export const DrawModesSelector = React.memo((props: (Props)) => {
  const [_currentSymbolsStates, setCurrentSymbolsStates] = React.useState<_TestCurrentSymbols>(() => {
    return {
      currentSymbol1: false,
      currentSymbol2: false,
      currentSymbol3: false
    }
  })

  const handlePointSymbolChanged = (symbol): void => {
    setCurrentSymbolsStates({
      ..._currentSymbolsStates,
      currentSymbol1: symbol
    })
  }

  const handlePolylineSymbolChanged = (symbol): void => {
    setCurrentSymbolsStates({
      ..._currentSymbolsStates,
      currentSymbol2: symbol
    })
  }

  const handlePolygonSymbolChanged = (symbol): void => {
    setCurrentSymbolsStates({
      ..._currentSymbolsStates,
      currentSymbol3: symbol
    })
  }

  const drawModesTips = 'drawModes'
  const continuousModeTips = 'continuousMode'
  const updateModeTips = 'updateMode'
  return (
    <React.Fragment>
      {/* Other options
        <SettingSection>
          {// snapping //}
          <SettingRow tag='label' label={isEnableAdvancedSettingTips}>
            <Switch checked={this.props.config.isEnableAdvancedSetting} onChange={this.handleIsEnableAdvancedSettingChange} />
          </SettingRow>
        </SettingSection>*/}

      { /* DrawModes */}
      <SettingSection title={drawModesTips}>
        {/* Continuous */}
        <SettingRow>
          <Label style={{ cursor: 'pointer' }} title={continuousModeTips}>
            <Radio
              style={{ cursor: 'pointer' }} className='m-0 mr-2' title={continuousModeTips}
              onChange={() => { props.onDrawModesChange(DrawMode.Continuous) }}
              checked={props.mode === DrawMode.Continuous}
            />
            {continuousModeTips}
          </Label>
        </SettingRow>
        {/* Update */}
        <SettingRow>
          <Label style={{ cursor: 'pointer' }} title={updateModeTips}>
            <Radio
              style={{ cursor: 'pointer' }} className='m-0 mr-2' title={updateModeTips}
              onChange={() => { props.onDrawModesChange(DrawMode.Update) }}
              checked={props.mode === DrawMode.Update}
            />
            {updateModeTips}
          </Label>
        </SettingRow>
      </SettingSection>

      {/* TODO test */}
      <SettingSection>
        <SettingRow>
          <div>
            <SymbolSelector
              jimuSymbolType={JimuSymbolType.Point}
              symbol={_currentSymbolsStates.currentSymbol1}
              onPointSymbolChanged={handlePointSymbolChanged}
            ></SymbolSelector>
          </div>
          <div>
            <SymbolSelector
              jimuSymbolType={JimuSymbolType.Polyline}
              symbol={_currentSymbolsStates.currentSymbol2}
              onPolylineSymbolChanged={handlePolylineSymbolChanged}
            ></SymbolSelector>
          </div>
          <div>
            <SymbolSelector
              jimuSymbolType={JimuSymbolType.Polygon}
              symbol={_currentSymbolsStates.currentSymbol3}
              onPolygonSymbolChanged={handlePolygonSymbolChanged}
            ></SymbolSelector>
          </div>
        </SettingRow>
      </SettingSection>
    </React.Fragment>
  )
})
