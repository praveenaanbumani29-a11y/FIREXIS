"""A* pathfinding algorithm for real-time dynamic route recalculation during emergencies."""
import heapq
import math
from typing import Dict, List, Any, Optional, Tuple
from backend.graph_engine.builder import BuildingGraph, GraphNode

def heuristic(n1: GraphNode, n2: GraphNode) -> float:
    """Euclidean distance heuristic between two spatial nodes."""
    return math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2)

def astar_dynamic_path(
    graph: BuildingGraph,
    start_node_id: str,
    target_node_id: str,
    hazard_penalty_multiplier: float = 8.0
) -> Dict[str, Any]:
    """Finds the optimal path from start to target using A* with dynamic hazard avoidance."""
    if start_node_id not in graph.nodes or target_node_id not in graph.nodes:
        return {"success": False, "error": "Start or target node not found"}
        
    start_node = graph.nodes[start_node_id]
    target_node = graph.nodes[target_node_id]
    
    if target_node.is_blocked:
        return {"success": False, "error": f"Target exit {target_node.label} is blocked by fire/hazard."}
        
    open_set: List[Tuple[float, float, str]] = []  # (f_score, g_score, node_id)
    heapq.heappush(open_set, (heuristic(start_node, target_node), 0.0, start_node_id))
    
    came_from: Dict[str, Optional[str]] = {start_node_id: None}
    g_score: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    g_score[start_node_id] = 0.0
    
    f_score: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    f_score[start_node_id] = heuristic(start_node, target_node)
    
    found = False
    
    while open_set:
        _, current_g, current = heapq.heappop(open_set)
        
        if current == target_node_id:
            found = True
            break
            
        if current_g > g_score[current]:
            continue
            
        for edge in graph.adj.get(current, []):
            if edge.is_blocked:
                continue
            neighbor_id = edge.v
            neighbor_node = graph.nodes[neighbor_id]
            
            if neighbor_node.is_blocked:
                continue
                
            # Cost function: distance + hazard penalty + smoke penalty
            travel_cost = edge.distance
            hazard_factor = (neighbor_node.hazard_level * 50.0 + neighbor_node.smoke_level * 25.0) * hazard_penalty_multiplier
            edge_weight = travel_cost + hazard_factor
            
            tentative_g = g_score[current] + edge_weight
            
            if tentative_g < g_score[neighbor_id]:
                came_from[neighbor_id] = current
                g_score[neighbor_id] = tentative_g
                f = tentative_g + heuristic(neighbor_node, target_node)
                f_score[neighbor_id] = f
                heapq.heappush(open_set, (f, tentative_g, neighbor_id))
                
    if not found:
        return {
            "success": False,
            "error": "No viable path found to designated target. Path is blocked by hazards."
        }
        
    # Reconstruct path
    path = []
    curr = target_node_id
    while curr is not None:
        path.append(curr)
        curr = came_from[curr]
    path.reverse()
    
    physical_distance = 0.0
    for i in range(len(path) - 1):
        n1 = graph.nodes[path[i]]
        n2 = graph.nodes[path[i+1]]
        physical_distance += heuristic(n1, n2)
        
    return {
        "success": True,
        "path": path,
        "path_nodes": [graph.nodes[nid].to_dict() for nid in path],
        "total_cost": round(g_score[target_node_id], 2),
        "physical_distance_meters": round(physical_distance, 2),
        "estimated_time_seconds": round(physical_distance / 1.2, 1)
    }

def find_best_safe_exit_astar(graph: BuildingGraph, start_node_id: str) -> Dict[str, Any]:
    """Evaluates all unblocked exits and returns the optimal route using A*."""
    exits = graph.get_exits()
    if not exits:
        return {"success": False, "error": "No accessible exits found in the building."}
        
    best_result = None
    min_cost = float('inf')
    
    for ex in exits:
        res = astar_dynamic_path(graph, start_node_id, ex.id)
        if res.get("success") and res.get("total_cost", float('inf')) < min_cost:
            min_cost = res["total_cost"]
            best_result = res
            best_result["exit_id"] = ex.id
            best_result["exit_name"] = ex.label
            
    if not best_result:
        return {"success": False, "error": "All exit paths are blocked or unreachable."}
        
    return best_result
