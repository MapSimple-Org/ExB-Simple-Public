/** Mock IntersectionObserver */
export function mockIntersectionObserver () {
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = MockIntersectionObserver
  }
}

const mockDOMRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: function () {
    throw new Error('Function not implemented.')
  }
}

class MockIntersectionObserver {
  constructor (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    callback([{
      boundingClientRect: mockDOMRect,
      intersectionRatio: 1,
      intersectionRect: mockDOMRect,
      isIntersecting: true,
      rootBounds: mockDOMRect,
      target: null,
      time: 0
    }], this)
  }

  readonly root: null
  readonly rootMargin: string
  readonly thresholds: number[]
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect (): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe (target: Element): void {}
  takeRecords (): IntersectionObserverEntry[] {
    return []
  }

  unobserve (target: Element): void {
    return null
  }
}
