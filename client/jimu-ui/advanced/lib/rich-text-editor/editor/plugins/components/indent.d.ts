import { React } from 'jimu-core';
import { IndentValue } from '../../../type';
interface Props {
    disabled?: boolean;
    className?: string;
    value?: IndentValue;
    onClick?: (value: IndentValue) => any;
}
export declare const Indent: ({ value, onClick, className, disabled }: Props) => React.ReactElement;
export {};
