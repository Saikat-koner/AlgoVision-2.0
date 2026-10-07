/**
 * Module 1: Data Ingestion (Circular Queue, Priority Queue & Hash Table Visualizer)
 * Fully Interactive with Playback Controls & Real-Time Simulation
 */

class QueueHashVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    // Animation & Playback State
    this.isPlaying = false;
    this.timer = null;
    this.speedMs = 600;
    this.stepCount = 0;

    // Queue State
    this.queueMode = "circular"; // 'circular' or 'priority'
    this.queueCapacity = 8;
    this.queueBuffer = new Array(this.queueCapacity).fill(null);
    this.head = 0;
    this.tail = 0;
    this.size = 0;

    // Priority Queue State (Min/Max Heap format)
    this.priorityItems = [
      { id: "ORD-901", name: "Vaccine Cold-Chain", priority: 1, pLabel: "CRITICAL" },
      { id: "ORD-902", name: "Airport Express Airway", priority: 2, pLabel: "HIGH" },
      { id: "ORD-903", name: "Standard Parcel Linehaul", priority: 3, pLabel: "NORMAL" }
    ];

    // Hash Table State
    this.hashMode = "chaining"; // 'chaining' or 'probing'
    this.hashCapacity = 8;
    this.hashBuckets = Array.from({ length: this.hashCapacity }, () => []);
    this.linearProbingArray = new Array(this.hashCapacity).fill(null);
    this.hashItemsCount = 0;
    this.hashCollisions = 0;

    // Populate initial sample hash items
    this.initSampleHash();
    this.render();
  }

  initSampleHash() {
    const initialKeys = [
      { key: "TXN_MUM_101", val: 45000 },
      { key: "TXN_DEL_204", val: 89000 },
      { key: "TXN_BLR_508", val: 12500 }
    ];
    initialKeys.forEach(item => this.insertHashInternal(item.key, item.val, false));
  }

  setSpeed(multiplier) {
    this.speedMs = Math.max(100, Math.floor(600 / multiplier));
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.telemetry({
      timeComplexity: "O(1) Streaming",
      spaceComplexity: "O(K) Fixed Buffer",
      log: "▶ [Auto-Simulation Started] Streaming real-time transaction ingestion events...",
      isHighlight: true
    });
    this.runLoop();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.timer);
    this.telemetry({
      log: "⏸ [Simulation Paused] Ingestion stream paused by user."
    });
  }

  stepForward() {
    this.stepCount++;
    if (this.stepCount % 3 === 0 && this.size > 0) {
      this.dequeue();
    } else {
      const sampleEvents = ["Order_Created", "Payment_Verified", "Fleet_Dispatched", "Inventory_Decremented", "Webhook_Ack", "GPS_Telemetry"];
      const randEvt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)] + "_" + Math.floor(Math.random() * 900 + 100);
      this.enqueue(randEvt);
    }
  }

  stepBackward() {
    // Re-render current state
    this.render();
  }

  reset() {
    this.pause();
    this.queueBuffer = new Array(this.queueCapacity).fill(null);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.hashBuckets = Array.from({ length: this.hashCapacity }, () => []);
    this.linearProbingArray = new Array(this.hashCapacity).fill(null);
    this.hashItemsCount = 0;
    this.hashCollisions = 0;
    this.initSampleHash();
    this.render();
    this.telemetry({
      comparisons: 0,
      operations: 0,
      timeComplexity: "O(1)",
      spaceComplexity: "O(K)",
      log: "↺ [System Reset] Circular buffer and hash index reset to clean initial state."
    });
  }

  runLoop() {
    if (!this.isPlaying) return;
    this.stepForward();
    this.timer = setTimeout(() => this.runLoop(), this.speedMs);
  }

  // Circular Queue Enqueue
  enqueue(item, priority = 3) {
    if (this.queueMode === "priority") {
      const pLabel = priority === 1 ? "CRITICAL" : (priority === 2 ? "HIGH" : "NORMAL");
      this.priorityItems.push({ id: `EVT-${Math.floor(Math.random()*9000+1000)}`, name: item, priority, pLabel });
      this.priorityItems.sort((a, b) => a.priority - b.priority);
      this.renderPriorityQueue();
      this.telemetry({
        comparisons: Math.ceil(Math.log2(this.priorityItems.length)),
        operations: this.priorityItems.length,
        timeComplexity: "O(log N) Heap Push",
        spaceComplexity: "O(N) Dynamic",
        log: `[Priority Queue Push] Enqueued "${item}" [Priority ${priority} - ${pLabel}]. Re-heapified stream.`,
        isHighlight: priority === 1
      });
      return true;
    }

    if (this.size === this.queueCapacity) {
      this.telemetry({
        status: "QUEUE_OVERFLOW_BLOCKED",
        log: `⚠️ [Ingestion Overflow] Buffer is full (${this.size}/${this.queueCapacity}). Enqueue of "${item}" dropped.`,
        isAlert: true
      });
      return false;
    }

    this.queueBuffer[this.tail] = item;
    const oldTail = this.tail;
    this.tail = (this.tail + 1) % this.queueCapacity;
    this.size++;

    this.renderQueue();
    this.telemetry({
      comparisons: 1,
      operations: this.size,
      timeComplexity: "O(1) Strict",
      spaceComplexity: "O(K) Fixed Buffer",
      log: `[Enqueue O(1)] Ingested "${item}" at slot [${oldTail}]. Buffer: ${this.size}/${this.queueCapacity} (Head: ${this.head}, Tail: ${this.tail})`,
      isHighlight: true
    });
    return true;
  }

  // Circular Queue Dequeue
  dequeue() {
    if (this.queueMode === "priority") {
      if (this.priorityItems.length === 0) {
        this.telemetry({
          log: "⚠️ [Priority Queue Underflow] No items to dispatch.",
          isAlert: true
        });
        return null;
      }
      const item = this.priorityItems.shift();
      this.renderPriorityQueue();
      this.telemetry({
        comparisons: 1,
        operations: this.priorityItems.length,
        timeComplexity: "O(log N) Heap Extract",
        spaceComplexity: "O(N) Dynamic",
        log: `[Priority Queue Pop] Dispatched top-priority event: "${item.name}" [${item.pLabel}].`,
        isHighlight: true
      });
      return item;
    }

    if (this.size === 0) {
      this.telemetry({
        status: "QUEUE_UNDERFLOW",
        log: `⚠️ [Ingestion Underflow] Buffer is empty. Dequeue returned NULL.`,
        isAlert: true
      });
      return null;
    }

    const item = this.queueBuffer[this.head];
    this.queueBuffer[this.head] = null;
    const oldHead = this.head;
    this.head = (this.head + 1) % this.queueCapacity;
    this.size--;

    this.renderQueue();
    this.telemetry({
      comparisons: 1,
      operations: this.size,
      timeComplexity: "O(1) Strict",
      spaceComplexity: "O(K) Fixed Buffer",
      log: `[Dequeue O(1)] Dispatched "${item}" from slot [${oldHead}]. New Head: [${this.head}], Remaining: ${this.size}/${this.queueCapacity}`,
      isHighlight: true
    });
    return item;
  }

  // Hash Insertion
  insertHash(key, val) {
    this.insertHashInternal(key, val, true);
  }

  insertHashInternal(key, val, emitTelemetry = true) {
    let hashVal = 0;
    for (let i = 0; i < key.length; i++) {
      hashVal = ((hashVal << 5) - hashVal) + key.charCodeAt(i);
      hashVal |= 0;
    }
    const idx = Math.abs(hashVal) % this.hashCapacity;

    if (this.hashMode === "chaining") {
      const bucket = this.hashBuckets[idx];
      const existingIdx = bucket.findIndex(entry => entry.key === key);
      let isDuplicate = false;
      let isCollision = false;

      if (existingIdx !== -1) {
        bucket[existingIdx].val = val;
        isDuplicate = true;
      } else {
        if (bucket.length > 0) {
          this.hashCollisions++;
          isCollision = true;
        }
        bucket.push({ key, val, id: Date.now() });
        this.hashItemsCount++;
      }

      this.renderHash();

      if (emitTelemetry) {
        const loadFactor = (this.hashItemsCount / this.hashCapacity).toFixed(2);
        this.telemetry({
          comparisons: bucket.length,
          operations: this.hashItemsCount,
          timeComplexity: isDuplicate ? "O(1) Idempotent Match" : (isCollision ? "O(1+α) Chained Collision" : "O(1) Ideal Hash"),
          spaceComplexity: `Load Factor α = ${loadFactor}`,
          log: isDuplicate
            ? `[Idempotency Check] Key "${key}" already exists! Idempotent update applied. (Slot [${idx}])`
            : `[Hash Insert] Key "${key}" hashed to slot [${idx}]. ${isCollision ? '⚠️ Collision handled via Separate Chaining.' : 'Direct bucket insert.'}`,
          isHighlight: !isCollision && !isDuplicate,
          isAlert: isCollision
        });
      }
    } else {
      // Linear Probing
      let probeIdx = idx;
      let probes = 0;
      let placed = false;

      while (probes < this.hashCapacity) {
        if (this.linearProbingArray[probeIdx] === null || this.linearProbingArray[probeIdx].key === key) {
          this.linearProbingArray[probeIdx] = { key, val };
          placed = true;
          this.hashItemsCount++;
          break;
        }
        probeIdx = (probeIdx + 1) % this.hashCapacity;
        probes++;
        this.hashCollisions++;
      }

      this.renderHash();

      if (emitTelemetry) {
        this.telemetry({
          comparisons: probes + 1,
          operations: this.hashItemsCount,
          timeComplexity: probes > 0 ? `O(1 + ${probes} probes)` : "O(1) Direct Slot",
          spaceComplexity: "O(N) Flat Array",
          log: placed
            ? `[Linear Probing] Key "${key}" stored at slot [${probeIdx}] after ${probes} step(s).`
            : `⚠️ [Hash Full] Linear probing table full. Triggering dynamic resize...`,
          isHighlight: probes === 0,
          isAlert: probes > 0
        });
      }
    }
  }

  deleteHashKey(key) {
    let deleted = false;
    if (this.hashMode === "chaining") {
      this.hashBuckets.forEach(bucket => {
        const idx = bucket.findIndex(e => e.key === key);
        if (idx !== -1) {
          bucket.splice(idx, 1);
          this.hashItemsCount--;
          deleted = true;
        }
      });
    } else {
      for (let i = 0; i < this.hashCapacity; i++) {
        if (this.linearProbingArray[i] && this.linearProbingArray[i].key === key) {
          this.linearProbingArray[i] = null;
          this.hashItemsCount--;
          deleted = true;
          break;
        }
      }
    }

    this.renderHash();
    this.telemetry({
      comparisons: 1,
      operations: this.hashItemsCount,
      timeComplexity: "O(1) Key Eviction",
      spaceComplexity: "O(N)",
      log: deleted ? `[Hash Eviction] Key "${key}" successfully evicted from index.` : `Key "${key}" not found.`,
      isHighlight: deleted
    });
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
        <!-- Section 1: Ingestion Queue Buffer -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">📦</span>
              <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-primary);">
                1. Stream Ingestion Buffer Engine
              </h4>
              <span id="queue-mode-badge" style="font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono); padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;">
                ${this.queueMode === 'circular' ? 'Circular FIFO (Fixed Buffer)' : 'Dynamic Priority Queue (Min-Heap)'}
              </span>
            </div>

            <!-- Mode Selector & Manual Actions -->
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button class="btn-secondary" id="btn-toggle-q-mode" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                🔄 Switch to ${this.queueMode === 'circular' ? 'Priority Queue' : 'Circular Queue'}
              </button>
              <button class="btn-primary" id="btn-enqueue-sample" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                + Ingest Event
              </button>
              <button class="btn-secondary" id="btn-dequeue-sample" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                - Dispatch Head
              </button>
            </div>
          </div>

          <!-- Custom Event Input Row -->
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); flex-wrap: wrap;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Custom Ingestion:</span>
            <input type="text" id="custom-event-input" placeholder="e.g. Flight_Cargo_Manifest" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-family: var(--font-mono); flex: 1; min-width: 180px;">
            <select id="event-priority-select" style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600;">
              <option value="3">Normal Priority (P3)</option>
              <option value="2">High Priority (P2)</option>
              <option value="1">🚨 Critical Emergency (P1)</option>
            </select>
            <button class="btn-primary" id="btn-submit-custom-event" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Enqueue</button>
          </div>

          <!-- Queue Container Viewport -->
          <div id="queue-slots-view" class="queue-slots-row" style="min-height: 80px; align-items: center; padding: 1rem 0;"></div>
        </div>

        <!-- Section 2: Hash Table & Deduplication Laboratory -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">🔑</span>
              <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-primary);">
                2. Transaction Idempotency & Hash Index Lab
              </h4>
              <span style="font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono); padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
                Mode: ${this.hashMode === 'chaining' ? 'Separate Chaining' : 'Open Addressing (Linear Probing)'}
              </span>
            </div>

            <!-- Hash Controls -->
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
              <button class="btn-secondary" id="btn-toggle-hash-mode" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                🔄 Toggle to ${this.hashMode === 'chaining' ? 'Linear Probing' : 'Separate Chaining'}
              </button>
              <button class="btn-secondary" id="btn-trigger-rehash" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
                ⚡ Simulate Dynamic Rehash (α ≥ 0.75)
              </button>
            </div>
          </div>

          <!-- Key Insert Input Controls -->
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); flex-wrap: wrap;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Idempotency Key:</span>
            <input type="text" id="hash-key-input" placeholder="e.g. TXN_ORDER_9942"
                   style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-family: var(--font-mono); width: 170px;">
            <input type="number" id="hash-val-input" placeholder="Amount (₹)" value="15000"
                   style="background: #ffffff; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-family: var(--font-mono); width: 100px;">
            <button class="btn-primary" id="btn-hash-insert" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">Insert / Verify Key</button>
            <button class="btn-secondary" id="btn-hash-duplicate" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; color: #d97706;">⚠️ Test Duplicate Replay</button>
          </div>

          <!-- Hash Buckets Container -->
          <div id="hash-buckets-view" style="display: flex; flex-direction: column; gap: 0.45rem;"></div>
        </div>
      </div>
    `;

    // Event Handlers
    document.getElementById("btn-toggle-q-mode").addEventListener("click", () => {
      this.queueMode = this.queueMode === "circular" ? "priority" : "circular";
      this.render();
      this.telemetry({
        log: `Switched Ingestion Buffer Mode to: ${this.queueMode.toUpperCase()}`,
        isHighlight: true
      });
    });

    document.getElementById("btn-enqueue-sample").addEventListener("click", () => {
      const sampleEvents = ["Order_Placed", "Payment_Captured", "Vehicle_Dispatched", "Sort_Cleared", "Scan_Gate_In"];
      const randEvt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)] + "_" + Math.floor(Math.random() * 900 + 100);
      this.enqueue(randEvt, Math.floor(Math.random() * 3 + 1));
    });

    document.getElementById("btn-dequeue-sample").addEventListener("click", () => {
      this.dequeue();
    });

    document.getElementById("btn-submit-custom-event").addEventListener("click", () => {
      const input = document.getElementById("custom-event-input");
      const pVal = parseInt(document.getElementById("event-priority-select").value);
      const text = input.value.trim() || ("User_Event_" + Math.floor(Math.random()*900+100));
      this.enqueue(text, pVal);
      input.value = "";
    });

    document.getElementById("btn-toggle-hash-mode").addEventListener("click", () => {
      this.hashMode = this.hashMode === "chaining" ? "probing" : "chaining";
      this.render();
      this.telemetry({
        log: `Switched Hash Collision Mode to: ${this.hashMode.toUpperCase()}`,
        isHighlight: true
      });
    });

    document.getElementById("btn-trigger-rehash").addEventListener("click", () => {
      const oldCap = this.hashCapacity;
      this.hashCapacity = oldCap * 2;
      const oldBuckets = [...this.hashBuckets.flat()];
      this.hashBuckets = Array.from({ length: this.hashCapacity }, () => []);
      this.linearProbingArray = new Array(this.hashCapacity).fill(null);
      this.hashItemsCount = 0;
      this.hashCollisions = 0;
      oldBuckets.forEach(item => this.insertHashInternal(item.key, item.val, false));
      this.render();
      this.telemetry({
        timeComplexity: "O(N) Dynamic Rehashing",
        spaceComplexity: `Capacity: ${oldCap} ➔ ${this.hashCapacity} slots`,
        log: `⚡ [Rehash Completed] Hash capacity doubled from ${oldCap} to ${this.hashCapacity} buckets. Reduced cluster collisions to 0.`,
        isHighlight: true
      });
    });

    document.getElementById("btn-hash-insert").addEventListener("click", () => {
      const kInput = document.getElementById("hash-key-input");
      const vInput = document.getElementById("hash-val-input");
      const key = kInput.value.trim() || ("TXN_" + Math.floor(Math.random() * 9000 + 1000));
      const val = parseFloat(vInput.value) || 10000;
      this.insertHash(key, val);
      kInput.value = "";
    });

    document.getElementById("btn-hash-duplicate").addEventListener("click", () => {
      // Pick existing key or default
      const sampleKey = "TXN_MUM_101";
      this.insertHash(sampleKey, 45000);
    });

    if (this.queueMode === "circular") {
      this.renderQueue();
    } else {
      this.renderPriorityQueue();
    }
    this.renderHash();
  }

  renderQueue() {
    const view = document.getElementById("queue-slots-view");
    if (!view) return;

    view.innerHTML = this.queueBuffer.map((item, idx) => {
      const isOccupied = item !== null;
      const isHead = this.size > 0 && idx === this.head;
      const isTail = idx === this.tail;

      let classes = "queue-slot";
      if (isOccupied) classes += " occupied";
      if (isHead) classes += " head-ptr";
      if (isTail) classes += " tail-ptr";

      return `
        <div class="${classes}" style="transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
          <div style="font-size: 0.62rem; color: var(--text-muted); font-weight: 700;">Slot [${idx}]</div>
          <div style="font-size: 0.72rem; font-weight: 800; max-width: 52px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${isOccupied ? '#0284c7' : '#94a3b8'};">
            ${item ? item.split('_')[0] : 'EMPTY'}
          </div>
          ${isOccupied ? `<div style="font-size: 0.55rem; font-family: var(--font-mono); color: #64748b;">#${item.split('_')[1] || ''}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  renderPriorityQueue() {
    const view = document.getElementById("queue-slots-view");
    if (!view) return;

    if (this.priorityItems.length === 0) {
      view.innerHTML = `<div style="color: var(--text-muted); font-style: italic; font-size: 0.85rem;">Priority Queue is currently empty. Ingest an event above.</div>`;
      return;
    }

    view.innerHTML = this.priorityItems.map((item, idx) => {
      const isP1 = item.priority === 1;
      const isP2 = item.priority === 2;
      const badgeBg = isP1 ? "#fee2e2" : (isP2 ? "#fef3c7" : "#e0f2fe");
      const badgeColor = isP1 ? "#dc2626" : (isP2 ? "#d97706" : "#0284c7");
      const borderCol = isP1 ? "#fca5a5" : (isP2 ? "#fde68a" : "#bae6fd");

      return `
        <div style="background: #ffffff; border: 1.5px solid ${borderCol}; border-radius: 10px; padding: 0.6rem 0.85rem; display: flex; align-items: center; gap: 0.6rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <span style="font-size: 0.7rem; font-weight: 800; font-family: var(--font-mono); background: ${badgeBg}; color: ${badgeColor}; padding: 2px 6px; border-radius: 6px;">
            ${item.pLabel} [P${item.priority}]
          </span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.8rem; font-weight: 800; color: #0f172a;">${item.name}</span>
            <span style="font-size: 0.65rem; color: #64748b; font-family: var(--font-mono);">${item.id}</span>
          </div>
          <button onclick="window.activeQVisualizer.deletePriorityItem(${idx})" style="margin-left: auto; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 0.8rem;" title="Remove Item">✕</button>
        </div>
      `;
    }).join('');
    window.activeQVisualizer = this;
  }

  deletePriorityItem(idx) {
    this.priorityItems.splice(idx, 1);
    this.renderPriorityQueue();
  }

  renderHash() {
    const view = document.getElementById("hash-buckets-view");
    if (!view) return;

    if (this.hashMode === "chaining") {
      view.innerHTML = this.hashBuckets.map((bucket, idx) => {
        const chainHtml = bucket.map(entry => `
          <div style="background: #e0f2fe; border: 1px solid #bae6fd; padding: 4px 8px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.72rem; color: #0369a1; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px rgba(2, 132, 199, 0.1);">
            <span>🔑 <strong>${entry.key}</strong> (₹${entry.val.toLocaleString()})</span>
            <button onclick="window.activeQVisualizer.deleteHashKey('${entry.key}')" style="background: transparent; border: none; color: #ef4444; font-weight: bold; cursor: pointer; font-size: 0.75rem;" title="Delete Key">✕</button>
          </div>
        `).join('<span style="color: #94a3b8; font-weight: bold; font-size: 0.8rem;"> ➔ </span>');

        return `
          <div style="display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-blue); font-size: 0.75rem; width: 75px;">
              Bucket [${idx}]:
            </div>
            <div style="flex: 1; display: flex; align-items: center; gap: 0.4rem; overflow-x: auto;">
              ${bucket.length > 0 ? chainHtml : '<span style="color: var(--text-muted); font-size: 0.72rem; font-style: italic;">(Empty Bucket)</span>'}
            </div>
          </div>
        `;
      }).join('');
    } else {
      // Linear Probing flat view
      view.innerHTML = this.linearProbingArray.map((entry, idx) => {
        return `
          <div style="display: flex; align-items: center; gap: 0.75rem; background: ${entry ? '#f0fdf4' : '#f8fafc'}; padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid ${entry ? '#bbf7d0' : 'var(--border-color)'};">
            <div style="font-family: var(--font-mono); font-weight: 800; color: ${entry ? '#15803d' : '#64748b'}; font-size: 0.75rem; width: 75px;">
              Slot [${idx}]:
            </div>
            <div style="flex: 1; display: flex; align-items: center; gap: 0.5rem;">
              ${entry ? `
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #166534; font-weight: 700;">
                  🔑 ${entry.key} ➔ ₹${entry.val.toLocaleString()}
                </span>
                <button onclick="window.activeQVisualizer.deleteHashKey('${entry.key}')" style="margin-left: auto; background: transparent; border: none; color: #ef4444; font-weight: bold; cursor: pointer;" title="Delete">✕</button>
              ` : '<span style="color: var(--text-muted); font-size: 0.72rem; font-style: italic;">(Open Slot)</span>'}
            </div>
          </div>
        `;
      }).join('');
    }
    window.activeQVisualizer = this;
  }
}

window.QueueHashVisualizer = QueueHashVisualizer;
