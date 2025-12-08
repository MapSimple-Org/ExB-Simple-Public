const compareRatio = (origin: number, current: number): boolean => {
  let equal = true
  const ratio = Math.floor((origin / current) * 1000000) / 1000000
  if (ratio !== 0.999999 && ratio !== 1) equal = false
  return equal
}

export const viewChangeBufferCompare = (origin, current, type: '2d' | '3d'): boolean => {
  let equal = true
  if (!origin) return equal
  if (type === '2d') {
    const extentKeys = ['xmin', 'ymin', 'xmax', 'ymax']
    extentKeys.forEach(key => {
      if (!compareRatio(origin?.[key], current?.[key])) equal = false
    })
  } else {
    const viewpointKeys = ['camera', 'rotation', 'scale', 'targetGeometry']
    viewpointKeys.forEach(key => {
      if (key === 'camera') {
        const cameraKeys = ['heading', 'position', 'tilt']
        cameraKeys.forEach(cameraKey => {
          if (cameraKey === 'position') {
            const posKeys = ['x', 'y', 'z']
            posKeys.forEach(posKey => {
              if (!compareRatio(origin?.camera?.position?.[posKey], current?.camera?.position?.[posKey])) equal = false
            })
          } else {
            if (!compareRatio(origin?.camera?.[cameraKey], current?.camera?.[cameraKey])) equal = false
          }
        })
      } else if (key === 'targetGeometry') {
        const subKeys = ['x', 'y', 'z']
        subKeys.forEach(subKey => {
          if (!compareRatio(origin?.targetGeometry?.[subKey], current?.targetGeometry?.[subKey])) equal = false
        })
      } else {
        if (!compareRatio(origin?.[key], current?.[key])) equal = false
      }
    })
  }
  return equal
}
