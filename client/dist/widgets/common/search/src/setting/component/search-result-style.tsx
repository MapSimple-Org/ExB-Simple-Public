/** @jsx jsx */
import { React, css, jsx, polished, defaultMessages as jimuCoreDefaultMessage, hooks, ReactRedux, type IMState } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, SearchResultStyle } from '../../config'
import { Icon, Button, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessage from '../translations/default'

interface SearchResultStyleProps {
  id: string
  onSettingChange: SettingChangeFunction
  config: IMConfig
}

const SearchStyleSetting = (props: SearchResultStyleProps) => {
  const STYLE = css`
    .active {
      .style-img {
        border-color: var(--sys-color-primary-light);
      }
    }
    .style-img {
      border: 2px solid var(--ref-palette-neutral-200);
    }
    &>div {
      flex: 1;
    }
    & button, & button:hover, & button.active {
      background-color: var(--ref-palette-neutral-200) !important;
    }
    & button {
      width: ${polished.rem(108)};
      height: ${polished.rem(78)};
      padding: 0;
    }
    .title {
      font-size: ${polished.rem(13)};
      line-height: ${polished.rem(18)};
      margin-top: ${polished.rem(6)};
      color: var(--ref-palette-neutral-1000);
    }
  `

  const isRTL = ReactRedux.useSelector((state: IMState) => {
    return state.appContext.isRTL
  })

  const nls = hooks.useTranslation(defaultMessage, jimuiDefaultMessage, jimuCoreDefaultMessage)
  const { config, id, onSettingChange } = props
  const { searchResultStyle } = config

  const onStyleChange = (style: SearchResultStyle) => {
    onSettingChange({
      id: id,
      config: config.set('searchResultStyle', style)
    })
  }

  return (
    <SettingRow flow='wrap' label={nls('style')} role='radiogroup' aria-label={nls('style')}>
      <div className='d-flex justify-content-between w-100' css={STYLE}>
        <div>
          <Button
            type='tertiary'
            role='radio'
            className={searchResultStyle === SearchResultStyle.Classic ? 'active' : ''}
            title={nls('searchClassic')}
            onClick={() => { onStyleChange(SearchResultStyle.Classic) }}
          >
            <Icon className='style-img w-100 h-100' icon={require(isRTL ? '../assets/style3.png' : '../assets/style1.png')}/>
          </Button>
          <div className='title text-center'>{nls('searchClassic')}</div>
        </div>
        <div>
          <Button
            type='tertiary'
            role='radio'
            className={searchResultStyle === SearchResultStyle.Compact ? 'active' : ''}
            title={nls('searchCompact')}
            onClick={() => { onStyleChange(SearchResultStyle.Compact) }}
          >
            <Icon className='style-img w-100 h-100' icon={require(isRTL ? '../assets/style4.png' : '../assets/style2.png')}/>
          </Button>
          <div className='title text-center'>{nls('searchCompact')}</div>
        </div>
      </div>
    </SettingRow>
  )
}

export default SearchStyleSetting
