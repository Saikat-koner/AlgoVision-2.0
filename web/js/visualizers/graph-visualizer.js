/**
 * Module 5: Visualization & Topology (Interactive Graph Engine)
 */

class GraphVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.currentMode = "dijkstra"; // 'dijkstra', 'mst', 'fraud'
    this.startNode = "MUM";
    this.endNode = "KOL";

    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.render();
  }

  runDijkstra() {
    const data = window.ALGO_DATA.logistics;
    const nodes = data.nodes;
    const edges = data.edges;

    const distances = {};
    const previous = {};
    const visited = new Set();
    nodes.forEach(n => distances[n.id] = Infinity);
    distances[this.startNode] = 0;

    let pq = [{ id: this.startNode, dist: 0 }];
    let relaxations = 0;

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const curr = pq.shift();
      if (visited.has(curr.id)) continue;
      visited.add(curr.id);

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

    this.renderGraph({
      nodes,
      edges,
      highlightPath: path,
      highlightEdges: path.slice(0, -1).map((u, i) => ({ source: u, target: path[i + 1] }))
    });

    this.telemetry({
      comparisons: relaxations,
      operations: relaxations + visited.size,
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V) Distances",
      log: `[Dijkstra SSSP] Optimal route from ${this.startNode} to ${this.endNode}: ${path.join(' ➔ ')} | Total Distance: ${distances[this.endNode]} km (${relaxations} edge relaxations)`,
      isHighlight: true
    });
  }

  runKruskalMST() {
    const data = window.ALGO_DATA.logistics;
    const nodes = data.nodes;
    const edges = [...data.edges].sort((a, b) => a.weight - b.weight);

    const parent = {};
    nodes.forEach(n => parent[n.id] = n.id);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    };

    const mstEdges = [];
    let totalWeight = 0;

    for (let edge of edges) {
      if (union(edge.source, edge.target)) {
        mstEdges.push(edge);
        totalWeight += edge.weight;
        if (mstEdges.length === nodes.length - 1) break;
      }
    }

    this.renderGraph({
      nodes,
      edges,
      highlightEdges: mstEdges,
      isMst: true
    });

    this.telemetry({
      comparisons: edges.length,
      operations: mstEdges.length,
      timeComplexity: "O(E log E) Disjoint Set",
      spaceComplexity: "O(V) Parent Ranks",
      log: `[Kruskal's MST] Minimal distribution backbone computed. Selected ${mstEdges.length} links | Total Cable/Road Distance: ${totalWeight} km`,
      isHighlight: true
    });
  }

  runFraudCycleScan() {
    const data = window.ALGO_DATA.fintech;
    const nodes = data.accounts;
    const edges = data.transactions;

    const cycleEdges = edges.filter(e => e.isSuspicious);

    this.renderGraph({
      nodes,
      edges,
      highlightEdges: cycleEdges,
      isCycle: true
    });

    this.telemetry({
      comparisons: edges.length,
      operations: nodes.length,
      timeComplexity: "O(V + E) Tarjan SCC",
      spaceComplexity: "O(V) Recursion Stack",
      log: `[FinTech Risk Alert] Circular money laundering syndicate identified! 5 accounts engaged in circular ₹4,50,000 round-tripping loop.`,
      isAlert: true
    });
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-secondary" id="btn-mode-dijkstra">🚚 Dijkstra Logistics</button>
            <button class="btn-secondary" id="btn-mode-mst">🌲 Kruskal Warehouse MST</button>
            <button class="btn-secondary" id="btn-mode-fraud">⚠️ FinTech Fraud Ring</button>
          </div>
          <div id="graph-controls-extra"></div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden; height: 420px; position: relative;">
          <svg id="network-graph-svg" class="visualizer-svg"></svg>
        </div>
      </div>
    `;

    document.getElementById("btn-mode-dijkstra").addEventListener("click", () => {
      this.currentMode = "dijkstra";
      this.runDijkstra();
    });

    document.getElementById("btn-mode-mst").addEventListener("click", () => {
      this.currentMode = "mst";
      this.runKruskalMST();
    });

    document.getElementById("btn-mode-fraud").addEventListener("click", () => {
      this.currentMode = "fraud";
      this.runFraudCycleScan();
    });

    if (this.currentMode === "dijkstra") this.runDijkstra();
    else if (this.currentMode === "mst") this.runKruskalMST();
    else this.runFraudCycleScan();
  }

  renderGraph({ nodes, edges, highlightPath = [], highlightEdges = [], isMst = false, isCycle = false }) {
    const svg = document.getElementById("network-graph-svg");
    if (!svg) return;

    let edgesHtml = "";
    edges.forEach(e => {
      const u = nodes.find(n => n.id === e.source);
      const v = nodes.find(n => n.id === e.target);
      if (!u || !v) return;

      const isHighlighted = highlightEdges.some(he =>
        (he.source === e.source && he.target === e.target) ||
        (!isCycle && he.source === e.target && he.target === e.source)
      );

      let edgeClass = "graph-edge-line";
      if (isHighlighted) {
        edgeClass += isMst ? " mst" : (isCycle ? " cycle" : " active");
      }

      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;
      const weightLabel = e.weight ? `${e.weight}km` : (e.amount ? `₹${(e.amount/1000).toFixed(0)}k` : '');

      edgesHtml += `
        <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" class="${edgeClass}" />
        <text x="${midX}" y="${midY - 4}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="middle">
          ${weightLabel}
        </text>
      `;
    });

    let nodesHtml = "";
    nodes.forEach(n => {
      const isPathNode = highlightPath.includes(n.id);
      const isStart = n.id === this.startNode;
      const isEnd = n.id === this.endNode;

      let circleFill = isCycle ? (n.isMule ? "rgba(244, 63, 94, 0.25)" : "var(--node-bg)") : (isPathNode ? "rgba(59, 130, 246, 0.3)" : "var(--node-bg)");
      let circleStroke = isCycle ? (n.isMule ? "var(--accent-rose)" : "var(--node-border)") : (isStart || isEnd ? "var(--accent-amber)" : (isPathNode ? "var(--accent-blue)" : "var(--node-border)"));

      nodesHtml += `
        <g transform="translate(${n.x}, ${n.y})">
          <circle r="16" fill="${circleFill}" stroke="${circleStroke}" stroke-width="2.5" class="tree-node-circle" />
          <text class="tree-node-text" font-size="10">${n.id}</text>
          <text y="26" fill="var(--text-secondary)" font-size="9" font-family="var(--font-sans)" text-anchor="middle">${n.label.split(' ')[0]}</text>
        </g>
      `;
    });

    svg.innerHTML = edgesHtml + nodesHtml;
  }
}

window.GraphVisualizer = GraphVisualizer;
