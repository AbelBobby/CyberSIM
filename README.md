# Cyber Range

A modern, spatial 2.5D interactive cybersecurity range and simulation command center. Built with React and Three.js, this platform enables security engineers, operators, and researchers to model real-time cyberattack propagation, test layered defensive controls, inspect live telemetry, and evaluate zero-trust network architectures across diverse enterprise network topologies.

---

## Features

### 1. Spatial 2.5D Network Visualization
- **Three.js Isometric/Spatial Canvas**: Interactive network topology rendered in a 2.5D plane with dynamic camera controls, glowing node meshes, and subnet zone boundaries (External, DMZ, Ingress, Core, Vault).
- **Visual Attack Signals**: Real-time particle stream pulses representing network packets, defensive forcefield barriers, and ripple shockwaves on node compromise or breach events.
- **Node Status & Criticality**: Interactive nodes with live CPU utilization, open port banners, operating system profiling, and criticality badges (*Crown Jewel*, *Life Safety*, *Critical Asset*).

### 2. Multi-Stage Cyberattack Simulation
- **Full Attack Kill Chain**: Simulates multi-stage attack paths following the cyber kill chain:
  - Reconnaissance & Port Scanning
  - Initial Access & Perimeter Breach
  - Payload Exploitation
  - Lateral Movement & Subnet Pivoting
  - Privilege Escalation & Credential Abuse
  - Data Access & Crown-Jewel Infiltration
  - Data Exfiltration
- **Configurable Attack Types**: Includes scenarios for CVE Web Exploitation, SYN Port Scans, SSH/Admin Brute-Force, Kerberoasting, BOLA API Injections, and Ransomware Mass Encryption.

### 3. Pre-configured Enterprise Topologies
- **Banking & Financial Core (`FIN-CORP-09`)**: SWIFT transaction gateway, ATM payment bridges, high-security Oracle core database, and air-gapped backup storage vault.
- **Enterprise Corporate Domain (`CORP-RANSOM-02`)**: Active Directory Domain Controller, Edge VPN concentrator, secure email gateway, HR finance workstations, and TrueNAS file repository.
- **Hospital Medical Network (`MED-IOT-77`)**: Clinical telemetry network featuring Patient Portal FHIR APIs, bedside ICU infusion pump controllers, EMR servers, and PACS radiology imaging databases.
- **Research & University Library (`EDU-BREACH-01`)**: Academic search indexes (Apache Solr), EZProxy authentication gateway, student terminal labs, and confidential manuscript archives.

### 4. Interactive Defensive Controls
- **Real-Time Toggleable Defenses**:
  - **WAF Filter**: Layer 7 HTTP/HTTPS ingress inspection and exploit blocking.
  - **Zero-Trust Network Segmentation**: Subnet-level isolation preventing lateral movement.
  - **Multi-Factor Authentication (MFA)**: Challenge-response gating for administrative pivots.
  - **IDS / IPS**: Deep packet inspection and anomaly detection sensors.
  - **EDR (Endpoint Detection & Response)**: Host-level behavioral monitoring and macro containment.
  - **Security Patching**: Automated vulnerability remediation.
  - **Least-Privilege Access Control (RBAC)**: Enforced credential boundary restrictions.
  - **Continuous Telemetry Monitoring**: Real-time auditing and alert ingestion.

### 5. Dynamic Threat Scoring & Telemetry
- **Dynamic Threat Score (0–100)**: Real-time risk metric dynamically adjusted based on compromised host count, asset criticality ratings, kill chain progression stage, active defensive countermeasures, and intercepted threats.
- **Unified Telemetry Bar**: HUD monitoring total nodes, active communication links, compromised assets, threat alerts, blocked attempts, and network latency.
- **Filterable Live Event Stream**: Real-time audit log with severity indicators (`INFO`, `WARN`, `CRITICAL`), filtered by event category (*All*, *Attack*, *Defense*, *Blocked*) or targeted by individual network nodes.

### 6. Simulation Controls & Replay
- **Time Controls**: Play, pause, reset, step-forward, and step-backward execution with adjustable simulation speeds (1x, 2x, etc.).
- **Scrubbable Timeline**: Real-time simulation timeline showing attack elapsed time and phase milestones.
- **Attack Replay Mode**: Review and replay historical simulation sequences to evaluate mitigation timing and barrier effectiveness.

### 7. Post-Simulation Analytics & Benchmark Comparison
- **Simulation Complete Analysis**: Summary reporting containment status, estimated exfiltrated volume, critical asset preservation rate, and overall defense effectiveness score.
- **Defensive Benchmark Comparison**: Side-by-side comparative analysis contrasting an unprotected perimeter baseline against a hardened Zero-Trust architecture.

### 8. Real-Time Telemetry / WebSocket Integration
- **Backend Stream Ready**: Built-in WebSocket listener (`ws://localhost:8000/ws`) for ingesting external simulation events, telemetry feeds, or honeypot sensor data.

---

## Tech Stack

- **Core & UI Framework**: [React 19](https://react.dev/)
- **Build Tooling**: [Vite 6](https://vite.dev/)
- **Spatial 3D Engine**: [Three.js](https://threejs.org/)
- **Flow Graph Architecture**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Code Quality**: [ESLint 9](https://eslint.org/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd cyberattacksim
npm install
```

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to the local server URL (typically `http://localhost:5173`).

### Building for Production

Compile and bundle the production build:

```bash
npm run build
```

The compiled assets will be placed in the `dist/` directory.

### Previewing the Production Build

Preview the built application locally:

```bash
npm run preview
```

---

## Project Structure

```text
cyberattacksim/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Static media assets
│   ├── components/          # React UI and canvas components
│   │   ├── AtmosphericBackground.jsx
│   │   ├── CustomNode.jsx
│   │   ├── DefenseComparisonModal.jsx
│   │   ├── EventLog.jsx
│   │   ├── EventTimeline.jsx
│   │   ├── LeftPanel.jsx
│   │   ├── MatrixRain.jsx
│   │   ├── NetworkGraph.jsx
│   │   ├── NetworkPlane3D.jsx         # Three.js 2.5D spatial visualization
│   │   ├── RightPanel.jsx
│   │   ├── ScenarioSetupModal.jsx
│   │   ├── SimulationCompleteModal.jsx
│   │   ├── SimulationTimeline.jsx
│   │   ├── TelemetryBar.jsx
│   │   └── TopHUD.jsx
│   ├── services/
│   │   └── simulationEngine.js        # Scenarios, attack vectors, defense models, scoring
│   ├── App.css
│   ├── App.jsx                        # Primary simulation orchestration
│   ├── index.css                      # Global styles and Tailwind directives
│   └── main.jsx                       # Application entry point
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

---

## License

This project is licensed under the MIT License.
