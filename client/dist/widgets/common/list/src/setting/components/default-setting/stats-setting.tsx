/** @jsx jsx */
import { jsx, React, hooks } from 'jimu-core'
import type { IMLinkParam, ImmutableArray, UseDataSource } from 'jimu-core'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { SettingRow, SettingSection, LinkSelector } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Button, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { IMConfig } from '../../../config'
import { SelectionModeType, Status, SettingCollapseType } from '../../../config'
import defaultMessages from '../../translations/default'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import CardBackgroundSetting from '../style-setting/card-background-setting'

interface Props {
  id: string
  config: IMConfig
  settingCollapse: SettingCollapseType
  showCardSetting: Status
  useDataSources: ImmutableArray<UseDataSource>
  openSettingCollapse: (settingCollapse: SettingCollapseType) => void
  closeSettingCollapse: () => void
  onSettingChange: SettingChangeFunction
  onSettingChangeAndUpdateUsedFieldsOfDs: (config?: IMConfig) => void
  changeCardSettingAndBuilderStatus: (status: Status) => void
  setToHoverSettingButtonRef: (ref) => void
  setToSelectedSettingButtonRef: (ref) => void
}

const StatsSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { id, config, showCardSetting, useDataSources, settingCollapse } = props
  const { onSettingChangeAndUpdateUsedFieldsOfDs, onSettingChange, setToHoverSettingButtonRef, setToSelectedSettingButtonRef, changeCardSettingAndBuilderStatus, openSettingCollapse, closeSettingCollapse } = props

  const onSettingLinkConfirm = hooks.useEventCallback((linkResult: IMLinkParam) => {
    if (!linkResult) {
      return
    }
    const newConfig = config.set('linkParam', linkResult)

    if (linkResult.expression) {
      onSettingChangeAndUpdateUsedFieldsOfDs(newConfig)
    } else {
      onSettingChange({
        id: id,
        config: newConfig
      })
    }
  })

  const onOpenCardSetting = evt => {
    const status = evt.currentTarget.dataset.value
    changeCardSettingAndBuilderStatus(status)
  }

  const getToSelectedSettingText = (config: IMConfig) => {
    return config.cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None ? nls('on') : nls('off')
  }

  const getToHoverSettingText = (config: IMConfig) => {
    return config.cardConfigs[Status.Hover].enable ? nls('on') : nls('off')
  }
  return (
    <SettingSection>
      <CollapsablePanel
        label={nls('states')}
        isOpen={settingCollapse === SettingCollapseType.States}
        onRequestOpen={() => { openSettingCollapse(SettingCollapseType.States) }}
        onRequestClose={closeSettingCollapse}
        aria-label={nls('states')}
      >
        <SettingRow className="mt-2">
          <LinkSelector
            onSettingConfirm={onSettingLinkConfirm}
            linkParam={config.linkParam}
            useDataSources={useDataSources}
            widgetId={id}
          />
        </SettingRow>
        <CardBackgroundSetting
          id={id}
          config={config}
          isClearBorder
          useDataSources={useDataSources}
          showCardSetting={showCardSetting}
          onSettingChange={onSettingChange}
          onSettingChangeAndUpdateUsedFieldsOfDs={onSettingChangeAndUpdateUsedFieldsOfDs}
        />
        <SettingRow label={nls('hover')} role='group' aria-label={nls('hover')}>
          <Button
            className='setting-next d-flex text-break'
            data-value={Status.Hover}
            onClick={onOpenCardSetting}
            type='tertiary'
            title={getToHoverSettingText(config)}
            size='sm'
            ref={ref => { setToHoverSettingButtonRef(ref) }}
          >
            <div>{getToHoverSettingText(config)}</div>
            <RightOutlined autoFlip style={{ flex: 'none' }} size={12}/>
          </Button>
        </SettingRow>
        <SettingRow label={nls('selected')} role='group' aria-label={nls('selected')}>
          <Button
            className='setting-next d-flex text-break'
            data-value={Status.Selected}
            onClick={onOpenCardSetting}
            type='tertiary'
            title={getToSelectedSettingText(config)}
            size='sm'
            ref={ref => { setToSelectedSettingButtonRef(ref) }}
          >
            <div>{getToSelectedSettingText(config)}</div>
            <RightOutlined autoFlip style={{ flex: 'none' }} size={12}/>
          </Button>
        </SettingRow>
      </CollapsablePanel>
    </SettingSection>
  )
}
export default StatsSetting