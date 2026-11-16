import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { BRAND } from '../../constants/brand'

// The landing page, laid out like the original: white bar on top, text on the left, blue card on the right.
export default function Welcome() {
  return (
    <div className="min-vh-100">
      <header className="bg-white border-bottom">
        <Container className="d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-3">
            <span className="brand-logo brand-logo-lg">M</span>
            <strong className="fs-6">{BRAND.name}</strong>
          </div>
          <Button as={Link} to="/login" variant="outline-primary">
            Log In
          </Button>
        </Container>
      </header>

      <Container as="main" className="py-5">
        <Row className="align-items-center gy-5 py-lg-5">
          <Col lg={7}>
            <span className="small fw-bold text-primary text-uppercase">{BRAND.name} platform</span>
            <h1 className="display-4 fw-bold my-4">
              Guidance that helps you <span className="text-primary">move forward.</span>
            </h1>
            <p className="fs-5 text-muted lh-lg">
              Connect with recent graduates and alumni who can help you navigate career decisions, explore opportunities and take your next
              steps with confidence.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Button as={Link} to="/signup" size="lg">
                Get Started
              </Button>
              <Button as={Link} to="/login" size="lg" variant="light" className="border text-primary">
                I already have an account
              </Button>
            </div>
            <div className="small text-muted mt-4">For registered IITM BS students and approved mentors</div>
          </Col>

          <Col lg={5} className="d-flex justify-content-center justify-content-lg-end">
            <Card className="bg-primary text-white border-0 shadow-lg w-100">
              <Card.Body className="px-4 py-5">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 bg-white bg-opacity-25 fs-3 mb-4 px-3 py-2">
                  <b>M</b>
                </div>
                <h2 className="h3 lh-base">Your next step starts with a conversation.</h2>
                <p className="opacity-75 lh-lg">Learn from someone who has already walked a path you’re exploring.</p>
                <div className="d-flex gap-4 border-top border-light border-opacity-25 pt-3 mt-4 small fw-semibold">
                  <span>Learn</span>
                  <span>Connect</span>
                  <span>Grow</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
