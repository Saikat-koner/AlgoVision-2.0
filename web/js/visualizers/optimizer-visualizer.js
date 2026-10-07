/**
 * Module 4: Optimizer (0/1 DP Knapsack & Fractional Greedy Visualizer)
 */

class OptimizerVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.items = [
      { name: "Medical Kit", weight: 2, value: 40 },
      { name: "Electronics", weight: 3, value: 50 },
      { name: "Precision Tool", weight: 4, value: 70 },
      { name: "Apparel Batch", weight: 5, value: 80 }
    ];
    this.capacity = 8;
    this.dpTable = [];
    this.selectedIndices = [];
    this.currentStepIdx = 0;
    this.steps = [];
    this.isPlaying = false;
    this.timer = null;
    this.speedMs = 300;

    this.computeDPSteps();
    this.render();
  }

  computeDPSteps() {
    const n = this.items.length;
    const wCap = this.capacity;
    this.dpTable = Array.from({ length: n + 1 }, () => Array(wCap + 1).fill(0));
    this.steps = [];

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
          decision = include > exclude ? `Included (${val} + DP[${i-1}][${w-wt}])` : `Excluded (DP[${i-1}][${w}])`;
        } else {
          this.dpTable[i][w] = this.dpTable[i - 1][w];
          decision = `Weight (${wt}) > Capacity (${w}), Excluded`;
        }

        this.steps.push({
          row: i,
          col: w,
          val: this.dpTable[i][w],
          item: itemName,
          decision,
          tableSnapshot: this.dpTable.map(r => [...r])
        });
      }
    }

    // Backtrack path
    this.selectedIndices = [];
    let currW = wCap;
    for (let i = n; i > 0; i--) {
      if (this.dpTable[i][currW] !== this.dpTable[i - 1][currW]) {
        this.selectedIndices.push(i - 1);
        currW -= this.items[i - 1].weight;
      }
    }
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            0/1 Knapsack State Recurrence: <span style="font-family: var(--font-mono); color: var(--accent-cyan);">DP[i][w] = max(DP[i-1][w], val[i] + DP[i-1][w-wt[i]])</span>
          </div>
          <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--accent-emerald);">
            Truck Max Payload: ${this.capacity} kg | Selected Freight: ${this.selectedIndices.map(idx => this.items[idx].name).join(', ')}
          </div>
        </div>

        <div class="dp-table-container">
          <table class="dp-matrix" id="dp-table-matrix"></table>
        </div>
      </div>
    `;

    this.renderTableAtStep(this.steps.length - 1);
  }

  renderTableAtStep(stepIdx) {
    const table = document.getElementById("dp-table-matrix");
    if (!table || !this.steps[stepIdx]) return;

    const step = this.steps[stepIdx];
    const snapshot = step.tableSnapshot;

    let headerHtml = `<tr><th>Item / Weight</th>`;
    for (let w = 0; w <= this.capacity; w++) {
      headerHtml += `<th>w = ${w}</th>`;
    }
    headerHtml += `</tr>`;

    let rowsHtml = "";
    for (let i = 0; i <= this.items.length; i++) {
      const label = i === 0 ? "Base Case (0)" : `${this.items[i - 1].name} (₹${this.items[i - 1].value}, ${this.items[i - 1].weight}kg)`;
      let cellsHtml = `<td><strong>${label}</strong></td>`;

      for (let w = 0; w <= this.capacity; w++) {
        let cellClass = "";
        if (i === step.row && w === step.col) cellClass = "active-cell";
        else if (i === this.items.length && w === this.capacity) cellClass = "selected-cell";

        cellsHtml += `<td class="${cellClass}">₹${snapshot[i][w]}</td>`;
      }
      rowsHtml += `<tr>${cellsHtml}</tr>`;
    }

    table.innerHTML = headerHtml + rowsHtml;

    this.telemetry({
      comparisons: stepIdx + 1,
      operations: (this.items.length + 1) * (this.capacity + 1),
      timeComplexity: "O(N * W) Polynomial",
      spaceComplexity: "O(N * W) State Table",
      log: `[DP Fill (${step.row}, ${step.col})] Item "${step.item}": ${step.decision} → Cell Value = ₹${step.val}`,
      isHighlight: step.decision.includes("Included")
    });
  }
}

window.OptimizerVisualizer = OptimizerVisualizer;
