/**
 * Module 3: Search Engine (Self-Balancing AVL Tree & Streaming Top-K Heap)
 * Fully Interactive with Playback, Live Streaming, Range Queries & Tree Traversal
 */

class AVLNodeJS {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }

  get balanceFactor() {
    const lh = this.left ? this.left.height : 0;
    const rh = this.right ? this.right.height : 0;
    return lh - rh;
  }
}

class TreeHeapVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    this.activeMode = "avl"; // 'avl' or 'heap'
    this.isPlaying = false;
    this.timer = null;
    this.speedMs = 700;

    // AVL Tree State
    this.avlRoot = null;
    this.activeNodeKey = null;
    this.searchPathKeys = [];
    this.rangeKeys = [];
    this.rotationLog = null;

    // Top-K Heap State
    this.heapK = 5;
    this.heapData = [95000, 89000, 64999, 29990, 24900];
    this.streamFeed = [134900, 129999, 189990, 114990, 16999, 8995, 249900, 45000];

    // Seed AVL Tree
    this.initDefaultTree();
    this.render();
  }

  initDefaultTree() {
    this.avlRoot = null;
    const initialKeys = [50, 25, 75, 15, 35, 60, 90, 30, 80];
    initialKeys.forEach(k => this.avlInsert(k, `Product_SKU_${k}`, false));
  }

  setSpeed(multiplier) {
    this.speedMs = Math.max(100, Math.floor(700 / multiplier));
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.telemetry({
      timeComplexity: "O(log N) Streaming",
      spaceComplexity: "O(N) Tree Nodes",
      log: `▶ [Auto-Feed Started] Streaming live e-commerce product price updates into ${this.activeMode.toUpperCase()}...`,
      isHighlight: true
    });
    this.runLoop();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.timer);
    this.telemetry({
      log: "⏸ [Simulation Paused] Search engine stream paused."
    });
  }

  stepForward() {
    if (this.activeMode === "avl") {
      const randVal = Math.floor(Math.random() * 90 + 10);
      this.avlInsert(randVal, `SKU_Live_${randVal}`, true);
    } else {
      const nextVal = Math.floor(Math.random() * 200000 + 10000);
      this.pushHeapStream(nextVal);
    }
  }

  stepBackward() {
    this.render();
  }

  reset() {
    this.pause();
    this.initDefaultTree();
    this.heapData = [95000, 89000, 64999, 29990, 24900];
    this.activeNodeKey = null;
    this.searchPathKeys = [];
    this.rangeKeys = [];
    this.render();
    this.telemetry({
      comparisons: 0,
      operations: 0,
      timeComplexity: "O(log N)",
      spaceComplexity: "O(N)",
      log: "↺ [Search Engine Reset] Restored initial balanced AVL tree and Top-5 Min-Heap."
    });
  }

  runLoop() {
    if (!this.isPlaying) return;
    this.stepForward();
    this.timer = setTimeout(() => this.runLoop(), this.speedMs);
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  avlInsert(key, value, emitTelemetry = true) {
    let rotationType = null;

    const insertRec = (node, k, v) => {
      if (!node) return new AVLNodeJS(k, v);

      if (k < node.key) {
        node.left = insertRec(node.left, k, v);
      } else if (k > node.key) {
        node.right = insertRec(node.right, k, v);
      } else {
        node.value = v;
        return node;
      }

      this.updateHeight(node);
      const balance = node.balanceFactor;

      // LL Rotation
      if (balance > 1 && k < node.left.key) {
        rotationType = "Right Rotation (LL Case)";
        return this.rotateRight(node);
      }
      // RR Rotation
      if (balance < -1 && k > node.right.key) {
        rotationType = "Left Rotation (RR Case)";
        return this.rotateLeft(node);
      }
      // LR Rotation
      if (balance > 1 && k > node.left.key) {
        rotationType = "Left-Right Rotation (LR Case)";
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }
      // RL Rotation
      if (balance < -1 && k < node.right.key) {
        rotationType = "Right-Left Rotation (RL Case)";
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.avlRoot = insertRec(this.avlRoot, key, value);
    this.activeNodeKey = key;
    this.searchPathKeys = [];
    this.rangeKeys = [];

    if (emitTelemetry) {
      this.telemetry({
        comparisons: Math.ceil(Math.log2(15)),
        operations: this.getNodeCount(this.avlRoot),
        timeComplexity: "O(log N) Guaranteed Balance",
        spaceComplexity: "O(N) Tree Nodes",
        log: `[AVL Insert] Price node (₹${key}) inserted. ${rotationType ? '🔄 ' + rotationType + ' triggered to maintain |BF| ≤ 1.' : 'Tree balanced naturally.'}`,
        isHighlight: !!rotationType
      });
    }

    if (this.activeMode === "avl") {
      this.renderTree();
    }
  }

  getNodeCount(node) {
    if (!node) return 0;
    return 1 + this.getNodeCount(node.left) + this.getNodeCount(node.right);
  }

  searchNode(targetKey) {
    this.searchPathKeys = [];
    let curr = this.avlRoot;
    let comparisons = 0;
    let found = false;

    while (curr) {
      comparisons++;
      this.searchPathKeys.push(curr.key);
      if (curr.key === targetKey) {
        found = true;
        break;
      } else if (targetKey < curr.key) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    this.activeNodeKey = targetKey;
    this.rangeKeys = [];
    this.renderTree();

    this.telemetry({
      comparisons,
      operations: this.searchPathKeys.length,
      timeComplexity: "O(log N) Tree Traversal",
      spaceComplexity: "O(1) Auxiliary",
      log: found
        ? `🎯 [Search Success] Node ₹${targetKey} located via path: [${this.searchPathKeys.join(' ➔ ')}] in ${comparisons} comparison(s).`
        : `⚠️ [Search Miss] Key ₹${targetKey} not found after traversing [${this.searchPathKeys.join(' ➔ ')}].`,
      isHighlight: found,
      isAlert: !found
    });
  }

  queryRange(low, high) {
    this.rangeKeys = [];
    this.searchPathKeys = [];
    const findRec = (node) => {
      if (!node) return;
      if (low < node.key) findRec(node.left);
      if (node.key >= low && node.key <= high) this.rangeKeys.push(node.key);
      if (node.key < high) findRec(node.right);
    };
    findRec(this.avlRoot);

    this.telemetry({
      comparisons: this.rangeKeys.length + Math.ceil(Math.log2(15)),
      timeComplexity: "O(log N + K) Range Query",
      spaceComplexity: "O(1) Auxiliary",
      log: `🔍 [Price Band Query] Discovered ${this.rangeKeys.length} matching SKUs in band [₹${low} - ₹${high}]: [${this.rangeKeys.join(', ')}]`,
      isHighlight: true
    });

    this.renderTree();
  }

  pushHeapStream(val) {
    if (this.heapData.length < this.heapK) {
      this.heapData.push(val);
      this.heapData.sort((a, b) => b - a);
    } else if (val > this.heapData[this.heapData.length - 1]) {
      const minVal = this.heapData.pop();
      this.heapData.push(val);
      this.heapData.sort((a, b) => b - a);
      this.telemetry({
        comparisons: Math.ceil(Math.log2(this.heapK)),
        operations: this.heapK,
        timeComplexity: "O(log K) Streaming Heap",
        spaceComplexity: "O(K) Fixed Memory",
        log: `🔥 [Top-K Trending Surge] ₹${val.toLocaleString()} displaced previous rank ₹${minVal.toLocaleString()} in Top-${this.heapK} leaderboard.`,
        isHighlight: true
      });
    } else {
      this.telemetry({
        comparisons: 1,
        timeComplexity: "O(1) Root Rejection",
        spaceComplexity: "O(K)",
        log: `[Top-K Stream] Incoming ₹${val.toLocaleString()} < Top-${this.heapK} threshold (₹${this.heapData[this.heapData.length - 1].toLocaleString()}). Ignored.`
      });
    }
    this.renderHeap();
  }

  calculateLayout(node, x, y, dx) {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) this.calculateLayout(node.left, x - dx, y + 65, dx / 1.9);
    if (node.right) this.calculateLayout(node.right, x + dx, y + 65, dx / 1.9);
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
        <!-- Control Header & Mode Switcher -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <button class="${this.activeMode === 'avl' ? 'btn-primary' : 'btn-secondary'}" id="btn-tab-avl" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              🌲 Self-Balancing AVL Tree
            </button>
            <button class="${this.activeMode === 'heap' ? 'btn-primary' : 'btn-secondary'}" id="btn-tab-heap" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              📊 Streaming Top-K Min/Max Heap
            </button>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <button class="btn-secondary" id="btn-rebalance-tree" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">↺ Re-Seed Tree</button>
          </div>
        </div>

        <!-- AVL Mode Controls Container -->
        <div id="avl-controls-panel" style="display: ${this.activeMode === 'avl' ? 'flex' : 'none'}; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; background: #f8fafc; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <!-- Insert Key -->
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Insert Key:</span>
              <input type="number" id="tree-node-input" placeholder="Price (e.g. 42)" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 110px;">
              <button class="btn-primary" id="btn-insert-tree" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">+ Insert</button>
              <button class="btn-secondary" id="btn-search-tree" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">🔍 Search</button>
            </div>

            <!-- Range Query -->
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Price Band [Min-Max]:</span>
              <input type="number" id="range-min" value="25" placeholder="Min" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 65px;">
              <span style="color: #64748b; font-weight: bold;">-</span>
              <input type="number" id="range-max" value="75" placeholder="Max" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 65px;">
              <button class="btn-primary" id="btn-range-query" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; background: #059669;">Filter Band</button>
            </div>
          </div>

          <!-- Tree Visualizer Canvas -->
          <div style="background: #ffffff; border-radius: var(--radius-md); border: 1.5px solid var(--border-color); overflow: auto; height: 420px; box-shadow: var(--shadow-md); position: relative;">
            <svg id="avl-tree-svg" class="visualizer-svg" style="min-width: 680px; min-height: 400px;"></svg>
          </div>
        </div>

        <!-- Heap Mode Container -->
        <div id="heap-controls-panel" style="display: ${this.activeMode === 'heap' ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #0f172a;">Real-Time Top-${this.heapK} Streaming Leaderboard</span>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <input type="number" id="heap-stream-input" placeholder="Price (₹)" value="145000" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.78rem; width: 110px;">
              <button class="btn-primary" id="btn-push-heap-stream" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Feed Price Stream</button>
            </div>
          </div>
          <div id="heap-bars-view" style="display: flex; flex-direction: column; gap: 0.6rem;"></div>
        </div>
      </div>
    `;

    // Event Handlers
    document.getElementById("btn-tab-avl").addEventListener("click", () => {
      this.activeMode = "avl";
      this.render();
    });

    document.getElementById("btn-tab-heap").addEventListener("click", () => {
      this.activeMode = "heap";
      this.render();
    });

    document.getElementById("btn-rebalance-tree").addEventListener("click", () => {
      this.initDefaultTree();
      this.renderTree();
    });

    if (this.activeMode === "avl") {
      document.getElementById("btn-insert-tree").addEventListener("click", () => {
        const input = document.getElementById("tree-node-input");
        const val = parseInt(input.value);
        if (!isNaN(val)) {
          this.avlInsert(val, `Product_SKU_${val}`);
          input.value = "";
        }
      });

      document.getElementById("btn-search-tree").addEventListener("click", () => {
        const input = document.getElementById("tree-node-input");
        const val = parseInt(input.value);
        if (!isNaN(val)) {
          this.searchNode(val);
        }
      });

      document.getElementById("btn-range-query").addEventListener("click", () => {
        const min = parseInt(document.getElementById("range-min").value) || 25;
        const max = parseInt(document.getElementById("range-max").value) || 75;
        this.queryRange(min, max);
      });

      this.renderTree();
    } else {
      document.getElementById("btn-push-heap-stream").addEventListener("click", () => {
        const input = document.getElementById("heap-stream-input");
        const val = parseInt(input.value);
        if (!isNaN(val)) {
          this.pushHeapStream(val);
        }
      });
      this.renderHeap();
    }
  }

  renderTree() {
    const svg = document.getElementById("avl-tree-svg");
    if (!svg || !this.avlRoot) return;

    this.calculateLayout(this.avlRoot, 340, 50, 130);

    let linksHtml = "";
    let nodesHtml = "";

    const drawNode = (node) => {
      if (!node) return;

      if (node.left) {
        const isPath = this.searchPathKeys.includes(node.key) && this.searchPathKeys.includes(node.left.key);
        linksHtml += `<line x1="${node.x}" y1="${node.y}" x2="${node.left.x}" y2="${node.left.y}" stroke="${isPath ? '#0284c7' : '#cbd5e1'}" stroke-width="${isPath ? 3.5 : 2}" />`;
        drawNode(node.left);
      }
      if (node.right) {
        const isPath = this.searchPathKeys.includes(node.key) && this.searchPathKeys.includes(node.right.key);
        linksHtml += `<line x1="${node.x}" y1="${node.y}" x2="${node.right.x}" y2="${node.right.y}" stroke="${isPath ? '#0284c7' : '#cbd5e1'}" stroke-width="${isPath ? 3.5 : 2}" />`;
        drawNode(node.right);
      }

      const isRangeHit = this.rangeKeys.includes(node.key);
      const isPathHit = this.searchPathKeys.includes(node.key);
      const isActive = node.key === this.activeNodeKey;

      let circleFill = "#ffffff";
      let circleStroke = "#94a3b8";

      if (isRangeHit) {
        circleFill = "#dcfce7";
        circleStroke = "#059669";
      } else if (isPathHit) {
        circleFill = "#e0f2fe";
        circleStroke = "#0284c7";
      } else if (isActive) {
        circleFill = "#fef3c7";
        circleStroke = "#d97706";
      }

      const bf = node.balanceFactor;
      const bfText = bf >= 0 ? `+${bf}` : `${bf}`;

      nodesHtml += `
        <g transform="translate(${node.x}, ${node.y})" style="cursor: pointer;" onclick="window.activeTreeVisualizer.searchNode(${node.key})">
          <circle r="20" fill="${circleFill}" stroke="${circleStroke}" stroke-width="2.5" class="tree-node-circle" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))" />
          <text class="tree-node-text" font-size="11" font-weight="800" fill="#0f172a">₹${node.key}</text>
          <text y="-25" class="tree-balance-text" font-size="9" font-weight="700" fill="${Math.abs(bf) > 1 ? '#e11d48' : '#0284c7'}">BF: ${bfText}</text>
        </g>
      `;
    };

    drawNode(this.avlRoot);
    svg.innerHTML = linksHtml + nodesHtml;
    window.activeTreeVisualizer = this;
  }

  renderHeap() {
    const view = document.getElementById("heap-bars-view");
    if (!view) return;

    view.innerHTML = this.heapData.map((val, rank) => {
      return `
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${rank === 0 ? '#fef3c7' : '#f1f5f9'}; color: ${rank === 0 ? '#d97706' : '#64748b'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); font-size: 0.85rem;">
              #${rank + 1}
            </div>
            <div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">Top SKU Asset Tier</div>
              <div style="font-size: 0.72rem; color: #64748b; font-family: var(--font-mono);">Heap Index [${rank}]</div>
            </div>
          </div>
          <div style="font-size: 1.2rem; font-weight: 800; color: #0284c7; font-family: var(--font-mono);">
            ₹${val.toLocaleString()}
          </div>
        </div>
      `;
    }).join('');
  }
}

window.TreeHeapVisualizer = TreeHeapVisualizer;
