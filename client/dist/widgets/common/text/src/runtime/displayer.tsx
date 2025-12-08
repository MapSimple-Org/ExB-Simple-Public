import { React, polished, type IMExpression, ExpressionResolverComponent, expressionUtils, DynamicStyleResolverComponent, type IMDynamicStyleConfig, type IMDynamicStyle } from 'jimu-core'
import { DownDoubleOutlined } from 'jimu-icons/outlined/directional/down-double'
import { styled, useTheme } from 'jimu-theme'
import { RichTextDisplayer, type RichTextDisplayerProps, Scrollable, type ScrollableRefProps, type StyleSettings, type StyleState, styleUtils } from 'jimu-ui'

const LeaveDelay = 500

export type DisplayerProps = Omit<RichTextDisplayerProps, 'sanitize'> & {
  tooltip?: IMExpression
  wrap?: boolean
  dynamicStyleConfig?: IMDynamicStyleConfig
  onArcadeChange?: (style: React.CSSProperties) => void
}

const Root = styled('div')<StyleState<{ wrap: boolean, fadeLength: string }>>(({ theme, styleState }) => {
  return {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflowY: 'hidden',
    '.rich-displayer': {
      width: '100%',
      height: 'fit-content',
      lineHeight: 1.42,
      ...(!styleState.wrap && {
        whiteSpace: 'preserve nowrap !important'
      }),
      'a:focus': {
        outlineOffset: '-3px',
        outlineWidth: '2px'
      },
      'exp:hover,arcade:hover': {
        background: 'transparent !important',
        outline: 'none !important',
        cursor:'default !important'
      }
    },
    '.text-fade': {
      position: 'absolute',
      left: '0',
      height: styleState.fadeLength,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      pointerEvents: 'none',
      '> .arrow': {
        position: 'absolute',
        width: '16px',
        height: '16px',
        background: theme.ref.palette.white,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&.arrow-bottom': {
          bottom: '4px'
        }
      },
      '&.text-fade-bottom': {
        bottom: '0',
        background: `linear-gradient(180deg, rgba(182, 182, 182, 0) 0%, ${polished.rgba(theme.ref.palette.neutral[500] ?? '#444', 0.5)} 100%)`
      }
    },
    '.bounce': {
      animationName: 'bounce',
      animationDuration: '0.6s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
    },
    '@keyframes bounce': {
      '0%': {
        transform: 'translateY(0px)'
      },
      '50%': {
        transform: 'translateY(2px)'
      },
      '100%': {
        transform: 'translateY(4px)'
      }
    }
  }
})

const getFadeLength = (height: number): string => {
  if (height <= 80) {
    return '0px'
  } else if (height <= 140) {
    return '24px'
  } else {
    return '15%'
  }
}

export function Displayer(props: DisplayerProps): React.ReactElement<any> {
  const {
    value: propValue = '',
    placeholder,
    repeatedDataSource,
    useDataSources,
    widgetId,
    wrap,
    tooltip,
    dynamicStyleConfig,
    onArcadeChange,
    ...others
  } = props

  // In order to preserve the style, we added some zero-width-no-break-space(\ufeff) when editing, we need to remove them for runtime
  const value = React.useMemo(() => propValue.replace(/\ufeff/g, ''), [propValue])
  const theme = useTheme()
  const rootRef = React.useRef<HTMLDivElement>(undefined)
  const isTextTooltip = expressionUtils.isSingleStringExpression(tooltip as any)
  const [tooltipText, setTooltipText] = React.useState('')

  const [fadeLength, setFadeLength] = React.useState('24px')
  const [bottoming, setBottoming] = React.useState(false)
  const [scrollable, setScrollable] = React.useState(false)
  const [version, setVersion] = React.useState(0)
  const [showFade, setShowFade] = React.useState(false)

  const syncScrollState = React.useCallback((scrollableState: ScrollableRefProps) => {
    if (scrollableState == null) return
    const { scrollable, bottoming } = scrollableState
    setBottoming(bottoming)
    setScrollable(scrollable)
  }, [])

  React.useEffect(() => {
    if (tooltip != null && isTextTooltip) {
      const tooltipText = expressionUtils.getSingleStringExpressionText(tooltip as any) ?? tooltip.name
      setTooltipText(tooltipText)
    }
  }, [tooltip, isTextTooltip])

  const handleTooltipResolved = (res): void => {
    if (res?.isSuccessful) {
      setTooltipText(res.value)
    } else {
      setTooltipText('')
    }
  }

  const timeoutRef = React.useRef<any>(undefined)

  const handleEnter = (): void => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const fadeLength = getFadeLength(rootRef.current?.clientHeight ?? 0)
    setShowFade(fadeLength !== '0px')
    setVersion(v => v + 1)
    setFadeLength(fadeLength)
  }

  const handleArcadeChange = (style: IMDynamicStyle): void => {
    if (!style) {
      onArcadeChange?.({})
    } else {
      const styleConfig = style.asMutable({ deep: true })
      // handle border nested style
      if (styleConfig?.border) {
        Object.assign(styleConfig, styleConfig.border)
      }
      if (styleConfig?.borderRadius) {
        styleConfig.borderRadius.number = styleConfig.borderRadius.number.map((num) => num === null ? 0 : num) as [number, number, number, number]
      }
      const cssProps = styleUtils.toCSSStyle(styleConfig as StyleSettings) as React.CSSProperties
      onArcadeChange?.(cssProps)
    }
  }

  const delayLeave = (): void => {
    timeoutRef.current = setTimeout(() => {
      setShowFade(false)
      timeoutRef.current = null
    }, LeaveDelay)
  }

  return (
    <Root styleState={{ wrap, fadeLength }} title={tooltipText} onMouseEnter={handleEnter} onMouseLeave={delayLeave} ref={rootRef} {...others}>
      <Scrollable ref={syncScrollState} version={version}>
        <RichTextDisplayer
          widgetId={widgetId}
          repeatedDataSource={repeatedDataSource}
          useDataSources={useDataSources}
          value={value}
          placeholder={placeholder}
        />
      </Scrollable>
      {showFade && scrollable && !bottoming && <div className='text-fade text-fade-bottom'>
        <span className='arrow arrow-bottom rounded-circle mr-1'>
          <DownDoubleOutlined className='bounce' color={theme?.ref.palette?.black} />
        </span>
      </div>}
      {
        (!isTextTooltip && tooltip) && <ExpressionResolverComponent
          useDataSources={useDataSources} expression={tooltip} widgetId={widgetId}
          onChange={handleTooltipResolved}
        />
      }
      <DynamicStyleResolverComponent
        widgetId={widgetId}
        useDataSources={useDataSources}
        dynamicStyleConfig={dynamicStyleConfig}
        onChange={handleArcadeChange}
      />
    </Root>
  )
}
