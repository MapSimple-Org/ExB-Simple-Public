import { React, type IntlShape, type IMUser } from 'jimu-core';
/**
 * The UserProfile component props.
 */
export interface UserProfileProps {
    /** The user */
    user: IMUser;
    /** The portal */
    portalUrl: string;
    /** The CSS class */
    className?: string;
    /** Whether the app is saved. If the app is not saved, when user click signOut, an alert will be popped*/
    isAppSaved?: boolean;
    helpUrl?: string;
    /**
     * Quick links in the user profile dropdown menu. Will show all if not set.
     */
    quickLinks?: Array<'myProfile' | 'mySettings' | 'esriCommunity' | 'myEsri' | 'training' | 'arcgisBlog' | 'accountHelp'>;
}
interface IntlProp {
    intl: IntlShape;
}
export declare const UserProfile: React.FC<import("react-intl").WithIntlProps<UserProfileProps & IntlProp>> & {
    WrappedComponent: React.ComponentType<UserProfileProps & IntlProp>;
};
export {};
