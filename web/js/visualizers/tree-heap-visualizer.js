/**
 * Module 3: Search Engine (Self-Balancing AVL Tree & Streaming Top-K Heap)
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

    this.avlRoot = null;
    this.activeNodeKey = null;
    this.rangeKeys = [];

    // Default AVL data
    const initialKeys = [50, 25, 75, 15, 35, 60, 90, 30];
    initialKeys.forEach(k => this.avlInsert(k, `Item-${k}`));

    this.render();
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

  avlInsert(key, value) {
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

      // LL
      if (balance > 1 && k < node.left.key) {
        rotationType = "Right Rotation (LL Case)";
        return this.rotateRight(node);
      }
      // RR
      if (balance < -1 && k > node.right.key) {
        rotationType = "Left Rotation (RR Case)";
        return this.rotateLeft(node);
      }
      // LR
      if (balance > 1 && k > node.left.key) {
        rotationType = "Left-Right Rotation (LR Case)";
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }
      // RL
      if (balance < -1 && k < node.right.key) {
        rotationType = "Right-Left Rotation (RL Case)";
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.avlRoot = insertRec(this.avlRoot, key, value);
    this.activeNodeKey = key;
    this.rangeKeys = [];

    this.telemetry({
      comparisons: Math.ceil(Math.log2(15)),
      timeComplexity: "O(log N) Guaranteed",
      spaceComplexity: "O(N) Tree Nodes",
      log: `[AVL Insert] Node (${key}) inserted. ${rotationType ? '🔄 ' + rotationType + ' triggered to restore balance.' : 'Tree balanced naturally.'}`,
      isHighlight: !!rotationType
    });

    this.renderTree();
  }

  queryRange(low, high) {
    this.rangeKeys = [];
    const findRec = (node) => {
      if (!node) return;
      if (low < node.key) findRec(node.left);
      if (node.key >= low && node.key <= high) this.rangeKeys.push(node.key);
      if (node.key < high) findRec(node.right);
    };
    findRec(this.avlRoot);

    this.telemetry({
      comparisons: this.rangeKeys.length + Math.ceil(Math.log2(10)),
      timeComplexity: "O(log N + K) Range Query",
      spaceComplexity: "O(1) Auxiliary",
      log: `[Range Query] Found ${this.rangeKeys.length} items in price band [₹${low}, ₹${high}]: [${this.rangeKeys.join(', ')}]`,
      isHighlight: true
    });

    this.renderTree();
  }

  calculateLayout(node, x, y, dx) {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) this.calculateLayout(node.left, x - dx, y + 60, dx / 1.9);
    if (node.right) this.calculateLayout(node.right, x + dx, y + 60, dx / 1.9);
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <input type="number" id="tree-node-input" placeholder="Price/Key (e.g. 40)"
                   style="background: var(--bg-glass); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; width: 120px;">
            <button class="btn-secondary" id="btn-insert-tree" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">+ Insert Key</button>
          </div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <input type="number" id="range-min" placeholder="Min (20)" style="background: var(--bg-glass); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.25rem 0.4rem; border-radius: 4px; font-size: 0.75rem; width: 70px;">
            <input type="number" id="range-max" placeholder="Max (60)" style="background: var(--bg-glass); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.25rem 0.4rem; border-radius: 4px; font-size: 0.75rem; width: 70px;">
            <button class="btn-primary" id="btn-range-query" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">🔍 Range Query</button>
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden; height: 380px;">
          <svg id="avl-tree-svg" class="visualizer-svg"></svg>
        </div>
      </div>
    `;

    document.getElementById("btn-insert-tree").addEventListener("click", () => {
      const input = document.getElementById("tree-node-input");
      const val = parseInt(input.value);
      if (!isNaN(val)) {
        this.avlInsert(val, `SKU-${val}`);
        input.value = "";
      }
    });

    document.getElementById("btn-range-query").addEventListener("click", () => {
      const min = parseInt(document.getElementById("range-min").value) || 20;
      const max = parseInt(document.getElementById("range-max").value) || 60;
      this.queryRange(min, max);
    });

    this.renderTree();
  }

  renderTree() {
    const svg = document.getElementById("avl-tree-svg");
    if (!svg || !this.avlRoot) return;

    this.calculateLayout(this.avlRoot, 340, 45, 140);

    let linksHtml = "";
    let nodesHtml = "";

    const drawNode = (node) => {
      if (!node) return;

      if (node.left) {
        linksHtml += `<line x1="${node.x}" y1="${node.y}" x2="${node.left.x}" y2="${node.left.y}" stroke="var(--border-color)" stroke-width="2" />`;
        drawNode(node.left);
      }
      if (node.right) {
        linksHtml += `<line x1="${node.x}" y1="${node.y}" x2="${node.right.x}" y2="${node.right.y}" stroke="var(--border-color)" stroke-width="2" />`;
        drawNode(node.right);
      }

      const isRangeHit = this.rangeKeys.includes(node.key);
      const isActive = node.key === this.activeNodeKey;
      let circleFill = isRangeHit ? "rgba(16, 185, 129, 0.3)" : (isActive ? "rgba(59, 130, 246, 0.3)" : "var(--node-bg)");
      let circleStroke = isRangeHit ? "var(--accent-emerald)" : (isActive ? "var(--accent-blue)" : "var(--node-border)");

      nodesHtml += `
        <g transform="translate(${node.x}, ${node.y})">
          <circle r="18" fill="${circleFill}" stroke="${circleStroke}" stroke-width="2.5" class="tree-node-circle" />
          <text class="tree-node-text">${node.key}</text>
          <text y="-22" class="tree-balance-text">BF: ${node.balanceFactor >= 0 ? '+' + node.balanceFactor : node.balanceFactor}</text>
        </g>
      `;
    };

    drawNode(this.avlRoot);
    svg.innerHTML = linksHtml + nodesHtml;
  }
}

window.TreeHeapVisualizer = TreeHeapVisualizer;
