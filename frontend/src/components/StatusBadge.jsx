import { STATUS_TONE } from '../constants/status'
import Pill from './Pill'

export default function StatusBadge({ status }) {
  return <Pill tone={STATUS_TONE[status]}>{status}</Pill>
}
