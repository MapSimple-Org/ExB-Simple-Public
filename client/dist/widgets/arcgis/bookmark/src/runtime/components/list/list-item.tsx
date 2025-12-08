import { React, type ImmutableArray, type ImmutableObject, classNames, Immutable, hooks } from 'jimu-core'
import { Button, Paper, TextInput } from 'jimu-ui'
import { TrashFilled } from 'jimu-icons/filled/editor/trash'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import type { Bookmark, IMConfig } from '../../../config'
import defaultMessages from '../../translations/default'
import { PinOutlined } from 'jimu-icons/outlined/application/pin'

interface ListItemProps {
  config: IMConfig
  bookmarks: ImmutableArray<Bookmark>
  runtimeBookmarkArray: string[]
  runtimeBmItemsInfo: { [itemId: string]: Bookmark }
  highLightIndex: number
  runtimeHighLightIndex: number
  onViewBookmark: (item: ImmutableObject<Bookmark>, isRuntime?: boolean, index?: number) => void
  handleRuntimeTitleChange: (rbmId: string, event: any) => void
  onRuntimeBookmarkNameChange: (rbmId: string, newName: string) => void
  onRuntimeAdd: () => Promise<void>
  onRuntimeDelete: (evt: React.MouseEvent<HTMLButtonElement>, rbmId: string) => void
}

export function ListItem (props: ListItemProps) {
  const { config, bookmarks, runtimeBookmarkArray, runtimeBmItemsInfo, highLightIndex, runtimeHighLightIndex, onViewBookmark, handleRuntimeTitleChange, onRuntimeBookmarkNameChange, onRuntimeAdd, onRuntimeDelete } = props

  const { runtimeAddAllow, hideIcon } = config

  const translate = hooks.useTranslation(defaultMessages)

  const handleCardKeyUp = (evt: React.KeyboardEvent<HTMLDivElement>, item: Immutable.ImmutableObject<Bookmark>) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.stopPropagation()
      onViewBookmark(item)
    }
  }

  const handleInputKeydown = (evt: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      ref.current.blur()
    }
  }

  const handleAddKeyUp = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.stopPropagation()
      onRuntimeAdd()
    }
  }

  return <React.Fragment>
    {bookmarks.map((item, index) => {
      const isBookmarkItemActive = index === highLightIndex
      return (
        <Paper
          key={index}
          onClick={() => { onViewBookmark(item, false, index) }}
          className={classNames('d-flex bookmark-list-col bookmark-pointer', { 'active-bookmark-item': isBookmarkItemActive })}
          role='listitem'
          aria-selected={isBookmarkItemActive}
          tabIndex={0}
          onKeyUp={(evt: React.KeyboardEvent<HTMLDivElement>) => { handleCardKeyUp(evt, item) }}
        >
          {!hideIcon && <PinOutlined className='ml-4 bookmark-list-icon' />}
          <div className='ml-2 bookmark-list-title text-truncate' title={item.name}>{item.name}</div>
        </Paper>
      )
    })}
    {<div className='bookmark-runtimeSeparator' />}
    {runtimeBookmarkArray.map((rbmId, index) => {
      const item = Immutable(runtimeBmItemsInfo[rbmId])
      const titleTextInput = React.createRef<HTMLInputElement>()
      const isBookmarkItemActive = index === runtimeHighLightIndex
      return (
        <Paper
          key={rbmId}
          onClick={() => { onViewBookmark(item, true, index) }}
          role='listitem'
          aria-selected={isBookmarkItemActive}
          tabIndex={0}
          onKeyUp={(evt: React.KeyboardEvent<HTMLDivElement>) => {
            handleCardKeyUp(evt, item)
          }}
          className={classNames('d-flex runtime-bookmark runtime-bookmarkList bookmark-pointer', { 'active-bookmark-item': isBookmarkItemActive })}
        >
          {!hideIcon && <PinOutlined className='ml-4 bookmark-list-icon' />}
          <TextInput
            className='bookmark-list-title-runtime'
            ref={titleTextInput}
            size='sm'
            title={item.name}
            value={item.name || ''}
            onKeyDown={evt => { handleInputKeydown(evt, titleTextInput) }}
            onChange={event => { handleRuntimeTitleChange(rbmId, event) }}
            onAcceptValue={value => { onRuntimeBookmarkNameChange(rbmId, value) }}
          />
          <div className='h-100 flex-grow-1'></div>
          <Button
            className='runtimeBookmarkList-operation'
            title={translate('deleteOption')}
            onClick={(evt) => { onRuntimeDelete(evt, rbmId) }}
            type='tertiary'
            icon
            size='sm'
          >
            <TrashFilled size='s' />
          </Button>
        </Paper>
      )
    })}
    {runtimeAddAllow && <React.Fragment key='list-add'>
      <div
        className='list-add'
        onClick={onRuntimeAdd}
        onKeyUp={handleAddKeyUp}
        title={translate('addBookmark')}
        aria-label={translate('addBookmarkAriaLabel')}
        role='button'
        tabIndex={0}
      >
        <div className='gallery-add-icon'>
          <PlusOutlined className='mr-1' size='l' />
        </div>
      </div>
      <div className='vertical-border' />
    </React.Fragment>}
  </React.Fragment>
}
