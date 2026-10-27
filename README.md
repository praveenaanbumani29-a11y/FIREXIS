# FIREXIS — Fire Exit Risk Evaluation and Intelligent Safety System

[![System Status](https://img.shields.io/badge/System-Operational-2A9D8F?style=flat-square)](http://localhost:8000/docs)
[![Python](https://img.shields.io/badge/Python-3.13-1D3557?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=three.js)](https://threejs.org)

> **FIREXIS** is a professional fire-safety planning, building-analysis, evacuation-simulation, and emergency-response software platform bridging architectural CAD, topological graph algorithms, cellular thermal propagation, multi-agent crowd evacuation, and 3D digital twins.

---

## 🏗️ Architecture & Core Modules

```text
FIREXIS/
├── backend/                  # Python 3.13 + FastAPI Architecture
│   ├── api/                  # Unified REST & Simulation Endpoints
│   ├── graph_engine/         # Topological Graph Engine (DFS, BFS, Dijkstra, A*)
│   ├── fire_simulation/      # Cellular Thermal Conduction & Flashover Engine
│   ├── smoke_simulation/     # Optical Density & Visibility Obscuration Engine
│   ├── crowd_simulation/     # Multi-Agent Social Force Crowd Evacuation
│   ├── risk_engine/          # Spatial Risk Classification (NFPA/IBC heuristic)
│   ├── optimization/         # Algorithmic Mitigation & Egress Recommendations
│   ├── demo_data/            # Preloaded 3-Story Commercial Complex & Incident
│   ├── reports/              # 12-Section Safety Audit Report Generator
│   ├── database/             # Relational Models & SQLite/PostgreSQL Engine
│   └── tests/                # Automated Pytest Suite (100% pass)
│
├── frontend/                 # React + TypeScript + Vite + Three.js
│   ├── src/
│   │   ├── components/       # CAD Editor, Graph Visualizer, Simulation Studio,
│   │   │                     # 3D Twin, Firefighter HUD, Before/After, Reports
│   │   ├── services/         # API Client Service
│   │   └── types/            # Domain TypeScript Types
│   └── index.html            # Precision Engineering Typography
│
├── docker-compose.yml        # Multi-Container Deployment (Nginx + FastAPI + React)
└── README.md
```

---

## ⚡ Key Capabilities

1. **One-Click Instant Demo Workflow**:
   - Executes the complete 14-step journey in real time: loads a 3-floor commercial facility, runs fire/smoke spread, simulates 114 occupants, blocks the compromised exit, triggers dynamic A* recalculation, and displays optimization metrics.
2. **Interactive 2D Floor Plan CAD Editor**:
   - Draw and edit walls, rooms, corridors, doors, emergency exits, extinguishers, hose reels, and alarms with snap-to-grid precision.
   - Raster/PDF plan overlay with manual verification layer (Section 9).
3. **Graph Algorithm Engine**:
   - **DFS**: Detects disconnected zones, dead-end cul-de-sacs, and rooms lacking dual egress.
   - **BFS**: Computes unweighted hop distances to exits.
   - **Dijkstra**: Computes weighted shortest path under distance, capacity, and static hazard penalties.
   - **A\***: Dynamic real-time evacuation pathfinding with Euclidean heuristic and dynamic hazard avoidance.
4. **Coupled Fire & Smoke Simulation**:
   - Cellular grid thermal conduction (ambient 22°C up to 900°C flashover).
   - Smoke density accumulation, visibility degradation (meters), and stairwell stack effect.
5. **Multi-Agent Crowd Dynamics**:
   - Heterogeneous occupant velocity distributions (0.8–1.6 m/s), reaction delays, mobility impairments, and bottleneck friction.
   - Dynamic rerouting when exits or corridors become blocked.
6. **3D Digital Twin (Three.js)**:
   - WebGL 3D architectural representation with multi-floor slicing, dynamic flame volumes, smoke particles, and first-person perspective.
7. **Firefighter Tactical Incident HUD**:
   - High-contrast, zero-clutter tactical command mode for first responders: breach points, standpipe connections, active fire seat, and viable stairwells.
8. **12-Section Safety Audit Reports**:
   - Comprehensive engineering report with exit load balancing, bottleneck metrics, recommendations, and printable/PDF export.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node v24)
- npm

### 2. All-in-One One-Command Launch (Recommended)
Run both backend and frontend simultaneously with automated browser launch and healthcheck:
```bash
python app.py
```
This generates and outputs the local link:
- **Local Application Link**: [http://localhost:5173](http://localhost:5173) (or [http://localhost:8000](http://localhost:8000))
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Backend Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

Options:
```bash
python app.py --mode dev        # Runs Vite dev server + FastAPI backend
python app.py --mode unified    # Serves built frontend & API on single port 8000
python app.py --no-browser      # Starts without automatically opening the browser
```

### 3. Manual Start (Alternative)
**Backend (FastAPI)**:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

**Frontend (Vite)**:
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Running Backend Tests
```bash
python -m pytest backend/tests -v
```

### 5. Running with Docker Compose
```bash
docker-compose up --build
```

---

## 🎨 Color Palette & Engineering Design System

| Semantic Role | Color | Hex Code |
| :--- | :--- | :--- |
| **Primary Actions** | Light Orange | `#F4A261` |
| **Safety / Warning** | Safety Orange | `#E76F51` |
| **App Canvas** | Pale White | `#F8F9F7` |
| **Elevated Cards** | Pure White | `#FFFFFF` |
| **Headers & Navigation**| Deep Navy | `#1D3557` |
| **Technical Labels** | Charcoal | `#263238` |
| **Borders & Dividers** | Soft Gray | `#E9ECEF` |
| **Safe Routes** | Safe Green | `#2A9D8F` |
| **Moderate Risk** | Warning Yellow | `#E9C46A` |
| **Critical Hazard** | Danger Red | `#D62828` |
| **Tactical Incident** | Emergency Black | `#111111` |

---

## ⚖️ Regulatory Notice
FIREXIS is an algorithmic simulation and computational assessment platform designed for engineering decision-support. It does **not** replace formal statutory certification or building inspections conducted by municipal fire authorities.
