import { React } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import { MultiSourceMapContext } from '../components/multisourcemap-context'
import { defaultMessages } from 'jimu-ui'

export default class Fullscreen extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Fullscreen'
  isFullScreen = false

  getTitle () {
    return this.props.intl.formatMessage({ id: 'FullScreenLabel', defaultMessage: defaultMessages.FullScreenLabel })
  }

  getIcon (): IconType {
    return {
      icon: this.isFullScreen ? require('../assets/icons/exit-full-screen.svg') : require('../assets/icons/full-screen.svg'),
      onIconClick: (evt?: React.MouseEvent<any>) => {
        this.fullScreenMap()
      }
    }
  }

  fullScreenMap = () => null

  getExpandPanel (): React.JSX.Element {
    return null
  }

  getContent = (fullScreenMap, isFullScreen) => {
    this.fullScreenMap = fullScreenMap
    this.isFullScreen = isFullScreen
    return super.render()
  }

  getAttributesForBtnRole(): any {
    // this.isFullScreen maybe undefined, undefined is not a valid value for aria-pressed
    return {
      'aria-pressed': this.isFullScreen || false
    }
  }

  render () {
    return (
      <MultiSourceMapContext.Consumer>
        {({ fullScreenMap, isFullScreen }) => (
          this.getContent(fullScreenMap, isFullScreen)
        )}
      </MultiSourceMapContext.Consumer>
    )
  }
}
