import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import About from './components/About';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Finance from './pages/Finance';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Tools from './components/Tools';
import Quiz from './components/Quiz';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900">
            <Navbar />
            
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
            
            <Footer />
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
