import { 
  ShieldCheck, 
  Shield, 
  Layers, 
  Radio, 
  Terminal, 
  FileCheck, 
  Key, 
  Lock, 
  Activity
} from 'lucide-react';

const DEFENSE_GROUPS = [
  {
    category: 'PERIMETER',
    items: [
      {
        key: 'waf',
        title: 'WAF FILTER',
        desc: 'Layer 7 HTTP/S ingress inspection',
        icon: ShieldCheck,
        tag: 'L7'
      },
      {
        key: 'ids',
        title: 'IDS / IPS',
        desc: 'Threat anomaly detection sensors',
        icon: Radio,
        tag: 'DPI'
      }
    ]
  },
  {
    category: 'NETWORK',
    items: [
      {
        key: 'segmentation',
        title: 'SEGMENTATION',
        desc: 'Zero-trust subnet isolation',
        icon: Layers,
        tag: 'ZONE'
      }
    ]
  },
  {
    category: 'IDENTITY',
    items: [
      {
        key: 'mfa',
        title: 'MFA ENFORCE',
        desc: 'Admin challenge authentication',
        icon: Key,
        tag: 'AUTH'
      },
      {
        key: 'accessControl',
        title: 'ACCESS CONTROL',
        desc: 'Least-privilege RBAC policies',
        icon: Lock,
        tag: 'RBAC'
      }
    ]
  },
  {
    category: 'HOST',
    items: [
      {
        key: 'edr',
        title: 'EDR AGENT',
        desc: 'Endpoint memory heuristics',
        icon: Terminal,
        tag: 'HOST'
      },
      {
        key: 'patching',
        title: 'PATCHING',
        desc: 'Virtual zero-day vulnerability fix',
        icon: FileCheck,
        tag: 'CVE'
      }
    ]
  },
  {
    category: 'TELEMETRY',
    items: [
      {
        key: 'monitoring',
        title: 'DEEP DPI / SENSORS',
        desc: 'Full packet capture validation',
        icon: Activity,
        tag: 'PCAP'
      }
    ]
  }
];

export default function RightPanel({ 
  activeControls, 
  setActiveControls
}) {
  const toggleControl = (key) => {
    setActiveControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Flatten items to compute active count
  const allItems = DEFENSE_GROUPS.flatMap(g => g.items);
  const activeCount = allItems.filter(item => activeControls[item.key]).length;
  const totalCount = allItems.length;
  const readinessPercent = Math.round((activeCount / totalCount) * 100);

  return (
    <aside 
      style={{
        position: 'fixed',
        right: '20px',
        left: 'auto',
        top: '84px',
        bottom: '100px',
        width: 'clamp(270px, 18vw, 320px)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column'
      }}
      className="glass-panel rounded-[6px] p-3.5 pointer-events-auto shadow-xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C222B] pb-2.5 mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-semibold tracking-wider text-[#E8EBEF] uppercase">
            DEFENSIVE CONTROLS
          </h2>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono bg-[#0F1E2E] text-sky-300 border border-sky-500/20 font-medium">
            ACTIVE: {activeCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* Body: Defense Posture & Grouped Controls */}
      <div className="flex-1 flex flex-col overflow-hidden space-y-3 min-h-0">
        {/* Defense Posture Card */}
        <div className="p-2.5 rounded-[4px] bg-[#0A0D11] border border-[#1C222B] flex-shrink-0">
          <div className="flex justify-between items-center text-[10px] mb-1.5">
            <span className="text-[#8A929D] uppercase tracking-wider font-medium">DEFENSE POSTURE</span>
            <span className={`font-mono font-semibold ${
              readinessPercent >= 75 ? 'text-[#10B981]' : readinessPercent >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
            }`}>
              {readinessPercent} / 100
            </span>
          </div>
          
          <div className="w-full h-1 rounded-full bg-[#161C24] overflow-hidden mb-1.5">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                readinessPercent >= 75 
                  ? 'bg-[#10B981]' 
                  : readinessPercent >= 50 
                  ? 'bg-[#F59E0B]' 
                  : 'bg-[#EF4444]'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-[#565F6B]">
            <span>{activeCount} OF {totalCount} ACTIVE</span>
            <span>{readinessPercent >= 75 ? 'OPTIMAL' : readinessPercent >= 50 ? 'MODERATE' : 'AT RISK'}</span>
          </div>
        </div>

        {/* Grouped Controls Scroll Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
          {DEFENSE_GROUPS.map((group) => (
            <div key={group.category} className="space-y-1.5">
              {/* Section Label */}
              <div className="text-[10px] font-semibold text-[#8A929D] tracking-[0.08em] uppercase px-0.5">
                {group.category}
              </div>

              {/* Items in Category */}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isEnabled = !!activeControls[item.key];
                  const Icon = item.icon;

                  return (
                    <div 
                      key={item.key}
                      onClick={() => toggleControl(item.key)}
                      className={`p-2 rounded-[4px] border transition-colors cursor-pointer flex items-center justify-between group select-none ${
                        isEnabled 
                          ? 'bg-[#0F1E2E]/40 border-sky-500/30 hover:border-sky-400/40' 
                          : 'bg-[#0A0D11] border-[#1C222B] hover:border-[#262E3B]'
                      }`}
                    >
                      {/* Left: Icon + Label Stack */}
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${
                          isEnabled 
                            ? 'bg-[#0F1E2E] text-sky-400 border border-sky-500/20' 
                            : 'bg-[#0F1318] text-[#565F6B] border border-[#1C222B]'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        
                        <div className="overflow-hidden">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[11px] font-medium text-[#E8EBEF] tracking-normal truncate">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded-[3px] bg-[#0F1318] text-[#8A929D] border border-[#1C222B]">
                              {item.tag}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8A929D] leading-tight truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      {/* Right: Standardized Toggle (32 x 18px) */}
                      <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                        <span className={`text-[9px] font-mono font-medium ${isEnabled ? 'text-sky-400' : 'text-[#565F6B]'}`}>
                          {isEnabled ? 'ON' : 'OFF'}
                        </span>
                        <div className={`w-8 h-[18px] rounded-full p-0.5 border transition-colors flex items-center ${
                          isEnabled 
                            ? 'bg-[#0F1E2E] border-sky-500/40 justify-end' 
                            : 'bg-[#0A0D11] border-[#1C222B] justify-start'
                        }`}>
                          <div className={`w-3 h-3 rounded-full transition-transform ${
                            isEnabled 
                              ? 'bg-sky-400' 
                              : 'bg-[#565F6B]'
                          }`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
