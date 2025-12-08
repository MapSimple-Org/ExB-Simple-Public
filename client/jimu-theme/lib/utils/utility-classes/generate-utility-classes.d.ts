export type GlobalStateSlot = keyof typeof globalStateClasses;
export declare const globalStateClasses: {
    active: string;
    checked: string;
    completed: string;
    disabled: string;
    error: string;
    expanded: string;
    focused: string;
    focusVisible: string;
    open: string;
    readOnly: string;
    required: string;
    selected: string;
};
export default function generateUtilityClass(componentName: string, part: string, key?: string, prefix?: string): string;
export declare function isGlobalState(state: string): boolean;
