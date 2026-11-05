import { BRAND } from '../constants/brand'

// Left panel for pre-login pages (activation now; login and sign-up can reuse it).
export default function BrandPanel() {
  return (
    <div style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-3"><i className="bi bi-mortarboard-fill me-2" />{BRAND.name}</h1>
      <p className="lead">{BRAND.tagline}</p>
      <ol className="ps-3 my-4">
        {BRAND.steps.map((s) => <li key={s} className="mb-2">{s}</li>)}
      </ol>
      <small className="opacity-75">{BRAND.footer}</small>
    </div>
  )
}
