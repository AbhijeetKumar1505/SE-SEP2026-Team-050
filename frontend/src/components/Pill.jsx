// Status pill in the student design: soft background, coloured text.
// Tones: primary, secondary, success, warning, danger (see .mt-pill in theme.css).
export default function Pill({ tone = 'secondary', children }) {
  return <span className={`mt-pill mt-pill-${tone}`}>{children}</span>
}
