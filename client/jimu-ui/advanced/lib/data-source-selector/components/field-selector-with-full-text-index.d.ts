import { type FieldSelectorProps } from './field-selector';
export declare enum AddDefinitionStatus {
    Success = "SUCCESS",
    Error = "ERROR"
}
interface Props extends FieldSelectorProps {
    widgetId: string;
    addDefinitionStatusChange?: (status: AddDefinitionStatus) => void;
}
export declare const FieldSelectorWithFullTextIndex: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
