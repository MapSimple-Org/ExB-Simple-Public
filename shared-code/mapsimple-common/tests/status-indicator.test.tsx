import { React } from 'jimu-core';
import { render, screen } from '@testing-library/react';
import { StatusIndicator, EntityStatusType } from '../common-components';
import '@testing-library/jest-dom';

// Mock jimu-core to handle css and jsx
jest.mock('jimu-core', () => {
  const actual = jest.requireActual('jimu-core');
  return {
    ...actual,
    css: () => '',
    jsx: (type: any, props: any, ...children: any[]) => React.createElement(type, props, ...children)
  };
});

// Mock withTheme to provide a basic theme object
jest.mock('jimu-theme', () => ({
  withTheme: (Component: any) => (props: any) => (
    <Component 
      {...props} 
      theme={{ 
        ref: { palette: { neutral: { 500: '#ccc' } } }, 
        sys: { color: { primary: { main: '#000' } } } 
      }} 
    />
  )
}));

// Mock jimu-ui
jest.mock('jimu-ui', () => ({
  Button: () => <div />,
  Modal: () => <div />,
  ModalBody: () => <div />,
  ModalFooter: () => <div />,
  PanelHeader: () => <div />,
  Icon: () => <div />,
  Tooltip: ({ children }: any) => <div>{children}</div>
}));

describe('shared-code/common/StatusIndicator unit tests', () => {
  it('should render nothing if statusType is not provided', () => {
    const { container } = render(<StatusIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render div with correct classes for loading status', () => {
    const { container } = render(
      <StatusIndicator statusType={EntityStatusType.Loading} title="Loading..." />
    );
    
    const indicator = container.querySelector('.ui-unit-status-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('ui-unit-status-indicator_status-type-loading');
    expect(indicator).toHaveAttribute('title', 'Loading...');
  });

  it('should render div with correct classes for error status', () => {
    const { container } = render(
      <StatusIndicator statusType={EntityStatusType.Error} title="Error!" />
    );
    
    const indicator = container.querySelector('.ui-unit-status-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('ui-unit-status-indicator_status-type-error');
    expect(indicator).toHaveAttribute('title', 'Error!');
  });
});

