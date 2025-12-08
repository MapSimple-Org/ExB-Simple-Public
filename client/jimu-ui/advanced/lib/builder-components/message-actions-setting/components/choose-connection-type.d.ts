/** @jsx jsx */
import { type DataSource, MessageActionConnectionType } from 'jimu-core';
interface Props {
    messageDataSource: DataSource;
    actionDataSource: DataSource;
    connectionType: MessageActionConnectionType;
    onUseLayersRelationship: () => void;
    onSetCustomFields: () => void;
}
declare const ChooseConnectionType: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default ChooseConnectionType;
