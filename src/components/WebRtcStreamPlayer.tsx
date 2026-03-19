"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";;
import { Button } from "@/components/ui/button";
import { AlertCircle, Grid, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCMSV6Videos } from "@/useCMSV6Data";

const TURN_CONFIG = {
  url: "turn:57.131.13.157:3478",
  urlTcp: "turn:57.131.13.157:3478?transport=tcp",
  username: "apexcam",
  password: "apexcam2024secure",
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:57.131.13.157:3478" },
  {
    urls: TURN_CONFIG.url,
    username: TURN_CONFIG.username,
    credential: TURN_CONFIG.password,
  },
  {
    urls: TURN_CONFIG.urlTcp,
    username: TURN_CONFIG.username,
    credential: TURN_CONFIG.password,
  },
];

type ViewMode = "grid" | "single";
type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed"
  | "reconnecting"
  | "refreshing";

interface StreamConfig {
  webrtcWhepUrl: string | null;
  authUser?: string;
  authPass?: string;
}

interface SingleStreamProps {
  deviceId: string;
  channel: number;
  channelName?: string;
  isActive?: boolean;
  showLabel?: boolean;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onClick?: () => void;
}

interface WebRtcStreamPlayerProps {
  deviceId: string;
  deviceName?: string;
  channelCount?: number;
  channelNames?: string[];
  isActive?: boolean;
  initialViewMode?: ViewMode;
  initialChannel?: number;
  className?: string;
  onError?: (channel: number, error: string) => void;
  onStreamStart?: (channel: number) => void;
}

/**
 * Single WebRTC stream cell – ported from React Native SingleStream
 * Uses <video> + srcObject instead of RTCView.
 */
