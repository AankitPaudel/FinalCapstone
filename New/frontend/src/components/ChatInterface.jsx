// frontend/src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { AudioRecorder } from './AudioRecorder';
import { ResponsePlayer } from './ResponsePlayer';
import { LoadingIndicator } from './LoadingIndicator';
import { MessageList } from './MessageList';
import { TranscriptBubble } from './TranscriptBubble';
import { Send, Settings, HelpCircle, Moon, Sun, LogOut, UserCircle, MessageSquare, MenuIcon } from 'lucide-react';
import { useTheme, useLanguage } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StudentProfileForm from './StudentProfileForm';
import FeedbackForm from './FeedbackForm';

export const ChatInterface = () => {
    const { messages, sendMessage, isLoading } = useChat();
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage(); // ✅ add this line
    const [showIntro, setShowIntro] = useState(false);
    const [isUserInitiated, setIsUserInitiated] = useState(false); // Track if user opened modal
    const videoRef = useRef(null);
    const { logout } = useAuth(); // For logout functionality
    const [showHelpDropdown, setShowHelpDropdown] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // 1. Update the initial intro useEffect (remove manual play)
useEffect(() => {
    const hasSeenIntro = localStorage.getItem('introSeen');
    if (!hasSeenIntro) {
        setShowIntro(true);
        localStorage.setItem('introSeen', 'true');
    }
}, []);

// 2. Add new useEffect for video control
useEffect(() => {
    if (showIntro && videoRef.current) {
        // For initial autoplay (muted)
        if (!isUserInitiated) {
            videoRef.current.muted = true;
            videoRef.current.play()
              .catch(error => console.log('Autoplay error:', error));
        }
        // For user-initiated playback
        else {
            videoRef.current.muted = false;
            videoRef.current.play()
              .catch(error => console.log('Playback error:', error));
        }
    }
}, [showIntro, isUserInitiated]);
    
    // This effect will scroll to the bottom when new messages arrive or transcript changes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, transcript]);

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (inputText.trim()) {
            const message = inputText;
            setInputText('');
            await sendMessage({ type: 'text', content: message });
        }
    };

    const handleTranscriptUpdate = (newTranscript) => {
        setTranscript(newTranscript);
    };

    const handleAudioSubmit = async (audioBlob, finalTranscript) => {
        console.log("🎧 handleAudioSubmit called with transcript:", finalTranscript);
        setIsRecording(false); // Ensure UI shows we're not recording anymore

        try {
            if (!finalTranscript.trim()) {
                console.log("⚠️ Empty transcript, not sending");
                return;
            }

            // First send message
            console.log("🚀 Sending audio message to backend");
            await sendMessage({ 
                type: 'audio', 
                content: audioBlob,
                transcript: finalTranscript 
            });
            console.log("✅ Audio message sent successfully");

        } catch (error) {
            console.error("❌ Error sending audio message:", error);
        } finally {
            // THEN clear transcript after the actual message is handled
            setTranscript('');
        }
    };

    const handleRecordingStart = () => {
        console.log("🎙️ Recording started");
        setIsRecording(true);
        setTranscript(''); // Clear any previous transcript
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            {/* Mobile menu button - only show on small screens */}
            <button 
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
                <MenuIcon size={20} />
            </button>

            {/* Sidebar with avatar */}
            <div className={`${showMobileSidebar ? 'fixed inset-0 z-40 md:relative' : 'hidden md:flex'} md:w-80 md:flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out shadow-lg`}>
                <div className="absolute md:hidden top-4 right-4 z-50">
                    <button 
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                        onClick={() => setShowMobileSidebar(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex flex-col h-full justify-between">
                    <div>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Virtual Professor
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Your AI Learning Assistant
                            </p>
                        </div>

                        {/* Avatar & Info */}
                        <div className="p-6 flex flex-col items-center">
                            <div className="relative group">
                                <img
                                    src="/images/Newone2.gif"
                                    alt="Professor"
                                    className="relative w-56 h-56 object-cover rounded-full transition-transform duration-500 ease-in-out group-hover:scale-110"
                                />
                            </div>
                            <p className="mt-4 text-center text-gray-800 dark:text-gray-200 font-semibold">
                                Dr. Terry Soule
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Your Virtual Professor
                            </p>
                            <div className="mt-4 w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
                        </div>

                        {/* Nav Links */}
                        <nav className="px-6 space-y-2 mt-4">
                            
                            {/* Help & FAQs Dropdown Toggle */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowHelpDropdown(prev => !prev)}
                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                >
                                    <HelpCircle className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                                    Help & FAQs
                                </button>

                                {showHelpDropdown && (
                                    <div className="ml-6 mt-2 rounded-md bg-white dark:bg-gray-800 shadow-md overflow-hidden">
                                        <button 
                                            onClick={() => setShowDescriptionModal(true)}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            📖 Wanna Know How This Works?
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Settings Dropdown Toggle */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowSettingsDropdown(prev => !prev)}
                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                >
                                    <Settings className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                                    Settings
                                </button>

                                {showSettingsDropdown && (
                                    <div className="ml-6 mt-2 space-y-0.5 rounded-md bg-white dark:bg-gray-800 shadow-md overflow-hidden">
                                        <button 
                                            onClick={() => {
                                                setShowProfileForm(true);
                                                setShowSettingsDropdown(false);
                                                setShowMobileSidebar(false);
                                            }}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            <UserCircle className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                                            Student Profile
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowFeedbackForm(true);
                                                setShowSettingsDropdown(false);
                                                setShowMobileSidebar(false);
                                            }}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            <MessageSquare className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                                            Submit Feedback
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => {
                                    setShowIntro(true);
                                    setIsUserInitiated(true); // User clicked, allow sound
                                    setShowMobileSidebar(false);
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                                <span className="w-5 h-5 flex items-center justify-center mr-3 text-blue-500 dark:text-blue-400">👋</span>
                                Get to Know Me
                            </button>
                            <button 
                                onClick={() => {
                                    logout();
                                    setShowMobileSidebar(false);
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors duration-200"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                            </button>
                        </nav>
                    </div>

                    {/* Theme Toggle */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <button 
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        >
                            {theme === 'light' ? (
                                <>
                                    <Moon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400" />
                                    Dark Mode
                                </>
                            ) : (
                                <>
                                    <Sun className="w-5 h-5 mr-3 text-yellow-500" />
                                    Light Mode
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 relative">
                {/* Messages Display */}
                <div 
                    ref={chatContainerRef} 
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                >
                    <MessageList messages={messages} />
                    {transcript && <TranscriptBubble transcript={transcript} />}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg">
                    <div className="max-w-4xl mx-auto relative">
                        <form onSubmit={handleTextSubmit} className="flex items-end space-x-2 md:space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault(); // Prevent newline
                                            if (inputText.trim()) {
                                                handleTextSubmit(e); // Call your existing submit handler
                                            }
                                        }
                                    }}
                                    placeholder="Ask me anything..."
                                    rows="1"
                                    disabled={isRecording}
                                    className="w-full p-4 text-base text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50 transition-all duration-200 border border-transparent focus:border-blue-300 dark:focus:border-blue-600 shadow-sm"
                                    style={{ minHeight: '60px', maxHeight: '200px' }}
                                />
                                
                                {isLoading && (
                                    <div className="absolute right-3 bottom-3 opacity-70">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <AudioRecorder 
                                    onTranscriptUpdate={handleTranscriptUpdate}
                                    onRecordingComplete={handleAudioSubmit}
                                    onRecordingStart={handleRecordingStart}
                                    silenceThreshold={3000}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || isRecording || !inputText.trim()}
                                    className="p-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        <div className="mt-2 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isRecording ? '🎙 Listening... (will auto-send after 3s of silence)' : '⌨️ Press Enter to send message or click mic to record voice'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay when mobile sidebar is open */}
            {showMobileSidebar && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setShowMobileSidebar(false)}
                ></div>
            )}

            {/* Intro Video Modal */}
            {showIntro && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden w-11/12 md:w-2/3 lg:w-1/2 transform transition-all duration-300 scale-95 opacity-100">
                        <video
                            ref={videoRef}
                            id="introVideo"
                            src="/offline-video_9ff1a430b8d1fb095a75666ce8bc22e0.mp4"
                            autoPlay
                            playsInline
                            className="w-full h-auto rounded-t-lg shadow-lg"
                            onEnded={() => {
                                setShowIntro(false);
                                setIsUserInitiated(false);
                            }}
                        />
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                            <button
                                onClick={() => {
                                    const vid = document.getElementById('introVideo');
                                    if (vid) {
                                        vid.muted = false; // Ensure unmuted
                                        vid.currentTime = 0;
                                        vid.play();
                                    }
                                }}
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm"
                            >
                                ▶️ Replay 
                            </button>
                            <button 
                                onClick={() => {
                                    setShowIntro(false);
                                    setIsUserInitiated(false); // Reset on close
                                }} 
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* How This Works Modal */}
            {showDescriptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 p-6 transform transition-all duration-300 scale-95 opacity-100">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-2 rounded-full mr-3">
                                💡
                            </span>
                            How This Works
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                            This virtual professor is designed to help you with computer science topics. 
                            You can ask questions using voice or text. The AI listens, understands, and responds 
                            with detailed answers. It also uses speech-to-text, language models, and even reads 
                            your voice input dynamically to generate real-time replies. Just press the mic or type your question!
                        </p>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDescriptionModal(false)}
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Profile Form Modal */}
            {showProfileForm && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <StudentProfileForm onClose={() => setShowProfileForm(false)} />
                </div>
            )}

            {/* Feedback Form Modal */}
            {showFeedbackForm && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <FeedbackForm onClose={() => setShowFeedbackForm(false)} />
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
