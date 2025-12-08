import { React } from 'jimu-core';
export declare function teardown(doc: any): void;
export default function useIsFocusVisible(): {
    isFocusVisibleRef: React.RefObject<boolean>;
    onFocus: (event: any) => boolean;
    onBlur: () => boolean;
    ref: (node: any) => void;
};
