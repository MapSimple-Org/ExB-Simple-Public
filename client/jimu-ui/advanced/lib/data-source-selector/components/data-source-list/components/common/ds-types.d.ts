import { React, type IntlShape, type ImmutableArray, type AllDataSourceTypes } from 'jimu-core';
interface Props {
    toUseTypes: ImmutableArray<AllDataSourceTypes>;
    selectedTypes: ImmutableArray<AllDataSourceTypes>;
    hideAllOptionOfTypeDropdown: boolean;
    intl: IntlShape;
    onTypeSelected: (types: ImmutableArray<AllDataSourceTypes>) => void;
}
export default class DsTypes extends React.PureComponent<Props, unknown> {
    getWhetherDisableSelectionType: (types: ImmutableArray<AllDataSourceTypes>) => boolean;
    onTypeSelected: (e: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
