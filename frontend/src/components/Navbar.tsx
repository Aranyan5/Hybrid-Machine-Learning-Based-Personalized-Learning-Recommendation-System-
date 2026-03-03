import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, learner, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              LearnRec
            </Link>
            <div className="hidden md:flex gap-6">
              <Link
                to="/dashboard"
                className="text-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/courses"
                className="text-foreground hover:text-primary transition-colors"
              >
                Courses
              </Link>
              <Link
                to="/recommendations"
                className="text-foreground hover:text-primary transition-colors"
              >
                Recommendations
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {learner && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{learner.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
