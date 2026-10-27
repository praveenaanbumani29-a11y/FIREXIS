export type ActiveTab = 
  | 'landing'
  | 'dashboard'
  | 'wizard'
  | 'editor'
  | 'graph'
  | 'simulation'
  | '3d'
  | 'firefighter'
  | 'comparison'
  | 'report';

export interface Room {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  occupant_load: number;
}

export interface Corridor {
  id: string;
  name: string;
  position: { x: number; y: number };
  capacity: number;
}

export interface Door {
  id: string;
  name: string;
  position: { x: number; y: number };
  width_m: number;
  connects: string[];
}

export interface EmergencyExit {
  id: string;
  name: string;
  position: { x: number; y: number };
  discharge_type: string;
  capacity_persons_min: number;
  is_blocked: boolean;
  connects: string[];
}

export interface Staircase {
  id: string;
  name: string;
  position: { x: number; y: number };
  capacity: number;
  connects: string[];
}

export interface SafetyEquipment {
  id: string;
  name: string;
  equipment_type: 'EXTINGUISHER_ABC' | 'EXTINGUISHER_CO2' | 'EXTINGUISHER' | 'HOSE_REEL' | 'ALARM' | 'SPRINKLER' | 'ASSEMBLY_POINT';
  position: { x: number; y: number };
  status: string;
}

export interface FloorData {
  id: string;
  floor_number: number;
  name: string;
  elevation_m: number;
  width_m: number;
  length_m: number;
  scale_ppm: number;
  rooms: Room[];
  corridors: Corridor[];
  doors: Door[];
  exits: EmergencyExit[];
  staircases: Staircase[];
  equipment: SafetyEquipment[];
}

export interface BuildingData {
  building: {
    id: string;
    name: string;
    building_type: string;
    construction_type: string;
    total_floors: number;
    gross_area_sqm: number;
    max_occupancy: number;
    location: string;
  };
  floors: FloorData[];
  scenario: {
    name: string;
    fire_origin: { x: number; y: number; floor_id: string; label: string };
    blocked_exit_id: string;
    total_occupants: number;
    mobility_impaired_count: number;
    fire_intensity: string;
    smoke_dispersion_rate: string;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  floor_id: string;
  capacity: number;
  hazard_level: number;
  smoke_level: number;
  is_blocked: boolean;
}

export interface GraphEdge {
  u: string;
  v: string;
  distance: number;
  width: number;
  is_stair: boolean;
  is_blocked: boolean;
  current_flow: number;
}

export interface SimulationAgent {
  id: string;
  x: number;
  y: number;
  state: 'WAITING' | 'EVACUATING' | 'REROUTING' | 'SAFE' | 'AT_RISK';
}

export interface SimulationFrame {
  time_sec: number;
  evacuated: number;
  evacuating: number;
  at_risk: number;
  fire_cells: Array<{ x_m: number; y_m: number; state: string; temp_c: number }>;
  smoke_metrics: { percent_area_obscured: number; max_smoke_density: number };
  agent_positions: SimulationAgent[];
}

export interface RiskZone {
  node_id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  floor_id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  distance_to_exit_m: number;
  hazard_factor: string;
}

export interface Recommendation {
  id: string;
  category: string;
  affected_area: string;
  description: string;
  expected_benefit: string;
  confidence_score: number;
  simulation_evidence: any;
}
