/** @jsx jsx */
import { jsx } from 'jimu-core'
import { Card, CardBody } from 'jimu-ui'
import type { IMConfig } from '../../../config'

interface CardExampleProps {
  config: IMConfig
  bookmarkName: string
}

export function CardExample (props: CardExampleProps) {
  const { config, bookmarkName } = props
  const {
    displayName
  } = config

  return new Array(3).fill(1).map((item, index) => {
    return (
      <div className='d-inline-flex bookmark-card-col' key={index}>
        <Card shape='shape2' className='card-inner bookmark-pointer'>
          <div className='widget-card-image bg-default'>
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
