/**
 * Main Application Controller for AlgoVision 2.0
 * Handcrafted by Saikat Koner • B.Tech CSE • LaunchED Global Internship Capstone
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global App State
  const state = {
    currentTab: "overview",
    theme: "light",
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
    state.theme = state.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", state.theme);
    themeBtn.textContent = state.theme === "light" ? "🌙" : "☀️";
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
        stageTitle.textContent = "Platform Architecture & Engineering Dossier";
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
        <!-- Hero Banner Card -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f5f3ff 100%); border: 1.5px solid #bae6fd; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(2, 132, 199, 0.08);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; background: #ffffff; padding: 3px 10px; border-radius: 9999px; border: 1px solid #bae6fd; display: inline-block; margin-bottom: 0.5rem;">
                Capstone Major Submission • NASSCOM FutureSkills
              </span>
              <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 0.4rem; letter-spacing: -0.02em;">
                AlgoVision 2.0 — Multi-Sector Algorithmic Analytics Platform
              </h3>
              <p style="font-size: 0.88rem; color: #334155; line-height: 1.6; max-width: 680px;">
                Designed & engineered from first principles by <strong>Saikat Koner</strong>. Integrates <strong>5 Fundamental DSA Pillars</strong> across
                <strong>Supply Chain Logistics</strong>, <strong>High-Density E-Commerce</strong>, and <strong>FinTech Fraud & Arbitrage Engines</strong>.
              </p>
            </div>
            <div style="background: #ffffff; padding: 1rem; border-radius: 12px; border: 1px solid #cbd5e1; text-align: right; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Lead Developer</div>
              <div style="font-size: 1rem; font-weight: 800; color: #0f172a;">Saikat Koner</div>
              <div style="font-size: 0.75rem; color: #0284c7; font-weight: 700;">B.Tech CSE (Hons.)</div>
            </div>
          </div>
        </div>

        <!-- 5 Interactive Module Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <div onclick="document.querySelector('[data-tab=ingestion]').click()" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 1.15rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='#0284c7'" onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.4rem;">📦</span>
              <span style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">O(1) Ingest</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">1. Data Ingestion</h4>
            <p style="font-size: 0.78rem; color: #475569; line-height: 1.5;">Thread-safe Circular FIFO Queue + Separate Chaining Hash Tables with dynamic rehashing (α ≥ 0.75).</p>
          </div>

          <div onclick="document.querySelector('[data-tab=cataloging]').click()" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 1.15rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='#059669'" onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.4rem;">📊</span>
              <span style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: #059669; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">O(N log N)</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">2. Cataloging Engine</h4>
            <p style="font-size: 0.78rem; color: #475569; line-height: 1.5;">Contiguous Dynamic Array + Yaroslavskiy Dual-Pivot QuickSort with 3-Way Radix partitioning.</p>
          </div>

          <div onclick="document.querySelector('[data-tab=search]').click()" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 1.15rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='#7c3aed'" onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.4rem;">🔍</span>
              <span style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: #7c3aed; background: #f3e8ff; padding: 2px 6px; border-radius: 4px;">O(log N)</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">3. Search Engine</h4>
            <p style="font-size: 0.78rem; color: #475569; line-height: 1.5;">Self-Balancing AVL Trees with LL/RR/LR/RL rotation visualizer + Streaming Top-K Min/Max Heaps.</p>
          </div>

          <div onclick="document.querySelector('[data-tab=optimizer]').click()" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 1.15rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='#d97706'" onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.4rem;">⚡</span>
              <span style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">O(N·W) DP</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">4. Optimization Core</h4>
            <p style="font-size: 0.78rem; color: #475569; line-height: 1.5;">Greedy Fractional Knapsack & Activity Scheduler + 2D Matrix DP table with backtrack path solver.</p>
          </div>

          <div onclick="document.querySelector('[data-tab=graphs]').click()" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 1.15rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='#e11d48'" onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.4rem;">🌐</span>
              <span style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: #e11d48; background: #ffe4e6; padding: 2px 6px; border-radius: 4px;">O(V+E) Graph</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">5. Network Topology</h4>
            <p style="font-size: 0.78rem; color: #475569; line-height: 1.5;">Adjacency Graphs + Dijkstra SSSP, Kruskal MST (Disjoint Set Union), and Tarjan SCC Fraud Rings.</p>
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
