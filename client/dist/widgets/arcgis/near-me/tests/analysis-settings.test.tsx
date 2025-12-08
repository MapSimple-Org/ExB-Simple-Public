import { DataSourceManager, JimuMapViewStatus, React, appActions, createIntl, getAppStore } from 'jimu-core'
import { mockTheme, widgetRender, wrapWidget, initGlobal, getInitState, getDefaultAppConfig } from 'jimu-for-test'
import '@testing-library/jest-dom'
import { waitFor } from '@testing-library/react'
import AnalysisSetting from '../src/setting/components/analysis-settings'
import EditAnalysisPopper from '../src/setting/components/edit-analysis-popper'
import { type JimuMapView, MapViewManager } from 'jimu-arcgis'
getAppStore().dispatch(appActions.updateStoreState(getInitState().merge({ appConfig: getDefaultAppConfig() })))

jest.mock('esri/intl', () => { return {} }, { virtual: true })
initGlobal()

window.locale = 'en'
const render = widgetRender(true, mockTheme as any)

jest.mock('jimu-ui/advanced/data-source-selector', () => ({
    DataSourceSelector: jest.fn().mockImplementation(({
        types = [],
        mustUseDataSource = false,
        useDataSources = [],
        onChange,
        widgetId,
        isMultiple = false,
        closeDataSourceListOnChange = true,
        disableRemove = false,
        hideTypeDropdown = false,
        enableToSelectOutputDsFromSelf = false,
        ...props
    }) => {
        const [selectedDataSources, setSelectedDataSources] = React.useState(useDataSources || [])

        const handleDataSourceChange = (value) => {
            let newDataSources = []
            if (value && value !== '') {
                const mockDataSource = {
                    dataSourceId: value,
                    mainDataSourceId: value,
                    dataViewId: null,
                    rootDataSourceId: value,
                    type: 'FEATURE_LAYER'
                }
                if (isMultiple) {
                    newDataSources = [...selectedDataSources, mockDataSource]
                } else {
                    newDataSources = [mockDataSource]
                }
            }
            setSelectedDataSources(newDataSources)
            if (onChange) {
                onChange({ useDataSources: newDataSources })
            }
        }
        const handleRemove = (dsId) => {
            const filtered = selectedDataSources.filter(ds => ds.dataSourceId !== dsId)
            setSelectedDataSources(filtered)
            if (onChange) {
                onChange({ useDataSources: filtered })
            }
        }
        return (
            <div data-testid="data-source-selector" {...props}>
                <div data-testid="data-source-selector-content">
                    <select
                        data-testid="data-source-select"
                        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
                        onChange={(e) => handleDataSourceChange(e.target.value)}
                        disabled={props.disabled}
                    >
                        <option value="">Choose data source</option>
                        <option value="feature_layer_1">Points of Interest</option>
                        <option value="feature_layer_2">Boundaries</option>
                        <option value="feature_layer_3">Addresses</option>
                        <option value="map_service_1">Base Map Service</option>
                    </select>

                    {selectedDataSources.length > 0 && (
                        <div data-testid="selected-data-sources">
                            {selectedDataSources.map((ds, index) => (
                                <div key={index} data-testid={`selected-ds-${ds.dataSourceId}`}>
                                    <span>{ds.dataSourceId}</span>
                                    {!disableRemove && (
                                        <button
                                            data-testid={`remove-ds-${ds.dataSourceId}`}
                                            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
                                            onClick={() => handleRemove(ds.dataSourceId)}
                                        >
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }),

    FieldSelector: jest.fn().mockImplementation(({
        useDataSources = [],
        onChange,
        selectedFields = [],
        isMultiple = false,
        types = [],
        isDataSourceDropDownHidden = false,
        useDropdown = true,
        placeholder = 'Select fields',
        ...props
    }) => {
        const [fields, setFields] = React.useState(selectedFields)

        // Mock fields based on data source
        const getAvailableFields = () => {
            if (!useDataSources || useDataSources.length === 0) return []

            return [
                { name: 'OBJECTID', alias: 'Object ID', type: 'esriFieldTypeOID', jimuName: 'OBJECTID' },
                { name: 'NAME', alias: 'Name', type: 'esriFieldTypeString', jimuName: 'NAME' },
                { name: 'ADDRESS', alias: 'Address', type: 'esriFieldTypeString', jimuName: 'ADDRESS' },
                { name: 'CITY', alias: 'City', type: 'esriFieldTypeString', jimuName: 'CITY' },
                { name: 'STATE', alias: 'State', type: 'esriFieldTypeString', jimuName: 'STATE' },
                { name: 'ZIP', alias: 'ZIP Code', type: 'esriFieldTypeString', jimuName: 'ZIP' },
                { name: 'LATITUDE', alias: 'Latitude', type: 'esriFieldTypeDouble', jimuName: 'LATITUDE' },
                { name: 'LONGITUDE', alias: 'Longitude', type: 'esriFieldTypeDouble', jimuName: 'LONGITUDE' },
                { name: 'CREATED_DATE', alias: 'Created Date', type: 'esriFieldTypeDate', jimuName: 'CREATED_DATE' }
            ]
        }

        const availableFields = getAvailableFields()
        const handleFieldChange = (e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value)
            const mockFields = selectedOptions.map(fieldName =>
                availableFields.find(f => f.name === fieldName)
            ).filter(Boolean)

            setFields(mockFields)
            if (onChange) {
                onChange(isMultiple ? mockFields : mockFields[0])
            }
        }
        return (
            <div data-testid="field-selector" {...props}>
                <div data-testid="field-selector-content">
                    {useDataSources.length === 0 && (
                        <div data-testid="no-data-source-message">
                            Please select a data source first
                        </div>
                    )}

                    {useDataSources.length > 0 && (
                        <select
                            data-testid="field-select"
                            multiple={isMultiple}
                            onChange={handleFieldChange}
                            disabled={props.disabled}
                        >
                            <option value="">{placeholder}</option>
                            {availableFields.map(field => (
                                <option key={field.name} value={field.name}>
                                    {field.alias || field.name} ({field.type})
                                </option>
                            ))}
                        </select>
                    )}

                    {fields.length > 0 && (
                        <div data-testid="selected-fields">
                            {fields.map((field, index) => (
                                <div key={index} data-testid={`selected-field-${field.name}`}>
                                    <span>{field.alias || field.name}</span>
                                    <span data-testid={`field-type-${field.name}`}>({field.type})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    })
}), { virtual: true })

const mockMv: JimuMapView = {
    id: 'mock-map-view',
    mapWidgetId: 'widget_1',
    isActive: true,
    dataSourceId: 'ds1',
    status: JimuMapViewStatus.Loaded,
    view: {
        type: '3d'
    },
    jimuMapViewGroups: {
        widget_1: {
            jimuMapViews: {
                map1: {
                    dataSourceId: 'ds1'
                }
            }
        }
    },
    destroy: jest.fn()
} as any

beforeAll(() => {
    jest.clearAllMocks()
    const dss = {
        id: 'dataSource_1',
        layer: {
            id: 'dataSource_1',
            title: 'Layer 1',
            getLayerDefinition: jest.fn().mockReturnValue({
                geometryType: 'esriGeometryLine'
            }),
            type: 'feature'
        },
        getLabel: jest.fn().mockReturnValue('Layer 1'),
        getSchema: jest.fn().mockReturnValue(Promise.resolve({
            fields: [
                { name: 'OBJECTID', type: 'esriFieldTypeOID' },
                { name: 'GlobalID', type: 'esriFieldTypeGlobalID' },
                { name: 'like_field', type: 'esriFieldTypeString' },
                { name: 'dislike_field', type: 'esriFieldTypeString' },
                { name: 'creation_date', type: 'esriFieldTypeDate' },
                { name: 'Name', type: 'esriFieldTypeString' }
            ]
        })),
        getChildDataSources: jest.fn().mockReturnValue([]),
        isDataSourceSet: jest.fn().mockReturnValue(false),
        getLayerDefinition: jest.fn().mockReturnValue({
            geometryType: 'esriGeometryLine'
        }),
        getDataSourceJson: jest.fn().mockReturnValue({
            isOutputFromWidget: true
        }),
        getMainDataSource: jest.fn().mockReturnValue({
            getDataView: jest.fn((viewId) => ({
                id: viewId,
                label: 'Output Data View',
                getLabel: jest.fn(() => 'Output Data View Label'),
                getLayerDefinition: jest.fn().mockReturnValue({
                    geometryType: 'esriGeometryLine'
                }),
                getDataSourceJson: jest.fn().mockReturnValue({
                    isOutputFromWidget: true
                }),
                getGeometryType: jest.fn().mockReturnValue('esriGeometryLine')
            })),
            getDataSourceJson: jest.fn().mockReturnValue({
                isOutputFromWidget: true
            }),
            getGeometryType: jest.fn().mockReturnValue('esriGeometryLine')
        })
    }
    const mockFnGetDataSource = jest.fn().mockImplementation(() => {
        return dss
    })
    DataSourceManager.getInstance().getDataSource = mockFnGetDataSource
    MapViewManager.getInstance().setJimuMapView(mockMv)
})


const activeDsSearchConfig = {
    headingLabel: 'Location',
    bufferDistance: 1,
    distanceUnits: 'miles',
    showDistanceSettings: true,
    sketchTools: {
        showPoint: true,
        showPolyline: true,
        showPolygon: true
    },
    activeToolWhenWidgetOpens: 'none',
    searchByActiveMapArea: false,
    includeFeaturesOutsideMapArea: false,
    headingLabelStyle: {
        fontFamily: 'Avenir Next',
        fontBold: false,
        fontItalic: false,
        fontUnderline: false,
        fontStrike: false,
        fontColor: '#000000',
        fontSize: '13px'
    },
    showInputAddress: true
}

const analysisSettingProps = {
    widgetId: 'widget_1',
    intl: createIntl({ locale: 'en' }),
    theme: mockTheme,
    jimuMapView: mockMv,
    allFeatureLayers: [{
        label: 'Layer1',
        value: 'ds1',
        isValid: true,
        availableLayers: ['dataSource_1']
    }],
    activeDsLayersConfig: {
        displayAllLayersResult: false,
        displayAnalysisIcon: false,
        displayMapSymbols: false,
        enableProximitySearch: false,
        onlyShowLayersResult: false,
        showDistFromInputLocation: true,
        layersInfo: [] // no analysis configured
    },
    activeDsSearchConfig: activeDsSearchConfig,
    selectedDs: 'ds1',
    useDataSourceConfig: [
        {
            dataSourceId: 'ds1',
            mainDataSourceId: 'mainDs_1',
            rootDataSourceId: 'rootDs_1',
            dataViewId: 'default'
        }
    ],
    onAnalysisSettingsUpdated: jest.fn()
}

const analysisInfo = {
    analysisId: '1234567890123456789',
    analysisType: 'closest',
    displayField: 'OBJECTID',
    expandFeatureDetails: false,
    expandOnOpen: true,
    highlightResultsOnMap: true,
    highlightColorOnMap: '#FF0000',
    returnIntersectedPolygons: false,
    includeApproxDistance: false,
    displayFeatureCount: true,
    fieldsToExport: ['OBJECTID', 'GlobalID', 'like_field', 'dislike_field', 'creation_date', 'Name'],
    sortFeaturesByDistance: false,
    sortFeatures: {
        sortFeaturesByField: 'OBJECTID',
        sortFeaturesOrder: 'ASC'
    },
    groupFeaturesEnabled: false,
    groupFeatures: {
        groupFeaturesByField: '',
        groupFeaturesOrder: 'ASC',
        sortGroupsByCount: false,
        noValueGroupLabel: ''
    },
    subGroupFeatures: {
        subGroupFeaturesByField: '',
        subGroupFeaturesOrder: 'ASC',
        sortSubGroupsByCount: false,
        noValueSubGroupLabel: ''
    },
    summaryFields: []
}

const mockLayersInfo = [
    {
        label: 'Layer1',
        useDataSource: {
            dataSourceId: 'dataSource_1-1234567890-layer-1',
            mainDataSourceId: 'dataSource_1-1234567890-layer-1',
            rootDataSourceId: 'ds1'
        },
        analysisInfo: analysisInfo
    }
]

describe('validate Analysis settings', function () {

    it('Should show warning message when no analysis is configured', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        expect((ref.current as any).state.newAddedLayerAnalysis.length).toBe(0)
    })

    it('Should add analysis when clicked ok button from edit analysis section', function () {
        const activeDsLayersConfig = {
            layersInfo: mockLayersInfo,
            ...analysisSettingProps.activeDsLayersConfig
        }
        const customAnalysisSettingsProps = {
            activeDsLayersConfig: activeDsLayersConfig,
            ...analysisSettingProps
        }
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        render(<WidgetSettings widgetId='analysisSettings' {...customAnalysisSettingsProps} />)
        const result = (ref.current as any).onAddAnalysisClick()
        expect(result.length).toEqual(1)
    })

    it('Should remove the analysis from list when deleted', async function () {
        const activeDsLayersConfig = {
            layersInfo: mockLayersInfo,
            ...analysisSettingProps.activeDsLayersConfig
        }
        const customAnalysisSettingsProps = {
            activeDsLayersConfig: activeDsLayersConfig,
            ...analysisSettingProps
        }
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        render(<WidgetSettings widgetId='analysisSettings' {...customAnalysisSettingsProps} />)
        await waitFor(() => {
            (ref.current as any).onDeleteButtonClick([], 'dataSource_1-1234567890-layer-1', 'closest')
        }, { timeout: 100 })
        expect((ref.current as any).state.newAddedLayerAnalysis.length).toEqual(mockLayersInfo.length - 1)
    })
})

// Props for specify a location
const editAnalysisPopperProps = {
    mapWidgetId: 'widget_1',
    intl: createIntl({ locale: 'en' }),
    theme: mockTheme,
    jimuMapView: mockMv,
    isActiveMapAreaSelected: false,
    isIncludeOutsideMapAreaSelected: false,
    activeDs: 'dataSource_1',
    analysisIndex: 0,
    availableFeatureLayer: [
        {
            id: 'layer_1',
            label: 'Feature Layer 1',
            type: 'FeatureLayer',
            url: 'https://example.com/arcgis/rest/services/FeatureLayer/MapServer/0'
        } as any
    ],
    editCurrentLayer: {
        layerDsId: 'dataSource_1-1234567890-layer-1',
        analysisType: 'closest'
    },
    analysisList: mockLayersInfo,
    selectedLayerGeometry: 'esriGeometryPolygon',
    onAnalysisUpdate: jest.fn(),
    disableOkButton: jest.fn()
}

describe('validate Analysis edit settings', function () {
    it('Highlight results on map should be enabled by default', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...editAnalysisPopperProps} />)
        expect((getByTestId('highlightResultsOnMapLabel') as any).checked).toEqual(true)
    })

    it('Feature count should be checked by default', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...editAnalysisPopperProps} />)
        expect((ref.current as any).state.displayFeatureCount).toBe(true)
    })
})

describe('Validate Edit Analysis settings in case of Specify a location', function () {
    // If closest analysis is selected
    it('By default Expand analysis results should be enabled', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...editAnalysisPopperProps} />)
        expect((getByTestId('expandOnOpen') as any).checked).toEqual(true)
    })

    // // If Proximity analysis is selected
    const proximityAnalysisPopperProps =
    {
        ...editAnalysisPopperProps,
        analysisList: [
            {
                ...editAnalysisPopperProps.analysisList[0],
                analysisInfo: {
                    ...editAnalysisPopperProps.analysisList[0].analysisInfo,
                    analysisType: 'proximity'
                }
            }
        ]
    }
    it('By default object id field should be selected as display field', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...proximityAnalysisPopperProps} />)
        expect((ref.current as any).state.displayField[0]).toBe("OBJECTID")
    })

    it('Group features should be unchecked', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...proximityAnalysisPopperProps} />)
        expect((getByTestId('groupFeaturesLabel') as any).checked).toEqual(false)
    })

    // If summary analysis is selected
    const summaryAnalysisPopperProps = {
        ...editAnalysisPopperProps,
        analysisList: [
            {
                ...editAnalysisPopperProps.analysisList[0],
                analysisInfo: {
                    ...editAnalysisPopperProps.analysisList[0].analysisInfo,
                    analysisType: 'summary'
                }
            }
        ]
    }
    it('Add summary button should be shown', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...summaryAnalysisPopperProps} />)
        expect(getByTestId('addSummaryFields')).toBeInTheDocument()
    })

    // it('By default for first Closest feature analysis should be selected', function () { // TODO
    // })

    // it('Should show "Sum of intersected area/length" checkbox when polyline or polygon layer is configured', function () { //TODO
    //     const ref: { current: HTMLElement } = { current: null }
    //     const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
    //     const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...summaryAnalysisPopperProps} />)
    //     expect(getByTestId('sumOfIntersectedArea')).toBeInTheDocument()
    // })
})

