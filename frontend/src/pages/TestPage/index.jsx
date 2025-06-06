import React, { useEffect, useRef } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";

export default function TestPage() {
  const videoWrapperRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoWrapperRef.current && !playerRef.current) {
      const videoUrl = `ws://${window.location.hostname}:3001/api/rtsp/stream`;
      playerRef.current = new JSMpeg.VideoElement(videoWrapperRef.current, videoUrl, {
        autoplay: true,
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-theme-bg-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
          RTSP Stream
        </h1>
        <div ref={videoWrapperRef} style={{ width: 1280, height: 720 }} />
      </div>
    </div>
  );
} 