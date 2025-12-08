import * as React from 'react'
import { withStoreThemeIntlRender } from 'jimu-for-test'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TableToolList from '../../src/runtime/components/table-tool-list'
import { type LayersConfig, TableArrangeType } from '../../src/config'

// Mock icons and jimu-ui components that are not essential for logic
jest.mock('jimu-icons/outlined/gis/filter-by-map', () => ({ FilterByMapOutlined: () => <span>FilterByMapOutlined</span> }))
jest.mock('jimu-icons/outlined/editor/menu', () => ({ MenuOutlined: () => <span>MenuOutlined</span> }))
jest.mock('jimu-icons/outlined/editor/show-selection', () => ({ ShowSelectionOutlined: () => <span>ShowSelectionOutlined</span> }))
jest.mock('jimu-icons/outlined/editor/clear-selection-general', () => ({ ClearSelectionGeneralOutlined: () => <span>ClearSelectionGeneralOutlined</span> }))
jest.mock('jimu-icons/outlined/editor/refresh', () => ({ RefreshOutlined: () => <span>RefreshOutlined</span> }))
jest.mock('jimu-icons/outlined/editor/trash', () => ({ TrashOutlined: () => <span>TrashOutlined</span> }))
jest.mock('jimu-icons/outlined/editor/list-visible', () => ({ ListVisibleOutlined: () => <span>ListVisibleOutlined</span> }))
jest.mock('jimu-icons/outlined/application/more-horizontal', () => ({ MoreHorizontalOutlined: () => <span>MoreHorizontalOutlined</span> }))
jest.mock('jimu-ui', () => {
  const actual = jest.requireActual('jimu-ui')
  return {
    ...actual,
    AdvancedSelect: (props: any) => <div data-testid="advanced-select">{props.title}</div>,
    Button: (props: any) => <button {...props}>{props.children}</button>,
    Dropdown: (props: any) => <div>{props.children}</div>,
    DropdownButton: (props: any) => <button {...props}>{props.children}</button>,
    DropdownMenu: (props: any) => <div>{props.children}</div>,
    DropdownItem: (props: any) => <div onClick={props.onClick}>{props.children}</div>,
    DataActionList: () => <div>DataActionList</div>
  }
})
jest.mock('../../src/runtime/components/utils', () => ({
  getTableColumnsFields: () => ({
    columnsAllFields: [{ value: 'field1', label: 'Field 1' }, { value: 'field2', label: 'Field 2' }],
    columnsVisibleFields: [{ value: 'field1', label: 'Field 1' }]
  })
}))
jest.mock('jimu-core', () => {
  const actual = jest.requireActual('jimu-core')
  return {
    ...actual,
    hooks: {
      ...actual.hooks,
      useTranslation: () => (key: string) => key
    }
  }
})

const render = withStoreThemeIntlRender()

const baseUsedState = {
  activeTabId: 'layer1',
  selectQueryFlag: false,
  tableShowColumns: [{ value: 'field1', label: 'Field 1' }],
  mobileFlag: false,
  emptyTable: false,
  tableLoaded: true,
  tableSelected: 2,
  allowDel: true,
  mapFilterEnabled: false,
  allLayersConfig: [
    { id: 'layer1', enableSearch: true, searchFields: ['field1'], enableSelect: true, enableRefresh: true, enableShowHideColumn: true } as LayersConfig
  ],
  columns: { toArray: () => [{ name: 'field1' }, { name: 'field2' }] },
  enableRelatedRecords: false,
  enableAttachments: false,
  setTableShowColumns: jest.fn()
}

