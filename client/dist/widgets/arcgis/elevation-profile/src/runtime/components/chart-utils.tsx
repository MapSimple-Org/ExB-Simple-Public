const CalciteGray150 = '#f4f4f4'
const CalciteGray700 = '#323232'

const SIDE_SPACING = 15
const CAP_SPACING = 12

export const THEME_LIGHT = {
  fontFamily: 'Avenir Next',

  axisGridStroke: CalciteGray150,

  axisLabelsFontWeight: '500' as const,

  axisTooltipFontSize: 12,
  axisTooltipPaddingTop: Math.round(CAP_SPACING / 4),
  axisTooltipPaddingBottom: Math.round(CAP_SPACING / 4),
  axisTooltipPaddingHorizontal: Math.round(SIDE_SPACING / 4),

  xAxisMinGridDistance: 50,
  xAxisLabelsSpacing: Math.round(CAP_SPACING / 2),
  xAxisMinLabelPosition: 0.05,
  xAxisMaxLabelPosition: 0.95, // Hide the last label

  yAxisMinGridDistance: 30,
  yAxisLabelSpacing: Math.round(SIDE_SPACING / 4),
  yAxisMinLabelPosition: 0,
  yAxisMaxLabelPosition: 0.95 // Hide the last label
}

type Theme = typeof THEME_LIGHT

export const THEME_DARK: Theme = {
  ...THEME_LIGHT,
  axisGridStroke: CalciteGray700
}
