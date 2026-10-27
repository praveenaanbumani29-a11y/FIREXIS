"""Graph builder module to convert architectural floor plan layouts into topological graph models."""
import math
from typing import Dict, List, Any, Optional

class GraphNode:
    def __init__(self, node_id: str, label: str, node_type: str, x: float, y: float, floor_id: str, capacity: int = 50):
        self.id = node_id
        self.label = label
        self.type = node_type  # 'room', 'corridor', 'door', 'exit', 'stair', 'assembly'
        self.x = x
        self.y = y
        self.floor_id = floor_id
        self.capacity = capacity
        self.hazard_level: float = 0.0  # 0.0 to 1.0
        self.smoke_level: float = 0.0   # 0.0 to 1.0
        self.is_blocked: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "type": self.type,
            "x": self.x,
            "y": self.y,
            "floor_id": self.floor_id,
            "capacity": self.capacity,
            "hazard_level": round(self.hazard_level, 2),
            "smoke_level": round(self.smoke_level, 2),
            "is_blocked": self.is_blocked
        }

class GraphEdge:
    def __init__(self, u: str, v: str, distance: float, width: float = 1.2, is_stair: bool = False):
        self.u = u
        self.v = v
        self.distance = distance
        self.width = width
        self.is_stair = is_stair
        self.is_blocked = False
        self.current_flow: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "u": self.u,
            "v": self.v,
            "distance": round(self.distance, 2),
            "width": self.width,
            "is_stair": self.is_stair,
            "is_blocked": self.is_blocked,
            "current_flow": self.current_flow
        }

class BuildingGraph:
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.adj: Dict[str, List[GraphEdge]] = {}

    def add_node(self, node: GraphNode):
        self.nodes[node.id] = node
        if node.id not in self.adj:
            self.adj[node.id] = []

    def add_edge(self, u: str, v: str, distance: Optional[float] = None, width: float = 1.2, is_stair: bool = False):
        if u not in self.nodes or v not in self.nodes:
            return
        if distance is None:
            n1 = self.nodes[u]
            n2 = self.nodes[v]
            distance = math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2)
            
        edge_uv = GraphEdge(u, v, distance, width, is_stair)
        edge_vu = GraphEdge(v, u, distance, width, is_stair)
        self.adj[u].append(edge_uv)
        self.adj[v].append(edge_vu)

    def get_exits(self) -> List[GraphNode]:
        return [node for node in self.nodes.values() if node.type in ("exit", "assembly") and not node.is_blocked]

    def to_dict(self) -> Dict[str, Any]:
        edges_list = []
        visited = set()
        for u in self.adj:
            for e in self.adj[u]:
                edge_key = tuple(sorted([e.u, e.v]))
                if edge_key not in visited:
                    visited.add(edge_key)
                    edges_list.append(e.to_dict())
        return {
            "nodes": [n.to_dict() for n in self.nodes.values()],
            "edges": edges_list
        }

def build_graph_from_floor(floor_data: Dict[str, Any]) -> BuildingGraph:
    """Constructs a topological graph from floor plan layout elements."""
    graph = BuildingGraph()
    floor_id = floor_data.get("id", "floor-0")
    
    # 1. Rooms
    for r in floor_data.get("rooms", []):
        r_id = r["id"]
        # Centroid calculation
        bounds = r.get("bounds", {})
        cx = bounds.get("x", 0) + bounds.get("width", 20) / 2
        cy = bounds.get("y", 0) + bounds.get("height", 20) / 2
        node = GraphNode(r_id, r.get("name", "Room"), "room", cx, cy, floor_id, r.get("occupant_load", 10))
        graph.add_node(node)
        
    # 2. Corridors
    for c in floor_data.get("corridors", []):
        c_id = c["id"]
        pos = c.get("position", {"x": 50, "y": 50})
        node = GraphNode(c_id, c.get("name", "Corridor Junction"), "corridor", pos["x"], pos["y"], floor_id, c.get("capacity", 50))
        graph.add_node(node)

    # 3. Doors (Connect rooms to corridors or rooms to rooms)
    for d in floor_data.get("doors", []):
        d_id = d["id"]
        pos = d.get("position", {"x": 0, "y": 0})
        d_node = GraphNode(d_id, d.get("name", "Door"), "door", pos["x"], pos["y"], floor_id, 20)
        graph.add_node(d_node)
        
        # Connect to referenced entities
        for target_id in d.get("connects", []):
            if target_id in graph.nodes:
                graph.add_edge(d_id, target_id, width=d.get("width_m", 1.0))

    # 4. Emergency Exits
    for ex in floor_data.get("exits", []):
        ex_id = ex["id"]
        pos = ex.get("position", {"x": 0, "y": 0})
        node = GraphNode(ex_id, ex.get("name", "Exit"), "exit", pos["x"], pos["y"], floor_id, ex.get("capacity_persons_min", 80))
        node.is_blocked = ex.get("is_blocked", False)
        graph.add_node(node)
        
        # Connect exit to nearest door or corridor
        for c in ex.get("connects", []):
            if c in graph.nodes:
                graph.add_edge(ex_id, c, width=1.8)

    # 5. Staircases
    for st in floor_data.get("staircases", []):
        st_id = st["id"]
        pos = st.get("position", {"x": 0, "y": 0})
        node = GraphNode(st_id, st.get("name", "Stairwell"), "stair", pos["x"], pos["y"], floor_id, st.get("capacity", 100))
        graph.add_node(node)
        for c in st.get("connects", []):
            if c in graph.nodes:
                graph.add_edge(st_id, c, width=1.5, is_stair=True)

    return graph
