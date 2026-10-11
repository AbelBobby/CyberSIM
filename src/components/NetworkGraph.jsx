import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  {
    id: 'web',
    type: 'custom',
    position: { x: 330, y: 20 },
    data: { label: 'Public Web Portal', icon: 'web', status: 'Online', ip: '192.168.1.10', os: 'Linux / Nginx', vulnerabilities: ['CVE-2023-1234'] }
  },
  {
    id: 'atm',
    type: 'custom',
    position: { x: 580, y: 170 },
    data: { label: 'ATM Gateway', icon: 'atm', status: 'Online', ip: '10.0.5.20', os: 'Windows Server', vulnerabilities: [] }
  },
  {
    id: 'db',
    type: 'custom',
    position: { x: 330, y: 310 },
    data: { label: 'Core Banking DB', icon: 'db', status: 'Online', ip: '10.0.10.50', os: 'Oracle Linux', vulnerabilities: ['Weak Auth'] }
  },
  {
    id: 'swift',
    type: 'custom',
    position: { x: 80, y: 170 },
    data: { label: 'SWIFT Server', icon: 'swift', status: 'Online', ip: '10.0.20.100', os: 'AIX', vulnerabilities: [] }
  }
];

const initialEdges = [
  { id: 'e1', source: 'web', target: 'db', animated: true, style: { stroke: '#00f3ff', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #00f3ff)' } },
  { id: 'e2', source: 'atm', target: 'db', animated: true, style: { stroke: '#00f3ff', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #00f3ff)' } },
  { id: 'e3', source: 'db', target: 'swift', animated: true, style: { stroke: '#00f3ff', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #00f3ff)' } },
];

export default function NetworkGraph({ onNodeSelect, activeControls }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Apply activeControls to node data so CustomNode can read it
  const nodesWithControls = nodes.map(node => ({
    ...node,
    data: { ...node.data, activeControls }
  }));

  // Simulate some attacks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((nds) => nds.map((node) => {
        if (node.id === 'web' && Math.random() > 0.7) {
          return { ...node, data: { ...node.data, status: 'Under Attack' } };
        }
        if (node.id === 'db' && Math.random() > 0.8) {
          return { ...node, data: { ...node.data, status: 'Compromised' } };
        }
        // recover
        if (Math.random() > 0.9) {
          return { ...node, data: { ...node.data, status: 'Online' } };
        }
        return node;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    onNodeSelect(node);
  }, [onNodeSelect]);

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <ReactFlow
        nodes={nodesWithControls}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 1.2 }}
        className="dark"
        colorMode="dark"
      >
        <Controls className="!bg-black/50 !border-green-500/30 !fill-green-500" />
      </ReactFlow>
    </div>
  );
}
