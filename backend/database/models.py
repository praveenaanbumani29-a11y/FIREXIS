"""SQLAlchemy database models for FIREXIS."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from backend.database.connection import Base

def gen_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    buildings = relationship("Building", back_populates="project", cascade="all, delete-orphan")

class Building(Base):
    __tablename__ = "buildings"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    building_type = Column(String(100), default="Commercial Office")
    construction_type = Column(String(100), default="Type I - Fire Resistive")
    total_floors = Column(Integer, default=1)
    gross_area_sqm = Column(Float, default=1200.0)
    max_occupancy = Column(Integer, default=200)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="buildings")
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    simulations = relationship("SimulationRun", back_populates="building", cascade="all, delete-orphan")

class Floor(Base):
    __tablename__ = "floors"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    building_id = Column(String(36), ForeignKey("buildings.id"), nullable=False)
    floor_number = Column(Integer, nullable=False, default=0)
    name = Column(String(100), nullable=False, default="Ground Floor")
    elevation_m = Column(Float, default=0.0)
    width_m = Column(Float, default=60.0)
    length_m = Column(Float, default=40.0)
    scale_ppm = Column(Float, default=20.0)  # Pixels per meter
    layout_data = Column(JSON, default=dict)  # Stores serialized CAD elements (walls, corridors, etc.)
    
    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor", cascade="all, delete-orphan")
    doors = relationship("Door", back_populates="floor", cascade="all, delete-orphan")
    exits = relationship("EmergencyExit", back_populates="floor", cascade="all, delete-orphan")
    equipment = relationship("SafetyEquipment", back_populates="floor", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=False)
    name = Column(String(100), nullable=False)
    room_type = Column(String(50), default="Office")
    bounds = Column(JSON, nullable=False)  # {x, y, width, height} or polygon
    area_sqm = Column(Float, default=50.0)
    occupant_load = Column(Integer, default=10)
    
    floor = relationship("Floor", back_populates="rooms")

class Door(Base):
    __tablename__ = "doors"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=False)
    name = Column(String(100), default="Door")
    position = Column(JSON, nullable=False)  # {x, y}
    width_m = Column(Float, default=1.0)
    is_fire_rated = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    connects = Column(JSON, default=list)  # [room_id_1, room_id_2 or corridor]
    
    floor = relationship("Floor", back_populates="doors")

class EmergencyExit(Base):
    __tablename__ = "emergency_exits"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=False)
    name = Column(String(100), nullable=False)
    position = Column(JSON, nullable=False)  # {x, y}
    discharge_type = Column(String(50), default="OUTSIDE")  # OUTSIDE, STAIRWELL
    capacity_persons_min = Column(Integer, default=80)
    is_blocked = Column(Boolean, default=False)
    
    floor = relationship("Floor", back_populates="exits")

class SafetyEquipment(Base):
    __tablename__ = "safety_equipment"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=False)
    equipment_type = Column(String(50), nullable=False)  # EXTINGUISHER, HOSE_REEL, ALARM, SPRINKLER, ASSEMBLY_POINT
    name = Column(String(100), nullable=False)
    position = Column(JSON, nullable=False)  # {x, y}
    status = Column(String(50), default="OPERATIONAL")
    
    floor = relationship("Floor", back_populates="equipment")

class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    building_id = Column(String(36), ForeignKey("buildings.id"), nullable=False)
    name = Column(String(255), nullable=False)
    scenario_type = Column(String(100), default="STANDARD_FIRE")
    total_occupants = Column(Integer, default=0)
    evacuated_count = Column(Integer, default=0)
    evacuating_count = Column(Integer, default=0)
    at_risk_count = Column(Integer, default=0)
    evacuation_time_seconds = Column(Float, default=0.0)
    parameters = Column(JSON, default=dict)
    summary_metrics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    building = relationship("Building", back_populates="simulations")
    risk_zones = relationship("RiskZone", back_populates="simulation", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="simulation", cascade="all, delete-orphan")

class RiskZone(Base):
    __tablename__ = "risk_zones"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    simulation_id = Column(String(36), ForeignKey("simulation_runs.id"), nullable=False)
    floor_id = Column(String(36), nullable=False)
    zone_name = Column(String(100), nullable=False)
    risk_level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    hazard_factor = Column(String(100), default="Distance to exit")
    details = Column(JSON, default=dict)
    
    simulation = relationship("SimulationRun", back_populates="risk_zones")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    simulation_id = Column(String(36), ForeignKey("simulation_runs.id"), nullable=False)
    category = Column(String(50), nullable=False)  # EXIT, ROUTE, EQUIPMENT, SIGNAGE
    affected_area = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    expected_benefit = Column(String(255), nullable=False)
    confidence_score = Column(Float, default=0.85)
    simulation_evidence = Column(JSON, default=dict)
    
    simulation = relationship("SimulationRun", back_populates="recommendations")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    building_id = Column(String(36), nullable=False)
    simulation_id = Column(String(36), nullable=True)
    title = Column(String(255), nullable=False)
    report_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
