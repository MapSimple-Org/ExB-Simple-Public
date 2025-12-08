/** @jsx jsx */
import { jsx } from 'jimu-core'
import { Card, CardBody } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import { getGalleryStyle } from './style'
import { DirectionType, type IMConfig } from '../../../config'

interface GalleryExampleProps {
  config: IMConfig
  bookmarkName: string
  isWebMap: boolean
  widgetRect: {
    width: number
    height: number
  }
}

export function GalleryExample (props: GalleryExampleProps) {
  const { config, bookmarkName, isWebMap, widgetRect } = props
  const {
    displayName, direction,
    galleryItemWidth,
    galleryItemHeight = 237.5,
    galleryItemSpace = 24,
    cardBackground,
    itemSizeType
  } = config
  const directionIsHorizon = direction === DirectionType.Horizon

  const theme = useTheme()

  const cardStyle = getGalleryStyle({ theme, direction, galleryItemWidth, galleryItemHeight, galleryItemSpace, cardBackground, displayName, isWebMap, itemSizeType, widgetRect })

  return new Array(3).fill(1).map((item, index) => {
    return (
      <div className='gallery-card' key={index} css={cardStyle}>
        <Card shape='shape2' className={'bookmark-pointer gallery-card-inner h-100'}>
          <div className={`widget-card-image bg-light-300 ${
              directionIsHorizon
                ? 'gallery-img'
                : 'gallery-img-vertical'
            }`}
          >
            <div className='default-img'>
              <div className='default-img-svg'></div>
            </div>
          </div>
          {displayName && <CardBody className='pl-2 pr-2 bookmark-card-title text-truncate'>
            <span title={bookmarkName}>
              {bookmarkName}
            </span>
          </CardBody>}
        </Card>
      </div>
    )
  })
}
