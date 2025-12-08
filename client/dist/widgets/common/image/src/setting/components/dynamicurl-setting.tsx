import {
  React, type Expression, type UseDataSource, Immutable, type IMUseDataSource,
  DataSourceComponent, type DataSource, type FeatureLayerDataSource, type IntlShape,
  classNames
} from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { Label, Radio } from 'jimu-ui'
import { DynamicUrlType } from '../../config'
import { ExpressionInput, ExpressionInputType } from 'jimu-ui/advanced/expression-builder'
import defaultMessages from '../translations/default'
import { MainDataAndViewSelector, DataViewPriority } from 'jimu-ui/advanced/data-source-selector'

interface Props {
  intl?: IntlShape
  dynamicUrlType: DynamicUrlType
  srcExpression: Expression
  useDataSources?: Immutable.ImmutableArray<UseDataSource>
  isSrcPopupOpen: boolean
  widgetId: string
  isSelectedFromRepeatedDataSourceContext: boolean
  useDataSourceForMainDataAndViewSelector: IMUseDataSource

  onDynamicUrlTypeChanged: (dynamicUrlType: DynamicUrlType) => void
  onSrcExpChange: (expression: Expression) => void
  openSrcPopup: () => void
  closeSrcPopup: () => void
  onSelectedUseDsChangeForSymbol: (useDataSource: IMUseDataSource, isSelectedFromRepeatedDataSourceContext: boolean) => void
  onSelectedUseDsChangeForAttachment: (useDataSource: IMUseDataSource, isSelectedFromRepeatedDataSourceContext: boolean) => void
  onTypeNoSupportChange: () => void
}

const expressionInputTypes = Immutable([ExpressionInputType.Attribute, ExpressionInputType.Expression, ExpressionInputType.Arcade])

export default class DynamicUrlSetting extends React.PureComponent<Props, unknown> {
  getRenderContent = (ds: FeatureLayerDataSource) => {
    const supportExpression: boolean = true
    const supportAttachment: boolean = ds && ds.supportAttachment()
    const supportSymbol: boolean = ds && ds.supportSymbol()

    if (ds) {
      if ((!supportAttachment && this.props.dynamicUrlType === DynamicUrlType.Attachment) || (!supportSymbol && this.props.dynamicUrlType === DynamicUrlType.Symbol)) {
        this.props.onTypeNoSupportChange && this.props.onTypeNoSupportChange()
      }

      if (!supportSymbol && !supportAttachment) {
        return this.getExpressionSettingWithoutRadio()
      } else {
        return (
          <div className='w-100'>
            {supportExpression && this.getExpressionSettingWithRadio()}
            {supportAttachment && <div className='w-100 d-flex justify-content-end mt-4' data-testid='dynamicurl-attachment'>
              <div className='w-100'>
                <SettingRow flow='wrap'>
                  <div className='d-flex justify-content-between w-100'>
                    <div className='align-items-center d-flex'>
                      <Label className='d-flex align-items-center m-0'>
                        <Radio
                          style={{ cursor: 'pointer' }}
                          onChange={() => { this.props.onDynamicUrlTypeChanged(DynamicUrlType.Attachment) }}
                          checked={this.props.dynamicUrlType === DynamicUrlType.Attachment}
                        />
                        <div className='ml-2'>{this.props.intl.formatMessage({ id: 'imageAttachment', defaultMessage: defaultMessages.imageAttachment })}</div>
                      </Label>
                    </div>
                  </div>
                  {this.props.dynamicUrlType === DynamicUrlType.Attachment && <div className={classNames('w-100 justify-content-end mt-4', {
                    'd-none': this.props.useDataSources?.[0]?.dataViewId === 'selection',
                    'd-flex': this.props.useDataSources?.[0]?.dataViewId !== 'selection'
                  })}>
                    <MainDataAndViewSelector
                      hideMainDataSourceSelect
                      widgetId={this.props.widgetId}
                      useDataSources={this.props.useDataSources}
                      selectedUseDataSource={this.props.useDataSourceForMainDataAndViewSelector}
                      onChange={this.props.onSelectedUseDsChangeForAttachment}
                      isSelectedFromRepeatedDataSourceContext={this.props.isSelectedFromRepeatedDataSourceContext}
                      usePopulatedDataView
                      useSelectionDataView
                      defaultDataViewPriority={DataViewPriority.First}
                    />
                  </div>}
                </SettingRow>
              </div>
            </div>}
            {supportSymbol && <div className='w-100 d-flex justify-content-end mt-4'>
              <div className='w-100'>
                <SettingRow flow='wrap'>
                  <div className='d-flex justify-content-between w-100'>
                    <div className='align-items-center d-flex'>
                      <Label className='d-flex align-items-center m-0'>
                        <Radio
                          style={{ cursor: 'pointer' }}
                          onChange={() => { this.props.onDynamicUrlTypeChanged(DynamicUrlType.Symbol) }}
                          checked={this.props.dynamicUrlType === DynamicUrlType.Symbol}
                        />
                        <div className='ml-2'>{this.props.intl.formatMessage({ id: 'imageSymbol', defaultMessage: defaultMessages.imageSymbol })}</div>
                      </Label>
                    </div>
                  </div>
                  {this.props.dynamicUrlType === DynamicUrlType.Symbol && <div className={classNames('w-100 justify-content-end mt-4', {
                    'd-none': this.props.useDataSources?.[0]?.dataViewId === 'selection',
                    'd-flex': this.props.useDataSources?.[0]?.dataViewId !== 'selection'
                  })}>
                    <MainDataAndViewSelector
                      hideMainDataSourceSelect
                      widgetId={this.props.widgetId}
                      useDataSources={this.props.useDataSources}
                      selectedUseDataSource={this.props.useDataSourceForMainDataAndViewSelector}
                      isSelectedFromRepeatedDataSourceContext={this.props.isSelectedFromRepeatedDataSourceContext}
                      onChange={this.props.onSelectedUseDsChangeForSymbol}
                      usePopulatedDataView
                      useSelectionDataView
                      defaultDataViewPriority={DataViewPriority.First}
                    />
                  </div>}
                </SettingRow>
              </div>
            </div>}
          </div>
        )
      }
    } else {
      return this.getExpressionSettingWithoutRadio()
    }
  }

