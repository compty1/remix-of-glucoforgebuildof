import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Network, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Info,
  Download,
  Image,
  FileJson,
  FileSpreadsheet,
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

// Color mapping for research fields
const FIELD_COLORS: Record<string, { fill: string; fillHover: string }> = {
  'Medicine': { fill: 'hsl(350, 80%, 45%)', fillHover: 'hsl(350, 80%, 55%)' },
  'Biology': { fill: 'hsl(140, 60%, 40%)', fillHover: 'hsl(140, 60%, 50%)' },
  'Computer Science': { fill: 'hsl(210, 85%, 50%)', fillHover: 'hsl(210, 85%, 60%)' },
  'Engineering': { fill: 'hsl(45, 90%, 45%)', fillHover: 'hsl(45, 90%, 55%)' },
  'Chemistry': { fill: 'hsl(280, 60%, 50%)', fillHover: 'hsl(280, 60%, 60%)' },
  'Physics': { fill: 'hsl(200, 70%, 45%)', fillHover: 'hsl(200, 70%, 55%)' },
  'Mathematics': { fill: 'hsl(320, 60%, 50%)', fillHover: 'hsl(320, 60%, 60%)' },
  'default': { fill: 'hsl(0, 0%, 50%)', fillHover: 'hsl(0, 0%, 60%)' },
};

// Priority order for determining primary field
const FIELD_PRIORITY = ['Medicine', 'Biology', 'Computer Science', 'Engineering', 'Chemistry', 'Physics', 'Mathematics'];

const getPrimaryField = (fields: string[]): string => {
  for (const field of FIELD_PRIORITY) {
    if (fields.some(f => f.includes(field))) return field;
  }
  return fields[0] || 'default';
};

const getNodeColor = (node: NetworkNode, isHovered: boolean): string => {
  const field = getPrimaryField(node.fieldsOfStudy);
  const colors = FIELD_COLORS[field] || FIELD_COLORS.default;
  return isHovered ? colors.fillHover : colors.fill;
};

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

  // Export functions
  const exportAsImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `citation-network-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  const exportAsJSON = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      nodes: data.nodes.map(n => ({
        id: n.id,
        title: n.title,
        tldr: n.tldr,
        citationCount: n.citationCount,
        influentialCount: n.influentialCount,
        fieldsOfStudy: n.fieldsOfStudy,
        doi: n.doi,
        openAccess: n.openAccess,
      })),
      links: data.links.map(l => ({
        source: l.source,
        target: l.target,
        isInfluential: l.isInfluential,
      })),
      statistics: {
        totalNodes: data.nodes.length,
        totalLinks: data.links.length,
        influentialLinks: data.links.filter(l => l.isInfluential).length,
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `citation-network-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const exportAsCSV = useCallback(() => {
    const headers = ['ID', 'Title', 'TLDR', 'Citations', 'Influential Citations', 'Fields', 'DOI', 'Open Access'];
    const rows = data.nodes.map(n => [
      n.id,
      `"${n.title.replace(/"/g, '""')}"`,
      `"${(n.tldr || '').replace(/"/g, '""')}"`,
      n.citationCount,
      n.influentialCount,
      `"${n.fieldsOfStudy.join('; ')}"`,
      n.doi || '',
      n.openAccess ? 'Yes' : 'No',
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `citation-network-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [data]);

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
        ? 'hsla(350, 80%, 50%, 0.6)' 
        : 'hsla(210, 10%, 50%, 0.2)';
      ctx.lineWidth = link.isInfluential ? 2.5 : 1;
      ctx.stroke();
    });

    // Draw nodes with field-based coloring
    nodes.forEach(node => {
      const radius = Math.max(5, Math.min(20, Math.sqrt(node.citationCount) / 2));
      const isHovered = hoveredNode?.id === node.id;
      
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      
      // Color by research field
      ctx.fillStyle = getNodeColor(node, isHovered);
      ctx.fill();
      
      if (isHovered) {
        ctx.strokeStyle = 'hsl(0, 0%, 100%)';
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
          Node size = citation count. Click a node to view paper details.
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
              
              {/* Export dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportAsImage}>
                    <Image className="h-4 w-4 mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    <span>{getPrimaryField(hoveredNode.fieldsOfStudy)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend - Research Fields */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Research Fields:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FIELD_COLORS['Medicine'].fill }} />
                <span>Medicine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FIELD_COLORS['Biology'].fill }} />
                <span>Biology</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FIELD_COLORS['Computer Science'].fill }} />
                <span>CS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FIELD_COLORS['Engineering'].fill }} />
                <span>Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: 'hsla(350, 80%, 50%, 0.6)' }} />
                <span>Influential</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