const SingleStream: React.FC<SingleStreamProps> = memo(
  ({
    deviceId,
    channel,
    channelName,
    isActive,
    showLabel = true,
    onError,
    onConnected,
    onClick,
  }) => {
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [statusMessage, setStatusMessage] = useState<string>("Initializing...");
    const [stats, setStats] = useState<{ bytes: number; frames: number }>({
      bytes: 0,
      frames: 0,
    });
  const { data: videoData, isLoading: loadingVideos } = useCMSV6Videos();

    const streamConfigRef = useRef<StreamConfig | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const abortControllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef<boolean>(false);
    const retryCountRef = useRef<number>(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const maxRetries = 3;
    const channelKey = channelName || `CH${channel}`;

    const log = useCallback(
      (msg: string) => {
        console.log(`[web] ${channelKey}: ${msg}`);
      },
      [channelKey]
    );

    const cleanup = useCallback(() => {
      log("Cleaning up...");

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (pcRef.current) {
        try {
          pcRef.current.close();
        } catch {
          // ignore
        }
        pcRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setStats({ bytes: 0, frames: 0 });
      setStatus("disconnected");
      setStatusMessage("Disconnected");
    }, [log]);

    const fetchStreamConfig = useCallback(async (): Promise<StreamConfig | null> => {
      if (!mountedRef.current) return null;

      log("Fetching stream config...");
      setStatus("refreshing");
      setStatusMessage("Getting stream session...");

      try {
        const result = videoData

        if (!mountedRef.current) return null;

        if (!result.webrtcWhepUrl) {
          throw new Error("Failed to get stream URL");
        }

        log(`Stream config received: ${result.webrtcWhepUrl}`);

        const config: StreamConfig = {
          webrtcWhepUrl: result.webrtcWhepUrl,
          authUser: result.authUser,
          authPass: result.authPass,
        };

        streamConfigRef.current = config;
        return config;
      } catch (err: any) {
        if (!mountedRef.current) return null;
        log(`fetchStreamConfig error: ${err.message}`);
        throw err;
      }
    }, [videoData, deviceId, channel, log]);

    const startStats = useCallback(() => {
      if (statsIntervalRef.current || !pcRef.current) return;

      statsIntervalRef.current = setInterval(async () => {
        if (!mountedRef.current || !pcRef.current) return;

        try {
          const report = await pcRef.current.getStats();
          if (!mountedRef.current) return;

          let vBytes = 0;
          let frames = 0;

          report.forEach((s: any) => {
            if (s.type === "inbound-rtp" && s.kind === "video") {
              vBytes = s.bytesReceived || 0;
              frames = s.framesDecoded || 0;
            }
          });

          setStats({ bytes: vBytes, frames });
        } catch {
          // ignore stats errors
        }
      }, 3000);
    }, []);

    const waitForICECandidates = useCallback(
      (pc: RTCPeerConnection, timeout: number): Promise<boolean> => {
        return new Promise((resolve) => {
          let resolved = false;
          let candidateCount = 0;

          const done = (success: boolean) => {
            if (!resolved) {
              resolved = true;
              log(`ICE complete: ${candidateCount} candidates`);
              resolve(success);
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              candidateCount++;
            } else {
              done(true);
            }
          };

          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === "complete") done(true);
          };

          const checkInterval = setInterval(() => {
            if (!mountedRef.current) {
              clearInterval(checkInterval);
              done(false);
            }
          }, 500);

          setTimeout(() => {
            clearInterval(checkInterval);
            done(mountedRef.current);
          }, timeout);
        });
      },
      [log]
    );

    const connect = useCallback(
      async (isRetry = false) => {
        if (!mountedRef.current) {
          log("Connect cancelled - not mounted");
          return;
        }

        cleanup();
        abortControllerRef.current = new AbortController();

        try {
          if (!isRetry || !streamConfigRef.current) {
            const config = await fetchStreamConfig();
            if (!config || !mountedRef.current) return;
          }

          const config = streamConfigRef.current;
          if (!config?.webrtcWhepUrl) {
            throw new Error("No WHEP URL available");
          }

          if (!mountedRef.current) return;

          setStatus("connecting");
          setStatusMessage("Connecting...");

          log("Creating peer connection");

          const pc = new RTCPeerConnection({
            iceServers: ICE_SERVERS,
          });

          pcRef.current = pc;

          pc.addTransceiver("video", { direction: "recvonly" });
          pc.addTransceiver("audio", { direction: "recvonly" });

          pc.ontrack = (event) => {
            if (!mountedRef.current) return;
            log(`Track: ${event.track.kind}`);

            const [stream] = event.streams;
            if (stream && videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          };

          pc.oniceconnectionstatechange = () => {
            if (!mountedRef.current) return;

            const state = pc.iceConnectionState;
            log(`ICE: ${state}`);

            switch (state) {
              case "connected":
              case "completed":
                setStatus("connected");
                setStatusMessage("");
                retryCountRef.current = 0;
                startStats();
                onConnected?.();
                break;
              case "failed":
                setStatus("failed");
                setStatusMessage("Connection failed");
                onError?.("ICE connection failed");
                if (retryCountRef.current < maxRetries && mountedRef.current) {
                  retryCountRef.current++;
                  reconnectTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                      streamConfigRef.current = null;
                      connect();
                    }
                  }, 3000);
                }
                break;
              case "disconnected":
                if (mountedRef.current) {
                  setStatus("reconnecting");
                  setStatusMessage("Reconnecting...");
                }
                break;
            }
          };

          if (!mountedRef.current) {
            pc.close();
            return;
          }

          const offer = await pc.createOffer({});
          if (!mountedRef.current || !pcRef.current) {
            pc.close();
            return;
          }

          await pc.setLocalDescription(offer);
          if (!mountedRef.current || !pcRef.current) {
            pc.close();
            return;
          }

          setStatusMessage("Gathering ICE...");
          const iceSuccess = await waitForICECandidates(pc, 8000);

          if (!iceSuccess || !mountedRef.current || !pcRef.current) {
            pc.close();
            return;
          }

          // Clean WHEP URL (remove embedded auth)
          let whepUrl = config.webrtcWhepUrl;
          try {
            const urlObj = new URL(whepUrl);
            urlObj.username = "";
            urlObj.password = "";
            whepUrl = urlObj.toString();
          } catch {
            // ignore
          }

          log(`WHEP: ${whepUrl}`);
          setStatusMessage("Connecting to stream...");

          const headers: Record<string, string> = {
            "Content-Type": "application/sdp",
          };

          if (config.authUser && config.authPass) {
            headers["Authorization"] = `Basic ${btoa(
              `${config.authUser}:${config.authPass}`
            )}`;
          }

          const response = await fetch(whepUrl, {
            method: "POST",
            headers,
            body: pc.localDescription?.sdp || "",
            signal: abortControllerRef.current?.signal,
          });

          if (!mountedRef.current || !pcRef.current) {
            pc.close();
            return;
          }

          if (response.status === 400) {
            log("HTTP 400 - Session expired");
            cleanup();

            if (retryCountRef.current < maxRetries && mountedRef.current) {
              retryCountRef.current++;
              streamConfigRef.current = null;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              if (mountedRef.current) connect();
            } else if (mountedRef.current) {
              setStatus("failed");
              setStatusMessage("Session expired - click to refresh");
            }
            return;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const answerSdp = await response.text();

          if (!mountedRef.current || !pcRef.current) {
            pc.close();
            return;
          }

          if (!answerSdp?.includes("v=0")) {
            throw new Error("Invalid SDP");
          }

          await pc.setRemoteDescription(
            new RTCSessionDescription({
              type: "answer",
              sdp: answerSdp,
            })
          );

          if (mountedRef.current) {
            log("Remote description set");
            setStatusMessage("Waiting for video...");
          }
        } catch (error: any) {
          if (error?.name === "AbortError") {
            log("Connection aborted");
            return;
          }

          log(`Error: ${error.message}`);
          if (!mountedRef.current) return;

          setStatus("failed");
          setStatusMessage(error.message || "Unknown error");
          onError?.(error.message || "Unknown error");
        }
      },
      [cleanup, log, fetchStreamConfig, waitForICECandidates, startStats, onConnected, onError]
    );

    useEffect(() => {
      mountedRef.current = true;

      if (!isActive) {
        cleanup();
        return () => {
          mountedRef.current = false;
          cleanup();
        };
      }

      retryCountRef.current = 0;
      streamConfigRef.current = null;
      connect();

      return () => {
        mountedRef.current = false;
        cleanup();
      };
    }, [deviceId, channel, isActive, connect, cleanup]);

    const handleRetry = useCallback(() => {
      retryCountRef.current = 0;
      streamConfigRef.current = null;
      connect();
    }, [connect]);

    const content = (
      <div className="relative w-full h-full bg-black overflow-hidden rounded-lg border border-zinc-800">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          autoPlay
          muted
          playsInline
        />

        {status !== "connected" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 px-4">
            {["connecting", "reconnecting", "refreshing"].includes(status) ? (
              <>
                <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <p className="mt-3 text-sm text-white text-center">
                  {statusMessage}
                </p>
              </>
            ) : status === "failed" ? (
              <>
                <p className="text-sm text-red-300 text-center">
                  {statusMessage}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={handleRetry}
                >
                  Refresh Stream
                </Button>
              </>
            ) : (
              <p className="text-sm text-white text-center">{statusMessage}</p>
            )}
          </div>
        )}

        {status === "connected" && stats.frames > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] font-mono text-green-300">
            {Math.round(stats.bytes / 1024)}KB | {stats.frames}f
          </div>
        )}

        {showLabel && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[11px] text-white font-semibold">
            {channelKey}
          </div>
        )}
      </div>
    );

    if (onClick) {
      return (
        <button
          type="button"
          className="w-full h-full"
          onClick={onClick}
        >
          {content}
        </button>
      );
    }

    return content;
  }
);

