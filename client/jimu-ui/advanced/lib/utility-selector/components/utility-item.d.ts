/** @jsx jsx */
import { type IMUtilityJson } from 'jimu-core';
interface Props {
    utility: IMUtilityJson;
    onChange: (utility: IMUtilityJson) => void;
    onRemove: (utility: IMUtilityJson) => void;
}
export declare function UtilityItem(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
