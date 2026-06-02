/**
 * r028.087: Promise-chain serializer.
 *
 * Returns a function that queues async operations onto a chain so each one
 * starts only after the prior one has settled. Used by Path 3's
 * `syncResultFeatureLayers` to prevent concurrent invocations from
 * interleaving read-modify-write against the shared `_keysByWidget` Set
 * (which would produce duplicate features on the map under rapid sync calls).
 *
 * Errors in queued operations do NOT poison the chain — they're caught
 * silently so the next operation still runs. Callers that need to observe
 * errors should await the returned Promise and add their own .catch.
 *
 * Pattern mirrors Path 2's `pendingGraphicsOperation` in selection-utils.ts
 * (r021.93), refactored into a reusable utility.
 */
export function createAsyncSerializer (): (fn: () => Promise<void>) => Promise<void> {
  let chain: Promise<void> = Promise.resolve()
  return (fn: () => Promise<void>): Promise<void> => {
    const next = chain.catch(() => { /* swallow prior error so chain continues */ }).then(fn)
    chain = next
    return next
  }
}
