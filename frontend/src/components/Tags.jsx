import Pill from './Pill'

export default function Tags({ tags }) {
  return (
    <div className="d-flex flex-wrap gap-1">
      {tags.map((t) => (
        <Pill key={t}>{t}</Pill>
      ))}
    </div>
  )
}
