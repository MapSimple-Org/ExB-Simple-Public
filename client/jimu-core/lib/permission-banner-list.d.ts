import { type IntlShape } from 'react-intl';
import type { IMThemeVariables } from './types/theme';
import { type NoPermissionResourceInfoList } from './session-manager';
export interface PermissionBannerProps {
    theme: IMThemeVariables;
    intl: IntlShape;
    allowIgnore?: boolean;
    allowLogout?: boolean;
    noPermissionResourceChangedFlag: string;
    disableOperation?: boolean;
}
export interface BannerListProps extends PermissionBannerProps {
    noPermissionResourceInfoList: NoPermissionResourceInfoList;
}
export declare function PermissionList(props: BannerListProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function PermissionBanner(props: PermissionBannerProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function PermissionBannerNotification(props: PermissionBannerProps): import("@emotion/react/jsx-runtime").JSX.Element;
