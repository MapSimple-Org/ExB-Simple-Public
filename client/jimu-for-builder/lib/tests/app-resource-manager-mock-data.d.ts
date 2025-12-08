import { type AppConfig, ResourceType } from "jimu-core";
export declare const itemResources: {
    nextStart: number;
    num: number;
    resources: {
        size: number;
        created: string;
        resource: string;
    }[];
    start: number;
    success: boolean;
    total: number;
};
export declare const imageResourcesList: {
    1690186771978: {
        originalName: string;
        fileName: string;
        size: number;
        url: string;
        created: number;
        resourcesPrefix: string;
        referredIds: any[];
        originId: string;
        fileFormat: string;
        originalWidth: number;
        originalHeight: number;
    };
    1689924771961: {
        originalName: string;
        fileName: string;
        size: number;
        url: string;
        created: number;
        resourcesPrefix: string;
        referredIds: any[];
        originId: string;
        fileFormat: string;
        originalWidth: number;
        originalHeight: number;
    };
};
export declare const imageResourcesInDraft: {
    1690186771978: {
        originalName: string;
        fileName: string;
        size: number;
        url: string;
        created: number;
        resourcesPrefix: string;
        referredIds: any[];
        originId: string;
        fileFormat: string;
        originalWidth: number;
        originalHeight: number;
    };
};
export declare const newResourceItemInfo: {
    blobUrl: string;
    file: Blob;
    fileName: string;
    originalHeight: number;
    originalName: string;
    originalWidth: number;
    resourcesPrefix: string;
    type: ResourceType;
    url: string;
    widgetId: string;
};
export declare const uploadItemFromAPI: {
    created: number;
    description: string;
    id: number;
    modified: number;
    owner: string;
    portalUrl: string;
    snippet: string;
    success: boolean;
    tags: any[];
    thumbnail: any;
    title: string;
    type: string;
    username: string;
};
export declare const config: AppConfig;
export declare const resourceUrlList: string[];
