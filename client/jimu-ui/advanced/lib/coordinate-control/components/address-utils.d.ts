import Format from 'esri/widgets/CoordinateConversion/support/Format';
export declare function addressToLocations(locatorURL: string, address: string, minCandidateScore: number): Promise<__esri.AddressCandidate[]>;
export declare function getLocationForSuggestion(locatorURL: string, magicKey: string, address: string, minCandidateScore: number): Promise<__esri.AddressCandidate[]>;
export declare const fetchSuggestion: (geocodeURL: string, searchText: string, maxSuggestions: number) => Promise<{
    suggestionItem: any[];
}>;
export declare function generateAddressFormat(locatorURL: string, minCandidateScore: number, displayFullAddress: boolean): Format;
