import { type IMAppConfig, type IMAttributesJson, type IMCustomThemeJson, type IMDataSourceJson, type IMDialogJson, type IMLayoutJson, type IMMessageJson, type IMPageJson, type IMViewJson, type IMSectionJson, type IMWidgetJson, type LayoutInfo, LayoutItemType, LayoutType, type IMSizeModeLayoutJson, BrowserSizeMode, type Size, type DataSourceJson, type WidgetJson, type IMProxyJson, type IMScreenGroupJson, type IMScreenJson, type IMUtilitiesJson, type UtilityJson, LayoutParentType, type ControllerPanelJson, type UrlParamsConfig, type Analytics, type CookieBannerJson, type AppStateConfig, type TranslationJson } from 'jimu-core';
import type { Template } from './templates/type';
import { type TocNode } from './app-config-service';
import type { ThemeOptions } from 'jimu-theme';
export declare function getAppConfigAction(appConfig?: IMAppConfig): AppConfigAction;
export declare class AppConfigAction {
    appConfig: IMAppConfig;
    /**
   * When duplicate a page or dialog, we'll duplicate all size mode layouts, but the shared contents should be duplicated only one time.
   * So, when duplicate the size mode layouts, we need to consider the contents that have been duplicated. If a content has been duplicated,
   * duplicate the same content will need to use the duplicated content id instead of create a new one.
   *
   * When start to duplicate a page or dialog, must clean this map and set it as `{}`, and restore to {} when duplication is done.
   */
    constructor(appConfig: IMAppConfig);
    setAppConfig(appConfig: IMAppConfig): this;
    /**
     *
     * @param replace by default, the change is appended to the change list. If replace = true, the change will replace the last change
     */
    exec(replace?: boolean): this;
    /**
     * After delete the widget, clear the message action of the widget
     * @oldAppConfig
     * @newAppConfig
     * */
    private readonly clearDeletedWidgetMessageAction;
    /**
     * Get the message config of the deleted widget
     * @oldAppConfig
     * @newAppConfig
     * */
    private readonly getDeletedWidgetsMessageConfigs;
    /**
     * Remove message action
     * @message
     * */
    private readonly removeMessageAction;
    editWidgetConfig(widgetId: string, widgetConfig: any): this;
    /**
     * Update the passed in properties only.
     * To delete a property, please set the property to null
     * @param partialWidgetJson
     * @param outputDataSourcesJsons
     *    To create a data source, you need to pass in all of the generated properties.
     *    To update a data source, you can pass in the change properties only. Pass null to delete a property.
     */
    editWidget(partialWidgetJson: Partial<WidgetJson>, outputDataSourcesJsons?: DataSourceJson[]): this;
    /**
     * Update a sigle widget property. Does not `outputDataSources` property
     * @param widgetId
     * @param prop
     * @param val
     */
    editWidgetProperty(widgetId: string, prop: string, val: any): this;
    /**
     *
     * @param widgetJson basic widget info, like uri. manifest and id will be set in this method.
     * @param createEmbedLayout
     */
    createWidget(widgetJson: WidgetJson, createEmbedLayout?: boolean): Promise<IMWidgetJson>;
    removeWidget(widgetId: string): this;
    editControllerPanel(controllerWidgetId: string, value: ControllerPanelJson): this;
    removeControllerPanel(controllerWidgetId: string): this;
    removeLayoutFromWidget(widgetId: string, layoutName: string): this;
    /**
     * create section only, does not add into layout
     */
    createSection(): IMSectionJson;
    editSectionProperty(sectionId: string, prop: string, val: any): this;
    editViewProperty(viewId: string, prop: string, val: any): this;
    /**
     * Add a view into a section, will create layouts for the view. The layouts are created depends on the section.
     *
     * @param viewJson the viewJson has id and label only
     * @param sectionId the section that the view will be added in
     */
    addView(sectionId: string): string;
    /**
     * Duplicate the view in the section, return the new view.
     * @param viewId
     * @param sectionId
     * @param addToSection
     */
    duplicateView(viewId: string, sectionId: string, addToSection: boolean): IMViewJson;
    /**
     * Remove the view from the section. The last view in the section is not allowed remove
     * @param viewId
     * @param sectionId
     */
    removeView(viewId: string, sectionId: string): this;
    /**
     * Move the view position in the section. Move the view to the targetView's above/below
     * @param sectionId
     * @param viewId
     * @param targetViewId
     * @param position
     */
    moveViewInSection(sectionId: string, viewId: string, targetViewId: string, position: 'above' | 'below'): this;
    /**
     * Create an empty screen group
     */
    createScreenGroup(): IMScreenGroupJson;
    editScreenGroupProperty(screenGroupId: string, prop: string, val: any): this;
    editScreenProperty(screenId: string, prop: string, val: any): this;
    moveScreenInGroup(screenGroupId: string, index: number, targetIndex: number, position: 'above' | 'below'): this;
    removeScreenByIndex(index: number, screenGroupId: string): this;
    /**
     * Remove the screen from the screen group. The last screen in the screen group is not allowed remove
     * @param screenId
     * @param screenGroupId
     */
    removeScreen(screenId: string, screenGroupId: string, force?: boolean): this;
    duplicateScreenByIndex(index: number, screenGroupId: string, addToScreenGroup?: boolean): IMScreenJson;
    /**
     * Duplicate the screen in the screen group, return the new screen.
     * @param screenId
     * @param screenGroupId
     * @param addToScreenGroup
     */
    duplicateScreen(screenId: string, screenGroupId: string, addToScreenGroup?: boolean): IMScreenJson;
    editPageProperty(pageId: string, prop: string, val: any): this;
    /**
     *
     * @param pageJson
     *
     * Add a new page. Only the folder and link page is created here.
     * The other page (the page can put widgets) are created in `template-utils in jimu-for-builder`
     */
    addPage(pageJson: IMPageJson): this;
    /**
     *
     * @param pageId
     * @param duplicatePageJsonOnly
     * if duplicatePageJsonOnly is true, the page won't be put into page structure.
     * It's used when one page(or folder, or link) need to duplicate its sub pages.
     *
     * This logic need to be refacted when page structure has more than two levels.
     */
    duplicatePage(pageId: string, duplicatePageJsonOnly?: boolean): IMPageJson;
    movePageIntoPage(subPageId: string, parentPageId: string): this;
    orderPageToPage(pageId: string, targetPageId: string, type: 'top' | 'bottom'): this;
    private updatePageRestrictionsAfterRemovePage;
    removePage(pageId: string, newHomePageId?: string): this;
    setHomePage(pageId: string): this;
    setUseAutoSortInFixedLayout(value: boolean): this;
    replaceHomePage(pageId: string): this;
    editDialog(dialogJson: IMDialogJson): this;
    editDialogProperty(dlgId: string, prop: string, val: any): this;
    removeDialog(dialogId: string): this;
    duplicateDialog(dialogId: string): IMDialogJson;
    /**
     * Only support reordering dialogs for same mode.
     */
    orderDialogToDialog(dialogId: string, targetDialogId: string, type: 'top' | 'bottom'): this;
    replaceSplashDialog(dialogId: string, splashDialogId?: string): this;
    createLayoutForSizeMode(sizeMode: BrowserSizeMode, fromSizeMode: BrowserSizeMode, layouts: IMSizeModeLayoutJson, parentType: LayoutParentType, parentId: string, layoutName?: string): IMSizeModeLayoutJson;
    /**
     * Remove the layout and all the embedde layout for the size mode
     * If a widget is only used in current size mode, it should be removed
     * @param layoutId
     * @param sizeMode
     */
    removeSizeModeLayout(layoutId: string, sizeMode: BrowserSizeMode): this;
    addNewSectionToLayout(targetLayoutId: string): string;
    addPlaceholderToLayout(targetLayoutId: string): string;
    addNewWidgetToLayout(targetLayoutId: string, widgetJson: Partial<WidgetJson>, runInExpressMode?: boolean): Promise<string>;
    /**
     * Content has been created from template, add it to the layout using this method.
     * @param targetLayoutId
     * @param type
     * @param templateContentId
     * @returns
     */
    addTemplateContentToLayout(targetLayoutId: string, type: LayoutItemType, templateContentId: string): LayoutInfo;
    addContentToPlaceholder(placeholderLayoutInfo: LayoutInfo, type: LayoutItemType, contentId: string): this;
    removeParentsOfOtherSizeModes(layoutInfo: LayoutInfo, allSizeModes: BrowserSizeMode[], currentSizeMode: BrowserSizeMode): void;
    duplicateLayoutItemInSameLayout(layoutInfo: LayoutInfo): string;
    duplicateLayoutItemToOtherLayout(layoutInfo: LayoutInfo, targetLayoutId: string): string;
    syncPlaceholder(layoutInfo: LayoutInfo, placeholderId: number, sizeMode: BrowserSizeMode): this;
    /**
     * move a layout item to another layout
     * @param fromLayoutInfo
     * @param toLayoutInfo
     */
    moveLayoutItem(fromLayoutInfo: LayoutInfo, toLayoutId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): LayoutInfo;
    setLayoutItemToPending(layoutInfo: LayoutInfo, value: boolean): this;
    /**
     *
     * @param layoutInfo
     * @param removeContent false, remove layout item only. true, remove the widget/section in the layout item
     */
    removeLayoutItem(layoutInfo: LayoutInfo, removeContent: boolean, force?: boolean): this;
    removeLayout(layoutId: string): this;
    clearLayoutContent(layoutId: string): this;
    /**
     * Duplicate layout and return new layout json.
     * @param layoutId
     * @param duplicateContent
     */
    duplicateLayout(layoutId: string, duplicateContent: boolean): IMLayoutJson;
    editLayoutProperty(layoutId: string, prop: string, val: any): this;
    editLayoutItemProperty(layoutInfo: LayoutInfo, prop: string, val: any, runInExpressMode?: boolean): this;
    editLabelOfTocNode(node: TocNode, label: string): this;
    /**
     * Use as a convenient way to change the size of a fixed layout item. Size of other layout types is not guaranteed.
     */
    editLayoutItemSize(layoutInfo: LayoutInfo, width: number | string, height: number | string, runInExpressMode?: boolean): this;
    /**
     * This operation only works in fixed layout.
     */
    exchangeWidthAndHeight(runInExpressMode?: boolean): this;
    adjustOrderOfItem(layoutInfo: LayoutInfo, insertIndex: number, runInExpressMode?: boolean): this;
    createLayout(type: LayoutType): string;
    createPageFromTemplate(templateJson: Template): Promise<string>;
    createDialogFromTemplate(templateJson: Template): Promise<string>;
    applyHeaderTemplate(templateJson: Template): Promise<void>;
    applyFooterTemplate(templateJson: Template): Promise<void>;
    applyPageBodyTemplate(pageId: string, templateJson: Template): Promise<void>;
    applyDialogTemplate(dialogId: string, templateJson: Template, sizeMode?: BrowserSizeMode): Promise<void>;
    applyGridTemplate(widgetId: string, templateJson: Template): Promise<void>;
    createScreenFromTemplate(screenId: string, templateJson: Template): Promise<string>;
    /**
     * Copy the parent use datasource to children widgets
     * @param parentWidgetId
     */
    copyUseDataSourceToAllChildWidgets(oldParentWidgetJson: IMWidgetJson, newParentWidgetJson: IMWidgetJson): this;
    addDataSource(dataSourceJson: IMDataSourceJson): this;
    addDataSources(dataSourceJsons: IMDataSourceJson[]): this;
    addUtility(utility: UtilityJson): this;
    removeUtility(utilityId: string): this;
    updateUtilities(utilities: IMUtilitiesJson): this;
    removeDataSource(dataSourceId: string): this;
    removeUseDataSource(dataSourceId: string): this;
    editDataSource(dataSourceJson: IMDataSourceJson): this;
    addAppProxy(proxyJson: IMProxyJson): this;
    editAppProxy(proxyJson: IMProxyJson): this;
    removeAppProxy(appProxyId: string): this;
    addMessage(messageJson: IMMessageJson): this;
    editMessage(messageJson: IMMessageJson): this;
    removeMessage(messageJson: IMMessageJson): this;
    editTheme(themeName: string): this;
    editCustomTheme(customTheme: IMCustomThemeJson): this;
    editCustomThemeOption(themeOption: ThemeOptions): this;
    replaceOldThemeVariables(): Promise<this>;
    initHeaderLayout(): this;
    editHeaderProperty(prop: string, val: any): this;
    initFooterLayout(): this;
    editFooterProperty(prop: string, val: any): this;
    setViewportSize(browserSizeMode: BrowserSizeMode, size: Size): this;
    setLockLayout(lockLayout: boolean): this;
    editAttributes(attributesJson: IMAttributesJson): this;
    updateAnalyticsConfig(analyticsJson: Analytics): this;
    updateCookieBannerConfig(cookieBannerJson: CookieBannerJson): this;
    editCookieBannerConfig<T extends keyof CookieBannerJson>(propName: T | string[], value: CookieBannerJson[T]): this;
    removeCookieBannerConfig(): this;
    updateAppStateConfig(appStateConfig: AppStateConfig): this;
    updateUrlParamsConfig(urlParams: UrlParamsConfig): this;
    updateTranslationJsons(translationJsons: {
        [locale: string]: TranslationJson;
    }): this;
    private getDuplicateLabel;
    private removePageFromPageStructure;
    private movePageIntoPageForPageStructure;
    private editJsonProperty;
    private handleWidgetUseDataSourceChange;
}
