/** @jsx jsx */
import { React, jsx, type AllWidgetProps } from 'jimu-core'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig, QueryArrangeType } from '../config'
import defaultMessages from './translations/default'
import { getWidgetRuntimeDataMap } from './widget-config'

import { versionManager } from '../version-manager'
import { QueryTaskList } from './query-task-list'
import { TaskListInline } from './query-task-list-inline'
import { TaskListPopperWrapper } from './query-task-list-popper-wrapper'
import { QueryWidgetContext } from './widget-context'

const { iconMap } = getWidgetRuntimeDataMap()

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>> {
  static versionManager = versionManager

  render () {
    const { config, id, icon, label, layoutId, layoutItemId, controllerWidgetId } = this.props
    const widgetLabel = this.props.intl.formatMessage({
      id: '_widgetLabel',
      defaultMessage: defaultMessages._widgetLabel
    })
    if (!config.queryItems?.length) {
      return <WidgetPlaceholder icon={iconMap.iconQuery} widgetId={this.props.id} name={widgetLabel} />
    }

    if (config.arrangeType === QueryArrangeType.Popper && !controllerWidgetId) {
      return (
        <QueryWidgetContext.Provider value={`${layoutId}:${layoutItemId}`}>
          <TaskListPopperWrapper
            id={0}
            icon={icon}
            popperTitle={label}
            minSize={config.sizeMap?.arrangementIconPopper?.minSize}
            defaultSize={config.sizeMap?.arrangementIconPopper?.defaultSize}
          >
            <QueryTaskList widgetId={id} isInPopper queryItems={config.queryItems} defaultPageSize={config.defaultPageSize} className='pb-4' />
          </TaskListPopperWrapper>
        </QueryWidgetContext.Provider>
      )
    }

    if (config.arrangeType === QueryArrangeType.Inline && !controllerWidgetId) {
      return (
        <QueryWidgetContext.Provider value={`${layoutId}:${layoutItemId}`}>
          <TaskListInline
            widgetId={id}
            widgetLabel={label}
            wrap={config.arrangeWrap}
            queryItems={config.queryItems}
            minSize={config.sizeMap?.arrangementIconPopper?.minSize}
            defaultSize={config.sizeMap?.arrangementIconPopper?.defaultSize}
            defaultPageSize={config.defaultPageSize}
          />
        </QueryWidgetContext.Provider>
      )
    }

    return (
      <Paper variant='flat' className='jimu-widget runtime-query pb-4'>
        <QueryWidgetContext.Provider value={`${layoutId}:${layoutItemId}`}>
          <QueryTaskList widgetId={id} queryItems={config.queryItems} defaultPageSize={config.defaultPageSize}/>
        </QueryWidgetContext.Provider>
      </Paper>
    )
  }
}
