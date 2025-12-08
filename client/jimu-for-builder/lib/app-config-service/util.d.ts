import { type IMAppConfig, type ElementType, extensionSpec } from 'jimu-core';
import type { Template } from '../templates/type';
export declare function getDuplicateLabel(appConfig: IMAppConfig, type: ElementType, label: string): string;
export declare function makeSureTemplateConfig(templateJson: Template): Promise<void>;
/**
 * Find the extension of AppConfigOperation for the current processing widget
 * @param widgetId
 * @returns
 */
export declare function findWidgetAppConfigOperationExtension(widgetId: string): extensionSpec.AppConfigOperationsExtension;
/**
 * Find all extensions of AppConfigOperation for the framework changes
 * @returns
 */
export declare function findAppConfigOperationExtensions(): extensionSpec.AppConfigOperationsExtension[];
