/** @jsx jsx */
import { type ImmutableArray, type IMUtilityJson } from 'jimu-core';
interface Props {
    utilities: ImmutableArray<IMUtilityJson>;
    onChange: (utilities: ImmutableArray<IMUtilityJson>) => void;
    onDoneClick: () => void;
}
export declare function NewUtilityPanel(props: Props): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
