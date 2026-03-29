import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Circle,
  Square,
  Pause,
  Play,
  Download,
  RotateCcw,
  Settings,
  MousePointerClick,
  ZoomIn,
  Timer,
  Eye,
  Volume2,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useScreenRecorder, RecorderSettings } from "@/hooks/use-screen-recorder";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ScreenRecordingPage() {
  const [settings, setSettings] = useState<RecorderSettings>({
    zoomLevel: 2.0,
    zoomInDuration: 400,
    zoomOutDuration: 600,
    zoomHoldDuration: 1200,
    showClickIndicator: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  const {
    canvasRef,
    videoRef,
    recordingState,
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
  } = useScreenRecorder(settings);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (recordingState !== "recording") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      triggerZoom(x, y);
    },
    [recordingState, triggerZoom],
  );

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">화면 녹화</h1>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            화면을 녹화하면서 클릭 위치에 자동으로 줌인/줌아웃 효과를 적용합니다
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main recording area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Canvas / Preview */}
            <GlassCard hover={false} className="relative overflow-hidden">
              {/* Hidden video element for screen capture */}
              <video ref={videoRef} className="hidden" muted playsInline />

              {recordingState === "idle" ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-pink-600/20 flex items-center justify-center mb-6"
                  >
                    <Monitor className="w-10 h-10 text-red-400" />
                  </motion.div>
                  <h2 className="text-xl font-semibold mb-2">녹화를 시작하세요</h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                    화면 공유를 선택한 후, 녹화 중 화면을 클릭하면
                    <br />
                    해당 위치로 자동 줌인 효과가 적용됩니다
                  </p>
                  <Button
                    size="lg"
                    onClick={startRecording}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white gap-2 px-8"
                  >
                    <Circle className="w-4 h-4 fill-current" />
                    녹화 시작
                  </Button>
                </div>
              ) : recordingState === "preview" && recordedUrl ? (
                <div>
                  <video
                    src={recordedUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: "70vh" }}
                  />
                </div>
              ) : (
                <div ref={canvasContainerRef} className="relative">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full rounded-lg cursor-crosshair"
                    style={{ maxHeight: "70vh" }}
                  />

                  {/* Recording indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: recordingState === "recording" ? [1, 0.3, 1] : 1 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={cn(
                        "w-3 h-3 rounded-full",
                        recordingState === "recording" ? "bg-red-500" : "bg-yellow-500",
                      )}
                    />
                    <span className="text-sm font-mono bg-black/60 px-2 py-0.5 rounded text-white">
                      {recordingState === "paused" ? "일시정지" : "REC"} {formatTime(duration)}
                    </span>
                  </div>

                  {/* Zoom indicator */}
                  <AnimatePresence>
                    {currentZoom.isZooming && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg"
                      >
                        <ZoomIn className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-mono text-white">
                          {currentZoom.scale.toFixed(1)}x
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click hint overlay */}
                  {recordingState === "recording" && clickEvents.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl text-center">
                        <MousePointerClick className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <p className="text-sm text-white/80">화면을 클릭하여 줌 효과 적용</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Controls */}
            {recordingState !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard hover={false}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      {recordingState === "recording" || recordingState === "paused" ? (
                        <>
                          {recordingState === "recording" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={pauseRecording}
                              className="gap-2"
                            >
                              <Pause className="w-4 h-4" />
                              일시정지
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resumeRecording}
                              className="gap-2"
                            >
                              <Play className="w-4 h-4" />
                              재개
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopRecording}
                            className="gap-2"
                          >
                            <Square className="w-4 h-4 fill-current" />
                            녹화 중지
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={downloadRecording}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white gap-2"
                          >
                            <Download className="w-4 h-4" />
                            다운로드
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetRecording}
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            새 녹화
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Timer className="w-4 h-4" />
                        {formatTime(duration)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick className="w-4 h-4" />
                        {clickEvents.length}회 클릭
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Settings & Info */}
          <div className="space-y-4">
            {/* Settings panel */}
            <GlassCard hover={false}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">줌 설정</span>
                </div>
                <motion.span
                  animate={{ rotate: showSettings ? 180 : 0 }}
                  className="text-muted-foreground text-xs"
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 pt-4 border-t border-border mt-4">
                      {/* Zoom level */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          <ZoomIn className="w-3 h-3 inline mr-1" />
                          줌 배율: {settings.zoomLevel.toFixed(1)}x
                        </Label>
                        <input
                          type="range"
                          min="1.2"
                          max="4"
                          step="0.1"
                          value={settings.zoomLevel}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, zoomLevel: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-purple-500"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>1.2x</span>
                          <span>4.0x</span>
                        </div>
                      </div>

                      {/* Zoom in speed */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          줌인 속도: {settings.zoomInDuration}ms
                        </Label>
                        <input
                          type="range"
                          min="100"
                          max="1000"
                          step="50"
                          value={settings.zoomInDuration}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              zoomInDuration: parseInt(e.target.value),
                            }))
                          }
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* Hold duration */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          <Timer className="w-3 h-3 inline mr-1" />
                          줌 유지 시간: {(settings.zoomHoldDuration / 1000).toFixed(1)}초
                        </Label>
                        <input
                          type="range"
                          min="300"
                          max="5000"
                          step="100"
                          value={settings.zoomHoldDuration}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              zoomHoldDuration: parseInt(e.target.value),
                            }))
                          }
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* Zoom out speed */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          줌아웃 속도: {settings.zoomOutDuration}ms
                        </Label>
                        <input
                          type="range"
                          min="200"
                          max="1500"
                          step="50"
                          value={settings.zoomOutDuration}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              zoomOutDuration: parseInt(e.target.value),
                            }))
                          }
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* Click indicator */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          클릭 표시 효과
                        </Label>
                        <Switch
                          checked={settings.showClickIndicator}
                          onCheckedChange={(checked) =>
                            setSettings((s) => ({ ...s, showClickIndicator: checked }))
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* How to use */}
            <GlassCard hover={false}>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-purple-400" />
                사용 방법
              </h3>
              <ol className="text-xs text-muted-foreground space-y-2.5">
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    1
                  </span>
                  <span>
                    <strong className="text-foreground">녹화 시작</strong>을 클릭하고 공유할 화면을 선택합니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    2
                  </span>
                  <span>
                    녹화 중 <strong className="text-foreground">화면의 원하는 위치를 클릭</strong>하면 자동으로 줌인됩니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    3
                  </span>
                  <span>
                    설정된 시간 후 자동으로 <strong className="text-foreground">줌아웃</strong>됩니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    4
                  </span>
                  <span>
                    녹화 완료 후 <strong className="text-foreground">미리보기</strong>하고 다운로드하세요
                  </span>
                </li>
              </ol>
            </GlassCard>

            {/* Click events timeline */}
            {clickEvents.length > 0 && (
              <GlassCard hover={false}>
                <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-blue-400" />
                  줌 이벤트
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {clickEvents.map((evt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="font-mono text-purple-400 w-12">
                        {formatTime(evt.timestamp)}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>
                        줌인 ({Math.round(evt.x * 100)}%, {Math.round(evt.y * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Feature highlights */}
            <GlassCard hover={false}>
              <h3 className="font-medium text-sm mb-3">기능</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
                  <span>클릭 감지 자동 줌인/줌아웃</span>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-pink-400" />
                  <span>클릭 위치 시각적 표시</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>시스템 오디오 녹음 지원</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-green-400" />
                  <span>줌 배율/속도/지속시간 커스텀</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
