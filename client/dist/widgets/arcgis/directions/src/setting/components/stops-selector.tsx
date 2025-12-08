/** @jsx jsx */
import {
  jsx,
  css,
  type ImmutableArray,
  Immutable,
  type UseDataSource,
  React,
  loadArcGISJSAPIModules,
  hooks,
  classNames,
  type IMThemeVariables,
} from 'jimu-core'
import { AlertPopup, Badge, Button, Loading } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import { Global, useTheme } from 'jimu-theme'
import { type IMJimuMapConfig, JimuMap } from 'jimu-ui/advanced/map'
import type { IMConfig } from '../../config'
import { convertSearchConfigToJSAPISearchProperties } from '../../utils'
import defaultMessages from '../translations/default'
import { LocatorOutlined } from 'jimu-icons/outlined/editor/locator'
import type { AllWidgetSettingProps } from 'jimu-for-builder'

interface Props {
  directionsProps?: AllWidgetSettingProps<IMConfig>
  useDataSources?: ImmutableArray<UseDataSource>
  jimuMapConfig?: IMJimuMapConfig
  buttonLabel?: string
  title?: string
  id?: string
  onConfigChanged?: (config: IMJimuMapConfig) => void
}

const getGlobalStyle = (theme: IMThemeVariables, isLocating: boolean) => {
  return css`
    .stops-selector-alert-popup {
      justify-content: center;
      max-width: max-content !important;
      .stops-selector-alert-popup__content {
        width: ${window.innerHeight - 200}px;
        height: ${window.innerHeight - 300}px;
        display: flex;
        flex-direction: column;
        .jimu-map {
          cursor: ${isLocating ? 'crosshair' : ''}
        }
        .search-widget-container {
          --calcite-color-foreground-1: #444;
          display: flex;
          min-height: 32px;
          max-height: 32px;
          overflow: hidden;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          .stops-label {
            width: 178px;
          }
          .locate-button.locating {
            background-color: var(--sys-color-primary-main);
          }
          .search-widget-container__content {
            margin-left: 16px;
            flex: 1;
            .esri-search {
              width: 100%;
            }
          }
        }
      }
    }
  `
}

