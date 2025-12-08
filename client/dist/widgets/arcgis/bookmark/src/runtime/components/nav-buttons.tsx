/** @jsx jsx */
import { type IMState, React, ReactRedux, css, hooks, jsx } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import { LeftOutlined } from 'jimu-icons/outlined/directional/left'
import { type IMConfig, DirectionType } from '../../config'
import { getScrollParam } from '../utils/utils'

interface NavButtonsProps {
  config: IMConfig
}

const navButtonsStyle = css`
&.suspension-navbar {
  display: flex;
  width: 100%;
  padding: 0 8px;
  position: absolute;
  top: 50%;
  z-index: 1;
  .navbar-btn-pre{
    position: absolute;
    left: 5px;
    border-radius: 50%;
  }
  .navbar-btn-next{
    position: absolute;
    right: 5px;
    border-radius: 50%;
  }
}
&.suspension-navbar-vertical {
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  margin-left: -13px;
  .navbar-btn-pre{
    position: absolute;
    top: 5px;
    border-radius: 50%;
  }
  .navbar-btn-next{
    position: absolute;
    bottom: 5px;
    border-radius: 50%;
  }
}
`
/**
 * NavButtons is used to scroll the bookmark list horizontally or vertically
 * This component should be placed in the list container
 */
export default function NavButtons (props: NavButtonsProps) {
  const { config } = props

  const {
    itemHeight: scrollHeight = 280,
    itemWidth: scrollWidth = 210,
    space = 0,
    direction
  } = config

  const navButtonsRef = React.useRef<HTMLDivElement>(null)

  const isHorizontal = direction === DirectionType.Horizon

  const isRTL = ReactRedux.useSelector((state: IMState) => state.appContext.isRTL)

  const translate = hooks.useTranslation(jimuUIMessages)

  const handleScroll = (type: string = 'next') => {
    const containerElement = navButtonsRef.current?.parentElement
    if (!containerElement) return
    const scrollParam = getScrollParam(type, isHorizontal, isRTL, scrollWidth, scrollHeight, space)
    containerElement.scrollBy(scrollParam)
  }

  return (
    <div
      key='navBar'
      ref={navButtonsRef}
      css={navButtonsStyle}
      className={`${isHorizontal ? 'suspension-navbar' : 'suspension-navbar-vertical'} align-items-center justify-content-between`}
    >
      <Button
        title={translate('slideBackward')}
        aria-label={translate('slideBackward')}
        type='primary'
        size='sm'
        icon
        onClick={() => { handleScroll('previous') }}
        className='navbar-btn-pre'
      >
        {isHorizontal ? <LeftOutlined autoFlip size='s' /> : <UpOutlined autoFlip size='s' />}
      </Button>
      <Button
        title={translate('slideForward')}
        aria-label={translate('slideForward')}
        type='primary'
        size='sm'
        icon
        onClick={() => { handleScroll('next') }}
        className='navbar-btn-next'
      >
        {isHorizontal ? <RightOutlined autoFlip size='s' /> : <DownOutlined autoFlip size='s' />}
      </Button>
    </div>
  )
}
