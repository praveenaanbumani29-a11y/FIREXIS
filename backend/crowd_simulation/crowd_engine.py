"""Multi-agent crowd evacuation simulation engine with heterogeneous occupant attributes and dynamic rerouting."""
import math
import random
from typing import Dict, List, Any, Optional
from backend.graph_engine.builder import BuildingGraph
from backend.graph_engine.astar import astar_dynamic_path, find_best_safe_exit_astar

AGENT_STATE_WAITING = "WAITING"
AGENT_STATE_EVACUATING = "EVACUATING"
AGENT_STATE_REROUTING = "REROUTING"
AGENT_STATE_SAFE = "SAFE"
AGENT_STATE_AT_RISK = "AT_RISK"

class EvacuationAgent:
    def __init__(
        self,
        agent_id: str,
        start_node_id: str,
        x: float,
        y: float,
        floor_id: str,
        speed_mps: float = 1.2,
        reaction_delay_s: float = 2.0,
        mobility_type: str = "NORMAL"  # NORMAL, IMPAIRED, ELDERLY
    ):
        self.id = agent_id
        self.start_node_id = start_node_id
        self.current_node_id = start_node_id
        self.x = x
        self.y = y
        self.floor_id = floor_id
        self.base_speed = speed_mps
        self.speed = speed_mps
        self.reaction_delay = reaction_delay_s
        self.mobility_type = mobility_type
        
        self.state = AGENT_STATE_WAITING
        self.path: List[str] = []
        self.path_index: int = 0
        self.assigned_exit: Optional[str] = None
        self.evacuated_at_seconds: Optional[float] = None
        self.reroute_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "floor_id": self.floor_id,
            "state": self.state,
            "current_node": self.current_node_id,
            "assigned_exit": self.assigned_exit,
            "mobility": self.mobility_type,
            "evacuated_at": self.evacuated_at_seconds
        }

