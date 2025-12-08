import { type ExpressionPart, type IntlShape, type UseDataSource, type ImmutableArray, ExpressionFunctions } from 'jimu-core';
import { ExpressionInputType } from './types';
export declare function getWhetherUseDssMatchExpDss(part: ExpressionPart, useDataSources: ImmutableArray<UseDataSource>): boolean;
export declare function getExpressionFromString(from: ExpressionInputType, intl: IntlShape): string;
export declare function getSupportedFunctions(dsId: string): ExpressionFunctions[];
export declare function isPercentileFunction(func: ExpressionFunctions): boolean;
export declare function getSupportedUseDataSources(selectedFunction: ExpressionFunctions, useDataSources: ImmutableArray<UseDataSource>): ImmutableArray<UseDataSource>;
