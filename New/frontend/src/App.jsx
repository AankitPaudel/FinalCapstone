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

// Diagnostic component that doesn't require auth
function DiagnosticPage() {
    const { debugLogin } = useAuth();
    
    return (
        <div className="p-6 max-w-2xl mx-auto mt-10 bg-white rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-blue-600">Diagnostic Page</h1>
            <p className="mb-4">This page is for diagnostic purposes to help troubleshoot white screen issues.</p>
            
            <div className="mb-4 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Browser Information:</h2>
                <p>User Agent: {navigator.userAgent}</p>
                <p>Platform: {navigator.platform}</p>
            </div>
            
            <div className="mb-4">
                <h2 className="font-bold mb-2">Links:</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li><a href="/login" className="text-blue-500 hover:underline">Login Page</a></li>
                    <li><a href="/register" className="text-blue-500 hover:underline">Register Page</a></li>
                    <li><a href="/" className="text-blue-500 hover:underline">Main Application</a></li>
                    <li><a href="/test.html" className="text-blue-500 hover:underline">Static Test Page</a></li>
                </ul>
            </div>
            
            <div className="mb-4">
                <h2 className="font-bold mb-2">Debug Actions:</h2>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        alert('LocalStorage cleared!');
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                >
                    Clear LocalStorage
                </button>
                
                <button 
                    onClick={() => {
                        debugLogin();
                        alert('Debug login successful! Redirecting to main app...');
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Debug Login (Auto-redirect)
                </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                <h3 className="font-bold">Troubleshooting Guide:</h3>
                <ol className="list-decimal pl-5 mt-2">
                    <li>If you see a white screen, check for errors in the developer console (F12)</li>
                    <li>Try clearing localStorage using the button above</li>
                    <li>Use "Debug Login" to automatically set up a test user</li>
                    <li>If the app redirects to login, try the debug login first</li>
                </ol>
            </div>
        </div>
    );
}

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
                        <Route path="/diagnostic" element={<DiagnosticPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AuthProvider>
            </AppContextProvider>
        </Router>
    );
}

export default App;

