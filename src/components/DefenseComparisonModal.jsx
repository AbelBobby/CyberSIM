import { 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  X
} from 'lucide-react';
import { DEFENSE_COMPARISONS } from '../services/simulationEngine';

export default function DefenseComparisonModal({
  isOpen,
  onClose,
  onApplyConfig
}) {
  if (!isOpen) return null;

  const comparisonData = DEFENSE_COMPARISONS.banking;
  const configA = comparisonData.configA;
  const configB = comparisonData.configB;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0A0D11] rounded-[6px] border border-[#1C222B] shadow-2xl overflow-hidden text-[#E8EBEF] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#1C222B] flex items-center justify-between bg-[#07090C]">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-[4px] bg-[#0F1318] border border-[#1C222B] flex items-center justify-center text-sky-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#E8EBEF] tracking-wider uppercase">
                DEFENSIVE BENCHMARK COMPARISON
              </h2>
              <p className="text-[10px] text-[#8A929D]">
                OUTCOME ANALYSIS: UNPROTECTED PERIMETER vs HARDENED ZERO-TRUST ARCHITECTURE
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-[#8A929D] hover:text-[#E8EBEF] rounded-[4px] hover:bg-[#1C222B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Columns */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* Configuration A: Unprotected */}
          <div className="p-5 rounded-[6px] border border-[#EF4444]/40 bg-[#2A0C11]/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#EF4444]/30 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                  <span className="font-semibold text-xs text-red-300">CONFIGURATION A: BASELINE</span>
                </div>
                <span className="px-2 py-0.5 rounded-[3px] text-[9px] bg-[#2A0C11] text-[#EF4444] border border-[#EF4444]/40 font-semibold uppercase">
                  UNPROTECTED
                </span>
              </div>

              {/* Status List */}
              <div className="text-[11px] space-y-1 text-[#8A929D] mb-4 bg-[#0A0D11] p-2.5 rounded-[4px] border border-[#1C222B]">
                <div className="flex justify-between"><span>WAF FILTER:</span><span className="text-[#EF4444] font-semibold">DISABLED</span></div>
                <div className="flex justify-between"><span>SEGMENTATION:</span><span className="text-[#EF4444] font-semibold">DISABLED (FLAT LAN)</span></div>
                <div className="flex justify-between"><span>MFA ENFORCEMENT:</span><span className="text-[#EF4444] font-semibold">DISABLED</span></div>
                <div className="flex justify-between"><span>IDS / IPS SENSOR:</span><span className="text-[#EF4444] font-semibold">DISABLED</span></div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
                  <span className="text-[9px] text-[#565F6B] uppercase block">COMPROMISED</span>
                  <span className="text-lg font-bold text-[#EF4444]">{configA.compromised} / {configA.totalNodes}</span>
                </div>
                <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
                  <span className="text-[9px] text-[#565F6B] uppercase block">BLOCKED</span>
                  <span className="text-lg font-bold text-[#8A929D]">{configA.threatsBlocked}</span>
                </div>
                <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
                  <span className="text-[9px] text-[#565F6B] uppercase block">EXFILTRATED</span>
                  <span className="text-lg font-bold text-[#EF4444]">{configA.dataExfiltrated}</span>
                </div>
              </div>

              {/* Attack Path Visual Representation */}
              <div className="p-2.5 rounded-[4px] bg-[#0A0D11] border border-[#1C222B] text-[10px] space-y-1 mb-3">
                <span className="text-[#565F6B] uppercase block font-semibold">ATTACK PROPAGATION ROUTE:</span>
                <div className="text-red-300 font-semibold flex items-center flex-wrap gap-1">
                  <span>ATTACKER</span>
                  <ArrowRight className="w-3 h-3 text-[#EF4444]" />
                  <span>WEB PORTAL</span>
                  <ArrowRight className="w-3 h-3 text-[#EF4444]" />
                  <span>ATM HOST</span>
                  <ArrowRight className="w-3 h-3 text-[#EF4444]" />
                  <span>CORE DB (BREACHED)</span>
                </div>
              </div>

              <p className="text-[11px] text-[#8A929D] leading-relaxed">
                {configA.summary}
              </p>
            </div>

            <button
              onClick={() => {
                onApplyConfig(configA.controls);
                onClose();
              }}
              className="w-full py-2 rounded-[4px] bg-[#2A0C11] hover:bg-[#3D1219] border border-[#EF4444]/40 text-[#EF4444] text-xs font-semibold transition-all"
            >
              LOAD CONFIGURATION A
            </button>
          </div>

          {/* Configuration B: Hardened */}
          <div className="p-5 rounded-[6px] border border-sky-500/40 bg-[#0F1E2E]/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-sky-500/30 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-xs text-sky-300">CONFIGURATION B: HARDENED</span>
                </div>
                <span className="px-2 py-0.5 rounded-[3px] text-[9px] bg-[#0F1E2E] text-sky-400 border border-sky-500/40 font-semibold uppercase">
                  ZERO TRUST ACTIVE
                </span>
              </div>

              {/* Status List */}
              <div className="text-[11px] space-y-1 text-[#8A929D] mb-4 bg-[#0A0D11] p-2.5 rounded-[4px] border border-[#1C222B]">
                <div className="flex justify-between"><span>WAF FILTER:</span><span className="text-[#10B981] font-semibold">ACTIVE (BLOCKING)</span></div>
                <div className="flex justify-between"><span>SEGMENTATION:</span><span className="text-[#10B981] font-semibold">ISOLATED SUBNETS</span></div>
                <div className="flex justify-between"><span>MFA ENFORCEMENT:</span><span className="text-[#10B981] font-semibold">CHALLENGE ACTIVE</span></div>
                <div className="flex justify-between"><span>IDS / IPS SENSOR:</span><span className="text-[#10B981] font-semibold">TELEMETRY STREAM</span></div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
                  <span className="text-[9px] text-[#565F6B] uppercase block">COMPROMISED</span>
                  <span className="text-lg font-bold text-[#10B981]">{configB.compromised} / {configB.totalNodes}</span>
                </div>
                <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
                  <span className="text-[9px] text-[#565F6B] uppercase block">BLOCKED</span>
                  <span className="text-lg font-bold text-[#10B981]">{configB.threatsBlocked}</span>
                </div>
                <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
                  <span className="text-[9px] text-[#565F6B] uppercase block">EXFILTRATED</span>
                  <span className="text-lg font-bold text-[#10B981]">{configB.dataExfiltrated}</span>
                </div>
              </div>

              {/* Attack Path Visual Representation */}
              <div className="p-2.5 rounded-[4px] bg-[#0A0D11] border border-[#1C222B] text-[10px] space-y-1 mb-3">
                <span className="text-[#565F6B] uppercase block font-semibold">ATTACK PROPAGATION ROUTE:</span>
                <div className="text-sky-300 font-semibold flex items-center flex-wrap gap-1">
                  <span>ATTACKER</span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="text-[#10B981]">[WAF BARRIER: INTERCEPTED]</span>
                  <span className="text-[#565F6B]">&bull; INTERNAL NODES SAFE</span>
                </div>
              </div>

              <p className="text-[11px] text-[#8A929D] leading-relaxed">
                {configB.summary}
              </p>
            </div>

            <button
              onClick={() => {
                onApplyConfig(configB.controls);
                onClose();
              }}
              className="w-full py-1.5 rounded-[4px] bg-[#0F1E2E] hover:bg-[#162B42] border border-sky-500/40 text-sky-200 text-xs font-medium transition-colors"
            >
              APPLY CONFIGURATION B
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1C222B] flex items-center justify-end bg-[#07090C] text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[4px] bg-[#0F1318] hover:bg-[#161C24] border border-[#1C222B] text-[#8A929D] hover:text-[#E8EBEF] transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
