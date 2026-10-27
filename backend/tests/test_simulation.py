"""Unit and integration test suite for FIREXIS core computational algorithms."""
import pytest
from backend.demo_data.demo_building import get_demo_building_data
from backend.graph_engine.builder import build_graph_from_floor
from backend.graph_engine.dfs import analyze_connectivity_dfs
from backend.graph_engine.bfs import compute_all_node_hop_distances, analyze_reachability_bfs
from backend.graph_engine.dijkstra import dijkstra_evacuation_path
from backend.graph_engine.astar import astar_dynamic_path, find_best_safe_exit_astar
from backend.fire_simulation.fire_engine import FireSimulationEngine
from backend.smoke_simulation.smoke_engine import SmokeEngine
from backend.crowd_simulation.crowd_engine import CrowdEvacuationEngine
from backend.risk_engine.evaluator import evaluate_building_risks

@pytest.fixture
def demo_data():
    return get_demo_building_data()

@pytest.fixture
def ground_floor_graph(demo_data):
    floor0 = demo_data["floors"][0]
    return build_graph_from_floor(floor0)

def test_graph_construction(ground_floor_graph):
    assert len(ground_floor_graph.nodes) >= 15
    assert len(ground_floor_graph.adj) >= 15
    # Should have multiple rooms and exits
    rooms = [n for n in ground_floor_graph.nodes.values() if n.type == "room"]
    exits = [n for n in ground_floor_graph.nodes.values() if n.type == "exit"]
    assert len(rooms) >= 4
    assert len(exits) >= 3

def test_dfs_connectivity(ground_floor_graph):
    # With East Exit blocked in the scenario, DFS should identify components
    dfs_res = analyze_connectivity_dfs(ground_floor_graph)
    assert "is_fully_connected" in dfs_res
    assert "total_components" in dfs_res
    assert dfs_res["total_components"] >= 1

def test_bfs_exit_reachability(ground_floor_graph):
    hops = compute_all_node_hop_distances(ground_floor_graph)
    # The auditorium room (rm-g02) should have a valid finite hop distance to an active exit
    assert hops.get("rm-g02", -1) > 0

def test_dijkstra_pathfinding(ground_floor_graph):
    path_res = dijkstra_evacuation_path(ground_floor_graph, "rm-g02")
    assert path_res["success"] is True
    assert path_res["physical_distance_meters"] > 0.0
    assert len(path_res["path"]) >= 2

def test_astar_dynamic_hazard_rerouting(ground_floor_graph):
    # Route from auditorium to North Exit
    astar_res = astar_dynamic_path(ground_floor_graph, "rm-g02", "exit-north")
    assert astar_res["success"] is True
    assert astar_res["physical_distance_meters"] > 0.0

def test_fire_simulation_thermal_growth():
    engine = FireSimulationEngine(width_m=60.0, height_m=40.0)
    engine.ignite(30.0, 20.0)
    # Initial state
    assert len(engine.fire_origins) == 1
    # Step forward 5 seconds
    engine.step(dt_seconds=5.0)
    active = engine.get_active_fire_cells()
    assert len(active) >= 1

def test_smoke_propagation_obscuration():
    fire_engine = FireSimulationEngine(width_m=60.0, height_m=40.0)
    fire_engine.ignite(30.0, 20.0)
    smoke_engine = SmokeEngine(width_m=60.0, height_m=40.0)
    
    fire_engine.step(dt_seconds=2.0)
    smoke_engine.step(fire_engine.get_active_fire_cells(), dt_seconds=2.0)
    
    metrics = smoke_engine.get_hazard_metrics()
    assert "percent_area_obscured" in metrics

def test_crowd_evacuation_agents(ground_floor_graph):
    crowd = CrowdEvacuationEngine(ground_floor_graph)
    crowd.spawn_occupants_from_rooms(total_occupants=20)
    assert len(crowd.agents) == 20
    
    # Step forward
    state = crowd.step(dt=2.0)
    assert state["total_occupants"] == 20
    assert "evacuated" in state

def test_risk_evaluation(ground_floor_graph):
    risks = evaluate_building_risks(ground_floor_graph)
    assert "overall_building_risk" in risks
    assert len(risks["risk_zones"]) > 0
