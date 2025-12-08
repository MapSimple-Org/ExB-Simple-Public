/**
 * find the draged item after drag in List, we can only drag one item at a time, and there will always have a from index and to index for the dragged item
 * find the changed part first
 * eg: prev => [1, 2, 3, 4, 5] current => [1, 2, 5, 3, 4]
 * prevChangedPart should be [3, 4, 5] currentChangedPart should be [5, 3, 4]
 * then, obviously, if [3, 4, 5] and [5, 3, 4] both remove 5, the rest array will be [3, 4] and [3, 4], and every item is equal
 * so 5 is the dragged item and it was dragged from 4 to 2
 * @param prev
 * @param current
 * @returns
 */
export const findDraggedItemPosition = <T>(prev: T[], current: T[]) => {
  if (prev.length !== current.length || prev.length < 2 || current.length < 2) {
    return null
  }
  const prevChangedPart = prev.map((item, index) => ({ item, index })).filter((info, index) => info.item !== current[index])
  if (prevChangedPart.length < 2) {
    // no sort changes
    return null
  }
  const currentChangedPart = current.map((item, index) => ({ item, index })).slice(prevChangedPart[0].index, prevChangedPart[prevChangedPart.length - 1].index + 1)
  for (let i = 0; i < prevChangedPart.length; i++) {
    const info = prevChangedPart[i]
    const itemIndexInCurrentChangedPart = currentChangedPart.findIndex((i) => i.item === info.item)

    const prevChangedPartWithoutItem = [...prevChangedPart]
    prevChangedPartWithoutItem.splice(i, 1)
    const currentChangedPartWithoutItem = [...currentChangedPart]
    currentChangedPartWithoutItem.splice(itemIndexInCurrentChangedPart, 1)

    if (prevChangedPartWithoutItem.every((info, i) => info.item === currentChangedPartWithoutItem[i].item)) {
      return {
        from: info.index,
        to: currentChangedPart[itemIndexInCurrentChangedPart].index
      }
    }
  }
}
