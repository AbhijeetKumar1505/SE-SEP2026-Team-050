import { useCallback, useEffect, useState } from 'react'

// Calls an API function on mount (and when arg changes). Returns [data, reload].
// A failed request is thrown during render so the nearest ErrorBoundary shows it.
export default function useFetch(fn, arg) {
  const [state, setState] = useState({ data: null, error: null })
  const load = useCallback(
    () =>
      fn(arg).then(
        (data) => setState({ data, error: null }),
        (error) => setState({ data: null, error }),
      ),
    [fn, arg],
  )
  useEffect(() => {
    load()
  }, [load])
  if (state.error) throw state.error
  return [state.data, load]
}
