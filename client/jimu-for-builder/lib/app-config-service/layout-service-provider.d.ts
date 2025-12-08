import { LayoutType, type IMAppConfig, type ImmutableObject, type SizeModeLayoutJson } from 'jimu-core';
import type { BaseLayoutService } from './base-layout-service';
export declare class LayoutServiceProvider {
    private static instance;
    private readonly serviceMap;
    static getInstance(): LayoutServiceProvider;
    static getService(appConfig: IMAppConfig, layoutId: string): BaseLayoutService;
    static getServiceFromSizeModeLayout(appConfig: IMAppConfig, layouts: ImmutableObject<SizeModeLayoutJson>): BaseLayoutService;
    constructor();
    registerService(type: LayoutType, service: BaseLayoutService): void;
    getServiceByType(type: LayoutType): BaseLayoutService;
}
