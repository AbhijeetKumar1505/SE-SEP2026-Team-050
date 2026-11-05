export default function Tags({ tags }) {
  return (
    <div className="d-flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="badge text-bg-light border fw-normal">{t}</span>
      ))}
    </div>
  )
}
