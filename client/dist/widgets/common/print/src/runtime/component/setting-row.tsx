/** @jsx jsx */
import { React, jsx, css, classNames } from 'jimu-core'

interface Props {
  label?: string | React.ReactNode
  className?: string
  flowWrap?: boolean
  children?: React.ReactNode
}

const SettingRow = (props: Props) => {
  const { label, className, children, flowWrap } = props
  const STYLE = css`
    .title {
      font-size: 14px;
    }
  `

  return (
    <div className={classNames('mb-2 align-items-center', { className, 'd-flex': !flowWrap })} css={STYLE}>
      <div className={classNames('title flex-grow-1', { 'mb-2': flowWrap })}>{label}</div>
      {children}
    </div>
  )
}

export default SettingRow
