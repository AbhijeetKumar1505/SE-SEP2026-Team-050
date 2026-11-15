import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { addSession, cancelSession, confirmSession, updateSession } from '../api/mentorship'
import { SESSION_FORMS } from '../constants/mentor'
import { today } from '../utils/format'
import ConfirmModal from './ConfirmModal'
import Section from './Section'
import SessionList from './SessionList'
import SessionModal from './SessionModal'

// Sessions card with schedule / log / edit / mark held / cancel / confirm, for mentor and student alike.
export default function SessionsSection({ mentorshipId, sessions, role, onChange }) {
  const [form, setForm] = useState({ open: false }) // kept after closing so the dialog doesn't change while fading out
  const [cancelling, setCancelling] = useState(null) // session id
  const act = (fn, ...args) => fn(mentorshipId, ...args).then(onChange)
  const open = (type, session) => setForm({ open: true, ...SESSION_FORMS[type], session })
  const save = (values) => (form.session ? act(updateSession, form.session.id, values, role) : act(addSession, values, role))

  return (
    <>
      <Section
        title="Sessions"
        action={
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-primary" onClick={() => open('schedule')}>
              Schedule a session
            </Button>
            <Button size="sm" variant="outline-primary" onClick={() => open('log')}>
              Log a session
            </Button>
          </div>
        }
      >
        <SessionList
          sessions={sessions}
          role={role}
          onConfirm={(sid) => act(confirmSession, sid)}
          onMarkHeld={(s) => open('markHeld', { ...s, date: today() })}
          onEdit={(s) => open(s.status === 'Held' ? 'editHeld' : 'editPlanned', s)}
          onCancel={(s) => setCancelling(s.id)}
        />
      </Section>
      <SessionModal {...form} show={form.open} onClose={() => setForm((f) => ({ ...f, open: false }))} onSave={save} />
      <ConfirmModal
        show={cancelling !== null}
        title="Cancel this session?"
        submitLabel="Cancel session"
        variant="danger"
        onClose={() => setCancelling(null)}
        onConfirm={() => act(cancelSession, cancelling)}
      >
        The session stays in the list as cancelled and doesn’t count as held.
      </ConfirmModal>
    </>
  )
}
