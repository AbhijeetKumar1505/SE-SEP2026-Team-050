import { Card, Col, Container, Row } from 'react-bootstrap'
import Brand from './Brand'

// Frame for the pre-login pages: brand bar with one action, then a centred card.
export default function AuthLayout({ action, children }) {
  return (
    <>
      <header className="bg-white border-bottom">
        <Container className="d-flex justify-content-between align-items-center py-3">
          <Brand />
          {action}
        </Container>
      </header>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card body className="p-3 shadow-sm">
              {children}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
