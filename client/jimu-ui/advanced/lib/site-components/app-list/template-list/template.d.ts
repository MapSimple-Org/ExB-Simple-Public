/** @jsx jsx */
import { React } from 'jimu-core';
import type { IMThemeVariables, IntlShape, privilegeUtils } from 'jimu-core';
import { PublishStatus } from '../types/types';
import type { TemplateInfo, TemplateAccessTypes } from '../types/types';
interface Props {
    disabled?: boolean;
    info: TemplateInfo;
    capabilities: privilegeUtils.Capabilities;
    accessType: TemplateAccessTypes;
    intl?: IntlShape;
    theme?: IMThemeVariables;
    style?: React.CSSProperties;
    crateAppByTemplate?: (appInfo: TemplateInfo) => void;
}
interface State {
    previewUrl: string;
    thumbnail: string;
    showDesc?: boolean;
    publishStatus?: PublishStatus;
}
export declare class Template extends React.PureComponent<Props, State> {
    isRTL: boolean;
    static defaultProps: Partial<Props>;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(): void;
    onCreateClick: () => void;
    clickThumbnailToCreate: () => void;
    checkThumbnailIsAdd: () => boolean;
    nls: (id: string) => string;
    getStyle: () => import("jimu-core").SerializedStyles;
    getPublishStatus: (appItem: TemplateInfo) => any;
    showDesc: () => void;
    hideDesc: () => void;
    initPreviewUrl: () => void;
    initPreviewUrlWithEnv: (previewUrl: string) => string;
    getVersionRemindString: () => string;
    checkIsShowItemMarkContent: () => boolean;
    checkIsAppCanCreate: () => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
