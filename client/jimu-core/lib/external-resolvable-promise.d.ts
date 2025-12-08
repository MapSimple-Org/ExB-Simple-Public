export declare class ExternalResolvablePromise {
    private readonly _promise;
    private _resolver;
    private _rejecter;
    private _status;
    constructor();
    resolve(data: any): any;
    reject(err: any): any;
    get status(): "rejected" | "pending" | "resolved";
    get promise(): Promise<any>;
}
