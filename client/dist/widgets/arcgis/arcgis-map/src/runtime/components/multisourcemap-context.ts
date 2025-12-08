import { React, type IMThemeVariables } from 'jimu-core'

interface MultiSourceMapContextType {
  mapWidgetId: string
  mapWidgetHeight: number
  isShowMapSwitchBtn: boolean
  isFullScreen: boolean
  dataSourceIds: string[]
  activeDataSourceId: string
  switchMap: () => void
  fullScreenMap: () => void
  initialMapState: any
  mobilePanelContainer: HTMLDivElement
  onMobilePanelContentChange: (MobilePanelContent: React.JSX.Element) => void
  theme: IMThemeVariables
}

export const MultiSourceMapContext = React.createContext<MultiSourceMapContextType>({
  mapWidgetId: null,
  mapWidgetHeight: null,
  isShowMapSwitchBtn: false,
  isFullScreen: false,
  dataSourceIds: [],
  activeDataSourceId: null,
  switchMap: () => null,
  fullScreenMap: () => null,
  initialMapState: null,
  mobilePanelContainer: null,
  onMobilePanelContentChange: (MobilePanelContent: React.JSX.Element) => null,
  theme: null
})
