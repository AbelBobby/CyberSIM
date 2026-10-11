import { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function EventTimeline({ 
  events = [], 
  onEventSelect, 
  selectedNode
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [filterByNode, setFilterByNode] = useState(false);

  const filteredEvents = events.filter((ev) => {
    // If filtering by selected node
    if (filterByNode && selectedNode) {
      const match = ev.sourceNode === selectedNode.label || ev.targetNode === selectedNode.label ||
                    ev.sourceNode === selectedNode.id || ev.targetNode === selectedNode.id;
      if (!match) return false;
    }

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ATTACK') return ev.type === 'EXPLOIT' || ev.type === 'RECON' || ev.type === 'LATERAL';
    if (activeFilter === 'DEFENSE') return ev.type === 'DEFENSE' || ev.type === 'SECURED' || ev.type === 'DETECTION';
    if (activeFilter === 'BLOCKED') return ev.type === 'BLOCKED';
    return true;
  });

  return (
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-30 w-[94vw] max-w-5xl pointer-events-auto">
      <div className="glass-panel rounded-[6px] border border-[#1C222B] shadow-xl overflow-hidden transition-all duration-200">
        {/* Top Header Bar */}
        <div className="px-4 py-1.5 bg-[#07090C] border-b border-[#1C222B] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-xs font-semibold tracking-wider text-[#E8EBEF] uppercase">
                LIVE TELEMETRY STREAM
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="hidden sm:flex items-center space-x-1 pl-3 border-l border-[#1C222B]">
              {['ALL', 'ATTACK', 'DEFENSE', 'BLOCKED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-sans font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#161C24] text-[#E8EBEF] border border-[#262E3B]'
                      : 'text-[#8A929D] hover:text-[#E8EBEF]'
                  }`}
                >
                  {filter}
                </button>
              ))}

              {/* Filter by Selected Node Toggle */}
              {selectedNode && (
                <button
                  onClick={() => setFilterByNode(!filterByNode)}
                  className={`ml-2 px-2 py-0.5 rounded-[4px] text-[10px] font-sans font-medium border flex items-center space-x-1 transition-colors ${
                    filterByNode
                      ? 'bg-[#241608] text-[#F59E0B] border-[#F59E0B]/30'
                      : 'bg-[#0F1318] text-[#8A929D] border-[#1C222B] hover:text-[#E8EBEF]'
                  }`}
                  title="Filter events relating to selected node"
                >
                  <Filter className="w-2.5 h-2.5" />
                  <span>FILTER: {selectedNode.label}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action: Expand/Collapse Drawer */}
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-[#565F6B]">
              {filteredEvents.length} EVENTS
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-[4px] text-[#8A929D] hover:text-[#E8EBEF] hover:bg-[#1C222B]/50 transition-colors flex items-center space-x-1 text-[10px] font-sans"
            >
              <span>{isExpanded ? 'MINIMIZE' : 'EXPAND'}</span>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        {isExpanded ? (
          /* Multi-event Continuous Data Feed */
          <div className="max-h-48 overflow-y-auto bg-[#07090C]/95 divide-y divide-[#1C222B]">
            {filteredEvents.map((ev) => {
              const isCritical = ev.severity === 'critical' || ev.type === 'EXPLOIT';
              const isBlocked = ev.type === 'BLOCKED';
              const isWarning = ev.severity === 'warning';

              let badgeStyle = 'bg-[#0F1E2E] text-sky-400 border-sky-500/20';
              if (isCritical) {
                badgeStyle = 'bg-[#2A0C11] text-[#EF4444] border-[#EF4444]/30';
              } else if (isBlocked) {
                badgeStyle = 'bg-[#0B251A] text-[#10B981] border-[#10B981]/30';
              } else if (isWarning) {
                badgeStyle = 'bg-[#241608] text-[#F59E0B] border-[#F59E0B]/30';
              }

              return (
                <div
                  key={ev.id}
                  onClick={() => onEventSelect && onEventSelect(ev)}
                  className="px-3.5 py-1.5 flex items-center justify-between hover:bg-[#0F1318] cursor-pointer transition-colors text-xs"
                  title="Click to focus camera on route"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden flex-1 mr-2">
                    <span className="w-16 font-mono text-[10px] text-[#565F6B] whitespace-nowrap">
                      {ev.time}
                    </span>
                    <span className={`w-20 px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono text-center font-medium uppercase border flex-shrink-0 ${badgeStyle}`}>
                      {ev.type}
                    </span>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] flex-shrink-0">
                      <span className="text-[#E8EBEF]">{ev.sourceNode}</span>
                      <ArrowRight className="w-3 h-3 text-[#565F6B]" />
                      <span className="text-[#E8EBEF]">{ev.targetNode}</span>
                    </div>
                    <span className="text-[#8A929D] text-xs hidden md:inline truncate ml-2">
                      &bull; {ev.message}
                    </span>
                  </div>

                  <span className={`w-24 text-right text-[10px] font-mono font-medium uppercase whitespace-nowrap ${
                    isCritical ? 'text-[#EF4444]' : isBlocked ? 'text-[#10B981]' : 'text-[#8A929D]'
                  }`}>
                    {isBlocked ? 'BLOCKED' : isCritical ? 'COMPROMISED' : 'TRANSMITTED'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Line Live Ticker */
          <div className="px-3 py-1.5 bg-[#07090C]/95 flex items-center space-x-3 text-xs overflow-x-auto whitespace-nowrap divide-x divide-[#1C222B]">
            {filteredEvents.slice(0, 4).map((ev) => {
              const isCritical = ev.severity === 'critical' || ev.type === 'EXPLOIT';
              const isBlocked = ev.type === 'BLOCKED';

              return (
                <div 
                  key={ev.id}
                  onClick={() => onEventSelect && onEventSelect(ev)}
                  className="flex items-center space-x-2 pr-3 hover:text-[#E8EBEF] cursor-pointer transition-colors"
                  title="Click to focus camera and highlight route"
                >
                  <span className="font-mono text-[10px] text-[#565F6B]">{ev.time}</span>
                  <span className={`px-1 py-0.2 rounded-[3px] text-[9px] font-mono font-medium uppercase ${
                    isCritical ? 'bg-[#2A0C11] text-[#EF4444]' : isBlocked ? 'bg-[#0B251A] text-[#10B981]' : 'bg-[#0F1E2E] text-sky-400'
                  }`}>
                    {ev.type}
                  </span>
                  <span className="font-mono text-[#E8EBEF] text-[11px]">{ev.sourceNode}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#565F6B]" />
                  <span className="font-mono text-[#E8EBEF] text-[11px]">{ev.targetNode}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
