import type { EmotionCache } from './type';
/**
 * createCache allows for low level customization of how styles get inserted by emotion.
 * It's intended to be used with the <CacheProvider/> component to override the default cache, which is created with sensible defaults for most applications.
 * @internal
 */
export declare const createEmotionCache: (options: import("@emotion/cache").Options) => EmotionCache;
export declare function createEmotionRTLCache(isRTL?: boolean): EmotionCache;
