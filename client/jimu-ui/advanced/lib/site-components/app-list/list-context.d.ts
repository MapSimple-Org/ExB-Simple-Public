import { React } from 'jimu-core';
import type { AppItem } from './types/types';
export declare const ListContext: React.Context<{
    deleteApps: (appIds: string[]) => any;
    refreshList: () => any;
    duplicateAppItem: (appInfo: AppItem) => any;
    createApp: (appInfo: AppItem) => any;
    favoriteToggle: (isFavorite: boolean, itemId: string) => Promise<boolean>;
    getFolderList: () => any;
    checkAndShowReadOnlyRemind: () => any;
    theme: any;
    skeletonNum: any;
}>;
