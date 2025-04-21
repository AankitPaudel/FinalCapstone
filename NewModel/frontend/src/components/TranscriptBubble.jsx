// src/components/TranscriptBubble.jsx
import React from 'react';
import { Mic } from 'lucide-react';

export const TranscriptBubble = ({ transcript }) => {
    if (!transcript) return null;

    return (
        <div className="px-4 py-2 mb-4 mx-2 md:mx-6">
            <div className="flex justify-end">
                <div className="relative group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-900 dark:text-blue-100 rounded-2xl px-4 py-3 max-w-[85%] shadow-sm hover:shadow-md transition-all duration-300 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-300 mb-1.5">
                        <Mic className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                        <div className="font-medium">Transcribing...</div>
                        <div className="ml-1.5 flex space-x-0.5">
                            <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                    <div className="text-sm">
                        {transcript}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranscriptBubble;