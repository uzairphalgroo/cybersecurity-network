import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { PermissionGraphResponse, GraphNode } from '../types/audit';
import { ZoomIn, ZoomOut, Maximize2, ShieldAlert, Cpu, X } from 'lucide-react';

interface AttackGraphViewerProps {
  graphData: PermissionGraphResponse;
}

export const AttackGraphViewer: React.FC<AttackGraphViewerProps> = ({ graphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeLayout, setActiveLayout] = useState<'cose' | 'breadthfirst' | 'concentric' | 'circle'>('cose');

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [
      ...graphData.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          severity: n.severity,
          is_target: n.is_target,
          raw: n,
        },
      })),
      ...graphData.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          is_attack_path: e.is_attack_path,
          risk_weight: e.risk_weight,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#121212',
            'border-width': 2,
            'border-color': '#71717a',
            label: 'data(label)',
            color: '#f4f4f5',
            'font-size': '11px',
            'font-family': 'Space Grotesk, JetBrains Mono, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 40,
            height: 40,
          },
        },
        {
          selector: 'node[type = "internet"]',
          style: {
            'background-color': '#ffffff',
            'border-color': '#ff3344',
            'border-width': 4,
            shape: 'hexagon',
            width: 50,
            height: 50,
            color: '#ffffff',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node[type = "user"]',
          style: {
            'background-color': '#27272a',
            'border-color': '#ffffff',
            'border-width': 2,
            shape: 'ellipse',
          },
        },
        {
          selector: 'node[type = "role"]',
          style: {
            'background-color': '#18181b',
            'border-color': '#c084fc',
            'border-width': 2,
            shape: 'round-rectangle',
          },
        },
        {
          selector: 'node[type = "policy"]',
          style: {
            'background-color': '#09090b',
            'border-color': '#38bdf8',
            'border-width': 2,
            shape: 'cut-rectangle',
          },
        },
        {
          selector: 'node[type = "bucket"]',
          style: {
            'background-color': '#1c1917',
            'border-color': '#fbbf24',
            'border-width': 2,
            shape: 'barrel',
          },
        },
        {
          selector: 'node[type = "security_group"], node[type = "azure_nsg"]',
          style: {
            'background-color': '#042f2e',
            'border-color': '#2dd4bf',
            'border-width': 2,
            shape: 'diamond',
          },
        },
        {
          selector: 'node[type = "pod"], node[type = "k8s_binding"]',
          style: {
            'background-color': '#022c22',
            'border-color': '#34d399',
            'border-width': 2,
            shape: 'tag',
          },
        },
        {
          selector: 'node[?is_target]',
          style: {
            'border-color': '#ff3344',
            'border-width': 4,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#27272a',
            'target-arrow-color': '#52525b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.9,
            'font-size': '9px',
            color: '#71717a',
            'text-rotation': 'autorotate',
            'text-margin-y': -6,
          },
        },
        {
          selector: 'edge[?is_attack_path]',
          style: {
            width: 3.5,
            'line-color': '#ff3344',
            'target-arrow-color': '#ff3344',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.3,
            'line-style': 'dashed',
            color: '#ff6677',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#ffffff',
            'border-width': 4,
          },
        },
      ],
      layout: {
        name: activeLayout,
        padding: 50,
        animate: true,
        animationDuration: 500,
      } as any,
    });

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data('raw'));
    });

    // Background click handler
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    // ResizeObserver to handle tab switches and viewport resizing
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (cy && !cy.destroyed()) {
          cy.resize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (cy && !cy.destroyed()) {
        cy.destroy();
      }
    };
  }, [graphData]);

  // Handle Layout Change
  const handleLayoutChange = (layoutName: 'cose' | 'breadthfirst' | 'concentric' | 'circle') => {
    setActiveLayout(layoutName);
    if (cyRef.current) {
      const layout = cyRef.current.layout({
        name: layoutName,
        padding: 50,
        animate: true,
        animationDuration: 500,
      } as any);
      layout.run();
    }
  };

  const handleZoom = (factor: number) => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom({
        level: currentZoom * factor,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  };

  return (
    <div className="relative flex h-[620px] w-full flex-col rounded-3xl border border-white/10 bg-black/90 backdrop-blur-2xl overflow-hidden shadow-2xl font-tech">
      {/* Top Controls Bar */}
      <div className="z-10 flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 px-5 py-3 gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-white" />
          <span className="text-xs font-orbitron font-bold text-white tracking-wider">
            PERMISSION GRAPH // ATTACK CHAINS
          </span>
          <span className="rounded-md bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
            {graphData.total_nodes} Nodes &bull; {graphData.total_edges} Edges
          </span>
        </div>

        {/* Layout & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-white/10 bg-black p-0.5">
            {(['cose', 'breadthfirst', 'concentric', 'circle'] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleLayoutChange(l)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                  activeLayout === l
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={() => handleZoom(1.2)}
              title="Zoom In"
              className="btn-tech-gradient rounded-lg p-1.5 text-zinc-300 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              title="Zoom Out"
              className="btn-tech-gradient rounded-lg p-1.5 text-zinc-300 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFit}
              title="Reset View"
              className="btn-tech-gradient rounded-lg p-1.5 text-zinc-300 hover:text-white"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Drawer */}
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full w-full bg-[#020202]" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 rounded-2xl border border-white/10 bg-black/85 p-3 backdrop-blur-xl text-[11px] font-mono space-y-1.5 shadow-2xl pointer-events-none">
          <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">GRAPH TOPOLOGY</div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/40" />
            <span className="text-zinc-300">Public Threat / Attack Vector</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            <span className="text-zinc-300">IAM User / Identity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
            <span className="text-zinc-300">IAM Role / ServiceAccount</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-zinc-300">S3 Bucket / Encrypted Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
            <span className="text-zinc-300">Security Group Perimeter</span>
          </div>
        </div>

        {/* Node Inspection Drawer */}
        {selectedNode && (
          <div className="absolute right-3 top-3 bottom-3 z-20 w-80 rounded-2xl border border-white/15 bg-black/95 p-5 backdrop-blur-2xl shadow-2xl overflow-y-auto font-tech">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">NODE INSPECTOR</span>
                <h4 className="text-sm font-bold text-white truncate max-w-[200px] mt-0.5">{selectedNode.label}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn-tech-gradient rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase text-[10px]">ID:</span>
                <p className="text-[11px] text-zinc-200 break-all">{selectedNode.id}</p>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px]">Type:</span>
                <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-white font-bold uppercase text-[10px]">
                  {selectedNode.type}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px]">Provider:</span>
                <span className="ml-2 text-zinc-300">{selectedNode.provider}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px]">Severity:</span>
                <span
                  className={`ml-2 font-bold ${
                    selectedNode.severity === 'CRITICAL'
                      ? 'text-rose-400'
                      : selectedNode.severity === 'HIGH'
                      ? 'text-amber-400'
                      : 'text-zinc-300'
                  }`}
                >
                  {selectedNode.severity}
                </span>
              </div>

              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">Metadata:</span>
                  <pre className="mt-1.5 max-h-48 overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-[10px] font-mono text-zinc-300">
                    {JSON.stringify(selectedNode.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Attack Chains Strip */}
      {graphData.attack_paths.length > 0 && (
        <div className="border-t border-white/[0.08] bg-zinc-950/95 p-4 font-mono">
          <div className="flex items-center gap-2 mb-2.5">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
              CRITICAL ATTACK PATHS DETECTED ({graphData.attack_paths.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {graphData.attack_paths.map((ap) => (
              <div
                key={ap.path_id}
                className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-zinc-300"
              >
                <div className="flex items-center justify-between font-bold text-rose-300 mb-1">
                  <span>{ap.title}</span>
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] text-rose-300 font-mono">
                    {ap.hop_count} HOPS
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  <strong className="text-zinc-300">Path:</strong> {ap.entry_point} &rarr; {ap.target}
                </div>
                <div className="mt-1 text-[10px] text-zinc-400 italic">{ap.cve_or_technique}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
