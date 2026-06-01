import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthModal } from '../components/AuthModal'

export function AuthModalPage() {
  const navigate = useNavigate()
  const initialMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') === 'register' ? 'register' : 'login'
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,transparent_34%),radial-gradient(circle_at_bottom_right,#FFEDD5_0,transparent_34%),linear-gradient(135deg,#FFFFFF_0%,#F8FBFF_55%,#FFF7ED_100%)]">
      <AuthModal
        initialMode={initialMode}
        onClose={() => navigate('/')}
        open
      />
    </section>
  )
}
