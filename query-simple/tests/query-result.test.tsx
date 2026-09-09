import { React, Immutable } from 'jimu-core';
import { render, act } from '@testing-library/react';
import { QueryTaskResult } from '../src/runtime/query-result';
import '@testing-library/jest-dom';

// Mock jimu-core
jest.mock('jimu-core', () => {
  const actualReact = require('react');
  return {
    React: actualReact,
    jsx: (type: any, props: any, ...children: any[]) => actualReact.createElement(type, props, ...children),
    css: () => '',
    Immutable: (val: any) => val,
    hooks: {
      useTranslation: () => (id: string) => id,
      useEffectOnce: (cb: any) => cb()
    },
    useIntl: () => ({ formatMessage: ({ id }: any) => id }),
    DataSourceComponent: () => actualReact.createElement('div'),
    focusElementInKeyboardMode: jest.fn(),
    CONSTANTS: { SELECTION_DATA_VIEW_ID: 'selection' },
    ExBAddedJSAPIProperties: {
      EXB_JIMU_LAYER_VIEW_ID: '__exb_jimu_layer_view_id',
      EXB_PREDEFINED_RENDERER: '__exb_predefined_renderer',
      EXB_LAYER_REMOVED_BEFORE: '__exb_layer_removed_before',
      EXB_LAYER_CREATED_BY_DATA_SOURCE: '__exb_layer_created_by_data_source'
    },
    getAppStore: () => ({
      getState: () => ({
        appConfig: { widgets: {} }
      })
    }),
    DataLevel: { DataSource: 'DataSource' },
    // r026.010: Enum stubs — compiled bundle accesses these via property lookup
    JSAPILayerTypes: new Proxy({}, { get: (_t, p) => String(p) }),
    SupportedLayerServiceTypes: new Proxy({}, { get: (_t, p) => String(p) }),
    DataSourceTypes: new Proxy({}, { get: (_t, p) => String(p) }),
    DataSourceStatus: new Proxy({}, { get: (_t, p) => String(p) }),
    JimuMapViewStatus: new Proxy({}, { get: (_t, p) => String(p) }),
    DataSourceSelectionMode: new Proxy({}, { get: (_t, p) => String(p) }),
    AppMode: new Proxy({}, { get: (_t, p) => String(p) }),
    WidgetState: new Proxy({}, { get: (_t, p) => String(p) }),
    MessageManager: { getInstance: () => ({ publishMessage: jest.fn() }) },
    DataSourceManager: {
      getInstance: () => ({
        getDataSource: jest.fn()
      })
    },
    ReactRedux: {
      useSelector: (selector: any) => selector({
        appConfig: {
          widgets: {
            w1: {
              config: {
                resultsMode: 'NewSelection'
              }
            }
          }
        }
      }),
      useDispatch: () => jest.fn()
    }
  };
});

// Mock jimu-icons
jest.mock('jimu-icons/outlined/directional/arrow-left', () => ({ ArrowLeftOutlined: () => <div /> }));
jest.mock('jimu-icons/outlined/directional/expand-all', () => ({ ExpandAllOutlined: () => <div /> }));
jest.mock('jimu-icons/outlined/directional/collapse-all', () => ({ CollapseAllOutlined: () => <div /> }));

// Mock jimu-ui
jest.mock('jimu-ui', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Icon: () => <div />,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  DataActionList: () => <div />,
  DataActionListStyle: { Dropdown: 'Dropdown' }
}));

// Mock sub-components
jest.mock('../src/runtime/simple-list', () => ({
  SimpleList: ({ expandByDefault }: any) => (
    <div data-testid="simple-list" data-expanded={String(expandByDefault)}>
      SimpleList
    </div>
  )
}));

// Mock selection utils
jest.mock('../src/runtime/selection-utils', () => ({
  selectRecordsInDataSources: jest.fn(),
  clearSelectionInDataSources: jest.fn(),
  selectRecordsAndPublish: jest.fn(),
  publishSelectionMessage: jest.fn(),
  dispatchSelectionEvent: jest.fn()
}));

// Mock results management utils
jest.mock('../src/runtime/results-management-utils', () => ({
  removeResultsFromAccumulated: jest.fn(),
  removeRecordsFromOriginSelections: jest.fn()
}));

