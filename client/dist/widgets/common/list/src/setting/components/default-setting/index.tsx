/** @jsx jsx */
import { jsx, React } from 'jimu-core'
import type { IMAppConfig, BrowserSizeMode, SizeModeLayoutJson, ImmutableArray, UseDataSource, DataSource } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { IMConfig, ElementSize, Status } from '../../../config'
import { SettingCollapseType } from '../../../config'
import { Fragment } from 'react'
import DataSetting from './data-setting'
import ArrangementSetting from './arrangement-setting'
import DataSourcePlaceholder from './data-source-placeholder'
import StatsSetting from './stats-setting'
import ToolSetting from './tool-setting'

interface Props {
  datasource: DataSource
  selectionIsInSelf: boolean
  id: string
  browserSizeMode: BrowserSizeMode
  config: IMConfig
  appConfig: IMAppConfig
  useDataSources: ImmutableArray<UseDataSource>
  layouts: { [name: string]: SizeModeLayoutJson }
  widgetRect: ElementSize
  builderStatus: Status
  showCardSetting: Status
  onPropertyChange: (name, value) => void
  setResettingTheTemplateButtonRef: (ref) => void
  setToHoverSettingButtonRef: (ref) => void
  setToSelectedSettingButtonRef: (ref) => void
  onSettingChangeAndUpdateUsedFieldsOfDs: (config?: IMConfig) => void
  checkIsDsAutoRefreshSettingOpen: (datasource: DataSource) => boolean
  onSettingChange: SettingChangeFunction
  handleCheckboxChange: (dataField: string) => void
  changeCardSettingAndBuilderStatus: (status: Status) => void
}

const ListDefaultSetting = (props: Props) => {
  const { datasource, selectionIsInSelf, id, browserSizeMode, config, appConfig, useDataSources, layouts, widgetRect,
    builderStatus, showCardSetting } = props
  const { onPropertyChange, setResettingTheTemplateButtonRef, setToHoverSettingButtonRef, setToSelectedSettingButtonRef, changeCardSettingAndBuilderStatus, onSettingChange, handleCheckboxChange, onSettingChangeAndUpdateUsedFieldsOfDs, checkIsDsAutoRefreshSettingOpen } = props
  const [settingCollapse, setSettingCollapse] = React.useState(SettingCollapseType.None)

  const handleFormChange = evt => {
    const target = evt.currentTarget
    if (!target) return
    const field = target.dataset.field
    const type = target.type
    let value
    switch (type) {
      case 'checkbox':
        value = target.checked
        break
      case 'select':
        value = target.value
        break
      case 'range':
        value = parseFloat(target.value)
        break
      case 'number':
        const numbertype = target.dataset.numbertype
        const parseNumber = numbertype === 'float' ? parseFloat : parseInt
        const minValue = !!target.min && parseNumber(target.min)
        const maxValue = !!target.max && parseNumber(target.max)
        value = evt.target.value
        if (!value || value === '') return
        value = parseNumber(evt.target.value)
        if (!!minValue && value < minValue) {
          value = minValue
        }
        if (!!maxValue && value > maxValue) {
          value = maxValue
        }
        break
      default:
        value = target.value
        break
    }
    onPropertyChange(field, value)
  }

  const openSettingCollapse = (settingCollapse: SettingCollapseType) => {
    setSettingCollapse(settingCollapse)
  }

  const closeSettingCollapse = () => {
    setSettingCollapse(SettingCollapseType.None)
  }

  return (
    <div className='list-list-setting h-100 d-flex flex-column'>
      <DataSetting
        datasource={datasource}
        selectionIsInSelf={selectionIsInSelf}
        id={id}
        browserSizeMode={browserSizeMode}
        config={config}
        appConfig={appConfig}
        useDataSources={useDataSources}
        layouts={layouts}
        onPropertyChange={onPropertyChange}
        setResettingTheTemplateButtonRef={setResettingTheTemplateButtonRef}
        handleFormChange={handleFormChange}
        checkIsDsAutoRefreshSettingOpen={checkIsDsAutoRefreshSettingOpen}
      />
      <DataSourcePlaceholder datasource={datasource}/>
      {datasource && (
        <Fragment>
          <ArrangementSetting
            id={id}
            config={config}
            settingCollapse={settingCollapse}
            browserSizeMode={browserSizeMode}
            widgetRect={widgetRect}
            builderStatus={builderStatus}
            showCardSetting={showCardSetting}
            layouts={layouts}
            onPropertyChange={onPropertyChange}
            handleFormChange={handleFormChange}
            openSettingCollapse={openSettingCollapse}
            closeSettingCollapse={closeSettingCollapse}
            onSettingChange={onSettingChange}
            handleCheckboxChange={handleCheckboxChange}
          />
          <StatsSetting
            id={id}
            config={config}
            settingCollapse={settingCollapse}
            showCardSetting={showCardSetting}
            useDataSources={useDataSources}
            openSettingCollapse={openSettingCollapse}
            closeSettingCollapse={closeSettingCollapse}
            onSettingChange={onSettingChange}
            onSettingChangeAndUpdateUsedFieldsOfDs={onSettingChangeAndUpdateUsedFieldsOfDs}
            changeCardSettingAndBuilderStatus={changeCardSettingAndBuilderStatus}
            setToSelectedSettingButtonRef={setToSelectedSettingButtonRef}
            setToHoverSettingButtonRef={setToHoverSettingButtonRef}
          />

          <ToolSetting
            id={id}
            config={config}
            settingCollapse={settingCollapse}
            useDataSources={useDataSources}
            datasource={datasource}
            openSettingCollapse={openSettingCollapse}
            closeSettingCollapse={closeSettingCollapse}
            handleFormChange={handleFormChange}
            onPropertyChange={onPropertyChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        </Fragment>
      )}
    </div>
  )
}
export default ListDefaultSetting