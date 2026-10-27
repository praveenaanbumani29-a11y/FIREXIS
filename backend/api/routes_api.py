"""Unified REST API routes for FIREXIS."""
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.graph_engine.builder import build_graph_from_floor
from backend.graph_engine.dfs import analyze_connectivity_dfs
from backend.graph_engine.bfs import compute_all_node_hop_distances, analyze_reachability_bfs
from backend.graph_engine.dijkstra import dijkstra_evacuation_path
from backend.graph_engine.astar import find_best_safe_exit_astar
from backend.fire_simulation.fire_engine import FireSimulationEngine
from backend.smoke_simulation.smoke_engine import SmokeEngine
from backend.crowd_simulation.crowd_engine import CrowdEvacuationEngine
from backend.risk_engine.evaluator import evaluate_building_risks
from backend.optimization.optimizer import generate_safety_recommendations
from backend.reports.generator import generate_safety_report
from backend.demo_data.demo_building import get_demo_building_data

router = APIRouter()

# In-memory store for quick prototyping and persistence
PROJECTS_STORE: List[Dict[str, Any]] = [
    {
        "id": "proj-01",
        "name": "Nexus Innovation Complex Safety Certification",
        "description": "Comprehensive egress connectivity and dynamic fire mitigation simulation.",
        "status": "ANALYZED",
        "created_at": "2026-10-22T08:00:00Z"
    }
]

BUILDINGS_STORE: Dict[str, Dict[str, Any]] = {
    "bld-nexus-01": get_demo_building_data()
}

@router.get("/health")
def get_health():
    return {
        "status": "OPERATIONAL",
        "system": "FIREXIS Engineering Safety Engine",
        "version": "1.0.0",
        "capabilities": [
            "Topological Graph Analytics (DFS/BFS/Dijkstra/A*)",
            "Cellular Thermal Fire Diffusion",
            "Smoke Obscuration & Chimney Stack Modeling",
            "Multi-Agent Social Force Crowd Evacuation",
            "Spatial Risk Classification & Optimization Recommendations",
            "Automated 12-Section PDF Safety Audit Generation"
        ]
    }

@router.get("/demo")
def get_demo():
    """Returns the complete preloaded demonstration complex and scenario."""
    return get_demo_building_data()

@router.get("/projects")
def list_projects():
    return PROJECTS_STORE

@router.post("/projects")
def create_project(payload: Dict[str, Any] = Body(...)):
    new_proj = {
        "id": f"proj-{len(PROJECTS_STORE) + 1:02d}",
        "name": payload.get("name", "New Safety Study"),
        "description": payload.get("description", ""),
        "status": "INITIALIZED",
        "created_at": "2026-10-22T10:00:00Z"
    }
    PROJECTS_STORE.append(new_proj)
    return new_proj

@router.get("/buildings/{building_id}")
def get_building(building_id: str):
    if building_id in BUILDINGS_STORE:
        return BUILDINGS_STORE[building_id]
    raise HTTPException(status_code=404, detail="Building not found")

@router.post("/graph/analyze")
def analyze_graph(floor_data: Dict[str, Any] = Body(...)):
    """Executes DFS, BFS, and Dijkstra on the provided floor layout."""
    graph = build_graph_from_floor(floor_data)
    
    # 1. DFS Connectivity
    dfs_result = analyze_connectivity_dfs(graph)
    
    # 2. BFS Hop Distances
    bfs_hops = compute_all_node_hop_distances(graph)
    
    # 3. Dijkstra optimal egress routes for each room
    room_routes = {}
    for node_id, node in graph.nodes.items():
        if node.type == "room":
            route = dijkstra_evacuation_path(graph, node_id)
            if route.get("success"):
                room_routes[node_id] = route
                
    return {
        "graph": graph.to_dict(),
        "connectivity_dfs": dfs_result,
        "exit_hops_bfs": bfs_hops,
        "optimal_routes_dijkstra": room_routes
    }

