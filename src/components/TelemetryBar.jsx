import { Activity, ShieldAlert, ShieldCheck, Cpu, Network, Zap } from 'lucide-react';

export default function TelemetryBar({
  nodesCount,
  activeLinksCount,
  compromisedCount,
  threatsCount,
  blockedCount,
  latency = '1.8ms',
}) {
  return (
    <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      {/* Unified Telemetry Strip */}
      <div className="flex items-center bg-[#0A0D11]/90 border border-[#1C222B] backdrop-blur-md rounded-[6px] px-3 py-1.5 shadow-md pointer-events-auto text-xs">
        {/* Nodes */}
        <div className="flex items-center space-x-1.5 px-2">
          <Network className="w-3.5 h-3.5 text-[#8A929D]" />
          <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">NODES</span>
          <span className="font-mono font-medium text-[#E8EBEF]">{nodesCount.toString().padStart(2, '0')}</span>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-[#1C222B]" />

        {/* Links */}
        <div className="flex items-center space-x-1.5 px-2">
          <Activity className="w-3.5 h-3.5 text-[#8A929D]" />
          <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">LINKS</span>
          <span className="font-mono font-medium text-[#E8EBEF]">{activeLinksCount.toString().padStart(2, '0')}</span>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-[#1C222B]" />

        {/* Compromised */}
        <div className="flex items-center space-x-1.5 px-2">
          <ShieldAlert className={`w-3.5 h-3.5 ${compromisedCount > 0 ? 'text-[#EF4444]' : 'text-[#565F6B]'}`} />
          <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">COMPROMISED</span>
          <span className={`font-mono font-medium ${compromisedCount > 0 ? 'text-[#EF4444]' : 'text-[#8A929D]'}`}>
            {compromisedCount.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-[#1C222B]" />

        {/* Threats */}
        <div className="flex items-center space-x-1.5 px-2">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">THREATS</span>
          <span className="font-mono font-medium text-[#F59E0B]">{threatsCount.toString().padStart(2, '0')}</span>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-[#1C222B]" />

        {/* Blocked */}
        <div className="flex items-center space-x-1.5 px-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">BLOCKED</span>
          <span className="font-mono font-medium text-[#10B981]">{blockedCount.toString().padStart(2, '0')}</span>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-[#1C222B]" />

        {/* Latency */}
        <div className="flex items-center space-x-1.5 px-2">
          <Cpu className="w-3.5 h-3.5 text-[#8A929D]" />
          <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">LATENCY</span>
          <span className="font-mono font-medium text-[#E8EBEF]">{latency}</span>
        </div>
      </div>
    </div>
  );
}
