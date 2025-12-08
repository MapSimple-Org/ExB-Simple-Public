import { BrowserSizeMode, type IntlShape, React, type AttachmentInfo, classNames, css } from 'jimu-core'
import { Button, Image, ImageDots, Loading, LoadingType, type ImageProps } from 'jimu-ui'
import { LeftOutlined } from 'jimu-icons/outlined/directional/left'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import defaultMessages from '../translations/default'

interface ImageGalleryProps extends Pick<ImageProps, 'title' | 'alt' | 'imageFillMode' | 'isAutoHeight' | 'isAutoWidth' | 'cropParam'> {
  sources: AttachmentInfo[]
  toolTipWithAttachmentName?: boolean
  altTextWithAttachmentName?: boolean
  intl: IntlShape
  browserSizeMode: BrowserSizeMode
}

interface States {
  currentIndex: number
  oldIndex: number
  statusArray: Array<'loading'|'loaded'>
  height: number
}

const getStyle = (height: number) => {
  return css`
    ${height ? `height: ${height}px !important;` : ''}
    .dots-nav {
      max-width: 100%;
      position: absolute;
      z-index: 1;
      bottom: 5%;
      left: 50%;
      transform: translateX(-50%);
    }
    .image-gallery-content {
      position: relative;
      overflow: hidden;
      .image-gallery-item {
        transition: all .3s ease;
        position: absolute;
        inset: 0;
        opacity: 0;
        z-index: -1;
      }
      .image-gallery-current {
        position: unset;
        opacity: 1;
      }
      .image-gallery-current.image-gallery-current-loading {
        opacity: 0;
      }
      .image-gallery-previous {
        filter: blur(3px);
      }
      .image-gallery-previous.image-gallery-current-loading {
        opacity: 1;
      }
    }
    .image-gallery-button {
      color: rgba(255, 255, 255, 0.8);
      svg {
        height: 32px;
        filter: drop-shadow(0 0 4px #000);
      }
      &:hover {
        color: rgba(255, 255, 255, 1);
        svg {
          filter: drop-shadow(0 0 6px #000);
        }
      }
    }
  `
}

export class ImageGallery extends React.PureComponent<ImageGalleryProps, States> {

  touchStart: {x: number, y: number}

  touchMove: {x: number, y: number}

  rootRef: React.RefObject<HTMLDivElement>

  constructor (props: ImageGalleryProps) {
    super(props)
    this.rootRef = React.createRef<HTMLDivElement>()
    this.state = {
      currentIndex: 0,
      oldIndex: null,
      statusArray: ['loading'],
      height: null
    }
  }

  componentDidMount () {
    this.rootRef.current.addEventListener('touchstart', this.handleTouchStart, {passive: false})
    this.rootRef.current.addEventListener('touchmove', this.handleTouchMove, {passive: false})
    this.rootRef.current.addEventListener('touchend', this.handleTouchEnd, {passive: false})
  }

  componentWillUnmount () {
    this.rootRef.current.removeEventListener('touchstart', this.handleTouchStart)
    this.rootRef.current.removeEventListener('touchmove', this.handleTouchMove)
    this.rootRef.current.removeEventListener('touchend', this.handleTouchEnd)
  }

  componentDidUpdate (prevProps: ImageGalleryProps, prevState: States) {
    if (prevProps.sources !== this.props.sources) {
      this.setState({
        currentIndex: 0,
        oldIndex:null,
        statusArray: ['loading'],
        height: null
      })
    }
  }

  getPreviousIndex () {
    return this.state.currentIndex > 0 ? this.state.currentIndex - 1 : this.props.sources.length - 1
  }

  getNextIndex () {
    return this.state.currentIndex < this.props.sources.length - 1 ? this.state.currentIndex + 1 : 0
  }

  backImg = (e: TouchEvent | React.MouseEvent<HTMLButtonElement>) => {
    const preIndex = this.getPreviousIndex()
    this.setState((prevState) => {
      const statusArray = [...prevState.statusArray]
      if (!statusArray[preIndex]) {
        statusArray[preIndex] = 'loading'
      }
      return {
        currentIndex: preIndex,
        oldIndex: prevState.currentIndex,
        statusArray,
        height: statusArray[preIndex] === 'loading' ? this.rootRef.current.clientHeight : null
      }
    })
    e?.preventDefault()
    e?.stopPropagation()
  }

  forwardImg = (e: TouchEvent | React.MouseEvent<HTMLButtonElement>) => {
    const nextIndex = this.getNextIndex()
    this.setState((prevState) => {
      const statusArray = [...prevState.statusArray]
      if (!statusArray[nextIndex]) {
        statusArray[nextIndex] = 'loading'
      }
      return {
        currentIndex: nextIndex,
        oldIndex: prevState.currentIndex,
        statusArray,
        height: statusArray[nextIndex] === 'loading' ? this.rootRef.current.clientHeight : null
      }
    })
    e?.preventDefault()
    e?.stopPropagation()
  }

