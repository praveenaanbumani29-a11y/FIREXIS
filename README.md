# FIREXIS — Fire Exit Risk Evaluation & Intelligent Safety Platform

[![System Status](https://img.shields.io/badge/System-Operational-2A9D8F?style=flat-square)](http://localhost:8000/docs)
[![Python](https://img.shields.io/badge/Python-3.13-1D3557?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=three.js)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> **FIREXIS** is a mission-critical fire safety planning, structural analysis, evacuation simulation, and emergency response platform bridging architectural CAD, topological graph algorithms, cellular thermal propagation, multi-agent crowd evacuation, and hardware-accelerated 3D digital twins.

---

## 🏗️ Architecture & Core Modules

```text
FIREXIS/
├── backend/                  # Python 3.13 + FastAPI Engine
│   ├── api/                  # Unified REST & Simulation Endpoints
│   ├── graph_engine/         # Topological Graph Engine (DFS, BFS, Dijkstra, A*)
│   ├── fire_simulation/      # Cellular Thermal Conduction & Flashover Engine
│   ├── smoke_simulation/     # Optical Density & Visibility Obscuration Engine
│   ├── crowd_simulation/     # Multi-Agent Social Force Crowd Evacuation
│   ├── risk_engine/          # Spatial Risk Classification (NFPA/IBC heuristic)
│   ├── optimization/         # Algorithmic Mitigation & Egress Recommendations
│   ├── demo_data/            # Preloaded Multi-Story Commercial Complex & Incident
│   ├── reports/              # 12-Section Safety Audit Report Generator
│   ├── database/             # Relational Models & SQLite/PostgreSQL Engine
│   └── tests/                # Automated Pytest Suite (100% pass)
│
├── frontend/                 # React 19 + TypeScript + Vite + Three.js
│   ├── src/
│   │   ├── components/       # CAD Editor, 3D Digital Twin, Simulation Studio,
│   │   │                     # Graph Visualizer, Firefighter HUD, Before/After, Reports
│   │   ├── services/         # CAD Generator & API Client Service
│   │   └── types/            # Domain TypeScript Types
│   └── index.html            # Precision Mission-Control Dark Typography
│
├── app.py                    # Dual-Mode Process Orchestrator & Auto-Launcher
├── docker-compose.yml        # Multi-Container Deployment (Nginx + FastAPI + React)
└── README.md
```

---

## 🔬 Core Algorithms Implemented

| Algorithm / Model | Location | Primary Purpose | How It Works |
| :--- | :--- | :--- | :--- |
| **A\* (A-Star) Dynamic Search** | `backend/graph_engine/astar.py` | Real-time emergency evacuation rerouting | Finds the fastest safe path using Euclidean distance heuristics + live thermal and smoke hazard penalties; automatically calculates detours if an exit becomes blocked. |
| **Dijkstra’s Algorithm** | `backend/graph_engine/dijkstra.py` | Multi-exit optimal egress pathfinding | Calculates minimal-cost evacuation routes from every room, factoring in physical distance, crowd congestion, and static fire penalties. |
| **Breadth-First Search (BFS)** | `backend/graph_engine/bfs.py` | Exit reachability & hop distance | Ripples outward from emergency exits to compute the exact number of doors/corridors (hops) required to reach safety. |
| **Depth-First Search (DFS)** | `backend/graph_engine/dfs.py` | Structural connectivity & dead-end detection | Traverses the architectural layout to identify trapped zones or rooms lacking dual independent egress. |
| **Cellular Automata (CA) Conduction** | `backend/fire_simulation/fire_engine.py` | Thermal propagation & flashover modeling | Divides floor plates into 2m cells; simulates fuel combustion, heat radiation up to 900°C, and 4-neighborhood thermal conduction across walls and doors. |
| **2D Gaussian Dispersion & Jin's Law** | `backend/smoke_simulation/smoke_engine.py` | Smoke spread & visibility loss | Simulates smoke diffusion and toxic carbon monoxide accumulation, applying Jin's law ($Visibility = \frac{K}{\text{Optical Density}}$) to degrade agent walking speed. |
| **Agent-Based Crowd Simulation & Fruin's LoS** | `backend/crowd_simulation/crowd_engine.py` | Multi-agent human evacuation dynamics | Simulates individual evacuees with realistic speeds, reaction delays, and mobility types, applying Fruin’s Level of Service bottleneck friction at narrow doorways. |
| **ASET vs. RSET Evaluation** | `backend/risk_engine/evaluator.py` | Life safety code compliance (NFPA 101 / IBC) | Compares Available Safe Egress Time against Required Safe Egress Time, flagging rooms where escape time exceeds safety margins. |
| **Heuristic Spatial Optimizer** | `backend/optimization/optimizer.py` | Automated safety improvement advisor | Identifies bottlenecks and recommends precise secondary exit placements to reduce peak egress distances by ~50%. |
| **Space-Partitioning CAD Generator** | `frontend/src/services/cadGenerator.ts` | Multi-story architectural generation | Procedurally generates balanced floor layouts with central concourse spines, egress corridors, and stair cores across 5 building archetypes. |

---

## ⚡ Key Capabilities

1. **One-Command Local Launcher (`python app.py`)**:
   - Launches both the FastAPI backend and React Vite frontend concurrently with automated health checks, browser launch, and clean multi-process termination.
2. **Interactive 2D Architectural CAD Studio**:
   - True SVG pan-zoom engine (mouse-wheel zoom centered at cursor, drag-panning, auto-fit centering).
   - Place, drag, and resize rooms, emergency exits, extinguishers, and doors with snap-to-grid accuracy.
   - Built-in multi-floor architectural generator supporting 5 building archetypes (*Tech Commercial, Corporate HQ, Healthcare, University, Logistics*).
3. **1:1 Synchronized 3D Digital Twin (Three.js WebGL)**:
   - True open-top cutaway architectural walls, color-coded floor plates, illuminated concourse corridors, 3D doors, stairwell shafts, and floating room metadata badges.
   - **`Update 3D from 2D CAD`** action button and deep design hash reactivity that synchronizes any 2D edits directly into 3D.
   - Camera presets for 3D Isometric, First-Person Walkthrough, and direct Top-Down CAD perspectives.
4. **Coupled Fire, Smoke & Crowd Simulation Studio**:
   - Live interactive scrubber timeline displaying agent evacuation progress, flashover fire spread, and smoke obscuration.
5. **Firefighter Tactical Incident HUD**:
   - Mission-critical high-contrast heads-up display showing breach points, standpipe connections, active fire seat, and structural stair cores.
6. **12-Section Safety Audit Reports**:
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
This generates and outputs the local links:
- **Web Application**: [http://localhost:5173](http://localhost:5173)
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

**Frontend (Vite)**:
```bash
cd frontend
npm run dev
```

### 4. Running Backend Tests
```bash
python -m pytest backend/tests -v
```

### 5. Running with Docker Compose
```bash
docker-compose up --build
```

---

## ⚖️ Regulatory Notice
FIREXIS is an algorithmic simulation and computational assessment platform designed for engineering decision-support. It does **not** replace formal statutory certification or building inspections conducted by municipal fire authorities.
