# 📊 Backend Documentation — Stats Service (Cloudflare Workers)

This backend provides a fully serverless analytics pipeline using **Cloudflare Workers**, **D1**, **KV**, **Queues**, and **Cron**.  
It receives search events from the frontend, stores them asynchronously, computes aggregated statistics, and exposes them via simple API endpoints.

---

# 📡 API Endpoints (Deployed)

### **Stats**
```
GET https://swapils-stats-service.adresc.workers.dev/api/stats
```

Returns aggregated analytics (top queries, total searches, average duration, peak hour, etc.).

---

### **Health Check**
```
GET https://swapils-stats-service.adresc.workers.dev/api/health
```

Basic service status and metadata.

---

### **Event Ingestion**
```
POST https://swapils-stats-service.adresc.workers.dev/api/events
```

Accepts search events sent from the frontend.  
Events are *not stored directly* — they are placed into a **Queue** for asynchronous processing.

---

# 📦 Source Code

GitHub repository:

```
https://github.com/karmap/swapils-backend
```

---

# 🧑‍💻 How to Clone & Run Locally

## 1. Clone the project

```bash
git clone https://github.com/karmap/swapils-backend
cd swapils-backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Install Wrangler CLI (required)

If you haven’t installed it:

```bash
npm install -g wrangler
```

Log in:

```bash
wrangler login
```

## 4. Create required Cloudflare resources

Each developer needs their own D1, KV, and Queue instances.

### Create D1
```bash
wrangler d1 create stats-db
```
Paste the `database_id` into `wrangler.json`.

### Create KV
```bash
wrangler kv namespace create STATS_CACHE
```
Paste the KV ID into `wrangler.json`.

### Create Queue
```bash
wrangler queues create events-queue
```
Make sure your `wrangler.json` includes a producer & consumer binding.

## 5. Apply database migrations

```bash
wrangler d1 migrations apply stats-db
```

## 6. Run locally

```bash
npm run dev
```

Your Worker runs at:

```
http://127.0.0.1:8787
```

### Notes
- D1, KV, and Queues work locally.
- Cron does **not** automatically execute in local mode.

---

# 🧩 Final Architecture Overview

This backend implements a **full serverless analytics pipeline**:

## **1. Event ingestion (HTTP → Queue)**
The frontend sends search events to:

```
POST /api/events
```

Instead of writing directly to the database, the backend pushes each event into a **Cloudflare Queue**.  
This gives:

- Zero backpressure during bursts  
- Fire-and-forget ingestion  
- No blocking of HTTP responses  

---

## **2. Queue consumer → D1 database**

The Worker automatically processes messages via the exported:

```ts
export async function queue(batch, env) { ... }
```

Each message is inserted into **D1**.

This prevents database overload during heavy traffic.

---

## **3. Statistics generation (Cron + ComputeStats)**

A Cloudflare **Cron Trigger** runs every 5 minutes.

It:

1. Loads all events from D1  
2. Computes:
   - total events  
   - top 5 queries  
   - average request duration  
   - peak search hour  
3. Saves the computed snapshot into **KV Storage**  

KV acts as a fast distributed cache.

---

## **4. `/api/stats` endpoint → Smart caching logic**

When `/api/stats` is requested:

1. Reads KV snapshot  
2. Checks if the cached snapshot is fresh  
3. If fresh → returns immediately  
4. If expired → recomputes stats from the DB & updates KV

This ensures:

- Fast responses
- Consistent stats
- Reduced DB load

---

## **5. `/api/health` endpoint**

Provides a lightweight check that confirms:

- Worker is reachable
- KV is available
- DB is available
- The timestamp of the last cached stats

Useful for monitoring and uptime tools.

---

# 🧱 Overall Data Flow

```
React App
   ↓ POST /api/events
Cloudflare Worker (fetch)
   ↓ sends message
Cloudflare Queue
   ↓ consumed by Worker.queue()
Cloudflare D1 (stored)
   ↓
Cron (every 5 min)
   ↓ computeStats
Cloudflare KV
   ↓
GET /api/stats → cached stats
GET /api/health → system info
```

---

# ✔️ Summary

The backend is:

- **Fully serverless**
- **Scalable**
- **Low-cost**
- **Resilient**
- **Optimized with event queues + DB batching + KV caching**
