import { React, type IntlShape, type ImmutableArray, type Expression, type UseDataSource, Immutable } from 'jimu-core'
import { TextInput, Radio, defaultMessages as jimuUiMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { ExpressionInput, ExpressionInputType } from 'jimu-ui/advanced/expression-builder'
import { ImgSourceType, DynamicUrlType } from '../../config'

interface Props {
  intl: IntlShape
  useDataSourcesEnabled: boolean
  useDataSources: ImmutableArray<UseDataSource>
  widgetId: string

  openToolTipPopup: () => void
  closeToolTipPopup: () => void
  toolTipExpression: Expression
  onToolTipExpChange: (expression: Expression) => void
  isToolTipPopupOpen: boolean
  toolTipConfigChange: () => void
  onToolTipTextInputChange: (toolTip: string) => void
  toolTipText: string
  onToolTipWithAttachmentNameChange: (toolTipWithAttachmentName: boolean) => void

  imgSourceType: ImgSourceType
  dynamicUrlType: DynamicUrlType
  toolTipWithAttachmentName: boolean
}

const expressionInputTypes = Immutable([ExpressionInputType.Static, ExpressionInputType.Attribute, ExpressionInputType.Statistics, ExpressionInputType.Expression])
export default class ToolTipSetting extends React.PureComponent<Props, unknown> {
  getRenderContent = (label: string) => {
    if (this.props.useDataSourcesEnabled) {
      if (this.props.imgSourceType === ImgSourceType.ByDynamicUrl && (this.props.dynamicUrlType === DynamicUrlType.Attachment ||
        this.props.dynamicUrlType === DynamicUrlType.Symbol)) {
        if (this.props.dynamicUrlType === DynamicUrlType.Attachment) {
          return (
            <div className='w-100'>
              <SettingRow flow='wrap'>
                <div className='align-items-center d-flex'>
                  <Radio
                    style={{ cursor: 'pointer' }} onChange={() => { this.props.onToolTipWithAttachmentNameChange(false) }}
                    checked={!this.props.toolTipWithAttachmentName}
                  />
                  <label
                    className='m-0 ml-2' style={{ cursor: 'pointer' }}
                    onClick={() => { this.props.onToolTipWithAttachmentNameChange(false) }}
                  >
                    {this.props.intl.formatMessage({ id: 'imageCustom', defaultMessage: defaultMessages.imageCustom })}
                  </label>
                </div>
              </SettingRow>
              {!this.props.toolTipWithAttachmentName && <SettingRow>
                <div className='w-100 d-flex justify-content-end'>
                  <ExpressionInput
                    useDataSources={this.props.useDataSources} onChange={this.props.onToolTipExpChange} openExpPopup={this.props.openToolTipPopup}
                    expression={this.props.toolTipExpression} isExpPopupOpen={this.props.isToolTipPopupOpen} closeExpPopup={this.props.closeToolTipPopup}
                    types={expressionInputTypes}
                    widgetId={this.props.widgetId}
                  />
                </div>
              </SettingRow>}
              <SettingRow>
                <div className='align-items-center d-flex'>
                  <Radio
                    style={{ cursor: 'pointer' }} onChange={() => { this.props.onToolTipWithAttachmentNameChange(true) }}
                    checked={!!this.props.toolTipWithAttachmentName}
                  />
                  <label
                    className='m-0 ml-2' style={{ cursor: 'pointer' }}
                    onClick={() => { this.props.onToolTipWithAttachmentNameChange(true) }}
                  >
                    {this.props.intl.formatMessage({ id: 'imageAttachmentName', defaultMessage: defaultMessages.imageAttachmentName })}
                  </label>
                </div>
              </SettingRow>
            </div>
          )
        }

        if (this.props.dynamicUrlType === DynamicUrlType.Symbol) {
          return (
            <div style={{ width: '100%', position: 'relative' }} role='group' aria-label={label}>
              <ExpressionInput
                useDataSources={this.props.useDataSources} onChange={this.props.onToolTipExpChange} openExpPopup={this.props.openToolTipPopup}
                expression={this.props.toolTipExpression} isExpPopupOpen={this.props.isToolTipPopupOpen} closeExpPopup={this.props.closeToolTipPopup}
                types={expressionInputTypes}
                widgetId={this.props.widgetId}
              />
            </div>
          )
        }
      } else {
        return (
          <div style={{ width: '100%', position: 'relative' }} role='group' aria-label={label}>
            <ExpressionInput
              useDataSources={this.props.useDataSources} onChange={this.props.onToolTipExpChange} openExpPopup={this.props.openToolTipPopup}
              expression={this.props.toolTipExpression} isExpPopupOpen={this.props.isToolTipPopupOpen} closeExpPopup={this.props.closeToolTipPopup}
              types={expressionInputTypes}
              widgetId={this.props.widgetId}
            />
          </div>
        )
      }
    } else {
      return (
        <div style={{ width: '100%', position: 'relative' }}>
          <TextInput
            size='sm' style={{ width: '100%' }} className='float-right' value={this.props.toolTipText}
            onChange={(event) => { this.props.onToolTipTextInputChange(event.target.value) }}
            onBlur={() => { this.props.toolTipConfigChange() }}
            onPressEnter={() => { this.props.toolTipConfigChange() }}
            aria-label={label}
          />
        </div>
      )
    }
  }

  render () {
    const label = this.props.intl.formatMessage({ id: 'toolTip', defaultMessage: jimuUiMessages.tooltip })
    return (
      <SettingRow flow='wrap' label={label}>
        {this.getRenderContent(label)}
      </SettingRow>
    )
  }
}
