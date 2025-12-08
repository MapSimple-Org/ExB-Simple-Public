/** @jsx jsx */
import { React, jsx, Immutable, css, type IMThemeVariables } from 'jimu-core'
import { Button, ImageFillMode, type ImageParam, Select, Tab, Tabs, TextArea } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { ImageSelector } from 'jimu-ui/advanced/resource-selector'
import { List, TreeItemActionType, type UpdateTreeActionDataType, type TreeRenderOverrideItemDataType, type _TreeItem, TreeStyle } from 'jimu-ui/basic/list-tree'
import { WidgetMapOutlined } from 'jimu-icons/outlined/brand/widget-map'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'
import { ImgSourceType, type Bookmark, TemplateType } from '../../config'
import { BookmarkListTitle } from './bookmark-list-title'

interface BookmarkListProps {
  theme: IMThemeVariables
  bookmarks: Immutable.ImmutableArray<Bookmark>
  templateType: TemplateType
  activeId: number | string
  expandedId: number | string
  widgetId: string
  onSelect: (bookmark: Bookmark) => void
  onEdit: (bookmark: Bookmark) => void
  onDelete: (bookmark: Bookmark) => void
  onExpand: (bookmark: Bookmark) => void
  onSort: (curIndex: number, newIndex: number) => void
  onPropertyChange: (name: string, value: any) => void
  formatMessage: (id: string, values?: any) => string
}

