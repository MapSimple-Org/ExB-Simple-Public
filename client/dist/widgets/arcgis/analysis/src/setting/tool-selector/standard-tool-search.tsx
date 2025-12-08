/** @jsx jsx */
import { CalciteFilter } from 'calcite-components'
import { React, jsx, css, hooks } from 'jimu-core'
import type { AnalysisToolSearchableItem, AnalysisToolItem } from '@arcgis/analysis-ui-schema'
import { TextInput, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'

const style = css`
  padding: 0 1rem 1rem 1rem;
  .jimu-input .input-wrapper {
    height: 1.625rem;
  }
  calcite-filter {
    display: none;
  }
`
export interface Props {
  toolsArray: AnalysisToolItem[]
  onSearchUpdate: (tools: AnalysisToolSearchableItem[], searchValue: string) => void
}

const StandardToolSearch = (props: Props): React.ReactElement => {
  const { toolsArray, onSearchUpdate } = props

  const translate = hooks.useTranslation(jimuiDefaultMessage)

  const [calciteFilter, setCalciteFilter] = React.useState<HTMLCalciteFilterElement>()

  const [searchValue, setSearchValue] = React.useState('')

  const getSearchableToolsList = (data?: AnalysisToolItem[]): AnalysisToolSearchableItem[] => {
    const tools = data ?? toolsArray
    return tools.map((tool: AnalysisToolItem) => {
      return {
        title: tool.title,
        toolName: tool.toolName,
        analysisEngine: tool.analysisEngine,
        keys: tool.keys
      } as AnalysisToolSearchableItem
    })
  }

  React.useEffect(() => {
    if (!calciteFilter) {
      return
    }
    calciteFilter.filter(searchValue).then(() => {
      const filterResult = calciteFilter.filteredItems as AnalysisToolSearchableItem[]

      onSearchUpdate(filterResult, calciteFilter.value ?? '')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  return (
    <div className="standard-analysis-tool-search w-100" css={style}>
      <CalciteFilter items={getSearchableToolsList(toolsArray)} value={searchValue}
        onKeyDown={(e) => {
          e.stopPropagation()
        }}
        ref={(el) => {
          setCalciteFilter(el)
        }}></CalciteFilter>
      <TextInput
        prefix={<SearchOutlined size="16" color="var(--ref-palette-neutral-900)" />}
        placeholder={translate('SearchLabel')}
        allowClear
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value)
        }}
      />
    </div>
  )
}

export default StandardToolSearch
