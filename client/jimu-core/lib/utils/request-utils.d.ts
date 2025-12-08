import type { ArcGISIdentityManager } from '@esri/arcgis-rest-request';
import type { ExternalResolvablePromise } from '../external-resolvable-promise';
export declare function requestWrapper(desUrl: string, promiseFunc: (session: ArcGISIdentityManager) => Promise<any>, retryLimit?: number, forceLogin?: boolean): Promise<any>;
type CacheableURL = string | RegExp | ((url: string, query: object) => boolean);
/**
 * Register a URL as cacheable. Will cache the request in framework.
 */
export declare function registerCacheableUrl(cacheableUrl: CacheableURL): void;
/**
 * Return the cached request.
 */
export declare function getRequestCache(url: string, query: object): ExternalResolvablePromise;
/**
 * Cache a request.
 */
export declare function setRequestCache(url: string, query: object, promise: ExternalResolvablePromise): void;
/**
 * Delete a request cache.
 */
export declare function deleteRequestCache(url: string, query: object): void;
/**
 * Delete settled request caches by partial keys. If the request cache key contains all the partial strings and the cache is settled, then the request cache will be deleted.
 * We do not delete pending cache as if the pending request is used by other components, it will never be settled and caused those components to keep waiting.
 * @param partials Array of partial strings of the request cache key.
 */
export declare function deleteSettledRequestCacheByPartialKeys(partials: string[]): void;
/**
 * Return whether a URL is cacheable, that is to say, have ever registered this URL as cacheable.
 */
export declare function isURLCacheable(url: string, query: object): boolean;
export {};
