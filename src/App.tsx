import { useState } from "react"
import Header from "./components/Header"
import { signIn, signOut, useAuthSession } from "./lib/auth"
import type { LoginResult } from "./lib/auth"
import { isSupabaseConfigured } from "./lib/supabase"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import CategoryPage from "./pages/CategoryPage"
import NewspaperReader from "./pages/NewspaperReader"
import PublicationReader from "./pages/PublicationReader"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import type { Category } from "./data"
import type { AdminSection } from "./data"

export type NavState =
  | { page: "home" }
  | { page: "category"; category: Category }
  | { page: "newspaper"; id: string }
  | { page: "publication"; slug: string }
  | { page: "admin-login" }
  | { page: "admin"; section: AdminSection }

export default function App() {
  const [nav, setNav] = useState<NavState>({ page: "home" })
  const [demoAuthenticated, setDemoAuthenticated] = useState(false)
  const { session } = useAuthSession()
  const isAuthenticated = isSupabaseConfigured
    ? Boolean(session)
    : demoAuthenticated

  const navigate = (state: NavState) => {
    if (state.page === "admin" && !isAuthenticated) {
      setNav({ page: "admin-login" })
    } else {
      setNav(state)
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    const result = await signIn(email, password)
    if (result.ok) {
      if (!isSupabaseConfigured) {
        setDemoAuthenticated(true)
      }
      setNav({ page: "admin", section: "dashboard" })
    }
    return result
  }

  const handleLogout = async () => {
    await signOut()
    setDemoAuthenticated(false)
    setNav({ page: "home" })
  }

  const isAdminPage = nav.page === "admin" || nav.page === "admin-login"

  return (
    <div className="min-h-full bg-slate-900 text-slate-50">
      {!isAdminPage && (
        <Header
          nav={nav}
          navigate={navigate}
          isAuthenticated={isAuthenticated}
        />
      )}

      {nav.page === "home" && <Home navigate={navigate} />}

      {nav.page === "category" && (
        <CategoryPage navigate={navigate} category={nav.category} />
      )}

      {nav.page === "newspaper" && (
        <NewspaperReader navigate={navigate} id={nav.id} />
      )}

      {nav.page === "publication" && (
        <PublicationReader
          navigate={navigate}
          slug={nav.slug}
          isAuthenticated={isAuthenticated}
        />
      )}

      {nav.page === "admin-login" && (
        <AdminLogin onLogin={handleLogin} navigate={navigate} />
      )}

      {nav.page === "admin" && (
        <AdminDashboard
          navigate={navigate}
          section={nav.section}
          onSectionChange={(section) => setNav({ page: "admin", section })}
          onLogout={handleLogout}
        />
      )}

      {!isAdminPage && <Footer />}
    </div>
  )
}
