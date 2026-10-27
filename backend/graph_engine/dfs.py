"""DFS implementation for building connectivity, disconnected zones, and dead-end detection."""
from typing import Dict, List, Set, Any
from backend.graph_engine.builder import BuildingGraph

def analyze_connectivity_dfs(graph: BuildingGraph) -> Dict[str, Any]:
    """Finds all connected components in the building graph using DFS.
    Identifies rooms/zones that have zero connectivity to any emergency exit.
    """
    visited: Set[str] = set()
    components: List[List[str]] = []
    
    for node_id in graph.nodes:
        if node_id not in visited:
            component = []
            stack = [node_id]
            visited.add(node_id)
            
            while stack:
                curr = stack.pop()
                component.append(curr)
                for edge in graph.adj.get(curr, []):
                    if not edge.is_blocked:
                        neighbor = edge.v
                        if neighbor not in visited and not graph.nodes[neighbor].is_blocked:
                            visited.add(neighbor)
                            stack.append(neighbor)
            components.append(component)
            
    # Check which components contain at least one exit
    exit_node_ids = {n.id for n in graph.get_exits()}
    safe_components = []
    isolated_components = []
    
    for comp in components:
        has_exit = any(node_id in exit_node_ids for node_id in comp)
        comp_details = [
            {"id": nid, "label": graph.nodes[nid].label, "type": graph.nodes[nid].type}
            for nid in comp
        ]
        if has_exit:
            safe_components.append(comp_details)
        else:
            isolated_components.append(comp_details)
            
    is_fully_connected = len(isolated_components) == 0 and len(safe_components) <= 1
    
    return {
        "is_fully_connected": is_fully_connected,
        "total_components": len(components),
        "safe_components_count": len(safe_components),
        "isolated_components_count": len(isolated_components),
        "isolated_zones": isolated_components,
        "warnings": [
            f"Isolated zone detected with {len(comp)} elements with NO valid path to an exit!"
            for comp in isolated_components
        ]
    }