class CrowdEvacuationEngine:
    def __init__(self, graph: BuildingGraph):
        self.graph = graph
        self.agents: List[EvacuationAgent] = []
        self.sim_time: float = 0.0
        self.is_completed: bool = False
        self.bottleneck_counts: Dict[str, int] = {}

    def spawn_occupants_from_rooms(self, total_occupants: int = 100, mobility_impaired_pct: float = 0.1):
        """Distributes occupants across rooms according to room capacity."""
        rooms = [n for n in self.graph.nodes.values() if n.type == "room"]
        if not rooms:
            rooms = [n for n in self.graph.nodes.values() if n.type in ("room", "corridor")]
            
        total_capacity = sum(r.capacity for r in rooms) or len(rooms)
        agent_idx = 0
        
        for r in rooms:
            # Proportion of occupants for this room
            room_occupants = max(1, int((r.capacity / total_capacity) * total_occupants))
            for _ in range(room_occupants):
                if agent_idx >= total_occupants:
                    break
                    
                # Slight spatial jitter around room center
                jx = r.x + random.uniform(-2.5, 2.5)
                jy = r.y + random.uniform(-2.5, 2.5)
                
                is_impaired = random.random() < mobility_impaired_pct
                speed = random.gauss(0.85, 0.15) if is_impaired else random.gauss(1.25, 0.2)
                speed = max(0.6, min(1.8, speed))
                reaction = max(0.5, random.lognormvariate(0.7, 0.3))
                
                agent = EvacuationAgent(
                    agent_id=f"agent-{agent_idx + 1}",
                    start_node_id=r.id,
                    x=jx,
                    y=jy,
                    floor_id=r.floor_id,
                    speed_mps=speed,
                    reaction_delay_s=reaction,
                    mobility_type="IMPAIRED" if is_impaired else "NORMAL"
                )
                
                # Initial pathfinding to nearest viable exit
                route_res = find_best_safe_exit_astar(self.graph, r.id)
                if route_res.get("success"):
                    agent.path = route_res["path"]
                    agent.assigned_exit = route_res.get("exit_id")
                else:
                    agent.state = AGENT_STATE_AT_RISK
                    
                self.agents.append(agent)
                agent_idx += 1

        # Ensure exact headcount by distributing any remainder
        while len(self.agents) < total_occupants:
            r = rooms[len(self.agents) % len(rooms)]
            jx = r.x + random.uniform(-2.5, 2.5)
            jy = r.y + random.uniform(-2.5, 2.5)
            rem_idx = len(self.agents)
            is_imp = random.random() < mobility_impaired_pct
            spd = max(0.6, min(1.8, random.gauss(0.85, 0.15) if is_imp else random.gauss(1.25, 0.2)))
            agent = EvacuationAgent(
                agent_id=f"agent-{rem_idx + 1}",
                start_node_id=r.id,
                x=jx,
                y=jy,
                floor_id=r.floor_id,
                speed_mps=spd,
                reaction_delay_s=max(0.5, random.lognormvariate(0.7, 0.3)),
                mobility_type="IMPAIRED" if is_imp else "NORMAL"
            )
            route_res = find_best_safe_exit_astar(self.graph, r.id)
            if route_res.get("success"):
                agent.path = route_res["path"]
                agent.assigned_exit = route_res.get("exit_id")
            else:
                agent.state = AGENT_STATE_AT_RISK
            self.agents.append(agent)

    def step(self, dt: float = 1.0) -> Dict[str, Any]:
        """Advances crowd simulation by dt seconds."""
        self.sim_time += dt
        
        # Track edge usage to model bottleneck congestion
        edge_headcount: Dict[str, int] = {}
        
        for agent in self.agents:
            if agent.state in (AGENT_STATE_SAFE, AGENT_STATE_AT_RISK):
                continue
                
            # Reaction delay
            if self.sim_time < agent.reaction_delay:
                agent.state = AGENT_STATE_WAITING
                continue
                
            agent.state = AGENT_STATE_EVACUATING
            
            # Check if agent has a valid path
            if not agent.path or agent.path_index >= len(agent.path):
                # Check if current node is an exit
                curr_node = self.graph.nodes.get(agent.current_node_id)
                if curr_node and curr_node.type in ("exit", "assembly") and not curr_node.is_blocked:
                    agent.state = AGENT_STATE_SAFE
                    agent.evacuated_at_seconds = round(self.sim_time, 1)
                else:
                    # Recalculate route
                    reroute = find_best_safe_exit_astar(self.graph, agent.current_node_id)
                    if reroute.get("success"):
                        agent.path = reroute["path"]
                        agent.path_index = 0
                        agent.assigned_exit = reroute.get("exit_id")
                        agent.reroute_count += 1
                        agent.state = AGENT_STATE_REROUTING
                    else:
                        agent.state = AGENT_STATE_AT_RISK
                continue
                
            target_node_id = agent.path[agent.path_index]
            target_node = self.graph.nodes.get(target_node_id)
            
            # Check if the target node or exit has become blocked by fire/smoke
            if target_node and (target_node.is_blocked or target_node.hazard_level > 0.6):
                # Route blocked! Trigger dynamic A* recalculation
                reroute = find_best_safe_exit_astar(self.graph, agent.current_node_id)
                if reroute.get("success"):
                    agent.path = reroute["path"]
                    agent.path_index = 0
                    agent.assigned_exit = reroute.get("exit_id")
                    agent.reroute_count += 1
                    agent.state = AGENT_STATE_REROUTING
                    target_node_id = agent.path[0]
                    target_node = self.graph.nodes.get(target_node_id)
                else:
                    agent.state = AGENT_STATE_AT_RISK
                    continue
                    
            if not target_node:
                continue
                
            # Movement vector toward target node
            dx = target_node.x - agent.x
            dy = target_node.y - agent.y
            dist = math.hypot(dx, dy)
            
            # Congestion factor: if corridor has high crowd, speed reduces (Fruin's level of service)
            edge_key = f"{agent.current_node_id}->{target_node_id}"
            edge_headcount[edge_key] = edge_headcount.get(edge_key, 0) + 1
            congestion_speed_factor = max(0.35, 1.0 - (edge_headcount[edge_key] * 0.05))
            
            step_distance = agent.speed * congestion_speed_factor * dt
            
            if dist <= step_distance:
                # Reached waypoint
                agent.x = target_node.x
                agent.y = target_node.y
                agent.current_node_id = target_node_id
                agent.path_index += 1
                
                # Check if this node is an exit
                if target_node.type in ("exit", "assembly") and not target_node.is_blocked:
                    agent.state = AGENT_STATE_SAFE
                    agent.evacuated_at_seconds = round(self.sim_time, 1)
            else:
                # Move closer along vector
                agent.x += (dx / dist) * step_distance
                agent.y += (dy / dist) * step_distance

        # Count summary metrics
        evacuated = sum(1 for a in self.agents if a.state == AGENT_STATE_SAFE)
        evacuating = sum(1 for a in self.agents if a.state in (AGENT_STATE_EVACUATING, AGENT_STATE_REROUTING, AGENT_STATE_WAITING))
        at_risk = sum(1 for a in self.agents if a.state == AGENT_STATE_AT_RISK)
        
        self.is_completed = (evacuating == 0)
        
        return {
            "time_seconds": round(self.sim_time, 1),
            "total_occupants": len(self.agents),
            "evacuated": evacuated,
            "evacuating": evacuating,
            "at_risk": at_risk,
            "is_completed": self.is_completed,
            "agents": [a.to_dict() for a in self.agents]
        }
