/** @jsx jsx */
import { React, jsx, type IntlShape, type IMThemeVariables } from 'jimu-core'
import defaultMessages from '../translations/default'
import { Label, Select, Option, Button, TextInput, Switch, defaultMessages as jimuUIDefaultMessages, Tooltip } from 'jimu-ui'
import { defaultLegendSize, defaultMapSize, defaultPageSize, PageOrientation } from '../constant'
import { type JimuMapView, loadArcGISJSAPIModules } from 'jimu-arcgis'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface Props {
  theme: IMThemeVariables
  intl: IntlShape
  mapView: JimuMapView
  reportData: any[]
  showAreaOfInterest: boolean
  aoiValue: string
  isGroupingEnabled: boolean
  isRTL: boolean
  folderUrl: string
  onReportExported: () => void
}

interface State {
  template: string
  templateTitle: string
  enableExportButton: boolean
  legendEnabled: boolean
  mergeRowsEnabled: boolean
  limitLegend: boolean
}

const defaultPageOptions = Object.keys(defaultPageSize)

/**
 * Report component to render the report template and allow exporting report in PDF format
 * It allows editing the report title and selecting the page size before exporting
 */
export default class Report extends React.PureComponent<Props, State> {
  reportArea: any
  legend: __esri.Legend
  scaleBar: any
  screenshot: __esri.Screenshot
  scaleWidth: number
  compass: any
  attribution: any
  constructor (props) {
    super(props)
    //default values for reportArea
    this.reportArea = {
      'layout': 'a4Portrait',
      'orientation': PageOrientation.Portrait,
      'dpi': 96
    }
    this.legend = null
    this.scaleBar = null
    this.screenshot = null
    this.scaleWidth = null
    this.compass = null
    this.attribution = null
    this.state = {
      enableExportButton: false,
      template: 'a4Portrait',
      templateTitle: this.nls('defaultReportTitle'),
      legendEnabled: true,
      mergeRowsEnabled: false,
      limitLegend: true
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl?.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    this.handleLegendCreation()
  }


  /**
   * Get the page size in pixels
   * @param layout page layout
   * @param dpi page layout dpi
   * @returns size in pixels
   */
  getPageSizeInPixels = (layout, dpi: number) => {
    const sizeInPixels = {
      "Height": defaultPageSize[layout].height * dpi,
      "Width": defaultPageSize[layout].width * dpi
    }
    return sizeInPixels
  }

  /**
   * Get the map size in pixels
   * @param layout page layout
   * @param dpi page layour dpi
   * @returns size in pixels
   */
  getMapSizeInPixels = (layout, dpi: number) => {
    const mapSizeInPixels = {
      "Height": defaultMapSize[layout].height * dpi,
      "Width": defaultMapSize[layout].width * dpi
    }
    return mapSizeInPixels
  }

  /**
   * Get the legend size in pixels
   * @param layout page layout
   * @param dpi page layour dpi
   * @returns size in pixels
   */
  getLegendSizeInPixels = (layout, dpi: number) => {
    const legendSizeInPixels = {
      "Height": defaultLegendSize[layout].height * dpi,
      "Width": defaultLegendSize[layout].width * dpi
    }
    return legendSizeInPixels
  }

  /**
   * Get the page width in px using page size in inches and dpi
   * @returns page width in pixels
   */
  getPageWidthInPixels = () => {
    let sizeInPixels
    // calculate the page size in pixels
    if (this.reportArea) {
      const layout = this.reportArea.layout
      //using size in inches and dpi calculate the size in pixels
      sizeInPixels = this.getPageSizeInPixels(layout, this.reportArea.dpi)
    }
    const pageWidthInPixels: number = sizeInPixels.Width
    return pageWidthInPixels
  }

  /**
   * Get the report size message according to the page size
   * @returns string - report size message to be displayed on report bar
   */
  getReportSizeMessage = () => {
    const pageLayout = this.reportArea.layout
    const format = this.nls(pageLayout)
    //according to orientation set the height & width of the page
    const pageDimensions: string = " (" + defaultPageSize[pageLayout].width + "'' X " + defaultPageSize[pageLayout].height + "'') "
    //show page format, orientation and size
    const reportBarMsg = this.props.intl.formatMessage({
      id: 'reportDimensionsMsg', defaultMessage: defaultMessages.reportDimensionsMsg
    }, { paperSize: format + pageDimensions })
    return reportBarMsg
  }

  /**
   * Handle the legend creation on load
   */
  handleLegendCreation = () => {
    if (this.props.mapView.view != null) {
      this.props.mapView?.view?.when(async (view: __esri.MapView | __esri.SceneView) => {
        if (this.legend != null) {
          this.legend.destroy()
          this.legend = null
        }
        const legendCont = document.createElement('div')
        const [Legend] = await loadArcGISJSAPIModules(['esri/widgets/Legend'])
        this.legend = new Legend({
          container: legendCont,
          view,
          respectLayerDefinitionExpression: true,
          style: {
            type: 'card',
            layout: 'side-by-side',
          },
        })
        //watch the legend state and enable export button when legend is ready
        if (this.legend.viewModel?.state !== 'ready') {
          reactiveUtils.watch(() => this.legend.viewModel?.state, (state) => {
            if (state === 'ready') {
              this.setState({
                enableExportButton: true
              })
            }
          })
        } else {
          this.setState({
            enableExportButton: true
          })
        }
      })
    }
  }

  /**
   * Format and render tables using report data and table nodes
   * @param tableParentNode each table parent node
   * @param reportData export report data
   * @returns table node
   */
  formatAndRenderTables = (tableParentNode: HTMLElement, reportData: any) => {
    const tableInfo = reportData.data
    const updatedGroupFieldCol = this.state.mergeRowsEnabled ? reportData.groupFieldCol : null
    const updatedSubGroupFieldCol = this.state.mergeRowsEnabled ? reportData.subgroupFieldCol : null
    //todo: decide chunk values and max no of columns depending on page size
    let i; let j; let colsTempArray; let rowsTempArray; let chunk = 3
    //table cols can be overridden by setting in the table data properties
    if (tableInfo.maxNoOfCols) {
      chunk = tableInfo.maxNoOfCols
    }
    if (tableInfo.cols.length > chunk) {
      const remainingCols = tableInfo.cols.length - chunk
      if (remainingCols <= 2) {
        chunk = tableInfo.cols.length
      }
    }
    for (i = 0, j = tableInfo.cols.length; i < j; i += chunk) {
      const newTableInfo = { cols: [], rows: [], title: '', totalCount: 0, groupFieldCol: undefined, subgroupFieldCol:undefined }
      let sliceLength = i + chunk
      let breakLoop = false
      if (i === 0) {
        const reportTableTitle = this.props.intl.formatMessage({
          id: 'totalCountLabel', defaultMessage: defaultMessages.totalCountLabel
        }, { tableTitle: reportData.title, total: reportData.totalCount })
        newTableInfo.title = reportTableTitle
      } else {
        newTableInfo.title = ''
      }
      const remainingCols1 = tableInfo.cols.length - (sliceLength)
      if (remainingCols1 <= 2 && remainingCols1 > 0) {
        sliceLength += remainingCols1
        breakLoop = true
      }
      colsTempArray = tableInfo.cols.slice(i, sliceLength)
      rowsTempArray = []
      for (let k = 0; k < tableInfo.rows.length; k++) {
        rowsTempArray.push(tableInfo.rows[k].slice(i, sliceLength))
      }
      newTableInfo.cols = colsTempArray
      newTableInfo.rows = rowsTempArray
      const tableTitleDiv = document.createElement('div')
      tableTitleDiv.className = 'esriCTSectionTitle'
      tableTitleDiv.innerHTML = newTableInfo.title
      tableParentNode.appendChild(tableTitleDiv)

      //always set the group field and subgroup field column index only when rendering the first chunk of columns
      //as we will always have group and subgroup field in the first chunk
      if (i === 0) {
        if (updatedGroupFieldCol !== null && updatedGroupFieldCol !== undefined) {
          newTableInfo.groupFieldCol = updatedGroupFieldCol
        }
        if (updatedSubGroupFieldCol !== null && updatedSubGroupFieldCol !== undefined) {
          newTableInfo.subgroupFieldCol = updatedSubGroupFieldCol
        }
      }
      this.renderTable(tableParentNode, newTableInfo, reportData.data.showRowIndex)
      if (breakLoop) {
        break
      }
    }
    return tableParentNode
  }

  /**
   * Render each table data
   * @param tableParentNode each table parent node
   * @param tableInfo table structure
   * @param showRowIndex each row index
   */
  renderTable = (tableParentNode: HTMLElement, tableInfo: any, showRowIndex: number) => {
    const table = document.createElement('table')
    table.className = 'esriCTTable'
    table.style.width = '100%'
    tableParentNode.appendChild(table)
    const tableBody = document.createElement('tbody')
    table.appendChild(tableBody)
    const tableHeaderRow = document.createElement('tr')
    tableBody.appendChild(tableHeaderRow)
    if (showRowIndex) {
      const header = document.createElement('th')
      header.innerHTML = '#'
      header.style.width = '50px'
      header.style.wordBreak = 'break-word'
      header.style.padding = '4px'
      tableHeaderRow.appendChild(header)
    }
    tableInfo.cols.forEach((col) => {
      const headingCell = document.createElement('th')
      headingCell.innerHTML = col
      headingCell.style.wordBreak = 'break-word'
      headingCell.style.padding = '4px'
      tableHeaderRow.appendChild(headingCell)
    })
    tableInfo.rows.forEach((eachRow, index) => {
      const tableRow = document.createElement('tr')
      tableBody.appendChild(tableRow)
      if (showRowIndex) {
        const cell = document.createElement('td')
        cell.style.padding = '4px'
        cell.style.wordBreak = 'break-word'
        cell.style.wordBreak = 'normal'
        cell.innerHTML = index + 1
        tableRow.appendChild(cell)
      }
      eachRow.forEach((rowValue) => {
        const cellRow = document.createElement('td')
        cellRow.style.padding = '4px'
        if (rowValue === this.nls('noData')) {
          cellRow.style.fontStyle = 'italic'
        }
        cellRow.innerHTML = rowValue
        tableRow.appendChild(cellRow)
      })
    })
    // We have added the group filed first in table and then subgroup field
    // so we need to add rowspan for subgroup field and then to the group field
    // if we don't do subgroup first the cells will be deleted in group while adding rowspan and column index for subgroup field will be corrupted
    // So always pass subgroup field first and then group field
    if (tableInfo.groupFieldCol !== undefined) {
      this.addRowSpans(table, [tableInfo.subgroupFieldCol, tableInfo.groupFieldCol])
    }
  }

  /**
   * Adds row spans to a specified HTML table by merging cells with identical content
   * in the specified columns. This function modifies the table in place.
   *
   * @param table - The HTMLTableElement to modify. If `null` or `undefined`, the function returns immediately.
   * @param columns - An array of column indices to apply the row span logic. Each index corresponds to a column in the table.
   *
   * The function iterates through the rows of the table for each specified column index.
   * It merges consecutive cells with the same content by setting the `rowSpan` property
   * on the first cell and removing the subsequent cells.
   *
   * Example:
   * If the table has the following structure:
   * ```
   * | A | 1 |
   * | A | 1 |
   * | B | 2 |
   * ```
   * After calling `addRowSpans(table, [0])`, the table will be:
   * ```
   * | A | 1 |
   * |   | 1 |
   * | B | 2 |
   * ```
   *
   * @remarks
   * - If a column index is `null` or `undefined`, it will be skipped.
   * - The function assumes that the table rows and cells are well-formed.
   * - The `rowSpan` property is updated for the first cell in a group of identical cells,
   *   and the subsequent cells in the group are removed.
   */
  addRowSpans(table: HTMLTableElement, columns: number[]) {
    if (!table) {
      return
    }
    const rows = table.rows
    columns.forEach((colIndex, groupOrSubGroup) => {
      const isSubGroup = groupOrSubGroup === 0

      if (colIndex === undefined || colIndex === null) {
        return
      }
      let currentValue: string|null = null
      let prevGroupValue: string|null = null
      let startIndex = 0

      for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].cells[colIndex]
        let currentGroupValue: string|null = null
        if (!cell) {
          continue
        }
        //in case of subgroup check the group value also so that when two consecutive subgroup values are same from different group they will be merged
        if (isSubGroup) {
          currentGroupValue = rows[i].cells[columns[1]].textContent
        }
        const currentCellValue = cell.textContent
        if (currentCellValue === currentValue && (!isSubGroup || currentGroupValue === prevGroupValue) ) {
          if (cell && cell.remove) {
            cell.remove()
          }
        } else {
          if (i > startIndex) {
            if (rows[startIndex]?.cells[colIndex]) {
              rows[startIndex].cells[colIndex].rowSpan = i - startIndex
            }
          }
          currentValue = currentCellValue
          prevGroupValue = currentGroupValue
          startIndex = i
          if (rows.length > startIndex && startIndex >= 0 && colIndex >= 0) {
            if (rows[startIndex]?.cells?.[colIndex]) {
              rows[startIndex].cells[colIndex].rowSpan = rows.length - startIndex
            }
          }
        }
      }
    })
  }


  /**
   * Render the HTML content with tables
   * @returns print report div node
   */
  renderHtmlContent = () => {
    const mainDiv = document.createElement('div')
    let printDiv
    this.props.reportData.forEach((repData) => {
      printDiv = this.formatAndRenderTables(mainDiv, repData)
    })
    return printDiv
  }

  /**
   * On template change update the current template
   * @param evt event of the template
   */
  onTemplateChange = (evt) => {
    this.setState({
      template: evt.target.value
    })
    //update the report layout depending on the page size and orientation
    const filteredLayout = defaultPageOptions.filter((option) => { return evt.target.value === option })
    this.reportArea.layout = filteredLayout[0]
    if (filteredLayout[0].includes(PageOrientation.Portrait)) {
      this.reportArea.orientation = PageOrientation.Portrait
    } else {
      this.reportArea.orientation = PageOrientation.Landscape
    }
  }

  /**
   * On report title change update the current title
   * @param event event of the report title
   */
  titleLabelChange = (event) => {
    if (event?.target) {
      const value = event.target.value
      this.setState({
        templateTitle: value ?? value.trim()
      })
    }
  }

  /**
   * Get the report template
   * @returns report template
   */
  getReportTemplate = async () => {
    const reportTitle = this.state.templateTitle
    const pageWidthInPixels = this.getPageWidthInPixels()
    const legendSizeInPixels = this.getLegendSizeInPixels(this.reportArea.layout, this.reportArea.dpi)
    // Reduced legend max height by 8px to avoid cut issue of legend symbol
    const reducedLegendSize = legendSizeInPixels.Height - 8
    //calculate the legend grid columns depending on the page size, each legend item width is 200px
    const legendGridColumns = Math.trunc(pageWidthInPixels / 200)
    const gridColumns = ['200px']
    for (let i = 1; i < legendGridColumns; i++) {
     gridColumns.push('200px')
    }
    //get the report bar message
    const reportBarMsg = this.getReportSizeMessage()
    //get html contents to be rendered
    const dataDiv = this.renderHtmlContent()
    this.scaleBar = this.handleScaleBar()
    this.compass = this.handleCompass()
    this.attribution = this.handleAttribution()
    //Get the map's screenshot and then export the report
    const mapImageUrl = await this.viewScreenshot()
    const printJs = `${this.props.folderUrl}dist/runtime/assets/js/print.js`
    let attributionRight = '28px'
    let scaleBarLeft = '18px'
    switch (this.reportArea.layout) {
      case 'a3Portrait':
      case 'a4Landscape':
      case 'letterAnsiALandscape':
        attributionRight = '28px'
        scaleBarLeft = '27px'
        break
      case 'a3Landscape':
        attributionRight = '42px'
        scaleBarLeft = '40px'
        break
      case 'a4Portrait':
        attributionRight = '20px'
        scaleBarLeft = '18px'
        break
      case 'letterAnsiAPortrait':
        attributionRight = '20px'
        scaleBarLeft = '19px'
        break
      case 'tabloidAnsiBPortrait':
        attributionRight = '26px'
         scaleBarLeft = '25px'
        break
      case 'tabloidAnsiBLandscape':
        attributionRight = '41px'
         scaleBarLeft = '40px'
        break
    }
    return `
      <!DOCTYPE HTML>
      <html lang="en" dir="ltr">
        <head id="reportHead">
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
            <title></title>
            <!-- Report prev page css -->
            <style type="text/css">
                .esriCTReportMapWait {
                    height: 5px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                    background-color: #ddd;
                }

                .esriCTReportMapWait:before {
                    display: block;
                    position: absolute;
                    content: "";
                    left: -200px;
                    width: 200px;
                    height: 5px;
                    background-color: #2980b9;
                    animation: loading 2s linear infinite;
                }

                .display-none {
                  display: none;
                }

                .esrCTAOIInfoDiv {
                  position: relative;
                  margin-top: 8px;
                }

                .jimu-rtl .esrCTAOIInfoDiv {
                  direction: rtl;
                }

                .esriAOITitle {
                  font-size: 18px;
                  font-weight: bold;
                  color: #000000;
                  width: 100%;
                }

                .esriCTAOITitleInput {
                  font-size: 18px;
                  font-weight: bold;
                  color: #000000;
                  width: 100%;
                  border: none;
                  padding: 0px;
                }

                .esriCTAOIArea {
                  visibility: ${this.props.showAreaOfInterest ? 'visible' : 'hidden'};
                  margin: 10px 0;
                  font-size: 16px;
                }

                .esriCTAOIInputArea {
                  border: none;
                  font-size: 16px;
                  width: 100%;
                  padding: 0px;
                }

                .esriCTPrintLocaleDateDiv {
                  margin: 10px 0;
                  font-size: 16px;
                }

                .esriCTLocaleDateInputTitle {
                  height: 30px;
                  line-height: 30px;
                  border: none;
                  font-size: 16px;
                  width: 100%;
                  padding: 0px;
                }

                .compassContainer {
                  display: ${this.compass?.innerHTML ? 'block' : 'none'};
                  position: absolute;
                  top: 45px;
                  left: 45px;
                  background: #fff;
                  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
                  --calcite-ui-icon-color: #000;
                  border-radius: 50%;
                }

                .compassContainer .esri-compass {
                  border-radius: 50%;
                }

                .compassContainer .esri-compass__icon.esri-icon-compass {
                  color: #000;
                }

                .compassContainer .esri-widget--button {
                  text-align: center;
                  flex-flow: row;
                  justify-content: center;
                  align-items: center;
                  width: 32px;
                  height: 32px;
                  margin: 0;
                  padding: 0;
                  font-size: 12px;
                  transition: background-color .125s ease-in-out;
                  display: flex;
                  overflow: hidden;
                }

                .compassContainer .esri-compass__icon-container {
                  justify-content: center;
                  display: flex;
                }

                .scaleBarContainer {
                  display: ${this.props.mapView.view.type === '3d' || !this.scaleBar?.innerHTML ? 'none' : 'block'};
                  position: absolute;
                  bottom: 4px;
                  left: ${scaleBarLeft};
                }

                .print__scale-bar-container .esri-scale-bar__label {
                  color: #323232;
                  font-size: 10px;
                  padding: 0 4px;
                }

                .scaleBarContainer .esri-scale-bar__bar-container:nth-child(1n+3) {
                    display: none;
                }

                .scaleBarContainer .esri-scale-bar__line--bottom {
                  width: ${this.scaleWidth} !important;
                  border-top: 2px solid #323232;

                }

                .scaleBarContainer .esri-scale-bar__label-container .esri-scale-bar__label {
                  border-left: 1px solid #323232;
                  border-right: 2px solid #323232;
                  background-color: rgba(255, 255, 255, 0.66);
                }

                .scaleBarContainer .esri-scale-bar__line--top:before,
                .scaleBarContainer .esri-scale-bar__line--top:after,
                .scaleBarContainer .esri-scale-bar__line--bottom:before,
                .scaleBarContainer .esri-scale-bar__line--bottom:after {
                    background-color: #323232;
                    border-right: 2px solid #323232;
                }

                .scale-attribution {
                  position: absolute;
                  bottom: 5px;
                  right: ${attributionRight};
                  text-align: right;
                  max-width: calc(100% - ${this.props.mapView.view.type === '2d' ? '300px' : '80px'});
		              display: ${this.attribution?.innerHTML ? 'block' : 'none'};
                }

                .attribution-group {
                  width: 100%;
                  display: flex;
                  align-items: flex-start;
                }

                .shell-attribution {
                  width: 100% !important;
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.20);
                }

                .attribution-ui {
                  pointer-events: auto;
                  position: relative;
                }

                .attributionContainer {
                  position: relative;
                  color: #323232;
                  background-color: rgba(255, 255, 255, 0.65);
                  flex-flow: column;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 12px;
                  line-height: 16px;
                  display: flex;
                }

                .attributionContainer .esri-attribution__sources {
                  flex: 1 0;
                  align-self: flex-start;
                  padding: 0 5px;
                  font-weight: 300;
                  overflow: hidden;
                }

                .attributionContainer .esri-attribution__powered-by {
                  text-align: right;
                  white-space: nowrap;
                  align-self: flex-end;
                  padding: 0 5px;
                  font-weight: 400;
                }

                .printLegendContainer {
                    background: #fff;
                    width: 98%;
                    max-height: ${this.state.limitLegend ? reducedLegendSize + 'px' : 'auto'};
                    margin: 20px 2%;
                    display: block;
                    overflow: ${this.state.limitLegend ? 'hidden' : 'initial'};
                }

                .jimu-rtl .printLegendContainer {
                    direction: rtl;
                }

                .esri-legend {
                    overflow: hidden auto;
                }

                .esri-widget {
                    --esri-widget-padding-x: 15px;
                    --esri-widget-padding-y: 12px;
                    --esri-widget-padding: var(--esri-widget-padding-y) var(--esri-widget-padding-x);
                    box-sizing: border-box;
                    color: #323232;
                    background-color: #fff;
                    font-family: Avenir Next, Helvetica Neue, helvetica, arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.3em;
                }

                .printLegendContainer .esri-legend--card {
                    border: none;
                    gap: 6pt 12pt;
                    display: grid;
                    grid-template-columns: ${gridColumns.join(' ')};
                }

                .esri-legend--card,
                .esri-legend--card__service-content {
                    flex-flow: row wrap;
                }

                .esri-legend--card__service-content {
                    height: calc(100% - 60px);
                    display: flex;
                }

                .printLegendContainer .esri-widget>*:not(.esri-scale-bar.esri-widget > *) {
                    background: #fff;
                    color: #323232;
                }

                .esri-legend--card {
                    transition: max-width .25s ease-in-out;
                    display: flex;
                    position: relative;
                }

                .printLegendContainer .esri-legend--card__section {
                    padding: 0pt 0 0pt;
                    min-width: unset;
                }

                .printLegendContainer .esri-legend--card__section:first-child {
                    border-left: none;
                }

                .esri-legend--card__section {
                    font-size: 12px;
                    overflow: visible;
                }

                .printLegendContainer .esri-legend--card__service {
                    border: none;
                    flex: 0 1 auto;
                    break-inside: avoid;
                }

                section.esri-legend--card__service.esri-legend--card__group-layer-child {
                    margin: ${this.props.isRTL ? "10px 10px 0 0": "10px 0 0 10px"}
                }

                .esri-legend--card__service {
                    min-width: fit-content;
                }

                .printLegendContainer .esri-legend--card__service-caption-container {
                    padding: 0;
                    border-bottom: none;
                }

                .esri-legend--card__service-caption-container {
                    font-weight: 600;
                }

                .printLegendContainer .esri-legend--card__service-caption-text {
                    padding-bottom: 4px;
                    word-break: break-word;
                }

                .esri-legend--card__service-caption-text {
                    margin: 0;
                    overflow: auto;
                }

                .esri-legend--card__label-container {
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                    display: flex;
                    column-gap: 20px;
                    row-gap: 10px;
                }

                .esri-legend--card__label-element {
                    min-height: 23px;
                    min-width: 30px;
                }

                .esriCTReportMapImg {
                    margin-top: 10px;
                    border: 1px solid black;
                }

                @keyframes loading {
                    from {
                        left: -200px;
                        width: 30%;
                    }

                    50% {
                        width: 30%;
                    }

                    70% {
                        width: 70%;
                    }

                    80% {
                        left: 50%;
                    }

                    95% {
                        left: 120%;
                    }

                    to {
                        left: 100%;
                    }
                }

                .esriCTHTMLData {
                    position: relative;
                    width: 100%;
                    height: auto;
                }

                .jimu-rtl .esriCTHTMLData {
                    direction: rtl;
                }

                .esriCTTable {
                    margin-top: 10px;
                    padding: 0;
                    border-collapse: collapse;
                    border-spacing: 0;
                    width: 100%;
                    page-break-inside: avoid;
                    table-layout: fixed;
                }

                .jimu-rtl .esriCTTable {
                    direction: rtl;
                }

                .esriCTTable th {
                    border: 1px solid gray;
                    background-color: ${this.props.theme.ref.palette.primary[100]};
                    word-wrap: break-word;
                }

                .esriCTTable td {
                    border: 1px solid gray;
                    word-wrap: break-word;
                }

                .esriCTSectionTitle {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 15px 0px;
                    width: calc(100% - 10px);
                    word-break: break-all;
                }

                .jimu-rtl .esriCTSectionTitle {
                    direction: rtl;
                }

                .jimu-rtl .esriCTReportMap .esriCTSectionTitle {
                    float: none;
                }

                .esriCTReportLogo {
                    float: left;
                    max-width: calc(50% - 10px);
                    margin: auto 10px auto 0;
                    max-height: 90%;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                }

                .jimu-rtl .esriCTReportLogo {
                    float: right;
                    margin: auto 0 auto 10px;
                }

                .esriCTPrintTitleDiv {
                    height: 56px;
                    float: left;
                    width: 100%;
                }

                .jimu-rtl .esriCTPrintTitleDiv {
                    float: right;
                    direction: rtl;
                }

                .esriCTInputTitle {
                    height: 55px;
                    line-height: 55px;
                    border: none;
                    font-size: 25px;
                    width: 100%;
                    padding: 0px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .esriCTInputTitle::-ms-clear {
                    display: none;
                }

                .esriCTReportMain {
                    background: #FFF;
                    border: solid 1px #000;
                    margin: 0 auto;
                    padding: 20px;
                    width: 797px;
                }

                .esriCTReportMap {
                    text-align: center;
                }

                .esriCTReportLandscapeMapImg {
                    max-width: 80%;
                }

                .esriCTReportMapFail {
                    height: 50px;
                }

                .esriCTPrintPage {
                    padding: 30px 0;
                    margin: 20px auto;
                    font-family: arial, sans-serif;
                    font-size: 13px;
                }

                .jimu-rtl {
                    padding: 30px 0;
                    margin: 20px auto;
                    font-family: arial, sans-serif;
                    font-size: 13px;
                }

                .esriCTReportBar {
                    width: 100%;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 6;
                    height: 50px;
                    background: #e2f1fc;
                    border-bottom: 1px solid #000;
                }

                .jimu-rtl .esriCTReportBar {
                    left: inherit;
                    right: 0;
                }

                .esriCTPrintButton,
                .esriCTCloseButton {
                    color: #444;
                    font-family: Verdana, Helvetica, sans-serif;
                    font-size: 12px;
                    -moz-border-radius: 3px;
                    -webkit-border-radius: 3px;
                    border-radius: 3px;
                    border: 1px solid #8b8b8b;
                    box-shadow: none;
                    -webkit-box-shadow: none;
                    background: #F2F2F2;
                    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU1ZTUiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);
                    background: -moz-linear-gradient(top, #F2F2F2 0%, #D1D1D1 100%);
                    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #F2F2F2), color-stop(100%, #D1D1D1));
                    background: -webkit-linear-gradient(top, #F2F2F2 0%, #D1D1D1 100%);
                    background: -o-linear-gradient(top, #F2F2F2 0%, #D1D1D1 100%);
                    background: -ms-linear-gradient(top, #F2F2F2 0%, #D1D1D1 100%);
                    background: linear-gradient(to bottom, #F2F2F2 0%, #D1D1D1 100%);
                    filter: progid: DXImageTransform.Microsoft.gradient(startColorstr='#F2F2F2', endColorstr='#D1D1D1', GradientType=0);
                    margin: 10px 20px;
                    line-height: 16px;
                    display: block;
                    padding: 5px 10px;
                    outline: 0;
                    text-decoration: none;
                    cursor: pointer;
                    font-weight: 400;
                    white-space: nowrap;
                    float: right;
                }

                .jimu-rtl .esriCTPrintButton,
                .jimu-rtl .esriCTCloseButton {
                    float: left;
                }

                .esriCTPrintButton:hover,
                .esriCTPrintButton:focus,
                .esriCTCloseButton:hover,
                .esriCTCloseButton:focus {
                    background: #E5E6E6;
                    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU1ZTUiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);
                    background: -moz-linear-gradient(top, #E5E6E6 0%, #A0A1A1 100%);
                    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #E5E6E6), color-stop(100%, #A0A1A1));
                    background: -webkit-linear-gradient(top, #E5E6E6 0%, #A0A1A1 100%);
                    background: -o-linear-gradient(top, #E5E6E6 0%, #A0A1A1 100%);
                    background: -ms-linear-gradient(top, #E5E6E6 0%, #A0A1A1 100%);
                    background: linear-gradient(to bottom, #E5E6E6 0%, #A0A1A1 100%);
                    filter: progid: DXImageTransform.Microsoft.gradient(startColorstr='#E5E6E6', endColorstr='#A0A1A1', GradientType=0);
                }

                .esriCTReportHeader {
                    display: block;
                    width: 100%;
                    height: 60px;
                    border-bottom: 1px solid #000;
                    margin-bottom: 5px;
                    position: relative;
                }

                .esriCTReportBarMsg {
                    text-align: center;
                    margin-top: 16px;
                }

                .jimu-rtl .esriCTReportBarMsg {
                    direction: rtl;
                }

                .esriCTHidden {
                    display: none;
                }
            </style>
            <!-- Media print css -->
            <style type="text/css" media="print">
                .esriCTPrintPage {
                    padding: 0;
                    color: #000;
                    margin: 0;
                    float: none;
                    background: #fff url(none);
                }

                .esriCTTable {
                    border-spacing: 0;
                    margin-top: 10px;
                    padding: 0;
                    width: 100%;
                    page-break-inside: avoid;
                    table-layout: fixed;
                }

                .printLegendContainer {
                  page-break-after: always;
                }

                .esriCTPageBreak {
                    page-break-after: always;
                }

                .esriCTReportBar {
                    display: none;
                }

                .esriCTReportMain {
                    border: none;
                }

                .esriCTTable th {
                    border: 1px solid gray;
                    background-color: ${this.props.theme.ref.palette.primary[100]};
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    word-wrap: break-word;
                }

                .esriCTTable td {
                    border: 1px solid gray;
                }

                .esriCTTable tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
            </style>
        </head>

        <body id="reportBody" class=${this.props.isRTL ? "jimu-rtl" : "esriCTPrintPage" }>
          <div class="esriCTReportBar">
            <div id="closeButton" class="esriCTCloseButton" title="Close">${this.nls('close')}</div>
            <div id="printButton" class="esriCTPrintButton" title="Print">${this.nls('print')}</div>
            <div id="reportBarMsg" class="esriCTReportBarMsg">${reportBarMsg}</div>
          </div>
          <div id="reportMain" style="width: ${pageWidthInPixels}px" class="esriCTReportMain">
            <div id="reportHeader" class="esriCTReportHeader">
              <img id="reportLogo" class="esriCTReportLogo esriCTHidden" src="">
              <div id="printTitleDiv" class="esriCTPrintTitleDiv">
                <div class="esriCTInputTitle">${reportTitle}</div>
              </div>
            </div>
            <div class='esrCTAOIInfoDiv'>
              <div class='esriAOITitle'>
               <input class='esriCTAOITitleInput' tabindex='0' type='text' value='${this.nls('areaOfInterestLabel')}' role='textbox' aria-label=${this.nls('areaOfInterestLabel')}>
              </div>
              <div class='esriCTAOIArea'>
                <input class='esriCTAOIInputArea' tabindex='0' type='text' value='${this.aoiValueLabel()}' role='textbox' aria-label='${this.aoiValueLabel()}'>
              </div>
              <div class='esriCTPrintLocaleDateDiv'>
                <input type='text' tabindex='0' class='esriCTLocaleDateInputTitle' value='${this.dateValueLabel()}' role='textbox' aria-label='${this.dateValueLabel()}'>
              </div>
            </div>
            <div style="text-align: center;position: relative;">
              <img class='esriCTReportMapImg' src=${mapImageUrl}></img>
              <div class="compassContainer">${this.compass?.innerHTML}</div>
              <div class="scaleBarContainer">${this.scaleBar?.innerHTML}</div>
              <div class="scale-attribution">
                <div class="attribution-group">
                  <div class="shell-attribution">
                    <div class="attribution-ui">
                      <div class="attributionContainer">${this.attribution?.innerHTML}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="legendDiv" class=${this.state.legendEnabled ? "printLegendContainer" : "display-none"}>
              ${this.legend?.container?.innerHTML}
            </div>
            <div id="reportData">${dataDiv.innerHTML}</div>
          </div>
          <script src='${printJs}'></script>
        </body>
      </html>
    `
  }

  /**
   * Get area of interest label and value from nls
   * @returns aoi value label
   */
  aoiValueLabel = () => {
    let aoiValueLabel = ''
    aoiValueLabel = this.props.intl.formatMessage({
      id: 'aoiValueLabel',
      defaultMessage: defaultMessages.aoiValueLabel
    }, { areaValue: this.props.aoiValue })
    return aoiValueLabel
  }

  /**
   * Get date label and value from nls
   * @returns date value label
   */
  dateValueLabel = () => {
    let dateValueLabel = ''
    const date = new Date(Date.now())
    dateValueLabel = this.props.intl.formatMessage({
      id: 'dateValueLabel',
      defaultMessage: defaultMessages.dateValueLabel
    }, { dateValue: date?.toString() })
    return dateValueLabel
  }

  /**
   * Export the PDF on click of Export button
   */
  exportOnClick = async () => {
    //execute onReportExported
    this.props.onReportExported()
    //generate the report template with the report data
    const reportTemplate = await this.getReportTemplate()
    //create url using the template and open in new window
    const blob = new Blob([reportTemplate], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  /**
   * Handle the map view attribution
   * @returns attribution container
   */
  handleAttribution = () => {
    if (this.props.mapView.view != null) {
      const attributionTool = this.props.mapView.jimuMapTools.filter((tools) => { return tools.name === 'Attribution' })
      const attributionContainer = (attributionTool?.[0]?.instance as __esri.Widget)?.container
      const attribution = attributionContainer?.className?.includes('esri-attribution')
      if (attribution && attributionContainer != null && typeof attributionContainer !== 'string') {
        return attributionContainer.cloneNode(true)
      }
    }
  }

  /**
   * Handle the map view compass
   * @returns compass container
   */
  handleCompass = () => {
    if (this.props.mapView.view != null) {
      const compassTool = this.props.mapView.jimuMapTools.filter((tools) => { return tools.name === 'Compass' })
      const compassContainer = (compassTool?.[0]?.instance as HTMLArcgisCompassElement)?.shadowRoot?.querySelectorAll('.compass')
      if (compassContainer != null && typeof compassContainer !== 'string' && compassContainer.length > 0) {
        const compassNode: any = compassContainer[0].cloneNode(true)
        //apply the icons rotation on the svg
        const svgStyle = 'style="transform: ' + compassNode.children[0].children[0].children[0].style.transform + '"'
        compassNode.children[0].children[0].children[0].innerHTML = '<svg ' + svgStyle + ' aria-hidden="true" fill="currentColor" height="25" width="27" xmlns="http://www.w3.org/2000/svg" class=" svg " viewBox="0 0 24 24"><path d="M12 22.981l4.12-11.49L12 1.149 7.88 11.49zM9.125 12h5.75L12 20.019z"></path></svg>'
        return compassNode
      }
    }
  }

  /**
   * Handle the map view scale bar
   * @returns scale bar container
   */
  handleScaleBar = () => {
    if (this.props.mapView.view != null) {
      const scaleBarTool = this.props.mapView.jimuMapTools.filter((tools) => { return tools.name === 'ScaleBar' })
      const scaleBarContainer = (scaleBarTool?.[0]?.instance as HTMLArcgisScaleBarElement)?.shadowRoot?.querySelectorAll('.esri-scale-bar')
      if (scaleBarContainer != null && typeof scaleBarContainer !== 'string' && scaleBarContainer.length > 0) {
        return scaleBarContainer[0].cloneNode(true)
      }
    }
  }

  /**
   * Take the screenshot of the map and return the map image url
   * @returns map image dataUrl
   */
  viewScreenshot = async (): Promise<string> => {
    const mapSizeInPixels = this.getMapSizeInPixels(this.reportArea.layout, this.reportArea.dpi)
    const legendSizeInPixels = this.getLegendSizeInPixels(this.reportArea.layout, this.reportArea.dpi)
    const imgWidth = mapSizeInPixels.Width
    const imgHeight = this.state.legendEnabled ? mapSizeInPixels.Height : mapSizeInPixels.Height + legendSizeInPixels.Height + 30
    this.screenshot = await this.props.mapView.view.takeScreenshot({
      width: (imgWidth/ 100) * 95,
      height: (imgHeight/ 100) * 95
    })
    this.handleScaleBarSize()
    return this.screenshot.dataUrl
  }

  /**
   * Handle the scalebar size
   */
  handleScaleBarSize = () => {
    if (this.scaleBar) {
      const bottomBar: HTMLDivElement | null = this.scaleBar.querySelector('.esri-scale-bar__line--bottom')
      this.scaleWidth = this.getScaleBarWidth(bottomBar)
    }
  }

  /**
   * Get the scale bar width
   * @param bar scale bar div element
   * @returns scale bar width
   */
  getScaleBarWidth = (bar: HTMLDivElement | null) => {
    if (bar != null && this.screenshot != null) {
      const width = this.screenshot.data.width / 2
      const barWidth = Number(bar.style.width.replace('px', ''))
      return (barWidth / width) * 100
    }
    return null
  }

  /**
   * Update state on legend option changes
   * @param evt event of legend option change
   */
  onLegendOptionChange = (evt: any) => {
    this.setState({
      legendEnabled: evt.target.checked
    })
  }

  /**
   * Update state on merge rows option change
   * @param evt event of merge rows option change
   */
  onMergeRowsOptionChange = (evt: any) => {
    this.setState({
      mergeRowsEnabled: evt.target.checked
    })
  }

  // /**
  //  * Update state on limit legend option changes
  //  * @param evt event of limit legend option change
  //  */
  // onLimitLegendOptionChange = (evt: any) => {
  //   this.setState({
  //     limitLegend: evt.target.checked
  //   })
  // }

  render() {
    return (
      <div style={{ width: 200 }}>
        <div>
          <Label aria-label={this.nls('template')} className={'text-break'}>
            {this.nls('template')}
          </Label>
        </div>
        <div>
          <Select aria-label={this.nls('template')} className={'pt-1'} name='template'
            size={'sm'} value={this.state.template} onChange={this.onTemplateChange}>
            {defaultPageOptions.map((pageOption) => {
              return <Option role={'option'} aria-label={this.nls(pageOption)} key={pageOption} value={pageOption}>{this.nls(pageOption)}</Option>
            })}
          </Select>
        </div>
        <div className='pt-3'>
          <Label aria-label={this.nls('title')} className={'text-break'}>
            {this.nls('title')}
          </Label>
        </div>
        <div>
          <TextInput className='w-100' role={'textbox'} aria-label={this.nls('title')} title={this.state.templateTitle}
            size={'sm'} value={this.state.templateTitle} onChange={this.titleLabelChange} />
        </div>
        <div className='pt-3 d-flex'>
          <Label className='w-100 pr-2'>{this.nls('LegendLabel')}</Label>
          <Switch role={'switch'} aria-label={this.nls('LegendLabel')} title={this.nls('LegendLabel')}
            checked={this.state.legendEnabled} onChange={this.onLegendOptionChange} />
        </div>
        {this.props.isGroupingEnabled &&
          <div className={'pt-3 d-flex'}>
            <Label aria-label={this.nls('mergeRowsLabel')} className={'w-100 d-flex'}>
              <div className='flex-grow-1 text-break'>
                {this.nls('mergeRowsLabel')}
              </div>
            </Label>
            <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('mergeRowsTooltip')}
              title={this.nls('mergeRowsTooltip')} showArrow placement='top'>
              <div className='title3 text-default mr-4 d-inline'>
                <InfoOutlined />
              </div>
            </Tooltip>
            <Switch role={'switch'} className='mt-1' aria-label={this.nls('mergeRowsLabel')} title={this.nls('mergeRowsLabel')}
              checked={this.state.mergeRowsEnabled} onChange={this.onMergeRowsOptionChange} />
          </div>
        }
        {/* {this.state.legendEnabled &&
          <div className='pt-3 d-flex'>
            <Label style={{ maxWidth: '148px' }} className='pr-2'>{this.nls('limitMaxLegend')}</Label>
            <Switch role={'switch'} aria-label={this.nls('limitMaxLegend')} title={this.nls('limitMaxLegend')}
              checked={this.state.limitLegend} onChange={this.onLimitLegendOptionChange} />
          </div>
        } */}
        <div className='pt-3'>
          <Button role={'button'} disabled={!this.state.enableExportButton}
            className={'text-break w-100'} size={'default'} type='primary' onClick={this.exportOnClick}>
            {this.nls('exportBtnTitle')}
          </Button>
        </div>
      </div>
    )
  }
}
