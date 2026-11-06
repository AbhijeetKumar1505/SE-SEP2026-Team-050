import FormModal from './FormModal'

// Simple yes / no dialog. Extra props (title, submitLabel, variant) go to FormModal.
export default function ConfirmModal({ show, onClose, onConfirm, children, ...modalProps }) {
  const submit = async (e) => {
    e.preventDefault()
    await onConfirm()
    onClose()
  }
  return (
    <FormModal show={show} onClose={onClose} onSubmit={submit} {...modalProps}>
      {children}
    </FormModal>
  )
}
