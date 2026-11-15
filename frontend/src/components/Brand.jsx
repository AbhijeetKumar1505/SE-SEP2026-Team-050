import { BRAND } from '../constants/brand'

export default function Brand() {
  return (
    <strong className="d-inline-flex align-items-center gap-2">
      <span className="brand-logo">M</span>
      {BRAND.name}
    </strong>
  )
}
