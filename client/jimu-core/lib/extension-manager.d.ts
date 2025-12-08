import type { IMWidgetJson } from './types/app-config';
import type { ExtensionProperties } from './types/manifest';
import { type BaseExtension, ExtensionPoints, type DummyExtension } from './extension-spec/extension-spec';
interface RegisterExtensionOptions {
    epName: ExtensionPoints;
    extension: BaseExtension;
}
export default class ExtensionManager {
    static instance: ExtensionManager;
    static getInstance(): ExtensionManager;
    private extensions;
    private extensionClasses;
    getExtensions(epName: string): BaseExtension[];
    getAllExtensions(): BaseExtension[];
    registerExtension(extInfo: RegisterExtensionOptions): void;
    destroyAllExtensions(): void;
    destroyWidgetExtensions(widgetId: string): void;
    registerWidgetExtensions(widgetJson: IMWidgetJson, isNewAdded: boolean): Promise<void[]>;
    registerWidgetExtension(widgetJson: IMWidgetJson, extensionProps: ExtensionProperties): Promise<void>;
    loadWidgetExtensionClass(widgetJson: IMWidgetJson, extensionProps: ExtensionProperties): Promise<typeof DummyExtension>;
    getExtensionById(extId: string): BaseExtension;
}
export {};
