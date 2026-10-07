/**
 * Module 2: Cataloging (Dynamic Array, Dual-Pivot QuickSort, 3-Way Partition & Binary Search)
 * Fully Interactive with Multi-Algorithm Selection & Step Execution
 */

class ArraySortVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.currentAlgo = "dual_pivot"; // 'dual_pivot', 'three_way', 'mergesort', 'binary_search'
    this.items = [145, 32, 89, 210, 55, 175, 12, 98, 260, 42, 190, 75, 130, 25, 220];
    this.steps = [];
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.animationTimer = null;
    this.speedMs = 350;
    this.searchTarget = 145;

    this.render();
    this.generateSteps();
  }

  setSpeed(speedMultiplier) {
    this.speedMs = Math.max(40, Math.floor(350 / speedMultiplier));
  }

  setAlgorithm(algo) {
    this.pause();
    this.currentAlgo = algo;
    this.currentStepIdx = 0;
    this.generateSteps();
    this.renderCurrentStep();
  }

  generateSteps() {
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

    if (this.currentAlgo === "dual_pivot") {
      const dualPivotQS = (a, low, high) => {
        if (low >= high) {
          if (low === high) recordStep(a, null, null, [], [low], `Single element segment [${low}] sorted.`);
          return;
        }

        comparisons++;
        if (a[low] > a[high]) {
          swaps++;
          [a[low], a[high]] = [a[high], a[low]];
          recordStep(a, low, high, [low, high], [], `Pivots swapped: P1 (${a[low]}) <= P2 (${a[high]}).`);
        }

        let p1 = a[low];
        let p2 = a[high];
        let lt = low + 1;
        let gt = high - 1;
        let k = low + 1;

        recordStep(a, low, high, [], [], `Dual Pivots selected: P1=${p1} (idx ${low}), P2=${p2} (idx ${high}).`);

        while (k <= gt) {
          comparisons++;
          if (a[k] < p1) {
            swaps++;
            [a[k], a[lt]] = [a[lt], a[k]];
            recordStep(a, low, high, [k, lt], [], `Element ${a[lt]} < P1 (${p1}). Moved to Left Partition (< P1).`);
            lt++;
            k++;
          } else if (a[k] > p2) {
            while (k < gt && a[gt] > p2) {
              comparisons++;
              gt--;
            }
            swaps++;
            [a[k], a[gt]] = [a[gt], a[k]];
            recordStep(a, low, high, [k, gt], [], `Element ${a[gt]} > P2 (${p2}). Moved to Right Partition (> P2).`);
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
        recordStep(a, lt, gt, [lt, gt], [lt, gt], `Pivots placed: P1 at [${lt}], P2 at [${gt}].`);

        dualPivotQS(a, low, lt - 1);
        dualPivotQS(a, lt + 1, gt - 1);
        dualPivotQS(a, gt + 1, high);
      };

      dualPivotQS(arr, 0, arr.length - 1);
      recordStep(arr, null, null, [], Array.from({ length: arr.length }, (_, i) => i), "Dual-Pivot QuickSort completed! Array 100% sorted.");

    } else if (this.currentAlgo === "three_way") {
      // 3-Way Radix / Dutch National Flag
      const threeWayQS = (a, l, r) => {
        if (l >= r) return;
        let pivot = a[l];
        let lt = l, gt = r, i = l + 1;
        recordStep(a, l, null, [l], [], `3-Way Partition Pivot chosen: ${pivot}`);

        while (i <= gt) {
          comparisons++;
          if (a[i] < pivot) {
            swaps++;
            [a[lt], a[i]] = [a[i], a[lt]];
            recordStep(a, lt, null, [lt, i], [], `Item ${a[lt]} < Pivot (${pivot}). Swapped to Left Region.`);
            lt++;
            i++;
          } else if (a[i] > pivot) {
            swaps++;
            [a[i], a[gt]] = [a[gt], a[i]];
            recordStep(a, gt, null, [i, gt], [], `Item ${a[gt]} > Pivot (${pivot}). Swapped to Right Region.`);
            gt--;
          } else {
            i++;
          }
        }
        threeWayQS(a, l, lt - 1);
        threeWayQS(a, gt + 1, r);
      };
      threeWayQS(arr, 0, arr.length - 1);
      recordStep(arr, null, null, [], Array.from({ length: arr.length }, (_, i) => i), "3-Way Dutch National Flag Partitioning completed!");

    } else if (this.currentAlgo === "mergesort") {
      const merge = (a, l, m, r) => {
        let left = a.slice(l, m + 1);
        let right = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;

        while (i < left.length && j < right.length) {
          comparisons++;
          if (left[i] <= right[j]) {
            a[k] = left[i];
            i++;
          } else {
            a[k] = right[j];
            j++;
          }
          swaps++;
          recordStep(a, null, null, [k], [], `Merged sub-array elements: slot [${k}] = ${a[k]}`);
          k++;
        }
        while (i < left.length) { a[k++] = left[i++]; swaps++; }
        while (j < right.length) { a[k++] = right[j++]; swaps++; }
      };

      const mergeSortRec = (a, l, r) => {
        if (l < r) {
          let m = Math.floor((l + r) / 2);
          mergeSortRec(a, l, m);
          mergeSortRec(a, m + 1, r);
          merge(a, l, m, r);
        }
      };
      mergeSortRec(arr, 0, arr.length - 1);
      recordStep(arr, null, null, [], Array.from({ length: arr.length }, (_, i) => i), "MergeSort completed!");

    } else if (this.currentAlgo === "binary_search") {
      arr.sort((a, b) => a - b);
      let l = 0, r = arr.length - 1;
      let target = this.searchTarget;
      recordStep(arr, null, null, [], [], `Starting Binary Search for Target SKU Price: ₹${target}`);

      let found = false;
      while (l <= r) {
        comparisons++;
        let mid = Math.floor((l + r) / 2);
        recordStep(arr, mid, null, [l, r], [], `Bisection at Mid=[${mid}] (Val: ${arr[mid]}). Search Window: [${l}..${r}]`);

        if (arr[mid] === target) {
          recordStep(arr, mid, null, [mid], [mid], `🎯 Target ₹${target} found at index [${mid}]!`);
          found = true;
          break;
        } else if (arr[mid] < target) {
          l = mid + 1;
        } else {
          r = mid - 1;
        }
      }
      if (!found) {
        recordStep(arr, null, null, [], [], `Target ₹${target} not in dataset.`);
      }
    }
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.telemetry({
      timeComplexity: "O(N log N) Sorting",
      spaceComplexity: "O(log N) Stack",
      log: `▶ [Playback Started] Animating ${this.currentAlgo.toUpperCase()} step-by-step...`,
      isHighlight: true
    });
    this.runLoop();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.animationTimer);
    this.telemetry({
      log: "⏸ [Playback Paused] Sorting simulation paused."
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
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(log N)",
      log: "↺ [Catalog Reset] Array returned to step 0."
    });
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
      <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
        <!-- Top Controls Bar -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
          <!-- Algorithm Switcher -->
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary);">Algorithm:</span>
            <button class="btn-primary" id="btn-algo-dp" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Dual-Pivot QuickSort</button>
            <button class="btn-secondary" id="btn-algo-3way" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">3-Way Radix (DNF)</button>
            <button class="btn-secondary" id="btn-algo-merge" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">MergeSort</button>
            <button class="btn-secondary" id="btn-algo-bsearch" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">🔍 Binary Search</button>
          </div>

          <!-- Dataset Controls -->
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <button class="btn-secondary" id="btn-shuffle-array" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">🔀 Randomize</button>
            <button class="btn-secondary" id="btn-reverse-array" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">📉 Reverse (Worst-Case)</button>
            <button class="btn-secondary" id="btn-nearly-sorted" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">📈 Nearly Sorted</button>
          </div>
        </div>

        <!-- Custom Search / Input Bar (Shown for Binary Search) -->
        <div id="bsearch-input-wrap" style="display: none; background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: var(--radius-sm); padding: 0.6rem 1rem; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; font-weight: 800; color: #166534;">Target SKU Price to Search:</span>
          <input type="number" id="bsearch-target-input" value="145" style="background: #ffffff; border: 1px solid #86efac; color: #0f172a; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-family: var(--font-mono); width: 100px;">
          <button class="btn-primary" id="btn-run-bsearch" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; background: #16a34a;">Search Target</button>
        </div>

        <!-- Color Legend & Step Progress -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:12px; height:12px; background:#d97706; border-radius:3px;"></span> <strong>Pivot 1 (Left)</strong></span>
            <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:12px; height:12px; background:#7c3aed; border-radius:3px;"></span> <strong>Pivot 2 (Right)</strong></span>
            <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:12px; height:12px; background:#e11d48; border-radius:3px;"></span> <strong>Active Comparison</strong></span>
            <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:12px; height:12px; background:#059669; border-radius:3px;"></span> <strong>Sorted / Target Hit</strong></span>
          </div>
          <div id="step-counter-label" style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-blue);">
            Step: 0 / ${this.steps.length}
          </div>
        </div>

        <!-- Visualizer Bars Stage -->
        <div id="sort-bars-stage" class="sort-bars-container" style="background: #ffffff; border: 1.5px solid var(--border-color); box-shadow: var(--shadow-md); min-height: 320px;"></div>
      </div>
    `;

    // Algorithm Switcher Listeners
    const setBtnActive = (activeId) => {
      ["btn-algo-dp", "btn-algo-3way", "btn-algo-merge", "btn-algo-bsearch"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.className = id === activeId ? "btn-primary" : "btn-secondary";
        }
      });
      document.getElementById("bsearch-input-wrap").style.display = activeId === "btn-algo-bsearch" ? "flex" : "none";
    };

    document.getElementById("btn-algo-dp").addEventListener("click", () => {
      setBtnActive("btn-algo-dp");
      this.setAlgorithm("dual_pivot");
    });
    document.getElementById("btn-algo-3way").addEventListener("click", () => {
      setBtnActive("btn-algo-3way");
      this.setAlgorithm("three_way");
    });
    document.getElementById("btn-algo-merge").addEventListener("click", () => {
      setBtnActive("btn-algo-merge");
      this.setAlgorithm("mergesort");
    });
    document.getElementById("btn-algo-bsearch").addEventListener("click", () => {
      setBtnActive("btn-algo-bsearch");
      this.setAlgorithm("binary_search");
    });

    document.getElementById("btn-run-bsearch").addEventListener("click", () => {
      const val = parseInt(document.getElementById("bsearch-target-input").value) || 145;
      this.searchTarget = val;
      this.setAlgorithm("binary_search");
    });

    // Dataset Shufflers
    document.getElementById("btn-shuffle-array").addEventListener("click", () => {
      this.items = this.items.sort(() => Math.random() - 0.5);
      this.setAlgorithm(this.currentAlgo);
    });
    document.getElementById("btn-reverse-array").addEventListener("click", () => {
      this.items = [...this.items].sort((a, b) => b - a);
      this.setAlgorithm(this.currentAlgo);
    });
    document.getElementById("btn-nearly-sorted").addEventListener("click", () => {
      this.items = [10, 25, 30, 45, 60, 55, 70, 85, 90, 110, 105, 130, 150, 180, 220];
      this.setAlgorithm(this.currentAlgo);
    });

    this.renderCurrentStep();
  }

  renderCurrentStep() {
    const stage = document.getElementById("sort-bars-stage");
    const counterLabel = document.getElementById("step-counter-label");
    if (!stage || !this.steps[this.currentStepIdx]) return;

    const step = this.steps[this.currentStepIdx];
    const maxVal = Math.max(...step.arr, 300);

    if (counterLabel) {
      counterLabel.textContent = `Step: ${this.currentStepIdx + 1} / ${this.steps.length}`;
    }

    stage.innerHTML = step.arr.map((val, idx) => {
      const heightPercent = Math.max(14, Math.round((val / maxVal) * 100));
      let barClass = "sort-bar";

      if (idx === step.p1Idx) barClass += " pivot1";
      else if (idx === step.p2Idx) barClass += " pivot2";
      else if (step.compIdxs.includes(idx)) barClass += " comparing";
      else if (step.sortedRange.includes(idx)) barClass += " sorted";

      return `
        <div class="${barClass}" style="height: ${heightPercent}%; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Slot [${idx}]: ₹${val}">
          <span style="font-size: 0.65rem; font-weight: 800;">₹${val}</span>
        </div>
      `;
    }).join('');

    this.telemetry({
      comparisons: step.comparisons,
      operations: step.swaps + step.comparisons,
      timeComplexity: this.currentAlgo === "binary_search" ? "O(log N)" : "O(N log N)",
      spaceComplexity: this.currentAlgo === "mergesort" ? "O(N) Buffer" : "O(log N) In-Place",
      log: `[${this.currentAlgo.toUpperCase()}] ${step.message}`,
      isHighlight: step.message.includes("completed") || step.message.includes("found"),
      isAlert: step.message.includes("swapped") || step.message.includes("Moved")
    });
  }
}

window.ArraySortVisualizer = ArraySortVisualizer;
