import { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Check, 
  Play, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Building,
  HeartPulse,
  Landmark,
  GraduationCap
} from 'lucide-react';
import { ENVIRONMENTS, ATTACK_TYPES } from '../services/simulationEngine';

const ENV_ICONS = {
  banking: Landmark,
  corporate: Building,
  hospital: HeartPulse,
  library: GraduationCap
};

export default function ScenarioSetupModal({
  isOpen,
  onClose,
  currentEnvKey,
  onSelectEnvironment,
  currentAttack,
  onSelectAttack,
  activeControls,
  onToggleControl,
  onLaunchSimulation
}) {
  const [step, setStep] = useState(1);
  const [selectedEnvKey, setSelectedEnvKey] = useState(currentEnvKey || 'banking');
  const [selectedAttackId, setSelectedAttackId] = useState(currentAttack?.id || 'cve_exploit');
  const [selectedEntryNode, setSelectedEntryNode] = useState('web');
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStage, setInitStage] = useState('');

  if (!isOpen) return null;

  const currentEnv = ENVIRONMENTS[selectedEnvKey];
  const targetNodes = currentEnv?.nodes.filter(n => n.type !== 'attacker') || [];

  const handleLaunch = () => {
    setIsInitializing(true);
    setInitStage('ALLOCATING SPATIAL 2.5D NETWORK PLANE...');

    setTimeout(() => {
      setInitStage('MATERIALIZING INFRASTRUCTURE TOPOLOGY & NODES...');
    }, 500);

    setTimeout(() => {
      setInitStage('ESTABLISHING ENCRYPTED FIBER DATA CONDUITS...');
    }, 1000);

    setTimeout(() => {
      setInitStage('ENGAGING ACTIVE DEFENSE BARRIERS & SENSORS...');
    }, 1500);

    setTimeout(() => {
      setIsInitializing(false);
      onSelectEnvironment(selectedEnvKey);
      const chosenAttack = ATTACK_TYPES.find(a => a.id === selectedAttackId);
      if (chosenAttack) onSelectAttack(chosenAttack);
      onLaunchSimulation();
      onClose();
    }, 2100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0A0D11] rounded-[6px] border border-[#1C222B] shadow-2xl overflow-hidden text-[#E8EBEF] flex flex-col max-h-[90vh]">
        {/* Initialization Cinematic Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 z-50 bg-[#030405]/95 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-slate-700 border-b-slate-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <Shield className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-[#E8EBEF] uppercase mb-2">
              INITIALIZING CYBER RANGE SIMULATION
            </h2>
            <div className="font-mono text-xs text-[#10B981] bg-[#0B251A] px-3 py-1.5 rounded-[4px] border border-[#10B981]/30 tracking-wider">
              {initStage}
            </div>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-[#1C222B] flex items-center justify-between bg-[#07090C]">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-[4px] bg-[#0F1318] border border-[#1C222B] flex items-center justify-center text-sky-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#E8EBEF] tracking-wider uppercase">
                SCENARIO CONFIGURATION WIZARD
              </h2>
              <p className="text-[10px] text-[#8A929D]">
                STAGE {step} OF 4 &bull; {step === 1 ? 'ENVIRONMENT TOPOLOGY' : step === 2 ? 'ATTACK VECTOR' : step === 3 ? 'ENTRY VECTOR & TARGET' : 'DEFENSIVE SYSTEMS'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 text-[#8A929D] hover:text-[#E8EBEF] rounded-[4px] hover:bg-[#1C222B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 border-b border-[#1C222B] text-xs">
          {[
            { num: 1, label: 'ENVIRONMENT' },
            { num: 2, label: 'ATTACK TYPE' },
            { num: 3, label: 'ENTRY NODE' },
            { num: 4, label: 'DEFENSES' }
          ].map(s => (
            <div 
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-[#1C222B] transition-colors flex items-center justify-center space-x-2 ${
                step === s.num 
                  ? 'bg-[#161C24] text-[#E8EBEF] font-medium border-b-2 border-b-sky-400' 
                  : step > s.num 
                  ? 'text-[#8A929D] hover:bg-[#0F1318]' 
                  : 'text-[#565F6B] hover:bg-[#0F1318]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                step === s.num ? 'bg-sky-400 text-black font-bold' : 'bg-[#1C222B] text-[#8A929D]'
              }`}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[360px]">
          {/* STEP 1: Select Environment */}
          {step === 1 && (
            <div>
              <h3 className="text-xs font-semibold text-[#8A929D] uppercase tracking-wider mb-4">
                Select Operational Cyber Battlefield:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(ENVIRONMENTS).map((env) => {
                  const Icon = ENV_ICONS[env.id] || Landmark;
                  const isSelected = selectedEnvKey === env.id;

                  return (
                    <div
                      key={env.id}
                      onClick={() => setSelectedEnvKey(env.id)}
                      className={`p-4 rounded-[6px] border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#0F1E2E]/60 border-sky-400 shadow-md' 
                          : 'bg-[#0F1318] border-[#1C222B] hover:border-[#262E3B]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2.5">
                            <div className={`p-2 rounded-[4px] ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-[#161C24] text-[#8A929D]'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm text-[#E8EBEF]">{env.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                        </div>
                        <p className="text-xs text-[#8A929D] leading-relaxed mb-3">
                          {env.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1C222B] flex items-center justify-between text-[11px] font-mono text-[#565F6B]">
                        <span>{env.nodes.length} INFRASTRUCTURE NODES</span>
                        <span className="text-sky-400 font-semibold">{env.scenarioCode}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Attack Vector */}
          {step === 2 && (
            <div>
              <h3 className="text-xs font-semibold text-[#8A929D] uppercase tracking-wider mb-4">
                Select Primary Threat Vector:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ATTACK_TYPES.map((att) => {
                  const isSelected = selectedAttackId === att.id;

                  return (
                    <div
                      key={att.id}
                      onClick={() => setSelectedAttackId(att.id)}
                      className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex items-start justify-between ${
                        isSelected 
                          ? 'bg-[#2A0C11] border-[#EF4444] shadow-md' 
                          : 'bg-[#0F1318] border-[#1C222B] hover:border-[#262E3B]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-red-300' : 'text-[#E8EBEF]'}`}>
                            {att.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[3px] bg-[#2A0C11] text-[#EF4444] border border-[#EF4444]/30">
                            {att.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A929D] max-w-sm">
                          {att.desc}
                        </p>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-[#EF4444] mt-1 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Select Entry Node */}
          {step === 3 && (
            <div>
              <h3 className="text-xs font-semibold text-[#8A929D] uppercase tracking-wider mb-4">
                Select Initial Exploitation Target / Entry Point:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {targetNodes.map((node) => {
                  const isSelected = selectedEntryNode === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedEntryNode(node.id)}
                      className={`p-3.5 rounded-[6px] border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#241608] border-[#F59E0B] shadow-md' 
                          : 'bg-[#0F1318] border-[#1C222B] hover:border-[#262E3B]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-xs text-[#E8EBEF]">{node.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      </div>
                      <div className="text-[10px] font-mono text-sky-400 mb-1">{node.ip}</div>
                      <div className="text-[10px] font-mono text-[#8A929D] uppercase">{node.role}</div>
                      <div className="mt-2 text-[9px] text-[#EF4444] font-mono">
                        {node.vulnerabilities.length > 0 ? node.vulnerabilities[0] : 'Hardened Asset'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Configure Defenses */}
          {step === 4 && (
            <div>
              <h3 className="text-xs font-semibold text-[#8A929D] uppercase tracking-wider mb-4">
                Configure Active Defense Countermeasures:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'waf', label: 'WAF Filter' },
                  { key: 'segmentation', label: 'Network Segmentation' },
                  { key: 'mfa', label: 'MFA Enforcement' },
                  { key: 'ids', label: 'IDS / IPS Engine' },
                  { key: 'edr', label: 'EDR Endpoint Agent' },
                  { key: 'patching', label: 'Automated Patching' },
                  { key: 'accessControl', label: 'Zero Trust Access' },
                  { key: 'monitoring', label: 'Deep Packet DPI' },
                ].map((item) => {
                  const isEnabled = !!activeControls[item.key];

                  return (
                    <div
                      key={item.key}
                      onClick={() => onToggleControl(item.key)}
                      className={`p-3 rounded-[6px] border transition-all cursor-pointer flex flex-col justify-between ${
                        isEnabled 
                          ? 'bg-[#0F1E2E]/60 border-sky-400 shadow-md' 
                          : 'bg-[#0F1318] border-[#1C222B] hover:border-[#262E3B] opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-xs text-[#E8EBEF]">{item.label}</span>
                        <div className={`w-3.5 h-3.5 rounded-full ${isEnabled ? 'bg-sky-400' : 'bg-[#262E3B]'}`} />
                      </div>
                      <span className={`text-[10px] font-mono font-semibold uppercase ${isEnabled ? 'text-sky-300' : 'text-[#565F6B]'}`}>
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#1C222B] flex items-center justify-between bg-[#07090C]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3 py-1.5 rounded-[4px] text-xs font-medium text-[#8A929D] hover:text-[#E8EBEF] border border-[#1C222B] hover:bg-[#161C24] transition-colors flex items-center space-x-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREVIOUS</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-3.5 py-1.5 rounded-[4px] text-xs font-medium text-[#E8EBEF] bg-[#0F1E2E] hover:bg-[#162B42] border border-sky-500/30 transition-colors flex items-center space-x-1.5"
            >
              <span>CONTINUE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              className="px-4 py-1.5 rounded-[4px] text-xs font-medium text-sky-200 bg-[#0F1E2E] hover:bg-[#162B42] border border-sky-500/40 transition-colors flex items-center space-x-2 uppercase tracking-wide"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>LAUNCH SIMULATION</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
