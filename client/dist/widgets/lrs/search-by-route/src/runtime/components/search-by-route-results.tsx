/** @jsx jsx */
import {
  React,
  jsx,
  css,
  ReactRedux,
  type IMState,
  type DataSource,
  type DataRecord,
  DataSourceComponent,
  DataSourceManager,
  Immutable,
  hooks,
  type DataRecordSet,
  type ImmutableObject,
  type IntlShape,
  type FeatureLayerDataSource,
  focusElementInKeyboardMode,
  type ImmutableArray
} from 'jimu-core'
import { Button, Tooltip, DataActionList, DataActionListStyle } from 'jimu-ui'
import type { Style } from '../../config'
import { SearchByRouteResultList } from './search-by-route-result-list'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import type { JimuMapView } from 'jimu-arcgis'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import defaultMessages from '../translations/default'
import { isDefined, networkObjectIdField, type LrsLayer, type SearchMethod } from 'widgets/shared-code/lrs'

export interface SearchByRouteResultProps {
  lrsLayers: ImmutableArray<LrsLayer>
  widgetId: string
  resultCount: number
  maxPerPage: number
  outputDS: DataSource
  inputDS: DataSource
  isPoint: boolean
  lrsLayer: ImmutableObject<LrsLayer>
  selectedMethod: SearchMethod
  defaultPageSize: number
  records: DataRecord[]
  routeRecords: DataRecord[]
  jimuMapView: JimuMapView
  highlightStyle: Style
  onNavBack: () => void
  intl: IntlShape
  measureType?: string
}

const resultStyle = css`
  display: flex;
  flex-direction: column;

  .search-by-route-result__header {
    color: var(--sys-color-surface-backgroundHint);
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
  }

  .search-by-route-result-container {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow: auto
  }

  .search-by-route-result-info {
    height: 18px;
  }
`