SingleStream.displayName = "SingleStream";

/**
 * Main WebRTC player – grid/single view, like the RN StreamPlayer.
 */
export const WebRtcStreamPlayer: React.FC<WebRtcStreamPlayerProps> = ({
  deviceId,
  deviceName,
  channelCount = 4,
  channelNames = [],
  isActive = true,
  initialViewMode = "grid",
  initialChannel = 0,
  className,
  onError,
  onStreamStart,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedChannel, setSelectedChannel] = useState<number>(initialChannel);

  const channels = useMemo(
    () =>
      Array.from({ length: channelCount }, (_, i) => ({
        channel: i,
        name: channelNames[i] || `CH${i}`,
      })),
    [channelCount, channelNames]
  );

  return (
    <div
      className={cn(
        "flex flex-col bg-black rounded-lg overflow-hidden border border-zinc-800",
        className
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        {viewMode === "single" ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-100"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid
          </button>
        ) : (
          <span className="text-sm font-medium text-zinc-100 truncate">
            {deviceName || deviceId}
          </span>
        )}

        {viewMode === "single" && (
          <span className="flex-1 text-center text-sm font-medium text-zinc-100 truncate">
            {channelNames[selectedChannel] ?? `CH${selectedChannel}`}
          </span>
        )}

        <div className="flex items-center gap-1 bg-zinc-800 rounded px-1 py-0.5">
          <button
            type="button"
            className={cn(
              "px-2 py-1 rounded text-xs flex items-center justify-center",
              viewMode === "grid"
                ? "bg-white text-black"
                : "text-zinc-200 hover:bg-zinc-700"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              "px-2 py-1 rounded text-xs flex items-center justify-center",
              viewMode === "single"
                ? "bg-white text-black"
                : "text-zinc-200 hover:bg-zinc-700"
            )}
            onClick={() => setViewMode("single")}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* body */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-px bg-zinc-900">
          {channels.map(({ channel, name }) => (
            <div
              key={`${deviceId}-${channel}`}
              className="aspect-video bg-black"
            >
              <SingleStream
                deviceId={deviceId}
                channel={channel}
                channelName={name}
                isActive={isActive}
                showLabel
                onError={(err) => onError?.(channel, err)}
                onConnected={() => onStreamStart?.(channel)}
                onClick={() => {
                  setSelectedChannel(channel);
                  setViewMode("single");
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="aspect-video bg-black">
            <SingleStream
              deviceId={deviceId}
              channel={selectedChannel}
              channelName={channelNames[selectedChannel]}
              isActive={isActive}
              showLabel={false}
              onError={(err) => onError?.(selectedChannel, err)}
              onConnected={() => onStreamStart?.(selectedChannel)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto bg-zinc-900 border-t border-zinc-800 px-2 py-2">
            {channels.map(({ channel, name }) => {
              const active = channel === selectedChannel;
              return (
                <button
                  key={`sel-${channel}`}
                  type="button"
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs whitespace-nowrap border",
                    active
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div> 
      )}
    </div>
  );
};

export default WebRtcStreamPlayer;
