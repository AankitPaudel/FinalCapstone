// File: frontend/src/services/api.js
// Use environment variable from Vite or default to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PATH = '/api';
const API_ENDPOINT = `${API_BASE_URL}${API_PATH}`;

console.log('API Endpoint:', API_ENDPOINT);

export const api = {
    async sendQuestion(question) {
        try {
            const response = await fetch(`${API_ENDPOINT}/qa/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
                credentials: 'include', // Include cookies for CORS with credentials
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending question:', error);
            throw error;
        }
    },

    async sendAudio(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');

            const response = await fetch(`${API_ENDPOINT}/audio/speech-to-text`, {
                method: 'POST',
                body: formData,
                credentials: 'include', // Include cookies for CORS with credentials
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending audio:', error);
            throw error;
        }
    },

    async getAudioResponse(text) {
        try {
            const response = await fetch(`${API_ENDPOINT}/audio/text-to-speech`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
                credentials: 'include', // Include cookies for CORS with credentials
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('Error getting audio response:', error);
            throw error;
        }
    },

    async cleanupAudio() {
        try {
            const response = await fetch(`${API_ENDPOINT}/audio/cleanup`, {
                method: 'POST',
                credentials: 'include', // Include cookies for CORS with credentials
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error cleaning up audio:', error);
            throw error;
        }
    },

};