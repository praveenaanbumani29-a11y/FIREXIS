import { BuildingData, FloorData, Recommendation, RiskZone } from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getDemoBuilding(): Promise<BuildingData> {
    const res = await fetch(`${API_BASE}/demo`);
    if (!res.ok) throw new Error('Failed to fetch demo building');
    return res.json();
  },

  async listProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async createProject(name: string, description: string) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    return res.json();
  },

  async analyzeGraph(floorData: FloorData) {
    const res = await fetch(`${API_BASE}/graph/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(floorData)
    });
    return res.json();
  },

  async runSimulation(payload: {
    floor_data: FloorData;
    fire_origin: { x: number; y: number };
    total_occupants: number;
    blocked_exit_id?: string;
  }) {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async evaluateRisk(floorData: FloorData): Promise<{
    overall_building_risk: string;
    critical_count: number;
    high_risk_count: number;
    risk_zones: RiskZone[];
  }> {
    const res = await fetch(`${API_BASE}/risk/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ floor_data: floorData })
    });
    return res.json();
  },

  async getRecommendations(floorData: FloorData): Promise<Recommendation[]> {
    const res = await fetch(`${API_BASE}/optimization/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ floor_data: floorData })
    });
    return res.json();
  },

  async generateReport(payload: {
    building_data: BuildingData;
    simulation_metrics?: any;
  }) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
