import type { BuildingData, FloorData, Room, Corridor, Door, EmergencyExit, Staircase, SafetyEquipment } from '../types';

export interface LayoutArchetype {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultRoomsPerFloor: number;
  icon: string;
  recommendedExits: number;
  previewRooms: string[];
}

export const ARCHETYPES: LayoutArchetype[] = [
  {
    id: 'TECH_COMMERCIAL',
    name: 'Tech Innovation Complex & R&D Hub',
    category: 'Commercial / R&D',
    description: 'High-tech facility with central atrium, server hub, AI robotics labs, and dual-wing egress concourse.',
    defaultRoomsPerFloor: 5,
    icon: '⚡',
    recommendedExits: 4,
    previewRooms: ['Atrium & Main Reception', 'Auditorium Hall', 'Server Data Hub', 'AI Engineering Lab', 'Hardware Prototyping']
  },
  {
    id: 'CORPORATE_HQ',
    name: 'Corporate Headquarters & Executive Tower',
    category: 'Business / Office',
    description: 'Multi-tenant commercial headquarters with grand reception, executive boardrooms, meeting suites, and client lounges.',
    defaultRoomsPerFloor: 6,
    icon: '🏛️',
    recommendedExits: 4,
    previewRooms: ['Executive Boardroom', 'Client Briefing Center', 'Open Collaboration Hub', 'Financial Strategy Room', 'Sky Terrace']
  },
  {
    id: 'HEALTHCARE',
    name: 'Hospital & Emergency Care Center',
    category: 'Healthcare / Critical',
    description: 'Life-safety priority design with wide emergency egress paths, triage bays, intensive care units, and clinical labs.',
    defaultRoomsPerFloor: 6,
    icon: '🏥',
    recommendedExits: 4,
    previewRooms: ['Emergency Triage & Reception', 'ICU Care Suites', 'Diagnostic Imaging Lab', 'Surgery Prep Wing', 'Central Pharmacy']
  },
  {
    id: 'UNIVERSITY',
    name: 'University Academic & Research Campus',
    category: 'Educational / Assembly',
    description: 'High-occupancy educational building with tiered lecture theaters, digital library, research studios, and seminar suites.',
    defaultRoomsPerFloor: 5,
    icon: '🎓',
    recommendedExits: 4,
    previewRooms: ['Grand Lecture Amphitheater', 'Digital Research Commons', 'Advanced Computing Lab', 'Faculty Briefing Room', 'Student Concourse']
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics Distribution & Industrial Hub',
    category: 'Industrial / Logistics',
    description: 'Spacious industrial facility with primary loading docks, sorting zones, operations command room, and high-bay safety zones.',
    defaultRoomsPerFloor: 4,
    icon: '📦',
    recommendedExits: 4,
    previewRooms: ['Inbound Staging Bay', 'Automated Sorting Center', 'Operations Control Deck', 'Hazardous Materials Vault']
  }
];

export interface GenerationOptions {
  buildingName: string;
  totalFloors: number;
  archetypeId: string;
  grossAreaSqm?: number;
  location?: string;
  buildingType?: string;
}

