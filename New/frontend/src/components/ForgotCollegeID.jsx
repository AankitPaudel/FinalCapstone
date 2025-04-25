import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotCollegeID = () => {
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { requestCollegeId, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset messages
        setError('');
        setMessage('');
        
        // Validate inputs
        if (!email || !studentId) {
            setError('Please enter both email and student ID');
            return;
        }
        
        // Validate student ID format (8-12 digits)
        const studentIdRegex = /^\d{8,12}$/;
        if (!studentIdRegex.test(studentId)) {
            setError('Student ID must be 8-12 digits');
            return;
        }
        
        try {
            await requestCollegeId(email, studentId);
            setMessage('If a matching account exists, your college ID has been sent to your email.');
            
            // Clear form
            setEmail('');
            setStudentId('');
            
        } catch (err) {
            setError(err.message || 'Failed to request college ID. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Forgot your college ID?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email and student ID to recover your college ID
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="student-id" className="sr-only">Student ID</label>
                            <input
                                id="student-id"
                                name="student-id"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Student ID (8-12 digits)"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? 'Sending...' : 'Recover College ID'}
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Back to login
                            </Link>
                        </div>
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotCollegeID; 