export function SearchTaskResult (props: SearchByRouteResultProps) {
  const {
    lrsLayers,
    lrsLayer,
    selectedMethod,
    resultCount,
    maxPerPage,
    records,
    routeRecords,
    defaultPageSize,
    widgetId,
    outputDS,
    inputDS,
    isPoint,
    jimuMapView,
    highlightStyle,
    intl,
    measureType,
    onNavBack
  } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [networkData, setNetworkData] = React.useState(null)
  const [selectedRecords, setSelectedRecords] = React.useState<DataRecord[]>([])
  const [highlightLayer, setHighlightLayer] = React.useState<GraphicsLayer>(null)
  const [flashLayer, setFlashLayer] = React.useState<GraphicsLayer>(null)
  const backBtnRef = React.useRef<HTMLButtonElement>(null)

  // Checks if data action is enabled.
  const enableDataAction = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.enableDataAction ?? true
  })

  // Sets the data action record set for the current page or selection.
  const actionDataSet: DataRecordSet = React.useMemo(() => {
    const originDs: FeatureLayerDataSource = outputDS?.getOriginDataSources()[0] as FeatureLayerDataSource
    const layerDefinition = originDs?.getLayerDefinition()
    let showOnlyOne = false
    const newDataRecords = []
    routeRecords?.forEach((item) => {
      const record = item.clone()
      if (record.getFieldValue(networkObjectIdField.value) && record.getFieldValue(networkObjectIdField.value).length > 0) {
        record.getData()[layerDefinition.objectIdField] = record.getFieldValue(networkObjectIdField.value)
        showOnlyOne = true
      }
      newDataRecords.push(record)
    })

    return {
      dataSource: showOnlyOne ? outputDS?.getOriginDataSources()[0] : outputDS,
      type: selectedRecords?.length > 0 ? 'selected' : 'loaded',
      records: showOnlyOne ? newDataRecords : (selectedRecords?.length > 0 ? selectedRecords : networkData?.records),
      name: outputDS?.getLabel()
    }
  }, [routeRecords, selectedRecords, outputDS, networkData])

  hooks.useEffectOnce(() => {
    focusElementInKeyboardMode(backBtnRef.current)
  })

  // Sets the current page results and intializes graphic layers if not set.
  React.useEffect(() => {
    setNetworkData({ records, pageSize: defaultPageSize, page: 1 })
    if (!(highlightLayer && flashLayer) && jimuMapView) {
      const newHighlightLayer = new GraphicsLayer({ listMode: 'hide' })
      const newFlashLayer = new GraphicsLayer({ listMode: 'hide' })
      jimuMapView?.view?.map?.addMany([newHighlightLayer, newFlashLayer])
      setHighlightLayer(newHighlightLayer)
      setFlashLayer(newFlashLayer)
    }
  }, [records, defaultPageSize, jimuMapView?.view?.map, highlightLayer, flashLayer, jimuMapView])

  // Sets the current page results when the page is changed.
  const handleRenderDone = React.useCallback(({ dataItems, pageSize, page }) => {
    setNetworkData({ records: dataItems, pageSize, page })
  }, [])

  // Clears graphics and current results, then goes back to form.
  const handleBack = () => {
    destroyGraphicsLayers()
    onNavBack()
    setNetworkData(null)
  }

  // Gets a results message for the current page.
  const getResultsMessage = React.useCallback(() => {
    if (networkData) {
      const from = (networkData.page - 1) * networkData.pageSize + 1
      const to = from + networkData.pageSize - 1
      if (resultCount > 0) {
        return `${getI18nMessage('resultsDisplay')} ${from} - ${Math.min(to, resultCount)} / ${resultCount}`
      }
      return `${getI18nMessage('resultsDisplay')}: 0 - 0 / 0`
    }
    return ''
  }, [networkData, resultCount, getI18nMessage])

  // Set focus on back button if escape is pressed.
  const handleEscape = React.useCallback((evt) => {
    if (evt.key === 'Escape') {
      evt.stopPropagation()
      focusElementInKeyboardMode(backBtnRef.current)
    }
  }, [])

  // Removes the graphic layers.
  const destroyGraphicsLayers = () => {
    if (highlightLayer) {
      highlightLayer.removeAll()
      highlightLayer.destroy()
      setHighlightLayer(null)
    }
    if (flashLayer) {
      flashLayer.removeAll()
      flashLayer.destroy()
      setFlashLayer(null)
    }
  }

  // Sets output useSource for DataSourceComponent.
  const resultUseOutputDataSource = React.useMemo(() => {
    return Immutable({
      dataSourceId: isPoint ? lrsLayer.networkInfo.outputPointDsId : lrsLayer.networkInfo.outputLineDsId,
      mainDataSourceId: isPoint ? lrsLayer.networkInfo.outputPointDsId : lrsLayer.networkInfo.outputLineDsId
    })
  }, [lrsLayer.networkInfo.outputLineDsId, lrsLayer.networkInfo.outputPointDsId, isPoint])

  // Updates selection when changed. Will update data action selection.
  const handleDataSourceInfoChange = React.useCallback(() => {
    if (!isDefined(selectedRecords, false)) return
    const ds = DataSourceManager.getInstance().getDataSource(outputDS?.id)
    const records = ds?.getSelectedRecords()
    const selectedIds = ds?.getSelectedRecordIds() ?? []
    let shouldUpdate = false
    if (selectedIds.length !== selectedRecords.length) {
      shouldUpdate = true
    } else {
      shouldUpdate = selectedIds.some(id => {
        const target = selectedRecords.find((item) => item.getId() === id)
        return target == null
      })
    }
    if (shouldUpdate) {
      setSelectedRecords(records)
    }
  }, [outputDS?.id, selectedRecords])

  return (
    <div className='search-by-route-result h-100 pt-3' onKeyUp={handleEscape} css={resultStyle} role='listbox' aria-label={getI18nMessage('results')}>
      <DataSourceComponent
        useDataSource={resultUseOutputDataSource}
        onDataSourceInfoChange={handleDataSourceInfoChange} />
      <div className='search-by-route-result__header d-flex align-items-center px-3'>
        <Tooltip title={getI18nMessage('backLabel')}>
          <Button
            ref={backBtnRef}
            className='p-0 mr-2'
            size='sm'
            type='tertiary'
            icon onClick={() => { handleBack() }}>
            <ArrowLeftOutlined autoFlip/>
          </Button>
        </Tooltip>
        {lrsLayer.name}
        {networkData?.records?.length > 0 && enableDataAction && (
          <React.Fragment>
            <div className='ml-auto'>
            <DataActionList
              widgetId={widgetId}
              dataSets={[actionDataSet]}
              listStyle={DataActionListStyle.Dropdown}
              buttonSize='sm'
              buttonType='tertiary'
            />
            </div>
          </React.Fragment>
        )}
      </div>
      <div className='search-by-route-result-container mt-1'>
        <div className='search-by-route-result-info mb-2 px-3' role='alert' aria-live='polite'>
          {getResultsMessage()}
        </div>
        { resultCount > 0 && (
          <SearchByRouteResultList
            lrsLayers={lrsLayers}
            widgetId={widgetId}
            lrsLayer={lrsLayer}
            selectedMethod={selectedMethod}
            measureType={measureType}
            outputDS={outputDS as any}
            inputDS={inputDS as any}
            resultCount={resultCount}
            maxPerPage={maxPerPage}
            records={records}
            highlightGraphicsLayer={highlightLayer}
            flashGraphicsLayer={flashLayer}
            highlightStyle={highlightStyle}
            jimuMapView={jimuMapView}
            onRenderDone={handleRenderDone}
            defaultPageSize={defaultPageSize}
            intl={intl}
          />
        )}
      </div>
    </div>
  )
}
