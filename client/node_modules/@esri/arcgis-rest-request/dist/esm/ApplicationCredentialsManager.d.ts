import { IAuthenticationManager } from "./utils/IAuthenticationManager.js";
import { ITokenRequestOptions } from "./utils/ITokenRequestOptions.js";
import { AuthenticationManagerBase } from "./AuthenticationManagerBase.js";
export interface IApplicationCredentialsManagerOptions {
    /**
     * Client ID of your application. Can be obtained by registering an application
     * on [ArcGIS for Developers](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/signing-in-arcgis-online-users/#registering-your-application),
     * [ArcGIS Online](http://doc.arcgis.com/en/arcgis-online/share-maps/add-items.htm#ESRI_SECTION1_0D1B620254F745AE84F394289F8AF44B) or on your instance of ArcGIS Enterprise.
     */
    clientId: string;
    /**
     * A Client Secret is also obtained by registering an application
     * on [ArcGIS for Developers](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/signing-in-arcgis-online-users/#registering-your-application),
     * [ArcGIS Online](http://doc.arcgis.com/en/arcgis-online/share-maps/add-items.htm#ESRI_SECTION1_0D1B620254F745AE84F394289F8AF44B) or on your instance of ArcGIS Enterprise. Treat it like a password.
     */
    clientSecret: string;
    /**
     * OAuth 2.0 access token from a previous application session.
     */
    token?: string;
    /**
     * Expiration date for the `token`
     */
    expires?: Date;
    /**
     * URL of ArcGIS REST base, defaults to "https://www.arcgis.com/sharing/rest"
     */
    portal?: string;
    /**
     * Duration of requested tokens in minutes. defaults to 7200 (5 days).
     */
    duration?: number;
}
/**
 * Used to authenticate methods in ArcGIS REST JS with oAuth 2.0 application credentials. The instance of `ApplicationCredentialsManager` can be passed to {@linkcode IRequestOptions.authentication} to authenticate requests.
 *
 * ```js
 * import { ApplicationCredentialsManager } from '@esri/arcgis-rest-request';
 *
 * const session = ApplicationCredentialsManager.fromCredentials({
 *   clientId: "abc123",
 *   clientSecret: "••••••"
 * })
 * ```
 */
export declare class ApplicationCredentialsManager extends AuthenticationManagerBase implements IAuthenticationManager {
    readonly portal: string;
    readonly token: string;
    readonly clientId: string;
    readonly clientSecret: string;
    readonly expires: Date;
    readonly duration: number;
    /**
     * Preferred method for creating an `ApplicationCredentialsManager`
     */
    static fromCredentials(options: IApplicationCredentialsManagerOptions): ApplicationCredentialsManager;
    /**
     * Internal object to keep track of pending token requests. Used to prevent
     *  duplicate token requests.
     */
    private _pendingTokenRequest;
    constructor(options: IApplicationCredentialsManagerOptions);
    getToken(url: string, requestOptions?: ITokenRequestOptions): Promise<string>;
    refreshToken(requestOptions?: ITokenRequestOptions): Promise<string>;
    refreshCredentials(): Promise<this>;
    /**
     * Converts the `ApplicationCredentialsManager` instance to a JSON object. This is called when the instance is serialized to JSON with [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).
     *
     * ```js
     * import { ApplicationCredentialsManager } from '@esri/arcgis-rest-request';
     *
     * const session = ApplicationCredentialsManager.fromCredentials({
     *   clientId: "abc123",
     *   clientSecret: "••••••"
     * })
     *
     * const json = JSON.stringify(session);
     * ```
     *
     * @returns A plain object representation of the instance.
     */
    toJSON(): {
        type: string;
        clientId: string;
        clientSecret: string;
        token: string;
        expires: Date;
        portal: string;
        duration: number;
    };
    /**
     * Serializes the `ApplicationCredentialsManager` instance to a JSON string.
     * @returns The serialized JSON string.
     */
    serialize(): string;
    /**
     * Deserializes a JSON string previously created with {@linkcode ApplicationCredentialsManager.serialize} to an {@linkcode ApplicationCredentialsManager} instance.
     * @param serialized - The serialized JSON string.
     * @returns An instance of `ApplicationCredentialsManager`.
     */
    static deserialize(serialized: string): ApplicationCredentialsManager;
    private setToken;
    private setExpires;
}
/**
 * @deprecated - Use {@linkcode ApplicationCredentialsManager}.
 * @internal
 */ export declare function ApplicationSession(options: IApplicationCredentialsManagerOptions): ApplicationCredentialsManager;
