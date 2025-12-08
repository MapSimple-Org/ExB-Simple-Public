import { React, Immutable } from 'jimu-core'
import { createIntl } from 'react-intl'
import { defaultMessages } from 'jimu-ui'
import { fireEvent, waitFor } from '@testing-library/react'
import { withStoreThemeIntlRender, mockTheme } from 'jimu-for-test'
import { ShownMode } from '../src/runtime/components/items/base-item'
import { ShareLink } from '../src/runtime/components/items/sharelink'
import type { UiMode } from '../src/config'

describe('<ShareLink />', () => {
  const TAR_URL = 'test-url'

  let config
  let render = null; let intl = null
  beforeAll(() => {
    intl = createIntl({
      locale: 'en',
      defaultLocale: 'en',
      messages: defaultMessages
    })

    render = withStoreThemeIntlRender(false, mockTheme as any)
  })
  afterAll(() => {
    render = null
  })
  beforeEach(() => {
    config = Immutable({
      uiMode: 'POPUP',
      popup: {
        icon: '',
        items: ['embed', 'qrcode', 'email', 'facebook', 'twitter', 'pinterest', 'linkedin'],
        tooltip: ''
      },
      inline: {
        items: ['facebook', 'twitter', 'pinterest', 'linkedin', 'embed', 'qrcode', 'email', 'sharelink'],
        design: {
          direction: 'HORIZONTAL',
          hideLabel: false,
          btnRad: 0,
          btnColor: '',
          iconColor: '',
          size: 'default'
        }
      }
    })
  })

  it('click copy btn', async () => {
    const _onCopyFn = jest.fn().mockImplementation((text, result) => {
      expect(text).toBe(TAR_URL)
    })

    const props = {
      uiMode: config.uiMode as UiMode,
      sharedUrl: TAR_URL,
      isShowInModal: false,
      shownMode: ShownMode.Content,
      isShowing: true,

      getAppTitle: jest.fn(), // (() => string);
      onItemClick: jest.fn(), // ((name: string, ref: React.RefObject<any>, type: ExpandType, isUpdateUrl?: boolean) => void);
      onBackBtnClick: jest.fn(), // (() => void);

      theme: mockTheme as any,
      intl: intl,
      config: config,

      shortUrl: TAR_URL,
      onShortUrlChange: jest.fn(), // ((shortUrl: string) => void);
      updateUrls: jest.fn(), // (() => string) | (() => void);
      handleError: jest.fn(),

      errorInfo: null,
      isFetchingShortLink: false,

      onCopy: _onCopyFn
    }

    const widgetRef = { current: null }

    const { queryByTestId } = render(<ShareLink {...props} ref={widgetRef} />)
    // widgetRef.current.onCopy = _onCopyFn;
    // let _onCopyFnSpy = jest.spyOn(widgetRef.current, 'onCopy');
    const btn = queryByTestId('copy-btn')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(_onCopyFn).toHaveBeenCalledTimes(1)
    }, { timeout: 200 })
  })
})
