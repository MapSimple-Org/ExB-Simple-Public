import type { TemplateTagType } from 'jimu-for-builder/templates';
import type { AppInfo } from 'jimu-for-builder/service';
export type CategoriesType = 'New and noteworthy' | '3D' | 'People' | 'Environment' | 'Tourism' | 'Infrastructure' | 'Data' | 'Document' | 'Business Analyst';
export type TagTypes = TemplateTagType | CategoriesType;
export declare enum TemplateAccessTypes {
    Default = "Default",
    My = "MY",
    MyOrganization = "MY_ORGANIZATION",
    MyFavorites = "MY_FAVORITES",
    MyGroups = "MY_GROUPS",
    ArcGisOnline = "ARCGIS_ONLINE",
    LivingAtlas = "LIVING_ATLAS"
}
export interface FoldersItem {
    created: number;
    id: string;
    title: string;
    username: string;
}
/**
 *Search request type
 *MyPortalTemplate: search my template from connect portal(online or other portal)
 *MyTemplate: search my Template(in devEdition: search my local template. in online: search my online template)
 *ExbAdmin: search ExbAdmin`s template from AGOL
 *ArcGISOnline: search template from AGOL
 *Favorites: search my favorites template
 *LivingAtlas: search LivingAtlas template from connect portal(online or other portal)
 *MyGroup: search template in my group
 *MyOrganization: search template in my organization
*/
export declare enum TemplateSource {
    MyPortalTemplate = "MyPortalTemplate",
    MyTemplate = "MyTemplate",
    EsriGroup = "EsriGroup",
    ArcGISOnline = "ArcGISOnline",
    Favorites = "Favorites",
    LivingAtlas = "LivingAtlas",
    MyGroup = "MyGroup",
    MyOrganization = "MyOrganization"
}
export declare enum UserRole {
    OrgAdmin = "org_admin",// default org admins
    OrgPublisher = "org_publisher",// default org publishers
    OrgUser = "org_user",// default org users
    CustomRoles = "custom_roles"
}
export interface AppItem extends AppInfo {
    isExbTeamCommonTemplate?: boolean;
    isUpdateGroupItem?: boolean;
    userRole?: UserRole;
    isFavorite?: boolean;
}
export interface EditPrivileges {
    canDelete: boolean;
    canEdit: boolean;
    canCreate: boolean;
    canView: boolean;
}
export interface SitePrivileges extends EditPrivileges {
    canDuplicate: boolean;
}
export declare enum AppAccessTypes {
    My = "MY",
    MyOrganization = "MY_ORGANIZATION",
    MyGroups = "MY_GROUPS",
    MyFavorites = "MY_FAVORITES"
}
export declare enum AppSharedType {
    Public = "public",
    Private = "private",
    Org = "org",
    Shared = "shared"
}
export interface UserTags {
    UserTags: string[];
}
export declare const ITEM_WIDTH = 240;
export declare const ITEM_MARGIN_X = 12;
export declare const EsriTemplateGroupId = "3b5fbfab35f149a7992a7bde10d8ad9e";
export declare const EsriTemplateUserName = "ExB_team";
export declare const PRE_VERSION = "1.18.0";
export interface TemplateInfo extends AppInfo {
    isExperiencesTemplate: boolean;
    name: string;
    title: string;
    image?: {
        src: string;
        gifSrc?: string;
    };
    author?: string;
    description?: string;
    isArcGisOnlineRequest?: boolean;
    isPortalRequest?: boolean;
    isUpdateGroupItem?: boolean;
    snippet?: string;
    typeKeywords?: string[];
    isMapAware?: boolean;
    flipThumbnail?: boolean;
    templateCreateVersion?: string;
    isMultiplePage?: boolean;
    isEsriGroupTemplate?: boolean;
    isNewTemplate?: boolean;
    categoriesTags?: string[];
}
export declare enum PublishStatus {
    Published = "Published",
    Draft = "Draft",
    Changed = "Changed"
}
export declare enum SortField {
    Modified = "modified",
    Title = "title",
    NumViews = "numViews",
    Created = "created"
}
export declare enum SortOrder {
    Desc = "desc",
    Asc = "asc"
}
export interface DropdownDataItem {
    value: string;
    text: string;
}
export declare enum ListViewsItemType {
    App = "APP",
    Template = "TEMPLATE"
}
export declare enum ListViewsViewType {
    List = "LIST",
    Detail = "DETAIL",
    Mobile = "MOBILE"
}
export declare const ALL_FOLDERS = "all_folders";
export declare const ALL_GROUPS = "all_groups";
export declare const ROOT_FOLDER = "root";
