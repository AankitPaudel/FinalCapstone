import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Book, School, Calendar, Mail, GraduationCap, X } from 'lucide-react';

const StudentProfileForm = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    major: '',
    semester: '',
    year_of_study: '',
    email: '',
    expected_graduation: ''
  });

  useEffect(() => {
    // Fetch existing profile data when component mounts
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            ...response.data,
            email: user?.email || ''
          }));
          setProfileExists(true);
        } else {
          // Set email from user context if available
          setFormData(prev => ({
            ...prev,
            email: user?.email || ''
          }));
        }
      } catch (err) {
        // Simply initialize an empty form with user's email if available
        // Don't show error message for 401 or 404 errors
        setFormData(prev => ({
          ...prev,
          email: user?.email || ''
        }));
        
        // Only set error for non-auth related errors
        if (err.response && ![401, 404].includes(err.response.status)) {
          setError('Error fetching profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.full_name || !formData.department || !formData.major || !formData.semester) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      // Prepare data for submission - only include fields the API expects
      const submissionData = {
        full_name: formData.full_name,
        department: formData.department,
        major: formData.major,
        semester: parseInt(formData.semester),
        year_of_study: formData.year_of_study ? parseInt(formData.year_of_study) : null,
        interests: '',
        goals: ''
      };
      
      // Always use POST method since we can't reliably determine if profile exists
      const response = await axios.post('/api/profile/profile', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess(true);
      setProfileExists(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-md">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {profileExists ? 'Update Profile' : 'Create Profile'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 border-l-4 border-red-500 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-3 p-2 bg-green-100 border-l-4 border-green-500 text-green-700 rounded text-sm">
          Profile {profileExists ? 'updated' : 'created'} successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
          {/* Name and Email Row */}
          <div>
            <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Full Name*
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
              <Mail className="w-3.5 h-3.5 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
              placeholder="Your email address"
              disabled={!!user?.email}
            />
          </div>
          
          {/* School and Major */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
                <School className="w-3.5 h-3.5 inline mr-1" />
                School/Dept*
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
                required
                placeholder="e.g. CS Dept"
              />
            </div>
            
            <div>
              <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
                <Book className="w-3.5 h-3.5 inline mr-1" />
                Major*
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
                required
                placeholder="e.g. Comp Sci"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Semester*
              </label>
              <input
                type="number"
                id="semester"
                name="semester"
                min="1"
                max="12"
                value={formData.semester}
                onChange={handleChange}
                className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
                required
                placeholder="e.g. 3"
              />
            </div>
            
            <div>
              <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Year
              </label>
              <input
                type="number"
                id="year_of_study"
                name="year_of_study"
                min="1"
                max="7"
                value={formData.year_of_study}
                onChange={handleChange}
                className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
                placeholder="e.g. 2"
              />
            </div>
            
            <div>
              <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1">
                <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
                Grad Year
              </label>
              <input
                type="text"
                id="expected_graduation"
                name="expected_graduation"
                value={formData.expected_graduation}
                onChange={handleChange}
                className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
                placeholder="e.g. 2025"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? "Saving..." : (profileExists ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfileForm; 