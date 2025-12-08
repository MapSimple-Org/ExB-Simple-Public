/** @jsx jsx */
import { jsx, React, dataSourceUtils, hooks, classNames, Immutable, AllDataSourceTypes, getAppStore } from 'jimu-core'
import type { SizeModeLayoutJson, IMAppConfig, BrowserSizeMode, ImmutableArray, UseDataSource, DataSource } from 'jimu-core'
import { getAppConfigAction } from 'jimu-for-builder'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { Tooltip, TextInput, Button, Switch, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { IMConfig } from '../../../config'
import { Status } from '../../../config'
import { getNewUseDatasourcesByWidgetConfig } from '../../utils/utils'
import defaultMessages from '../../translations/default'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { updateDynamicStyleConfig } from '../../../utils/util'


const DSSelectorTypes = Immutable([
  AllDataSourceTypes.FeatureLayer,
  AllDataSourceTypes.SceneLayer,
  AllDataSourceTypes.BuildingComponentSubLayer,
  AllDataSourceTypes.OrientedImageryLayer,
  AllDataSourceTypes.ImageryLayer,
  AllDataSourceTypes.SubtypeGroupLayer,
  AllDataSourceTypes.SubtypeSublayer
])

interface Props {
  datasource: DataSource
  selectionIsInSelf: boolean
  id: string
  browserSizeMode: BrowserSizeMode
  config: IMConfig
  appConfig: IMAppConfig
  useDataSources: ImmutableArray<UseDataSource>
  layouts: { [name: string]: SizeModeLayoutJson }
  onPropertyChange: (name, value) => void
  setResettingTheTemplateButtonRef: (ref) => void
  handleFormChange: (evt) => void
  checkIsDsAutoRefreshSettingOpen: (datasource: DataSource) => boolean
}

const DataSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { datasource, selectionIsInSelf, id, config, useDataSources, appConfig, browserSizeMode, layouts } = props
  const { onPropertyChange, setResettingTheTemplateButtonRef, checkIsDsAutoRefreshSettingOpen, handleFormChange } = props

  const handleResetItemStyleClick = evt => {
    onPropertyChange('isItemStyleConfirm', false)
  }

  const clearSearchFieldAndSortAndSort = React.useCallback((config: IMConfig, currentSelectedDs: UseDataSource): IMConfig => {
    const areDerivedFromSameMain = currentSelectedDs ? dataSourceUtils.areDerivedFromSameMain(datasource?.id, currentSelectedDs?.dataSourceId) : false
    let newConfig = config
    if (!areDerivedFromSameMain) {
      newConfig = newConfig
        .set('searchFields', null)
        .set('filters', null)
        .set('sorts', null)
    }
    return newConfig
  }, [datasource])

  const onDataRemove = React.useCallback((currentRemovedDataSources: ImmutableArray<UseDataSource>) => {
    const currentRemovedDs = currentRemovedDataSources[0].asMutable({ deep: true })
    const widgets = appConfig && appConfig.widgets
    const widgetJson = widgets[id]
    const updateWidgetJson = { id: id } as any
    const appConfigAction = getAppConfigAction()
    const useDataSources: UseDataSource[] = widgetJson.useDataSources.filter(
      usedDs => usedDs.dataSourceId !== currentRemovedDs.dataSourceId
    )?.asMutable({ deep: true })

    updateWidgetJson.config = clearSearchFieldAndSortAndSort(widgetJson.config, null)
    //Update dynamic style config when select new data source
    updateWidgetJson.config = updateDynamicStyleConfig(config, id, widgetJson.useDataSources, null)
    const useDS = getNewUseDatasourcesByWidgetConfig(updateWidgetJson.config, Immutable(useDataSources))

    updateWidgetJson.useDataSources = useDS

    // Instead of function onSettingChange, use action to change widget json, which can avoid conflict.
    // Because editing widget json in builder needs pub-sub and pub-sub is async.
    appConfigAction.editWidget(updateWidgetJson, []).exec()
  }, [appConfig, config, clearSearchFieldAndSortAndSort, id])

  const getWhetherDsInUseDataSources = (
    ds: UseDataSource,
    useDataSources: ImmutableArray<UseDataSource>
  ): boolean => {
    if (!ds || !useDataSources) {
      return false
    }
    return useDataSources.some(u => u.dataSourceId === ds.dataSourceId)
  }

  const onNoDataMessageChange = (value) => {
    onPropertyChange('noDataMessage', value)
  }

  const onDataSelect = React.useCallback((currentSelectedDataSources: ImmutableArray<UseDataSource>) => {
    const currentSelectedDs = currentSelectedDataSources?.[0]?.asMutable({ deep: true })
    const widgets = appConfig && appConfig.widgets

    const widgetJson = widgets[id]
    const updateWidgetJson = { id: id } as any
    const appConfigAction = getAppConfigAction()
    let useDataSources: UseDataSource[]
    let singleUsedDs: UseDataSource
    if (getWhetherDsInUseDataSources(currentSelectedDs, widgetJson.useDataSources)) {
      useDataSources = widgetJson.useDataSources.asMutable({ deep: true })
    } else {
      singleUsedDs = currentSelectedDs
      useDataSources = [singleUsedDs]
      updateWidgetJson.config = clearSearchFieldAndSortAndSort(widgetJson.config, currentSelectedDs)
      //Update dynamic style config when select new data source
      updateWidgetJson.config = updateDynamicStyleConfig((updateWidgetJson.config || widgetJson.config), id, widgetJson.useDataSources, currentSelectedDataSources)
    }
    const useDS = getNewUseDatasourcesByWidgetConfig(updateWidgetJson.config || widgetJson.config, Immutable(useDataSources))
    // Instead of function onSettingChange, use action to change widget json, which can avoid conflict.
    // Because editing widget json in builder needs pub-sub and pub-sub is async.
    updateWidgetJson.useDataSources = useDS
    appConfigAction.editWidget(updateWidgetJson).exec()
  }, [appConfig, clearSearchFieldAndSortAndSort, id])

  const onDataChange = React.useCallback((newUseDataSources: UseDataSource[]) => {
    const preUseDataSources = useDataSources
    if (newUseDataSources && newUseDataSources.length > 0) {
      onDataSelect(Immutable(newUseDataSources))
    } else {
      onDataRemove(preUseDataSources)
    }
  }, [onDataRemove, onDataSelect, useDataSources])

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const onExportClick = hooks.useEventCallback(evt => {
    // Export list template, use it in a single fullscreen page
    const currentPageId = getAppStore().getState().appStateInBuilder.appRuntimeInfo.currentPageId
    const pageJson =
      appConfig.pages[currentPageId === 'default' ? 'home' : currentPageId]
    const widgets = Immutable(appConfig.widgets.without(id)).set('widget_x', appConfig.widgets[id])
    const pageTemplates = [
      {
        widgetId: id,
        config: {
          layouts: appConfig.layouts.without(
            pageJson.layout?.[browserSizeMode],
            layouts[Status.Selected]?.[browserSizeMode],
            layouts[Status.Hover]?.[browserSizeMode]
          ),
          widgets: widgets,
          views: appConfig.views,
          sections: appConfig.sections
        }
      }
    ]

    const template0 = pageTemplates[0]
    template0.config.layouts &&
      Object.keys(template0.config.layouts).forEach(layoutId => {
        let layoutJson = template0.config.layouts[layoutId].without('id')
        layoutJson.content &&
          Object.keys(layoutJson.content).forEach(lEId => {
            const lEJson = (layoutJson.content[lEId] as any)
              .without('id', 'parentId', 'layoutId')
              .setIn(['setting', 'lockParent'], true)
            layoutJson = layoutJson.setIn(['content', lEId], lEJson)
          })
        template0.config.layouts = template0.config.layouts.set(
          layoutId,
          layoutJson
        )
      })

    template0.config.widgets &&
      Object.keys(template0.config.widgets).forEach((wId, index) => {
        const wJson = template0.config.widgets[wId]
        template0.config.widgets = template0.config.widgets.set(
          wId,
          wJson.without(
            'context',
            'icon',
            'label',
            'manifest',
            'version',
            'id',
            'useDataSourcesEnabled',
            'useDataSources'
          )
        )
      })

    template0.config.sections &&
      Object.keys(template0.config.sections).forEach((sId, index) => {
        const sJson = template0.config.sections[sId]
        template0.config.sections = template0.config.sections.set(
          sId,
          sJson.without('id', 'label')
        )
      })

    template0.config.views &&
      Object.keys(template0.config.views).forEach((vId, index) => {
        const vJson = template0.config.views[vId]
        template0.config.views = template0.config.views.set(
          vId,
          vJson.without('id', 'label')
        )
      })
    console.log(JSON.stringify(pageTemplates[0]))
  })

  return (
    <SettingSection className={classNames(!datasource ? 'no-bottom-border' : '')}>
      {/* <SettingRow label={'export style'}>
        <Button type="primary" onClick={this.onExportClick} >Test</Button>
      </SettingRow> */}
      <SettingRow flow='wrap'>
        <div className='w-100 align-middle d-flex align-items-center'>
          <div className='flex-grow-1 w-100'>
            <Button
              type='tertiary'
              className='resetting-template align-middle'
              onClick={handleResetItemStyleClick}
              disableRipple={true}
              disableHoverEffect={true}
              title={nls('resettingTheTemplate')}
              ref={ref => { setResettingTheTemplateButtonRef(ref) }}
            >
              {nls('resettingTheTemplate')}
            </Button>

            <span className='align-middle'> {nls('customListDesign')}</span>
          </div>
          <Tooltip
            title={nls('listUseGuide')}
            showArrow
            placement='left'
          >
            <Button icon className='list-guide-tip-button' type='tertiary' aria-label={nls('listUseGuide')}>
              <InfoOutlined />
            </Button>
          </Tooltip>
        </div>
      </SettingRow>
      <SettingRow flow='wrap' label={nls('data')} aria-label={nls('data')}>
        {!selectionIsInSelf && (
          <DataSourceSelector
            types={DSSelectorTypes}
            useDataSources={useDataSources}
            mustUseDataSource
            onChange={onDataChange}
            widgetId={id}
            aria-describedby='list-empty-tip'
          />
        )}
      </SettingRow>
      {datasource && <SettingRow flow='wrap' label={nls('noDataMessage')} aria-label={nls('noDataMessage')}>
        <TextInput
          size='sm'
          className='w-100'
          aria-label={nls('noDataMessage')}
          placeholder={nls('noData')}
          defaultValue={config?.noDataMessage || ''}
          onAcceptValue={onNoDataMessageChange}
        />
      </SettingRow>}

      {checkIsDsAutoRefreshSettingOpen(datasource) && <SettingRow tag='label' label={nls('lastUpdateText')} role='group' aria-label={nls('lastUpdateText')}>
        <Switch
          checked={config.isShowAutoRefresh}
          data-field='isShowAutoRefresh'
          onChange={handleFormChange}
          title={nls('lastUpdateText')}
        />
      </SettingRow>}
    </SettingSection>
  )
}
export default DataSetting