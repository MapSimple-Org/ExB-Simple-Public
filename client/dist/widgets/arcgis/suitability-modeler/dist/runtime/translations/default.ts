/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/
export default {
  _widgetLabel: 'Suitability Modeler',

  wro_general_back: 'Back',
  wro_general_cancel: 'Cancel',
  wro_general_clear: 'Clear',
  wro_general_close: 'Close',
  wro_general_export: 'Export',
  wro_general_information: 'Information',
  wro_general_loading: 'Loading...',
  wro_general_next: 'Next',
  wro_general_run: 'Run',
  wro_general_save: 'Save',
  wro_general_saveAs: 'Save As',
  wro_general_warning: 'Warning',

  wro_step_1: '1',
  wro_step_2: '2',
  wro_step_3: '3',

  wro_tabs_layers: 'Layers',
  wro_tabs_model: 'Model',
  wro_tabs_chart: 'Chart',

  wro_main_modelIssue: 'Model Issue',
  wro_main_runError: 'Error running model',

  wro_main_caption: 'Suitability Modeler',
  wro_main_browsePrompt: 'Weighted overlay service',
  wro_main_selectLayersCaption: 'Select layers',
  wro_main_selectLayers: 'Layers',
  wro_main_designModelCaption: 'Design model',
  wro_main_designModel: 'Design model',
  wro_main_transparency: 'Transparency',
  wro_main_visible: 'Visible',
  wro_main_total: 'Total',
  wro_main_unableToLoad: 'Unable to load model.',
  wro_main_setSymbology: 'Set symbology',
  wro_main_setScores: 'Set scores',

  wro_layers_selectAll: 'Select All',

  wro_remap_label: '{name} ({minmax})',
  wro_remap_label_noRange: '{name}',

  wro_popup_score: 'This model has a score of {score} at the selected location.',
  wro_popup_layers: 'The model is based on the following layers:',
  wro_popup_weight: 'weight',

  wro_saveModel_save: 'Export',
  wro_saveModel_title: 'Title',
  wro_saveModel_titleRequired: 'Title (required)',
  wro_saveModel_summary: 'Summary',
  wro_saveModel_description: 'Description',
  wro_saveModel_tags: 'Tags',
  wro_saveModel_folder: 'Folder',
  wro_saveModel_homeFolderPattern: '{username} (Home)',
  wro_saveModel_failed: 'Export failed.',
  wro_saveModel_success_msg: 'Model exported successfully.',
  wro_saveModel_failed_msg: 'Failed to export model.',

  wro_chart_prompt: 'Features',
  wro_chart_generate: 'Generate chart',
  wro_chart_working: 'Updating...',
  wro_chart_polygonTool: 'Draw a polygon',
  wro_chart_freehandPolygonTool: 'Draw a freehand polygon',
  wro_chart_selectTool: 'Select from a layer',
  wro_chart_zoomPanTool: 'Pan',
  wro_chart_clearButton: 'Clear',
  wro_chart_selectLayerPlaceholder: 'Choose a layer',
  wro_chart_noSubjectLayers: 'Your map has no polygon layers.',
  wro_chart_noModelLayer: 'The model hasn\'t been run',
  wro_chart_tipPattern: '{category} - {label}: {percent}%',
  wro_chart_tipPattern2: '{category}: {percent}%',
  wro_chart_labelPattern: '{category} - {label}',
  wro_chart_noData: 'No model results within chart area, please create a new selection.',

  wro_colorRamp_low: 'Low',
  wro_colorRamp_high: 'High',
  wro_colorRamp_tipPattern: '{label} ({value})',
  wro_colorRamp_flipCaption: 'Flip',
  wro_colorRamp_1: 'Extremely Low',
  wro_colorRamp_2: 'Very Low',
  wro_colorRamp_3: 'Low',
  wro_colorRamp_4: 'Low Medium',
  wro_colorRamp_5: 'Medium',
  wro_colorRamp_6: 'High Medium',
  wro_colorRamp_7: 'High',
  wro_colorRamp_8: 'Very High',
  wro_colorRamp_9: 'Extremely High',

  wro_1_9_green_yellow_red: 'Green Yellow Red',
  wro_1_9_red_yellow_green: 'Red Yellow Green',
  wro_1_9_yellow_to_dark_red: 'Yellow to Dark Red',
  wro_1_9_dark_red_to_yellow: 'Dark Red to Yellow',
  wro_1_9_light_gray_to_dark_gray: 'Light Gray to Dark Gray',
  wro_1_9_dark_gray_to_light_gray: 'Dark Gray to Light Gray',
  wro_1_9_light_brown_to_dark_brown: 'Light Brown to Dark Brown',
  wro_1_9_dark_brown_to_light_brown: 'Dark Brown to Light Brown',
  wro_1_9_full_spectrum_bright_red_to_blue: 'Full Spectrum - Bright Red to Blue',
  wro_1_9_full_spectrum_bright_blue_to_red: 'Full Spectrum - Bright Blue to Red',
  wro_1_9_partial_spectrum_yellow_to_blue: 'Partial Spectrum - Yellow to Blue',
  wro_1_9_partial_spectrum_blue_to_yellow: 'Partial Spectrum - Blue to Yellow',
  wro_1_9_yellow_green_to_dark_blue: 'Yellow-Green to Dark Blue',
  wro_1_9_dark_blue_to_yellow_green: 'Dark Blue to Yellow-Green',
  wro_1_9_cold_to_hot_diverging: 'Cold to Hot Diverging',
  wro_1_9_hot_to_cold_diverging: 'Hot to Cold Diverging',
  wro_1_9_surface_low_to_high: 'Surface - Low to High',
  wro_1_9_surface_high_to_low: 'Surface - High to Low',

  wro_validation_validating: 'Validating...',
  wro_validation_invalidServiceUrl: 'The weighted overlay service URL is invalid.',
  wro_validation_undefinedItemUrl: 'This item\'s URL is not defined.',
  wro_validation_errorloadingService: 'Unable to load service',
  wro_validation_errorLoadingItem: 'Unable to load chart.',
  wro_validation_errorLoadingItemWithMsg: 'Unable to load chart. See server error message ({message}).',
  wro_validation_errorQueryingLayers: 'Unable to query service layers',
  wro_validation_noLayers: 'There are no modeling layers',
  wro_validation_noModel: 'No model',
  wro_validation_noMap: 'No map',
  wro_validation_notAnImageService: 'This item is not an image Service',
  wro_validation_notAWroService: 'This configured item is not a weighted overlay service',
  wro_validation_notAllowRasterFunction: 'allowRasterFunction must be set to true',
  wro_validation_notNearestResampling: 'defaultResamplingMethod must be Nearest',
  wro_validation_missingFieldPattern: '{field} is a required field',
  wro_validation_wroServiceNotDefined: 'No weighted overlay service was configured'

}
