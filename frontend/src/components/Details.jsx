import { Fragment } from 'react'

// Label / value list. items = [[label, value], ...]
export default function Details({ items }) {
  return (
    <dl className="row small mb-0">
      {items.map(([label, value]) => (
        <Fragment key={label}>
          <dt className="col-sm-4 text-muted fw-normal">{label}</dt>
          <dd className="col-sm-8">{value}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
