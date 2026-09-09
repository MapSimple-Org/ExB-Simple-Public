import { React, Immutable } from 'jimu-core';
import { render, screen } from '@testing-library/react';
import { DataSourceTip } from '../data-source-tip';
import '@testing-library/jest-dom';

// Mock jimu-core hooks and components
jest.mock('jimu-core', () => {
  const actual = jest.requireActual('jimu-core');
  return {
    ...actual,
    hooks: {
      ...actual.hooks,
      useTranslation: () => (id: string) => id // Simple mock translation
    },
    DataSourceComponent: (props: any) => {
      // Simulate calling info change if mock data provided
      return <div data-testid="mock-ds-component" />;
    },
    getAppStore: () => ({
      getState: () => ({
        appConfig: {
          widgets: {}
        }
      })
    })
  };
});

// Mock local hooks
jest.mock('../use-ds-exists', () => ({
  useDataSourceExists: jest.fn().mockReturnValue(true)
}));

// Mock jimu-ui
jest.mock('jimu-ui', () => ({
  Icon: () => <div data-testid="mock-icon" />,
  Tooltip: ({ children, title }: any) => <div data-testid="mock-tooltip" title={title}>{children}</div>,
  Button: ({ children }: any) => <button>{children}</button>,
  defaultMessages: {}
}));

describe('shared-code/common/DataSourceTip unit tests', () => {
  const mockUseDataSource: any = Immutable({
    dataSourceId: 'ds1',
    mainDataSourceId: 'ds1'
  });

  it('should render DataSourceComponent when data source exists', () => {
    render(
      <DataSourceTip 
        widgetId="w1" 
        useDataSource={mockUseDataSource} 
      />
    );
    expect(screen.getByTestId('mock-ds-component')).toBeInTheDocument();
  });

  it('should show error icon when dsExists is false', () => {
    const { useDataSourceExists } = require('../use-ds-exists');
    useDataSourceExists.mockReturnValue(false);

    render(
      <DataSourceTip 
        widgetId="w1" 
        useDataSource={mockUseDataSource} 
      />
    );
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('title', 'dataSourceCreateError');
  });

  it('should show message when showMessage is true', () => {
    const { useDataSourceExists } = require('../use-ds-exists');
    useDataSourceExists.mockReturnValue(false);

    const { container } = render(
      <DataSourceTip 
        widgetId="w1" 
        useDataSource={mockUseDataSource} 
        showMessage={true}
      />
    );
    
    const messageDiv = container.querySelector('.status-message');
    expect(messageDiv).toBeInTheDocument();
    expect(messageDiv?.textContent).toBe('dataSourceCreateError');
  });
});

