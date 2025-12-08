import { appActions, getAppStore } from 'jimu-core'
import { getInitState, mockTheme, setTheme } from 'jimu-for-test'
import {
  getSeriesFillColor,
  getDefaultTextColor,
  getDefaultColor,
  getTextSymbol,
  DefaultTextSymbol,
  DefaultLineSymbol,
  getLineSymbol,
  getFillSymbol,
  DefaultFillSymbol,
  getChartText,
  SeriesColors,
  DefaultColor,
  DefaultTextColor
} from '../../src/utils/default'

jest.mock('@arcgis/charts-components', () => jest.fn())
jest.mock('@arcgis/charts-components-react', () => jest.fn())

const state = getInitState()

getAppStore().dispatch(appActions.updateStoreState(state))

describe('src/utils/default', () => {
  beforeAll(() => {
    setTheme(mockTheme)
  })
  it('getOneRampThemeColor', () => {
    expect(getSeriesFillColor(0)).toBe(SeriesColors[0])
    expect(getSeriesFillColor(2)).toBe(SeriesColors[2])
    expect(getSeriesFillColor(4)).toBe(SeriesColors[4])
    expect(getSeriesFillColor(6)).toBe(SeriesColors[6])
    expect(getSeriesFillColor(7)).toBe(SeriesColors[0])
    expect(getSeriesFillColor(8)).toBe(SeriesColors[1])
  })

  it('getDefaultTextColor', () => {
    expect(getDefaultTextColor()).toBe(DefaultTextColor)
  })

  it('getDefaultColor', () => {
    expect(getDefaultColor()).toBe(DefaultColor)
  })

  it('getDefaultTextSymbol', () => {
    expect(getTextSymbol('foo')).toEqual({
      ...DefaultTextSymbol,
      text: 'foo'
    })
  })

  it('getLineSymbol', () => {
    expect(getLineSymbol()).toEqual(DefaultLineSymbol)
  })

  it('getFillSymbol', () => {
    expect(getFillSymbol()).toEqual({
      ...DefaultFillSymbol,
      color: '#5E8FD0'
    })
    expect(getFillSymbol(SeriesColors[1])).toEqual({
      ...DefaultFillSymbol,
      color: SeriesColors[1]
    })
  })

  it('getChartText', () => {
    expect(getChartText('foo')).toEqual({
      type: 'chartText',
      visible: true,
      content: { ...DefaultTextSymbol, text: 'foo' }
    })
    expect(getChartText('foo', false)).toEqual({
      type: 'chartText',
      visible: false,
      content: { ...DefaultTextSymbol, text: 'foo' }
    })
  })
})
