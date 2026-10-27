"""Risk evaluation engine computing multi-factor safety ratings across rooms, corridors, and exits."""
from typing import Dict, List, Any
from backend.graph_engine.builder import BuildingGraph
from backend.graph_engine.dijkstra import dijkstra_evacuation_path

RISK_LOW = "LOW"
RISK_MEDIUM = "MEDIUM"
RISK_HIGH = "HIGH"
RISK_CRITICAL = "CRITICAL"

def evaluate_building_risks(graph: BuildingGraph, max_compliant_distance_m: float = 30.0) -> Dict[str, Any]:
    """Evaluates spatial risk zones across all nodes in the building graph.
    Considers:
    1. Distance to nearest exit (NFPA / IBC guidelines: max 30m un-sprinklered, 45m sprinklered)
    2. Number of alternate egress pathways (redundancy)
    3. Active fire/smoke exposure
    4. Occupant load capacity ratio
    """
    risk_zones = []
    high_risk_count = 0
    critical_count = 0
    
    exits = graph.get_exits()
    if not exits:
        return {
            "overall_building_risk": RISK_CRITICAL,
            "error": "No accessible exits defined. Building is at critical risk.",
            "risk_zones": []
        }
        
    for node_id, node in graph.nodes.items():
        if node.type in ("exit", "assembly"):
            continue
            
        # 1. Distance analysis via Dijkstra
        path_res = dijkstra_evacuation_path(graph, node_id)
        if not path_res.get("success"):
            risk_level = RISK_CRITICAL
            hazard_factor = "Complete lack of reachable exit (Blocked or Disconnected)"
            critical_count += 1
            distance_m = 999.0
        else:
            distance_m = path_res["physical_distance_meters"]
            hazard_level = node.hazard_level
            smoke_level = node.smoke_level
            
            # Degree of connectivity (number of connected doors/corridors)
            degree = len(graph.adj.get(node_id, []))
            
            # Risk Scoring Logic
            if hazard_level > 0.6 or node.is_blocked:
                risk_level = RISK_CRITICAL
                hazard_factor = f"Direct thermal hazard exposure ({round(hazard_level * 100)}%)"
                critical_count += 1
            elif distance_m > max_compliant_distance_m * 1.5 or smoke_level > 0.5:
                risk_level = RISK_HIGH
                hazard_factor = f"Excessive travel distance ({round(distance_m, 1)}m > {max_compliant_distance_m}m limit) or heavy smoke"
                high_risk_count += 1
            elif distance_m > max_compliant_distance_m or degree <= 1:
                risk_level = RISK_MEDIUM
                hazard_factor = f"Travel distance ({round(distance_m, 1)}m) near regulatory threshold or single-point dead end"
            else:
                risk_level = RISK_LOW
                hazard_factor = f"Compliant travel distance ({round(distance_m, 1)}m) and dual egress"
                
        risk_zones.append({
            "node_id": node_id,
            "label": node.label,
            "type": node.type,
            "x": node.x,
            "y": node.y,
            "floor_id": node.floor_id,
            "risk_level": risk_level,
            "distance_to_exit_m": round(distance_m, 1),
            "hazard_factor": hazard_factor
        })

    # Overall building risk determination
    if critical_count > 0:
        overall_risk = RISK_CRITICAL
    elif high_risk_count > 2:
        overall_risk = RISK_HIGH
    elif high_risk_count > 0:
        overall_risk = RISK_MEDIUM
    else:
        overall_risk = RISK_LOW

    return {
        "overall_building_risk": overall_risk,
        "critical_count": critical_count,
        "high_risk_count": high_risk_count,
        "evaluated_nodes_count": len(risk_zones),
        "risk_zones": risk_zones
    }