  getExpressionSettingWithRadio = () => {
    // const useDataSources = this.props.useDataSources || [];
    // const dataSourceIds: ImmutableArray<string> = useDataSources[0] ? Immutable([useDataSources[0].dataSourceId]) : Immutable([]);

    return (
      <div className='w-100 d-flex justify-content-end'>
        <div className='w-100'>
          <div className='d-flex w-100 align-items-center'>
            <Label className='d-flex align-items-center m-0'>
              <Radio
                style={{ cursor: 'pointer' }}
                onChange={() => { this.props.onDynamicUrlTypeChanged(DynamicUrlType.Expression) }}
                checked={(this.props.dynamicUrlType === DynamicUrlType.Expression) || !this.props.dynamicUrlType}
                data-testid='dynamicurl-expression'
              />
              <div className='ml-2'>URL</div>
            </Label>
          </div>
          {(this.props.srcExpression || this.props.dynamicUrlType === DynamicUrlType.Expression || !this.props.dynamicUrlType) &&
            <div className='d-flex w-100 justify-content-end mt-4'>
              <ExpressionInput
                useDataSources={this.props.useDataSources} onChange={this.props.onSrcExpChange} openExpPopup={this.props.openSrcPopup}
                expression={this.props.srcExpression} isExpPopupOpen={this.props.isSrcPopupOpen} closeExpPopup={this.props.closeSrcPopup}
                types={expressionInputTypes}
                widgetId={this.props.widgetId}
              />
            </div>}
        </div>
      </div>
    )
  }

  getExpressionSettingWithoutRadio = () => {
    // const useDataSources = this.props.useDataSources || [];
    // const dataSourceIds: ImmutableArray<string> = useDataSources[0] ? Immutable([useDataSources[0].dataSourceId]) : Immutable([]);

    return (
      <div className='w-100 d-flex justify-content-end'>
        <div className='w-100'>
          <div className='d-flex justify-content-between w-100 align-items-center'>
            <label className='m-0'>URL</label>
          </div>
          {this.props.srcExpression ||
          (this.props.dynamicUrlType === DynamicUrlType.Expression || !this.props.dynamicUrlType)
            ? <div className='mt-2' style={{ width: '100%', position: 'relative' }}>
              <ExpressionInput
                useDataSources={this.props.useDataSources} onChange={this.props.onSrcExpChange} openExpPopup={this.props.openSrcPopup}
                expression={this.props.srcExpression} isExpPopupOpen={this.props.isSrcPopupOpen} closeExpPopup={this.props.closeSrcPopup}
                types={expressionInputTypes}
                widgetId={this.props.widgetId}
              />
            </div>
            : <div className='mt-2' style={{ width: '100%', position: 'relative' }}>
              <div className='w-100 h-100' style={{ position: 'absolute', opacity: 0.5, backgroundColor: 'gray', zIndex: 100 }} />
              <ExpressionInput
                useDataSources={this.props.useDataSources} onChange={this.props.onSrcExpChange} openExpPopup={this.props.openSrcPopup}
                expression={this.props.srcExpression} isExpPopupOpen={this.props.isSrcPopupOpen} closeExpPopup={this.props.closeSrcPopup}
                types={expressionInputTypes}
                widgetId={this.props.widgetId}
              />
            </div>}
        </div>
      </div>
    )
  }

  render () {
    let useDataSource = null

    if (this.props.useDataSources) {
      for (let i = 0; i < this.props.useDataSources.length; i++) {
        useDataSource = this.props.useDataSources[0]
      }
    }

    return (
      <SettingRow flow='wrap'>
        {useDataSource && <DataSourceComponent useDataSource={useDataSource}>
          {
            (ds: DataSource) => {
              return this.getRenderContent(ds as FeatureLayerDataSource)
            }
          }
        </DataSourceComponent>}
        {!useDataSource && this.getExpressionSettingWithoutRadio()}
      </SettingRow>
    )
  }
}
