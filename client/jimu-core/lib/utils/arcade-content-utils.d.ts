import type { ImmutableArray } from 'seamless-immutable';
import type { ArcadeScriptResult, IMArcadeContentConfig } from '../types/arcade-content';
import type { DuplicateContext } from '../types/common';
import type { IMUseDataSource, IMWidgetJson, UseDataSource } from '../types/app-config';
/**
 * There are two cases this method return true.
 * Case1: widgetId is the id of text/button. text/button is placed in list widget.
 * Case2: widgetId is list widget id.
 * @param widgetId
 * @returns
 */
export declare function doesWidgetHaveRepeatDataSource(widgetId: string): boolean;
/**
 * If the widget has repeated data source, then returns the useDataSource, otherwise returns empty.
 * Case1: widgetId is the id of text/button. text/button is placed in list widget.
 * Case2: widgetId is list widget id.
 * @param widgetId
 * @returns
 */
export declare function tryGetRepeatedUseDataSource(widgetId: string): IMUseDataSource;
/**
 * Make sure user can only add up to 10 Arcade expressions with $dataSources per page.
 */
export declare function canAddNewDataSourcesProfileArcadeContent(widgetId: string): boolean;
/**
 * Gets the number of Arcade contents remaining available for the widget.
 * If a positive number n is returned, it means that the widget can add n more Arcade contents.
 * If 0 or a negative number is returned, it means that the widget can not add Arcade contents.
 * If Infinity is returned, it means that the widget can add any Arcade contents.
 */
export declare function getWidgetRestAvailableArcadeContentCount(widgetId: string): number;
export declare function getCopiedArcadeContentConfig(contentMap: DuplicateContext, sourceWidgetJson: IMWidgetJson, arcadeContentConfig: IMArcadeContentConfig): IMArcadeContentConfig;
export declare function getCopiedArcadeContentScript(contentMap: DuplicateContext, sourceWidgetJson: IMWidgetJson, scriptContent: string): string;
/**
 * Update Arcade content config when widget changes useDataSources.
 * If it returns null, it means that the Arcade content should be removed.
 * If doNotReturnNullIfDirty is set to false (default value), this method will return null if arcadeContentConfig is dirty after data sources changed.
 * For now, only Text widget should set `doNotReturnNullIfDirty` to true.
 * @param widgetId
 * @param oldUseDataSources
 * @param newUseDataSources
 * @param arcadeContentConfig
 * @param doNotReturnNullIfDirty Default value is false. For now, only Text widget should set `doNotReturnNullIfDirty` to true.
 */
export declare function updateArcadeContentConfigWhenUseDataSourcesChange(widgetId: string, oldUseDataSources: ImmutableArray<UseDataSource>, newUseDataSources: ImmutableArray<UseDataSource>, arcadeContentConfig: IMArcadeContentConfig, doNotReturnNullIfDirty?: boolean): IMArcadeContentConfig;
export interface ArcadeScriptResultValidationResult {
    valid: boolean;
    invalidKeys: string[];
    validValue: ArcadeScriptResult;
}
export declare function validateArcadeScriptResult(arcadeScriptResult: ArcadeScriptResult, keepKeys?: string[]): ArcadeScriptResultValidationResult;
