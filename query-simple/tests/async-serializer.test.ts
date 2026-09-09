/**
 * Tests for createAsyncSerializer — the FIFO Promise-chain helper that
 * widget.tsx uses to serialize concurrent syncResultFeatureLayers calls
 * (r028.087).
 *
 * These tests prove the contract that the widget relies on:
 *   1. Concurrent queue calls execute in FIFO order, never interleaved.
 *   2. A queued operation does not start until the prior operation has
 *      fully settled (resolved or rejected).
 *   3. A rejection in one queued operation does not poison the chain —
 *      subsequent operations still run.
 *   4. Each queue() returns a Promise that resolves with that specific
 *      operation's completion (not the chain head).
 */

import { createAsyncSerializer } from '../src/utils/async-serializer'

/** Deferred Promise helper — resolve/reject control from outside the executor. */
function deferred<T = void> (): { promise: Promise<T>, resolve: (v: T) => void, reject: (e: any) => void } {
  let resolve!: (v: T) => void
  let reject!: (e: any) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

/**
 * Drain the microtask queue enough times for chained Promise wrappers
 * (.catch().then(fn)) to unwrap and invoke fn. 10 is more than enough for
 * any reasonable chain depth.
 */
async function flushMicrotasks (): Promise<void> {
  for (let i = 0; i < 10; i++) await Promise.resolve()
}

describe('createAsyncSerializer', () => {
  it('runs queued operations in FIFO order even when fired concurrently', async () => {
    const queue = createAsyncSerializer()
    const log: number[] = []

    const op1Done = deferred()
    const op1 = jest.fn(async () => {
      log.push(1)
      await op1Done.promise // gate completion externally
      log.push(11)
    })

    const op2 = jest.fn(async () => {
      log.push(2)
    })

    // Fire both before op1 has been allowed to finish
    const p1 = queue(op1)
    const p2 = queue(op2)

    // Yield enough microtasks for the chain wrapper (.catch then .then) to
    // unwrap and actually invoke op1's body. The serializer interposes a few
    // hops via Promise.resolve().catch().then(fn) before fn runs.
    await flushMicrotasks()

    // op1 has started; op2 must not have started yet
    expect(log).toEqual([1])
    expect(op2).not.toHaveBeenCalled()

    // Release op1 — op2 should run only after op1 fully settles
    op1Done.resolve()
    await Promise.all([p1, p2])

    expect(log).toEqual([1, 11, 2])
    expect(op1).toHaveBeenCalledTimes(1)
    expect(op2).toHaveBeenCalledTimes(1)
  })

  it('preserves submission order across many concurrent calls', async () => {
    const queue = createAsyncSerializer()
    const log: number[] = []
    const gates: Array<{ promise: Promise<void>, resolve: () => void }> = []

    // Submit 5 ops in order, each gated by its own deferred
    const promises: Array<Promise<void>> = []
    for (let i = 0; i < 5; i++) {
      const gate = deferred()
      gates.push(gate)
      promises.push(queue(async () => {
        log.push(i)
        await gate.promise
        log.push(i * 100)
      }))
    }

    // Resolve gates in reverse order — chain should still run FIFO
    for (let i = 4; i >= 0; i--) {
      gates[i].resolve()
    }

    await Promise.all(promises)

    // Each op's "start" and "end" must be adjacent (no interleaving),
    // and op N must finish before op N+1 starts.
    expect(log).toEqual([0, 0, 1, 100, 2, 200, 3, 300, 4, 400])
  })

  it('does not start the next op until the prior op resolves', async () => {
    const queue = createAsyncSerializer()
    const op1Done = deferred()
    const op2 = jest.fn(async () => { /* trivial */ })

    const p1 = queue(async () => { await op1Done.promise })
    const p2 = queue(op2)

    await flushMicrotasks()

    expect(op2).not.toHaveBeenCalled()

    op1Done.resolve()
    await Promise.all([p1, p2])

    expect(op2).toHaveBeenCalledTimes(1)
  })

  it('does not poison the chain when a queued op rejects', async () => {
    const queue = createAsyncSerializer()
    const op1Done = deferred()
    const log: string[] = []

    const op1 = jest.fn(async () => {
      log.push('op1-start')
      await op1Done.promise
      throw new Error('op1 failed')
    })

    const op2 = jest.fn(async () => {
      log.push('op2-start')
    })

    const p1 = queue(op1)
    const p2 = queue(op2)

    op1Done.resolve()

    // p1 rejects but is observed — caller can choose to handle or ignore
    await expect(p1).rejects.toThrow('op1 failed')

    // p2 still runs after p1's rejection (chain not poisoned)
    await p2
    expect(op2).toHaveBeenCalledTimes(1)
    expect(log).toEqual(['op1-start', 'op2-start'])
  })

  it('resolves each queue() call with its own operation result', async () => {
    const queue = createAsyncSerializer()
    const op1Done = deferred<void>()

    let op1Returned = false
    let op2Returned = false

    const p1 = queue(async () => { await op1Done.promise }).then(() => { op1Returned = true })
    const p2 = queue(async () => { /* immediate */ }).then(() => { op2Returned = true })

    await flushMicrotasks()

    // Before op1 resolves, neither caller's .then should have fired
    expect(op1Returned).toBe(false)
    expect(op2Returned).toBe(false)

    op1Done.resolve()
    await Promise.all([p1, p2])

    expect(op1Returned).toBe(true)
    expect(op2Returned).toBe(true)
  })
})
