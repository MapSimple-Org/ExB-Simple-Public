/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'

interface Props {
  id?: string
  size?: number
}
const ProgressTypeLoading = (props: Props) => {
  const STYLE = css`
    &.progress-type-loading {
      @keyframes loading {
        0% {transform: rotate(0deg); };
        100% {transform: rotate(360deg)};
      }
      width: ${props.size + 'px' || '16px'};
      height: ${props.size + 'px' || '16px'};
      border: 1px solid var(--ref-palette-neutral-800);
      border-radius: 50%;
      border-top: 1px solid var(--ref-palette-neutral-1100);
      box-sizing: border-box;
      animation:loading 2s infinite linear;
      margin-right: auto;
      margin-left: auto;
    }
  `
  return (
    <div css={STYLE} className='progress-type-loading'></div>
  )
}

export default ProgressTypeLoading
