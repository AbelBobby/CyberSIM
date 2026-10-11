import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  X 
} from 'lucide-react';

export default function SimulationCompleteModal({
  isOpen,
  onClose,
  environment,
  nodes = [],
  metrics,
  onReplay,
  onOpenCompare,
  onNewScenario
}) {
  if (!isOpen) return null;

  const totalNodes = nodes.length;
  const compromisedCount = nodes.filter(n => n.status === 'Compromised').length;
  const criticalAssets = nodes.filter(n => n.criticality === 'CRITICAL');
  const criticalCompromised = criticalAssets.filter(n => n.status === 'Compromised').length;
  const criticalProtectedPercent = criticalAssets.length > 0 
    ? Math.round(((criticalAssets.length - criticalCompromised) / criticalAssets.length) * 100) 
    : 100;

  const isContained = compromisedCount === 0 || metrics.blockedCount >= 2;
  const dataExfiltratedMB = isContained ? 0 : Math.round(compromisedCount * 140);
  const defenseEffectiveness = Math.round(
    Math.min(100, Math.max(15, (metrics.blockedCount * 22) + (criticalProtectedPercent * 0.5)))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0A0D11] rounded-[6px] border border-[#1C222B] shadow-2xl overflow-hidden text-[#E8EBEF] flex flex-col">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#1C222B] flex items-center justify-between bg-[#07090C]">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-[4px] border flex items-center justify-center ${
              isContained 
                ? 'bg-[#0B251A] text-[#10B981] border-[#10B981]/30' 
                : 'bg-[#2A0C11] text-[#EF4444] border-[#EF4444]/30'
            }`}>
              {isContained ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#E8EBEF]">
                  SIMULATION COMPLETE
                </span>
                <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono font-medium uppercase border ${
                  isContained ? 'bg-[#0B251A] text-[#10B981] border-[#10B981]/30' : 'bg-[#2A0C11] text-[#EF4444] border-[#EF4444]/30'
                }`}>
                  {isContained ? 'THREAT CONTAINED' : 'BREACH DETECTED'}
                </span>
              </div>
              <p className="text-[10px] text-[#8A929D] uppercase mt-0.5">
                {environment.name} &bull; <span className="font-mono text-[#E8EBEF]">{environment.scenarioCode}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-[#8A929D] hover:text-[#E8EBEF] rounded-[4px] hover:bg-[#1C222B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Telemetry Summary Grid */}
        <div className="p-6 space-y-5 font-mono">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-[6px] bg-[#0F1318] border border-[#1C222B]">
              <span className="text-[10px] text-[#8A929D] uppercase block">COMPROMISED</span>
              <span className={`text-xl font-bold mt-1 block ${compromisedCount > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                {compromisedCount.toString().padStart(2, '0')} / {totalNodes.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="p-3 rounded-[6px] bg-[#0F1318] border border-[#1C222B]">
              <span className="text-[10px] text-[#8A929D] uppercase block">THREATS BLOCKED</span>
              <span className="text-xl font-bold mt-1 block text-[#10B981]">
                {metrics.blockedCount.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="p-3 rounded-[6px] bg-[#0F1318] border border-[#1C222B]">
              <span className="text-[10px] text-[#8A929D] uppercase block">DATA EXFILTRATED</span>
              <span className={`text-xl font-bold mt-1 block ${dataExfiltratedMB > 0 ? 'text-[#EF4444]' : 'text-[#8A929D]'}`}>
                {dataExfiltratedMB} MB
              </span>
            </div>

            <div className="p-3 rounded-[6px] bg-[#0F1318] border border-[#1C222B]">
              <span className="text-[10px] text-[#8A929D] uppercase block">DEFENSE EFFICIENCY</span>
              <span className="text-xl font-bold mt-1 block text-sky-400">
                {defenseEffectiveness}%
              </span>
            </div>
          </div>

          {/* Detailed Outcomes */}
          <div className="p-4 rounded-[6px] bg-[#0F1318] border border-[#1C222B] space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#1C222B]">
              <span className="text-[#8A929D]">CRITICAL ASSETS PROTECTED:</span>
              <span className={`font-bold ${criticalProtectedPercent === 100 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                {criticalProtectedPercent}% ({criticalAssets.length - criticalCompromised}/{criticalAssets.length})
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#1C222B]">
              <span className="text-[#8A929D]">DETECTION & MITIGATION LATENCY:</span>
              <span className="text-sky-400 font-bold">{metrics.latency}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-[#8A929D]">PERIMETER CONTAINMENT:</span>
              <span className={`font-bold flex items-center space-x-1 ${isContained ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {isContained ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{isContained ? 'SUCCESSFULLY INTERCEPTED' : 'LATERAL BREACH OCCURRED'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#1C222B] flex items-center justify-between bg-[#07090C] text-xs">
          <button
            onClick={() => {
              onClose();
              onReplay();
            }}
            className="px-3 py-1.5 rounded-[4px] bg-[#0F1318] hover:bg-[#161C24] border border-[#1C222B] text-[#E8EBEF] font-medium transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8A929D]" />
            <span>REPLAY SIMULATION</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCompare();
            }}
            className="px-3 py-1.5 rounded-[4px] bg-[#0F1318] hover:bg-[#161C24] border border-[#1C222B] text-[#E8EBEF] font-medium transition-colors flex items-center space-x-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#8A929D]" />
            <span>COMPARE DEFENSE</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewScenario();
            }}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#0F1E2E] hover:bg-[#162B42] border border-sky-500/40 text-sky-200 font-medium transition-colors flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>NEW SCENARIO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
