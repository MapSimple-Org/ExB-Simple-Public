export declare const focusableElements: string[];
export declare const FOCUSABLE_CONTAINER_CLASS = "focusable-container";
/**
 * Retrieve all focusable elements within a specified container.
 * Support querying focusable elements only within a sub-container by adding the class `focusable-container` to nodes inside the container (Only two levels of nesting are supported).
 */
export declare const getFocusableElements: <E extends Element>(root: HTMLElement) => E[];
