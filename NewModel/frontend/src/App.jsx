// File: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './styles/main.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

function MainContent() {
    const { theme, language } = useAppContext();
    
    return (
        <div className={`app ${theme}`}>
            <main className="app-main">
                <ProtectedRoute>
                    <ChatInterface />
                </ProtectedRoute>
            </main>
            <footer className="app-footer">
                <p>© 2024 Virtual Teacher. All rights reserved.</p>
            </footer>
        </div>
    );
}

function ThemeToggle() {
    const { theme, setTheme } = useAppContext();
    
    return (
        <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}

function LanguageSelector() {
    const { language, setLanguage } = useAppContext();
    
    const languages = {
        en: 'English',
        es: 'Español',
        fr: 'Français',
    };
    
    return (
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
        >
            {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>
                    {name}
                </option>
            ))}
        </select>
    );
}

function App() {
    return (
        <Router>
            <AppContextProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/" element={<MainContent />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AuthProvider>
            </AppContextProvider>
        </Router>
    );
}

export default App;