export const BookmarkList = (props: BookmarkListProps) => {
  const {
    theme,
    bookmarks,
    templateType,
    activeId,
    expandedId,
    widgetId,
    onSelect,
    onEdit,
    onDelete,
    onExpand,
    onSort,
    onPropertyChange,
    formatMessage
  } = props

  const listStyles = css`
    width: 100%;
    .jimu-tree-item__droppable, .jimu-tree-item__draggable, .jimu-tree-item__body {
      width: 100%;
    }
    .jimu-tree-main {
      overflow: hidden;
    }
    .jimu-tree-item__main-line {
      height: 32px;
      background-color: var(--sys-color-divider-tertiary);
    }
    .jimu-tree-item__body {
      background-color: transparent !important;
      &:after {
        height: 32px;
      }
    }
    .bookmark-input-textarea textarea {
      resize: none;
    }
  `

  const itemsJson = bookmarks.asMutable().map(bookmark => {
    const noImgType = [TemplateType.List, TemplateType.Custom1, TemplateType.Custom2]
    return {
      itemKey: bookmark.id.toString(),
      itemStateExpanded: expandedId === bookmark.id && !noImgType.includes(templateType),
      itemStateChecked: activeId === bookmark.id
    }
  })

  const onUpdateItem = (actionData: UpdateTreeActionDataType, refComponent: _TreeItem) => {
    if (actionData.updateType === 'handleDidDrop') {
      const { dragItemIndex, targetDropItemIndex } = actionData
      onSort?.(dragItemIndex, targetDropItemIndex)
    }
  }

  const updateBookmark = (bookmarkId: string, key: string, value: any) => {
    const newBookmarks = bookmarks.map((item) => item.id.toString() === bookmarkId ? item.set(key, value) : item)
    onPropertyChange('bookmarks', newBookmarks)
  }

  const [bookmarkLabels, setBookmarkLabels] = React.useState(Immutable({}))

  React.useEffect(() => {
    let bookmarkLabels = Immutable({})
    bookmarks.forEach(item => {
      bookmarkLabels = bookmarkLabels.set(item.id.toString(), item.name)
    })
    setBookmarkLabels(bookmarkLabels)
  }, [bookmarks])

  const renderOverrideItemTitle = (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const item = refComponent.props.itemJsons[0]
    const bookmarkId = item.itemKey
    const bookmark = bookmarks.find(b => b.id.toString() === item.itemKey)

    const handleBookmarkNameChange = (inputValue: string) => {
      const newBookmarkLabel = bookmarkLabels.set(bookmarkId, inputValue)
      setBookmarkLabels(newBookmarkLabel)
    }

    const handleBookmarkNameBlur = (value: string) => {
      const bookmark = bookmarks.find(item => item.id.toString() === bookmarkId)
      const cleanValue = value.trim()
      const newValue = cleanValue === '' ? bookmark.name : value
      updateBookmark(bookmarkId, 'name', newValue)
    }

    const selectBookmark = () => {
      onSelect(bookmark)
    }

    return <BookmarkListTitle
      bookmarkLabel={bookmarkLabels[bookmarkId]}
      onBookmarkNameChange={handleBookmarkNameChange}
      onBookmarkNameBlur={handleBookmarkNameBlur}
      onClickBookmarkName={selectBookmark}
    />
  }

  const renderOverrideItemDetailToggle = (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const item = refComponent.props.itemJsons[0]
    const bookmark = bookmarks.find(b => b.id.toString() === item.itemKey)
    const selectBookmark = () => {
      onSelect(bookmark)
    }

    return <div className='h-100 flex-grow-1' onClick={selectBookmark} />
  }

  const renderOverrideItemCommands = (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const styles = css`
      button {
        padding: 0 !important;
      }
      .active-setting {
        background-color: ${theme.sys.color.primary.main};
        color: ${theme.sys.color.primary.text};
      }
    `
    const item = refComponent.props.itemJsons[0]
    const bookmark = bookmarks.find(b => b.id.toString() === item.itemKey)
    const noImgType = [TemplateType.List, TemplateType.Custom1, TemplateType.Custom2]

    const editBookmark = () => {
      onEdit(bookmark)
    }
    const deleteBookmark = () => {
      onDelete(bookmark)
    }
    const expandBookmark = () => {
      onExpand(bookmark)
    }

    return (
    <div css={styles} className='d-flex align-items-center justify-content-end'>
      <Button
        title={formatMessage('changeBookmarkView')}
        onClick={editBookmark}
        type='tertiary'
        icon
        onKeyDown={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault()
            evt.stopPropagation()
          }
        }}
        onKeyUp={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.stopPropagation()
            editBookmark()
          }
        }}
      >
        <WidgetMapOutlined size='m' />
      </Button>
      {!noImgType.includes(templateType) &&
      <Button
        title={formatMessage('bookmarkDetailSetting')}
        onClick={expandBookmark}
        type='tertiary'
        icon
        active={bookmark.id === expandedId}
        className={bookmark.id === expandedId ? 'active-setting' : ''}
        onKeyDown={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault()
            evt.stopPropagation()
          }
        }}
        onKeyUp={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.stopPropagation()
            expandBookmark()
          }
        }}
      >
        <SettingOutlined size='m' />
      </Button>}
      <Button
        title={formatMessage('deleteOption')}
        onClick={deleteBookmark}
        type='tertiary'
        icon
        onKeyDown={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault()
            evt.stopPropagation()
          }
        }}
        onKeyUp={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.stopPropagation()
            deleteBookmark()
          }
        }}
      >
        <CloseOutlined size='m' />
      </Button>
    </div>)
  }

  const renderOverrideItemDetailLine = (actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const styles = css`
      width: 100%;
      border: 1px solid var(--sys-color-divider-tertiary);
      border-width: 0 1px 1px;
      padding: 8px;
    `
    const item = refComponent.props.itemJsons[0]
    const bookmarkId = item.itemKey
    if (bookmarkId !== expandedId.toString()) return null
    const bookmark = bookmarks.find(b => b.id.toString() === bookmarkId)
    const handleTabSelect = (imgSourceType: ImgSourceType) => {
      updateBookmark(bookmarkId, 'imgSourceType', ImgSourceType[imgSourceType])
    }

    const handleResourceChange = (imageParam: ImageParam) => {
      updateBookmark(bookmarkId, 'imgParam', imageParam)
    }

    const handleImageFillModeChange = (e: any) => {
      updateBookmark(bookmarkId, 'imagePosition', e.target.value)
    }

    const onBookmarkTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateBookmark(bookmarkId, 'description', e.target.value)
    }

    const imgName = bookmark?.imgParam?.originalName
    const slideType = [TemplateType.Slide1, TemplateType.Slide2, TemplateType.Slide3]

    return <div css={styles}>
      <div aria-label={formatMessage('imageSource')} role='group'>
        <SettingRow label={formatMessage('imageSource')} className='mb-2' />
        <Tabs fill type='pills' onChange={handleTabSelect} value={bookmark.imgSourceType === ImgSourceType.Custom ? 'Custom' : 'Snapshot'}>
          <Tab id='Snapshot' title={formatMessage('imageSnapshot')}>
            <div className='mt-2' />
          </Tab>
          <Tab id='Custom' title={formatMessage('custom')}>
            <div className='mt-2'>
              <SettingRow>
                <div className='w-100 d-flex align-items-center mb-1 mt-1'>
                  <div style={{ minWidth: '60px' }}>
                    <ImageSelector
                      buttonClassName='text-dark d-flex justify-content-center btn-browse'
                      widgetId={widgetId}
                      buttonLabel={formatMessage('setAnImage')}
                      buttonSize='sm'
                      onChange={handleResourceChange}
                      imageParam={bookmark.imgParam}
                    />
                  </div>
                  <div style={{ width: '70px' }} className='uploadFileName ml-2 text-truncate' title={imgName || formatMessage('none')}>
                    {imgName || formatMessage('none')}
                  </div>
                </div>
              </SettingRow>
            </div>
          </Tab>
        </Tabs>
      </div>
      <SettingRow label={formatMessage('imagePosition')} className='mt-2' truncateLabel>
        <div style={{ width: '40%' }}>
          <Select size='sm' value={bookmark.imagePosition} onChange={handleImageFillModeChange} aria-label={formatMessage('imagePosition')}>
            <option key={0} value={ImageFillMode.Fill}>{formatMessage('fill')}</option>
            <option key={1} value={ImageFillMode.Fit}>{formatMessage('fit')}</option>
          </Select>
        </div>
      </SettingRow>
      {(slideType.includes(templateType)) &&
        <SettingRow flow='wrap' label={formatMessage('description')} className='mb-2' role='group' aria-label={formatMessage('description')}>
          <TextArea
            className='w-100 bookmark-input-textarea'
            title={bookmark.description}
            value={bookmark.description || ''}
            onChange={onBookmarkTextChange}
            spellCheck={false}
          />
        </SettingRow>}
    </div>
  }

  const overrideItemBlockInfo = () => {
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
              }, {
                name: TreeItemActionType.RenderOverrideItemDetailToggle
              }, {
                name: TreeItemActionType.RenderOverrideItemCommands
              }]
            }, {
              name: TreeItemActionType.RenderOverrideItemDetailLine
            }]
          }]
        }]
      }]
    }
  }

  return (
    <List
      css={listStyles}
      itemsJson={itemsJson}
      dndEnabled
      isMultiSelection={false}
      treeStyle={TreeStyle.Card}
      renderOverrideItemTitle={renderOverrideItemTitle}
      renderOverrideItemDetailToggle={renderOverrideItemDetailToggle}
      renderOverrideItemCommands={renderOverrideItemCommands}
      renderOverrideItemDetailLine={renderOverrideItemDetailLine}
      onUpdateItem={onUpdateItem}
      overrideItemBlockInfo= {overrideItemBlockInfo}
    />
  )
}
