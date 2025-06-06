import React, { useEffect, useRef, useState } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";

export default function TestPage() {
  const videoWrapperRef = useRef(null);
  const aiVideoRef = useRef(null);
  const playerRef = useRef(null);
  const aiSocketRef = useRef(null);
  const [streamStatus, setStreamStatus] = useState('stopped');
  const [aiMode, setAiMode] = useState(false);
  const [aiStatus, setAiStatus] = useState('stopped');
  const [detectedObjects, setDetectedObjects] = useState(0);
  const [error, setError] = useState(null);

  // Initialize regular RTSP stream
  useEffect(() => {
    let mounted = true;

    const startStream = async () => {
      try {
        setError(null);
        setStreamStatus('starting');
        
        const response = await fetch('http://localhost:3001/api/rtsp/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const result = await response.json();
        
        if (!mounted) return;
        
        if (result.status === 'started' || result.status === 'already_running') {
          setStreamStatus('running');
          
          setTimeout(() => {
            if (videoWrapperRef.current && !playerRef.current && mounted && !aiMode) {
              const videoUrl = `ws://localhost:9999`;
              playerRef.current = new JSMpeg.VideoElement(videoWrapperRef.current, videoUrl, {
                autoplay: true,
              });
            }
          }, 1000);
        } else {
          setError(`Failed to start stream: ${result.message || result.status}`);
          setStreamStatus('error');
        }
      } catch (err) {
        if (mounted) {
          setError(`Error starting stream: ${err.message}`);
          setStreamStatus('error');
        }
      }
    };

    const stopStream = async () => {
      try {
        await fetch('http://localhost:3001/api/rtsp/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Error stopping stream:', err);
      }
    };

    if (!aiMode) {
      startStream();
    }

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (!aiMode) {
        stopStream();
      }
    };
  }, [aiMode]);

  // AI Stream management
  const startAiStream = async () => {
    try {
      setAiStatus('starting');
      
      // Start AI processing
      const response = await fetch('http://localhost:8000/stream/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAiStatus('connecting');
        
        // Connect to AI WebSocket
        const ws = new WebSocket('ws://localhost:8000/stream/ws');
        aiSocketRef.current = ws;
        
        ws.onopen = () => {
          setAiStatus('running');
          console.log('🤖 Connected to AI stream');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'frame' && aiVideoRef.current) {
              // Display the AI-processed frame
              const img = aiVideoRef.current;
              img.src = `data:image/jpeg;base64,${data.data}`;
            }
          } catch (err) {
            console.error('Error processing AI frame:', err);
          }
        };
        
        ws.onerror = (err) => {
          console.error('AI WebSocket error:', err);
          setAiStatus('error');
        };
        
        ws.onclose = () => {
          console.log('🤖 AI stream disconnected');
          setAiStatus('stopped');
        };
      } else {
        setAiStatus('error');
        setError('Failed to start AI processing');
      }
    } catch (err) {
      setAiStatus('error');
      setError(`AI stream error: ${err.message}`);
    }
  };

  const stopAiStream = async () => {
    try {
      if (aiSocketRef.current) {
        aiSocketRef.current.close();
        aiSocketRef.current = null;
      }
      
      await fetch('http://localhost:8000/stream/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      setAiStatus('stopped');
    } catch (err) {
      console.error('Error stopping AI stream:', err);
    }
  };

  // Toggle between regular and AI mode
  const toggleAiMode = async () => {
    if (aiMode) {
      // Switch to regular mode
      await stopAiStream();
      setAiMode(false);
    } else {
      // Switch to AI mode
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setAiMode(true);
      await startAiStream();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiSocketRef.current) {
        aiSocketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-theme-bg-primary">
      <div className="text-center max-w-6xl mx-auto p-4">
        <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
          AXON RTSP Stream
        </h1>
        
        {/* Mode Toggle */}
        <div className="mb-6 flex items-center justify-center space-x-4">
          <button
            onClick={toggleAiMode}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              aiMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {aiMode ? '🤖 AI MODE ON' : '📹 REGULAR MODE'}
          </button>
          
          <div className="text-theme-text-secondary">
            {aiMode ? 'Object detection active' : 'Basic stream view'}
          </div>
        </div>

        {/* Status Messages */}
        {streamStatus === 'starting' && (
          <p className="text-theme-text-secondary mb-4">Starting stream...</p>
        )}
        {aiStatus === 'starting' && (
          <p className="text-green-500 mb-4">🤖 Initializing AI processing...</p>
        )}
        {aiStatus === 'connecting' && (
          <p className="text-blue-500 mb-4">🔗 Connecting to AI stream...</p>
        )}
        {error && (
          <p className="text-red-500 mb-4">Error: {error}</p>
        )}

        {/* Video Display */}
        <div className="relative mx-auto border border-theme-text-primary/20 rounded-lg overflow-hidden"
             style={{ width: 1280, height: 720 }}>
          
          {/* Regular Stream */}
          {!aiMode && (
            <div 
              ref={videoWrapperRef} 
              className="w-full h-full"
            />
          )}
          
          {/* AI Enhanced Stream */}
          {aiMode && (
            <img
              ref={aiVideoRef}
              className="w-full h-full object-cover"
              alt="AI Enhanced Stream"
            />
          )}
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded">
            {aiMode ? (
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${aiStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>🤖 AI Detection</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${streamStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>📹 Live Stream</span>
              </div>
            )}
          </div>
        </div>

        {/* Stream Info */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-theme-bg-secondary p-3 rounded">
            <strong>Stream Status:</strong> {streamStatus}
          </div>
          <div className="bg-theme-bg-secondary p-3 rounded">
            <strong>AI Status:</strong> {aiStatus}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-theme-text-secondary text-sm max-w-2xl mx-auto">
          <p>
            <strong>Regular Mode:</strong> Direct RTSP stream from your camera<br/>
            <strong>AI Mode:</strong> Real-time object detection with bounding boxes and labels
          </p>
        </div>
      </div>
    </div>
  );
} 