import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export default function SimulationTimeline({
  simTime,
  maxTime = 90,
  isRunning,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onSeek,
  speed,
  onChangeSpeed,
  isReplayMode
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (simTime / maxTime) * 100));

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto w-[90vw] max-w-2xl">
      <div className="bg-[#0A0D11]/90 border border-[#1C222B] backdrop-blur-md rounded-[6px] px-3.5 py-1.5 shadow-md flex items-center space-x-3 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center space-x-1 border-r border-[#1C222B] pr-2">
          <button
            onClick={onStepBackward}
            className="p-1 rounded-[4px] text-[#8A929D] hover:text-[#E8EBEF] hover:bg-[#1C222B]/50 transition-colors"
            title="Step Backward"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded-[4px] border transition-colors flex items-center justify-center ${
              isRunning 
                ? 'bg-[#241608] text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#34200B]' 
                : 'bg-[#0F1E2E] text-[#38BDF8] border-[#38BDF8]/30 hover:bg-[#162B42]'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>

          <button
            onClick={onStepForward}
            className="p-1 rounded-[4px] text-[#8A929D] hover:text-[#E8EBEF] hover:bg-[#1C222B]/50 transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Time Indicator */}
        <span className="font-mono text-xs font-medium text-[#E8EBEF] whitespace-nowrap">
          {formatTime(simTime)}
        </span>

        {/* Timeline Scrubber Track */}
        <div 
          className="relative flex-1 h-1.5 bg-[#161C24] rounded-full overflow-hidden cursor-pointer border border-[#1C222B] group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPercent = Math.min(1, Math.max(0, clickX / rect.width));
            onSeek(newPercent * maxTime);
          }}
        >
          {/* Progress fill */}
          <div 
            className="h-full bg-sky-400 transition-all duration-150 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Hover scrubber thumb */}
          <div 
            className="absolute top-1/2 w-2.5 h-2.5 bg-[#E8EBEF] border border-sky-400 rounded-full shadow-sm transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Total Time */}
        <span className="font-mono text-xs text-[#565F6B] whitespace-nowrap">
          {formatTime(maxTime)}
        </span>

        {/* Speed Selector */}
        <button
          onClick={() => onChangeSpeed(speed === 1 ? 2 : speed === 2 ? 0.5 : 1)}
          className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-medium bg-[#0F1318] hover:bg-[#161C24] text-[#8A929D] hover:text-[#E8EBEF] border border-[#1C222B] transition-colors"
        >
          {speed}x
        </button>

        {/* Replay indicator badge if active */}
        {isReplayMode && (
          <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-mono font-medium bg-[#241608] text-[#F59E0B] border border-[#F59E0B]/30">
            REPLAY
          </span>
        )}
      </div>
    </div>
  );
}
