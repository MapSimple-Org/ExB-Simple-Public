/** @jsx jsx */
import { React, jsx, polished, css, classNames } from 'jimu-core'
import { Loading as JimuLoading, LoadingType } from 'jimu-ui'

interface Props {
  text?: string
  className?: string
}

const STYLE = css`
  & .loading-con {
    width: ${polished.rem(16)};
    height: ${polished.rem(16)};
  }
`

const Loading = (props: Props) => {
  const { text, className } = props
  return (
    <div css={STYLE} className={classNames(className, 'd-flex align-items-center')}>
      <div className='loading-con position-relative mr-1'>
        <JimuLoading width={16} height={16} type={LoadingType.Donut}/>
      </div>
      <div>{text}</div>
    </div>
  )
}
export default Loading
