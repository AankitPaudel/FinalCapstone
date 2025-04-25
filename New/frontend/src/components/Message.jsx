// src/components/Message.jsx
import React from 'react';
import { ResponsePlayer } from './ResponsePlayer';
import { User, Bot, Code } from 'lucide-react';

export const Message = ({ message, isLatest }) => {
    const isUser = message.sender === 'user';
    const formattedTime = message.timestamp ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(new Date(message.timestamp)) : '';

    // Function to detect and format code blocks
    const formatMessageContent = (text) => {
        if (!text) return null;
        
        // Check for code blocks with triple backticks
        const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({ 
                    type: 'text', 
                    content: text.substring(lastIndex, match.index) 
                });
            }
            
            // Add code block with language
            const language = match[1].trim();
            const code = match[2].trim();
            parts.push({ 
                type: 'code', 
                language, 
                content: code 
            });
            
            lastIndex = match.index + match[0].length;
        }
        
        // Add any remaining text
        if (lastIndex < text.length) {
            parts.push({ 
                type: 'text', 
                content: text.substring(lastIndex) 
            });
        }
        
        // If no code blocks were found, return the text as is
        if (parts.length === 0) {
            parts.push({ type: 'text', content: text });
        }
        
        return parts;
    };

    const messageParts = formatMessageContent(message.text);

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 mx-2 md:mx-6 group`}>
            {!isUser && (
                <div className="flex-shrink-0 w-10 h-10 relative">
                    <img 
                        src="/images/Newone2.gif" 
                        alt="Professor Avatar" 
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />
                </div>
            )}

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div 
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isUser 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700'
                    } transition-all duration-300 hover:shadow-md`}
                >
                    <div className="text-sm whitespace-pre-wrap">
                        {messageParts.map((part, index) => {
                            if (part.type === 'text') {
                                return <div key={index}>{part.content}</div>;
                            } else if (part.type === 'code') {
                                return (
                                    <div key={index} className="mt-2 mb-2">
                                        <div className="flex items-center justify-between py-1 px-3 bg-gray-200 dark:bg-gray-700 rounded-t-md">
                                            <div className="flex items-center">
                                                <Code className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                                                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                                                    {part.language || 'code'}
                                                </span>
                                            </div>
                                        </div>
                                        <pre className="bg-gray-100 dark:bg-gray-900 rounded-b-md p-3 overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                            <code>{part.content}</code>
                                        </pre>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
                
                {formattedTime && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        {formattedTime}
                    </div>
                )}
                
                {message.audioUrl && (
                    <div className="mt-2 transition-all duration-300 transform hover:translate-y-0.5">
                        <ResponsePlayer 
                            audioUrl={message.audioUrl}
                            autoPlay={isLatest}
                        />
                    </div>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-10 h-10 relative">
                    <div className="absolute -inset-0.5 bg-blue-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center relative shadow-md transition-transform duration-300 group-hover:scale-105">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Message;