import { Component } from 'react'
import { Alert, Button } from 'react-bootstrap'

// Catches failed requests and render errors in a page. AppLayout re-keys it on navigation.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <span><strong>Something went wrong.</strong> {this.state.error.message}</span>
        <Button size="sm" variant="outline-danger" onClick={() => window.location.reload()}>Reload page</Button>
      </Alert>
    )
  }
}
