import { Button, Form, Modal } from 'react-bootstrap'

// Modal wrapper around a form. Pass onSubmit={handleSubmit(...)} from React Hook Form.
export default function FormModal({ show, title, submitLabel, variant = 'primary', cancelLabel = 'Cancel', busy, onClose, onExited, onSubmit, children }) {
  return (
    <Modal show={show} onHide={onClose} onExited={onExited} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title as="h5">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>{cancelLabel}</Button>
          <Button type="submit" variant={variant} disabled={busy}>{submitLabel}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
