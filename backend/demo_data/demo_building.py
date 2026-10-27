"""Preloaded comprehensive demonstration building model and emergency scenario for FIREXIS."""
from typing import Dict, Any

def get_demo_building_data() -> Dict[str, Any]:
    """Returns a fully populated, multi-floor demonstration building as required by Section 34."""
    return {
        "building": {
            "id": "bld-nexus-01",
            "name": "Nexus Innovation Complex",
            "building_type": "Mixed-Use Commercial & Tech R&D",
            "construction_type": "Type I - Fire Resistive (Reinforced Concrete)",
            "total_floors": 3,
            "gross_area_sqm": 3600.0,
            "max_occupancy": 350,
            "location": "Innovation District, Sector 4"
        },
        "floors": [
            {
                "id": "floor-0",
                "floor_number": 0,
                "name": "Level 0 — Ground Floor & Egress Concourse",
                "elevation_m": 0.0,
                "width_m": 70.0,
                "length_m": 45.0,
                "scale_ppm": 20.0,
                "rooms": [
                    {"id": "rm-g01", "name": "Main Reception & Atrium", "bounds": {"x": 10, "y": 10, "width": 15, "height": 12}, "occupant_load": 25},
                    {"id": "rm-g02", "name": "Auditorium / Conference Hall", "bounds": {"x": 30, "y": 10, "width": 20, "height": 14}, "occupant_load": 45},
                    {"id": "rm-g03", "name": "Security & Incident Command Room", "bounds": {"x": 10, "y": 28, "width": 12, "height": 10}, "occupant_load": 6},
                    {"id": "rm-g04", "name": "Cafeteria & Dining Lounge", "bounds": {"x": 26, "y": 28, "width": 22, "height": 12}, "occupant_load": 30},
                    {"id": "rm-g05", "name": "Facilities & Primary Server Hub", "bounds": {"x": 52, "y": 26, "width": 14, "height": 14}, "occupant_load": 8}
                ],
                "corridors": [
                    {"id": "cor-g1", "name": "Central Concourse Spine", "position": {"x": 35, "y": 24}, "capacity": 100},
                    {"id": "cor-g2", "name": "East Gallery Hallway", "position": {"x": 55, "y": 20}, "capacity": 50},
                    {"id": "cor-g3", "name": "West Gallery Hallway", "position": {"x": 18, "y": 24}, "capacity": 50}
                ],
                "doors": [
                    {"id": "dr-g01", "name": "Atrium South Door", "position": {"x": 18, "y": 22}, "width_m": 1.8, "connects": ["rm-g01", "cor-g3"]},
                    {"id": "dr-g02", "name": "Auditorium Main Double Door", "position": {"x": 35, "y": 24}, "width_m": 2.4, "connects": ["rm-g02", "cor-g1"]},
                    {"id": "dr-g03", "name": "Security Door", "position": {"x": 18, "y": 28}, "width_m": 1.0, "connects": ["rm-g03", "cor-g3"]},
                    {"id": "dr-g04", "name": "Cafeteria Door A", "position": {"x": 30, "y": 26}, "width_m": 1.6, "connects": ["rm-g04", "cor-g1"]},
                    {"id": "dr-g05", "name": "Cafeteria Door B", "position": {"x": 45, "y": 26}, "width_m": 1.4, "connects": ["rm-g04", "cor-g2"]},
                    {"id": "dr-g06", "name": "Server Hub Fire Door", "position": {"x": 52, "y": 24}, "width_m": 1.2, "connects": ["rm-g05", "cor-g2"]}
                ],
                "exits": [
                    {"id": "exit-north", "name": "North Main Plaza Exit", "position": {"x": 35, "y": 2}, "discharge_type": "OUTSIDE", "capacity_persons_min": 150, "is_blocked": False, "connects": ["cor-g1"]},
                    {"id": "exit-south", "name": "South Boulevard Exit", "position": {"x": 35, "y": 42}, "discharge_type": "OUTSIDE", "capacity_persons_min": 120, "is_blocked": False, "connects": ["cor-g1"]},
                    {"id": "exit-west", "name": "West Emergency Egress", "position": {"x": 2, "y": 24}, "discharge_type": "OUTSIDE", "capacity_persons_min": 90, "is_blocked": False, "connects": ["cor-g3"]},
                    {"id": "exit-east", "name": "East Service & Loading Exit", "position": {"x": 68, "y": 24}, "discharge_type": "OUTSIDE", "capacity_persons_min": 80, "is_blocked": True, "connects": ["cor-g2"]}
                ],
                "staircases": [
                    {"id": "stair-west", "name": "Stairwell Core A (Pressurized West)", "position": {"x": 6, "y": 14}, "capacity": 120, "connects": ["cor-g3"]},
                    {"id": "stair-east", "name": "Stairwell Core B (East Tower)", "position": {"x": 64, "y": 14}, "capacity": 120, "connects": ["cor-g2"]}
                ],
                "equipment": [
                    {"id": "eq-ext-01", "name": "Reception ABC Extinguisher 6kg", "equipment_type": "EXTINGUISHER_ABC", "position": {"x": 11, "y": 12}, "status": "OPERATIONAL"},
                    {"id": "eq-ext-02", "name": "Auditorium CO2 Extinguisher 5kg", "equipment_type": "EXTINGUISHER_CO2", "position": {"x": 32, "y": 12}, "status": "OPERATIONAL"},
                    {"id": "eq-ext-03", "name": "Server Hub Clean Agent Extinguisher", "equipment_type": "EXTINGUISHER", "position": {"x": 54, "y": 28}, "status": "OPERATIONAL"},
                    {"id": "eq-hose-01", "name": "Central Concourse Hose Reel (30m)", "equipment_type": "HOSE_REEL", "position": {"x": 36, "y": 23}, "status": "OPERATIONAL"},
                    {"id": "eq-alarm-01", "name": "Manual Fire Alarm Pull Station (North)", "equipment_type": "ALARM", "position": {"x": 34, "y": 4}, "status": "OPERATIONAL"},
                    {"id": "eq-alarm-02", "name": "Manual Fire Alarm Pull Station (East)", "equipment_type": "ALARM", "position": {"x": 66, "y": 23}, "status": "OPERATIONAL"},
                    {"id": "eq-assembly-01", "name": "Designated Assembly Point Alpha (Plaza)", "equipment_type": "ASSEMBLY_POINT", "position": {"x": 35, "y": -15}, "status": "OPERATIONAL"}
                ]
            },
            {
                "id": "floor-1",
                "floor_number": 1,
                "name": "Level 1 — Software Labs & Collaboration",
                "elevation_m": 4.0,
                "width_m": 70.0,
                "length_m": 45.0,
                "scale_ppm": 20.0,
                "rooms": [
                    {"id": "rm-101", "name": "AI Engineering Lab", "bounds": {"x": 10, "y": 10, "width": 22, "height": 14}, "occupant_load": 30},
                    {"id": "rm-102", "name": "Hardware Prototyping Hub", "bounds": {"x": 38, "y": 10, "width": 24, "height": 14}, "occupant_load": 25},
                    {"id": "rm-103", "name": "Design Studio & Testing Suites", "bounds": {"x": 10, "y": 28, "width": 24, "height": 12}, "occupant_load": 20},
                    {"id": "rm-104", "name": "Operations Center", "bounds": {"x": 38, "y": 28, "width": 24, "height": 12}, "occupant_load": 20}
                ],
                "corridors": [
                    {"id": "cor-1a", "name": "Level 1 Central Walkway", "position": {"x": 35, "y": 24}, "capacity": 80}
                ],
                "doors": [
                    {"id": "dr-101", "name": "Lab 101 Egress", "position": {"x": 22, "y": 24}, "width_m": 1.4, "connects": ["rm-101", "cor-1a"]},
                    {"id": "dr-102", "name": "Prototyping Egress", "position": {"x": 45, "y": 24}, "width_m": 1.4, "connects": ["rm-102", "cor-1a"]}
                ],
                "exits": [],
                "staircases": [
                    {"id": "stair-west-f1", "name": "Stairwell West Descent", "position": {"x": 6, "y": 14}, "capacity": 120, "connects": ["cor-1a"]},
                    {"id": "stair-east-f1", "name": "Stairwell East Descent", "position": {"x": 64, "y": 14}, "capacity": 120, "connects": ["cor-1a"]}
                ],
                "equipment": [
                    {"id": "eq-1-ext-01", "name": "Lab Extinguisher ABC", "equipment_type": "EXTINGUISHER_ABC", "position": {"x": 24, "y": 23}, "status": "OPERATIONAL"}
                ]
            }
        ],
        "scenario": {
            "name": "East Wing Server Room Electrical Flashover",
            "fire_origin": {"x": 54.0, "y": 26.0, "floor_id": "floor-0", "label": "Server Hub"},
            "blocked_exit_id": "exit-east",
            "total_occupants": 114,
            "mobility_impaired_count": 8,
            "fire_intensity": "HIGH",
            "smoke_dispersion_rate": "MODERATE_RAPID"
        }
    }
