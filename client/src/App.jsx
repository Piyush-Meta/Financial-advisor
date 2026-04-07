import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Chat from './pages/Chat.jsx'
import Budget from './pages/Budget.jsx'
import Business from './pages/Business.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SplashScreen from './pages/SplashScreen.jsx'
import Footer from './components/Footer.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { VoiceProvider } from './contexts/VoiceContext.jsx'

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const seenIntro = localStorage.getItem('sakhi_seen_intro')
    return seenIntro !== 'true'
  })

  return (
    <LanguageProvider>
      <BrowserRouter>
        <VoiceProvider>
          <div className="min-h-screen w-full bg-[#fff0fb] text-slate-900">
            <Navbar />
            {showSplash ? (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            ) : (
              <>
                <main className="w-full px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/business" element={<Business />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </main>
                <Footer />
              </>
            )}
          </div>
        </VoiceProvider>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
