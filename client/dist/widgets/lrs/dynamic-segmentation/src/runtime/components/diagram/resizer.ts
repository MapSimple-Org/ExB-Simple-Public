import { React } from 'jimu-core'

export const useContainerDimensions = myRef => {
  const [dimensions, setDimensions] = React.useState({ refWidth: 0, refHeight: 0 })

  React.useEffect(() => {
    const getDimensions = (entry) => ({
      refWidth: entry.contentRect.width,
      refHeight: entry.contentRect.offsetHeight
    })

    if (myRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDimensions(getDimensions(entry))
        }
      })
      observer.observe(myRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [myRef])

  return dimensions
}
