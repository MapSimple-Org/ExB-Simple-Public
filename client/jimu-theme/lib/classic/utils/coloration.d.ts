import type { ThemeBody, ThemeLink, ThemeAllColors, ThemeVariables, ThemeHeader, ThemeFooter, ThemeColorationVariants, ThemeColorationVariant } from 'jimu-core';
export declare const createColoration: (inputColoration: ThemeColorationVariants, colors: ThemeAllColors) => ThemeColorationVariants;
export declare const createBody: (input: ThemeBody, colorationVariant: ThemeColorationVariant, variables: Partial<ThemeVariables>) => ThemeHeader;
export declare const createHeader: (input: ThemeHeader, colorationVariant: ThemeColorationVariant, variables: Partial<ThemeVariables>) => ThemeHeader;
export declare const createFooter: (input: ThemeFooter, colorationVariant: ThemeColorationVariant, variables: Partial<ThemeVariables>) => ThemeFooter;
export declare const createLink: (input: ThemeLink, colors: ThemeAllColors) => ThemeLink;
