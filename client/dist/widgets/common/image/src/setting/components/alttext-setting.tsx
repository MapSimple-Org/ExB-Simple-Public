import { React, type IntlShape, type ImmutableArray, type Expression, type UseDataSource, Immutable } from 'jimu-core'
import { TextInput, Radio, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { ExpressionInput, ExpressionInputType } from 'jimu-ui/advanced/expression-builder'
import { ImgSourceType, DynamicUrlType } from '../../config'

interface Props {
  intl: IntlShape
  useDataSourcesEnabled: boolean
  useDataSources: ImmutableArray<UseDataSource>
  widgetId: string

  openAltTextPopup: () => void
  closeAltTextPopup: () => void
  altTextExpression: Expression
  onAltTextExpChange: (expression: Expression) => void
  isAltTextPopupOpen: boolean
  altTextConfigChange: () => void
  onAltTextTextInputChange: (altText: string) => void
  altTextText: string
  onAltTextWithAttachmentNameChange: (altTextWithAttachmentName: boolean) => void

  imgSourceType: ImgSourceType
  dynamicUrlType: DynamicUrlType
  altTextWithAttachmentName: boolean
}

const expressionInputTypes = Immutable([ExpressionInputType.Static, ExpressionInputType.Attribute, ExpressionInputType.Statistics, ExpressionInputType.Expression])

export default class AltTextSetting extends React.PureComponent<Props, unknown> {
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
                    style={{ cursor: 'pointer' }} onChange={() => { this.props.onAltTextWithAttachmentNameChange(false) }}
                    checked={!this.props.altTextWithAttachmentName}
                  />
                  <label
                    className='m-0 ml-2' style={{ cursor: 'pointer' }}
                    onClick={() => { this.props.onAltTextWithAttachmentNameChange(false) }}
                  >
                    {this.props.intl.formatMessage({ id: 'imageCustom', defaultMessage: defaultMessages.imageCustom })}
                  </label>
                </div>
              </SettingRow>
              {!this.props.altTextWithAttachmentName && <SettingRow>
                <div className='w-100 d-flex justify-content-end'>
                  <ExpressionInput
                    useDataSources={this.props.useDataSources} onChange={this.props.onAltTextExpChange} openExpPopup={this.props.openAltTextPopup}
                    expression={this.props.altTextExpression} isExpPopupOpen={this.props.isAltTextPopupOpen} closeExpPopup={this.props.closeAltTextPopup}
                    types={expressionInputTypes}
                    widgetId={this.props.widgetId}
                  />
                </div>
              </SettingRow>}
              <SettingRow>
                <div className='align-items-center d-flex'>
                  <Radio
                    style={{ cursor: 'pointer' }} onChange={() => { this.props.onAltTextWithAttachmentNameChange(true) }}
                    checked={!!this.props.altTextWithAttachmentName}
                  />
                  <label
                    className='m-0 ml-2' style={{ cursor: 'pointer' }}
                    onClick={() => { this.props.onAltTextWithAttachmentNameChange(true) }}
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
                useDataSources={this.props.useDataSources} onChange={this.props.onAltTextExpChange} openExpPopup={this.props.openAltTextPopup}
                expression={this.props.altTextExpression} isExpPopupOpen={this.props.isAltTextPopupOpen} closeExpPopup={this.props.closeAltTextPopup}
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
              useDataSources={this.props.useDataSources} onChange={this.props.onAltTextExpChange} openExpPopup={this.props.openAltTextPopup}
              expression={this.props.altTextExpression} isExpPopupOpen={this.props.isAltTextPopupOpen} closeExpPopup={this.props.closeAltTextPopup}
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
            size='sm' style={{ width: '100%' }} className='float-right' value={this.props.altTextText}
            onChange={(event) => { this.props.onAltTextTextInputChange(event.target.value) }}
            onBlur={() => { this.props.altTextConfigChange() }}
            onPressEnter={() => { this.props.altTextConfigChange() }}
            aria-label={label}
          />
        </div>
      )
    }
  }

  render () {
    const label = this.props.intl.formatMessage({ id: 'altText', defaultMessage: jimuUIMessages.altText })
    return (
      <SettingRow flow='wrap' label={label}>
        {this.getRenderContent(label)}
      </SettingRow>
    )
  }
}
