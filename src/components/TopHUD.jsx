import {
  Shield,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Wifi,
  Flame,
  Zap
} from 'lucide-react';
import { ATTACK_PHASES } from '../services/simulationEngine';

export default function TopHUD({
  environment,
  simTime,
  isRunning,
  onTogglePlay,
  onReset,
  speed,
  onChangeSpeed,
  onOpenSetup,
  wsConnected,
  currentPhaseIndex = 2,
  threatScore = 78,
  isReplayMode = false,
  onReplay
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhase = ATTACK_PHASES[currentPhaseIndex] || ATTACK_PHASES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-2.5 flex items-center justify-between border-b border-[#1C222B] bg-[#07090C]/95 backdrop-blur-md">
      {/* Left: Branding & Status */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded-[6px] bg-[#0F1318] border border-[#1C222B] flex items-center justify-center flex-shrink-0 text-sky-400">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs text-[#E8EBEF] tracking-wider uppercase">
              CYBER RANGE
            </span>
            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#0F1318] text-[#8A929D] border border-[#1C222B]">
              COMMAND CENTER
            </span>
            {isReplayMode && (
              <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium bg-[#241608] text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                REPLAY ACTIVE
              </span>
            )}
          </div>
          <div className="text-[10px] text-[#8A929D] flex items-center space-x-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>LIVE 2.5D SIMULATION</span>
            <span className="text-[#565F6B]">&bull;</span>
            <span className="text-[#8A929D] font-mono uppercase">{environment.scenarioCode}</span>
          </div>
        </div>
      </div>

      {/* Center: Attack Phase & Playback Controls */}
      <div className="flex items-center space-x-3">
        {/* Attack Phase & Objective strip */}
        <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 rounded-[6px] bg-[#0A0D11] border border-[#1C222B]">
          <div className="flex items-center space-x-2 text-xs">
            <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">PHASE:</span>
            <span className="text-[#F59E0B] font-medium uppercase text-xs">{currentPhase.name}</span>
            <span className="text-[#565F6B] text-[10px] font-mono">[{currentPhaseIndex + 1}/{ATTACK_PHASES.length}]</span>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-16 h-1 rounded bg-[#161C24] overflow-hidden">
            <div
              className="h-full bg-[#F59E0B] transition-all duration-300"
              style={{ width: `${((currentPhaseIndex + 1) / ATTACK_PHASES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center space-x-1 bg-[#0A0D11] p-1 rounded-[6px] border border-[#1C222B]">
          <button
            onClick={onTogglePlay}
            className={`px-2.5 py-1 rounded-[4px] text-xs font-medium flex items-center space-x-1.5 transition-colors ${isRunning
              ? 'bg-[#241608] text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#34200B]'
              : 'bg-[#0F1E2E] text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#162B42]'
              }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>RUN SIM</span>
              </>
            )}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => onChangeSpeed(speed === 1 ? 2 : speed === 2 ? 5 : 1)}
            className="px-2 py-1 rounded-[4px] text-xs font-mono text-[#8A929D] hover:text-[#E8EBEF] hover:bg-[#1C222B]/50 transition-colors"
            title="Toggle simulation speed"
          >
            {speed}x
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1 rounded-[4px] text-[#8A929D] hover:text-[#E8EBEF] hover:bg-[#1C222B]/50 transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Replay */}
          {onReplay && (
            <button
              onClick={onReplay}
              className="px-2 py-1 rounded-[4px] text-xs font-mono text-[#8A929D] hover:text-[#F59E0B] hover:bg-[#1C222B]/50 transition-colors flex items-center space-x-1"
              title="Replay from Beginning"
            >
              <RotateCcw className="w-3 h-3 text-[#F59E0B]" />
              <span>REPLAY</span>
            </button>
          )}

          {/* Scenario Configurator Trigger */}
          <button
            onClick={onOpenSetup}
            className="px-2.5 py-1 rounded-[4px] text-xs font-medium text-[#E8EBEF] bg-[#0F1318] hover:bg-[#161C24] border border-[#1C222B] transition-colors flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8A929D]" />
            <span>SCENARIO</span>
          </button>
        </div>
      </div>

      {/* Right: Threat Score, Sim Time & WS */}
      <div className="flex items-center space-x-3.5">
        {/* Threat Score */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-[6px] bg-[#0A0D11] border border-[#1C222B] text-xs">
          <Zap className={`w-3.5 h-3.5 ${threatScore > 70 ? 'text-[#EF4444]' : threatScore > 40 ? 'text-[#F59E0B]' : 'text-sky-400'}`} />
          <span className="text-[#8A929D] text-[10px] uppercase font-medium">THREAT:</span>
          <span className={`font-mono font-medium ${threatScore > 70 ? 'text-[#EF4444]' : threatScore > 40 ? 'text-[#F59E0B]' : 'text-[#38BDF8]'}`}>
            {threatScore}/100
          </span>
        </div>

        {/* Sim Elapsed Time */}
        <div className="text-right">
          <div className="text-[10px] text-[#8A929D] uppercase font-medium tracking-wider">SIM TIME</div>
          <div className="font-mono font-medium text-xs text-[#E8EBEF]">
            {formatTime(simTime)}
          </div>
        </div>

        {/* WebSocket Connectivity */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-[6px] bg-[#0A0D11] border border-[#1C222B] text-xs">
          <Wifi className={`w-3.5 h-3.5 ${wsConnected ? 'text-[#10B981]' : 'text-[#8A929D]'}`} />
          <span className="text-[#8A929D] text-[10px] uppercase font-medium">WS:</span>
          <span className={`font-mono text-[11px] font-medium ${wsConnected ? 'text-[#10B981]' : 'text-[#8A929D]'}`}>
            {wsConnected ? 'CONNECTED' : 'LOCAL'}
          </span>
        </div>
      </div>
    </header>
  );
}
