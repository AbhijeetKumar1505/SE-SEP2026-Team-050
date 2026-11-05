import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <Container className="py-5 text-center">
      <h1 className="h3">Page not found</h1>
      <p className="text-muted">The page you’re looking for doesn’t exist.</p>
      <Link to="/">Go to your home page</Link>
    </Container>
  )
}
