import React, { useEffect, useRef, useState } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";

export default function TestPage() {
  const videoWrapperRef = useRef(null);
  const playerRef = useRef(null);
  const [streamStatus, setStreamStatus] = useState('stopped');
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const startStream = async () => {
      try {
        setError(null);
        setStreamStatus('starting');
        
        // Start the stream
        const response = await fetch('http://localhost:3001/api/rtsp/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        
        if (!mounted) return;
        
        if (result.status === 'started' || result.status === 'already_running') {
          setStreamStatus('running');
          
          // Wait a bit for the stream to be ready
          setTimeout(() => {
            if (videoWrapperRef.current && !playerRef.current && mounted) {
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
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.error('Error stopping stream:', err);
      }
    };

    startStream();

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      stopStream();
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-theme-bg-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
          RTSP Stream
        </h1>
        {streamStatus === 'starting' && (
          <p className="text-theme-text-secondary mb-4">Starting stream...</p>
        )}
        {streamStatus === 'error' && (
          <p className="text-red-500 mb-4">Error: {error}</p>
        )}
        <div 
          ref={videoWrapperRef} 
          style={{ width: 1280, height: 720 }} 
          className="mx-auto border border-theme-text-primary/20 rounded"
        />
        <p className="text-theme-text-secondary text-sm mt-2">
          Status: {streamStatus}
        </p>
      </div>
    </div>
  );
} 