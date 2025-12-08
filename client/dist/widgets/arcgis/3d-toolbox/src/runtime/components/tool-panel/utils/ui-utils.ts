export const isSliceExcludeLayerUI = (layersMode): boolean => {
  let isSliceExcludeLayerUIFlag = false // exclude layer UI
  if (layersMode === 'exclude') {
    isSliceExcludeLayerUIFlag = true
  } else if (layersMode === 'none') {
    isSliceExcludeLayerUIFlag = false
  }

  return isSliceExcludeLayerUIFlag
}

export const isInNewSlicingUI = (state, isActive): boolean => {
  let isInNewSlicingUIFlag = false
  if (state === 'ready' && isActive) {
    isInNewSlicingUIFlag = true
  }

  return isInNewSlicingUIFlag
}
