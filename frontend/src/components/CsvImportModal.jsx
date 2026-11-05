import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { parseCsv } from '../utils/csv'
import Field from './Field'
import FormModal from './FormModal'
import ImportResult from './ImportResult'

// onImport(rows, fileName) must return the import result (see ImportResult).
export default function CsvImportModal({ show, title, columns, hint, onImport, onClose }) {
  const [result, setResult] = useState(null)
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm()
  const submit = async ({ file }) => {
    const rows = parseCsv(await file[0].text())
    const missing = columns.filter((c) => !(c in (rows[0] ?? {})))
    if (missing.length) return setError('file', { message: `Missing columns: ${missing.join(', ')}.` })
    setResult(await onImport(rows, file[0].name))
  }
  return (
    <FormModal
      show={show}
      title={title}
      submitLabel="Import"
      cancelLabel={result ? 'Close' : 'Cancel'}
      busy={isSubmitting}
      onClose={onClose}
      onExited={() => {
        reset()
        setResult(null)
      }}
      onSubmit={handleSubmit(submit)}
    >
      <p className="small text-muted">Columns: {columns.join(', ')}. {hint}</p>
      <Field label="CSV file" type="file" accept=".csv" error={errors.file} {...register('file', { validate: (f) => f.length > 0 || 'Choose a .csv file.' })} />
      <ImportResult result={result} />
    </FormModal>
  )
}
