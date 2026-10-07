/**
 * Module 5: Visualization & Topology (Interactive Graph Engine)
 * Fully Interactive with Playback Controls, Node Clicking, Dijkstra SSSP, Kruskal MST, Tarjan SCC & BFS
 */

class GraphVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.currentMode = "dijkstra"; // 'dijkstra', 'mst', 'fraud', 'bfs'
    this.startNode = "MUM";
    this.endNode = "KOL";

    this.isPlaying = false;
    this.timer = null;
    this.speedMs = 450;
    this.steps = [];
    this.currentStepIdx = 0;

    this.render();
  }

  setSpeed(multiplier) {
    this.speedMs = Math.max(80, Math.floor(450 / multiplier));
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.telemetry({
      timeComplexity: this.currentMode === "dijkstra" ? "O((V + E) log V)" : this.currentMode === "mst" ? "O(E log E)" : "O(V + E)",
      spaceComplexity: "O(V) State Structures",
      log: `▶ [Graph Animation Started] Executing ${this.currentMode.toUpperCase()} algorithm step-by-step...`,
      isHighlight: true
    });
    this.runLoop();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.timer);
    this.telemetry({
      log: "⏸ [Graph Animation Paused] Topology playback paused."
    });
  }

  stepForward() {
    if (this.currentStepIdx < this.steps.length - 1) {
      this.currentStepIdx++;
      this.renderCurrentStep();
    }
  }

  stepBackward() {
    if (this.currentStepIdx > 0) {
      this.currentStepIdx--;
      this.renderCurrentStep();
    }
  }

  reset() {
    this.pause();
    this.currentStepIdx = 0;
    this.renderCurrentStep();
    this.telemetry({
      comparisons: 0,
      operations: 0,
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
      log: "↺ [Graph Reset] Restored topology to initial graph state."
    });
  }

  runLoop() {
    if (!this.isPlaying) return;
    if (this.currentStepIdx < this.steps.length - 1) {
      this.currentStepIdx++;
      this.renderCurrentStep();
      this.timer = setTimeout(() => this.runLoop(), this.speedMs);
    } else {
      this.pause();
    }
  }

  setMode(mode) {
    this.pause();
    this.currentMode = mode;
    this.currentStepIdx = 0;
    this.generateSteps();
    this.render();
  }

  generateSteps() {
    this.steps = [];

    if (this.currentMode === "dijkstra") {
      this.buildDijkstraSteps();
    } else if (this.currentMode === "mst") {
      this.buildKruskalSteps();
    } else if (this.currentMode === "fraud") {
      this.buildFraudSteps();
    } else if (this.currentMode === "bfs") {
      this.buildBFSSteps();
    }
  }

  buildDijkstraSteps() {
    const data = window.ALGO_DATA ? window.ALGO_DATA.logistics : {
      nodes: [
        { id: "MUM", label: "Mumbai Port", x: 100, y: 220 },
        { id: "DEL", label: "Delhi Hub", x: 260, y: 70 },
        { id: "BLR", label: "Bangalore Depot", x: 200, y: 330 },
        { id: "HYD", label: "Hyderabad DC", x: 300, y: 240 },
        { id: "KOL", label: "Kolkata Hub", x: 500, y: 150 },
        { id: "MAA", label: "Chennai DC", x: 380, y: 340 }
      ],
      edges: [
        { source: "MUM", target: "DEL", weight: 1400 },
        { source: "MUM", target: "BLR", weight: 980 },
        { source: "DEL", target: "KOL", weight: 1530 },
        { source: "DEL", target: "HYD", weight: 1250 },
        { source: "BLR", target: "HYD", weight: 570 },
        { source: "HYD", target: "KOL", weight: 1490 },
        { source: "BLR", target: "MAA", weight: 350 },
        { source: "MAA", target: "KOL", weight: 1670 }
      ]
    };

    const nodes = data.nodes;
    const edges = data.edges;

    const distances = {};
    const previous = {};
    const visited = new Set();
    nodes.forEach(n => distances[n.id] = Infinity);
    distances[this.startNode] = 0;

    let pq = [{ id: this.startNode, dist: 0 }];
    let relaxations = 0;

    this.steps.push({
      visitedNodes: [],
      activeNode: this.startNode,
      highlightEdges: [],
      highlightPath: [],
      message: `Initialized Dijkstra from Origin: ${this.startNode}. Distance[${this.startNode}] = 0km, all others = ∞.`
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const curr = pq.shift();
      if (visited.has(curr.id)) continue;
      visited.add(curr.id);

      this.steps.push({
        visitedNodes: Array.from(visited),
        activeNode: curr.id,
        highlightEdges: [],
        highlightPath: [],
        message: `Visiting node ${curr.id} with current minimum known distance: ${curr.dist} km.`
      });

      if (curr.id === this.endNode) break;

      const neighbors = edges.filter(e => e.source === curr.id || e.target === curr.id);
      for (let edge of neighbors) {
        const neighborId = edge.source === curr.id ? edge.target : edge.source;
        if (!visited.has(neighborId)) {
          const newDist = curr.dist + edge.weight;
          if (newDist < distances[neighborId]) {
            relaxations++;
            distances[neighborId] = newDist;
            previous[neighborId] = curr.id;
            pq.push({ id: neighborId, dist: newDist });

            this.steps.push({
              visitedNodes: Array.from(visited),
              activeNode: curr.id,
              highlightEdges: [{ source: curr.id, target: neighborId }],
              highlightPath: [],
              message: `Relaxed edge (${curr.id} ➔ ${neighborId}). Updated Distance[${neighborId}] = ${newDist} km.`
            });
          }
        }
      }
    }

    const path = [];
    let curr = this.endNode;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }

    const finalEdges = path.slice(0, -1).map((u, i) => ({ source: u, target: path[i + 1] }));

    this.steps.push({
      visitedNodes: Array.from(visited),
      activeNode: null,
      highlightEdges: finalEdges,
      highlightPath: path,
      message: `🎯 Optimal Shortest Route Found: ${path.join(' ➔ ')} | Total Distance: ${distances[this.endNode]} km!`
    });
  }

  buildKruskalSteps() {
    const data = window.ALGO_DATA ? window.ALGO_DATA.logistics : {
      nodes: [
        { id: "MUM", label: "Mumbai Port", x: 100, y: 220 },
        { id: "DEL", label: "Delhi Hub", x: 260, y: 70 },
        { id: "BLR", label: "Bangalore Depot", x: 200, y: 330 },
        { id: "HYD", label: "Hyderabad DC", x: 300, y: 240 },
        { id: "KOL", label: "Kolkata Hub", x: 500, y: 150 },
        { id: "MAA", label: "Chennai DC", x: 380, y: 340 }
      ],
      edges: [
        { source: "BLR", target: "MAA", weight: 350 },
        { source: "BLR", target: "HYD", weight: 570 },
        { source: "MUM", target: "BLR", weight: 980 },
        { source: "DEL", target: "HYD", weight: 1250 },
        { source: "MUM", target: "DEL", weight: 1400 },
        { source: "HYD", target: "KOL", weight: 1490 },
        { source: "DEL", target: "KOL", weight: 1530 },
        { source: "MAA", target: "KOL", weight: 1670 }
      ]
    };

    const nodes = data.nodes;
    const sortedEdges = [...data.edges].sort((a, b) => a.weight - b.weight);

    const parent = {};
    nodes.forEach(n => parent[n.id] = n.id);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));

    const mstEdges = [];
    let totalWeight = 0;

    this.steps.push({
      visitedNodes: [],
      activeNode: null,
      highlightEdges: [],
      highlightPath: [],
      message: "Edges sorted in ascending order of weight for Kruskal's Greedy Selection."
    });

    for (let edge of sortedEdges) {
      const rootU = find(edge.source);
      const rootV = find(edge.target);

      if (rootU !== rootV) {
        parent[rootU] = rootV;
        mstEdges.push(edge);
        totalWeight += edge.weight;

        this.steps.push({
          visitedNodes: [],
          activeNode: null,
          highlightEdges: [...mstEdges],
          highlightPath: [],
          message: `Included Edge (${edge.source} - ${edge.target}, ${edge.weight}km) in MST. Disjoint sets merged.`
        });

        if (mstEdges.length === nodes.length - 1) break;
      } else {
        this.steps.push({
          visitedNodes: [],
          activeNode: null,
          highlightEdges: [...mstEdges],
          highlightPath: [],
          message: `Rejected Edge (${edge.source} - ${edge.target}, ${edge.weight}km) to prevent cycle formation.`
        });
      }
    }

    this.steps.push({
      visitedNodes: [],
      activeNode: null,
      highlightEdges: [...mstEdges],
      highlightPath: [],
      message: `🌲 Kruskal MST Complete! ${mstEdges.length} links connected with total minimum cabling: ${totalWeight} km.`
    });
  }

  buildFraudSteps() {
    const data = window.ALGO_DATA ? window.ALGO_DATA.fintech : {
      accounts: [
        { id: "ACC-101", label: "Alpha Shell Corp", x: 140, y: 120, isMule: true },
        { id: "ACC-102", label: "Beta Holdings", x: 320, y: 90, isMule: true },
        { id: "ACC-103", label: "Gamma Offshore", x: 450, y: 220, isMule: true },
        { id: "ACC-104", label: "Delta Trading Ltd", x: 300, y: 320, isMule: true },
        { id: "ACC-105", label: "Epsilon Logistics", x: 130, y: 280, isMule: true },
        { id: "ACC-106", label: "Retail Customer", x: 500, y: 90, isMule: false }
      ],
      transactions: [
        { source: "ACC-101", target: "ACC-102", amount: 450000, isSuspicious: true },
        { source: "ACC-102", target: "ACC-103", amount: 445000, isSuspicious: true },
        { source: "ACC-103", target: "ACC-104", amount: 440000, isSuspicious: true },
        { source: "ACC-104", target: "ACC-105", amount: 435000, isSuspicious: true },
        { source: "ACC-105", target: "ACC-101", amount: 430000, isSuspicious: true },
        { source: "ACC-106", target: "ACC-103", amount: 15000, isSuspicious: false }
      ]
    };

    const cycleEdges = data.transactions.filter(e => e.isSuspicious);

    this.steps.push({
      visitedNodes: [],
      activeNode: "ACC-101",
      highlightEdges: [],
      highlightPath: [],
      message: "Initiating Tarjan's Strongly Connected Components (SCC) DFS Traversal..."
    });

    data.transactions.filter(t => t.isSuspicious).forEach((tx, idx) => {
      this.steps.push({
        visitedNodes: ["ACC-101", "ACC-102", "ACC-103", "ACC-104", "ACC-105"].slice(0, idx + 1),
        activeNode: tx.target,
        highlightEdges: cycleEdges.slice(0, idx + 1),
        highlightPath: [],
        message: `Traced high-velocity transaction ₹${tx.amount.toLocaleString()} from ${tx.source} ➔ ${tx.target}.`
      });
    });

    this.steps.push({
      visitedNodes: ["ACC-101", "ACC-102", "ACC-103", "ACC-104", "ACC-105"],
      activeNode: null,
      highlightEdges: cycleEdges,
      highlightPath: [],
      message: "🚨 [FinTech Alert] Circular Money Laundering Syndicate Identified! Low-link convergence detected closed fraud cycle."
    });
  }

  buildBFSSteps() {
    const data = window.ALGO_DATA ? window.ALGO_DATA.logistics : {
      nodes: [
        { id: "MUM", label: "Mumbai Port", x: 100, y: 220 },
        { id: "DEL", label: "Delhi Hub", x: 260, y: 70 },
        { id: "BLR", label: "Bangalore Depot", x: 200, y: 330 },
        { id: "HYD", label: "Hyderabad DC", x: 300, y: 240 },
        { id: "KOL", label: "Kolkata Hub", x: 500, y: 150 },
        { id: "MAA", label: "Chennai DC", x: 380, y: 340 }
      ],
      edges: [
        { source: "MUM", target: "DEL", weight: 1400 },
        { source: "MUM", target: "BLR", weight: 980 },
        { source: "DEL", target: "KOL", weight: 1530 },
        { source: "DEL", target: "HYD", weight: 1250 },
        { source: "BLR", target: "HYD", weight: 570 },
        { source: "HYD", target: "KOL", weight: 1490 },
        { source: "BLR", target: "MAA", weight: 350 },
        { source: "MAA", target: "KOL", weight: 1670 }
      ]
    };

    const visited = new Set([this.startNode]);
    const queue = [this.startNode];
    const treeEdges = [];

    this.steps.push({
      visitedNodes: [this.startNode],
      activeNode: this.startNode,
      highlightEdges: [],
      highlightPath: [],
      message: `BFS Root Enqueued: ${this.startNode} (Hop Tier 0).`
    });

    while (queue.length > 0) {
      const u = queue.shift();
      const neighbors = data.edges.filter(e => e.source === u || e.target === u);

      for (let edge of neighbors) {
        const v = edge.source === u ? edge.target : edge.source;
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          treeEdges.push({ source: u, target: v });

          this.steps.push({
            visitedNodes: Array.from(visited),
            activeNode: v,
            highlightEdges: [...treeEdges],
            highlightPath: [],
            message: `Discovered neighbor node ${v} from ${u}. Added to BFS queue.`
          });
        }
      }
    }

    this.steps.push({
      visitedNodes: Array.from(visited),
      activeNode: null,
      highlightEdges: [...treeEdges],
      highlightPath: [],
      message: "BFS Layer-by-Layer Minimum-Hop Spanning Forest Complete!"
    });
  }

  setStartNode(nodeId) {
    this.startNode = nodeId;
    this.pause();
    this.currentStepIdx = 0;
    this.generateSteps();
    this.render();
  }

  setEndNode(nodeId) {
    this.endNode = nodeId;
    this.pause();
    this.currentStepIdx = 0;
    this.generateSteps();
    this.render();
  }

  render() {
    this.generateSteps();
    this.currentStepIdx = this.steps.length - 1;

    const nodesList = (this.currentMode === "fraud"
      ? (window.ALGO_DATA?.fintech?.accounts || [
          { id: "ACC-101", label: "Alpha Shell Corp" },
          { id: "ACC-102", label: "Beta Holdings" },
          { id: "ACC-103", label: "Gamma Offshore" },
          { id: "ACC-104", label: "Delta Trading Ltd" },
          { id: "ACC-105", label: "Epsilon Logistics" }
        ])
      : (window.ALGO_DATA?.logistics?.nodes || [
          { id: "MUM", label: "Mumbai Port" },
          { id: "DEL", label: "Delhi Hub" },
          { id: "BLR", label: "Bangalore Depot" },
          { id: "HYD", label: "Hyderabad DC" },
          { id: "KOL", label: "Kolkata Hub" },
          { id: "MAA", label: "Chennai DC" }
        ])
    );

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
        <!-- Mode Switcher Header -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
          <!-- Algorithm Mode Buttons -->
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
            <button class="${this.currentMode === 'dijkstra' ? 'btn-primary' : 'btn-secondary'}" id="btn-mode-dijkstra" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              🚚 Dijkstra SSSP Routing
            </button>
            <button class="${this.currentMode === 'mst' ? 'btn-primary' : 'btn-secondary'}" id="btn-mode-mst" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              🌲 Kruskal's Warehouse MST
            </button>
            <button class="${this.currentMode === 'fraud' ? 'btn-primary' : 'btn-secondary'}" id="btn-mode-fraud" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              🚨 Tarjan SCC Fraud Ring
            </button>
            <button class="${this.currentMode === 'bfs' ? 'btn-primary' : 'btn-secondary'}" id="btn-mode-bfs" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              🔄 BFS Layer Traversal
            </button>
          </div>

          <!-- Interactive Start/Destination Selectors -->
          <div style="display: ${this.currentMode === 'dijkstra' ? 'flex' : 'none'}; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Route:</span>
            <select id="select-start-node" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-family: var(--font-mono);">
              ${nodesList.map(n => `<option value="${n.id}" ${n.id === this.startNode ? 'selected' : ''}>${n.id} (${n.label.split(' ')[0]})</option>`).join('')}
            </select>
            <span style="font-weight: bold; color: #64748b;">➔</span>
            <select id="select-end-node" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-family: var(--font-mono);">
              ${nodesList.map(n => `<option value="${n.id}" ${n.id === this.endNode ? 'selected' : ''}>${n.id} (${n.label.split(' ')[0]})</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Visualizer Graph Canvas -->
        <div style="background: #ffffff; border-radius: var(--radius-md); border: 1.5px solid var(--border-color); overflow: hidden; height: 420px; position: relative; box-shadow: var(--shadow-md);">
          <svg id="network-graph-svg" class="visualizer-svg" style="width: 100%; height: 100%;"></svg>
        </div>
      </div>
    `;

    window.activeGraphVisualizer = this;

    // Mode Buttons
    document.getElementById("btn-mode-dijkstra").addEventListener("click", () => this.setMode("dijkstra"));
    document.getElementById("btn-mode-mst").addEventListener("click", () => this.setMode("mst"));
    document.getElementById("btn-mode-fraud").addEventListener("click", () => this.setMode("fraud"));
    document.getElementById("btn-mode-bfs").addEventListener("click", () => this.setMode("bfs"));

    // Route Selectors
    if (this.currentMode === "dijkstra") {
      document.getElementById("select-start-node").addEventListener("change", (e) => this.setStartNode(e.target.value));
      document.getElementById("select-end-node").addEventListener("change", (e) => this.setEndNode(e.target.value));
    }

    this.renderCurrentStep();
  }

  renderCurrentStep() {
    const svg = document.getElementById("network-graph-svg");
    if (!svg || !this.steps[this.currentStepIdx]) return;

    const step = this.steps[this.currentStepIdx];
    const isFraudMode = this.currentMode === "fraud";

    const data = isFraudMode
      ? (window.ALGO_DATA ? window.ALGO_DATA.fintech : {
          accounts: [
            { id: "ACC-101", label: "Alpha Shell Corp", x: 140, y: 120, isMule: true },
            { id: "ACC-102", label: "Beta Holdings", x: 320, y: 90, isMule: true },
            { id: "ACC-103", label: "Gamma Offshore", x: 450, y: 220, isMule: true },
            { id: "ACC-104", label: "Delta Trading Ltd", x: 300, y: 320, isMule: true },
            { id: "ACC-105", label: "Epsilon Logistics", x: 130, y: 280, isMule: true },
            { id: "ACC-106", label: "Retail Customer", x: 500, y: 90, isMule: false }
          ],
          transactions: [
            { source: "ACC-101", target: "ACC-102", amount: 450000, isSuspicious: true },
            { source: "ACC-102", target: "ACC-103", amount: 445000, isSuspicious: true },
            { source: "ACC-103", target: "ACC-104", amount: 440000, isSuspicious: true },
            { source: "ACC-104", target: "ACC-105", amount: 435000, isSuspicious: true },
            { source: "ACC-105", target: "ACC-101", amount: 430000, isSuspicious: true },
            { source: "ACC-106", target: "ACC-103", amount: 15000, isSuspicious: false }
          ]
        })
      : (window.ALGO_DATA ? window.ALGO_DATA.logistics : {
          nodes: [
            { id: "MUM", label: "Mumbai Port", x: 100, y: 220 },
            { id: "DEL", label: "Delhi Hub", x: 260, y: 70 },
            { id: "BLR", label: "Bangalore Depot", x: 200, y: 330 },
            { id: "HYD", label: "Hyderabad DC", x: 300, y: 240 },
            { id: "KOL", label: "Kolkata Hub", x: 500, y: 150 },
            { id: "MAA", label: "Chennai DC", x: 380, y: 340 }
          ],
          edges: [
            { source: "MUM", target: "DEL", weight: 1400 },
            { source: "MUM", target: "BLR", weight: 980 },
            { source: "DEL", target: "KOL", weight: 1530 },
            { source: "DEL", target: "HYD", weight: 1250 },
            { source: "BLR", target: "HYD", weight: 570 },
            { source: "HYD", target: "KOL", weight: 1490 },
            { source: "BLR", target: "MAA", weight: 350 },
            { source: "MAA", target: "KOL", weight: 1670 }
          ]
        });

    const nodes = isFraudMode ? data.accounts : data.nodes;
    const edges = isFraudMode ? data.transactions : data.edges;

    let edgesHtml = "";
    edges.forEach(e => {
      const u = nodes.find(n => n.id === e.source);
      const v = nodes.find(n => n.id === e.target);
      if (!u || !v) return;

      const isHighlighted = step.highlightEdges.some(he =>
        (he.source === e.source && he.target === e.target) ||
        (!isFraudMode && he.source === e.target && he.target === e.source)
      );

      let strokeColor = "#cbd5e1";
      let strokeWidth = 1.5;

      if (isHighlighted) {
        if (isFraudMode) {
          strokeColor = "#e11d48"; // Rose/Red for fraud cycle
          strokeWidth = 3.5;
        } else if (this.currentMode === "mst") {
          strokeColor = "#059669"; // Emerald for MST
          strokeWidth = 3.5;
        } else {
          strokeColor = "#0284c7"; // Blue for shortest path / BFS
          strokeWidth = 3.5;
        }
      }

      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;
      const weightLabel = e.weight ? `${e.weight}km` : (e.amount ? `₹${(e.amount / 1000).toFixed(0)}k` : '');

      edgesHtml += `
        <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <text x="${midX}" y="${midY - 4}" fill="#64748b" font-size="9" font-weight="700" font-family="var(--font-mono)" text-anchor="middle">
          ${weightLabel}
        </text>
      `;
    });

    let nodesHtml = "";
    nodes.forEach(n => {
      const isPathNode = step.highlightPath.includes(n.id);
      const isVisited = step.visitedNodes.includes(n.id);
      const isActive = n.id === step.activeNode;
      const isStart = n.id === this.startNode && !isFraudMode;
      const isEnd = n.id === this.endNode && !isFraudMode;

      let circleFill = "#ffffff";
      let circleStroke = "#94a3b8";

      if (isFraudMode) {
        if (n.isMule) {
          circleFill = isVisited ? "#ffe4e6" : "#ffffff";
          circleStroke = isVisited ? "#e11d48" : "#fda4af";
        }
      } else {
        if (isStart || isEnd) {
          circleFill = "#fef3c7";
          circleStroke = "#d97706";
        } else if (isPathNode) {
          circleFill = "#e0f2fe";
          circleStroke = "#0284c7";
        } else if (isVisited) {
          circleFill = "#dcfce7";
          circleStroke = "#059669";
        }
      }

      if (isActive) {
        circleFill = "#fef3c7";
        circleStroke = "#d97706";
      }

      nodesHtml += `
        <g transform="translate(${n.x}, ${n.y})" style="cursor: pointer;" onclick="window.activeGraphVisualizer.handleNodeClick('${n.id}')">
          <circle r="18" fill="${circleFill}" stroke="${circleStroke}" stroke-width="2.5" class="tree-node-circle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
          <text class="tree-node-text" font-size="9.5" font-weight="800" fill="#0f172a">${n.id}</text>
          <text y="28" fill="#475569" font-size="8.5" font-weight="700" font-family="var(--font-sans)" text-anchor="middle">${n.label.split(' ')[0]}</text>
        </g>
      `;
    });

    svg.innerHTML = edgesHtml + nodesHtml;

    this.telemetry({
      comparisons: this.currentStepIdx + 1,
      operations: nodes.length + edges.length,
      timeComplexity: this.currentMode === "dijkstra" ? "O((V + E) log V)" : this.currentMode === "mst" ? "O(E log E)" : "O(V + E)",
      spaceComplexity: "O(V) Adjacency Representation",
      log: `[Step ${this.currentStepIdx + 1}/${this.steps.length}] ${step.message}`,
      isHighlight: step.message.includes("Complete") || step.message.includes("Found"),
      isAlert: step.message.includes("Alert") || step.message.includes("Rejected")
    });
  }

  handleNodeClick(nodeId) {
    if (this.currentMode === "dijkstra") {
      if (this.startNode === nodeId) {
        // Already start node
        return;
      } else if (this.endNode === nodeId) {
        // Swap
        this.endNode = this.startNode;
        this.startNode = nodeId;
      } else {
        this.endNode = nodeId;
      }
      this.generateSteps();
      this.render();
    }
  }
}

window.GraphVisualizer = GraphVisualizer;
