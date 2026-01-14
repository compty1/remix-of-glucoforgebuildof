import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Network, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Info
} from 'lucide-react';
import type { CitationNetworkData, NetworkNode } from '@/hooks/useCitationNetwork';

interface CitationNetworkProps {
  data: CitationNetworkData;
  loading: boolean;
  onRefresh: () => void;
  onFetchData: () => void;
  onNodeClick?: (node: NetworkNode) => void;
}

interface SimulationNode extends NetworkNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export const CitationNetwork: React.FC<CitationNetworkProps> = ({ 
  data, 
  loading, 
  onRefresh,
  onFetchData,
  onNodeClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize simulation
  useEffect(() => {
    if (data.nodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = 500;

    // Initialize node positions in a circle
    const initialNodes: SimulationNode[] = data.nodes.map((node, i) => {
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.35;
      return {
        ...node,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });

    setNodes(initialNodes);
  }, [data.nodes]);

  // Simple force-directed simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = 500;
    let animationId: number;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => ({ ...node }));

        // Apply forces
        for (let i = 0; i < newNodes.length; i++) {
          let fx = 0, fy = 0;

          // Repulsion between all nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue;
            const dx = (newNodes[i].x || 0) - (newNodes[j].x || 0);
            const dy = (newNodes[i].y || 0) - (newNodes[j].y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1000 / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }

          // Attraction to center
          const cx = width / 2, cy = height / 2;
          fx += (cx - (newNodes[i].x || 0)) * 0.01;
          fy += (cy - (newNodes[i].y || 0)) * 0.01;

          // Update velocity and position
          newNodes[i].vx = ((newNodes[i].vx || 0) + fx) * 0.9;
          newNodes[i].vy = ((newNodes[i].vy || 0) + fy) * 0.9;
          newNodes[i].x = (newNodes[i].x || 0) + (newNodes[i].vx || 0);
          newNodes[i].y = (newNodes[i].y || 0) + (newNodes[i].vy || 0);

          // Keep in bounds
          newNodes[i].x = Math.max(50, Math.min(width - 50, newNodes[i].x || 0));
          newNodes[i].y = Math.max(50, Math.min(height - 50, newNodes[i].y || 0));
        }

        return newNodes;
      });

      animationId = requestAnimationFrame(simulate);
    };

    // Run simulation for a limited time
    simulate();
    const timeout = setTimeout(() => cancelAnimationFrame(animationId), 3000);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, [nodes.length]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply zoom and offset
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Create node index
    const nodeIndex = new Map(nodes.map(n => [n.id, n]));

    // Draw links
    data.links.forEach(link => {
      const source = nodeIndex.get(link.source);
      const target = nodeIndex.get(link.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x || 0, source.y || 0);
      ctx.lineTo(target.x || 0, target.y || 0);
      ctx.strokeStyle = link.isInfluential 
        ? 'hsla(262, 38%, 50%, 0.6)' 
        : 'hsla(210, 10%, 50%, 0.2)';
      ctx.lineWidth = link.isInfluential ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const radius = Math.max(5, Math.min(20, Math.sqrt(node.citationCount) / 2));
      const isHovered = hoveredNode?.id === node.id;
      
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      
      // Color by source
      if (node.sourceDatabase.includes('semantic')) {
        ctx.fillStyle = isHovered ? 'hsl(262, 38%, 60%)' : 'hsl(262, 38%, 50%)';
      } else {
        ctx.fillStyle = isHovered ? 'hsl(210, 85%, 24%)' : 'hsl(210, 85%, 14%)';
      }
      ctx.fill();
      
      if (isHovered) {
        ctx.strokeStyle = 'hsl(350, 80%, 43%)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [nodes, data.links, hoveredNode, zoom, offset]);

  // Mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    if (isDragging) {
      setOffset({
        x: offset.x + (e.clientX - dragStart.x),
        y: offset.y + (e.clientY - dragStart.y),
      });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Find hovered node
    const hovered = nodes.find(node => {
      const dx = (node.x || 0) - x;
      const dy = (node.y || 0) - y;
      const radius = Math.max(5, Math.min(20, Math.sqrt(node.citationCount) / 2));
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });

    setHoveredNode(hovered || null);
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }, [nodes, zoom, offset, isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (loading) {
    return (
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Citation Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-highlight" />
            Citation Network
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{data.nodes.length} papers</Badge>
            <Badge variant="outline">{data.links.length} connections</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Interactive visualization showing how research papers cite each other. 
          Node size = citation count. Purple links = influential citations.
        </p>
      </CardHeader>
      <CardContent>
        {data.nodes.length === 0 ? (
          <div className="h-[500px] flex flex-col items-center justify-center gap-4 bg-muted/20 rounded-lg">
            <Info className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center max-w-md">
              No citation network data available yet. Click "Fetch Citation Data" 
              to populate the network from Semantic Scholar.
            </p>
            <Button onClick={onFetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Fetch Citation Data
            </Button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(3, z * 1.2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z / 1.2))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="relative rounded-lg overflow-hidden bg-muted/20">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {/* Tooltip */}
              {hoveredNode && (
                <div className="absolute bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
                  <h4 className="font-medium text-sm line-clamp-1 mb-1">{hoveredNode.title}</h4>
                  {hoveredNode.tldr && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{hoveredNode.tldr}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{hoveredNode.citationCount} citations</span>
                    <span className="text-highlight">{hoveredNode.influentialCount} influential</span>
                    <span>{hoveredNode.sourceDatabase}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>OpenAlex/PubMed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-highlight" />
                <span>Semantic Scholar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-highlight/60" />
                <span>Influential citation</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
