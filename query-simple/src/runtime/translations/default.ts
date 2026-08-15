export default {
  _widgetLabel: 'QuerySimple',
  reset: 'Reset',
  // r028.143 DCE batch items 1+5: refusal messages for blocked Search + spatial required markers
  searchBlockedNoValue: 'Enter a value to search',
  searchBlockedLoading: 'The data source is still loading. Try again in a moment.',
  spatialBlockedNoDrawing: 'Draw a shape on the map first',
  spatialBlockedNoResults: 'Run a search first. Operations use the current results as input.',
  spatialBlockedNoRelationship: 'Select a spatial relationship',
  spatialBlockedNoLayers: 'Select at least one target layer',
  // r028.148: named to dodge jimu-core's own 'requiredField' key ("This is a required
  // field." in en, localized everywhere), which shadowed our terse marker exactly like the
  // 'apply' collision in r028.146. Widget-unique names only.
  qsRequiredMarker: 'Required',
  searchLayer: 'Search layer',
  // r028.146: key renamed from 'apply' - jimu-core ships an 'apply' key in every locale and
  // the IntlProvider resolves by id BEFORE widget defaults, so our value was shadowed and the
  // button kept showing the framework's 'Apply'. Widget-unique key dodges the collision.
  searchButtonLabel: 'Search',
  noDataAvailable: 'Error in loading data',
  noQueryItem: 'No query',
  newQueryHint: 'Add content by clicking the "{label}" button on the configuration panel',
  attributeFilter: 'Attribute filter',
  spatialFilter: 'Spatial filter',
  spatialFilterType_CurrentMapExtent: 'Current map extent',
  spatialFilterType_InteractiveDrawMode: 'Drawn graphic',
  results: 'Results',
  featuresDisplayed: 'Features displayed',
  clearResult: 'Clear all results',
  checkResult: 'Check results',
  mapMustBeVisible: 'Map must be visible',
  chooseFilterType: 'Choose the filter type',
  chooseGeometryType: 'Choose the geometry type',
  clearDrawing: 'Clear the graphic when searching',
  featureFromDs: 'Selecting features from data source',
  featureFromMap: 'Geometries from a map',
  chooseFilterLayer: 'Choose a filter layer',
  selectedRecords: '{num} records are selected for the filter',
  spatialNotAvailable: 'Spatial filter is not available here.',
  spatialNotAvailableDesc: 'Spatial filter is not supported for a data source that already contains a spatial query.',
  preconfigured: 'Preconfigured',
  runtime: 'Runtime',
  selectLoaded: 'Select loaded',
  retrieving: 'Retrieving query results...',
  clearing: 'Clearing results...',
  zoomToSelected: 'Zoom to selected',
  zoomToRecord: 'Zoom to',
  panToRecord: 'Pan to',
  removeResult: 'Remove',
  resultActions: 'Result actions',
  queryTab: 'Query',
  spatialTab: 'Spatial',
  resultsTab: 'Results',
  // r028.133: Tab help defaults (TAB_HELP_SPEC Phase 1, TODO #36). Org-configurable in Phase 2.
  // r028.136: Phase 4 adds the Operations/Draw mode help (replaces spatialModeOperationsDesc/spatialModeDrawDesc).
  tabHelpButtonLabel: 'About this tab',
  tabHelpModeButtonLabel: 'About this mode',
  tabHelpOperationsDefault: 'Compare features with another layer. Pick a spatial relationship (intersects, contains, and more), optionally add a buffer distance, choose the target layers, and Search. Operations use the current results as input, so run a query first.',
  tabHelpDrawDefault: 'Draw points, lines, or shapes on the map and select features from the target layers that they touch. Drawn shapes can be buffered, and current results can be included as part of the search input.',
  tabHelpQueryDefault: 'Search a layer by attributes. Choose a search layer and field, enter a value, and matching features are selected on the map and listed in the Results tab.',
  tabHelpSpatialDefault: 'Select features by location. Use Operations to apply a buffer or spatial relationship using the current results, or Draw to sketch a shape on the map and select the features it touches. A spatial relationship must be selected before Search is available.',
  tabHelpResultsDefault: 'Review the features your search selected. Click a result to zoom to it and see details. Use the menu for export and table options. Results stay until you clear them or run a new search.',
  // r028.138: Screen-reader announcements for programmatic context changes (TODO #38).
  // {token} placeholders are substituted by buildAnnouncement (announce-utils.ts), not by formatMessage.
  tabSwitchAnnouncement: '{tab} tab.',
  tabSwitchAnnouncementResults: '{tab} tab, {count} items.',
  tabHelpModeAnnouncement: '{mode} mode. Help updated.',
  // r025: Spatial tab toggle and placeholder text
  spatialModeOperations: 'Operations',
  spatialModeDraw: 'Draw',
  spatialModeOperationsTitle: 'Spatial operations',
  spatialModeDrawTitle: 'Draw graphics',
  spatialRelationshipInfoTooltip: 'About this spatial relationship',
  spatialDrawPlaceholder: 'Use the drawing tools to create a search geometry.',
  spatialDrawHint: 'Draw a shape above to enable spatial operations',
  spatialNoResults: 'Run a query first, or switch to Draw mode to create a search geometry.',
  spatialRelationship: 'Spatial relationship',
  spatialSourceFeatures: '{count} feature(s) from Results',
  spatialSourceNoFeatures: 'No features loaded',
  spatialIncludeResults: 'Also include current results ({count})',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  scrollToTop: 'Scroll to top',
  resultsModeLabel: 'Results Mode',
  resultsMode: 'Results mode',
  createNewResults: 'Create new results',
  addToCurrentResults: 'Add to current results',
  removeFromCurrentResults: 'Remove from current results',
  resultsModeDisabledRemove: 'Remove from current results (no accumulated results)',
  resultsModeDesc: 'Controls how query results are combined:\n• New: Each query replaces previous results\n• Add: New results are added to existing results\n• Remove: Matching results are removed from existing results',
  resultsModeNew: 'New',
  resultsModeAdd: 'Add',
  resultsModeRemove: 'Remove',
  // r023.22: Logic summary bar text for each results mode
  resultsModeLogicNew: 'Each query replaces previous results.',
  resultsModeLogicAdd: 'New results are added to existing results.',
  resultsModeLogicRemove: 'Matching results are removed from existing results.',
  // r022.3: Calcite Alert messages for query feedback
  noResultsAlertLabel: 'No results found',
  noResultsAlertTitle: 'No results found',
  noResultsAlertMessage: 'The query completed successfully but found no matching records. Try adjusting your search criteria.',
  // r022.15: Calcite Popover messages for Remove mode with no matches
  noRemovalAlertLabel: 'No records removed',
  noRemovalAlertTitle: 'No records were removed',
  noRemovalAlertMessage: 'Query found {recordsFound} record(s), but none were in your Results to remove.',
  // r022.21: Calcite Popover messages for Add mode with all duplicates
  allDuplicatesAlertLabel: 'All duplicates',
  allDuplicatesAlertTitle: 'All records already in Results',
  allDuplicatesAlertMessage: 'Query found {recordsFound} record(s), but all were already in your Results.',
  // r024.62: Calcite Popover messages for query execution failure (service down, network error)
  queryErrorAlertLabel: 'Search failed',
  queryErrorAlertTitle: 'Search could not be completed',
  queryErrorAlertMessage: 'The map service may be temporarily unavailable. Please try again in a few minutes. If the problem persists, contact your administrator.',
  // r028.114: Calcite Popover messages for result-set truncation (hit the service transfer limit)
  truncationAlertLabel: 'More results available',
  truncationAlertTitle: 'Showing a partial result set',
  truncationAlertMessage: 'This search reached the {limit}-record limit and there are more matching records than are shown. Refine your search to see the rest.',
  // r028.122: variants used when the true total matching count is known
  truncationAlertMessageCount: 'This search matched {total} records but only {shown} are shown. Refine your search to see the rest.',
  truncationAlertMessageCountAtLeast: 'This search matched at least {total} records but only {shown} are shown. Refine your search to see the rest.',
  // r024: Results menu action labels
  panTo: 'Pan to',
  viewInTable: 'View in table',
  exportCSV: 'Export CSV',
  export: 'Export',
  actionsMenu: 'More actions'
}


