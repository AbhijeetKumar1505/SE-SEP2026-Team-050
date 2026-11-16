import { addStep, deleteStep, toggleStep } from '../api/mentorship'
import NextSteps from './NextSteps'
import Section from './Section'

// Next steps card, shared by mentor and student.
export default function NextStepsSection({ mentorshipId, steps, onChange }) {
  const act = (fn, ...args) => fn(mentorshipId, ...args).then(onChange)
  return (
    <Section title={`Next steps · ${steps.filter((s) => s.done).length} of ${steps.length} done`}>
      <NextSteps
        steps={steps}
        onToggle={(sid) => act(toggleStep, sid)}
        onAdd={(text) => act(addStep, text)}
        onDelete={(sid) => act(deleteStep, sid)}
      />
    </Section>
  )
}
