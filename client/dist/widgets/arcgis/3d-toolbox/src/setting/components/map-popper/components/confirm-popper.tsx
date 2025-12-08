/** @jsx jsx */
import { React, jsx, css, polished, hooks } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import defaultMessages from '../../../translations/default'
import type { SizeObj } from '../map-popper'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

interface Props {
  innerSize: SizeObj

  onConfirmWinYes: () => void
  onConfirmWinCancel: () => void
}

export const ConfirmPopper = React.memo((props: Props) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const confirmInfo = translate('confirmInfo')
  const yes = translate('yesBtn')
  const cancel = translate('commonModalCancel')
  return (
    <div css={css`
        position: absolute;
        z-index: 11;
        top: 0;
        left: 0;
        background-color: ${polished.rgba(theme.sys.color.secondary.main, 0.65)};
        width: ${props.innerSize.width}px;
        height: ${props.innerSize.height}px;
        .real-container{
          background-color: ${theme.sys.color.secondary.light};
          border: 1px solid ${theme.sys.color.secondary.dark};
          background-clip: padding-box;
          width: 480px;
          position: relative;
          top: 50%;
          margin: -60px auto 0;
        }
        .confirm-header {
          border-bottom: 1px solid ${theme.ref.palette.neutral[700]};
          padding: 16px 20px;
        }
        .confirm-context {
          padding: ${polished.rem(20)} ${polished.rem(20)} 0 ${polished.rem(20)};

          .title-icon {
            padding: 0 6px;
          }
          .message {
            margin-top: 1rem;
          }
        }
        .confirm-footer {
          display: flex;
          justify-content: flex-end;
          padding: ${polished.rem(20)};
          button {
            cursor: pointer;
            margin-left: ${polished.rem(8)};
            min-width: ${polished.rem(100)};
          }
        }
      `}
    >
      <div className='real-container'>
        <div className='confirm-context'>
          <div className='message d-flex'>
            <div className='title-icon'>
              <WarningOutlined size='l' color={'var(--sys-color-warning-main)'} />
            </div>
            <div css={css`color: var(--ref-palette-neutral-1100);`} data-testid='confirmInfo'>
              {confirmInfo}
            </div>
          </div>
        </div>
        <div className='confirm-footer'>
          <Button type='primary' onClick={props.onConfirmWinYes} /*disabled={this.state.isConfirmBtnsDisabled}*/>{yes}</Button>
          <Button type='secondary' onClick={props.onConfirmWinCancel} /*disabled={this.state.isConfirmBtnsDisabled}*/>{cancel}</Button>
        </div>
      </div>
    </div>
  )
})