describe('Validate Edit Analysis settings in case of Current map area', function () {
    const updatedEditAnalysisPopperProps = {
        ...editAnalysisPopperProps,
        isActiveMapAreaSelected: true
    }

    it('Closest Feature analysis should be disabled', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...updatedEditAnalysisPopperProps} />)
        expect((getByTestId('closestAnalysis') as any).disabled).toEqual(true)
    })

    // it('By default for first analysis proxmity analysis should be selected', function () { //TODO
    //     const ref: { current: HTMLElement } = { current: null }
    // })

    // If Proximity analysis is selected
    it('Sort features by distance should be disabled', function () {
        const promimityEditAnalysisPopperProps = {
            ...editAnalysisPopperProps,
            isActiveMapAreaSelected: true,
            analysisList: [
                {
                    ...editAnalysisPopperProps.analysisList[0],
                    analysisInfo: {
                        ...editAnalysisPopperProps.analysisList[0].analysisInfo,
                        analysisType: 'proximity'
                    }
                }
            ]
        }
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(EditAnalysisPopper as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='editAnalysisSettingsPopper' {...promimityEditAnalysisPopperProps} />)
        expect((getByTestId('distanceLabel') as any).disabled).toEqual(true)
    })
})

describe('validate Result Section', function () {
    it('Result section should be collapsed by default', function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        expect((ref.current as any).state.isResultSettingsOpen).toBe(false)
    })

    it('Analysis icon should be unchecked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('displayAnalysisIcon') as any).checked).toEqual(false)
    })

    it('Approximate distance should be checked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('showDistFromInputLoc') as any).checked).toEqual(true)
    })

    it('Map symbols should be unchecked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('mapSymbols') as any).checked).toEqual(false)
    })

    it('Filter layers to only show results should be unchecked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('onlyShowResults') as any).checked).toEqual(false)
    })

    it('Display all layer results, regardless of visibility should be unchecked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('displayAllLayersResult') as any).checked).toEqual(false)
    })

    it('Enable proximity search should be unchecked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('enableProximitySearch') as any).checked).toEqual(false)
    })

    it('Save input location should be unchecked by default', async function () {
        const ref: { current: HTMLElement } = { current: null }
        const WidgetSettings = wrapWidget(AnalysisSetting as any, { theme: mockTheme, ref } as any)
        const { getByTestId } = render(<WidgetSettings widgetId='analysisSettings' {...analysisSettingProps} />)
        await waitFor(() => {
            (ref.current as any).onToggleResults()
        }, { timeout: 100 })
        expect((getByTestId('saveInputLocation') as any).checked).toEqual(false)
    })
})