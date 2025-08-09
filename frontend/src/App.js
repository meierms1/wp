import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Context Providers (must be before any non-import code to satisfy import/first)
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components (lazy-loaded after all imports)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./components/About'));
const Resume = lazy(() => import('./components/Resume'));
const Projects = lazy(() => import('./components/Projects'));
const Finance = lazy(() => import('./pages/Finance'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Tools = lazy(() => import('./components/Tools'));
const Quiz = lazy(() => import('./components/Quiz'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900">
            <Navbar />
            <Suspense fallback={<div className="py-40 text-center text-gray-300">Loading...</div>}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/resume" element={<Resume />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/quiz" element={<Quiz />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
