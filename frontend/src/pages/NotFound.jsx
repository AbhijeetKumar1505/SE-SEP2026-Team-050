import { useNavigate } from 'react-router-dom'
import PublicPage from '../components/PublicPage'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <PublicPage title="Page not found" intro="The page you’re looking for doesn’t exist.">
      <button type="button" className="login-submit-btn" onClick={() => navigate('/')}>
        Go to your home page
      </button>
    </PublicPage>
  )
}
