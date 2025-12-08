/** @jsx jsx */
import { React, jsx, css, classNames } from 'jimu-core'
import { Icon } from 'jimu-ui'

export interface WidgetPlaceholderProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  'aria-label'?: string
  /**
   * The size of the icon displayed in the component
   * Default: `small`
   */
  iconSize?: 'small' | 'large'
  /**
   * The id of the widget that this placeholder is filling.
   * @ignore
   */
  widgetId?: string
  /**
   * The svg icon object. For example: `require('path.to.icon.svg')`.
   */
  icon: string
  /**
   * The text message shown in the placeholder. Only shown in builder mode when the `iconSize` is `small`.
   */
  label?: string
  /**
   * The text message shown in the placeholder. Only shown in builder mode when the `iconSize` is `small`.
   */
  message?: string
  /**
   * Flip the icon automatically if the locale is following right-to-left (RTL).
   * @default false
   */
  autoFlip?: boolean
}

const useStyle = (iconSize: 'small' | 'large') => {
  return css`
    pointer-events: none;
    width: 100%;
    height: 100%;
    padding: ${iconSize === 'large' ? '2.5%' : '0px'};
    .picture-wrapper, .thumbnail-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    .picture-wrapper {
      .jimu-icon{
        color: var(--ref-palette-neutral-600);
      }
    }
    .thumbnail-wrapper {
      flex-direction: column;
      .jimu-icon{
        color: var(--ref-palette-neutral-1000);
      }
    }
    .w-10 {
        width: 10% !important;
    }
    .h-10 {
        height: 10% !important;
    }
  `
}

export const CustomWidgetPlaceholder = (props: WidgetPlaceholderProps) => {
  const { iconSize = 'small', widgetId, className, icon, label, message, style, autoFlip = false, ...others } = props
  const cssStyle = useStyle(iconSize)

  return (
    <div
      css={cssStyle}
      {...others}
      className={classNames('jimu-widget-placeholder', className)}>

      {iconSize === 'large' && <div className='picture-wrapper'>
        <Icon icon={icon} className='w-100 h-100' autoFlip={autoFlip} />
      </div>}

      {iconSize === 'small' && <div className='thumbnail-wrapper pt-1'>
        <Icon icon={icon} className='w-10 h-10' autoFlip={autoFlip} />
        <div className='message-wrapper text-center mt-2'>{label}</div>
        <div className='message-wrapper text-center mt-2'>{message}</div>
      </div>}

    </div>
  )
}
