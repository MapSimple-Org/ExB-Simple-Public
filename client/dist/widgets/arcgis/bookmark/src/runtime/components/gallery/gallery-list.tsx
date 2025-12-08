/** @jsx jsx */
import { React, jsx, type ImmutableArray, type ImmutableObject, classNames, Immutable, hooks } from 'jimu-core'
import { Button, Card, CardBody, Image, TextInput } from 'jimu-ui'
import { TrashFilled } from 'jimu-icons/filled/editor/trash'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { getGalleryStyle } from './style'
import { type Bookmark, DirectionType, type IMConfig, ImgSourceType } from '../../../config'
import defaultMessages from '../../translations/default'
import NavButtons from '../nav-buttons'
import { useTheme } from 'jimu-theme'

interface GalleryListProps {
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
  isWebMap: boolean
  widgetRect: {
    width: number
    height: number
  }
}

export function GalleryList (props: GalleryListProps) {
  const { config, bookmarks, runtimeBookmarkArray, runtimeBmItemsInfo, runtimeSnaps, highLightIndex, runtimeHighLightIndex, onViewBookmark, handleRuntimeTitleChange, onRuntimeBookmarkNameChange, onRuntimeAdd, onRuntimeDelete, isWebMap, widgetRect } = props

  const {
    displayName,
    direction,
    runtimeAddAllow,
    galleryItemWidth,
    galleryItemHeight = 237.5,
    galleryItemSpace = 24,
    cardBackground,
    itemSizeType
  } = config

  const directionIsHorizon = direction === DirectionType.Horizon

  const theme = useTheme()

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

  const translate = hooks.useTranslation(defaultMessages)

  const cardStyle = getGalleryStyle({ theme, direction, galleryItemWidth, galleryItemHeight, galleryItemSpace, cardBackground, displayName, isWebMap, itemSizeType, widgetRect })

  return <React.Fragment>
    {bookmarks.map((item, index) => {
      const typeSnap = item.imgSourceType === ImgSourceType.Snapshot
      const imageSrc = typeSnap ? item.snapParam?.url : item.imgParam?.url
      const isBookmarkItemActive = index === highLightIndex
      return (
        <div className='gallery-card' key={index} css={cardStyle}>
          <Card
            shape='shape2'
            onClick={() => { onViewBookmark(item, false, index) }}
            role='listitem'
            aria-selected={isBookmarkItemActive}
            tabIndex={0}
            onKeyDown={handleCardKeyDown}
            onKeyUp={(evt: React.KeyboardEvent<HTMLDivElement>) => { handleCardKeyUp(evt, item) }}
            className={classNames('gallery-card-inner h-100 bookmark-pointer', { 'active-bookmark-item': isBookmarkItemActive })}
          >
            <div className={`widget-card-image bg-light-300 ${directionIsHorizon ? 'gallery-img' : 'gallery-img-vertical'}`}>
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
      )
    })}
    {runtimeBookmarkArray.map((rbmId, index) => {
      let item = Immutable(runtimeBmItemsInfo[rbmId])
      item = item.set('snapParam', { url: runtimeSnaps[item.id] })
      const imageSrc = item.snapParam?.url
      const titleTextInput = React.createRef<HTMLInputElement>()
      const isBookmarkItemActive = index === runtimeHighLightIndex
      return (
        <div className='gallery-card' key={`RuntimeGallery-${rbmId}`} css={cardStyle}>
          <Card
            shape='shape2'
            onClick={() => { onViewBookmark(item, true, index) }}
            className={classNames('gallery-card-inner h-100 runtime-bookmark bookmark-pointer bookmark-pointer', { 'active-bookmark-item': isBookmarkItemActive })}
            role='listitem'
            aria-selected={isBookmarkItemActive}
            tabIndex={0}
            onKeyUp={(evt: React.KeyboardEvent<HTMLDivElement>) => {
              if ((evt.target as HTMLElement).tagName === 'INPUT') return
              handleCardKeyUp(evt, item)
            }}
          >
            <div
              className={`widget-card-image bg-light-300 ${directionIsHorizon
                  ? 'gallery-img'
                  : 'gallery-img-vertical'
                }`}
            >
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
            {displayName && <CardBody className='bookmark-card-title text-truncate runtime-title-con'>
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
          <span className='gallery-card-operation float-right'>
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
      )
    })}
    {runtimeAddAllow && <React.Fragment key='galleryAdd'>
      <div
        className='gallery-card-add'
        css={cardStyle}
        onClick={onRuntimeAdd}
        title={translate('addBookmark')}
        aria-label={translate('addBookmarkAriaLabel')}
        role='button'
        tabIndex={0}
        onKeyDown={handleCardKeyDown}
        onKeyUp={handleAddKeyUp}
      >
        <div className='gallery-add-icon'>
          <PlusOutlined className='mr-1' size='l' />
        </div>
      </div>
    </React.Fragment>}
    <div className='vertical-border' key='last' />
    <NavButtons config={config} />
  </React.Fragment>
}
