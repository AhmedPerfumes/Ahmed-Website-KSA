"use client"
import React, { useEffect, useRef, useState } from 'react';
import "./VideoScroller.css";

const VideoScrollPlayer = () => {
  const [height, setHeight] = useState(0);
  const vidRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    const container = containerRef.current;

    // Dynamically set the page height according to video length
    const handleMetadataLoaded = () => {
      const playbackConst = 500; // playback speed
      setHeight(Math.floor(vid.duration) * playbackConst);
    };

    // Attach event listener when video metadata is loaded
    if (vid) {
      vid.addEventListener('loadedmetadata', handleMetadataLoaded);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (vid) {
        vid.removeEventListener('loadedmetadata', handleMetadataLoaded);
      }
    };
  }, []);

  // Smooth playback via scroll
  useEffect(() => {
    const playbackConst = 500; // playback speed
    const scrollPlay = () => {
      if (vidRef.current) {
        const frameNumber = window.pageYOffset / playbackConst;
        vidRef.current.currentTime = frameNumber;
        window.requestAnimationFrame(scrollPlay);
      }
    };

    window.requestAnimationFrame(scrollPlay);

  }, []);

  return (
    <div>
      <div ref={containerRef} id="set-height" style={{ height: `${height}px` }}></div>
      <p id="time"></p>
      <video ref={vidRef} id="v0" tabIndex="0" autoBuffer="autoBuffer" preload="preload">
        <source
          type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'"
          src="/assets/videos/ignite-rose-video.mp4"
        />
      </video>
    </div>
  );
};

export default VideoScrollPlayer;
