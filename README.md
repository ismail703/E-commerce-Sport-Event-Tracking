<div align="center">

# ⚡ Velocity: E-commerce Sport Tracking

### End-to-end user activity tracking pipeline
**Next.js → Apache NiFi → MinIO → ClickHouse → ODBC → Power BI**

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Apache NiFi](https://img.shields.io/badge/Apache_NiFi-728E9B?style=for-the-badge&logo=apachenifi&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white)
![ClickHouse](https://img.shields.io/badge/ClickHouse-FFCC01?style=for-the-badge&logo=clickhouse&logoColor=black)
![Power BI](https://img.shields.io/badge/Power_BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)

<br/>

[📖 Overview](#-project-overview) •
[📡 Events](#-tracked-events) •
[🔄 Pipeline](#-data-pipeline) •
[📊 Dashboard](#-power-bi-dashboard) •
[🛠️ Stack](#%EF%B8%8F-tech-stack) •
[🚀 Getting Started](#-getting-started)

</div>

---

## 🚀 Project Overview

**Velocity** is a fictional sports e-commerce website built as the data source for an end-to-end **user activity tracking pipeline**. The app generates events such as product page visits, add-to-cart actions, cart removals and completed purchases. Those events are written as local JSON files, then processed through **Apache NiFi, MinIO, ClickHouse, ODBC and Power BI**.

This repository combines two parts:

| Part | Description |
|------|-------------|
| 🛍️ **Front-end** | A Next.js app simulating the *Velocity* sports store |
| 🧱 **Data pipeline** | Turns raw user events into analytics-ready tables and a Power BI dashboard |

> 🎯 **Goal:** demonstrate a realistic event tracking workflow that mirrors how modern product analytics pipelines are built in production.

---

## 📡 Tracked Events

| Event | Description |
|-------|-------------|
| 👀 `product_page` | A user opens a product page and views product details |
| 🛒 `add_to_cart` | A product is added to the cart |
| ❌ `remove_from_cart` | A product is removed from the cart |
| ✅ `purchase_complete` | A checkout is completed successfully |

Each event is stored as JSON and includes metadata such as user information, product identifiers, cart totals, quantity, color, size, page details and timestamps.

---

## 🔄 Data Pipeline

```mermaid
flowchart LR
    A["🛍️ Velocity<br/>Next.js app"] -->|JSON events| B["🔄 Apache NiFi"]
    B -->|yyyy/MM/dd/HH.json| C["🪣 MinIO<br/>S3 storage"]
    C --> D["⚡ ClickHouse<br/>raw table + MVs"]
    D -->|ODBC| E["📊 Power BI"]
```

### 1️⃣ Event generation in Velocity

Velocity acts as the source system. User interactions are captured in the application and stored locally as JSON files, creating a reproducible event stream without requiring a live production backend.

### 2️⃣ Apache NiFi ingestion and transformation

NiFi orchestrates the data flow with four processors:

| Processor | Role |
|-----------|------|
| `GetFile` | Reads the JSON files from the local source folder |
| `UpdateRecord` | Flattens nested fields, especially values under `/metadata/` |
| `QueryRecord` | Cleans and reshapes records, including timestamp normalization with `REPLACE` |
| `PutS3Object` | Writes the transformed files to object storage |

This reflects a common real-world pattern: ingest raw events, standardize the schema, and land them in durable object storage before loading them into the warehouse.

<div align="center">

![Apache NiFi workflow](ressources/nifi.jpeg)

*Apache NiFi workflow*

</div>

### 3️⃣ MinIO object storage

MinIO is used as an S3-compatible landing zone for the transformed JSON files. Files are partitioned by date and hour:

```text
yyyy/MM/dd/HH.json
```

This supports incremental processing, replay and time-based backfills.

### 4️⃣ ClickHouse analytics layer

ClickHouse consumes the MinIO data through a **raw stream table** and **materialized views**. The repository includes event-oriented tables and views for:

- `add_to_cart`
- `product_page`
- `purchase_complete`
- `remove_from_cart`

These structures make the data easy to query for behavioral analysis, conversion tracking and funnel exploration.

### 5️⃣ ODBC connectivity

An ODBC data source on Windows connects Power BI directly to ClickHouse.

| Setting | Value |
|---------|-------|
| **Data source name** | `User Tracking` |
| **Host** | `localhost:8123` |
| **Database** | `default` |

---

## 📊 Power BI Dashboard

The final layer is a Power BI dashboard titled **`Tracking Users Activity`**, with six main charts:

| # | Chart |
|---|-------|
| 1 | 🛒 Products added by user |
| 2 | ❌ Products removed by user |
| 3 | 💰 Revenue by day |
| 4 | 📈 Product page visits over time |
| 5 | ⏱️ Average time in cart by user |
| 6 | 🧾 Average time in cart by order |

<div align="center">

![Power BI dashboard](ressources/powerBI.png)

*Tracking Users Activity dashboard*

</div>

---

## ✨ Why This Pipeline Matches Best Practice

| Principle | How it applies |
|-----------|----------------|
| 🧩 **Separation of concerns** | The app generates events, NiFi transforms them, MinIO stores them, ClickHouse serves analytics, Power BI handles reporting |
| 🧹 **Schema normalization** | Nested JSON is flattened before warehouse ingestion, reducing downstream query complexity |
| 💾 **Durable landing zone** | Object storage keeps a replayable copy of the data for reprocessing and recovery |
| 🕒 **Time partitioning** | Day and hour partitions support incremental reads and easier backfills |
| ⚡ **Analytics-optimized serving** | ClickHouse is well suited for high-speed aggregations and dashboard workloads |
| 🔌 **BI decoupling** | Power BI reads from ClickHouse instead of the raw source, keeping reporting stable and performant |

> In short, the pipeline mirrors a production-style **ELT / analytics flow**: event capture → file landing → transformation → warehouse modeling → business intelligence.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Front-end** | Next.js 16 · React 19 · TypeScript · Tailwind CSS |
| **Ingestion** | Apache NiFi |
| **Storage** | MinIO |
| **Analytics** | ClickHouse |
| **Connectivity** | ODBC (Windows) |
| **BI** | Power BI |

---

## 📁 Repository Structure

├── app/                    # Next.js App Router pages, layouts and API routes
│   └── api/                # Tracking, checkout, authentication and admin endpoints
├── components/             # Shared UI components and the shadcn/ui component set
├── hooks/                  # Reusable React hooks, including tracking hooks
├── lib/                    # Client stores, types, product data and utilities
├── public/                 # Favicons, static assets and product images
├── ressources/             # NiFi workflow and Power BI dashboard documentation
├── logs/                   # Local event output shared with the NiFi container
├── styles/                 # Additional global styles
├── Dockerfile              # Builds the production Next.js application image
├── docker-compose.yml      # Runs the app, NiFi, MinIO and ClickHouse services
├── package.json            # Scripts and npm dependencies
├── pnpm-lock.yaml          # Locked pnpm dependency versions
├── next.config.mjs         # Next.js configuration
├── tsconfig.json           # TypeScript compiler configuration
├── components.json         # UI component generator configuration
└── postcss.config.mjs      # PostCSS and Tailwind CSS configuration
```

The application container and the data-platform services share the `etl-net`
Docker network. The `shared-logs`, `minio-data` and `clickhouse-data` named
volumes preserve event files and service data between container restarts.

---

## 🚀 Getting Started

### Start the full stack with Docker Compose

The recommended way to run the project is with Docker Compose. Install
[Docker Desktop](https://www.docker.com/products/docker-desktop/) and make
sure Docker is running, then execute the following commands from the project
root:

```bash
docker compose up --build
```

The `--build` flag builds the Next.js image from the `Dockerfile` before
starting the services. To run the stack in the background instead:

```bash
docker compose up --build -d
```

Once the containers are ready, the main services are available at:

| Service | URL | Purpose |
|---------|-----|---------|
| Velocity app | [http://localhost:3000](http://localhost:3000) | E-commerce application and event source |
| Apache NiFi | [https://localhost:8443](https://localhost:8443) | Event ingestion and transformation |
| MinIO console | [http://localhost:9001](http://localhost:9001) | Object-storage administration |
| ClickHouse HTTP | [http://localhost:8123](http://localhost:8123) | Analytics database endpoint |

The default credentials configured in `docker-compose.yml` are:

| Service | Username | Password |
|---------|----------|----------|
| Apache NiFi | `admin` | `Password123!` |
| MinIO | `minioadmin` | `Password123!` |
| ClickHouse | `admin` | `Password123!` |

NiFi uses a self-signed HTTPS certificate by default, so the browser may show a
certificate warning on the first visit.

Useful Compose commands:

### Run the development server

```bash
docker compose logs -f                 # Follow logs for all services
docker compose logs -f ecommerce-app   # Follow only the Next.js app logs
docker compose down                    # Stop and remove containers
```

### Run the Next.js app locally

For front-end development without rebuilding the container, install
[Node.js](https://nodejs.org/) 18 or later and pnpm, then run:

```bash
pnpm install
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** when the development
server is ready. The Docker Compose services can still be started separately
when testing the complete event pipeline.

---

## 📬 Contact

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-ismail703-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ismail703)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ismail--elmain-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ismail-elmain/)

<br/>

⭐ *If you found this project useful, consider giving it a star!*

</div>
