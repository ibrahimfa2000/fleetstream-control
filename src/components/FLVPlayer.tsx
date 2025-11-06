import React, { useEffect, useRef } from "react";
import flvjs from "flv.js";

const FLVPlayer = ({ url, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const flvPlayerRef = useRef<any>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!flvjs.isSupported() || !url || !videoEl) return;

    // Destroy previous player if any
    if (flvPlayerRef.current) {
      try {
        flvPlayerRef.current.destroy();
      } catch (e) {
        console.warn("Previous flv.js instance cleanup failed:", e);
      }
      flvPlayerRef.current = null;
    }

    const flvPlayer = flvjs.createPlayer(
  {
    type: "flv",
    url,
    isLive: true,
    cors: true,
  },
  {
    enableWorker: false,
    enableStashBuffer: false,
    stashInitialSize: 128,  // bytes
    lazyLoad: false,
    autoCleanupSourceBuffer: true,
    autoCleanupMaxBackwardDuration: 1,
    autoCleanupMinBackwardDuration: 0.5,
  }
);

    flvPlayer.attachMediaElement(videoEl);
    flvPlayer.load();

    flvPlayer.on(flvjs.Events.ERROR, (type, details, info) => {
      console.error("FLV.js Error:", type, details, info);
    });

    flvPlayer.on(flvjs.Events.METADATA_ARRIVED, () => {
      console.log("FLV metadata loaded");
    });

    flvPlayerRef.current = flvPlayer;

    if (autoPlay) {
      videoEl.addEventListener("canplay", () => {
        videoEl.play().catch((err) => console.warn("Autoplay failed:", err));
      });
    }

    return () => {
      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.unload();
          flvPlayerRef.current.detachMediaElement();
          flvPlayerRef.current.destroy();
        } catch (e) {
          console.warn("FLV.js cleanup error:", e);
        } finally {
          flvPlayerRef.current = null;
        }
      }
    };
  }, [url, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      muted
      autoPlay={true}
      playsInline
      style={{ width: "100%", borderRadius: 8, backgroundColor: "black" }}
    />
  );
};

export default FLVPlayer;
