import type { IMAnalytics, IMGoogleAnalytics } from './types/tracking-manager';
import type { Telemetry as TelemetryType } from '@esri/telemetry/dist/types';
export declare class TrackingManager {
    enable: boolean;
    googleAnalytics: IMGoogleAnalytics;
    telemetry: TelemetryType;
    static instance: TrackingManager;
    static getInstance(): TrackingManager;
    constructor();
    private onAnalyticChange;
    private onCookieConsentModeChange;
    initialize: (analytics: IMAnalytics) => Promise<any>;
    logPageView(): void;
}
