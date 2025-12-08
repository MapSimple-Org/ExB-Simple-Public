
import { getAppStore, appActions, createIntl } from 'jimu-core'
import { wrapWidget, widgetRender, getInitState, getDefaultAppConfig, mockTheme } from 'jimu-for-test'
import '@testing-library/jest-dom'
import SearchSettings from "../src/setting/components/search-settings"
getAppStore().dispatch(appActions.updateStoreState(getInitState().merge({ appConfig: getDefaultAppConfig() })))
window.locale = 'en'

const render = widgetRender(true, mockTheme as any)

const mockSearchSettingsConfig = {
  headingLabel: 'Location',
  bufferDistance: 1,
  distanceUnits: 'miles',
  showDistanceSettings: true,
  sketchTools: {
    showPoint: true,
    showPolyline: true,
    showPolygon: true
  },
  activeToolWhenWidgetOpens: 'none',
  searchByActiveMapArea: false,
  includeFeaturesOutsideMapArea: false,
  headingLabelStyle: {
    fontFamily: 'Avenir Next',
    fontBold: false,
    fontItalic: false,
    fontUnderline: false,
    fontStrike: false,
    fontColor: 'var(--ref-palette-black)',
    fontSize: '13px'
  },
  showInputAddress: true
}

const searchSettingsProps = {
  intl: createIntl({ locale: 'en' }),
  theme: mockTheme,
  config: mockSearchSettingsConfig,
  onWidgetLoadOptions: [],
  onSearchSettingsUpdated: jest.fn()
}

describe('Validate Search method', function () {
  it('By default Current map area should be disabled', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
    expect((getByTestId('searchByActiveMapArea') as any).checked).toEqual(false)
  })

  it('By default Specify a location search method should be selected', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
    expect((getByTestId('searchByLocation') as any).checked).toEqual(true)
  })
})

describe('Validate Specify a location settings', function () {
  it('should set default buffer distance to 1', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
    expect((getByTestId('bufferDistance') as any).value).toBe('1')
  })

  it('Input section should be collapsed by default', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
    expect((ref.current as any).state.isInputSettingOpen).toBe(false)
  })

  it('On expanding input section all input location options should be enabled/checked by default', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
    expect((ref.current as any).state.showPoint).toBe(true)
    expect((ref.current as any).state.showPolyline).toBe(true)
    expect((ref.current as any).state.showPolygon).toBe(true)
  })

  it('"Activate when widget opens" dropdown should be selected as none by default', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
    expect((ref.current as any).state.activeTool).toBe('none')
  })

  // it('should set default buffer unit to `miles`', async function () { //TODO
  //   const ref: { current: HTMLElement } = { current: null }
  //   const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
  //   const { getByTestId } = render(<WidgetSettings widgetId='searchSettings' {...searchSettingsProps} />)
  //   await waitFor(() => {
  //         expect((getByTestId('distanceUnits') as any).value).toBe('miles')
  //       }, { timeout: 100 })
  // })
})

describe('Validate Current map area settings', function () {
  it('Include features outside map area should be toggled of by default', function () {
    const updatedConfig = {
      ...mockSearchSettingsConfig,
      searchByActiveMapArea: true
    }
    const updatedProps = {
      ...searchSettingsProps,
      config: updatedConfig
    }
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='searchSettings' {...updatedProps} />)
    expect((getByTestId('featuresOutsideMapArea') as any).checked).toEqual(false)
  })

  it('On enabling Include features outside map area hint message should shown below it', function () {
    const updatedConfig = {
      ...mockSearchSettingsConfig,
      searchByActiveMapArea: true,
      includeFeaturesOutsideMapArea: true
    }
    const updatedProps = {
      ...searchSettingsProps,
      config: updatedConfig
    }
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SearchSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='searchSettings' {...updatedProps} />)
    expect(getByTestId('searchAreaHint')).toBeInTheDocument()
  })
})
