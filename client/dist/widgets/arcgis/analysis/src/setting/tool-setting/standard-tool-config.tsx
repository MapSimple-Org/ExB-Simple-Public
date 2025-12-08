/** @jsx jsx */
import { React, jsx, type ImmutableObject, hooks, css } from 'jimu-core'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, defaultMessages as jimuiDefaultMessages, Select, Switch, Option } from 'jimu-ui'
import defaultMessages from '../translations/default'
import type { ToolConfig, HistoryItemWithDs, StandardToolConfig } from '../../config'

interface Props {
  toolConfig: ImmutableObject<ToolConfig>
  historyListFromMap: HistoryItemWithDs[]
  onConfigChange: (setInArray: string[], value: any) => void
}

const { useMemo } = React

const settingSectionStyle = css`
  padding: 0.375rem 1rem;
  .jimu-widget-setting--row:last-child {
    padding-bottom: 0.625rem;
  }
`

const StandardToolConfigPopperContent = (props: Props) => {
  const { toolConfig, historyListFromMap, onConfigChange } = props
  const { output, option } = toolConfig.config as ImmutableObject<StandardToolConfig>

  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  const currentToolHistoryFromMap = useMemo(() => {
    return historyListFromMap.filter((history) => history.toolId === toolConfig.id)
  }, [historyListFromMap, toolConfig.id])

  const onPresetFromHistorySwitchChange = (e, checked: boolean) => {
    if (checked) {
      onConfigChange(['config', 'option', 'presetFromMapHistoryId'], currentToolHistoryFromMap[0]?.id)
    } else {
      onConfigChange(['config', 'option'], option.without('presetFromMapHistoryId'))
    }
  }

  return (
    <React.Fragment>
      <SettingSection css={settingSectionStyle}>
        <CollapsablePanel label={translate('output')} type="default" defaultIsOpen aria-label={translate('output')}>
          {Object.keys(output).map((key, index) => {
            return (
              <SettingRow tag='label' label={translate(key)} flow='no-wrap' key={key} className={index === 0 ? 'pt-4' : ''}>
                <Switch checked={output[key]} onChange={(e, checked) => { onConfigChange(['config', 'output', key], checked) }}/>
              </SettingRow>
            )
          })}
        </CollapsablePanel>
      </SettingSection>
      {!!currentToolHistoryFromMap.length && <SettingSection css={settingSectionStyle}>
        <CollapsablePanel label={translate('option')} type="default" defaultIsOpen aria-label={translate('option')}>
          <SettingRow tag='label' label={translate('presetToolFromAMapHistory')} className='pt-4'>
            <Switch checked={!!option.presetFromMapHistoryId} onChange={onPresetFromHistorySwitchChange} />
          </SettingRow>
          {!!option.presetFromMapHistoryId && <Select value={option.presetFromMapHistoryId} onChange={(e) => { onConfigChange(['config', 'option', 'presetFromMapHistoryId'], e?.target?.value) }}>
            {currentToolHistoryFromMap.map((history) => {
              return <Option value={history.id} key={history.id}>{translate('historyFromWhen', { time: new Date(history.startTimestamp).toUTCString() })}</Option>
            })}
          </Select>}
        </CollapsablePanel>
      </SettingSection>}
    </React.Fragment>
  )
}

export default StandardToolConfigPopperContent
