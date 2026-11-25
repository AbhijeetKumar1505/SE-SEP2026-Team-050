// Shows an API error on a react-hook-form form.
// A 422 names the invalid fields in `errors.json`, using the API's field names; `fields` maps them to
// the form's own names, and each message goes under its field. Any other error (409, 403, a network
// failure) has no field, so its message is returned for the form to show above its fields.
export function showApiErrors(error, setError, fields) {
  const invalid = error?.body?.errors?.json ?? {}
  let placed = false
  for (const [apiField, messages] of Object.entries(invalid)) {
    const field = fields[apiField]
    if (field) {
      setError(field, { type: 'server', message: [].concat(messages).join(' ') })
      placed = true
    }
  }
  return placed ? '' : error?.message || 'Something went wrong. Please try again.'
}
