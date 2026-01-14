import { React, hooks } from 'jimu-core'
import { Loading, LoadingType } from 'jimu-ui'
import { styled } from 'jimu-theme'
import defaultMessage from './translations/default'

const Root = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 2;

  .loading-content {
    .loading-tip {
      position: relative;
    }
  }
`
export function LoadingResult () {
  const translate = hooks.useTranslation(defaultMessage)
  return (
    <Root>
      <div className='loading-content w-100 px-4 d-flex flex-column justify-content-center align-items-center'>
        <div role='alert' aria-live='assertive' className='text-paper'>
          {translate('retrieving')}
        </div>
        <Loading className='loading-tip mt-8' type={LoadingType.Donut}/>
      </div>
    </Root>
  )
}


