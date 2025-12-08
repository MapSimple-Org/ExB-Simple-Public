import { React, jsx } from 'jimu-core'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import { styled } from 'jimu-theme'

const Root = styled.div`
  overflow: hidden;
  height: calc(100% - 102px);
  .jimu-icon {
    color: var(--ref-palette-neutral-800);
  }
  p {
    color: var(--ref-palette-neutral-1000);
  }
`

export const Placeholder = ({ placeholder, messageId }): React.ReactElement => {
  return (
    <Root
      className='placeholder d-flex flex-column align-items-center justify-content-center p-4'>
      <div className='d-flex flex-column align-items-center'>
        <ClickOutlined size={48} />
        <p className='mt-4 text-center' id={messageId}>
          {placeholder}
        </p>
      </div>
    </Root>
  )
}
