import React, { useEffect, useRef } from "react";
import flvjs from "flv.js";

const FLVPlayer = ({ url, autoPlay = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (flvjs.isSupported() && url) {
      const flvPlayer = flvjs.createPlayer({
        type: "flv",
        url,
        isLive: true,
        cors: true,
      });
      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
      if (autoPlay) flvPlayer.play();

      return () => {
        flvPlayer.destroy();
      };
    }
  }, [url, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      muted
      autoPlay
      playsInline
      style={{ width: "100%", borderRadius: 8, backgroundColor: "black" }}
    />
  );
};

export default FLVPlayer;
