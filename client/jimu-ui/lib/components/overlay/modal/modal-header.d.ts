import { React } from 'jimu-core';
import { type ModalHeaderProps as BSModalHeaderProps } from 'reactstrap';
/**
 * The ModalHeader component props.
 */
export interface ModalHeaderProps extends BSModalHeaderProps {
    /**
     * The close icon.
     */
    closeIcon?: React.JSX.Element;
}
/**
 * The `ModalHeader` component adds a header to the modal.
 *
 * ```ts
 * import { ModalHeader } from 'jimu-ui'
 * ```
 */
export declare class ModalHeader extends React.PureComponent<ModalHeaderProps> {
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