  setCurrentImg = (index: number) => {
    if (this.state.currentIndex === index) return
    this.setState((prevState) => {
      const statusArray = [...prevState.statusArray]
      if (!statusArray[index]) {
        statusArray[index] = 'loading'
      }
      return {
        currentIndex: index,
        oldIndex: prevState.currentIndex,
        statusArray,
        height: statusArray[index] === 'loading' ? this.rootRef.current.clientHeight : null
      }
    })
  }

  handleLoad = (index: number) => {
    this.setState((prevState) => {
      const statusArray = [...prevState.statusArray]
      statusArray[index] = 'loaded'
      return {
        statusArray,
        height: null
      }
    })
  }

  handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return
    this.touchStart = {x: e.touches[0].clientX, y: e.touches[0].clientY}
  }
  handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return
    this.touchMove = {x: e.touches[0].clientX, y: e.touches[0].clientY}
    const moveX = this.touchMove.x - this.touchStart.x
    const moveY = this.touchMove.y - this.touchStart.y
    if (Math.abs(moveX) > Math.abs(moveY)) {
      e?.preventDefault()
    }
  }
  handleTouchEnd = (e: TouchEvent) => {
    const sources = this.props.sources || []
    if (this.touchStart !== undefined && this.touchMove !== undefined && sources.length > 1) {
      const moveX = this.touchMove.x - this.touchStart.x
      const moveY = this.touchMove.y - this.touchStart.y
      if (Math.abs(moveX) > Math.abs(moveY)) {
        if (moveX < -50) {
          this.forwardImg(e)
        }
        if (moveX > 50) {
          this.backImg(e)
        }
      }
    }
    this.touchStart = undefined
    this.touchMove = undefined
  }

  render () {
    const {
      intl, toolTipWithAttachmentName, title: propTitle, altTextWithAttachmentName, alt: propAlt,
      cropParam, imageFillMode, isAutoHeight, isAutoWidth, browserSizeMode
    } = this.props
    const sources = this.props.sources || []
    const propSources = this.props.sources
    const { currentIndex, oldIndex, statusArray, height } = this.state

    const previousString = intl.formatMessage({ id: 'previousImage', defaultMessage: defaultMessages.previousImage })
    const nextString = intl.formatMessage({ id: 'nextImage', defaultMessage: defaultMessages.nextImage })

    const isCurrentLoading = statusArray[currentIndex] === 'loading' && sources.length > 0
    // if the sources from the props is null, it means the record is changed but the attachmentInfos is not loaded yet
    const isSourcesLoading = !propSources
    const isLargeLayout = browserSizeMode === BrowserSizeMode.Large

    return (
      <div
        ref={this.rootRef}
        className='w-100 h-100'
        css={getStyle(height)}
      >
        {sources && sources.length > 1 && isLargeLayout && <React.Fragment>
          <Button
            icon
            variant='text'
            size='sm'
            disableHoverEffect
            disableRipple
            className='image-gallery-button'
            style={{ padding: 0, top: '50%', transform: 'translateY(-50%)', position: 'absolute', left: 0, zIndex: 1 }}
            aria-label={previousString}
            onClick={this.backImg}
          >
            <LeftOutlined size={26} />
          </Button>
          <Button
            icon
            variant='text'
            size='sm'
            disableHoverEffect
            disableRipple
            className='image-gallery-button'
            style={{ padding: 0, top: '50%', transform: 'translateY(-50%)', position: 'absolute', right: 0, zIndex: 1 }}
            aria-label={nextString}
            onClick={this.forwardImg}
          >
            <RightOutlined size={26}/>
          </Button>
        </React.Fragment>}
        {sources && sources.length > 1 && !isLargeLayout &&
          <ImageDots
            className='dots-nav'
            imageCount={sources.length}
            currentIndex={currentIndex}
            onChange={this.setCurrentImg}
          />
        }
        <div className='image-gallery-content w-100 h-100'>
          {(isCurrentLoading || isSourcesLoading) && <Loading type={LoadingType.Donut} width={16} height={16} />}
          {sources.map((source, index) => {
            const imageSrc = source.url
            const title = toolTipWithAttachmentName ? source.name : propTitle
            const alt = altTextWithAttachmentName ? source.name : propAlt

            const isCurrent = index === currentIndex
            const isPrevious = index === oldIndex

            return <Image
              key={source.id}
              className={classNames('image-gallery-item w-100 h-100', {
                'image-gallery-current': isCurrent,
                'image-gallery-previous': isPrevious,
                'image-gallery-current-loading': isCurrentLoading
              })}
              src={imageSrc}
              fadeInOnLoad
              cropParam={cropParam}
              imageFillMode={imageFillMode}
              isAutoHeight={isAutoHeight}
              isAutoWidth={isAutoWidth}
              title={title}
              alt={alt}
              showBrokenPlaceholder={true}
              onLoad={() => { this.handleLoad(index) }}
            />
          })}
          {propSources && propSources.length === 0 &&
            <Image
              src=''
              fadeInOnLoad
              cropParam={cropParam}
              imageFillMode={imageFillMode}
              isAutoHeight={isAutoHeight}
              isAutoWidth={isAutoWidth}
            />
          }
        </div>
      </div>
    )
  }
}
