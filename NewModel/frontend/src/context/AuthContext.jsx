import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Check if user is logged in on initial load
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                // We would normally verify the token with the server here
                // For now, we'll just assume it's valid
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);
            } catch (err) {
                console.error('Error checking auth status:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        
        checkLoggedIn();
    }, []);
    
    // Register a new user
    const register = async (email, studentId, collegeId, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    student_id: studentId,
                    college_id: collegeId,
                    password,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }
            
            // Automatically log in after successful registration
            await login(studentId, password);
            navigate('/');
            
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Log in user
    const login = async (studentId, password) => {
        try {
            setLoading(true);
            setError(null);
            
            // Prepare form data for OAuth2 password flow
            const formData = new URLSearchParams();
            formData.append('username', studentId);  // FastAPI expects 'username' field
            formData.append('password', password);
            
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }
            
            // Store token in localStorage
            localStorage.setItem('token', data.access_token);
            
            // For now, we'll store a simplified user object
            // In a real app, you'd likely fetch the full user profile here
            const userObj = {
                studentId,
                // Additional user info could be added here
            };
            
            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
            
            navigate('/');
            
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Log out user
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };
    
    // Request password reset
    const requestPasswordReset = async (email) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to request password reset');
            }
            
            return data;
            
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Reset password with token
    const resetPassword = async (token, newPassword) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: newPassword,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to reset password');
            }
            
            return data;
            
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Request college ID recovery
    const requestCollegeId = async (email, studentId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/auth/request-college-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    student_id: studentId,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to request college ID');
            }
            
            return data;
            
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        requestCollegeId,
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 