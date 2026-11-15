// Topic tags, drawn like the expertise tags on the student pages (.mt-tag in theme.css).
export default function Tags({ tags }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="mt-tag">
          {t}
        </span>
      ))}
    </div>
  )
}
