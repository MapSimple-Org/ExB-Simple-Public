export interface Notation {
    name: string;
    pattern: RegExp;
    notationType: string;
    conversionType: string;
}
export interface ProcessedCoordinateTextInfo {
    str: string;
    prefixSuffixError: boolean;
}
export declare function processCoordTextInput(withStr: string, asType: Notation, testingMode: boolean): ProcessedCoordinateTextInfo;
export declare function getNotations(): Notation[];
export declare function getCoordinateType(fromInput: string): Promise<Notation[]>;
export declare function getCoordinatesType(fromInput: string[]): Promise<Notation[][]>;
