/** @jsx jsx */
import { React, jsx, polished, type IMThemeVariables, css, hooks } from 'jimu-core'
import { Button, Tooltip, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

export interface Props {
  showLoading: boolean
  interval: number
  isMobile: boolean
  bottomResponsive: boolean
  refreshTime: number
}
const BASE_REFRESH_TIME = 60000

const getStyles = (theme: IMThemeVariables, isMobile: boolean) => css`
  &.refresh-loading-con {
    height: 16px;
    .auto-refresh-loading {
      background: ${theme.sys.color.surface.overlay};
      color: ${theme.sys.color.surface.overlayText};
      font-size: ${polished.rem(12)};
      line-height: ${polished.rem(16)};
      ${!isMobile && `padding: 0 ${polished.rem(7)};`}
      .icon-btn {
        color: ${theme.sys.color.surface.paperText};
      }
    }
  }
`

const AutoRefreshLoading = (props: Props) => {
  const { showLoading, interval, isMobile, bottomResponsive, refreshTime } = props
  const translate = hooks.useTranslation(jimuUIMessages)
  const [autoRefreshLoadingString, setAutoRefreshLoadingString] = React.useState(translate('lastUpdateAFewTime'))
  const autoRefreshInterval = React.useRef(0)

  const getLoadingString = React.useCallback((): string => {
    let loadingString = translate('lastUpdateAFewTime')
    const nowDate = new Date().getTime()
    const refreshMinutes = nowDate - refreshTime
    if (refreshMinutes > BASE_REFRESH_TIME && refreshMinutes <= (BASE_REFRESH_TIME * 2)) {
      loadingString = translate('lastUpdateAMinute')
    } else if (refreshMinutes > (BASE_REFRESH_TIME * 2)) {
      loadingString = translate('lastUpdateTime', { updateTime: Math.floor(refreshMinutes/BASE_REFRESH_TIME) })
    }
    return loadingString
  }, [refreshTime, translate])

  React.useEffect(() => {
    if (interval <= 0) {
      setAutoRefreshLoadingString(translate('lastUpdateAFewTime'))
      window.clearInterval(autoRefreshInterval.current)
      autoRefreshInterval.current = null
    } else {
      // reset auto refresh info
      setAutoRefreshLoadingString(translate('lastUpdateAFewTime'))
      autoRefreshInterval.current = window.setInterval(() => {
        setAutoRefreshLoadingString(getLoadingString())
      }, BASE_REFRESH_TIME)
    }

    return () => {
      window.clearInterval(autoRefreshInterval.current)
      autoRefreshInterval.current = null
    }
  }, [interval, getLoadingString, translate])

  const theme = useTheme()

  return (
    <div className='refresh-loading-con d-flex align-items-center' css={getStyles(theme, isMobile)}>
      {showLoading && <div className='loading-con' />}
      {interval > 0 && (
        <div className='flex-grow-1 auto-refresh-loading text-truncate' title={bottomResponsive ? '' : autoRefreshLoadingString}>
          {bottomResponsive
            ? <Tooltip title={autoRefreshLoadingString} showArrow placement='top-end'>
              <Button icon size='sm' type='tertiary' className='d-inline jimu-outline-inside border-0 p-0 icon-btn'>
                <InfoOutlined size={14} color={theme.sys.color.surface.overlayText}/>
              </Button>
            </Tooltip>
            : autoRefreshLoadingString
          }
        </div>
      )}
    </div>
  )
}

export default AutoRefreshLoading
