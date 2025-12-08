/** @jsx jsx */
import { css, jsx, React, type IntlShape, type IMThemeVariables } from 'jimu-core'
import { Progress, defaultMessages } from 'jimu-ui'

interface Props {
  progress: number
  intl: IntlShape
  theme: IMThemeVariables
  onClick: () => void
}

export default class SelectProgress extends React.PureComponent<Props> {
  constructor (props: Props) {
    super(props)
    this.state = {}
  }

  getStyle () {
    const progressColor = this.props.theme.sys.color.action.selected.text

    return css`
      position: relative;

      .select-circle-progress {
        position: absolute;
        left: 6px;
        top: 6px;

        .jimu-circular-progress-track {
          stroke: ${progressColor};
          opacity: 0.3;
        }

        .jimu-circular-progress-runner {
          stroke: ${progressColor};
          transition: none !important;
        }
      }

      .progress-stop {
        width: 6px;
        height: 6px;
        background: ${progressColor};
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
  }

  render () {
    const progress = this.props.progress * 100
    const progressInt = parseFloat(progress.toFixed(2))
    const defaultStr = defaultMessages.selectingFeaturesTip
    const title = this.props.intl?.formatMessage({ id: 'selectingFeaturesTip', defaultMessage: defaultStr }) || defaultStr

    return (
      <button css={this.getStyle()}
        onClick={this.props.onClick}
        className='esri-widget--button-like selected border-0 select-tool-btn d-flex align-items-center justify-content-center select-progress'
      >
        <Progress className='select-circle-progress' type='circular' value={progressInt} circleSize={20} />
        <div className='progress-stop'></div>
        <div className='progress-mask' title={title}></div>
      </button>
    )
  }
}
