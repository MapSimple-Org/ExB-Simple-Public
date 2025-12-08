/** @jsx jsx */
import { React, ReactDOM, jsx, css, hooks, moduleLoader, type IMSqlExpression, type DataSource, SqlExpressionMode, QueryScope, focusElementInKeyboardMode } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Button, Label } from 'jimu-ui'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import defaultMessages from '../translations/default'
import type { WidgetDomRef } from '../utils'
import type * as SqlExpressionBuilderModule from 'jimu-ui/advanced/sql-expression-builder'

export interface CustomSqlBuilderProps {
  isRTL: boolean
  widgetId: string
  widgetDomRef: WidgetDomRef
  dataSource: DataSource
  imSqlExpression: IMSqlExpression
  onBack: (imSqlExpression: IMSqlExpression) => void
}

const style = css`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .select-custom-sql-builder-header {
    padding: 16px;
  }

  .raw-sql-expression-builder {
    position: absolute;
    left: 16px;
    right: 16px;
    top: 53px;
    bottom: 16px;
    height: auto !important;
    overflow-x: auto;

    &.small-mode .sql-expression-builder .sql-expression-container {
      min-width: 240px;
    }
  }
`
/**
 * Wrapper of SqlExpressionBuilder, this component will cover the whole widget.
 */
export default function CustomSqlBuilder (props: CustomSqlBuilderProps) {
  const {
    isRTL,
    widgetId,
    widgetDomRef,
    dataSource,
    imSqlExpression: imSqlExpressionProp,
    onBack: onBackProp
  } = props

  const widgetDom = widgetDomRef?.current

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const [SqlExpressionBuilder, setSqlExpressionBuilder] = React.useState<typeof SqlExpressionBuilderModule.SqlExpressionBuilder>(null)

  const [currImSqlExpression, setCurrImSqlExpression] = React.useState<IMSqlExpression>(imSqlExpressionProp)

  const onBackBtnClicked = React.useCallback(() => {
    onBackProp(currImSqlExpression)
  }, [currImSqlExpression, onBackProp])

  const onExpressionChange = React.useCallback((newImSqlExpression: IMSqlExpression) => {
    setCurrImSqlExpression(newImSqlExpression)
  }, [setCurrImSqlExpression])

  // SqlExpressionBuilder is a little big, need to load it dynamically.
  React.useEffect(() => {
    async function loadSqlExpressionBuilder () {
      try {
        const modules = await moduleLoader.loadModules<[typeof SqlExpressionBuilderModule]>(['jimu-ui/advanced/sql-expression-builder'])

        if (modules && modules[0].SqlExpressionBuilder) {
          setSqlExpressionBuilder(modules[0].SqlExpressionBuilder)
        }
      } catch (e) {
        console.error('load SqlExpressionBuilder error', e)
      }
    }

    loadSqlExpressionBuilder()
  }, [])

  const onButtonRef = React.useCallback((buttonDom: HTMLButtonElement) => {
    if (buttonDom) {
      focusElementInKeyboardMode(buttonDom)
    }
  }, [])

  if (!widgetDom) {
    return null
  }

  return (
    ReactDOM.createPortal(
      (
        <div className='select-custom-sql-builder surface-1 border-0' css={style}>
          <div className='select-custom-sql-builder-header'>
            <Button
              type='tertiary'
              color='inherit'
              size='sm'
              icon
              ref={onButtonRef}
              aria-label={translate('back')}
              onClick={onBackBtnClicked}
            >
              <ArrowLeftOutlined autoFlip={isRTL} />
            </Button>
            <Label>
              { translate('buildCustomSQL') }
            </Label>
          </div>

          {
            SqlExpressionBuilder && dataSource &&
            <SqlExpressionBuilder
              className='raw-sql-expression-builder'
              dataSource={dataSource}
              mode={SqlExpressionMode.Simple}
              widgetId={widgetId}
              expression={currImSqlExpression}
              noScrollForList
              queryScope={QueryScope.InRuntimeView}
              onChange={onExpressionChange}
            />
          }
        </div>
      ),
      widgetDom
    )
  )
}