@router.post("/simulation/run")
def run_simulation(payload: Dict[str, Any] = Body(...)):
    """Executes a full simulation run with coupled fire, smoke, and crowd dynamics."""
    floor_data = payload.get("floor_data", {})
    fire_origin = payload.get("fire_origin", {"x": 54.0, "y": 26.0})
    total_occupants = payload.get("total_occupants", 114)
    blocked_exit_id = payload.get("blocked_exit_id", None)
    
    # Build graph
    graph = build_graph_from_floor(floor_data)
    
    # Block specified exit if requested
    if blocked_exit_id and blocked_exit_id in graph.nodes:
        graph.nodes[blocked_exit_id].is_blocked = True
        
    # Initialize engines
    fire_engine = FireSimulationEngine(width_m=floor_data.get("width_m", 70.0), height_m=floor_data.get("length_m", 45.0))
    fire_engine.ignite(fire_origin.get("x", 54.0), fire_origin.get("y", 26.0))
    
    smoke_engine = SmokeEngine(width_m=floor_data.get("width_m", 70.0), height_m=floor_data.get("length_m", 45.0))
    
    crowd_engine = CrowdEvacuationEngine(graph)
    crowd_engine.spawn_occupants_from_rooms(total_occupants=total_occupants)
    
    # Run time steps (up to 120 seconds or until finished)
    simulation_timeline = []
    max_steps = 90
    step_dt = 1.0
    
    for t in range(0, max_steps):
        # 1. Fire spread
        fire_engine.step(dt_seconds=step_dt)
        active_fires = fire_engine.get_active_fire_cells()
        
        # 2. Smoke spread
        smoke_engine.step(active_fires, dt_seconds=step_dt)
        
        # 3. Update graph hazard levels from fire proximity
        for node in graph.nodes.values():
            dist_to_fire = min(
                [((node.x - fc["x_m"])**2 + (node.y - fc["y_m"])**2)**0.5 for fc in active_fires] or [999.0]
            )
            if dist_to_fire < 6.0:
                node.hazard_level = min(1.0, 1.0 - (dist_to_fire / 6.0))
                if dist_to_fire < 2.5:
                    node.is_blocked = True
            node.smoke_level = min(1.0, 1.0 - (smoke_engine.get_visibility_at(node.x, node.y) / 30.0))
            
        # 4. Crowd step
        crowd_state = crowd_engine.step(dt=step_dt)
        
        # Capture keyframes every 2 seconds to keep payload compact
        if t % 2 == 0 or crowd_engine.is_completed:
            simulation_timeline.append({
                "time_sec": t,
                "evacuated": crowd_state["evacuated"],
                "evacuating": crowd_state["evacuating"],
                "at_risk": crowd_state["at_risk"],
                "fire_cells": active_fires[:25],  # top active fire cells
                "smoke_metrics": smoke_engine.get_hazard_metrics(),
                "agent_positions": [
                    {"id": a["id"], "x": a["x"], "y": a["y"], "state": a["state"]}
                    for a in crowd_state["agents"]
                ]
            })
            
        if crowd_engine.is_completed:
            break
            
    final_evacuation_time = simulation_timeline[-1]["time_sec"] if simulation_timeline else 90.0
    summary_metrics = {
        "total_occupants": total_occupants,
        "evacuated": crowd_state["evacuated"],
        "evacuating": crowd_state["evacuating"],
        "at_risk": crowd_state["at_risk"],
        "evacuation_time_seconds": final_evacuation_time,
        "timeline_frames_count": len(simulation_timeline)
    }
    
    return {
        "summary": summary_metrics,
        "timeline": simulation_timeline
    }

@router.post("/risk/evaluate")
def evaluate_risk(payload: Dict[str, Any] = Body(...)):
    floor_data = payload.get("floor_data", {})
    graph = build_graph_from_floor(floor_data)
    return evaluate_building_risks(graph)

@router.post("/optimization/recommend")
def get_recommendations(payload: Dict[str, Any] = Body(...)):
    floor_data = payload.get("floor_data", {})
    equipment = floor_data.get("equipment", [])
    graph = build_graph_from_floor(floor_data)
    return generate_safety_recommendations(graph, equipment_list=equipment)

@router.post("/reports/generate")
def create_report(payload: Dict[str, Any] = Body(...)):
    building_data = payload.get("building_data") or get_demo_building_data()
    floor_0 = building_data.get("floors", [{}])[0]
    graph = build_graph_from_floor(floor_0)
    
    connectivity = analyze_connectivity_dfs(graph)
    risks = evaluate_building_risks(graph)
    recs = generate_safety_recommendations(graph, equipment_list=floor_0.get("equipment", []))
    
    sim_metrics = payload.get("simulation_metrics", {
        "total_occupants": 114,
        "evacuated": 114,
        "at_risk": 0,
        "evacuation_time_seconds": 88.0,
        "mobility_impaired": 8
    })
    
    return generate_safety_report(building_data, sim_metrics, risks, recs, connectivity)