// Mock graphics layer utils
jest.mock('../src/runtime/graphics-layer-utils', () => ({
  removeHighlightGraphics: jest.fn()
}));

// Mock hooks that pull in @arcgis/core
jest.mock('../src/runtime/managers/use-zoom-to-records', () => ({
  useZoomToRecords: () => jest.fn(),
  usePanToRecords: () => jest.fn()
}));

// Mock jimu-arcgis to avoid SystemJS import chain
jest.mock('jimu-arcgis', () => ({}));

// Mock results-menu to avoid deep import chain issues
jest.mock('../src/runtime/results-menu', () => ({
  ResultsMenu: () => <div data-testid="mock-results-menu" />
}));

// Mock data actions
jest.mock('../src/data-actions', () => ({
  getExtraActions: jest.fn().mockReturnValue([])
}));

// Mock widget config
jest.mock('../src/runtime/widget-config', () => ({
  getWidgetRuntimeDataMap: () => ({ iconMap: {} })
}));

// Mock default query item
jest.mock('../src/default-query-item', () => ({
  DEFAULT_QUERY_ITEM: {}
}));

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({ log: jest.fn() }),
  getWidgetRuntimeDataMap: () => ({ iconMap: {} }),
  ErrorMessage: () => <div />,
  applyMobilePopupBehavior: jest.fn(),
  getPopupCollapsedOption: jest.fn().mockReturnValue(false),
  widgetConfigManager: {
    getResultPagingStyle: jest.fn().mockReturnValue('Simple'),
    getResultListDirection: jest.fn().mockReturnValue('Vertical'),
    getFlashOnMapIdentify: jest.fn().mockReturnValue(true),
    getMobilePopupCollapsed: jest.fn().mockReturnValue(false),
    getMobilePopupDockPosition: jest.fn().mockReturnValue(''),
    getMobilePopupHideDockButton: jest.fn().mockReturnValue(false),
    getMobilePopupHideActionBar: jest.fn().mockReturnValue(false),
    getZoomOnResultClick: jest.fn().mockReturnValue(false),
    getPanOnResultClick: jest.fn().mockReturnValue(false)
  }
}));

// Mock jimu-theme
jest.mock('jimu-theme', () => ({
  withTheme: (Component: any) => (props: any) => <Component {...props} theme={{}} />
}));

describe('QueryTaskResult Bug Regression: Sticky Expansion', () => {
  const mockOutputDS: any = {
    id: 'ds1',
    getLabel: () => 'DS1',
    getOriginDataSources: () => [{ 
      id: 'origin1',
      getSelectedRecordIds: () => [],
      getSelectedRecords: () => []
    }],
    getSelectedRecords: () => [],
    getSelectedRecordIds: () => [],
    getStatus: () => 'LOADED',
    getCountStatus: () => 'LOADED'
  };

  const queryA = Immutable({
    configId: 'queryA',
    resultExpandByDefault: true,
    resultFieldsType: 'SelectAttributes'
  });

  const queryB = Immutable({
    configId: 'queryB',
    resultExpandByDefault: false,
    resultFieldsType: 'SelectAttributes'
  });

  it('should reset expandAll state when queryItem.configId changes', async () => {
    const { rerender, getByTestId } = render(
      <QueryTaskResult
        widgetId="w1"
        resultCount={10}
        maxPerPage={10}
        queryParams={{}}
        outputDS={mockOutputDS}
        queryItem={queryA as any}
        records={[]}
        onNavBack={() => {}}
      />
    );

    // Initial state: QueryA is expanded by default
    expect(getByTestId('simple-list')).toHaveAttribute('data-expanded', 'true');

    // Rerender with QueryB: should NOT be expanded by default
    await act(async () => {
      rerender(
        <QueryTaskResult
          widgetId="w1"
          resultCount={10}
          maxPerPage={10}
          queryParams={{}}
          outputDS={mockOutputDS}
          queryItem={queryB as any}
          records={[]}
          onNavBack={() => {}}
        />
      );
    });

    // Verification: expandAll state was reset by the useEffect
    expect(getByTestId('simple-list')).toHaveAttribute('data-expanded', 'false');
  });
});

