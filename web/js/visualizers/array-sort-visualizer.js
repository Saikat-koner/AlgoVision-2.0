/**
 * Module 2: Cataloging (Dynamic Array & Dual-Pivot QuickSort Visualizer)
 */

class ArraySortVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.items = [145, 32, 89, 210, 55, 175, 12, 98, 260, 42, 190, 75, 130, 25, 220];
    this.steps = [];
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.animationTimer = null;
    this.speedMs = 400;

    this.render();
    this.generateSortSteps();
  }

  setSpeed(speedMultiplier) {
    this.speedMs = Math.max(50, Math.floor(400 / speedMultiplier));
  }

  generateSortSteps() {
    this.steps = [];
    let arr = [...this.items];
    let comparisons = 0;
    let swaps = 0;

    const recordStep = (currentArr, p1Idx, p2Idx, compIdxs, sortedRange, msg) => {
      this.steps.push({
        arr: [...currentArr],
        p1Idx,
        p2Idx,
        compIdxs: compIdxs || [],
        sortedRange: sortedRange || [],
        comparisons,
        swaps,
        message: msg
      });
    };

    const dualPivotQS = (a, low, high) => {
      if (low >= high) {
        if (low === high) recordStep(a, null, null, [], [low], `Single element segment [${low}] sorted.`);
        return;
      }

      comparisons++;
      if (a[low] > a[high]) {
        swaps++;
        [a[low], a[high]] = [a[high], a[low]];
        recordStep(a, low, high, [low, high], [], `Pivots swapped to guarantee P1 (${a[low]}) <= P2 (${a[high]}).`);
      }

      let p1 = a[low];
      let p2 = a[high];
      let lt = low + 1;
      let gt = high - 1;
      let k = low + 1;

      recordStep(a, low, high, [], [], `Dual Pivots chosen: P1=${p1} (idx ${low}), P2=${p2} (idx ${high}).`);

      while (k <= gt) {
        comparisons++;
        if (a[k] < p1) {
          swaps++;
          [a[k], a[lt]] = [a[lt], a[k]];
          recordStep(a, low, high, [k, lt], [], `Element ${a[lt]} < P1 (${p1}). Swapped into Left Partition (< P1).`);
          lt++;
          k++;
        } else if (a[k] > p2) {
          while (k < gt && a[gt] > p2) {
            comparisons++;
            gt--;
          }
          swaps++;
          [a[k], a[gt]] = [a[gt], a[k]];
          recordStep(a, low, high, [k, gt], [], `Element ${a[gt]} > P2 (${p2}). Swapped into Right Partition (> P2).`);
          gt--;
          comparisons++;
          if (a[k] < p1) {
            swaps++;
            [a[k], a[lt]] = [a[lt], a[k]];
            lt++;
          }
          k++;
        } else {
          k++;
        }
      }

      lt--;
      gt++;
      swaps += 2;
      [a[low], a[lt]] = [a[lt], a[low]];
      [a[high], a[gt]] = [a[gt], a[high]];
      recordStep(a, lt, gt, [lt, gt], [lt, gt], `Pivots placed in final positions: P1 at [${lt}], P2 at [${gt}].`);

      dualPivotQS(a, low, lt - 1);
      dualPivotQS(a, lt + 1, gt - 1);
      dualPivotQS(a, gt + 1, high);
    };

    dualPivotQS(arr, 0, arr.length - 1);
    recordStep(arr, null, null, [], Array.from({ length: arr.length }, (_, i) => i), "Dual-Pivot QuickSort execution completed! Array fully sorted.");
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.runLoop();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.animationTimer);
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
  }

  runLoop() {
    if (!this.isPlaying) return;
    if (this.currentStepIdx < this.steps.length - 1) {
      this.currentStepIdx++;
      this.renderCurrentStep();
      this.animationTimer = setTimeout(() => this.runLoop(), this.speedMs);
    } else {
      this.pause();
    }
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            Dual-Pivot Partitioning: <span style="color: var(--accent-amber); font-weight: bold;">■ Pivot 1 (Left)</span> |
            <span style="color: var(--accent-purple); font-weight: bold;">■ Pivot 2 (Right)</span> |
            <span style="color: var(--accent-rose); font-weight: bold;">■ Active Comparison</span> |
            <span style="color: var(--accent-emerald); font-weight: bold;">■ Sorted Segment</span>
          </div>
          <button class="btn-secondary" id="btn-shuffle-array" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">🔀 Shuffle Dataset</button>
        </div>
        <div id="sort-bars-stage" class="sort-bars-container"></div>
      </div>
    `;

    document.getElementById("btn-shuffle-array").addEventListener("click", () => {
      this.items = this.items.sort(() => Math.random() - 0.5);
      this.currentStepIdx = 0;
      this.generateSortSteps();
      this.renderCurrentStep();
    });

    this.renderCurrentStep();
  }

  renderCurrentStep() {
    const stage = document.getElementById("sort-bars-stage");
    if (!stage || !this.steps[this.currentStepIdx]) return;

    const step = this.steps[this.currentStepIdx];
    const maxVal = Math.max(...step.arr, 300);

    stage.innerHTML = step.arr.map((val, idx) => {
      const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));
      let barClass = "sort-bar";

      if (idx === step.p1Idx) barClass += " pivot1";
      else if (idx === step.p2Idx) barClass += " pivot2";
      else if (step.compIdxs.includes(idx)) barClass += " comparing";
      else if (step.sortedRange.includes(idx)) barClass += " sorted";

      return `
        <div class="${barClass}" style="height: ${heightPercent}%;">
          ${val}
        </div>
      `;
    }).join('');

    this.telemetry({
      comparisons: step.comparisons,
      swaps: step.swaps,
      operations: step.comparisons + step.swaps,
      timeComplexity: "O(N log N) Avg / O(N²) Worst",
      spaceComplexity: "O(log N) Stack",
      log: `[Step ${this.currentStepIdx + 1}/${this.steps.length}] ${step.message}`,
      isHighlight: step.sortedRange.length > 0
    });
  }
}

window.ArraySortVisualizer = ArraySortVisualizer;
