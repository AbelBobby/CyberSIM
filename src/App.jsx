import { useState, useEffect, useCallback } from 'react';
import AtmosphericBackground from './components/AtmosphericBackground';
import TopHUD from './components/TopHUD';
import TelemetryBar from './components/TelemetryBar';
import NetworkPlane3D from './components/NetworkPlane3D';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import EventTimeline from './components/EventTimeline';
import SimulationTimeline from './components/SimulationTimeline';
import ScenarioSetupModal from './components/ScenarioSetupModal';
import SimulationCompleteModal from './components/SimulationCompleteModal';
import DefenseComparisonModal from './components/DefenseComparisonModal';
import { 
  ENVIRONMENTS, 
  ATTACK_TYPES, 
  INITIAL_DEFENSES, 
  calculateThreatScore, 
  ATTACK_PHASES 
} from './services/simulationEngine';

export default function App() {
  // Scenario & Environment State
  const [currentEnvKey, setCurrentEnvKey] = useState('banking');
  const [environment, setEnvironment] = useState(ENVIRONMENTS.banking);
  const [nodes, setNodes] = useState(ENVIRONMENTS.banking.nodes);
  const [edges, setEdges] = useState(ENVIRONMENTS.banking.edges);
  const [selectedNode, setSelectedNode] = useState(null);

  // Active Defensive Controls
  const [activeControls, setActiveControls] = useState(INITIAL_DEFENSES);

  // Simulation Execution State
  const [isRunning, setIsRunning] = useState(true);
  const [simTime, setSimTime] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [activeAttack, setActiveAttack] = useState(ATTACK_TYPES[3]); // cve_exploit default
  const [wsConnected, setWsConnected] = useState(false);

  // Attack Sequence Progression State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentAttackStep, setCurrentAttackStep] = useState(null);
  const [focusedEvent, setFocusedEvent] = useState(null);

  // Modals State
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Live Event Telemetry Stream
  const [events, setEvents] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      type: 'DETECTION',
      sourceNode: 'IDS-SENSOR-01',
      targetNode: 'PERIMETER',
      message: 'Spatial cyber range initialized. 2.5D telemetry plane active.',
      severity: 'info',
    }
  ]);

  // Telemetry Counters
  const [metrics, setMetrics] = useState({
    compromisedCount: 0,
    threatsCount: 1,
    blockedCount: 0,
    latency: '1.8ms'
  });

  // Calculate dynamic Threat Score
  const currentPhaseIndex = Math.min(
    ATTACK_PHASES.length - 1, 
    Math.floor((currentStepIndex / Math.max(1, environment.attackSequence?.length || 1)) * ATTACK_PHASES.length)
  );

  const threatScore = calculateThreatScore({
    nodes,
    activePhaseIndex: currentPhaseIndex,
    activeControls,
    blockedCount: metrics.blockedCount
  });

  // Load new environment
  const handleSelectEnvironment = useCallback((envKey) => {
    const env = ENVIRONMENTS[envKey];
    if (!env) return;
    setCurrentEnvKey(envKey);
    setEnvironment(env);
    setNodes(env.nodes);
    setEdges(env.edges);
    setSelectedNode(null);
    setCurrentStepIndex(0);
    setCurrentAttackStep(null);
    setIsReplayMode(false);
    setIsCompleteModalOpen(false);

    setEvents(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'SYSTEM',
        sourceNode: 'COMMAND',
        targetNode: env.name,
        message: `Topology switched to ${env.name} [${env.scenarioCode}]. Baseline loaded.`,
        severity: 'info'
      },
      ...prev
    ]);
  }, []);

  // WebSocket Connection Support (FastAPI / backend)
  useEffect(() => {
    let ws = null;
    try {
      ws = new WebSocket('ws://localhost:8000/ws');
      ws.onopen = () => {
        setWsConnected(true);
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.event) {
            handleEventGenerated(data.event);
          }
          if (data.nodes) {
            setNodes(data.nodes);
          }
        } catch (e) {
          console.warn('WS parse error:', e);
        }
      };
      ws.onerror = () => setWsConnected(false);
      ws.onclose = () => setWsConnected(false);
    } catch {
      setWsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Event dispatcher
  const handleEventGenerated = useCallback((newEvent) => {
    const eventObj = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString(),
      ...newEvent
    };

    setEvents(prev => [eventObj, ...prev.slice(0, 45)]);

    if (newEvent.type === 'BLOCKED') {
      setMetrics(m => ({ ...m, blockedCount: m.blockedCount + 1 }));
    } else if (newEvent.type === 'EXPLOIT') {
      setMetrics(m => ({ ...m, threatsCount: m.threatsCount + 1 }));
    }
  }, []);

  // Simulation Timer loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSimTime(t => t + 1);
    }, 1000 / simSpeed);

    return () => clearInterval(timer);
  }, [isRunning, simSpeed]);

  // Physical Multi-Step Attack Progression Engine
  useEffect(() => {
    if (!isRunning) return;
    const seq = environment.attackSequence;
    if (!seq || seq.length === 0) return;

    const stepInterval = setInterval(() => {
      if (currentStepIndex >= seq.length) {
        // Attack sequence completed! Open completion summary
        setIsRunning(false);
        setIsCompleteModalOpen(true);
        return;
      }

      const step = seq[currentStepIndex];
      setCurrentAttackStep(step);

      // Check if defensive countermeasure intercepts this step
      const isBlocked = !!(step.blockControl && activeControls[step.blockControl]);

      setTimeout(() => {
        setNodes(currentNodes => {
          return currentNodes.map(node => {
            if (node.id === step.target) {
              if (isBlocked) {
                return { ...node, status: 'Secured' };
              } else {
                return { ...node, status: 'Compromised' };
              }
            }
            return node;
          });
        });

        // Advance to next attack step
        setCurrentStepIndex(idx => idx + 1);
      }, 2200 / simSpeed);

    }, 4000 / simSpeed);

    return () => clearInterval(stepInterval);
  }, [isRunning, currentStepIndex, environment, activeControls, simSpeed]);

  // Update compromised metric
  useEffect(() => {
    const compCount = nodes.filter(n => n.status === 'Compromised').length;
    setMetrics(m => ({ ...m, compromisedCount: compCount }));
  }, [nodes]);

  // Node Quick Actions (Isolate / Patch)
  const handleNodeAction = useCallback((action, targetNode) => {
    if (action === 'isolate') {
      setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, status: 'Offline' } : n));
      handleEventGenerated({
        type: 'DEFENSE',
        sourceNode: 'SOC-ADMIN',
        targetNode: targetNode.label,
        message: `Node ${targetNode.label} (${targetNode.ip}) isolated from subnet routing table.`,
        severity: 'warning'
      });
    } else if (action === 'patch') {
      setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, status: 'Secured', vulnerabilities: [] } : n));
      handleEventGenerated({
        type: 'SECURED',
        sourceNode: 'PATCH-DAEMON',
        targetNode: targetNode.label,
        message: `Zero-day patch deployed to ${targetNode.label}. Vulnerabilities remediated.`,
        severity: 'success'
      });
    }
  }, [handleEventGenerated]);

  // Reset Simulation to baseline
  const handleReset = () => {
    setNodes(environment.nodes);
    setSimTime(0);
    setCurrentStepIndex(0);
    setCurrentAttackStep(null);
    setIsReplayMode(false);
    setIsCompleteModalOpen(false);
    setMetrics({
      compromisedCount: 0,
      threatsCount: 1,
      blockedCount: 0,
      latency: '1.8ms'
    });
    setEvents([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'SYSTEM',
        sourceNode: 'CORE-ENGINE',
        targetNode: 'TOPOLOGY',
        message: 'Simulation reset to baseline clean state.',
        severity: 'info'
      }
    ]);
  };

  // Replay Mode
  const handleReplay = () => {
    handleReset();
    setIsReplayMode(true);
    setIsRunning(true);
  };

  // Step Forward in simulation
  const handleStepForward = () => {
    const seq = environment.attackSequence;
    if (!seq || currentStepIndex >= seq.length) return;

    const step = seq[currentStepIndex];
    setCurrentAttackStep(step);
    const isBlocked = !!(step.blockControl && activeControls[step.blockControl]);

    setNodes(nds => nds.map(node => {
      if (node.id === step.target) {
        return { ...node, status: isBlocked ? 'Secured' : 'Compromised' };
      }
      return node;
    }));

    setCurrentStepIndex(idx => idx + 1);
  };

  // Step Backward in simulation
  const handleStepBackward = () => {
    if (currentStepIndex <= 0) return;
    setCurrentStepIndex(idx => Math.max(0, idx - 1));
    setNodes(environment.nodes);
  };

  return (
    <div className="relative w-screen h-screen bg-[#030405] overflow-hidden text-[#E8EBEF] font-sans selection:bg-sky-500/20">
      {/* 1. Cinematic Atmospheric Background (subtle dark blue-black/graphite) */}
      <AtmosphericBackground />

      {/* 2. Command Center Top HUD Bar */}
      <TopHUD
        environment={environment}
        simTime={simTime}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        speed={simSpeed}
        onChangeSpeed={setSimSpeed}
        onOpenSetup={() => setIsSetupOpen(true)}
        totalEvents={events.length}
        wsConnected={wsConnected}
        activeAttack={activeAttack}
        currentPhaseIndex={currentPhaseIndex}
        threatScore={threatScore}
        isReplayMode={isReplayMode}
        onReplay={handleReplay}
      />

      {/* 3. Floating HUD Telemetry Metrics Strip */}
      <TelemetryBar
        nodesCount={nodes.length}
        activeLinksCount={edges.length}
        compromisedCount={metrics.compromisedCount}
        threatsCount={metrics.threatsCount}
        blockedCount={metrics.blockedCount}
        latency={metrics.latency}
      />

      {/* 4. Centerpiece: Spatial 2.5D Network Plane (Three.js WebGL) */}
      <main className="absolute inset-0 z-10 w-full h-full pt-16 pb-28">
        <NetworkPlane3D
          environment={environment}
          nodes={nodes}
          edges={edges}
          activeControls={activeControls}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          activeAttack={isRunning ? activeAttack : null}
          onEventGenerated={handleEventGenerated}
          focusedEvent={focusedEvent}
          attackStep={currentAttackStep}
        />
      </main>

      {/* 5. Left Floating Glass Inspector Panel (Context-Aware Compact 98px / Expand) */}
      <LeftPanel
        selectedNode={selectedNode}
        edges={edges}
        nodes={nodes}
        events={events}
        onClose={() => setSelectedNode(null)}
        onAction={handleNodeAction}
      />

      {/* 6. Right Floating Glass Defense Controls Panel (Right-side Command Panel) */}
      <RightPanel
        activeControls={activeControls}
        setActiveControls={setActiveControls}
      />

      {/* 7. Simulation Timeline Scrubber */}
      <SimulationTimeline
        simTime={simTime}
        maxTime={90}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onSeek={(targetSec) => setSimTime(Math.round(targetSec))}
        speed={simSpeed}
        onChangeSpeed={setSimSpeed}
        isReplayMode={isReplayMode}
      />

      {/* 8. Bottom Live Telemetry Timeline Strip */}
      <EventTimeline
        events={events}
        selectedNode={selectedNode}
        onEventSelect={(ev) => {
          setFocusedEvent(ev);
          const matchedNode = nodes.find(n => n.label === ev.targetNode || n.id === ev.targetNode);
          if (matchedNode) setSelectedNode(matchedNode);
        }}
      />

      {/* 9. 5-Step Simulation Setup Wizard Modal */}
      <ScenarioSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentEnvKey={currentEnvKey}
        onSelectEnvironment={handleSelectEnvironment}
        currentAttack={activeAttack}
        onSelectAttack={setActiveAttack}
        activeControls={activeControls}
        onToggleControl={(key) => setActiveControls(prev => ({ ...prev, [key]: !prev[key] }))}
        onLaunchSimulation={() => {
          handleReset();
          setIsRunning(true);
        }}
      />

      {/* 10. Simulation Complete Summary Modal */}
      <SimulationCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        environment={environment}
        nodes={nodes}
        metrics={metrics}
        onReplay={handleReplay}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onNewScenario={() => setIsSetupOpen(true)}
      />

      {/* 11. Defense Comparison Modal */}
      <DefenseComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        environment={environment}
        onApplyConfig={(newControls) => {
          setActiveControls(newControls);
          handleReplay();
        }}
      />
    </div>
  );
}
