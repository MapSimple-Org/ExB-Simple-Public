import { Root } from '@amcharts/amcharts5/index';
/**
 * Returns a new `Root` instance with the locale values loaded and set.
 * @param id
 * @param [locale]
 */
export declare function createRoot(id: string | HTMLElement, locale: string): Promise<Root>;
export { XYChart as XYChartAm5, AxisRendererX as AxisRendererXAm5, CategoryAxis as CategoryAxisAm5, ValueAxis as ValueAxisAm5, AxisRendererY as AxisRendererYAm5, ColumnSeries as ColumnSeriesAm5, LineSeries as LineSeriesAm5, XYCursor as XYCursorAm5 } from '@amcharts/amcharts5/xy';
export { PieChart as PieChartAm5, PieSeries as PieSeriesAm5 } from '@amcharts/amcharts5/percent';
export { color as colorAm5, Tooltip as TooltipAm5, NumberFormatter as NumberFormatterAm5, Label as LabelAm5, Legend as LegendAm5, GridLayout as GridLayoutAm5, Bullet as BulletAm5, Rectangle as RectangleAm5, Circle as CircleAm5, Triangle as TriangleAm5, Container as ContainerAm5, p0, p50, p100, Scrollbar as ScrollbarAm5, percent as percentAm5 } from '@amcharts/amcharts5';
export { default as DarkThemeAm5 } from '@amcharts/amcharts5/themes/Dark';
export { default as ResponsiveThemeAm5 } from '@amcharts/amcharts5/themes/Responsive';
export { default as AnimatedThemeAm5 } from '@amcharts/amcharts5/themes/Animated';
export { Exporting } from '@amcharts/amcharts5/plugins/exporting';
export { ColumnSeries } from '@amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries';
