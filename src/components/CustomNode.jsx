import { Handle, Position } from '@xyflow/react';
import { Server, Globe, Database, CreditCard, ShieldAlert } from 'lucide-react';

const iconMap = {
  web: Globe,
  atm: CreditCard,
  db: Database,
  swift: Server,
};

export default function CustomNode({ data }) {
  const Icon = iconMap[data.icon] || Server;

  const isCompromised = data.status === 'Compromised';
  const isUnderAttack = data.status === 'Under Attack';

  let statusClass = '';
  let iconColor = 'text-sky-400';

  if (isCompromised) {
    statusClass = 'compromised';
    iconColor = 'text-[#EF4444]';
  } else if (isUnderAttack) {
    statusClass = 'attack';
    iconColor = 'text-[#F59E0B]';
  }

  return (
    <div className={`server-block ${statusClass} flex items-center p-3 w-56 h-20 bg-[#0A0D11] border border-[#1C222B] rounded-[6px] shadow-lg`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-sky-500 !border-[#1C222B]" />

      <div className="mr-3 flex-shrink-0">
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>

      <div className="flex flex-col">
        <span className="text-[#E8EBEF] font-semibold text-sm tracking-wide">{data.label}</span>
        <span className={`text-xs mt-1 font-mono uppercase tracking-widest ${isCompromised ? 'text-[#EF4444]' : isUnderAttack ? 'text-[#F59E0B]' : 'text-sky-400'}`}>
          {data.status}
        </span>
      </div>

      {(isCompromised || isUnderAttack) && (
        <div className="absolute -top-3 -right-3">
          <ShieldAlert className={isCompromised ? 'text-[#EF4444] w-6 h-6' : 'text-[#F59E0B] w-6 h-6'} />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-sky-500 !border-[#1C222B]" />
    </div>
  );
}
