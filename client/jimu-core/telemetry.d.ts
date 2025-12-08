import { Telemetry } from '@esri/telemetry';
import { GoogleAnalytics } from '@esri/telemetry-google-analytics';
import type { Telemetry as TelemetryType } from '@esri/telemetry/dist/types';
export declare function getCookieBannerStorageKey(): string;
export declare function getCookieConfirmations(): any;
/**
 * Check if it is ok to start tracking
 */
export declare function isAllowedToTrack(): boolean;
export { Telemetry, GoogleAnalytics, TelemetryType };
