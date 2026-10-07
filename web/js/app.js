/**
 * Main Application Controller for AlgoVision 2.0
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global App State
  const state = {
    currentTab: "overview",
    theme: "dark",
    speed: 1,
    activeVisualizer: null
  };

  // Telemetry HUD Elements
  const elComparisons = document.getElementById("hud-comparisons");
  const elOperations = document.getElementById("hud-operations");
  const elTimeComplexity = document.getElementById("hud-time-complexity");
  const elSpaceComplexity = document.getElementById("hud-space-complexity");
  const elLogContainer = document.getElementById("hud-step-logs");

  function updateTelemetry(data = {}) {
    if (data.comparisons !== undefined) elComparisons.textContent = data.comparisons;
    if (data.operations !== undefined) elOperations.textContent = data.operations;
    if (data.timeComplexity !== undefined) elTimeComplexity.textContent = data.timeComplexity;
    if (data.spaceComplexity !== undefined) elSpaceComplexity.textContent = data.spaceComplexity;

    if (data.log) {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      if (data.isHighlight) entry.classList.add("highlight");
      if (data.isAlert) entry.classList.add("alert");
      entry.textContent = data.log;
      elLogContainer.prepend(entry);

      // Keep max 25 log items
      while (elLogContainer.children.length > 25) {
        elLogContainer.removeChild(elLogContainer.lastChild);
      }
    }
  }

  // Theme Toggler
  const themeBtn = document.getElementById("btn-toggle-theme");
  themeBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    themeBtn.textContent = state.theme === "dark" ? "☀️" : "🌙";
  });

  // Speed Slider
  const speedSlider = document.getElementById("speed-slider");
  const speedLabel = document.getElementById("speed-val-label");
  speedSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    state.speed = val;
    speedLabel.textContent = `${val}x`;
    if (state.activeVisualizer && typeof state.activeVisualizer.setSpeed === "function") {
      state.activeVisualizer.setSpeed(val);
    }
  });

  // Playback Buttons
  document.getElementById("btn-play").addEventListener("click", () => {
    if (state.activeVisualizer && typeof state.activeVisualizer.play === "function") {
      state.activeVisualizer.play();
    }
  });

  document.getElementById("btn-pause").addEventListener("click", () => {
    if (state.activeVisualizer && typeof state.activeVisualizer.pause === "function") {
      state.activeVisualizer.pause();
    }
  });

  document.getElementById("btn-step-next").addEventListener("click", () => {
    if (state.activeVisualizer && typeof state.activeVisualizer.stepForward === "function") {
      state.activeVisualizer.stepForward();
    }
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (state.activeVisualizer && typeof state.activeVisualizer.reset === "function") {
      state.activeVisualizer.reset();
    }
  });

  // Navigation Tab Switching
  const navBtns = document.querySelectorAll(".nav-tab-btn");
  const canvasStage = document.getElementById("main-canvas-stage");
  const stageTitle = document.getElementById("stage-card-title");

  function switchTab(tabId) {
    state.currentTab = tabId;
    navBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    canvasStage.innerHTML = "";

    switch (tabId) {
      case "overview":
        stageTitle.textContent = "Platform Architecture & System Flow";
        renderOverviewStage();
        state.activeVisualizer = null;
        break;
      case "ingestion":
        stageTitle.textContent = "Module 1: Data Ingestion (Queues & Hashing)";
        state.activeVisualizer = new window.QueueHashVisualizer("main-canvas-stage", updateTelemetry);
        break;
      case "cataloging":
        stageTitle.textContent = "Module 2: Cataloging (Dynamic Array & Dual-Pivot QuickSort)";
        state.activeVisualizer = new window.ArraySortVisualizer("main-canvas-stage", updateTelemetry);
        break;
      case "search":
        stageTitle.textContent = "Module 3: Search Engine (Self-Balancing AVL Tree & Heap)";
        state.activeVisualizer = new window.TreeHeapVisualizer("main-canvas-stage", updateTelemetry);
        break;
      case "optimizer":
        stageTitle.textContent = "Module 4: Optimizer (0/1 DP Knapsack & Greedy Routing)";
        state.activeVisualizer = new window.OptimizerVisualizer("main-canvas-stage", updateTelemetry);
        break;
      case "graphs":
        stageTitle.textContent = "Module 5: Network Topology & Fraud Graph (Dijkstra & MST)";
        state.activeVisualizer = new window.GraphVisualizer("main-canvas-stage", updateTelemetry);
        break;
      case "benchmarks":
        stageTitle.textContent = "Algorithmic Complexity Benchmarking Studio";
        state.activeVisualizer = new window.BenchmarkSuite("main-canvas-stage", updateTelemetry);
        break;
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  function renderOverviewStage() {
    canvasStage.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
        <div style="background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <h3 style="font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">
            AlgoVision 2.0 — Multi-Sector Algorithmic Analytics Platform
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
            A unified engineering system integrating <strong>5 Core DSA Pillars</strong> to solve high-impact optimization challenges across
            <strong>Supply Chain Logistics</strong> (routing & cargo density), <strong>E-Commerce</strong> (sub-millisecond cataloging & Top-K stream indexing),
            and <strong>FinTech</strong> (O(1) idempotency, circular money-laundering detection & FX arbitrage).
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div style="background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem;">
            <div style="font-size: 1.2rem; margin-bottom: 0.35rem;">📦 <strong>Module 1: Ingestion</strong></div>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Thread-safe Circular FIFO Queue + Separate Chaining Hash Tables with O(1) deduplication.</p>
          </div>
          <div style="background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem;">
            <div style="font-size: 1.2rem; margin-bottom: 0.35rem;">📊 <strong>Module 2: Cataloging</strong></div>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Contiguous Dynamic Arrays + Yaroslavskiy Dual-Pivot QuickSort with 3-Way Radix partitioning.</p>
          </div>
          <div style="background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem;">
            <div style="font-size: 1.2rem; margin-bottom: 0.35rem;">🔍 <strong>Module 3: Search Engine</strong></div>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Self-Balancing AVL Trees with LL/RR/LR/RL rotations + Streaming Top-K Min/Max Heaps.</p>
          </div>
          <div style="background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem;">
            <div style="font-size: 1.2rem; margin-bottom: 0.35rem;">⚡ <strong>Module 4: Optimizer</strong></div>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Greedy Fractional Knapsack & Activity Scheduler + 2D Matrix DP (0/1 Knapsack, LCS, Floyd-Warshall).</p>
          </div>
          <div style="background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem;">
            <div style="font-size: 1.2rem; margin-bottom: 0.35rem;">🌐 <strong>Module 5: Topology</strong></div>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Adjacency List/Matrix Graphs + Dijkstra SSSP, Kruskal MST (DSU), and Tarjan SCC Fraud Rings.</p>
          </div>
        </div>
      </div>
    `;

    updateTelemetry({
      comparisons: 0,
      operations: 5,
      timeComplexity: "O(1) to O(V³)",
      spaceComplexity: "O(N) to O(V²)",
      log: "System loaded. Select a module from the left sidebar to begin interactive step-by-step visual execution."
    });
  }

  // Initial load
  switchTab("overview");
});
