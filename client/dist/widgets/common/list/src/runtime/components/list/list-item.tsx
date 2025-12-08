/** @jsx jsx */
import { jsx, React, AppMode, ReactRedux, Immutable, RepeatedDataSourceProvider, type IMState, type RepeatedDataSource } from 'jimu-core'
import ListCardViewer from './list-card-viewer'
import DynamicStyleResolver from './list-dynamic-style-resolver'
import type { ListItemData, IMDynamicStyleOfCard } from '../../../config'
import { ListLayoutType } from '../../../config'
import { getItemRowCount, getItemIndexByRowAndColumnIndex, getItemColumnCount } from '../../utils/list-element-util'
import { isProviderEqual } from '../../utils/utils'
import MaskOfListItem from './list-item-mask'
import { useEffect } from 'react'
const { useRef, useState, Fragment } = React
let ListCardEditor
interface Props {
  data: ListItemData[]
  index: number
  isScrolling: boolean
  style: any
  columnIndex?: number
  rowIndex?: number
}
const ListItem = (props: Props) => {
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)

  const { data, index, style, isScrolling, columnIndex, rowIndex } = props
  const currentItemIndexRef = useRef(0)
  const providerDataRef = useRef({} as RepeatedDataSource)

  const [dynamicStyleOfCard, setDynamicStyleOfCard ] = useState(Immutable({}) as IMDynamicStyleOfCard)
  const [providerData, setProviderData] = useState({} as RepeatedDataSource)
  const [previewDynamicStyle, setPreviewDynamicStyle] = useState(false)

  if (!ListCardEditor) {
    const { builderSupportModules } = data?.[0] || {}
    ListCardEditor = builderSupportModules?.widgetModules?.ListCardEditor
  }

  const getIsEditor = React.useCallback((data, index, columnIndex, rowIndex) => {
    if (!data?.[0]) return false
    const currentItemIndex = getNewCurrentItemIndex(data, index, columnIndex, rowIndex)
    const isEditor = currentItemIndex === 0 && window.jimuConfig.isInBuilder && appMode === AppMode.Design
    return isEditor
  }, [appMode])

  const getNewCurrentItemIndex = (data, index, columnIndex, rowIndex): number => {
    if (!data?.[0]) return 0
    const { config, widgetRect, currentCardSize } = data[0]
    const getItemIndexByRowAndColumnIndexOption = {
      rowIndex: rowIndex || 0,
      columnIndex: columnIndex || 0,
      config,
      widgetRect,
      currentCardSize
    }
    const currentItemIndex = config?.layoutType === ListLayoutType.GRID ? getItemIndexByRowAndColumnIndex(getItemIndexByRowAndColumnIndexOption) : index
    return currentItemIndex
  }

  const getShowListItem = React.useCallback((data, index, columnIndex, rowIndex): boolean => {
    const currentItemIndex = getNewCurrentItemIndex(data, index, columnIndex, rowIndex)
    const showListItem = data?.length >= (currentItemIndex + 1)
    return showListItem
  }, [])

  currentItemIndexRef.current = getNewCurrentItemIndex(data, index, columnIndex, rowIndex)

  const isEditor = React.useMemo(() => {
    return getIsEditor(data, index, columnIndex, rowIndex)
  }, [columnIndex, data, getIsEditor, index, rowIndex])

  const isShowListItem = React.useMemo(() => {
    return getShowListItem(data, index, columnIndex, rowIndex)
  }, [columnIndex, data, getShowListItem, index, rowIndex])

  const currentItemIndex = React.useMemo(() => {
    return getNewCurrentItemIndex(data, index, columnIndex, rowIndex)
  }, [columnIndex, data, index, rowIndex])

  const getListItemStyle = (data: ListItemData[]) => {
    const { config } = data[0]
    let listItemStyle
    switch (config?.layoutType) {
      case ListLayoutType.Column:
        listItemStyle = {
          width: `${parseFloat(style.width) - config.space}px`,
          height: '100%'
        }
        break
      case ListLayoutType.Row:
        listItemStyle = {
          width: '100%',
          height: `${parseFloat(style.height) - config.space}px`
        }
        break
      case ListLayoutType.GRID:
        listItemStyle = {
          height: `${parseFloat(style.height) - config?.verticalSpace}px`,
          width: `${parseFloat(style?.width) - config?.horizontalSpace}px`
        }
        break
    }
    return listItemStyle
  }

  //The size of list item content
  const getStyleOfListItemCon = (data: ListItemData[]) => {
    const { config, recordLength, widgetRect, currentCardSize } = data[0]
    let newStyle = style
    const currentColumnIndex = columnIndex || 0
    const currentRowIndex = rowIndex || 0
    const rowCount = getItemRowCount(recordLength, config, widgetRect, currentCardSize)
    const columnCount = getItemColumnCount(config, widgetRect, currentCardSize)
    const isLastItem = recordLength - 1 === index

    switch (config?.layoutType) {
      case ListLayoutType.Column:
        newStyle = {
          ...newStyle,
          width: isLastItem ? `${parseFloat(newStyle.width) - config.space}px` : `${parseFloat(newStyle.width)}px`
        }
        break
      case ListLayoutType.Row:
        newStyle = {
          ...newStyle,
          height: isLastItem ? `${parseFloat(newStyle.height) - config.space}px` : `${parseFloat(newStyle.height)}px`
        }
        break
      case ListLayoutType.GRID:
        newStyle = {
          ...newStyle,
          height: rowCount === (currentRowIndex + 1) ? `${parseFloat(newStyle.height) - config?.verticalSpace}px` : `${parseFloat(newStyle.height)}px`,
          width: columnCount === (currentColumnIndex + 1) ? `${parseFloat(newStyle?.width) - config?.horizontalSpace}px` : `${parseFloat(newStyle?.width)}px`
        }
        break
    }
    return newStyle
  }

  const handleDynamicStyleChange = (dynamicStyleOfCard: IMDynamicStyleOfCard) => {
    setDynamicStyleOfCard(dynamicStyleOfCard)
  }

  const itemProps = (data: ListItemData[], dynamicStyleOfCard: IMDynamicStyleOfCard) => {
    return {
      ...data[currentItemIndexRef.current],
      dynamicStyleOfCard: dynamicStyleOfCard
    }
  }

  const updatePreviewDynamicStyle = (isPreview: boolean) => {
    setPreviewDynamicStyle(isPreview)
  }

  useEffect(() => {
    getNewProviderData(data)
  }, [data, index, columnIndex, rowIndex])

  const getNewProviderData = (data: ListItemData[]) => {
    const dataItem = data[currentItemIndexRef.current]
    const newProviderData = {
      widgetId: dataItem?.widgetId,
      dataSourceId: dataItem?.datasourceId,
      recordIndex: dataItem?.index,
      record: dataItem?.record
    }
    const osNotChange = isProviderEqual(newProviderData, providerDataRef.current)
    if (!osNotChange) {
      providerDataRef.current = newProviderData
      setProviderData(newProviderData)
    }
  }

  const dataItem = data[currentItemIndexRef.current]
  return (<Fragment>
    {isShowListItem && <div style={getStyleOfListItemCon(data)}>
      <RepeatedDataSourceProvider data={providerData}>
        <Fragment>
          {/* In the builder, the ListCardEditor within the first list item cannot be unloaded, as this may cause children to be lost during animation execution, leading to animation problems.
          * This is a special handling method implemented to address animation issues. https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder/issues/26880
          */}
          {currentItemIndex === 0 && ListCardEditor && window.jimuConfig.isInBuilder && <ListCardEditor
            {...itemProps(data, dynamicStyleOfCard)}
            listStyle={getListItemStyle(data)}
            itemIdex={currentItemIndexRef.current}
            isScrolling={isScrolling}
            previewDynamicStyle={previewDynamicStyle}
            className={!isEditor ? 'sr-only' : ''}
          />}
          {!isEditor && <ListCardViewer
            {...itemProps(data, dynamicStyleOfCard)}
            listStyle={getListItemStyle(data)}
            itemIdex={currentItemIndexRef.current}
            isScrolling={isScrolling}
            previewDynamicStyle={previewDynamicStyle}
          />}
          {(dataItem?.record) && dataItem?.config?.cardConfigs && <Fragment>
            <DynamicStyleResolver
              cardConfig={dataItem?.config?.cardConfigs}
              id={dataItem?.widgetId}
              dynamicStyleOfCard={dynamicStyleOfCard}
              useDataSources={dataItem?.useDataSources}
              handleDynamicStyleChange={handleDynamicStyleChange}
            />
            <MaskOfListItem
              config={dataItem?.config}
              id={dataItem?.widgetId}
              recordIndex={currentItemIndexRef.current}
              previewDynamicStyle={previewDynamicStyle}
              updatePreviewDynamicStyle={updatePreviewDynamicStyle}
            />
          </Fragment>}
        </Fragment>
      </RepeatedDataSourceProvider>
    </div>}
  </Fragment>)
}

export default ListItem
