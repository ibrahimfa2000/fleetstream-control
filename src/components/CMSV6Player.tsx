import { useEffect, useRef, useState } from "react";

interface CMSV6PlayerProps {
  stream: {
    deviceId: string | number;
    channel: number;
    channelName: string;
    liveUrl: string;
  };
  width?: number;
  height?: number;
}

const CMSV6Player = ({ stream, width = 640, height = 360 }: CMSV6PlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Step 1: Load the external player script dynamically
  useEffect(() => {
    if ((window as any).Cmsv6Player) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://prod.apex-view.org/808gps/open/player/js/cmsv6player.min.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Step 2: Initialize player when loaded
  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    const Cmsv6Player = (window as any).Cmsv6Player;
    if (!Cmsv6Player) return;

    const options = {
      domId: containerRef.current.id,
      isVodMode: false, // Live mode
      width,
      height,
      lang: "en",
    };

    const player = new Cmsv6Player(options);

    const init = () => {
      if (!player || !player.setWindowNum) {
        setTimeout(init, 100);
        return;
      }

      player.setWindowNum(4);
      player.startVodM(stream.liveUrl, "0,1,2,3");
      player.setServerInfo('57.131.13.157', '808gps');

      console.log("✅ CMSV6 player initialized:", stream);
    };

    init();

    return () => {
      try {
        player?.destroy?.();
      } catch {}
    };
  }, [loaded, stream, width, height]);

  const uniqueId = `cmsv6flash_${stream.deviceId}_${stream.channel}`;

  return (
    <div
      ref={containerRef}
      id={uniqueId}
      style={{
        width,
        height,
        backgroundColor: "#000",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
};

export default CMSV6Player;
