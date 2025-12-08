/** @jsx jsx */
import {
  React,
  jsx,
  Immutable,
  type ImmutableObject,
  type ImmutableArray,
  css,
  hooks
} from 'jimu-core'
import defaultMessages from '.././translations/default'
import { CollapsablePanel } from 'jimu-ui'
import type {
  LayerInfo,
  LayersOption
} from '../../config'
import type { JimuMapView } from 'jimu-arcgis'
import { LayerList } from './layer-list'
import { EmptyLayerMessage } from './empty-layer-message'
import upCircle from 'jimu-icons/svg/outlined/directional/up-circle.svg'
import downCircle from 'jimu-icons/svg/outlined/directional/down-circle.svg'
import * as reactiveUtils from 'esri/core/reactiveUtils'
const { useState, useEffect, useRef } = React

interface SwipeBetweenLayersPanelProps {
  swipeMapViewList: ImmutableObject<{ [mapViewId: string]: LayersOption }>
  activeMapView: JimuMapView
  isAllowDeactivateLayers: boolean
  toggleLayerVisibility: boolean
  handlePanelSelectedLeadingLayers: (list: ImmutableArray<string>) => void
  handlePanelSelectedTrailingLayers: (list: ImmutableArray<string>) => void
  runtimeAddedLayers: ImmutableArray<string>
  handleRuntimePanelSelectedLeadingLayers: (list: ImmutableArray<string>) => void
  handleRuntimePanelSelectedTrailingLayers: (list: ImmutableArray<string>) => void
}