export function generateArchitecturalBuilding(opts: GenerationOptions): BuildingData {
  const totalFloors = Math.max(1, Math.min(10, opts.totalFloors || 3));
  const archetype = ARCHETYPES.find(a => a.id === opts.archetypeId) || ARCHETYPES[0];
  const width_m = 70.0;
  const length_m = 45.0;

  const floors: FloorData[] = [];

  for (let floorIdx = 0; floorIdx < totalFloors; floorIdx++) {
    const isGround = floorIdx === 0;
    const floorElevation = floorIdx * 4.0;
    const floorName = isGround 
      ? `Level 0 — Ground Floor & Egress Concourse`
      : floorIdx === 1 
      ? `Level 1 — Collaboration & Operations Deck`
      : floorIdx === 2
      ? `Level 2 — Executive Suites & Sky Terrace`
      : `Level ${floorIdx} — Specialized Facility Level`;

    // Generate balanced, non-overlapping rooms tailored to archetype
    const rooms: Room[] = [];
    const corridors: Corridor[] = [];
    const doors: Door[] = [];
    const exits: EmergencyExit[] = [];
    const staircases: Staircase[] = [];
    const equipment: SafetyEquipment[] = [];

    // Central Concourse Corridor
    const centralCorridorId = `cor-${floorIdx}-main`;
    corridors.push({
      id: centralCorridorId,
      name: `Level ${floorIdx} Central Concourse Spine`,
      position: { x: 35.0, y: 22.5 },
      capacity: 120
    });

    // West Gallery Corridor
    const westCorridorId = `cor-${floorIdx}-west`;
    corridors.push({
      id: westCorridorId,
      name: `West Gallery Hallway`,
      position: { x: 18.0, y: 22.5 },
      capacity: 80
    });

    // East Gallery Corridor
    const eastCorridorId = `cor-${floorIdx}-east`;
    corridors.push({
      id: eastCorridorId,
      name: `East Gallery Hallway`,
      position: { x: 52.0, y: 22.5 },
      capacity: 80
    });

    // Rooms based on archetype & level
    let roomSpecs: Array<{ name: string; bounds: { x: number; y: number; width: number; height: number }; load: number }> = [];

    if (archetype.id === 'TECH_COMMERCIAL') {
      if (isGround) {
        roomSpecs = [
          { name: 'Main Reception & Atrium', bounds: { x: 10, y: 7, width: 16, height: 12 }, load: 30 },
          { name: 'Auditorium / Conference Hall', bounds: { x: 30, y: 6, width: 22, height: 13 }, load: 50 },
          { name: 'Security & Incident Command Room', bounds: { x: 10, y: 27, width: 14, height: 11 }, load: 8 },
          { name: 'Cafeteria & Dining Lounge', bounds: { x: 27, y: 27, width: 22, height: 12 }, load: 35 },
          { name: 'Facilities & Primary Server Hub', bounds: { x: 52, y: 26, width: 14, height: 13 }, load: 10 }
        ];
      } else if (floorIdx === 1) {
        roomSpecs = [
          { name: 'AI Engineering Lab', bounds: { x: 10, y: 7, width: 22, height: 13 }, load: 30 },
          { name: 'Hardware Prototyping Hub', bounds: { x: 38, y: 7, width: 22, height: 13 }, load: 25 },
          { name: 'Design Studio & Testing Suites', bounds: { x: 10, y: 27, width: 22, height: 12 }, load: 20 },
          { name: 'Operations Center', bounds: { x: 38, y: 27, width: 22, height: 12 }, load: 20 }
        ];
      } else {
        roomSpecs = [
          { name: `Level ${floorIdx} Executive Boardroom`, bounds: { x: 10, y: 7, width: 22, height: 13 }, load: 20 },
          { name: `Advanced Robotics & R&D Lab`, bounds: { x: 38, y: 7, width: 22, height: 13 }, load: 25 },
          { name: `Operations Strategy Room`, bounds: { x: 10, y: 27, width: 22, height: 12 }, load: 15 },
          { name: `Sky Terrace & Solar Deck`, bounds: { x: 38, y: 27, width: 22, height: 12 }, load: 20 }
        ];
      }
    } else if (archetype.id === 'CORPORATE_HQ') {
      if (isGround) {
        roomSpecs = [
          { name: 'Grand Lobby & Concierge', bounds: { x: 10, y: 7, width: 18, height: 12 }, load: 40 },
          { name: 'Town Hall Auditorium', bounds: { x: 32, y: 6, width: 22, height: 13 }, load: 60 },
          { name: 'Security & Access Control', bounds: { x: 10, y: 27, width: 14, height: 11 }, load: 6 },
          { name: 'Executive Cafe & Barista', bounds: { x: 28, y: 27, width: 20, height: 12 }, load: 30 },
          { name: 'Logistics Mailroom', bounds: { x: 52, y: 26, width: 14, height: 13 }, load: 8 }
        ];
      } else {
        roomSpecs = [
          { name: `Level ${floorIdx} Boardroom Suite`, bounds: { x: 10, y: 7, width: 22, height: 13 }, load: 25 },
          { name: `Open Collaboration Workhub`, bounds: { x: 38, y: 7, width: 22, height: 13 }, load: 35 },
          { name: `Client Presentation Theater`, bounds: { x: 10, y: 27, width: 22, height: 12 }, load: 20 },
          { name: `Financial Analytics Deck`, bounds: { x: 38, y: 27, width: 22, height: 12 }, load: 25 }
        ];
      }
    } else if (archetype.id === 'HEALTHCARE') {
      if (isGround) {
        roomSpecs = [
          { name: 'Emergency Triage & Ambulatory', bounds: { x: 10, y: 7, width: 20, height: 13 }, load: 30 },
          { name: 'Trauma Bay 1 & Resuscitation', bounds: { x: 34, y: 6, width: 20, height: 13 }, load: 15 },
          { name: 'Admissions & Patient Registration', bounds: { x: 10, y: 27, width: 16, height: 11 }, load: 20 },
          { name: 'Diagnostic Imaging (CT/X-Ray)', bounds: { x: 30, y: 27, width: 18, height: 12 }, load: 12 },
          { name: 'Clean Utility & Pharmacy', bounds: { x: 52, y: 26, width: 14, height: 13 }, load: 8 }
        ];
      } else {
        roomSpecs = [
          { name: `Level ${floorIdx} Intensive Care Unit`, bounds: { x: 10, y: 7, width: 22, height: 13 }, load: 16 },
          { name: `Surgical Theatre Suite`, bounds: { x: 38, y: 7, width: 22, height: 13 }, load: 12 },
          { name: `Nurse Station & Monitoring`, bounds: { x: 10, y: 27, width: 22, height: 12 }, load: 14 },
          { name: `Patient Recovery Wing`, bounds: { x: 38, y: 27, width: 22, height: 12 }, load: 18 }
        ];
      }
    } else if (archetype.id === 'UNIVERSITY') {
      if (isGround) {
        roomSpecs = [
          { name: 'Grand Lecture Amphitheater', bounds: { x: 10, y: 7, width: 24, height: 13 }, load: 75 },
          { name: 'Student Union & Commons', bounds: { x: 38, y: 7, width: 20, height: 13 }, load: 45 },
          { name: 'Campus Safety Dispatch', bounds: { x: 10, y: 27, width: 14, height: 11 }, load: 6 },
          { name: 'Bookstore & Digital Services', bounds: { x: 28, y: 27, width: 20, height: 12 }, load: 25 },
          { name: 'Central Server Core', bounds: { x: 52, y: 26, width: 14, height: 13 }, load: 8 }
        ];
      } else {
        roomSpecs = [
          { name: `Level ${floorIdx} Computing Laboratory`, bounds: { x: 10, y: 7, width: 22, height: 13 }, load: 35 },
          { name: `Digital Library & Research Stacks`, bounds: { x: 38, y: 7, width: 22, height: 13 }, load: 40 },
          { name: `Seminar Classroom Alpha`, bounds: { x: 10, y: 27, width: 22, height: 12 }, load: 28 },
          { name: `Faculty Office Suites`, bounds: { x: 38, y: 27, width: 22, height: 12 }, load: 20 }
        ];
      }
    } else { // LOGISTICS
      roomSpecs = [
        { name: 'Inbound Staging Bay', bounds: { x: 10, y: 7, width: 24, height: 13 }, load: 25 },
        { name: 'Automated Sorting Hub', bounds: { x: 38, y: 7, width: 22, height: 13 }, load: 20 },
        { name: 'Fleet Operations Control', bounds: { x: 10, y: 27, width: 22, height: 12 }, load: 15 },
        { name: 'High-Value Storage Vault', bounds: { x: 38, y: 27, width: 22, height: 12 }, load: 10 }
      ];
    }

    // Populate rooms and connecting doors
    roomSpecs.forEach((spec, rIdx) => {
      const roomId = `rm-f${floorIdx}-${rIdx + 1}`;
      rooms.push({
        id: roomId,
        name: spec.name,
        bounds: spec.bounds,
        occupant_load: spec.load
      });

      // Calculate connecting door point
      const isUpper = spec.bounds.y < 20;
      const doorY = isUpper ? spec.bounds.y + spec.bounds.height : spec.bounds.y;
      const doorX = spec.bounds.x + spec.bounds.width / 2;

      doors.push({
        id: `dr-f${floorIdx}-${rIdx + 1}`,
        name: `${spec.name} Egress`,
        position: { x: doorX, y: doorY },
        width_m: 1.6,
        connects: [roomId, centralCorridorId]
      });

      // Extinguisher near doorway
      equipment.push({
        id: `eq-ext-f${floorIdx}-${rIdx + 1}`,
        name: `Extinguisher (${spec.name.slice(0, 15)})`,
        equipment_type: 'EXTINGUISHER_ABC',
        position: { x: doorX + 2, y: doorY + (isUpper ? 1 : -1) },
        status: 'OPERATIONAL'
      });
    });

    // Dual Stairwell Cores (Continuous on all floors)
    staircases.push({
      id: `stair-west-f${floorIdx}`,
      name: `Stairwell Core A (Pressurized West)`,
      position: { x: 6, y: 14 },
      capacity: 120,
      connects: [westCorridorId]
    });

    staircases.push({
      id: `stair-east-f${floorIdx}`,
      name: `Stairwell Core B (East Tower)`,
      position: { x: 64, y: 14 },
      capacity: 120,
      connects: [eastCorridorId]
    });

    // Exits (Ground floor has direct discharge outside)
    if (isGround) {
      exits.push({
        id: `exit-north`,
        name: `North Main Plaza Exit`,
        position: { x: 35, y: 2 },
        discharge_type: 'OUTSIDE',
        capacity_persons_min: 160,
        is_blocked: false,
        connects: [centralCorridorId]
      });
      exits.push({
        id: `exit-south`,
        name: `South Boulevard Exit`,
        position: { x: 35, y: 43 },
        discharge_type: 'OUTSIDE',
        capacity_persons_min: 140,
        is_blocked: false,
        connects: [centralCorridorId]
      });
      exits.push({
        id: `exit-west`,
        name: `West Emergency Egress`,
        position: { x: 2, y: 22.5 },
        discharge_type: 'OUTSIDE',
        capacity_persons_min: 100,
        is_blocked: false,
        connects: [westCorridorId]
      });
      exits.push({
        id: `exit-east`,
        name: `East Service Exit`,
        position: { x: 68, y: 22.5 },
        discharge_type: 'OUTSIDE',
        capacity_persons_min: 90,
        is_blocked: true,
        connects: [eastCorridorId]
      });
    }

    // Additional life safety equipment
    equipment.push({
      id: `eq-hose-f${floorIdx}`,
      name: `Concourse Hose Reel (30m)`,
      equipment_type: 'HOSE_REEL',
      position: { x: 36, y: 22.5 },
      status: 'OPERATIONAL'
    });

    floors.push({
      id: `floor-${floorIdx}`,
      floor_number: floorIdx,
      name: floorName,
      elevation_m: floorElevation,
      width_m,
      length_m,
      scale_ppm: 20.0,
      rooms,
      corridors,
      doors,
      exits,
      staircases,
      equipment
    });
  }

  // Calculate realistic totals
  const totalOccupants = floors.reduce((acc, f) => acc + f.rooms.reduce((rAcc, r) => rAcc + r.occupant_load, 0), 0);

  return {
    building: {
      id: `bld-${Date.now().toString().slice(-6)}`,
      name: opts.buildingName || archetype.name,
      building_type: opts.buildingType || archetype.category,
      construction_type: 'Type I - Fire Resistive (Reinforced Concrete)',
      total_floors: totalFloors,
      gross_area_sqm: opts.grossAreaSqm || (totalFloors * width_m * length_m),
      max_occupancy: Math.round(totalOccupants * 1.3),
      location: opts.location || 'Metropolitan Core District'
    },
    floors,
    scenario: {
      name: `${archetype.name} Incident Simulation`,
      fire_origin: { x: 52.0, y: 26.0, floor_id: 'floor-0', label: 'Primary Hazard Zone' },
      blocked_exit_id: 'exit-east',
      total_occupants: totalOccupants,
      mobility_impaired_count: Math.round(totalOccupants * 0.08),
      fire_intensity: 'HIGH',
      smoke_dispersion_rate: 'MODERATE_RAPID'
    }
  };
}
