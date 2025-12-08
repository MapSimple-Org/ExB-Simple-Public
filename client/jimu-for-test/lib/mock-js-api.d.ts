import { JSAPILayerTypes } from 'jimu-core';
export declare function mockJSAPIClass(properties?: {}): jest.Mock<any, any, any>;
declare class MockAPIAccessor {
    constructor(options?: {});
    watch(): any;
}
export declare class MockAPICollection<T> {
    arr: T[];
    constructor(arr: T[]);
    get length(): number;
    getItemAt(i: any): T;
    toArray(): T[];
    concat(clt: MockAPICollection<T>): MockAPICollection<T>;
    add(item: any, index: any): void;
    on(): void;
}
export declare class MockAPILayer extends MockAPIAccessor {
    id: string;
    parent: MockAPILayer;
    load(): Promise<void>;
    on(): void;
}
export declare const mockJSAPIField: (data: any) => any;
export declare class MockFeatureLayer extends MockAPILayer {
    type: JSAPILayerTypes;
    declaredClass: string;
    fields: any[];
    queryFeatures(): Promise<{
        features: any[];
        fields: any[];
    }>;
    queryFeatureCount(): Promise<number>;
}
export declare class MockCommonMapServiceLayer extends MockAPILayer {
    sublayers: MockAPICollection<MockSubLayer>;
    constructor(options?: {});
    get allSublayers(): MockAPICollection<any>;
    loadAll(): Promise<void>;
}
export declare class MockTileLayer extends MockCommonMapServiceLayer {
    type: JSAPILayerTypes;
    declaredClass: string;
}
export declare class MockMapImageLayer extends MockCommonMapServiceLayer {
    type: JSAPILayerTypes;
    declaredClass: string;
}
export declare class MockSubLayer extends MockAPIAccessor {
    layer: MockCommonMapServiceLayer;
    parent: MockSubLayer | MockAPILayer;
    declaredClass: string;
    fields: any[];
    sublayers: MockAPICollection<MockSubLayer>;
    constructor(options?: {});
    load(): Promise<void>;
}
export declare class MockGroupLayer extends MockAPILayer {
    type: JSAPILayerTypes;
    layers: MockAPICollection<MockAPILayer>;
    declaredClass: string;
    constructor(options?: {});
    get allLayers(): MockAPICollection<any>;
    loadAll(): Promise<void>;
}
interface MapGround {
    layers: MockAPICollection<MockAPILayer>;
}
export declare class MockMap extends MockAPIAccessor {
    id: string;
    layers: MockAPICollection<MockAPILayer>;
    ground: MapGround;
    constructor(options?: {});
    get allLayers(): MockAPICollection<any>;
    add(layer: any, index: any): void;
}
export declare class MockWebMap extends MockMap {
    when(callback?: any, errback?: any): Promise<void>;
}
export declare class MockView extends MockAPIAccessor {
    map: MockMap;
    popup: MockPopup;
    constructor(options?: {});
    openPopup(options: any): void;
    closePopup(): void;
    whenLayerView(layer: MockAPILayer): Promise<MockLayerView>;
    when(callback?: any, errback?: any): Promise<void>;
    on(): void;
    destroy(): void;
}
export declare class MockMapView extends MockView {
}
export declare class MockSceneView extends MockView {
}
export declare class MockLayerView extends MockAPIAccessor {
    layer: MockAPILayer;
    when(): Promise<void>;
}
export declare class MockFeatureLayerView extends MockLayerView {
}
export declare class MockPopup extends MockAPIAccessor {
    visible: boolean;
    features: __esri.Feature[];
    selectedFeature: __esri.Feature;
    close(): void;
    open(options: any): void;
}
export declare class MockFeature extends MockAPIAccessor {
    getObjectId(): number;
}
export {};
