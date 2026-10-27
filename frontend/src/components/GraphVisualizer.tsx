import React, { useState, useEffect } from 'react';
import { FloorData, GraphNode, GraphEdge } from '../types';
import { api } from '../services/api';
import { 
  GitFork, 
  Play, 
  AlertOctagon, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Zap,
  Clock,
  Compass
} from 'lucide-react';

interface GraphVisualizerProps {
  floorData: FloorData;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ floorData }) => {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [dfsResult, setDfsResult] = useState<any>(null);
  const [bfsHops, setBfsHops] = useState<Record<string, number>>({});
  const [dijkstraRoutes, setDijkstraRoutes] = useState<Record<string, any>>({});
  const [selectedAlgo, setSelectedAlgo] = useState<'DFS' | 'BFS' | 'DIJKSTRA' | 'ASTAR'>('DIJKSTRA');
  const [selectedStartNode, setSelectedStartNode] = useState<string>('rm-g02');
  const [isLoading, setIsLoading] = useState(false);

  const scale = 11;

  useEffect(() => {
    fetchGraphAnalysis();
  }, [floorData]);

  const fetchGraphAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await api.analyzeGraph(floorData);
      setGraphData(res.graph);
      setDfsResult(res.connectivity_dfs);
      setBfsHops(res.exit_hops_bfs || {});
      setDijkstraRoutes(res.optimal_routes_dijkstra || {});
    } catch (err) {
      console.error('Error fetching graph analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeRoute = dijkstraRoutes[selectedStartNode];
  const highlightedNodeIds = new Set(activeRoute?.path || []);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', color: 'var(--color-navy-deep)' }}>
            Topological Graph Algorithm Engine
          </h1>
          <span className="badge badge-navy">SECTION 10 & 11 COMPLIANT</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Translates physical floor plans into network graphs. Runs DFS connectivity, BFS exit hops, Dijkstra distance weights, and A* dynamic routing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        
        {/* Left Algorithm Controller */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
              Select Algorithm (Section 11)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(['DFS', 'BFS', 'DIJKSTRA', 'ASTAR'] as const).map(algo => (
                <button
                  key={algo}
                  onClick={() => setSelectedAlgo(algo)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: selectedAlgo === algo ? 'var(--color-primary-orange)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedAlgo === algo ? '#FFFFFF' : '#94A3B8',
                    border: selectedAlgo === algo ? '1px solid var(--color-primary-orange)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
              Starting Room / Node
            </label>
            <select
              value={selectedStartNode}
              onChange={(e) => setSelectedStartNode(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '6px' }}
            >
              {floorData.rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
              ))}
            </select>
          </div>

          {/* Algorithm Telemetry Results */}
          <div style={{ borderTop: '1px solid var(--color-soft-gray)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
              Computational Output
            </div>

            {selectedAlgo === 'DFS' && (
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fully Connected:</span>
                  <strong style={{ color: dfsResult?.is_fully_connected ? 'var(--color-safe-green)' : 'var(--color-danger-red)' }}>
                    {dfsResult?.is_fully_connected ? 'YES' : 'NO (Blocked Exit)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Components:</span>
                  <strong>{dfsResult?.total_components || 1}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Isolated Dead-Ends:</span>
                  <strong style={{ color: dfsResult?.isolated_components_count > 0 ? 'var(--color-danger-red)' : 'var(--color-safe-green)' }}>
                    {dfsResult?.isolated_components_count || 0}
                  </strong>
                </div>
              </div>
            )}

            {selectedAlgo === 'BFS' && (
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hops to Nearest Exit:</span>
                  <strong className="mono-metric" style={{ fontSize: '16px', color: 'var(--color-primary-orange)' }}>
                    {bfsHops[selectedStartNode] ?? 'N/A'} Doors/Junctions
                  </strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Evaluates unweighted topological distance to ensure room egress hop limits comply with code.
                </div>
              </div>
            )}

            {(selectedAlgo === 'DIJKSTRA' || selectedAlgo === 'ASTAR') && activeRoute && (
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ backgroundColor: '#E6F6F4', border: '1px solid #B8E4DE', borderRadius: '4px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Discharge Target</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-safe-green)', fontSize: '14px' }}>{activeRoute.exit_name}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Travel Distance:</span>
                  <strong className="mono-metric">{activeRoute.physical_distance_meters} m</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Time:</span>
                  <strong className="mono-metric" style={{ color: 'var(--color-primary-orange)' }}>{activeRoute.estimated_time_seconds} s</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Route Nodes:</span>
                  <strong className="mono-metric">{activeRoute.path?.length} waypoints</strong>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={fetchGraphAnalysis}
            className="btn-secondary"
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            Re-run Graph Analytics
          </button>
        </div>

        {/* Right Topological Graph Visualizer Canvas */}
        <div className="card" style={{ padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Topological Overlay: Vertices = Rooms/Doors/Exits | Edges = Walkways
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1D3557' }} /> Room
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2A9D8F' }} /> Exit
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F4A261' }} /> Active Path
              </span>
            </div>
          </div>

          <div style={{
            position: 'relative',
            width: 840,
            height: 520,
            backgroundColor: '#0F172A', // Dark engineering graph backdrop for high-contrast graph visualization
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <svg width={840} height={520}>
              {/* Edges */}
              {graphData?.edges.map((edge, idx) => {
                const uNode = graphData.nodes.find(n => n.id === edge.u);
                const vNode = graphData.nodes.find(n => n.id === edge.v);
                if (!uNode || !vNode) return null;

                const isPathEdge = highlightedNodeIds.has(edge.u) && highlightedNodeIds.has(edge.v);

                return (
                  <line
                    key={idx}
                    x1={uNode.x * scale}
                    y1={uNode.y * scale}
                    x2={vNode.x * scale}
                    y2={vNode.y * scale}
                    stroke={isPathEdge ? 'var(--color-primary-orange)' : '#334155'}
                    strokeWidth={isPathEdge ? 4 : 1.5}
                    strokeDasharray={edge.is_stair ? '4 2' : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {graphData?.nodes.map(node => {
                const isSelectedStart = node.id === selectedStartNode;
                const isPathNode = highlightedNodeIds.has(node.id);
                const isExit = node.type === 'exit';

                return (
                  <g key={node.id} onClick={() => setSelectedStartNode(node.id)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={node.x * scale}
                      cy={node.y * scale}
                      r={isExit ? 12 : isSelectedStart ? 10 : 7}
                      fill={
                        node.is_blocked ? 'var(--color-danger-red)' :
                        isExit ? 'var(--color-safe-green)' :
                        isSelectedStart ? 'var(--color-primary-orange)' :
                        isPathNode ? '#E76F51' :
                        node.type === 'room' ? '#38BDF8' : '#94A3B8'
                      }
                      stroke="#FFFFFF"
                      strokeWidth={isSelectedStart || isExit ? 2.5 : 1.2}
                    />
                    <text
                      x={node.x * scale}
                      y={(node.y * scale) - 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#E2E8F0"
                      fontWeight="500"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};
