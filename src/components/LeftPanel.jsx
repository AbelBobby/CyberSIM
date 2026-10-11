import { 
  Server, 
  Database, 
  Globe, 
  CreditCard, 
  Terminal, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Network, 
  Radio, 
  X, 
  ArrowDownLeft,
  ArrowUpRight,
  Flame,
  Diamond
} from 'lucide-react';

const NODE_ICONS = {
  web: Globe,
  gateway: CreditCard,
  db: Database,
  swift: Server,
  workstation: Terminal,
  vault: Lock,
  attacker: Flame
};

export default function LeftPanel({ selectedNode, edges = [], nodes = [], events = [], onClose, onAction }) {
  // Standby State: Compact context-aware status strip
  if (!selectedNode) {
    return (
      <aside 
        style={{
          position: 'fixed',
          left: '20px',
          right: 'auto',
          top: '84px',
          width: 'clamp(260px, 18vw, 300px)',
          height: '98px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        className="glass-panel rounded-[6px] p-3 text-[#8A929D] pointer-events-auto shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[#1C222B] pb-1.5">
          <div className="flex items-center space-x-2">
            <Network className="w-3.5 h-3.5 text-sky-400" />
            <h2 className="text-xs font-semibold tracking-wider text-[#E8EBEF] uppercase">
              INFRASTRUCTURE INSPECTOR
            </h2>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </div>
        
        <div className="flex items-center space-x-2.5 py-1">
          <div className="w-7 h-7 rounded-[4px] bg-[#0F1318] border border-[#1C222B] flex items-center justify-center flex-shrink-0 text-sky-400">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-medium text-[#E8EBEF] truncate">
              STANDBY &bull; AWAITING SELECTION
            </div>
            <div className="text-[10px] text-[#8A929D] truncate">
              Click any 3D node to inspect telemetry
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const Icon = NODE_ICONS[selectedNode.type] || Server;
  const isCompromised = selectedNode.status === 'Compromised';
  const isUnderAttack = selectedNode.status === 'Under Attack';

  // Compute Inbound and Outbound connections
  const inboundEdges = edges.filter(e => e.target === selectedNode.id);
  const outboundEdges = edges.filter(e => e.source === selectedNode.id);

  const inboundLabels = inboundEdges.map(e => {
    const srcNode = nodes.find(n => n.id === e.source);
    return srcNode ? srcNode.label : e.source;
  });

  const outboundLabels = outboundEdges.map(e => {
    const tgtNode = nodes.find(n => n.id === e.target);
    return tgtNode ? tgtNode.label : e.target;
  });

  // Recent events involving this node
  const recentEventsForNode = events.filter(
    ev => ev.sourceNode === selectedNode.label || ev.targetNode === selectedNode.label ||
          ev.sourceNode === selectedNode.id || ev.targetNode === selectedNode.id
  );

  // Criticality marker
  const criticality = selectedNode.criticality || 'MEDIUM';
  let criticalityColor = 'text-sky-400 bg-sky-950/30 border-sky-500/20';
  if (criticality === 'CRITICAL') {
    criticalityColor = 'text-[#EF4444] bg-[#2A0C11] border-[#EF4444]/30';
  } else if (criticality === 'HIGH') {
    criticalityColor = 'text-[#F59E0B] bg-[#241608] border-[#F59E0B]/30';
  }

  return (
    <aside 
      style={{
        position: 'fixed',
        left: '20px',
        right: 'auto',
        top: '84px',
        width: 'clamp(270px, 18vw, 320px)',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column'
      }}
      className={`glass-panel rounded-[6px] p-3.5 pointer-events-auto shadow-xl ${
        isCompromised ? 'glass-panel-danger' : isUnderAttack ? 'glass-panel-warning' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C222B] pb-2.5 mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className={`w-8 h-8 rounded-[4px] border flex items-center justify-center flex-shrink-0 ${
            isCompromised 
              ? 'bg-[#2A0C11] text-[#EF4444] border-[#EF4444]/30' 
              : isUnderAttack 
              ? 'bg-[#241608] text-[#F59E0B] border-[#F59E0B]/30' 
              : 'bg-[#0F1318] text-sky-400 border-[#1C222B]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-semibold text-[#E8EBEF] truncate">
              {selectedNode.label}
            </h2>
            <div className="flex items-center space-x-1.5 text-[10px] text-[#8A929D]">
              <span className="uppercase">{selectedNode.role}</span>
              <span>&bull;</span>
              <span className="font-mono text-sky-400">{selectedNode.ip}</span>
            </div>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 text-[#8A929D] hover:text-[#E8EBEF] rounded-[4px] hover:bg-[#1C222B] transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Primary Telemetry Grid */}
      <div className="space-y-2.5 text-xs">
        {/* Status & Criticality */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider block">STATUS</span>
            <span className={`font-mono text-xs font-semibold mt-0.5 inline-flex items-center space-x-1.5 ${
              isCompromised ? 'text-[#EF4444]' : isUnderAttack ? 'text-[#F59E0B]' : 'text-sky-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isCompromised ? 'bg-[#EF4444]' : isUnderAttack ? 'bg-[#F59E0B]' : 'bg-sky-400'
              }`} />
              <span>{selectedNode.status.toUpperCase()}</span>
            </span>
          </div>

          <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider block">CRITICALITY</span>
            <span className={`font-mono mt-0.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[3px] border text-[10px] font-medium ${criticalityColor}`}>
              <Diamond className="w-2.5 h-2.5 fill-current" />
              <span>{criticality}</span>
            </span>
          </div>
        </div>

        {/* Security Posture & Current Threat */}
        <div className="p-2.5 rounded-[4px] bg-[#0A0D11] border border-[#1C222B] space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">POSTURE</span>
            <span className={`font-mono text-xs font-medium ${isCompromised ? 'text-[#EF4444]' : isUnderAttack ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              {selectedNode.threatLevel || 'NORMAL'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">CURRENT THREAT</span>
            <span className={`text-xs ${isCompromised ? 'text-[#EF4444] font-medium' : 'text-[#E8EBEF]'}`}>
              {isCompromised ? 'ACTIVE COMPROMISE' : isUnderAttack ? 'EXPLOIT IN FLIGHT' : 'NONE DETECTED'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider">EVENTS</span>
            <span className="font-mono text-xs text-[#E8EBEF]">
              {recentEventsForNode.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Inbound & Outbound Connections */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {/* Inbound */}
          <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
            <span className="text-[#8A929D] uppercase font-medium tracking-wider flex items-center space-x-1 mb-1">
              <ArrowDownLeft className="w-3 h-3 text-sky-400" />
              <span>INBOUND ({inboundLabels.length})</span>
            </span>
            {inboundLabels.length > 0 ? (
              <div className="space-y-0.5">
                {inboundLabels.slice(0, 2).map((lbl, idx) => (
                  <div key={idx} className="text-[#E8EBEF] truncate font-mono">&bull; {lbl}</div>
                ))}
              </div>
            ) : (
              <span className="text-[#565F6B]">None</span>
            )}
          </div>

          {/* Outbound */}
          <div className="p-2 rounded-[4px] bg-[#0A0D11] border border-[#1C222B]">
            <span className="text-[#8A929D] uppercase font-medium tracking-wider flex items-center space-x-1 mb-1">
              <ArrowUpRight className="w-3 h-3 text-sky-400" />
              <span>OUTBOUND ({outboundLabels.length})</span>
            </span>
            {outboundLabels.length > 0 ? (
              <div className="space-y-0.5">
                {outboundLabels.slice(0, 2).map((lbl, idx) => (
                  <div key={idx} className="text-[#E8EBEF] truncate font-mono">&bull; {lbl}</div>
                ))}
              </div>
            ) : (
              <span className="text-[#565F6B]">Terminal</span>
            )}
          </div>
        </div>

        {/* Detected CVEs */}
        {selectedNode.vulnerabilities && selectedNode.vulnerabilities.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-[#8A929D] uppercase tracking-wider block mb-1 flex items-center justify-between">
              <span>CVE VULNERABILITIES</span>
              <span className="text-[#EF4444] font-mono">{selectedNode.vulnerabilities.length}</span>
            </span>
            <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
              {selectedNode.vulnerabilities.map((vuln, i) => (
                <div key={i} className="text-[10px] p-1.5 rounded-[4px] bg-[#2A0C11] border border-[#EF4444]/20 text-[#EF4444] flex items-center space-x-1.5">
                  <ShieldAlert className="w-3 h-3 text-[#EF4444] flex-shrink-0" />
                  <span className="truncate font-mono">{vuln}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Mitigation Actions */}
        <div className="pt-2 border-t border-[#1C222B] grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction && onAction('isolate', selectedNode)}
            className="py-1.5 px-2 rounded-[4px] bg-[#2A0C11] hover:bg-[#3D1219] border border-[#EF4444]/40 text-[#EF4444] font-medium text-[11px] flex items-center justify-center space-x-1 transition-colors"
            title="Quarantine node from internal routing"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>ISOLATE</span>
          </button>

          <button
            onClick={() => onAction && onAction('patch', selectedNode)}
            className="py-1.5 px-2 rounded-[4px] bg-[#0F1E2E] hover:bg-[#162B42] border border-[#38BDF8]/40 text-[#38BDF8] font-medium text-[11px] flex items-center justify-center space-x-1 transition-colors"
            title="Deploy automated virtual zero-day patch"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>PATCH</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
