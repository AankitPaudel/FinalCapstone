// src/hooks/useChat.js
import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            api.cleanupAudio().catch(console.error);
        };
    }, []);

    const sendMessage = useCallback(async ({ type, content }) => {
        try {
            setIsLoading(true);
            setError(null);

            let userMessage = '';
            let response;

            if (type === 'audio') {
                // First, convert audio to text
                const textResult = await api.sendAudio(content);
                userMessage = textResult.text;
                
                // Add the transcribed message to the chat immediately
                setMessages(prev => [...prev, {
                    sender: 'user',
                    text: userMessage,
                    timestamp: new Date()
                }]);

                // Then send the transcribed text to get response
                response = await api.sendQuestion(userMessage);
            } else {
                userMessage = content;
                // Add the text message to chat immediately
                setMessages(prev => [...prev, {
                    sender: 'user',
                    text: userMessage,
                    timestamp: new Date()
                }]);

                // Send the text to get response
                response = await api.sendQuestion(content);
            }

            // Add the assistant's response
            setMessages(prev => [...prev, {
                sender: 'assistant',
                text: response.answer,
                audioUrl: response.audio_url,
                sources: response.sources,
                confidence_score: response.confidence_score,
                timestamp: new Date()
            }]);

        } catch (err) {
            setError(err.message);
            console.error('Error sending message:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { messages, isLoading, error, sendMessage };
};