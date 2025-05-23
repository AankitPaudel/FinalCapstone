// src/components/TypingIndicator.jsx
import React from 'react';

export const TypingIndicator = () => {
    return (
        <div className="flex gap-3 mx-4 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8">
                <img 
                    src="/images/Newone2.gif" 
                    alt="Bot avatar" 
                    className="w-8 h-8 object-cover rounded-full" 
                />
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-2xl text-sm">
                <div className="typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        </div>
    );
};
