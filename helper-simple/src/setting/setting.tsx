/** @jsx jsx */
import {
  React,
  jsx
} from 'jimu-core'
import {
  type AllWidgetSettingProps,
  type SettingChangeFunction,
  getAppConfigAction
} from 'jimu-for-builder'
import { Select, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { type IMConfig } from '../config'
import defaultMessages from './translations/default'

const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)

interface WidgetOption {
  id: string
  label: string
  shortIds: string[]
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>> {
  getI18nMessage = (id: string) => {
    return this.props.intl.formatMessage({ id, defaultMessage: messages[id] })
  }

  onSettingChange: SettingChangeFunction = (key, value) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(key, value)
    })
  }

  /**
   * Scans app config for widgets that have queryItems with shortIds
   */
  getWidgetsWithShortIds = (): WidgetOption[] => {
    const appConfig = getAppConfigAction().appConfig
    const widgets: WidgetOption[] = []

    if (!appConfig?.widgets) {
      return widgets
    }

    Object.keys(appConfig.widgets).forEach(widgetId => {
      const widget = appConfig.widgets[widgetId]
      
      // Check if widget has queryItems with shortIds
      if (widget.config?.queryItems) {
        const queryItems = widget.config.queryItems
        const shortIds: string[] = []
        
        queryItems.forEach((item: any) => {
          if (item.shortId && item.shortId.trim() !== '') {
            shortIds.push(item.shortId)
          }
        })
        
        if (shortIds.length > 0) {
          widgets.push({
            id: widgetId,
            label: widget.label || widgetId,
            shortIds
          })
        }
      }
    })

    return widgets
  }

  render() {
    const { config } = this.props
    const availableWidgets = this.getWidgetsWithShortIds()

    return (
      <div className='jimu-widget-setting setting-helper-simple__setting-content h-100'>
        <SettingSection title={this.getI18nMessage('managedWidget')}>
          <SettingRow flow='wrap' label="">
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--sys-color-text-primary)',
              marginBottom: '12px',
              lineHeight: '1.5'
            }}>
              {this.getI18nMessage('widgetDescription')}
            </div>
          </SettingRow>
          <SettingRow flow='wrap' label={this.getI18nMessage('selectWidget')}>
            <Select
              size='sm'
              className='w-100'
              value={config.managedWidgetId || ''}
              onChange={(e) => {
                const value = e.target.value || undefined
                this.onSettingChange('managedWidgetId', value)
              }}
            >
              <option value="">{this.getI18nMessage('selectWidget')}</option>
              {availableWidgets.map(widget => (
                <option key={widget.id} value={widget.id}>
                  {widget.label} ({widget.shortIds.join(', ')})
                </option>
              ))}
            </Select>
          </SettingRow>
          {availableWidgets.length === 0 && (
            <div className='text-muted mt-2' style={{ fontSize: '0.875rem' }}>
              {this.getI18nMessage('noWidgetsAvailable')}
            </div>
          )}
        </SettingSection>
      </div>
    )
  }
}
