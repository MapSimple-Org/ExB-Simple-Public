/** @jsx jsx */
import {
  React, jsx, css, hooks, Immutable, type ImmutableArray, type ImmutableObject,
  type UseDataSource, DataSourceManager, CONSTANTS, utils as jimuCoreUtils
} from 'jimu-core'
import { type SpatialSelection, SpatialRelation, UnitType, getDefaultSpatialSelection, getDefaultBuffer, mapConfigSpatialRelToStringKey } from '../../config'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages, CollapsablePanel, Collapse, MultiSelectItem, Switch, NumericInput, Select, MultiSelect } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { RootSettingProps } from '../utils'
import { IM_SUPPORTED_DATA_SOURCE_TYPES, isExpressMode } from '../../utils'
import TitleWithSwitch from './title-with-switch'

export interface SpatialSectionProps {
  rootSettingProps: RootSettingProps
  imSpatialSelection: ImmutableObject<SpatialSelection>
  onSpatialSelectionUpdate: (newImSpatialSelection: ImmutableObject<SpatialSelection>) => void
}

/**
 * Setting for SelectByLocation, including selecting data source views and setting buffer info.
 */
export default function SpatialSection (props: SpatialSectionProps): React.ReactElement {
  const {
    rootSettingProps,
    onSpatialSelectionUpdate
  } = props

  const {
    id: widgetId
  } = rootSettingProps

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  // make sure imSpatialSelection has full structure
  const imSpatialSelection = React.useMemo(() => {
    let tempImSpatialSelection = props.imSpatialSelection

    if (!tempImSpatialSelection) {
      tempImSpatialSelection = Immutable(getDefaultSpatialSelection())
    }

    if (!tempImSpatialSelection.useDataSources) {
      tempImSpatialSelection = tempImSpatialSelection.set('useDataSources', [])
    }

    if (!tempImSpatialSelection.buffer) {
      tempImSpatialSelection = tempImSpatialSelection.set('buffer', getDefaultBuffer)
    }

    return tempImSpatialSelection
  }, [props])

  let imUseDataSources: ImmutableArray<UseDataSource> = null
  let imRelationshipValues: ImmutableArray<string> = null
  let enableBuffer = false
  let bufferDistance = 0
  let bufferUnit: UnitType = null
  const enableSpatialSelection = !!imSpatialSelection.enable

  if (enableSpatialSelection) {
    imUseDataSources = imSpatialSelection.useDataSources

    if (imSpatialSelection.relationships) {
      const relationships: string[] = []
      imSpatialSelection.relationships.forEach(item => {
        relationships.push(item as string)
      })

      imRelationshipValues = Immutable(relationships)
    }

    if (imSpatialSelection.buffer) {
      enableBuffer = !!imSpatialSelection.buffer.enable
      bufferDistance = imSpatialSelection.buffer.distance
      bufferUnit = imSpatialSelection.buffer.unit
    }
  }

  if (!imUseDataSources) {
    imUseDataSources = Immutable([])
  }

  if (!imRelationshipValues) {
    imRelationshipValues = Immutable([])
  }

  if (typeof bufferDistance !== 'number') {
    bufferDistance = 0
  }

  if (!bufferUnit) {
    bufferUnit = UnitType.Meters
  }

  const imRelationshipItems = React.useMemo(() => {
    return Immutable(Object.entries(SpatialRelation).map(([key, value]) => ({
      value,
      label: translate(mapConfigSpatialRelToStringKey[value])
    })))
  }, [translate])

  const onTitleWithSwitchChange = React.useCallback((evt, checked) => {
    let newImSpatialSelection = imSpatialSelection.set('enable', checked)

    if (!checked) {
      // #23024
      newImSpatialSelection = newImSpatialSelection.set('useDataSources', [])
    }

    onSpatialSelectionUpdate(newImSpatialSelection)
  }, [imSpatialSelection, onSpatialSelectionUpdate])

  // update config.spatialSelection.useDataSources
  // select selection view by default if add new data source
  const onDataSourceSelectorChange = React.useCallback((evtUseDataSources: UseDataSource[]) => {
    const currDsIds = imUseDataSources.map(imUseDataSource => imUseDataSource.dataSourceId).asMutable()
    const evtDsIds = evtUseDataSources.map(evtUseDataSource => evtUseDataSource.dataSourceId)
    const {
      added: addedDsIds,
      deleted: deletedDsIds
    } = jimuCoreUtils.diffArrays(true, currDsIds, evtDsIds)
    const addedDefaultViewDsIds: string[] = [] // added data sources with default view

    if (addedDsIds.length > 0 && deletedDsIds.length === 0) {
      // only add data sources
      addedDsIds.forEach(addedDsId => {
        const addedDs = evtUseDataSources.find(evtUseDataSource => evtUseDataSource.dataSourceId === addedDsId)

        if (addedDs && !addedDs.dataViewId) {
          // addedDs is the default view
          addedDefaultViewDsIds.push(addedDsId)
        }
      })
    }

    let finalNewUseDataSources: UseDataSource[] = null

    // addedDefaultViewDsIds is the really added default view dsIds, not changed from other view
    if (addedDefaultViewDsIds.length > 0) {
      // add new data source view
      const dsManager = DataSourceManager.getInstance()
      finalNewUseDataSources = evtUseDataSources.map(useDataSource => {
        if (addedDefaultViewDsIds.includes(useDataSource.dataSourceId)) {
          // useDataSource is the new added data source, it is default view, need to change it to selection view by default
          const selectionDsView = { ...useDataSource }
          const selectionViewId = CONSTANTS.SELECTION_DATA_VIEW_ID
          selectionDsView.dataViewId = selectionViewId
          selectionDsView.dataSourceId = dsManager.getDataViewDataSourceId(useDataSource.mainDataSourceId, selectionViewId)
          return selectionDsView
        } else {
          // useDataSource is kept in the data source list
          return useDataSource
        }
      })
    } else {
      // don't add new data source view, maybe change view for data source or delete data source
      finalNewUseDataSources = evtUseDataSources
    }

    const newImSpatialSelection = imSpatialSelection.set('useDataSources', finalNewUseDataSources)
    onSpatialSelectionUpdate(newImSpatialSelection)
  }, [imSpatialSelection, imUseDataSources, onSpatialSelectionUpdate])

  const displaySelectedRelationships = React.useCallback(values => {
    return translate('numSelected', {
      number: values.length
    })
  }, [translate])

  const onRelationshipMultiSelectClickItem = React.useCallback((value, selectedValues: string[]) => {
    if (selectedValues.length === 0) {
      // Make sure have one relationship at least.
      return
    }

    const newImSpatialSelection = imSpatialSelection.set('relationships', selectedValues)
    onSpatialSelectionUpdate(newImSpatialSelection)
  }, [imSpatialSelection, onSpatialSelectionUpdate])

  const onEnableBufferSwitchChange = React.useCallback((evt, checked: boolean) => {
    const newImSpatialSelection = imSpatialSelection.setIn(['buffer', 'enable'], checked)
    onSpatialSelectionUpdate(newImSpatialSelection)
  }, [imSpatialSelection, onSpatialSelectionUpdate])

  const onBufferDistanceChange = React.useCallback((value: number) => {
    const newImSpatialSelection = imSpatialSelection.setIn(['buffer', 'distance'], value)
    onSpatialSelectionUpdate(newImSpatialSelection)
  }, [imSpatialSelection, onSpatialSelectionUpdate])

  const onBufferUnitChange = React.useCallback((evt) => {
    const newUnit = evt.target.value
    const newImSpatialSelection = imSpatialSelection.setIn(['buffer', 'unit'], newUnit)
    onSpatialSelectionUpdate(newImSpatialSelection)
  }, [imSpatialSelection, onSpatialSelectionUpdate])

  const dataSourceSelectorRowLabel = isExpressMode() ? translate('selectionViewOnly') : ''

  // We can support different views (not only limited to “Selected features” as in W-Query).
  // Each layer only has one view each time.

  return (
    <SettingSection
      role='group'
      aria-label={translate('spatialSelection')}
      title=''
    >
      <CollapsablePanel
        label={translate('spatialSelection')}
        level={1}
        type="default"
      >
        <TitleWithSwitch
          titleKey='selectByData'
          checked={enableSpatialSelection}
          className='title3 text-default mt-4'
          onSwitchChange={onTitleWithSwitchChange}
        />

        <Collapse
          isOpen={enableSpatialSelection}
        >
          <SettingRow
            flow='wrap'
            truncateLabel
            label={dataSourceSelectorRowLabel}
            className='mt-4'
          >
            <DataSourceSelector
              buttonLabel={translate('addSelectingData')}
              widgetId={widgetId}
              types={IM_SUPPORTED_DATA_SOURCE_TYPES}
              isMultiple={true}
              disableDataView={false}
              isMultipleDataView={false}
              disableDataSourceList={false}
              mustUseDataSource
              useDataSources={imUseDataSources}
              onChange={onDataSourceSelectorChange}
            />
          </SettingRow>

          <SettingRow
            flow='wrap'
            label={translate('relationship')}
          >
            <MultiSelect
              aria-label={translate('relationship')}
              values={imRelationshipValues}
              onChange={onRelationshipMultiSelectClickItem}
              displayByValues={displaySelectedRelationships}
              size='sm'
            >{
              imRelationshipItems.map((item) => {
                return (<MultiSelectItem key={item.value} value={item.value} label={item.label} />)
              })
            }</MultiSelect>
          </SettingRow>

          <SettingRow
            tag='label'
            label={translate('enableBuffer')}
          >
            <Switch
              checked={enableBuffer}
              onChange={onEnableBufferSwitchChange}
            />
          </SettingRow>

          {enableBuffer && (
            <React.Fragment>
              <SettingRow
                label={translate('defaultDistance')}
              >
                <NumericInput
                  css={css`
                    width: 40%;
                    flex: 0 0 40%;
                    flex-shrink: 0;
                    flex-grow: 0;
                  `}
                  aria-label={translate('defaultDistance')}
                  size='sm'
                  min={0}
                  value={bufferDistance}
                  onChange={onBufferDistanceChange}
                />
              </SettingRow>

              <SettingRow
                label={translate('defaultUnit')}
              >
                <Select
                  css={css`
                    width: 40%;
                    flex: 0 0 40%;
                    flex-shrink: 0;
                    flex-grow: 0;
                  `}
                  size='sm'
                  value={bufferUnit}
                  aria-label={translate('defaultUnit')}
                  onChange={onBufferUnitChange}
                >
                  {Object.values(UnitType).map((value) => (
                    <option key={value} value={value}>
                      {translate(`unit_${value}`)}
                    </option>
                  ))}
                </Select>
              </SettingRow>
            </React.Fragment>
          )}

        </Collapse>
      </CollapsablePanel>
    </SettingSection>
  )
}
