/** @jsx jsx */
import { React, jsx, css, defaultMessages as jimuCoreMessages, hooks, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Select } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { ConfigItem } from './config-item'
import defaultMessages from '../translations/default'
import { ExpressionEditor } from './expression-editor'
const { useState, useEffect } = React

const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)

interface OutputSettingProps extends React.HTMLAttributes<HTMLDivElement> {
  hides: any
  onLabelChanged?: any
  onVisibilityChanged?: any
  dataSource: any
  theme?: any
  onSettingValueChanged?: any

  // label
  fileOptionsLabel?: string
  reportNameLabel?: string
  saveToAGSAccountLabel?: string
  outputFormatLabel?: string

  mergeFiles?: string
  reportName?: string
  outputFormat?: string
}

export const OutputSettingPanel = (props: OutputSettingProps): React.ReactElement => {
  const { hides, dataSource, onLabelChanged, fileOptionsLabel, reportNameLabel, saveToAGSAccountLabel, outputFormatLabel, theme, onVisibilityChanged, onSettingValueChanged, mergeFiles, reportName, outputFormat } = props
  const getStyle = (theme?: IMThemeVariables): SerializedStyles => {
    // const inputVars = theme?.components?.input
    return css`
      .jimu-widget-setting--row {
        background: ${theme.sys.color.divider.tertiary};
        padding: 0.625rem;
      }

      .option-setting-item{
        height: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: nowrap;
        // margin-bottom: 8px;
      }`
  }
  const translate = hooks.useTranslation(allDefaultMessages)

  const [curReportName, setCurReportName] = useState<string>(reportName || '')
  useEffect(() => {
    setCurReportName(reportName)
  }, [reportName])

  const onReportNameChange = (val: string) => {
    setCurReportName(val || '')
    onSettingValueChanged('reportName', val || '')
  }

  return (<div className='option-setting-outter' aria-labelledby="" css={getStyle(theme)}>
    <SettingSection role='group'>
      {/* file option */}
        <SettingRow role='group' aria-label={translate('reportSettingsFileOptions')}>
          <div className='w-100 option-setting'>
            <ConfigItem
              defaultLabel={translate('reportSettingsFileOptions')}
              label={ fileOptionsLabel || translate('reportSettingsFileOptions')}
              checked={!(hides || []).includes('fileOptions') || false}
              onValueChange={(evt) => { onLabelChanged('fileOptions', evt) }}
              onCheckedChange={checked => { onVisibilityChanged('fileOptions', checked) }}
            >
              <div>
              <Select
                size='sm'
                className='w-100'
                value={mergeFiles || ''}
                onChange={e => { onSettingValueChanged('mergeFiles', e.target.value) }}
              >
                <option value={''} title={translate('FileOptionsSplitDesc')}>{translate('FileOptionsSplit')}</option>
                <option value={'nextPage'} title={translate('FileOptionsMergeNextPageDesc')}>{translate('FileOptionsMergeNextPage')}</option>
                <option value={'continuous'} title={translate('FileOptionsMergeContinuousDesc')}>{translate('FileOptionsMergeContinuous')}</option>
              </Select>
              </div>
            </ConfigItem>
          </div>
        </SettingRow>

        {/* file name */}
        <SettingRow role='group' aria-label={translate('reportSettingsFileName')}>
          <div className='w-100 option-setting'>
            <ConfigItem
              defaultLabel={translate('reportSettingsFileName')}
              label={ reportNameLabel || translate('reportSettingsFileName')}
              checked={!(hides || []).includes('reportName') || false}
              onValueChange={(evt) => { onLabelChanged('reportName', evt) }}
              onCheckedChange={checked => { onVisibilityChanged('reportName', checked) }}
            >
              <div>
              {dataSource
                ? <ExpressionEditor
                    dataSources={dataSource}
                    theme={theme}
                    value={curReportName}
                    prefix={'${'}
                    onBlur={(val) => { onReportNameChange(val) }}
                  >
                  </ExpressionEditor>
                : ''}
              {/* <TextInput
                  css={css`height: 1rem; margin-bottom: 0.5rem;`}
                  size='sm'
                  className='w-100'
                  value={curReportName}
                  onChange={(e) => { onReportNameChange(e.target.value) }}
                /> */}
              </div>
            </ConfigItem>
          </div>
        </SettingRow>

        {/* save location */}
        <SettingRow role='group' aria-label={translate('reportSettingsSaveLocation')}>
          <div className='w-100 option-setting'>
            <ConfigItem
              defaultLabel={translate('reportSettingsSaveLocation')}
              label={ saveToAGSAccountLabel || translate('reportSettingsSaveLocation')}
              checked={!(hides || []).includes('saveToAGSAccount') || false}
              onValueChange={(evt) => { onLabelChanged('saveToAGSAccount', evt) }}
              onCheckedChange={checked => { onVisibilityChanged('saveToAGSAccount', checked) }}
              tooltipLabel={translate('saveToAccountTip')}
            >
            </ConfigItem>
          </div>
        </SettingRow>

        {/* format */}
        <SettingRow role='group' aria-label={translate('reportSettingsFormat')}>
          <div className='w-100 option-setting'>
            <ConfigItem
              defaultLabel={translate('reportSettingsFormat')}
              label={ outputFormatLabel || translate('reportSettingsFormat')}
              checked={!(hides || []).includes('outputFormat') || false}
              onValueChange={(evt) => { onLabelChanged('outputFormat', evt) }}
              onCheckedChange={checked => { onVisibilityChanged('outputFormat', checked) }}
            >
              <div>
              <Select
                size='sm'
                className='w-100'
                value={outputFormat || 'docx'}
                onChange={e => { onSettingValueChanged('outputFormat', e.target.value) }}
              >
                <option value={'docx'}>{translate('formatDocx')}</option>
                <option value={'pdf'}>{translate('formatPdf')}</option>
              </Select>
              </div>
            </ConfigItem>
          </div>
        </SettingRow>

        </SettingSection>
      </div>)
}
