/** @jsx jsx */
import { React, jsx, type ImmutableArray, type ImmutableObject, classNames, Immutable, hooks } from 'jimu-core'
import { Button, Card, CardBody, Image, TextInput } from 'jimu-ui'
import { TrashFilled } from 'jimu-icons/filled/editor/trash'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { type Bookmark, type IMConfig, ImgSourceType } from '../../../config'
import defaultMessages from '../../translations/default'

interface CardListProps {
  config: IMConfig
  bookmarks: ImmutableArray<Bookmark>
  runtimeBookmarkArray: string[]
  runtimeBmItemsInfo: { [itemId: string]: Bookmark }
  runtimeSnaps: { [key: string]: string }
  highLightIndex: number
  runtimeHighLightIndex: number
  onViewBookmark: (item: ImmutableObject<Bookmark>, isRuntime?: boolean, index?: number) => void
  handleRuntimeTitleChange: (rbmId: string, event: any) => void
  onRuntimeBookmarkNameChange: (rbmId: string, newName: string) => void
  onRuntimeAdd: () => Promise<void>
  onRuntimeDelete: (evt: React.MouseEvent<HTMLButtonElement>, rbmId: string) => void
}

export function CardList (props: CardListProps) {
  const { config, bookmarks, runtimeBookmarkArray, runtimeBmItemsInfo, runtimeSnaps, highLightIndex, runtimeHighLightIndex, onViewBookmark, handleRuntimeTitleChange, onRuntimeBookmarkNameChange, onRuntimeAdd, onRuntimeDelete } = props

  const { displayName, runtimeAddAllow } = config

  const translate = hooks.useTranslation(defaultMessages)

  const handleCardKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault()
      evt.stopPropagation()
    }
  }

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
      const typeSnap = item.imgSourceType === ImgSourceType.Snapshot
      const imageSrc = typeSnap ? item.snapParam?.url : item.imgParam?.url
      const isBookmarkItemActive = index === highLightIndex
      return (
        <React.Fragment key={index}>
          <div className='d-inline-flex bookmark-card-col'>
            <Card
              shape='shape2'
              onClick={() => { onViewBookmark(item, false, index) }}
              className={classNames('card-inner bookmark-pointer', { 'active-bookmark-item': isBookmarkItemActive })}
              role='listitem'
              aria-selected={isBookmarkItemActive}
              tabIndex={0}
              onKeyDown={handleCardKeyDown}
              onKeyUp={(evt: React.KeyboardEvent<HTMLDivElement>) => { handleCardKeyUp(evt, item) }}
            >
              <div className='widget-card-image'>
                {imageSrc
                  ? <Image
                    src={imageSrc}
                    alt=''
                    fadeInOnLoad
                    imageFillMode={item.imagePosition}
                  />
                  : <div className='default-img'>
                    <div className='default-img-svg'></div>
                  </div>
                }
              </div>
              {displayName && <CardBody className='pl-2 pr-2 bookmark-card-title text-truncate'>
                <span title={item.name}>
                  {item.name}
                </span>
              </CardBody>}
            </Card>
          </div>
        </React.Fragment>
      )
    })}
    {<div className='bookmark-runtimeSeparator' />}
    {runtimeBookmarkArray.map((rbmId, index) => {
      let item = Immutable(runtimeBmItemsInfo[rbmId])
      item = item.set('snapParam', { url: runtimeSnaps[item.id] })
      const imageSrc = item?.snapParam?.url
      const titleTextInput = React.createRef<HTMLInputElement>()
      const isBookmarkItemActive = index === runtimeHighLightIndex
      return (
        <React.Fragment key={rbmId}>
          <div className='d-inline-flex bookmark-card-col runtime-bookmarkCard'>
            <Card
              onClick={() => { onViewBookmark(item, true, index) }}
              className={classNames('card-inner runtime-bookmark bookmark-pointer', { 'active-bookmark-item': isBookmarkItemActive })}
              role='listitem'
              aria-selected={isBookmarkItemActive}
              tabIndex={0}
              onKeyUp={(evt: React.KeyboardEvent<HTMLDivElement>) => {
                if ((evt.target as HTMLElement).tagName === 'INPUT') return
                handleCardKeyUp(evt, item)
              }}
            >
              <div className='widget-card-image bg-default'>
                {imageSrc
                  ? <Image
                    src={imageSrc}
                    alt=''
                    fadeInOnLoad
                    imageFillMode={item.imagePosition}
                  />
                  : <div className='default-img'>
                    <div className='default-img-svg'></div>
                  </div>
                }
              </div>
              {displayName && <CardBody className='bookmark-card-title runtime-title-con'>
                <TextInput
                  className='runtime-title w-100'
                  ref={titleTextInput}
                  size='sm'
                  title={item.name}
                  value={item.name || ''}
                  onClick={evt => { evt.stopPropagation() }}
                  onKeyDown={evt => { handleInputKeydown(evt, titleTextInput) }}
                  onChange={event => { handleRuntimeTitleChange(rbmId, event) }}
                  onAcceptValue={value => { onRuntimeBookmarkNameChange(rbmId, value) }}
                />
              </CardBody>}
            </Card>
            <span className='runtimeBookmarkCard-operation float-right'>
              <Button
                title={translate('deleteOption')}
                onClick={(evt) => { onRuntimeDelete(evt, rbmId) }}
                type='tertiary'
                icon
              >
                <TrashFilled size='s' />
              </Button>
            </span>
          </div>
        </React.Fragment>
      )
    })}
    {runtimeAddAllow && <React.Fragment key='card-add'>
      <div
        className='card-add'
        onClick={onRuntimeAdd}
        title={translate('addBookmark')}
        aria-label={translate('addBookmarkAriaLabel')}
        role='button'
        tabIndex={0}
        onKeyDown={handleCardKeyDown}
        onKeyUp={handleAddKeyUp}
      >
        <div className='add-placeholder' />
        <div className='gallery-add-icon'>
          <PlusOutlined className='mr-1' size='l' />
        </div>
      </div>
      <div className='vertical-border' />
    </React.Fragment>}
  </React.Fragment>
}
