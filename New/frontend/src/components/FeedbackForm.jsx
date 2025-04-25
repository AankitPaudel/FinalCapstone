import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, Star, X } from 'lucide-react';

const FeedbackForm = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    feedback_text: '',
    improvement_suggestions: '',
    category: 'general'
  });

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
      if (!formData.feedback_text) {
        setError('Please provide feedback text');
        setLoading(false);
        return;
      }
      
      const response = await axios.post('/api/feedback/feedback', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        rating: 5,
        feedback_text: '',
        improvement_suggestions: '',
        category: 'general'
      });
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };
  
  const FormHeader = () => (
    <div className="mb-4 text-center pb-2 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Submit Feedback
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Help us improve your learning experience
      </p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center mb-2">
        <FormHeader />
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          <div className="flex">
            <div className="ml-1">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md">
          <div className="flex">
            <div className="ml-1">
              <p className="text-sm">Thank you for your feedback!</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Section */}
        <div className="flex items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="ml-2 font-semibold text-gray-800 dark:text-gray-200">Rate Your Experience</h3>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className="text-3xl mx-1 focus:outline-none transition-transform hover:scale-110"
              >
                {star <= formData.rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <p className="text-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.rating > 3 ? "Great! We're glad you're enjoying it." : "We'll work to improve your experience."}
          </p>
        </div>
        
        {/* Feedback Details */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-900 dark:text-white text-sm font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="p-1.5 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
            >
              <option value="general">General</option>
              <option value="ui">Interface</option>
              <option value="content">Content</option>
              <option value="features">Features</option>
              <option value="accuracy">Accuracy</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1" htmlFor="feedback_text">
            Your Feedback*
          </label>
          <textarea
            id="feedback_text"
            name="feedback_text"
            value={formData.feedback_text}
            onChange={handleChange}
            className="w-full p-2.5 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600 resize-none"
            rows="3"
            placeholder="Share your thoughts or any issues you've encountered..."
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-900 dark:text-white text-sm font-medium mb-1" htmlFor="improvement_suggestions">
            Suggestions for Improvement
          </label>
          <textarea
            id="improvement_suggestions"
            name="improvement_suggestions"
            value={formData.improvement_suggestions}
            onChange={handleChange}
            className="w-full p-2.5 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600 resize-none"
            rows="2"
            placeholder="How can we make this better?"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm; 