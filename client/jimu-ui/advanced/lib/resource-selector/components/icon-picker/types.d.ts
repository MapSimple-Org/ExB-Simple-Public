export interface IconGroup {
    [iconKey: string]: string;
}
export type IconGroups = {
    [groupKey in PublicIconGroupType]?: IconGroup;
};
export type PublicIconGroupType = 'generalAndArrows' | 'directional' | 'suggested' | 'editor' | 'data' | 'brand' | 'application' | 'gis';
export type ConfigurableOption = 'color' | 'size' | 'all' | 'none';
export interface PreviewOptions {
    color?: boolean;
    size?: boolean;
    autoFlip?: boolean;
}
