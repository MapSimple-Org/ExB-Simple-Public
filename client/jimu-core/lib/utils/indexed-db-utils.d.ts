export declare class IndexedDBCache {
    private readonly dbName;
    private readonly storeName;
    private readonly version;
    private readonly indexName;
    private readonly indexKey;
    private db;
    private closed;
    /**
     * create or get an IndexedDB store
     * @param widgetId widget's ID
     * @param widgetName widget's name, such as 'bookmark' and 'add-data'
     * @param storeName a widget may have multiple stores
     * @param version the version of the IndexedDB
     * @param indexName the name of the index
     * @param indexKey the key of the index
     * @returns IndexedDBCache
     */
    constructor(widgetId: string, widgetName: string, storeName: string, version?: number, indexName?: string, indexKey?: string);
    /**
     * initialize the IndexedDB and the store
     * @returns Promise<void>
     */
    init(): Promise<void>;
    /**
     * whether the IndexedDB and the store are initialized
     * @returns boolean
     */
    initialized(): boolean;
    /**
     * close the IndexedDB
     * @returns void
     */
    close(): void;
    /**
     * put a key-value pair into the store
     * @param key string
     * @param value any
     * @returns Promise<void>
     */
    put(key: string, value: any): Promise<void>;
    /**
     * put a key-value pair into the store
     * @param obj { key: string, value: any }
     * @returns Promise<IDBValidKey>
     */
    putObject(obj: object): Promise<IDBValidKey>;
    /**
     * put a object into the store
     * @param data Array<{ key: string, value: any }>
     * @returns Promise<void>
     */
    putAllObject(data: object[]): Promise<void>;
    /**
     * put multiple key-value pairs into the store
     * @param data Array<{ key: string, value: any }>
     * @returns Promise<void>
     */
    putAll(data: Array<{
        key: string;
        value: any;
    }>): Promise<void>;
    /**
     * get the value of a key from the store
     * @param key string
     * @returns Promise<any>
     */
    get(key: string): Promise<any>;
    /**
     * get all keys from the store
     * @param key string
     * @returns Promise<any>
     */
    getAllKeys(): Promise<any[]>;
    /**
     * get all values from the store
     * @param key string
     * @returns Promise<any[]>
     */
    getAll(): Promise<any[]>;
    /**
     * delete a key-value pair from the store by a key
     * @param key string
     * @returns Promise<void>
     */
    delete(key: IDBValidKey | IDBKeyRange): Promise<void>;
    /**
     * delete key-value pairs from the store by keys
     * @param key string
     * @returns Promise<void>
     */
    deleteAll(keys: IDBValidKey[] | IDBKeyRange[]): Promise<void>;
    /**
     * clear all key-value pairs in the store
     * @returns Promise<void>
     */
    clear(): Promise<void>;
    /**
     * destroy the store
     */
    destroy(): void;
}
export declare function whenRequest<T>(request: IDBRequest<T>): Promise<T>;
export declare function whenTransaction(transaction: IDBTransaction): Promise<void>;
export declare function getDBName(widgetId: string, widgetName: string): string;
