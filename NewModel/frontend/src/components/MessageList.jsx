// src/components/MessageList.jsx
import React from 'react';
import { Message } from './Message';
import { BookOpen, Code, MessageSquare, Lightbulb } from 'lucide-react';

export const MessageList = ({ messages }) => {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <div className="mb-6 text-center">
                        <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                            <BookOpen size={36} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome to Virtual Teacher! 👋
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            I'm here to help you learn and understand Computer Science topics
                        </p>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center mb-3 text-blue-600 dark:text-blue-400">
                                <MessageSquare size={18} className="mr-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Try asking:
                                </h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md">"What is a programming language?"</li>
                                <li className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md">"What is an algorithm?"</li>
                                <li className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md">"What is an array?"</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center mb-3 text-blue-600 dark:text-blue-400">
                                <Lightbulb size={18} className="mr-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Features:
                                </h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-md">
                                    <span className="w-5 h-5 flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">🎤</span>
                                    Voice input support
                                </li>
                                <li className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-md">
                                    <span className="w-5 h-5 flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">📝</span>
                                    Detailed explanations
                                </li>
                                <li className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-md">
                                    <span className="w-5 h-5 flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">⚡</span>
                                    Real-time responses
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="flex justify-center">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            <Code size={16} className="mr-2" />
                            Type a question below or click the microphone to start
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {messages.map((message, index) => (
                <Message 
                    key={index} 
                    message={message} 
                    isLatest={index === messages.length - 1}
                />
            ))}
        </div>
    );
};

export default MessageList;