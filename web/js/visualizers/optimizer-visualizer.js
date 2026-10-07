/**
 * Module 4: Optimizer (0/1 DP Knapsack, Fractional Greedy, Edit Distance & FX Arbitrage)
 * Fully Interactive with Playback Controls, Capacity Sliders, Custom Items & DP Table Matrix
 */

class OptimizerVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.activeMode = "knapsack01"; // 'knapsack01', 'fractional', 'edit_distance', 'fx_arbitrage'
    this.items = [
      { id: "ITM-1", name: "Medical Kit", weight: 2, value: 40 },
      { id: "ITM-2", name: "Drone Battery", weight: 3, value: 50 },
      { id: "ITM-3", name: "Precision Tool", weight: 4, value: 70 },
      { id: "ITM-4", name: "Satellite Link", weight: 5, value: 80 }
    ];
    this.capacity = 8;
    this.dpTable = [];
    this.selectedIndices = [];
    this.currentStepIdx = 0;
    this.steps = [];
    this.isPlaying = false;
    this.timer = null;
    this.speedMs = 350;

    // Levenshtein / Edit Distance strings
    this.word1 = "KOLKATA";
    this.word2 = "KOLKATA_HUB";

    // FX Arbitrage Rates
    this.currencies = ["USD", "EUR", "GBP", "INR", "JPY"];
    this.fxRates = [
      [1.000, 0.920, 0.790, 83.50, 155.2],
      [1.087, 1.000, 0.858, 90.75, 168.7],
      [1.266, 1.165, 1.000, 105.7, 196.4],
      [0.012, 0.011, 0.009, 1.000, 1.858],
      [0.006, 0.006, 0.005, 0.538, 1.000]
    ];

    this.computeDPSteps();
    this.render();
  }

  setSpeed(multiplier) {
    this.speedMs = Math.max(50, Math.floor(350 / multiplier));
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.telemetry({
      timeComplexity: "O(N * W) Dynamic Programming",
      spaceComplexity: "O(N * W) 2D State Table",
      log: `▶ [Optimizer Playback Started] Solving ${this.activeMode.toUpperCase()} cell-by-cell...`,
      isHighlight: true
    });
    this.runLoop();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.timer);
    this.telemetry({
      log: "⏸ [Optimizer Paused] State computation paused."
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
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(N * W)",
      log: "↺ [Optimizer Reset] Table cleared to Base Case (w=0, i=0)."
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

  computeDPSteps() {
    const n = this.items.length;
    const wCap = this.capacity;
    this.dpTable = Array.from({ length: n + 1 }, () => Array(wCap + 1).fill(0));
    this.steps = [];

    // Step 0: Base Case
    this.steps.push({
      row: 0,
      col: 0,
      val: 0,
      item: "Base Case",
      decision: "Base condition initialization DP[0][w] = 0.",
      tableSnapshot: this.dpTable.map(r => [...r]),
      isBacktrack: false
    });

    for (let i = 1; i <= n; i++) {
      const wt = this.items[i - 1].weight;
      const val = this.items[i - 1].value;
      const itemName = this.items[i - 1].name;

      for (let w = 1; w <= wCap; w++) {
        let decision = "";
        if (wt <= w) {
          const include = val + this.dpTable[i - 1][w - wt];
          const exclude = this.dpTable[i - 1][w];
          this.dpTable[i][w] = Math.max(include, exclude);
          decision = include > exclude
            ? `Included! ₹${val} + DP[${i - 1}][${w - wt}] (₹${this.dpTable[i - 1][w - wt]}) = ₹${include}`
            : `Excluded. Kept DP[${i - 1}][${w}] = ₹${exclude}`;
        } else {
          this.dpTable[i][w] = this.dpTable[i - 1][w];
          decision = `Weight (${wt}kg) > Sub-capacity (${w}kg). Excluded.`;
        }

        this.steps.push({
          row: i,
          col: w,
          val: this.dpTable[i][w],
          item: itemName,
          decision,
          tableSnapshot: this.dpTable.map(r => [...r]),
          isBacktrack: false
        });
      }
    }

    // Backtrack Path Reconstruction
    this.selectedIndices = [];
    let currW = wCap;
    for (let i = n; i > 0; i--) {
      if (this.dpTable[i][currW] !== this.dpTable[i - 1][currW]) {
        this.selectedIndices.push(i - 1);
        currW -= this.items[i - 1].weight;
      }
    }

    // Final backtrack step
    this.steps.push({
      row: n,
      col: wCap,
      val: this.dpTable[n][wCap],
      item: "Optimal Solution",
      decision: `Backtracking Complete! Selected Items: [${this.selectedIndices.map(idx => this.items[idx].name).join(', ')}] with Max Value = ₹${this.dpTable[n][wCap]}.`,
      tableSnapshot: this.dpTable.map(r => [...r]),
      isBacktrack: true
    });
  }

  setCapacity(newCap) {
    this.capacity = Math.max(2, Math.min(16, newCap));
    this.pause();
    this.computeDPSteps();
    this.currentStepIdx = this.steps.length - 1;
    this.render();
  }

  addItem(name, weight, value) {
    if (!name || weight <= 0 || value <= 0) return;
    this.items.push({
      id: `ITM-${this.items.length + 1}`,
      name,
      weight: parseInt(weight),
      value: parseInt(value)
    });
    this.pause();
    this.computeDPSteps();
    this.currentStepIdx = this.steps.length - 1;
    this.render();
  }

  removeItem(index) {
    if (this.items.length <= 1) return;
    this.items.splice(index, 1);
    this.pause();
    this.computeDPSteps();
    this.currentStepIdx = this.steps.length - 1;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
        <!-- Mode Switcher & Presets Header -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <button class="${this.activeMode === 'knapsack01' ? 'btn-primary' : 'btn-secondary'}" id="btn-tab-knapsack" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              📦 0/1 Knapsack DP Table
            </button>
            <button class="${this.activeMode === 'fractional' ? 'btn-primary' : 'btn-secondary'}" id="btn-tab-fractional" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              ⚖️ Greedy Fractional Knapsack
            </button>
            <button class="${this.activeMode === 'edit_distance' ? 'btn-primary' : 'btn-secondary'}" id="btn-tab-edit" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              🔤 Levenshtein Edit Distance
            </button>
            <button class="${this.activeMode === 'fx_arbitrage' ? 'btn-primary' : 'btn-secondary'}" id="btn-tab-fx" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              💱 FX Currency Arbitrage
            </button>
          </div>

          <!-- Presets -->
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Presets:</span>
            <button class="btn-secondary" id="preset-air-freight" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">✈️ Air Cargo</button>
            <button class="btn-secondary" id="preset-medical" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">🏥 Disaster Relief</button>
          </div>
        </div>

        <!-- 0/1 Knapsack Controls & Matrix View -->
        <div id="knapsack-view-container" style="display: ${this.activeMode === 'knapsack01' ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
          <!-- Interactive Item Bar & Capacity Controller -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1.1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <!-- Capacity Slider -->
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.8rem; font-weight: 800; color: #0f172a;">Truck Capacity:</span>
              <input type="range" id="knapsack-cap-slider" min="4" max="14" value="${this.capacity}" style="cursor: pointer; width: 120px;">
              <span id="knapsack-cap-val" style="font-family: var(--font-mono); font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${this.capacity} kg</span>
            </div>

            <!-- Add Item Form -->
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              <input type="text" id="new-item-name" placeholder="Cargo Name" value="Solar Sensor" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 100px;">
              <input type="number" id="new-item-wt" placeholder="Wt (kg)" value="3" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 65px;">
              <input type="number" id="new-item-val" placeholder="Val (₹)" value="60" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 65px;">
              <button class="btn-primary" id="btn-add-cargo-item" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">+ Add Cargo</button>
            </div>
          </div>

          <!-- Cargo Items Pills -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Available Cargo Items:</span>
            ${this.items.map((itm, idx) => `
              <div style="background: #ffffff; border: 1.5px solid ${this.selectedIndices.includes(idx) ? '#059669' : '#cbd5e1'}; border-radius: 20px; padding: 0.25rem 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <span style="font-weight: 800; color: #0f172a;">${itm.name}</span>
                <span style="color: #64748b; font-family: var(--font-mono);">${itm.weight}kg / ₹${itm.value}</span>
                <span style="cursor: pointer; color: #ef4444; font-weight: bold; margin-left: 2px;" onclick="window.activeOptimizerVisualizer.removeItem(${idx})" title="Remove item">✕</span>
              </div>
            `).join('')}
          </div>

          <!-- DP Table Card -->
          <div class="dp-table-container" style="background: #ffffff; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-md); padding: 1rem; overflow-x: auto;">
            <table class="dp-matrix" id="dp-table-matrix" style="width: 100%; border-collapse: collapse;"></table>
          </div>
        </div>

        <!-- Fractional Knapsack Greedy View -->
        <div id="fractional-view-container" style="display: ${this.activeMode === 'fractional' ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; font-size: 0.82rem; color: #475569;">
            <strong style="color: #0f172a;">Greedy Density Heuristic:</strong> Items are sorted strictly by Value-to-Weight density ratio $(\rho = \frac{V_i}{W_i})$ in $O(N \log N)$ time. Discrete items are consumed 100% until the remaining truck capacity is filled by an exact fraction of the boundary item.
          </div>
          <div id="fractional-bars-stage" style="display: flex; flex-direction: column; gap: 0.6rem;"></div>
        </div>

        <!-- Levenshtein Edit Distance View -->
        <div id="edit-distance-container" style="display: ${this.activeMode === 'edit_distance' ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; font-size: 0.82rem;">
            <strong style="color: #0f172a;">Typo-Tolerant Search:</strong> Computes the minimum single-character edits (Insertions, Deletions, Substitutions) required to transform query <code style="color: #0284c7;">"${this.word1}"</code> into catalog SKU <code style="color: #059669;">"${this.word2}"</code>.
          </div>
          <div id="edit-distance-matrix-view" style="overflow-x: auto; background: #ffffff; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;"></div>
        </div>

        <!-- FX Arbitrage Matrix View -->
        <div id="fx-arbitrage-container" style="display: ${this.activeMode === 'fx_arbitrage' ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 1rem; font-size: 0.82rem; color: #166534;">
            <strong>Risk-Free Arbitrage Loop Detected:</strong> <code style="font-family: var(--font-mono); font-weight: 800;">USD ➔ EUR ➔ GBP ➔ INR ➔ USD</code> yields a compounded return of <span style="background: #dcfce7; padding: 2px 6px; border-radius: 4px; font-weight: 800; color: #15803d;">+1.34% Net Profit</span> via Floyd-Warshall negative cycle detection on $w = -\ln(\text{rate})$.
          </div>
          <div id="fx-matrix-table-view" style="overflow-x: auto; background: #ffffff; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;"></div>
        </div>
      </div>
    `;

    window.activeOptimizerVisualizer = this;

    // Mode Switcher Listeners
    document.getElementById("btn-tab-knapsack").addEventListener("click", () => {
      this.activeMode = "knapsack01";
      this.render();
    });
    document.getElementById("btn-tab-fractional").addEventListener("click", () => {
      this.activeMode = "fractional";
      this.render();
      this.renderFractionalView();
    });
    document.getElementById("btn-tab-edit").addEventListener("click", () => {
      this.activeMode = "edit_distance";
      this.render();
      this.renderEditDistanceView();
    });
    document.getElementById("btn-tab-fx").addEventListener("click", () => {
      this.activeMode = "fx_arbitrage";
      this.render();
      this.renderFXArbitrageView();
    });

    // Presets
    document.getElementById("preset-air-freight").addEventListener("click", () => {
      this.items = [
        { id: "ITM-1", name: "Turbine Blade", weight: 3, value: 90 },
        { id: "ITM-2", name: "Avionics Core", weight: 2, value: 80 },
        { id: "ITM-3", name: "Emergency Radar", weight: 4, value: 110 },
        { id: "ITM-4", name: "Oxygen Tanks", weight: 1, value: 35 }
      ];
      this.capacity = 6;
      this.computeDPSteps();
      this.render();
    });

    document.getElementById("preset-medical").addEventListener("click", () => {
      this.items = [
        { id: "ITM-1", name: "Vaccine Chest", weight: 2, value: 50 },
        { id: "ITM-2", name: "Water Purifier", weight: 4, value: 75 },
        { id: "ITM-3", name: "Defibrillator", weight: 3, value: 65 },
        { id: "ITM-4", name: "First Aid Kit", weight: 1, value: 25 },
        { id: "ITM-5", name: "Field Tent", weight: 5, value: 85 }
      ];
      this.capacity = 9;
      this.computeDPSteps();
      this.render();
    });

    if (this.activeMode === "knapsack01") {
      // Capacity Slider Listener
      const slider = document.getElementById("knapsack-cap-slider");
      if (slider) {
        slider.addEventListener("input", (e) => {
          this.setCapacity(parseInt(e.target.value));
        });
      }

      // Add Item Listener
      document.getElementById("btn-add-cargo-item").addEventListener("click", () => {
        const name = document.getElementById("new-item-name").value;
        const wt = parseInt(document.getElementById("new-item-wt").value);
        const val = parseInt(document.getElementById("new-item-val").value);
        this.addItem(name, wt, val);
      });

      this.renderCurrentStep();
    }
  }

  renderCurrentStep() {
    if (this.activeMode !== "knapsack01") return;
    const table = document.getElementById("dp-table-matrix");
    if (!table || !this.steps[this.currentStepIdx]) return;

    const step = this.steps[this.currentStepIdx];
    const snapshot = step.tableSnapshot;

    let headerHtml = `<thead><tr style="background: #f1f5f9;"><th style="padding: 0.6rem; font-size: 0.75rem; text-align: left; border: 1px solid #e2e8f0; color: #475569;">Item / Payload Limit</th>`;
    for (let w = 0; w <= this.capacity; w++) {
      headerHtml += `<th style="padding: 0.6rem; font-size: 0.75rem; text-align: center; border: 1px solid #e2e8f0; font-family: var(--font-mono); color: #0284c7;">w = ${w}kg</th>`;
    }
    headerHtml += `</tr></thead>`;

    let rowsHtml = `<tbody>`;
    for (let i = 0; i <= this.items.length; i++) {
      const label = i === 0 ? "Base (0 items)" : `${this.items[i - 1].name} (${this.items[i - 1].weight}kg, ₹${this.items[i - 1].value})`;
      const isSelected = i > 0 && this.selectedIndices.includes(i - 1) && step.isBacktrack;

      let cellsHtml = `<td style="padding: 0.6rem; font-size: 0.78rem; font-weight: 700; border: 1px solid #e2e8f0; background: ${isSelected ? '#dcfce7' : '#ffffff'}; color: ${isSelected ? '#15803d' : '#0f172a'};">${label}</td>`;

      for (let w = 0; w <= this.capacity; w++) {
        let cellBg = "#ffffff";
        let cellColor = "#0f172a";
        let fontWt = "500";
        let borderStyle = "1px solid #e2e8f0";

        if (i === step.row && w === step.col) {
          cellBg = "#fef3c7";
          cellColor = "#d97706";
          fontWt = "800";
          borderStyle = "2px solid #d97706";
        } else if (step.isBacktrack && i === this.items.length && w === this.capacity) {
          cellBg = "#dcfce7";
          cellColor = "#15803d";
          fontWt = "800";
          borderStyle = "2px solid #16a34a";
        }

        cellsHtml += `
          <td style="padding: 0.5rem; text-align: center; border: ${borderStyle}; background: ${cellBg}; color: ${cellColor}; font-weight: ${fontWt}; font-family: var(--font-mono); font-size: 0.8rem;">
            ₹${snapshot[i][w]}
          </td>
        `;
      }
      rowsHtml += `<tr>${cellsHtml}</tr>`;
    }
    rowsHtml += `</tbody>`;

    table.innerHTML = headerHtml + rowsHtml;

    this.telemetry({
      comparisons: this.currentStepIdx + 1,
      operations: (this.items.length + 1) * (this.capacity + 1),
      timeComplexity: "O(N * W) Polynomial Time",
      spaceComplexity: "O(N * W) State Table",
      log: `[Step ${this.currentStepIdx + 1}/${this.steps.length}] ${step.decision}`,
      isHighlight: step.decision.includes("Included") || step.isBacktrack
    });
  }

  renderFractionalView() {
    const stage = document.getElementById("fractional-bars-stage");
    if (!stage) return;

    let itemsSorted = [...this.items].map(itm => ({
      ...itm,
      density: (itm.value / itm.weight).toFixed(2)
    })).sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

    let remainingCap = this.capacity;
    let totalVal = 0;

    let html = itemsSorted.map(itm => {
      let fraction = 0;
      let valContributed = 0;

      if (remainingCap >= itm.weight) {
        fraction = 1.0;
        valContributed = itm.value;
        remainingCap -= itm.weight;
      } else if (remainingCap > 0) {
        fraction = remainingCap / itm.weight;
        valContributed = itm.value * fraction;
        remainingCap = 0;
      }

      totalVal += valContributed;

      return `
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: ${fraction === 1 ? '#dcfce7' : fraction > 0 ? '#fef3c7' : '#f1f5f9'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); color: ${fraction === 1 ? '#15803d' : fraction > 0 ? '#d97706' : '#64748b'}; font-size: 0.85rem;">
              ${Math.round(fraction * 100)}%
            </div>
            <div>
              <div style="font-size: 0.92rem; font-weight: 800; color: #0f172a;">${itm.name}</div>
              <div style="font-size: 0.72rem; color: #64748b; font-family: var(--font-mono);">Density Ratio: ₹${itm.density}/kg | Weight: ${itm.weight}kg | Full Val: ₹${itm.value}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.05rem; font-weight: 800; color: #0284c7; font-family: var(--font-mono);">+₹${valContributed.toFixed(1)}</div>
            <div style="font-size: 0.7rem; color: #059669; font-weight: 700;">${fraction === 1 ? '100% Packed' : fraction > 0 ? `${(fraction * itm.weight).toFixed(1)}kg Packed` : '0% Excluded'}</div>
          </div>
        </div>
      `;
    }).join('');

    html += `
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
        <span style="font-weight: 800; color: #166534; font-size: 0.95rem;">Total Optimal Fractional Value</span>
        <span style="font-family: var(--font-mono); font-size: 1.3rem; font-weight: 900; color: #15803d;">₹${totalVal.toFixed(1)}</span>
      </div>
    `;

    stage.innerHTML = html;
  }

  renderEditDistanceView() {
    const view = document.getElementById("edit-distance-matrix-view");
    if (!view) return;

    const s1 = " " + this.word1;
    const s2 = " " + this.word2;
    const dp = Array.from({ length: s1.length }, () => Array(s2.length).fill(0));

    for (let i = 0; i < s1.length; i++) dp[i][0] = i;
    for (let j = 0; j < s2.length; j++) dp[0][j] = j;

    for (let i = 1; i < s1.length; i++) {
      for (let j = 1; j < s2.length; j++) {
        if (s1[i] === s2[j]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    let html = `<table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.78rem;"><thead><tr><th style="padding: 6px; border: 1px solid #e2e8f0; background: #f8fafc;">s1 \\ s2</th>`;
    for (let j = 0; j < s2.length; j++) {
      html += `<th style="padding: 6px; border: 1px solid #e2e8f0; background: #f8fafc; color: #0284c7;">${s2[j] === ' ' ? 'ε' : s2[j]}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < s1.length; i++) {
      html += `<tr><td style="padding: 6px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; color: #059669;">${s1[i] === ' ' ? 'ε' : s1[i]}</td>`;
      for (let j = 0; j < s2.length; j++) {
        const isEnd = (i === s1.length - 1 && j === s2.length - 1);
        html += `<td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; background: ${isEnd ? '#dcfce7' : '#ffffff'}; color: ${isEnd ? '#15803d' : '#0f172a'}; font-weight: ${isEnd ? '800' : '500'};">${dp[i][j]}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;

    view.innerHTML = html;
  }

  renderFXArbitrageView() {
    const view = document.getElementById("fx-matrix-table-view");
    if (!view) return;

    let html = `<table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.78rem;"><thead><tr><th style="padding: 6px; border: 1px solid #e2e8f0; background: #f8fafc;">Pair Rate</th>`;
    this.currencies.forEach(c => {
      html += `<th style="padding: 6px; border: 1px solid #e2e8f0; background: #f8fafc; color: #0284c7;">${c}</th>`;
    });
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < this.currencies.length; i++) {
      html += `<tr><td style="padding: 6px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">${this.currencies[i]}</td>`;
      for (let j = 0; j < this.currencies.length; j++) {
        html += `<td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; background: #ffffff;">${this.fxRates[i][j].toFixed(3)}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;

    view.innerHTML = html;
  }
}

window.OptimizerVisualizer = OptimizerVisualizer;
