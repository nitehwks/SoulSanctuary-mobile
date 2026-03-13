import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { apiFetch } from '../../utils/api';
import type { MemoryNode } from '../../types';
import { Brain, Target, Smile, AlertTriangle, Sparkles } from 'lucide-react';

const TYPE_ICONS = {
  mood: Smile,
  goal: Target,
  insight: Sparkles,
  crisis: AlertTriangle,
  gratitude: Brain
};

const TYPE_COLORS = {
  mood: 'bg-blue-500/20 border-blue-500/30',
  goal: 'bg-green-500/20 border-green-500/30',
  insight: 'bg-purple-500/20 border-purple-500/30',
  crisis: 'bg-red-500/20 border-red-500/30',
  gratitude: 'bg-yellow-500/20 border-yellow-500/30'
};

export function MemoryGraph() {
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);

  useEffect(() => {
    apiFetch('/memories').then(setNodes);
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-[500px] relative overflow-hidden">
          <h3 className="text-xl font-bold text-sanctuary-light mb-4">Memory Knowledge Graph</h3>
          <div className="absolute inset-0 mt-16">
            {/* Simplified force-directed visualization */}
            <svg className="w-full h-full">
              {nodes.map((node, i) => {
                const x = 50 + (i % 5) * 80 + Math.random() * 40;
                const y = 50 + Math.floor(i / 5) * 80 + Math.random() * 40;
                const Icon = TYPE_ICONS[node.type];
                
                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setSelectedNode(node)}
                  >
                    <circle r="20" className={`${TYPE_COLORS[node.type].split(' ')[0]} stroke-current`} />
                    <foreignObject x="-10" y="-10" width="20" height="20">
                      <Icon className="w-5 h-5 text-sanctuary-light" />
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>
      </div>

      <div>
        {selectedNode ? (
          <Card>
            <div className={`p-4 rounded-xl border ${TYPE_COLORS[selectedNode.type]} mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = TYPE_ICONS[selectedNode.type];
                  return <Icon className="w-5 h-5 text-sanctuary-light" />;
                })()}
                <span className="text-sm font-medium uppercase text-sanctuary-light/70">
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-sanctuary-light">{selectedNode.content}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-sanctuary-light/50">
                Sentiment: {selectedNode.sentiment > 0 ? '+' : ''}{selectedNode.sentiment}
              </p>
              <p className="text-sm text-sanctuary-light/50">
                {new Date(selectedNode.timestamp).toLocaleDateString()}
              </p>
              {selectedNode.encrypted && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  🔒 End-to-end encrypted
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center text-sanctuary-light/50">
            <p>Select a memory node to view details</p>
          </Card>
        )}
      </div>
    </div>
  );
}
