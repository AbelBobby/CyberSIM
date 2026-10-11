import { useState, useEffect } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

const mockEvents = [
  "DDoS attack detected on Public Web Portal (IP: 192.168.1.10)",
  "Failed SSH login attempt on SWIFT Server (IP: 10.0.20.100)",
  "SQL Injection payload blocked by WAF",
  "Unauthorized access attempt to Core Banking DB",
  "Malware signature detected in ATM Gateway traffic",
  "Anomalous outbound traffic from SWIFT Server",
];

export default function EventLog() {
  const [events, setEvents] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), message: "System initialized. Matrix monitoring active.", type: 'info' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
        const isCritical = randomEvent.includes('detected') || randomEvent.includes('Unauthorized') || randomEvent.includes('Anomalous');
        
        setEvents(prev => {
          const newEvents = [{
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            message: randomEvent,
            type: isCritical ? 'critical' : 'warning'
          }, ...prev];
          
          return newEvents.slice(0, 10); // keep last 10
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-3/4 max-w-4xl hologram-panel rounded-xl p-4 pointer-events-auto"
      style={{ position: 'fixed', bottom: '24px', top: 'auto', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}
    >
      <h3 className="text-sm font-bold text-green-500 mb-2 flex items-center border-b border-green-500/30 pb-2">
        <Activity className="w-4 h-4 mr-2 drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]" />
        Live Event Stream
      </h3>
      
      <div className="overflow-y-auto flex flex-col space-y-2" style={{ maxHeight: '200px' }}>
        {events.map(event => (
          <div key={event.id} className={`flex items-start text-xs p-2 rounded bg-black/60 border-l-2 ${
            event.type === 'critical' ? 'border-red-500 text-red-400' :
            event.type === 'warning' ? 'border-orange-500 text-orange-400' :
            'border-green-500 text-green-400'
          }`}>
            <span className="text-green-800 mr-3 font-mono whitespace-nowrap">[{event.time}]</span>
            {event.type === 'critical' && <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 text-red-500 flex-shrink-0" />}
            <span className="font-mono">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
