"""Cellular fire propagation engine on a spatial floor grid with thermal conduction and barrier breaching."""
import math
from typing import Dict, List, Any, Tuple

STATE_SAFE = "SAFE"
STATE_HEATING = "HEATING"
STATE_FIRE = "FIRE"
STATE_SMOKE = "SMOKE"
STATE_BLOCKED = "BLOCKED"
STATE_CONTAINED = "CONTAINED"

class FireCell:
    def __init__(self, x: int, y: int, cell_size_m: float = 2.0):
        self.x = x
        self.y = y
        self.cell_size_m = cell_size_m
        self.state = STATE_SAFE
        self.temperature_c: float = 22.0  # Ambient temperature
        self.fuel_load: float = 100.0     # Percentage of combustible material
        self.is_wall: bool = False
        self.is_door: bool = False
        self.door_fire_rating_min: float = 30.0  # Minutes until breach

    def to_dict(self) -> Dict[str, Any]:
        return {
            "x": self.x,
            "y": self.y,
            "state": self.state,
            "temperature_c": round(self.temperature_c, 1),
            "fuel_load": round(self.fuel_load, 1)
        }

class FireSimulationEngine:
    def __init__(self, width_m: float = 60.0, height_m: float = 40.0, cell_size_m: float = 2.0):
        self.width_m = width_m
        self.height_m = height_m
        self.cell_size_m = cell_size_m
        self.cols = int(width_m / cell_size_m)
        self.rows = int(height_m / cell_size_m)
        
        self.grid: List[List[FireCell]] = [
            [FireCell(c, r, cell_size_m) for c in range(self.cols)]
            for r in range(self.rows)
        ]
        self.elapsed_seconds: float = 0.0
        self.fire_origins: List[Tuple[float, float]] = []

    def set_walls_and_doors(self, walls: List[Dict[str, Any]], doors: List[Dict[str, Any]]):
        """Marks spatial cells that intersect physical walls and doors."""
        for w in walls:
            x1 = int(w.get("x1", 0) / self.cell_size_m)
            y1 = int(w.get("y1", 0) / self.cell_size_m)
            x2 = int(w.get("x2", 0) / self.cell_size_m)
            y2 = int(w.get("y2", 0) / self.cell_size_m)
            
            # Simple Bresenham or bounding box rasterization
            min_c = max(0, min(x1, x2))
            max_c = min(self.cols - 1, max(x1, x2))
            min_r = max(0, min(y1, y2))
            max_r = min(self.rows - 1, max(y1, y2))
            for r in range(min_r, max_r + 1):
                for c in range(min_c, max_c + 1):
                    self.grid[r][c].is_wall = True

        for d in doors:
            pos = d.get("position", {})
            c = max(0, min(self.cols - 1, int(pos.get("x", 0) / self.cell_size_m)))
            r = max(0, min(self.rows - 1, int(pos.get("y", 0) / self.cell_size_m)))
            self.grid[r][c].is_door = True
            self.grid[r][c].is_wall = False

    def ignite(self, x_m: float, y_m: float, initial_temp_c: float = 450.0):
        """Ignites fire at physical coordinate (x_m, y_m)."""
        c = max(0, min(self.cols - 1, int(x_m / self.cell_size_m)))
        r = max(0, min(self.rows - 1, int(y_m / self.cell_size_m)))
        cell = self.grid[r][c]
        cell.state = STATE_FIRE
        cell.temperature_c = initial_temp_c
        self.fire_origins.append((x_m, y_m))

    def step(self, dt_seconds: float = 1.0, spread_factor: float = 0.08):
        """Simulates one time step of thermal and fire propagation."""
        self.elapsed_seconds += dt_seconds
        new_temps = [[cell.temperature_c for cell in row] for row in self.grid]
        
        for r in range(self.rows):
            for c in range(self.cols):
                cell = self.grid[r][c]
                
                # Active fire consumes fuel and radiates heat
                if cell.state == STATE_FIRE:
                    cell.fuel_load = max(0.0, cell.fuel_load - (0.5 * dt_seconds))
                    if cell.fuel_load <= 0:
                        cell.state = STATE_BLOCKED  # Burned out, charred/blocked
                    else:
                        cell.temperature_c = min(900.0, cell.temperature_c + (5.0 * dt_seconds))
                        
                    # Thermal conduction to 4-neighborhood
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < self.rows and 0 <= nc < self.cols:
                            n_cell = self.grid[nr][nc]
                            if n_cell.is_wall:
                                continue  # Walls impede conduction
                            # Conduction rate
                            heat_transfer = (cell.temperature_c - n_cell.temperature_c) * spread_factor * dt_seconds
                            new_temps[nr][nc] += heat_transfer

        # Update states based on new temperature distribution
        for r in range(self.rows):
            for c in range(self.cols):
                cell = self.grid[r][c]
                cell.temperature_c = max(22.0, new_temps[r][c])
                
                if cell.state not in (STATE_FIRE, STATE_BLOCKED):
                    if cell.temperature_c >= 300.0:
                        cell.state = STATE_FIRE
                    elif cell.temperature_c >= 65.0:
                        cell.state = STATE_HEATING
                    elif cell.temperature_c > 35.0:
                        cell.state = STATE_SMOKE

    def get_active_fire_cells(self) -> List[Dict[str, Any]]:
        """Returns list of cells currently burning or heating."""
        active = []
        for r in range(self.rows):
            for c in range(self.cols):
                cell = self.grid[r][c]
                if cell.state in (STATE_FIRE, STATE_HEATING):
                    active.append({
                        "x_m": round(c * self.cell_size_m, 1),
                        "y_m": round(r * self.cell_size_m, 1),
                        "state": cell.state,
                        "temp_c": round(cell.temperature_c, 1)
                    })
        return active
