/**
 * Module 1: Data Ingestion (Circular Queue & Hash Table Visualizer)
 */

class QueueHashVisualizer {
  constructor(containerId, telemetryCallback) {
    this.container = document.getElementById(containerId);
    this.telemetry = telemetryCallback || (() => {});

    // Circular Queue state
    this.queueCapacity = 8;
    this.queueBuffer = new Array(this.queueCapacity).fill(null);
    this.head = 0;
    this.tail = 0;
    this.size = 0;

    // Hash Table state
    this.hashCapacity = 6;
    this.hashBuckets = Array.from({ length: this.hashCapacity }, () => []);
    this.hashCollisions = 0;

    this.render();
  }

  enqueue(item) {
    if (this.size === this.queueCapacity) {
      this.telemetry({
        status: "QUEUE_OVERFLOW_BLOCKED",
        log: `[Ingestion Alert] Queue is full (Capacity: ${this.queueCapacity}). Enqueue of "${item}" rejected.`,
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
      log: `[Enqueue O(1)] Added "${item}" at slot [${oldTail}]. New Tail: [${this.tail}], Size: ${this.size}/${this.queueCapacity}`
    });
    return true;
  }

  dequeue() {
    if (this.size === 0) {
      this.telemetry({
        status: "QUEUE_UNDERFLOW",
        log: `[Ingestion Alert] Queue is empty. Dequeue returned NULL.`,
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
      log: `[Dequeue O(1)] Dispatched "${item}" from slot [${oldHead}]. New Head: [${this.head}], Size: ${this.size}/${this.queueCapacity}`,
      isHighlight: true
    });
    return item;
  }

  hashInsert(key, value) {
    // Custom polynomial rolling hash
    let hashVal = 0;
    for (let i = 0; i < key.length; i++) {
      hashVal = ((hashVal << 5) - hashVal) + key.charCodeAt(i);
      hashVal |= 0;
    }
    const idx = Math.abs(hashVal) % this.hashCapacity;
    const bucket = this.hashBuckets[idx];

    const existingIdx = bucket.findIndex(entry => entry.key === key);
    let collisionDetected = false;

    if (existingIdx !== -1) {
      bucket[existingIdx].value = value;
    } else {
      if (bucket.length > 0) {
        this.hashCollisions++;
        collisionDetected = true;
      }
      bucket.push({ key, value });
    }

    this.renderHash();
    this.telemetry({
      comparisons: bucket.length,
      operations: this.hashBuckets.flat().length,
      timeComplexity: "O(1) Avg / O(N) Worst",
      spaceComplexity: "O(N) Dynamic",
      log: `[Hash Ingest] Key "${key}" hashed to slot [${idx}]. ${collisionDetected ? '⚠️ Collision resolved via Separate Chaining.' : 'Direct insertion.'}`,
      isHighlight: !collisionDetected,
      isAlert: collisionDetected
    });
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
        <!-- Section 1: Circular Queue Buffer -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--accent-cyan);">
              1. Thread-Safe Circular FIFO Ingestion Buffer (Capacity: ${this.queueCapacity})
            </h4>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-secondary" id="btn-enqueue-sample" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">+ Ingest Event</button>
              <button class="btn-secondary" id="btn-dequeue-sample" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">- Dispatch Event</button>
            </div>
          </div>
          <div id="queue-slots-view" class="queue-slots-row"></div>
        </div>

        <!-- Section 2: Separate Chaining Hash Table -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--accent-blue);">
              2. Transaction Idempotency Hash Index (Separate Chaining)
            </h4>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="hash-key-input" placeholder="Idempotency Key (e.g. TXN-101)"
                     style="background: var(--bg-glass); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-family: var(--font-mono); width: 170px;">
              <button class="btn-secondary" id="btn-hash-insert" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Insert Key</button>
            </div>
          </div>
          <div id="hash-buckets-view" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
        </div>
      </div>
    `;

    document.getElementById("btn-enqueue-sample").addEventListener("click", () => {
      const sampleEvents = ["Order_Created", "Payment_Verified", "Fleet_Dispatched", "Inventory_Decremented", "Webhook_Ack"];
      const randEvt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)] + "_" + Math.floor(Math.random() * 900 + 100);
      this.enqueue(randEvt);
    });

    document.getElementById("btn-dequeue-sample").addEventListener("click", () => {
      this.dequeue();
    });

    document.getElementById("btn-hash-insert").addEventListener("click", () => {
      const input = document.getElementById("hash-key-input");
      const key = input.value.trim() || ("TXN_" + Math.floor(Math.random() * 9000 + 1000));
      this.hashInsert(key, { amount: (Math.random() * 5000 + 100).toFixed(2), time: Date.now() });
      input.value = "";
    });

    this.renderQueue();
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
        <div class="${classes}">
          <div style="font-size: 0.6rem; color: var(--text-muted);">[${idx}]</div>
          <div style="font-size: 0.7rem; font-weight: 700; max-width: 48px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${item ? item.split('_')[0] : 'EMPTY'}
          </div>
        </div>
      `;
    }).join('');
  }

  renderHash() {
    const view = document.getElementById("hash-buckets-view");
    if (!view) return;

    view.innerHTML = this.hashBuckets.map((bucket, idx) => {
      const chainHtml = bucket.map(entry => `
        <div style="background: rgba(59, 130, 246, 0.2); border: 1px solid var(--accent-blue); padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.7rem; color: #93c5fd; display: inline-flex; align-items: center; gap: 4px;">
          <span>🔑 ${entry.key}</span>
        </div>
      `).join('<span style="color: var(--text-muted); font-weight: bold;"> → </span>');

      return `
        <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-glass); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); font-size: 0.75rem; width: 65px;">
            Slot [${idx}]:
          </div>
          <div style="flex: 1; display: flex; align-items: center; gap: 0.4rem; overflow-x: auto;">
            ${bucket.length > 0 ? chainHtml : '<span style="color: var(--text-muted); font-size: 0.7rem; font-style: italic;">(Empty Bucket)</span>'}
          </div>
        </div>
      `;
    }).join('');
  }
}

window.QueueHashVisualizer = QueueHashVisualizer;
