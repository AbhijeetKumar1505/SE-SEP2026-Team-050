import { STATUS_COLOR } from '../constants/iic'

export default function StatusBadge({ status }) {
  return <span className={`badge text-bg-${STATUS_COLOR[status] ?? 'secondary'}`}>{status}</span>
}
