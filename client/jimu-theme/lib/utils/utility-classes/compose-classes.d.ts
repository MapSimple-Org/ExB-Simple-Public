export declare function composeClasses<ClassKey extends string>(componentName: string, parts: {
    [key in ClassKey]: ReadonlyArray<string | false | undefined | null>;
}, prefix?: 'jimu' | 'widget'): {
    [key in ClassKey]: string;
};
/**
 * Compose classes for a widget.
 * @param widgetName
 * @param parts
 * @returns
 */
export declare function composeWidgetClasses<ClassKey extends string>(widgetName: string, parts: {
    [key in ClassKey]: ReadonlyArray<string | false | undefined | null>;
}): {
    [key in ClassKey]: string;
};
