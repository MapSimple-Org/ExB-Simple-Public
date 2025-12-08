import type { Capabilities, QueryCapabilities } from 'jimu-core';
export interface CapabilitiesConstructorOptions {
}
export declare class CapabilitiesImpl implements Capabilities {
    constructor(options: CapabilitiesConstructorOptions);
    getQueryCapabilities(): QueryCapabilities;
}
