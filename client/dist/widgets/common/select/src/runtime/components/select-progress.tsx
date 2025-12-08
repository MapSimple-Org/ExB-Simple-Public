/** @jsx jsx */
import { React, css, jsx, hooks } from 'jimu-core'
import { Progress, defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'
interface Props {
  // progress is in range of [0, 1]
  progress: number
  onClick: () => void
}

export default function SelectProgress (props: Props) {
  const style = React.useMemo(() => {
    return css`
      display: inline-block;
      position: relative;
      width: 20px;
      height: 20px;
      background: transparent;

      .select-circle-progress {
        position: absolute;
        left: 0;
        top: 0;

        .jimu-circular-progress-track {
          stroke: var(--sys-color-action-disabled);
        }

        .jimu-circular-progress-runner {
          stroke: var(--sys-color-surface-paper-text);
          transition: none !important;
        }
      }

      .progress-stop {
        position: absolute;
        width: 6px;
        height: 6px;
        left: 7px;
        top: 7px;
        background: var(--sys-color-surface-paper-text);
      }

      .progress-mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: transparent;
      }
    `
  }, [])

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const progress = props.progress * 100
  const progressInt = parseFloat(progress.toFixed(2))
  const title = translate('selectingFeaturesTip')

  return (
    <div
      css={style}
      onClick={props.onClick}
      className='select-progress'
      title={title}
      aria-label={title}
    >
      <Progress
        className='select-circle-progress'
        color='var(--sys-color-surface-paper-text)'
        type='circular'
        value={progressInt}
        circleSize={20}
      />
      <div className='progress-stop' />
      <div className='progress-mask' />
    </div>
  )
}