export function StopsSelector(props: Props) {
  const [isShowDialog, setIsShowDialog] = React.useState(false)
  const [currentJimuMapView, setCurrentJimuMapView] =
    React.useState<JimuMapView>(null)
  const startPointSearchContainerRef = React.useRef(null)
  const endPointSearchContainerRef = React.useRef(null)
  const startSearchWidgetRef = React.useRef(null)
  const endSearchWidgetRef = React.useRef(null)
  const [isLocatingStart, setIsLocatingStart] = React.useState(false)
  const [isLocatingEnd, setIsLocatingEnd] = React.useState(false)
  const translate = hooks.useTranslation(defaultMessages)
  const theme = useTheme()
  const locateHandlerRef = React.useRef(null)
  const startPointRef = React.useRef<{ graphic: __esri.Graphic; name: string }>(null)
  const endPointRef = React.useRef<{ graphic: __esri.Graphic; name: string }>(null)
  const graphicClassRef = React.useRef<typeof __esri.Graphic>(null)
  const searchClassRef = React.useRef<typeof __esri.widgetsSearch>(null)
  const jsonUtilsClassRef = React.useRef<typeof __esri.jsonUtils>(null)
  const [isSearchWidgetReady, setIsSearchWidgetReady] = React.useState(false)
  const [isAllModuleLoaded, setIsAllModuleLoaded] = React.useState(false)
  const [isJmvReady, setIsJmvReady] = React.useState(false)

  const handleClickOk = () => {
    onPresetPointChange(startPointRef.current, endPointRef.current)
    setIsShowDialog(false)
    setIsSearchWidgetReady(false)
    setIsJmvReady(false)
  }

  const handleClickClose = () => {
    startPointRef.current = null
    endPointRef.current = null
    setIsShowDialog(false)
    setIsSearchWidgetReady(false)
    setIsJmvReady(false)
  }

  const showDialog = () => {
    setIsShowDialog(true)
  }

  const handleActiveViewChange = async (jimuMapView: JimuMapView) => {
    setCurrentJimuMapView(jimuMapView)
    await jimuMapView.whenJimuMapViewLoaded()
    setIsJmvReady(true)
  }

  const onPresetPointChange = React.useCallback((startPointRef: { graphic: __esri.Graphic; name: string }, endPointRef: { graphic: __esri.Graphic; name: string }) => {
    let config = props.directionsProps.config
    config = config.setIn(['routeConfig', 'presetStart'], startPointRef ? { name: startPointRef.name, geometry: startPointRef.graphic.geometry.toJSON() } : null)
    config = config.setIn(['routeConfig', 'presetEnd'], endPointRef ? { name: endPointRef.name, geometry: endPointRef.graphic.geometry.toJSON() } : null)

    props.directionsProps.onSettingChange({
      id: props.directionsProps.id,
      config: config
    })
  }, [props.directionsProps])

  const handleSearchResultSelected = React.useCallback((isStart: boolean) => {
    return (event: __esri.SearchSelectResultEvent) => {
      if (!isAllModuleLoaded) {
        return
      }

      const result = event.result // Full result info
      const geometry: __esri.Point = result.feature.geometry as __esri.Point // ✅ Geometry of the selected result
      const name = result.name

      const GraphicClass = graphicClassRef.current
      const symbolColor = isStart ? '#00FF00' : '#FF0000'
      const graphic = new GraphicClass({
        geometry: geometry,
        symbol: {
          type: "simple-marker",
          color: symbolColor,
          size: 12,
          outline: {
            color: "white",
            width: 1
          }
        },
      })

      if (isStart && startPointRef.current) {
        currentJimuMapView.view.graphics.remove(startPointRef.current.graphic)
      }
      if (!isStart && endPointRef.current) {
        currentJimuMapView.view.graphics.remove(endPointRef.current.graphic)
      }

      if (isStart) {
        startPointRef.current = {
          graphic,
          name
        }
      } else {
        endPointRef.current = {
          graphic,
          name
        }
      }

      currentJimuMapView.view.graphics.add(graphic)
    }
  }, [currentJimuMapView?.view?.graphics, isAllModuleLoaded])

  const handleSearchClear = React.useCallback((isStart: boolean) => {
    return () => {
      if (isStart && startPointRef.current) {
        currentJimuMapView?.view?.graphics.remove(startPointRef.current.graphic)
        startPointRef.current = null
      }

      if (!isStart && endPointRef.current) {
        currentJimuMapView?.view?.graphics.remove(endPointRef.current.graphic)
        endPointRef.current = null
      }
    }
  }, [currentJimuMapView?.view?.graphics])

  const handleLocateButtonClick = (isStart: boolean) => {
    return (event) => {
      if (isStart) {
        setIsLocatingEnd(false)
        setIsLocatingStart(!isLocatingStart)
      } else {
        setIsLocatingStart(false)
        setIsLocatingEnd(!isLocatingEnd)
      }
    }
  }

  const toolConfig = {
    canZoom: true,
    canHome: true,
    canSearch: false,
    canCompass: true
  }

  React.useEffect(() => {
    loadAllClasses()

    async function loadAllClasses() {
      if (isAllModuleLoaded) {
        return
      }
      const [Graphic, jsonUtils, Search] = await loadArcGISJSAPIModules(['esri/Graphic', 'esri/geometry/support/jsonUtils', 'esri/widgets/Search'])
      graphicClassRef.current = Graphic
      jsonUtilsClassRef.current = jsonUtils
      searchClassRef.current = Search
      setIsAllModuleLoaded(true)
    }
  }, [isAllModuleLoaded])

  React.useEffect(() => {
    drawConfigStops()

    function drawConfigStops() {
      if (!isSearchWidgetReady || !isAllModuleLoaded) {
        return
      }
      const presetStart = props?.directionsProps.config?.routeConfig?.presetStart
      const presetEnd = props?.directionsProps.config?.routeConfig?.presetEnd
      if (presetStart) {
        const startPoint = jsonUtilsClassRef.current.fromJSON(presetStart.geometry)
        startSearchWidgetRef.current.search(startPoint)
      }
      if (presetEnd) {
        const endPoint = jsonUtilsClassRef.current.fromJSON(presetEnd.geometry)
        endSearchWidgetRef.current.search(endPoint)
      }
    }


  }, [isSearchWidgetReady, props?.directionsProps.config?.routeConfig?.presetEnd, props?.directionsProps.config?.routeConfig?.presetStart, isAllModuleLoaded])

  React.useEffect(() => {
    if (!currentJimuMapView?.view || !isAllModuleLoaded) {
      return
    }
    // Remove old handler first
    if (locateHandlerRef.current) {
      locateHandlerRef.current.remove()
    }
    locateHandlerRef.current = currentJimuMapView.view.on('click', async function handleMapClick(event) {
      // The search action will trigger search-result callback
      const isLocating = isLocatingStart || isLocatingEnd
      if (!isLocating) {
        return
      }
      const clickedPoint = event.mapPoint
      // Only remove the previous start/end point
      if (isLocatingStart && startPointRef.current) {
        currentJimuMapView.view.graphics.remove(startPointRef.current.graphic)
      }
      if (isLocatingEnd && endPointRef.current) {
        currentJimuMapView.view.graphics.remove(endPointRef.current.graphic)
      }

      await (isLocatingStart ? startSearchWidgetRef.current.search(clickedPoint) : endSearchWidgetRef.current.search(clickedPoint))

      if (isLocatingStart) {
        setIsLocatingStart(false)
      } else {
        setIsLocatingEnd(false)
      }
    })
  }, [currentJimuMapView?.view, isLocatingEnd, isLocatingStart, props.directionsProps.config.searchConfig, isAllModuleLoaded])

  hooks.useEffectWithPreviousValues((prev) => {
    const [prevJmv, prevSearchConfig] = prev
    updateSearchWidget()

    async function updateSearchWidget() {
      if (!currentJimuMapView || !isAllModuleLoaded) {
        return
      }
      if (prevJmv === currentJimuMapView && prevSearchConfig === props.directionsProps.config.searchConfig) {
        return
      }

      const Search = searchClassRef.current
      const startContainer = document.createElement('div')
      startContainer.className = 'search-container'
      startPointSearchContainerRef.current.innerHTML = ''
      startPointSearchContainerRef.current.appendChild(startContainer)

      const endContainer = document.createElement('div')
      endContainer.className = 'search-container'
      endPointSearchContainerRef.current.innerHTML = ''
      endPointSearchContainerRef.current.appendChild(endContainer)

      const searchProperties = await convertSearchConfigToJSAPISearchProperties(
        props.directionsProps.config.searchConfig,
        translate('findAddressOrPlace')
      )

      startSearchWidgetRef.current = new Search({
        view: currentJimuMapView.view,
        container: startContainer,
        sources: searchProperties.sources,
        includeDefaultSources: false,
        locationEnabled: false,
        popupEnabled: false
      })

      endSearchWidgetRef.current = new Search({
        view: currentJimuMapView.view,
        container: endContainer,
        sources: searchProperties.sources,
        includeDefaultSources: false,
        locationEnabled: false,
        popupEnabled: false
      })

      await Promise.all([startSearchWidgetRef.current.when(), endSearchWidgetRef.current.when()])

      setIsSearchWidgetReady(true)

      startSearchWidgetRef.current.on('select-result', handleSearchResultSelected(true))
      endSearchWidgetRef.current.on('select-result', handleSearchResultSelected(false))
      startSearchWidgetRef.current.on('search-clear', handleSearchClear(true))
      endSearchWidgetRef.current.on('search-clear', handleSearchClear(false))
    }
  }, [currentJimuMapView, props.directionsProps.config.searchConfig, handleSearchResultSelected, translate, isAllModuleLoaded])

  const jimuMapConfig = props.jimuMapConfig
    ? props.jimuMapConfig.set('toolConfig', toolConfig)
    : Immutable({} as any)

  const isLocating = isLocatingStart || isLocatingEnd
  const hasPresetStops = props.directionsProps.config?.routeConfig?.presetStart || props.directionsProps.config?.routeConfig?.presetEnd

  return (
    <div css={getGlobalStyle(theme, isLocating)}>
      <Global styles={getGlobalStyle(theme, isLocating)} />
      {
        hasPresetStops ?
          <Badge dot color='error'>
            <Button onClick={showDialog}>{props.buttonLabel}</Button>
          </Badge>
          :
          <Button onClick={showDialog}>{props.buttonLabel}</Button>
      }
      <AlertPopup
        className='stops-selector-alert-popup'
        isOpen={isShowDialog}
        title={props.title}
        onClickOk={handleClickOk}
        onClickClose={handleClickClose}
      >
        {!isJmvReady && <Loading></Loading>}
        <div
          className='stops-selector-alert-popup__content'
          style={{
            visibility: !isJmvReady ? 'hidden' : 'visible'
          }}
        >
          <div
            className='w-100 h-100 jimu-map'
            style={{ backgroundColor: 'gray', marginBottom: '0.75rem' }}
          >
            <JimuMap
              id={props.id + 'editor'}
              useDataSources={props.useDataSources}
              jimuMapConfig={jimuMapConfig}
              onActiveViewChange={handleActiveViewChange}
            />
          </div>
          <div className='search-widget-container'>
            <div className='stops-label'>{translate('startPoint')}</div>
            <div className='d-flex search-widget-container__content'>
              <div ref={startPointSearchContainerRef} className='w-100 d-flex' />
              <Button
                className={classNames(
                  'locate-button',
                  isLocatingStart ? 'locating' : ''
                )}
                icon
                onClick={handleLocateButtonClick(true)}
              >
                <LocatorOutlined></LocatorOutlined>
              </Button>
            </div>
          </div>
          <div className='search-widget-container'>
            <div className='stops-label'>{translate('endPoint')}</div>
            <div className='d-flex search-widget-container__content'>
              <div ref={endPointSearchContainerRef} className='w-100 d-flex' />
              <Button
                className={classNames(
                  'locate-button',
                  isLocatingEnd ? 'locating' : ''
                )}
                icon
                onClick={handleLocateButtonClick(false)}
              >
                <LocatorOutlined></LocatorOutlined>
              </Button>
            </div>
          </div>
        </div>
      </AlertPopup>
    </div>
  )
}
