import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate inputs
        if (!studentId || !password) {
            setError('Please enter both student ID and password');
            return;
        }
        
        try {
            await login(studentId, password);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left side - Virtual Human image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img 
                    src="/picture/Virtual_Human.png" 
                    alt="Virtual Human" 
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 to-indigo-600/60 flex flex-col justify-center px-12">
                    <h1 className="text-white text-4xl md:text-5xl font-bold mb-6">
                        Welcome to Virtual Professor
                    </h1>
                    <h2 className="text-white text-3xl md:text-4xl font-semibold mb-8">
                        Dr. AI. Soule
                    </h2>
                    <p className="text-white/80 text-xl mb-8">
                        Your intelligent learning companion for academic excellence.
                    </p>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 flex flex-col relative">
                {/* College of Engineering Logo - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <img 
                        src="/picture/CollegeofEngineering.jpeg" 
                        alt="College of Engineering" 
                        className="h-20 w-auto"
                    />
                </div>

                {/* Vandal Logo - Bottom Right */}
                <div className="absolute bottom-4 right-4 z-10">
                    <img 
                        src="/picture/Vandal_logo.png" 
                        alt="Vandal Logo" 
                        className="h-16 w-auto"
                    />
                </div>

                <div className="flex-grow flex items-center justify-center p-8">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                Sign in to your account
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Access your Virtual Professor AI Assistant
                            </p>
                        </div>
                
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="student-id" className="sr-only">Student ID</label>
                                    <input
                                        id="student-id"
                                        name="student-id"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Student ID"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                    
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
                
                <footer className="py-4 text-center text-gray-500 text-sm">
                    © 2024 Virtual Professor. All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default Login; 