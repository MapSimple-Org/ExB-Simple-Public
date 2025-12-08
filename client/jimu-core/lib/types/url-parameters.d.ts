import type { ImmutableObject } from 'seamless-immutable';
export interface UrlParameters {
    locale?: string;
    /**
     * @ignore
     * sample: //js.arcgis.com/4.30/
     */
    apiurl?: string;
    /**
     * @ignore
     * sample: https://qawebgis.esri.com/arcgis-components/builds/main/cdn
     * This is the base URL for the components, like map components, chart components, etc.
     */
    componentsurl?: string;
    /**
     * @ignore
     * The following urls are used to override the above componentsurl.
     * In general, these urls are for personal branch builds.
     */
    mapcomponentsurl?: string;
    chartscomponentsurl?: string;
    codingcomponentsurl?: string;
    portalcomponentsurl?: string;
    /**
     * @ignore
     * sample: https://js.arcgis.com/calcite-components/2.13.0/
     */
    calciteurl?: string;
    /** these are for buidler only */
    title?: string;
    tags?: string;
    summary?: string;
    folder?: string;
    template?: string;
    id?: string;
    page?: string;
    /** end */
    views?: string;
    dlg?: string;
    /**
     * The data_index is used to select data records by id, the dsId is the main data source id. The format is: <dsId:selectId>.
     * the selectId can be:
     *    * <id>
     *    * <id1+id2+id3> this means the id must not contain "+"
     *
     * To select multiple data sources, use this format: [<dsId:selectId>,<dsId:selectId>]
     *
     * The data_id will be used prior to data_index.
     * @deprecated
     */
    data_id?: string;
    /**
     * The data_filter is used to filter data source, the filter is the where clause. The format is: <dsId:filter>
     * For example: data_filter=ds1:objectid=1, ds2:fielda>2
     *
     * To filter multiple data sources, use this format: [<dsId:filter>,<dsId:filter>]
     *
     * Note: the filter can't contain "," and ":"
     */
    data_filter?: string;
    /**
     * The data_version is used to change data source gdb version, the version here means gdb version. The format is: <dsId:version>
     *
     * To change version for multiple data sources, use this format: [<dsId:version>,<dsId:version>]
     *
     */
    data_version?: string;
    /**
     * The app config parameter.
     * It can be:
     *    * item:<itemId>, use the current portal and this item id to fetch config
     *    * a URL, use this URL to fetch config. When the config is in the app, use the config file name, like: config.json
     */
    config?: string;
    /**
     * When one app has multiple configs, use *mode* as the URL parameter to specify which config to use is more user-friendly then use the *config* param.
     * When use *mode* param, only the config name is needed, the `.json` suffix is not needed.
     */
    mode?: string;
    app_config?: string;
    /**
     * embedded = <true | 1>
     */
    embedded?: string;
    /**
     * by default, app will load config from item data.
     * But before publish, the item data is empty, we can set draft=1 to load config from item resource
     * draft = <true | 1>
     */
    draft?: string;
    /**
     * print_preview = <true | 1> will active the print preview mode.
     */
    print_preview?: string;
    /**
     * When an ExB app is embedded, you can use this query param to try to get credential from host app.
     * We follow the platform application authentication workflow, see: https://esri.github.io/arcgis-rest-js/guides/embedded-apps/
     */
    'arcgis-auth-origin'?: string;
    __env__?: 'dev' | 'qa' | 'prod';
    /**
     * This param is for debug purpose.
     *
     * Some app config is very large, which causes crash when developer tool is opened if you enable the "Redux DevTools".
     * So, we don't log the app config by default. See: https://github.com/reduxjs/redux-devtools-extension/blob/master/docs/Troubleshooting.md#excessive-use-of-memory-and-cpu
     *
     * To log the app config, set this param to 1
     */
    __log_app_config_in_redux__?: string;
    /**
     * The org short name (urlKey), valid on AGOL only. Will be used when login
     */
    org?: string;
    theme?: string;
    /**
     * See {@link appConfigUtils.addWebmapOrWebsceneToAppConfig}
     */
    webmap?: string;
    webscene?: string;
    /**
     * this is for make widget to support custom URL parameters. the suggest pattern is: ?widget1=p1=v1,p2=v2, but every widget can define it's own pattern
     */
    [widgetId: string]: string;
    /**
     * By default, It will focus on the inteactive elements on Splash, or Page window when app starts.
     * User can set disable_window_focus=true to disable this behavior.
     * @default false
     */
    disable_window_focus?: string;
    /**
     * Show the cookie banner when clicking a button linked to the banner
     */
    cookie_banner?: string;
    /**
     * Error code from OAuth sigin-in, use for prompting OAuth sigin-in error mesage
     */
    oauth_error_code?: string;
}
export declare enum UrlGeneralConfig {
    DataSelection = "dataSelection"
}
export type UrlHashParameters = (UrlWidgetHashParameters | UrlHashDataParameters);
/**
* URL:
  #widget_1=param1:encodeValue1,param2:encodeValue2
  &widget_2=p1:encodeValue3,p2:encodeValue4
  &widget_3...

* IMObj:
  {
    widget_1: {
      param1: decodeValue1,
      param2: decodeValue2
    },
    widget_2: {
      p1: decodeValue3,
      p2: decodeValue4
    },
    widget_3...
} */
export interface UrlWidgetHashParameters {
    [key: `widget_${string}`]: UrlWidgetSpecificParams;
}
export interface UrlHashDataParameters {
    /**
     * This URL has this format:
     * It can have multiple selections, split by `,`
     * Each selection has 3 segments, split by `:`, the selection format is: `<selection type>:<data source id>:<selection condition>`, the `selection type` has these options: `id`, `geometry`, `where`.
     * When it's `id`, multiple id are connected by `+`, which is the same as the `?data_id`
     * When it's `geometry`, the second segment can be multiple data source id
  
     * Here are some samples:
     * Select one feature by id: `?data_s=id:widget_1-dataSource_1-1871234a785-layer-2:1`
     * Select two features by id: `?data_s=id:widget_1-dataSource_1-1871234a785-layer-2:1+2`
     * Select two layers, each has one feature by id: `?data_s=id:widget_1-dataSource_1-1871234a785-layer-2:1,id:widget_1-dataSource_1-1871234a785-layer-1:1`
     * Select by geometry: `?data_s=geometry:widget_1-dataSource_1-1871234a785-layer-2:<the geometry JSON>`
     * Select multiple layers by geometry: `?data_s=geometry:widget_1-dataSource_1-1871234a785-layer-2~widget_1-dataSource_1-1871234a785-layer-3:<the geometry JSON>`
     * Select by where: `?data_s=where:widget_1-dataSource_1-1871234a785-layer-2:a>1`
     */
    data_s: string;
    zoom_to_selection?: string;
}
export declare enum HashParamsType {
    Widgets = "widgets",
    Data_s = "data_s"
}
export interface UrlWidgetSpecificParams {
    [key: string]: any;
}
export type IMUrlParameters = ImmutableObject<UrlParameters>;
export type IMUrlHashParameters = ImmutableObject<UrlHashParameters>;
export type IMUrlWidgetSpecificParams = ImmutableObject<UrlWidgetSpecificParams>;
export declare enum DataSourceSelectionTypes {
    Id = "id",
    Where = "where",
    Geometry = "geometry",
    SpatialRel = "spatialRel"
}
