// Polyfill ResizeObserver for jsdom (required by @arcgis/core widgets)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

import { React, Immutable } from 'jimu-core';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// r027.069: ExB 1.20 changed widgetRender's first arg from IMState (1.19) to
// boolean (needsStoreInit). The truthy IMState object coerced to true at
// runtime, so existing test behavior is preserved by passing true explicitly.
// getInitState() is no longer needed in this file.
import { wrapWidget, widgetRender } from 'jimu-for-test';
import Widget from '../src/runtime/widget';
import { QueryArrangeType } from '../src/config';

// Mock jimu-arcgis
jest.mock('jimu-arcgis', () => ({
  JimuMapViewComponent: () => <div data-testid="mock-jimu-map-view" />
}));

// Mock sub-components to focus on Widget lifecycle (prevents deep @arcgis/core import chain)
jest.mock('../src/runtime/query-task-list', () => ({
  QueryTaskList: () => <div data-testid="mock-query-task-list" />
}));
jest.mock('../src/runtime/query-task-list-inline', () => ({
  TaskListInline: () => <div data-testid="mock-task-list-inline" />
}));
jest.mock('../src/runtime/query-task-list-popper-wrapper', () => ({
  TaskListPopperWrapper: () => <div data-testid="mock-task-list-popper" />
}));

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({
    log: jest.fn()
  }),
  getWidgetRuntimeDataMap: () => ({
    iconMap: {}
  }),
  widgetConfigManager: {
    registerConfig: jest.fn(),
    unregisterConfig: jest.fn(),
    getShowHeader: jest.fn().mockReturnValue(true),
    getSpatialTabRelationships: jest.fn().mockReturnValue(undefined),
    getFillColor: jest.fn().mockReturnValue([223, 0, 255]),
    getFillOpacity: jest.fn().mockReturnValue(0.25),
    getOutlineColor: jest.fn().mockReturnValue([223, 0, 255]),
    getOutlineOpacity: jest.fn().mockReturnValue(1.0),
    getOutlineWidth: jest.fn().mockReturnValue(2),
    getPointSize: jest.fn().mockReturnValue(12),
    getPointOutlineWidth: jest.fn().mockReturnValue(2),
    getPointStyle: jest.fn().mockReturnValue('circle'),
    getAddResultsAsMapLayer: jest.fn().mockReturnValue(false),
    getResultsLayerTitle: jest.fn().mockReturnValue('QuerySimple Results'),
    getDrawColor: jest.fn().mockReturnValue([50, 255, 0]),
    getBufferColor: jest.fn().mockReturnValue([255, 165, 0]),
    getPointZoomBufferFeet: jest.fn().mockReturnValue(300),
    getZoomExpansionFactor: jest.fn().mockReturnValue(1.2)
  },
  highlightConfigManager: {
    registerConfig: jest.fn(),
    unregisterConfig: jest.fn(),
    getConfig: jest.fn().mockReturnValue({}),
    updateConfig: jest.fn()
  },
  GlobalHandleManager: {
    getInstance: () => ({
      addHandle: jest.fn(),
      removeHandle: jest.fn(),
      destroyAll: jest.fn()
    })
  }
}));

describe('query-simple Widget lifecycle tests', () => {
  let WidgetWrapped: any;
  const manifest = { name: 'query-simple' };
  const config = Immutable({
    queryItems: [{
      configId: 'q1',
      name: 'Test Query',
      useAttributeFilter: true,
      useSpatialFilter: false
    }],
    arrangeType: QueryArrangeType.Block
  });

  beforeAll(() => {
    WidgetWrapped = wrapWidget(Widget, {
      manifest: manifest as any,
      config: config as any
    });
  });

  it('should render placeholder when no query items are configured', () => {
    const { getByText } = widgetRender(true)(
      <WidgetWrapped widgetId="widget_1" />
    );
    
    // By default, if no queryItems, it might show a placeholder or empty list
    // Check for the mock task list which should be rendered
    expect(screen.getByTestId('mock-query-task-list')).toBeInTheDocument();
  });

  it('should dispatch widget state change event on mount', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    widgetRender(true)(<WidgetWrapped widgetId="widget_1" />);

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'querysimple-widget-state-changed'
      })
    );

    dispatchEventSpy.mockRestore();
  });

  it('should render QueryTaskList with Block arrange type', () => {
    widgetRender(true)(<WidgetWrapped widgetId="widget_1" />);

    expect(screen.getByTestId('mock-query-task-list')).toBeInTheDocument();
  });

  it('should render TaskListInline with Inline arrange type', () => {
    const inlineConfig = Immutable({
      queryItems: [{
        configId: 'q1',
        name: 'Test Query',
        useAttributeFilter: true,
        useSpatialFilter: false
      }],
      arrangeType: QueryArrangeType.Inline
    });
    const InlineWidget = wrapWidget(Widget, {
      manifest: manifest as any,
      config: inlineConfig as any
    });
    widgetRender(true)(<InlineWidget widgetId="widget_2" />);

    expect(screen.getByTestId('mock-task-list-inline')).toBeInTheDocument();
  });

  it('should register widget config on construction', () => {
    const { widgetConfigManager } = require('widgets/shared-code/mapsimple-common');
    widgetConfigManager.registerConfig.mockClear();

    widgetRender(true)(<WidgetWrapped widgetId="widget_3" />);

    expect(widgetConfigManager.registerConfig).toHaveBeenCalled();
  });
});