const baseProps = {
  usedState: baseUsedState,
  curLayerConfig: {
    id: 'layer1',
    enableSearch: true,
    searchFields: ['field1'],
    enableSelect: true,
    enableRefresh: true,
    enableShowHideColumn: true
  } as LayersConfig,
  usedConfig: {
    enableRelatedRecords: false,
    enableAttachments: false,
    columnSetting: {
      responsiveType: "FIXED",
      columnWidth: 200,
      wrapText: false,
      textAlign: "start"
    },
    headerFontSetting: {
      backgroundColor: "",
      "fontSize": 14,
      "bold": false,
      "color": ""
    },
    enableSelect: true,
    selectMode: "SINGLE",
    showCount: true,
    enableRefresh: true,
    enableShowHideColumn: true
  },
  dataSource: {
    getLabel: () => 'Layer 1',
    dataViewId: 'main'
  } as any,
  dsSelection: [],
  isMapMode: false,
  arrangeType: TableArrangeType.Tabs,
  enableMapExtentFilter: false,
  widgetId: 'widget1',
  enableDataAction: false,
  getInitFields: () => [{ value: 'field1', label: 'Field 1' }],
  onShowSelection: jest.fn(),
  resetTable: jest.fn(),
  onTableRefresh: jest.fn(),
  onDeleteSelection: jest.fn(),
  onValueChangeFromRuntime: jest.fn(),
  toggleMapFilter: jest.fn()
}

describe('TableToolList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders button tool list in desktop mode', () => {
    render(<TableToolList {...baseProps} />)
    expect(screen.getByText('ShowSelectionOutlined')).toBeInTheDocument()
    expect(screen.getByText('ClearSelectionGeneralOutlined')).toBeInTheDocument()
    expect(screen.getByText('RefreshOutlined')).toBeInTheDocument()
    expect(screen.getByText('TrashOutlined')).toBeInTheDocument()
    // expect(screen.getByTestId('advanced-select')).toBeInTheDocument()
  })

  it('renders dropdown tool list in mobile mode', () => {
    const usedState = { ...baseUsedState, mobileFlag: true }
    render(<TableToolList {...baseProps} usedState={usedState} />)
    expect(screen.getByText('MoreHorizontalOutlined')).toBeInTheDocument()
    // expect(screen.getByTestId('advanced-select')).toBeInTheDocument()
  })

  it('calls onShowSelection when show selection button is clicked', () => {
    render(<TableToolList {...baseProps} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(baseProps.onShowSelection).toHaveBeenCalled()
  })

  it('calls resetTable when clear selection button is clicked', () => {
    render(<TableToolList {...baseProps} />)
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(baseProps.resetTable).toHaveBeenCalled()
  })

  it('calls onTableRefresh when refresh button is clicked', () => {
    render(<TableToolList {...baseProps} />)
    fireEvent.click(screen.getAllByRole('button')[2])
    expect(baseProps.onTableRefresh).toHaveBeenCalled()
  })

  it('calls onDeleteSelection when delete button is clicked', () => {
    render(<TableToolList {...baseProps} />)
    fireEvent.click(screen.getAllByRole('button')[3])
    expect(baseProps.onDeleteSelection).toHaveBeenCalled()
  })

  it('disables buttons when tableLoaded is false', () => {
    const usedState = { ...baseUsedState, tableLoaded: false }
    render(<TableToolList {...baseProps} usedState={usedState} />)
    screen.getAllByRole('button').forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })

  it('disables buttons when emptyTable is true', () => {
    const usedState = { ...baseUsedState, emptyTable: true }
    render(<TableToolList {...baseProps} usedState={usedState} />)
    screen.getAllByRole('button').forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })

  it('does not render delete button if allowDel is false', () => {
    const usedState = { ...baseUsedState, allowDel: false }
    render(<TableToolList {...baseProps} usedState={usedState} />)
    expect(screen.queryByText('TrashOutlined')).not.toBeInTheDocument()
  })

  it('does not render show/hide columns if enableShowHideColumn is false', () => {
    const curLayerConfig = { ...baseProps.curLayerConfig, enableShowHideColumn: false }
    render(<TableToolList {...baseProps} curLayerConfig={curLayerConfig} />)
    expect(screen.queryByTestId('advanced-select')).not.toBeInTheDocument()
  })

  it('renders map filter button when showMapFilter is true', () => {
    const props = {
      ...baseProps,
      isMapMode: true,
      enableMapExtentFilter: true
    }
    render(<TableToolList {...props} />)
    expect(screen.getByText('FilterByMapOutlined')).toBeInTheDocument()
  })
})