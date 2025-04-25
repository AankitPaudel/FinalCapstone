// frontend/src/components/AudioRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
const SILENCE_THRESHOLD = 0.08; // ← Adjust based on testing

export const AudioRecorder = ({
    onTranscriptUpdate,
    onRecordingComplete,
    onRecordingStart,
    silenceThreshold = 3000
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [silenceTime, setSilenceTime] = useState(0);
    const [audioData, setAudioData] = useState([]);
    const [transcript, setTranscript] = useState('');
    
    const mediaRecorder = useRef(null);
    const recognitionRef = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyzerNode = useRef(null);
    const lastAudioTime = useRef(Date.now());
    const silenceTimeoutRef = useRef(null);
    const hasManuallyStopped = useRef(false); // Prevents double stop
    const hasCompleted = useRef(false);
    const stream = useRef(null);

    const finalizeRecording = () => {
        if (hasCompleted.current) {
            console.log("🔄 Recording already finalized, skipping");
            return;
        }
        
        console.log("✅ Finalizing recording and sending to backend, transcript:", transcript);
        hasCompleted.current = true;
    
        // Make sure we have at least some audio data
        if (audioChunks.current.length === 0) {
            console.warn("⚠️ No audio chunks recorded");
            return;
        }
        
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const finalTranscript = transcript || '';
        
        // Clean up media tracks
        if (stream.current) {
            stream.current.getTracks().forEach(track => track.stop());
        }
        
        try {
            onRecordingComplete?.(audioBlob, finalTranscript);
            console.log("✅ Recording sent to backend successfully");
        } catch (err) {
            console.error("❌ Error in onRecordingComplete:", err);
        }
    };


    useEffect(() => {
        // Cleanup function
        return () => {
            stopRecording();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            
            // Clean up media tracks
            if (stream.current) {
                stream.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const initializeRecognition = () => {
        if (!recognitionRef.current && 'webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event) => {
                const transcriptText = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                // Update local transcript state
                setTranscript(transcriptText);
                
                // Call the callback
                onTranscriptUpdate?.(transcriptText);
                
                // Reset silence timer when we get speech recognition results
                lastAudioTime.current = Date.now();
                setSilenceTime(0);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Recognition error:', event.error);
                if (event.error === 'no-speech') {
                    stopRecording();
                }
            };

            recognitionRef.current.onend = () => {
                // Only restart if we're still supposed to be recording
                if (isRecording && !hasManuallyStopped.current) {
                    recognitionRef.current?.start();
                }
            };
        }
    };

    let smoothedLevel = 0;
    const smoothingFactor = 0.8;

    const checkAudioLevel = () => {
        if (!analyzerNode.current || !isRecording) return;

        const dataArray = new Uint8Array(analyzerNode.current.frequencyBinCount);
        analyzerNode.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = average / 128;

        smoothedLevel = smoothingFactor * smoothedLevel + (1 - smoothingFactor) * normalizedLevel;

        setAudioLevel(smoothedLevel);
        
        // Update audio data for visualization
        setAudioData(prevData => {
            // Keep a rolling window of the last 20 audio levels
            const newData = [...prevData, smoothedLevel];
            return newData.slice(-20);
        });

        if (smoothedLevel > SILENCE_THRESHOLD) {
            lastAudioTime.current = Date.now();
            setSilenceTime(0);
        } else {
            const timeSinceLastAudio = Date.now() - lastAudioTime.current;
            setSilenceTime(Math.round(timeSinceLastAudio / 1000));
            
            if (timeSinceLastAudio >= silenceThreshold && !hasManuallyStopped.current && isRecording) {
                console.log(`🔇 Auto-stopping after ${silenceThreshold/1000}s of silence`);
                stopRecording(true); // Pass true to indicate auto-stop
                return;
            }
        }

        if (isRecording) {
            requestAnimationFrame(checkAudioLevel);
        }
    };


    const startRecording = async () => {
        try {
            setIsInitializing(true);
            hasCompleted.current = false;
            hasManuallyStopped.current = false;
            setTranscript('');

            // Initialize audio context
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyzerNode.current = audioContext.current.createAnalyser();
            analyzerNode.current.fftSize = 256;

            // Get media stream
            stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioContext.current.createMediaStreamSource(stream.current);
            source.connect(analyzerNode.current);

            // Initialize media recorder
            mediaRecorder.current = new MediaRecorder(stream.current);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                    console.log("📊 Audio chunk added, total chunks:", audioChunks.current.length);
                }
            };

            mediaRecorder.current.onstop = () => {
                console.log("🎙️ MediaRecorder stopped, hasCompleted:", hasCompleted.current);
                finalizeRecording();
            };
                    
            // Reset silence tracking
            lastAudioTime.current = Date.now();
            setSilenceTime(0);
            setAudioData([]);

            // Initialize speech recognition
            initializeRecognition();

            // Start recording
            console.log("🎙️ Starting recording");
            mediaRecorder.current.start(500); // Collect data every 500ms for more chunks
            recognitionRef.current?.start();
            setIsRecording(true);
            onRecordingStart?.();
            
            // Start monitoring audio levels
            requestAnimationFrame(checkAudioLevel);
            
        } catch (error) {
            console.error('Error starting recording:', error);
        } finally {
            setIsInitializing(false);
        }
    };

    const stopRecording = (isAutoStop = false) => {
        try {
            console.log(`🛑 ${isAutoStop ? 'Auto-stopping' : 'Manually stopping'} recording`);
            
            setIsRecording(false);
            
            if (!isAutoStop) {
                hasManuallyStopped.current = true;
            }
            
            // Stop the media recorder if it's recording
            if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
                console.log("🎙️ Stopping media recorder");
                
                // Manually capture any remaining data
                mediaRecorder.current.requestData();
                
                // Then stop the recorder (this will trigger onstop event)
                setTimeout(() => {
                    mediaRecorder.current.stop();
                }, 100);
            } else {
                console.log("⚠️ MediaRecorder not in recording state:", mediaRecorder.current?.state);
                // If mediaRecorder is not available, manually trigger finalization
                if (!mediaRecorder.current) {
                    finalizeRecording();
                }
            }
    
            // Stop speech recognition
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            
            // Close audio context
            if (audioContext.current) {
                audioContext.current.close().catch(console.error);
            }
            
            // Update UI states
            setAudioLevel(0);
            setSilenceTime(0);
            setAudioData([]);
            clearTimeout(silenceTimeoutRef.current);
            
        } catch (error) {
            console.error('Error stopping recording:', error);
            finalizeRecording(); // Try to finalize anyway
        }
    };
    
    const handleRecordButtonClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="relative inline-flex items-center">
            <button
                onClick={handleRecordButtonClick}
                disabled={isInitializing}
                className={`p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50
                    ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                title={isRecording ? "Stop recording (or wait for 3s silence)" : "Start recording (auto-sends after 3s silence)"}
            >
                {isInitializing ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                    <MicOff className="w-5 h-5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}
            </button>
            
            {isRecording && (
                <div className="absolute left-full ml-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col">
                        {/* Audio wave visualization */}
                        <div className="voice-visualization flex items-end h-16 w-32 space-x-1 mb-1">
                            {audioData.length === 0 ? (
                                // Show placeholder bars when no data yet
                                [...Array(10)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className="voice-bar bg-gray-300 dark:bg-gray-600 w-1.5 rounded-t-sm"
                                        style={{ height: '3px' }}
                                    />
                                ))
                            ) : (
                                // Show actual audio data
                                audioData.map((level, i) => {
                                    const height = Math.max(3, Math.min(60, level * 60));
                                    return (
                                        <div 
                                            key={i}
                                            className={`voice-bar w-1.5 rounded-t-sm ${
                                                level > SILENCE_THRESHOLD 
                                                    ? 'bg-blue-500' 
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                            style={{ height: `${height}px` }}
                                        />
                                    );
                                })
                            )}
                        </div>
                        
                        {/* Status text */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                Recording...
                            </span>
                            {silenceTime > 0 && (
                                <span className="text-xs font-medium text-red-500">
                                    {silenceTime}s silence
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;