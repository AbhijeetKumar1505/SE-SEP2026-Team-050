import { useCallback, useEffect, useRef, useState } from 'react'

// Calls an API function on mount and whenever `arg` changes. Returns [data, reload].
// - While the data for a new `arg` loads, `data` is null, so the page shows its loading state
//   instead of the previous record (issue #11).
// - Only the newest request counts: a slower, older response never overwrites a newer one.
// - `reload()` fetches again, keeps the current data on screen meanwhile, and returns a promise
//   that settles once the new data is in place, so callers can `await reload()`.
// A failed request is thrown during render so the nearest ErrorBoundary shows it.
export default function useFetch(fn, arg) {
  const [state, setState] = useState({ arg: undefined, data: null, error: null, loaded: false })
  const latest = useRef(0)

  const load = useCallback(() => {
    const request = ++latest.current
    const settle = (data, error) => {
      if (request === latest.current) setState({ arg, data, error, loaded: true })
    }
    return fn(arg).then(
      (data) => settle(data, null),
      (error) => settle(null, error),
    )
  }, [fn, arg])

  useEffect(() => {
    load()
    // A response that arrives after the page moved on, or after it closed, is ignored.
    return () => {
      latest.current += 1
    }
  }, [load])

  const current = state.loaded && Object.is(state.arg, arg)
  if (current && state.error) throw state.error
  return [current ? state.data : null, load]
}
