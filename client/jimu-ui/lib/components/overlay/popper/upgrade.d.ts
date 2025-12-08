import type { Modifiers } from './type';
/**
 * Upgrade the modifiers of `@popperjs/core`  to the middleware options of `@floating-ui/react`.
 */
export declare function upgradeModifiersToMiddleware(modifiers?: Modifiers): {
    [name: string]: any;
};
