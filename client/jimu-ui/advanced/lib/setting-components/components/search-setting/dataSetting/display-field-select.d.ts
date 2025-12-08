/** @jsx jsx */
import { type FieldSchema, type IMFieldSchema, type UseDataSource } from 'jimu-core';
interface DisplayFieldProps {
    disPlayField: FieldSchema[];
    useDataSource: UseDataSource;
    onFieldChange: (allSelectedFields: IMFieldSchema[], preFields: any, isDisplayField?: boolean) => void;
}
declare const DisplayFieldSelect: (props: DisplayFieldProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default DisplayFieldSelect;
