import { useRef, useState, useCallback, useEffect } from "react";

export interface ClickEvent {
  x: number;
  y: number;
  timestamp: number;
}

export interface ZoomState {
  scale: number;
  targetX: number;
  targetY: number;
  isZooming: boolean;
}

export interface RecorderSettings {
  zoomLevel: number;
  zoomInDuration: number;
  zoomOutDuration: number;
  zoomHoldDuration: number;
  showClickIndicator: boolean;
}

const DEFAULT_SETTINGS: RecorderSettings = {
  zoomLevel: 2.0,
  zoomInDuration: 400,
  zoomOutDuration: 600,
  zoomHoldDuration: 1200,
  showClickIndicator: true,
};

export type RecordingState = "idle" | "recording" | "paused" | "preview";

export function useScreenRecorder(settings: RecorderSettings = DEFAULT_SETTINGS) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animFrameRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const clickEventsRef = useRef<ClickEvent[]>([]);

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [currentZoom, setCurrentZoom] = useState<ZoomState>({
    scale: 1,
    targetX: 0.5,
    targetY: 0.5,
    isZooming: false,
  });

  const durationRef = useRef(0);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Zoom animation state
  const zoomRef = useRef({
    current: { scale: 1, x: 0.5, y: 0.5 },
    target: { scale: 1, x: 0.5, y: 0.5 },
    animating: false,
    phase: "idle" as "idle" | "zooming_in" | "holding" | "zooming_out",
    phaseStart: 0,
  });

  // Click indicator state
  const clickIndicatorRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const ctx = canvas.getContext("2d")!;
    const zoom = zoomRef.current;
    const now = performance.now();

    // Update zoom animation phases
    if (zoom.phase === "zooming_in") {
      const elapsed = now - zoom.phaseStart;
      const progress = Math.min(elapsed / settings.zoomInDuration, 1);
      const eased = easeOutCubic(progress);
      zoom.current.scale = 1 + (zoom.target.scale - 1) * eased;
      zoom.current.x = 0.5 + (zoom.target.x - 0.5) * eased;
      zoom.current.y = 0.5 + (zoom.target.y - 0.5) * eased;
      if (progress >= 1) {
        zoom.phase = "holding";
        zoom.phaseStart = now;
      }
    } else if (zoom.phase === "holding") {
      const elapsed = now - zoom.phaseStart;
      if (elapsed >= settings.zoomHoldDuration) {
        zoom.phase = "zooming_out";
        zoom.phaseStart = now;
      }
    } else if (zoom.phase === "zooming_out") {
      const elapsed = now - zoom.phaseStart;
      const progress = Math.min(elapsed / settings.zoomOutDuration, 1);
      const eased = easeInOutCubic(progress);
      zoom.current.scale = zoom.target.scale + (1 - zoom.target.scale) * eased;
      zoom.current.x = zoom.target.x + (0.5 - zoom.target.x) * eased;
      zoom.current.y = zoom.target.y + (0.5 - zoom.target.y) * eased;
      if (progress >= 1) {
        zoom.current = { scale: 1, x: 0.5, y: 0.5 };
        zoom.phase = "idle";
        zoom.animating = false;
        setCurrentZoom({ scale: 1, targetX: 0.5, targetY: 0.5, isZooming: false });
      }
    }

    // Draw video with zoom transform
    const { scale, x, y } = zoom.current;
    const sw = canvas.width / scale;
    const sh = canvas.height / scale;
    const sx = (x - 0.5) * canvas.width + (canvas.width - sw) / 2;
    const sy = (y - 0.5) * canvas.height + (canvas.height - sh) / 2;

    // Clamp source coordinates
    const clampedSx = Math.max(0, Math.min(sx, canvas.width - sw));
    const clampedSy = Math.max(0, Math.min(sy, canvas.height - sh));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw with slight rounding for smooth edges
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      video,
      (clampedSx / canvas.width) * video.videoWidth,
      (clampedSy / canvas.height) * video.videoHeight,
      (sw / canvas.width) * video.videoWidth,
      (sh / canvas.height) * video.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Draw click indicator
    if (settings.showClickIndicator && clickIndicatorRef.current) {
      const indicator = clickIndicatorRef.current;
      const age = now - indicator.time;
      if (age < 600) {
        const progress = age / 600;
        const alpha = 1 - progress;
        const radius = 12 + progress * 30;

        // Map indicator position through current zoom
        const ix = ((indicator.x - clampedSx / canvas.width) / (sw / canvas.width)) * canvas.width;
        const iy = ((indicator.y - clampedSy / canvas.height) / (sh / canvas.height)) * canvas.height;

        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(ix, iy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(ix, iy, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#a855f7";
        ctx.fill();
        ctx.restore();
      } else {
        clickIndicatorRef.current = null;
      }
    }

    // Subtle vignette when zoomed
    if (scale > 1.05) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7,
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${Math.min((scale - 1) * 0.15, 0.2)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (zoom.phase !== "idle") {
      setCurrentZoom({
        scale: zoom.current.scale,
        targetX: zoom.current.x,
        targetY: zoom.current.y,
        isZooming: true,
      });
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);
  }, [settings]);

  const triggerZoom = useCallback(
    (normalizedX: number, normalizedY: number) => {
      const zoom = zoomRef.current;

      // If already zooming, interrupt and start new zoom
      zoom.target = { scale: settings.zoomLevel, x: normalizedX, y: normalizedY };
      zoom.phase = "zooming_in";
      zoom.phaseStart = performance.now();
      zoom.animating = true;

      // Store click indicator position
      if (settings.showClickIndicator) {
        clickIndicatorRef.current = {
          x: normalizedX,
          y: normalizedY,
          time: performance.now(),
        };
      }

      // Record click event
      const event: ClickEvent = {
        x: normalizedX,
        y: normalizedY,
        timestamp: durationRef.current,
      };
      clickEventsRef.current.push(event);
      setClickEvents([...clickEventsRef.current]);
    },
    [settings],
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          frameRate: 30,
        } as MediaTrackConstraints,
        audio: {
          suppressLocalAudioPlayback: false,
        } as MediaTrackConstraints,
      });

      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      // Wait for video dimensions
      await new Promise<void>((resolve) => {
        const check = () => {
          if (video.videoWidth > 0) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });

      const canvas = canvasRef.current!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Start render loop
      animFrameRef.current = requestAnimationFrame(drawFrame);

      // Capture canvas stream and record
      const canvasStream = canvas.captureStream(30);

      // Add audio tracks if present
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => canvasStream.addTrack(track));

      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8_000_000,
      });

      chunksRef.current = [];
      clickEventsRef.current = [];
      setClickEvents([]);
      durationRef.current = 0;
      setDuration(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordingState("preview");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);

      // Duration timer
      durationIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);

      // Handle stream end (user clicks "Stop sharing")
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      setRecordingState("recording");
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [drawFrame]);

  const stopRecording = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }

    cancelAnimationFrame(animFrameRef.current);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setRecordingState("paused");
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      durationIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
      setRecordingState("recording");
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingState("idle");
    setDuration(0);
    setClickEvents([]);
    clickEventsRef.current = [];
    zoomRef.current = {
      current: { scale: 1, x: 0.5, y: 0.5 },
      target: { scale: 1, x: 0.5, y: 0.5 },
      animating: false,
      phase: "idle",
      phaseStart: 0,
    };
  }, [recordedUrl]);

  const downloadRecording = useCallback(() => {
    if (!recordedUrl) return;
    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `screen-recording-${Date.now()}.webm`;
    a.click();
  }, [recordedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, []);

  return {
    canvasRef,
    videoRef,
    previewVideoRef,
    recordingState,
    recordedBlob,
    recordedUrl,
    duration,
    clickEvents,
    currentZoom,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    downloadRecording,
    triggerZoom,
  };
}
