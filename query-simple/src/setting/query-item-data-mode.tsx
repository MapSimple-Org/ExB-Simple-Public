/** @jsx jsx */
import { React, jsx, css, classNames, type ImmutableObject, Immutable, DataSourceManager, type UseDataSource, CONSTANTS, type IMDataSourceJson, AllDataSourceTypes, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, MultiSelect, MultiSelectItem, Label, Checkbox } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { List, TreeItemActionType, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import defaultMessages from './translations/default'
import { type QueryItemType, SpatialRelation } from '../config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { BufferSetting } from './buffer'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

const headerStyle = css`
  border-top: 1px solid var(--ref-palette-neutral-700);
  .title {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--ref-palette-neutral-1000);
  }
`
interface Props {
  index: number
  widgetId: string
  visible: boolean
  queryItem?: ImmutableObject<QueryItemType>
  onQueryItemChanged: (index: number, item: ImmutableObject<QueryItemType>, dsUpdateRequired?: boolean) => void
  handleStageChange: (id: number) => void
}

const dsTypes = Immutable([AllDataSourceTypes.FeatureLayer])

const advancedActionMap = {
  overrideItemBlockInfo: () => {
    return {
      name: TreeItemActionType.RenderOverrideItem,
      children: [{
        name: TreeItemActionType.RenderOverrideItemDroppableContainer,
        children: [{
          name: TreeItemActionType.RenderOverrideItemDraggableContainer,
          children: [{
            name: TreeItemActionType.RenderOverrideItemBody,
            children: [{
              name: TreeItemActionType.RenderOverrideItemMainLine,
              children: [{
                name: TreeItemActionType.RenderOverrideItemDragHandle
              }, {
                name: TreeItemActionType.RenderOverrideItemTitle
              }]
            }]
          }]
        }]
      }]
    }
  }
}

function shouldHideDataSource (dsJson: IMDataSourceJson): boolean {
  return !DataSourceManager.getInstance().getDataSource(dsJson.id)?.getGeometryType()
}

export function QueryItemSettingDataMode (props: Props) {
  const { index, widgetId, handleStageChange, queryItem, onQueryItemChanged, visible } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  const spatialRelationOptions = React.useMemo(() => {
    return Immutable(Object.entries(SpatialRelation).map(([key, value]) => ({
      value,
      label: getI18nMessage(`spatialRelation_${key}`)
    })))
  }, [getI18nMessage])

  React.useEffect(() => {
    if (visible) {
      focusElementInKeyboardMode(backBtnRef.current)
    }
  }, [visible])

  const updateProperty = (prop: string, value: any, dsUpdateRequired = false) => {
    const newItem = queryItem.set(prop, value)
    onQueryItemChanged(index, newItem, dsUpdateRequired)
  }

  const displaySelectedFields = React.useCallback(values => {
    return getI18nMessage('numSelected', {
      number: values.length
    })
  }, [getI18nMessage])

  const handleSpatialRelationsChange = hooks.useEventCallback((value, values) => {
    updateProperty('spatialRelations', values)
  })

  const handleDsChange = hooks.useEventCallback((useDataSources: UseDataSource[]) => {
    const ds = useDataSources.map(u => {
      if (u.dataViewId !== CONSTANTS.SELECTION_DATA_VIEW_ID) {
        return {
          ...u,
          dataSourceId: DataSourceManager.getInstance().getDataSource(u.mainDataSourceId).getDataView(CONSTANTS.SELECTION_DATA_VIEW_ID).id,
          dataViewId: CONSTANTS.SELECTION_DATA_VIEW_ID
        }
      }
      return u
    })
    updateProperty('spatialRelationUseDataSources', ds, true)
  })

  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const dataSources = Immutable(currentItem.spatialRelationUseDataSources ?? [])
  const spatialRelations = Immutable(currentItem.spatialRelations?.filter(rel => Object.values(SpatialRelation).includes(rel)))

  if (!queryItem) {
    return null
  }

  return (
    <div className={classNames({ 'd-none': !visible })}>
      <div className='d-flex align-items-center px-4 pt-4' css={headerStyle}>
        <Button
          ref={backBtnRef}
          aria-label={getI18nMessage('back')}
          type='tertiary'
          size='sm'
          icon
          className='p-0 action-btn'
          onClick={() => { handleStageChange(0) }}
        >
          <ArrowLeftOutlined autoFlip />
        </Button>
        <div className='title flex-grow-1 text-truncate ml-2' title={getI18nMessage('featureFromDs')}>{getI18nMessage('featureFromDs')}</div>
      </div>
      <div css={css`height: calc(100% - 30px); overflow: auto;`}>
        <SettingSection role='group' aria-label={getI18nMessage('selectionViewOnly')}>
          <SettingRow flow='wrap' truncateLabel label={getI18nMessage('selectionViewOnly')}>
            <DataSourceSelector
              widgetId={widgetId}
              buttonLabel={getI18nMessage('newFilterLayer')}
              disableRemove={() => false}
              disableDataView
              mustUseDataSource
              types={dsTypes}
              isMultiple={true}
              hideDs={shouldHideDataSource}
              isMultipleDataView={false}
              useDataSources={dataSources as any}
              onChange={handleDsChange}
            />
          </SettingRow>
          <SettingRow>
            <Label>
              <Checkbox
                className='mr-2'
                checked={queryItem.spatialIncludeRuntimeData}
                onChange={(_, checked) => { updateProperty('spatialIncludeRuntimeData', checked) }}
              />{getI18nMessage('includeRuntimeData')}
            </Label>
          </SettingRow>
        </SettingSection>
        <SettingSection>
          <SettingRow flow='wrap' label={getI18nMessage('chooseSpatialRelationshipRules')}>
            <MultiSelect
              aria-label={getI18nMessage('chooseSpatialRelationshipRules')}
              values={spatialRelations}
              onChange={handleSpatialRelationsChange}
              displayByValues={displaySelectedFields}
              size='sm'
            >{
              Object.entries(SpatialRelation).map(([key, value]) => {
                return (<MultiSelectItem key={value} value={value} label={getI18nMessage(`spatialRelation_${key}`)} />)
              }
            )
            }</MultiSelect>
          </SettingRow>
          {spatialRelations?.length > 0 && (
            <SettingRow>
              <List
                className='selected-fields-list w-100'
                itemsJson={Array.from(spatialRelations).map((item, index) => {
                  const label = spatialRelationOptions.find(rel => rel.value === item).label
                  return {
                    itemStateDetailContent: item,
                    itemKey: `${index}`,
                    itemStateTitle: label,
                    itemStateCommands: []
                  }
                })}
                dndEnabled
                onUpdateItem={(actionData, refComponent) => {
                  const { itemJsons } = refComponent.props
                  const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
                  const relations: SpatialRelation[] = parentItemJson.map(item => {
                    return item.itemStateDetailContent
                  })
                  updateProperty('spatialRelations', relations)
                }}
                {...advancedActionMap}
              />
            </SettingRow>
          )}
        </SettingSection>
        <SettingSection>
          <BufferSetting
            enabled={currentItem.spatialRelationEnableBuffer}
            distance={currentItem.spatialRelationBufferDistance}
            unit={currentItem.spatialRelationBufferUnit}
            onEnableChanged={(enabled) => { updateProperty('spatialRelationEnableBuffer', enabled) }}
            onDistanceChanged={(distance) => { updateProperty('spatialRelationBufferDistance', distance) }}
            onUnitChanged={(unit) => { updateProperty('spatialRelationBufferUnit', unit) }}
          />
        </SettingSection>
      </div>
    </div>
  )
}
