"""BFS implementation for unweighted hop distance and nearest exit reachability."""
from collections import deque
from typing import Dict, List, Any, Optional
from backend.graph_engine.builder import BuildingGraph

def analyze_reachability_bfs(graph: BuildingGraph, start_node_id: str) -> Dict[str, Any]:
    """Computes unweighted shortest hop path from a starting room/node to the closest exit."""
    if start_node_id not in graph.nodes:
        return {"error": f"Node {start_node_id} not found in graph"}
        
    queue = deque([(start_node_id, [start_node_id], 0)])
    visited = {start_node_id}
    
    nearest_exit = None
    path_found = []
    hop_count = -1
    
    while queue:
        curr, path, hops = queue.popleft()
        node = graph.nodes[curr]
        
        if node.type in ("exit", "assembly") and not node.is_blocked:
            nearest_exit = node
            path_found = path
            hop_count = hops
            break
            
        for edge in graph.adj.get(curr, []):
            if not edge.is_blocked:
                nxt = edge.v
                if nxt not in visited and not graph.nodes[nxt].is_blocked:
                    visited.add(nxt)
                    queue.append((nxt, path + [nxt], hops + 1))
                    
    return {
        "start_node_id": start_node_id,
        "reached_exit": nearest_exit.id if nearest_exit else None,
        "exit_name": nearest_exit.label if nearest_exit else None,
        "hop_count": hop_count,
        "path": path_found,
        "is_reachable": nearest_exit is not None
    }

def compute_all_node_hop_distances(graph: BuildingGraph) -> Dict[str, int]:
    """Multi-source BFS starting from all active exits to compute hop distances for all nodes in O(V+E)."""
    exits = graph.get_exits()
    distances = {nid: -1 for nid in graph.nodes}
    queue = deque()
    
    for ex in exits:
        distances[ex.id] = 0
        queue.append(ex.id)
        
    while queue:
        curr = queue.popleft()
        d = distances[curr]
        
        for edge in graph.adj.get(curr, []):
            if not edge.is_blocked:
                nxt = edge.v
                if not graph.nodes[nxt].is_blocked and distances[nxt] == -1:
                    distances[nxt] = d + 1
                    queue.append(nxt)
                    
    return distances
