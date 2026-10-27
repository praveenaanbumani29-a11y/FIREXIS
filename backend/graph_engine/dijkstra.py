"""Dijkstra algorithm for weighted evacuation path optimization with distance and hazard scoring."""
import heapq
from typing import Dict, List, Any, Optional, Tuple
from backend.graph_engine.builder import BuildingGraph

def dijkstra_evacuation_path(
    graph: BuildingGraph,
    start_node_id: str,
    target_node_id: Optional[str] = None,
    hazard_weight: float = 5.0,
    crowd_weight: float = 2.0
) -> Dict[str, Any]:
    """Finds the optimal path from start_node_id to an exit (or specific target) using Dijkstra's algorithm.
    Cost incorporates distance, hazard levels, smoke density, and crowd congestion.
    """
    if start_node_id not in graph.nodes:
        return {"error": f"Start node {start_node_id} not found in graph"}
        
    distances: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    previous: Dict[str, Optional[str]] = {nid: None for nid in graph.nodes}
    distances[start_node_id] = 0.0
    
    # Priority queue stores (cost, node_id)
    pq: List[Tuple[float, str]] = [(0.0, start_node_id)]
    
    target_exits = {target_node_id} if target_node_id else {n.id for n in graph.get_exits()}
    reached_target = None
    
    while pq:
        curr_dist, u = heapq.heappop(pq)
        
        if curr_dist > distances[u]:
            continue
            
        if u in target_exits:
            reached_target = u
            if target_node_id:
                break
            # If multiple exits, first one popped from PQ is mathematically the minimal cost exit!
            break
            
        node_u = graph.nodes[u]
        
        for edge in graph.adj.get(u, []):
            if edge.is_blocked:
                continue
            v = edge.v
            node_v = graph.nodes[v]
            if node_v.is_blocked:
                continue
                
            # Dynamic Route Cost Formula:
            # Base Euclidean distance + hazard penalty + smoke penalty + congestion penalty
            base_distance = edge.distance
            hazard_penalty = (node_v.hazard_level * 100.0) * hazard_weight
            smoke_penalty = (node_v.smoke_level * 50.0) * hazard_weight
            congestion_penalty = (edge.current_flow / max(edge.width, 0.8)) * crowd_weight
            
            edge_cost = base_distance + hazard_penalty + smoke_penalty + congestion_penalty
            new_cost = curr_dist + edge_cost
            
            if new_cost < distances[v]:
                distances[v] = new_cost
                previous[v] = u
                heapq.heappush(pq, (new_cost, v))
                
    if not reached_target or distances[reached_target] == float('inf'):
        return {
            "success": False,
            "start_node": start_node_id,
            "error": "No viable path to any exit. Route is completely blocked by hazards or layout."
        }
        
    # Reconstruct path
    path = []
    curr = reached_target
    while curr is not None:
        path.append(curr)
        curr = previous[curr]
    path.reverse()
    
    # Calculate physical travel length in meters
    physical_length = 0.0
    for i in range(len(path) - 1):
        n1 = graph.nodes[path[i]]
        n2 = graph.nodes[path[i+1]]
        physical_length += ((n1.x - n2.x)**2 + (n1.y - n2.y)**2)**0.5
        
    # Estimated travel time (1.2 m/s standard walking speed)
    travel_time_sec = physical_length / 1.2
    
    return {
        "success": True,
        "start_node": start_node_id,
        "destination_exit": reached_target,
        "exit_name": graph.nodes[reached_target].label,
        "path": path,
        "path_nodes": [graph.nodes[nid].to_dict() for nid in path],
        "total_cost": round(distances[reached_target], 2),
        "physical_distance_meters": round(physical_length, 2),
        "estimated_time_seconds": round(travel_time_sec, 1)
    }
