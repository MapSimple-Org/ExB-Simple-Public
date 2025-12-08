import type { ImmutableObject } from 'seamless-immutable';
export interface TrackEvent {
    category: string;
    action: string;
    label: string;
    [x: string]: any;
}
export interface TrackError {
    error: string;
    urlRequested: string;
    statusCode: number;
    [x: string]: any;
}
export interface TrackAction {
    logPageView: (page: string) => void;
    logEvent: (event: TrackEvent) => void;
    logError: (error: TrackError) => void;
}
export interface GoogleTracker {
    name: string;
    dimensions?: GaDimensions;
    metrics?: GaMetrics;
    [x: string]: any;
}
export type TrackInstance = {
    disabled?: boolean;
    trackers?: GoogleTracker[];
} & TrackAction;
export interface GaDimensions {
    [x: string]: number;
}
export type IMGaDimensions = ImmutableObject<GaDimensions>;
export type IMGaMetrics = ImmutableObject<GaMetrics>;
export type GaMetrics = GaDimensions;
export interface GoogleAnalytics {
    measurementId: string;
}
export type IMGoogleAnalytics = ImmutableObject<GoogleAnalytics>;
export interface Analytics {
    enable: boolean;
    google?: IMGoogleAnalytics;
}
export type IMAnalytics = ImmutableObject<Analytics>;