export function SwipeBetweenLayersPanel (props: SwipeBetweenLayersPanelProps) {
  const { swipeMapViewList, activeMapView, isAllowDeactivateLayers, toggleLayerVisibility, handlePanelSelectedLeadingLayers, handlePanelSelectedTrailingLayers, runtimeAddedLayers, handleRuntimePanelSelectedLeadingLayers, handleRuntimePanelSelectedTrailingLayers } = props
  const [showLeadingLayers, setShowLeadingLayers] = useState(false)
  const [showLeadingRuntimeLayers, setShowLeadingRuntimeLayers] = useState(false)
  const [showTrailingRuntimeLayers, setShowTrailingRuntimeLayers] = useState(false)
  const [showTrailingLayers, setShowTrailingLayers] = useState(false)
  const leadingWatchHandlesRef = React.useRef<__esri.WatchHandle[]>([])
  const trailingWatchHandlesRef = React.useRef<__esri.WatchHandle[]>([])
  const runtimeLeadingWatchHandlesRef = React.useRef<__esri.WatchHandle[]>([])
  const runtimeTrailingWatchHandlesRef = React.useRef<__esri.WatchHandle[]>([])
  const translate = hooks.useTranslation(defaultMessages)
  const [leadingLayerList, setLeadingLayerList] = useState<LayerInfo[]>(null)
  const [trailingLayerList, setTrailingLayerList] = useState<LayerInfo[]>(null)
  const [runtimeLeadingLayerList, setRuntimeLeadingLayerList] = useState<LayerInfo[]>([])
  const [runtimeTrailingLayerList, setRuntimeTrailingLayerList] = useState<LayerInfo[]>([])
  const leadingLayerListRef = useRef(leadingLayerList)
  const trailingLayerListRef = useRef(trailingLayerList)
  const runtimeLeadingLayerListRef = useRef(runtimeLeadingLayerList)
  const runtimeTrailingLayerListRef = useRef(runtimeTrailingLayerList)
  const [selectedLeadingLayerList, setSelectedLeadingLayerList] = useState<Immutable.ImmutableArray<string>>(swipeMapViewList?.[activeMapView?.id]?.leadingLayersId || Immutable([]))
  const [selectedTrailingLayerList, setSelectedTrailingLayerList] = useState<Immutable.ImmutableArray<string>>(swipeMapViewList?.[activeMapView?.id]?.trailingLayersId || Immutable([]))
  const [runtimeSelectedLeadingLayerList, setRuntimeSelectedLeadingLayerList] = useState<Immutable.ImmutableArray<string>>(Immutable([]))
  const [runtimeSelectedTrailingLayerList, setRuntimeSelectedTrailingLayerList] = useState<Immutable.ImmutableArray<string>>(Immutable([]))

  const getJimuLayerViewById = async (jimuMapView: JimuMapView, jimuLayerViewId: string) => {
    const jimuLayerView = await jimuMapView.whenJimuLayerViewLoaded(jimuLayerViewId)
    return jimuLayerView
  }

  const handleSwipeList = hooks.useEventCallback((
    isLeading: boolean,
    setLayerList: React.Dispatch<React.SetStateAction<LayerInfo[]>>,
    layerListRef: React.MutableRefObject<LayerInfo[]>,
    handlePanelSelectedLayers: (list: ImmutableArray<string>) => void
  ) => {
    const layersId = isLeading ? 'leadingLayersId' : 'trailingLayersId'
    const layersPromiseArray = swipeMapViewList?.[activeMapView?.id]?.[layersId]?.asMutable()?.map(jimuLayerViewId => {
      return getJimuLayerViewById(activeMapView, jimuLayerViewId)
    })

    if (layersPromiseArray) {
      Promise.all(layersPromiseArray).then(jimuLayerViews => {
        const layerList: LayerInfo[] = jimuLayerViews.map(jimuLayerView => {
          return {
            layerId: jimuLayerView.id,
            title: jimuLayerView.layer.title,
            selected: true,
            visible: jimuLayerView.layer.visible,
            allowOperation: isAllowDeactivateLayers
          }
        })
        setLayerList(layerList)
        layerListRef.current = layerList

        //When the setting changes swipeMapViewList, need to update the changes to runtime swipe layers.
        const selectedList: string[] = []
        layerList?.forEach(layer => {
          if (layer.selected) {
            selectedList.push(layer.layerId)
          }
        })
        handlePanelSelectedLayers(Immutable(selectedList))
      })
    }
  })

  useEffect(() => {
    handleSwipeList(
      true,
      setLeadingLayerList,
      leadingLayerListRef,
      handlePanelSelectedLeadingLayers
    )

    handleSwipeList(
      false,
      setTrailingLayerList,
      trailingLayerListRef,
      handlePanelSelectedTrailingLayers
    )
  }, [swipeMapViewList, activeMapView, isAllowDeactivateLayers, handlePanelSelectedLeadingLayers, handlePanelSelectedTrailingLayers, handleSwipeList])

  useEffect(() => {
    const layerList: LayerInfo[] = runtimeAddedLayers?.asMutable({ deep: true }).map(jimuLayerViewId => {
      const jimuLayerView = activeMapView.jimuLayerViews[jimuLayerViewId]
      return {
        layerId: jimuLayerViewId,
        title: jimuLayerView.layer.title,
        selected: false,
        visible: jimuLayerView.layer.visible,
        allowOperation: true
      }
    })
    setRuntimeLeadingLayerList(layerList)
    runtimeLeadingLayerListRef.current = layerList
    setRuntimeTrailingLayerList(layerList)
    runtimeTrailingLayerListRef.current = layerList

    //When the runtimeAddedLayers changes, need to update the changes to runtime swipe layers.
    const selectedList: string[] = []
    layerList?.forEach(layer => {
      if (layer.selected) {
        selectedList.push(layer.layerId)
      }
    })
    handleRuntimePanelSelectedLeadingLayers(Immutable(selectedList))
    handleRuntimePanelSelectedTrailingLayers(Immutable(selectedList))
  }, [activeMapView, handleRuntimePanelSelectedLeadingLayers, handleRuntimePanelSelectedTrailingLayers, runtimeAddedLayers])

  const watchLayers = hooks.useEventCallback((
    isLeading: boolean,
    layerListRef: React.MutableRefObject<LayerInfo[]>,
    setLayerList: React.Dispatch<React.SetStateAction<LayerInfo[]>>,
    watchHandlesRef: React.MutableRefObject<__esri.WatchHandle[]>
  ) => {
    const layersId = isLeading ? 'leadingLayersId' : 'trailingLayersId'
    const layersPromiseArray = swipeMapViewList?.[activeMapView?.id]?.[layersId]?.asMutable()?.map(jimuLayerViewId => {
      return getJimuLayerViewById(activeMapView, jimuLayerViewId)
    })

    if (layersPromiseArray) {
      Promise.all(layersPromiseArray).then(jimuLayerViews => {
        jimuLayerViews.forEach(jimuLayerView => {
          const newList: __esri.WatchHandle[] = []
          newList.push(reactiveUtils.watch(() => jimuLayerView.layer.visible, (isVisible) => {
            const newList = JSON.parse(JSON.stringify(layerListRef.current))
            newList.forEach(layerObj => {
              if (layerObj.layerId === jimuLayerView.id) {
                layerObj.visible = isVisible
              }
            })
            setLayerList(Immutable(newList))
            layerListRef.current = Immutable(newList)
          }))
          watchHandlesRef.current = newList
        })
      })
    }
  })

  useEffect(() => {
    const leadingHandles = leadingWatchHandlesRef.current
    const trailingHandles = trailingWatchHandlesRef.current

    watchLayers(
      true,
      leadingLayerListRef,
      setLeadingLayerList,
      leadingWatchHandlesRef
    )

    watchLayers(
      false,
      trailingLayerListRef,
      setTrailingLayerList,
      trailingWatchHandlesRef
    )

    return () => {
      leadingHandles.forEach(handle => {
        handle.remove()
        handle = null
      })
      trailingHandles.forEach(handle => {
        handle.remove()
        handle = null
      })
    }
  }, [swipeMapViewList, activeMapView, watchLayers])

  const watchRuntimeLayers = hooks.useEventCallback((
    isLeading: boolean,
    runtimeLayerListRef: React.MutableRefObject<LayerInfo[]>,
    setRuntimeLayerList: React.Dispatch<React.SetStateAction<LayerInfo[]>>,
    runtimeWatchHandlesRef: React.MutableRefObject<__esri.WatchHandle[]>
  ) => {
    const runtimeLayerList = isLeading ? runtimeLeadingLayerList : runtimeTrailingLayerList
    runtimeLayerList.forEach(layerInfoObj => {
      const jimuLayerView = activeMapView.jimuLayerViews[layerInfoObj.layerId]
      const newList: __esri.WatchHandle[] = []
      newList.push(reactiveUtils.watch(() => jimuLayerView.layer.visible, (isVisible) => {
        const newList = JSON.parse(JSON.stringify(runtimeLayerListRef.current))
        newList.forEach(layerObj => {
          if (layerObj.layerId === jimuLayerView.id) {
            layerObj.visible = isVisible
          }
        })
        setRuntimeLayerList(Immutable(newList))
        runtimeLayerListRef.current = Immutable(newList)
      }))
      runtimeWatchHandlesRef.current = newList
    })
  })

  useEffect(() => {
    const leadingHandles = runtimeLeadingWatchHandlesRef.current
    const trailingHandles = runtimeTrailingWatchHandlesRef.current
    watchRuntimeLayers(
      true,
      runtimeLeadingLayerListRef,
      setRuntimeLeadingLayerList,
      runtimeLeadingWatchHandlesRef
    )

    watchRuntimeLayers(
      false,
      runtimeTrailingLayerListRef,
      setRuntimeTrailingLayerList,
      runtimeTrailingWatchHandlesRef
    )

    return () => {
      leadingHandles.forEach(handle => {
        handle.remove()
        handle = null
      })

      trailingHandles.forEach(handle => {
        handle.remove()
        handle = null
      })
    }
  }, [activeMapView, runtimeLeadingLayerList, runtimeTrailingLayerList, watchRuntimeLayers])

  useEffect(() => {
    handlePanelSelectedLeadingLayers(selectedLeadingLayerList)
  }, [handlePanelSelectedLeadingLayers, selectedLeadingLayerList])

  useEffect(() => {
    handlePanelSelectedTrailingLayers(selectedTrailingLayerList)
  }, [handlePanelSelectedTrailingLayers, selectedTrailingLayerList])

  useEffect(() => {
    handleRuntimePanelSelectedLeadingLayers(runtimeSelectedLeadingLayerList)
  }, [handleRuntimePanelSelectedLeadingLayers, runtimeSelectedLeadingLayerList])

  useEffect(() => {
    handleRuntimePanelSelectedTrailingLayers(runtimeSelectedTrailingLayerList)
  }, [handleRuntimePanelSelectedTrailingLayers, runtimeSelectedTrailingLayerList])

  const handleShowLeadingLayers = () => {
    setShowLeadingLayers(!showLeadingLayers)
  }

  const handleShowLeadingRuntimeLayers = () => {
    setShowLeadingRuntimeLayers(!showLeadingRuntimeLayers)
  }

  const handleShowTrailingRuntimeLayers = () => {
    setShowTrailingRuntimeLayers(!showTrailingRuntimeLayers)
  }

  const handleShowTrailingLayers = () => {
    setShowTrailingLayers(!showTrailingLayers)
  }

  const handleSelectedLayers = (
    layerList: LayerInfo[],
    setLayerList: React.Dispatch<React.SetStateAction<LayerInfo[]>>,
    setSelectedLayerList: React.Dispatch<React.SetStateAction<Immutable.ImmutableArray<string>>>,
    layerListRef: React.MutableRefObject<LayerInfo[]>,
    layerId: string
  ) => {
    const newList = JSON.parse(JSON.stringify(layerList))
    newList.forEach(layerObj => {
      if (layerObj.layerId === layerId) {
        layerObj.selected = !layerObj.selected
      }
    })
    setLayerList(Immutable(newList))
    layerListRef.current = newList

    const selectedList: string[] = []
    newList.forEach(layer => {
      if (layer.selected) {
        selectedList.push(layer.layerId)
      }
    })
    setSelectedLayerList(Immutable(selectedList))
  }

  const handleSelectedLeadingLayers = (layerId: string) => {
    handleSelectedLayers(
      leadingLayerList,
      setLeadingLayerList,
      setSelectedLeadingLayerList,
      leadingLayerListRef,
      layerId
    )
  }

  const handleSelectedTrailingLayers = (layerId: string) => {
    handleSelectedLayers(
      trailingLayerList,
      setTrailingLayerList,
      setSelectedTrailingLayerList,
      trailingLayerListRef,
      layerId
    )
  }

  const handleRuntimeSelectedLeadingLayers = (layerId: string) => {
    handleSelectedLayers(
      runtimeLeadingLayerList,
      setRuntimeLeadingLayerList,
      setRuntimeSelectedLeadingLayerList,
      runtimeLeadingLayerListRef,
      layerId
    )
  }

  const handleRuntimeSelectedTrailingLayers = (layerId: string) => {
    handleSelectedLayers(
      runtimeTrailingLayerList,
      setRuntimeTrailingLayerList,
      setRuntimeSelectedTrailingLayerList,
      runtimeTrailingLayerListRef,
      layerId
    )
  }

  const onToggleLayerVisibility = React.useCallback(async (layerId: string) => {
    const jimuLayerView = await getJimuLayerViewById(activeMapView, layerId)
    jimuLayerView.layer.visible = !jimuLayerView.layer.visible
  }, [activeMapView])

  const hasLeadingLayers = swipeMapViewList?.[activeMapView?.id]?.leadingLayersId.length > 0

  const hasTrailingLayers = swipeMapViewList?.[activeMapView?.id]?.trailingLayersId.length > 0

  return (
    <div css={style}>
      <CollapsablePanel
          className='swipe-collapse'
          label={translate('leadingLayers')}
          isOpen={showLeadingLayers}
          aria-label={hasLeadingLayers ? translate('leadingLayers') : (translate('leadingLayers') + ':' + translate('noConfiguredLayerText'))}
          onRequestOpen={handleShowLeadingLayers}
          onRequestClose={handleShowLeadingLayers}
        >
          {hasLeadingLayers
            ? <LayerList
              layerList={leadingLayerList}
              onChange={handleSelectedLeadingLayers}
              isAllowDeactivateLayers={isAllowDeactivateLayers}
              toggleLayerVisibility={toggleLayerVisibility}
              onToggleLayerVisibility={onToggleLayerVisibility}
            />
            : <EmptyLayerMessage swipeLayerMode/>
          }
          {runtimeLeadingLayerList?.length > 0 &&
            <CollapsablePanel
              className='swipe-collapse runtime-layer-collapse'
              label={translate('runtimeLayers')}
              isOpen={showLeadingRuntimeLayers}
              aria-label={translate('runtimeLayers')}
              onRequestOpen={handleShowLeadingRuntimeLayers}
              onRequestClose={handleShowLeadingRuntimeLayers}
              rightIcon={downCircle}
              rightActiveIcon={upCircle}
            >
              <LayerList
                layerList={runtimeLeadingLayerList}
                isAllowDeactivateLayers={true}
                onChange={handleRuntimeSelectedLeadingLayers}
                toggleLayerVisibility={true}
                onToggleLayerVisibility={onToggleLayerVisibility}
              />
            </CollapsablePanel>
          }
        </CollapsablePanel>
        <CollapsablePanel
          className='swipe-collapse'
          label={translate('trailingLayers')}
          isOpen={showTrailingLayers}
          aria-label={hasTrailingLayers ? translate('trailingLayers') : (translate('trailingLayers') + ':' + translate('noConfiguredLayerText'))}
          onRequestOpen={handleShowTrailingLayers}
          onRequestClose={handleShowTrailingLayers}
        >
          {hasTrailingLayers
            ? <LayerList
              layerList={trailingLayerList}
              onChange={handleSelectedTrailingLayers}
              isAllowDeactivateLayers={isAllowDeactivateLayers}
              toggleLayerVisibility={toggleLayerVisibility}
              onToggleLayerVisibility={onToggleLayerVisibility}
            />
            : <EmptyLayerMessage swipeLayerMode/>
          }
          {runtimeTrailingLayerList?.length > 0 &&
            <CollapsablePanel
              className='swipe-collapse runtime-layer-collapse'
              label={translate('runtimeLayers')}
              isOpen={showTrailingRuntimeLayers}
              aria-label={translate('runtimeLayers')}
              onRequestOpen={handleShowTrailingRuntimeLayers}
              onRequestClose={handleShowTrailingRuntimeLayers}
              rightIcon={downCircle}
              rightActiveIcon={upCircle}
            >
              <LayerList
                layerList={runtimeTrailingLayerList}
                isAllowDeactivateLayers={true}
                onChange={handleRuntimeSelectedTrailingLayers}
                toggleLayerVisibility={true}
                onToggleLayerVisibility={onToggleLayerVisibility}
              />
            </CollapsablePanel>
          }
        </CollapsablePanel>
    </div>
  )
}

const style = css`
.swipe-collapse {
  margin-top: 16px;
  .title {
    font-weight: 600;
  }
}
.runtime-layer-collapse {
  .title {
    font-size: 13px;
    font-weight: 500;
  }
}
.layer-list {
  margin-top: 12px;
  margin-bottom: 16px;
}
.no-layer-placeholder {
  margin-top: 16px;
  margin-bottom: 16px;
}
`
