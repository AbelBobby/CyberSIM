import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Server, 
  Database, 
  Globe, 
  CreditCard, 
  Terminal, 
  Lock, 
  Zap, 
  AlertTriangle,
  Diamond,
  Compass
} from 'lucide-react';

const NODE_ICONS = {
  web: Globe,
  gateway: CreditCard,
  db: Database,
  swift: Server,
  workstation: Terminal,
  attacker: SkullIcon,
  vault: Lock
};

function SkullIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="1"/>
      <circle cx="15" cy="12" r="1"/>
      <path d="M8 20v2h8v-2"/>
      <path d="m12.5 17-.5-1-.5 1h1z"/>
      <path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/>
    </svg>
  );
}

export default function NetworkPlane3D({
  environment,
  nodes,
  edges,
  activeControls,
  selectedNode,
  onNodeSelect,
  onEventGenerated,
  focusedEvent,
  attackStep, // current active attack step from sequence
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const nodeMeshesRef = useRef(new Map());
  const edgeMeshesRef = useRef(new Map());
  const barriersRef = useRef(new Map());
  const packetParticlesRef = useRef([]);
  const rippleWavesRef = useRef([]);

  // Screen coordinate projections for HTML node badges
  const [projectedNodes, setProjectedNodes] = useState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Active attack propagation focus state
  const activeFocusEdgeRef = useRef(null);
  const [criticalAssetWarning, setCriticalAssetWarning] = useState(null);

  // Orbit / Camera drag state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraOrbitRef = useRef({
    theta: 0, // horizontal orbit angle
    phi: Math.PI / 5.2, // ~35 degrees elevation angle
    radius: 960,
    target: new THREE.Vector3(0, 0, 40),
    targetLookAt: new THREE.Vector3(0, 0, 40)
  });

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene with Gravity Near-Black Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030405, 0.00065);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 10, 4000);
    cameraRef.current = camera;
    updateCameraPosition();

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Gravity Restrained Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x1A202A, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xE8EBEF, 1.8);
    keyLight.position.set(300, 600, 400);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8A929D, 1.0);
    rimLight.position.set(-300, 400, -300);
    scene.add(rimLight);

    const attackGlowLight = new THREE.PointLight(0xEF4444, 1.8, 600);
    attackGlowLight.position.set(0, 80, -380);
    scene.add(attackGlowLight);

    // Build Floor Grid & Zone Planes
    buildFloorAndZones(scene, environment, activeControls);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation towards target
      cameraOrbitRef.current.target.lerp(cameraOrbitRef.current.targetLookAt, 0.08);
      updateCameraPosition();

      // Animate Nodes (hover floating, status glow, core rotations, focus dimming)
      nodeMeshesRef.current.forEach((meshData, nodeId) => {
        const { group, rotators, glowRing, floorGlow, status, baseElevation, defenseShield } = meshData;
        
        // Gentle breathing float
        const floatOffset = Math.sin(elapsedTime * 2 + nodeId.charCodeAt(0)) * 2.5;
        group.position.y = baseElevation + floatOffset;

        // Rotate animated core elements
        rotators.forEach((rot, idx) => {
          rot.rotation.y += (idx % 2 === 0 ? 0.015 : -0.012);
        });

        // Rotate MFA / Defense shield if present
        if (defenseShield) {
          defenseShield.rotation.y += 0.02;
          defenseShield.rotation.z += 0.01;
        }

        // Pulse glow for Under Attack / Compromised
        if (glowRing) {
          if (status === 'Compromised') {
            glowRing.material.opacity = 0.4 + Math.sin(elapsedTime * 6) * 0.3;
            glowRing.scale.setScalar(1 + Math.sin(elapsedTime * 5) * 0.08);
          } else if (status === 'Under Attack') {
            glowRing.material.opacity = 0.3 + Math.sin(elapsedTime * 4) * 0.2;
          } else {
            glowRing.material.opacity = 0.15 + Math.sin(elapsedTime * 2) * 0.08;
          }
        }

        if (floorGlow) {
          const glowScale = status === 'Compromised' ? 1.2 + Math.sin(elapsedTime * 5) * 0.15 : 1.0;
          floorGlow.scale.set(glowScale, glowScale, 1);
        }

        // Attack Path Focus Dimming: If an active attack path is focused, dim unrelated nodes
        const activeEdge = activeFocusEdgeRef.current;
        if (activeEdge) {
          const isPartOfAttack = (nodeId === activeEdge.source || nodeId === activeEdge.target);
          const targetOpacity = isPartOfAttack ? 1.0 : 0.35;
          group.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1);
            }
          });
        }
      });

      // Animate Packets along links
      updatePackets(elapsedTime, delta);

      // Animate Ripple shockwaves
      updateRipples(delta);

      // Render Scene
      renderer.render(scene, camera);

      // Project 3D nodes to 2D viewport coordinates for sharp HTML billboards
      projectNodesToScreen();
    }

    animate();

    function handleResize() {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Floor & Zones when environment or segmentation defense changes
  useEffect(() => {
    if (!sceneRef.current) return;
    buildFloorAndZones(sceneRef.current, environment, activeControls);
  }, [environment, activeControls.segmentation]);

  // Update Nodes in 3D Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    nodeMeshesRef.current.forEach((data) => {
      scene.remove(data.group);
      scene.remove(data.floorAnchor);
    });
    nodeMeshesRef.current.clear();

    nodes.forEach((node) => {
      const node3D = createNode3DObject(node, activeControls);
      scene.add(node3D.group);
      scene.add(node3D.floorAnchor);
      nodeMeshesRef.current.set(node.id, node3D);
    });
  }, [nodes, activeControls]);

  // Update Edges & Defensive Barriers in 3D Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    edgeMeshesRef.current.forEach((data) => scene.remove(data.group));
    edgeMeshesRef.current.clear();
    barriersRef.current.forEach((mesh) => scene.remove(mesh));
    barriersRef.current.clear();

    const nodePosMap = new Map();
    nodes.forEach(n => nodePosMap.set(n.id, n.pos));

    edges.forEach((edge) => {
      const sourcePos = nodePosMap.get(edge.source);
      const targetPos = nodePosMap.get(edge.target);
      if (!sourcePos || !targetPos) return;

      const edgeGroup = new THREE.Group();

      const p1 = new THREE.Vector3(...sourcePos);
      const p2 = new THREE.Vector3(...targetPos);
      
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 18;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(32);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const isAttackEdge = (edge.source === 'attacker' || edge.status === 'attack');
      const coreColor = isAttackEdge ? 0xEF4444 : 0x475569;
      const coreMaterial = new THREE.LineBasicMaterial({
        color: coreColor,
        linewidth: 1.5,
        transparent: true,
        opacity: isAttackEdge ? 0.95 : 0.55
      });
      const coreLine = new THREE.Line(geometry, coreMaterial);
      edgeGroup.add(coreLine);

      const tubeGeo = new THREE.TubeGeometry(curve, 32, 1.2, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: isAttackEdge ? 0.25 : 0.1,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      edgeGroup.add(tubeMesh);

      scene.add(edgeGroup);
      edgeMeshesRef.current.set(edge.id, { group: edgeGroup, curve, p1, p2, mid, coreLine, tubeMesh });

      // Check for defensive barriers (WAF on Ingress, Segmentation on Subnets)
      const hasWafBarrier = activeControls.waf && (edge.id === 'e-att-web' || edge.target === 'web' || edge.target === 'portal' || edge.target === 'catalog' || edge.target === 'mail');
      const hasSegmentationBarrier = activeControls.segmentation && (edge.target === 'db' || edge.target === 'swift' || edge.target === 'pacs' || edge.target === 'fileserver' || edge.target === 'archive_db');

      if (hasWafBarrier || hasSegmentationBarrier) {
        const barrierGeo = new THREE.PlaneGeometry(36, 42);
        const barrierMat = new THREE.MeshBasicMaterial({
          color: 0x38BDF8,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
        barrierMesh.position.copy(mid);
        barrierMesh.lookAt(p1);
        barrierMesh.position.y += 6;

        const wireGeo = new THREE.EdgesGeometry(barrierGeo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, linewidth: 1.5 });
        const wireLines = new THREE.LineSegments(wireGeo, wireMat);
        barrierMesh.add(wireLines);

        scene.add(barrierMesh);
        barriersRef.current.set(edge.id, barrierMesh);
      }
    });
  }, [edges, nodes, activeControls]);

  // Camera focus on focused event (when clicked from timeline)
  useEffect(() => {
    if (!focusedEvent) return;
    const matchedNode = nodes.find(n => n.label === focusedEvent.targetNode || n.id === focusedEvent.targetNode);
    if (matchedNode) {
      focusOnNode(matchedNode.id);
    }
  }, [focusedEvent, nodes]);

  // Physical Attack Propagation Step
  useEffect(() => {
    if (!attackStep) return;

    // Set active attack path for cinematic focus
    activeFocusEdgeRef.current = { source: attackStep.source, target: attackStep.target };

    // Check if target is a critical asset
    const targetNode = nodes.find(n => n.id === attackStep.target);
    if (targetNode && targetNode.criticality === 'CRITICAL') {
      setCriticalAssetWarning(targetNode.label);
      setTimeout(() => setCriticalAssetWarning(null), 3500);
    }

    // Launch physical packet along the connection
    launchPhysicalAttackPacket(attackStep);

    // Smoothly shift camera toward target
    if (targetNode) {
      cameraOrbitRef.current.targetLookAt.set(targetNode.pos[0] * 0.4, 0, targetNode.pos[2] * 0.4);
    }

    const resetTimer = setTimeout(() => {
      activeFocusEdgeRef.current = null;
      cameraOrbitRef.current.targetLookAt.set(0, 0, 40);
    }, 2800);

    return () => clearTimeout(resetTimer);
  }, [attackStep]);

  // Launch physical attack packet
  const launchPhysicalAttackPacket = (step) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    const edgeData = edgeMeshesRef.current.get(step.edgeId);
    if (!edgeData) return;

    // Check if defense blocks this step
    const isBlocked = !!(step.blockControl && activeControls[step.blockControl]);

    // Create glowing attack packet
    const packetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xEF4444 })
    );
    scene.add(packetMesh);

    // Outer aura
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xEF4444, transparent: true, opacity: 0.35 })
    );
    packetMesh.add(glowMesh);

    packetParticlesRef.current.push({
      mesh: packetMesh,
      curve: edgeData.curve,
      progress: 0,
      speed: 0.48,
      isAttack: true,
      isBlocked,
      edgeKey: step.edgeId,
      stepName: step.name,
      targetNodeId: step.target,
      sourceNodeId: step.source,
      blockControl: step.blockControl
    });
  };

  // Ambient normal data packets
  useEffect(() => {
    const interval = setInterval(() => {
      if (!sceneRef.current) return;
      const edgeKeys = Array.from(edgeMeshesRef.current.keys()).filter(k => !k.includes('att'));
      if (edgeKeys.length === 0) return;

      const randomKey = edgeKeys[Math.floor(Math.random() * edgeKeys.length)];
      const edgeData = edgeMeshesRef.current.get(randomKey);
      if (!edgeData) return;

      const packetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xE8EBEF })
      );
      sceneRef.current.add(packetMesh);

      packetParticlesRef.current.push({
        mesh: packetMesh,
        curve: edgeData.curve,
        progress: 0,
        speed: 0.6 + Math.random() * 0.25,
        isAttack: false,
        isBlocked: false,
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  function updatePackets(elapsedTime, delta) {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    for (let i = packetParticlesRef.current.length - 1; i >= 0; i--) {
      const p = packetParticlesRef.current[i];
      p.progress += p.speed * delta;

      // Defensive Interception at midway (0.5 progress)
      if (p.isBlocked && p.progress >= 0.5) {
        const barrierPos = p.curve.getPoint(0.5);
        
        // Trigger amber interception flash & shockwave
        triggerShockwave(barrierPos, 0xF59E0B, 30);

        // Flash barrier mesh
        const barrier = barriersRef.current.get(p.edgeKey);
        if (barrier) {
          barrier.material.opacity = 0.9;
          setTimeout(() => { if (barrier.material) barrier.material.opacity = 0.5; }, 400);
        }

        if (onEventGenerated) {
          onEventGenerated({
            type: 'BLOCKED',
            sourceNode: p.sourceNodeId?.toUpperCase() || 'ADVERSARY',
            targetNode: p.targetNodeId?.toUpperCase() || 'DEFENSE',
            message: `Defensive countermeasure [${p.blockControl?.toUpperCase()}] intercepted ${p.stepName || 'attack payload'} on conduit ${p.edgeKey}.`,
            severity: 'success'
          });
        }

        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        packetParticlesRef.current.splice(i, 1);
        continue;
      }

      // Reached destination target node
      if (p.progress >= 1.0) {
        const endPos = p.curve.getPoint(1.0);
        if (p.isAttack) {
          // Trigger crimson node flash & shockwave
          triggerShockwave(endPos, 0xEF4444, 44);

          if (onEventGenerated) {
            onEventGenerated({
              type: 'EXPLOIT',
              sourceNode: p.sourceNodeId?.toUpperCase() || 'ADVERSARY',
              targetNode: p.targetNodeId?.toUpperCase() || 'TARGET',
              message: `Exploit successfully executed on ${p.targetNodeId}. Perimeter breach confirmed.`,
              severity: 'critical'
            });
          }
        }
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        packetParticlesRef.current.splice(i, 1);
      } else {
        const point = p.curve.getPoint(p.progress);
        p.mesh.position.copy(point);
      }
    }
  }

  function triggerShockwave(position, colorHex, maxRadius) {
    if (!sceneRef.current) return;
    const ringGeo = new THREE.RingGeometry(1, 3.0, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(position);
    ringMesh.rotation.x = -Math.PI / 2;
    sceneRef.current.add(ringMesh);

    rippleWavesRef.current.push({
      mesh: ringMesh,
      radius: 3,
      maxRadius,
      opacity: 0.9
    });
  }

  function updateRipples(delta) {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    for (let i = rippleWavesRef.current.length - 1; i >= 0; i--) {
      const rip = rippleWavesRef.current[i];
      rip.radius += 75 * delta;
      rip.opacity -= 1.6 * delta;

      if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
        scene.remove(rip.mesh);
        rip.mesh.geometry.dispose();
        rip.mesh.material.dispose();
        rippleWavesRef.current.splice(i, 1);
      } else {
        const s = rip.radius / 3;
        rip.mesh.scale.set(s, s, 1);
        rip.mesh.material.opacity = Math.max(rip.opacity, 0);
      }
    }
  }

  // Project 3D nodes into 2D viewport coordinates for HTML billboards
  const projectNodesToScreen = useCallback(() => {
    if (!cameraRef.current || !mountRef.current) return;
    const camera = cameraRef.current;
    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const projected = nodes.map((node) => {
      const pos3D = new THREE.Vector3(...node.pos);
      pos3D.y += 46;
      pos3D.project(camera);

      const x = (pos3D.x * 0.5 + 0.5) * w;
      const y = (-(pos3D.y * 0.5) + 0.5) * h;
      const isVisible = pos3D.z < 1.0;

      return {
        ...node,
        screenX: Math.round(x),
        screenY: Math.round(y),
        isVisible,
      };
    });

    setProjectedNodes(projected);
  }, [nodes]);

  function updateCameraPosition() {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    const { theta, phi, radius, target } = cameraOrbitRef.current;

    cam.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cam.position.y = target.y + radius * Math.cos(phi);
    cam.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cam.lookAt(target);
  }

  const focusOnNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    cameraOrbitRef.current.targetLookAt.set(node.pos[0] * 0.5, 0, node.pos[2] * 0.5);
  }, [nodes]);

  const resetCameraView = () => {
    cameraOrbitRef.current.theta = 0;
    cameraOrbitRef.current.phi = Math.PI / 5.2;
    cameraOrbitRef.current.radius = 960;
    cameraOrbitRef.current.targetLookAt.set(0, 0, 40);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (e.buttons === 1) {
      cameraOrbitRef.current.theta -= deltaX * 0.004;
      cameraOrbitRef.current.phi = Math.max(
        Math.PI / 8,
        Math.min(Math.PI / 3.2, cameraOrbitRef.current.phi - deltaY * 0.003)
      );
    } else if (e.buttons === 2) {
      const panSpeed = 0.6;
      cameraOrbitRef.current.target.x -= deltaX * panSpeed;
      cameraOrbitRef.current.target.z -= deltaY * panSpeed;
      cameraOrbitRef.current.targetLookAt.copy(cameraOrbitRef.current.target);
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    cameraOrbitRef.current.radius = Math.max(
      450,
      Math.min(1300, cameraOrbitRef.current.radius + e.deltaY * 0.8)
    );
  };

  return (
    <div 
      className="relative w-full h-full select-none overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Critical Asset Warning Banner */}
      {criticalAssetWarning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-[6px] bg-[#2A0C11] border border-[#EF4444]/40 text-[#EF4444] text-xs shadow-lg backdrop-blur-md">
            <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="font-medium tracking-wide uppercase">CRITICAL ASSET AT RISK: {criticalAssetWarning}</span>
          </div>
        </div>
      )}

      {/* Floating 2.5D Node Badges (HTML Billboards) */}
      <div className="absolute inset-0 pointer-events-none">
        {projectedNodes.map((node) => {
          if (!node.isVisible) return null;
          const Icon = NODE_ICONS[node.type] || Server;
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isCompromised = node.status === 'Compromised';
          const isUnderAttack = node.status === 'Under Attack';
          const isSecured = node.status === 'Secured';
          const isAttacker = node.type === 'attacker';
          const isCritical = node.criticality === 'CRITICAL';

          let statusBg = 'border-[#1C222B] bg-[#0A0D11]/95 text-[#E8EBEF]';
          let badgeColor = 'bg-[#0F1318] text-[#8A929D] border-[#1C222B]';
          let glowClass = 'shadow-md';

          if (isCompromised) {
            statusBg = 'border-[#EF4444]/40 bg-[#2A0C11]/95 text-red-200';
            badgeColor = 'bg-[#2A0C11] text-[#EF4444] border-[#EF4444]/30';
            glowClass = 'shadow-[0_4px_16px_rgba(239,68,68,0.25)]';
          } else if (isUnderAttack) {
            statusBg = 'border-[#F59E0B]/40 bg-[#241608]/95 text-amber-200';
            badgeColor = 'bg-[#241608] text-[#F59E0B] border-[#F59E0B]/30';
            glowClass = 'shadow-[0_4px_16px_rgba(245,158,11,0.2)]';
          } else if (isSecured) {
            statusBg = 'border-[#10B981]/30 bg-[#0B251A]/95 text-emerald-200';
            badgeColor = 'bg-[#0B251A] text-[#10B981] border-[#10B981]/30';
            glowClass = 'shadow-md';
          } else if (isAttacker) {
            statusBg = 'border-[#EF4444]/30 bg-[#2A0C11]/95 text-[#EF4444]';
            badgeColor = 'bg-[#2A0C11] text-[#EF4444] border-[#EF4444]/30';
            glowClass = 'shadow-md';
          }

          if (isSelected) {
            glowClass += ' ring-1 ring-sky-400 border-sky-400/80 scale-105';
          }

          return (
            <div
              key={node.id}
              className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-transform duration-200 ${
                isHovered ? 'scale-105 z-30' : 'z-20'
              }`}
              style={{
                left: `${node.screenX}px`,
                top: `${node.screenY}px`,
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect(node);
                focusOnNode(node.id);
              }}
            >
              {/* Node Card */}
              <div className={`p-2 rounded-[6px] border backdrop-blur-md ${statusBg} ${glowClass} cursor-pointer min-w-[160px]`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 overflow-hidden">
                    <div className={`p-1 rounded-[4px] ${badgeColor} border flex-shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium tracking-normal text-[#E8EBEF] truncate max-w-[105px]">
                      {node.label}
                    </span>
                  </div>

                  {/* Critical Asset Marker */}
                  {isCritical && (
                    <span className="px-1 py-0.5 rounded-[3px] text-[8px] font-mono font-medium bg-[#2A0C11] text-[#EF4444] border border-[#EF4444]/30 flex items-center space-x-0.5">
                      <Diamond className="w-2 h-2 fill-current" />
                      <span>CRIT</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono border-t border-[#1C222B] pt-1 mt-1">
                  <span className="text-[#8A929D]">{node.ip}</span>
                  <span className={`px-1 py-0.2 rounded-[3px] uppercase font-medium ${badgeColor}`}>
                    {node.status}
                  </span>
                </div>
              </div>

              {/* Pin indicator tether to 3D object */}
              <div className="w-[1px] h-3.5 mx-auto bg-[#475569]/40" />
            </div>
          );
        })}
      </div>

      {/* Tiny Minimap in Bottom-Left */}
      <div className="absolute bottom-28 left-6 z-20 pointer-events-auto flex flex-col space-y-2">
        <div className="w-28 h-20 rounded-[6px] bg-[#0A0D11]/90 border border-[#1C222B] p-1.5 backdrop-blur-md shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-sans text-[#E8EBEF] border-b border-[#1C222B] pb-0.5">
            <span className="flex items-center space-x-1 font-medium">
              <Compass className="w-2.5 h-2.5 text-[#8A929D]" />
              <span>MINIMAP</span>
            </span>
            <span className="text-[7px] text-[#565F6B] font-mono">2.5D</span>
          </div>

          {/* Minimap Node Dots */}
          <div className="relative flex-1 my-0.5 overflow-hidden">
            {nodes.map(n => {
              const leftPercent = ((n.pos[0] + 320) / 640) * 100;
              const topPercent = ((n.pos[2] + 400) / 850) * 100;
              const isComp = n.status === 'Compromised';
              const isAtt = n.type === 'attacker';

              return (
                <div
                  key={n.id}
                  className={`absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                    isComp ? 'bg-[#EF4444]' : isAtt ? 'bg-[#EF4444]' : 'bg-[#38BDF8]'
                  }`}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                />
              );
            })}
          </div>

          <div className="text-[7px] font-mono-tech text-[#565F6B] text-center">
            {nodes.length} ASSETS MAPPED
          </div>
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={resetCameraView}
          className="px-2.5 py-1 text-[11px] font-mono-tech text-[#8A929D] hover:text-[#E8EBEF] bg-[#0A0D11] hover:bg-[#161C24] border border-[#1C222B] hover:border-[#262E3B] rounded-[6px] backdrop-blur-md shadow-lg transition-all flex items-center justify-center space-x-1"
          title="Reset to 2.5D Isometric Default Angle"
        >
          <Zap className="w-3 h-3 text-sky-400" />
          <span>RESET CAM</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Helper: Build 2.5D Floor Grid and Network Zones
// -------------------------------------------------------------
function buildFloorAndZones(scene, environment, activeControls) {
  const prevFloor = scene.getObjectByName('floorGridContainer');
  if (prevFloor) scene.remove(prevFloor);

  const container = new THREE.Group();
  container.name = 'floorGridContainer';

  // Major Floor Grid: Gravity Slate
  const gridHelper = new THREE.GridHelper(1400, 48, 0x242B35, 0x0D1117);
  gridHelper.position.y = 0;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.35;
  container.add(gridHelper);

  // Deep floor plane: Gravity Near-Black #030405
  const floorPlaneGeo = new THREE.PlaneGeometry(1600, 1600);
  const floorPlaneMat = new THREE.MeshBasicMaterial({
    color: 0x030405,
    transparent: true,
    opacity: 0.98,
  });
  const floorPlane = new THREE.Mesh(floorPlaneGeo, floorPlaneMat);
  floorPlane.rotation.x = -Math.PI / 2;
  floorPlane.position.y = -0.5;
  container.add(floorPlane);

  // Network Zones (with enhanced segmentation boundaries when active)
  if (environment && environment.zones) {
    environment.zones.forEach((zone) => {
      const { bounds, color } = zone;
      const zoneWidth = bounds.maxX - bounds.minX;
      const zoneDepth = bounds.maxZ - bounds.minZ;
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;

      // Higher opacity if segmentation is enabled
      const zoneOpacity = activeControls?.segmentation ? 0.08 : 0.03;

      const zoneGeo = new THREE.PlaneGeometry(zoneWidth, zoneDepth);
      const zoneMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: zoneOpacity,
        side: THREE.DoubleSide
      });
      const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneMesh.rotation.x = -Math.PI / 2;
      zoneMesh.position.set(centerX, 0.2, centerZ);
      container.add(zoneMesh);

      const edges = new THREE.EdgesGeometry(zoneGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: activeControls?.segmentation ? 0.5 : 0.2,
        linewidth: activeControls?.segmentation ? 1.5 : 1
      });
      const line = new THREE.LineSegments(edges, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(centerX, 0.4, centerZ);
      container.add(line);
    });
  }

  scene.add(container);
}

// -------------------------------------------------------------
// Helper: Create Miniature 3D Infrastructure Object for Node
// -------------------------------------------------------------
function createNode3DObject(node, activeControls) {
  const group = new THREE.Group();
  group.position.set(...node.pos);

  const baseElevation = node.pos[1];
  const rotators = [];
  let glowRing = null;
  let defenseShield = null;

  const isCompromised = node.status === 'Compromised';
  const isUnderAttack = node.status === 'Under Attack';
  const isSecured = node.status === 'Secured';
  const isAttacker = node.type === 'attacker';

  const themeColor = isCompromised 
    ? 0xEF4444 
    : isUnderAttack 
    ? 0xF59E0B 
    : isSecured 
    ? 0x10B981 
    : isAttacker 
    ? 0xEF4444 
    : 0x38BDF8;

  // Floor Anchor
  const floorAnchor = new THREE.Group();
  floorAnchor.position.set(node.pos[0], 0, node.pos[2]);

  const shadowGeo = new THREE.CircleGeometry(26, 32);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.5;
  floorAnchor.add(shadow);

  const glowGeo = new THREE.CircleGeometry(36, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: themeColor, transparent: true, opacity: isCompromised ? 0.35 : 0.12 });
  const floorGlow = new THREE.Mesh(glowGeo, glowMat);
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.6;
  floorAnchor.add(floorGlow);

  const tetherPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, baseElevation, 0)];
  const tetherGeo = new THREE.BufferGeometry().setFromPoints(tetherPoints);
  const tetherMat = new THREE.LineDashedMaterial({ color: 0x262E3B, dashSize: 3, gapSize: 2, transparent: true, opacity: 0.5 });
  const tetherLine = new THREE.Line(tetherGeo, tetherMat);
  tetherLine.computeLineDistances();
  floorAnchor.add(tetherLine);

  // 3D Titanium/Graphite Extruded Bodies
  if (node.type === 'db') {
    const tierGeo = new THREE.CylinderGeometry(18, 18, 5, 24);
    const tierMat = new THREE.MeshStandardMaterial({ color: 0x0F1318, metalness: 0.85, roughness: 0.22, emissive: themeColor, emissiveIntensity: 0.1 });

    for (let i = -1; i <= 1; i++) {
      const tier = new THREE.Mesh(tierGeo, tierMat);
      tier.position.y = i * 8;
      group.add(tier);

      const ringGeo = new THREE.TorusGeometry(18.2, 0.5, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: themeColor });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = i * 8;
      group.add(ring);
      rotators.push(ring);
    }
  } else if (node.type === 'swift' || node.type === 'server') {
    const rackGeo = new THREE.BoxGeometry(22, 34, 18);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x0A0D11, metalness: 0.85, roughness: 0.25, emissive: themeColor, emissiveIntensity: 0.08 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    group.add(rack);

    for (let b = -4; b <= 4; b++) {
      const bladeGeo = new THREE.BoxGeometry(16, 1.8, 1);
      const bladeMat = new THREE.MeshBasicMaterial({ color: b % 2 === 0 ? themeColor : 0x1C222B });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, b * 3.2, 9.2);
      group.add(blade);
    }

    // MFA Shield Ring if active
    if (activeControls?.mfa && (node.id === 'swift' || node.id === 'dc')) {
      const mfaGeo = new THREE.TorusGeometry(26, 0.7, 8, 24);
      const mfaMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe: true });
      defenseShield = new THREE.Mesh(mfaGeo, mfaMat);
      defenseShield.rotation.x = Math.PI / 4;
      group.add(defenseShield);
    }
  } else if (node.type === 'web') {
    const hexGeo = new THREE.CylinderGeometry(20, 20, 4, 6);
    const hexMat = new THREE.MeshStandardMaterial({ color: 0x0F1318, metalness: 0.88, roughness: 0.2, emissive: themeColor, emissiveIntensity: 0.15 });
    const hex = new THREE.Mesh(hexGeo, hexMat);
    group.add(hex);

    const orbitGeo = new THREE.TorusGeometry(26, 0.6, 8, 32);
    const orbitMat = new THREE.MeshBasicMaterial({ color: themeColor, wireframe: true });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    group.add(orbit);
    rotators.push(orbit);

    // WAF Protective Ring if active
    if (activeControls?.waf) {
      const wafGeo = new THREE.TorusGeometry(30, 0.5, 6, 24);
      const wafMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
      defenseShield = new THREE.Mesh(wafGeo, wafMat);
      defenseShield.rotation.x = Math.PI / 2;
      group.add(defenseShield);
    }
  } else if (node.type === 'attacker') {
    const attGeo = new THREE.OctahedronGeometry(20, 0);
    const attMat = new THREE.MeshStandardMaterial({ color: 0x180608, metalness: 0.9, roughness: 0.15, emissive: 0xEF4444, emissiveIntensity: 0.4 });
    const attMesh = new THREE.Mesh(attGeo, attMat);
    group.add(attMesh);
    rotators.push(attMesh);

    const ringGeo = new THREE.TorusGeometry(28, 1.0, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);
    rotators.push(ring);
  } else {
    const boxGeo = new THREE.BoxGeometry(24, 20, 24);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0A0D11, metalness: 0.85, roughness: 0.22, emissive: themeColor, emissiveIntensity: 0.1 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    group.add(box);

    const edgeGeo = new THREE.EdgesGeometry(boxGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: themeColor, linewidth: 1.5 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edges);
  }

  // Aura
  const auraGeo = new THREE.SphereGeometry(30, 24, 24);
  const auraMat = new THREE.MeshBasicMaterial({ color: themeColor, transparent: true, opacity: isCompromised ? 0.2 : 0.05, wireframe: true });
  glowRing = new THREE.Mesh(auraGeo, auraMat);
  group.add(glowRing);

  return {
    group,
    floorAnchor,
    rotators,
    glowRing,
    floorGlow,
    shadow,
    status: node.status,
    baseElevation,
    defenseShield
  };
}
