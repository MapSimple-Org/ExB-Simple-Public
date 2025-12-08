import type { WebChartSeries, CategoryFormatOptions, ChartTypes } from 'arcgis-charts-components';
/**
 * Getting the type of a series. If the input parameters are incorrect (empty array of series, unknown index...) the function returns `undefined`
 * @param chartSeries The array of chart's series
 * @param seriesIndex An index to get a specific series' type. If no index is provided the first series' type (chartSeries[0]) is returned
 */
export declare function getSeriesType(chartSeries: WebChartSeries[] | undefined, seriesIndex?: number): ChartTypes | undefined;
export declare function getDefaultCategoryFormat(): CategoryFormatOptions;
/**
 * Escapes any single quote in the input string with a single quote for SQL.
 * For example: Cote d'Ivoire -> Cote d''Ivoire
 * @param string input string to replace for any special characters.
 */
export declare function escapeSQLString(string: string): string;
/**
 * Indicates whether a string field is empty (different from undefined, null and empty string).
 * The value is stringified before being trimmed to debunk edge cases like when the value is a numeric value.
 * @param value The value to test
 * @returns `true` if empty, `false` otherwise
 */
export declare function isEmptyStringField(value: string | null | undefined): boolean;
/**
 * Normalizes a string by
 *   - trimming off white spaces
 *   - if the value is a string and keepSurroundingQuotes is not true: stripping ' (single inverted comma), if present on both sides
 *   - if escape is true (or undefined): escaping special characters like ", \, /.
 * E.g.:
 * "'alpha'" => "alpha"
 * "'alpha" => No change
 * "alpha'" => No change
 * "alp'ha'" => alp''ha
 * "  'alpha'" => "alpha"
 * "alp"\/ha" => "alp\"\\\/ha"
 * @param value
 */
export declare function normalizeString(props: {
    value: string;
    keepSurroundingQuotes?: boolean;
    escape?: boolean;
}): string;
/**
 * Extract the value from equality-where clauses like `field = 'some_value'`.
 * Normalize or escape single quotes in the returned value according to the `normalize` param value.
 * If normalize is undefined then normalize the returned value.
 * For string value, if normalize is set to false and escape is set to false or undefined, the value is returned as is.
 * @param props
 */
export declare function getSplitByValue(props: {
    where: string | undefined;
    normalize?: boolean;
    keepSurroundingQuotes?: boolean;
    escape?: boolean;
}): string | number | null;
/**
 * Extract the field name from equality-where clauses like `field = 'some_value'`.
 * This field is actually stored in each series where clause.
 * TODO: do we want to enforce the test by seeing if the extracted field is part of the feature layer list of fields?
 * E.g.:
 * "field = 'some_value'" => "field"
 * "field > 'some_value'" => ""
 * @param where
 * @param normalize
 */
export declare function getSplitByField(where: string | undefined, normalize?: boolean): string;
