import { useEffect, useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { apiFetch } from '../../utils/api';
import type { MemoryNode } from '../../types';
import { Brain, Target, Smile, AlertTriangle, Sparkles, Lock, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Dynamic import for react-force-graph to avoid SSR issues
const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

const TYPE_ICONS: Record<string, any> = {
  mood: Smile,
  goal: Target,
  insight: Sparkles,
  crisis: AlertTriangle,
  gratitude: Brain,
  note: Brain
};

const TYPE_COLORS: Record<string, string> = {
  mood: '#3b82f6',      // blue-500
  goal: '#22c55e',      // green-500
  insight: '#a855f7',   // purple-500
  crisis: '#ef4444',    // red-500
  gratitude: '#eab308', // yellow-500
  note: '#6b7280'       // gray-500
};

const TYPE_BG_COLORS: Record<string, string> = {
  mood: 'bg-blue-500/20 border-blue-500/30',
  goal: 'bg-green-500/20 border-green-500/30',
  insight: 'bg-purple-500/20 border-purple-500/30',
  crisis: 'bg-red-500/20 border-red-500/30',
  gratitude: 'bg-yellow-500/20 border-yellow-500/30',
  note: 'bg-gray-500/20 border-gray-500/30'
};

import { lazy, Suspense } from 'react';

// Graph data structure
interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  type: string;
  content: string;
  sentiment: number;
  timestamp: string;
  encrypted: boolean;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function MemoryGraph() {
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch memories
  useEffect(() => {
    const fetchMemories = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch('/memories');
        setNodes(data);
        
        // Transform to graph format
        const graphNodes: GraphNode[] = data.map((node: MemoryNode) => ({
          id: node.id,
          name: node.type,
          val: Math.abs(node.sentiment) + 1, // Size based on sentiment intensity
          color: TYPE_COLORS[node.type] || '#6b7280',
          type: node.type,
          content: node.content,
          sentiment: node.sentiment,
          timestamp: node.timestamp,
          encrypted: node.encrypted,
        }));

        // Create links between related nodes
        const links: GraphLink[] = [];
        data.forEach((node: MemoryNode, i: number) => {
          // Link to related nodes
          if (node.relatedNodes) {
            node.relatedNodes.forEach((relatedId: string) => {
              links.push({
                source: node.id,
                target: relatedId,
                value: 1
              });
            });
          }
          
          // Link nodes of same type (weaker connection)
          data.forEach((otherNode: MemoryNode, j: number) => {
            if (i !== j && node.type === otherNode.type && Math.random() > 0.7) {
              links.push({
                source: node.id,
                target: otherNode.id,
                value: 0.3
              });
            }
          });
        });

        setGraphData({ nodes: graphNodes, links });
      } catch (error) {
        console.error('Failed to fetch memories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const memoryNode = nodes.find(n => n.id === node.id) || null;
    setSelectedNode(memoryNode);
  }, [nodes]);

  // Custom node canvas drawing
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const x = node.x || 0;
    const y = node.y || 0;
    const size = Math.max(4, (node.val || 1) * 3);
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || '#6b7280';
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();
    
    // Draw label if zoomed in enough
    if (globalScale > 1.2) {
      ctx.font = `${12 / globalScale}px Sans-Serif`;
      ctx.fillStyle = '#eaeaea';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.type, x, y + size + 8 / globalScale);
    }
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.3));
  const handleReset = () => setZoom(1);

  if (isLoading) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <div className="text-sanctuary-light/50">Loading memory graph...</div>
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <div className="text-center text-sanctuary-light/50">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No memories yet.</p>
          <p className="text-sm mt-2">Start adding memories to see your knowledge graph!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-[500px] relative overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-sanctuary-light/10">
            <h3 className="text-xl font-bold text-sanctuary-light">Memory Knowledge Graph</h3>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-sanctuary-light/10 rounded-lg transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-sanctuary-light" />
              </button>
              <span className="text-sm text-sanctuary-light/70 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-sanctuary-light/10 rounded-lg transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-sanctuary-light" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-sanctuary-light/10 rounded-lg transition-colors"
                title="Reset view"
              >
                <Maximize2 className="w-4 h-4 text-sanctuary-light" />
              </button>
            </div>
          </div>

          <div className="absolute inset-0 top-16">
            <Suspense fallback={<div className="text-sanctuary-light/50 p-4">Loading graph...</div>}>
              {graphData.nodes.length > 0 && (
                <ForceGraph2D
                  graphData={graphData}
                  nodeRelSize={6}
                  nodeCanvasObject={nodeCanvasObject}
                  onNodeClick={handleNodeClick}
                  linkWidth={1}
                  linkColor={() => 'rgba(234, 234, 234, 0.2)'}
                  backgroundColor="#1a1a2e"
                  // zoom is controlled via zoomLevel prop in newer versions
                  enableZoomInteraction={true}
                  enablePanInteraction={true}
                  warmupTicks={100}
                  cooldownTicks={50}
                  d3AlphaDecay={0.02}
                  d3VelocityDecay={0.3}
                  nodeLabel={(node: any) => `${node.type}: ${node.content.substring(0, 50)}...`}
                />
              )}
            </Suspense>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-sanctuary-dark/90 backdrop-blur p-3 rounded-lg border border-sanctuary-light/10">
            <p className="text-xs font-medium text-sanctuary-light/70 mb-2">Memory Types</p>
            <div className="space-y-1">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-sanctuary-light capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div>
        {selectedNode ? (
          <Card>
            <div className={`p-4 rounded-xl border ${TYPE_BG_COLORS[selectedNode.type] || TYPE_BG_COLORS.note} mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = TYPE_ICONS[selectedNode.type] || Brain;
                  return <Icon className="w-5 h-5 text-sanctuary-light" />;
                })()}
                <span className="text-sm font-medium uppercase text-sanctuary-light/70">
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-sanctuary-light whitespace-pre-wrap">{selectedNode.content}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-sanctuary-light/50">
                Sentiment: {selectedNode.sentiment > 0 ? '+' : ''}{selectedNode.sentiment}
              </p>
              <p className="text-sm text-sanctuary-light/50">
                {new Date(selectedNode.timestamp).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {selectedNode.encrypted && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  End-to-end encrypted
                </p>
              )}
              {selectedNode.relatedNodes && selectedNode.relatedNodes.length > 0 && (
                <div className="pt-2 border-t border-sanctuary-light/10">
                  <p className="text-xs text-sanctuary-light/50 mb-1">
                    Related memories: {selectedNode.relatedNodes.length}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center text-sanctuary-light/50">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a memory node to view details</p>
              <p className="text-sm mt-2 opacity-70">
                Click and drag to pan, scroll to zoom
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
