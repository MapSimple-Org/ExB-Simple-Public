/** @jsx jsx */
import {
  React,
  jsx,
  type IMSqlExpression,
  type DataSource,
  type IMThemeVariables,
  polished,
  css,
  AppMode,
  focusElementInKeyboardMode
} from 'jimu-core'
import { Button, type FlipOptions, Popper, Badge } from 'jimu-ui'
import { SqlExpressionRuntime } from 'jimu-ui/basic/sql-expression-runtime'
import { Fragment } from 'react'
import { WidgetFilterOutlined } from 'jimu-icons/outlined/brand/widget-filter'
import { ResetOutlined } from 'jimu-icons/outlined/editor/reset'
interface Props {
  appMode: AppMode
  filter: IMSqlExpression
  filterInConfig: IMSqlExpression
  selectedDs: DataSource
  widgetId: string
  title: string
  applied: boolean
  handleFilterChange: (sqlExprObj: IMSqlExpression) => void
  handleFilterApplyChange: (apply: boolean) => void
  formatMessage: (id: string, values?: { [key: string]: any }) => string
  theme: IMThemeVariables
}

interface Stats {
  isOpen: boolean
  currentFilter: IMSqlExpression
}

const flipOptions: FlipOptions = {
  boundary: document.body,
  fallbackPlacements: ['bottom-start', 'right-end', 'top-start', 'left-start']
}

export default class FilterPicker extends React.PureComponent<Props, Stats> {
  toggleRef: React.RefObject<HTMLButtonElement>

  constructor (props) {
    super(props)

    this.toggleRef = React.createRef()
    this.state = {
      isOpen: false,
      currentFilter: props.filter
    }
  }

  componentDidUpdate (preProps: Props) {
    const { filter, appMode } = this.props
    if (filter !== preProps.filter) {
      this.setState({
        currentFilter: filter
      })
    }
    if (appMode !== preProps.appMode) {
      if (appMode === AppMode.Design) {
        this.setState({
          isOpen: false
        })
      }
    }
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    return this.props.formatMessage(id, values)
  }

  onPopperToggle = evt => {
    const { filter } = this.props
    const { isOpen } = this.state
    if (!isOpen) {
      // will open
      this.setState({
        currentFilter: filter
      })
    }
    this.setState({ isOpen: !isOpen })
    if (isOpen) {
      focusElementInKeyboardMode(this.toggleRef.current)
    }
  }

  onItemClick = (evt, item) => {
    this.closePopper()
    evt.stopPropagation()
    evt.nativeEvent.stopImmediatePropagation()
  }

  handleFilterChange = (sqlExprObj: IMSqlExpression) => {
    this.setState({
      currentFilter: sqlExprObj
    })
  }

  handleApplyClick = evt => {
    const { currentFilter } = this.state
    const { handleFilterApplyChange, handleFilterChange } = this.props
    handleFilterChange(currentFilter)
    handleFilterApplyChange(true)
    this.closePopper()
  }

  closePopper = () => {
    this.setState({
      isOpen: false
    })
    focusElementInKeyboardMode(this.toggleRef.current)
  }

  handleResetClick = evt => {
    const { handleFilterApplyChange, handleFilterChange } = this.props
    handleFilterApplyChange(false)
    handleFilterChange(this.props.filterInConfig)
    this.setState({
      currentFilter: this.props.filterInConfig
    })
  }

  handleClearClick = evt => {
    const { handleFilterApplyChange } = this.props
    handleFilterApplyChange(false)
    this.closePopper()
  }

  getPopperStyle = () => {
    return css`
      & .popper-box{
        max-height: ${document.documentElement.clientHeight}px;
        overflow: auto;
      }
      .filter-button-con  {
        & {
          text-align: right;
        }
        button {
          max-width: ${polished.rem(92)};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        button svg {
          margin-right: 0 !important;
        }
        .reset-button {
          padding-left: ${polished.rem(5)};
          padding-right: ${polished.rem(5)};
        }
      }
      .clear-button, .reset-button {
        margin-left: ${polished.rem(8)};
      }
    `
  }

  render () {
    const { filter, selectedDs, widgetId, title, applied } = this.props
    const { isOpen, currentFilter } = this.state
    const isHadApply = applied && filter?.sql === currentFilter?.sql
    return (
      <Fragment>
        <Badge dot={applied} color='primary' offset={[2, 2]}>
          <Button
            size='sm'
            type='tertiary'
            icon
            title={title}
            aria-label={title}
            ref={this.toggleRef}
            onClick={this.onPopperToggle}
            aria-haspopup='dialog'
            aria-expanded={isOpen}
            className='color-inherit'
          >
            <WidgetFilterOutlined size={16}/>
          </Button>
        </Badge>
        <Popper
          placement='bottom-start'
          reference={this.toggleRef.current}
          offsetOptions={5}
          toggle={this.onPopperToggle}
          css={this.getPopperStyle()}
          open={isOpen}
          flipOptions={flipOptions}
          hideOptions={false}
        >
          <div style={{ padding: polished.rem(20), width: polished.rem(250) }}>
            <div>
              <SqlExpressionRuntime
                widgetId={widgetId}
                dataSource={selectedDs}
                expression={currentFilter}
                onChange={this.handleFilterChange}
              />
            </div>
            <div className='w-100 mt-4 filter-button-con'>
              <Button
                disabled={isHadApply}
                onClick={this.handleApplyClick}
                type='primary'
                title={this.formatMessage('apply')}
                size='sm'
              >
                {this.formatMessage('apply')}
              </Button>
              <Button
                disabled={!applied}
                onClick={this.handleClearClick}
                title={this.formatMessage('commonModalCancel')}
                className="clear-button"
                size='sm'
              >
                {this.formatMessage('commonModalCancel')}
              </Button>
              <Button
                onClick={this.handleResetClick}
                title={this.formatMessage('resetFilters')}
                className="reset-button"
                size='sm'
              >
                <ResetOutlined size='s'/>
              </Button>
            </div>
          </div>
        </Popper>
      </Fragment>
    )
  }
}
