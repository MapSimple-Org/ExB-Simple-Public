import { AppType, type AppInfo } from '../../service';
export declare const userName = "userName_xxx";
export declare const appInfo: AppInfo;
export declare const searchResponse: {
    nextStart: number;
    num: number;
    query: string;
    results: {
        created: number;
        description: string;
        id: string;
        isOrgItem: boolean;
        modified: number;
        owner: string;
        portalUrl: string;
        snippet: string;
        tags: any[];
        thumbnail: string;
        title: string;
        type: string;
        typeKeywords: string[];
        username: string;
        access: string;
    }[];
    start: number;
    total: number;
};
export declare const localSearchResponse: {
    nextStart: number;
    num: number;
    query: string;
    results: {
        created: number;
        description: string;
        id: string;
        isOrgItem: boolean;
        modified: number;
        owner: string;
        portalUrl: string;
        snippet: string;
        tags: any[];
        thumbnail: string;
        title: string;
        type: string;
        typeKeywords: string[];
        username: string;
        access: string;
    }[];
    start: number;
    total: number;
};
export declare const appInfoResponse: {
    id: string;
    owner: string;
    created: number;
    isOrgItem: boolean;
    modified: number;
    guid: any;
    name: any;
    title: string;
    type: string;
    typeKeywords: string[];
    description: any;
    tags: any[];
    snippet: any;
    thumbnail: string;
    documentation: any;
    extent: any[];
    categories: any[];
    spatialReference: any;
    accessInformation: any;
    licenseInfo: any;
    culture: string;
    properties: any;
    url: string;
    proxyFilter: any;
    access: string;
    size: number;
    appCategories: any[];
    industries: any[];
    languages: any[];
    largeThumbnail: any;
    banner: any;
    screenshots: any[];
    listed: boolean;
    ownerFolder: string;
    protected: boolean;
    commentsEnabled: boolean;
    numComments: number;
    numRatings: number;
    avgRating: number;
    numViews: number;
    itemControl: string;
    scoreCompleteness: number;
    groupDesignations: any;
};
export declare const getFolderResponse: {
    currentFolder: any;
    nextStart: number;
    num: number;
    start: number;
    total: number;
    username: string;
    folders: {
        created: number;
        id: string;
        title: string;
        username: string;
    }[];
};
export declare const addItemResponse: {
    folder: any;
    id: string;
    success: boolean;
};
export declare const addResourceResponse: {
    folder: any;
    itemId: string;
    owner: string;
    success: boolean;
};
export declare const resourcesResponse: {
    total: number;
    start: number;
    num: number;
    nextStart: number;
    resources: {
        resource: string;
        created: number;
        size: number;
        access: string;
    }[];
};
export declare const getConfigResponse: {
    template: string;
    theme: string;
    pages: {};
    layouts: {};
};
export declare const tagResponse: {
    tags: {
        tag: string;
        count: number;
    }[];
};
export declare const folderList: {
    value: string;
    text: string;
}[];
export declare const appInfos: {
    id: string;
    type: AppType;
    username: string;
    thumbnail: string;
    isLocalApp: boolean;
    portalUrl: string;
};
export declare const deleteAppResponse: {
    success: boolean;
    itemId: string;
    owner: string;
    folder: string;
};
export declare const shareItemWithGroupResponse: {
    itemId: string;
    notSharedWith: any[];
};
export declare const getAppGroupsResponse: {
    total: number;
    start: number;
    num: number;
    nextStart: number;
    items: {
        id: string;
        owner: string;
        created: number;
        modified: number;
        guid: any;
        name: any;
        title: string;
        type: string;
        typeKeywords: string[];
        description: string;
        tags: string[];
        snippet: string;
        thumbnail: string;
        extent: number[][];
    }[];
};
