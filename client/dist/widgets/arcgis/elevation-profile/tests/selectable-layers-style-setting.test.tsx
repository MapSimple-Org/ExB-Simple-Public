import { createIntl, React } from 'jimu-core'
import { mockTheme, widgetRender, wrapWidget } from 'jimu-for-test'
import '@testing-library/jest-dom'
import { waitFor } from '@testing-library/react'
import SelectableLayersStyleSetting from '../src/setting/components/selectable-layers-style-setting'
import LineStylePicker from '../src/setting/components/line-style-picker'

window.locale = 'en'
let render = null

beforeAll(() => {
  render = widgetRender(true, mockTheme as any)
})

afterAll(() => {
  render = null
})

jest.mock('esri/intl', () => { return {} }, { virtual: true })

const commonConfig = {
  isProfileSettingsEnabled: true,
  isCustomizeOptionEnabled: false,
  layers: [],
  selectionModeOptions: {
    selectionMode: 'multiple',
    style: {
      lineType: 'dotted-line',
      lineColor: '#fcfc03',
      lineThickness: 3
    }
  },
  supportAddedLayers: false
}

const selectableLayersSettingsProps = {
  intl: createIntl({ locale: 'en' }),
  theme: mockTheme,
  currentDs: 'default',
  config: commonConfig,
  onSelectableLayersStyleUpdated: jest.fn()
}

describe('Validate selection mode settings', function () {
  it('By default selection mode settings should be selected as multiple', async function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SelectableLayersStyleSetting as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='selectableLayersStyleSetting' config={commonConfig} {...selectableLayersSettingsProps} />)
    const evt = { target: { value: 'multiple' } }
    await waitFor(() => {
      (ref.current as any).onActiveToolChange(evt)
    }, { timeout: 100 })
    expect(evt.target.value).toEqual(commonConfig.selectionModeOptions.selectionMode)
  })

  it('By default select from added layer option should be disabled', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SelectableLayersStyleSetting as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='selectableLayersStyleSetting' config={commonConfig} {...selectableLayersSettingsProps} />)
    expect(getByTestId('supportAddedLayersOption').checked).toEqual(false)
  })

  // in code they are given same condition using props, so here we can only check the element with this condition
  it('Should hide the below color picker, line style picker & numeric input settings if selection mode is single', function () {
    const customConfig = {
      ...commonConfig,
      selectionModeOptions: {
        selectionMode: 'single'
      }
    }
    const customSelectableLayersSettingsProps = {
      ...selectableLayersSettingsProps,
      config: customConfig
    }
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SelectableLayersStyleSetting as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='selectableLayersStyleSetting' config={customConfig} {...customSelectableLayersSettingsProps} />)
    expect((ref.current as any).props.config.selectionModeOptions.selectionMode).toEqual('single')
  })

  it('By default highlight next selectable color should be yellow, line style should be dotted and its thickness should be 3', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(LineStylePicker as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='lineStylePicker' config={commonConfig} {...selectableLayersSettingsProps} />)
    expect((ref.current as any).props.config.selectionModeOptions.style.lineColor).toEqual('#fcfc03')
    expect((ref.current as any).props.config.selectionModeOptions.style.lineType).toEqual('dotted-line')
    expect((ref.current as any).props.config.selectionModeOptions.style.lineThickness).toEqual(3)
  })
})
